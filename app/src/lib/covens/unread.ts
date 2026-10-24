// Unread coven messages, across all your covens and conversations: the counts
// on each coven's chat bubble, its list of conversations, and the Coven tab.
// When you last read a coven's whole chat is kept on this device; for a
// conversation it's also kept with the conversation (coven_conversation_members.last_read_at),
// so it follows you between devices. New messages arrive live (row-level
// security sends only messages you can read).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { useSession } from '../session';
import { supabase } from '../supabase';
import { countMessage, covenTotal, threadKey, type Incoming } from './unreadCount';
import { refreshCovenPush } from './push';

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
/** The thread open in front of you; its messages don't count as unread. */
let reading: string | null = null;
export const openThread = () => reading;

/** Unread messages in a coven (its chat and conversations), or one thread of it. */
export function useUnread(covenId: string | null | undefined, conversationId?: string | null): number {
  return useSyncExternalStore(subscribe, () => {
    if (!covenId) return 0;
    if (conversationId === undefined) return covenTotal(state.counts, covenId);
    return state.counts[threadKey(covenId, conversationId)] ?? 0;
  });
}

/** Unread messages across all your covens. */
export function useUnreadTotal(): number {
  return useSyncExternalStore(subscribe, () => Object.values(state.counts).reduce((a, b) => a + b, 0));
}

/** You've read a thread up to now; `open` while it's in front of you, false when you leave it. */
export function markRead(covenId: string, conversationId: string | null, open = true) {
  const key = threadKey(covenId, conversationId);
  reading = open ? key : reading === key ? null : reading;
  const read = { ...state.read, [key]: new Date().toISOString() };
  set({ counts: { ...state.counts, [key]: 0 }, read });
  if (owner) void AsyncStorage.setItem(readKey(owner), JSON.stringify(read)).catch(() => {});
  if (conversationId) void supabase.rpc('coven_set_conversation', { p_conversation: conversationId, p_muted: null, p_read: true }).then(() => {}, () => {});
}

async function countSince(userId: string, covenId: string, conversationId: string | null, since: string) {
  let query = supabase.from('coven_messages').select('id', { count: 'exact', head: true }).eq('coven_id', covenId).gt('created_at', since).neq('user_id', userId).is('deleted_at', null);
  query = conversationId ? query.eq('conversation_id', conversationId) : query.is('conversation_id', null);
  const { count } = await query;
  return count ?? 0;
}

async function recount(userId: string) {
  const raw = await AsyncStorage.getItem(readKey(userId)).catch(() => null);
  let read: Record<string, string> = {};
  try {
    read = raw ? JSON.parse(raw) : {};
  } catch {
    read = {};
  }
  const [{ data: memberships }, { data: threads }] = await Promise.all([
    supabase.from('coven_members').select('coven_id').eq('user_id', userId).eq('status', 'active'),
    supabase.from('coven_conversation_members').select('conversation_id,coven_id,last_read_at,joined_at').eq('user_id', userId).is('left_at', null),
  ]);
  const covens = ((memberships ?? []) as { coven_id: string }[]).map((m) => m.coven_id);
  const counts: Record<string, number> = {};
  // First time on this device: only what came in the last day counts as new in a coven's chat.
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  await Promise.all([
    ...covens.map(async (covenId) => {
      const since = read[covenId] ?? dayAgo;
      counts[covenId] = covenId === reading ? 0 : await countSince(userId, covenId, null, since);
      if (!read[covenId]) read[covenId] = since;
    }),
    ...((threads ?? []) as { conversation_id: string; coven_id: string; last_read_at: string | null; joined_at: string }[]).map(async (t) => {
      const key = threadKey(t.coven_id, t.conversation_id);
      const local = read[key];
      const since = [t.last_read_at, local, t.joined_at].filter(Boolean).sort().pop() as string;
      counts[key] = key === reading ? 0 : await countSince(userId, t.coven_id, t.conversation_id, since);
      read[key] = since;
    }),
  ]);
  if (owner === userId) set({ counts, read });
}

/** Count everything again (a conversation started elsewhere, coming back online). */
export const refreshUnread = () => (owner ? recount(owner) : Promise.resolve());

/** Keeps the counts live while you're signed in (the tabs layout calls this once). */
export function useCovenUnreadSync() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  useEffect(() => {
    owner = userId;
    set({ counts: {}, read: {} });
    if (!userId) return;
    void recount(userId);
    // Tokens can change between launches; keep this phone's sign-up current.
    void refreshCovenPush().catch(() => {});
    const channel = supabase
      .channel(`coven-unread:${userId}`)
      .on('postgres_changes' as never, { event: 'INSERT', schema: 'public', table: 'coven_messages' } as never, (payload: { new: Incoming }) => {
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
