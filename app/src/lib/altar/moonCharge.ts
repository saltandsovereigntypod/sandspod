// Moon charging: a crystal (or a bowl of water) that sat on the altar through
// a Full Moon, and if you like a New Moon, is charged under it. When the app
// next opens or settles the altar, each such object gets one entry in its
// crystal charging history per lunation, in the same shape as a charge you
// record yourself (devotion.ts careForCrystal), so the website lists it too.
// Pure, so it can be tested.

import { crystalIntention } from './devotion.ts';
import { placedAtOf, readLivingState, writeLivingState } from './livingState.ts';
import { julianDayToDate, lunationNear, phaseJde, signAtSyzygy, type ZodiacSign } from '../moon.ts';
import { offeringOf } from './offerings.ts';
import type { SavedObject } from './types.ts';
import { newId } from './uid.ts';

type Rec = Record<string, unknown>;
const list = (value: unknown): Rec[] => (Array.isArray(value) ? (value as Rec[]) : []);

export type MoonKind = 'full' | 'new';

/** At most this many past moons are caught up at once (an altar left unopened for months). */
export const MOON_CATCH_UP = 3;

/** Full (or new) moons strictly after `from` and at or before `to`, oldest first. */
export function moonsBetween(from: Date, to: Date, kind: MoonKind): Date[] {
  const out: Date[] = [];
  const offset = kind === 'full' ? 0.5 : 0;
  for (let k = lunationNear(from) - 1; k <= lunationNear(to) + 1; k++) {
    const date = julianDayToDate(phaseJde(k + offset, kind));
    if (date.getTime() > from.getTime() && date.getTime() <= to.getTime()) out.push(date);
  }
  return out;
}

/** "full:2026-10-26": one lunation's key, by the UTC day of the moon. */
export const lunationKey = (kind: MoonKind, date: Date) => `${kind}:${date.toISOString().slice(0, 10)}`;

/** Things a moon charges: crystals, and water set out in a bowl or chalice (moon water). */
export function chargesUnderMoon(object: SavedObject): boolean {
  if (object.type === 'crystal') return true;
  return offeringOf(object)?.kind === 'water';
}

export const moonChargeName = (kind: MoonKind, sign: ZodiacSign) => `${kind === 'full' ? 'Full' : 'New'} Moon in ${sign}`;

/**
 * Record the moons this object sat through since it came to the altar (or
 * since its last moon charge), once per lunation. Returns the object
 * unchanged when there's nothing new.
 */
export function chargeUnderMoons(object: SavedObject, now: string, options: { newMoon?: boolean } = {}): SavedObject {
  if (!chargesUnderMoon(object)) return object;
  const placed = placedAtOf(object);
  const at = Date.parse(now);
  if (!Number.isFinite(placed) || !Number.isFinite(at) || at <= placed) return object;
  const state = readLivingState(object, now);
  const crystal = { cleansingHistory: [], chargingHistory: [], ...(state.crystal as Rec) } as Rec;
  const history = list(crystal.chargingHistory);
  const seen = new Set(history.map((r) => String(r.lunation || '')).filter(Boolean));
  const kinds: MoonKind[] = options.newMoon ? ['full', 'new'] : ['full'];
  const added: Rec[] = [];
  const intention = crystalIntention(object, now);
  const water = object.type !== 'crystal';
  for (const kind of kinds) {
    const moons = moonsBetween(new Date(placed), new Date(at), kind).slice(-MOON_CATCH_UP);
    for (const date of moons) {
      const key = lunationKey(kind, date);
      if (seen.has(key)) continue;
      const name = moonChargeName(kind, signAtSyzygy(date, kind));
      added.push({
        id: newId(),
        occurredAt: date.toISOString(),
        purpose: 'seasonal-or-lunar-work',
        methods: ['moonlight', 'altar-placement'],
        supports: [],
        intentionHandling: intention ? 'continue-with-existing-intentions' : 'general-energetic-charge',
        intention,
        notes: water ? `Moon water: charged under the ${name}, on the altar.` : `Charged under the ${name}, on the altar.`,
        source: 'moon',
        lunation: key,
        moon: name,
      });
    }
  }
  if (!added.length) return object;
  const all = [...history, ...added].sort((a, b) => String(a.occurredAt || '').localeCompare(String(b.occurredAt || '')));
  const latest = added.map((r) => String(r.occurredAt)).sort().pop()!;
  if (!crystal.lastChargedAt || String(crystal.lastChargedAt) < latest) crystal.lastChargedAt = latest;
  crystal.chargingHistory = all;
  return writeLivingState(object, { ...state, crystal }, now);
}

/** The moon charges in an object's history, newest first. */
export function moonChargesOf(object: SavedObject): { at: string; moon: string }[] {
  const crystal = (readLivingState(object, '').crystal ?? {}) as Rec;
  return list(crystal.chargingHistory)
    .filter((r) => r.source === 'moon')
    .map((r) => ({ at: String(r.occurredAt || ''), moon: String(r.moon || '') }))
    .sort((a, b) => b.at.localeCompare(a.at));
}
