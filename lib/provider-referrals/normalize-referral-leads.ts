import {
  NormalizedReferralLead,
  ReferralColumnMap,
  ReferralSourceRow,
} from './import-types';

const SOURCE_SYSTEM = 'provider_dashboard_upload';

const clean = (value: unknown) => String(value ?? '').trim();

const nullable = (value: unknown) => clean(value) || null;

const normalizeEmail = (value: unknown) => {
  const email = clean(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
};

const normalizePhone = (value: unknown) => {
  const digits = clean(value).replace(/\D+/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  if (digits.length === 10) return digits;
  return digits.length >= 7 ? digits : null;
};

const normalizeState = (value: unknown) => {
  const state = clean(value);
  return state.length === 2 ? state.toUpperCase() : state || null;
};

const normalizeDate = (value: unknown) => {
  const raw = clean(value);
  if (!raw) return null;

  const parsed = new Date(raw);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed.toISOString();
};

const parseBoolean = (value: unknown) => {
  const raw = clean(value).toLowerCase();
  return ['1', 'true', 'yes', 'y', 'opted out', 'unsubscribed'].includes(raw);
};

const splitName = (fullName: string | null) => {
  if (!fullName) return { firstName: null, lastName: null };
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { firstName: fullName, lastName: null };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

const getMappedValue = (
  row: ReferralSourceRow,
  columnMap: ReferralColumnMap,
  field: keyof ReferralColumnMap
) => {
  const header = columnMap[field];
  return header ? row[header] : null;
};

const hasImportableContent = (lead: NormalizedReferralLead) =>
  Boolean(
    lead.email ||
      lead.phone ||
      lead.full_name ||
      lead.first_name ||
      lead.last_name ||
      lead.address_line1
  );

export const normalizeReferralLeads = ({
  columnMap,
  fileName,
  importBatchId,
  providerId,
  rows,
}: {
  columnMap: ReferralColumnMap;
  fileName: string;
  importBatchId: string;
  providerId: string;
  rows: ReferralSourceRow[];
}) => {
  const skippedRows: Array<{ rowNumber: number; reason: string }> = [];
  const leads: NormalizedReferralLead[] = [];

  rows.forEach((row, index) => {
    const fullName = nullable(getMappedValue(row, columnMap, 'full_name'));
    const split = splitName(fullName);
    const firstName =
      nullable(getMappedValue(row, columnMap, 'first_name')) || split.firstName;
    const lastName =
      nullable(getMappedValue(row, columnMap, 'last_name')) || split.lastName;
    const normalizedFullName =
      fullName || [firstName, lastName].filter(Boolean).join(' ') || null;

    const lead: NormalizedReferralLead = {
      provider_id: providerId,
      import_batch_id: importBatchId,
      source_system: SOURCE_SYSTEM,
      external_contact_id: nullable(
        getMappedValue(row, columnMap, 'external_contact_id')
      ),
      external_lead_id: nullable(
        getMappedValue(row, columnMap, 'external_lead_id')
      ),
      first_name: firstName,
      last_name: lastName,
      full_name: normalizedFullName,
      email: normalizeEmail(getMappedValue(row, columnMap, 'email')),
      phone: normalizePhone(getMappedValue(row, columnMap, 'phone')),
      address_line1: nullable(getMappedValue(row, columnMap, 'address_line1')),
      city: nullable(getMappedValue(row, columnMap, 'city')),
      state: normalizeState(getMappedValue(row, columnMap, 'state')),
      postal_code: nullable(getMappedValue(row, columnMap, 'postal_code')),
      company: nullable(getMappedValue(row, columnMap, 'company')),
      title: nullable(getMappedValue(row, columnMap, 'title')),
      lead_type: nullable(getMappedValue(row, columnMap, 'lead_type')),
      campaign: nullable(getMappedValue(row, columnMap, 'campaign')),
      contact_status: nullable(
        getMappedValue(row, columnMap, 'contact_status')
      ),
      lead_tags: [],
      opted_out: parseBoolean(getMappedValue(row, columnMap, 'opted_out')),
      source_created_at: normalizeDate(
        getMappedValue(row, columnMap, 'source_created_at')
      ),
      raw_payload: {
        sourceFileName: fileName,
        sourceRowNumber: index + 2,
        sourceRow: row,
        columnMap,
      },
    };

    if (hasImportableContent(lead)) {
      leads.push(lead);
    } else {
      skippedRows.push({
        rowNumber: index + 2,
        reason: 'No name, email, phone, or address found',
      });
    }
  });

  return {
    leads,
    skippedRows,
  };
};
