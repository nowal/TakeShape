export type CustomerIoRegion = 'us' | 'eu';

const optional = (value: string | undefined) => value?.trim() || '';

export const getCustomerIoRegion = (): CustomerIoRegion =>
  optional(process.env.CUSTOMER_IO_REGION).toLowerCase() === 'eu'
    ? 'eu'
    : 'us';

export const getCustomerIoAppApiBaseUrl = () =>
  getCustomerIoRegion() === 'eu'
    ? 'https://api-eu.customer.io'
    : 'https://api.customer.io';

export const getCustomerIoTrackApiBaseUrl = () =>
  getCustomerIoRegion() === 'eu'
    ? 'https://track-eu.customer.io'
    : 'https://track.customer.io';

export const getCustomerIoPipelinesApiBaseUrl = () =>
  getCustomerIoRegion() === 'eu'
    ? 'https://cdp-eu.customer.io'
    : 'https://cdp.customer.io';

export const getCustomerIoAppApiKey = () =>
  optional(process.env.CUSTOMER_IO_APP_API_KEY);

export const getCustomerIoCdpApiKey = () =>
  optional(process.env.CUSTOMER_IO_CDP_API_KEY);

export const getCustomerIoReportingWebhookSigningKey = () =>
  optional(process.env.CUSTOMER_IO_REPORTING_WEBHOOK_SIGNING_KEY);

export const getCustomerIoDefaultProviderId = () =>
  optional(process.env.CUSTOMER_IO_DEFAULT_PROVIDER_ID);

export const getCustomerIoProviderCampaignId = () =>
  optional(process.env.CUSTOMER_IO_PROVIDER_CAMPAIGN_ID);

export const getCustomerIoProviderCampaignName = () =>
  optional(process.env.CUSTOMER_IO_PROVIDER_CAMPAIGN_NAME);
