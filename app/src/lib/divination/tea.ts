// Reading a cup of tea leaves or coffee grounds (tasseography). You pick the
// shapes you see and where in the cup they lie; the reading composes from
// the symbol dictionary (teaSymbols.ts) and the place of each shape: near
// the rim is soon and near, the middle is developing, the bottom is later
// and distant; the handle side is you and home, the far side others and away.
// These are the conventions of the Victorian parlour guides, not an ancient
// rule, and the reading says so. Built on the shared engine in
// ../symbolReading.ts, so it is deterministic and never says a thing twice.
// Pure, so it can be tested.

import { composer, hash, joinNames, rotate, roundRobin, sentenceCase } from '../symbolReading.ts';
import { TEA_SYMBOLS, teaSymbolById, type TeaSymbol, type Tone } from './teaSymbols.ts';

export { TEA_SYMBOLS, teaSymbolById };
export type { TeaSymbol, Tone };

export type Depth = 'rim' | 'middle' | 'bottom';
export type Side = 'handle' | 'opposite' | 'between';

export const DEPTHS: { id: Depth; label: string; detail: string }[] = [
  { id: 'rim', label: 'Near the rim', detail: 'Soon and near: days to a couple of weeks' },
  { id: 'middle', label: 'In the middle', detail: 'Developing: weeks to a few months' },
  { id: 'bottom', label: 'At the bottom', detail: 'Later or far off: months, or a deep root' },
];
export const SIDES: { id: Side; label: string; detail: string }[] = [
  { id: 'handle', label: 'By the handle', detail: 'You and home' },
  { id: 'between', label: 'Round the sides', detail: 'Your wider circle' },
  { id: 'opposite', label: 'Opposite the handle', detail: 'Others, and away from home' },
];

export type Seen = { id: string; depth: Depth; side: Side };
export type CupInput = { question: string; seen: Seen[]; date: string; cup?: 'tea' | 'coffee' };

export type CupSymbol = { symbol: TeaSymbol; depth: Depth; side: Side; place: string; paragraphs: string[] };
export type CupSection = { id: 'opening' | 'symbols' | 'timing' | 'questions' | 'close'; title: string; paragraphs: string[] };
export type CupReading = { symbols: CupSymbol[]; sections: CupSection[]; lean: 'favourable' | 'mixed' | 'cautious' | 'open'; text: string };

/** Where a shape lies, in words: "near the rim, by the handle". */
export function placeWords(depth: Depth, side: Side): string {
  const d = depth === 'rim' ? 'near the rim' : depth === 'bottom' ? 'at the bottom' : 'in the middle of the cup';
  const s = side === 'handle' ? 'by the handle' : side === 'opposite' ? 'opposite the handle' : 'round the side';
  return `${d}, ${s}`;
}

/** How soon a depth reads as, in days, as a range (for timing and for tests). */
export const DEPTH_DAYS: Record<Depth, [number, number]> = { rim: [1, 14], middle: [14, 120], bottom: [120, 400] };

const WHEN: Record<Depth, string> = {
  rim: 'in the next few days or a couple of weeks',
  middle: 'over the coming weeks, a month or two out',
  bottom: 'later on: months ahead, perhaps most of a year, or a matter with deep roots',
};

const DEPTH_LINES: Record<Depth, string[]> = {
  rim: [
    'Lying so near the rim, it is close at hand: the matter of {theme} is for {when}.',
    'The rim is the nearest part of the cup, so the matter of {theme} is already stirring, and shows {when}.',
    'Up at the lip of the cup, the matter of {theme} is not far off: look for it {when}.',
  ],
  middle: [
    'In the belly of the cup it is still taking shape: the matter of {theme} is developing, and reads as {when}.',
    'The middle is the part in motion, so the matter of {theme} is building now and comes to a head {when}.',
    'Halfway down, the matter of {theme} is under way but not settled; expect to see it {when}.',
  ],
  bottom: [
    'Down at the bottom it is distant: the matter of {theme} belongs to {when}.',
    'The bottom of the cup holds what is slow and deep, so the matter of {theme} will be seen {when}.',
    'Settled in the dregs, the matter of {theme} is long in the making; readers would place it {when}.',
  ],
};

const SIDE_LINES: Record<Side, string[]> = {
  handle: [
    'The handle is you, so it touches you and your home directly.',
    'Beside the handle, it concerns you personally, close to home.',
    'Because it lies by the handle, read it as yours: your own doing or your own door.',
  ],
  opposite: [
    'Far from the handle, it belongs to other people or to somewhere away from home.',
    'On the side facing away from you, it is about someone else, or events further afield.',
    'Opposite the handle it is out of your hands: another person or another place carries it.',
  ],
  between: [
    'Along the side, it sits in your wider circle: friends, colleagues, the near edge of your life.',
    'Round the side of the cup, it reaches you through the people around you rather than directly.',
    'Neither by the handle nor against it, it is in the circle just beyond you.',
  ],
};

const LEADS = ['{Name}, {place}.', 'Look at the {name}, {place}.', 'There is a {name} {place}.', 'The {name} lies {place}.', 'Then the {name}, {place}.', 'And a {name}, {place}.'];
const OPENERS = [
  'Take the cup slowly and turn it three times; the shapes are best read before the leaves dry out.',
  'Look at the whole cup before the small things in it, and let your eye settle where it wants to.',
  'A cup is read from the rim down: first what is near, then what is on its way, then what is far.',
  'The handle is you. Hold the cup so it points toward you and read round from there.',
];
const CLOSES = [
  'Leaves are suggestion and not decree: take what rings true and leave the rest.',
  'None of this is fixed. A cup shows how things lean today, and you can lean against it.',
  'The reading is yours to finish: what does the cup remind you that you already knew?',
  'Write down what you saw tonight, and look again in a month to see what held.',
];
const CONVENTION = 'These readings follow the conventions of Victorian and Edwardian tea-cup guides, which readers have bent to suit themselves ever since; there is no ancient rule behind them.';

const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

const WEIGHT: Record<Tone, number> = { good: 1, mixed: 0, hard: -1 };

/** How the cup leans overall: the nearer, the heavier. */
export function leanOf(seen: { symbol: TeaSymbol; depth: Depth }[]): CupReading['lean'] {
  if (!seen.length) return 'open';
  const w: Record<Depth, number> = { rim: 1.5, middle: 1.2, bottom: 1 };
  const total = seen.reduce((n, s) => n + WEIGHT[s.symbol.tone] * w[s.depth], 0);
  const hard = seen.some((s) => s.symbol.tone === 'hard');
  const good = seen.some((s) => s.symbol.tone === 'good');
  if (total >= 1.5) return 'favourable';
  if (total <= -1.5) return 'cautious';
  return hard && good ? 'mixed' : total > 0 ? 'favourable' : total < 0 ? 'cautious' : 'mixed';
}

const LEAN_LINES: Record<CupReading['lean'], string> = {
  favourable: 'Taken together, the cup leans kindly: more of what it shows is friendly than hard, and the nearer shapes are among the kind ones.',
  mixed: 'Taken together, the cup is mixed: help and difficulty sit in the same cup, and which wins depends on what you do with each.',
  cautious: 'Taken together, the cup asks for care: more of what it shows is a warning than a welcome, which is useful to know before you act, not a verdict.',
  open: 'No shapes were picked, so the cup is left open; look again and note even the faintest.',
};

export function readCup(input: CupInput): CupReading {
  const seen = input.seen
    .map((s) => ({ symbol: teaSymbolById(s.id), depth: s.depth, side: s.side }))
    .filter((s): s is { symbol: TeaSymbol; depth: Depth; side: Side } => !!s.symbol);
  const seed = hash(`${input.date}|${input.question}|${seen.map((s) => `${s.symbol.id}${s.depth}${s.side}`).join(',')}`);
  const { fresh, para } = composer();
  const cup = input.cup === 'coffee' ? 'cup of grounds' : 'cup of leaves';
  const q = input.question.trim();

  const lean = leanOf(seen);
  const symbols: CupSymbol[] = seen.map((s, i) => {
    const place = placeWords(s.depth, s.side);
    const vars = { name: s.symbol.name.toLowerCase(), Name: s.symbol.name, place, theme: s.symbol.theme, when: WHEN[s.depth] };
    const lead = fill(rotate(LEADS, seed + i), vars);
    const depthLine = sentenceCase(fill(rotate(DEPTH_LINES[s.depth], seed + i), vars));
    const sideLine = rotate(SIDE_LINES[s.side], seed + i * 2);
    const caution =
      s.symbol.tone === 'hard' && s.depth === 'rim'
        ? 'A hard shape this near is a notice, not a sentence: you have time to meet it.'
        : s.symbol.tone === 'hard' && s.depth === 'bottom'
          ? 'A hard shape this far down has time to soften before it arrives.'
          : undefined;
    return { symbol: s.symbol, depth: s.depth, side: s.side, place, paragraphs: [para(lead, s.symbol.meaning), para(depthLine, sideLine, caution)].filter(Boolean) };
  });

  const opening = [
    para(rotate(OPENERS, seed)),
    q ? para(`You asked: ${q.replace(/[?.\s]+$/, '')}?`) : para(`No question was set, so this reads the ${cup} as a whole.`),
    symbols.length ? para(`${sentenceCase(joinNames(symbols.map((s) => s.symbol.name.toLowerCase())))} ${symbols.length === 1 ? 'is' : 'are'} what you found.`) : '',
    para(LEAN_LINES[lean]),
  ].filter(Boolean);

  // Timing: nearest first, with clusters and the way the cup moves from rim to bottom.
  const timing: string[] = [];
  for (const d of DEPTHS) {
    const here = symbols.filter((s) => s.depth === d.id);
    if (!here.length) continue;
    const names = joinNames(here.map((s) => s.symbol.name.toLowerCase()));
    timing.push(para(`${sentenceCase(d.label.toLowerCase())}: ${names}. ${d.detail}.`));
    if (here.length >= 3) timing.push(para(`Three or more shapes crowd ${d.label.toLowerCase()}, so that stretch of time is a busy one.`));
  }
  const first = symbols.find((s) => s.depth === 'rim');
  const last = [...symbols].reverse().find((s) => s.depth === 'bottom');
  if (first && last && first.symbol.tone === 'hard' && last.symbol.tone === 'good') timing.push(para('A difficulty near the rim giving way to something kind at the bottom is the old pattern of a rough start that settles.'));
  if (first && last && first.symbol.tone === 'good' && last.symbol.tone === 'hard') timing.push(para('Something kind at the rim with a hard shape at the bottom says to enjoy the nearer gain without building on it too heavily.'));
  const away = symbols.filter((s) => s.side === 'opposite').length;
  const home = symbols.filter((s) => s.side === 'handle').length;
  if (away > home && away >= 2) timing.push(para('Most shapes lie away from the handle, so this turns more on other people and events than on you.'));
  else if (home > away && home >= 2) timing.push(para('Most shapes lie by the handle, so much of this is in your own hands and your own household.'));

  const questions = roundRobin(
    symbols.map((s) => [s.symbol.question]),
    seed,
    3,
    fresh,
  );
  const close = [para(rotate(CLOSES, seed >>> 3)), para(CONVENTION)].filter(Boolean);

  const sections: CupSection[] = [
    { id: 'opening', title: 'Opening', paragraphs: opening },
    ...(symbols.length ? [{ id: 'symbols' as const, title: 'The shapes', paragraphs: [] }] : []),
    ...(timing.length ? [{ id: 'timing' as const, title: 'When', paragraphs: timing }] : []),
    ...(questions.length ? [{ id: 'questions' as const, title: 'Questions to sit with', paragraphs: questions }] : []),
    { id: 'close', title: 'Close', paragraphs: close },
  ];
  return { symbols, sections, lean, text: renderSections(sections, symbols) };
}

/** A reading as plain text, with the shapes under their section. */
export function renderSections(sections: { id: string; title: string; paragraphs: string[] }[], symbols: { symbol: { name: string }; paragraphs: string[] }[]): string {
  const lines: string[] = [];
  for (const s of sections) {
    lines.push(s.title.toUpperCase());
    if (s.id === 'symbols') for (const sym of symbols) lines.push(`${sym.symbol.name}\n${sym.paragraphs.join('\n')}`);
    else if (s.id === 'questions') lines.push(...s.paragraphs.map((q) => `- ${q}`));
    else lines.push(...s.paragraphs);
    lines.push('');
  }
  return lines.join('\n').trim();
}
