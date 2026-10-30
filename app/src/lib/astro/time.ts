// Time for charts: ΔT (the gap between clock time and the even time the
// planets keep), and the historical UTC offset of a place at a moment, from
// its IANA time-zone name through the platform's own time-zone database
// (Intl.DateTimeFormat with `timeZone`). Pure: no React, no storage.
//
// Where the offset comes from: browsers, Node and Hermes (iOS and Android)
// all carry the IANA database, which records every change of offset and
// summer time back to the 1800s (before standard time a zone reports local
// mean time). `zonesWork()` checks the engine really does this; when it
// doesn't, the chart form asks for the offset by hand. Limits, said plainly
// in Help: the database is very good from 1970 and good but not perfect
// before (some wartime and local rules were patchy), and a single zone
// stands for a whole region, so a town that kept different clocks from its
// neighbours in, say, 1950 may need the offset corrected by hand.

const DAY_MS = 86_400_000;

/** a0 + a1·x + a2·x² + … */
const poly = (x: number, coefficients: number[]) => coefficients.reduceRight((sum, c) => sum * x + c, 0);

// [from year, to year, the year x counts from, coefficients of x⁰, x¹, …]
// (Each span written as data: a minifier once renamed a parameter onto the
// block-scoped variable of the old if-chain and broke it.)
const DELTA_T: [number, number, number, number[]][] = [
  [1800, 1860, 1800, [13.72, -0.332447, 0.0068612, 0.0041116, -0.00037436, 0.0000121272, -0.0000001699, 0.000000000875]],
  [1860, 1900, 1860, [7.62, 0.5737, -0.251754, 0.01680668, -0.0004473624, 1 / 233174]],
  [1900, 1920, 1900, [-2.79, 1.494119, -0.0598939, 0.0061966, -0.000197]],
  [1920, 1941, 1920, [21.2, 0.84493, -0.0761, 0.0020936]],
  [1941, 1961, 1950, [29.07, 0.407, -1 / 233, 1 / 2547]],
  [1961, 1986, 1975, [45.45, 1.067, -1 / 260, -1 / 718]],
  [1986, 2005, 2000, [63.86, 0.3345, -0.060374, 0.0017275, 0.000651814, 0.00002373599]],
  [2005, 2050, 2000, [62.92, 0.32217, 0.005589]],
];

/**
 * ΔT = TT − UT in seconds for a decimal year (Espenak & Meeus, "Five
 * Millennium Canon of Solar Eclipses", polynomial expressions, 2006).
 */
export function deltaT(year: number): number {
  for (const [from, to, origin, coefficients] of DELTA_T) {
    if (year >= from && year < to) return poly(year - origin, coefficients);
  }
  const u = (year - 1820) / 100;
  if (year >= 2050 && year < 2150) return -20 + 32 * u * u - 0.5628 * (2150 - year);
  return -20 + 32 * u * u;
}

export const decimalYear = (date: Date) => 1970 + date.getTime() / (365.2425 * DAY_MS);

/** The same moment in Terrestrial Time, as a Date (for the planet tables, which run on even time). */
export function toTT(date: Date): Date {
  return new Date(date.getTime() + deltaT(decimalYear(date)) * 1000);
}

// ── Time zones ───────────────────────────────────────────────────────────

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(zone: string): Intl.DateTimeFormat | null {
  let f = formatters.get(zone);
  if (f) return f;
  try {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      era: 'short',
    });
  } catch {
    return null;
  }
  formatters.set(zone, f);
  return f;
}

/**
 * The offset from UTC, in minutes east (UTC+1 is 60), that `zone` kept at
 * the moment `utc`. Local mean time before standard time gives seconds too
 * (New York in 1850: −296.03). Null when the zone is unknown here.
 */
export function zoneOffsetAt(zone: string, utc: Date): number | null {
  const f = formatter(zone);
  if (!f || !Number.isFinite(utc.getTime())) return null;
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = f.formatToParts(utc);
  } catch {
    return null;
  }
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  let year = Number(get('year'));
  if (/^b/i.test(get('era'))) year = 1 - year;
  const hour = Number(get('hour')) % 24;
  const wall = Date.UTC(year, Number(get('month')) - 1, Number(get('day')), hour, Number(get('minute')), Number(get('second')));
  // Date.UTC treats years 0–99 as 1900s; never needed for charts.
  if (!Number.isFinite(wall)) return null;
  const whole = Math.floor(utc.getTime() / 1000) * 1000;
  return (wall - whole) / 60_000;
}

/** Whether this engine's time-zone database works (checked once): New York in winter and summer, and London in 1971 (British Standard Time, UTC+1 all year). */
let zonesChecked: boolean | null = null;
export function zonesWork(): boolean {
  if (zonesChecked === null) {
    zonesChecked =
      zoneOffsetAt('America/New_York', new Date(Date.UTC(2021, 0, 15, 12))) === -300 &&
      zoneOffsetAt('America/New_York', new Date(Date.UTC(2021, 6, 15, 12))) === -240 &&
      zoneOffsetAt('Europe/London', new Date(Date.UTC(1970, 0, 15, 12))) === 60;
  }
  return zonesChecked;
}

export type LocalToUtc = {
  /** The moment in UTC. */
  utc: Date;
  /** The offset used, minutes east of UTC. */
  offsetMinutes: number;
  /**
   * 'gap': that clock time never happened (the clocks jumped forward over
   * it); the offset before the jump is used. 'overlap': it happened twice
   * (the clocks went back); the first, summer-time one is used.
   */
  note: 'gap' | 'overlap' | null;
  /** In an overlap, the other possible offset. */
  otherOffset: number | null;
};

/**
 * A wall-clock time in `zone` to UTC. `wall` is the local date and time
 * written as if it were UTC (Date.UTC(year, month - 1, day, hour, minute)).
 */
export function localToUtc(wall: number, zone: string): LocalToUtc | null {
  // The offsets in force a day either side bracket every possibility.
  const before = zoneOffsetAt(zone, new Date(wall - DAY_MS));
  const after = zoneOffsetAt(zone, new Date(wall + DAY_MS));
  if (before === null || after === null) return null;
  const candidates = [...new Set([before, after])]
    .map((offset) => ({ offset, utc: wall - offset * 60_000 }))
    .filter(({ offset, utc }) => zoneOffsetAt(zone, new Date(utc)) === offset);
  if (candidates.length === 0) {
    // In the gap: no offset fits. Read it with the offset from before the change.
    return { utc: new Date(wall - before * 60_000), offsetMinutes: before, note: 'gap', otherOffset: null };
  }
  if (candidates.length === 2) {
    // Twice over: take the earlier moment (the summer-time reading).
    candidates.sort((a, b) => a.utc - b.utc);
    return { utc: new Date(candidates[0].utc), offsetMinutes: candidates[0].offset, note: 'overlap', otherOffset: candidates[1].offset };
  }
  return { utc: new Date(candidates[0].utc), offsetMinutes: candidates[0].offset, note: null, otherOffset: null };
}

/** Local mean time at a longitude: the Sun's own clock, used before standard time zones. Minutes east of UTC. */
export const localMeanTimeOffset = (longitude: number) => Math.round(longitude * 4 * 100) / 100;
