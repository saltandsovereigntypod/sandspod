// The magic square (kamea) method: each of the seven old planets has its
// square of numbers (Saturn 3 × 3 up to the Moon 9 × 9, as Agrippa gives
// them). Each letter becomes its number in the alphabet, its digits added
// together until it fits the square, and the sigil is the path traced from
// number to number across the planet's square, with a small circle where it
// begins and a bar where it ends. Pure.

import { circlePath, toPath, type Point } from './geometry.ts';

export type PlanetId = 'saturn' | 'jupiter' | 'mars' | 'sun' | 'venus' | 'mercury' | 'moon';

export type Planet = { id: PlanetId; name: string; size: number; day: string; suits: string };

export const PLANETS: Planet[] = [
  { id: 'saturn', name: 'Saturn', size: 3, day: 'Saturday', suits: 'endings, protection, boundaries, patience' },
  { id: 'jupiter', name: 'Jupiter', size: 4, day: 'Thursday', suits: 'growth, plenty, luck, good counsel' },
  { id: 'mars', name: 'Mars', size: 5, day: 'Tuesday', suits: 'courage, strength, drive, defence' },
  { id: 'sun', name: 'Sun', size: 6, day: 'Sunday', suits: 'health, success, confidence, clarity' },
  { id: 'venus', name: 'Venus', size: 7, day: 'Friday', suits: 'love, friendship, beauty, peace' },
  { id: 'mercury', name: 'Mercury', size: 8, day: 'Wednesday', suits: 'study, words, travel, trade' },
  { id: 'moon', name: 'Moon', size: 9, day: 'Monday', suits: 'dreams, intuition, home, the tides of feeling' },
];

export const planetById = (id: string | null | undefined): Planet | null => PLANETS.find((p) => p.id === id) ?? null;

/** The planetary squares as Agrippa printed them (Three Books of Occult Philosophy, II.22). */
export const KAMEAS: Record<PlanetId, number[][]> = {
  saturn: [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ],
  jupiter: [
    [4, 14, 15, 1],
    [9, 7, 6, 12],
    [5, 11, 10, 8],
    [16, 2, 3, 13],
  ],
  mars: [
    [11, 24, 7, 20, 3],
    [4, 12, 25, 8, 16],
    [17, 5, 13, 21, 9],
    [10, 18, 1, 14, 22],
    [23, 6, 19, 2, 15],
  ],
  sun: [
    [6, 32, 3, 34, 35, 1],
    [7, 11, 27, 28, 8, 30],
    [19, 14, 16, 15, 23, 24],
    [18, 20, 22, 21, 17, 13],
    [25, 29, 10, 9, 26, 12],
    [36, 5, 33, 4, 2, 31],
  ],
  venus: [
    [22, 47, 16, 41, 10, 35, 4],
    [5, 23, 48, 17, 42, 11, 29],
    [30, 6, 24, 49, 18, 36, 12],
    [13, 31, 7, 25, 43, 19, 37],
    [38, 14, 32, 1, 26, 44, 20],
    [21, 39, 8, 33, 2, 27, 45],
    [46, 15, 40, 9, 34, 3, 28],
  ],
  mercury: [
    [8, 58, 59, 5, 4, 62, 63, 1],
    [49, 15, 14, 52, 53, 11, 10, 56],
    [41, 23, 22, 44, 45, 19, 18, 48],
    [32, 34, 35, 29, 28, 38, 39, 25],
    [40, 26, 27, 37, 36, 30, 31, 33],
    [17, 47, 46, 20, 21, 43, 42, 24],
    [9, 55, 54, 12, 13, 51, 50, 16],
    [64, 2, 3, 61, 60, 6, 7, 57],
  ],
  moon: [
    [37, 78, 29, 70, 21, 62, 13, 54, 5],
    [6, 38, 79, 30, 71, 22, 63, 14, 46],
    [47, 7, 39, 80, 31, 72, 23, 55, 15],
    [16, 48, 8, 40, 81, 32, 64, 24, 56],
    [57, 17, 49, 9, 41, 73, 33, 65, 25],
    [26, 58, 18, 50, 1, 42, 74, 34, 66],
    [67, 27, 59, 10, 51, 2, 43, 75, 35],
    [36, 68, 19, 60, 11, 52, 3, 44, 76],
    [77, 28, 69, 20, 61, 12, 53, 4, 45],
  ],
};

/** A letter's number, the Pythagorean way: A, J and S are 1; I and R are 9. */
export function letterValue(ch: string): number {
  const code = ch.toUpperCase().charCodeAt(0) - 64;
  if (!(code >= 1 && code <= 26)) return 0;
  return ((code - 1) % 9) + 1;
}

/** A letter's place in the alphabet: A 1 to Z 26. */
export function letterNumber(ch: string): number {
  const code = ch.toUpperCase().charCodeAt(0) - 64;
  return code >= 1 && code <= 26 ? code : 0;
}

/** A number made to fit a square of `size`: its digits are added together until it does (26 → 8 on Jupiter's 16). */
export function fitNumber(value: number, size: number): number {
  let v = Math.round(value);
  while (v > size * size) v = String(v).split('').reduce((sum, d) => sum + Number(d), 0);
  return v;
}

/** Add digits until one is left (38 → 11 → 2). */
export function digitalRoot(n: number): number {
  if (!(n > 0)) return 0;
  return 1 + ((Math.round(n) - 1) % 9);
}

// The numerologists' rulers of 1 to 9, with the old planets standing in for
// the new (4, Uranus, goes to the Sun; 7, Neptune, to the Moon).
const ROOT_PLANET: PlanetId[] = ['sun', 'moon', 'jupiter', 'sun', 'mercury', 'venus', 'moon', 'saturn', 'mars'];

/** The planet the letters' numbers add up to (Pythagorean numerology), as a suggestion. */
export function suggestPlanet(letters: string): PlanetId | null {
  const total = [...letters].reduce((sum, ch) => sum + letterValue(ch), 0);
  const root = digitalRoot(total);
  return root ? ROOT_PLANET[root - 1] : null;
}

/** Where a number sits in a square: [row, column], or null. */
export function cellOf(square: number[][], value: number): [number, number] | null {
  for (let r = 0; r < square.length; r++) {
    const c = square[r].indexOf(value);
    if (c >= 0) return [r, c];
  }
  return null;
}

/** The square is drawn over this part of the sigil's box. */
export const SQUARE_BOX = { min: 20, max: 80 } as const;

export function cellCentre(size: number, row: number, col: number, box = SQUARE_BOX): Point {
  const cell = (box.max - box.min) / size;
  return [box.min + (col + 0.5) * cell, box.min + (row + 0.5) * cell];
}

export type KameaTrace = {
  planet: PlanetId;
  size: number;
  /** Each letter's number, in order. */
  values: number[];
  /** The squares visited, a repeat in a row counted once. */
  cells: [number, number][];
  points: Point[];
  /** Path data: the line, the circle at its start and the bar at its end. */
  d: string;
};

/**
 * Trace letters over a planet's square. The line leaves the edge of a small
 * circle on the first number and ends in a bar across the last.
 */
export function traceKamea(letters: string, planet: PlanetId): KameaTrace | null {
  const square = KAMEAS[planet];
  if (!square) return null;
  const size = square.length;
  const values = [...letters].map((ch) => fitNumber(letterNumber(ch), size)).filter((v) => v > 0);
  const cells: [number, number][] = [];
  for (const v of values) {
    const cell = cellOf(square, v);
    if (!cell) continue;
    const last = cells[cells.length - 1];
    if (last && last[0] === cell[0] && last[1] === cell[1]) continue;
    cells.push(cell);
  }
  if (!cells.length) return null;
  const points = cells.map(([r, c]) => cellCentre(size, r, c));
  const cell = (SQUARE_BOX.max - SQUARE_BOX.min) / size;
  const r = Math.min(4.5, Math.max(2.8, cell * 0.32));
  const bar = r * 1.5;
  const parts: string[] = [circlePath(points[0][0], points[0][1], r)];

  if (points.length === 1) {
    // One number only: the circle, and a bar beneath it.
    const [x, y] = points[0];
    parts.push(toPath([[[x - bar, y + r * 2], [x + bar, y + r * 2]]]));
  } else {
    // The line starts at the circle's edge, not its centre.
    const [x0, y0] = points[0];
    const [x1, y1] = points[1];
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const start: Point = [x0 + ((x1 - x0) / len) * r, y0 + ((y1 - y0) / len) * r];
    parts.push(toPath([[start, ...points.slice(1)]]));
    // A bar across the end, square to the last stroke.
    const [ax, ay] = points[points.length - 2];
    const [bx, by] = points[points.length - 1];
    const l = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / l;
    const ny = (bx - ax) / l;
    parts.push(toPath([[[bx - nx * bar, by - ny * bar], [bx + nx * bar, by + ny * bar]]]));
  }
  return { planet, size, values, cells, points, d: parts.join(' ') };
}
