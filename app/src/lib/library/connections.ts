// Living Library connections, as the website keeps them (js/library.js and
// "Connected To" in grimoire/js/app.js): `library_relations` rows between
// entity ids, plus the pairings and substitutions the website draws from
// each entry's Traditional and My Practice "Pairs With" / "Substitutions".
//
// Rows name website entity ids (living_library_entries.entity_id); the app's
// pages are LibraryEntry ids, so everything here is resolved through
// entryResolver first. Rows that name nothing the app knows are left out, as
// the website leaves out relations to entities it can't find.

import { formatName, normalizeName } from './model.ts';
import type { LibraryEntry } from './types.ts';

/** js/library.js LIBRARY_RELATIONS, in the order "Connected To" shows them. */
export const RELATION_TYPES = [
  'pairs_with',
  'substitutes',
  'substitute_for',
  'ingredient_in',
  'contains',
  'used_in',
  'associated_with',
  'offered_to',
  'ruled_by',
  'related_to',
] as const;
export type RelationType = (typeof RELATION_TYPES)[number];

export const RELATION_LABELS: Record<RelationType, string> = {
  pairs_with: 'Pairs With',
  substitutes: 'Substitutes',
  substitute_for: 'Substitute For',
  ingredient_in: 'Ingredient In',
  contains: 'Contains',
  used_in: 'Used In',
  associated_with: 'Associated With',
  offered_to: 'Offered To',
  ruled_by: 'Ruled By',
  related_to: 'Related To',
};

/** What the website's relationship manager offers (getRelationshipTypeOptions). */
export const MANAGER_RELATIONS: readonly RelationType[] = [
  'contains',
  'used_in',
  'pairs_with',
  'substitutes',
  'substitute_for',
  'associated_with',
  'offered_to',
  'ruled_by',
  'related_to',
];

export const relationLabel = (relation: string) =>
  RELATION_LABELS[relation as RelationType] ?? formatName(relation).replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

/** A `library_relations` row (signed in), or a guest relation read into the same shape. */
export type RelationRow = {
  id?: string;
  from_entity_id: string;
  relation: string;
  to_entity_id: string;
  metadata?: Record<string, unknown> | null;
};

export const relationKey = (row: Pick<RelationRow, 'from_entity_id' | 'relation' | 'to_entity_id'>) =>
  `${row.from_entity_id}|${row.relation}|${row.to_entity_id}`;

/**
 * Where a row came from, in its metadata (js/library.js LIBRARY_RELATION_SOURCES):
 * rows drawn from My Practice notes are replaced on each My Practice save;
 * rows added by hand in the relationship manager, or with no source, never are.
 */
export const RELATION_SOURCES = { myPractice: 'my-practice', manual: 'manual' } as const;

export const isPracticeRow = (row: Pick<RelationRow, 'metadata'>) => row.metadata?.source === RELATION_SOURCES.myPractice;

/** Relations from the website's guest Library (localStorage "saltAndSovereigntyLibrary".relations). */
export function guestRelationRows(stored: unknown): RelationRow[] {
  const relations = (stored as { relations?: unknown })?.relations;
  if (!Array.isArray(relations)) return [];
  return relations
    .filter((link): link is Record<string, unknown> => !!link && typeof link === 'object')
    .filter((link) => typeof link.from === 'string' && typeof link.to === 'string' && typeof link.relation === 'string')
    .map((link) => ({
      id: typeof link.id === 'string' ? link.id : undefined,
      from_entity_id: link.from as string,
      relation: link.relation as string,
      to_entity_id: link.to as string,
      metadata: link.metadata && typeof link.metadata === 'object' ? { ...(link.metadata as Record<string, unknown>) } : {},
    }));
}

/** Rows without exact duplicates (js/library.js dedupeRelations). */
export function uniqueRelations<T extends RelationRow>(rows: T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (!row.from_entity_id || !row.relation || !row.to_entity_id) return false;
    const key = relationKey(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export type EntryResolver = (value: string | null | undefined) => LibraryEntry | null;

const isNested = (entry: LibraryEntry) => (entry.id.split(':')[2] ?? '').includes('.');

/**
 * Finds the entry an id names: a living_library_entries entity id, a
 * Traditional reference ("traditional/herb/rosemary", which the website's
 * LivingConnections resolves too) or an app entry id.
 */
export function entryResolver(entries: LibraryEntry[]): EntryResolver {
  const byId = new Map<string, LibraryEntry>();
  for (const entry of entries) {
    byId.set(entry.id, entry);
    // Candle styles share their parent's reference, so they can't be named by it.
    if (entry.traditionalRef && !isNested(entry) && !byId.has(entry.traditionalRef)) byId.set(entry.traditionalRef, entry);
    for (const entityId of entry.practiceEntityIds) if (!byId.has(entityId)) byId.set(entityId, entry);
  }
  return (value) => {
    const id = String(value ?? '').trim();
    if (!id) return null;
    return byId.get(id) ?? byId.get(id.toLowerCase()) ?? null;
  };
}

/** The entity id the website knows an entry by, if it has a living_library_entries row. */
export const entityIdOf = (entry: LibraryEntry): string | null => entry.practiceSourceId ?? entry.practiceEntityIds[0] ?? null;

/**
 * The entry a pairing or substitution names (findBestTraditionalEntityMatch):
 * an exact match on its name, or a Traditional entry's key. Nothing fuzzy, so
 * "Rose" never lands on "Rose Quartz".
 */
export function nameMatcher(entries: LibraryEntry[]): (name: string) => LibraryEntry | null {
  const byName = new Map<string, LibraryEntry>();
  for (const entry of entries) {
    const name = normalizeName(entry.name);
    if (name && !byName.has(name)) byName.set(name, entry);
  }
  for (const entry of entries) {
    const key = entry.traditional && !isNested(entry) ? normalizeName(entry.id.split(':')[2] ?? '') : '';
    if (key && !byName.has(key)) byName.set(key, entry);
  }
  return (name) => byName.get(normalizeName(name)) ?? null;
}

/** "Rosemary, cinnamon" → ["Rosemary", "cinnamon"] (splitConnectionList). */
export function splitConnectionList(value: unknown): string[] {
  const items = Array.isArray(value) ? value : String(value ?? '').split(',');
  return items
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

/** The entries a layer's "Pairs With" and "Substitutions" name (not the entry itself). */
export function practiceTargets(
  layer: Record<string, unknown> | null | undefined,
  self: LibraryEntry | null,
  match: (name: string) => LibraryEntry | null,
): { pairs: LibraryEntry[]; substitutes: LibraryEntry[] } {
  const resolve = (value: unknown) => {
    const found = new Map<string, LibraryEntry>();
    for (const name of splitConnectionList(value)) {
      const target = match(name);
      if (target && target.id !== self?.id) found.set(target.id, target);
    }
    return [...found.values()];
  };
  return { pairs: resolve(layer?.PairsWith), substitutes: resolve(layer?.Substitutions) };
}

/**
 * The rows the website makes from a My Practice save (syncMyPracticeConnections):
 * a pairing goes both ways, and a substitution is "substitutes" one way and
 * "substitute_for" back.
 */
export function practiceRelationRows(fromId: string, pairIds: string[], substituteIds: string[]): RelationRow[] {
  const rows: RelationRow[] = [];
  const metadata = () => ({ source: RELATION_SOURCES.myPractice });
  for (const to of pairIds) {
    if (!to || to === fromId) continue;
    rows.push({ from_entity_id: fromId, relation: 'pairs_with', to_entity_id: to, metadata: metadata() });
    rows.push({ from_entity_id: to, relation: 'pairs_with', to_entity_id: fromId, metadata: metadata() });
  }
  for (const to of substituteIds) {
    if (!to || to === fromId) continue;
    rows.push({ from_entity_id: fromId, relation: 'substitutes', to_entity_id: to, metadata: metadata() });
    rows.push({ from_entity_id: to, relation: 'substitute_for', to_entity_id: fromId, metadata: metadata() });
  }
  return uniqueRelations(rows);
}

/**
 * What a My Practice save changes (syncMyPracticeConnections): `stale` are
 * the entry's own "pairs_with" / "substitutes" rows an earlier save generated
 * that its notes no longer name; `add` are the generated rows to upsert,
 * leaving out any that already exist from somewhere else (added by hand, or
 * with no source) so those keep their metadata and are never replaced later.
 */
export function practiceRelationPlan(
  entityId: string,
  generated: RelationRow[],
  existing: RelationRow[],
): { stale: RelationRow[]; add: RelationRow[] } {
  const wanted = new Set(generated.map(relationKey));
  const stale = uniqueRelations(
    existing.filter(
      (row) =>
        row.from_entity_id === entityId &&
        (row.relation === 'pairs_with' || row.relation === 'substitutes') &&
        isPracticeRow(row) &&
        !wanted.has(relationKey(row)),
    ),
  );
  const elsewhere = new Set(existing.filter((row) => !isPracticeRow(row)).map(relationKey));
  return { stale, add: uniqueRelations(generated).filter((row) => !elsewhere.has(relationKey(row))) };
}

/** An apothecary working "contains" each ingredient, which is an "ingredient_in" it (connectApothecaryIngredientsToLibraryEntity). */
export function ingredientRelationRows(itemId: string, ingredientIds: string[]): RelationRow[] {
  return uniqueRelations(
    ingredientIds
      .filter((id) => id && id !== itemId)
      .flatMap((id) => [
        { from_entity_id: itemId, relation: 'contains', to_entity_id: id, metadata: {} },
        { from_entity_id: id, relation: 'ingredient_in', to_entity_id: itemId, metadata: {} },
      ]),
  );
}

/** A connection between two pages of the app's Library. */
export type Link = { from: string; relation: string; to: string };

const derivedCache = new WeakMap<LibraryEntry[], Link[]>();

/**
 * The connections the website draws from Traditional and My Practice
 * "Pairs With" / "Substitutions" (importTraditionalLibrary and
 * syncMyPracticeConnections), for guests and signed-in people alike.
 */
export function derivedLinks(entries: LibraryEntry[]): Link[] {
  const cached = derivedCache.get(entries);
  if (cached) return cached;
  const match = nameMatcher(entries);
  const links: Link[] = [];
  for (const entry of entries) {
    for (const layer of [entry.traditional, entry.myPractice]) {
      if (!layer) continue;
      const { pairs, substitutes } = practiceTargets(layer as Record<string, unknown>, entry, match);
      for (const target of pairs) {
        links.push({ from: entry.id, relation: 'pairs_with', to: target.id });
        links.push({ from: target.id, relation: 'pairs_with', to: entry.id });
      }
      for (const target of substitutes) {
        links.push({ from: entry.id, relation: 'substitutes', to: target.id });
        links.push({ from: target.id, relation: 'substitute_for', to: entry.id });
      }
    }
  }
  derivedCache.set(entries, links);
  return links;
}

/** Stored rows as links between app pages; rows naming an unknown entity are left out. */
export function storedLinks(rows: RelationRow[], resolve: EntryResolver): Link[] {
  const links: Link[] = [];
  for (const row of rows) {
    const from = resolve(row.from_entity_id);
    const to = resolve(row.to_entity_id);
    if (!from || !to || from.id === to.id || !row.relation) continue;
    links.push({ from: from.id, relation: row.relation, to: to.id });
  }
  return links;
}

export type ConnectionGroup = { relation: RelationType; label: string; entries: LibraryEntry[] };

/**
 * "Connected To" for one entry (renderRelatedEntriesLayer): every relation
 * that touches it, grouped by relation type in the website's order, each
 * group's entries by name. As there, a relation is grouped under its own
 * type whichever end the entry is on, and unknown types are left out.
 */
export function connectionGroups(entry: LibraryEntry, entries: LibraryEntry[], rows: RelationRow[]): ConnectionGroup[] {
  const resolve = entryResolver(entries);
  const grouped = new Map<string, Map<string, LibraryEntry>>();
  for (const link of [...storedLinks(rows, resolve), ...derivedLinks(entries)]) {
    if (link.from !== entry.id && link.to !== entry.id) continue;
    const other = resolve(link.from === entry.id ? link.to : link.from);
    if (!other || other.id === entry.id) continue;
    const group = grouped.get(link.relation) ?? new Map<string, LibraryEntry>();
    group.set(other.id, other);
    grouped.set(link.relation, group);
  }
  return RELATION_TYPES.filter((relation) => grouped.has(relation)).map((relation) => ({
    relation,
    label: RELATION_LABELS[relation],
    entries: [...grouped.get(relation)!.values()].sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

/** One stored relation as the relationship manager lists it. */
export type StoredConnection = { row: RelationRow; other: LibraryEntry; outgoing: boolean; key: string };

/**
 * The entry's own stored relations (not the ones drawn from Traditional
 * notes), exact duplicates collapsed, sorted by relation then by the other
 * entry's name (openRelationshipManagerModal).
 */
export function storedConnections(entry: LibraryEntry, rows: RelationRow[], resolve: EntryResolver): StoredConnection[] {
  const out: StoredConnection[] = [];
  for (const row of uniqueRelations(rows)) {
    const from = resolve(row.from_entity_id);
    const to = resolve(row.to_entity_id);
    if (!from || !to) continue;
    const outgoing = from.id === entry.id;
    if (!outgoing && to.id !== entry.id) continue;
    const other = outgoing ? to : from;
    if (other.id === entry.id) continue;
    out.push({ row, other, outgoing, key: relationKey(row) });
  }
  return out.sort((a, b) => a.row.relation.localeCompare(b.row.relation) || a.other.name.localeCompare(b.other.name));
}

/** Whether the entry already has this relation with that entry, either way round (addLibraryRelationshipFromForm). */
export function hasConnection(
  entry: LibraryEntry,
  relation: string,
  target: LibraryEntry,
  rows: RelationRow[],
  resolve: EntryResolver,
  except?: string,
): boolean {
  return storedConnections(entry, rows, resolve).some(
    (connection) => connection.key !== except && connection.row.relation === relation && connection.other.id === target.id,
  );
}

/**
 * The row after an edit (updateLibraryRelationshipFromForm): the entry stays
 * on the end it was on; the relation and the other end change.
 */
export function editedRow(connection: StoredConnection, relation: string, targetEntityId: string): RelationRow {
  // Edited by hand, so a My Practice save no longer replaces it.
  const metadata = { ...(connection.row.metadata ?? {}), source: RELATION_SOURCES.manual };
  return connection.outgoing
    ? { ...connection.row, id: undefined, relation, to_entity_id: targetEntityId, metadata }
    : { ...connection.row, id: undefined, relation, from_entity_id: targetEntityId, metadata };
}
