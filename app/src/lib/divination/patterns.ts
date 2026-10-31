// Divination patterns: what your own draw log says over time. Across every
// reading kept in `hedge.readings` (tarot in each of its decks, runes, ogham,
// Lenormand, Kipper and decks of your own): the cards that come most, the
// balance of suits, aettir and aicmí, reversals, the cards that gather round
// a kind of question, the moon's phase and the day's planet, streaks of days
// with a draw, and the cards you haven't met yet. Shown at Craft → Divination
// → Your patterns (app/src/app/(tabs)/rituals/divination/patterns.tsx) and on
// the website at /divination/patterns/. Nothing is stored; it's all read
// from the log. Pure, so every number can be tested.
//
// The elements beside the tarot suits (Wands fire, Cups water, Swords air,
// Pentacles earth) are the Golden Dawn's, the usual modern English reading;
// some readers swap Wands and Swords. The pages say so.

import { dayRuler } from '../calendar.ts';
import { methodLabel, type ReadingEntry, type ReadingMethod } from '../craft/hedge/readings.ts';
import type { PhaseName } from '../moon.ts';
import { dateFromKey, localDateKey } from '../rituals/lifecycle.ts';
import { deckCardTitle, deckInfo, deckOfReading, type DeckId } from './decks.ts';
import { divinationRoute, divinationWebPath, refForDrawn, type DivinationKind, type DivinationRef } from './links.ts';
import { KIPPER } from './oracle/kipper.ts';
import { LENORMAND } from './oracle/lenormand.ts';
import { FEDA, RUNES } from './staves.ts';
import { TAROT_DECK } from './tarot.ts';

const DAY_MS = 86_400_000;

/** How far back to look. */
export type PatternRange = 'all' | '365' | '90' | '30';
export const RANGES: { id: PatternRange; label: string }[] = [
  { id: 'all', label: 'All time' },
  { id: '365', label: 'Past year' },
  { id: '90', label: 'Past 90 days' },
  { id: '30', label: 'Past 30 days' },
];
export const isRange = (value: unknown): value is PatternRange => RANGES.some((r) => r.id === value);

/** Fewer readings than this, and the page says the patterns are still gathering. */
export const MIN_READINGS = 3;

/** The readings from `range` back to `now`, by the day each was drawn. */
export function readingsInRange<T extends ReadingEntry>(list: T[], range: PatternRange, now: Date): T[] {
  if (range === 'all') return list;
  const from = localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - Number(range) + 1));
  const to = localDateKey(now);
  return list.filter((e) => e.data.date >= from && e.data.date <= to);
}

/** One card, rune or stave drawn in a reading, and whether it came reversed (read from "What came up"). */
export type DrawnItem = { name: string; reversed: boolean };

/** What a reading drew, in order, with reversals where its "What came up" says so ("The Tower, reversed"). */
export function drawnItems(reading: Pick<ReadingEntry['data'], 'drawn' | 'cameUp'>): DrawnItem[] {
  const text = reading.cameUp || '';
  return reading.drawn
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name, reversed: text.includes(`${name}, reversed`) }));
}

export type CardCount = {
  name: string;
  /** Which system it belongs to; null for a card from a deck of your own or a name typed by hand. */
  kind: DivinationKind | null;
  ref: DivinationRef | null;
  count: number;
  reversed: number;
  /** For tarot: the deck it was drawn with most, and its own name there ("XVI · La Maison Dieu"), if it differs. */
  deck: DeckId | null;
  title: string | null;
  /** In how many different readings it came (a card drawn twice in one spread counts once here). */
  readings: number;
};

/** The card's own page: in the app's Grimoire, or on the website (in the deck it was drawn with most). */
export const cardRoute = (c: Pick<CardCount, 'ref' | 'deck'>) => (c.ref ? divinationRoute(c.ref, c.deck) : null);
export const cardWebPath = (c: Pick<CardCount, 'ref' | 'deck'>) => (c.ref ? divinationWebPath(c.ref, c.deck) : null);

/** "The Tower · 5 (2 reversed)" */
export function cardCountLine(c: Pick<CardCount, 'name' | 'count' | 'reversed' | 'title'>): string {
  return `${c.name}${c.title ? ` (${c.title})` : ''} · ${c.count}${c.reversed ? ` (${c.reversed} reversed)` : ''}`;
}

export type Bar = { key: string; label: string; count: number; note?: string };

export type Balance = {
  kind: DivinationKind;
  label: string;
  draws: number;
  bars: Bar[];
  /** A plain sentence about the balance, or null when there's too little to say. */
  line: string | null;
};

export type Theme = { key: string; label: string; readings: number; cards: { name: string; count: number; ref: DivinationRef | null }[] };

export type PhaseRow = { phase: PhaseName; readings: number; top: string | null };
export type DayRow = { day: string; planet: string; readings: number; top: string | null };

export type Streaks = {
  /** Days with at least one reading, in a row, ending today or yesterday. */
  current: number;
  longest: number;
  /** The last day of the longest run, "YYYY-MM-DD". */
  longestEnd: string | null;
  /** Distinct days with a reading. */
  days: number;
  /** A card that came in reading after reading, in a row: its longest such run (2 or more). */
  card: { name: string; run: number; ref: DivinationRef | null } | null;
};

export type NotMet = {
  kind: DivinationKind;
  label: string;
  total: number;
  met: number;
  missing: { name: string; ref: DivinationRef }[];
};

export type Patterns = {
  readings: number;
  /** Cards, runes and staves drawn, all told. */
  draws: number;
  byMethod: { id: ReadingMethod; label: string; count: number }[];
  /** The most drawn, most first (up to `limit`). */
  top: CardCount[];
  /** Every card counted, most first, for search and the "not met" lists. */
  all: CardCount[];
  tarotDecks: { deck: DeckId; label: string; count: number }[];
  /** Of the cards that can come reversed (tarot and decks of your own), how many did. */
  reversals: { reversible: number; reversed: number; share: number } | null;
  balances: Balance[];
  themes: Theme[];
  byPhase: PhaseRow[];
  byDay: DayRow[];
  streaks: Streaks;
  notMet: NotMet[];
};

const PHASES: PhaseName[] = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** The kinds of question people bring, by the words in them. Readings drawn for a dream, a working or a deity count by that too. */
export const THEMES: { key: string; label: string; words: string[] }[] = [
  { key: 'love', label: 'Love and relationships', words: ['love', 'lover', 'partner', 'relationship', 'marriage', 'romance', 'dating', 'ex', 'crush', 'friend', 'friendship', 'heart'] },
  { key: 'work', label: 'Work and money', words: ['work', 'job', 'career', 'money', 'boss', 'business', 'interview', 'promotion', 'finances', 'rent', 'debt', 'pay', 'salary'] },
  { key: 'home', label: 'Home and family', words: ['home', 'house', 'move', 'moving', 'family', 'mother', 'mum', 'mom', 'father', 'dad', 'child', 'children', 'sister', 'brother'] },
  { key: 'health', label: 'Health and body', words: ['health', 'body', 'heal', 'healing', 'illness', 'sleep', 'energy', 'tired', 'pain'] },
  { key: 'path', label: 'Spirit and path', words: ['spirit', 'path', 'practice', 'craft', 'deity', 'goddess', 'god', 'ancestor', 'ancestors', 'guide', 'guides', 'magic', 'calling', 'purpose', 'soul'] },
  { key: 'study', label: 'Study and making', words: ['study', 'exam', 'school', 'course', 'learn', 'learning', 'write', 'writing', 'art', 'create', 'creative', 'project'] },
  { key: 'choice', label: 'Choices', words: ['should', 'choose', 'choice', 'decide', 'decision', 'either', 'whether'] },
];
const LINK_THEMES: Record<string, string> = { dream: 'For a dream', plan: 'Before a working', deity: 'For a deity' };

const words = (text: string) => text.toLowerCase().match(/[a-z’']+/g) ?? [];

/** The kinds of question a reading belongs to (its words, and what it was drawn for). */
export function themesOf(reading: Pick<ReadingEntry['data'], 'question' | 'linkedTo'>): string[] {
  const said = new Set(words(reading.question));
  const out = THEMES.filter((t) => t.words.some((w) => said.has(w))).map((t) => t.key);
  if (reading.linkedTo) out.push(reading.linkedTo.kind);
  return out;
}

const themeLabel = (key: string) => THEMES.find((t) => t.key === key)?.label ?? LINK_THEMES[key] ?? key;

/** The tarot suit (or "major"), rune aett, ogham aicme or Lenormand playing suit a name belongs to. */
function groupOf(name: string): { kind: DivinationKind; key: string } | null {
  const card = TAROT_DECK.find((c) => c.name === name);
  if (card) return { kind: 'tarot', key: card.suit ?? 'major' };
  const rune = RUNES.findIndex((r) => r.name === name);
  if (rune >= 0) return { kind: 'runes', key: ['freyr', 'hagal', 'tyr'][Math.floor(rune / 8)] };
  const stave = FEDA.findIndex((f) => f.name === name);
  if (stave >= 0) return { kind: 'ogham', key: ['beithe', 'huatha', 'muine', 'ailme'][Math.floor(stave / 5)] };
  const len = LENORMAND.find((c) => c.name === name);
  if (len) return { kind: 'lenormand', key: len.playingName.split(' of ')[1] ?? '' };
  return null;
}

const BALANCE_BARS: Record<'tarot' | 'runes' | 'ogham' | 'lenormand', { key: string; label: string; note?: string }[]> = {
  tarot: [
    { key: 'major', label: 'Major Arcana' },
    { key: 'Wands', label: 'Wands', note: 'fire' },
    { key: 'Cups', label: 'Cups', note: 'water' },
    { key: 'Swords', label: 'Swords', note: 'air' },
    { key: 'Pentacles', label: 'Pentacles', note: 'earth' },
  ],
  runes: [
    { key: 'freyr', label: 'Freyr’s aett' },
    { key: 'hagal', label: 'Hagal’s aett' },
    { key: 'tyr', label: 'Tyr’s aett' },
  ],
  ogham: [
    { key: 'beithe', label: 'Aicme Beithe' },
    { key: 'huatha', label: 'Aicme hÚatha' },
    { key: 'muine', label: 'Aicme Muine' },
    { key: 'ailme', label: 'Aicme Ailme' },
  ],
  lenormand: [
    { key: 'Hearts', label: 'Hearts' },
    { key: 'Diamonds', label: 'Diamonds' },
    { key: 'Clubs', label: 'Clubs' },
    { key: 'Spades', label: 'Spades' },
  ],
};
const KIND_LABEL: Record<DivinationKind, string> = { tarot: 'Tarot', runes: 'Runes', ogham: 'Ogham', lenormand: 'Lenormand', kipper: 'Kipper' };

/** Each system's whole set, for "cards you haven't met yet". The blank rune is a modern addition, so it isn't counted as missing. */
const FULL_SETS: Record<DivinationKind, string[]> = {
  tarot: TAROT_DECK.map((c) => c.name),
  runes: RUNES.map((r) => r.name),
  ogham: FEDA.map((f) => f.name),
  lenormand: LENORMAND.map((c) => c.name),
  kipper: KIPPER.map((c) => c.name),
};

/** A plain sentence about where the draws lean, said only with enough to go on. */
function balanceLine(kind: DivinationKind, bars: Bar[], draws: number): string | null {
  if (draws < 10) return null;
  const sorted = [...bars].sort((a, b) => b.count - a.count);
  const even = draws / bars.length;
  const top = sorted[0];
  const low = sorted[sorted.length - 1];
  if (top.count < even * 1.4 && low.count > even * 0.6) return 'Fairly even: no group stands out.';
  const name = (b: Bar) => (b.note ? `${b.label} (${b.note})` : b.label);
  if (kind === 'tarot' && top.key === 'major') return `The Major Arcana come most: ${top.count} of ${draws}. Many readers take that as a time of big themes.`;
  return `${name(top)} come most (${top.count} of ${draws}); ${name(low)} least (${low.count}).`;
}

function mostOf(map: Map<string, number>): string | null {
  let best: string | null = null;
  let n = 0;
  for (const [k, v] of map) if (v > n) [best, n] = [k, v];
  return best;
}

/** Everything the patterns page shows, from the readings given (already narrowed to a range). */
export function divinationPatterns(list: ReadingEntry[], now: Date, { limit = 10 }: { limit?: number } = {}): Patterns {
  const sorted = [...list].sort((a, b) => a.data.date.localeCompare(b.data.date) || String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? '')));
  const cards = new Map<string, { count: number; reversed: number; readings: number; decks: Map<string, number> }>();
  const methods = new Map<ReadingMethod, number>();
  const tarotDecks = new Map<DeckId, number>();
  const groups = new Map<string, number>();
  const themeCount = new Map<string, number>();
  const themeCards = new Map<string, Map<string, number>>();
  const phaseCount = new Map<string, number>();
  const phaseCards = new Map<string, Map<string, number>>();
  const dayCount = new Map<number, number>();
  const dayCards = new Map<number, Map<string, number>>();
  let draws = 0;
  let reversible = 0;
  let reversedAll = 0;
  const bump = <K>(map: Map<K, number>, key: K, by = 1) => map.set(key, (map.get(key) ?? 0) + by);
  const bumpIn = <K>(outer: Map<K, Map<string, number>>, key: K, name: string) => {
    const inner = outer.get(key) ?? new Map<string, number>();
    bump(inner, name);
    outer.set(key, inner);
  };

  // Card runs: reading after reading with the same card.
  const runs = new Map<string, number>();
  let bestRun: { name: string; run: number } | null = null;

  for (const e of sorted) {
    const r = e.data;
    bump(methods, r.method);
    const items = drawnItems(r);
    const deck = r.method === 'tarot' ? deckOfReading(r) : null;
    if (deck && items.length) bump(tarotDecks, deck);
    const seen = new Set<string>();
    for (const item of items) {
      draws++;
      const c = cards.get(item.name) ?? { count: 0, reversed: 0, readings: 0, decks: new Map<string, number>() };
      c.count++;
      if (item.reversed) c.reversed++;
      if (!seen.has(item.name)) c.readings++;
      if (deck) bump(c.decks, deck);
      cards.set(item.name, c);
      if (r.method === 'tarot' || r.method === 'oracle') {
        reversible++;
        if (item.reversed) reversedAll++;
      }
      const g = groupOf(item.name);
      if (g) bump(groups, `${g.kind}:${g.key}`);
      seen.add(item.name);
    }
    for (const t of themesOf(r)) {
      bump(themeCount, t);
      for (const name of seen) bumpIn(themeCards, t, name);
    }
    bump(phaseCount, r.moonPhase);
    for (const name of seen) bumpIn(phaseCards, r.moonPhase, name);
    const day = dateFromKey(r.date);
    if (day) {
      bump(dayCount, day.getDay());
      for (const name of seen) bumpIn(dayCards, day.getDay(), name);
    }
    for (const name of [...runs.keys()]) if (!seen.has(name)) runs.delete(name);
    for (const name of seen) {
      const run = (runs.get(name) ?? 0) + 1;
      runs.set(name, run);
      if (run >= 2 && (!bestRun || run > bestRun.run)) bestRun = { name, run };
    }
  }

  const all: CardCount[] = [...cards.entries()]
    .map(([name, c]) => {
      const ref = refForDrawn(name);
      const deck = ref?.kind === 'tarot' ? ((mostOf(c.decks) as DeckId | null) ?? null) : null;
      return { name, kind: ref?.kind ?? null, ref, count: c.count, reversed: c.reversed, deck, title: deck ? deckCardTitle(deck, name) : null, readings: c.readings };
    })
    .sort((a, b) => b.count - a.count || b.readings - a.readings || a.name.localeCompare(b.name));

  const balances: Balance[] = (Object.keys(BALANCE_BARS) as (keyof typeof BALANCE_BARS)[])
    .map((kind) => {
      const bars = BALANCE_BARS[kind].map((b) => ({ ...b, count: groups.get(`${kind}:${b.key}`) ?? 0 }));
      const n = bars.reduce((sum, b) => sum + b.count, 0);
      return { kind, label: KIND_LABEL[kind], draws: n, bars, line: balanceLine(kind, bars, n) };
    })
    .filter((b) => b.draws > 0);

  const themes: Theme[] = [...themeCount.entries()]
    .map(([key, readings]) => ({
      key,
      label: themeLabel(key),
      readings,
      cards: [...(themeCards.get(key) ?? new Map<string, number>()).entries()]
        .filter(([, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 5)
        .map(([name, count]) => ({ name, count, ref: refForDrawn(name) })),
    }))
    .filter((t) => t.readings >= 2)
    .sort((a, b) => b.readings - a.readings || a.label.localeCompare(b.label));

  const topOf = (map: Map<string, number> | undefined) => {
    const best = map ? [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] : undefined;
    return best && best[1] >= 2 ? best[0] : null;
  };

  const used = new Set(all.map((c) => c.kind).filter((k): k is DivinationKind => !!k));
  const notMet: NotMet[] = (Object.keys(FULL_SETS) as DivinationKind[])
    .filter((kind) => used.has(kind))
    .map((kind) => {
      const missing = FULL_SETS[kind].filter((name) => !cards.has(name)).map((name) => ({ name, ref: refForDrawn(name)! }));
      return { kind, label: KIND_LABEL[kind], total: FULL_SETS[kind].length, met: FULL_SETS[kind].length - missing.length, missing };
    });

  return {
    readings: sorted.length,
    draws,
    byMethod: [...methods.entries()].map(([id, count]) => ({ id, label: methodLabel(id), count })).sort((a, b) => b.count - a.count),
    top: all.slice(0, limit),
    all,
    tarotDecks: [...tarotDecks.entries()].map(([deck, count]) => ({ deck, label: deckInfo(deck).name, count })).sort((a, b) => b.count - a.count),
    reversals: reversible ? { reversible, reversed: reversedAll, share: reversedAll / reversible } : null,
    balances,
    themes,
    byPhase: PHASES.map((phase) => ({ phase, readings: phaseCount.get(phase) ?? 0, top: topOf(phaseCards.get(phase)) })),
    byDay: WEEKDAYS.map((day, i) => ({ day, planet: dayRuler(new Date(2026, 0, 4 + i)).planet, readings: dayCount.get(i) ?? 0, top: topOf(dayCards.get(i)) })),
    streaks: { ...dayStreaks(sorted.map((e) => e.data.date), now), card: bestRun ? { ...bestRun, ref: refForDrawn(bestRun.name) } : null },
    notMet,
  };
}

/** Runs of days with a reading: the one going now (ending today or yesterday) and the longest. */
export function dayStreaks(dateKeys: string[], now: Date): Omit<Streaks, 'card'> {
  const days = [...new Set(dateKeys)].filter((k) => dateFromKey(k)).sort();
  let longest = 0;
  let longestEnd: string | null = null;
  let run = 0;
  let prev: Date | null = null;
  for (const key of days) {
    const day = dateFromKey(key)!;
    run = prev && Math.round((day.getTime() - prev.getTime()) / DAY_MS) === 1 ? run + 1 : 1;
    if (run > longest) [longest, longestEnd] = [run, key];
    prev = day;
  }
  const today = localDateKey(now);
  const yesterday = localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const last = days[days.length - 1];
  return { current: last === today || last === yesterday ? run : 0, longest, longestEnd, days: days.length };
}

/** A few plain sentences to open the page with. */
export function patternLines(p: Patterns): string[] {
  const out: string[] = [];
  if (!p.readings) return out;
  out.push(`${p.readings} ${p.readings === 1 ? 'reading' : 'readings'}, ${p.draws} ${p.draws === 1 ? 'card, rune or stave' : 'cards, runes and staves'} drawn.`);
  const first = p.top[0];
  if (first && first.count >= 2) out.push(`${first.name} has come most often: ${first.count} times${first.readings < first.count ? `, in ${first.readings} readings` : ''}.`);
  if (p.reversals && p.reversals.reversible >= 10) out.push(`${Math.round(p.reversals.share * 100)}% of your tarot and oracle cards came reversed.`);
  const phase = [...p.byPhase].sort((a, b) => b.readings - a.readings)[0];
  if (phase && phase.readings >= 3) out.push(`You draw most under the ${phase.phase}.`);
  if (p.streaks.current >= 2) out.push(`You’ve drawn ${p.streaks.current} days running.`);
  return out;
}

/** Where to learn each system, in the app and on the website. */
export const LEARN: Record<DivinationKind, { label: string; app: string; web: string; help: string }> = {
  tarot: { label: 'Learn the tarot: every card’s page', app: '/rituals/divination/meanings', web: '/grimoire/', help: 'divination-deck' },
  runes: { label: 'Learn the runes: every rune’s page', app: '/rituals/divination/meanings', web: '/grimoire/', help: 'practice-draw' },
  ogham: { label: 'Learn the ogham: every stave’s page', app: '/rituals/divination/meanings', web: '/grimoire/', help: 'practice-draw' },
  lenormand: { label: 'Learn the Lenormand: every card’s page', app: '/rituals/divination/meanings', web: '/grimoire/', help: 'divination-lenormand' },
  kipper: { label: 'Learn the Kipper: every card’s page', app: '/rituals/divination/meanings', web: '/grimoire/', help: 'divination-lenormand' },
};

export const ELEMENTS_NOTE =
  'The elements beside the suits are the Golden Dawn’s (Wands fire, Cups water, Swords air, Pentacles earth), the usual modern English reading; some readers swap Wands and Swords, and the Marseille and Sola Busca decks are older than that scheme.';

/** One card's own history in the log, for its page: how often, how often reversed, and the last reading it came in. */
export function cardHistory(list: ReadingEntry[], name: string): { count: number; reversed: number; readings: number; last: { id: string; date: string } | null } {
  let count = 0;
  let reversed = 0;
  let readings = 0;
  let last: { id: string; date: string } | null = null;
  for (const e of list) {
    const items = drawnItems(e.data).filter((i) => i.name === name);
    if (!items.length) continue;
    readings++;
    count += items.length;
    reversed += items.filter((i) => i.reversed).length;
    if (!last || e.data.date > last.date) last = { id: e.id, date: e.data.date };
  }
  return { count, reversed, readings, last };
}

const timesWord = (n: number) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`);

/** "You’ve drawn it 4 times in 3 readings, once reversed." or null when never. */
export function cardHistoryLine(h: ReturnType<typeof cardHistory>): string | null {
  if (!h.count) return null;
  return `You’ve drawn it ${timesWord(h.count)}${h.readings < h.count ? ` in ${h.readings} readings` : ''}${h.reversed ? `, ${timesWord(h.reversed)} reversed` : ''}.`;
}
