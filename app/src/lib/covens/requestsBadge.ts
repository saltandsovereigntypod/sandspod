// Applications and requests to advance waiting for you, kept live for the
// Coven tab's count, your covens list and each coven's Review row
// (requests.ts counts them). Counted again when you sign in, when the app
// comes back to the front, when a coven note arrives, when one is decided
// here, and the moment one is made or decided anywhere once the database
// sends those rows live (row-level security sends reviewers only their covens').

import { useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { useSession } from '../session';
import { supabase } from '../supabase';
import { fetchMyStandings } from './api';
import { permissions } from './model';
import { onCovenNote } from './push';
import { countPending, pendingIn, type PendingCounts, type Waiting } from './requests';

let counts: PendingCounts = {};
let owner: string | null = null;
const listeners = new Set<() => void>();
const set = (next: PendingCounts) => {
  counts = next;
  listeners.forEach((l) => l());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Requests waiting in one coven you review, or across all of them. */
export function usePendingRequests(covenId?: string | null): number {
  return useSyncExternalStore(subscribe, () => (covenId === undefined ? pendingIn(counts) : covenId ? pendingIn(counts, covenId) : 0));
}

/** The two kinds waiting in a coven, for its Review row. */
export function usePendingDetail(covenId: string | null | undefined) {
  return useSyncExternalStore(subscribe, () => (covenId ? counts[covenId] : undefined));
}

async function recount(userId: string) {
  try {
    const standings = await fetchMyStandings(userId);
    const reviewing = standings.filter((s) => permissions({ coven: s.coven, membership: s.membership, ranks: s.ranks, userId }).review).map((s) => s.coven.id);
    if (!reviewing.length) {
      if (owner === userId) set({});
      return;
    }
    const [apps, advs] = await Promise.all([
      supabase.from('coven_applications').select('coven_id,user_id').eq('status', 'pending').in('coven_id', reviewing),
      supabase.from('coven_advancement_requests').select('coven_id,user_id').eq('status', 'pending').in('coven_id', reviewing),
    ]);
    if (apps.error || advs.error) return;
    if (owner === userId) set(countPending((apps.data ?? []) as Waiting[], (advs.data ?? []) as Waiting[], reviewing, userId));
  } catch {
    // Offline: the counts stay as they were.
  }
}

/** Count again (after deciding one, or opening Review). */
export const refreshRequests = () => (owner ? recount(owner) : Promise.resolve());

/** Keeps the counts live while you're signed in (the tabs layout calls this once). */
export function useCovenRequestsSync() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  useEffect(() => {
    owner = userId;
    set({});
    if (!userId) return;
    void recount(userId);
    const again = () => void recount(userId);
    const channel = supabase
      .channel(`coven-requests:${userId}`)
      .on('postgres_changes' as never, { event: '*', schema: 'public', table: 'coven_applications' } as never, again)
      .on('postgres_changes' as never, { event: '*', schema: 'public', table: 'coven_advancement_requests' } as never, again)
      .subscribe();
    const stopNotes = onCovenNote((source) => {
      if (source === 'coven-request' || source === 'coven-answer') again();
    });
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') again();
    });
    return () => {
      sub.remove();
      stopNotes();
      void supabase.removeChannel(channel);
    };
  }, [userId]);
}
