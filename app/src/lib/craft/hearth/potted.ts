// The potted plants on your altars, for linking a land-journal note to them:
// every pot on every altar you haven't archived, by altar and object id, with
// its name as the altar shows it ("Margaret the pothos"). Pure, so the app and
// the website (js/core/hearth-altar.js) list them the same way.

import { activeAltars } from '../../altar/archive.ts';
import { isPottedPlant, plantTitle } from '../../altar/pottedPlants.ts';
import { documentFromAltar } from '../../altar/snapshot.ts';
import type { AltarData } from '../../altar/types.ts';
import type { PottedRef } from './land.ts';

export function pottedRefs(altars: AltarData[]): PottedRef[] {
  const out: PottedRef[] = [];
  for (const altar of activeAltars(altars)) {
    for (const object of documentFromAltar(altar).objects) {
      if (isPottedPlant(object)) out.push({ id: `${String((altar as { id?: string }).id ?? '')}:${String(object.altarObjectId || '')}`, name: plantTitle(object) });
    }
  }
  return out;
}
