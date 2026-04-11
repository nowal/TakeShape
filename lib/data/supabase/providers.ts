import { supabaseServer } from '@/lib/supabase/server';

type ProviderRow = {
  id: string;
  user_id: string | null;
  sessions: unknown;
};

const toSessionIds = (sessionsValue: unknown): string[] => {
  if (!Array.isArray(sessionsValue)) return [];
  return sessionsValue
    .map((sessionId) => String(sessionId || '').trim())
    .filter(Boolean);
};

export const getProviderByIdSupabase = async (providerId: string) => {
  const { data, error } = await supabaseServer
    .from('providers')
    .select('*')
    .eq('id', providerId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getProviderByUserIdSupabase = async (userId: string) => {
  const { data, error } = await supabaseServer
    .from('providers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const addSessionToProviderSupabase = async ({
  providerId,
  sessionId,
}: {
  providerId: string;
  sessionId: string;
}) => {
  const { data: current, error: getError } = await supabaseServer
    .from('providers')
    .select('id,sessions')
    .eq('id', providerId)
    .single<ProviderRow>();

  if (getError) throw getError;

  const currentSessions = toSessionIds(current.sessions);
  if (currentSessions.includes(sessionId)) {
    return current;
  }

  const updatedSessions = [...currentSessions, sessionId];
  const { data: updated, error: updateError } = await supabaseServer
    .from('providers')
    .update({
      sessions: updatedSessions,
    })
    .eq('id', providerId)
    .select('id,user_id,sessions')
    .single<ProviderRow>();

  if (updateError) throw updateError;
  return updated;
};

