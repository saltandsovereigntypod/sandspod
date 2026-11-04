// Supabase reads and writes for public sits (lib/community/sits.ts). Until the
// migration (20261125000000_coven_shelf_rota_sits.sql) is applied the tables
// aren't there: the list comes back not ready and Community stays quiet.

import { fetchProfiles } from '../covens/api';
import { notReady } from '../covens/sharedApi';
import { useCachedQuery } from '../more/useCachedQuery';
import { useSession } from '../session';
import { supabase } from '../supabase';
import type { PublicSit } from './sits';

export type SitsSnapshot = { sits: PublicSit[]; joined: string[]; names: Record<string, string>; ready: boolean };

const EMPTY: SitsSnapshot = { sits: [], joined: [], names: {}, ready: false };

export async function fetchSits(userId: string | null): Promise<SitsSnapshot> {
  if (!userId) return EMPTY;
  const since = new Date(Date.now() - 6 * 3600_000).toISOString();
  const { data, error } = await supabase.from('public_sits').select('*').eq('status', 'scheduled').gte('starts_at', since).order('starts_at').limit(200);
  if (error) {
    if (notReady(error)) return EMPTY;
    throw new Error(error.message);
  }
  const sits = (data ?? []) as PublicSit[];
  const [mine, profiles] = await Promise.all([
    supabase.from('public_sit_people').select('sit_id').eq('user_id', userId).gte('joined_at', new Date(Date.now() - 60 * 86400_000).toISOString()),
    fetchProfiles(sits.map((s) => s.host_id)).catch(() => []),
  ]);
  return {
    sits,
    joined: ((mine.data ?? []) as { sit_id: string }[]).map((r) => r.sit_id),
    names: Object.fromEntries(profiles.map((p) => [p.user_id, p.display_name])),
    ready: true,
  };
}

export function useSits() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const q = useCachedQuery(userId ? `community-sits-${userId}` : null, () => fetchSits(userId));
  return { ...q, data: userId ? q.data ?? null : null, signedIn: !!userId, userId };
}

async function done<T>(p: PromiseLike<{ data: unknown; error: { code?: string; message?: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(notReady(error) ? 'Public sits aren’t open yet. Please try again soon.' : error.message ?? 'Please try again.');
  return data as T;
}

export const scheduleSit = (row: Record<string, unknown>) => done<PublicSit>(supabase.from('public_sits').insert(row).select().single());
export const cancelSit = (id: string) => done(supabase.from('public_sits').update({ status: 'cancelled' }).eq('id', id));
export const joinSit = (id: string, userId: string) => done(supabase.from('public_sit_people').insert({ sit_id: id, user_id: userId }));
export const leaveSit = (id: string, userId: string) => done(supabase.from('public_sit_people').delete().eq('sit_id', id).eq('user_id', userId));
export const fetchSit = (id: string) => done<PublicSit | null>(supabase.from('public_sits').select('*').eq('id', id).maybeSingle());
