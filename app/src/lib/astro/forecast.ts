// What moves against a birth chart: transits (today's sky on the natal
// chart), solar and lunar returns, secondary progressions (a day after
// birth for each year of life), retrograde periods with their shadows, and
// synastry (one chart against another). Pure.

import type { ChartInput } from '../craft/cosmic/chart.ts';
import { aspectsAcross, type AspectHit, type AspectName, type AspectPoint, type OrbSettings } from './aspects.ts';
import { bodyLongitude, bodySpeed, diff, inZodiac, norm, trueObliquity, type Body } from './ephemeris.ts';
import { ascendantOf, houseOf } from './houses.ts';
import { chartAt, makePosition, positionOf, type Chart, type Position } from './natal.ts';
import { nextStation, planetLongitude, type OrbitingPlanet } from './planets.ts';
import { SIGNS, type ChartPointName } from './signs.ts';
import { toTT } from './time.ts';

const DAY = 86_400_000;
const RAD = Math.PI / 180;
const YEAR_DAYS = 365.24219;

// ── Transits ─────────────────────────────────────────────────────────────

/** Transit orbs are tighter than natal ones: the Moon 3°, the inner planets 2°, the slow ones 1.5°. */
export function transitOrbs(): OrbSettings {
  return { orbs: { conjunction: 2, opposition: 2, trine: 2, square: 2, sextile: 1.5, quincunx: 1 }, luminaryBonus: 1, minors: false };
}

const TRANSITING: Body[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node'];
const NATAL_TARGETS: ChartPointName[] = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node', 'Ascendant', 'Midheaven',
];

export type TransitHit = AspectHit & {
  /** The transiting body (a). */
  transiting: ChartPointName;
  /** The natal point it touches (b). */
  natal: ChartPointName;
  /** Which natal house the transiting body is passing through. */
  house: number | null;
  /** How long the slow movers stay: the outer planets' transits last months, the Moon's hours. */
  weight: number;
};

const WEIGHT: Partial<Record<ChartPointName, number>> = { Pluto: 10, Neptune: 9, Uranus: 9, Saturn: 8, Jupiter: 6, Chiron: 6, 'North Node': 5, Mars: 4, Sun: 3, Venus: 3, Mercury: 2, Moon: 1 };
const TARGET_WEIGHT: Partial<Record<ChartPointName, number>> = { Sun: 3, Moon: 3, Ascendant: 3, Midheaven: 2 };

/** The sky at `when` against a natal chart, strongest first (slow planets to the lights and angles lead). */
export function transitsTo(chart: Chart, when: Date, orbs: OrbSettings = transitOrbs()): TransitHit[] {
  const cusps = chart.houses?.cusps ?? null;
  const moving: AspectPoint[] = [];
  const houseOfMover = new Map<ChartPointName, number | null>();
  for (const body of TRANSITING) {
    const lon = bodyLongitude(body, when, chart.options.nodes);
    if (lon === null) continue;
    const z = inZodiac(lon, chart.options.zodiac, when);
    moving.push({ point: body, longitude: z, speed: bodySpeed(body, when, chart.options.nodes) });
    houseOfMover.set(body, cusps ? houseOf(z, cusps) : null);
  }
  const natal: AspectPoint[] = chart.positions
    .filter((p) => NATAL_TARGETS.includes(p.point))
    .map((p) => ({ point: p.point, longitude: p.longitude, speed: 0 }));
  return aspectsAcross(moving, natal, orbs)
    .map((h) => ({
      ...h,
      transiting: h.a,
      natal: h.b,
      house: houseOfMover.get(h.a) ?? null,
      weight: (WEIGHT[h.a] ?? 1) * (TARGET_WEIGHT[h.b] ?? 1) - h.orb,
    }))
    .sort((x, y) => y.weight - x.weight);
}

/** Where today's transiting bodies sit in the natal houses. */
export function transitHouses(chart: Chart, when: Date): { body: ChartPointName; position: Position }[] {
  const cusps = chart.houses?.cusps ?? chart.solarCusps;
  return TRANSITING.flatMap((body) => {
    const lon = bodyLongitude(body, when, chart.options.nodes);
    if (lon === null) return [];
    return [{ body, position: makePosition(body, inZodiac(lon, chart.options.zodiac, when), bodySpeed(body, when, chart.options.nodes), cusps) }];
  });
}

// ── Returns ──────────────────────────────────────────────────────────────

/** When a body next comes back to `target` longitude (tropical) after `from`, found by stepping and halving. */
export function nextReturn(body: 'Sun' | 'Moon', target: number, from: Date): Date {
  const step = body === 'Sun' ? 5 * DAY : DAY / 4;
  const off = (t: number) => diff(bodyLongitude(body, new Date(t))!, target);
  let t = from.getTime();
  let prev = off(t);
  for (let i = 0; i < 200; i++) {
    const next = t + step;
    const now = off(next);
    if (prev < 0 && now >= 0 && now - prev < 90) {
      let lo = t;
      let hi = next;
      while (hi - lo > 1000) {
        const mid = (lo + hi) / 2;
        if (off(mid) < 0) lo = mid;
        else hi = mid;
      }
      return new Date(hi);
    }
    t = next;
    prev = now;
  }
  return new Date(t);
}

export type ReturnChart = { kind: 'solar' | 'lunar'; when: Date; chart: Chart; placeLabel: string | null };

/**
 * A solar return (the Sun back to its birth degree, around the birthday,
 * for the year that starts at `year`'s birthday) or the next lunar return
 * after `from`. Cast for `place` (where the person is for it; the
 * birthplace when not given). Uses tropical positions to find the moment.
 */
export function returnChart(
  natal: Chart,
  kind: 'solar' | 'lunar',
  from: Date,
  place: { latitude: number; longitude: number; label?: string | null } | null,
): ReturnChart {
  const body = kind === 'solar' ? 'Sun' : 'Moon';
  const target = bodyLongitude(body, natal.instant)!;
  let start = from;
  if (kind === 'solar') {
    // Start a fortnight before this year's birthday.
    const birth = natal.instant;
    start = new Date(Date.UTC(from.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate()) - 14 * DAY);
  }
  const when = nextReturn(body, target, start);
  const at = place ?? (natal.placeKnown ? { latitude: natal.input.latitude as number, longitude: natal.input.longitude as number } : null);
  const input: ChartInput = { ...natal.input, name: `${kind === 'solar' ? 'Solar' : 'Lunar'} return` };
  const chart = chartAt(when, at ? { latitude: at.latitude, longitude: at.longitude } : null, { ...natal.options, solarChart: false }, input, natal.timeKnown);
  return { kind, when, chart, placeLabel: place?.label ?? (place ? null : natal.input.placeLabel ?? null) };
}

// ── Secondary progressions ───────────────────────────────────────────────

export const LUNAR_PHASES = ['New', 'Crescent', 'First Quarter', 'Gibbous', 'Full', 'Disseminating', 'Last Quarter', 'Balsamic'] as const;
export type ProgressedPhase = (typeof LUNAR_PHASES)[number];

export type Progressions = {
  /** The day after birth whose sky stands for this year of life. */
  progressedInstant: Date;
  age: number;
  positions: Position[];
  /** The progressed Moon: sign, house in the natal chart, the date it changes sign. */
  moon: { position: Position; natalHouse: number | null; nextSign: { sign: (typeof SIGNS)[number]; date: Date } | null };
  /** The progressed lunation phase (the progressed Moon's angle from the progressed Sun). */
  phase: ProgressedPhase;
  phaseAngle: number;
  /** Progressed angles by solar arc, when the birth time and place are known. */
  ascendant: Position | null;
  midheaven: Position | null;
  /** Bodies that have changed sign by progression since birth. */
  changedSign: { point: ChartPointName; from: string; to: string }[];
  /** Progressed planets that have turned (station) since birth. */
  stationed: ChartPointName[];
};

const progressedAt = (natal: Chart, when: Date) => new Date(natal.instant.getTime() + ((when.getTime() - natal.instant.getTime()) / (YEAR_DAYS * DAY)) * DAY);
const realAt = (natal: Chart, progressed: Date) => new Date(natal.instant.getTime() + ((progressed.getTime() - natal.instant.getTime()) / DAY) * YEAR_DAYS * DAY);

/** Secondary progressions for `when`. */
export function progressionsFor(natal: Chart, when: Date): Progressions {
  const pInstant = progressedAt(natal, when);
  const age = (when.getTime() - natal.instant.getTime()) / (YEAR_DAYS * DAY);
  const cusps = natal.houses?.cusps ?? natal.solarCusps;
  const BODY: Body[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const positions = BODY.map((b) => makePosition(b, inZodiac(bodyLongitude(b, pInstant)!, natal.options.zodiac, pInstant), bodySpeed(b, pInstant), cusps));
  const pSun = positions[0];
  const pMoon = positions[1];
  const phaseAngle = norm(pMoon.longitude - pSun.longitude);
  const phase = LUNAR_PHASES[Math.floor(phaseAngle / 45) % 8];

  // When the progressed Moon next changes sign: about 2½ years per sign.
  let nextSign: Progressions['moon']['nextSign'] = null;
  {
    const start = pMoon.sign;
    let lo = pInstant.getTime();
    let hi = lo;
    const signAt = (t: number) => SIGNS[Math.floor(inZodiac(bodyLongitude('Moon', new Date(t))!, natal.options.zodiac, new Date(t)) / 30)];
    for (let i = 0; i < 40 && signAt(hi) === start; i++) hi += DAY / 4;
    if (signAt(hi) !== start) {
      while (hi - lo > 60_000) {
        const mid = (lo + hi) / 2;
        if (signAt(mid) === start) lo = mid;
        else hi = mid;
      }
      nextSign = { sign: signAt(hi), date: realAt(natal, new Date(hi)) };
    }
  }

  // Solar-arc angles: the Midheaven moves as far as the progressed Sun has; the Ascendant follows from it.
  let ascendant: Position | null = null;
  let midheaven: Position | null = null;
  const natalMc = positionOf(natal, 'Midheaven');
  const natalSun = positionOf(natal, 'Sun');
  if (natalMc && natalSun && natal.placeKnown) {
    const arc = norm(pSun.longitude - natalSun.longitude);
    const mcTropical = norm(natalMc.longitude + natal.ayanamsa + arc);
    const eps = trueObliquity(pInstant);
    const ramc = norm(Math.atan2(Math.sin(mcTropical * RAD) * Math.cos(eps * RAD), Math.cos(mcTropical * RAD)) / RAD);
    const ascTropical = ascendantOf(ramc, natal.input.latitude as number, eps);
    midheaven = makePosition('Midheaven', inZodiac(mcTropical, natal.options.zodiac, pInstant), null, cusps);
    ascendant = makePosition('Ascendant', inZodiac(ascTropical, natal.options.zodiac, pInstant), null, cusps);
  }

  const changedSign = positions.flatMap((p) => {
    const n = positionOf(natal, p.point);
    return n && n.sign !== p.sign ? [{ point: p.point, from: n.sign, to: p.sign }] : [];
  });
  const stationed = positions.filter((p) => {
    const n = positionOf(natal, p.point);
    return n && n.speed !== null && p.speed !== null && Math.sign(n.speed) !== Math.sign(p.speed) && p.point !== 'Sun' && p.point !== 'Moon';
  }).map((p) => p.point);

  return {
    progressedInstant: pInstant,
    age,
    positions,
    moon: { position: pMoon, natalHouse: cusps ? houseOf(pMoon.longitude, cusps) : null, nextSign },
    phase,
    phaseAngle,
    ascendant,
    midheaven,
    changedSign,
    stationed,
  };
}

// ── Retrograde periods and shadows ──────────────────────────────────────

export type RetrogradePeriod = {
  planet: OrbitingPlanet;
  /** When the planet first reaches the degree where it will later turn direct. */
  shadowStart: Date;
  /** It stations retrograde. */
  start: Date;
  startLongitude: number;
  /** It stations direct. */
  end: Date;
  endLongitude: number;
  /** It passes the degree where it turned retrograde: the shadow is over. */
  shadowEnd: Date;
};

/** The moment, searching from `from` in `direction`, when the planet is at `longitude`. */
function whenAt(planet: OrbitingPlanet, longitude: number, from: Date, direction: 1 | -1, maxDays = 400): Date {
  const off = (t: number) => diff(planetLongitude(planet, toTT(new Date(t))), longitude);
  const step = DAY * direction;
  let t = from.getTime();
  let prev = off(t);
  for (let i = 0; i < maxDays; i++) {
    const next = t + step;
    const now = off(next);
    if (Math.sign(now) !== Math.sign(prev) && Math.abs(now - prev) < 30) {
      let a = t;
      let b = next;
      while (Math.abs(b - a) > 60_000) {
        const mid = (a + b) / 2;
        if (Math.sign(off(mid)) === Math.sign(prev)) a = mid;
        else b = mid;
      }
      return new Date(b);
    }
    t = next;
    prev = now;
  }
  return new Date(t);
}

/** Retrograde periods (with shadows) of `planet` whose shadow overlaps [from, to]. */
export function retrogradePeriods(planet: OrbitingPlanet, from: Date, to: Date): RetrogradePeriod[] {
  const out: RetrogradePeriod[] = [];
  let cursor = new Date(from.getTime() - 250 * DAY);
  for (let guard = 0; guard < 30; guard++) {
    const r = nextStation(planet, cursor);
    if (!r) break;
    if (r.turning !== 'retrograde') {
      cursor = new Date(r.date.getTime() + 60_000);
      continue;
    }
    const d = nextStation(planet, new Date(r.date.getTime() + 60_000));
    if (!d) break;
    const shadowStart = whenAt(planet, d.longitude, r.date, -1);
    const shadowEnd = whenAt(planet, r.longitude, d.date, 1);
    if (shadowStart.getTime() > to.getTime()) break;
    if (shadowEnd.getTime() >= from.getTime()) {
      out.push({ planet, shadowStart, start: r.date, startLongitude: r.longitude, end: d.date, endLongitude: d.longitude, shadowEnd });
    }
    cursor = new Date(d.date.getTime() + 60_000);
  }
  return out;
}

export type RetroPhase = 'pre-shadow' | 'retrograde' | 'post-shadow' | null;
export function retroPhaseAt(period: RetrogradePeriod, when: Date): RetroPhase {
  const t = when.getTime();
  if (t < period.shadowStart.getTime() || t > period.shadowEnd.getTime()) return null;
  if (t < period.start.getTime()) return 'pre-shadow';
  if (t <= period.end.getTime()) return 'retrograde';
  return 'post-shadow';
}

// ── Synastry ─────────────────────────────────────────────────────────────

export type Synastry = {
  aspects: AspectHit[];
  /** Where each of A's planets falls in B's houses, and B's in A's (only when that chart has houses). */
  aInB: { point: ChartPointName; house: number }[];
  bInA: { point: ChartPointName; house: number }[];
  /** Counts of easy (trine, sextile) and challenging (square, opposition) contacts, and conjunctions. */
  tally: { soft: number; hard: number; blend: number };
};

const SYN_POINTS: ChartPointName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node', 'Ascendant', 'Midheaven'];

/** Synastry orbs: a little tighter than natal (6° majors, luminaries +1°, no minors except the quincunx). */
export const SYNASTRY_ORBS: OrbSettings = { orbs: { conjunction: 6, opposition: 6, trine: 5, square: 5, sextile: 4, quincunx: 2 }, luminaryBonus: 1, minors: false };

export function synastry(a: Chart, b: Chart, orbs: OrbSettings = SYNASTRY_ORBS): Synastry {
  const pts = (c: Chart): AspectPoint[] => c.positions.filter((p) => SYN_POINTS.includes(p.point)).map((p) => ({ point: p.point, longitude: p.longitude }));
  const aspects = aspectsAcross(pts(a), pts(b), orbs);
  const overlay = (from: Chart, into: Chart) =>
    into.houses
      ? from.positions.filter((p) => SYN_POINTS.slice(0, 10).includes(p.point)).map((p) => ({ point: p.point, house: houseOf(p.longitude, into.houses!.cusps) }))
      : [];
  const kind = (n: AspectName) => (n === 'trine' || n === 'sextile' ? 'soft' : n === 'conjunction' ? 'blend' : 'hard');
  const tally = { soft: 0, hard: 0, blend: 0 };
  for (const h of aspects) tally[kind(h.aspect)] += 1;
  return { aspects, aInB: overlay(a, b), bInA: overlay(b, a), tally };
}
