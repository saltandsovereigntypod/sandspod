// Readings: a log of divinations, with the card, rune and ogham names to pick
// from, and the "come back to" list of readings whose look-back date has come.
// Pure, so it can be tested.

import { moonState, type PhaseName } from '../../moon.ts';
import { dateFromKey, localDateKey } from '../../rituals/lifecycle.ts';

export const READINGS = 'hedge.readings';

export type ReadingMethod = 'tarot' | 'oracle' | 'runes' | 'tea' | 'scrying' | 'pendulum' | 'ogham' | 'other';

export const METHODS: { id: ReadingMethod; label: string }[] = [
  { id: 'tarot', label: 'Tarot' },
  { id: 'oracle', label: 'Oracle cards' },
  { id: 'runes', label: 'Runes' },
  { id: 'tea', label: 'Tea leaves' },
  { id: 'scrying', label: 'Scrying' },
  { id: 'pendulum', label: 'Pendulum' },
  { id: 'ogham', label: 'Ogham' },
  { id: 'other', label: 'Other' },
];

export const methodLabel = (id: string) => METHODS.find((m) => m.id === id)?.label ?? 'Reading';

export type Reading = {
  /** The day of the reading, "YYYY-MM-DD". */
  date: string;
  method: ReadingMethod;
  question: string;
  /** Cards, runes or few named things picked from the lists, in the order drawn. */
  drawn: string[];
  /** What came up, in your words. */
  cameUp: string;
  interpretation: string;
  /** When to come back to it, "YYYY-MM-DD", or blank. */
  lookBack: string;
  /** What actually happened, written when you came back to it. */
  outcome: string;
  outcomeDate: string;
  moonPhase: PhaseName;
  /** The tarot deck a draw was made with (divination/decks.ts); missing on readings logged by hand or from before decks. */
  deck?: string;
};

export type ReadingEntry = { id: string; createdAt: string; data: Reading };

const at9pm = (key: string) => {
  const d = dateFromKey(key) ?? new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 21);
};

export function blankReading(now: Date): Reading {
  const date = localDateKey(now);
  return {
    date,
    method: 'tarot',
    question: '',
    drawn: [],
    cameUp: '',
    interpretation: '',
    lookBack: lookBackFrom(date, 30),
    outcome: '',
    outcomeDate: '',
    moonPhase: moonState(at9pm(date)).name,
  };
}

export const moonForReading = (dateKey: string): PhaseName => moonState(at9pm(dateKey)).name;

/** The date `days` after a "YYYY-MM-DD" key, as a key. */
export function lookBackFrom(dateKey: string, days: number): string {
  const d = dateFromKey(dateKey) ?? new Date();
  return localDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));
}

export const LOOK_BACK_CHOICES: { days: number; label: string }[] = [
  { days: 7, label: 'In a week' },
  { days: 14, label: 'Two weeks' },
  { days: 30, label: 'A month' },
  { days: 90, label: 'Three months' },
  { days: 182, label: 'Six months' },
  { days: 365, label: 'A year' },
];

const METHOD_IDS = METHODS.map((m) => m.id);

export function normalizeReading(raw: unknown): Reading {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Reading>;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const date = dateFromKey(str(r.date)) ? str(r.date) : localDateKey(new Date());
  return {
    date,
    method: METHOD_IDS.includes(r.method as ReadingMethod) ? (r.method as ReadingMethod) : 'other',
    question: str(r.question),
    drawn: Array.isArray(r.drawn) ? r.drawn.filter((x): x is string => typeof x === 'string') : [],
    cameUp: str(r.cameUp),
    interpretation: str(r.interpretation),
    lookBack: dateFromKey(str(r.lookBack)) ? str(r.lookBack) : '',
    outcome: str(r.outcome),
    outcomeDate: str(r.outcomeDate),
    moonPhase: (typeof r.moonPhase === 'string' && r.moonPhase ? r.moonPhase : moonForReading(date)) as PhaseName,
    ...(typeof r.deck === 'string' && r.deck ? { deck: r.deck } : {}),
  };
}

/** Readings whose look-back day has come and that don't yet say what happened, oldest due first. */
export function comeBackTo<T extends ReadingEntry>(list: T[], now: Date): T[] {
  const today = localDateKey(now);
  return list
    .filter((e) => e.data.lookBack && e.data.lookBack <= today && !e.data.outcome.trim())
    .sort((a, b) => (a.data.lookBack < b.data.lookBack ? -1 : 1));
}

/** Readings still waiting for their look-back day, soonest first. */
export function waiting<T extends ReadingEntry>(list: T[], now: Date): T[] {
  const today = localDateKey(now);
  return list
    .filter((e) => e.data.lookBack && e.data.lookBack > today && !e.data.outcome.trim())
    .sort((a, b) => (a.data.lookBack < b.data.lookBack ? -1 : 1));
}

export function sortReadings<T extends ReadingEntry>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.data.date === b.data.date ? (a.createdAt < b.createdAt ? 1 : -1) : a.data.date < b.data.date ? 1 : -1));
}

export function searchReadings<T extends ReadingEntry>(list: T[], query: string, method: ReadingMethod | null = null): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((e) => {
    if (method && e.data.method !== method) return false;
    if (!words.length) return true;
    const hay = [e.data.question, e.data.cameUp, e.data.interpretation, e.data.outcome, e.data.drawn.join(' '), methodLabel(e.data.method)].join(' ').toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/** Cards or runes that keep turning up across readings, most first. */
export function frequentDraws(list: ReadingEntry[], limit = 8): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of list) for (const name of new Set(e.data.drawn)) counts.set(name, (counts.get(name) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([, n]) => n > 1)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

// ─── Names to pick from ──────────────────────────────────────────────────

/** The 24 runes of the Elder Futhark, in their three ætts, with a one-word gloss. */
export const ELDER_FUTHARK: { name: string; glyph: string; gloss: string }[] = [
  { name: 'Fehu', glyph: 'ᚠ', gloss: 'cattle, wealth' },
  { name: 'Uruz', glyph: 'ᚢ', gloss: 'aurochs, strength' },
  { name: 'Thurisaz', glyph: 'ᚦ', gloss: 'giant, thorn' },
  { name: 'Ansuz', glyph: 'ᚨ', gloss: 'a god, the word' },
  { name: 'Raidho', glyph: 'ᚱ', gloss: 'riding, journey' },
  { name: 'Kenaz', glyph: 'ᚲ', gloss: 'torch, knowing' },
  { name: 'Gebo', glyph: 'ᚷ', gloss: 'gift, exchange' },
  { name: 'Wunjo', glyph: 'ᚹ', gloss: 'joy' },
  { name: 'Hagalaz', glyph: 'ᚺ', gloss: 'hail, disruption' },
  { name: 'Nauthiz', glyph: 'ᚾ', gloss: 'need' },
  { name: 'Isa', glyph: 'ᛁ', gloss: 'ice, stillness' },
  { name: 'Jera', glyph: 'ᛃ', gloss: 'year, harvest' },
  { name: 'Eihwaz', glyph: 'ᛇ', gloss: 'yew, endurance' },
  { name: 'Perthro', glyph: 'ᛈ', gloss: 'lot-cup, chance' },
  { name: 'Algiz', glyph: 'ᛉ', gloss: 'elk-sedge, protection' },
  { name: 'Sowilo', glyph: 'ᛊ', gloss: 'sun' },
  { name: 'Tiwaz', glyph: 'ᛏ', gloss: 'Tyr, justice' },
  { name: 'Berkano', glyph: 'ᛒ', gloss: 'birch, growth' },
  { name: 'Ehwaz', glyph: 'ᛖ', gloss: 'horse, partnership' },
  { name: 'Mannaz', glyph: 'ᛗ', gloss: 'humankind' },
  { name: 'Laguz', glyph: 'ᛚ', gloss: 'water, flow' },
  { name: 'Ingwaz', glyph: 'ᛜ', gloss: 'Ing, the seed' },
  { name: 'Dagaz', glyph: 'ᛞ', gloss: 'day, breakthrough' },
  { name: 'Othala', glyph: 'ᛟ', gloss: 'inheritance, home' },
];

/** The twenty feda of the ogham, in their four aicmí, with the tree or thing each names. */
export const OGHAM: { name: string; gloss: string }[] = [
  { name: 'Beith', gloss: 'birch' },
  { name: 'Luis', gloss: 'rowan' },
  { name: 'Fearn', gloss: 'alder' },
  { name: 'Sail', gloss: 'willow' },
  { name: 'Nion', gloss: 'ash' },
  { name: 'Uath', gloss: 'hawthorn' },
  { name: 'Dair', gloss: 'oak' },
  { name: 'Tinne', gloss: 'holly' },
  { name: 'Coll', gloss: 'hazel' },
  { name: 'Ceirt', gloss: 'apple' },
  { name: 'Muin', gloss: 'vine or bramble' },
  { name: 'Gort', gloss: 'ivy' },
  { name: 'nGéadal', gloss: 'broom or reed' },
  { name: 'Straif', gloss: 'blackthorn' },
  { name: 'Ruis', gloss: 'elder' },
  { name: 'Ailm', gloss: 'pine or fir' },
  { name: 'Onn', gloss: 'gorse' },
  { name: 'Úr', gloss: 'heather' },
  { name: 'Eadhadh', gloss: 'aspen' },
  { name: 'Iodhadh', gloss: 'yew' },
];

export const MAJOR_ARCANA = [
  'The Fool',
  'The Magician',
  'The High Priestess',
  'The Empress',
  'The Emperor',
  'The Hierophant',
  'The Lovers',
  'The Chariot',
  'Strength',
  'The Hermit',
  'Wheel of Fortune',
  'Justice',
  'The Hanged Man',
  'Death',
  'Temperance',
  'The Devil',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'Judgement',
  'The World',
];

const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
export const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];

/** All 78 cards of a Rider–Waite–Smith style deck. */
export const TAROT: string[] = [...MAJOR_ARCANA, ...SUITS.flatMap((suit) => RANKS.map((rank) => `${rank} of ${suit}`))];

/** Cards matching a search: "queen cups", "3 swords", "tower". */
export function searchTarot(query: string): string[] {
  const numbers: Record<string, string> = { '1': 'ace', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten' };
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w && w !== 'of' && w !== 'the')
    .map((w) => numbers[w] ?? w);
  if (!words.length) return TAROT;
  return TAROT.filter((card) => {
    const parts = card.toLowerCase().split(' ');
    return words.every((w) => parts.some((p) => p.startsWith(w)));
  });
}

/** Names to offer as quick picks for a method, if it has a fixed set. */
export function pickList(method: ReadingMethod): string[] | null {
  if (method === 'runes') return ELDER_FUTHARK.map((r) => r.name);
  if (method === 'ogham') return OGHAM.map((o) => o.name);
  if (method === 'tarot') return TAROT;
  return null;
}

/** A short gloss for a drawn rune or ogham name, for the reading's page. */
export function glossOf(name: string): string | null {
  const rune = ELDER_FUTHARK.find((r) => r.name === name);
  if (rune) return `${rune.glyph} ${rune.gloss}`;
  const fid = OGHAM.find((o) => o.name === name);
  return fid ? fid.gloss : null;
}
