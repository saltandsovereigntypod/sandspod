// What the tending reminders are about, read from the saved altars and the
// stones in My stones (craft collection `crystal.stones`): the altars, the
// potted plants and when each would like water, the offerings going over,
// the crystals with their care, and the candles (one burning now, or a
// working part-burned and waiting to be lit again). Something taken off its
// altar simply isn't here any more, so its reminders stop. Pure; the website
// reaches it through js/core/altar.js.

import { candleLife, isCandle, isLit, parseLivingState } from '../altar/livingState.ts';
import { offeringsDue, type OfferingDue } from '../altar/offerings.ts';
import { isPottedPlant, kindOf, pottedOf, thirstOf } from '../altar/pottedPlants.ts';
import { documentFromAltar } from '../altar/snapshot.ts';
import type { SavedAltar, SavedObject } from '../altar/types.ts';
import { findCare } from '../craft/crystal/care.ts';

export type AltarSource = { id: string; name: string };

export type PlantSource = {
  /** "<altar id>:<object id>", the key its own choices are saved under. */
  id: string;
  altarId: string;
  altarName: string;
  /** "Margaret the pothos", or "pothos". */
  who: string;
  named: boolean;
  waterEvery: number;
  /** YYYY-MM-DD, or '' before it's known. */
  lastWatered: string;
  /** When it would like water next (start of that day), or null. */
  dueAt: number | null;
};

export type CrystalSource = {
  /** "stone:<entry id>" for My stones, "<altar id>:<object id>" for a crystal on an altar. */
  id: string;
  name: string;
  /** Its care key (craft/crystal/care.ts), when known. */
  key: string | null;
  /** "My stones", or the altar's name. */
  where: string;
};

export type CandleSource = {
  id: string;
  altarId: string;
  altarName: string;
  name: string;
  lit: boolean;
  /** When the burn going on now runs out, or null. */
  burnoutAt: number | null;
  remainingMs: number;
  /** Part-burned, not spent and not burning now: a working to come back to. */
  working: boolean;
};

export type TendingSources = {
  altars: AltarSource[];
  plants: PlantSource[];
  offerings: OfferingDue[];
  crystals: CrystalSource[];
  candles: CandleSource[];
};

export const EMPTY_SOURCES: TendingSources = { altars: [], plants: [], offerings: [], crystals: [], candles: [] };

type StoneEntry = { id: string; deletedAt?: string | null; data?: { key?: string | null; name?: string } | null };

const DAY = 86_400_000;
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const unslug = (v: string) => v.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function crystalName(object: SavedObject): string {
  const care = findCare(str(object.crystal) || null, str(object.label) || null);
  return str(object.label) || care?.name || unslug(str(object.crystal)) || 'Crystal';
}

function candleName(object: SavedObject, life: { form: string }): string {
  const label = str(object.label);
  if (label) return label;
  const color = str(object.color);
  const form = life.form ? life.form.replace(/-/g, ' ') : 'candle';
  return [color, /candle/.test(form) ? form : `${form} candle`].filter(Boolean).join(' ');
}

/** Everything the tending reminders need, from these altars and stones, as things stand at `now`. */
export function tendingSources(altars: SavedAltar[], stones: StoneEntry[], now: Date, days = 14): TendingSources {
  const at = now.getTime();
  const out: TendingSources = { altars: [], plants: [], offerings: [], crystals: [], candles: [] };
  const docs = altars.map((altar) => ({ id: altar.id, name: String(altar.name || '').trim(), objects: documentFromAltar(altar).objects }));
  for (const altar of docs) {
    out.altars.push({ id: altar.id, name: altar.name });
    for (const object of altar.objects) {
      const objectId = String(object.altarObjectId || '');
      const id = `${altar.id}:${objectId}`;
      if (isPottedPlant(object)) {
        const potted = pottedOf(object);
        const kind = kindOf(object)!.name.toLowerCase();
        out.plants.push({
          id,
          altarId: altar.id,
          altarName: altar.name,
          who: potted.name ? `${potted.name} the ${kind}` : kind,
          named: !!potted.name,
          waterEvery: potted.waterEvery,
          lastWatered: potted.lastWatered,
          dueAt: thirstOf(object, at).dueAt,
        });
      } else if (object.type === 'crystal') {
        const care = findCare(str(object.crystal) || null, str(object.label) || null);
        out.crystals.push({ id, name: crystalName(object), key: care?.key ?? null, where: altar.name });
      } else if (isCandle(object)) {
        const life = candleLife(object, at);
        if (life.spent) continue;
        const lit = isLit(object);
        const burned = life.burnedMs > 0 || !!parseLivingState(object)?.candle?.firstLitAt;
        const working = !lit && burned && life.remainingMs > 0 && Number.isFinite(life.remainingMs);
        if (!lit && !working) continue;
        out.candles.push({
          id,
          altarId: altar.id,
          altarName: altar.name,
          name: candleName(object, life),
          lit,
          burnoutAt: life.burnoutAt,
          remainingMs: life.remainingMs,
          working,
        });
      }
    }
  }
  out.offerings = offeringsDue(docs, at, at + days * DAY);
  for (const stone of stones) {
    if (!stone || stone.deletedAt) continue;
    const name = str(stone.data?.name) || 'Unnamed stone';
    const care = findCare(stone.data?.key ?? null, name);
    out.crystals.push({ id: `stone:${stone.id}`, name, key: care?.key ?? null, where: 'My stones' });
  }
  return out;
}
