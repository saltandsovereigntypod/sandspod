// The whole reading for Lenormand, Kipper and playing cards: the cards read
// together the way each deck is read, not one by one. Lenormand by pairs,
// lines, the centre of the box and, in the Grand Tableau, the houses and the
// cards round the Man or the Woman; Kipper outward from the main person,
// near and far; playing cards by the balance of colours and suits and by
// ranks that come up together. The per-card readings are in
// oracle/lenormandReadings.ts and oracle/kipperReadings.ts; playing cards
// use their own texts (oracle/playing.ts). No randomness: the same draw
// always reads the same. wholeReading.ts hands these decks here. Pure.

import type { Position } from './draw.ts';
import { KIPPER, kipperCard } from './oracle/kipper.ts';
import { kipperReading } from './oracle/kipperReadings.ts';
import { lenormandCard, LENORMAND } from './oracle/lenormand.ts';
import { lenormandReading } from './oracle/lenormandReadings.ts';
import { pairsForSpread, readPair } from './oracle/pairs.ts';
import { playingCard, type PlayingCard } from './oracle/playing.ts';
import type { CardReading, Lean, ReadTopic } from './readings/index.ts';
import { answerLine, CLOSE, lc, looksYesNo, readTopicOf, render, tidy, TONE } from './wholeCommon.ts';
import type { WholeReadingResult, WholeSection } from './wholeReading.ts';
import { TOPIC_NAME, type Topic } from './wholeReadingText.ts';

export type OracleKind = 'lenormand' | 'kipper' | 'playing';
export type OracleItem = { name: string; reversed: boolean; position: Position | null };

type Read = { item: OracleItem; r: CardReading; w: number; at: number };

const listOf = (xs: string[]) => (xs.length < 2 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** A Lenormand card in a sentence: "the Rider" ("Man" and "Woman" too: "the Woman"). */
const the = (name: string) => `the ${name}`;

// ------------------------------------------------------------------ playing cards as readings

const SUIT_LEAN: Record<string, Lean> = { hearts: 'yes', diamonds: 'yes', clubs: 'depends', spades: 'no', joker: 'depends' };
const SUIT_STEP: Record<string, string> = {
  hearts: 'Lead with feeling: say the kind thing, mend the friendship, look after home.',
  diamonds: 'Look to the practical side: money, news, paperwork and what things cost.',
  clubs: 'Put in the effort and use your friends; this is won by work.',
  spades: 'Go carefully and finish what has to be got through, without adding new burdens.',
  joker: 'Expect the unexpected and stay flexible.',
};
const softer: Record<Lean, Lean> = { yes: 'depends', depends: 'not-yet', 'not-yet': 'not-yet', no: 'no' };

/** A playing card as a written reading, from its own texts: suit sets the lean, reversed softens it. */
export function playingReading(card: PlayingCard, reversed: boolean): CardReading {
  const base = SUIT_LEAN[card.suit];
  const lean = reversed ? softer[base] : base;
  const m = reversed ? card.reversed : card.meaning;
  const gen = reversed ? `${m.text} ${card.reading.general}` : card.reading.general;
  return {
    lean,
    why: m.text.split(/(?<=\.)\s/)[0],
    advice: SUIT_STEP[card.suit],
    topics: { general: gen, love: card.reading.love, money: card.reading.money, health: gen, home: card.reading.love, spirit: gen },
  };
}

function readingOf(kind: OracleKind, it: OracleItem): CardReading | null {
  if (kind === 'lenormand') return lenormandReading(it.name);
  if (kind === 'kipper') return kipperReading(it.name);
  const pc = playingCard(it.name);
  return pc ? playingReading(pc, it.reversed) : null;
}

// ------------------------------------------------------------------ the grids

/** Row and column of a card in a Grand Tableau of `cols` across (Lenormand 8, with four beneath; Kipper 9). */
const cell = (i: number, cols: number) => ({ r: Math.floor(i / cols), c: i % cols });
const dist = (a: number, b: number, cols: number) => {
  const x = cell(a, cols);
  const y = cell(b, cols);
  return Math.max(Math.abs(x.r - y.r), Math.abs(x.c - y.c));
};

/** The card that stands for a topic in the Lenormand, as most readers use them. */
const LENORMAND_TOPIC_CARD: Partial<Record<ReadTopic, string>> = { love: 'Heart', money: 'Fish', health: 'Tree', home: 'House', spirit: 'Stars' };
const KIPPER_TOPIC_CARD: Partial<Record<ReadTopic, string>> = { love: 'Success in Love', money: 'Work', health: 'Short Illness', home: 'The House', spirit: 'Hope, Great Water' };

/** Which significator a question points to, by its pronouns; else the Woman (the querent's card by old convention when the reader is a woman). */
function significator(question: string, man: string, woman: string, names: string[]): string | null {
  const he = /\b(he|him|his|husband|boyfriend|father|son|brother)\b/i.test(question);
  const she = /\b(she|her|hers|wife|girlfriend|mother|daughter|sister)\b/i.test(question);
  const first = he && !she ? man : she && !he ? woman : null;
  if (first && names.includes(first)) return first;
  return names.includes(woman) ? woman : names.includes(man) ? man : null;
}

// ------------------------------------------------------------------ Lenormand

const LENORMAND_SOURCE =
  'A word on sources: the deck began as the Game of Hope, a board game published in Nuremberg around 1799 and credited to Johann Kaspar Hechtel, with a short fortune-telling use in its rules. It was sold under the name of the Paris fortune-teller Marie Anne Lenormand only after her death in 1843; there is no evidence she used it. Reading in pairs and in the Grand Tableau grew up afterwards, and readers today still differ on the details.';

function composeLenormand(spreadId: string, question: string, topic: Topic, reads: Read[]): WholeReadingResult {
  const rt = readTopicOf(topic);
  const names = reads.map((x) => x.item.name);
  const n = reads.length;
  const gt = spreadId === 'lenormand-grand-tableau';
  const box = spreadId === 'lenormand-box';
  const yn = looksYesNo(question);
  const opening: string[] = [];
  const middle: WholeSection[] = [];
  const advice: string[] = [];

  if (gt) {
    const who = significator(question, 'Man', 'Woman', names);
    const at = who ? names.indexOf(who) : -1;
    for (const x of reads) x.w = at < 0 ? 1 : x.at >= 32 ? 1.5 : dist(x.at, at, 8) <= 1 ? 2 : dist(x.at, at, 8) === 2 ? 1 : 0.4;
    const { line, lean } = answerLine(reads);
    opening.push(yn ? `${line} ${TONE[lean]}` : TONE[lean]);
    const lines: string[] = [];
    if (at >= 0 && at < 32) {
      const house = LENORMAND[at];
      lines.push(`${cap(the(who!))} lies in the House of the ${house.name}: ${lc(tidy(house.house))}. Read everything about ${who === 'Woman' ? 'her' : 'him'} through that.`);
      const near = reads.filter((x) => x.at !== at && x.at < 32 && dist(x.at, at, 8) === 1).map((x) => lenormandCard(x.item.name)!);
      if (near.length) lines.push(`Touching ${who === 'Woman' ? 'her' : 'him'}, and so closest to hand: ${listOf(near.map((c) => `${the(c.name)} (${c.noun.split(',')[0]})`))}.`);
      const col = at % 8;
      lines.push(col <= 1 ? `${cap(the(who!))} stands near the left edge, so the past weighs less than what lies ahead to the right.` : col >= 6 ? `${cap(the(who!))} stands near the right edge: the future is short in view, and much of the matter lies behind, to the left.` : `Behind ${who === 'Woman' ? 'her' : 'him'}, to the left, lies what is passing; ahead, to the right, what is coming.`);
      if (at < 8) lines.push('In the top row, the matter is on the mind and partly in your hands.');
      else if (at >= 24) lines.push('In the bottom row, the matter is underfoot: settled facts, or things you have to work with rather than change.');
    } else if (at >= 32) {
      lines.push(`${cap(the(who!))} falls among the four beneath the grid, the part many readers take as the outcome; read the whole as what leads ${who === 'Woman' ? 'her' : 'him'} there.`);
    }
    const tc = LENORMAND_TOPIC_CARD[rt];
    const ti = tc ? names.indexOf(tc) : -1;
    if (tc && ti >= 0 && ti < 32) {
      const close = at >= 0 && at < 32 ? dist(ti, at, 8) : null;
      lines.push(`For a question of ${TOPIC_NAME[topic]}, look to the ${tc}: it lies in the House of the ${LENORMAND[ti].name}, ${lc(tidy(LENORMAND[ti].house))}${close === null ? '' : close <= 1 ? ', right beside the significator, so it is pressing now' : close <= 3 ? ', within reach' : ', some way off, so later or less directly'}.`);
    }
    middle.push({ title: 'The houses', lines });
    const pairs = pairsForSpread(spreadId, names);
    if (pairs.length) middle.push({ title: 'Read in pairs', lines: pairs.map((p) => `${p.title}: ${p.known ? p.text.split('. ')[0] + '.' : p.gist}`) });
    const beneath = reads.filter((x) => x.at >= 32);
    if (beneath.length === 4) {
      const [a, b, c, d] = beneath.map((x) => x.item.name);
      const p1 = readPair(a, b)!;
      const p2 = readPair(c, d)!;
      middle.push({ title: 'The four beneath', lines: [`Many readers take the last four cards as where it is all heading. ${p1.title}: ${p1.gist} ${p2.title}: ${p2.gist}`] });
      advice.push(lenormandReading(d)!.advice);
    }
    const strong = reads.filter((x) => x.w >= 2).sort((a, b) => Math.abs(lean2(b.r.lean)) - Math.abs(lean2(a.r.lean)))[0];
    if (strong && !advice.includes(strong.r.advice)) advice.unshift(`${cap(the(strong.item.name))}: ${strong.r.advice}`);
    return finish(question, topic, rt, lean, opening, middle, advice, LENORMAND_SOURCE);
  }

  // Lines and the box.
  const centre = box ? 4 : n % 2 === 1 && n >= 3 ? (n - 1) / 2 : -1;
  for (const x of reads) x.w = x.at === centre ? 2 : x.at === n - 1 ? 1.5 : 1;
  const { line, lean } = answerLine(reads);
  const heart = centre >= 0 ? reads[centre] : reads[n - 1];
  const label = heart.item.position?.name;
  opening.push(`${yn ? line : TONE[lean]} ${cap(the(heart.item.name))}${label ? `, in ${lc(label)},` : ''} ${n === 1 ? 'answers' : 'sets the tone'}: ${lc(tidy(heart.r.why))}.`);
  if (n === 1) opening.push(heart.r.topics[rt]);

  if (n > 1) {
    const story = reads.map((x) => `${x.item.position ? `${x.item.position.name}: ` : ''}${cap(the(x.item.name))}. ${rt === 'general' ? lenormandCard(x.item.name)!.meaning.text : x.r.topics[rt]}`);
    middle.push({ title: 'The story', lines: story });
    const pairs = pairsForSpread(spreadId, names);
    const pairLines = pairs.map((p) => `${p.title}: ${p.known ? p.text.split('. ')[0] + '.' : p.gist}`);
    if (!box && n >= 3) {
      const m = readPair(names[0], names[n - 1])!;
      pairLines.push(`First and last, read as a pair: ${m.title}, ${lc(m.gist)}`);
    }
    if (box) {
      const corners = [0, 2, 6, 8].map((i) => lenormandCard(names[i])!);
      pairLines.push(`The four corners frame the matter: ${listOf(corners.map((c) => c.noun.split(',')[0]))}.`);
      const down = readPair(names[1], names[7]);
      if (down) pairLines.push(`Down the middle, above and below the heart: ${down.title}, ${lc(down.gist)}`);
    }
    if (pairLines.length) middle.push({ title: 'Read in pairs', lines: pairLines });
  }
  advice.push(heart.r.advice);
  const last = reads[n - 1];
  if (last !== heart && last.r.advice !== heart.r.advice) advice.push(last.r.advice);
  return finish(question, topic, rt, lean, opening, middle, advice, LENORMAND_SOURCE);
}

const lean2 = (l: Lean) => (l === 'yes' ? 1 : l === 'no' ? -1 : l === 'not-yet' ? -0.5 : 0);

// ------------------------------------------------------------------ Kipper

const KIPPER_SOURCE =
  'A word on sources: the Kipper cards were first printed in Germany in the 1890s; the story of a "Susanne Kipper" who made them can’t be traced, and the name may be a publisher’s. The deck is still read mainly in German-speaking countries, and readers differ on the finer points.';

function composeKipper(spreadId: string, question: string, topic: Topic, reads: Read[]): WholeReadingResult {
  const rt = readTopicOf(topic);
  const names = reads.map((x) => x.item.name);
  const n = reads.length;
  const yn = looksYesNo(question);
  const opening: string[] = [];
  const middle: WholeSection[] = [];
  const advice: string[] = [];
  const gt = spreadId === 'kipper-grand-tableau';
  const box = spreadId === 'kipper-nine';
  const man = 'Main Person (Man)';
  const woman = 'Main Person (Woman)';
  const who = significator(question, man, woman, names);
  const cols = gt ? 9 : box ? 3 : n;
  const at = who ? names.indexOf(who) : -1;

  if (at >= 0 && n > 1) {
    for (const x of reads) {
      const d = dist(x.at, at, cols);
      x.w = d === 0 ? 0.5 : d === 1 ? 2 : d === 2 ? 1 : 0.5;
    }
  } else {
    const centre = box ? 4 : n === 3 ? 1 : -1;
    for (const x of reads) x.w = x.at === centre ? 2 : x.at === n - 1 ? 1.5 : 1;
  }
  const { line, lean } = answerLine(reads.filter((x) => x.item.name !== who));
  const strongest = [...reads].filter((x) => x.item.name !== who).sort((a, b) => b.w - a.w || Math.abs(lean2(b.r.lean)) - Math.abs(lean2(a.r.lean)))[0] ?? reads[0];
  opening.push(`${yn ? line : TONE[lean]} ${strongest.item.name} carries the most weight: ${lc(tidy(strongest.r.why))}.`);
  if (n === 1) opening.push(strongest.r.topics[rt]);

  if (at >= 0 && n > 1) {
    const ring = (d: number) => reads.filter((x) => x.at !== at && dist(x.at, at, cols) === d).map((x) => x.item.name);
    const near = ring(1);
    const mid = ring(2);
    const far = reads.filter((x) => x.at !== at && dist(x.at, at, cols) >= 3).map((x) => x.item.name);
    const lines: string[] = [];
    lines.push(`Kipper is read outward from the main person, here ${who}${gt ? `, in house ${at + 1}, the house of ${KIPPER[at].name}` : ''}.`);
    if (near.length) lines.push(`Touching them, and acting now: ${listOf(near.map((x) => `${x} (${kipperCard(x)!.meaning.keywords.split(',')[0]})`))}.`);
    if (mid.length) lines.push(`A step away, coming soon or bearing less directly: ${listOf(mid)}.`);
    if (far.length && gt) lines.push(`Further off, later or of less weight: ${far.length} cards, among them ${listOf(far.slice(0, 4))}.`);
    const facing = at % cols;
    if (gt) lines.push(facing <= 1 ? 'With so little behind them on the left, the past has done its work; most of the matter lies ahead.' : facing >= cols - 2 ? 'Little lies ahead of them to the right: the matter is mostly in what has already happened.' : 'What lies to their left is passing; what lies to their right is on its way.');
    const tc = KIPPER_TOPIC_CARD[rt];
    const ti = tc ? names.indexOf(tc) : -1;
    if (tc && ti >= 0) {
      const d = dist(ti, at, cols);
      lines.push(`For ${TOPIC_NAME[topic]}, find ${tc}: ${d <= 1 ? 'it is right beside them, so it is close and pressing' : d === 2 ? 'it is a step away, so it is coming' : 'it is far off, so it is later, or less in their hands'}.`);
    }
    middle.push({ title: 'Near and far', lines });
    const touching = reads.filter((x) => x.at !== at && dist(x.at, at, cols) === 1);
    if (touching.length) middle.push({ title: 'The cards around them', lines: touching.slice(0, 4).map((x) => `${x.item.name}: ${x.r.topics[rt]}`) });
  } else if (n > 1) {
    middle.push({ title: 'The story', lines: reads.map((x) => `${x.item.position ? `${x.item.position.name}: ` : ''}${x.item.name}. ${x.r.topics[rt]}`) });
  }
  advice.push(strongest.r.advice);
  const last = reads[n - 1];
  if (n > 1 && last !== strongest && last.item.name !== who && last.r.advice !== strongest.r.advice) advice.push(last.r.advice);
  return finish(question, topic, rt, lean, opening, middle, advice, KIPPER_SOURCE);
}


// ------------------------------------------------------------------ playing cards

const RANK_WORD: Record<string, string> = { A: 'Aces', K: 'Kings', Q: 'Queens', J: 'Jacks', '10': 'Tens', '9': 'Nines', '8': 'Eights', '7': 'Sevens', '6': 'Sixes', '5': 'Fives', '4': 'Fours', '3': 'Threes', '2': 'Twos' };
/** Ranks that come up together, as one common strand of English and French card-reading has them. Traditions differ. */
const RANK_SETS: Record<string, [string, string]> = {
  A: ['News or a fresh start of some weight on its way.', 'Big news and big change: a turning point.'],
  K: ['Help or advice from people with standing.', 'Honours, influence and success through powerful people.'],
  Q: ['Women’s talk and company; gossip, or good friends.', 'A gathering of women, and much said, kind and unkind.'],
  J: ['Busy young people, quarrels or high spirits.', 'Noise and activity; a crowd, or a falling-out among friends.'],
  '10': ['A change in circumstances, often in money or work.', 'A complete change of circumstances.'],
  '9': ['Surprises and small strokes of luck.', 'Good fortune arriving from an unexpected side.'],
  '8': ['Short journeys and family comings and goings.', 'New ties forming; a busy family time.'],
  '7': ['Small contentment, and a few worries to sort.', 'A rival or difficulty, overcome with effort.'],
};

const PLAYING_SOURCE =
  'A word on sources: card-reading with ordinary packs is recorded in France from the 1770s, when Etteilla published a method for a piquet pack, and in English chapbooks of the 1800s. Meanings for each card, and for ranks that fall together, vary from book to book; these are commonly shared ones, not a single tradition.';

function composePlaying(question: string, topic: Topic, reads: Read[]): WholeReadingResult {
  const rt = readTopicOf(topic);
  const n = reads.length;
  const yn = looksYesNo(question);
  const cards = reads.map((x) => playingCard(x.item.name)!);
  for (const x of reads) x.w = x.at === n - 1 ? 1.5 : n === 9 && x.at === 4 ? 2 : 1;
  const { line, lean } = answerLine(reads);
  const opening: string[] = [];
  const key = n === 9 ? reads[4] : reads[n - 1];
  opening.push(`${yn ? line : TONE[lean]} The ${key.item.name}${key.item.reversed ? ' reversed' : ''} ${n === 1 ? 'answers' : 'sets the tone'}: ${lc(tidy(key.r.why))}.`);
  if (n === 1) opening.push(key.r.topics[rt]);

  const patterns: string[] = [];
  if (n >= 3) {
    const red = cards.filter((c) => c.suit === 'hearts' || c.suit === 'diamonds').length;
    const black = cards.filter((c) => c.suit === 'clubs' || c.suit === 'spades').length;
    if (red > black * 2) patterns.push(`Red cards outnumber black ${red} to ${black}: the old reading is a favourable spread, warm and open.`);
    else if (black > red * 2) patterns.push(`Black cards outnumber red ${black} to ${red}: effort and difficulty run through this, so go steadily.`);
    const bySuit = new Map<string, number>();
    for (const c of cards) if (c.suit !== 'joker') bySuit.set(c.suit, (bySuit.get(c.suit) ?? 0) + 1);
    const top = [...bySuit.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] * 2 > n) patterns.push(`${cap(top[0])} lead (${top[1]} of ${n}): ${{ hearts: 'feelings, home and the people you love are what this is really about', diamonds: 'money, news and practical matters carry it', clubs: 'work, effort and friends decide it', spades: 'there are obstacles to get through, and some endings' }[top[0]]}.`);
    const byRank = new Map<string, number>();
    for (const c of cards) if (c.suit !== 'joker') byRank.set(c.rank, (byRank.get(c.rank) ?? 0) + 1);
    for (const [rank, count] of byRank) {
      if (count < 3 || !RANK_SETS[rank]) continue;
      patterns.push(`${count === 3 ? 'Three' : 'Four'} ${RANK_WORD[rank]}: ${RANK_SETS[rank][count === 3 ? 0 : 1]}`);
    }
    const courts = cards.filter((c) => c.rank === 'K' || c.rank === 'Q' || c.rank === 'J');
    if (courts.length) patterns.push(`The court cards are people: ${listOf(courts.map((c) => `the ${c.name}`))}. Kings for men or people with authority, Queens for women, Jacks for the young or for news-bringers.`);
    if (cards.some((c) => c.suit === 'joker')) patterns.push('A joker in the spread: something wild or unplanned turns the matter.');
  }
  const middle: WholeSection[] = [];
  if (n > 1) middle.push({ title: 'The story', lines: reads.map((x) => `${x.item.position ? `${x.item.position.name}: ` : ''}The ${x.item.name}${x.item.reversed ? ' reversed' : ''}. ${x.r.topics[rt]}`) });
  if (patterns.length) middle.push({ title: 'Patterns', lines: patterns });
  const advice = [key.r.advice];
  return finish(question, topic, rt, lean, opening, middle, advice, PLAYING_SOURCE);
}

// ------------------------------------------------------------------ shared

function finish(question: string, topic: Topic, rt: ReadTopic, lean: Lean, opening: string[], middle: WholeSection[], advice: string[], source?: string): WholeReadingResult {
  const q = question.trim();
  if (q && topic !== 'general' && topic !== 'decision' && topic !== 'timing') opening.push(`This reads as a question about ${TOPIC_NAME[topic]}.`);
  const sections: WholeSection[] = [
    { title: 'Opening', lines: opening },
    ...middle,
    { title: 'What it advises', lines: [...new Set(advice)] },
    { title: 'To close', lines: [CLOSE[lean](rt), ...(source ? [source] : [])] },
  ];
  return { topic, sections, text: render(sections) };
}

/** The whole reading for a Lenormand, Kipper or playing-card draw; null if a card isn't one of the deck's. */
export function composeOracle(kind: OracleKind, spreadId: string, question: string, topic: Topic, items: OracleItem[]): WholeReadingResult | null {
  if (!items.length) return null;
  const reads: Read[] = [];
  for (let i = 0; i < items.length; i++) {
    const r = readingOf(kind, items[i]);
    if (!r) return null;
    reads.push({ item: items[i], r, w: 1, at: i });
  }
  if (kind === 'lenormand') return composeLenormand(spreadId, question, topic, reads);
  if (kind === 'kipper') return composeKipper(spreadId, question, topic, reads);
  return composePlaying(question, topic, reads);
}
