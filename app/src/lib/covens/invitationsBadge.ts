// Invitations to covens waiting for your answer: the list at the top of My
// covens and their count on the Coven tab. Read again when you sign in, when
// the app comes back to the front, when an invitation note arrives, after you
// answer one here, and the moment one arrives or is taken back once the
// database sends those rows live (row-level security sends you only yours).
// Before the database has invitations, there are none.

import { useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { useSession } from '../session';
import { supabase } from '../supabase';
import { fetchMyCovens, fetchMyInvitations } from './api';
import { openInvitations } from './invites';
import { onCovenNote } from './push';

export type MyInvitation = Awaited<ReturnType<typeof fetchMyInvitations>>[number];

let rows: MyInvitation[] = [];
let owner: string | null = null;
const listeners = new Set<() => void>();
const set = (next: MyInvitation[]) => {
  rows = next;
  listeners.forEach((l) => l());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Your invitations still waiting, newest first. */
export const useMyInvitations = () => useSyncExternalStore(subscribe, () => rows);
/** How many, for the Coven tab. */
export const useInvitationCount = () => useSyncExternalStore(subscribe, () => rows.length);

async function reload(userId: string) {
  try {
    const [mine, covens] = await Promise.all([fetchMyInvitations(userId), fetchMyCovens(userId).catch(() => [])]);
    if (owner === userId) set(openInvitations(mine.filter((r) => r.covens), covens.map((c) => c.id)));
  } catch {
    // Offline, or no invitations in the database yet: the list stays as it was.
  }
}

/** Read again (after answering one). */
export const refreshInvitations = () => (owner ? reload(owner) : Promise.resolve());

/** Keeps the list live while you're signed in (the tabs layout calls this once). */
export function useCovenInvitationsSync() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  useEffect(() => {
    owner = userId;
    set([]);
    if (!userId) return;
    void reload(userId);
    const again = () => void reload(userId);
    const channel = supabase
      .channel(`coven-invitations:${userId}`)
      .on('postgres_changes' as never, { event: '*', schema: 'public', table: 'coven_invitations', filter: `user_id=eq.${userId}` } as never, again)
      .subscribe();
    const stopNotes = onCovenNote((source) => {
      if (source === 'coven-invitation') again();
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
