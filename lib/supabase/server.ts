import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/supabase/config';

let serverClient: SupabaseClient | null = null;

const getSupabaseServer = () => {
  if (!serverClient) {
    serverClient = createClient(
      getSupabaseUrl(),
      getSupabaseServiceRoleKey(),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return serverClient;
};

export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const client = getSupabaseServer();
    const value = Reflect.get(client, property, client);

    return typeof value === 'function'
      ? value.bind(client)
      : value;
  },
});
