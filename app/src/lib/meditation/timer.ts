// The meditation timer and breath pacing: how long a sit is, where it stands
// at any moment, and when its bells ring. Everything is worked out from the
// moment it began (and any time spent paused), never by counting ticks, so a
// sit stays true when the phone sleeps, the app is put away or the browser
// tab is hidden. Shown at Craft → Meditation (app/src/app/(tabs)/rituals/
// craft/meditation/) and on the website at /practice/meditation/, over the
// altar ("Meditate here") and in a sit together. Pure, so it can be tested.

export const LENGTHS = [5, 10, 15, 20, 30, 45, 60] as const;
export const SETTLE_CHOICES = [0, 1, 2, 3, 5] as const;
export const INTERVAL_CHOICES = [0, 2, 3, 5, 10, 15] as const;
export const MAX_MINUTES = 240;
const MIN = 60_000;

/** How the bells are given: the altar bell's chime (vibration with it, if that's on), or only a vibration. */
export type Signal = 'bell' | 'vibrate';

export type SitPlan = {
  /** The sit itself, in minutes; null is open-ended (it goes on until you end it). */
  minutes: number | null;
  /** Minutes to settle in before the sit begins. */
  settle: number;
  /** Minutes to come back after it ends. */
  warm: number;
  startBell: boolean;
  endBell: boolean;
  /** A bell every this many minutes during the sit; 0 for none. */
  every: number;
  signal: Signal;
  /** How long the binaural slow descent takes, in minutes, when it isn't the sit's length (Listen). */
  descentMinutes?: number;
};

export const DEFAULT_PLAN: SitPlan = { minutes: 10, settle: 0, warm: 0, startBell: true, endBell: true, every: 0, signal: 'bell' };

const whole = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};

export function cleanPlan(raw: unknown): SitPlan {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof SitPlan, unknown>>;
  const open = p.minutes === null || p.minutes === 'open';
  return {
    minutes: open ? null : whole(p.minutes, 1, MAX_MINUTES, DEFAULT_PLAN.minutes!),
    settle: whole(p.settle, 0, 30, 0),
    warm: whole(p.warm, 0, 30, 0),
    startBell: p.startBell !== false && p.startBell !== 'false',
    endBell: p.endBell !== false && p.endBell !== 'false',
    every: whole(p.every, 0, 60, 0),
    signal: p.signal === 'vibrate' ? 'vibrate' : 'bell',
  };
}

/** The plan as plain strings, for a link or route params (read back with cleanPlan). */
export function planParams(plan: SitPlan): Record<string, string> {
  return {
    minutes: plan.minutes === null ? 'open' : String(plan.minutes),
    settle: String(plan.settle),
    warm: String(plan.warm),
    startBell: String(plan.startBell),
    endBell: String(plan.endBell),
    every: String(plan.every),
    signal: plan.signal,
  };
}

// ─── The clock ───────────────────────────────────────────────────────────

/** When it began (ms), and time spent paused: enough to know where it stands at any moment. */
export type SitClock = { startedAt: number; pausedAt: number | null; pausedMs: number };

export const startClock = (now: number): SitClock => ({ startedAt: now, pausedAt: null, pausedMs: 0 });
export const pauseClock = (c: SitClock, now: number): SitClock => (c.pausedAt === null ? { ...c, pausedAt: now } : c);
export const resumeClock = (c: SitClock, now: number): SitClock => (c.pausedAt === null ? c : { ...c, pausedAt: null, pausedMs: c.pausedMs + Math.max(0, now - c.pausedAt) });
/** Time gone by in the sit (pauses left out). */
export const elapsedOf = (c: SitClock, now: number) => Math.max(0, (c.pausedAt ?? now) - c.startedAt - c.pausedMs);

export type Phase = 'settle' | 'sit' | 'warm' | 'done';

export type SitState = {
  phase: Phase;
  /** All the time gone by, settling and coming back included. */
  elapsedMs: number;
  /** Time in the sit itself so far. */
  sitMs: number;
  /** Left of this part (settling, the sit, coming back); null while an open-ended sit goes on. */
  phaseLeftMs: number | null;
  /** Left of the whole thing; null while an open-ended sit goes on. */
  leftMs: number | null;
};

/** Where a sit stands `elapsedMs` in. An open-ended sit stays in its sit until it's ended (`endedAtMs`, the elapsed time when it was). */
export function sitStateAt(plan: SitPlan, elapsedMs: number, endedAtMs: number | null = null): SitState {
  const settle = plan.settle * MIN;
  const warm = plan.warm * MIN;
  const e = Math.max(0, elapsedMs);
  if (e < settle) {
    const total = plan.minutes === null ? null : settle + plan.minutes * MIN + warm;
    return { phase: 'settle', elapsedMs: e, sitMs: 0, phaseLeftMs: settle - e, leftMs: total === null ? null : total - e };
  }
  const sitLength = plan.minutes === null ? (endedAtMs === null ? null : Math.max(0, endedAtMs - settle)) : plan.minutes * MIN;
  if (sitLength === null) return { phase: 'sit', elapsedMs: e, sitMs: e - settle, phaseLeftMs: null, leftMs: null };
  const sitEnd = settle + sitLength;
  if (e < sitEnd) return { phase: 'sit', elapsedMs: e, sitMs: e - settle, phaseLeftMs: sitEnd - e, leftMs: sitEnd + warm - e };
  if (e < sitEnd + warm) return { phase: 'warm', elapsedMs: e, sitMs: sitLength, phaseLeftMs: sitEnd + warm - e, leftMs: sitEnd + warm - e };
  return { phase: 'done', elapsedMs: e, sitMs: sitLength, phaseLeftMs: 0, leftMs: 0 };
}

/** Where a sit stands now, by its clock. */
export const sitState = (plan: SitPlan, clock: SitClock, now: number, endedAtMs: number | null = null) => sitStateAt(plan, elapsedOf(clock, now), endedAtMs);

/** The whole length (settling, the sit and coming back) in ms, or null when open-ended. */
export const totalMs = (plan: SitPlan) => (plan.minutes === null ? null : (plan.settle + plan.minutes + plan.warm) * MIN);

// ─── Bells ───────────────────────────────────────────────────────────────

export type BellKind = 'start' | 'interval' | 'end';
/** A bell `atMs` into the sit (pauses left out), rung `times` times. */
export type Bell = { atMs: number; kind: BellKind; times: number };

/** One chime to begin and for each interval; three to end, as many meditation bells are rung. */
export const BELL_TIMES: Record<BellKind, number> = { start: 1, interval: 1, end: 3 };
/** An open-ended sit's interval bells are worked out this far ahead. */
const OPEN_HORIZON = MAX_MINUTES * MIN;

/** Every bell the plan rings, in order. The end bell of an open-ended sit rings when it's ended, not here. */
export function bellsOf(plan: SitPlan): Bell[] {
  const settle = plan.settle * MIN;
  const out: Bell[] = [];
  if (plan.startBell) out.push({ atMs: settle, kind: 'start', times: BELL_TIMES.start });
  const length = plan.minutes === null ? OPEN_HORIZON : plan.minutes * MIN;
  if (plan.every > 0) {
    for (let t = plan.every * MIN; t < length; t += plan.every * MIN) out.push({ atMs: settle + t, kind: 'interval', times: BELL_TIMES.interval });
  }
  if (plan.endBell && plan.minutes !== null) out.push({ atMs: settle + length, kind: 'end', times: BELL_TIMES.end });
  return out;
}

/** How long after its moment a bell may still ring; any older (passed while the app was away) stays quiet. */
export const BELL_GRACE_MS = 4000;

/**
 * The bells to ring now: those whose moment came after the last look
 * (`fromMs`) and up to now (`toMs`), and only the latest of them, and only
 * if it's fresh. Coming back to the app after the end bell's moment rings
 * nothing; the notification already did.
 */
export function bellsDue(bells: Bell[], fromMs: number, toMs: number, graceMs = BELL_GRACE_MS): Bell[] {
  const passed = bells.filter((b) => b.atMs > fromMs && b.atMs <= toMs);
  const last = passed[passed.length - 1];
  return last && toMs - last.atMs <= graceMs ? [last] : [];
}

/** When the end bell rings in clock time (ms), for a notification while the app is away; null when there isn't one to come. */
export function endBellAt(plan: SitPlan, clock: SitClock, now: number): number | null {
  if (plan.minutes === null || !plan.endBell || clock.pausedAt !== null) return null;
  const at = clock.startedAt + clock.pausedMs + (plan.settle + plan.minutes) * MIN;
  return at > now ? at : null;
}

/** "12:05", or "1:02:05" past the hour. */
export function clockLabel(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** Minutes sat, rounded, at least 1 for anything begun. */
export const minutesSat = (sitMs: number) => Math.max(1, Math.round(sitMs / MIN));

/** What the plan is, in a line: "20 minutes · 2 to settle · a bell every 5". */
export function planLine(plan: SitPlan): string {
  const parts = [plan.minutes === null ? 'Open-ended' : `${plan.minutes} ${plan.minutes === 1 ? 'minute' : 'minutes'}`];
  if (plan.settle) parts.push(`${plan.settle} to settle`);
  if (plan.warm) parts.push(`${plan.warm} to come back`);
  if (plan.every) parts.push(`a bell every ${plan.every}`);
  if (!plan.startBell && !plan.endBell && !plan.every) parts.push('no bells');
  else if (plan.signal === 'vibrate') parts.push('vibration only');
  return parts.join(' · ');
}

export const PHASE_WORDS: Record<Phase, string> = {
  settle: 'Settling in',
  sit: 'Sitting',
  warm: 'Coming back',
  done: 'Finished',
};

// ─── Breath pacing ───────────────────────────────────────────────────────

/** Seconds for each part of a breath: in, hold full, out, hold empty. */
export type BreathPattern = { inhale: number; hold: number; exhale: number; rest: number };
export type BreathId = 'box' | '478' | 'custom';

export const BREATHS: { id: BreathId; label: string; line: string; pattern: BreathPattern }[] = [
  { id: 'box', label: 'Box breathing', line: 'In for 4, hold for 4, out for 4, hold for 4.', pattern: { inhale: 4, hold: 4, exhale: 4, rest: 4 } },
  { id: '478', label: '4-7-8', line: 'In for 4, hold for 7, out slowly for 8.', pattern: { inhale: 4, hold: 7, exhale: 8, rest: 0 } },
  { id: 'custom', label: 'Your own', line: 'Choose the count for each part.', pattern: { inhale: 4, hold: 2, exhale: 6, rest: 0 } },
];

export function cleanBreath(raw: unknown): BreathPattern {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof BreathPattern, unknown>>;
  return { inhale: whole(p.inhale, 1, 20, 4), hold: whole(p.hold, 0, 20, 0), exhale: whole(p.exhale, 1, 20, 4), rest: whole(p.rest, 0, 20, 0) };
}

export type BreathStage = 'in' | 'hold' | 'out' | 'rest';
export const BREATH_WORDS: Record<BreathStage, string> = { in: 'Breathe in', hold: 'Hold', out: 'Breathe out', rest: 'Rest' };

/** Where the breath is `ms` in: the stage, how full the circle is (0 to 1), seconds left of the stage, and which breath. */
export function breathAt(p: BreathPattern, ms: number): { stage: BreathStage; scale: number; left: number; cycle: number } {
  const parts: [BreathStage, number][] = [
    ['in', p.inhale],
    ['hold', p.hold],
    ['out', p.exhale],
    ['rest', p.rest],
  ];
  const cycleMs = (p.inhale + p.hold + p.exhale + p.rest) * 1000;
  const e = Math.max(0, ms);
  const cycle = Math.floor(e / cycleMs);
  let t = e - cycle * cycleMs;
  for (const [stage, seconds] of parts) {
    const len = seconds * 1000;
    if (!len) continue;
    if (t < len) {
      const f = t / len;
      const scale = stage === 'in' ? f : stage === 'hold' ? 1 : stage === 'out' ? 1 - f : 0;
      return { stage, scale, left: Math.ceil((len - t) / 1000), cycle };
    }
    t -= len;
  }
  return { stage: 'in', scale: 0, left: p.inhale, cycle: cycle + 1 };
}

export const breathLine = (p: BreathPattern) => [p.inhale, p.hold, p.exhale, p.rest].join('-');
