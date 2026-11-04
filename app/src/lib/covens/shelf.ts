// The coven's shared shelf: the coven's own things (candles, chalice, oils,
// decks, books), kept like My Shelves (lib/shelves/model.ts ShelfItem, the same
// shapes and wording) with who holds each between gatherings and whether it
// needs cleansing. Rows live in coven_shelf_items
// (supabase/migrations/20261125000000_coven_shelf_rota_sits.sql). Members see
// and add; whoever added or holds a thing may change it; those who lead the
// coven's rites change or take off anything. Pure.

import { cleanItem, isLow, matchesNeed, newItem, type Needed, type ShelfEntry, type ShelfItem } from '../shelves/model.ts';

export type CovenShelfRow = {
  id: string;
  coven_id: string;
  item: unknown;
  name: string;
  holder_id: string | null;
  needs_cleansing: boolean;
  cleansed_on: string | null;
  added_by: string | null;
  created_at: string;
  updated_at?: string;
};

export type CovenShelfThing = {
  id: string;
  item: ShelfItem;
  holderId: string | null;
  needsCleansing: boolean;
  cleansedOn: string | null;
  addedBy: string | null;
  createdAt: string;
};

export const fromRow = (row: CovenShelfRow): CovenShelfThing => ({
  id: row.id,
  item: cleanItem({ ...(row.item && typeof row.item === 'object' ? row.item : {}), name: row.name || (row.item as { name?: string } | null)?.name }),
  holderId: row.holder_id,
  needsCleansing: !!row.needs_cleansing,
  cleansedOn: row.cleansed_on,
  addedBy: row.added_by,
  createdAt: row.created_at,
});

/** As My Shelves' entries, for its cabinet and sorting. */
export const asEntries = (things: CovenShelfThing[]): ShelfEntry[] => things.map((t) => ({ id: t.id, createdAt: t.createdAt, item: t.item }));

/** The row to save: the coven-only fields beside the thing itself (personal tending and uses left out). */
export function toRow(item: ShelfItem, extra: { holderId: string | null; needsCleansing: boolean; cleansedOn?: string | null }) {
  const clean = cleanItem(item);
  const kept: Partial<ShelfItem> = { ...clean };
  delete kept.tend;
  delete kept.countDown;
  delete kept.uses;
  return { item: kept, name: clean.name, holder_id: extra.holderId, needs_cleansing: extra.needsCleansing, cleansed_on: extra.cleansedOn ?? null };
}

/** A new thing for the coven, as My Shelves makes one. */
export const newCovenItem = (name: string, rest: Partial<ShelfItem> = {}) => newItem({ ...rest, name });

/** Whether this person may change the thing: who added it, who holds it, or a leader. */
export const canEditThing = (thing: Pick<CovenShelfThing, 'addedBy' | 'holderId'>, userId: string | null, leads: boolean) =>
  !!userId && (leads || thing.addedBy === userId || thing.holderId === userId);

/** Who may take it off the shelf: who added it, or a leader. */
export const canRemoveThing = (thing: Pick<CovenShelfThing, 'addedBy'>, userId: string | null, leads: boolean) => !!userId && (leads || thing.addedBy === userId);

export type ShelfFilter = 'all' | 'low' | 'cleansing' | 'mine';
export const SHELF_FILTERS: { value: ShelfFilter; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'low', label: 'Running low' },
  { value: 'cleansing', label: 'Needs cleansing' },
  { value: 'mine', label: 'I hold' },
];

export function filterThings(things: CovenShelfThing[], filter: ShelfFilter, userId: string | null, query = ''): CovenShelfThing[] {
  const q = query.trim().toLowerCase();
  return things
    .filter((t) => (filter === 'low' ? isLow(t.item) : filter === 'cleansing' ? t.needsCleansing : filter === 'mine' ? !!userId && t.holderId === userId : true))
    .filter((t) => !q || [t.item.name, t.item.where, t.item.notes].some((s) => s.toLowerCase().includes(q)))
    .sort((a, b) => a.item.name.localeCompare(b.item.name));
}

/** Counts for the shelf's heading and the coven's home. */
export function shelfCounts(things: CovenShelfThing[]) {
  return { total: things.length, low: things.filter((t) => isLow(t.item)).length, cleansing: things.filter((t) => t.needsCleansing).length };
}

/** "Held by Hazel · in the blue box", "In the coven’s store". */
export function heldLine(thing: Pick<CovenShelfThing, 'holderId' | 'item'>, nameOf: (id: string) => string): string {
  const who = thing.holderId ? `Held by ${nameOf(thing.holderId)}` : 'In the coven’s store';
  return thing.item.where ? `${who} · ${thing.item.where}` : who;
}

/**
 * For a ritual step's items: which the coven already has (and who holds it).
 * One thing can answer several; none left counts as not had.
 */
export function covenHas<T extends Needed>(needs: T[], things: CovenShelfThing[]): { need: T; thing: CovenShelfThing }[] {
  const out: { need: T; thing: CovenShelfThing }[] = [];
  for (const need of needs) {
    const thing = things.find((t) => matchesNeed(t.item, need) && !(t.item.qty.kind === 'count' && t.item.qty.n <= 0));
    if (thing) out.push({ need, thing });
  }
  return out;
}

/** "The coven has these: white candle (held by Hazel), chalice (in the coven’s store)". */
export function covenHasLine(found: { need: Needed; thing: CovenShelfThing }[], nameOf: (id: string) => string): string {
  if (!found.length) return '';
  const parts = found.map(({ thing }) => `${thing.item.name} (${thing.holderId ? `held by ${nameOf(thing.holderId)}` : 'in the coven’s store'})`);
  return `The coven has ${[...new Set(parts)].join(', ')}.`;
}
