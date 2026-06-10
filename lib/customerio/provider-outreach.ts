import {
  getCustomerIoAppApiBaseUrl,
  getCustomerIoAppApiKey,
  getCustomerIoProviderCampaignId,
  getCustomerIoProviderCampaignName,
} from './config';

type CustomerIoCampaign = {
  id: number | string;
  name?: string;
  active?: boolean;
  type?: string;
};

type CustomerIoAction = {
  id: number | string;
  name?: string;
  type?: string;
  body?: string;
  subject?: string;
  sending_state?: string;
};

type CustomerIoMetrics = {
  metric?: {
    series?: Record<string, number[]>;
  };
};

export type OutreachChannelSummary = {
  sentCount: number;
  messageName: string;
  subject: string;
  preview: string;
  status: string;
  source: 'customer_io' | 'placeholder';
};

export type ProviderOutreachSummary = {
  campaignName: string;
  campaignStatus: string;
  customerIoConnected: boolean;
  email: OutreachChannelSummary;
  sms: OutreachChannelSummary;
};

const fallbackEmail = {
  subject: 'A faster way to quote your next home project',
  preview:
    'Decks & More has partnered with TakeShape to help past customers get remote quotes for future home projects. Use the app to scan your space, send a floor plan, and get connected with the right provider without scheduling an in-home estimate.',
};

const fallbackSms = {
  subject: 'Text outreach not started',
  preview:
    'SMS is not connected yet. Once a texting provider is integrated, this card will show the first text touchpoint and message volume.',
};

const toPlainText = (value: string | undefined) =>
  (value || '')
    .replace(/<style[^>]*>.*?<\/style>/gis, ' ')
    .replace(/<script[^>]*>.*?<\/script>/gis, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (value: string, maxLength = 320) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;

const sumSeries = (
  metrics: CustomerIoMetrics,
  preferredKeys: string[]
) => {
  const series = metrics.metric?.series || {};
  const key = preferredKeys.find((item) => Array.isArray(series[item]));
  if (!key) return 0;
  return series[key].reduce((sum, value) => sum + Number(value || 0), 0);
};

const appFetch = async <T>(path: string): Promise<T> => {
  const key = getCustomerIoAppApiKey();
  if (!key) {
    throw new Error('Customer.io App API key is not configured');
  }

  const response = await fetch(`${getCustomerIoAppApiBaseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${key}`,
    },
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Customer.io request failed (${response.status}) for ${path}`
    );
  }

  return response.json() as Promise<T>;
};

const findProviderCampaign = async () => {
  const configuredId = getCustomerIoProviderCampaignId();
  const configuredName = getCustomerIoProviderCampaignName().toLowerCase();
  const { campaigns } = await appFetch<{ campaigns?: CustomerIoCampaign[] }>(
    '/v1/campaigns'
  );

  const items = campaigns || [];
  return (
    items.find((campaign) => String(campaign.id) === configuredId) ||
    items.find(
      (campaign) =>
        configuredName && campaign.name?.toLowerCase() === configuredName
    ) ||
    items.find((campaign) =>
      campaign.name?.toLowerCase().includes('provider homeowner')
    ) ||
    items[0] ||
    null
  );
};

const getActionMetrics = (campaignId: string, actionId: string) =>
  appFetch<CustomerIoMetrics>(
    `/v1/campaigns/${campaignId}/actions/${actionId}/metrics`
  );

export const getProviderOutreachSummary =
  async (): Promise<ProviderOutreachSummary> => {
    const fallback: ProviderOutreachSummary = {
      campaignName:
        getCustomerIoProviderCampaignName() ||
        'Provider homeowner re-engagement',
      campaignStatus: 'Draft',
      customerIoConnected: false,
      email: {
        sentCount: 0,
        messageName: 'Initial scan invitation',
        subject: fallbackEmail.subject,
        preview: fallbackEmail.preview,
        status: 'Draft copy',
        source: 'placeholder',
      },
      sms: {
        sentCount: 0,
        messageName: 'SMS outreach',
        subject: fallbackSms.subject,
        preview: fallbackSms.preview,
        status: 'Not connected',
        source: 'placeholder',
      },
    };

    try {
      const campaign = await findProviderCampaign();
      if (!campaign) return fallback;

      const campaignId = String(campaign.id);
      const { actions } = await appFetch<{ actions?: CustomerIoAction[] }>(
        `/v1/campaigns/${campaignId}/actions`
      );
      const actionItems = actions || [];
      const emailAction = actionItems.find((action) =>
        action.type?.toLowerCase().includes('email')
      );
      const smsAction = actionItems.find((action) => {
        const type = action.type?.toLowerCase() || '';
        const name = action.name?.toLowerCase() || '';
        return type.includes('sms') || type.includes('text') || name.includes('sms');
      });

      const emailMetrics = emailAction
        ? await getActionMetrics(campaignId, String(emailAction.id))
        : null;
      const smsMetrics = smsAction
        ? await getActionMetrics(campaignId, String(smsAction.id))
        : null;

      const emailBody = toPlainText(emailAction?.body);
      const smsBody = toPlainText(smsAction?.body);

      return {
        campaignName: campaign.name || fallback.campaignName,
        campaignStatus: campaign.active ? 'Active' : 'Draft',
        customerIoConnected: true,
        email: {
          sentCount: emailMetrics
            ? sumSeries(emailMetrics, ['sent', 'delivered', 'attempted'])
            : 0,
          messageName:
            emailAction?.name || fallback.email.messageName,
          subject: emailAction?.subject || fallback.email.subject,
          preview: truncate(emailBody || fallback.email.preview),
          status: emailAction?.sending_state || fallback.email.status,
          source: emailBody ? 'customer_io' : 'placeholder',
        },
        sms: {
          sentCount: smsMetrics
            ? sumSeries(smsMetrics, ['sent', 'delivered', 'attempted'])
            : 0,
          messageName: smsAction?.name || fallback.sms.messageName,
          subject: smsAction?.subject || fallback.sms.subject,
          preview: truncate(smsBody || fallback.sms.preview),
          status: smsAction?.sending_state || fallback.sms.status,
          source: smsBody ? 'customer_io' : 'placeholder',
        },
      };
    } catch (error) {
      console.error('Customer.io provider outreach summary failed:', error);
      return fallback;
    }
  };
