// Drawing cards, runes and ogham staves: the spreads, a fair shuffle, and
// the reading a draw becomes in the Hedge reading log (`hedge.readings`, the
// same shape as a reading logged by hand). Pure; the randomness comes in.

import { LOOK_BACK_CHOICES, lookBackFrom, moonForReading, type Reading } from '../craft/hedge/readings.ts';
import { localDateKey } from '../rituals/lifecycle.ts';
import { DAILY_LABEL } from './daily.ts';
import { layoutOf, RINGS, type Fall, type Laid, type Ring, type Shape } from './layout.ts';
import { ownCard, ownMeaning, type OwnCard, type OwnDeckData, type OwnDeckEntry } from './oracle/decks.ts';
import { KIPPER, type KipperCard } from './oracle/kipper.ts';
import { LENORMAND, type LenormandCard } from './oracle/lenormand.ts';
import { asOwnDeck, ORACLE_SPREADS } from './oracle/spreads.ts';
import { BLANK_RUNE, FEDA, RUNES, type Stave } from './staves.ts';
import { TAROT_DECK, type Meaning, type TarotCard } from './tarot.ts';

/** What is drawn: tarot, runes, ogham, the Lenormand and Kipper decks, or a deck of your own ('oracle'). */
export type DrawKind = 'tarot' | 'runes' | 'ogham' | 'lenormand' | 'kipper' | 'oracle';

export type Position = { name: string; about: string };

/** How the spreads are grouped for choosing one. */
export type SpreadGroup = 'quick' | 'classic' | 'moon' | 'deep' | 'yours';
export const GROUPS: { id: SpreadGroup; label: string }[] = [
  { id: 'quick', label: 'Quick' },
  { id: 'classic', label: 'Classic' },
  { id: 'moon', label: 'Moon & seasons' },
  { id: 'deep', label: 'Deep work' },
  { id: 'yours', label: 'Your spreads' },
];

export type Spread = {
  id: string;
  kind: DrawKind;
  label: string;
  /** One line on what it's for. */
  detail: string;
  positions: Position[];
  /** Days until the reading comes back to you. */
  lookBackDays: number;
  group: SpreadGroup;
  /** For a spread of your own: the shape it's laid out in. */
  shape?: Shape;
  /** Cast, not laid: each rune falls somewhere on the cloth, face up or down (the nine-rune cast). */
  cast?: boolean;
  /** The same spread with one place more, offered as a choice on it rather than in the list. */
  variant?: { id: string; label: string };
  /** Shown only as another spread's variant. */
  hidden?: boolean;
};

const MONTHS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth'];
const HOUSES: Position[] = [
  { name: 'First house: self', about: 'You, how you meet the world, how you begin things.' },
  { name: 'Second house: what you have', about: 'Money, belongings, and what you value.' },
  { name: 'Third house: words and nearby', about: 'Talk, learning, siblings, neighbours and short journeys.' },
  { name: 'Fourth house: home and roots', about: 'Home, family and where you come from.' },
  { name: 'Fifth house: joy', about: 'Pleasure, play, love affairs, children and making things.' },
  { name: 'Sixth house: work and health', about: 'Daily work, habits and the body’s care.' },
  { name: 'Seventh house: partners', about: 'Partners, close bonds, and open rivals.' },
  { name: 'Eighth house: what’s shared and what ends', about: 'Shared things, debts, endings and deep change.' },
  { name: 'Ninth house: the wider world', about: 'Belief, study, long journeys and what gives life meaning.' },
  { name: 'Tenth house: calling', about: 'Work in the world, standing and what you’re known for.' },
  { name: 'Eleventh house: friends and hopes', about: 'Friends, groups and the hopes you hold for later.' },
  { name: 'Twelfth house: what’s hidden', about: 'Rest, retreat, secrets, and what works out of sight.' },
];

export const SPREADS: Spread[] = [
  { id: 'daily', kind: 'tarot', group: 'quick', label: DAILY_LABEL, detail: 'One card to carry through the day.', positions: [{ name: 'Today', about: 'What the day holds, or asks of you.' }], lookBackDays: 1 },
  {
    id: 'past-present-future',
    group: 'quick',
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
    group: 'quick',
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
    group: 'classic',
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
  {
    id: 'mind-body-spirit',
    group: 'quick',
    kind: 'tarot',
    label: 'Mind, body, spirit',
    detail: 'Three cards for checking in with yourself: your thoughts, your body, your spirit.',
    positions: [
      { name: 'Mind', about: 'What your thoughts are doing, and what they need.' },
      { name: 'Body', about: 'What your body is carrying, and asking for.' },
      { name: 'Spirit', about: 'Where your spirit is, and what would feed it.' },
    ],
    lookBackDays: 7,
  },
  {
    id: 'you-them',
    group: 'quick',
    kind: 'tarot',
    label: 'You, them, the relationship',
    detail: 'Three cards for two people: each of you, and what lives between you.',
    positions: [
      { name: 'You', about: 'What you bring to this, and how you stand in it.' },
      { name: 'Them', about: 'What they bring, as far as the cards can say.' },
      { name: 'The relationship', about: 'What lives between you: its nature, and what it needs.' },
    ],
    lookBackDays: 30,
  },
  {
    id: 'five-card-cross',
    group: 'classic',
    kind: 'tarot',
    label: 'Five-card cross',
    detail: 'Five cards in a cross: the present at the heart, with what led here, what comes, what lies beneath and what can help.',
    positions: [
      { name: 'The present', about: 'The heart of the matter as it stands.' },
      { name: 'The past', about: 'What led here.' },
      { name: 'The future', about: 'Where it’s heading.' },
      { name: 'Beneath it', about: 'The root, or the challenge underneath.' },
      { name: 'Above it', about: 'What can help, or the best way through.' },
    ],
    lookBackDays: 30,
  },
  {
    id: 'horseshoe',
    group: 'classic',
    kind: 'tarot',
    label: 'Horseshoe',
    detail: 'Seven cards in an arc, for a question with many sides: from the past, round through what’s hidden, to the likely outcome.',
    positions: [
      { name: 'The past', about: 'What has shaped this.' },
      { name: 'The present', about: 'Where things stand now.' },
      { name: 'Hidden influences', about: 'What is at work that you may not see.' },
      { name: 'Obstacles', about: 'What stands in the way.' },
      { name: 'Those around you', about: 'Other people, and how they bear on it.' },
      { name: 'What you can do', about: 'The best course open to you.' },
      { name: 'The likely outcome', about: 'Where it leads if things go on as they are.' },
    ],
    lookBackDays: 30,
  },
  {
    id: 'two-paths',
    group: 'classic',
    kind: 'tarot',
    label: 'Two paths',
    detail: 'Seven cards for a decision: where you stand, then three up each road, so you can walk both before you choose.',
    positions: [
      { name: 'Where you stand', about: 'The choice itself, and what you bring to it.' },
      { name: 'First path: what it asks', about: 'What taking the first road would ask of you.' },
      { name: 'First path: what it gives', about: 'What the first road would give you.' },
      { name: 'First path: where it leads', about: 'Where the first road may lead.' },
      { name: 'Second path: what it asks', about: 'What taking the second road would ask of you.' },
      { name: 'Second path: what it gives', about: 'What the second road would give you.' },
      { name: 'Second path: where it leads', about: 'Where the second road may lead.' },
    ],
    lookBackDays: 90,
  },
  {
    id: 'new-moon',
    group: 'moon',
    kind: 'tarot',
    label: 'New moon intentions',
    detail: 'Five cards at the dark of the moon, for what you want to begin and how to tend it as the moon grows.',
    positions: [
      { name: 'Clearing the ground', about: 'What to clear away first, to make room.' },
      { name: 'What to plant', about: 'The intention this moon is good for.' },
      { name: 'What will help it grow', about: 'What will feed it, inside and out.' },
      { name: 'What may get in the way', about: 'What to watch for as it grows.' },
      { name: 'The first step', about: 'Something small to do this week.' },
    ],
    lookBackDays: 14,
  },
  {
    id: 'full-moon',
    group: 'moon',
    kind: 'tarot',
    label: 'Full moon release',
    detail: 'Five cards under the full moon: what has come to fullness, and what you are ready to let go of.',
    positions: [
      { name: 'What has come to fullness', about: 'What has grown or been revealed this month.' },
      { name: 'What to release', about: 'What you are ready to let go of.' },
      { name: 'What holds on', about: 'Why it’s hard to let it go.' },
      { name: 'What release makes room for', about: 'What can come in once it’s gone.' },
      { name: 'Your light', about: 'What the full moon shows you about yourself.' },
    ],
    lookBackDays: 14,
  },
  {
    id: 'samhain',
    group: 'moon',
    kind: 'tarot',
    label: 'Samhain: the ancestors’ spread',
    detail: 'Five cards for Samhain, when the year turns to the dark: the year’s harvest, what to let die back, and a word from those who came before.',
    positions: [
      { name: 'The year’s harvest', about: 'What this year has given you.' },
      { name: 'What to let die back', about: 'What to let go into the dark, to rest or to end.' },
      { name: 'A word from the ancestors', about: 'What those who came before would have you hear.' },
      { name: 'What the dark half asks', about: 'What the winter months ask of you.' },
      { name: 'What to carry into the new year', about: 'What to keep, and take with you.' },
    ],
    lookBackDays: 90,
  },
  {
    id: 'year-ahead',
    group: 'moon',
    kind: 'tarot',
    label: 'The year ahead',
    detail: 'Thirteen cards: one for each month, starting with the coming one, and one in the middle for the year as a whole. Good at a birthday, Samhain or New Year.',
    positions: [
      ...MONTHS.map((m, i) => ({ name: `${m} month`, about: i === 0 ? 'The month starting now.' : `The month starting ${i} month${i === 1 ? '' : 's'} from now.` })),
      { name: 'The year’s theme', about: 'What the whole year is about.' },
    ],
    lookBackDays: 365,
  },
  {
    id: 'elemental',
    group: 'deep',
    kind: 'tarot',
    label: 'Elemental',
    detail: 'Five cards: earth, air, fire and water at the four quarters, and spirit at the heart, for a look at your whole life in balance.',
    positions: [
      { name: 'Earth', about: 'Body, home, money and the ground under you.' },
      { name: 'Air', about: 'Thought, words and what you know.' },
      { name: 'Fire', about: 'Will, drive and what you want.' },
      { name: 'Water', about: 'Feeling, love and dreams.' },
      { name: 'Spirit', about: 'What holds the four together.' },
    ],
    lookBackDays: 30,
  },
  {
    id: 'shadow-work',
    group: 'deep',
    kind: 'tarot',
    label: 'Shadow work',
    detail: 'Five cards for meeting a part of yourself you’d rather not: down into it and back up. Go gently, and stop when you need to.',
    positions: [
      { name: 'What I keep hidden', about: 'A part of you that you push out of sight.' },
      { name: 'Why I hide it', about: 'What you learned, or feared, that made you hide it.' },
      { name: 'What it protects', about: 'What it has been doing for you all along.' },
      { name: 'What hiding it costs', about: 'What keeping it down takes from you.' },
      { name: 'How to welcome it back', about: 'A kind way to let it be part of you.' },
    ],
    lookBackDays: 30,
  },
  {
    id: 'tree-of-life',
    group: 'deep',
    kind: 'tarot',
    label: 'Tree of Life',
    detail: 'Ten cards on the sephiroth of the Kabbalistic tree, as the Golden Dawn read it, from the Crown down to the Kingdom: a long look at one life or question.',
    positions: [
      { name: 'Kether, the Crown', about: 'The highest aim; what this is for.' },
      { name: 'Chokmah, Wisdom', about: 'The spark: the force that drives it.' },
      { name: 'Binah, Understanding', about: 'What gives it form, and its limits.' },
      { name: 'Chesed, Mercy', about: 'What is given freely; what helps.' },
      { name: 'Geburah, Severity', about: 'What must be cut away; the hard lesson.' },
      { name: 'Tiphareth, Beauty', about: 'The heart of it, and of you.' },
      { name: 'Netzach, Victory', about: 'Feeling, desire and what you love.' },
      { name: 'Hod, Splendour', about: 'Thought, words and how you reason it out.' },
      { name: 'Yesod, Foundation', about: 'Dreams and what lies under the surface.' },
      { name: 'Malkuth, the Kingdom', about: 'How it shows in everyday life; the outcome.' },
    ],
    lookBackDays: 90,
  },
  {
    id: 'astro-wheel',
    group: 'deep',
    kind: 'tarot',
    label: 'Astrological wheel',
    detail: 'Twelve cards round the twelve houses of a birth chart, for a look at every part of life at once.',
    positions: HOUSES,
    lookBackDays: 90,
    variant: { id: 'astro-wheel-centre', label: 'A card in the middle for the whole' },
  },
  {
    id: 'astro-wheel-centre',
    group: 'deep',
    kind: 'tarot',
    label: 'Astrological wheel, with a card at the centre',
    detail: 'Twelve cards round the twelve houses of a birth chart, and one in the middle for the whole.',
    positions: [...HOUSES, { name: 'The centre', about: 'What runs through it all.' }],
    lookBackDays: 90,
    hidden: true,
  },
  { id: 'one-rune', kind: 'runes', group: 'quick', label: 'One rune', detail: 'A single rune for a question or the day.', positions: [{ name: 'The rune', about: 'The answer, or the counsel.' }], lookBackDays: 7 },
  {
    id: 'three-runes',
    group: 'quick',
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
  {
    id: 'five-rune-cross',
    group: 'classic',
    kind: 'runes',
    label: 'Five-rune cross',
    detail: 'Five runes in a cross: the matter at the heart, with what led here, what comes, what lies beneath and what can help.',
    positions: [
      { name: 'The heart of it', about: 'The matter as it stands.' },
      { name: 'What has been', about: 'What led here.' },
      { name: 'What is coming', about: 'Where it’s heading.' },
      { name: 'Beneath it', about: 'The root, or what stands in the way.' },
      { name: 'Above it', about: 'What can help.' },
    ],
    lookBackDays: 30,
  },
  {
    id: 'nine-rune-cast',
    group: 'classic',
    kind: 'runes',
    label: 'Nine-rune cast',
    detail: 'Nine runes cast onto a cloth and read where they fall: the nearer the centre, the more it bears on the matter; face down means hidden, or not yet.',
    positions: Array.from({ length: 9 }, (_, i) => ({ name: `Rune ${i + 1}`, about: 'Read by where it fell.' })),
    lookBackDays: 30,
    cast: true,
  },
  {
    id: 'nine-worlds',
    group: 'deep',
    kind: 'runes',
    label: 'The nine worlds',
    detail: 'A modern spread: nine runes on the world-tree, Asgard at the top and Hel at the roots. The old poems name nine worlds but never map them; this follows how many heathens draw the tree today.',
    positions: [
      { name: 'Asgard', about: 'What is highest: purpose, the holy, what you serve.' },
      { name: 'Vanaheim', about: 'Growth and plenty: what is flourishing.' },
      { name: 'Alfheim', about: 'Light and inspiration: what is clear to you.' },
      { name: 'Jotunheim', about: 'Wild forces: what is beyond your control.' },
      { name: 'Midgard', about: 'Everyday life: where you stand.' },
      { name: 'Muspelheim', about: 'Fire: drive, anger, what burns.' },
      { name: 'Niflheim', about: 'Ice and mist: what is frozen or stuck.' },
      { name: 'Svartalfheim', about: 'The smiths’ halls: skill, and what is being made in the dark.' },
      { name: 'Hel', about: 'The dead and what has passed: ancestors, and endings.' },
    ],
    lookBackDays: 90,
  },
  { id: 'one-stave', kind: 'ogham', group: 'quick', label: 'One stave', detail: 'A single ogham stave for a question or the day.', positions: [{ name: 'The stave', about: 'The answer, or the counsel.' }], lookBackDays: 7 },
  {
    id: 'three-staves',
    group: 'quick',
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
  {
    id: 'five-staves',
    group: 'classic',
    kind: 'ogham',
    label: 'Five staves: the quarters and the centre',
    detail: 'Five staves for the four quarters and the middle, each with the gift a medieval Irish tale gives it: battle in the north, plenty in the east, music in the south, learning in the west, sovereignty at the centre. Casting staves this way is modern.',
    positions: [
      { name: 'North: struggle', about: 'What you are up against, and the strength to meet it.' },
      { name: 'East: plenty', about: 'What is growing and prospering.' },
      { name: 'South: music', about: 'Joy, art and what lifts you.' },
      { name: 'West: learning', about: 'What you know, or need to learn.' },
      { name: 'The centre: sovereignty', about: 'Your rule over your own life: the heart of the matter.' },
    ],
    lookBackDays: 30,
  },
  // Lenormand, Kipper and decks of your own (oracle/spreads.ts).
  ...ORACLE_SPREADS,
];

/**
 * The spreads to choose from for a kind: the built-in ones, then your own
 * (`custom`, from customSpreads). A deck of your own takes its own spreads
 * first, then every tarot spread and spread of your own for cards.
 */
export const spreadsFor = (kind: DrawKind, custom: Spread[] = []) =>
  kind === 'oracle' ? ownDeckSpreads(custom) : [...SPREADS, ...custom].filter((s) => s.kind === kind && !s.hidden);
export const spreadById = (id: string | null | undefined, custom: Spread[] = []): Spread | null => [...SPREADS, ...custom].find((s) => s.id === id) ?? null;

/** Every spread a deck of your own can be drawn into, made over for it. */
export function ownDeckSpreads(custom: Spread[] = []): Spread[] {
  const all = [...SPREADS, ...custom].filter((s) => (s.kind === 'oracle' || s.kind === 'tarot') && !s.hidden);
  return [...all.filter((s) => s.kind === 'oracle'), ...all.filter((s) => s.kind !== 'oracle')].map(asOwnDeck);
}

/** A spread by id, made over for a deck of your own (the wheel's centre card too). */
export function ownDeckSpreadById(id: string | null | undefined, custom: Spread[] = []): Spread | null {
  const s = spreadById(id, custom);
  return s && (s.kind === 'oracle' || s.kind === 'tarot') ? asOwnDeck(s) : null;
}

/** A kind's spreads in their groups, in order, leaving out empty groups. */
export function groupedSpreads(kind: DrawKind, custom: Spread[] = []): { group: (typeof GROUPS)[number]; spreads: Spread[] }[] {
  const all = spreadsFor(kind, custom);
  return GROUPS.map((group) => ({ group, spreads: all.filter((s) => s.group === group.id) })).filter((g) => g.spreads.length > 0);
}

export const KINDS: { id: DrawKind; label: string; action: string }[] = [
  { id: 'tarot', label: 'Tarot', action: 'Shuffle and draw' },
  { id: 'runes', label: 'Runes', action: 'Cast the runes' },
  { id: 'ogham', label: 'Ogham', action: 'Draw the staves' },
  { id: 'lenormand', label: 'Lenormand', action: 'Shuffle and draw' },
  { id: 'kipper', label: 'Kipper', action: 'Shuffle and draw' },
  { id: 'oracle', label: 'Your decks', action: 'Shuffle and draw' },
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

/** One card, rune or stave drawn; a cast rune also says where it fell. */
export type Drawn = { name: string; reversed: boolean; fall?: Fall };
export type Draw = { spread: string; items: Drawn[] };

/** The names that can come up for a kind (for a deck of your own, its cards). */
export function poolFor(kind: DrawKind, options: DrawOptions, deck?: OwnDeckData | null): string[] {
  if (kind === 'tarot') return TAROT_DECK.map((c) => c.name);
  if (kind === 'runes') return [...RUNES.map((r) => r.name), ...(options.blankRune ? [BLANK_RUNE.name] : [])];
  if (kind === 'lenormand') return LENORMAND.map((c) => c.name);
  if (kind === 'kipper') return KIPPER.map((c) => c.name);
  if (kind === 'oracle') return deck ? deck.cards.map((c) => c.name) : [];
  return FEDA.map((f) => f.name);
}

/** Whether cards come up reversed: tarot when you've chosen reversals, a deck of your own when it's set to. Never Lenormand or Kipper. */
const reverses = (kind: DrawKind, options: DrawOptions, deck?: OwnDeckData | null) => (kind === 'tarot' && options.reversals) || (kind === 'oracle' && !!deck?.reversals);

/** Whether there are enough cards to fill a spread (a deck of your own may be small). */
export const canDraw = (spread: Spread, options: DrawOptions, deck?: OwnDeckData | null) => poolFor(spread.kind, options, deck).length >= spread.positions.length;

/** Shuffle the whole deck or bag and lay out as many as the spread needs. */
export function drawSpread(spread: Spread, options: DrawOptions, random: () => number = secureRandom, deck?: OwnDeckData | null): Draw {
  const pool = shuffle(poolFor(spread.kind, options, deck), random);
  const reversing = reverses(spread.kind, options, deck);
  const items: Drawn[] = pool.slice(0, spread.positions.length).map((name) => ({ name, reversed: reversing && random() < 0.5 }));
  if (spread.cast) for (const item of items) item.fall = castFall(random);
  return { spread: spread.id, items };
}

// ─── The cast ────────────────────────────────────────────────────────────

/** Where a cast rune lands: about a quarter near the centre, the rest further out; face up or down as it falls. */
export function castFall(random: () => number = secureRandom): Fall {
  const r = random();
  return { ring: r < 0.25 ? 'centre' : r < 0.65 ? 'middle' : 'edge', up: random() < 0.5 };
}

const RING_WORDS: Record<Ring, { name: string; about: string }> = {
  centre: { name: 'Near the centre', about: 'Close to the heart of the matter: it bears on it most, and soonest.' },
  middle: { name: 'In the middle ring', about: 'Around the matter: people, influences and what is in motion.' },
  edge: { name: 'Out at the edge', about: 'Further off: what is fading, far away, or a long way yet to come.' },
};

/** A fallen rune's place, in words: "Near the centre, face up". */
export function fallPosition(fall: Fall): Position {
  const ring = RING_WORDS[fall.ring];
  return {
    name: `${ring.name}, face ${fall.up ? 'up' : 'down'}`,
    about: `${ring.about} ${fall.up ? 'Face up, it speaks plainly.' : 'Face down, it is hidden, or not ready yet: read it lightly, or set it aside as many readers do.'}`,
  };
}

/** How to read a cast, in a few plain lines. */
export const CAST_NOTE =
  'Read a cast from the middle outward. Runes near the centre bear most on your question; those in the middle ring are what surrounds it; those at the edge are further off. Face-up runes speak to it now. Face-down ones are hidden or not yet ready: many readers leave them unread.';

/** The place one item fills: the spread's own position, or for a cast, where the rune fell. */
export function placeOf(spread: Spread, draw: Draw, index: number): Position | null {
  const fall = draw.items[index]?.fall;
  if (spread.cast && fall) return fallPosition(fall);
  return spread.positions[index] ?? null;
}

/** The draw laid out on the table (see layout.ts). */
export function layoutOfDraw(spread: Spread, draw: Draw | null): Laid {
  if (spread.cast && draw && draw.items.every((i) => i.fall)) return layoutOf(spread, { names: draw.items.map((i) => i.name), falls: draw.items.map((i) => i.fall!) });
  return layoutOf(spread);
}

export type DrawnMeaning = {
  name: string;
  glyph: string | null;
  card: TarotCard | null;
  reversed: boolean;
  meaning: Meaning;
  gloss: string | null;
  lenormand?: LenormandCard;
  kipper?: KipperCard;
  /** A card from a deck of your own. */
  own?: OwnCard;
};

/** What a drawn card, rune or stave means; `deck` for a card from a deck of your own. */
export function meaningOf(item: Drawn, deck?: OwnDeckData | null): DrawnMeaning | null {
  if (deck) {
    const mine = ownCard(deck, item.name);
    return mine ? { name: mine.name, glyph: null, card: null, reversed: item.reversed, meaning: ownMeaning(mine, item.reversed), gloss: null, own: mine } : null;
  }
  const len = LENORMAND.find((c) => c.name === item.name);
  if (len) return { name: len.name, glyph: null, card: null, reversed: false, meaning: len.meaning, gloss: `${len.number} · ${len.playingName}`, lenormand: len };
  const kip = KIPPER.find((c) => c.name === item.name);
  if (kip) return { name: kip.name, glyph: null, card: null, reversed: false, meaning: kip.meaning, gloss: `${kip.number} · ${kip.german}`, kipper: kip };
  const card = TAROT_DECK.find((c) => c.name === item.name);
  if (card) return { name: card.name, glyph: null, card, reversed: item.reversed, meaning: item.reversed ? card.reversed : card.upright, gloss: null };
  const stave: Stave | undefined = [...RUNES, ...FEDA, BLANK_RUNE].find((s) => s.name === item.name);
  if (!stave) return null;
  return { name: stave.name, glyph: stave.glyph, card: null, reversed: false, meaning: { keywords: stave.keywords, text: stave.text }, gloss: stave.gloss };
}

/** One line of "What came up": "Past: The Tower, reversed (upheaval delayed, …)". */
export function drawnLine(position: Position | null, item: Drawn, single: boolean, deck?: OwnDeckData | null): string {
  const m = meaningOf(item, deck);
  const name = `${item.name}${item.reversed ? ', reversed' : ''}`;
  const words = m ? ` (${m.meaning.keywords})` : '';
  return single || !position ? `${name}${words}` : `${position.name}: ${name}${words}`;
}

/** Between the spread's name and the deck's, or "pulled by hand", on the first line of "What came up". */
const NOTE = ' · ';
export const BY_HAND = 'pulled by hand';

/**
 * "What came up" for a draw: the spread's name (with your deck's name, and
 * "pulled by hand" for a draw logged from real cards), then each card in its place.
 */
export function cameUpText(spread: Spread, draw: Draw, { deck, byHand = false }: { deck?: OwnDeckData | null; byHand?: boolean } = {}): string {
  const single = spread.positions.length === 1;
  const head = [spread.label, deck ? deck.name : null, byHand ? BY_HAND : null].filter(Boolean).join(NOTE);
  return [head, ...draw.items.map((item, i) => drawnLine(placeOf(spread, draw, i), item, single, deck))].join('\n');
}

/** The reading a draw becomes, in the reading log's own shape. */
export function readingFromDraw(
  spread: Spread,
  draw: Draw,
  {
    question = '',
    interpretation = '',
    lookBack,
    now,
    deck,
    byHand = false,
  }: { question?: string; interpretation?: string; lookBack?: string; now: Date; deck?: OwnDeckEntry | null; byHand?: boolean },
): Reading {
  const date = localDateKey(now);
  const own = spread.kind === 'oracle' ? (deck ?? null) : null;
  return {
    date,
    method: spread.kind,
    ...(own ? { deck: own.id } : {}),
    question: question.trim(),
    drawn: draw.items.map((d) => d.name),
    cameUp: cameUpText(spread, draw, { deck: own?.data, byHand }),
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
export function drawOfReading(
  reading: Pick<Reading, 'method' | 'drawn' | 'cameUp' | 'deck'>,
  custom: Spread[] = [],
  decks: OwnDeckEntry[] = [],
): { spread: Spread; draw: Draw; deck: OwnDeckEntry | null } | null {
  const lines = reading.cameUp.split('\n');
  const head = lines[0] ?? '';
  const deck = reading.method === 'oracle' ? (decks.find((d) => d.id === reading.deck) ?? null) : null;
  if (reading.method === 'oracle' && !deck) return null;
  const candidates = reading.method === 'oracle' ? ownDeckSpreads(custom) : [...SPREADS, ...custom].filter((s) => s.kind === reading.method);
  const spread = candidates.find((s) => (head === s.label || head.startsWith(`${s.label}${NOTE}`)) && s.positions.length === reading.drawn.length);
  if (!spread) return null;
  const reversible = spread.kind === 'tarot' || spread.kind === 'oracle';
  const items: Drawn[] = reading.drawn.map((name, i) => ({ name, reversed: reversible && (lines[i + 1] ?? '').includes(`${name}, reversed`) }));
  const pool = poolFor(spread.kind, { reversals: true, blankRune: true }, deck?.data);
  if (!items.every((item) => pool.includes(item.name))) return null;
  if (spread.cast) {
    // Where each rune fell is the start of its line: "Near the centre, face up: Fehu (…)".
    for (const [i, item] of items.entries()) {
      const line = lines[i + 1] ?? '';
      const fall = ALL_FALLS.find((f) => line.startsWith(`${fallPosition(f).name}: `));
      if (!fall) return null;
      item.fall = fall;
    }
  }
  return { spread, draw: { spread: spread.id, items }, deck };
}

const ALL_FALLS: Fall[] = RINGS.flatMap((ring) => [true, false].map((up) => ({ ring, up })));

/** Come-back choices for a draw: tomorrow too, for a card of the day. */
export const DRAW_LOOK_BACK: { days: number; label: string }[] = [{ days: 1, label: 'Tomorrow' }, ...LOOK_BACK_CHOICES];
