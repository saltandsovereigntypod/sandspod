// The letter method, after Austin Osman Spare: write a statement of intent,
// strike out the letters that repeat (and the vowels, if you like), and build
// one mark from the shapes of the letters left. The app offers a few ways of
// putting the letters together; people can also draw it themselves. Pure.

import { arc, fitToBox, mergeStrokes, toPath, transform, type Polyline } from './geometry.ts';

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export type Reduction = {
  /** Every letter of the statement, in capitals, without spaces or marks. */
  all: string;
  /** What's left: each letter once, in the order it first appears. */
  kept: string;
  /** The letters struck out, for showing the working. */
  dropped: string;
};

/** Letters A–Z only: accents are taken off, other characters left out. */
export function lettersOf(statement: string): string {
  return String(statement ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

/** Strike out repeated letters, and the vowels too when asked. */
export function reduceStatement(statement: string, dropVowels = false): Reduction {
  const all = lettersOf(statement);
  const seen = new Set<string>();
  let kept = '';
  let dropped = '';
  for (const ch of all) {
    if (seen.has(ch) || (dropVowels && VOWELS.has(ch))) {
      dropped += ch;
      continue;
    }
    seen.add(ch);
    kept += ch;
  }
  // A statement of nothing but vowels still leaves something to draw.
  if (!kept && all) return reduceStatement(statement, false);
  return { all, kept, dropped };
}

// Each letter drawn with a few strokes on a 4 × 4 grid (y runs down). Shared
// grid points mean letters laid over each other share their lines.
const C_ARC = arc(2, 2, 2, 40, 320);
const O_RING = arc(2, 2, 2, 0, 360, 16);

export const LETTER_SHAPES: Record<string, Polyline[]> = {
  A: [[[0, 4], [2, 0], [4, 4]], [[1, 2], [3, 2]]],
  B: [[[0, 0], [0, 4]], [[0, 0], [3, 0], [4, 1], [3, 2], [0, 2]], [[3, 2], [4, 3], [3, 4], [0, 4]]],
  C: [C_ARC],
  D: [[[0, 0], [0, 4]], [[0, 0], [2, 0], [4, 2], [2, 4], [0, 4]]],
  E: [[[4, 0], [0, 0], [0, 4], [4, 4]], [[0, 2], [3, 2]]],
  F: [[[4, 0], [0, 0], [0, 4]], [[0, 2], [3, 2]]],
  G: [arc(2, 2, 2, -40, -360), [[4, 2], [2, 2]]],
  H: [[[0, 0], [0, 4]], [[4, 0], [4, 4]], [[0, 2], [4, 2]]],
  I: [[[2, 0], [2, 4]], [[1, 0], [3, 0]], [[1, 4], [3, 4]]],
  J: [[[4, 0], [4, 3], [3, 4], [1, 4], [0, 3]]],
  K: [[[0, 0], [0, 4]], [[4, 0], [0, 2], [4, 4]]],
  L: [[[0, 0], [0, 4], [4, 4]]],
  M: [[[0, 4], [0, 0], [2, 2], [4, 0], [4, 4]]],
  N: [[[0, 4], [0, 0], [4, 4], [4, 0]]],
  O: [O_RING],
  P: [[[0, 4], [0, 0], [3, 0], [4, 1], [3, 2], [0, 2]]],
  Q: [O_RING, [[2.6, 2.6], [4, 4]]],
  R: [[[0, 4], [0, 0], [3, 0], [4, 1], [3, 2], [0, 2]], [[2, 2], [4, 4]]],
  S: [[[4, 0.5], [3, 0], [1, 0], [0, 1], [1, 2], [3, 2], [4, 3], [3, 4], [1, 4], [0, 3.5]]],
  T: [[[0, 0], [4, 0]], [[2, 0], [2, 4]]],
  U: [[[0, 0], [0, 3], [1, 4], [3, 4], [4, 3], [4, 0]]],
  V: [[[0, 0], [2, 4], [4, 0]]],
  W: [[[0, 0], [1, 4], [2, 2], [3, 4], [4, 0]]],
  X: [[[0, 0], [4, 4]], [[4, 0], [0, 4]]],
  Y: [[[0, 0], [2, 2], [4, 0]], [[2, 2], [2, 4]]],
  Z: [[[0, 0], [4, 0], [0, 4], [4, 4]]],
};

export type ArrangementId = 'woven' | 'turned' | 'spine' | 'nested';

export type Arrangement = { id: ArrangementId; label: string; detail: string; d: string };

export const ARRANGEMENTS: { id: ArrangementId; label: string; detail: string }[] = [
  { id: 'woven', label: 'Woven', detail: 'Every letter laid over the others, sharing their lines' },
  { id: 'turned', label: 'Turned', detail: 'Laid over each other, some turned or mirrored' },
  { id: 'spine', label: 'Spine', detail: 'Hung either side of one upright line' },
  { id: 'nested', label: 'Nested', detail: 'Each letter a little smaller, set inside the last' },
];

/** A small, steady random number generator, so the same seed gives the same sigil. */
function rng(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

function hash(text: string): number {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

const shapes = (letters: string) => [...letters].map((ch) => LETTER_SHAPES[ch]).filter(Boolean);

/** The letters put together one way, as polylines in no particular box. */
export function arrangeLetters(letters: string, id: ArrangementId, seed = 0): Polyline[] {
  const list = shapes(letters);
  if (!list.length) return [];
  const random = rng(hash(letters) + seed * 7919 + 1);
  const lines: Polyline[] = [];
  list.forEach((shape, i) => {
    if (id === 'woven') {
      lines.push(...shape);
    } else if (id === 'turned') {
      // The first letter stays upright to anchor the mark.
      const turns = [0, 90, 180, 270];
      const t = i === 0 && seed === 0 ? { rotate: 0 } : { rotate: turns[Math.floor(random() * 4)], mirror: random() < 0.35 };
      lines.push(...transform(shape, t));
    } else if (id === 'spine') {
      // Letters at half size, alternating sides of a central line from top to bottom.
      const n = list.length;
      const step = n > 1 ? 6 / (n - 1) : 0;
      const side = i % 2 === 0 ? -1 : 1;
      const jitter = seed ? (random() - 0.5) * 0.6 : 0;
      lines.push(...transform(shape, { scale: 0.5, mirror: side > 0 && seed % 2 === 1, dx: side * 1 + jitter, dy: -3 + i * step }));
    } else {
      const scale = Math.max(0.3, 1 - i * (0.7 / Math.max(1, list.length)));
      const angle = seed ? [0, 90, 180, 270][Math.floor(random() * 4)] : 0;
      lines.push(...transform(shape, { scale, rotate: angle }));
    }
  });
  if (id === 'spine') lines.push([[2, -1.2], [2, 5.2]]);
  return lines;
}

/** Path data for one arrangement, merged and fitted to the sigil's box. */
export function letterSigilPath(letters: string, id: ArrangementId, seed = 0): string {
  return toPath(fitToBox(mergeStrokes(arrangeLetters(letters, id, seed))));
}

/** A few arrangements to choose from. Change the seed to see others. */
export function letterArrangements(letters: string, seed = 0): Arrangement[] {
  if (!shapes(letters).length) return [];
  return ARRANGEMENTS.map((a) => ({ ...a, d: letterSigilPath(letters, a.id, seed) }));
}
