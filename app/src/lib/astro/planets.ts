// Where the planets are: geocentric tropical longitudes from JPL's
// "Keplerian Elements for Approximate Positions of the Major Planets"
// (Standish; table 1, good from 1800 to 2050 to well under a degree for the
// inner planets), precessed to the equinox of date. Enough for signs,
// retrogrades and stations to within hours.

import { dateToJulianDay, moonLongitude, SIGNS, sunLongitude, type ZodiacSign } from '../moon.ts';

export const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;
export type Planet = (typeof PLANETS)[number];
type OrbitingPlanet = Exclude<Planet, 'Sun' | 'Moon'>;

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;

// [a (AU), e, I, L, longitude of perihelion, longitude of node] and their rates per Julian century.
const ELEMENTS: Record<OrbitingPlanet | 'Earth', [number[], number[]]> = {
  Mercury: [[0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593], [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  Venus: [[0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255], [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418]],
  Earth: [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0], [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0]],
  Mars: [[1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891], [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  Jupiter: [[5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  Saturn: [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
  Uranus: [[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.9542763, 74.01692503], [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
  Neptune: [[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574], [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]],
  Pluto: [[39.48211675, 0.2488273, 17.14001206, 238.92903833, 224.06891629, 110.30393684], [-0.00031596, 0.0000517, 0.00004818, 145.20780515, -0.04062942, -0.01183482]],
};

const norm = (deg: number) => ((deg % 360) + 360) % 360;

/** Heliocentric ecliptic position (J2000 axes) in AU. */
function heliocentric(body: OrbitingPlanet | 'Earth', T: number): [number, number, number] {
  const [base, rate] = ELEMENTS[body];
  const [a, e, I, L, peri, node] = base.map((value, i) => value + rate[i] * T);
  const M = norm(L - peri) * RAD;
  const w = (peri - node) * RAD;
  const O = node * RAD;
  const inc = I * RAD;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const [cw, sw, cO, sO, cI, sI] = [Math.cos(w), Math.sin(w), Math.cos(O), Math.sin(O), Math.cos(inc), Math.sin(inc)];
  return [
    (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    sw * sI * xp + cw * sI * yp,
  ];
}

/** Geocentric tropical longitude in degrees (equinox of date) for any planet, Sun or Moon. */
export function planetLongitude(planet: Planet, date: Date): number {
  if (planet === 'Sun') return sunLongitude(date);
  if (planet === 'Moon') return moonLongitude(date);
  const T = (dateToJulianDay(date) - 2451545.0) / 36525;
  const [px, py] = heliocentric(planet, T);
  const [ex, ey] = heliocentric('Earth', T);
  const j2000 = Math.atan2(py - ey, px - ex) / RAD;
  const precession = 1.3969713 * T + 0.0003086 * T * T;
  return norm(j2000 + precession);
}

export function signOf(longitude: number): ZodiacSign {
  return SIGNS[Math.floor(norm(longitude) / 30) % 12];
}

export function planetSign(planet: Planet, date: Date): ZodiacSign {
  return signOf(planetLongitude(planet, date));
}

/** Degrees per day (negative while retrograde). */
export function planetSpeed(planet: Planet, date: Date): number {
  const before = planetLongitude(planet, new Date(date.getTime() - 6 * 3_600_000));
  const after = planetLongitude(planet, new Date(date.getTime() + 6 * 3_600_000));
  return ((((after - before) % 360) + 540) % 360 - 180) * 2;
}

export const isRetrograde = (planet: Planet, date: Date) => planet !== 'Sun' && planet !== 'Moon' && planetSpeed(planet, date) < 0;

export type Station = { planet: Planet; date: Date; turning: 'retrograde' | 'direct'; longitude: number };

/** The next time `planet` stands still and turns, searching up to `days` ahead. */
export function nextStation(planet: OrbitingPlanet, from: Date, days = 800): Station | null {
  const step = DAY_MS;
  let t = from.getTime();
  let speed = planetSpeed(planet, new Date(t));
  for (let i = 0; i < days; i++) {
    const next = t + step;
    const nextSpeed = planetSpeed(planet, new Date(next));
    if (Math.sign(nextSpeed) !== Math.sign(speed) && nextSpeed !== 0) {
      let low = t;
      let high = next;
      while (high - low > 60_000) {
        const mid = (low + high) / 2;
        if (Math.sign(planetSpeed(planet, new Date(mid))) === Math.sign(speed)) low = mid;
        else high = mid;
      }
      const date = new Date(high);
      return { planet, date, turning: speed > 0 ? 'retrograde' : 'direct', longitude: planetLongitude(planet, date) };
    }
    t = next;
    speed = nextSpeed;
  }
  return null;
}

/** When `planet` next changes sign (skipping wobbles shorter than a minute). */
export function nextIngress(planet: Planet, from: Date, maxDays = 13 * 365): { sign: ZodiacSign; date: Date } | null {
  const start = planetSign(planet, from);
  const step = planet === 'Moon' ? 2 * 3_600_000 : planet === 'Mercury' || planet === 'Venus' || planet === 'Sun' ? DAY_MS / 2 : DAY_MS * 2;
  let low = from.getTime();
  let high = low + step;
  const limit = low + maxDays * DAY_MS;
  while (planetSign(planet, new Date(high)) === start) {
    low = high;
    high += step;
    if (high > limit) return null;
  }
  while (high - low > 60_000) {
    const mid = (low + high) / 2;
    if (planetSign(planet, new Date(mid)) === start) low = mid;
    else high = mid;
  }
  return { sign: planetSign(planet, new Date(high)), date: new Date(high) };
}

/** Retrograde periods overlapping [from, to], each from its retrograde station to its direct station. */
export function retrogradesBetween(planet: OrbitingPlanet, from: Date, to: Date): { start: Date; end: Date }[] {
  const periods: { start: Date; end: Date }[] = [];
  let cursor = new Date(from.getTime() - 200 * DAY_MS);
  let start: Date | null = isRetrograde(planet, cursor) ? cursor : null;
  for (let guard = 0; guard < 40; guard++) {
    const station = nextStation(planet, cursor);
    if (!station) break;
    if (station.turning === 'retrograde') start = station.date;
    else if (start) {
      if (station.date.getTime() >= from.getTime() && start.getTime() <= to.getTime()) periods.push({ start, end: station.date });
      start = null;
    }
    if (station.date.getTime() > to.getTime() && !start) break;
    cursor = new Date(station.date.getTime() + 60_000);
  }
  return periods;
}
