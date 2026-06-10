import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getCommunicationDashboardPath } from '@/lib/provider-dashboard/links';
import { getTakeShapeAppSupabaseAdmin } from '@/lib/supabase/takeshape-app-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ProviderRow = {
  id: string;
  auth_user_id: string | null;
  business_name: string;
  email: string | null;
  phone: string | null;
  zip: string | null;
  service_types: string[] | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  logo_url: string | null;
  address_normalized: string | null;
  service_radius_miles: number | null;
};

type ProviderProfileRow = {
  id: string;
  auth_user_id: string;
  provider_id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

const clean = (value: string | null | undefined) => (value || '').trim();

const normalizeEmail = (value: string | null | undefined) =>
  clean(value).toLowerCase();

const toServiceTypes = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => clean(String(item))).filter(Boolean);
  }

  return clean(String(value || ''))
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const getBearerToken = (request: NextRequest) => {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return clean(match?.[1]);
};

const providerSelect = [
  'id',
  'auth_user_id',
  'business_name',
  'email',
  'phone',
  'zip',
  'service_types',
  'city',
  'state',
  'lat',
  'lng',
  'logo_url',
  'address_normalized',
  'service_radius_miles',
].join(',');

const relatedProviderTables = [
  'provider_external_links',
  'provider_import_batches',
  'provider_sourced_homeowner_leads',
  'provider_homeowner_engagement_events',
  'provider_home_scans',
];

const findProviderByAuthUserId = async (
  supabase: ReturnType<typeof getTakeShapeAppSupabaseAdmin>,
  authUserId: string
) => {
  const { data: profile, error: profileError } = await supabase
    .from('provider_profiles')
    .select('id,auth_user_id,provider_id,full_name,email,phone')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (profileError) throw profileError;

  if ((profile as ProviderProfileRow | null)?.provider_id) {
    return {
      profile: profile as ProviderProfileRow,
      providerId: (profile as ProviderProfileRow).provider_id,
    };
  }

  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select(providerSelect)
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (providerError) throw providerError;

  return {
    profile: null,
    provider: provider as ProviderRow | null,
    providerId: ((provider as ProviderRow | null)?.id || null) as
      | string
      | null,
  };
};

const fetchProvider = async (
  supabase: ReturnType<typeof getTakeShapeAppSupabaseAdmin>,
  providerId: string
) => {
  const { data, error } = await supabase
    .from('providers')
    .select(providerSelect)
    .eq('id', providerId)
    .maybeSingle();

  if (error) throw error;
  return data as ProviderRow | null;
};

const toOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
};

const getBodyCoords = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return { lat: null, lng: null };
  }

  const coords = value as { lat?: unknown; lng?: unknown };
  return {
    lat: toOptionalNumber(coords.lat),
    lng: toOptionalNumber(coords.lng),
  };
};

const moveProviderRecords = async ({
  fromProviderId,
  supabase,
  toProviderId,
}: {
  fromProviderId: string;
  supabase: ReturnType<typeof getTakeShapeAppSupabaseAdmin>;
  toProviderId: string;
}) => {
  if (fromProviderId === toProviderId) return;

  const [sourceProvider, targetProvider] = await Promise.all([
    fetchProvider(supabase, fromProviderId),
    fetchProvider(supabase, toProviderId),
  ]);

  if (!targetProvider) {
    throw new Error('Linked provider profile could not be found.');
  }

  const targetPatch = {
    address_normalized:
      targetProvider.address_normalized || sourceProvider?.address_normalized,
    city: targetProvider.city || sourceProvider?.city,
    email: targetProvider.email || sourceProvider?.email,
    phone: targetProvider.phone || sourceProvider?.phone,
    lat: targetProvider.lat ?? sourceProvider?.lat ?? null,
    lng: targetProvider.lng ?? sourceProvider?.lng ?? null,
    logo_url: targetProvider.logo_url || sourceProvider?.logo_url,
    service_radius_miles:
      targetProvider.service_radius_miles ??
      sourceProvider?.service_radius_miles ??
      null,
    service_types: targetProvider.service_types?.length
      ? targetProvider.service_types
      : sourceProvider?.service_types || [],
    state: targetProvider.state || sourceProvider?.state,
    zip: targetProvider.zip || sourceProvider?.zip,
  };

  const { error: providerUpdateError } = await supabase
    .from('providers')
    .update(targetPatch)
    .eq('id', toProviderId);

  if (providerUpdateError) throw providerUpdateError;

  for (const table of relatedProviderTables) {
    const { error } = await supabase
      .from(table)
      .update({ provider_id: toProviderId })
      .eq('provider_id', fromProviderId);

    if (error) throw error;
  }

  const { error: deactivateError } = await supabase
    .from('providers')
    .update({ is_active: false })
    .eq('id', fromProviderId)
    .is('auth_user_id', null);

  if (deactivateError) throw deactivateError;
};

const ensureProviderProfile = async ({
  authUserId,
  email,
  fullName,
  phone,
  providerId,
  supabase,
}: {
  authUserId: string;
  email: string;
  fullName: string;
  phone: string | null;
  providerId: string;
  supabase: ReturnType<typeof getTakeShapeAppSupabaseAdmin>;
}) => {
  const { data: existingForProvider, error: providerProfileError } =
    await supabase
      .from('provider_profiles')
      .select('id,auth_user_id,provider_id,full_name,email,phone')
      .eq('provider_id', providerId)
      .maybeSingle();

  if (providerProfileError) throw providerProfileError;

  if (
    existingForProvider &&
    (existingForProvider as ProviderProfileRow).auth_user_id !== authUserId
  ) {
    throw new Error('This provider dashboard is already linked to another account.');
  }

  const { data: existingForUser, error: userProfileError } = await supabase
    .from('provider_profiles')
    .select('id,auth_user_id,provider_id,full_name,email,phone')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (userProfileError) throw userProfileError;

  const payload = {
    email,
    full_name: fullName || email,
    phone,
    provider_id: providerId,
  };

  if (existingForUser) {
    const { error } = await supabase
      .from('provider_profiles')
      .update(payload)
      .eq('id', (existingForUser as ProviderProfileRow).id);

    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('provider_profiles').insert({
    ...payload,
    auth_user_id: authUserId,
  });

  if (error) throw error;
};

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'A signed-in Supabase session is required.' },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      businessName?: string;
      address?: string;
      coords?: {
        lat?: number;
        lng?: number;
      };
      fullName?: string;
      logoUrl?: string;
      phone?: string;
      phoneNumber?: string;
      providerId?: string;
      serviceTypes?: string[] | string;
      serviceRadiusMiles?: number;
      termsAndConditionsUrl?: string;
      zip?: string;
    };

    const requestedProviderId = clean(body.providerId);
    if (requestedProviderId && !UUID_PATTERN.test(requestedProviderId)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid provider id.' },
        { status: 400 }
      );
    }

    const supabase = getTakeShapeAppSupabaseAdmin();
    const { data: userResult, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userResult.user?.id) {
      return NextResponse.json(
        { ok: false, error: 'Unable to verify the signed-in user.' },
        { status: 401 }
      );
    }

    const authUserId = userResult.user.id;
    const email = normalizeEmail(userResult.user.email);
    if (!email) {
      throw new Error('The signed-in account needs an email address.');
    }

    const fullName = clean(body.fullName) || email;
    const phone = clean(body.phone) || clean(body.phoneNumber) || null;
    const address = clean(body.address) || null;
    const logoUrl = clean(body.logoUrl) || null;
    const serviceRadiusMiles = toOptionalNumber(body.serviceRadiusMiles);
    const serviceTypes = toServiceTypes(body.serviceTypes);
    const { lat, lng } = getBodyCoords(body.coords);
    const termsAndConditionsUrl = clean(body.termsAndConditionsUrl);
    const existingLink = await findProviderByAuthUserId(supabase, authUserId);
    let canonicalProviderId = existingLink.providerId;
    let requestedProvider: ProviderRow | null = null;

    if (requestedProviderId) {
      requestedProvider = await fetchProvider(supabase, requestedProviderId);
      if (!requestedProvider) {
        return NextResponse.json(
          { ok: false, error: 'Provider dashboard was not found.' },
          { status: 404 }
        );
      }

      if (
        requestedProvider.auth_user_id &&
        requestedProvider.auth_user_id !== authUserId
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: 'This provider dashboard is already linked to another account.',
          },
          { status: 409 }
        );
      }

      canonicalProviderId = canonicalProviderId || requestedProvider.id;
    }

    if (!canonicalProviderId) {
      const businessName = clean(body.businessName);
      if (!businessName) {
        return NextResponse.json(
          {
            ok: false,
            error:
              'Business name is required to create a new provider dashboard.',
          },
          { status: 400 }
        );
      }

      const providerInsert: Record<string, unknown> = {
        auth_user_id: authUserId,
        business_name: businessName,
        address_normalized: address,
        email,
        is_active: true,
        is_test: true,
        lat,
        lng,
        logo_url: logoUrl,
        phone,
        zip: clean(body.zip) || null,
      };
      if (serviceRadiusMiles !== null) {
        providerInsert.service_radius_miles = serviceRadiusMiles;
      }
      if (serviceTypes.length) {
        providerInsert.service_types = serviceTypes;
      }

      const { data: providerData, error: createProviderError } = await supabase
        .from('providers')
        .insert(providerInsert)
        .select('id')
        .single();

      if (createProviderError) throw createProviderError;
      canonicalProviderId = String((providerData as { id: string }).id);
    }

    if (requestedProvider?.id && requestedProvider.id !== canonicalProviderId) {
      await moveProviderRecords({
        fromProviderId: requestedProvider.id,
        supabase,
        toProviderId: canonicalProviderId,
      });
    }

    const canonicalProvider = await fetchProvider(supabase, canonicalProviderId);
    if (!canonicalProvider) {
      throw new Error('Provider dashboard could not be found.');
    }

    if (
      canonicalProvider.auth_user_id &&
      canonicalProvider.auth_user_id !== authUserId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'This provider dashboard is already linked to another account.',
        },
        { status: 409 }
      );
    }

    const { error: updateProviderError } = await supabase
      .from('providers')
      .update({
        address_normalized: canonicalProvider.address_normalized || address,
        auth_user_id: authUserId,
        email: canonicalProvider.email || email,
        lat: canonicalProvider.lat ?? lat,
        lng: canonicalProvider.lng ?? lng,
        logo_url: canonicalProvider.logo_url || logoUrl,
        phone: canonicalProvider.phone || phone,
        service_radius_miles:
          canonicalProvider.service_radius_miles ?? serviceRadiusMiles,
      })
      .eq('id', canonicalProviderId);

    if (updateProviderError) throw updateProviderError;

    await ensureProviderProfile({
      authUserId,
      email,
      fullName,
      phone,
      providerId: canonicalProviderId,
      supabase,
    });

    if (termsAndConditionsUrl) {
      const { error: termsLinkError } = await supabase
        .from('provider_external_links')
        .insert({
          external_object_id: `provider_terms:${canonicalProviderId}`,
          external_object_type: 'terms_and_conditions',
          external_system: 'takeshape',
          external_url: termsAndConditionsUrl,
          metadata: {
            source: 'provider_signup',
          },
          provider_id: canonicalProviderId,
          sync_status: 'synced',
        });

      if (termsLinkError) throw termsLinkError;
    }

    revalidatePath('/communicationDashboard');
    revalidatePath('/salesAdmin');

    return NextResponse.json({
      ok: true,
      dashboardPath: getCommunicationDashboardPath(canonicalProviderId),
      providerId: canonicalProviderId,
    });
  } catch (error) {
    console.error('Provider auth completion failed:', error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Provider account setup failed.',
      },
      { status: 500 }
    );
  }
}
