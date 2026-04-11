import { createClient } from '@supabase/supabase-js';
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/supabase/config';

export const supabaseServer = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey(),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

