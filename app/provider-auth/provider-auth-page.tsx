import { ProviderAuthClient, type ProviderAuthMode } from './provider-auth-client';
import { getTakeShapeAppSupabaseServer } from '@/lib/supabase/takeshape-app-server';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ProviderAuthPageProps = {
  mode: ProviderAuthMode;
  searchParams?: {
    provider?: string | string[];
    providerId?: string | string[];
  };
};

const getSearchParamValue = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value || '').trim();

const resolveProviderId = (searchParams?: ProviderAuthPageProps['searchParams']) => {
  const requestedProviderId =
    getSearchParamValue(searchParams?.provider) ||
    getSearchParamValue(searchParams?.providerId);

  return UUID_PATTERN.test(requestedProviderId) ? requestedProviderId : null;
};

export const ProviderAuthPage = async ({
  mode,
  searchParams,
}: ProviderAuthPageProps) => {
  const providerId = resolveProviderId(searchParams);
  let initialProvider = null;

  if (providerId) {
    const supabase = getTakeShapeAppSupabaseServer();
    const { data, error } = await supabase
      .from('providers')
      .select(
        'id,business_name,email,phone,service_types,city,state,zip,logo_url'
      )
      .eq('id', providerId)
      .maybeSingle();

    if (error) throw error;
    initialProvider = data;
  }

  return (
    <ProviderAuthClient
      initialProvider={initialProvider}
      mode={mode}
      providerId={providerId}
    />
  );
};
