// Drawing cards, runes and ogham staves: the spreads, a fair shuffle, and
// the reading a draw becomes in the Hedge reading log (`hedge.readings`, the
// same shape as a reading logged by hand). Pure; the randomness comes in.

import { LOOK_BACK_CHOICES, lookBackFrom, moonForReading, type Reading } from '../craft/hedge/readings.ts';
import { localDateKey } from '../rituals/lifecycle.ts';
import { DAILY_LABEL } from './daily.ts';
import { BLANK_RUNE, FEDA, RUNES, type Stave } from './staves.ts';
import { TAROT_DECK, type Meaning, type TarotCard } from './tarot.ts';

export type DrawKind = 'tarot' | 'runes' | 'ogham';

export type Position = { name: string; about: string };

export type Spread = {
  id: string;
  kind: DrawKind;
  label: string;
  /** One line on what it's for. */
  detail: string;
  positions: Position[];
  /** Days until the reading comes back to you. */
  lookBackDays: number;
};

export const SPREADS: Spread[] = [
  { id: 'daily', kind: 'tarot', label: DAILY_LABEL, detail: 'One card to carry through the day.', positions: [{ name: 'Today', about: 'What the day holds, or asks of you.' }], lookBackDays: 1 },
  {
    id: 'past-present-future',
    kind: 'tarot',
    label: 'Past, present, future',
    detail: 'Three cards: where this came from, where it stands, where it’s heading.',
    positions: [
      { name: 'Past', about: 'What led here.' },
      { name: 'Present', about: 'Where things stand now.' },
      { name: 'Future', about: 'Where they’re heading if nothing changes.' },
    ],
    lookBackDays: 30,
  },
  {
    id: 'situation-action-outcome',
    kind: 'tarot',
    label: 'Situation, action, outcome',
    detail: 'Three cards for a decision: what you face, what to do, what may come of it.',
    positions: [
      { name: 'Situation', about: 'What you are facing.' },
      { name: 'Action', about: 'What would help.' },
      { name: 'Outcome', about: 'What may come of it.' },
    ],
    lookBackDays: 30,
  },
  {
    id: 'celtic-cross',
    kind: 'tarot',
    label: 'Celtic Cross',
    detail: 'Ten cards, as Waite laid them out, for a question that deserves the time.',
    positions: [
      { name: 'The heart of it', about: 'The matter as it stands, and the air around it.' },
      { name: 'What crosses it', about: 'What helps or hinders; the card laid across.' },
      { name: 'What crowns it', about: 'The best that can come of it, or what you’re aiming for.' },
      { name: 'Beneath it', about: 'The root: what lies under the matter, already part of you.' },
      { name: 'Behind', about: 'What is passing or has just passed.' },
      { name: 'Before', about: 'What is coming soon.' },
      { name: 'Yourself', about: 'Where you stand, and how you meet it.' },
      { name: 'Your surroundings', about: 'Home, people and the influences around you.' },
      { name: 'Hopes and fears', about: 'What you hope for, or dread; often both at once.' },
      { name: 'What will come', about: 'Where it all leads.' },
    ],
    lookBackDays: 30,
  },
  { id: 'one-rune', kind: 'runes', label: 'One rune', detail: 'A single rune for a question or the day.', positions: [{ name: 'The rune', about: 'The answer, or the counsel.' }], lookBackDays: 7 },
  {
    id: 'three-runes',
    kind: 'runes',
    label: 'Three runes',
    detail: 'A cast for the three Norns: what has been, what is becoming, what shall be.',
    positions: [
      { name: 'What has been', about: 'Urd: the past that shapes this.' },
      { name: 'What is becoming', about: 'Verdandi: what is being woven now.' },
      { name: 'What shall be', about: 'Skuld: what is owed, or where it leads.' },
    ],
    lookBackDays: 30,
  },
  { id: 'one-stave', kind: 'ogham', label: 'One stave', detail: 'A single ogham stave for a question or the day.', positions: [{ name: 'The stave', about: 'The answer, or the counsel.' }], lookBackDays: 7 },
  {
    id: 'three-staves',
    kind: 'ogham',
    label: 'Three staves',
    detail: 'Three staves: what has been, what is, what may come.',
    positions: [
      { name: 'What has been', about: 'The roots of it.' },
      { name: 'What is', about: 'The trunk: where it stands now.' },
      { name: 'What may come', about: 'The branches: where it may grow.' },
    ],
    lookBackDays: 30,
  },
];

export const spreadsFor = (kind: DrawKind) => SPREADS.filter((s) => s.kind === kind);
export const spreadById = (id: string | null | undefined): Spread | null => SPREADS.find((s) => s.id === id) ?? null;

export const KINDS: { id: DrawKind; label: string; action: string }[] = [
  { id: 'tarot', label: 'Tarot', action: 'Shuffle and draw' },
  { id: 'runes', label: 'Runes', action: 'Cast the runes' },
  { id: 'ogham', label: 'Ogham', action: 'Draw the staves' },
];

/** The draw's choices, kept in settings so the app and the website agree. */
export type DrawOptions = { reversals: boolean; blankRune: boolean };
export const drawOptions = (settings: Record<string, unknown> | null | undefined): DrawOptions => ({
  reversals: settings?.divination_reversals === true,
  blankRune: settings?.divination_blank_rune === true,
});

// ─── Randomness ──────────────────────────────────────────────────────────

/** A number in [0, 1) from the platform's secure generator when it has one. */
export function secureRandom(): number {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } }).crypto;
  if (c?.getRandomValues) {
    const words = c.getRandomValues(new Uint32Array(2));
    // 53 random bits, as Math.random gives.
    return ((words[0] >>> 5) * 67108864 + (words[1] >>> 6)) / 9007199254740992;
  }
  return Math.random();
}

/** A fair Fisher–Yates shuffle into a new array. */
export function shuffle<T>(items: readonly T[], random: () => number = secureRandom): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ─── Drawing ─────────────────────────────────────────────────────────────

export type Drawn = { name: string; reversed: boolean };
export type Draw = { spread: string; items: Drawn[] };

/** The names that can come up for a kind. */
export function poolFor(kind: DrawKind, options: DrawOptions): string[] {
  if (kind === 'tarot') return TAROT_DECK.map((c) => c.name);
  if (kind === 'runes') return [...RUNES.map((r) => r.name), ...(options.blankRune ? [BLANK_RUNE.name] : [])];
  return FEDA.map((f) => f.name);
}

/** Shuffle the whole deck or bag and lay out as many as the spread needs. Reversals are tarot only. */
export function drawSpread(spread: Spread, options: DrawOptions, random: () => number = secureRandom): Draw {
  const pool = shuffle(poolFor(spread.kind, options), random);
  const items = pool.slice(0, spread.positions.length).map((name) => ({ name, reversed: spread.kind === 'tarot' && options.reversals && random() < 0.5 }));
  return { spread: spread.id, items };
}

export type DrawnMeaning = { name: string; glyph: string | null; card: TarotCard | null; reversed: boolean; meaning: Meaning; gloss: string | null };

export function meaningOf(item: Drawn): DrawnMeaning | null {
  const card = TAROT_DECK.find((c) => c.name === item.name);
  if (card) return { name: card.name, glyph: null, card, reversed: item.reversed, meaning: item.reversed ? card.reversed : card.upright, gloss: null };
  const stave: Stave | undefined = [...RUNES, ...FEDA, BLANK_RUNE].find((s) => s.name === item.name);
  if (!stave) return null;
  return { name: stave.name, glyph: stave.glyph, card: null, reversed: false, meaning: { keywords: stave.keywords, text: stave.text }, gloss: stave.gloss };
}

/** One line of "What came up": "Past: The Tower, reversed (upheaval delayed, …)". */
export function drawnLine(position: Position | null, item: Drawn, single: boolean): string {
  const m = meaningOf(item);
  const name = `${item.name}${item.reversed ? ', reversed' : ''}`;
  const words = m ? ` (${m.meaning.keywords})` : '';
  return single || !position ? `${name}${words}` : `${position.name}: ${name}${words}`;
}

/** "What came up" for a draw: the spread's name, then each card in its place. */
export function cameUpText(spread: Spread, draw: Draw): string {
  const single = spread.positions.length === 1;
  return [spread.label, ...draw.items.map((item, i) => drawnLine(spread.positions[i] ?? null, item, single))].join('\n');
}

/** The reading a draw becomes, in the reading log's own shape. */
export function readingFromDraw(
  spread: Spread,
  draw: Draw,
  { question = '', interpretation = '', lookBack, now }: { question?: string; interpretation?: string; lookBack?: string; now: Date },
): Reading {
  const date = localDateKey(now);
  return {
    date,
    method: spread.kind,
    question: question.trim(),
    drawn: draw.items.map((d) => d.name),
    cameUp: cameUpText(spread, draw),
    interpretation: interpretation.trim(),
    lookBack: lookBack ?? lookBackFrom(date, spread.lookBackDays),
    outcome: '',
    outcomeDate: '',
    moonPhase: moonForReading(date),
  };
}

/**
 * The draw a kept reading came from, read back from its "What came up", so
 * the reading's page can lay it out again. Null for readings logged by hand
 * or edited out of shape.
 */
export function drawOfReading(reading: Pick<Reading, 'method' | 'drawn' | 'cameUp'>): { spread: Spread; draw: Draw } | null {
  const lines = reading.cameUp.split('\n');
  const spread = SPREADS.find((s) => s.kind === reading.method && s.label === lines[0]);
  if (!spread || reading.drawn.length !== spread.positions.length) return null;
  const items = reading.drawn.map((name, i) => ({ name, reversed: spread.kind === 'tarot' && (lines[i + 1] ?? '').includes(`${name}, reversed`) }));
  const pool = poolFor(spread.kind, { reversals: true, blankRune: true });
  if (!items.every((item) => pool.includes(item.name))) return null;
  return { spread, draw: { spread: spread.id, items } };
}

/** Come-back choices for a draw: tomorrow too, for a card of the day. */
export const DRAW_LOOK_BACK: { days: number; label: string }[] = [{ days: 1, label: 'Tomorrow' }, ...LOOK_BACK_CHOICES];
