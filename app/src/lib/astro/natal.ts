// A full birth chart: every body and point with its sign, degree, house,
// motion and dignity; the angles and house cusps; aspects and the patterns
// they make; the balance of elements, modalities, polarity, hemispheres and
// quadrants; the chart ruler; and whether it is a day or a night chart.
// Pure: no React, no storage. The same function casts return charts,
// progressed positions and the charts of other people the person adds.

import { birthInstant, parseTime, type ChartInput } from '../craft/cosmic/chart.ts';
import type { ZodiacSign } from '../moon.ts';
import { aspectsAmong, DEFAULT_ORBS, findPatterns, type AspectHit, type AspectPoint, type OrbSettings, type Pattern } from './aspects.ts';
import { bodyLongitude, bodySpeed, BODIES, inZodiac, lahiriAyanamsa, norm, type Body, type NodeKind } from './ephemeris.ts';
import { houseOf, housesFor, solarHouses, type Houses, type HouseSystem } from './houses.ts';
import type { Planet } from './planets.ts';
import {
  decanOf,
  dignityOf,
  elementOf,
  MODERN_RULER,
  modalityOf,
  polarityOf,
  SIGNS,
  TRADITIONAL_RULER,
  type ChartPointName,
  type Classical,
  type Dignity,
  type Element,
  type Modality,
  type Polarity,
} from './signs.ts';

export type Zodiac = 'tropical' | 'sidereal';

export type ChartOptions = {
  houseSystem: HouseSystem;
  zodiac: Zodiac;
  nodes: NodeKind;
  orbs: OrbSettings;
  /** With no birth time: draw "solar chart" houses from the Sun (equal houses from its degree). */
  solarChart: boolean;
};

export const DEFAULT_CHART_OPTIONS: ChartOptions = { houseSystem: 'placidus', zodiac: 'tropical', nodes: 'true', orbs: DEFAULT_ORBS, solarChart: false };

export type Position = {
  point: ChartPointName;
  /** Longitude in the chart's zodiac (tropical or sidereal), 0–360. */
  longitude: number;
  sign: ZodiacSign;
  degree: number;
  minute: number;
  /** Degrees per day; negative when retrograde. Null for the angles and lots. */
  speed: number | null;
  retrograde: boolean;
  /** 1–12, or null without houses. */
  house: number | null;
  dignity: Dignity | null;
  decan: 1 | 2 | 3;
  /** With no birth time: the other sign this body might be in, when it changed sign that day. */
  orSign?: ZodiacSign;
};

export type BalanceCount<K extends string> = Record<K, { score: number; points: ChartPointName[] }>;

export type Balance = {
  elements: BalanceCount<Element>;
  modalities: BalanceCount<Modality>;
  polarity: BalanceCount<Polarity>;
  /** Only with houses: above/below the horizon and east/west of the meridian (Sun to Pluto). */
  hemispheres: { above: ChartPointName[]; below: ChartPointName[]; east: ChartPointName[]; west: ChartPointName[] } | null;
  quadrants: ChartPointName[][] | null;
  /** The strongest and the missing, for the summary line. */
  dominantElement: Element;
  missingElements: Element[];
  dominantModality: Modality;
};

export type Chart = {
  input: ChartInput;
  /** The birth moment in UTC (local noon when the time isn't known). */
  instant: Date;
  timeKnown: boolean;
  placeKnown: boolean;
  options: ChartOptions;
  /** Degrees subtracted for the sidereal zodiac (0 for tropical). */
  ayanamsa: number;
  /** Real houses (time and place known), else null. */
  houses: Houses | null;
  /** "Solar chart" cusps from the Sun, when asked for and the time isn't known. */
  solarCusps: number[] | null;
  positions: Position[];
  aspects: AspectHit[];
  patterns: Pattern[];
  balance: Balance;
  /** The traditional ruler of the rising sign (and the modern one where it differs). */
  ruler: { traditional: Classical; modern: Planet; sign: ZodiacSign } | null;
  /** Day chart: the Sun above the horizon at birth. Null without houses. */
  sect: 'day' | 'night' | null;
  /** Plain warnings to show with the chart. */
  notes: ChartNote[];
};

export type ChartNote = 'no-time' | 'no-place' | 'polar-fallback' | 'outside-range' | 'chiron-range' | 'sidereal';

export function makePosition(point: ChartPointName, longitude: number, speed: number | null, cusps: number[] | null): Position {
  const lon = norm(longitude);
  const within = lon % 30;
  let degree = Math.floor(within);
  let minute = Math.round((within - degree) * 60);
  if (minute === 60) {
    degree += 1;
    minute = 0;
  }
  const sign = SIGNS[Math.floor(lon / 30) % 12];
  const planet = (BODIES as readonly string[]).slice(0, 10).includes(point) ? (point as Planet) : null;
  return {
    point,
    longitude: lon,
    sign,
    degree: Math.min(degree, 29),
    minute: degree > 29 ? 59 : minute,
    speed,
    retrograde: speed !== null && speed < 0 && point !== 'North Node' && point !== 'South Node' && point !== 'Lilith',
    house: cusps ? houseOf(lon, cusps) : null,
    dignity: planet ? dignityOf(planet, sign) : null,
    decan: decanOf(lon).decan,
  };
}

export const formatDegree = (p: Pick<Position, 'degree' | 'minute' | 'sign'>) => `${p.degree}°${String(p.minute).padStart(2, '0')}′ ${p.sign}`;

const SUN_TO_PLUTO: ChartPointName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

export function hasPlace(input: Pick<ChartInput, 'latitude' | 'longitude'>): boolean {
  return (
    typeof input.latitude === 'number' &&
    typeof input.longitude === 'number' &&
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude) &&
    Math.abs(input.latitude) <= 90 &&
    Math.abs(input.longitude) <= 180
  );
}

/** The chart for a moment and (optionally) a place: what returns and transits use. */
export function chartAt(
  instant: Date,
  place: { latitude: number; longitude: number } | null,
  options: ChartOptions,
  input: ChartInput,
  timeKnown = true,
): Chart {
  const placeKnown = !!place;
  const sidereal = options.zodiac === 'sidereal';
  const ayanamsa = sidereal ? lahiriAyanamsa(instant) : 0;
  const notes: ChartNote[] = [];
  if (!timeKnown) notes.push('no-time');
  if (!placeKnown) notes.push('no-place');
  if (sidereal) notes.push('sidereal');
  const year = instant.getUTCFullYear();
  if (year < 1800 || year > 2050) notes.push('outside-range');

  let houses: Houses | null = null;
  if (timeKnown && place) {
    const tropical = housesFor(options.houseSystem, instant, place.latitude, place.longitude);
    houses = {
      ...tropical,
      cusps: tropical.cusps.map((c) => inZodiac(c, options.zodiac, instant)),
      ascendant: inZodiac(tropical.ascendant, options.zodiac, instant),
      midheaven: inZodiac(tropical.midheaven, options.zodiac, instant),
    };
    // Whole Sign houses follow the sidereal rising sign, not the tropical one.
    if (options.houseSystem === 'whole-sign' && sidereal) {
      const start = Math.floor(houses.ascendant / 30) * 30;
      houses.cusps = Array.from({ length: 12 }, (_, i) => norm(start + i * 30));
    }
    if (houses.system !== houses.asked) notes.push('polar-fallback');
  }

  const raw = new Map<Body, number>();
  for (const body of BODIES) {
    const lon = bodyLongitude(body, instant, options.nodes);
    if (lon === null) {
      if (body === 'Chiron') notes.push('chiron-range');
      continue;
    }
    raw.set(body, inZodiac(lon, options.zodiac, instant));
  }
  const sun = raw.get('Sun')!;
  const solarCusps = !houses && options.solarChart ? solarHouses(sun, options.houseSystem === 'whole-sign') : null;
  const cusps = houses?.cusps ?? solarCusps;

  // Without a time, look at the start and end of the local day for a change of sign.
  const dayStart = timeKnown ? null : birthInstant({ ...input, time: '00:00' });
  const dayEnd = dayStart ? new Date(dayStart.getTime() + 86_400_000 - 60_000) : null;

  const positions: Position[] = [];
  for (const [body, lon] of raw) {
    const p = makePosition(body, lon, bodySpeed(body, instant, options.nodes), cusps);
    if (dayStart && dayEnd) {
      const a = bodyLongitude(body, dayStart, options.nodes);
      const b = bodyLongitude(body, dayEnd, options.nodes);
      if (a !== null && b !== null) {
        const sa = SIGNS[Math.floor(inZodiac(a, options.zodiac, dayStart) / 30)];
        const sb = SIGNS[Math.floor(inZodiac(b, options.zodiac, dayEnd) / 30)];
        if (sa !== sb) p.orSign = p.sign === sa ? sb : sa;
      }
    }
    positions.push(p);
  }

  let sect: Chart['sect'] = null;
  if (houses) {
    const sunHouse = houseOf(sun, houses.cusps);
    sect = sunHouse >= 7 ? 'day' : 'night';
    const moon = raw.get('Moon')!;
    // The Part (Lot) of Fortune: by day Ascendant + Moon − Sun; by night Ascendant + Sun − Moon.
    const fortune = sect === 'day' ? houses.ascendant + moon - sun : houses.ascendant + sun - moon;
    positions.push(makePosition('Part of Fortune', fortune, null, cusps));
    positions.push(makePosition('Ascendant', houses.ascendant, null, cusps));
    positions.push(makePosition('Midheaven', houses.midheaven, null, cusps));
    positions.push(makePosition('Descendant', houses.ascendant + 180, null, cusps));
    positions.push(makePosition('IC', houses.midheaven + 180, null, cusps));
  }

  const aspectPoints: AspectPoint[] = positions
    .filter((p) => p.point !== 'South Node' && p.point !== 'Descendant' && p.point !== 'IC')
    .map((p) => ({ point: p.point, longitude: p.longitude, speed: p.speed }));
  const aspects = aspectsAmong(aspectPoints, options.orbs);
  const patternBodies = SUN_TO_PLUTO.filter((b) => raw.has(b as Body));
  const patterns = findPatterns(patternBodies, aspects, positions);

  const asc = positions.find((p) => p.point === 'Ascendant');
  const ruler = asc ? { traditional: TRADITIONAL_RULER[asc.sign], modern: MODERN_RULER[asc.sign], sign: asc.sign } : null;

  return {
    input,
    instant,
    timeKnown,
    placeKnown,
    options,
    ayanamsa,
    houses,
    solarCusps,
    positions,
    aspects,
    patterns,
    balance: balanceOf(positions, !!houses),
    ruler,
    sect,
    notes,
  };
}

/** The birth chart for what the person entered, or null when the date can't be read. */
export function castChart(input: ChartInput, options: ChartOptions = DEFAULT_CHART_OPTIONS): Chart | null {
  const instant = birthInstant(input);
  if (!instant) return null;
  const timeKnown = !!parseTime(input.time);
  const place = hasPlace(input) ? { latitude: input.latitude as number, longitude: input.longitude as number } : null;
  return chartAt(instant, place, options, input, timeKnown);
}

const WEIGHT: Partial<Record<ChartPointName, number>> = { Sun: 2, Moon: 2, Ascendant: 2, Midheaven: 1 };

/** Element, modality and polarity: Sun to Pluto plus the Ascendant and Midheaven, the lights and Ascendant counted twice. */
export function balanceOf(positions: Position[], withHouses: boolean): Balance {
  const counted = positions.filter((p) => SUN_TO_PLUTO.includes(p.point) || p.point === 'Ascendant' || p.point === 'Midheaven');
  const tally = <K extends string>(keys: readonly K[], of: (sign: ZodiacSign) => K): BalanceCount<K> => {
    const out = Object.fromEntries(keys.map((k) => [k, { score: 0, points: [] as ChartPointName[] }])) as BalanceCount<K>;
    for (const p of counted) {
      const k = of(p.sign);
      out[k].score += WEIGHT[p.point] ?? 1;
      out[k].points.push(p.point);
    }
    return out;
  };
  const elements = tally(['fire', 'earth', 'air', 'water'] as const, elementOf);
  const modalities = tally(['cardinal', 'fixed', 'mutable'] as const, modalityOf);
  const polarity = tally(['yang', 'yin'] as const, polarityOf);
  const planets = positions.filter((p) => SUN_TO_PLUTO.includes(p.point) && p.house);
  const hemispheres = withHouses
    ? {
        above: planets.filter((p) => p.house! >= 7).map((p) => p.point),
        below: planets.filter((p) => p.house! <= 6).map((p) => p.point),
        east: planets.filter((p) => p.house! >= 10 || p.house! <= 3).map((p) => p.point),
        west: planets.filter((p) => p.house! >= 4 && p.house! <= 9).map((p) => p.point),
      }
    : null;
  const quadrants = withHouses ? [0, 1, 2, 3].map((q) => planets.filter((p) => Math.floor((p.house! - 1) / 3) === q).map((p) => p.point)) : null;
  const ranked = (Object.keys(elements) as Element[]).sort((a, b) => elements[b].score - elements[a].score);
  const rankedM = (Object.keys(modalities) as Modality[]).sort((a, b) => modalities[b].score - modalities[a].score);
  return {
    elements,
    modalities,
    polarity,
    hemispheres,
    quadrants,
    dominantElement: ranked[0],
    missingElements: ranked.filter((e) => elements[e].points.length === 0),
    dominantModality: rankedM[0],
  };
}

export const positionOf = (chart: Chart, point: ChartPointName) => chart.positions.find((p) => p.point === point) ?? null;

/** The chart ruler's own placement. */
export function rulerPosition(chart: Chart): Position | null {
  return chart.ruler ? positionOf(chart, chart.ruler.traditional) : null;
}

/** "Sun Scorpio · Moon Pisces · Leo rising", for list rows. */
export function bigThreeLine(chart: Chart): string {
  const sun = positionOf(chart, 'Sun');
  const moon = positionOf(chart, 'Moon');
  const asc = positionOf(chart, 'Ascendant');
  return [sun && `Sun ${sun.sign}`, moon && `Moon ${moon.sign}`, asc && `${asc.sign} rising`].filter(Boolean).join(' · ');
}
