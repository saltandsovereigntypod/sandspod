// Honest numbers for the psychic-development exercises. A guess is compared
// with what chance alone would give: the exact binomial tail (or, when the
// chance differs from trial to trial, the exact Poisson-binomial tail). We
// only ever say "above chance" when p < 0.05 over at least 50 trials; we never
// say whether anyone is or isn't psychic. Also the streaks, time-of-day and
// moon-phase slices the progress page shows. Pure, so it can be tested.

import { moonState, type PhaseName } from '../../moon.ts';

/** The fewest trials before we say anything beyond "too few to tell". */
export const MIN_TRIALS = 50;
export const ALPHA = 0.05;

/** ln(n!) by summing logs (n is a few hundred at most). */
const lnFact = (n: number) => {
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log(i);
  return s;
};

/** P(X >= hits) for X ~ Binomial(trials, p): the chance of doing at least this well by luck alone. */
export function binomialP(hits: number, trials: number, p: number): number {
  if (trials <= 0 || hits <= 0) return 1;
  if (hits > trials) return 0;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const lf = lnFact(trials);
  let total = 0;
  for (let k = hits; k <= trials; k++) {
    total += Math.exp(lf - lnFact(k) - lnFact(trials - k) + k * Math.log(p) + (trials - k) * Math.log(1 - p));
  }
  return Math.min(1, total);
}

/** The same tail when each trial has its own chance (a mix of modes): the exact Poisson-binomial. */
export function poissonBinomialP(hits: number, probs: readonly number[]): number {
  if (hits <= 0 || !probs.length) return 1;
  if (hits > probs.length) return 0;
  let dist = [1];
  for (const p of probs) {
    const next = new Array(dist.length + 1).fill(0);
    for (let k = 0; k < dist.length; k++) {
      next[k] += dist[k] * (1 - p);
      next[k + 1] += dist[k] * p;
    }
    dist = next;
  }
  let tail = 0;
  for (let k = hits; k < dist.length; k++) tail += dist[k];
  return Math.min(1, Math.max(0, tail));
}

/** One scored run: how many trials, how many hits, and the chance of a hit on each trial. */
export type Scored = { trials: number; hits: number; chance: number };

export type Verdict = {
  trials: number;
  hits: number;
  /** Hits expected by chance alone. */
  expected: number;
  rate: number;
  p: number;
  /** 'none' no trials yet; 'few' under 50; 'chance' in line with chance; 'above' p < 0.05 with 50 or more trials. */
  level: 'none' | 'few' | 'chance' | 'above';
  words: string;
};

const pText = (p: number) => (p < 0.001 ? 'p < 0.001' : `p = ${p.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}`);

/** Plain wording for a set of runs against chance. Never claims anyone is, or is not, psychic. */
export function verdict(runs: readonly Scored[]): Verdict {
  const probs: number[] = [];
  let hits = 0;
  for (const r of runs) {
    for (let i = 0; i < r.trials; i++) probs.push(r.chance);
    hits += r.hits;
  }
  const trials = probs.length;
  const expected = probs.reduce((a, b) => a + b, 0);
  if (!trials) return { trials: 0, hits: 0, expected: 0, rate: 0, p: 1, level: 'none', words: 'No trials yet. Your results will appear here.' };
  const same = probs.every((x) => Math.abs(x - probs[0]) < 1e-12);
  const p = same ? binomialP(hits, trials, probs[0]) : poissonBinomialP(hits, probs);
  const rate = hits / trials;
  const exp = `${hits} hits in ${trials} trials; chance alone gives about ${expected.toFixed(1)}`;
  if (trials < MIN_TRIALS) {
    return { trials, hits, expected, rate, p, level: 'few', words: `${exp}. Too few trials to say anything yet: it takes at least ${MIN_TRIALS} before a pattern means much.` };
  }
  if (p < ALPHA && hits > expected) {
    return { trials, hits, expected, rate, p, level: 'above', words: `Your results are above chance (${pText(p)} over ${trials} trials). ${exp}. A result like this can still be luck, and it does not say why; the honest test is whether it holds over more trials.` };
  }
  return { trials, hits, expected, rate, p, level: 'chance', words: `Your results so far are in line with chance (${exp}).` };
}

// ─── Slices ─────────────────────────────────────────────────────────────────

export type Logged = Scored & {
  /** Local day "YYYY-MM-DD". */
  date: string;
  /** The moment, ISO. */
  at: string;
  moonPhase?: string;
};

/** Per day: trials, hits and the share, in date order, for the progress bars. */
export function byDay(runs: readonly Logged[]): { date: string; trials: number; hits: number; rate: number }[] {
  const map = new Map<string, { trials: number; hits: number }>();
  for (const r of runs) {
    const cur = map.get(r.date) ?? { trials: 0, hits: 0 };
    cur.trials += r.trials;
    cur.hits += r.hits;
    map.set(r.date, cur);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, ...v, rate: v.trials ? v.hits / v.trials : 0 }));
}

const dayNumber = (key: string) => Math.round(Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10)) / 86_400_000);

/** Streaks of days with at least one session: the current one (still alive if yesterday or today had one) and the longest. */
export function streaks(dates: readonly string[], today: string): { current: number; longest: number } {
  const days = [...new Set(dates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))].map(dayNumber).sort((a, b) => a - b);
  let longest = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && days[i] === days[i - 1] + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  const last = days[days.length - 1];
  const t = dayNumber(today);
  let current = 0;
  if (last !== undefined && last >= t - 1) {
    current = 1;
    for (let i = days.length - 2; i >= 0 && days[i] === days[i + 1] - 1; i--) current++;
  }
  return { current, longest };
}

export const TIMES_OF_DAY = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;
export type TimeOfDay = (typeof TIMES_OF_DAY)[number];

/** 5am to noon, noon to 5pm, 5pm to 10pm, otherwise night. */
export function timeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 22) return 'Evening';
  return 'Night';
}

export type Slice = { label: string; trials: number; hits: number; rate: number; /** Hit rate minus what chance gives. */ edge: number };

function slices(runs: readonly Logged[], key: (r: Logged) => string | null, order: readonly string[]): Slice[] {
  const map = new Map<string, { trials: number; hits: number; expected: number }>();
  for (const r of runs) {
    const k = key(r);
    if (!k || !r.trials) continue;
    const cur = map.get(k) ?? { trials: 0, hits: 0, expected: 0 };
    cur.trials += r.trials;
    cur.hits += r.hits;
    cur.expected += r.trials * r.chance;
    map.set(k, cur);
  }
  return order
    .filter((k) => map.has(k))
    .map((k) => {
      const v = map.get(k)!;
      return { label: k, trials: v.trials, hits: v.hits, rate: v.hits / v.trials, edge: (v.hits - v.expected) / v.trials };
    });
}

/** Hit rate by time of day, with each slice's edge over chance. */
export const byTimeOfDay = (runs: readonly Logged[]): Slice[] =>
  slices(
    runs,
    (r) => {
      const h = new Date(r.at).getHours();
      return Number.isNaN(h) ? null : timeOfDay(h);
    },
    TIMES_OF_DAY,
  );

export const MOON_PHASES: readonly PhaseName[] = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];

/** The moon's phase at a moment (the app's own moon lib). */
export const phaseAt = (at: Date): PhaseName => moonState(at).name;

/** Hit rate by moon phase at the time of the session. */
export const byMoonPhase = (runs: readonly Logged[]): Slice[] => slices(runs, (r) => r.moonPhase ?? null, MOON_PHASES);

/** The slice with the biggest edge over chance, only when there are at least two with enough trials to compare. */
export function bestSlice(list: readonly Slice[], minTrials = 20): Slice | null {
  const ok = list.filter((s) => s.trials >= minTrials);
  if (ok.length < 2) return null;
  return ok.reduce((a, b) => (b.edge > a.edge ? b : a));
}
