// My stones live on My Shelves now: a stone is a thing on the Crystals shelf,
// with its care key, form, care log and intentions kept on the shelf item
// (item.stone). The old `crystal.stones` collection is read once and folded
// in (stonesIntoShelves: idempotent, nothing deleted); a stone that came from
// there keeps its old id (stone.stoneId), so altar objects and grids linked
// to it still find it. To tend reminds you to cleanse it (the shelf's own
// full-moon rhythm). Pure.

import { normaliseStone, STONE_FORMS, type Stone } from '../craft/crystal/stones.ts';
import { cleanItem, newItem, type ShelfEntry, type ShelfItem } from './model.ts';

export { cleanShelfStone, type ShelfStone } from './model.ts';

export type StoneEntry = { id: string; createdAt: string; data: Stone; shelfId: string };

/** A crystal on the shelves as a stone (the shape the crystal screens use). */
export function stoneOfShelf(entry: ShelfEntry): StoneEntry {
  const it = entry.item;
  const st = it.stone;
  return {
    id: st?.stoneId || entry.id,
    shelfId: entry.id,
    createdAt: entry.createdAt,
    data: normaliseStone({ key: st?.key ?? null, name: it.name, form: st?.form ?? 'other', source: it.sourceText, acquired: it.acquired, notes: it.notes, intentions: st?.intentions ?? [], care: st?.care ?? [] }),
  };
}

/** Every crystal on the shelves, as your stones. */
export const myStones = (entries: ShelfEntry[]): StoneEntry[] => entries.filter((e) => e.item.shelf === 'crystals').map(stoneOfShelf);

/** The shelf thing a stone id names (its old crystal.stones id, or its own shelf id). */
export const shelfIdOfStone = (entries: ShelfEntry[], id: string) => entries.find((e) => e.id === id || (e.item.stone?.stoneId && e.item.stone.stoneId === id))?.id ?? null;

/** A stone written onto a shelf item (new, or the one it already is). */
export function shelfWithStone(stone: Stone, stoneId: string, existing?: ShelfItem | null, picture?: { cabinetKey: string; image: string } | null): ShelfItem {
  const s = normaliseStone(stone);
  const base = existing ?? newItem({ name: s.name, shelf: 'crystals', ...(picture ?? {}) });
  return cleanItem({
    ...base,
    name: s.name,
    shelf: 'crystals',
    sourceText: s.source || base.sourceText,
    acquired: s.acquired || base.acquired,
    notes: s.notes || base.notes,
    stone: { stoneId: existing?.stone?.stoneId || stoneId, key: s.key ?? null, form: s.form, intentions: s.intentions, care: s.care },
  });
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Migration on read: each stone in crystal.stones that isn't on the shelves
 * yet. A crystal of the same name already on the shelves (and not yet a
 * stone) takes its care log and intentions; otherwise a new crystal is added.
 * Run again, it finds nothing to do.
 */
export function stonesIntoShelves(
  stones: { id: string; data: unknown; deletedAt?: string | null }[],
  entries: ShelfEntry[],
  picture: (stone: Stone) => { cabinetKey: string; image: string } | null = () => null,
): { add: ShelfItem[]; update: { id: string; item: ShelfItem }[] } {
  const add: ShelfItem[] = [];
  const update: { id: string; item: ShelfItem }[] = [];
  const claimed = new Set<string>();
  for (const s of stones) {
    if (!s || s.deletedAt) continue;
    if (entries.some((e) => e.item.stone?.stoneId === s.id)) continue;
    const stone = normaliseStone(s.data as Partial<Stone>);
    const match = entries.find((e) => e.item.shelf === 'crystals' && !e.item.stone?.stoneId && !claimed.has(e.id) && same(e.item.name, stone.name));
    if (match) {
      claimed.add(match.id);
      const had = match.item.stone;
      const merged = { ...stone, care: [...(had?.care ?? []), ...stone.care], intentions: [...new Set([...(had?.intentions ?? []), ...stone.intentions])] };
      update.push({ id: match.id, item: shelfWithStone(merged, s.id, match.item) });
    } else add.push(shelfWithStone(stone, s.id, null, picture(stone)));
  }
  return { add, update };
}

export { STONE_FORMS };
