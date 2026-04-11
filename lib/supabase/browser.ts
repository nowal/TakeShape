'use client';

import { createClient } from '@supabase/supabase-js';
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from '@/lib/supabase/config';

export const supabaseBrowser = createClient(
  getSupabaseUrl(),
  getSupabasePublishableKey()
);

