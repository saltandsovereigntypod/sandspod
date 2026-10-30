// The angles and the houses. The Ascendant and Midheaven come from the
// local apparent sidereal time and the true obliquity (Meeus chs. 12, 13
// and 22); the house cusps from one of four systems:
//
// * Placidus (the default): each quadrant is cut by time. A cusp is the
//   ecliptic degree that has travelled a third (or two thirds) of its own
//   arc above or below the horizon. Found by iteration. It cannot be drawn
//   where some degrees never rise or set (inside the polar circles), so
//   there the chart falls back to Porphyry and says so.
// * Whole Sign: the rising sign is the whole first house, the next sign the
//   second, and so on (the oldest Hellenistic way).
// * Equal: thirty-degree houses counted from the Ascendant's own degree.
// * Porphyry: each quadrant between the angles cut into three equal parts.
//
// Checked against the Swiss Ephemeris's swe_houses in app/tests/astro-engine.test.ts.

import { greenwichSiderealTime } from '../craft/cosmic/chart.ts';
import { diff, norm, nutation, trueObliquity } from './ephemeris.ts';

const RAD = Math.PI / 180;

export const HOUSE_SYSTEMS = ['placidus', 'whole-sign', 'equal', 'porphyry'] as const;
export type HouseSystem = (typeof HOUSE_SYSTEMS)[number];
export const HOUSE_SYSTEM_LABEL: Record<HouseSystem, string> = {
  placidus: 'Placidus',
  'whole-sign': 'Whole Sign',
  equal: 'Equal',
  porphyry: 'Porphyry',
};

/** Local apparent sidereal time (RAMC) in degrees. East longitude positive. */
export function ramcAt(utc: Date, longitude: number): number {
  const n = nutation(utc);
  return norm(greenwichSiderealTime(utc) + n.longitude * Math.cos(trueObliquity(utc) * RAD) + longitude);
}

/** The Ascendant: the ecliptic degree rising in the east. */
export function ascendantOf(ramc: number, latitude: number, eps: number): number {
  const t = ramc * RAD;
  const e = eps * RAD;
  const f = latitude * RAD;
  return norm(Math.atan2(Math.cos(t), -(Math.sin(t) * Math.cos(e) + Math.tan(f) * Math.sin(e))) / RAD);
}

/** The Midheaven: the ecliptic degree on the meridian. */
export function midheavenOf(ramc: number, eps: number): number {
  const t = ramc * RAD;
  return norm(Math.atan2(Math.sin(t), Math.cos(t) * Math.cos(eps * RAD)) / RAD);
}

/** Right ascension → the ecliptic degree with that right ascension. */
const raToEcliptic = (ra: number, eps: number) => norm(Math.atan2(Math.sin(ra * RAD), Math.cos(ra * RAD) * Math.cos(eps * RAD)) / RAD);
const declinationOf = (lambda: number, eps: number) => Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD)) / RAD;

/**
 * One Placidus cusp: the degree whose right ascension sits `part` of the way
 * through its arc, measured from the meridian (houses 11, 12) or from the
 * horizon toward the lower meridian (houses 2, 3). Null where the arc
 * doesn't exist (polar latitudes).
 */
function placidusCusp(ramc: number, latitude: number, eps: number, house: 11 | 12 | 2 | 3): number | null {
  const part = house === 11 || house === 2 ? 1 / 3 : 2 / 3;
  const below = house === 2 || house === 3;
  let lambda = norm(ramc + (house === 11 ? 30 : house === 12 ? 60 : house === 2 ? 120 : 150));
  const tanPhi = Math.tan(latitude * RAD);
  for (let i = 0; i < 60; i++) {
    const x = -tanPhi * Math.tan(declinationOf(lambda, eps) * RAD);
    if (Math.abs(x) > 1) return null;
    const dsa = Math.acos(x) / RAD;
    const ra = below ? ramc + dsa + (180 - dsa) * part : ramc + dsa * part;
    const next = raToEcliptic(ra, eps);
    if (Math.abs(diff(next, lambda)) < 1e-9) return next;
    lambda = next;
  }
  return lambda;
}

export type Houses = {
  /** Cusps of houses 1–12, ecliptic longitude in degrees. */
  cusps: number[];
  ascendant: number;
  midheaven: number;
  /** The system asked for. */
  asked: HouseSystem;
  /** The system used (Porphyry when Placidus can't be drawn). */
  system: HouseSystem;
};

export function porphyry(asc: number, mc: number): number[] {
  const ic = norm(mc + 180);
  const q1 = norm(ic - asc); // ASC → IC (houses 1–3)
  const q2 = norm(asc + 180 - ic); // IC → DSC (houses 4–6)
  const first = [asc, asc + q1 / 3, asc + (2 * q1) / 3, ic, ic + q2 / 3, ic + (2 * q2) / 3].map(norm);
  return [...first, ...first.map((c) => norm(c + 180))];
}

export function housesFor(system: HouseSystem, utc: Date, latitude: number, longitude: number): Houses {
  const eps = trueObliquity(utc);
  const ramc = ramcAt(utc, longitude);
  const asc = ascendantOf(ramc, latitude, eps);
  const mc = midheavenOf(ramc, eps);
  const base = { ascendant: asc, midheaven: mc, asked: system };
  if (system === 'whole-sign') {
    const start = Math.floor(asc / 30) * 30;
    return { ...base, system, cusps: Array.from({ length: 12 }, (_, i) => norm(start + i * 30)) };
  }
  if (system === 'equal') return { ...base, system, cusps: Array.from({ length: 12 }, (_, i) => norm(asc + i * 30)) };
  if (system === 'placidus') {
    const c11 = placidusCusp(ramc, latitude, eps, 11);
    const c12 = placidusCusp(ramc, latitude, eps, 12);
    const c2 = placidusCusp(ramc, latitude, eps, 2);
    const c3 = placidusCusp(ramc, latitude, eps, 3);
    if (c11 !== null && c12 !== null && c2 !== null && c3 !== null) {
      const ic = norm(mc + 180);
      const half = [asc, c2, c3, ic, norm(c11 + 180), norm(c12 + 180)];
      return { ...base, system, cusps: [...half, ...half.map((c) => norm(c + 180))] };
    }
  }
  return { ...base, system: 'porphyry', cusps: porphyry(asc, mc) };
}

/** Which house (1–12) a longitude falls in. */
export function houseOf(longitude: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    const span = norm(end - start);
    if (norm(longitude - start) < span) return i + 1;
  }
  return 1;
}

/**
 * Houses for a chart with no birth time: the "solar chart", with the Sun's
 * degree on the first cusp and equal houses from there (or whole signs from
 * the Sun's sign). A reflective tool, not a stand-in for real houses.
 */
export function solarHouses(sunLongitude: number, wholeSign: boolean): number[] {
  const start = wholeSign ? Math.floor(sunLongitude / 30) * 30 : sunLongitude;
  return Array.from({ length: 12 }, (_, i) => norm(start + i * 30));
}
