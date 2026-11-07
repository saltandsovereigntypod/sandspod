// A harvest you keep (dried, jarred) goes onto My Shelves, the one stock list:
// a thing on the Herbs shelf, foraged, got on the day it was stored, with the
// harvest's amount and note. The harvest names it (harvest.shelfId), so it is
// added once. Older kept harvests are put on the shelves the same way, once,
// on read. Pure.

import type { Harvest } from '../craft/hearth/forage.ts';
import { newItem, type ShelfItem } from './model.ts';

export function shelfFromHarvest(h: Harvest): ShelfItem {
  const part = h.part.trim();
  return newItem({
    name: part && !h.name.toLowerCase().includes(part.toLowerCase()) ? `${h.name} (${part.toLowerCase()})` : h.name,
    shelf: 'herbs',
    source: 'foraged',
    sourceText: 'From my harvest log',
    acquired: h.storedOn || h.on,
    notes: [h.amount.trim() ? `Gathered: ${h.amount.trim()}` : '', h.note.trim()].filter(Boolean).join('\n'),
    qty: { kind: 'level', level: 'full' },
    ...(h.herb ? { ref: `traditional/herb/${h.herb}` } : {}),
  });
}

/** Kept harvests not yet on the shelves. */
export const harvestsToShelve = <T extends { id: string; data: Harvest }>(list: T[]) => list.filter((h) => h.data.kept && !h.data.shelfId);
