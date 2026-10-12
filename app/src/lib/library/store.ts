// The Library everyone in the app shares. Traditional entries are built in,
// so the Library works offline and for guests. Signed-in people also get
// their My Practice notes from `living_library_entries` (cached on the
// device); guests get the website-format guest Library if one was restored.
// Connections between entries come along: `library_relations` signed in, the
// guest Library's own relations otherwise (lib/library/connections.ts).
//
// No provider needed: any screen can call useLibrary().

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useSyncExternalStore } from 'react';

import { newId } from '../altar/uid';
import { useSession } from '../session';
import { supabase } from '../supabase';
import { hiddenTraditions } from '../holidays';
import { useMySettings } from '../settings/store';
import { trackSave } from '../sync/store';
import {
  entityIdOf,
  entryResolver,
  guestRelationRows,
  nameMatcher,
  practiceRelationPlan,
  practiceRelationRows,
  practiceTargets,
  RELATION_SOURCES,
  relationKey,
  uniqueRelations,
  type RelationRow,
} from './connections';
import { buildLibrary, guestPracticeRows, traditionalEntries } from './model';
import { mergePractice, newPracticeRow, type PracticeInput } from './practiceModel';
import { hideTraditions } from './traditions';
import type { LibraryEntry, PracticeRow } from './types';

type Status = 'ready' | 'loading' | 'offline';
type State = { owner: string | null; entries: LibraryEntry[]; relations: RelationRow[]; status: Status; fetchedAt: string | null };

const GUEST_LIBRARY_KEY = 'saltAndSovereigntyLibrary';
const cacheKey = (userId: string) => `library.practice.${userId}`;
const relationsCacheKey = (userId: string) => `library.relations.${userId}`;

let state: State = { owner: null, entries: traditionalEntries(), relations: [], status: 'ready', fetchedAt: null };
let loadingFor: string | null | undefined;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

async function fetchPractice(userId: string): Promise<PracticeRow[]> {
  const { data, error } = await supabase
    .from('living_library_entries')
    .select('entity_id,name,type,image,my_practice,community,layout,updated_at')
    .eq('user_id', userId)
    // Newest first, so a page shows the My Practice saved most recently.
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PracticeRow[];
}

async function fetchRelations(userId: string): Promise<RelationRow[]> {
  const { data, error } = await supabase
    .from('library_relations')
    .select('from_entity_id,relation,to_entity_id,metadata')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return uniqueRelations((data ?? []) as RelationRow[]);
}

async function load(userId: string | null, force = false) {
  if (!force && loadingFor === userId && state.owner === userId) return;
  loadingFor = userId;
  if (state.owner !== userId) set({ owner: userId, entries: traditionalEntries(), relations: [], fetchedAt: null });

  if (!userId) {
    try {
      const raw = await AsyncStorage.getItem(GUEST_LIBRARY_KEY);
      const stored = raw ? JSON.parse(raw) : null;
      const rows = stored ? guestPracticeRows(stored) : [];
      if (state.owner === null) set({ entries: buildLibrary(rows), relations: uniqueRelations(guestRelationRows(stored)), status: 'ready' });
    } catch {
      if (state.owner === null) set({ status: 'ready' });
    }
    return;
  }

  set({ status: 'loading' });
  try {
    const cached = await AsyncStorage.getItem(cacheKey(userId));
    if (cached && state.owner === userId) set({ entries: buildLibrary(JSON.parse(cached) as PracticeRow[]) });
    const cachedRelations = await AsyncStorage.getItem(relationsCacheKey(userId));
    if (cachedRelations && state.owner === userId) set({ relations: JSON.parse(cachedRelations) as RelationRow[] });
  } catch {
    // No saved copy yet.
  }
  try {
    // Connections are extra: if they can't be read, the entries still load.
    const [rows, relations] = await Promise.all([fetchPractice(userId), fetchRelations(userId).catch(() => null)]);
    if (state.owner !== userId) return;
    set({ entries: buildLibrary(rows), relations: relations ?? state.relations, status: 'ready', fetchedAt: new Date().toISOString() });
    AsyncStorage.setItem(cacheKey(userId), JSON.stringify(rows)).catch(() => {});
    if (relations) AsyncStorage.setItem(relationsCacheKey(userId), JSON.stringify(relations)).catch(() => {});
  } catch {
    if (state.owner === userId) set({ status: 'offline' });
  }
}

/** Read the Library again, e.g. after guest entries moved into the account. */
export function reloadLibrary(userId: string | null): Promise<void> {
  return load(userId, true);
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

  const { settings } = useMySettings();
  // A hidden tradition (Settings → Calendar → Hide) is gone from the whole Library, on every screen.
  const hiddenKey = hiddenTraditions(settings as Record<string, unknown> | null).join(',');
  const loaded = snapshot.owner === userId ? snapshot.entries : null;
  const entries = useMemo(
    () => hideTraditions(loaded ?? traditionalEntries(), hiddenKey ? hiddenKey.split(',') : []),
    [loaded, hiddenKey],
  );
  return {
    entries,
    relations: snapshot.owner === userId ? snapshot.relations : [],
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
export function savePractice(args: Parameters<typeof savePracticeNow>[0]): Promise<string> {
  return trackSave(args.userId, () => savePracticeNow(args));
}

async function savePracticeNow(args: {
  userId: string;
  entry: LibraryEntry | null;
  type: string;
  name: string;
  input: PracticeInput;
}): Promise<string> {
  const { userId, entry, input } = args;
  const now = new Date().toISOString();
  const existingId = entry?.practiceSourceId ?? entry?.practiceEntityIds[0] ?? null;
  const myPractice = mergePractice(entry && existingId ? entry.myPractice : null, input);
  let entityId: string;

  if (entry && existingId) {
    entityId = existingId;
    const { error } = await supabase
      .from('living_library_entries')
      .update({ my_practice: myPractice, updated_at: now })
      .eq('user_id', userId)
      .eq('entity_id', existingId);
    if (error) throw new Error(error.message);
  } else {
    entityId = newId();
    const row = newPracticeRow({
      userId,
      entityId,
      name: entry?.name ?? args.name,
      type: entry?.type ?? args.type,
      myPractice,
    });
    const { error } = await supabase.from('living_library_entries').insert(row);
    if (error) throw new Error(error.message);
  }
  await load(userId, true);
  await syncPracticeRelations(userId, entityId, myPractice);
  if (!entry) {
    // A custom name that matches a Traditional entry joins that entry's page.
    const joined = state.entries.find((candidate) => candidate.practiceEntityIds.includes(entityId));
    return joined?.id ?? `practice:${entityId}`;
  }
  return entry.id;
}

/**
 * Like the website's syncMyPracticeConnections after a My Practice save: the
 * "pairs_with" and "substitutes" rows an earlier save generated for the entry
 * (metadata.source "my-practice") are replaced by the ones its Pairs With and
 * Substitutions name, each with its reverse. Rows added by hand in the
 * relationship manager are left alone. A connection that can't be saved
 * doesn't undo the save, as on the website.
 */
async function syncPracticeRelations(userId: string, entityId: string, myPractice: Record<string, unknown>) {
  try {
    const self = state.entries.find((candidate) => candidate.practiceEntityIds.includes(entityId)) ?? null;
    const { pairs, substitutes } = practiceTargets(myPractice, self, nameMatcher(state.entries));
    const ids = await ensureEntityIds(userId, [...pairs, ...substitutes]);
    const idsOf = (list: LibraryEntry[]) => list.map((target) => ids.get(target.id) ?? '').filter(Boolean);
    const existing = await fetchRelations(userId);
    const { stale, add } = practiceRelationPlan(entityId, practiceRelationRows(entityId, idsOf(pairs), idsOf(substitutes)), existing);
    for (const relation of new Set(stale.map((row) => row.relation))) {
      const { error } = await supabase
        .from('library_relations')
        .delete()
        .eq('user_id', userId)
        .eq('from_entity_id', entityId)
        .eq('relation', relation)
        .in('to_entity_id', stale.filter((row) => row.relation === relation).map((row) => row.to_entity_id));
      if (error) throw new Error(error.message);
    }
    await connectRelations(userId, add, false);
  } catch (e) {
    console.warn('Living Library connections were not saved', e);
  }
  await load(userId, true);
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

/**
 * Create or update a Library entry made alongside something else (a custom
 * cabinet item, an apothecary working): signed in it's a
 * `living_library_entries` row; for guests it goes into the website-format
 * guest Library on the device. Returns the entity id.
 */
export function putLibraryEntry(args: Parameters<typeof putLibraryEntryNow>[0]): Promise<string> {
  return trackSave(args.userId, () => putLibraryEntryNow(args));
}

async function putLibraryEntryNow(args: {
  userId: string | null;
  entityId?: string | null;
  name: string;
  type: string;
  /** The new My Practice, or a function of the entry's current one to build on it (as the website does). */
  myPractice: Record<string, unknown> | ((existing: Record<string, unknown> | null) => Record<string, unknown>);
}): Promise<string> {
  const entityId = args.entityId || newId();
  const now = new Date().toISOString();
  const build = (existing: unknown) =>
    typeof args.myPractice === 'function'
      ? args.myPractice(existing && typeof existing === 'object' ? (existing as Record<string, unknown>) : null)
      : args.myPractice;
  if (args.userId) {
    let existing: unknown = null;
    if (args.entityId && typeof args.myPractice === 'function') {
      const current = await supabase
        .from('living_library_entries')
        .select('my_practice')
        .eq('user_id', args.userId)
        .eq('entity_id', entityId)
        .maybeSingle();
      if (current.error) throw new Error(current.error.message);
      existing = current.data?.my_practice ?? null;
    }
    const myPractice = build(existing);
    const updated = await supabase
      .from('living_library_entries')
      .update({ name: args.name.trim() || 'Untitled', my_practice: myPractice, updated_at: now })
      .eq('user_id', args.userId)
      .eq('entity_id', entityId)
      .select('entity_id');
    if (updated.error) throw new Error(updated.error.message);
    if (!updated.data?.length) {
      const row = newPracticeRow({ userId: args.userId, entityId, name: args.name, type: args.type, myPractice });
      const { error } = await supabase.from('living_library_entries').insert(row);
      if (error) throw new Error(error.message);
    }
  } else {
    const raw = await AsyncStorage.getItem(GUEST_LIBRARY_KEY);
    let stored: { entities?: Record<string, Record<string, unknown>> } & Record<string, unknown> = {};
    try {
      stored = raw ? JSON.parse(raw) : {};
    } catch {
      stored = {};
    }
    const entities = { ...(stored.entities ?? {}) };
    const previous = entities[entityId] ?? {};
    entities[entityId] = {
      ...previous,
      id: entityId,
      name: args.name.trim() || 'Untitled',
      type: args.type,
      myPractice: build(previous.myPractice),
      createdAt: previous.createdAt ?? now,
      updatedAt: now,
    };
    await AsyncStorage.setItem(GUEST_LIBRARY_KEY, JSON.stringify({ ...stored, entities }));
  }
  await load(args.userId, true);
  return entityId;
}

/** Remove a Library entry made alongside something that's been deleted. */
export async function removeLibraryEntry(userId: string | null, entityId: string): Promise<void> {
  if (!entityId) return;
  if (userId) {
    await supabase.from('living_library_entries').delete().eq('user_id', userId).eq('entity_id', entityId);
  } else {
    try {
      const raw = await AsyncStorage.getItem(GUEST_LIBRARY_KEY);
      const stored = raw ? JSON.parse(raw) : {};
      if (stored?.entities?.[entityId]) {
        delete stored.entities[entityId];
        await AsyncStorage.setItem(GUEST_LIBRARY_KEY, JSON.stringify(stored));
      }
    } catch {
      // Nothing to remove.
    }
  }
  await load(userId, true);
}

// ---------------------------------------------------------------- connections

type GuestLibrary = {
  entities?: Record<string, Record<string, unknown>>;
  relations?: { id?: string; from: string; relation: string; to: string; metadata?: Record<string, unknown> }[];
} & Record<string, unknown>;

async function readGuestLibrary(): Promise<GuestLibrary> {
  try {
    const raw = await AsyncStorage.getItem(GUEST_LIBRARY_KEY);
    const stored = raw ? JSON.parse(raw) : {};
    return stored && typeof stored === 'object' ? stored : {};
  } catch {
    return {};
  }
}

const traditionalReference = (entry: LibraryEntry) =>
  entry.traditionalRef && !(entry.id.split(':')[2] ?? '').includes('.') ? entry.traditionalRef : null;

/**
 * The entity id behind each entry, making a plain living_library_entries row
 * (or, for guests, a guest Library entity) for any that has none yet, as the
 * website saves an entity before connecting it. Returns entry id → entity id.
 */
export async function ensureEntityIds(userId: string | null, entries: LibraryEntry[]): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  const missing: LibraryEntry[] = [];
  for (const entry of entries) {
    if (ids.has(entry.id)) continue;
    const existing = entityIdOf(entry);
    ids.set(entry.id, existing ?? newId());
    if (!existing) missing.push(entry);
  }
  if (!missing.length) return ids;
  if (userId) {
    const rows = missing.map((entry) =>
      newPracticeRow({ userId, entityId: ids.get(entry.id)!, name: entry.name, type: entry.type, myPractice: {} }),
    );
    const { error } = await supabase.from('living_library_entries').insert(rows);
    if (error) throw new Error(error.message);
  } else {
    const stored = await readGuestLibrary();
    const entities = { ...(stored.entities ?? {}) };
    const now = new Date().toISOString();
    for (const entry of missing) {
      const id = ids.get(entry.id)!;
      const reference = traditionalReference(entry);
      // The website's createEntity shape.
      entities[id] = {
        id,
        type: entry.type,
        name: entry.name,
        aliases: [],
        image: '',
        traditional: {},
        myPractice: {},
        community: {},
        metadata: reference ? { traditionalReference: reference } : {},
        createdAt: now,
        updatedAt: now,
      };
    }
    await AsyncStorage.setItem(GUEST_LIBRARY_KEY, JSON.stringify({ ...stored, entities }));
  }
  return ids;
}

const guestKey = (link: { from: string; relation: string; to: string }) => `${link.from}|${link.relation}|${link.to}`;

/** Adds connections (Library.connect): `library_relations` upserts signed in, the guest Library's relations otherwise. */
export async function connectRelations(userId: string | null, rows: RelationRow[], reload = true): Promise<void> {
  const unique = uniqueRelations(rows);
  if (unique.length && userId) {
    const now = new Date().toISOString();
    const { error } = await supabase.from('library_relations').upsert(
      unique.map((row) => ({
        user_id: userId,
        from_entity_id: row.from_entity_id,
        relation: row.relation,
        to_entity_id: row.to_entity_id,
        metadata: row.metadata ?? {},
        updated_at: now,
      })),
      { onConflict: 'user_id,from_entity_id,relation,to_entity_id' },
    );
    if (error) throw new Error(error.message);
  } else if (unique.length) {
    const stored = await readGuestLibrary();
    const relations = Array.isArray(stored.relations) ? [...stored.relations] : [];
    const have = new Set(relations.map(guestKey));
    for (const row of unique) {
      if (have.has(relationKey(row))) continue;
      // The website's connectUnique shape: metadata only when there is some.
      const metadata = row.metadata && Object.keys(row.metadata).length ? { metadata: { ...row.metadata } } : {};
      relations.push({ id: newId(), from: row.from_entity_id, relation: row.relation, to: row.to_entity_id, ...metadata });
    }
    await AsyncStorage.setItem(GUEST_LIBRARY_KEY, JSON.stringify({ ...stored, relations }));
  }
  if (reload) await load(userId, true);
}

/** Removes one connection (Library.disconnect). */
export async function disconnectRelation(userId: string | null, row: RelationRow, reload = true): Promise<void> {
  if (userId) {
    const { error } = await supabase
      .from('library_relations')
      .delete()
      .eq('user_id', userId)
      .eq('from_entity_id', row.from_entity_id)
      .eq('relation', row.relation)
      .eq('to_entity_id', row.to_entity_id);
    if (error) throw new Error(error.message);
  } else {
    const stored = await readGuestLibrary();
    const relations = (Array.isArray(stored.relations) ? stored.relations : []).filter((link) => guestKey(link) !== relationKey(row));
    await AsyncStorage.setItem(GUEST_LIBRARY_KEY, JSON.stringify({ ...stored, relations }));
  }
  if (reload) await load(userId, true);
}

/** The relationship manager's Add: the entry is the "from" end (addLibraryRelationshipFromForm). */
export async function addRelation(userId: string | null, entry: LibraryEntry, relation: string, target: LibraryEntry): Promise<void> {
  const ids = await ensureEntityIds(userId, [entry, target]);
  await connectRelations(userId, [
    { from_entity_id: ids.get(entry.id)!, relation, to_entity_id: ids.get(target.id)!, metadata: { source: RELATION_SOURCES.manual } },
  ]);
}

/**
 * The relationship manager's Save: the old row goes and the edited one takes
 * its place (updateLivingLibraryRelationInSupabase). `edit` builds the new row
 * from the chosen entry's entity id.
 */
export async function replaceRelation(
  userId: string | null,
  before: RelationRow,
  target: LibraryEntry,
  edit: (targetEntityId: string) => RelationRow,
): Promise<void> {
  const ids = await ensureEntityIds(userId, [target]);
  await disconnectRelation(userId, before, false);
  await connectRelations(userId, [edit(ids.get(target.id)!)]);
}

/**
 * The entity ids for an apothecary working's ingredients
 * (enrichApothecaryIngredientsForLibrary): an ingredient keeps the entity it
 * names; otherwise it's matched to the Library entry of its type and name,
 * and one the Library doesn't know gets an entry of its own.
 */
export async function ingredientEntityIds(
  userId: string | null,
  ingredients: { entityId?: string; libraryName: string; libraryType: string }[],
): Promise<string[]> {
  await load(userId);
  const entries = state.owner === userId ? state.entries : traditionalEntries();
  const resolve = entryResolver(entries);
  const custom = new Map<string, LibraryEntry>();
  const chosen = ingredients.map((ingredient): LibraryEntry | string | null => {
    const given = ingredient.entityId?.trim() ?? '';
    const known = given ? resolve(given) : null;
    if (known) return known.practiceEntityIds.includes(given) ? given : known;
    if (given) return given;
    const type = ingredient.libraryType || 'note';
    const name = ingredient.libraryName.trim();
    const match = nameMatcher(entries.filter((entry) => entry.type === type))(name);
    if (match || !name) return match;
    const key = `${type}|${name.toLowerCase()}`;
    const entry: LibraryEntry = custom.get(key) ?? {
      id: `new:${key}`,
      name,
      type,
      category: '',
      traditionalRef: null,
      traditional: null,
      myPractice: null,
      community: null,
      image: null,
      tags: [],
      practiceEntityIds: [],
    };
    custom.set(key, entry);
    return entry;
  });
  const needed = chosen.filter((item): item is LibraryEntry => !!item && typeof item !== 'string');
  const ids = needed.length ? await ensureEntityIds(userId, needed) : new Map<string, string>();
  return chosen.map((item) => (!item ? '' : typeof item === 'string' ? item : ids.get(item.id) ?? ''));
}
