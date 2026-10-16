// A charge that fades, and cleansing and charging as moments. A charged
// object holds its charge for about a moon (28 days) from its last charge,
// strong at first, then settling, then faded and wanting recharging. The last
// charge is the crystal's own (livingState.crystal.lastChargedAt, which moon
// charges set too) or one the app recorded for anything else
// (livingState.app.charge). Pure.

import { appStateOf, logAppEvent, readLivingState } from './livingState.ts';
import type { SavedObject } from './types.ts';

const DAY = 86_400_000;

/** Days a charge takes to fade out entirely. */
export const CHARGE_FADE_DAYS = 28;
/** Up to this many days a charge is still strong. */
export const CHARGE_STRONG_DAYS = 10;

export type ChargeLevel = 'strong' | 'settling' | 'faded';

export type Charge = {
  /** When it was last charged (ms). */
  at: number;
  /** Whole days since. */
  days: number;
  /** 1 just charged, 0 faded. */
  strength: number;
  level: ChargeLevel;
};

type Rec = Record<string, unknown>;
const time = (value: unknown) => (typeof value === 'string' && value ? Date.parse(value) : NaN);

/** When the object was last charged, in ms, or NaN when it never was. */
export function lastChargedAt(object: SavedObject): number {
  const crystal = (readLivingState(object, '').crystal ?? {}) as Rec;
  const app = appStateOf(object).charge as Rec | undefined;
  const times = [time(crystal.lastChargedAt), time(app?.at)].filter(Number.isFinite);
  return times.length ? Math.max(...times) : NaN;
}

/** How strong a charge from `at` is at `now`: 1 → 0 over CHARGE_FADE_DAYS, easing off gently at first. */
export function chargeStrength(at: number, now: number): number {
  if (!Number.isFinite(at) || !Number.isFinite(now)) return 0;
  const t = Math.max(0, now - at) / (CHARGE_FADE_DAYS * DAY);
  if (t >= 1) return 0;
  // Holds near full for the first days, then falls away: 1 - t².
  return Math.round((1 - t * t) * 1000) / 1000;
}

export function chargeLevel(days: number): ChargeLevel {
  if (days < CHARGE_STRONG_DAYS) return 'strong';
  if (days < CHARGE_FADE_DAYS) return 'settling';
  return 'faded';
}

/** The object's charge now, or null when it has never been charged. */
export function chargeOf(object: SavedObject, now: number = Date.now()): Charge | null {
  const at = lastChargedAt(object);
  if (!Number.isFinite(at) || at > now + 60_000) return null;
  const days = Math.floor(Math.max(0, now - at) / DAY);
  return { at, days, strength: chargeStrength(at, now), level: chargeLevel(days) };
}

/** "Charge: strong", "Charge: settling", "Charge: faded — wants recharging". */
export function chargeLine(charge: Charge): string {
  if (charge.level === 'faded') return 'Charge: faded — wants recharging';
  return `Charge: ${charge.level}`;
}

/** A little more about it, for the panel. */
export function chargeDetail(charge: Charge): string {
  if (charge.days === 0) return 'Charged today.';
  const ago = charge.days === 1 ? 'yesterday' : `${charge.days} days ago`;
  if (charge.level === 'faded') return `Last charged ${ago}. A moon has turned since.`;
  return `Charged ${ago}. It holds for about a moon.`;
}

/**
 * Record a charge on anything the crystal care doesn't cover (a crafted
 * working's charge, a tool's): livingState.app.charge, and a line in its log.
 */
export function recordCharge(object: SavedObject, how: string, now: string): SavedObject {
  const words = how.trim();
  return logAppEvent(object, { kind: 'charge', text: words ? `Charged: ${words.toLowerCase()}.` : 'Charged.' }, now, { charge: { at: now, how: words } });
}

/** Record a cleansing the same way (livingState.app.cleanse). */
export function recordCleanse(object: SavedObject, how: string, now: string): SavedObject {
  const words = how.trim();
  return logAppEvent(object, { kind: 'cleanse', text: words ? `Cleansed: ${words.toLowerCase()}.` : 'Cleansed.' }, now, { cleanse: { at: now, how: words } });
}

// ── Moments ─────────────────────────────────────────────────────────────
// What plays on the stage when something is cleansed or charged, by method.

export type MomentKind = 'smoke' | 'salt' | 'moon' | 'sun' | 'sound';

export const MOMENT_WORDS: Record<MomentKind, string> = {
  smoke: 'Smoke curls around it.',
  salt: 'A circle of salt is drawn around it.',
  moon: 'Moonlight washes over it.',
  sun: 'Sunlight washes over it.',
  sound: 'A tone ripples out from it.',
};

/** The moment for a cleansing or charge, from the first method that has one (moonlight when none does). */
export function momentFor(methods: string[]): MomentKind {
  for (const raw of methods) {
    const m = raw.toLowerCase();
    if (/smoke|incense|herb|smudg|resin/.test(m)) return 'smoke';
    if (/salt|earth|soil|bur(y|ied)/.test(m)) return 'salt';
    if (/sound|bell|song|music|chime|drum|sing/.test(m)) return 'sound';
    if (/sun|solar|fire|candle/.test(m)) return 'sun';
    if (/moon|lunar|selenite|water|storm|rain/.test(m)) return 'moon';
  }
  return 'moon';
}

/** How long a moment plays, in ms. */
export const MOMENT_MS = 2600;
