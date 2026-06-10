import {
  getCustomerIoCdpApiKey,
  getCustomerIoPipelinesApiBaseUrl,
} from './config';
import { ImportedReferralLead } from '@/lib/provider-referrals/import-types';

type ProviderSyncProfile = {
  id: string;
  business_name: string;
  service_types: string[] | null;
  city: string | null;
  state: string | null;
};

type SyncArgs = {
  importBatchId: string;
  leads: ImportedReferralLead[];
  provider: ProviderSyncProfile;
};

type CustomerIoSyncSummary = {
  attempted: number;
  failed: number;
  skipped: number;
  synced: number;
  enabled: boolean;
};

const MAX_CONCURRENCY = 4;

const clean = (value: string | null | undefined) => value?.trim() || '';

const getCustomerIoUserId = (providerId: string, leadId: string) =>
  `provider-referral:${providerId}:${leadId}`;

const buildTraits = (provider: ProviderSyncProfile, lead: ImportedReferralLead) => {
  const name =
    clean(lead.full_name) ||
    [lead.first_name, lead.last_name].map(clean).filter(Boolean).join(' ') ||
    clean(lead.company);
  const address = [lead.address_line1, lead.city, lead.state, lead.postal_code]
    .map(clean)
    .filter(Boolean)
    .join(', ');

  return {
    address: address || undefined,
    city: lead.city || undefined,
    company: lead.company || undefined,
    email: lead.email || undefined,
    first_name: lead.first_name || undefined,
    last_name: lead.last_name || undefined,
    name: name || undefined,
    phone: lead.phone || undefined,
    postal_code: lead.postal_code || undefined,
    provider_business_name: provider.business_name,
    provider_homeowner_lead_id: lead.id,
    provider_id: provider.id,
    provider_market: [provider.city, provider.state].filter(Boolean).join(', '),
    provider_service_types: provider.service_types || [],
    referral_import_batch_id: lead.import_batch_id,
    referral_outreach_status: 'pending_review',
    referral_source_system: lead.source_system,
    referral_uploaded_at: new Date().toISOString(),
    state: lead.state || undefined,
  };
};

const cdpFetch = async (
  path: '/v1/identify',
  body: Record<string, unknown>
) => {
  const apiKey = getCustomerIoCdpApiKey();
  if (!apiKey) {
    throw new Error('Customer.io CDP API key is not configured');
  }

  const response = await fetch(`${getCustomerIoPipelinesApiBaseUrl()}${path}`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Customer.io Pipelines request failed (${response.status})`);
  }
};

const syncLead = async ({
  lead,
  provider,
}: {
  lead: ImportedReferralLead;
  provider: ProviderSyncProfile;
}) => {
  const userId = getCustomerIoUserId(provider.id, lead.id);
  const traits = buildTraits(provider, lead);

  await cdpFetch('/v1/identify', {
    traits,
    userId,
  });
};

export const syncProviderReferralLeadsToCustomerIo = async ({
  importBatchId,
  leads,
  provider,
}: SyncArgs): Promise<CustomerIoSyncSummary> => {
  const syncableLeads = leads.filter((lead) => !lead.opted_out);

  if (!getCustomerIoCdpApiKey()) {
    return {
      attempted: 0,
      failed: 0,
      skipped: leads.length,
      synced: 0,
      enabled: false,
    };
  }

  const summary: CustomerIoSyncSummary = {
    attempted: syncableLeads.length,
    failed: 0,
    skipped: leads.length - syncableLeads.length,
    synced: 0,
    enabled: true,
  };

  let cursor = 0;

  const worker = async () => {
    while (cursor < syncableLeads.length) {
      const lead = syncableLeads[cursor];
      cursor += 1;

      try {
        await syncLead({ lead, provider });
        summary.synced += 1;
      } catch (error) {
        summary.failed += 1;
        console.warn('Customer.io referral lead sync failed:', error);
      }
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(MAX_CONCURRENCY, syncableLeads.length) },
      () => worker()
    )
  );

  return summary;
};
