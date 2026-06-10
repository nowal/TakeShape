'use client';

import {
  CheckCircle2,
  Clipboard,
  ExternalLink,
  LayoutDashboard,
  RefreshCw,
  Search,
  UploadCloud,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export type SalesAdminProviderRow = {
  city: string | null;
  dashboardCreated: boolean;
  dashboardPath: string | null;
  decisionMakerEmail: string | null;
  decisionMakerName: string | null;
  decisionMakerPhone: string | null;
  decisionMakerTitle: string | null;
  domain: string | null;
  hubspotCompanyId: string;
  industry: string | null;
  latestImportAt: string | null;
  latestImportFileName: string | null;
  name: string;
  phone: string | null;
  providerId: string | null;
  sourceRows: number;
  state: string | null;
  uploaded: boolean;
  website: string | null;
};

type Props = {
  adminAccessKey?: string | null;
  hubspotError?: string | null;
  initialRows: SalesAdminProviderRow[];
  serviceKeyConfigured: boolean;
};

type CreateDashboardResponse = {
  ok?: boolean;
  error?: string;
  dashboardPath?: string;
  provider?: {
    id: string;
    businessName: string;
    logoUrl: string | null;
  };
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value);

const formatDate = (value: string | null) => {
  if (!value) return 'Not uploaded';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

const normalize = (value: string | null | undefined) =>
  (value || '').toLowerCase().trim();

const copyText = async (value: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const didCopy = document.execCommand('copy');
  document.body.removeChild(textarea);
  return didCopy;
};

export const SalesAdminClient = ({
  adminAccessKey,
  hubspotError,
  initialRows,
  serviceKeyConfigured,
}: Props) => {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState('');
  const [pendingCompanyId, setPendingCompanyId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const filteredRows = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return rows;

    return rows.filter((row) => {
      const status = row.uploaded
        ? 'uploaded'
        : row.dashboardCreated
          ? 'dashboard created'
          : 'not created';
      const haystack = [
        row.name,
        row.domain,
        row.website,
        row.decisionMakerName,
        row.decisionMakerEmail,
        row.decisionMakerPhone,
        row.decisionMakerTitle,
        row.city,
        row.state,
        row.industry,
        row.hubspotCompanyId,
        status,
      ]
        .map(normalize)
        .join(' ');
      return haystack.includes(needle);
    });
  }, [query, rows]);

  const createdCount = rows.filter((row) => row.dashboardCreated).length;
  const uploadedCount = rows.filter((row) => row.uploaded).length;
  const waitingCount = createdCount - uploadedCount;

  const createDashboard = async (row: SalesAdminProviderRow) => {
    setPendingCompanyId(row.hubspotCompanyId);
    setActionMessage('');

    try {
      const response = await fetch('/api/sales-admin/provider-dashboard', {
        body: JSON.stringify({ hubspotCompanyId: row.hubspotCompanyId }),
        headers: {
          'Content-Type': 'application/json',
          ...(adminAccessKey
            ? { 'x-sales-admin-key': adminAccessKey }
            : {}),
        },
        method: 'POST',
      });
      const result = (await response.json()) as CreateDashboardResponse;

      if (!response.ok || !result.ok || !result.provider?.id) {
        throw new Error(result.error || 'Dashboard creation failed.');
      }

      setRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.hubspotCompanyId === row.hubspotCompanyId
            ? {
                ...currentRow,
                dashboardCreated: true,
                dashboardPath: result.dashboardPath || currentRow.dashboardPath,
                name: result.provider?.businessName || currentRow.name,
                providerId: result.provider?.id || currentRow.providerId,
              }
            : currentRow
        )
      );
      setActionMessage(`Dashboard ready for ${result.provider.businessName}.`);
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : 'Dashboard creation failed.'
      );
    } finally {
      setPendingCompanyId(null);
    }
  };

  const copyDashboardLink = async (row: SalesAdminProviderRow) => {
    if (!row.dashboardPath) return;

    const url = new URL(row.dashboardPath, window.location.origin).toString();
    const didCopy = await copyText(url);
    setActionMessage(
      didCopy ? `Copied ${row.name} dashboard link.` : 'Copy failed.'
    );
  };

  return (
    <main className="min-h-screen bg-[hsl(var(--app-bg-hsl))] px-4 py-8 text-[#202020] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
        <section className="rounded-lg border border-black-08 bg-white p-6 shadow-09 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-pink">
                Sales admin
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-black-1 sm:text-4xl">
                Provider dashboard builder
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-black-3">
                Pull HubSpot company records, generate provider dashboard links,
                and track which providers have uploaded referral lists.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[480px]">
              <AdminStat label="HubSpot companies" value={rows.length} />
              <AdminStat label="Dashboards" value={createdCount} />
              <AdminStat label="Uploaded" value={uploadedCount} />
            </div>
          </div>
        </section>

        {hubspotError ? (
          <Notice tone="error" message={hubspotError} />
        ) : null}
        {!serviceKeyConfigured ? (
          <Notice
            tone="warning"
            message="Dashboard creation is disabled until TAKESHAPE_APP_SUPABASE_SERVICE_ROLE_KEY is set on the server."
          />
        ) : null}
        {actionMessage ? <Notice message={actionMessage} /> : null}

        <section className="rounded-lg border border-black-08 bg-white p-5 shadow-09">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full max-w-2xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black-3" />
              <input
                className="h-11 w-full rounded-md border border-black-08 bg-[hsl(var(--app-bg-hsl))] px-10 text-sm font-semibold text-black-1 placeholder:text-black-3"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search company, decision maker, domain, market, status, or HubSpot ID"
                type="search"
                value={query}
              />
            </label>

            <div className="flex flex-wrap gap-2 text-sm font-bold text-black-2">
              <span className="rounded-md border border-black-08 px-3 py-2">
                {formatNumber(filteredRows.length)} shown
              </span>
              <span className="rounded-md border border-black-08 px-3 py-2">
                {formatNumber(Math.max(waitingCount, 0))} waiting for upload
              </span>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border border-black-08">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
                <thead className="bg-[hsl(var(--app-bg-hsl))] text-xs font-bold uppercase text-black-3">
                  <tr>
                    <th className="border-b border-black-08 px-4 py-3">
                      Provider
                    </th>
                    <th className="border-b border-black-08 px-4 py-3">
                      Decision maker
                    </th>
                    <th className="border-b border-black-08 px-4 py-3">
                      Market
                    </th>
                    <th className="border-b border-black-08 px-4 py-3">
                      HubSpot
                    </th>
                    <th className="border-b border-black-08 px-4 py-3">
                      Dashboard
                    </th>
                    <th className="border-b border-black-08 px-4 py-3">
                      Upload
                    </th>
                    <th className="border-b border-black-08 px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length ? (
                    filteredRows.map((row) => (
                      <tr
                        className="border-b border-black-08 last:border-b-0 hover:bg-[hsl(var(--secondary-bg-hsl)/25%)]"
                        key={row.hubspotCompanyId}
                      >
                        <td className="px-4 py-4 align-top">
                          <p className="font-bold text-black-1">
                            {row.name}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-black-3">
                            {row.domain || row.website || 'No domain'}
                          </p>
                          {row.industry ? (
                            <p className="mt-2 w-fit rounded-md bg-[hsl(var(--secondary-bg-hsl)/40%)] px-2 py-1 text-xs font-bold text-black-2">
                              {row.industry}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-bold text-black-1">
                            {row.decisionMakerName || 'Not available'}
                          </p>
                          {row.decisionMakerTitle ? (
                            <p className="mt-1 text-xs font-semibold text-black-3">
                              {row.decisionMakerTitle}
                            </p>
                          ) : null}
                          {row.decisionMakerEmail ? (
                            <p className="mt-2 text-xs font-semibold text-black-2">
                              {row.decisionMakerEmail}
                            </p>
                          ) : null}
                          {row.decisionMakerPhone ? (
                            <p className="mt-1 text-xs font-semibold text-black-3">
                              {row.decisionMakerPhone}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 align-top font-semibold text-black-2">
                          {[row.city, row.state].filter(Boolean).join(', ') ||
                            'Not available'}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-black-2">
                            ID {row.hubspotCompanyId}
                          </p>
                          {row.phone ? (
                            <p className="mt-1 text-xs font-semibold text-black-3">
                              {row.phone}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <StatusPill
                            icon={LayoutDashboard}
                            label={
                              row.dashboardCreated
                                ? 'Created'
                                : 'Not created'
                            }
                            tone={row.dashboardCreated ? 'success' : 'neutral'}
                          />
                          {row.providerId ? (
                            <p className="mt-2 text-xs font-semibold text-black-3">
                              {row.providerId}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <StatusPill
                            icon={row.uploaded ? CheckCircle2 : UploadCloud}
                            label={row.uploaded ? 'Uploaded' : 'Waiting'}
                            tone={row.uploaded ? 'success' : 'neutral'}
                          />
                          <p className="mt-2 text-xs font-semibold text-black-3">
                            {formatDate(row.latestImportAt)}
                          </p>
                          {row.sourceRows > 0 ? (
                            <p className="mt-1 text-xs font-bold text-black-2">
                              {formatNumber(row.sourceRows)} source rows
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap gap-2">
                            {row.dashboardCreated && row.dashboardPath ? (
                              <>
                                <Link
                                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[hsl(var(--primary-hsl))] px-3 text-xs font-bold text-white transition hover:bg-pink-1"
                                  href={row.dashboardPath}
                                  target="_blank"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Open
                                </Link>
                                <button
                                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[hsl(var(--primary-hsl)/25%)] bg-white px-3 text-xs font-bold text-pink transition hover:bg-[hsl(var(--primary-hsl)/8%)]"
                                  onClick={() => copyDashboardLink(row)}
                                  type="button"
                                >
                                  <Clipboard className="h-4 w-4" />
                                  Copy
                                </button>
                              </>
                            ) : (
                              <button
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[hsl(var(--primary-hsl))] px-3 text-xs font-bold text-white transition hover:bg-pink-1 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={
                                  !serviceKeyConfigured ||
                                  pendingCompanyId === row.hubspotCompanyId
                                }
                                onClick={() => createDashboard(row)}
                                type="button"
                              >
                                <RefreshCw
                                  className={`h-4 w-4 ${
                                    pendingCompanyId === row.hubspotCompanyId
                                      ? 'animate-spin'
                                      : ''
                                  }`}
                                />
                                {pendingCompanyId === row.hubspotCompanyId
                                  ? 'Creating'
                                  : 'Create dashboard'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-12 text-center" colSpan={7}>
                        <p className="text-sm font-bold text-black-2">
                          No providers match this search.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

const AdminStat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border border-black-08 bg-[hsl(var(--app-bg-hsl))] p-4">
    <p className="text-xs font-bold uppercase text-black-3">{label}</p>
    <p className="mt-2 text-3xl font-bold text-black-1">
      {formatNumber(value)}
    </p>
  </div>
);

const Notice = ({
  message,
  tone = 'info',
}: {
  message: string;
  tone?: 'info' | 'warning' | 'error';
}) => {
  const className =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-black-08 bg-white text-black-2';

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm font-bold ${className}`}>
      {message}
    </div>
  );
};

const StatusPill = ({
  icon: Icon,
  label,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  tone: 'neutral' | 'success';
}) => {
  const className =
    tone === 'success'
      ? 'bg-[hsl(var(--primary-hsl)/8%)] text-pink'
      : 'bg-[hsl(var(--secondary-bg-hsl)/45%)] text-black-3';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-bold ${className}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
};
