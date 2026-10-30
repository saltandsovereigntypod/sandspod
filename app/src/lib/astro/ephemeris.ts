// Where everything in a chart is, for any moment: the Sun to Pluto (from
// planets.ts and moon.ts), Chiron (interpolated from a JPL Horizons table),
// the Moon's nodes (mean, and true from Meeus's correction terms), Black
// Moon Lilith (the mean lunar apogee, Meeus ch. 50), nutation, and the
// Lahiri ayanamsa for the sidereal zodiac. Every function here takes the
// moment in UT, as a Date, and adds ΔT itself. Pure: no React, no storage.
//
// Accuracy, checked in app/tests/astro-engine.test.ts against the Swiss
// Ephemeris and JPL Horizons, 1850–2045: Sun and Moon within about half an
// arcminute, Mercury to Mars within about a minute and a half, Jupiter and
// Saturn within about ten, Uranus to Pluto within about two, Chiron within
// a minute or so, the nodes and Lilith within a few minutes.

import { dateToJulianDay, moonLongitude, sunLongitude } from '../moon.ts';
import { CHIRON_DIST, CHIRON_LAT, CHIRON_LON, CHIRON_START_JD, CHIRON_STEP_DAYS } from './chironData.ts';
import { heliocentric, planetLongitude, PLANETS, type Planet } from './planets.ts';
import { toTT } from './time.ts';

const RAD = Math.PI / 180;
export const norm = (deg: number) => ((deg % 360) + 360) % 360;
/** Signed difference a − b folded into −180..180. */
export const diff = (a: number, b: number) => ((((a - b) % 360) + 540) % 360) - 180;

/** Every body and point a chart places on the wheel. */
export const BODIES = [...PLANETS, 'Chiron', 'North Node', 'South Node', 'Lilith'] as const;
export type Body = (typeof BODIES)[number];
export type Point = Exclude<Body, Planet>;

export type NodeKind = 'true' | 'mean';

const centuries = (tt: Date) => (dateToJulianDay(tt) - 2451545.0) / 36525;

/** Nutation in longitude and obliquity, degrees (Meeus ch. 22, the short series, good to 0.5″). */
export function nutation(utc: Date): { longitude: number; obliquity: number } {
  const T = centuries(toTT(utc));
  const omega = (125.04452 - 1934.136261 * T) * RAD;
  const L = (280.4665 + 36000.7698 * T) * RAD;
  const Lp = (218.3165 + 481267.8813 * T) * RAD;
  return {
    longitude: (-17.2 * Math.sin(omega) - 1.32 * Math.sin(2 * L) - 0.23 * Math.sin(2 * Lp) + 0.21 * Math.sin(2 * omega)) / 3600,
    obliquity: (9.2 * Math.cos(omega) + 0.57 * Math.cos(2 * L) + 0.1 * Math.cos(2 * Lp) - 0.09 * Math.cos(2 * omega)) / 3600,
  };
}

/** Mean obliquity of the ecliptic (Meeus 22.2), degrees. */
export function meanObliquity(utc: Date): number {
  const T = centuries(toTT(utc));
  return 23.439291111 - (46.815 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
}

export const trueObliquity = (utc: Date) => meanObliquity(utc) + nutation(utc).obliquity;

// ── The Moon's nodes and Lilith ──────────────────────────────────────────

/** The mean north node (Meeus 47.7), degrees. */
export function meanNode(utc: Date): number {
  const T = centuries(toTT(utc));
  return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + (T * T * T) / 467441 - (T * T * T * T) / 60616000);
}

/** The true (osculating) north node: the mean node with Meeus's five largest periodic corrections. */
export function trueNode(utc: Date): number {
  const T = centuries(toTT(utc));
  const T2 = T * T;
  const D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T2) * RAD;
  const M = (357.5291092 + 35999.0502909 * T - 0.0001536 * T2) * RAD;
  const Mp = (134.9633964 + 477198.8675055 * T + 0.0087414 * T2) * RAD;
  const F = (93.272095 + 483202.0175233 * T - 0.0036539 * T2) * RAD;
  return norm(
    meanNode(utc) -
      1.4979 * Math.sin(2 * (D - F)) -
      0.15 * Math.sin(M) -
      0.1226 * Math.sin(2 * D) +
      0.1176 * Math.sin(2 * F) -
      0.0801 * Math.sin(2 * (Mp - F)),
  );
}

/** Black Moon Lilith: the mean apogee of the Moon's orbit (Meeus 50, the mean perigee plus 180°). */
export function meanLilith(utc: Date): number {
  const T = centuries(toTT(utc));
  const perigee = 83.3532465 + 4069.0137287 * T - 0.01032 * T * T - (T * T * T) / 80053 + (T * T * T * T) / 18999000;
  return norm(perigee + 180);
}

// ── Chiron ───────────────────────────────────────────────────────────────

let chironTable: { lon: Float64Array; lat: Float64Array; dist: Float64Array } | null = null;

function decode(deltas: number[], scale: number): Float64Array {
  const out = new Float64Array(deltas.length);
  let run = 0;
  for (let i = 0; i < deltas.length; i++) {
    run += deltas[i];
    out[i] = run / scale;
  }
  return out;
}

function table() {
  if (!chironTable) chironTable = { lon: decode(CHIRON_LON, 1e4), lat: decode(CHIRON_LAT, 1e4), dist: decode(CHIRON_DIST, 1e5) };
  return chironTable;
}

/** Years Chiron's table covers. */
export const CHIRON_YEARS = { from: 1800, to: 2100 };

/** Four-point Lagrange interpolation in a table at fractional index x. */
function lagrange(values: Float64Array, x: number): number {
  const i = Math.min(Math.max(Math.floor(x) - 1, 0), values.length - 4);
  const t = x - i;
  const [y0, y1, y2, y3] = [values[i], values[i + 1], values[i + 2], values[i + 3]];
  return (
    (y0 * (t - 1) * (t - 2) * (t - 3)) / -6 + (y1 * t * (t - 2) * (t - 3)) / 2 + (y2 * t * (t - 1) * (t - 3)) / -2 + (y3 * t * (t - 1) * (t - 2)) / 6
  );
}

/** Chiron's heliocentric J2000 ecliptic position in AU at a TT Julian day, or null outside the table. */
function chironHelio(jd: number): [number, number, number] | null {
  const t = table();
  const x = (jd - CHIRON_START_JD) / CHIRON_STEP_DAYS;
  if (x < 0 || x > t.lon.length - 1) return null;
  const lon = lagrange(t.lon, x) * RAD;
  const lat = lagrange(t.lat, x) * RAD;
  const r = lagrange(t.dist, x);
  return [r * Math.cos(lat) * Math.cos(lon), r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat)];
}

/** Chiron's geocentric longitude of date (light-time corrected), or null outside 1800–2100. */
export function chironLongitude(utc: Date): number | null {
  const tt = toTT(utc);
  const jd = dateToJulianDay(tt);
  const T = (jd - 2451545.0) / 36525;
  const [ex, ey, ez] = heliocentric('Earth', T);
  let tau = 0;
  let geo: [number, number, number] | null = null;
  for (let i = 0; i < 3; i++) {
    const c = chironHelio(jd - tau);
    if (!c) return null;
    geo = [c[0] - ex, c[1] - ey, c[2] - ez];
    tau = Math.hypot(...geo) * 0.0057755183;
  }
  const j2000 = Math.atan2(geo![1], geo![0]) / RAD;
  return norm(j2000 + 1.3969713 * T + 0.0003086 * T * T + nutation(utc).longitude);
}

// ── Every body ───────────────────────────────────────────────────────────

/**
 * Tropical longitude of any body at a UT moment. The Sun and planets are
 * read at Terrestrial Time; null only for Chiron outside its table.
 */
export function bodyLongitude(body: Body, utc: Date, nodes: NodeKind = 'true'): number | null {
  switch (body) {
    case 'Chiron':
      return chironLongitude(utc);
    case 'North Node':
      return nodes === 'true' ? trueNode(utc) : meanNode(utc);
    case 'South Node':
      return norm((nodes === 'true' ? trueNode(utc) : meanNode(utc)) + 180);
    case 'Lilith':
      return meanLilith(utc);
    case 'Sun':
      return sunLongitude(toTT(utc));
    case 'Moon':
      return moonLongitude(toTT(utc));
    default:
      return planetLongitude(body, toTT(utc));
  }
}

/** Degrees per day, negative while retrograde (measured over a few hours either side). */
export function bodySpeed(body: Body, utc: Date, nodes: NodeKind = 'true'): number {
  const h = body === 'Moon' ? 1 : 6;
  const before = bodyLongitude(body, new Date(utc.getTime() - h * 3_600_000), nodes);
  const after = bodyLongitude(body, new Date(utc.getTime() + h * 3_600_000), nodes);
  if (before === null || after === null) return 0;
  return (diff(after, before) * 24) / (2 * h);
}

// ── The sidereal zodiac ──────────────────────────────────────────────────

/**
 * The Lahiri (Chitrapaksha) ayanamsa in degrees: how far the tropical
 * zodiac has slid from the stars, as adopted by the Indian Calendar Reform
 * Committee (1955). A fit to the Swiss Ephemeris's Lahiri values, good to
 * about a second of arc from 1800 to 2100.
 */
export function lahiriAyanamsa(utc: Date): number {
  const T = centuries(toTT(utc));
  return LAHIRI[0] + LAHIRI[1] * T + LAHIRI[2] * T * T + nutation(utc).longitude * LAHIRI[3];
}
// [at J2000, per century, per century², share of nutation] (fitted; see the test).
const LAHIRI = [23.857092, 1.396971, 0.000308, 0];

/** A tropical longitude in the chosen zodiac. */
export const inZodiac = (longitude: number, zodiac: 'tropical' | 'sidereal', utc: Date) =>
  zodiac === 'sidereal' ? norm(longitude - lahiriAyanamsa(utc)) : norm(longitude);
