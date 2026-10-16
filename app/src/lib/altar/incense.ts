// Incense that burns: a stick, a cone or resin on charcoal is lit like a
// candle, burns about as long as the real thing, goes out on its own at the
// end (even while the app is closed, as candles do) and leaves ash until the
// ash is cleared. Kept in `livingState.app.incense`; the object's own `lit`
// stays as it was, because the website only lights candles. Pure, so it can
// be tested.

import { appStateOf, setAppState } from './livingState.ts';
import type { SavedObject } from './types.ts';

const MIN = 60_000;

export type IncenseForm = 'stick' | 'cone' | 'resin';

export const INCENSE_FORMS: { id: IncenseForm; label: string; usualMs: number; lengths: number[] }[] = [
  { id: 'stick', label: 'Stick', usualMs: 40 * MIN, lengths: [30 * MIN, 35 * MIN, 40 * MIN, 45 * MIN] },
  { id: 'cone', label: 'Cone', usualMs: 20 * MIN, lengths: [15 * MIN, 20 * MIN, 25 * MIN] },
  { id: 'resin', label: 'Resin on charcoal', usualMs: 50 * MIN, lengths: [45 * MIN, 50 * MIN, 60 * MIN] },
];

export const incenseFormInfo = (form: string) => INCENSE_FORMS.find((f) => f.id === form) ?? INCENSE_FORMS[0];

/** Herbs that are resins, burned on charcoal rather than as sticks. */
const RESINS = new Set(['frankincense', 'myrrh', 'copal', 'dragons-blood', 'dragon-s-blood', 'amber', 'benzoin', 'sandarac', 'mastic']);

export function isIncense(object: SavedObject): boolean {
  return (
    (object.type === 'herb' && object.form === 'incense') ||
    (object.type === 'tool' && object.tool === 'incense-burner') ||
    (object.type === 'vessel' && object.vessel === 'incense-bowl') ||
    (object.type === 'apothecary' && object.apothecaryType === 'incense') ||
    object.type === 'incense'
  );
}

type Burn = { litAt: string; endedAt: string; durationMs: number; endReason: string };

export type IncenseState = {
  form?: IncenseForm;
  burnMs?: number;
  burnedMs?: number;
  litAt?: string;
  status?: 'unlit' | 'burning' | 'ash';
  ashAt?: string;
  burns?: Burn[];
};

export const incenseStateOf = (object: SavedObject): IncenseState => {
  const raw = appStateOf(object).incense;
  return raw && typeof raw === 'object' ? (raw as IncenseState) : {};
};

/** What this incense is, as chosen or from what it looks like. */
export function incenseFormOf(object: SavedObject): IncenseForm {
  const saved = incenseStateOf(object).form;
  if (saved && INCENSE_FORMS.some((f) => f.id === saved)) return saved;
  if (object.type === 'vessel') return 'resin';
  if (object.type === 'tool') return 'cone';
  if (RESINS.has(String(object.herb || '').toLowerCase())) return 'resin';
  return 'stick';
}

export type IncenseLife = {
  form: IncenseForm;
  burnMs: number;
  burnedMs: number;
  remainingMs: number;
  lit: boolean;
  ash: boolean;
  /** When the burn going on now ends, or null. */
  endsAt: number | null;
  /** Its length can still be chosen (never lit since the last clearing). */
  adjustable: boolean;
};

export function incenseLife(object: SavedObject, now: number = Date.now()): IncenseLife {
  const s = incenseStateOf(object);
  const form = incenseFormOf(object);
  const burnMs = Number(s.burnMs) > 0 ? Number(s.burnMs) : incenseFormInfo(form).usualMs;
  const before = Math.max(0, Number(s.burnedMs) || 0);
  const started = s.status === 'burning' ? Date.parse(String(s.litAt || '')) : NaN;
  const lit = Number.isFinite(started);
  const running = lit ? Math.max(0, now - started) : 0;
  const burnedMs = Math.min(burnMs, before + running);
  return {
    form,
    burnMs,
    burnedMs,
    remainingMs: Math.max(0, burnMs - burnedMs),
    lit,
    ash: s.status === 'ash',
    endsAt: lit ? started + Math.max(0, burnMs - before) : null,
    adjustable: !lit && s.status !== 'ash' && before === 0,
  };
}

/** Choose the form (and so the usual length) before it's lit. */
export function setIncenseForm(object: SavedObject, form: IncenseForm, now: string): SavedObject {
  if (!isIncense(object) || !incenseLife(object).adjustable) return object;
  return setAppState(object, { incense: { ...incenseStateOf(object), form, burnMs: incenseFormInfo(form).usualMs } }, now);
}

export function setIncenseLength(object: SavedObject, ms: number, now: string): SavedObject {
  if (!isIncense(object) || !incenseLife(object).adjustable || !(ms > 0)) return object;
  return setAppState(object, { incense: { ...incenseStateOf(object), form: incenseFormOf(object), burnMs: Math.round(ms) } }, now);
}

export function lightIncense(object: SavedObject, now: string): SavedObject {
  const life = incenseLife(object, Date.parse(now));
  if (!isIncense(object) || life.lit || life.ash) return object;
  return setAppState(object, { incense: { ...incenseStateOf(object), form: life.form, burnMs: life.burnMs, litAt: now, status: 'burning' } }, now);
}

function endIncense(object: SavedObject, endAt: number, reason: string, now: string): SavedObject {
  const s = incenseStateOf(object);
  const life = incenseLife(object, endAt);
  const litAt = String(s.litAt || '');
  const started = Date.parse(litAt);
  const before = Math.max(0, Number(s.burnedMs) || 0);
  const durationMs = Number.isFinite(started) ? Math.min(Math.max(0, life.burnMs - before), Math.max(0, endAt - started)) : 0;
  const burnedMs = before + durationMs;
  const done = burnedMs >= life.burnMs;
  const endedAt = new Date(Number.isFinite(started) ? started + durationMs : endAt).toISOString();
  const incense: IncenseState = {
    ...s,
    form: life.form,
    burnMs: life.burnMs,
    burnedMs,
    litAt: '',
    status: done ? 'ash' : 'unlit',
    ...(done ? { ashAt: endedAt } : {}),
    burns: [...(Array.isArray(s.burns) ? s.burns : []), { litAt, endedAt, durationMs, endReason: reason }].slice(-60),
  };
  return setAppState(object, { incense }, now);
}

/** Put it out early (what's left can be lit again). */
export function putOutIncense(object: SavedObject, now: string): SavedObject {
  const at = Date.parse(now);
  const life = incenseLife(object, at);
  if (!life.lit) return object;
  if (life.endsAt != null && at >= life.endsAt) return endIncense(object, life.endsAt, 'burned_down', now);
  return endIncense(object, at, 'put_out', now);
}

/** Incense whose time is up goes out, at the moment it would have, leaving ash. */
export function settleIncense(object: SavedObject, now: string): SavedObject {
  if (!isIncense(object)) return object;
  const life = incenseLife(object, Date.parse(now));
  return life.lit && life.endsAt != null && Date.parse(now) >= life.endsAt ? endIncense(object, life.endsAt, 'burned_down', now) : object;
}

/** Clear the ash away: a fresh stick, cone or charcoal is ready to light. */
export function clearAsh(object: SavedObject, now: string): SavedObject {
  const s = incenseStateOf(object);
  if (s.status !== 'ash') return object;
  return setAppState(object, { incense: { ...s, status: 'unlit', burnedMs: 0, ashAt: '', clearedAt: now } as IncenseState }, now);
}

export const incenseBurns = (object: SavedObject): Burn[] => {
  const list = incenseStateOf(object).burns;
  return Array.isArray(list) ? list : [];
};

/** Where the smoke rises from, as fractions of the object's box: a stick's tip, or the top of a bowl or burner. */
export function smokeOrigin(object: SavedObject): { x: number; y: number } {
  const form = incenseFormOf(object);
  if (object.type === 'herb' && form === 'stick') return { x: 0.42, y: 0.02 };
  if (object.type === 'herb') return { x: 0.45, y: 0.05 };
  return { x: 0.5, y: 0.18 };
}
