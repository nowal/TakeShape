'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

let browserClient: SupabaseClient | null = null;

export const getTakeShapeAppSupabaseBrowser = () => {
  if (!browserClient) {
    browserClient = createClient(
      firstAvailableEnv([
        'NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_URL',
      ]),
      firstAvailableEnv([
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
