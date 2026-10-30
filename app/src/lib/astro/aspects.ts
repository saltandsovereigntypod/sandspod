// Aspects (the angles planets make to one another), their orbs, and the
// larger shapes they make together: grand trine, T-square, grand cross,
// yod, kite and stellium. Pure.

import type { ZodiacSign } from '../moon.ts';
import { diff } from './ephemeris.ts';
import type { ChartPointName } from './signs.ts';

export const ASPECT_NAMES = [
  'conjunction',
  'opposition',
  'trine',
  'square',
  'sextile',
  'quincunx',
  'semisextile',
  'semisquare',
  'sesquiquadrate',
  'quintile',
  'biquintile',
] as const;
export type AspectName = (typeof ASPECT_NAMES)[number];

export type AspectDef = { name: AspectName; angle: number; symbol: string; major: boolean; orb: number; tone: 'blend' | 'hard' | 'soft' | 'minor' };

/**
 * The default orbs are middle-of-the-road modern ones (close to those of
 * Liz Greene and the Astrodienst defaults): wide for the majors, tight for
 * the minors, with two degrees more whenever the Sun or Moon is involved.
 */
export const ASPECTS: AspectDef[] = [
  { name: 'conjunction', angle: 0, symbol: '☌', major: true, orb: 8, tone: 'blend' },
  { name: 'opposition', angle: 180, symbol: '☍', major: true, orb: 8, tone: 'hard' },
  { name: 'trine', angle: 120, symbol: '△', major: true, orb: 7, tone: 'soft' },
  { name: 'square', angle: 90, symbol: '□', major: true, orb: 7, tone: 'hard' },
  { name: 'sextile', angle: 60, symbol: '⚹', major: true, orb: 5, tone: 'soft' },
  { name: 'quincunx', angle: 150, symbol: '⚻', major: false, orb: 3, tone: 'minor' },
  { name: 'semisextile', angle: 30, symbol: '⚺', major: false, orb: 2, tone: 'minor' },
  { name: 'semisquare', angle: 45, symbol: '∠', major: false, orb: 2, tone: 'hard' },
  { name: 'sesquiquadrate', angle: 135, symbol: '⚼', major: false, orb: 2, tone: 'hard' },
  { name: 'quintile', angle: 72, symbol: 'Q', major: false, orb: 1.5, tone: 'minor' },
  { name: 'biquintile', angle: 144, symbol: 'bQ', major: false, orb: 1.5, tone: 'minor' },
];
export const aspectDef = (name: AspectName) => ASPECTS.find((a) => a.name === name)!;

/** What a person can change: each aspect's orb, the luminaries' extra, and whether minor aspects show. Saved as JSON in the setting `astro_orbs`. */
export type OrbSettings = { orbs: Partial<Record<AspectName, number>>; luminaryBonus: number; minors: boolean };
export const DEFAULT_ORBS: OrbSettings = { orbs: {}, luminaryBonus: 2, minors: true };

export function parseOrbs(raw: unknown): OrbSettings {
  let value: unknown = raw;
  if (typeof raw === 'string') {
    try {
      value = raw ? JSON.parse(raw) : {};
    } catch {
      value = {};
    }
  }
  const v = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const orbs: Partial<Record<AspectName, number>> = {};
  const given = (v.orbs && typeof v.orbs === 'object' ? v.orbs : {}) as Record<string, unknown>;
  for (const name of ASPECT_NAMES) {
    const n = Number(given[name]);
    if (Number.isFinite(n) && n >= 0 && n <= 12) orbs[name] = n;
  }
  const bonus = Number(v.luminaryBonus);
  return {
    orbs,
    luminaryBonus: Number.isFinite(bonus) && bonus >= 0 && bonus <= 5 ? bonus : DEFAULT_ORBS.luminaryBonus,
    minors: typeof v.minors === 'boolean' ? v.minors : DEFAULT_ORBS.minors,
  };
}

export const orbFor = (name: AspectName, settings: OrbSettings) => settings.orbs[name] ?? aspectDef(name).orb;

const LUMINARIES = new Set<ChartPointName>(['Sun', 'Moon']);
// Points that aren't bodies get a narrower orb (no more than 3°), as most astrologers allow.
const NARROW = new Set<ChartPointName>(['North Node', 'South Node', 'Lilith', 'Part of Fortune', 'Chiron']);

/** The orb allowed between two points for one aspect. */
export function allowedOrb(name: AspectName, a: ChartPointName, b: ChartPointName, settings: OrbSettings): number {
  let orb = orbFor(name, settings);
  if (LUMINARIES.has(a) || LUMINARIES.has(b)) orb += aspectDef(name).major ? settings.luminaryBonus : 0;
  if (NARROW.has(a) || NARROW.has(b)) orb = Math.min(orb, aspectDef(name).major ? 3 : 1);
  return orb;
}

export type AspectHit = {
  a: ChartPointName;
  b: ChartPointName;
  aspect: AspectName;
  /** Degrees from exact. */
  orb: number;
  /** Getting closer (applying) or parting (separating); null when the speeds aren't known. */
  applying: boolean | null;
};

export type AspectPoint = { point: ChartPointName; longitude: number; speed?: number | null };

/** Shortest angle between two longitudes, 0–180. */
export const separation = (a: number, b: number) => Math.abs(diff(a, b));

/** The closest aspect two points make within their allowed orbs, or null. */
export function aspectBetween(x: AspectPoint, y: AspectPoint, settings: OrbSettings): AspectHit | null {
  const sep = separation(x.longitude, y.longitude);
  let best: AspectHit | null = null;
  for (const def of ASPECTS) {
    if (!def.major && !settings.minors) continue;
    const off = Math.abs(sep - def.angle);
    if (off > allowedOrb(def.name, x.point, y.point, settings)) continue;
    if (best && off >= best.orb) continue;
    let applying: boolean | null = null;
    if (typeof x.speed === 'number' && typeof y.speed === 'number') {
      // A moment later, is the separation closer to exact?
      const dt = 0.01;
      const later = Math.abs(separation(x.longitude + x.speed * dt, y.longitude + y.speed * dt) - def.angle);
      applying = later < off;
    }
    best = { a: x.point, b: y.point, aspect: def.name, orb: off, applying };
  }
  return best;
}

// Pairs that are always in "aspect" by construction and say nothing.
const SKIP = new Set(['North Node|South Node', 'Ascendant|Descendant', 'Midheaven|IC']);
const pairKey = (a: ChartPointName, b: ChartPointName) => [a, b].sort().join('|');

/** Every aspect among a set of points, tightest first. */
export function aspectsAmong(points: AspectPoint[], settings: OrbSettings): AspectHit[] {
  const out: AspectHit[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (SKIP.has(pairKey(points[i].point, points[j].point))) continue;
      const hit = aspectBetween(points[i], points[j], settings);
      if (hit) out.push(hit);
    }
  }
  return out.sort((p, q) => p.orb - q.orb);
}

/** Aspects from one set to another (transits to natal, or one person's chart to another's). */
export function aspectsAcross(from: AspectPoint[], to: AspectPoint[], settings: OrbSettings): AspectHit[] {
  const out: AspectHit[] = [];
  for (const x of from) for (const y of to) {
    const hit = aspectBetween(x, y, settings);
    if (hit) out.push(hit);
  }
  return out.sort((p, q) => p.orb - q.orb);
}

// ── Patterns ─────────────────────────────────────────────────────────────

export const PATTERN_NAMES = ['grand-trine', 't-square', 'grand-cross', 'yod', 'kite', 'stellium'] as const;
export type PatternName = (typeof PATTERN_NAMES)[number];
export const PATTERN_LABEL: Record<PatternName, string> = {
  'grand-trine': 'Grand trine',
  't-square': 'T-square',
  'grand-cross': 'Grand cross',
  yod: 'Yod',
  kite: 'Kite',
  stellium: 'Stellium',
};

export type Pattern = {
  name: PatternName;
  points: ChartPointName[];
  /** The focal point: a T-square's or yod's apex, a kite's tail. */
  apex?: ChartPointName;
  /** A stellium's sign or house. */
  sign?: ZodiacSign;
  house?: number;
};

/** Patterns among the given aspects. `placed` gives each body's sign and house for stelliums. */
export function findPatterns(
  bodies: ChartPointName[],
  aspects: AspectHit[],
  placed: { point: ChartPointName; sign: ZodiacSign; house: number | null }[],
): Pattern[] {
  const has = (a: ChartPointName, b: ChartPointName, name: AspectName) =>
    aspects.some((h) => h.aspect === name && ((h.a === a && h.b === b) || (h.a === b && h.b === a)));
  const out: Pattern[] = [];
  const n = bodies.length;
  const seen = new Set<string>();
  const add = (p: Pattern) => {
    const key = `${p.name}:${[...p.points].sort().join(',')}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(p);
  };

  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++) {
        const [a, b, c] = [bodies[i], bodies[j], bodies[k]];
        if (has(a, b, 'trine') && has(b, c, 'trine') && has(a, c, 'trine')) add({ name: 'grand-trine', points: [a, b, c] });
        for (const [x, y, apex] of [[a, b, c], [a, c, b], [b, c, a]] as const) {
          if (has(x, y, 'opposition') && has(x, apex, 'square') && has(y, apex, 'square')) add({ name: 't-square', points: [x, y, apex], apex });
          if (has(x, y, 'sextile') && has(x, apex, 'quincunx') && has(y, apex, 'quincunx')) add({ name: 'yod', points: [x, y, apex], apex });
        }
      }

  const trines = out.filter((p) => p.name === 'grand-trine');
  const tsquares = out.filter((p) => p.name === 't-square');
  // Grand cross: two T-squares sharing their opposition, apexes opposite each other.
  for (let i = 0; i < tsquares.length; i++)
    for (let j = i + 1; j < tsquares.length; j++) {
      const s = new Set([...tsquares[i].points, ...tsquares[j].points]);
      if (s.size !== 4) continue;
      const four = [...s];
      const oppositions = four.flatMap((a, x) => four.slice(x + 1).filter((b) => has(a, b, 'opposition')));
      const squares = four.flatMap((a, x) => four.slice(x + 1).filter((b) => has(a, b, 'square')));
      if (oppositions.length === 2 && squares.length === 4) add({ name: 'grand-cross', points: four });
    }
  // Kite: a grand trine, plus a fourth point opposite one corner and sextile the other two.
  for (const t of trines)
    for (const tail of bodies) {
      if (t.points.includes(tail)) continue;
      for (const corner of t.points) {
        const others = t.points.filter((p) => p !== corner);
        if (has(tail, corner, 'opposition') && others.every((o) => has(tail, o, 'sextile'))) add({ name: 'kite', points: [...t.points, tail], apex: corner });
      }
    }
  // T-squares that are part of a grand cross are named by the cross.
  const crosses = out.filter((p) => p.name === 'grand-cross');
  const result = out.filter((p) => p.name !== 't-square' || !crosses.some((c) => p.points.every((x) => c.points.includes(x))));

  // Stelliums: three or more bodies in one sign, or in one house.
  const bySign = new Map<ZodiacSign, ChartPointName[]>();
  const byHouse = new Map<number, ChartPointName[]>();
  for (const p of placed) {
    if (!bodies.includes(p.point)) continue;
    bySign.set(p.sign, [...(bySign.get(p.sign) ?? []), p.point]);
    if (p.house) byHouse.set(p.house, [...(byHouse.get(p.house) ?? []), p.point]);
  }
  for (const [sign, pts] of bySign) if (pts.length >= 3) result.push({ name: 'stellium', points: pts, sign });
  for (const [house, pts] of byHouse) if (pts.length >= 3) result.push({ name: 'stellium', points: pts, house });
  return result;
}
