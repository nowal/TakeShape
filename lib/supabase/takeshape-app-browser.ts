'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const clean = (value: string | undefined) => (value || '').trim();

const supabaseUrl =
  clean(process.env.NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_URL) ||
  clean(process.env.NEXT_PUBLIC_SUPABASE_URL);

const supabasePublishableKey =
  clean(process.env.NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_PUBLISHABLE_KEY) ||
  clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

const requirePublicEnv = (value: string, names: string[]) => {
  if (value) return value;
  throw new Error(
    `Missing required environment variable. Set one of: ${names.join(', ')}`
  );
};

export const hasTakeShapeAppSupabaseBrowserEnv = () =>
  Boolean(supabaseUrl && supabasePublishableKey);

let browserClient: SupabaseClient | null = null;

export const getTakeShapeAppSupabaseBrowser = () => {
  if (!browserClient) {
    browserClient = createClient(
      requirePublicEnv(supabaseUrl, [
        'NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_URL',
      ]),
      requirePublicEnv(supabasePublishableKey, [
        'NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_PUBLISHABLE_KEY',
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      ])
    );
  }

  return browserClient;
};

export const takeshapeAppSupabaseBrowser = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const client = getTakeShapeAppSupabaseBrowser() as any;
    const value = client[property];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
