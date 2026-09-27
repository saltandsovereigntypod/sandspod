// Living Object State: the website's per-object history (burns, dressings,
// crystal care...), saved as a JSON string in each object's `livingState`
// (altar/js/features/living-object-state.js). The app only touches the candle
// parts it needs and keeps every other field, including ones from newer
// versions of the state, exactly as they were.

import type { SavedObject } from './types.ts';
import { newId } from './uid.ts';

export type Dressing = { type: string; herb: string; form: string; label: string; [key: string]: unknown };

type CandleState = {
  totalBurnMs?: number;
  currentBurnStartedAt?: string;
  lastLitAt?: string;
  burnHistory?: { startedAt: string; endedAt: string; durationMs: number }[];
  dressings?: Dressing[];
  [key: string]: unknown;
};

export type LivingState = {
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  lastUsedAt?: string;
  candle?: CandleState;
  [key: string]: unknown;
};

/** The website's defaultState(), used when an object has no state yet. */
export function defaultLivingState(now: string): LivingState {
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    lastUsedAt: '',
    currentRitualId: '',
    currentRitualName: '',
    notes: '',
    lifecycle: { status: 'active' },
    candle: { totalBurnMs: 0, currentBurnStartedAt: '', lastLitAt: '', burnHistory: [], dressings: [] },
    crystal: {
      lastChargedAt: '',
      lastCleansedAt: '',
      dedication: '',
      dedicationDetails: null,
      cleansingHistory: [],
      chargingHistory: [],
    },
    deity: {
      lastOfferingAt: '',
      offeringStatus: '',
      reasonForPresence: '',
      reasonDetails: null,
      offerings: [],
      offeringStatusHistory: [],
    },
    apothecary: { activationState: '', remainingAmount: '', reviewAt: '', status: 'active', nextTendingAt: '' },
  };
}

export function parseLivingState(object: SavedObject): LivingState | null {
  const raw = object.livingState;
  if (!raw) return null;
  if (typeof raw === 'object') return raw as LivingState;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as LivingState) : null;
  } catch {
    return null;
  }
}

/** Read the state, filling in the website's defaults (and legacy candle fields) where missing. */
export function readLivingState(object: SavedObject, now: string): LivingState {
  const parsed = parseLivingState(object);
  const base = defaultLivingState(now);
  if (!parsed) {
    // Saves from before Living Object State kept candle history flat on the object.
    const legacyDressings = (() => {
      const value = object.dressings;
      if (Array.isArray(value)) return value as Dressing[];
      if (typeof value === 'string') {
        try {
          const list = JSON.parse(value);
          return Array.isArray(list) ? (list as Dressing[]) : [];
        } catch {
          return [];
        }
      }
      return [];
    })();
    base.candle = {
      ...base.candle,
      dressings: legacyDressings,
      totalBurnMs: Math.max(0, Number(object.accumulatedBurnMs) || 0),
      currentBurnStartedAt: String(object.currentBurnStartedAt || object.currentBurn || ''),
      lastLitAt: String(object.lastLitAt || object.lastLit || object.lastBurnedAt || ''),
    };
    return base;
  }
  const candle: CandleState = { ...base.candle, ...(parsed.candle ?? {}) };
  if (!Array.isArray(candle.burnHistory)) candle.burnHistory = [];
  if (!Array.isArray(candle.dressings)) candle.dressings = [];
  return { ...base, ...parsed, candle };
}

/** Write state back, stamped like the website's saveLivingState(). */
function writeLivingState(object: SavedObject, state: LivingState, now: string): SavedObject {
  const next: SavedObject = { ...object, livingState: JSON.stringify({ ...state, updatedAt: now }) };
  // Once livingState exists it is the only authority; drop the legacy copies.
  delete next.dressings;
  delete next.accumulatedBurnMs;
  delete next.currentBurnStartedAt;
  delete next.currentBurn;
  delete next.lastLitAt;
  delete next.lastLit;
  delete next.lastBurnedAt;
  return next;
}

export const isCandle = (object: SavedObject) => object.type === 'candle';
export const isLit = (object: SavedObject) => object.lit === 'true';

/** Light a candle (candles.js toggleLight + startCandleBurn). Other objects are unchanged. */
export function lightCandle(object: SavedObject, now: string): SavedObject {
  if (!isCandle(object) || isLit(object)) return object;
  const state = readLivingState(object, now);
  const candle = { ...state.candle };
  if (!candle.currentBurnStartedAt) {
    candle.currentBurnStartedAt = now;
    candle.lastLitAt = now;
    if (candle.firstLitAt === '') candle.firstLitAt = now;
  }
  return writeLivingState({ ...object, lit: 'true' }, { ...state, lastUsedAt: now, candle }, now);
}

/** Snuff a candle and record the burn (stopCandleBurn). */
export function snuffCandle(object: SavedObject, now: string): SavedObject {
  if (!isCandle(object) || !isLit(object)) return object;
  const state = readLivingState(object, now);
  const candle = { ...state.candle };
  const started = Date.parse(candle.currentBurnStartedAt || '');
  if (Number.isFinite(started)) {
    const durationMs = Math.max(0, Date.parse(now) - started);
    candle.totalBurnMs = Math.max(0, Number(candle.totalBurnMs) || 0) + durationMs;
    candle.burnHistory = [...(candle.burnHistory ?? []), { startedAt: candle.currentBurnStartedAt!, endedAt: now, durationMs }];
  }
  candle.currentBurnStartedAt = '';
  return writeLivingState({ ...object, lit: 'false' }, { ...state, lastUsedAt: now, candle }, now);
}

export function toggleLit(object: SavedObject, now: string): SavedObject {
  return isLit(object) ? snuffCandle(object, now) : lightCandle(object, now);
}

/** Only loose herbs and oils can dress a candle (candles.js canDressCandle). */
export function canDressWith(object: SavedObject): boolean {
  return object.type === 'oil' || (object.type === 'herb' && object.form === 'loose');
}

export function dressingsOf(object: SavedObject): Dressing[] {
  const state = parseLivingState(object);
  if (state) return Array.isArray(state.candle?.dressings) ? state.candle!.dressings! : [];
  return readLivingState(object, '').candle?.dressings ?? [];
}

/** Which of the website's two candle overlays a candle shows. */
export function dressingOverlays(object: SavedObject): { herb: boolean; oil: boolean } {
  if (!isCandle(object)) return { herb: false, oil: false };
  const dressings = dressingsOf(object);
  return {
    herb: dressings.some((d) => d.type === 'herb' && d.form === 'loose'),
    oil: dressings.some((d) => d.type === 'oil'),
  };
}

/** Dress a candle with a loose herb or oil from the altar (candles.js dressCandle). */
export function dressCandle(candle: SavedObject, ingredient: SavedObject, now: string): SavedObject {
  if (!isCandle(candle) || !canDressWith(ingredient)) return candle;
  const dressing: Dressing = {
    type: ingredient.type || '',
    herb: ingredient.herb || '',
    form: ingredient.form || '',
    label: ingredient.label || 'Ingredient',
  };
  const state = readLivingState(candle, now);
  const current = state.candle?.dressings ?? [];
  if (current.some((d) => d.type === dressing.type && d.herb === dressing.herb && d.form === dressing.form)) {
    return candle;
  }
  return writeLivingState(candle, { ...state, lastUsedAt: now, candle: { ...state.candle, dressings: [...current, dressing] } }, now);
}

export function undressCandle(candle: SavedObject, now: string): SavedObject {
  if (!isCandle(candle) || dressingsOf(candle).length === 0) return candle;
  const state = readLivingState(candle, now);
  return writeLivingState(candle, { ...state, lastUsedAt: now, candle: { ...state.candle, dressings: [] } }, now);
}

/**
 * What the website's initializeLivingObjectState() does to a new or restored
 * object: give it an altarObjectId and a livingState if it has none, and
 * repair a lit candle with no burn start.
 */
export function ensureLivingState(object: SavedObject, now: string): SavedObject {
  let next = object;
  if (!next.altarObjectId) next = { ...next, altarObjectId: newId() };
  const parsed = parseLivingState(next);
  if (!parsed) {
    const state = readLivingState(next, now);
    const stamped = { ...state, updatedAt: state.createdAt };
    next = { ...next, livingState: JSON.stringify(stamped) };
  }
  return next;
}
