import {
  fetchHubSpotDecisionMakersByCompanyId,
  fetchHubSpotProviderCompanies,
  getHubSpotCompanyName,
  getHubSpotCompanyWebsite,
  type HubSpotCompany,
  type HubSpotDecisionMaker,
} from '@/lib/hubspot/provider-companies';
import { getCommunicationDashboardPath } from '@/lib/provider-dashboard/links';
import {
  getSalesAdminAccessDeniedMessage,
  isSalesAdminAccessAllowed,
} from '@/lib/sales-admin/access';
import { getTakeShapeAppSupabaseServer } from '@/lib/supabase/takeshape-app-server';
import {
  SalesAdminClient,
  type SalesAdminProviderRow,
} from './sales-admin-client';

export const dynamic = 'force-dynamic';

type ProviderExternalLinkRow = {
  external_object_id: string;
  metadata: Record<string, any> | null;
  provider_id: string;
};

type ImportBatchRow = {
  file_name: string | null;
  imported_at: string;
  imported_rows: number;
  provider_id: string;
  total_rows: number;
};

const clean = (value: string | null | undefined) => (value || '').trim();

const isAdminServiceKeyConfigured = () =>
  Boolean(process.env.TAKESHAPE_APP_SUPABASE_SERVICE_ROLE_KEY?.trim());

type SalesAdminPageProps = {
  searchParams?: {
    key?: string | string[];
  };
};

const getLatestImportByProvider = (batches: ImportBatchRow[]) => {
  const latest = new Map<string, ImportBatchRow>();

  batches.forEach((batch) => {
    const current = latest.get(batch.provider_id);
    if (
      !current ||
      new Date(batch.imported_at).getTime() >
        new Date(current.imported_at).getTime()
    ) {
      latest.set(batch.provider_id, batch);
    }
  });

  return latest;
};

const getDashboardLinkByHubSpotId = (links: ProviderExternalLinkRow[]) => {
  const byId = new Map<string, ProviderExternalLinkRow>();
  links.forEach((link) => byId.set(link.external_object_id, link));
  return byId;
};

const toSalesAdminRow = ({
  company,
  decisionMaker,
  latestImport,
  link,
}: {
  company: HubSpotCompany;
  decisionMaker: HubSpotDecisionMaker | null;
  latestImport: ImportBatchRow | null;
  link: ProviderExternalLinkRow | null;
}): SalesAdminProviderRow => {
  const providerId = link?.provider_id || null;
  const totalRows = latestImport?.total_rows || 0;
  const importedRows = latestImport?.imported_rows || 0;

  return {
    city: clean(company.properties.city) || null,
    dashboardCreated: Boolean(providerId),
    dashboardPath: providerId ? getCommunicationDashboardPath(providerId) : null,
    decisionMakerEmail: decisionMaker?.email || null,
    decisionMakerName: decisionMaker?.name || null,
    decisionMakerPhone: decisionMaker?.phone || null,
    decisionMakerTitle: decisionMaker?.jobTitle || null,
    domain: clean(company.properties.domain) || null,
    hubspotCompanyId: company.id,
    industry: clean(company.properties.industry) || null,
    latestImportAt: latestImport?.imported_at || null,
    latestImportFileName: latestImport?.file_name || null,
    name:
      clean(link?.metadata?.sourceDisplayName) ||
      getHubSpotCompanyName(company),
    phone: clean(company.properties.phone) || null,
    providerId,
    sourceRows: totalRows || importedRows,
    state: clean(company.properties.state) || null,
    uploaded: Boolean(latestImport && (totalRows > 0 || importedRows > 0)),
    website: getHubSpotCompanyWebsite(company) || null,
  };
};

const fetchSupabaseDashboardStatus = async () => {
  const supabase = getTakeShapeAppSupabaseServer();

  const [linksResult, batchesResult] = await Promise.all([
    supabase
      .from('provider_external_links')
      .select('provider_id,external_object_id,metadata')
      .eq('external_system', 'hubspot')
      .eq('external_object_type', 'company'),
    supabase
      .from('provider_import_batches')
      .select('provider_id,total_rows,imported_rows,file_name,imported_at')
      .order('imported_at', { ascending: false }),
  ]);

  if (linksResult.error) throw linksResult.error;
  if (batchesResult.error) throw batchesResult.error;

  return {
    batches: ((batchesResult.data || []) as unknown) as ImportBatchRow[],
    links: ((linksResult.data || []) as unknown) as ProviderExternalLinkRow[],
  };
};

const getSearchParamValue = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value || '').trim();

const AccessDenied = ({ message }: { message: string }) => (
  <main className="min-h-screen bg-[hsl(var(--app-bg-hsl))] px-4 py-8 text-[#202020] sm:px-6 lg:px-8">
    <div className="mx-auto w-full max-w-3xl rounded-lg border border-black-08 bg-white p-6 shadow-09 sm:p-8">
      <p className="text-sm font-semibold text-pink">Sales admin</p>
      <h1 className="mt-2 text-3xl font-bold text-black-1">
        Access required
      </h1>
      <p className="mt-3 text-sm font-semibold leading-6 text-black-3">
        {message}
      </p>
    </div>
  </main>
);

export default async function SalesAdminPage({
  searchParams,
}: SalesAdminPageProps) {
  const adminAccessKey = getSearchParamValue(searchParams?.key);
  if (!isSalesAdminAccessAllowed(adminAccessKey)) {
    return <AccessDenied message={getSalesAdminAccessDeniedMessage()} />;
  }

  let hubspotError: string | null = null;
  let companies: HubSpotCompany[] = [];
  let decisionMakerByCompanyId = new Map<string, HubSpotDecisionMaker>();

  try {
    companies = await fetchHubSpotProviderCompanies();
  } catch (error) {
    hubspotError =
      error instanceof Error ? error.message : 'HubSpot companies unavailable.';
  }

  if (companies.length) {
    try {
      decisionMakerByCompanyId = await fetchHubSpotDecisionMakersByCompanyId(
        companies.map((company) => company.id)
      );
    } catch (error) {
      console.warn('HubSpot decision maker lookup failed:', error);
    }
  }

  const { batches, links } = await fetchSupabaseDashboardStatus();
  const latestImportByProvider = getLatestImportByProvider(batches);
  const linkByHubSpotId = getDashboardLinkByHubSpotId(links);

  const rows = companies
    .map((company) => {
      const link = linkByHubSpotId.get(company.id) || null;
      return toSalesAdminRow({
        company,
        decisionMaker: decisionMakerByCompanyId.get(company.id) || null,
        latestImport: link
          ? latestImportByProvider.get(link.provider_id) || null
          : null,
        link,
      });
    })
    .sort((left, right) => {
      if (left.uploaded !== right.uploaded) return left.uploaded ? -1 : 1;
      if (left.dashboardCreated !== right.dashboardCreated) {
        return left.dashboardCreated ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    });

  return (
    <SalesAdminClient
      adminAccessKey={adminAccessKey}
      hubspotError={hubspotError}
      initialRows={rows}
      serviceKeyConfigured={isAdminServiceKeyConfigured()}
    />
  );
}
