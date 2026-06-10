import { NextRequest, NextResponse } from 'next/server';
import { getProviderOutreachSummary } from '@/lib/customerio/provider-outreach';
import { getTakeShapeAppSupabaseAdmin } from '@/lib/supabase/takeshape-app-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 1000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SupabaseAdmin = ReturnType<typeof getTakeShapeAppSupabaseAdmin>;

type RawHomeownerLead = {
  id: string;
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
  source_created_at: string | null;
};

type EngagementEvent = {
  event_type: string;
  channel: string | null;
};

type RecentHomeScan = {
  id: string;
  homeowner_name: string | null;
  address: string | null;
  scan_label: string | null;
  scan_completed_at: string;
  model_url: string | null;
  floor_plan_url: string | null;
};

const clean = (value: string | null | undefined) => (value || '').trim();

const normalizeText = (value: string | null | undefined) =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeEmail = (value: string | null | undefined) => {
  const email = clean(value).toLowerCase();
  return email.includes('@') ? email : '';
};

const normalizePhone = (value: string | null | undefined) => {
  const digits = clean(value).replace(/\D+/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  if (digits.length === 10) return digits;
  return digits.length >= 7 ? digits : '';
};

const getLeadName = (lead: RawHomeownerLead) =>
  clean(lead.full_name) ||
  [lead.first_name, lead.last_name].map(clean).filter(Boolean).join(' ') ||
  clean(lead.company);

const getAddress = (lead: RawHomeownerLead) =>
  [lead.address_line1, lead.city, lead.state, lead.postal_code]
    .map(clean)
    .filter(Boolean)
    .join(', ');

const chooseBest = (values: Array<string | null | undefined>) =>
  values
    .map(clean)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0] || null;

const chooseLatestDate = (values: Array<string | null | undefined>) => {
  const dates = values
    .map((value) => (value ? new Date(value).getTime() : Number.NaN))
    .filter(Number.isFinite);

  if (!dates.length) return null;
  return new Date(Math.max(...dates)).toISOString();
};

const isMissingTableError = (error: unknown) =>
  Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'PGRST205'
  );

const getBearerToken = (request: NextRequest) => {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return clean(match?.[1]);
};

const assertProviderAccess = async ({
  providerId,
  supabase,
  token,
}: {
  providerId: string;
  supabase: SupabaseAdmin;
  token: string;
}) => {
  const { data: userResult, error: userError } =
    await supabase.auth.getUser(token);

  if (userError || !userResult.user?.id) {
    throw new Error('Please log in to view this dashboard.');
  }

  const authUserId = userResult.user.id;
  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select('id,auth_user_id')
    .eq('id', providerId)
    .maybeSingle();

  if (providerError) throw providerError;
  if (!provider) throw new Error('Provider dashboard was not found.');

  if ((provider as { auth_user_id?: string | null }).auth_user_id === authUserId) {
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('provider_id', providerId)
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) {
    throw new Error('This dashboard is linked to a different provider account.');
  }
};

const fetchAllLeads = async (supabase: SupabaseAdmin, providerId: string) => {
  const rows: RawHomeownerLead[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('provider_sourced_homeowner_leads')
      .select(
        [
          'id',
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
          'source_created_at',
        ].join(',')
      )
      .eq('provider_id', providerId)
      .order('source_created_at', {
        ascending: false,
        nullsFirst: false,
      })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    const chunk = ((data || []) as unknown) as RawHomeownerLead[];
    rows.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
  }

  return rows;
};

const dedupeHomeownerLeads = (rows: RawHomeownerLead[]) => {
  const parent = new Map<string, string>();

  const find = (key: string): string => {
    const current = parent.get(key);
    if (!current) {
      parent.set(key, key);
      return key;
    }
    if (current === key) return key;
    const root = find(current);
    parent.set(key, root);
    return root;
  };

  const union = (left: string, right: string) => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) {
      parent.set(rightRoot, leftRoot);
    }
  };

  rows.forEach((row) => {
    const rowKey = `row:${row.id}`;
    find(rowKey);

    const keys = [
      normalizeEmail(row.email) ? `email:${normalizeEmail(row.email)}` : '',
      normalizePhone(row.phone) ? `phone:${normalizePhone(row.phone)}` : '',
    ].filter(Boolean);

    const name = normalizeText(getLeadName(row));
    const address = normalizeText(getAddress(row));
    if (!keys.length && name && address) {
      keys.push(`name_address:${name}|${address}`);
    }

    keys.forEach((key) => union(rowKey, key));
  });

  const groups = rows.reduce<Record<string, RawHomeownerLead[]>>((acc, row) => {
    const root = find(`row:${row.id}`);
    acc[root] = acc[root] || [];
    acc[root].push(row);
    return acc;
  }, {});

  return Object.entries(groups)
    .map(([root, group]) => {
      const emails = Array.from(
        new Set(group.map((row) => normalizeEmail(row.email)).filter(Boolean))
      ).sort();
      const phones = Array.from(
        new Set(group.map((row) => normalizePhone(row.phone)).filter(Boolean))
      ).sort();
      const addressRow = group
        .filter((row) => getAddress(row))
        .sort((a, b) => getAddress(b).length - getAddress(a).length)[0];

      return {
        id: root,
        name:
          chooseBest(group.map((row) => getLeadName(row))) ||
          emails[0] ||
          phones[0] ||
          'Unnamed homeowner',
        emails,
        phones,
        address: addressRow ? getAddress(addressRow) : null,
        latestLeadDate: chooseLatestDate(
          group.map((row) => row.source_created_at)
        ),
        sourceRowCount: group.length,
      };
    })
    .sort((a, b) => {
      const bDate = b.latestLeadDate
        ? new Date(b.latestLeadDate).getTime()
        : 0;
      const aDate = a.latestLeadDate
        ? new Date(a.latestLeadDate).getTime()
        : 0;
      return bDate - aDate || a.name.localeCompare(b.name);
    });
};

const fetchEngagementCounts = async (
  supabase: SupabaseAdmin,
  providerId: string
) => {
  try {
    const { data, error } = await supabase
      .from('provider_homeowner_engagement_events')
      .select('event_type,channel')
      .eq('provider_id', providerId)
      .in('event_type', ['email_sent', 'sms_sent', 'text_sent']);

    if (error) throw error;
    const events = ((data || []) as unknown) as EngagementEvent[];
    return events.reduce(
      (acc, event) => {
        if (event.event_type === 'email_sent') acc.emailSent += 1;
        if (
          event.event_type === 'sms_sent' ||
          event.event_type === 'text_sent' ||
          event.channel === 'sms'
        ) {
          acc.smsSent += 1;
        }
        return acc;
      },
      { emailSent: 0, smsSent: 0 }
    );
  } catch (error) {
    if (!isMissingTableError(error)) {
      console.warn('Provider engagement counts unavailable:', error);
    }
    return { emailSent: 0, smsSent: 0 };
  }
};

const fetchRecentHomeScans = async (
  supabase: SupabaseAdmin,
  providerId: string
) => {
  try {
    const { data, error } = await supabase
      .from('provider_home_scans')
      .select(
        'id,homeowner_name,address,scan_label,scan_completed_at,model_url,floor_plan_url'
      )
      .eq('provider_id', providerId)
      .order('scan_completed_at', { ascending: false })
      .limit(3);

    if (error) throw error;
    return ((data || []) as unknown) as RecentHomeScan[];
  } catch (error) {
    if (!isMissingTableError(error)) {
      console.warn('Provider home scans unavailable:', error);
    }
    return [];
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = String(searchParams.get('providerId') || '').trim();
    const token = getBearerToken(request);

    if (!UUID_PATTERN.test(providerId)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid provider id.' },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Please log in to view this dashboard.' },
        { status: 401 }
      );
    }

    const supabase = getTakeShapeAppSupabaseAdmin();
    await assertProviderAccess({ providerId, supabase, token });

    const [
      providerResult,
      linkResult,
      batchResult,
      rawLeads,
      outreachSummary,
      engagementCounts,
      recentHomeScans,
    ] = await Promise.all([
      supabase
        .from('providers')
        .select(
          'id,business_name,email,phone,service_types,city,state,zip,address_normalized,logo_url'
        )
        .eq('id', providerId)
        .single(),
      supabase
        .from('provider_external_links')
        .select('external_url,external_object_id,metadata')
        .eq('provider_id', providerId)
        .eq('external_system', 'hubspot')
        .eq('external_object_type', 'company')
        .maybeSingle(),
      supabase
        .from('provider_import_batches')
        .select(
          'id,source_system,source_label,file_name,total_rows,imported_rows,skipped_rows,imported_at,metadata'
        )
        .eq('provider_id', providerId)
        .order('imported_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      fetchAllLeads(supabase, providerId),
      getProviderOutreachSummary(),
      fetchEngagementCounts(supabase, providerId),
      fetchRecentHomeScans(supabase, providerId),
    ]);

    if (providerResult.error) throw providerResult.error;
    if (linkResult.error) throw linkResult.error;
    if (batchResult.error) throw batchResult.error;

    const leads = dedupeHomeownerLeads(rawLeads);
    const communicationSummary = {
      ...outreachSummary,
      email: {
        ...outreachSummary.email,
        sentCount: Math.max(
          outreachSummary.email.sentCount,
          engagementCounts.emailSent
        ),
      },
      sms: {
        ...outreachSummary.sms,
        sentCount: Math.max(
          outreachSummary.sms.sentCount,
          engagementCounts.smsSent
        ),
      },
    };

    return NextResponse.json({
      ok: true,
      communicationSummary,
      forcePreUploadState: false,
      latestBatch: batchResult.data || null,
      leads,
      metrics: {
        homeownerLeadCount: leads.length,
        sourceRowCount: rawLeads.length,
      },
      provider: providerResult.data,
      providerLink: linkResult.data || null,
      recentHomeScans,
      revenueSummary: {
        referralPayout: 0,
        totalJobVolume: 0,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load dashboard.';
    const status = message.includes('different provider') ? 403 : 500;

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status }
    );
  }
}
