import { supabaseServer } from '@/lib/supabase/server';

export type SessionListItem = {
  id: string;
  lastActive: string | null;
  createdAt: string | null;
  homeownerId: string | null;
  houseId: string | null;
  currentRoomId: string | null;
};

export const listSessionsSupabase = async (
  limitValue: number
): Promise<SessionListItem[]> => {
  const safeLimit =
    Number.isFinite(limitValue) && limitValue > 0
      ? Math.floor(limitValue)
      : 10;

  const { data, error } = await supabaseServer
    .from('sessions')
    .select(
      'id,last_active,created_at,homeowner_id,house_id,current_room_id'
    )
    .order('last_active', { ascending: false })
    .limit(safeLimit);

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    lastActive: row.last_active,
    createdAt: row.created_at,
    homeownerId: row.homeowner_id,
    houseId: row.house_id,
    currentRoomId: row.current_room_id,
  }));
};

export const sessionExistsSupabase = async (sessionId: string) => {
  const { data, error } = await supabaseServer
    .from('sessions')
    .select('id')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data?.id);
};
