// How a candle's wax has behaved, from how it was burned: a pillar lit in
// short sessions tunnels down around its wick, long burns leave a wide pool;
// tapers run with drips as they burn down; a burned-down candle leaves its
// remnant. And progress for the candles burned over nights: a seven-knob
// candle a knob at a time, a novena or seven-day candle a day at a time.
// Pure; the stage draws it and the panel says it.

import { remnantOf } from './ceromancy.ts';
import { candleLife, candleLifeForm, isCandle, isLit, readLivingState, type BurnRecord } from './livingState.ts';
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

/** Candles whose wax runs down their sides while they burn (the drips are drawn as the burn goes on). */
export const DRIP_PRONE_FORMS = new Set([...DRIPPING_FORMS, 'pillar', 'vigil', 'seven-knob']);

/** How long the top of a lit candle takes to melt most of the way to a pool. */
export const MELT_MS = 20 * 60_000;

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
  /** How far the burn going on now has melted the top, 0 unlit → 1 (a few minutes in it already shows). */
  melt: number;
};

const burnsOf = (object: SavedObject): BurnRecord[] => readLivingState(object, '').candle?.burnHistory ?? [];

/** 0 new → 1 burned all the way down (0 when the candle has no known life). */
export function burnProgress(object: SavedObject, now: number = Date.now()): number {
  if (!isCandle(object)) return 0;
  const life = candleLife(object, now);
  if (life.spent) return 1;
  return life.expectedMs > 0 ? Math.max(0, Math.min(1, life.burnedMs / life.expectedMs)) : 0;
}

/**
 * How far the burn going on now has melted the candle's top: 0 when it isn't
 * lit; a little the moment it's lit, about half after a quarter of an hour,
 * nearly all after an hour. So even a short session shows life.
 */
export function currentMelt(object: SavedObject, now: number = Date.now()): number {
  if (!isCandle(object) || !isLit(object)) return 0;
  const started = Date.parse(String(readLivingState(object, '').candle?.currentBurnStartedAt || ''));
  const running = Number.isFinite(started) ? Math.max(0, now - started) : MELT_MS;
  return Math.round((0.15 + 0.85 * (1 - Math.exp(-running / MELT_MS))) * 1000) / 1000;
}

/** How the wax looks now. */
export function waxLook(object: SavedObject, now: number = Date.now()): WaxLook {
  const look = baseWaxLook(object, now);
  if (look.kind === 'remnant' || !isCandle(object)) return look;
  const melt = currentMelt(object, now);
  if (!melt) return look;
  const form = candleLifeForm(object);
  // Drips run while it burns: a first one within minutes, more as the burn goes on.
  if (look.kind === 'drips' || (look.kind === 'even' && DRIPPING_FORMS.has(form))) {
    return { ...look, kind: 'drips', melt, drips: Math.min(6, Math.max(look.drips, 1 + Math.round(melt * 2.5))), amount: Math.max(look.amount, Math.round(melt * 0.6 * 1000) / 1000) };
  }
  if (DRIP_PRONE_FORMS.has(form)) return { ...look, melt, drips: Math.min(4, Math.round(melt * 3)) };
  return { ...look, melt };
}

function baseWaxLook(object: SavedObject, now: number): WaxLook {
  const none: WaxLook = { kind: 'even', amount: 0, drips: 0, progress: 0, remnant: null, line: '', melt: 0 };
  if (!isCandle(object)) return none;
  const life = candleLife(object, now);
  const progress = burnProgress(object, now);
  const burns = burnsOf(object).filter((b) => Number(b.durationMs) > 0);
  if (life.spent) {
    const choice = remnantOf(object)?.choice ?? null;
    const line =
      choice === 'keep' ? 'Burned down. Its remnant of wax is kept.' : choice === 'bury' ? 'Burned down. Its remnant is to be buried.' : choice === 'bin' ? 'Burned down. Its remnant has gone.' : 'Burned down to a remnant of wax.';
    return { kind: 'remnant', amount: choice === 'bury' || choice === 'bin' ? 0 : 1, drips: 0, progress: 1, remnant: choice, line, melt: 0 };
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
        melt: 0,
        line: short > 1 ? 'Short burns have tunnelled it down around the wick. A longer burn, a few hours, can melt it back to the edge.' : 'A short first burn has started a tunnel round the wick. Let the next one melt to the edge.',
      };
    }
    if (average >= LONG_BURN_MS) {
      return { kind: 'pool', amount: Math.min(1, average / (5 * HOUR)), drips: 0, progress, remnant: null, melt: 0, line: 'Long burns have melted it to a wide, even pool.' };
    }
    return { ...none, progress };
  }
  if (DRIPPING_FORMS.has(form)) {
    const drips = Math.min(6, Math.round(progress * 6 + (isLit(object) ? 1 : 0)));
    return { kind: 'drips', amount: progress, drips, progress, remnant: null, melt: 0, line: drips > 2 ? 'Wax has run down its sides.' : '' };
  }
  return { ...none, progress };
}

// ── Burning down ──────────────────────────────────────────────────────────
// A candle gets shorter as it burns. Free-standing candles keep their top (the
// rim and wick) and lose wax from the body beneath it; figure and two-colour
// candles burn away from the head down; candles in glass keep their glass
// while the wax inside sinks. All in fractions of the candle's picture.

export type BurnDownMode = 'none' | 'cap' | 'crop' | 'glass';

export type CandleShape = {
  mode: BurnDownMode;
  /** Top of the wax when new, as a fraction of the picture's height. */
  top: number;
  /** Foot of the wax. */
  bottom: number;
  /** Half the wax's width, as a fraction of the picture's width either side of its middle. */
  half: number;
  /** cap: the top slice (rim and wick) that is kept and set down on the shorter candle. */
  capEnd: number;
  /** How much of the picture's height it can burn away in all. */
  maxDrop: number;
};

const shape = (mode: BurnDownMode, top: number, bottom: number, half: number, capEnd: number, keep: number): CandleShape => ({
  mode,
  top,
  bottom,
  half,
  capEnd,
  maxDrop: Math.max(0, bottom - (mode === 'cap' ? capEnd : top) - keep),
});

/** Measured from the painted candles (assets/altar/objects/candles). */
const SHAPES: Record<string, CandleShape> = {
  vigil: shape('cap', 0.075, 0.96, 0.25, 0.14, 0.07),
  taper: shape('cap', 0.09, 0.95, 0.1, 0.13, 0.07),
  'chime-spell': shape('cap', 0.125, 0.91, 0.065, 0.16, 0.08),
  pillar: shape('cap', 0.17, 0.86, 0.31, 0.27, 0.12),
  'seven-knob': shape('cap', 0.085, 0.94, 0.13, 0.12, 0.08),
  'beeswax-rolled': shape('cap', 0.1, 0.95, 0.12, 0.13, 0.07),
  birthday: shape('cap', 0.09, 0.955, 0.06, 0.12, 0.07),
  'double-action': shape('crop', 0.075, 0.955, 0.2, 0, 0.12),
  reversible: shape('crop', 0.075, 0.93, 0.2, 0, 0.12),
  figure: shape('crop', 0.05, 0.92, 0.17, 0, 0.14),
  'figure-male': shape('crop', 0.05, 0.92, 0.17, 0, 0.14),
  'figure-female': shape('crop', 0.05, 0.92, 0.17, 0, 0.14),
  'figure-couple': shape('crop', 0.15, 0.92, 0.3, 0, 0.14),
  novena: shape('glass', 0.11, 0.95, 0.2, 0, 0.05),
  jar: shape('glass', 0.33, 0.88, 0.25, 0, 0.05),
}

/** The shape of a candle form's wax, or null for the small cups and floating candles (nothing to burn down). */
export function candleShape(form: string): CandleShape | null {
  return SHAPES[form] ?? null;
}

export type BurnDown = CandleShape & {
  /** How far the top has come down, as a fraction of the picture's height. */
  drop: number;
  /** Where the top of the wax is now. */
  waxTop: number;
};

/**
 * How far a candle has burned down, from its burn so far (candleLife): a two-
 * hour chime visibly in one sitting, a seven-day vigil a little each night. A
 * spent candle is its low remnant. Null for objects with nothing to burn down.
 */
export function burnDown(object: SavedObject, now: number = Date.now()): BurnDown | null {
  if (!isCandle(object)) return null;
  const s = candleShape(candleLifeForm(object));
  if (!s) return null;
  const drop = Math.round(burnProgress(object, now) * s.maxDrop * 10_000) / 10_000;
  return { ...s, drop, waxTop: s.top + drop };
}

/** What the close-up says of how far down it has burned, or ''. */
export function burnedDownLine(object: SavedObject, now: number = Date.now()): string {
  if (!isCandle(object)) return '';
  const life = candleLife(object, now);
  if (life.spent) return 'Burned all the way down to its last low stub.';
  if (!life.expectedMs || !(life.burnedMs > 0)) return isLit(object) ? 'Just lit, still standing its full height.' : 'Unburned, its full height.';
  const p = burnProgress(object, now);
  const part = p < 0.06 ? 'A sliver' : p < 0.2 ? 'A little' : p < 0.4 ? 'About a third' : p < 0.6 ? 'About half' : p < 0.8 ? 'About two thirds' : 'Nearly all';
  return `${part} of its wax has burned away.`;
}

/** What the close-up says of the wax at the top while it burns, or ''. */
export function meltLine(object: SavedObject, now: number = Date.now()): string {
  const melt = currentMelt(object, now);
  if (!melt) return '';
  return melt < 0.4 ? 'The wax under the flame is just beginning to soften.' : melt < 0.75 ? 'A pool of melted wax is gathering under the flame.' : 'A full pool of molten wax glows under the flame.';
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
