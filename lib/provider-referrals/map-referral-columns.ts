import Anthropic from '@anthropic-ai/sdk';
import {
  CANONICAL_REFERRAL_FIELDS,
  CanonicalReferralField,
  ReferralColumnMap,
  ReferralMappingResult,
  ReferralSourceRow,
} from './import-types';

const PROVIDER_IMPORT_MODEL =
  process.env.ANTHROPIC_PROVIDER_IMPORT_MODEL ||
  process.env.ANTHROPIC_COACHING_MODEL ||
  'claude-sonnet-4-6';

const FIELD_SYNONYMS: Record<CanonicalReferralField, string[]> = {
  external_contact_id: [
    'contact id',
    'customer id',
    'client id',
    'person id',
    'homeowner id',
  ],
  external_lead_id: ['lead id', 'opportunity id', 'deal id', 'record id'],
  first_name: ['first name', 'firstname', 'given name'],
  last_name: ['last name', 'lastname', 'surname', 'family name'],
  full_name: [
    'full name',
    'name',
    'customer name',
    'client name',
    'contact name',
    'homeowner',
    'homeowner name',
  ],
  email: ['email', 'e mail', 'email address', 'primary email'],
  phone: [
    'phone',
    'phone number',
    'mobile',
    'cell',
    'telephone',
    'primary phone',
  ],
  address_line1: [
    'address',
    'street',
    'street address',
    'address 1',
    'address line 1',
    'job address',
    'project address',
    'property address',
    'home address',
  ],
  city: ['city', 'town', 'municipality'],
  state: ['state', 'province', 'region'],
  postal_code: ['zip', 'zip code', 'postal code', 'postcode'],
  company: ['company', 'organization', 'business'],
  title: ['title', 'job title', 'role'],
  lead_type: ['lead type', 'service type', 'project type', 'category'],
  campaign: ['campaign', 'source campaign', 'marketing campaign'],
  contact_status: ['status', 'contact status', 'lead status', 'stage'],
  source_created_at: [
    'created',
    'created at',
    'date created',
    'lead date',
    'date',
    'submitted',
    'submitted at',
  ],
  opted_out: [
    'opt out',
    'opted out',
    'unsubscribe',
    'unsubscribed',
    'do not contact',
    'dnc',
  ],
};

const normalizeHeader = (value: string) =>
  value
    .toLowerCase()
    .replace(/[_\-./]+/g, ' ')
    .replace(/[^a-z0-9 ]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const clean = (value: unknown) => String(value ?? '').trim();

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const digitCount = (value: string) => value.replace(/\D/g, '').length;

const looksLikePhone = (value: string) => {
  const digits = digitCount(value);
  return digits >= 7 && digits <= 15;
};

const looksLikePostalCode = (value: string) =>
  /^\d{5}(-\d{4})?$/.test(value) || /^[a-z]\d[a-z]\s?\d[a-z]\d$/i.test(value);

const looksLikeState = (value: string) => /^[a-z]{2}$/i.test(value);

const looksLikeDate = (value: string) => {
  if (!value || /^\d+$/.test(value)) return false;
  return Number.isFinite(new Date(value).getTime());
};

const classifySampleValue = (value: unknown) => {
  const text = clean(value);
  if (!text) return 'blank';
  if (isEmail(text)) return 'email';
  if (looksLikePhone(text)) return 'phone';
  if (looksLikeDate(text)) return 'date';
  if (looksLikePostalCode(text)) return 'postal_code';
  if (looksLikeState(text)) return 'state_code';
  if (/^https?:\/\//i.test(text)) return 'url';
  if (/^\d+(\.\d+)?$/.test(text)) return 'number';

  const words = text.split(/\s+/).filter(Boolean).length;
  if (words >= 3 && /\d/.test(text)) return 'address_like_text';
  if (words >= 2 && words <= 4) return 'name_or_short_text';
  return 'text';
};

const profileColumns = (headers: string[], rows: ReferralSourceRow[]) =>
  headers.map((header) => {
    const samples = rows
      .slice(0, 8)
      .map((row) => classifySampleValue(row[header]))
      .filter((value, index, values) => values.indexOf(value) === index);

    return {
      header,
      normalizedHeader: normalizeHeader(header),
      sampleValueTypes: samples,
    };
  });

const scoreHeaderForField = (
  normalizedHeader: string,
  field: CanonicalReferralField
) => {
  const synonyms = FIELD_SYNONYMS[field];
  return synonyms.reduce((best, synonym) => {
    const normalizedSynonym = normalizeHeader(synonym);
    if (normalizedHeader === normalizedSynonym) return Math.max(best, 100);
    if (normalizedHeader.endsWith(` ${normalizedSynonym}`)) {
      return Math.max(best, 85);
    }
    if (normalizedHeader.includes(normalizedSynonym)) {
      return Math.max(best, 70);
    }
    return best;
  }, 0);
};

const firstValueProfileMatch = (
  headers: string[],
  rows: ReferralSourceRow[],
  matcher: (value: string) => boolean
) =>
  headers
    .map((header) => ({
      header,
      count: rows
        .slice(0, 20)
        .filter((row) => matcher(clean(row[header]))).length,
    }))
    .sort((left, right) => right.count - left.count)[0];

const getFallbackColumnMap = (
  headers: string[],
  rows: ReferralSourceRow[]
): ReferralColumnMap => {
  const used = new Set<string>();
  const map: ReferralColumnMap = {};

  CANONICAL_REFERRAL_FIELDS.forEach((field) => {
    const best = headers
      .filter((header) => !used.has(header))
      .map((header) => ({
        header,
        score: scoreHeaderForField(normalizeHeader(header), field),
      }))
      .sort((left, right) => right.score - left.score)[0];

    if (best?.score) {
      map[field] = best.header;
      used.add(best.header);
    }
  });

  if (!map.email) {
    const emailColumn = firstValueProfileMatch(headers, rows, isEmail);
    if (emailColumn?.count) map.email = emailColumn.header;
  }

  if (!map.phone) {
    const phoneColumn = firstValueProfileMatch(headers, rows, looksLikePhone);
    if (phoneColumn?.count) map.phone = phoneColumn.header;
  }

  if (!map.postal_code) {
    const postalColumn = firstValueProfileMatch(
      headers,
      rows,
      looksLikePostalCode
    );
    if (postalColumn?.count) map.postal_code = postalColumn.header;
  }

  return map;
};

const extractJsonPayload = (text: string) => {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text.trim();
};

const getTextBlocks = (content: Anthropic.Messages.Message['content']) =>
  content
    .filter((block) => block.type === 'text')
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('\n\n')
    .trim();

const coerceAiColumnMap = (
  value: unknown,
  headers: string[]
): ReferralColumnMap => {
  if (!value || typeof value !== 'object') return {};
  const rawMap = (value as { columnMap?: unknown }).columnMap;
  if (!rawMap || typeof rawMap !== 'object') return {};

  return CANONICAL_REFERRAL_FIELDS.reduce<ReferralColumnMap>((acc, field) => {
    const sourceHeader = clean(
      (rawMap as Partial<Record<CanonicalReferralField, unknown>>)[field]
    );
    if (sourceHeader && headers.includes(sourceHeader)) {
      acc[field] = sourceHeader;
    }
    return acc;
  }, {});
};

const getAiColumnMap = async (
  headers: string[],
  rows: ReferralSourceRow[]
) => {
  if (!process.env.ANTHROPIC_API_KEY || headers.length === 0) return null;

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  const columnProfiles = profileColumns(headers, rows);

  const response = await anthropic.messages.create({
    model: PROVIDER_IMPORT_MODEL,
    max_tokens: 1200,
    system:
      'Return strict JSON only. Do not include markdown. Map provider CRM export columns to the canonical TakeShape referral lead fields.',
    messages: [
      {
        role: 'user',
        content: JSON.stringify({
          task:
            'Choose the best source column for each canonical field. Use null when there is no reasonable match.',
          canonicalFields: CANONICAL_REFERRAL_FIELDS,
          columns: columnProfiles,
          responseShape: {
            columnMap:
              'object where keys are canonical fields and values are exact source headers or null',
            confidence: 'low | medium | high',
          },
        }),
      },
    ],
  });

  const parsed = JSON.parse(extractJsonPayload(getTextBlocks(response.content)));
  return coerceAiColumnMap(parsed, headers);
};

const mergeColumnMaps = (
  fallbackMap: ReferralColumnMap,
  aiMap: ReferralColumnMap
) => ({
  ...fallbackMap,
  ...Object.fromEntries(
    Object.entries(aiMap).filter(([, sourceHeader]) => Boolean(sourceHeader))
  ),
});

export const mapReferralColumns = async (
  rows: ReferralSourceRow[]
): Promise<ReferralMappingResult> => {
  const headers = Object.keys(rows[0] || {}).filter(Boolean);
  const fallbackMap = getFallbackColumnMap(headers, rows);

  try {
    const aiMap = await getAiColumnMap(headers, rows);
    if (aiMap && Object.keys(aiMap).length) {
      return {
        columnMap: mergeColumnMaps(fallbackMap, aiMap),
        confidence: 'medium',
        source: 'ai',
      };
    }
  } catch (error) {
    console.warn('AI referral column mapping failed:', error);
  }

  return {
    columnMap: fallbackMap,
    confidence: 'low',
    source: 'fallback',
  };
};
