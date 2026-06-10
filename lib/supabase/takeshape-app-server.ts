import { createClient } from '@supabase/supabase-js';

const required = (name: string, value: string | undefined) => {
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

export const getTakeShapeAppSupabaseServer = () =>
  createClient(
    required(
      'NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_URL',
      process.env.NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_URL
    ),
    process.env.TAKESHAPE_APP_SUPABASE_SERVICE_ROLE_KEY?.trim() ||
      required(
        'NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_PUBLISHABLE_KEY',
        process.env.NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_PUBLISHABLE_KEY
      ),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

export const getTakeShapeAppSupabaseAdmin = () =>
  createClient(
    required(
      'NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_URL',
      process.env.NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_URL
    ),
    required(
      'TAKESHAPE_APP_SUPABASE_SERVICE_ROLE_KEY',
      process.env.TAKESHAPE_APP_SUPABASE_SERVICE_ROLE_KEY
    ),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
