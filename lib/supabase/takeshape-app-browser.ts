'use client';

import { createClient } from '@supabase/supabase-js';

const required = (name: string, value: string | undefined) => {
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

export const takeshapeAppSupabaseBrowser = createClient(
  required(
    'NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_URL',
    process.env.NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_URL
  ),
  required(
    'NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_PUBLISHABLE_KEY',
    process.env.NEXT_PUBLIC_TAKESHAPE_APP_SUPABASE_PUBLISHABLE_KEY
  )
);
