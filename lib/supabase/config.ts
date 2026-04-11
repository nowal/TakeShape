const required = (name: string) => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

export const getSupabaseUrl = () =>
  required('NEXT_PUBLIC_SUPABASE_URL');

export const getSupabasePublishableKey = () =>
  required('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

export const getSupabaseServiceRoleKey = () =>
  required('SUPABASE_SERVICE_ROLE_KEY');

