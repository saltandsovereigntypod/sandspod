// "The whole reading": a synthesis of a finished draw, assembled on the
// device from the card meanings already in the app. No randomness: the same
// draw always reads the same. Sections follow a modern way of reading.

import { meaningOf, placeOf, type Draw, type Position, type Spread } from './draw.ts';
import type { OwnDeckData } from './oracle/decks.ts';
import type { DeckId } from './decks.ts';
import type { TarotCard } from './tarot.ts';
import { readingFor, type CardReading } from './readings/index.ts';
import { answerLine, CLOSE, readTopicOf, firstSentence, hash, lc, LEAN_SCORE, looksYesNo, render, tidy, TONE } from './wholeCommon.ts';

import { composeOracle } from './wholeOracle.ts';
import { COURT_TITLE, ELEMENT, LENS, NUMBER_THEME, OPENERS, PAIRINGS, TOPIC_CUES, TOPIC_NAME, type LensGroup, type Topic } from './wholeReadingText.ts';

export { answerLine, looksYesNo, readTopicOf };

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

const ADVICE_POS = /action|advice|help|above|crown|aim|outcome|future|will come|before|guidance|best/i;


const OUTCOME_POS = /outcome|result|future|once|what will|advice/i;

type Read = { item: WholeItem; r: CardReading; w: number };

const cardLabel = (it: WholeItem) => {
  const n = it.card && it.card.arcana === 'minor' ? `The ${it.name}` : it.name;
  return it.reversed ? `${n} reversed` : n;
};



/** Builds the reading from drawn cards, already given their positions and meanings. */
export function composeReading(question: string, items: WholeItem[]): WholeReadingResult | null {
  const usable = items.filter((i) => i.keywords || i.text);
  if (!usable.length) return null;
  const topic = detectTopic(question);
  const reads: Read[] | null = usable.every((i) => i.card && readingFor(i.card.id, i.reversed))
    ? usable.map((item, i) => ({
        item,
        r: readingFor(item.card!.id, item.reversed)!,
        w: (item.position && OUTCOME_POS.test(item.position.name) ? 2 : 1) * (i === usable.length - 1 ? 1.5 : 1),
      }))
    : null;
  return reads ? composeTarot(question, topic, reads) : composeGeneric(question, topic, usable);
}

const IMPERATIVE = new Set('return find ask take pick let make keep try give set choose rest trust speak write plan start stop be do go seek hold practise practice light spend look notice call join clear protect book talk tell name commit release allow offer share listen check begin turn put use read stay say learn put focus add open bring reach send show slow wait accept forgive remember honour respect invest save sort tidy review decide reset stand walk drink eat sleep move cleanse ground put'.split(' '));

/** Splits a topic paragraph into its body and the last imperative sentence (a step to take), if there is one. */
export function splitStep(text: string): { body: string; step: string | null } {
  const sents = text.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g)?.map((x) => x.trim()) ?? [text];
  let at = -1;
  sents.forEach((x, i) => {
    if (IMPERATIVE.has((x.match(/^[A-Za-z]+/)?.[0] ?? '').toLowerCase())) at = i;
  });
  if (at < 0 || sents.length < 2) return { body: text, step: null };
  return { body: sents.filter((_, i) => i !== at).join(' '), step: sents[at] };
}

function composeTarot(question: string, topic: Topic, reads: Read[]): WholeReadingResult {
  const rt = readTopicOf(topic);
  const single = reads.length === 1;
  const general = rt === 'general';
  const patterns = patternLines(reads.map((x) => x.item)).slice(0, 2);
  const { line, lean } = answerLine(reads);
  const yn = looksYesNo(question);
  const power = (x: Read) => x.w * (Math.abs(LEAN_SCORE[x.r.lean]) + 0.1);
  let strongest = reads[0];
  for (const x of reads) if (power(x) >= power(strongest)) strongest = x;
  const why = `${cardLabel(strongest.item)} says ${lc(tidy(strongest.r.why))}.`;

  const opening: string[] = [];
  if (single) {
    if (general) {
      const topicText = strongest.r.topics[rt];
      opening.push(yn ? `${line} ${why} ${topicText}` : `${TONE[lean]} ${cardLabel(strongest.item)}: ${topicText}`);
    } else {
      const body = splitStep(strongest.r.topics[rt]).body;
      opening.push(`${yn ? line : TONE[lean]} ${cardLabel(strongest.item)} says ${lc(body)}`);
    }
  } else {
    opening.push(general ? (yn ? `${line} ${why}` : `${TONE[lean]} ${why}`) : `${yn ? line : TONE[lean]} ${cardLabel(strongest.item)} says ${lc(splitStep(strongest.r.topics[rt]).body)}`);
    if (patterns.length) opening.push(patterns.join(' '));
  }

  const story = single ? [] : reads.map((x) => `${x.item.position ? `${x.item.position.name}: ` : ''}${cardLabel(x.item)} — ${general ? x.r.topics[rt] : splitStep(x.r.topics[rt]).body}`);

  const outcome = [...reads].reverse().find((x) => x.item.position && OUTCOME_POS.test(x.item.position.name)) ?? reads[reads.length - 1];
  const stepOf = (x: Read) => (general ? null : splitStep(x.r.topics[rt]).step) ?? x.r.advice;
  const advice = [stepOf(outcome)];
  if (!single && stepOf(strongest) !== advice[0]) advice.push(stepOf(strongest));

  const sections: WholeSection[] = [
    { title: 'Opening', lines: opening },
    ...(story.length ? [{ title: 'The story', lines: story }] : []),
    { title: 'What it advises', lines: advice },
    { title: 'To close', lines: [CLOSE[lean](rt)] },
  ];
  return { topic, sections, text: render(sections) };
}

function composeGeneric(question: string, topic: Topic, usable: WholeItem[]): WholeReadingResult {
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
  return { topic, sections, text: render(sections) };
}

/** The whole reading for a draw: tarot, Lenormand, Kipper, playing cards, runes, ogham and decks of your own (anything with a meaning). Lenormand, Kipper and playing cards are read together in their own way (wholeOracle.ts). */
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
  if (items.length !== draw.items.length) return null;
  if (!deck && (spread.kind === 'lenormand' || spread.kind === 'kipper' || spread.kind === 'playing')) {
    const oracle = composeOracle(
      spread.kind,
      spread.id,
      question,
      detectTopic(question),
      items.map((it) => ({ name: it.name, reversed: it.reversed, position: it.position })),
    );
    if (oracle) return oracle;
  }
  return composeReading(question, items);
}
