// "The whole reading": a synthesis of a finished draw, assembled on the
// device from the card meanings already in the app. No randomness: the same
// draw always reads the same. Sections follow a modern way of reading.

import { meaningOf, placeOf, type Draw, type Position, type Spread } from './draw.ts';
import type { OwnDeckData } from './oracle/decks.ts';
import type { DeckId } from './decks.ts';
import type { TarotCard } from './tarot.ts';
import { COURT_TITLE, ELEMENT, LENS, NUMBER_THEME, OPENERS, PAIRINGS, TOPIC_CUES, TOPIC_NAME, type LensGroup, type Topic } from './wholeReadingText.ts';

export type WholeItem = {
  name: string;
  reversed: boolean;
  position: Position | null;
  keywords: string;
  text: string;
  card: TarotCard | null;
};
export type WholeSection = { title: string; lines: string[] };
export type WholeReadingResult = { topic: Topic; sections: WholeSection[]; text: string };

export function detectTopic(question: string): Topic {
  const q = question.trim();
  if (!q) return 'general';
  return TOPIC_CUES.find((c) => c.re.test(q))?.topic ?? 'general';
}

const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const rankOf = (c: TarotCard) => c.name.split(' ')[0];
/** 1 to 10 for a numbered minor; null for the majors and courts. */
export const numberOf = (c: TarotCard): number | null => {
  const i = c.arcana === 'minor' ? RANKS.indexOf(rankOf(c)) : -1;
  return i < 0 ? null : i + 1;
};
const courtOf = (c: TarotCard): string | null => (c.arcana === 'minor' && COURT_TITLE[rankOf(c)] ? rankOf(c) : null);
const groupOf = (c: TarotCard): LensGroup => (c.arcana === 'major' || !c.suit ? 'major' : c.suit);

export type SpreadStats = {
  total: number;
  majors: number;
  suits: Record<'Cups' | 'Wands' | 'Swords' | 'Pentacles', number>;
  reversed: number;
  numbers: Record<number, number>;
  courts: { name: string; rank: string }[];
};

export function countPatterns(items: WholeItem[]): SpreadStats {
  const s: SpreadStats = { total: items.length, majors: 0, suits: { Cups: 0, Wands: 0, Swords: 0, Pentacles: 0 }, reversed: 0, numbers: {}, courts: [] };
  for (const it of items) {
    if (it.reversed) s.reversed++;
    const c = it.card;
    if (!c) continue;
    if (c.arcana === 'major') s.majors++;
    else if (c.suit) s.suits[c.suit]++;
    const n = numberOf(c);
    if (n) s.numbers[n] = (s.numbers[n] ?? 0) + 1;
    const court = courtOf(c);
    if (court) s.courts.push({ name: c.name, rank: court });
  }
  return s;
}

const listOf = (xs: string[]) => (xs.length < 2 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

type SuitName = keyof SpreadStats['suits'];
const rankedSuits = (s: SpreadStats) => (Object.entries(s.suits) as [SuitName, number][]).sort((a, b) => b[1] - a[1]);

/** Short, meaningful lines about the spread as a whole. Says little without two or more tarot cards. */
export function patternLines(items: WholeItem[]): string[] {
  const s = countPatterns(items);
  const tarot = items.filter((i) => i.card).length;
  if (tarot < 2) return [];
  const out: string[] = [];
  if (s.majors * 2 >= tarot && tarot >= 3) out.push(`${s.majors} of ${tarot} cards are Major Arcana: a big life lesson, with forces beyond your day-to-day control at work.`);
  else if (s.majors === 0 && tarot >= 4) out.push('No Major Arcana at all: this is an everyday matter, within your own reach to shape.');
  const suitEntries = rankedSuits(s);
  const [topSuit, topCount] = suitEntries[0];
  const tied = suitEntries.filter(([, n]) => n === topCount).length > 1;
  if (topCount >= 2 && !tied) out.push(`${topSuit} lead (${topCount}), the element of ${ELEMENT[topSuit].word}: ${ELEMENT[topSuit].theme}.`);
  if (tarot >= 5 && s.majors * 2 < tarot) for (const [suit, n] of suitEntries) if (n === 0) out.push(`No ${suit}: ${ELEMENT[suit].absent}.`);
  if (s.reversed >= 2 && s.reversed * 2 >= items.length) out.push(`${s.reversed} of ${items.length} cards are reversed: energy that is blocked, turned inward or delayed, so go gently and expect it to take time.`);
  else if (s.reversed === 0 && items.length >= 4) out.push('Every card is upright: things are flowing outwardly and openly.');
  for (const [n, count] of Object.entries(s.numbers)) {
    if (count < 2) continue;
    out.push(`${count === 2 ? 'A pair' : count === 3 ? 'Three' : `${count}`} of ${RANKS[Number(n) - 1]}s: ${NUMBER_THEME[Number(n)]} recur${count === 2 ? 's' : ''}.`);
  }
  if (s.courts.length) out.push(`Court cards (${listOf(s.courts.map((c) => c.name))}) point to people involved: ${listOf(s.courts.map((c) => COURT_TITLE[c.rank]))}.`);
  const names = new Set(items.map((i) => i.name));
  for (const p of PAIRINGS) if (names.has(p.a) && names.has(p.b)) out.push(p.line);
  return out;
}

const hash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
};
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const tidy = (s: string) => s.trim().replace(/[.\s]+$/, '');
const firstSentence = (s: string) => {
  const m = s.match(/^.*?[.!?](?=\s|$)/);
  return (m ? m[0] : s).trim();
};
const ADVICE_POS = /action|advice|help|above|crown|aim|outcome|future|will come|before|guidance|best/i;

/** Builds the reading from drawn cards, already given their positions and meanings. */
export function composeReading(question: string, items: WholeItem[]): WholeReadingResult | null {
  const usable = items.filter((i) => i.keywords || i.text);
  if (!usable.length) return null;
  const topic = detectTopic(question);
  const single = usable.length === 1;
  const q = question.trim();
  const patterns = patternLines(usable);

  const opening: string[] = [];
  opening.push(q ? `You asked: ${q.endsWith('?') ? q : `${q}.`}` : 'You came without a spoken question, so the cards speak to what is most alive for you now.');
  if (q && topic !== 'general') opening.push(`This sounds like a question about ${TOPIC_NAME[topic]}, so each card is read through that lens.`);
  opening.push(patterns[0] ?? (single ? 'One card, so one clear thread to follow.' : 'The cards are read in their places, one after another.'));

  const seed = hash(q + usable.map((i) => i.name + (i.reversed ? 'r' : '')).join('|'));
  const story: string[] = usable.map((it, i) => {
    const pos = it.position;
    const label = it.reversed ? `${it.name} reversed` : it.name;
    const kw = tidy(it.keywords) || lc(tidy(firstSentence(it.text)));
    const opener = single || !pos ? `${label} speaks of ${kw}.` : OPENERS[(seed + i) % OPENERS.length](pos.name, lc(tidy(pos.about)), label, kw);
    const lens = it.card ? ` Read as ${it.reversed ? 'a held-back or inward energy' : 'an open energy'}, ${LENS[topic][groupOf(it.card)]}.` : '';
    const body = it.text ? ` ${firstSentence(it.text)}` : '';
    return opener + lens + body;
  });

  const picks = usable.filter((it) => it.position && ADVICE_POS.test(it.position.name));
  const adviceItems = picks.length ? picks.slice(-2) : [usable[usable.length - 1]];
  const advice = adviceItems.map((it) => {
    const label = it.reversed ? `${it.name} reversed` : it.name;
    return `Take ${label} as your guide here: ${tidy(it.keywords) || lc(tidy(firstSentence(it.text)))}.`;
  });
  const s = countPatterns(usable);
  const top = rankedSuits(s)[0];
  if (top[1] >= 2) advice.push(`With ${ELEMENT[top[0]].word} so present, give weight to ${ELEMENT[top[0]].theme}.`);
  if (s.reversed >= 2 && s.reversed * 2 >= usable.length) advice.push('Where cards are reversed, slow down and look inward before acting.');

  const closing = single
    ? 'Take the card with you today and notice where it shows up.'
    : 'The cards show tendencies, not fixed fates. Take what rings true, leave the rest, and decide for yourself.';

  const sections: WholeSection[] = [
    { title: 'Opening', lines: opening },
    { title: 'The story', lines: story },
    ...(single || patterns.length < 2 ? [] : [{ title: 'Patterns', lines: patterns.slice(1) }]),
    { title: 'What it advises', lines: advice },
    { title: 'To close', lines: [closing] },
  ];
  const text = ['The whole reading', ...sections.map((sec) => `${sec.title}\n${sec.lines.join(sec.title === 'The story' ? '\n\n' : '\n')}`)].join('\n\n');
  return { topic, sections, text };
}

/** The whole reading for a draw: tarot, Lenormand, Kipper, runes, ogham and decks of your own (anything with a meaning). */
export function wholeReading(
  spread: Spread,
  draw: Draw,
  { question = '', deck, tarotDeck }: { question?: string; deck?: OwnDeckData | null; tarotDeck?: DeckId | null } = {},
): WholeReadingResult | null {
  const items: WholeItem[] = [];
  draw.items.forEach((d, i) => {
    const m = meaningOf(d, deck, tarotDeck);
    if (!m) return;
    items.push({ name: m.name, reversed: m.reversed, position: spread.positions.length > 1 ? placeOf(spread, draw, i) : null, keywords: m.meaning.keywords, text: m.meaning.text, card: m.card });
  });
  return items.length === draw.items.length ? composeReading(question, items) : null;
}
