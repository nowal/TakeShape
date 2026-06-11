'use client';

import {
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  FileSpreadsheet,
  Home,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Smartphone,
  Upload,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '@/context/auth/provider';
import {
  getCommunicationDashboardPath,
  getProviderLoginPath,
  getProviderSignupPath,
} from '@/lib/provider-dashboard/links';
import { takeshapeAppSupabaseBrowser } from '@/lib/supabase/takeshape-app-browser';

type ProviderProfile = {
  id: string;
  business_name: string;
  email: string | null;
  phone: string | null;
  service_types: string[] | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  address_normalized: string | null;
  logo_url: string | null;
};

type ProviderLink = {
  external_url: string | null;
  external_object_id: string;
  metadata: Record<string, any> | null;
};

type ImportBatch = {
  id: string;
  source_system: string;
  source_label: string;
  file_name: string | null;
  total_rows: number;
  imported_rows: number;
  skipped_rows: number;
  imported_at: string;
  metadata: Record<string, any> | null;
};

export type HomeownerLead = {
  id: string;
  name: string;
  emails: string[];
  phones: string[];
  address: string | null;
  latestLeadDate: string | null;
  sourceRowCount: number;
};

type DashboardMetrics = {
  homeownerLeadCount: number;
  sourceRowCount: number;
};

type OutreachChannelSummary = {
  sentCount: number;
  messageName: string;
  subject: string;
  preview: string;
  status: string;
  source: 'customer_io' | 'placeholder';
};

type CommunicationSummary = {
  campaignName: string;
  campaignStatus: string;
  customerIoConnected: boolean;
  email: OutreachChannelSummary;
  sms: OutreachChannelSummary;
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

type RevenueSummary = {
  totalJobVolume: number;
  referralPayout: number;
};

type Props = {
  communicationSummary: CommunicationSummary;
  provider: ProviderProfile;
  providerLink: ProviderLink | null;
  latestBatch: ImportBatch | null;
  leads: HomeownerLead[];
  metrics: DashboardMetrics;
  recentHomeScans: RecentHomeScan[];
  revenueSummary: RevenueSummary;
  forcePreUploadState?: boolean;
};

type AccessGateProps = {
  provider: ProviderProfile;
  providerLink: ProviderLink | null;
  latestBatch: ImportBatch | null;
};

type DashboardDataResponse =
  | ({
      ok: true;
    } & Props)
  | {
      error?: string;
      ok?: false;
    };

type ProviderByUserResponse = {
  error?: string;
  provider?: {
    id?: unknown;
  } | null;
};

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type UploadProgressStep = 'uploading' | 'complete';

type ReferralImportResponse = {
  ok?: boolean;
  error?: string;
  importedRows?: number;
  pendingReview?: boolean;
  totalRows?: number;
  customerIo?: {
    enabled: boolean;
    failed: number;
    synced: number;
  };
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string | null | undefined) => {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

const normalize = (value: string | null | undefined) =>
  (value || '').toLowerCase().trim();

const displayLeadName = (lead: HomeownerLead) =>
  lead.name ||
  lead.emails[0] ||
  lead.phones[0] ||
  'Unnamed homeowner';

const displayLocation = (lead: HomeownerLead) =>
  lead.address || 'No address';

const formatPhone = (phone: string) => {
  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
  }
  return phone;
};

const displayEmails = (lead: HomeownerLead) => {
  if (!lead.emails.length) return 'No email';
  return lead.emails.join(', ');
};

const displayPhones = (lead: HomeownerLead) => {
  if (!lead.phones.length) return 'No phone';
  return lead.phones.map(formatPhone).join(', ');
};

export const CommunicationDashboardAccountResolver = () => {
  const router = useRouter();
  const { isAuthLoading, isUserSignedIn } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isUserSignedIn) {
      setIsResolving(false);
      return;
    }

    let isMounted = true;

    const resolveDashboard = async () => {
      setIsResolving(true);
      setErrorMessage('');

      try {
        const { data, error } =
          await takeshapeAppSupabaseBrowser.auth.getSession();
        if (error) throw error;

        const accessToken = data.session?.access_token || '';
        if (!accessToken) {
          throw new Error('Please log in to open your dashboard.');
        }

        const response = await fetch('/api/providers/by-user', {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const payload =
          (await response.json().catch(() => ({}))) as ProviderByUserResponse;

        if (!response.ok) {
          throw new Error(payload.error || 'Unable to find your dashboard.');
        }

        const providerId = payload.provider?.id
          ? String(payload.provider.id)
          : '';

        if (!providerId) {
          throw new Error('No provider dashboard is linked to this account.');
        }

        router.replace(getCommunicationDashboardPath(providerId));
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to open your dashboard.'
          );
        }
      } finally {
        if (isMounted) {
          setIsResolving(false);
        }
      }
    };

    void resolveDashboard();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isUserSignedIn, router]);

  const handleLoginClick = () => {
    router.push(getProviderLoginPath());
  };

  const handleSignupClick = () => {
    router.push('/signup');
  };

  const showLoading = isAuthLoading || isResolving;
  const title = showLoading
    ? 'Opening your dashboard'
    : isUserSignedIn
      ? 'Dashboard not found'
      : 'Log in to view your dashboard';
  const message = showLoading
    ? 'Checking the provider dashboard linked to your account.'
    : errorMessage ||
      'Use the account connected to your TakeShape provider dashboard.';

  return (
    <main className="min-h-screen bg-[hsl(var(--app-bg-hsl))] px-4 py-8 text-[#202020] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-lg border border-black-08 bg-white p-6 text-center shadow-09 sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[hsl(var(--primary-hsl)/8%)] text-pink">
            {showLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
          </div>
          <p className="mt-5 text-sm font-semibold text-pink">
            Referral partner dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-black-1">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-black-3">
            {message}
          </p>
          {!showLoading && !isUserSignedIn ? (
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                className="inline-flex h-11 items-center justify-center rounded-md bg-[hsl(var(--primary-hsl))] px-4 text-sm font-bold text-white transition hover:bg-pink-1"
                onClick={handleLoginClick}
                type="button"
              >
                Log in
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-md border border-[hsl(var(--primary-hsl)/25%)] bg-white px-4 text-sm font-bold text-pink transition hover:bg-[hsl(var(--primary-hsl)/8%)]"
                onClick={handleSignupClick}
                type="button"
              >
                Sign up
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
};

export const CommunicationDashboardAccessGate = ({
  latestBatch,
  provider,
  providerLink,
}: AccessGateProps) => {
  const router = useRouter();
  const { isAuthLoading, isUserSignedIn } = useAuth();
  const [dashboardData, setDashboardData] = useState<Props | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const sourceDisplayName =
    providerLink?.metadata?.sourceDisplayName ||
    provider.business_name ||
    'Provider dashboard';
  const hubspotOwner =
    providerLink?.metadata?.owner?.firstName &&
    providerLink?.metadata?.owner?.lastName
      ? `${providerLink.metadata.owner.firstName} ${providerLink.metadata.owner.lastName}`
      : providerLink?.metadata?.owner?.email || 'Unassigned';
  const serviceTypes = provider.service_types?.length
    ? provider.service_types.join(', ')
    : 'Home services';

  useEffect(() => {
    if (!isUserSignedIn) {
      setDashboardData(null);
      setIsLoadingDashboard(false);
      return;
    }

    let isMounted = true;
    const loadDashboard = async () => {
      setIsLoadingDashboard(true);
      setErrorMessage('');

      try {
        const { data, error } =
          await takeshapeAppSupabaseBrowser.auth.getSession();
        if (error) throw error;

        const accessToken = data.session?.access_token || '';
        if (!accessToken) {
          throw new Error('Please log in to view this dashboard.');
        }

        const response = await fetch(
          `/api/communication-dashboard/data?providerId=${encodeURIComponent(
            provider.id
          )}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const payload =
          (await response.json().catch(() => ({}))) as DashboardDataResponse;

        if (!response.ok || !payload.ok) {
          const message = 'error' in payload ? payload.error : '';
          throw new Error(
            message || 'Unable to open this provider dashboard.'
          );
        }

        if (isMounted) {
          setDashboardData(payload);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to open this provider dashboard.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingDashboard(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [isUserSignedIn, provider.id]);

  if (dashboardData) {
    return <CommunicationDashboardClient {...dashboardData} />;
  }

  const handleSignupClick = () => {
    router.push(getProviderSignupPath(provider.id));
  };

  const handleLoginClick = () => {
    router.push(getProviderLoginPath(provider.id));
  };

  return (
    <main className="min-h-screen bg-[hsl(var(--app-bg-hsl))] px-4 py-8 text-[#202020] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
        <section className="overflow-hidden rounded-lg border border-black-08 bg-white shadow-09">
          <div className="flex flex-col gap-8 p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg border border-black-08 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                  <ProviderLogo
                    logoUrl={provider.logo_url}
                    name={sourceDisplayName}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-pink">
                    Referral partner dashboard
                  </p>
                  <h1 className="mt-2 text-3xl font-bold leading-tight text-black-1 sm:text-4xl">
                    {sourceDisplayName}
                  </h1>
                  <p className="mt-3 w-fit rounded-md border border-black-08 bg-[hsl(var(--secondary-bg-hsl)/35%)] px-3 py-1 text-sm font-semibold text-black-2">
                    {serviceTypes}
                  </p>
                </div>
              </div>

              <div className="w-full rounded-lg border border-black-08 bg-[hsl(var(--secondary-bg-hsl)/45%)] p-5 text-center lg:max-w-md">
                <p className="mx-auto max-w-sm text-sm font-semibold leading-6 text-black-2">
                  Data processed. Sign up to view this dashboard.
                </p>
                <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                  <button
                    className="inline-flex h-11 items-center justify-center rounded-md bg-[hsl(var(--primary-hsl))] px-4 text-sm font-bold text-white transition hover:bg-pink-1"
                    onClick={handleSignupClick}
                    type="button"
                  >
                    Sign up
                  </button>
                  <button
                    className="inline-flex h-11 items-center justify-center rounded-md border border-[hsl(var(--primary-hsl)/25%)] bg-white px-4 text-sm font-bold text-pink transition hover:bg-[hsl(var(--primary-hsl)/8%)]"
                    onClick={handleLoginClick}
                    type="button"
                  >
                    Log in
                  </button>
                </div>
                {isAuthLoading || isLoadingDashboard ? (
                  <p className="mt-3 text-xs font-bold text-black-3">
                    Checking dashboard access...
                  </p>
                ) : null}
                {errorMessage ? (
                  <p className="mt-3 text-xs font-bold text-red-600">
                    {errorMessage}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ProfileFact
                icon={ShieldCheck}
                label="TakeShape contact"
                value={hubspotOwner}
              />
              <ProfileFact
                icon={MapPin}
                label="Market"
                value={[provider.city, provider.state, provider.zip]
                  .filter(Boolean)
                  .join(', ')}
              />
              <ProfileFact
                icon={CalendarDays}
                label="Latest import"
                value={formatDate(latestBatch?.imported_at)}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export const CommunicationDashboardClient = ({
  communicationSummary,
  provider,
  providerLink,
  latestBatch,
  leads,
  metrics,
  recentHomeScans,
  revenueSummary,
  forcePreUploadState = false,
}: Props) => {
  const router = useRouter();
  const { isUserSignedIn } = useAuth();
  const [query, setQuery] = useState('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [hasPendingUploadInSession, setHasPendingUploadInSession] =
    useState(false);
  const contactFileInputRef = useRef<HTMLInputElement>(null);

  const sourceDisplayName =
    providerLink?.metadata?.sourceDisplayName ||
    provider.business_name ||
    'Provider dashboard';
  const hubspotOwner =
    providerLink?.metadata?.owner?.firstName &&
    providerLink?.metadata?.owner?.lastName
      ? `${providerLink.metadata.owner.firstName} ${providerLink.metadata.owner.lastName}`
      : providerLink?.metadata?.owner?.email || 'Unassigned';
  const serviceTypes = provider.service_types?.length
    ? provider.service_types.join(', ')
    : 'Home services';
  const latestBatchReviewStatus = String(
    latestBatch?.metadata?.manualReview?.status ||
      latestBatch?.metadata?.reviewStatus ||
      ''
  );
  const hasImportedContacts =
    metrics.homeownerLeadCount > 0 ||
    metrics.sourceRowCount > 0 ||
    (latestBatch?.imported_rows || 0) > 0;
  const hasPendingReviewBatch =
    Boolean(latestBatch) &&
    !hasImportedContacts &&
    ((latestBatch?.total_rows || 0) > 0 ||
      latestBatchReviewStatus === 'pending_review');
  const isReferralListProcessing =
    hasPendingUploadInSession ||
    (!forcePreUploadState && hasPendingReviewBatch);
  const isPreUpload =
    !isReferralListProcessing &&
    (forcePreUploadState || (!latestBatch && !hasImportedContacts));
  const isInactiveDashboard = isPreUpload || isReferralListProcessing;
  const showSignupCta = !isUserSignedIn;
  const displayMetrics = isInactiveDashboard
    ? { homeownerLeadCount: 0, sourceRowCount: 0 }
    : metrics;

  useEffect(() => {
    if (uploadStatus !== 'uploading') return;

    const interval = window.setInterval(() => {
      setUploadProgress((current) => {
        if (current < 36) return Math.min(current + 6, 36);
        if (current < 72) return Math.min(current + 4, 72);
        return Math.min(current + 1, 90);
      });
    }, 500);

    return () => window.clearInterval(interval);
  }, [uploadStatus]);

  const handleUploadClick = () => {
    if (uploadStatus === 'uploading') return;
    contactFileInputRef.current?.click();
  };

  const handleClaimDashboardClick = () => {
    router.push(getProviderSignupPath(provider.id));
  };

  const handleContactFileSelected = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] || null;
    event.target.value = '';
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadMessage('');
    setUploadProgress(8);
    setIsUploadModalOpen(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('providerId', provider.id);

    try {
      const response = await fetch('/api/provider-referral-list/import', {
        body: formData,
        method: 'POST',
      });
      const result = (await response.json()) as ReferralImportResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Referral list import failed.');
      }

      setUploadStatus('success');
      setUploadProgress(100);
      setHasPendingUploadInSession(true);
      setUploadMessage(
        `Upload complete. We'll process your referrals in 24 to 48 hours and let you know when your dashboard is ready.`
      );

      router.refresh();
    } catch (error) {
      setUploadStatus('error');
      setUploadProgress((current) => Math.max(current, 24));
      setUploadMessage(
        error instanceof Error ? error.message : 'Referral list import failed.'
      );
    }
  };

  const filteredLeads = useMemo(() => {
    if (isInactiveDashboard) return [];

    const needle = normalize(query);
    return leads.filter((lead) => {
      const haystack = [
        lead.name,
        ...lead.emails,
        ...lead.phones,
        lead.address,
        lead.latestLeadDate,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !needle || haystack.includes(needle);
    });
  }, [isInactiveDashboard, leads, query]);

  const visibleRows = filteredLeads.slice(0, 75);
  const totalContactMessages =
    isInactiveDashboard
      ? 0
      : communicationSummary.email.sentCount +
        communicationSummary.sms.sentCount;

  return (
    <main className="min-h-screen bg-[hsl(var(--app-bg-hsl))] px-4 py-8 text-[#202020] sm:px-6 lg:px-8">
      <input
        ref={contactFileInputRef}
        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        aria-label="Upload referral list"
        className="sr-only"
        onChange={handleContactFileSelected}
        type="file"
      />
      <ReferralUploadProgressModal
        isOpen={isUploadModalOpen}
        message={uploadMessage}
        onClaimDashboard={handleClaimDashboardClick}
        onClose={() => setIsUploadModalOpen(false)}
        onRetry={handleUploadClick}
        progress={uploadProgress}
        showSignupCta={showSignupCta}
        status={uploadStatus}
      />
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
        <section className="overflow-hidden rounded-lg border border-black-08 bg-white shadow-09">
          <div className="flex flex-col gap-8 p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg border border-black-08 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                  <ProviderLogo
                    logoUrl={provider.logo_url}
                    name={sourceDisplayName}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-pink">
                    Referral partner dashboard
                  </p>
                  <h1 className="mt-2 text-3xl font-bold leading-tight text-black-1 sm:text-4xl">
                    {sourceDisplayName}
                  </h1>
                  <p className="mt-3 w-fit rounded-md border border-black-08 bg-[hsl(var(--secondary-bg-hsl)/35%)] px-3 py-1 text-sm font-semibold text-black-2">
                    {serviceTypes}
                  </p>
                </div>
              </div>

              {isPreUpload ? (
                <UploadActivationCard
                  isUploading={uploadStatus === 'uploading'}
                  onUploadClick={handleUploadClick}
                  status={uploadStatus}
                  statusMessage={uploadMessage}
                />
              ) : isReferralListProcessing ? (
                <ProcessingActivationCard
                  onSignupClick={handleClaimDashboardClick}
                  showSignupCta={showSignupCta}
                />
              ) : (
                <div className="w-full rounded-lg border border-black-08 bg-[hsl(var(--secondary-bg-hsl)/45%)] p-5 lg:max-w-sm">
                  <p className="text-xs font-bold uppercase text-black-3">
                    Homeowner leads provided
                  </p>
                  <p className="mt-3 text-5xl font-bold text-black-1">
                    {formatNumber(displayMetrics.homeownerLeadCount)}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-black-3">
                    {formatNumber(displayMetrics.sourceRowCount)} source
                    records condensed into unique leads
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ProfileFact
                icon={ShieldCheck}
                label="TakeShape contact"
                value={hubspotOwner}
              />
              <ProfileFact
                icon={MapPin}
                label="Market"
                value={[provider.city, provider.state, provider.zip]
                  .filter(Boolean)
                  .join(', ')}
              />
              <ProfileFact
                icon={CalendarDays}
                label="Latest import"
                value={
                  isPreUpload
                    ? 'Not uploaded yet'
                    : formatDate(latestBatch?.imported_at)
                }
              />
            </div>
          </div>
        </section>

        <section>
          <div className="min-w-0 rounded-lg border border-black-08 bg-white p-5 shadow-09">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-black-1">
                  Homeowner conversion funnel
                </h2>
                {!isInactiveDashboard ? (
                  <p className="mt-1 text-sm font-medium text-black-3">
                    Customer.io outreach and app scan events feed this view.
                  </p>
                ) : null}
              </div>
              <div className="rounded-md bg-[hsl(var(--primary-hsl)/8%)] px-3 py-2 text-sm font-bold text-pink">
                {isPreUpload
                  ? 'Waiting for referral list'
                  : isReferralListProcessing
                    ? 'Referral list processing'
                  : communicationSummary.customerIoConnected
                    ? communicationSummary.campaignStatus
                    : 'Customer.io pending'}
              </div>
            </div>

            {isInactiveDashboard ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <FunnelMetricCard
                    icon={Users}
                    label="Homeowners contacted"
                    value={formatNumber(0)}
                  />
                  <FunnelMetricCard
                    icon={Smartphone}
                    label="Homes scanned"
                    value={formatNumber(0)}
                  />
                  <FunnelMetricCard
                    icon={DollarSign}
                    label="Total job volume"
                    value={formatCurrency(0)}
                  />
                  <FunnelMetricCard
                    icon={BadgeDollarSign}
                    label="Referral payout"
                    value={formatCurrency(0)}
                  />
                </div>

                {isReferralListProcessing ? (
                  <ProcessingEmptyState
                    onSignupClick={handleClaimDashboardClick}
                    showSignupCta={showSignupCta}
                  />
                ) : (
                  <UploadEmptyState
                    isUploading={uploadStatus === 'uploading'}
                    onUploadClick={handleUploadClick}
                    status={uploadStatus}
                    statusMessage={uploadMessage}
                    title="Upload referral list"
                  />
                )}
              </>
            ) : (
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)_minmax(220px,0.55fr)_minmax(220px,0.55fr)]">
                <div className="rounded-lg border border-black-08 bg-[hsl(var(--app-bg-hsl))] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[hsl(var(--primary-hsl))] text-white">
                        <Mail className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-bold text-black-1">
                        Homeowners contacted
                      </h3>
                      <p className="mt-1 text-sm font-semibold leading-6 text-black-3">
                        {communicationSummary.campaignName}
                      </p>
                    </div>
                    <div className="rounded-md border border-black-08 bg-white px-3 py-2 text-sm font-bold text-black-2">
                      {formatNumber(totalContactMessages)} total messages
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <ChannelMessageCard
                      channel="Email"
                      icon={Mail}
                      summary={communicationSummary.email}
                    />
                    <ChannelMessageCard
                      channel="Text"
                      icon={MessageSquare}
                      summary={communicationSummary.sms}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-black-08 bg-[hsl(var(--app-bg-hsl))] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-black-3">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-black-1">
                    Homes scanned
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-black-1">
                    {formatNumber(recentHomeScans.length)}
                  </p>
                  <div className="mt-4 space-y-3">
                    {recentHomeScans.length ? (
                      recentHomeScans.map((scan) => (
                        <div
                          className="rounded-md border border-black-08 bg-white p-3"
                          key={scan.id}
                        >
                          <p className="text-sm font-bold text-black-1">
                            {scan.homeowner_name ||
                              scan.scan_label ||
                              'Scanned home'}
                          </p>
                          <p className="mt-1 text-xs font-semibold leading-5 text-black-3">
                            {scan.address || 'Address not available'}
                          </p>
                          <p className="mt-2 text-xs font-bold text-pink">
                            {formatDate(scan.scan_completed_at)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-md border border-dashed border-black-08 bg-white p-4">
                        <p className="text-sm font-bold text-black-2">
                          No homes scanned yet
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-black-3">
                          The three most recent scanned homes from this
                          provider lead database will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <MoneyMetricCard
                  icon={DollarSign}
                  label="Total job volume"
                  value={revenueSummary.totalJobVolume}
                />
                <MoneyMetricCard
                  icon={BadgeDollarSign}
                  label="Referral payout"
                  value={revenueSummary.referralPayout}
                />
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="min-w-0 rounded-lg border border-black-08 bg-white p-5 shadow-09">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-black-1">
                  Homeowner lookup
                </h2>
                {!isInactiveDashboard ? (
                  <p className="mt-1 text-sm font-medium text-black-3">
                    Search by name, email, phone, or address.
                  </p>
                ) : null}
              </div>
              <span className="rounded-md border border-black-08 px-3 py-2 text-sm font-bold text-black-2">
                {formatNumber(filteredLeads.length)} matching leads
              </span>
            </div>

            <label className="relative mt-5 block max-w-2xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black-3" />
              <input
                className="h-11 w-full rounded-md border border-black-08 bg-[hsl(var(--app-bg-hsl))] px-10 text-sm font-semibold text-black-1 placeholder:text-black-3 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isInactiveDashboard}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  isInactiveDashboard
                    ? 'Search homeowners'
                    : 'Search name, email, phone, or address'
                }
                type="search"
                value={query}
              />
            </label>

            {!isInactiveDashboard ? (
              <div className="mt-4 rounded-lg bg-[hsl(var(--secondary-bg-hsl)/30%)] px-4 py-3 text-sm font-semibold text-black-3">
                Showing {formatNumber(visibleRows.length)} of{' '}
                {formatNumber(filteredLeads.length)} matching homeowner leads.
                Refine the search to find a specific homeowner.
              </div>
            ) : null}

            <div className="mt-5 overflow-hidden rounded-lg border border-black-08">
              <div className="max-h-[640px] overflow-auto">
                <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-[hsl(var(--app-bg-hsl))] text-xs font-bold uppercase text-black-3">
                    <tr>
                      <th className="border-b border-black-08 px-4 py-3">
                        Homeowner
                      </th>
                      <th className="border-b border-black-08 px-4 py-3">
                        Email
                      </th>
                      <th className="border-b border-black-08 px-4 py-3">
                        Phone
                      </th>
                      <th className="border-b border-black-08 px-4 py-3">
                        Address
                      </th>
                      <th className="border-b border-black-08 px-4 py-3">
                        Latest date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isInactiveDashboard ? (
                      <tr>
                        <td className="px-4 py-10" colSpan={5}>
                          {isReferralListProcessing ? (
                            <ProcessingEmptyState
                              onSignupClick={handleClaimDashboardClick}
                              showSignupCta={showSignupCta}
                            />
                          ) : (
                            <UploadEmptyState
                              isUploading={uploadStatus === 'uploading'}
                              onUploadClick={handleUploadClick}
                              status={uploadStatus}
                              statusMessage={uploadMessage}
                              title="Upload referral list"
                            />
                          )}
                        </td>
                      </tr>
                    ) : visibleRows.length ? (
                      visibleRows.map((lead) => (
                        <tr
                          className="border-b border-black-08 last:border-b-0 hover:bg-[hsl(var(--secondary-bg-hsl)/30%)]"
                          key={lead.id}
                        >
                          <td className="px-4 py-3">
                            <p className="font-bold text-black-1">
                              {displayLeadName(lead)}
                            </p>
                            {lead.sourceRowCount > 1 ? (
                              <p className="mt-1 text-xs font-semibold text-black-3">
                                Merged from {formatNumber(lead.sourceRowCount)}{' '}
                                source records
                              </p>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-black-2">
                              {displayEmails(lead)}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-black-2">
                              {displayPhones(lead)}
                            </p>
                          </td>
                          <td className="max-w-[360px] px-4 py-3">
                            <p className="font-semibold text-black-2">
                              {displayLocation(lead)}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-black-2">
                            {formatDate(lead.latestLeadDate)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-10 text-center" colSpan={5}>
                          <p className="text-sm font-bold text-black-2">
                            No homeowner matches found
                          </p>
                          <p className="mt-2 text-sm font-semibold text-black-3">
                            Try a different name, email, phone, or address.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

const ProviderLogo = ({
  logoUrl,
  name,
}: {
  logoUrl: string | null;
  name: string;
}) => {
  const [hasError, setHasError] = useState(false);

  if (!logoUrl || hasError) {
    return <Home className="h-8 w-8 text-pink" />;
  }

  return (
    <Image
      alt={`${name} logo`}
      className="max-h-full max-w-full object-contain"
      height={125}
      onError={() => setHasError(true)}
      src={logoUrl}
      unoptimized
      width={200}
    />
  );
};

const ProfileFact = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) => (
  <div className="rounded-lg border border-black-08 bg-[hsl(var(--app-bg-hsl))] p-4">
    <Icon className="h-5 w-5 text-pink" />
    <p className="mt-3 text-xs font-bold uppercase text-black-3">
      {label}
    </p>
    <p className="mt-1 break-words text-sm font-bold text-black-1">
      {value || 'Not available'}
    </p>
  </div>
);

const uploadSteps: { key: UploadProgressStep; label: string }[] = [
  { key: 'uploading', label: 'Uploading' },
  { key: 'complete', label: 'Upload complete' },
];

const ReferralUploadProgressModal = ({
  isOpen,
  message,
  onClaimDashboard,
  onClose,
  onRetry,
  progress,
  showSignupCta,
  status,
}: {
  isOpen: boolean;
  message: string;
  onClaimDashboard: () => void;
  onClose: () => void;
  onRetry: () => void;
  progress: number;
  showSignupCta: boolean;
  status: UploadStatus;
}) => {
  if (!isOpen || status === 'idle') return null;

  const activeStep: UploadProgressStep =
    status === 'success' ? 'complete' : 'uploading';
  const activeStepIndex = uploadSteps.findIndex(
    (step) => step.key === activeStep
  );
  const isUploading = status === 'uploading';
  const isComplete = status === 'success';
  const isError = status === 'error';
  const modalTitle = isComplete
    ? 'Upload complete'
    : isError
      ? 'Upload needs attention'
      : 'Uploading referral list';

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-lg border border-black-08 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-pink">Referral upload</p>
            <h2 className="mt-2 text-2xl font-bold text-black-1">
              {modalTitle}
            </h2>
          </div>
          {!isUploading ? (
            <button
              aria-label="Close upload progress"
              className="rounded-md border border-black-08 px-3 py-1 text-sm font-bold text-black-3 transition hover:bg-[hsl(var(--secondary-bg-hsl)/40%)]"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          ) : null}
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[hsl(var(--secondary-bg-hsl)/55%)]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isError ? 'bg-red-500' : 'bg-[hsl(var(--primary-hsl))]'
            }`}
            style={{ width: `${Math.max(8, Math.min(progress, 100))}%` }}
          />
        </div>

        <div className="mt-5 space-y-3">
          {uploadSteps.map((step, index) => {
            const isStepComplete = isComplete || index < activeStepIndex;
            const isStepActive = !isComplete && index === activeStepIndex;
            const showError = isError && isStepActive;

            return (
              <div
                className="flex items-center gap-3 text-sm font-bold"
                key={step.key}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isStepComplete
                      ? 'bg-[hsl(var(--primary-hsl))] text-white'
                      : showError
                        ? 'bg-red-50 text-red-600'
                        : isStepActive
                          ? 'bg-[hsl(var(--primary-hsl)/10%)] text-pink'
                          : 'bg-[hsl(var(--secondary-bg-hsl)/45%)] text-black-3'
                  }`}
                >
                  {isStepComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : showError ? (
                    <XCircle className="h-4 w-4" />
                  ) : isStepActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-current" />
                  )}
                </div>
                <span
                  className={
                    isStepComplete || isStepActive
                      ? 'text-black-1'
                      : 'text-black-3'
                  }
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {message ? (
          <p
            className={`mt-5 rounded-md px-3 py-2 text-sm font-semibold leading-6 ${
              isError
                ? 'bg-red-50 text-red-700'
                : 'bg-[hsl(var(--secondary-bg-hsl)/35%)] text-black-2'
            }`}
          >
            {message}
          </p>
        ) : null}

        {isComplete && showSignupCta ? (
          <button
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-[hsl(var(--primary-hsl))] px-4 text-sm font-bold text-white transition hover:bg-pink-1"
            onClick={onClaimDashboard}
            type="button"
          >
            Sign up now to get access when complete
          </button>
        ) : null}

        {isError ? (
          <button
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md border border-[hsl(var(--primary-hsl)/25%)] bg-white px-4 text-sm font-bold text-pink transition hover:bg-[hsl(var(--primary-hsl)/8%)]"
            onClick={onRetry}
            type="button"
          >
            Choose another file
          </button>
        ) : null}
      </div>
    </div>
  );
};

const UploadActivationCard = ({
  isUploading,
  onUploadClick,
  status,
  statusMessage,
}: {
  isUploading: boolean;
  onUploadClick: () => void;
  status: UploadStatus;
  statusMessage: string;
}) => (
  <div className="w-full rounded-lg border border-black-08 bg-[hsl(var(--secondary-bg-hsl)/45%)] p-5 text-center lg:max-w-md">
    <p className="mx-auto max-w-sm text-sm font-semibold leading-6 text-black-3">
      Upload referral list as CSV or Excel file to activate your dashboard.
    </p>
    <div className="mt-5 flex justify-center">
      <UploadCtaButton
        isUploading={isUploading}
        onUploadClick={onUploadClick}
        variant="primary"
      />
    </div>
    <UploadStatusNotice message={statusMessage} status={status} />
  </div>
);

const ProcessingActivationCard = ({
  onSignupClick,
  showSignupCta,
}: {
  onSignupClick: () => void;
  showSignupCta: boolean;
}) => (
  <div className="w-full rounded-lg border border-black-08 bg-[hsl(var(--secondary-bg-hsl)/45%)] p-5 text-center lg:max-w-md">
    <p className="mx-auto max-w-sm text-sm font-semibold leading-6 text-black-2">
      Your referral list is processing. We will process your referrals in 24 to
      48 hours and let you know when your dashboard is ready.
    </p>
    {showSignupCta ? (
      <div className="mt-5 flex justify-center">
        <ProcessingSignupButton onSignupClick={onSignupClick} />
      </div>
    ) : null}
  </div>
);

const UploadEmptyState = ({
  isUploading,
  onUploadClick,
  status,
  statusMessage,
  title,
}: {
  isUploading: boolean;
  onUploadClick: () => void;
  status: UploadStatus;
  statusMessage: string;
  title: string;
}) => (
  <div className="mt-4 rounded-lg border border-dashed border-black-08 bg-[hsl(var(--secondary-bg-hsl)/25%)] p-5 text-center">
    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-white text-pink">
      <FileSpreadsheet className="h-5 w-5" />
    </div>
    <h3 className="mt-3 text-base font-bold text-black-1">{title}</h3>
    <div className="mt-4 flex justify-center">
      <UploadCtaButton
        isUploading={isUploading}
        onUploadClick={onUploadClick}
        variant="secondary"
      />
    </div>
    <UploadStatusNotice message={statusMessage} status={status} />
  </div>
);

const ProcessingEmptyState = ({
  onSignupClick,
  showSignupCta,
}: {
  onSignupClick: () => void;
  showSignupCta: boolean;
}) => (
  <div className="mt-4 rounded-lg border border-dashed border-black-08 bg-[hsl(var(--secondary-bg-hsl)/25%)] p-5 text-center">
    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-white text-pink">
      <FileSpreadsheet className="h-5 w-5" />
    </div>
    <h3 className="mt-3 text-base font-bold text-black-1">
      Your referral list is processing
    </h3>
    <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-black-3">
      We will process your referrals in 24 to 48 hours and let you know when
      your dashboard is ready.
    </p>
    {showSignupCta ? (
      <div className="mt-4 flex justify-center">
        <ProcessingSignupButton onSignupClick={onSignupClick} />
      </div>
    ) : null}
  </div>
);

const ProcessingSignupButton = ({
  onSignupClick,
}: {
  onSignupClick: () => void;
}) => (
  <button
    className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[hsl(var(--primary-hsl))] px-4 text-sm font-bold text-white transition hover:bg-pink-1 sm:w-auto"
    onClick={onSignupClick}
    type="button"
  >
    Sign up now
  </button>
);

const UploadCtaButton = ({
  isUploading,
  onUploadClick,
  variant,
}: {
  isUploading: boolean;
  onUploadClick: () => void;
  variant: 'primary' | 'secondary';
}) => {
  const className =
    variant === 'primary'
      ? 'bg-[hsl(var(--primary-hsl))] text-white hover:bg-pink-1'
      : 'border border-[hsl(var(--primary-hsl)/25%)] bg-white text-pink hover:bg-[hsl(var(--primary-hsl)/8%)]';

  return (
    <button
      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${className}`}
      disabled={isUploading}
      onClick={onUploadClick}
      type="button"
    >
      <Upload className="h-4 w-4" />
      {isUploading ? 'Uploading...' : 'Upload referral list'}
    </button>
  );
};

const UploadStatusNotice = ({
  message,
  status,
}: {
  message: string;
  status: UploadStatus;
}) => {
  if (!message || status === 'idle') return null;

  return (
    <p
      className={`mt-3 text-xs font-bold ${
        status === 'error' ? 'text-red-600' : 'text-black-3'
      }`}
    >
      {message}
    </p>
  );
};

const FunnelMetricCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) => (
  <div className="rounded-lg border border-black-08 bg-[hsl(var(--app-bg-hsl))] p-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-black-3">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mt-4 text-base font-bold text-black-1">{label}</h3>
    <p className="mt-2 text-3xl font-bold text-black-1">{value}</p>
  </div>
);

const ChannelMessageCard = ({
  channel,
  icon: Icon,
  summary,
}: {
  channel: string;
  icon: LucideIcon;
  summary: OutreachChannelSummary;
}) => (
  <div className="rounded-md border border-black-08 bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase text-black-3">
          {channel} sent
        </p>
        <p className="mt-1 text-3xl font-bold text-black-1">
          {formatNumber(summary.sentCount)}
        </p>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[hsl(var(--primary-hsl)/8%)] text-pink">
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className="mt-4 rounded-md bg-[hsl(var(--secondary-bg-hsl)/30%)] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-bold text-black-1">
          {summary.messageName}
        </p>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-black-3">
          {summary.source === 'customer_io'
            ? 'Customer.io copy'
            : 'Example copy'}
        </span>
      </div>
      <p className="mt-2 text-sm font-bold text-black-2">
        {summary.subject}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-black-3">
        {summary.preview}
      </p>
      <p className="mt-3 text-xs font-bold uppercase text-pink">
        {summary.status}
      </p>
    </div>
  </div>
);

const MoneyMetricCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) => (
  <div className="rounded-lg border border-black-08 bg-[hsl(var(--app-bg-hsl))] p-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-black-3">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mt-4 text-base font-bold text-black-1">
      {label}
    </h3>
    <p className="mt-2 text-3xl font-bold text-black-1">
      {formatCurrency(value)}
    </p>
    <p className="mt-4 text-sm font-semibold leading-6 text-black-3">
      This will update once booked job data is connected.
    </p>
  </div>
);
