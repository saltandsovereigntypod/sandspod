// Witch's alphabets: write a word in Theban, Passing the River, Malachim,
// Celestial, the Elder Futhark or Ogham. Each letter is drawn as strokes in a
// 10 × 10 box, so a word can be shown, carved on a candle (as a mark in the
// sigil's 100 × 100 box) or kept with your sigils. Only the runes and ogham
// have Unicode letters to copy as text; the other four were never encoded.
//
// The letters are our own redrawings: Theban after the table in Trithemius's
// Polygraphia (1518), the three Hebrew-derived scripts after the plates of
// Agrippa's Three Books of Occult Philosophy, Book III, ch. 30 (English
// edition, 1651). Printed and hand-copied tables differ, so these are close,
// not exact. Pure.

import { arc, fitToBox, toPath, type Point, type Polyline } from './geometry.ts';

export type ScriptId = 'theban' | 'river' | 'malachim' | 'celestial' | 'futhark' | 'ogham';

export type Script = {
  id: ScriptId;
  name: string;
  /** Other names it goes by. */
  aka: string;
  /** What's documented about where it comes from, and what isn't. */
  origins: string;
  /** How Latin letters were matched to it here. */
  how: string;
  /** Whether it has Unicode letters to copy as text. */
  unicode: boolean;
};

export const SCRIPTS: Script[] = [
  {
    id: 'theban',
    name: 'Theban',
    aka: 'The witches’ alphabet, the Honorian alphabet',
    origins:
      'First printed in Johannes Trithemius’s Polygraphia (1518), which credits it to “Honorius of Thebes” by way of Pietro d’Abano; Agrippa reprinted it in his Three Books of Occult Philosophy (1531–33). Nothing older survives, and who Honorius was is unknown. Calling it the witches’ alphabet is twentieth-century: it came into Wiccan Books of Shadows from Gardner’s circle onward.',
    how: 'Letter for letter, as Trithemius set it out against the Latin alphabet of his day: there is no J, U or W, so J is written as I, U as V, and W as two Vs. The end mark closes a sentence.',
    unicode: false,
  },
  {
    id: 'river',
    name: 'Passing the River',
    aka: 'Transitus Fluvii',
    origins:
      'Printed in Agrippa’s Three Books of Occult Philosophy, Book III, ch. 30 (1533), alongside Celestial and Malachim, as one of the “characters delivered by Cabalists”. Its twenty-two letters are drawn from Hebrew. The name is usually tied to the Israelites crossing the Euphrates or the Jordan; that story comes with the tradition and isn’t documented history.',
    how: 'Through the Hebrew letters, one common modern key: A Aleph, B Beth, C and K Caph, D Daleth, E He, F and P Pe, G Gimel, H Cheth, I, J and Y Iod, L Lamed, M Mem, N Nun, O Ain, Q Kuf, R Res, S Samech, T Teth, U, V and W Vau, Z Zain; SH Schin, TH Tau, TZ Zade. X is written Caph-Samech. Other keys put H to He and T to Tau.',
    unicode: false,
  },
  {
    id: 'malachim',
    name: 'Malachim',
    aka: 'The writing of the angels, or regal writing',
    origins:
      'Agrippa’s Three Books of Occult Philosophy, Book III, ch. 30 (1533), where it is called Malachim, “of angels, or regal”. Like Celestial and Passing the River it is built on the twenty-two Hebrew letters, its strokes ending in small rings.',
    how: 'Through the Hebrew letters, with the same key as Passing the River.',
    unicode: false,
  },
  {
    id: 'celestial',
    name: 'Celestial',
    aka: 'Angelic, the writing of the heavens',
    origins:
      'Agrippa’s Three Books of Occult Philosophy, Book III, ch. 30 (1533), which says the Cabalists drew it from the patterns of the stars. It is Hebrew-based, and its later letters stay close to the Hebrew square forms. It isn’t the same thing as John Dee’s Enochian, which came in the 1580s.',
    how: 'Through the Hebrew letters, with the same key as Passing the River.',
    unicode: false,
  },
  {
    id: 'futhark',
    name: 'Elder Futhark',
    aka: 'The older runes',
    origins:
      'The oldest runic row, twenty-four runes in use among Germanic peoples from about the 2nd to the 8th century. The Vimose comb from Denmark (c. 160 CE) is among the earliest finds, and the Kylver stone in Gotland (c. 400) carries the whole row. The rune names are reconstructions from later rune poems.',
    how: 'The runes wrote sounds, not English spelling, so this is an approximate transliteration: C and K both become kaunan, Q becomes k-w, X becomes k-s, V and W become wunjō, Y becomes jēran; TH is thurisaz and NG is ingwaz. Spelling a name by how it sounds gives a truer result.',
    unicode: true,
  },
  {
    id: 'ogham',
    name: 'Ogham',
    aka: 'Ogam, the Celtic tree alphabet',
    origins:
      'An Early Irish script of strokes along a stem line. Some four hundred stone inscriptions survive from about the 4th to the 6th century, in Ireland and western Britain, carved up the edge of the stone. The tree names for the letters come from medieval scholars (the Auraicept na nÉces and the Book of Ballymote, 1390s); how far back they go is uncertain. Ogham is part of living Irish heritage: use it with care for that.',
    how: 'Written left to right along a stem line, as in the manuscripts, between the feather marks. There is no J, K, P, V, W, X, Y or Z in the original twenty letters: K is Coll, V is Fearn, W is Úr, J and Y are Iodhadh, Z is Straif, and P and X use the later added letters Peith and Emancholl.',
    unicode: true,
  },
];

export const scriptOf = (id: string) => SCRIPTS.find((s) => s.id === id) ?? SCRIPTS[0];

// ─── Drawing helpers ──────────────────────────────────────────────────────

type Glyph = Polyline[];
const P = (...pts: number[]): Polyline => {
  const out: Polyline = [];
  for (let i = 0; i + 1 < pts.length; i += 2) out.push([pts[i], pts[i + 1]]);
  return out;
};
/** A small ring, as the Hebrew-derived scripts end their strokes. */
const O = (x: number, y: number, r = 0.75): Polyline => arc(x, y, r, 0, 360, 10);

// ─── Theban (after Trithemius, 1518) ─────────────────────────────────────

const THEBAN: Record<string, Glyph> = {
  A: [P(2, 2, 3, 3.5, 6, 3), P(6, 1, 6, 7, 7, 9, 9, 8.5)],
  B: [P(3, 4, 3, 1, 7, 1), P(3, 4, 7, 4), P(7, 1, 7, 9, 5.5, 9.6)],
  C: [P(1, 1, 2, 4, 5, 4, 6, 1), P(3.5, 1, 3.5, 4), P(6, 1, 6, 8, 8, 9.5)],
  D: [P(1, 4, 1, 1, 3, 1, 3, 4), P(3, 1, 5, 1, 5, 8, 4, 10, 2, 9)],
  E: [P(2, 1, 3, 3, 6, 3), P(6, 0.5, 6, 6, 4, 8.5, 6, 9.5)],
  F: [P(1, 2, 4, 1, 9, 0.5), P(3, 1, 8, 9), P(8, 1, 3, 9)],
  G: [P(1, 1, 2, 1, 2, 7, 5, 9, 8, 7, 8, 1)],
  H: [P(2, 1, 8, 9), P(8, 1, 2, 9), P(8, 1, 9, 2, 8, 3)],
  I: [P(1, 6, 1, 3, 2, 2, 3, 3, 3, 6), P(5, 1, 5, 7, 7, 9, 9, 7, 9, 1)],
  K: [P(4, 1, 1, 1, 1, 8, 4, 9), P(4, 4, 4, 1, 6, 1, 6, 4), P(6, 1, 8, 1, 8, 4)],
  L: [P(1, 2, 3, 1, 7, 2), P(7, 2, 2, 9, 8, 9)],
  M: [P(1, 4, 1, 1, 3, 1, 3, 4), P(3, 1, 5, 1, 5, 9), P(5, 6, 7, 5, 8, 6, 8, 9)],
  N: [P(1, 1, 2, 4, 4, 4), P(4, 1, 4, 9), P(4, 6, 6, 5, 7, 6, 7, 9)],
  O: [P(1, 4, 1, 1, 3, 1, 3, 4), P(3, 1, 5, 1, 5, 9, 7, 9, 7, 6, 5, 6)],
  P: [P(2, 3, 2, 1, 4, 1, 4, 3), P(4, 1, 6, 1, 6, 3), P(2, 4, 8, 9), P(8, 4, 2, 9)],
  Q: [P(1, 2, 3, 1, 5, 2, 5, 4, 3, 5, 1, 4, 1, 2), P(5, 2, 5, 9), P(5, 6, 7, 5, 8, 6, 8, 9)],
  R: [P(1, 4, 1, 1, 3, 1, 3, 4), P(3, 1, 5, 1, 5, 9, 8, 9)],
  S: [P(2, 1, 3, 3, 6, 3), P(6, 1, 6, 5), P(6, 5, 4, 7, 6, 9.5, 8, 7, 6, 5)],
  T: [P(2, 1, 3, 3, 6, 3), P(6, 1, 6, 4), P(3, 5, 7, 5, 3, 9, 8, 9)],
  V: [P(1, 0.5, 5, 9, 9, 1), P(3, 1, 5, 3, 7, 1)],
  X: [P(1, 4, 1, 1, 3, 1, 3, 8, 5, 9, 7, 8, 7, 1), P(7, 1, 9, 1, 9, 4)],
  Y: [P(1, 1, 3, 4, 5, 1), P(5, 1, 5, 9), P(5, 5, 8, 5, 9, 9)],
  Z: [P(2, 1, 3, 3, 6, 3), P(6, 0.5, 6, 9), P(4, 6, 8, 6), P(8, 4, 8, 8)],
  '.': [P(2, 1, 3, 3, 6, 3), P(6, 1, 6, 5), P(3, 6, 8, 5), P(7, 4, 4, 9)],
};

// ─── The three Hebrew-derived scripts (after Agrippa III.30, 1651 edition) ───

type Hebrew = 'aleph' | 'beth' | 'gimel' | 'daleth' | 'he' | 'vau' | 'zain' | 'cheth' | 'teth' | 'iod' | 'caph' | 'lamed' | 'mem' | 'nun' | 'samech' | 'ain' | 'pe' | 'zade' | 'kuf' | 'res' | 'schin' | 'tau';

export const HEBREW_NAMES: Record<Hebrew, string> = {
  aleph: 'Aleph', beth: 'Beth', gimel: 'Gimel', daleth: 'Daleth', he: 'He', vau: 'Vau', zain: 'Zain', cheth: 'Cheth', teth: 'Teth', iod: 'Iod', caph: 'Caph',
  lamed: 'Lamed', mem: 'Mem', nun: 'Nun', samech: 'Samech', ain: 'Ain', pe: 'Pe', zade: 'Zade', kuf: 'Kuf', res: 'Res', schin: 'Schin', tau: 'Tau',
};

const RIVER: Record<Hebrew, Glyph> = {
  aleph: [P(6, 3, 4, 1.5, 2, 3, 2.5, 5.5, 5, 6, 6, 4, 6, 3), P(5, 6, 9, 9.5), P(6, 3, 8, 1.5), O(8.6, 1)],
  beth: [P(2, 2, 8, 2, 8, 8, 2, 8), O(1.3, 2), O(1.3, 8)],
  gimel: [P(6, 1, 6, 7, 5, 8.5, 3, 8.5), O(2.3, 8.5)],
  daleth: [P(2, 2, 8, 2, 8, 9), P(4, 5, 8, 5)],
  he: [P(7, 2, 3, 2, 3, 8, 7, 8), P(3, 5, 6, 5)],
  vau: [O(2, 4), P(2.8, 4, 4, 3, 6, 4.5, 8, 3.5, 9, 4)],
  zain: [P(8, 1.5, 2, 5, 8, 8.5), O(8.7, 1), O(8.7, 9)],
  cheth: [P(1, 2, 9, 2, 9, 9), P(3, 2, 3, 9), O(0.4, 2)],
  teth: [O(1.5, 5), P(2.2, 5, 8, 5), P(7, 1.6, 7, 8.4), O(7, 1), O(7, 9)],
  iod: [P(2, 2, 8, 2, 8, 9), P(3.5, 2, 3.5, 5), P(5.5, 2, 5.5, 5)],
  caph: [P(2, 2, 8, 2, 8, 9), O(1.3, 2)],
  lamed: [P(2, 2, 8, 2, 4, 5, 8, 6, 4, 9), O(1.3, 2)],
  mem: [P(2, 2, 8, 2, 9, 9, 2, 9, 4, 2)],
  nun: [P(2, 2, 8, 2, 3, 9), O(1.3, 2), O(2.7, 9.6)],
  samech: [P(2, 3, 7, 2, 7, 8, 2, 9), O(1.3, 3), O(1.3, 9)],
  ain: [P(5, 1.8, 5, 9), O(5, 1)],
  pe: [P(3, 2.5, 9, 9), P(2, 9, 9, 9), O(2.5, 2), O(1.3, 9)],
  zade: [P(2, 2, 8, 2), P(5, 2, 5, 9), P(3, 2, 3, 4.5)],
  kuf: [P(5, 1.6, 1.5, 8.5, 8.5, 8.5, 5, 1.6), O(5, 1), O(1, 9), O(9, 9)],
  res: [P(8, 1.8, 7, 7, 5, 9, 2, 8), O(8.2, 1)],
  schin: [P(2, 1.8, 5, 9, 8, 1.8), O(2, 1), O(8, 1)],
  tau: [P(3, 3, 9, 3), P(3, 3, 3, 8), P(3, 5.5, 8, 5.5), P(1, 8, 9, 8)],
};

const MALACHIM: Record<Hebrew, Glyph> = {
  aleph: [P(3, 1.8, 3, 8.2), P(7, 1.8, 7, 8.2), P(1, 3.5, 9, 3.5), P(1, 6.5, 9, 6.5), O(3, 1), O(7, 1), O(3, 9), O(7, 9)],
  beth: [P(2, 1.8, 2, 8, 8, 8, 8, 1.8), P(5, 1.8, 5, 8), O(2, 1), O(5, 1), O(8, 1)],
  gimel: [P(2, 1.8, 5, 5), P(8, 1.8, 5, 5, 4, 8, 2, 9), O(2, 1), O(8, 1)],
  daleth: [P(1.8, 1, 8.2, 1), P(5, 1, 5, 8.2), O(1, 1), O(9, 1), O(5, 9)],
  he: [P(2, 8.2, 2, 1.8, 8, 8.2, 8, 1.8), O(2, 9), O(8, 1)],
  vau: [P(1.5, 8.3, 5, 1, 8.5, 8.3), O(1.2, 9), O(8.8, 9)],
  zain: [P(1.4, 1.6, 5, 9, 8.6, 1.6), P(5, 1.8, 5, 9), O(1, 1), O(5, 1), O(9, 1)],
  cheth: [P(1, 2, 9, 2, 9, 8, 1, 8, 1, 2), P(5, 2, 5, 8)],
  teth: [P(2, 1.8, 8, 8.2), P(8, 1.8, 2, 8.2), O(2, 1), O(8, 1), O(2, 9), O(8, 9), O(5, 5, 0.6)],
  iod: [P(1.5, 8.3, 5, 2, 8.5, 8.3), O(5, 1.2), O(1.2, 9), O(8.8, 9)],
  caph: [arc(4, 5, 4, -90, 90, 12), O(4, 0.4), O(4, 9.6)],
  lamed: [P(8, 1.8, 8, 7, 6, 9, 3, 8.5, 2, 7), O(8, 1)],
  mem: [P(2, 1.8, 2, 8.2), P(8, 1.8, 8, 8.2), P(2, 5, 8, 5), O(2, 1), O(8, 1), O(2, 9), O(8, 9)],
  nun: [P(1, 1.5, 3, 1.5), P(3, 1.5, 3, 8.2, 8, 1.8, 8, 8.2), O(3, 9), O(8, 1), O(8, 9)],
  samech: [P(5, 1.8, 5, 9), P(1.5, 1.8, 1.5, 4, 5, 6, 8.5, 4, 8.5, 1.8), P(3, 1.8, 3, 4.8), P(7, 1.8, 7, 4.8), O(1.5, 1), O(3, 1), O(5, 1), O(7, 1), O(8.5, 1)],
  ain: [P(2, 2, 8, 2, 8, 8, 2, 8, 2, 2), O(1.4, 1.4), O(8.6, 1.4), O(1.4, 8.6), O(8.6, 8.6)],
  pe: [P(2, 1.8, 8, 8.2), P(8, 1.8, 2, 8.2), O(2, 1), O(8, 1)],
  zade: [P(5, 1.8, 5, 8.2), P(2, 4.5, 8, 4.5), P(3.5, 6.5, 6.5, 6.5), O(5, 1), O(5, 9)],
  kuf: [P(2, 1.8, 2, 6, 5, 8.5, 8, 6, 8, 1.8), P(5, 1.8, 5, 8.5), O(2, 1), O(5, 1), O(8, 1)],
  res: [P(2, 1.8, 5, 9, 8, 1.8), O(2, 1), O(8, 1)],
  schin: [P(2, 8.2, 2, 1.8, 8, 8.2), P(8, 8.2, 8, 1.8), P(1, 5, 3, 5), O(2, 9), O(8, 1)],
  tau: [P(2, 8.2, 2, 2, 8, 2, 8, 8.2), P(5, 2, 5, 6), O(2, 9), O(8, 9), O(5, 6.8)],
};

const CELESTIAL: Record<Hebrew, Glyph> = {
  aleph: [P(2, 1.8, 8, 8.2), P(8, 1.8, 2, 8.2), O(2, 1), O(8, 1), O(2, 9), O(8, 9)],
  beth: [P(2, 2, 8, 2, 4, 5, 8, 8, 2, 8), O(1.3, 2), O(1.3, 8)],
  gimel: [P(7, 1.8, 7, 9), P(2.8, 5, 7, 5), O(2, 5), O(7, 1)],
  daleth: [P(2.8, 2, 8, 2, 8, 9), O(2, 2), O(8, 9.7)],
  he: [P(1, 2, 9, 2), P(3, 2, 3, 8.2), P(7, 2, 7, 8.2), O(3, 9), O(7, 9)],
  vau: [P(5, 1.8, 5, 8.2), O(5, 1), O(5, 9)],
  zain: [P(1.8, 2, 8.2, 2), P(5, 2, 5, 8.2), O(1, 2), O(9, 2), O(5, 9)],
  cheth: [P(2, 8.2, 2, 2, 8, 2, 8, 8.2), O(2, 9), O(8, 9)],
  teth: [P(2, 1.8, 2, 6, 5, 8.5, 8, 6, 8, 1.8), O(2, 1), O(8, 1)],
  iod: [P(5, 1.8, 8.5, 8, 1.5, 8, 5, 1.8), O(5, 1), O(1, 8.6), O(9, 8.6)],
  caph: [arc(5.5, 5, 4, 60, 300, 14), O(7.5, 1.6), O(7.5, 8.4)],
  lamed: [P(3, 1.8, 7, 4, 3, 6, 7, 8.2), O(3, 1), O(7, 9)],
  mem: [P(1, 7.5, 4, 2, 6, 7, 9, 1.8), O(0.7, 8.4), O(9, 1)],
  nun: [P(5, 2, 8.5, 8.5, 1.5, 8.5), P(5, 2, 2.5, 8.5), O(5, 1.2), O(0.8, 8.5)],
  samech: [P(2, 2, 8, 2, 8, 7, 5, 9, 2, 7, 2, 2), O(1.3, 1.3)],
  ain: [P(2, 2, 5, 8), P(8, 2, 5, 8, 2, 9), O(2, 1.3), O(8, 1.3)],
  pe: [P(2, 5, 5, 5, 5, 2, 2, 2, 2, 9, 8, 9, 8, 2), O(8, 1.3)],
  zade: [P(2, 2, 6, 6), P(8, 2, 6, 6), P(6, 6, 2, 9, 8, 9), O(2, 1.3), O(8, 1.3)],
  kuf: [P(2, 2, 8, 2, 8, 6), P(3, 4, 3, 10), O(1.3, 2)],
  res: [P(2, 2, 8, 2, 8, 9), O(1.3, 2)],
  schin: [P(2, 1.8, 2, 8, 8, 8, 8, 1.8), P(5, 1.8, 5, 8), O(2, 1), O(5, 1), O(8, 1)],
  tau: [P(1, 2, 8, 2, 8, 9), P(3, 2, 3, 9, 1, 9), O(0.3, 2)],
};

/** Latin to Hebrew letters (digraphs first). */
const HEBREW_DIGRAPHS: [string, Hebrew[]][] = [
  ['SH', ['schin']],
  ['TH', ['tau']],
  ['TZ', ['zade']],
  ['TS', ['zade']],
  ['CH', ['cheth']],
];
const HEBREW_ONE: Record<string, Hebrew[]> = {
  A: ['aleph'], B: ['beth'], C: ['caph'], D: ['daleth'], E: ['he'], F: ['pe'], G: ['gimel'], H: ['cheth'], I: ['iod'], J: ['iod'], K: ['caph'], L: ['lamed'], M: ['mem'],
  N: ['nun'], O: ['ain'], P: ['pe'], Q: ['kuf'], R: ['res'], S: ['samech'], T: ['teth'], U: ['vau'], V: ['vau'], W: ['vau'], X: ['caph', 'samech'], Y: ['iod'], Z: ['zain'],
};

// ─── Elder Futhark ────────────────────────────────────────────────────────

type Rune = { char: string; name: string; glyph: Glyph };
const RUNES: Record<string, Rune> = {
  f: { char: 'ᚠ', name: 'fehu', glyph: [P(3, 0, 3, 10), P(3, 2, 7, 0), P(3, 5, 7, 3)] },
  u: { char: 'ᚢ', name: 'ūruz', glyph: [P(2, 10, 2, 0, 7, 3, 7, 10)] },
  th: { char: 'ᚦ', name: 'thurisaz', glyph: [P(3, 0, 3, 10), P(3, 3, 7, 5, 3, 7)] },
  a: { char: 'ᚨ', name: 'ansuz', glyph: [P(3, 0, 3, 10), P(3, 0, 7, 2.5), P(3, 3, 7, 5.5)] },
  r: { char: 'ᚱ', name: 'raidō', glyph: [P(3, 10, 3, 0, 7, 2.5, 3, 5, 7, 10)] },
  k: { char: 'ᚲ', name: 'kaunan', glyph: [P(7, 2, 3, 5, 7, 8)] },
  g: { char: 'ᚷ', name: 'gebō', glyph: [P(2, 1, 8, 9), P(8, 1, 2, 9)] },
  w: { char: 'ᚹ', name: 'wunjō', glyph: [P(3, 10, 3, 0, 7, 2.5, 3, 5)] },
  h: { char: 'ᚺ', name: 'hagalaz', glyph: [P(2, 0, 2, 10), P(8, 0, 8, 10), P(2, 3.5, 8, 6.5)] },
  n: { char: 'ᚾ', name: 'naudiz', glyph: [P(5, 0, 5, 10), P(3, 3, 7, 6)] },
  i: { char: 'ᛁ', name: 'īsaz', glyph: [P(5, 0, 5, 10)] },
  j: { char: 'ᛃ', name: 'jēran', glyph: [P(4, 1, 1.5, 4, 4, 6.5), P(6, 3.5, 8.5, 6, 6, 9)] },
  p: { char: 'ᛈ', name: 'perþ', glyph: [P(3, 0, 3, 10), P(3, 0, 6, 3, 8, 1.5), P(3, 10, 6, 7, 8, 8.5)] },
  z: { char: 'ᛉ', name: 'algiz', glyph: [P(5, 0, 5, 10), P(2, 0, 5, 4, 8, 0)] },
  s: { char: 'ᛊ', name: 'sōwilō', glyph: [P(6, 0, 3, 3.5, 7, 6.5, 4, 10)] },
  t: { char: 'ᛏ', name: 'tīwaz', glyph: [P(5, 0, 5, 10), P(2, 3, 5, 0, 8, 3)] },
  b: { char: 'ᛒ', name: 'berkanan', glyph: [P(3, 0, 3, 10), P(3, 0, 7, 2.5, 3, 5, 7, 7.5, 3, 10)] },
  e: { char: 'ᛖ', name: 'ehwaz', glyph: [P(2, 10, 2, 0, 5, 3, 8, 0, 8, 10)] },
  m: { char: 'ᛗ', name: 'mannaz', glyph: [P(2, 10, 2, 0, 8, 5), P(8, 10, 8, 0, 2, 5)] },
  l: { char: 'ᛚ', name: 'laguz', glyph: [P(3, 10, 3, 0, 7, 3)] },
  ng: { char: 'ᛜ', name: 'ingwaz', glyph: [P(5, 2, 8, 5, 5, 8, 2, 5, 5, 2)] },
  d: { char: 'ᛞ', name: 'dagaz', glyph: [P(2, 0, 2, 10, 8, 0, 8, 10, 2, 0)] },
  o: { char: 'ᛟ', name: 'ōthala', glyph: [P(2, 10, 8, 3.5, 5, 0, 2, 3.5, 8, 10)] },
};
const FUTHARK_ONE: Record<string, string[]> = {
  A: ['a'], B: ['b'], C: ['k'], D: ['d'], E: ['e'], F: ['f'], G: ['g'], H: ['h'], I: ['i'], J: ['j'], K: ['k'], L: ['l'], M: ['m'], N: ['n'], O: ['o'], P: ['p'],
  Q: ['k', 'w'], R: ['r'], S: ['s'], T: ['t'], U: ['u'], V: ['w'], W: ['w'], X: ['k', 's'], Y: ['j'], Z: ['z'],
};

// ─── Ogham ────────────────────────────────────────────────────────────────

type Feda = { char: string; name: string; group: 'b' | 'h' | 'm' | 'a' | 'f'; n: number };
const OGHAM: Record<string, Feda> = {
  B: { char: 'ᚁ', name: 'Beith', group: 'b', n: 1 },
  L: { char: 'ᚂ', name: 'Luis', group: 'b', n: 2 },
  F: { char: 'ᚃ', name: 'Fearn', group: 'b', n: 3 },
  S: { char: 'ᚄ', name: 'Sail', group: 'b', n: 4 },
  N: { char: 'ᚅ', name: 'Nion', group: 'b', n: 5 },
  H: { char: 'ᚆ', name: 'Uath', group: 'h', n: 1 },
  D: { char: 'ᚇ', name: 'Dair', group: 'h', n: 2 },
  T: { char: 'ᚈ', name: 'Tinne', group: 'h', n: 3 },
  C: { char: 'ᚉ', name: 'Coll', group: 'h', n: 4 },
  Q: { char: 'ᚊ', name: 'Ceirt', group: 'h', n: 5 },
  M: { char: 'ᚋ', name: 'Muin', group: 'm', n: 1 },
  G: { char: 'ᚌ', name: 'Gort', group: 'm', n: 2 },
  NG: { char: 'ᚍ', name: 'nGéadal', group: 'm', n: 3 },
  Z: { char: 'ᚎ', name: 'Straif', group: 'm', n: 4 },
  R: { char: 'ᚏ', name: 'Ruis', group: 'm', n: 5 },
  A: { char: 'ᚐ', name: 'Ailm', group: 'a', n: 1 },
  O: { char: 'ᚑ', name: 'Onn', group: 'a', n: 2 },
  U: { char: 'ᚒ', name: 'Úr', group: 'a', n: 3 },
  E: { char: 'ᚓ', name: 'Eadhadh', group: 'a', n: 4 },
  I: { char: 'ᚔ', name: 'Iodhadh', group: 'a', n: 5 },
  P: { char: 'ᚚ', name: 'Peith', group: 'f', n: 1 },
  X: { char: 'ᚙ', name: 'Emancholl', group: 'f', n: 2 },
};
const OGHAM_ALIAS: Record<string, string> = { K: 'C', V: 'F', W: 'U', J: 'I', Y: 'I' };

/** One letter's strokes on a stem line at y = 5, starting at x = 0; returns the strokes and the width used. */
function fidStrokes(f: Feda): { lines: Glyph; width: number } {
  const step = 1.6;
  const width = f.n * step + 1;
  const xs = Array.from({ length: f.n }, (_, i) => 1 + i * step);
  switch (f.group) {
    case 'b':
      return { lines: xs.map((x) => P(x, 5, x, 9)), width };
    case 'h':
      return { lines: xs.map((x) => P(x, 1, x, 5)), width };
    case 'm':
      return { lines: xs.map((x) => P(x - 1, 9, x + 1, 1)), width: width + 1 };
    case 'a':
      return { lines: xs.map((x) => P(x, 3.6, x, 6.4)), width };
    case 'f':
      // Peith: a cross of two short strokes; Emancholl: two crosses joined.
      return f.n === 1 ? { lines: [P(1, 3, 4, 7), P(4, 3, 1, 7)], width: 5 } : { lines: [P(1, 2, 7, 8), P(7, 2, 1, 8), P(1, 8, 7, 2), P(1, 2, 1, 8), P(7, 2, 7, 8)], width: 8 };
  }
}

// ─── Reading a word ───────────────────────────────────────────────────────

export type Letter = {
  /** What it stands for, in Latin letters ("TH", "A"). */
  latin: string;
  /** Its name in the script (a rune's or a Hebrew letter's), when it has one. */
  name: string;
  /** Its Unicode letter, for the runes and ogham. */
  char: string;
  glyph: Glyph;
  /** Ogham letters carry their own width; the rest are 10 wide. */
  width?: number;
};
export type Word = Letter[];
export type Written = { words: Word[]; dropped: string[]; text: string };

const plain = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/Æ/gi, 'AE')
    .replace(/Ø/gi, 'O')
    .replace(/ß/g, 'SS')
    .replace(/Þ/gi, 'TH')
    .toUpperCase();

export const TEXT_MAX = 60;

/** A text written in a script: its words as letters, and anything it had to leave out. */
export function writeIn(script: ScriptId, input: string): Written {
  const text = plain(String(input || '').slice(0, TEXT_MAX));
  const dropped: string[] = [];
  const words: Word[] = [];
  for (const raw of text.split(/\s+/).filter(Boolean)) {
    const word: Word = [];
    let i = 0;
    while (i < raw.length) {
      const two = raw.slice(i, i + 2);
      const one = raw[i];
      if (!/[A-Z]/.test(one)) {
        if (!dropped.includes(one)) dropped.push(one);
        i += 1;
        continue;
      }
      if (script === 'theban') {
        const key = one === 'J' ? 'I' : one === 'U' ? 'V' : one;
        if (one === 'W') word.push({ latin: 'W', name: 'V', char: '', glyph: THEBAN.V }, { latin: '', name: 'V', char: '', glyph: THEBAN.V });
        else word.push({ latin: one, name: key, char: '', glyph: THEBAN[key] });
        i += 1;
      } else if (script === 'futhark') {
        const pair = two === 'TH' ? 'th' : two === 'NG' ? 'ng' : null;
        const keys = pair ? [pair] : FUTHARK_ONE[one];
        keys.forEach((k, j) => word.push({ latin: j === 0 ? (pair ? two : one) : '', name: RUNES[k].name, char: RUNES[k].char, glyph: RUNES[k].glyph }));
        i += pair ? 2 : 1;
      } else if (script === 'ogham') {
        const key = two === 'NG' ? 'NG' : (OGHAM_ALIAS[one] ?? one);
        const f = OGHAM[key];
        const { lines, width } = fidStrokes(f);
        word.push({ latin: key === 'NG' ? 'NG' : one, name: f.name, char: f.char, glyph: lines, width });
        i += key === 'NG' ? 2 : 1;
      } else {
        const table = script === 'river' ? RIVER : script === 'malachim' ? MALACHIM : CELESTIAL;
        const pair = HEBREW_DIGRAPHS.find(([d]) => d === two);
        const keys = pair ? pair[1] : HEBREW_ONE[one];
        keys.forEach((k, j) => word.push({ latin: j === 0 ? (pair ? two : one) : '', name: HEBREW_NAMES[k], char: '', glyph: table[k] }));
        i += pair ? 2 : 1;
      }
    }
    if (word.length) words.push(word);
  }
  return { words, dropped, text: text.replace(/\s+/g, ' ').trim() };
}

/** The runes or ogham as Unicode text to copy; null for the scripts that have none. */
export function unicodeText(script: ScriptId, written: Written): string | null {
  if (script === 'futhark') return written.words.map((w) => w.map((l) => l.char).join('')).join(' ');
  if (script === 'ogham') return written.words.length ? `᚛${written.words.map((w) => w.map((l) => l.char).join('')).join(' ')}᚜` : '';
  return null;
}

/** The letter-by-letter key, for copying or reading aloud: "B Beth · R Res · …". */
export function spelling(written: Written): string {
  return written.words.map((w) => w.map((l) => (l.latin ? `${l.latin} ${l.name}` : `+ ${l.name}`)).join(' · ')).join(' / ');
}

export type Layout = 'rows' | 'column';

const shift = (lines: Glyph, dx: number, dy: number): Glyph => lines.map((line) => line.map(([x, y]) => [x + dx, y + dy] as Point));

/**
 * The whole text as strokes: in rows of words (wrapping at about `perRow`
 * letters), or one letter under another down a candle. Ogham runs each word
 * along its own stem line, between feather marks.
 */
export function strokesOf(script: ScriptId, written: Written, layout: Layout = 'rows', perRow = 8): Glyph {
  const out: Glyph = [];
  if (!written.words.length) return out;
  if (script === 'ogham') {
    // Each word on its own stem, words one under another (rows) or end to end down a candle (column: turned upright).
    let y = 0;
    let x = 0;
    const lines: Glyph = [];
    const words = written.words;
    words.forEach((word, wi) => {
      const start = x;
      if (wi === 0 || layout === 'rows') lines.push(...shift([P(2, 2, 0, 5, 2, 8)], x, y));
      x += 2.5;
      for (const l of word) {
        lines.push(...shift(l.glyph, x, y));
        x += (l.width ?? 10) + 0.6;
      }
      const end = wi === words.length - 1 || layout === 'rows';
      if (end) lines.push(...shift([P(x, 2, x + 2, 5, x, 8)], 0, y));
      lines.push(P(start + 2, 5 + y, (end ? x : x + 2) + (end ? 0 : 0), 5 + y));
      if (layout === 'rows') {
        y += 12;
        x = 0;
      } else x += 2;
    });
    // Down a candle, ogham reads bottom to top, as on the stones.
    return layout === 'column' ? lines.map((line) => line.map(([px, py]) => [py, -px] as Point)) : lines;
  }
  if (layout === 'column') {
    let y = 0;
    written.words.forEach((word, wi) => {
      if (wi) y += 4;
      for (const l of word) {
        out.push(...shift(l.glyph, 0, y));
        y += 12;
      }
    });
    if (script === 'theban') out.push(...shift(THEBAN['.'], 0, y));
    return out;
  }
  let x = 0;
  let y = 0;
  let count = 0;
  written.words.forEach((word, wi) => {
    if (wi && count + word.length > perRow) {
      x = 0;
      y += 13;
      count = 0;
    } else if (wi) x += 5;
    for (const l of word) {
      out.push(...shift(l.glyph, x, y));
      x += 11;
      count += 1;
    }
  });
  if (script === 'theban') out.push(...shift(THEBAN['.'], x + 2, y));
  return out;
}

/** The text as one mark in the sigil's 100 × 100 box, for carving or keeping with your sigils. */
export function scriptPath(script: ScriptId, written: Written, layout: Layout = 'rows'): string {
  const lines = strokesOf(script, written, layout);
  return lines.length ? toPath(fitToBox(lines, { min: 8, max: 92 })) : '';
}

/** What it's called when kept: "Theban: Brigid". */
export const keptName = (script: ScriptId, written: Written) => `${scriptOf(script).name}: ${written.text}`.slice(0, 40);
