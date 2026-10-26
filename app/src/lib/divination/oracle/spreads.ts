// The spreads for Lenormand and Kipper, and for decks of your own, with the
// layouts that aren't simple lines: the 3×3 box, Lenormand's Grand Tableau
// (eight by four with four beneath, each place a house) and Kipper's (nine
// by four). draw.ts adds these to its own spreads and layout.ts to its
// layouts. A deck of your own can be drawn into any tarot spread or spread
// of your own as well. Pure.

import type { Position, Spread } from '../draw.ts';
import type { Slot } from '../layout.ts';
import { KIPPER } from './kipper.ts';
import { HOUSES } from './lenormand.ts';

const BOX: Position[] = [
  { name: 'Above, behind', about: 'What has passed that still hangs over it, or what you have been thinking.' },
  { name: 'Above', about: 'What is on your mind about it now.' },
  { name: 'Above, ahead', about: 'What you hope or fear is coming.' },
  { name: 'Behind', about: 'What led here.' },
  { name: 'The heart of it', about: 'The centre of the box: the matter itself. Read every other card with this one.' },
  { name: 'Ahead', about: 'Where it goes next.' },
  { name: 'Below, behind', about: 'What lies under it from the past, settled or buried.' },
  { name: 'Below', about: 'What is under your feet now: the facts, or what you cannot change.' },
  { name: 'Below, ahead', about: 'What will be settled, or what you can build on.' },
];

const KIPPER_HOUSES: Position[] = KIPPER.map((c) => ({
  name: `House ${c.number}: ${c.name}`,
  about: `In the house method, a card here is read with ${c.name} (${c.meaning.keywords}). Read it, too, by how near it lies to the main person.`,
}));

export const ORACLE_SPREADS: Spread[] = [
  {
    id: 'lenormand-one',
    kind: 'lenormand',
    group: 'quick',
    label: 'One Lenormand card',
    detail: 'A single card for a quick answer, or for the day.',
    positions: [{ name: 'The card', about: 'The answer, plainly.' }],
    lookBackDays: 7,
  },
  {
    id: 'lenormand-pair',
    kind: 'lenormand',
    group: 'quick',
    label: 'A pair',
    detail: 'Two cards read together: the first says what, the second says what kind.',
    positions: [
      { name: 'The subject', about: 'What the matter is.' },
      { name: 'The modifier', about: 'What kind it is: how the second card colours the first.' },
    ],
    lookBackDays: 7,
  },
  {
    id: 'lenormand-three',
    kind: 'lenormand',
    group: 'quick',
    label: 'Line of three',
    detail: 'Three cards read as a sentence, the middle one the heart of it.',
    positions: [
      { name: 'Leading in', about: 'What comes before, or what starts it.' },
      { name: 'The heart of it', about: 'The centre of the line: what it is all about.' },
      { name: 'Leading on', about: 'Where it goes, or how it ends.' },
    ],
    lookBackDays: 14,
  },
  {
    id: 'lenormand-five',
    kind: 'lenormand',
    group: 'classic',
    label: 'Line of five',
    detail: 'Five cards in a row: the past on the left, the heart of it in the middle, what comes on the right.',
    positions: [
      { name: 'The further past', about: 'What started it.' },
      { name: 'The recent past', about: 'What has just happened.' },
      { name: 'The heart of it', about: 'The centre: the matter as it is now.' },
      { name: 'What comes next', about: 'The near future.' },
      { name: 'Further on', about: 'Where it leads.' },
    ],
    lookBackDays: 30,
  },
  {
    id: 'lenormand-box',
    kind: 'lenormand',
    group: 'classic',
    label: 'The 3×3 box',
    detail: 'Nine cards in a square: the heart of it in the middle, past to the left, future to the right, thoughts above and facts below.',
    positions: BOX,
    lookBackDays: 30,
  },
  {
    id: 'lenormand-grand-tableau',
    kind: 'lenormand',
    group: 'deep',
    label: 'Grand Tableau',
    detail: 'All thirty-six cards, in four rows of eight and four beneath. Each place is a house, named for the card of its number: find the Man or Woman, read what is near them, and read each card in its house.',
    positions: HOUSES,
    lookBackDays: 90,
  },
  {
    id: 'kipper-three',
    kind: 'kipper',
    group: 'quick',
    label: 'Three Kipper cards',
    detail: 'Three cards for a quick look: what has been, what is, what is coming.',
    positions: [
      { name: 'What has been', about: 'The past that bears on it.' },
      { name: 'What is', about: 'Where things stand.' },
      { name: 'What is coming', about: 'Where it leads.' },
    ],
    lookBackDays: 14,
  },
  {
    id: 'kipper-nine',
    kind: 'kipper',
    group: 'classic',
    label: 'Nine cards',
    detail: 'Nine cards in a square, the heart of the matter in the middle: the past to the left, the future to the right, thoughts above and facts below.',
    positions: BOX,
    lookBackDays: 30,
  },
  {
    id: 'kipper-grand-tableau',
    kind: 'kipper',
    group: 'deep',
    label: 'Kipper Grand Tableau',
    detail: 'All thirty-six cards in four rows of nine. Find the main person: what lies close to them acts on them now, what lies far off later or less, behind them is the past and before them the future.',
    positions: KIPPER_HOUSES,
    lookBackDays: 90,
  },
  {
    id: 'oracle-one',
    kind: 'oracle',
    group: 'quick',
    label: 'One card',
    detail: 'A single card from your deck, for a question or the day.',
    positions: [{ name: 'The card', about: 'What it says to you.' }],
    lookBackDays: 7,
  },
  {
    id: 'oracle-three',
    kind: 'oracle',
    group: 'quick',
    label: 'Three cards',
    detail: 'Three cards from your deck: where it comes from, where it is, where it goes.',
    positions: [
      { name: 'Where it comes from', about: 'What led here.' },
      { name: 'Where it is', about: 'Where things stand.' },
      { name: 'Where it goes', about: 'What may come.' },
    ],
    lookBackDays: 30,
  },
];

// ─── Layouts (in item widths, as layout.ts measures) ────────────────────

/** A grid of `cols` across, `gap` between, filled row by row; `tail` more centred in a row below. */
function rows(item: { w: number; h: number }, gap: number, cols: number, n: number, tail = 0): Slot[] {
  const sx = item.w + gap;
  const sy = item.h + gap;
  const slots: Slot[] = [];
  for (let i = 0; i < n; i++) slots.push({ x: (i % cols) * sx, y: Math.floor(i / cols) * sy });
  const start = ((cols - tail) / 2) * sx;
  for (let k = 0; k < tail; k++) slots.push({ x: start + k * sx, y: Math.ceil(n / cols) * sy });
  return slots;
}

/** The layouts these spreads take, by spread id; each a function of the card's size. */
export const ORACLE_LAYOUTS: Record<string, (item: { w: number; h: number }, gap: number) => { slots: Slot[] }> = {
  'lenormand-box': (item, gap) => ({ slots: rows(item, gap, 3, 9) }),
  'kipper-nine': (item, gap) => ({ slots: rows(item, gap, 3, 9) }),
  'lenormand-grand-tableau': (item, gap) => ({ slots: rows(item, gap, 8, 32, 4) }),
  'kipper-grand-tableau': (item, gap) => ({ slots: rows(item, gap, 9, 36) }),
};

/** A spread drawn from a deck of your own: the same places, laid out the same way, with your cards. */
export const asOwnDeck = (spread: Spread): Spread => (spread.kind === 'oracle' ? spread : { ...spread, kind: 'oracle' });

/** The kinds whose spreads a deck of your own can be drawn into. */
export const OWN_DECK_TAKES = ['oracle', 'tarot'] as const;
