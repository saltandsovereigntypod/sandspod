// Listen (Meditation → Listen): the sit's sound layers (sound.ts) on their
// own, with no bells or sit around them. Binaural beats (the alpha-to-theta
// descent, a preset or your own beat and carrier), noise, rain, wind, fire,
// a drone, a drum and bowls, each at its own level; play, pause and stop,
// faded in as it begins and out as it ends; an optional stop timer. The
// slow descent spans the timer, or 30 minutes when it's open-ended. The
// last mix is remembered on the device (LISTEN_KEY), apart from the sit's,
// and a sit can borrow it. A listen goes in the log only if you ask
// (kind "listening"). Played by components/meditation/sitSound.ts in the
// app and webSound.ts on the web. Pure.

import { cleanMix, FADE_MS, type SoundMix } from './sound.ts';
import { DEFAULT_PLAN, minutesSat, type SitPlan } from './timer.ts';

const MIN = 60_000;

/** Where the last Listen mix is kept on the device (AsyncStorage / localStorage). */
export const LISTEN_KEY = 'meditation.listen';

/** Stop-timer choices in minutes; null is until you stop it. */
export const LISTEN_TIMERS: (number | null)[] = [15, 30, 45, 60, 90, null];
export const timerLabel = (m: number | null) => (m === null ? 'Until I stop' : `${m} min`);

/** The slow descent's length when there's no timer. */
export const OPEN_DESCENT = 30;

/** A first mix: binaural layers at a medium level, alpha down to theta. */
export const DEFAULT_LISTEN_MIX: SoundMix = cleanMix({ levels: { binaural: 0.5 }, binaural: 'descent' });

export function cleanListen(raw: unknown): SoundMix {
  const m = cleanMix(raw);
  return Object.keys(m.levels).length ? m : DEFAULT_LISTEN_MIX;
}

export function cleanTimer(v: unknown): number | null {
  const n = Number(v);
  return v !== null && v !== '' && LISTEN_TIMERS.includes(n) ? n : null;
}

/**
 * The plan the sound is worked out against: open-ended (no settling, no
 * bells), its end given separately (listenEnd), so Stop can bring it
 * forward; the slow descent spans the timer.
 */
export function listenPlan(minutes: number | null): SitPlan {
  return { ...DEFAULT_PLAN, minutes: null, settle: 0, warm: 0, startBell: false, endBell: false, every: 0, descentMinutes: minutes ?? OPEN_DESCENT };
}

/** When the sound ends (ms from the start): the timer's end, or null until you stop. */
export const listenEnd = (minutes: number | null): number | null => (minutes === null ? null : minutes * MIN);

/** Stop: fade out from now, or end sooner if the timer already would. */
export function stopAt(elapsedMs: number, endMs: number | null, fadeMs = FADE_MS): number {
  return Math.min(endMs ?? Infinity, elapsedMs + fadeMs);
}

export type ListenState = { done: boolean; /** Ms left on the timer, or null. */ leftMs: number | null };

export function listenState(elapsedMs: number, endMs: number | null): ListenState {
  return { done: endMs !== null && elapsedMs >= endMs, leftMs: endMs === null ? null : Math.max(0, endMs - elapsedMs) };
}

/** What the log is opened with when you keep a listen: a "Listening" sit. */
export function listenLogParams(startedAt: number, listenedMs: number): Record<string, string> {
  return { at: new Date(startedAt).toISOString(), minutes: String(minutesSat(listenedMs)), timed: '1', kind: 'listening' };
}

export const LISTEN_NOTE =
  'Sound plays only while this screen is open. In the app it pauses if you switch to another app or lock the phone (there’s no playing in the background); a browser may hold it back in a hidden tab. Press Play to go on.';
