// Sunrise, sunset, moonrise and moonset for a place, found by following the
// body's altitude through the day. Sun and Moon positions come from Meeus
// (chs. 25 and 47); the Moon's latitude uses the main terms of table 47.B.

import { dateToJulianDay, moonLongitude, sunLongitude } from '../moon.ts';

export type Place = { latitude: number; longitude: number };

const RAD = Math.PI / 180;
const HOUR = 3_600_000;

// [D, M, M', F, coefficient in 0.000001°]
const MOON_LATITUDE_TERMS: [number, number, number, number, number][] = [
  [0, 0, 0, 1, 5128122], [0, 0, 1, 1, 280602], [0, 0, 1, -1, 277693], [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413], [2, 0, -1, -1, 46271], [2, 0, 0, 1, 32573], [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266], [0, 0, 2, -1, 8822], [2, -1, 0, -1, 8216], [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200], [2, 1, 0, -1, -3359], [2, -1, -1, 1, 2463], [2, -1, 0, 1, 2211],
  [2, -1, -1, -1, 2065], [0, 1, -1, -1, -1870], [4, 0, -1, -1, 1828], [0, 1, 0, 1, -1794],
  [0, 0, 0, 3, -1749], [0, 1, -1, 1, -1565], [1, 0, 0, 1, -1491], [0, 1, 1, 1, -1475],
  [0, 1, 1, -1, -1410], [0, 1, 0, -1, -1344], [1, 0, 0, -1, -1335], [0, 0, 3, 1, 1107],
  [4, 0, 0, -1, 1021], [4, 0, -1, 1, 833],
];

export function moonLatitude(date: Date): number {
  const T = (dateToJulianDay(date) - 2451545.0) / 36525;
  const T2 = T * T;
  const Lp = 218.3164477 + 481267.88123421 * T;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2;
  const M = 357.5291092 + 35999.0502909 * T;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2;
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T2;
  const A1 = 119.75 + 131.849 * T;
  const A3 = 313.45 + 481266.484 * T;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  let sum = 0;
  for (const [d, m, mp, f, c] of MOON_LATITUDE_TERMS) {
    const ecc = Math.abs(m) === 2 ? E * E : Math.abs(m) === 1 ? E : 1;
    sum += c * ecc * Math.sin((d * D + m * M + mp * Mp + f * F) * RAD);
  }
  sum +=
    -2235 * Math.sin(Lp * RAD) + 382 * Math.sin(A3 * RAD) + 175 * Math.sin((A1 - F) * RAD) +
    175 * Math.sin((A1 + F) * RAD) + 127 * Math.sin((Lp - Mp) * RAD) - 115 * Math.sin((Lp + Mp) * RAD);
  return sum / 1_000_000;
}

/** Altitude in degrees of a body at ecliptic (lambda, beta) seen from `place` at `date`. */
function altitude(date: Date, place: Place, lambda: number, beta: number): number {
  const jd = dateToJulianDay(date);
  const T = (jd - 2451545.0) / 36525;
  const eps = (23.439291 - 0.0130042 * T) * RAD;
  const l = lambda * RAD;
  const b = beta * RAD;
  const ra = Math.atan2(Math.sin(l) * Math.cos(eps) - Math.tan(b) * Math.sin(eps), Math.cos(l));
  const dec = Math.asin(Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l));
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  const H = (gmst + place.longitude) * RAD - ra;
  const phi = place.latitude * RAD;
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)) / RAD;
}

// Altitudes at the moment of rising/setting: refraction and the Sun's
// radius (−0.833°); for the Moon, parallax lifts it (+0.125° on average).
const sunAltitude = (d: Date, p: Place) => altitude(d, p, sunLongitude(d), 0) + 0.8333;
const moonAltitude = (d: Date, p: Place) => altitude(d, p, moonLongitude(d), moonLatitude(d)) - 0.125;

export type RiseSet = { rise: Date | null; set: Date | null };

function crossings(start: Date, place: Place, height: (d: Date, p: Place) => number): RiseSet {
  const result: RiseSet = { rise: null, set: null };
  const step = 10 * 60_000;
  let t = start.getTime();
  let prev = height(new Date(t), place);
  for (let i = 0; i < 24 * 6; i++) {
    const next = t + step;
    const value = height(new Date(next), place);
    if (Math.sign(value) !== Math.sign(prev)) {
      let low = t;
      let high = next;
      while (high - low > 15_000) {
        const mid = (low + high) / 2;
        if (Math.sign(height(new Date(mid), place)) === Math.sign(prev)) low = mid;
        else high = mid;
      }
      const key = prev < 0 ? 'rise' : 'set';
      if (!result[key]) result[key] = new Date(high);
    }
    t = next;
    prev = value;
  }
  return result;
}

/**
 * Midnight of `day`'s date at the place, by its longitude (solar time), so
 * the search covers that place's day even when the phone is set to another
 * time zone. Where the phone is, this is within an hour or so of local midnight.
 */
function placeMidnight(day: Date, place: Place): Date {
  return new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) - (place.longitude / 15) * HOUR);
}

/** Sunrise and sunset on `day`'s date where `place` is (null near the poles when it doesn't happen). */
export function sunTimes(day: Date, place: Place): RiseSet {
  return crossings(placeMidnight(day, place), place, sunAltitude);
}

/** Moonrise and moonset on `day`'s date where `place` is (either can be missing on a given day). */
export function moonTimes(day: Date, place: Place): RiseSet {
  return crossings(placeMidnight(day, place), place, moonAltitude);
}

export const _test = { sunAltitude, moonAltitude, HOUR };
