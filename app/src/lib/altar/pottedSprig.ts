// A harvest set on the altar: a fresh sprig of the herb from the cabinet's
// herb, set beside the pot (pottedPlants.ts). Apart from pottedPlants.ts so
// the cabinet, which lists the Plants drawer, and this don't import each other.
// Pure, so it can be tested.

import { builtInCabinet, objectFromForm } from './cabinet.ts';
import { setAppState } from './livingState.ts';
import { kindOf, pottedOf } from './pottedPlants.ts';
import type { CabinetItem, SavedObject } from './types.ts';

/**
 * A fresh sprig of the harvested herb, from the cabinet's herb (its sprig),
 * set beside the pot. It goes over as any sprig offering does. Null when
 * there's no sprig picture for it.
 */
export function harvestSprig(plant: SavedObject, existing: SavedObject[], now: string, cabinet: CabinetItem[] = builtInCabinet): SavedObject | null {
  const kind = kindOf(plant);
  if (!kind?.herb) return null;
  const item = cabinet.find((i) => i.category === 'herbs' && i.forms.some((f) => f.herb === kind.herb && f.form === 'sprig' && !!f.image));
  const form = item?.forms.find((f) => f.form === 'sprig' && !!f.image);
  if (!item || !form) return null;
  const cx = Math.min(0.92, Math.max(0.08, (Number(plant.leftPercent) || 0.5) + 0.09));
  const cy = Math.min(0.92, Math.max(0.08, (Number(plant.topPercent) || 0.5) + 0.04));
  const sprig = objectFromForm(item, form, existing, now, {}, { cx, cy });
  const { name } = pottedOf(plant);
  return setAppState(sprig, { harvestedFrom: { id: String(plant.altarObjectId || ''), name: name || kind.name } }, now, false);
}
