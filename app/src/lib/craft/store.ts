// Entries for the practice tools: the garden, dreams, readings, ancestors,
// stones, shore finds, local lore and daily devotions. Each tool keeps a
// named collection of entries. They're saved on the phone straight away and,
// signed in, synced to the `craft_entries` table (one row per entry, the
// entry itself as `data`), so they follow you to every device.
//
// Deletes are soft (deleted_at) so a phone that was offline learns about
// them; the newest `updatedAt` wins when two copies differ.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';

import { uuid } from '../rituals/lifecycle';
import { supabase } from '../supabase';
import { mergeEntries, type CraftEntry } from './merge';

export { mergeEntries, type CraftEntry };

type Row = { id: string; user_id: string; collection: string; data: unknown; deleted_at: string | null; created_at: string; updated_at: string };

const KEY = (collection: string) => `craft.${collection}`;
const cache = new Map<string, CraftEntry<unknown>[]>();
const listeners = new Map<string, Set<() => void>>();
let userId: string | null = null;
const pulled = new Set<string>();

function emit(collection: string) {
  for (const fn of listeners.get(collection) ?? []) fn();
}

async function load(collection: string): Promise<CraftEntry<unknown>[]> {
  const hit = cache.get(collection);
  if (hit) return hit;
  let list: CraftEntry<unknown>[] = [];
  try {
    const raw = await AsyncStorage.getItem(KEY(collection));
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) list = parsed.filter((e) => e && typeof e.id === 'string');
  } catch {
    list = [];
  }
  if (!cache.has(collection)) cache.set(collection, list);
  return cache.get(collection)!;
}

async function persist(collection: string, list: CraftEntry<unknown>[]) {
  cache.set(collection, list);
  emit(collection);
  try {
    await AsyncStorage.setItem(KEY(collection), JSON.stringify(list));
  } catch {
    // The copy in memory still shows; the next save tries again.
  }
}

// Postgres answers "…+00:00"; the phone writes "…Z". Compare like with like.
const iso = (at: string | null) => (at ? new Date(at).toISOString() : null);

const fromRow = (row: Row): CraftEntry<unknown> => ({
  id: row.id,
  createdAt: iso(row.created_at)!,
  updatedAt: iso(row.updated_at)!,
  deletedAt: iso(row.deleted_at),
  syncedTo: row.user_id,
  data: row.data,
});

async function push(collection: string, entry: CraftEntry<unknown>) {
  if (!userId) return;
  const account = userId;
  const { error } = await supabase.from('craft_entries').upsert(
    {
      id: entry.id,
      user_id: account,
      collection,
      data: entry.data ?? {},
      deleted_at: entry.deletedAt ?? null,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
    },
    { onConflict: 'id' },
  );
  if (error) return;
  const list = await load(collection);
  await persist(
    collection,
    list.map((e) => (e.id === entry.id && e.updatedAt === entry.updatedAt ? { ...e, syncedTo: account } : e)),
  );
}

/** Fetch this account's copy of a collection and send what the phone has that the server doesn't. */
export async function syncCollection(collection: string) {
  if (!userId) return;
  const account = userId;
  const { data, error } = await supabase.from('craft_entries').select('*').eq('user_id', account).eq('collection', collection);
  if (error || !data) return;
  const local = await load(collection);
  // Entries saved to another account stay on the phone but out of this one.
  const mine = local.filter((e) => !e.syncedTo || e.syncedTo === account);
  const merged = mergeEntries(mine, (data as Row[]).map(fromRow));
  const others = local.filter((e) => e.syncedTo && e.syncedTo !== account);
  await persist(collection, [...merged, ...others]);
  pulled.add(`${account}:${collection}`);
  const remote = new Map((data as Row[]).map((r) => [r.id, iso(r.updated_at)]));
  for (const e of merged) if (!e.syncedTo || remote.get(e.id) !== e.updatedAt) void push(collection, e);
}

/** Called by the session: which account the tools save to (null for a guest). */
export function setCraftAccount(next: string | null) {
  if (next === userId) return;
  userId = next;
  for (const collection of listeners.keys()) void syncCollection(collection);
}

export async function addEntry<T>(collection: string, data: T, at: Date = new Date()): Promise<CraftEntry<T>> {
  const now = at.toISOString();
  const entry: CraftEntry<T> = { id: uuid(), createdAt: now, updatedAt: now, data };
  const list = await load(collection);
  await persist(collection, [entry as CraftEntry<unknown>, ...list]);
  void push(collection, entry as CraftEntry<unknown>);
  return entry;
}

export async function updateEntry<T>(collection: string, id: string, data: T): Promise<void> {
  const list = await load(collection);
  const now = new Date().toISOString();
  let changed: CraftEntry<unknown> | null = null;
  const next = list.map((e) => (e.id === id ? (changed = { ...e, data, updatedAt: now, syncedTo: null }) : e));
  if (!changed) return;
  await persist(collection, next);
  void push(collection, changed);
}

export async function removeEntry(collection: string, id: string): Promise<void> {
  const list = await load(collection);
  const now = new Date().toISOString();
  let changed: CraftEntry<unknown> | null = null;
  const next = list.map((e) => (e.id === id ? (changed = { ...e, deletedAt: now, updatedAt: now, syncedTo: null }) : e));
  if (!changed) return;
  await persist(collection, next);
  void push(collection, changed);
}

/** A tool's entries, newest first, live. Deleted ones are left out. */
export function useCraft<T>(collection: string): { entries: CraftEntry<T>[]; ready: boolean } {
  const [list, setList] = useState<CraftEntry<unknown>[] | null>(cache.get(collection) ?? null);
  useEffect(() => {
    let alive = true;
    const update = () => alive && setList(cache.get(collection) ?? []);
    const set = listeners.get(collection) ?? new Set();
    set.add(update);
    listeners.set(collection, set);
    void load(collection).then(update);
    if (userId && !pulled.has(`${userId}:${collection}`)) void syncCollection(collection);
    return () => {
      alive = false;
      set.delete(update);
    };
  }, [collection]);
  const entries = useMemo(
    () => (list ?? []).filter((e) => !e.deletedAt && (!e.syncedTo || !userId || e.syncedTo === userId)) as CraftEntry<T>[],
    [list],
  );
  return { entries, ready: list !== null };
}

/** A collection's entries once, after a sync with the account when signed in (outside React). */
export async function listEntriesOnce<T>(collection: string): Promise<CraftEntry<T>[]> {
  if (userId) await syncCollection(collection);
  const list = await load(collection);
  return list.filter((e) => !e.deletedAt && (!e.syncedTo || !userId || e.syncedTo === userId)) as CraftEntry<T>[];
}

/** For tests: forget everything held in memory. */
export function _resetCraftCache() {
  cache.clear();
  pulled.clear();
  userId = null;
}
