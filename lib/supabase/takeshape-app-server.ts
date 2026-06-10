import { createClient } from '@supabase/supabase-js';

const clean = (value: string | undefined) => (value || '').trim();

const firstAvailableEnv = (names: string[]) => {
  for (const name of names) {
    const value = clean(process.env[name]);
    if (value) return value;
  }

  throw new Error(
    `Missing required environment variable. Set one of: ${names.join(', ')}`
  );
};

const getTakeShapeSupabaseUrl = () =>
  firstAvailableEnv([
    'NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
  ]);

const getTakeShapeSupabasePublishableKey = () =>
  firstAvailableEnv([
    'NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  ]);

const getTakeShapeSupabaseServiceRoleKey = () =>
  firstAvailableEnv([
    'TAKESHAPE_APP_SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]);

export const getTakeShapeAppSupabaseServer = () =>
  createClient(
    getTakeShapeSupabaseUrl(),
    clean(process.env.TAKESHAPE_APP_SUPABASE_SERVICE_ROLE_KEY) ||
      clean(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
      getTakeShapeSupabasePublishableKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

export const getTakeShapeAppSupabaseAdmin = () =>
  createClient(
    getTakeShapeSupabaseUrl(),
    getTakeShapeSupabaseServiceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
