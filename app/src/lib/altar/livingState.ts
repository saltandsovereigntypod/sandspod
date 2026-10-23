// Living Object State: the website's per-object history (burns, dressings,
// crystal care...), saved as a JSON string in each object's `livingState`
// (altar/js/features/living-object-state.js). The app only touches the candle
// parts it needs and keeps every other field, including ones from newer
// versions of the state, exactly as they were.

import type { SavedObject } from './types.ts';
import { newId } from './uid.ts';
import { readMark, type SigilMark } from '../sigil/sigil.ts';

export type Dressing = { type: string; herb: string; form: string; label: string; [key: string]: unknown };

/**
 * A word, name or sigil carved into a candle (shared with the website's altar).
 * A sigil carving keeps its mark in `sigil` and its name in `text`, so a reader
 * that doesn't know sigils still shows the name.
 */
export type Carving = { text: string; carvedAt: string; sigil?: SigilMark; [key: string]: unknown };

export const CARVING_MAX = 40;

/** One burn. The website's lifecycle names its ends litAt/extinguishedAt; older saves say startedAt/endedAt. The app writes both. */
export type BurnRecord = {
  eventId?: string;
  litAt?: string;
  extinguishedAt?: string;
  startedAt?: string;
  endedAt?: string;
  durationMs: number;
  endReason?: string;
  [key: string]: unknown;
};

type CandleState = {
  totalBurnMs?: number;
  currentBurnStartedAt?: string;
  lastLitAt?: string;
  burnHistory?: BurnRecord[];
  /** The candle lifecycle (version 2, shared with the website): how long this candle lasts and whether it's spent. */
  form?: string;
  expectedBurnMs?: number;
  durationLocked?: boolean;
  firstLitAt?: string;
  estimatedBurnoutAt?: string;
  spentAt?: string;
  status?: string;
  dressings?: Dressing[];
  carvings?: Carving[];
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
export function writeLivingState(object: SavedObject, state: LivingState, now: string): SavedObject {
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

// ── Candle life ───────────────────────────────────────────────────────────
// Each kind of candle burns for about as long as a real one would, then goes
// out on its own and is spent (the website's candle-lifecycle.js, same table
// and same saved fields). An approximation: size, wick and drafts all vary.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
export const CANDLE_LIFE_MAX = 365 * DAY;

/** About how long each kind of candle burns, by form. */
export const CANDLE_LIFE: Record<string, number> = {
  'chime-spell': 2 * HOUR,
  taper: 8 * HOUR,
  'tea-light': 4 * HOUR,
  pillar: 60 * HOUR,
  vigil: 7 * DAY,
  votive: 12 * HOUR,
  jar: 40 * HOUR,
  novena: 7 * DAY,
  floating: 4 * HOUR,
  birthday: 10 * 60 * 1000,
  figure: 4 * HOUR,
  'figure-male': 4 * HOUR,
  'figure-female': 4 * HOUR,
  'figure-couple': 5 * HOUR,
  'beeswax-rolled': 2 * HOUR,
  'seven-knob': 7 * HOUR,
  'double-action': 6 * HOUR,
  reversible: 6 * HOUR,
};

const FORM_FILES: Record<string, string> = { chime: 'chime-spell' };

/** Which kind of candle this is: as saved, from the cabinet, or from its picture. */
export function candleLifeForm(object: SavedObject): string {
  const saved = String(parseLivingState(object)?.candle?.form || '').toLowerCase();
  if (saved) return saved;
  const own = String(object.form || '').toLowerCase();
  if (own) return own;
  const path = String(object.imagePath || '');
  const folder = /candles\/([a-z-]+)\/[^/]+$/i.exec(path);
  if (folder) return FORM_FILES[folder[1].toLowerCase()] ?? folder[1].toLowerCase();
  return /candles\/[a-z]+-candle\.png$/i.test(path) ? 'vigil' : '';
}

export type CandleLife = {
  form: string;
  /** How long it lasts in all (0: no known limit). */
  expectedMs: number;
  /** Burned so far, counting the burn going on now. */
  burnedMs: number;
  /** Left to burn (Infinity when there's no limit). */
  remainingMs: number;
  spent: boolean;
  /** When the burn going on now runs out, or null. */
  burnoutAt: number | null;
  /** Its length can still be changed (it has never been lit). */
  adjustable: boolean;
};

export function candleLife(object: SavedObject, now: Date | number = Date.now()): CandleLife {
  const at = typeof now === 'number' ? now : now.getTime();
  const candle = readLivingState(object, '').candle ?? {};
  const form = candleLifeForm(object);
  const custom = Number(candle.expectedBurnMs);
  const expectedMs = custom > 0 ? Math.min(custom, CANDLE_LIFE_MAX) : (CANDLE_LIFE[form] ?? 0);
  const total = Math.max(0, Number(candle.totalBurnMs) || 0);
  const started = isLit(object) ? Date.parse(candle.currentBurnStartedAt || '') : NaN;
  const running = Number.isFinite(started) ? Math.max(0, at - started) : 0;
  const burnedMs = expectedMs ? Math.min(expectedMs, total + running) : total + running;
  const spent = !!candle.spentAt || candle.status === 'spent' || (expectedMs > 0 && total >= expectedMs);
  const burnoutAt = Number.isFinite(started) && expectedMs ? started + Math.max(0, expectedMs - total) : null;
  const burnedBefore = total > 0 || (candle.burnHistory?.length ?? 0) > 0 || !!candle.firstLitAt;
  return {
    form,
    expectedMs,
    burnedMs,
    remainingMs: expectedMs ? Math.max(0, expectedMs - burnedMs) : Infinity,
    spent,
    burnoutAt,
    adjustable: !candle.durationLocked && !burnedBefore && !isLit(object) && !spent,
  };
}

/** Light a candle (candles.js toggleLight + startCandleBurn). Spent candles and other objects are unchanged. */
export function lightCandle(object: SavedObject, now: string): SavedObject {
  if (!isCandle(object) || isLit(object)) return object;
  const life = candleLife(object, Date.parse(now));
  if (life.spent) return object;
  const state = readLivingState(object, now);
  const candle = { ...state.candle };
  if (!candle.currentBurnStartedAt) {
    candle.currentBurnStartedAt = now;
    candle.lastLitAt = now;
    if (!candle.firstLitAt) candle.firstLitAt = now;
  }
  if (life.form) candle.form = life.form;
  if (life.expectedMs) {
    candle.expectedBurnMs = life.expectedMs;
    candle.estimatedBurnoutAt = new Date(Date.parse(candle.currentBurnStartedAt!) + life.remainingMs).toISOString();
  }
  candle.durationLocked = true;
  candle.status = 'burning';
  return writeLivingState({ ...object, lit: 'true' }, { ...state, lastUsedAt: now, candle }, now);
}

/** End the burn going on now at `endAt`, recording it; a candle that has used its life is spent. */
function endBurn(object: SavedObject, endAt: number, reason: string, now: string): SavedObject {
  const life = candleLife(object, endAt);
  const state = readLivingState(object, now);
  const candle = { ...state.candle };
  const startedAt = candle.currentBurnStartedAt || '';
  const started = Date.parse(startedAt);
  if (Number.isFinite(started)) {
    const before = Math.max(0, Number(candle.totalBurnMs) || 0);
    const room = life.expectedMs ? Math.max(0, life.expectedMs - before) : Infinity;
    const durationMs = Math.min(room, Math.max(0, endAt - started));
    const endedAt = new Date(started + durationMs).toISOString();
    candle.totalBurnMs = before + durationMs;
    candle.burnHistory = [
      ...(candle.burnHistory ?? []),
      {
        eventId: `candle-burn:${object.instanceId || object.altarObjectId || 'unscoped'}:${startedAt}`,
        litAt: startedAt,
        extinguishedAt: endedAt,
        startedAt,
        endedAt,
        durationMs,
        endReason: reason,
      },
    ];
  }
  candle.currentBurnStartedAt = '';
  candle.estimatedBurnoutAt = '';
  const spent = life.expectedMs > 0 && (Number(candle.totalBurnMs) || 0) >= life.expectedMs;
  candle.status = spent ? 'spent' : 'unlit';
  if (spent && !candle.spentAt) candle.spentAt = new Date(Math.min(endAt, Date.parse(now) || endAt)).toISOString();
  return writeLivingState({ ...object, lit: 'false' }, { ...state, lastUsedAt: now, candle }, now);
}

/** Snuff a candle and record the burn (stopCandleBurn). A burn can't run past the candle's life. */
export function snuffCandle(object: SavedObject, now: string): SavedObject {
  if (!isCandle(object) || !isLit(object)) return object;
  const at = Date.parse(now);
  const { burnoutAt } = candleLife(object, at);
  if (burnoutAt != null && at >= burnoutAt) return endBurn(object, burnoutAt, 'candle_life_reached', now);
  return endBurn(object, at, 'manual_extinguish', now);
}

/** A lit candle whose life ran out (even while the app was closed) goes out, at the moment it would have. */
export function settleCandle(object: SavedObject, now: string): SavedObject {
  if (!isCandle(object) || !isLit(object)) return object;
  const { burnoutAt } = candleLife(object, Date.parse(now));
  return burnoutAt != null && Date.parse(now) >= burnoutAt ? endBurn(object, burnoutAt, 'candle_life_reached', now) : object;
}

/** Set how long a candle lasts, before it is first lit. */
export function setCandleLife(object: SavedObject, ms: number, now: string): SavedObject {
  if (!isCandle(object) || !candleLife(object).adjustable || !(ms > 0)) return object;
  const state = readLivingState(object, now);
  return writeLivingState(object, { ...state, candle: { ...state.candle, expectedBurnMs: Math.min(Math.round(ms), CANDLE_LIFE_MAX) } }, now);
}

/** Put a fresh candle in a spent one's place: a new candle, same spot, full life. */
export function freshCandle(object: SavedObject, now: string): SavedObject {
  if (!isCandle(object)) return object;
  const state = readLivingState(object, now);
  const { expectedBurnMs: _custom, ...rest } = state.candle ?? {};
  void _custom;
  const candle = {
    ...rest,
    totalBurnMs: 0,
    currentBurnStartedAt: '',
    lastLitAt: '',
    burnHistory: [],
    dressings: [],
    carvings: [],
    firstLitAt: '',
    estimatedBurnoutAt: '',
    spentAt: '',
    status: 'unlit',
    durationLocked: false,
    replacesInstanceId: object.altarObjectId || '',
  };
  return writeLivingState(
    { ...object, lit: 'false', altarObjectId: newId(), instanceId: '' },
    { ...state, createdAt: now, lastUsedAt: now, candle },
    now,
  );
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

export function carvingsOf(object: SavedObject): Carving[] {
  const carvings = parseLivingState(object)?.candle?.carvings;
  return Array.isArray(carvings) ? carvings.filter((c) => c && typeof c.text === 'string' && c.text.trim()) : [];
}

/** The sigil carved, if this carving is one. */
export const carvingMark = (carving: Carving): SigilMark | null => readMark(carving.sigil);

/**
 * Carve a word into a candle, or a sigil (with its name as the text). Blank or
 * repeated words, and a sigil already carved there, change nothing.
 */
export function carveCandle(candle: SavedObject, text: string, now: string, sigil?: SigilMark | null): SavedObject {
  const mark = sigil ? readMark(sigil) : null;
  const word = text.replace(/\s+/g, ' ').trim().slice(0, CARVING_MAX) || (mark ? 'Sigil' : '');
  if (!isCandle(candle) || !word) return candle;
  const current = carvingsOf(candle);
  if (mark ? current.some((c) => carvingMark(c)?.d === mark.d) : current.some((c) => !carvingMark(c) && c.text.toLowerCase() === word.toLowerCase())) return candle;
  const carving: Carving = mark ? { text: word, carvedAt: now, sigil: mark } : { text: word, carvedAt: now };
  const state = readLivingState(candle, now);
  return writeLivingState(candle, { ...state, lastUsedAt: now, candle: { ...state.candle, carvings: [...current, carving] } }, now);
}

/** Smooth one carving away, or all of them when no index is given. */
export function uncarveCandle(candle: SavedObject, now: string, index?: number): SavedObject {
  const current = carvingsOf(candle);
  if (!isCandle(candle) || current.length === 0) return candle;
  const carvings = index == null ? [] : current.filter((_, i) => i !== index);
  const state = readLivingState(candle, now);
  return writeLivingState(candle, { ...state, lastUsedAt: now, candle: { ...state.candle, carvings } }, now);
}

export type ApothecaryState = { activationState: string; remainingAmount: string; reviewAt: string; status: string; nextTendingAt: string };

/** A crafted item's own state: activation, what's left, and its tending and review dates. */
export function apothecaryStateOf(object: SavedObject): ApothecaryState {
  const raw = (parseLivingState(object)?.apothecary ?? {}) as Partial<ApothecaryState>;
  return {
    activationState: String(raw.activationState ?? ''),
    remainingAmount: String(raw.remainingAmount ?? ''),
    reviewAt: String(raw.reviewAt ?? ''),
    status: String(raw.status ?? 'active'),
    nextTendingAt: String(raw.nextTendingAt ?? ''),
  };
}

/** Change a crafted item's state (setLivingApothecaryState); everything else in its state is kept. */
export function setApothecaryState(object: SavedObject, change: Partial<ApothecaryState>, now: string): SavedObject {
  const state = readLivingState(object, now);
  const apothecary = { ...apothecaryStateOf(object), ...change };
  return writeLivingState(object, { ...state, lastUsedAt: now, apothecary }, now);
}

// ── The app's own per-object state ─────────────────────────────────────────
// Flame readings, offerings and their freshness, incense, petitions and a
// small log of what was done with the object live under `livingState.app`.
// The website keeps unknown top-level keys of the state as they are, so this
// travels with the object without the website needing to know about it.

/** One thing that happened to an object, for its story. */
export type AppEvent = { id: string; at: string; kind: string; text: string; [key: string]: unknown };

export type AppState = {
  history?: AppEvent[];
  [key: string]: unknown;
};

/** At most this many entries are kept in an object's own log. */
export const APP_HISTORY_MAX = 120;

export function appStateOf(object: SavedObject): AppState {
  const app = parseLivingState(object)?.app;
  return app && typeof app === 'object' && !Array.isArray(app) ? (app as AppState) : {};
}

/** Change part of the app's state; every other key (and the rest of the living state) is kept. */
export function setAppState(object: SavedObject, change: Partial<AppState>, now: string, used = true): SavedObject {
  const state = readLivingState(object, now);
  const app = { ...appStateOf(object), ...change };
  return writeLivingState(object, { ...state, ...(used ? { lastUsedAt: now } : {}), app }, now);
}

export function appHistoryOf(object: SavedObject): AppEvent[] {
  const list = appStateOf(object).history;
  return Array.isArray(list) ? list.filter((e) => e && typeof e.at === 'string' && typeof e.text === 'string') : [];
}

/** Add a line to the object's log (and any other app-state change in the same write). */
export function logAppEvent(
  object: SavedObject,
  event: { kind: string; text: string; at?: string; [key: string]: unknown },
  now: string,
  change: Partial<AppState> = {},
): SavedObject {
  const entry: AppEvent = { ...event, id: newId(), at: event.at || now, kind: event.kind, text: event.text };
  const history = [...appHistoryOf(object), entry].slice(-APP_HISTORY_MAX);
  return setAppState(object, { ...change, history }, now);
}

/** When the object came to the altar (its living state's birth), or NaN when unknown. */
export function placedAtOf(object: SavedObject): number {
  return Date.parse(String(parseLivingState(object)?.createdAt || ''));
}
