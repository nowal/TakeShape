const HUBSPOT_API_BASE_URL = 'https://api.hubapi.com';
const DEFAULT_COMPANY_LIMIT = 250;
const MAX_COMPANY_LIMIT = 500;

const COMPANY_PROPERTIES = [
  'name',
  'domain',
  'website',
  'phone',
  'city',
  'state',
  'zip',
  'industry',
  'address',
  'address2',
  'hubspot_owner_id',
  'lifecyclestage',
  'createdate',
  'hs_lastmodifieddate',
];

type HubSpotListResponse = {
  results?: HubSpotCompany[];
  paging?: {
    next?: {
      after?: string;
    };
  };
};

type HubSpotAssociationBatchResponse = {
  results?: Array<{
    from?: {
      id?: string;
    };
    to?: Array<{
      associationTypes?: Array<{
        category?: string;
        label?: string | null;
        typeId?: number;
      }>;
      id?: string;
      toObjectId?: string | number;
    }>;
  }>;
};

type HubSpotContactBatchResponse = {
  results?: HubSpotContact[];
};

export type HubSpotCompany = {
  id: string;
  archived?: boolean;
  createdAt?: string;
  properties: Record<string, string | null | undefined>;
  updatedAt?: string;
};

export type HubSpotOwner = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type HubSpotContact = {
  id: string;
  properties: Record<string, string | null | undefined>;
};

export type HubSpotDecisionMaker = {
  email: string | null;
  hubspotContactId: string;
  jobTitle: string | null;
  name: string;
  phone: string | null;
};

const clean = (value: string | null | undefined) => (value || '').trim();

const getHubSpotToken = () => clean(process.env.HUBSPOT_PRIVATE_APP_TOKEN);

const getCompanyLimit = () => {
  const parsed = Number(process.env.HUBSPOT_COMPANY_SYNC_LIMIT || '');
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_COMPANY_LIMIT;
  return Math.min(Math.floor(parsed), MAX_COMPANY_LIMIT);
};

const requestHubSpot = async <T>(path: string) => {
  const token = getHubSpotToken();
  if (!token) {
    throw new Error('Missing HUBSPOT_PRIVATE_APP_TOKEN.');
  }

  const response = await fetch(`${HUBSPOT_API_BASE_URL}${path}`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `HubSpot request failed (${response.status}): ${
        body || response.statusText
      }`
    );
  }

  return (await response.json()) as T;
};

const postHubSpot = async <T>(path: string, body: unknown) => {
  const token = getHubSpotToken();
  if (!token) {
    throw new Error('Missing HUBSPOT_PRIVATE_APP_TOKEN.');
  }

  const response = await fetch(`${HUBSPOT_API_BASE_URL}${path}`, {
    body: JSON.stringify(body),
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    const responseBody = await response.text().catch(() => '');
    throw new Error(
      `HubSpot request failed (${response.status}): ${
        responseBody || response.statusText
      }`
    );
  }

  return (await response.json()) as T;
};

const chunk = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

export const fetchHubSpotProviderCompanies = async () => {
  const companies: HubSpotCompany[] = [];
  const targetLimit = getCompanyLimit();
  let after: string | undefined;

  while (companies.length < targetLimit) {
    const url = new URL('/crm/v3/objects/companies', HUBSPOT_API_BASE_URL);
    url.searchParams.set(
      'limit',
      String(Math.min(100, targetLimit - companies.length))
    );
    url.searchParams.set('archived', 'false');
    url.searchParams.set('properties', COMPANY_PROPERTIES.join(','));
    if (after) url.searchParams.set('after', after);

    const data = await requestHubSpot<HubSpotListResponse>(
      `${url.pathname}${url.search}`
    );
    companies.push(...(data.results || []));

    after = data.paging?.next?.after;
    if (!after || !(data.results || []).length) break;
  }

  return companies;
};

export const fetchHubSpotCompanyById = async (companyId: string) => {
  const url = new URL(
    `/crm/v3/objects/companies/${encodeURIComponent(companyId)}`,
    HUBSPOT_API_BASE_URL
  );
  url.searchParams.set('archived', 'false');
  url.searchParams.set('properties', COMPANY_PROPERTIES.join(','));

  return requestHubSpot<HubSpotCompany>(`${url.pathname}${url.search}`);
};

export const fetchHubSpotOwnerById = async (ownerId: string) => {
  if (!ownerId) return null;

  try {
    return await requestHubSpot<HubSpotOwner>(
      `/crm/v3/owners/${encodeURIComponent(ownerId)}`
    );
  } catch (error) {
    console.warn('HubSpot owner lookup failed:', error);
    return null;
  }
};

const getAssociationScore = (
  associationTypes: Array<{
    label?: string | null;
    typeId?: number;
  }> = []
) => {
  const labelText = associationTypes
    .map((type) => clean(type.label || ''))
    .join(' ')
    .toLowerCase();

  if (labelText.includes('decision')) return 100;
  if (labelText.includes('primary')) return 90;
  if (labelText.includes('billing')) return 40;
  return 10;
};

const getContactName = (contact: HubSpotContact) =>
  [
    clean(contact.properties.firstname),
    clean(contact.properties.lastname),
  ]
    .filter(Boolean)
    .join(' ') ||
  clean(contact.properties.email) ||
  `HubSpot contact ${contact.id}`;

export const fetchHubSpotDecisionMakersByCompanyId = async (
  companyIds: string[]
) => {
  const uniqueCompanyIds = [...new Set(companyIds.map(clean).filter(Boolean))];
  const associationsByCompany = new Map<
    string,
    Array<{ contactId: string; score: number }>
  >();

  for (const companyBatch of chunk(uniqueCompanyIds, 100)) {
    const data = await postHubSpot<HubSpotAssociationBatchResponse>(
      '/crm/v4/associations/companies/contacts/batch/read',
      {
        inputs: companyBatch.map((id) => ({ id })),
      }
    );

    (data.results || []).forEach((result) => {
      const companyId = clean(result.from?.id);
      if (!companyId) return;

      const associatedContacts = (result.to || [])
        .map((association) => {
          const contactId = clean(
            String(association.toObjectId || association.id || '')
          );
          return contactId
            ? {
                contactId,
                score: getAssociationScore(association.associationTypes),
              }
            : null;
        })
        .filter(Boolean) as Array<{ contactId: string; score: number }>;

      associationsByCompany.set(companyId, associatedContacts);
    });
  }

  const contactIds = [
    ...new Set(
      [...associationsByCompany.values()]
        .flat()
        .map((association) => association.contactId)
    ),
  ];

  const contactsById = new Map<string, HubSpotContact>();
  for (const contactBatch of chunk(contactIds, 100)) {
    const data = await postHubSpot<HubSpotContactBatchResponse>(
      '/crm/v3/objects/contacts/batch/read',
      {
        inputs: contactBatch.map((id) => ({ id })),
        properties: ['firstname', 'lastname', 'email', 'phone', 'jobtitle'],
      }
    );

    (data.results || []).forEach((contact) =>
      contactsById.set(contact.id, contact)
    );
  }

  const decisionMakers = new Map<string, HubSpotDecisionMaker>();
  associationsByCompany.forEach((associations, companyId) => {
    const best = [...associations]
      .filter((association) => contactsById.has(association.contactId))
      .sort((left, right) => right.score - left.score)[0];
    if (!best) return;

    const contact = contactsById.get(best.contactId);
    if (!contact) return;

    decisionMakers.set(companyId, {
      email: clean(contact.properties.email) || null,
      hubspotContactId: contact.id,
      jobTitle: clean(contact.properties.jobtitle) || null,
      name: getContactName(contact),
      phone: clean(contact.properties.phone) || null,
    });
  });

  return decisionMakers;
};

export const getHubSpotCompanyAppUrl = (companyId: string) => {
  const portalId = clean(process.env.HUBSPOT_PORTAL_ID);
  if (!portalId) return null;
  return `https://app.hubspot.com/contacts/${portalId}/company/${companyId}`;
};

export const getHubSpotCompanyName = (company: HubSpotCompany) =>
  clean(company.properties.name) ||
  clean(company.properties.domain) ||
  `HubSpot company ${company.id}`;

export const getHubSpotCompanyWebsite = (company: HubSpotCompany) => {
  const website = clean(company.properties.website);
  if (website) return website;

  const domain = clean(company.properties.domain);
  return domain ? `https://${domain}` : '';
};
