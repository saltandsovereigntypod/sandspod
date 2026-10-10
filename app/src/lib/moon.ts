// Moon phase calculations.
//
// Principal phase times use Jean Meeus, "Astronomical Algorithms" (2nd ed.),
// chapter 49, with the main periodic terms. That is accurate to within a few
// minutes, which is plenty for "Full Moon tomorrow" and reminders. Planetary
// correction terms and ΔT (about a minute) are left out on purpose.

export type PrincipalPhase = 'new' | 'firstQuarter' | 'full' | 'lastQuarter';

export type PhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export type PhaseEvent = { phase: PrincipalPhase; date: Date };

export type MoonState = {
  name: PhaseName;
  /** 0 = new, 0.5 = full, approaching 1 = next new. */
  fraction: number;
  /** Lit portion of the disc, 0 to 1. */
  illumination: number;
  waxing: boolean;
};

const RAD = Math.PI / 180;
const PHASE_OFFSET: Record<PrincipalPhase, number> = {
  new: 0,
  firstQuarter: 0.25,
  full: 0.5,
  lastQuarter: 0.75,
};
const PHASE_ORDER: PrincipalPhase[] = ['new', 'firstQuarter', 'full', 'lastQuarter'];
const SYNODIC_DAYS = 29.530588861;
const DAY_MS = 86_400_000;

function julianDayToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * DAY_MS);
}

function dateToJulianDay(date: Date): number {
  return date.getTime() / DAY_MS + 2440587.5;
}

/** Julian Ephemeris Day of lunation `k` (k integer = new moon, +0.25 steps for other phases). */
function phaseJde(k: number, phase: PrincipalPhase): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  let jde =
    2451550.09766 + SYNODIC_DAYS * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4;

  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3) * RAD;
  const Mp =
    (201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4) * RAD;
  const F =
    (160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4) * RAD;
  const Om = (124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3) * RAD;
  const sin = Math.sin;

  if (phase === 'new' || phase === 'full') {
    const newMoon = phase === 'new';
    jde +=
      (newMoon ? -0.4072 : -0.40614) * sin(Mp) +
      (newMoon ? 0.17241 : 0.17302) * E * sin(M) +
      (newMoon ? 0.01608 : 0.01614) * sin(2 * Mp) +
      (newMoon ? 0.01039 : 0.01043) * sin(2 * F) +
      (newMoon ? 0.00739 : 0.00734) * E * sin(Mp - M) -
      (newMoon ? 0.00514 : 0.00515) * E * sin(Mp + M) +
      (newMoon ? 0.00208 : 0.00209) * E * E * sin(2 * M) -
      0.00111 * sin(Mp - 2 * F) -
      0.00057 * sin(Mp + 2 * F) +
      0.00056 * E * sin(2 * Mp + M) -
      0.00042 * sin(3 * Mp) +
      0.00042 * E * sin(M + 2 * F) +
      0.00038 * E * sin(M - 2 * F) -
      0.00024 * E * sin(2 * Mp - M) -
      0.00017 * sin(Om);
  } else {
    jde +=
      -0.62801 * sin(Mp) +
      0.17172 * E * sin(M) -
      0.01183 * E * sin(Mp + M) +
      0.00862 * sin(2 * Mp) +
      0.00804 * sin(2 * F) +
      0.00454 * E * sin(Mp - M) +
      0.00204 * E * E * sin(2 * M) -
      0.0018 * sin(Mp - 2 * F) -
      0.0007 * sin(Mp + 2 * F) -
      0.0004 * sin(3 * Mp) -
      0.00034 * E * sin(2 * Mp - M) +
      0.00032 * E * sin(M + 2 * F) +
      0.00032 * E * sin(M - 2 * F) -
      0.00028 * E * E * sin(Mp + 2 * M) +
      0.00027 * E * sin(2 * Mp + M) -
      0.00017 * sin(Om);
    const W =
      0.00306 -
      0.00038 * E * Math.cos(M) +
      0.00026 * Math.cos(Mp) -
      0.00002 * Math.cos(Mp - M) +
      0.00002 * Math.cos(Mp + M) +
      0.00002 * Math.cos(2 * F);
    jde += phase === 'firstQuarter' ? W : -W;
  }
  return jde;
}

function lunationNear(date: Date): number {
  return Math.floor((dateToJulianDay(date) - 2451550.09766) / SYNODIC_DAYS);
}

/** Principal phases strictly after `from`, in order. */
export function upcomingPhases(from: Date, count: number): PhaseEvent[] {
  const events: PhaseEvent[] = [];
  let k = lunationNear(from) - 1;
  while (events.length < count) {
    for (const phase of PHASE_ORDER) {
      const date = julianDayToDate(phaseJde(k + PHASE_OFFSET[phase], phase));
      if (date.getTime() > from.getTime()) events.push({ phase, date });
      if (events.length === count) break;
    }
    k += 1;
  }
  return events;
}

/** The next occurrence of one principal phase after `from`. */
export function nextPhase(from: Date, phase: PrincipalPhase): Date {
  let k = lunationNear(from) - 1;
  for (;;) {
    const date = julianDayToDate(phaseJde(k + PHASE_OFFSET[phase], phase));
    if (date.getTime() > from.getTime()) return date;
    k += 1;
  }
}

/** The principal phase at or before `at`, and the one after it. */
function surroundingPhases(at: Date): [PhaseEvent, PhaseEvent] {
  let k = lunationNear(at) - 1;
  let previous: PhaseEvent | null = null;
  for (;;) {
    for (const phase of PHASE_ORDER) {
      const event = { phase, date: julianDayToDate(phaseJde(k + PHASE_OFFSET[phase], phase)) };
      if (event.date.getTime() > at.getTime()) {
        if (previous) return [previous, event];
      } else {
        previous = event;
      }
    }
    k += 1;
  }
}

// Within this many hours of a principal phase, call the moon by that phase.
const PRINCIPAL_WINDOW_HOURS = 18;

export function moonState(at: Date): MoonState {
  const [before, after] = surroundingPhases(at);
  // Interpolate between the two principal phases so full sits exactly at 0.5.
  const span = after.date.getTime() - before.date.getTime();
  const fraction =
    (PHASE_OFFSET[before.phase] + (0.25 * (at.getTime() - before.date.getTime())) / span) % 1;
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  const waxing = fraction < 0.5;

  const windowMs = PRINCIPAL_WINDOW_HOURS * 3_600_000;
  for (const event of [before, after]) {
    if (Math.abs(event.date.getTime() - at.getTime()) <= windowMs) {
      return { name: PRINCIPAL_NAMES[event.phase], fraction, illumination, waxing };
    }
  }

  const name: PhaseName =
    fraction < 0.25
      ? 'Waxing Crescent'
      : fraction < 0.5
        ? 'Waxing Gibbous'
        : fraction < 0.75
          ? 'Waning Gibbous'
          : 'Waning Crescent';
  return { name, fraction, illumination, waxing };
}

export const PRINCIPAL_NAMES: Record<PrincipalPhase, PhaseName> = {
  new: 'New Moon',
  firstQuarter: 'First Quarter',
  full: 'Full Moon',
  lastQuarter: 'Last Quarter',
};

const SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

export type ZodiacSign = (typeof SIGNS)[number];

/** Apparent tropical longitude of the Sun in degrees (Meeus ch. 25, low precision). */
function sunLongitude(date: Date): number {
  const T = (dateToJulianDay(date) - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * RAD;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);
  const omega = (125.04 - 1934.136 * T) * RAD;
  const apparent = L0 + C - 0.00569 - 0.00478 * Math.sin(omega);
  return ((apparent % 360) + 360) % 360;
}

/**
 * Zodiac sign of the Moon at a new or full moon. At new moon the Moon shares
 * the Sun's longitude; at full moon it sits opposite. Not valid for other phases.
 */
export function signAtSyzygy(date: Date, phase: 'new' | 'full'): ZodiacSign {
  const longitude = (sunLongitude(date) + (phase === 'full' ? 180 : 0)) % 360;
  return SIGNS[Math.floor(longitude / 30)];
}

// ─── The Moon's own position ─────────────────────────────────────────────
// Meeus chapter 47 with the larger periodic terms of table 47.A (those of
// 0.0005° and up) and the A1/A2 additive terms. Good to about 0.01°, so the
// sign is right except within a minute or so of the Moon changing sign.

// [D, M, M', F, coefficient in 0.000001°]
const MOON_LONGITUDE_TERMS: [number, number, number, number, number][] = [
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
  [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
  [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
  [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
  [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
  [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
  [2, 1, 1, 0, -810], [4, -1, -2, 0, 759], [0, 2, -1, 0, -713], [2, 2, -1, 0, -700],
  [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
  [4, -1, 0, 0, 520], [1, 0, -2, 0, -487],
];

/** Apparent geocentric tropical longitude of the Moon in degrees. */
export function moonLongitude(date: Date): number {
  const T = (dateToJulianDay(date) - 2451545.0) / 36525;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000;
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000;
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.29 * T;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;

  let sum = 0;
  for (const [d, m, mp, f, coefficient] of MOON_LONGITUDE_TERMS) {
    const eccentricity = Math.abs(m) === 2 ? E * E : Math.abs(m) === 1 ? E : 1;
    sum += coefficient * eccentricity * Math.sin((d * D + m * M + mp * Mp + f * F) * RAD);
  }
  sum += 3958 * Math.sin(A1 * RAD) + 1962 * Math.sin((Lp - F) * RAD) + 318 * Math.sin(A2 * RAD);

  const omega = (125.04452 - 1934.136261 * T) * RAD;
  const nutation = -0.00478 * Math.sin(omega);
  const longitude = Lp + sum / 1_000_000 + nutation;
  return ((longitude % 360) + 360) % 360;
}

export function moonSign(date: Date): ZodiacSign {
  return SIGNS[Math.floor(moonLongitude(date) / 30) % 12];
}

/** When the Moon next enters a new sign (it spends about two and a half days in each). */
export function nextMoonIngress(from: Date): { sign: ZodiacSign; date: Date } {
  const start = moonSign(from);
  const stepMs = 2 * 3_600_000;
  let low = from.getTime();
  let high = low + stepMs;
  // The Moon never stays in one sign as long as four days.
  while (moonSign(new Date(high)) === start && high - from.getTime() < 4 * DAY_MS) {
    low = high;
    high += stepMs;
  }
  while (high - low > 30_000) {
    const mid = (low + high) / 2;
    if (moonSign(new Date(mid)) === start) low = mid;
    else high = mid;
  }
  return { sign: moonSign(new Date(high)), date: new Date(high) };
}

/**
 * The moment the Sun reaches `longitude` (0 = March equinox, 90 = June
 * solstice, 180 = September equinox, 270 = December solstice) in `year`.
 */
export function sunReaches(year: number, longitude: 0 | 90 | 180 | 270): Date {
  const month = { 0: 2, 90: 5, 180: 8, 270: 11 }[longitude];
  let low = Date.UTC(year, month, 15);
  let high = Date.UTC(year, month, 27);
  const past = (time: number) => {
    const delta = (((sunLongitude(new Date(time)) - longitude) % 360) + 540) % 360 - 180;
    return delta >= 0;
  };
  while (high - low > 60_000) {
    const mid = (low + high) / 2;
    if (past(mid)) high = mid;
    else low = mid;
  }
  return new Date(high);
}
