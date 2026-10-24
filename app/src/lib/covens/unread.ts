// Unread coven chat, across all your covens: the count on each coven's chat
// bubble and on the Coven tab. When you last read each coven's chat is kept
// on this device; new messages from others arrive live (row-level security
// sends only your covens' messages).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { useSession } from '../session';
import { countMessage } from './unreadCount';
import { supabase } from '../supabase';

type State = { counts: Record<string, number>; read: Record<string, string> };

let state: State = { counts: {}, read: {} };
let owner: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (next: State) => {
  state = next;
  emit();
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const readKey = (userId: string) => `coven.chat.read.${userId}`;
/** Where you are reading now; its messages don't count as unread. */
let reading: string | null = null;

/** Unread messages in one coven's chat. */
export function useUnread(covenId: string | null | undefined): number {
  return useSyncExternalStore(subscribe, () => (covenId ? state.counts[covenId] ?? 0 : 0));
}

/** Unread messages across all your covens. */
export function useUnreadTotal(): number {
  return useSyncExternalStore(subscribe, () => Object.values(state.counts).reduce((a, b) => a + b, 0));
}

/** You've read this coven's chat up to now (or you're reading it: null when you stop). */
export function markRead(covenId: string, open = true) {
  reading = open ? covenId : reading === covenId ? null : reading;
  const read = { ...state.read, [covenId]: new Date().toISOString() };
  set({ counts: { ...state.counts, [covenId]: 0 }, read });
  if (owner) void AsyncStorage.setItem(readKey(owner), JSON.stringify(read)).catch(() => {});
}

async function recount(userId: string) {
  const raw = await AsyncStorage.getItem(readKey(userId)).catch(() => null);
  let read: Record<string, string> = {};
  try {
    read = raw ? JSON.parse(raw) : {};
  } catch {
    read = {};
  }
  const { data: memberships } = await supabase.from('coven_members').select('coven_id').eq('user_id', userId).eq('status', 'active');
  const covens = ((memberships ?? []) as { coven_id: string }[]).map((m) => m.coven_id);
  const counts: Record<string, number> = {};
  await Promise.all(
    covens.map(async (covenId) => {
      // First time on this device: only what came in the last day counts as new.
      const since = read[covenId] ?? new Date(Date.now() - 86_400_000).toISOString();
      const { count } = await supabase
        .from('coven_messages')
        .select('id', { count: 'exact', head: true })
        .eq('coven_id', covenId)
        .gt('created_at', since)
        .neq('user_id', userId)
        .is('deleted_at', null);
      counts[covenId] = covenId === reading ? 0 : count ?? 0;
      if (!read[covenId]) read[covenId] = since;
    }),
  );
  if (owner === userId) set({ counts, read });
}

/** Keeps the counts live while you're signed in (the tabs layout calls this once). */
export function useCovenUnreadSync() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  useEffect(() => {
    owner = userId;
    set({ counts: {}, read: {} });
    if (!userId) return;
    void recount(userId);
    const channel = supabase
      .channel(`coven-unread:${userId}`)
      .on('postgres_changes' as never, { event: 'INSERT', schema: 'public', table: 'coven_messages' } as never, (payload: { new: { coven_id: string; user_id: string | null; created_at: string } }) => {
        set({ ...state, counts: countMessage(state.counts, payload.new, userId, state.read, reading) });
      })
      .subscribe();
    // Coming back to the app: count again, in case messages came while away.
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void recount(userId);
    });
    return () => {
      sub.remove();
      void supabase.removeChannel(channel);
    };
  }, [userId]);
}
