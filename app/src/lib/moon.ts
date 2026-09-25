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
