import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  fetchHubSpotCompanyById,
  fetchHubSpotOwnerById,
  getHubSpotCompanyAppUrl,
  getHubSpotCompanyName,
  getHubSpotCompanyWebsite,
  type HubSpotCompany,
} from '@/lib/hubspot/provider-companies';
import { discoverWebsiteLogo } from '@/lib/hubspot/website-logo';
import { getCommunicationDashboardPath } from '@/lib/provider-dashboard/links';
import {
  getSalesAdminAccessDeniedMessage,
  isSalesAdminAccessAllowed,
} from '@/lib/sales-admin/access';
import { getTakeShapeAppSupabaseAdmin } from '@/lib/supabase/takeshape-app-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ProviderRow = {
  id: string;
  business_name: string;
  logo_url: string | null;
};

type ExistingProviderLink = {
  metadata: Record<string, unknown> | null;
  provider_id: string;
};

const clean = (value: string | null | undefined) => (value || '').trim();

const hasTakeShapeAppAdminKey = () =>
  Boolean(process.env.TAKESHAPE_APP_SUPABASE_SERVICE_ROLE_KEY?.trim());

const toServiceTypes = (company: HubSpotCompany) => {
  const industry = clean(company.properties.industry);
  return industry ? [industry] : [];
};

const getAddress = (company: HubSpotCompany) =>
  [
    company.properties.address,
    company.properties.address2,
    company.properties.city,
    company.properties.state,
    company.properties.zip,
  ]
    .map(clean)
    .filter(Boolean)
    .join(', ');

const getProviderDashboardPayload = (provider: ProviderRow) => ({
  dashboardPath: getCommunicationDashboardPath(provider.id),
  provider: {
    id: provider.id,
    businessName: provider.business_name,
    logoUrl: provider.logo_url,
  },
});

const withDiscoveredLogo = async ({
  hubspotCompanyId,
  link,
  provider,
  supabase,
}: {
  hubspotCompanyId: string;
  link: ExistingProviderLink;
  provider: ProviderRow;
  supabase: ReturnType<typeof getTakeShapeAppSupabaseAdmin>;
}) => {
  if (provider.logo_url) return provider;

  const company = await fetchHubSpotCompanyById(hubspotCompanyId);
  const website = getHubSpotCompanyWebsite(company);
  const logoUrl = await discoverWebsiteLogo(website);
  if (!logoUrl) return provider;

  const { data, error } = await supabase
    .from('providers')
    .update({ logo_url: logoUrl })
    .eq('id', provider.id)
    .select('id,business_name,logo_url')
    .single();

  if (error) throw error;

  const metadata =
    link.metadata && typeof link.metadata === 'object' ? link.metadata : {};
  const { error: linkUpdateError } = await supabase
    .from('provider_external_links')
    .update({
      metadata: {
        ...metadata,
        logoDiscoveredAt: new Date().toISOString(),
        logoSource: 'website_or_favicon',
        website,
      },
    })
    .eq('external_system', 'hubspot')
    .eq('external_object_type', 'company')
    .eq('external_object_id', hubspotCompanyId);

  if (linkUpdateError) throw linkUpdateError;

  return data as ProviderRow;
};

export async function POST(request: NextRequest) {
  try {
    if (!isSalesAdminAccessAllowed(request.headers.get('x-sales-admin-key'))) {
      return NextResponse.json(
        { ok: false, error: getSalesAdminAccessDeniedMessage() },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      hubspotCompanyId?: string;
    } | null;
    const hubspotCompanyId = clean(body?.hubspotCompanyId);

    if (!hubspotCompanyId) {
      return NextResponse.json(
        { ok: false, error: 'hubspotCompanyId is required.' },
        { status: 400 }
      );
    }

    if (!hasTakeShapeAppAdminKey()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Dashboard creation needs TAKESHAPE_APP_SUPABASE_SERVICE_ROLE_KEY on the server.',
        },
        { status: 503 }
      );
    }

    const supabase = getTakeShapeAppSupabaseAdmin();

    const { data: existingLink, error: existingLinkError } = await supabase
      .from('provider_external_links')
      .select('provider_id,metadata')
      .eq('external_system', 'hubspot')
      .eq('external_object_type', 'company')
      .eq('external_object_id', hubspotCompanyId)
      .maybeSingle();

    if (existingLinkError) throw existingLinkError;

    if (existingLink?.provider_id) {
      const { data: existingProvider, error: existingProviderError } =
        await supabase
          .from('providers')
          .select('id,business_name,logo_url')
          .eq('id', existingLink.provider_id)
          .single();

      if (existingProviderError) throw existingProviderError;
      const provider = await withDiscoveredLogo({
        hubspotCompanyId,
        link: existingLink as ExistingProviderLink,
        provider: existingProvider as ProviderRow,
        supabase,
      });

      return NextResponse.json({
        ok: true,
        created: false,
        ...getProviderDashboardPayload(provider),
      });
    }

    const company = await fetchHubSpotCompanyById(hubspotCompanyId);
    const website = getHubSpotCompanyWebsite(company);
    const [logoUrl, owner] = await Promise.all([
      discoverWebsiteLogo(website),
      fetchHubSpotOwnerById(clean(company.properties.hubspot_owner_id)),
    ]);
    const businessName = getHubSpotCompanyName(company);

    const { data: providerData, error: providerError } = await supabase
      .from('providers')
      .insert({
        address_normalized: getAddress(company) || null,
        business_name: businessName,
        city: clean(company.properties.city) || null,
        is_active: true,
        is_test: true,
        logo_url: logoUrl,
        phone: clean(company.properties.phone) || null,
        service_types: toServiceTypes(company),
        state: clean(company.properties.state) || null,
        zip: clean(company.properties.zip) || null,
      })
      .select('id,business_name,logo_url')
      .single();

    if (providerError) throw providerError;

    const provider = providerData as ProviderRow;
    const { error: linkError } = await supabase
      .from('provider_external_links')
      .insert({
        external_object_id: hubspotCompanyId,
        external_object_type: 'company',
        external_system: 'hubspot',
        external_url: getHubSpotCompanyAppUrl(hubspotCompanyId),
        metadata: {
          dashboardCreatedAt: new Date().toISOString(),
          hubspotCompany: {
            id: company.id,
            archived: Boolean(company.archived),
            createdAt: company.createdAt || null,
            updatedAt: company.updatedAt || null,
            properties: company.properties,
          },
          logoSource: logoUrl ? 'website_or_favicon' : null,
          owner,
          sourceDisplayName: businessName,
          website,
        },
        provider_id: provider.id,
        sync_status: 'synced',
      });

    if (linkError) throw linkError;

    revalidatePath('/communicationDashboard');
    revalidatePath('/salesAdmin');

    return NextResponse.json({
      ok: true,
      created: true,
      ...getProviderDashboardPayload(provider),
    });
  } catch (error) {
    console.error('Sales admin dashboard creation failed:', error);

    const message =
      error instanceof Error ? error.message : 'Dashboard creation failed.';

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
