// The planetary seals beside the squares. Agrippa (Three Books of Occult
// Philosophy, 1533, II.22) gives each planet's square with its numbers (the
// sum of any line, and of the whole square), a seal, and the names and
// sigils of the planet's Intelligence and Spirit, a good and a blind power.
// The names are made to add up, letter by Hebrew letter, to the square's
// own numbers: Agiel and Zazel each to 45, Saturn's total. That is how their
// sigils can be traced on the square, as here.
//
// The seals themselves are intricate figures whose construction Agrippa does
// not explain, and they are not redrawn here: a guess would mislead. Pure.

import { KAMEAS, traceValues, type KameaTrace, type PlanetId } from './kamea.ts';

export type Letter = { name: string; value: number };
export type SealName = { name: string; hebrew: string; letters: Letter[]; role: 'Intelligence' | 'Spirit' };
export type PlanetSeal = { planet: PlanetId; line: number; total: number; names: SealName[]; note: string };

const L = (spec: string): Letter[] =>
  spec.split(' ').map((pair) => {
    const [name, value] = pair.split(':');
    return { name, value: Number(value) };
  });

export const SEALS: PlanetSeal[] = [
  {
    planet: 'saturn',
    line: 15,
    total: 45,
    names: [
      { role: 'Intelligence', name: 'Agiel', hebrew: 'אגיאל', letters: L('Aleph:1 Gimel:3 Yod:10 Aleph:1 Lamed:30') },
      { role: 'Spirit', name: 'Zazel', hebrew: 'זאזל', letters: L('Zayin:7 Aleph:1 Zayin:7 Lamed:30') },
    ],
    note: 'The smallest square, nine cells, the old Lo Shu of China long before it reached Europe through Arabic writers.',
  },
  {
    planet: 'jupiter',
    line: 34,
    total: 136,
    names: [
      { role: 'Intelligence', name: 'Iophiel', hebrew: 'יהפיאל', letters: L('Yod:10 He:5 Pe:80 Yod:10 Aleph:1 Lamed:30') },
      { role: 'Spirit', name: 'Hismael', hebrew: 'הסמאל', letters: L('He:5 Samekh:60 Mem:40 Aleph:1 Lamed:30') },
    ],
    note: 'Dürer engraved a four-by-four square, Jupiter’s size though arranged differently, in Melencolia I (1514); it is often read as Jupiter’s remedy for Saturn’s melancholy.',
  },
  {
    planet: 'mars',
    line: 65,
    total: 325,
    names: [
      { role: 'Intelligence', name: 'Graphiel', hebrew: 'גראפיאל', letters: L('Gimel:3 Resh:200 Aleph:1 Pe:80 Yod:10 Aleph:1 Lamed:30') },
      { role: 'Spirit', name: 'Barzabel', hebrew: 'ברצבאל', letters: L('Bet:2 Resh:200 Tsade:90 Bet:2 Aleph:1 Lamed:30') },
    ],
    note: '',
  },
  {
    planet: 'sun',
    line: 111,
    total: 666,
    names: [
      { role: 'Intelligence', name: 'Nakhiel', hebrew: 'נכיאל', letters: L('Nun:50 Kaf:20 Yod:10 Aleph:1 Lamed:30') },
      { role: 'Spirit', name: 'Sorath', hebrew: 'סורת', letters: L('Samekh:60 Vav:6 Resh:200 Tav:400') },
    ],
    note: 'The Sun’s square adds to 666, and so does Sorath, its Spirit.',
  },
  {
    planet: 'venus',
    line: 175,
    total: 1225,
    names: [
      { role: 'Intelligence', name: 'Hagiel', hebrew: 'הגיאל', letters: L('He:5 Gimel:3 Yod:10 Aleph:1 Lamed:30') },
      { role: 'Spirit', name: 'Kedemel', hebrew: 'קדמאל', letters: L('Qof:100 Dalet:4 Mem:40 Aleph:1 Lamed:30') },
    ],
    note: 'Hagiel adds to 49, the number of the square’s cells; Kedemel to 175, its line.',
  },
  {
    planet: 'mercury',
    line: 260,
    total: 2080,
    names: [
      { role: 'Intelligence', name: 'Tiriel', hebrew: 'טיריאל', letters: L('Tet:9 Yod:10 Resh:200 Yod:10 Aleph:1 Lamed:30') },
      { role: 'Spirit', name: 'Taphthartharath', hebrew: 'תפתרתרת', letters: L('Tav:400 Pe:80 Tav:400 Resh:200 Tav:400 Resh:200 Tav:400') },
    ],
    note: '',
  },
  {
    planet: 'moon',
    line: 369,
    total: 3321,
    names: [{ role: 'Spirit', name: 'Chasmodai', hebrew: 'חשמודאי', letters: L('Het:8 Shin:300 Mem:40 Vav:6 Dalet:4 Aleph:1 Yod:10') }],
    note: 'Agrippa gives the Moon a Spirit of spirits and an Intelligence of intelligences with long names that add to 3,321, the square’s total; only Chasmodai, who adds to its line, is traced here.',
  },
];

export const sealOf = (planet: PlanetId) => SEALS.find((s) => s.planet === planet) ?? null;

export const nameSum = (n: SealName) => n.letters.reduce((s, l) => s + l.value, 0);

/** A name's sigil traced on its planet's square; values too big for the square have their digits added (as the old aiq bekar reduction does: 30 → 3). */
export const traceName = (planet: PlanetId, n: SealName): KameaTrace | null => traceValues(n.letters.map((l) => l.value), planet);

/** The square's numbers worked out, to check the printed ones. */
export function squareSums(planet: PlanetId): { line: number; total: number } {
  const sq = KAMEAS[planet];
  return { line: sq[0].reduce((a, b) => a + b, 0), total: sq.flat().reduce((a, b) => a + b, 0) };
}

export const SEALS_NOTE =
  'Traced here from each name’s Hebrew letters. Agrippa’s printed sigils were cut by hand for the 1533 edition and later copied with errors, so they don’t always match a trace line for line; scholars still argue over how some were drawn.';
