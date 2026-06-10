export const CANONICAL_REFERRAL_FIELDS = [
  'external_contact_id',
  'external_lead_id',
  'first_name',
  'last_name',
  'full_name',
  'email',
  'phone',
  'address_line1',
  'city',
  'state',
  'postal_code',
  'company',
  'title',
  'lead_type',
  'campaign',
  'contact_status',
  'source_created_at',
  'opted_out',
] as const;

export type CanonicalReferralField =
  (typeof CANONICAL_REFERRAL_FIELDS)[number];

export type ReferralSourceRow = Record<string, unknown>;

export type ReferralColumnMap = Partial<
  Record<CanonicalReferralField, string>
>;

export type ReferralMappingResult = {
  columnMap: ReferralColumnMap;
  confidence: 'low' | 'medium' | 'high';
  source: 'ai' | 'fallback';
};

export type NormalizedReferralLead = {
  provider_id: string;
  import_batch_id: string;
  source_system: string;
  external_contact_id: string | null;
  external_lead_id: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  company: string | null;
  title: string | null;
  lead_type: string | null;
  campaign: string | null;
  contact_status: string | null;
  lead_tags: string[];
  opted_out: boolean;
  source_created_at: string | null;
  raw_payload: Record<string, unknown>;
};

export type ImportedReferralLead = NormalizedReferralLead & {
  id: string;
};
