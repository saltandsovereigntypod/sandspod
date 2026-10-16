// Attunement: a thing you work with often becomes yours. Counted from what its
// living state remembers: candle burns, cleansings and charges (not the ones
// the moon did on its own), offerings, rituals, incense burns, a jar's
// renewals, a sachet's feedings, dressings, and the app's own log of charges,
// cleansings and rituals. Past a threshold the panel gives it a quiet mark.
// Pure.

import { incenseBurns } from './incense.ts';
import { appHistoryOf, appStateOf, parseLivingState, readLivingState } from './livingState.ts';
import type { SavedObject } from './types.ts';

/** Uses before a thing is attuned (a witch's nine). */
export const ATTUNED_AT = 9;
/** And deeply attuned (three nines). */
export const DEEPLY_ATTUNED_AT = 27;

type Rec = Record<string, unknown>;
const list = (value: unknown): Rec[] => (Array.isArray(value) ? (value as Rec[]) : []);

/** App log kinds that are a use of the thing (others, like a petition folded beneath it, are not counted). */
const USE_KINDS = new Set(['charge', 'cleanse', 'ritual', 'offering']);

export type Attunement = { uses: number; attuned: boolean; deeply: boolean; line: string };

/** How many times it has been worked with. */
export function usesOf(object: SavedObject): number {
  const parsed = parseLivingState(object);
  if (!parsed) return 0;
  const state = readLivingState(object, '');
  const crystal = (state.crystal ?? {}) as Rec;
  const deity = (state.deity ?? {}) as Rec;
  const app = appStateOf(object);
  const jar = (app.jar ?? null) as Rec | null;
  const sachet = (app.sachet ?? null) as Rec | null;
  let uses = 0;
  uses += (state.candle?.burnHistory ?? []).length;
  uses += (state.candle?.dressings ?? []).length;
  uses += list(crystal.cleansingHistory).length;
  uses += list(crystal.chargingHistory).filter((r) => r.source !== 'moon').length;
  uses += list(deity.offerings).length;
  uses += list((parsed as Rec).ritualHistory).length;
  uses += incenseBurns(object).length;
  uses += list(jar?.renewals).length;
  uses += list(sachet?.feedings).length;
  uses += appHistoryOf(object).filter((e) => USE_KINDS.has(e.kind)).length;
  return uses;
}

export function attunementOf(object: SavedObject): Attunement {
  const uses = usesOf(object);
  const attuned = uses >= ATTUNED_AT;
  const deeply = uses >= DEEPLY_ATTUNED_AT;
  const line = deeply
    ? `Deeply attuned · worked with ${uses} times. It knows your hand.`
    : attuned
      ? `Attuned · worked with ${uses} times.`
      : '';
  return { uses, attuned, deeply, line };
}
