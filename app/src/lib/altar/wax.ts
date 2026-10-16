// How a candle's wax has behaved, from how it was burned: a pillar lit in
// short sessions tunnels down around its wick, long burns leave a wide pool;
// tapers run with drips as they burn down; a burned-down candle leaves its
// remnant. And progress for the candles burned over nights: a seven-knob
// candle a knob at a time, a novena or seven-day candle a day at a time.
// Pure; the stage draws it and the panel says it.

import { remnantOf } from './ceromancy.ts';
import { candleLife, isCandle, isLit, readLivingState, type BurnRecord } from './livingState.ts';
import { dayKey } from './reading/correspondence.ts';
import type { SavedObject } from './types.ts';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Pillars and jar candles keep a memory of their first burns. */
export const POOLING_FORMS = new Set(['pillar', 'jar']);
/** Tall thin candles run with drips. */
export const DRIPPING_FORMS = new Set(['taper', 'chime-spell', 'beeswax-rolled', 'double-action', 'reversible', 'birthday']);
/** Small cups and floating candles: nothing to draw on their sides. */
export const LOW_FORMS = new Set(['tea-light', 'floating', 'votive']);

/** A burn shorter than this on a pillar leaves a tunnel; a long one leaves a full pool. */
export const SHORT_BURN_MS = 2 * HOUR;
export const LONG_BURN_MS = 3 * HOUR;

export type WaxKind = 'even' | 'tunnel' | 'pool' | 'drips' | 'remnant';

export type WaxLook = {
  kind: WaxKind;
  /** How pronounced, 0–1. */
  amount: number;
  /** How many drips run down a taper. */
  drips: number;
  /** 0 new → 1 burned down. */
  progress: number;
  /** What became of the remnant, when it's spent. */
  remnant: 'keep' | 'bury' | 'bin' | null;
  /** A sentence for the panel, or ''. */
  line: string;
};

const burnsOf = (object: SavedObject): BurnRecord[] => readLivingState(object, '').candle?.burnHistory ?? [];

/** 0 new → 1 burned all the way down (0 when the candle has no known life). */
export function burnProgress(object: SavedObject, now: number = Date.now()): number {
  if (!isCandle(object)) return 0;
  const life = candleLife(object, now);
  if (life.spent) return 1;
  return life.expectedMs > 0 ? Math.max(0, Math.min(1, life.burnedMs / life.expectedMs)) : 0;
}

/** How the wax looks now. */
export function waxLook(object: SavedObject, now: number = Date.now()): WaxLook {
  const none: WaxLook = { kind: 'even', amount: 0, drips: 0, progress: 0, remnant: null, line: '' };
  if (!isCandle(object)) return none;
  const life = candleLife(object, now);
  const progress = burnProgress(object, now);
  const burns = burnsOf(object).filter((b) => Number(b.durationMs) > 0);
  if (life.spent) {
    const choice = remnantOf(object)?.choice ?? null;
    const line =
      choice === 'keep' ? 'Burned down. Its remnant of wax is kept.' : choice === 'bury' ? 'Burned down. Its remnant is to be buried.' : choice === 'bin' ? 'Burned down. Its remnant has gone.' : 'Burned down to a remnant of wax.';
    return { kind: 'remnant', amount: choice === 'bury' || choice === 'bin' ? 0 : 1, drips: 0, progress: 1, remnant: choice, line };
  }
  if (!burns.length) return { ...none, progress };
  const form = life.form;
  if (POOLING_FORMS.has(form)) {
    const total = burns.reduce((sum, b) => sum + Number(b.durationMs), 0);
    const average = total / burns.length;
    // The first burns set its memory: short ones tunnel, long ones pool out to the edge.
    const first = Number(burns[0].durationMs);
    if (first < SHORT_BURN_MS && average < LONG_BURN_MS) {
      const short = burns.filter((b) => Number(b.durationMs) < SHORT_BURN_MS).length;
      return {
        kind: 'tunnel',
        amount: Math.min(1, short / 4),
        drips: 0,
        progress,
        remnant: null,
        line: short > 1 ? 'Short burns have tunnelled it down around the wick. A longer burn, a few hours, can melt it back to the edge.' : 'A short first burn has started a tunnel round the wick. Let the next one melt to the edge.',
      };
    }
    if (average >= LONG_BURN_MS) {
      return { kind: 'pool', amount: Math.min(1, average / (5 * HOUR)), drips: 0, progress, remnant: null, line: 'Long burns have melted it to a wide, even pool.' };
    }
    return { ...none, progress };
  }
  if (DRIPPING_FORMS.has(form)) {
    const drips = Math.min(6, Math.round(progress * 6 + (isLit(object) ? 1 : 0)));
    return { kind: 'drips', amount: progress, drips, progress, remnant: null, line: drips > 2 ? 'Wax has run down its sides.' : '' };
  }
  return { ...none, progress };
}

// ── Candles burned over nights ────────────────────────────────────────────

export type NightCandle = {
  kind: 'knobs' | 'days';
  /** Knobs (or days of wax) in all. */
  total: number;
  /** Knobs burned through, or days burned. */
  done: number;
  /** Knobs or days left. */
  left: number;
  /** Separate nights it has been lit on. */
  nights: number;
  /** "4 of 7 knobs left · lit on 3 nights". */
  line: string;
};

/** The nights a candle has been lit on (each burn's start day, and tonight if it's burning). */
export function nightsLit(object: SavedObject, now: number = Date.now()): number {
  const days = new Set(burnsOf(object).map((b) => b.litAt || b.startedAt).filter(Boolean).map((at) => dayKey(String(at))));
  if (isLit(object)) days.add(dayKey(now));
  return days.size;
}

/** Progress for a seven-knob candle (by knob) or a novena or seven-day candle (by day), or null for others. */
export function nightCandle(object: SavedObject, now: number = Date.now()): NightCandle | null {
  if (!isCandle(object)) return null;
  const life = candleLife(object, now);
  if (!life.expectedMs) return null;
  const nights = nightsLit(object, now);
  const lit = nights ? ` · lit on ${nights} ${nights === 1 ? 'night' : 'nights'}` : '';
  if (life.form === 'seven-knob') {
    const total = 7;
    // A knob counts as burned once nearly all of it has gone.
    const done = life.spent ? total : Math.min(total, Math.floor((life.burnedMs / life.expectedMs) * total + 0.05));
    const left = total - done;
    return { kind: 'knobs', total, done, left, nights, line: `${left} of ${total} knobs left${lit}` };
  }
  if (life.form === 'novena' || life.form === 'vigil') {
    const total = Math.max(1, Math.round(life.expectedMs / DAY));
    const left = life.spent ? 0 : Math.max(0, Math.min(total, Math.ceil(life.remainingMs / DAY - 0.05)));
    return { kind: 'days', total, done: total - left, left, nights, line: `About ${left} of ${total} days of wax left${lit}` };
  }
  return null;
}
