// The Library everyone in the app shares. Traditional entries are built in,
// so the Library works offline and for guests. Signed-in people also get
// their My Practice notes from `living_library_entries` (cached on the
// device); guests get the website-format guest Library if one was restored.
//
// No provider needed: any screen can call useLibrary().

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { newId } from '../altar/uid';
import { useSession } from '../session';
import { supabase } from '../supabase';
import { buildLibrary, guestPracticeRows, traditionalEntries } from './model';
import { mergePractice, newPracticeRow, type PracticeInput } from './practiceModel';
import type { LibraryEntry, PracticeRow } from './types';

type Status = 'ready' | 'loading' | 'offline';
type State = { owner: string | null; entries: LibraryEntry[]; status: Status; fetchedAt: string | null };

const GUEST_LIBRARY_KEY = 'saltAndSovereigntyLibrary';
const cacheKey = (userId: string) => `library.practice.${userId}`;

let state: State = { owner: null, entries: traditionalEntries(), status: 'ready', fetchedAt: null };
let loadingFor: string | null | undefined;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

async function fetchPractice(userId: string): Promise<PracticeRow[]> {
  const { data, error } = await supabase
    .from('living_library_entries')
    .select('entity_id,name,type,image,my_practice,community,updated_at')
    .eq('user_id', userId)
    // Newest first, so a page shows the My Practice saved most recently.
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PracticeRow[];
}

async function load(userId: string | null, force = false) {
  if (!force && loadingFor === userId && state.owner === userId) return;
  loadingFor = userId;
  if (state.owner !== userId) set({ owner: userId, entries: traditionalEntries(), fetchedAt: null });

  if (!userId) {
    try {
      const raw = await AsyncStorage.getItem(GUEST_LIBRARY_KEY);
      const rows = raw ? guestPracticeRows(JSON.parse(raw)) : [];
      if (state.owner === null) set({ entries: buildLibrary(rows), status: 'ready' });
    } catch {
      if (state.owner === null) set({ status: 'ready' });
    }
    return;
  }

  set({ status: 'loading' });
  try {
    const cached = await AsyncStorage.getItem(cacheKey(userId));
    if (cached && state.owner === userId) set({ entries: buildLibrary(JSON.parse(cached) as PracticeRow[]) });
  } catch {
    // No saved copy yet.
  }
  try {
    const rows = await fetchPractice(userId);
    if (state.owner !== userId) return;
    set({ entries: buildLibrary(rows), status: 'ready', fetchedAt: new Date().toISOString() });
    AsyncStorage.setItem(cacheKey(userId), JSON.stringify(rows)).catch(() => {});
  } catch {
    if (state.owner === userId) set({ status: 'offline' });
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLibrary() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const snapshot = useSyncExternalStore(subscribe, () => state, () => state);

  useEffect(() => {
    load(userId);
  }, [userId]);

  const entries = snapshot.owner === userId ? snapshot.entries : traditionalEntries();
  return {
    entries,
    status: snapshot.owner === userId ? snapshot.status : ('loading' as Status),
    refresh: () => load(userId, true),
    getEntry: (id: string) => entries.find((entry) => entry.id === id) ?? null,
  };
}

/**
 * Saves My Practice for a Library entry (or a new custom one) the way the
 * website does, then reloads the Library. Returns the entry's app id.
 * Edits only touch my_practice, so Community notes, images and layouts stay.
 */
export async function savePractice(args: {
  userId: string;
  entry: LibraryEntry | null;
  type: string;
  name: string;
  input: PracticeInput;
}): Promise<string> {
  const { userId, entry, input } = args;
  const now = new Date().toISOString();
  const existingId = entry?.practiceSourceId ?? entry?.practiceEntityIds[0] ?? null;

  if (entry && existingId) {
    const { error } = await supabase
      .from('living_library_entries')
      .update({ my_practice: mergePractice(entry.myPractice, input), updated_at: now })
      .eq('user_id', userId)
      .eq('entity_id', existingId);
    if (error) throw new Error(error.message);
  } else {
    const entityId = newId();
    const row = newPracticeRow({
      userId,
      entityId,
      name: entry?.name ?? args.name,
      type: entry?.type ?? args.type,
      myPractice: mergePractice(null, input),
    });
    const { error } = await supabase.from('living_library_entries').insert(row);
    if (error) throw new Error(error.message);
    if (!entry) {
      await load(userId, true);
      // A custom name that matches a Traditional entry joins that entry's page.
      const joined = state.entries.find((candidate) => candidate.practiceEntityIds.includes(entityId));
      return joined?.id ?? `practice:${entityId}`;
    }
  }
  await load(userId, true);
  return entry?.id ?? '';
}

/** "Remove from My Practice": empties My Practice on every row behind the entry, as the website does. */
export async function clearPractice(userId: string, entry: LibraryEntry): Promise<void> {
  if (entry.practiceEntityIds.length === 0) return;
  const { error } = await supabase
    .from('living_library_entries')
    .update({ my_practice: {}, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .in('entity_id', entry.practiceEntityIds);
  if (error) throw new Error(error.message);
  await load(userId, true);
}
