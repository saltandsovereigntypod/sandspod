// A birth chart: the moment of birth from a local date, time and UTC offset,
// the Sun-to-Pluto signs from the app's ephemeris, and the Ascendant and
// Midheaven from local sidereal time and the obliquity of the ecliptic
// (Meeus, "Astronomical Algorithms", chapters 12 and 22, and the standard
// house-cusp formulas). Pure: no React, no storage.

import { dateToJulianDay, type ZodiacSign } from '../../moon.ts';
import { planetLongitude, PLANETS, signOf, type Planet } from '../../astro/planets.ts';

const RAD = Math.PI / 180;
const norm = (deg: number) => ((deg % 360) + 360) % 360;

/** What the person enters, as it is saved in `cosmic.chart`. */
export type ChartInput = {
  name?: string | null;
  /** Local birth date, YYYY-MM-DD. */
  date: string;
  /** Local clock time at birth, HH:MM (24-hour), or empty when unknown. */
  time?: string | null;
  /** The clock's offset from UTC at birth, in minutes (east positive, so UTC+1 is 60). */
  utcOffsetMinutes: number;
  /** True when the offset was taken from the phone rather than entered. */
  offsetFromDevice?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  placeLabel?: string | null;
};

export function parseDate(value: string): { year: number; month: number; day: number } | null {
  const m = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s*$/.exec(value);
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;
  return { year, month, day };
}

/** "14:30", "2:30 pm", "0905" → hours and minutes; null when it isn't a time. */
export function parseTime(value: string | null | undefined): { hour: number; minute: number } | null {
  if (!value) return null;
  const text = value.trim().toLowerCase().replace(/\./g, '');
  const m = /^(\d{1,2})(?::?(\d{2}))?\s*(am|pm|a|p)?$/.exec(text);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  const meridiem = m[3]?.[0];
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (meridiem === 'p' ? 12 : 0);
  }
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export const formatTime = (t: { hour: number; minute: number }) => `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;

/** "+1", "-5", "+5:30", "UTC+10", "GMT-03:00", "0" → minutes east of UTC. */
export function parseOffset(value: string): number | null {
  const text = value.trim().toUpperCase().replace(/^(UTC|GMT)\s*/, '').replace(/\s+/g, '');
  if (text === '' || text === 'Z') return value.trim() ? 0 : null;
  const m = /^([+-−–])?(\d{1,2})(?:[:.]?(\d{2}))?$/.exec(text);
  if (!m) return null;
  const hours = Number(m[2]);
  const minutes = m[3] ? Number(m[3]) : 0;
  if (minutes > 59) return null;
  const total = hours * 60 + minutes;
  if (total > 14 * 60) return null;
  return m[1] && m[1] !== '+' ? -total : total;
}

export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '−' : '+';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

/** The phone's own UTC offset on a given local date (its time zone's rules, summer time included). */
export function deviceOffsetOn(date: string): number {
  const d = parseDate(date);
  const local = d ? new Date(d.year, d.month - 1, d.day, 12) : new Date();
  return -local.getTimezoneOffset();
}

/** The birth moment in UTC. Without a time, local noon stands in. */
export function birthInstant(input: Pick<ChartInput, 'date' | 'time' | 'utcOffsetMinutes'>): Date | null {
  const d = parseDate(input.date);
  if (!d) return null;
  const t = parseTime(input.time) ?? { hour: 12, minute: 0 };
  return new Date(Date.UTC(d.year, d.month - 1, d.day, t.hour, t.minute) - input.utcOffsetMinutes * 60_000);
}

/** Greenwich mean sidereal time in degrees (Meeus 12.4). */
export function greenwichSiderealTime(date: Date): number {
  const jd = dateToJulianDay(date);
  const T = (jd - 2451545.0) / 36525;
  return norm(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000);
}

/** Local sidereal time in degrees (the right ascension of the meridian, RAMC). East longitude positive. */
export const localSiderealTime = (date: Date, longitude: number) => norm(greenwichSiderealTime(date) + longitude);

/** Mean obliquity of the ecliptic in degrees (Meeus 22.2). */
export function obliquity(date: Date): number {
  const T = (dateToJulianDay(date) - 2451545.0) / 36525;
  return 23.439291111 - (46.815 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
}

/**
 * The Ascendant: the ecliptic degree rising on the eastern horizon.
 * λ = atan2(cos θ, −(sin θ cos ε + tan φ sin ε)), with θ the local sidereal
 * time, ε the obliquity and φ the latitude. Undefined at the poles.
 */
export function ascendant(lst: number, latitude: number, eps: number): number {
  const t = lst * RAD;
  const e = eps * RAD;
  const f = latitude * RAD;
  return norm(Math.atan2(Math.cos(t), -(Math.sin(t) * Math.cos(e) + Math.tan(f) * Math.sin(e))) / RAD);
}

/** The Midheaven: the ecliptic degree on the meridian. λ = atan2(sin θ, cos θ cos ε). */
export function midheaven(lst: number, eps: number): number {
  const t = lst * RAD;
  return norm(Math.atan2(Math.sin(t), Math.cos(t) * Math.cos(eps * RAD)) / RAD);
}

export type Placement = {
  body: Planet | 'Ascendant' | 'Midheaven';
  longitude: number;
  sign: ZodiacSign;
  /** Whole degrees within the sign, 0–29. */
  degree: number;
  minute: number;
  /** Without a birth time: the other sign the body could be in that day. */
  orSign?: ZodiacSign;
};

export type NatalChart = {
  instant: Date;
  timeKnown: boolean;
  placeKnown: boolean;
  placements: Placement[];
  ascendant: Placement | null;
  midheaven: Placement | null;
  /** Born inside the polar circles, where the Ascendant can behave strangely. */
  polar: boolean;
  /** Outside the years the planet tables are good for (1800–2050). */
  outsideRange: boolean;
};

export function placement(body: Placement['body'], longitude: number): Placement {
  const lon = norm(longitude);
  const within = lon % 30;
  let degree = Math.floor(within);
  let minute = Math.round((within - degree) * 60);
  if (minute === 60) {
    degree += 1;
    minute = 0;
  }
  return { body, longitude: lon, sign: signOf(lon), degree: Math.min(degree, 29), minute: degree > 29 ? 59 : minute };
}

export const formatPlacement = (p: Pick<Placement, 'sign' | 'degree' | 'minute'>) => `${p.degree}°${String(p.minute).padStart(2, '0')}′ ${p.sign}`;

export function natalChart(input: ChartInput): NatalChart | null {
  const instant = birthInstant(input);
  if (!instant) return null;
  const timeKnown = !!parseTime(input.time);
  const placeKnown =
    typeof input.latitude === 'number' &&
    typeof input.longitude === 'number' &&
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude) &&
    Math.abs(input.latitude) <= 90 &&
    Math.abs(input.longitude) <= 180;

  // Without a time, check the start and end of the local day for a sign change.
  const dayStart = birthInstant({ ...input, time: '00:00' })!;
  const dayEnd = new Date(dayStart.getTime() + 86_400_000 - 60_000);
  const placements = PLANETS.map((planet) => {
    const p = placement(planet, planetLongitude(planet, instant));
    if (!timeKnown) {
      const a = signOf(planetLongitude(planet, dayStart));
      const b = signOf(planetLongitude(planet, dayEnd));
      if (a !== b) p.orSign = p.sign === a ? b : a;
    }
    return p;
  });

  let asc: Placement | null = null;
  let mc: Placement | null = null;
  if (timeKnown && placeKnown) {
    const lst = localSiderealTime(instant, input.longitude as number);
    const eps = obliquity(instant);
    asc = placement('Ascendant', ascendant(lst, input.latitude as number, eps));
    mc = placement('Midheaven', midheaven(lst, eps));
  }
  const year = instant.getUTCFullYear();
  return {
    instant,
    timeKnown,
    placeKnown,
    placements,
    ascendant: asc,
    midheaven: mc,
    polar: placeKnown && Math.abs(input.latitude as number) > 66,
    outsideRange: year < 1800 || year > 2050,
  };
}

export const natalOf = (chart: NatalChart, body: Planet) => chart.placements.find((p) => p.body === body)!;
