// The Dream reader: finds the symbols in a dream's words, weighs how it felt,
// names the kind of dream, and composes a reading from the symbol dictionary
// (./symbols). Deterministic (no AI): the same dream always reads the same.
// Pure, so it can be tested.

import { SYMBOLS as ANIMALS } from './symbols/animals-body-actions.ts';
import { SYMBOLS as NATURE } from './symbols/nature-places.ts';
import { SYMBOLS as PEOPLE } from './symbols/people-objects-spirit.ts';
import { composer, hash, joinNames, roundRobin, stem, stems, tokens } from '../symbolReading.ts';
import type { DreamSymbol, Feeling } from './symbols/types.ts';
import { DREAM_SYMBOLS as STARTERS } from '../craft/hedge/dreamSymbols.ts';

export { stem, tokens };

export type { DreamSymbol, Feeling };

export const ALL_SYMBOLS: DreamSymbol[] = [...NATURE, ...ANIMALS, ...PEOPLE];
export const FEELINGS: Feeling[] = ['fear', 'calm', 'joy', 'sad', 'anger', 'confused'];
export const DICTIONARY = 'dreams.dictionary';

// ───────────────────────── Personal dictionary ─────────────────────────

/** One of the person's own meanings: for a built-in symbol, or a symbol of their own. */
export type DictionaryEntry = {
  /** The word they dream it as ("cats", "the red door"). */
  word: string;
  /** Other words for the same thing. */
  also: string[];
  /** What it means to them. */
  meaning: string;
  /** The built-in symbol this overrides, if they chose one. */
  symbolId?: string;
};

export function normalizeDictionaryEntry(raw: unknown): DictionaryEntry {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Partial<DictionaryEntry>;
  return {
    word: typeof d.word === 'string' ? d.word.trim().toLowerCase() : '',
    also: Array.isArray(d.also) ? d.also.filter((w): w is string => typeof w === 'string').map((w) => w.trim().toLowerCase()).filter(Boolean) : [],
    meaning: typeof d.meaning === 'string' ? d.meaning.trim() : '',
    symbolId: typeof d.symbolId === 'string' && d.symbolId ? d.symbolId : undefined,
  };
}

// ───────────────────────────── Matching ─────────────────────────────


/** What the matcher knows: built-in symbols and the person's own, by stemmed phrase. */
export type Subject = {
  key: string;
  name: string;
  symbol?: DreamSymbol;
  /** The person's own meaning, shown first. */
  personal?: string;
};
type Index = { phrases: Map<string, Subject>; maxLen: number };

export function buildIndex(dictionary: DictionaryEntry[] = []): Index {
  const phrases = new Map<string, Subject>();
  let maxLen = 1;
  const add = (phrase: string, subject: Subject, force: boolean) => {
    const parts = stems(phrase);
    if (!parts.length) return;
    const key = parts.join(' ');
    if (force || !phrases.has(key)) phrases.set(key, subject);
    maxLen = Math.max(maxLen, parts.length);
  };
  const subjects = new Map<string, Subject>();
  for (const symbol of ALL_SYMBOLS) {
    const subject: Subject = { key: symbol.id, name: symbol.name, symbol };
    subjects.set(symbol.id, subject);
    for (const w of symbol.words) add(w, subject, false);
  }
  for (const entry of dictionary) {
    if (!entry.word || !entry.meaning) continue;
    const words = [entry.word, ...entry.also];
    let base = entry.symbolId ? subjects.get(entry.symbolId) : undefined;
    if (!base) base = words.map((w) => phrases.get(stems(w).join(' '))).find(Boolean);
    const subject: Subject = base
      ? { ...base, personal: entry.meaning }
      : { key: `own:${entry.word}`, name: entry.word.replace(/^./, (c) => c.toUpperCase()), personal: entry.meaning };
    for (const w of words) add(w, subject, true);
  }
  return { phrases, maxLen };
}

let defaultIndex: Index | null = null;

export type SymbolMatch = {
  subject: Subject;
  count: number;
  /** Token position of the first mention. */
  first: number;
  /** The longest phrase that matched, in words. */
  longest: number;
  /** The words as the dreamer wrote them. */
  said: string;
  score: number;
};

/**
 * Symbols found in a dream, best first. Longer phrases win over single words,
 * a word is only ever matched once, and the score weighs how often it
 * appears, how early, and how specific the phrase was.
 */
export function matchSymbols(text: string, dictionary: DictionaryEntry[] = []): SymbolMatch[] {
  const index = dictionary.length ? buildIndex(dictionary) : (defaultIndex ??= buildIndex());
  const raw = tokens(text);
  const st = raw.map(stem);
  const found = new Map<string, SymbolMatch>();
  for (let i = 0; i < st.length; ) {
    let hit: Subject | undefined;
    let len = 0;
    for (let l = Math.min(index.maxLen, st.length - i); l >= 1; l--) {
      const subject = index.phrases.get(st.slice(i, i + l).join(' '));
      if (subject) {
        hit = subject;
        len = l;
        break;
      }
    }
    // A feeling word ("scared") is never also a symbol ("scar").
    if (hit && len === 1 && FEELING_INDEX.has(st[i])) hit = undefined;
    if (!hit) {
      i++;
      continue;
    }
    const have = found.get(hit.key);
    if (have) {
      have.count++;
      have.longest = Math.max(have.longest, len);
    } else found.set(hit.key, { subject: hit, count: 1, first: i, longest: len, said: raw.slice(i, i + len).join(' '), score: 0 });
    i += len;
  }
  const total = Math.max(1, st.length);
  const list = [...found.values()];
  for (const m of list) {
    m.score = m.count * 2 + (1 - m.first / total) * 1.5 + (m.longest - 1) + (m.subject.personal ? 3 : 0);
  }
  return list.sort((a, b) => b.score - a.score || a.first - b.first || a.subject.key.localeCompare(b.subject.key));
}

// ───────────────────────────── Feelings ─────────────────────────────

const FEELING_WORDS: Record<Feeling, string> = {
  fear: 'afraid scared terrified frightened fear fearful panic panicked dread terror horror anxious fright petrified creepy uneasy nightmare screaming trapped threatened',
  calm: 'calm peaceful peace safe serene comforted comforting comfort gentle soothing relaxed quiet tranquil warm content reassured protected',
  joy: 'happy joy joyful delighted laughing laughed excited wonderful glad thrilled blissful elated loved beautiful cheerful',
  sad: 'sad crying cried grief grieving missed miss lonely tears sorrow heartbroken weeping mourning grieved',
  anger: 'angry furious rage mad shouting shouted hate hated annoyed resentful livid screamed',
  confused: 'confused strange odd weird puzzled unsure bewildered unclear baffled disorienting disoriented muddled',
};
const FEELING_INDEX = new Map<string, Feeling>();
for (const f of FEELINGS) for (const w of FEELING_WORDS[f].split(' ')) FEELING_INDEX.set(stem(w), f);

/** What a negated feeling most often turns into ("not scared" is calm). */
const NEGATED: Record<Feeling, Feeling> = { fear: 'calm', sad: 'calm', anger: 'calm', confused: 'calm', joy: 'sad', calm: 'fear' };
const NEGATORS = new Set(['not', 'no', 'never', 'without', 'hardly', 'barely', 'nothing', 'neither', 'nor']);
const isNegator = (t: string) => NEGATORS.has(t) || /n't$/.test(t);

export type FeelingScores = Record<Feeling, number>;

/** How strongly each feeling is in the words, with negation read ("I wasn't scared" counts towards calm). */
export function feelingScores(text: string): FeelingScores {
  const raw = tokens(text);
  const out: FeelingScores = { fear: 0, calm: 0, joy: 0, sad: 0, anger: 0, confused: 0 };
  raw.forEach((t, i) => {
    const f = FEELING_INDEX.get(stem(t));
    if (!f) return;
    const negated = raw.slice(Math.max(0, i - 3), i).some(isNegator);
    out[negated ? NEGATED[f] : f] += 1;
  });
  return out;
}

const TIE_ORDER: Feeling[] = ['fear', 'sad', 'anger', 'joy', 'confused', 'calm'];

/**
 * The feeling that leads: the person's own pick (weighted heavily) plus the
 * words; with nothing to go on, confused for a strange or muddled dream and
 * calm otherwise.
 */
export function dominantFeeling(text: string, mood?: Feeling | '' | null, extra = ''): { feeling: Feeling; scores: FeelingScores } {
  const scores = feelingScores(`${text} ${extra}`);
  if (mood) scores[mood] += 3;
  const top = [...TIE_ORDER].sort((a, b) => scores[b] - scores[a])[0];
  if (scores[top] > 0) return { feeling: top, scores };
  const feeling: Feeling = /\b(strange|odd|weird|somehow|didn't make sense|didn't know|couldn't tell|was it|\?)/i.test(text) ? 'confused' : 'calm';
  return { feeling, scores };
}

// ───────────────────────────── Dream types ─────────────────────────────

export type DreamType = 'nightmare' | 'recurring' | 'lucid' | 'visitation' | 'deity' | 'prophetic';

export type PastDream = { id: string; date: string; symbolKeys: string[] };
export type LibraryRef = { id: string; name: string; type: string };

export type TypeInput = {
  text: string;
  date: string;
  feeling: Feeling;
  scores: FeelingScores;
  matches: SymbolMatch[];
  id?: string;
  /** The person's own marks on the entry. */
  flags?: { lucid?: boolean; recurring?: boolean; prophetic?: boolean };
  past?: PastDream[];
  deityNames?: string[];
};

const dayNumber = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round(Date.UTC(y, (m || 1) - 1, d || 1) / 86400000);
};

export function detectTypes(i: TypeInput): DreamType[] {
  const t = i.text.toLowerCase().replace(/[‘’]/g, "'");
  const keys = new Set(i.matches.map((m) => m.subject.key));
  const types: DreamType[] = [];

  if (i.feeling === 'fear' && i.scores.fear >= 2) types.push('nightmare');

  const recent = (i.past ?? []).filter((p) => p.id !== i.id && Math.abs(dayNumber(i.date) - dayNumber(p.date)) <= 60 && dayNumber(p.date) <= dayNumber(i.date));
  if (i.flags?.recurring || recent.some((p) => p.symbolKeys.filter((k) => keys.has(k)).length >= 2)) types.push('recurring');

  if (i.flags?.lucid || /\b(knew|realis(?:ed|e)|realiz(?:ed|e)|aware|noticed) (?:that )?(?:i was|it was|this was|it's|i'm) (?:only )?(?:a )?(?:dream|dreaming)|lucid|aware i was dreaming/.test(t)) types.push('lucid');

  const dead = keys.has('dead-loved-one') || keys.has('ghost') || /\b(ancestors?|passed away|passed on|late (?:mother|father|grand\w+)|died|dead)\b/.test(t);
  const presence = /(was there with me|came to (?:see )?me|visit(?:ed|ing)? me|watching over|sat with me|spoke to me|talked to me)/.test(t);
  if ((dead || (/\b(grand(?:mother|father|ma|pa|parents?)|nan|nana|granny)\b/.test(t) && presence)) && (i.feeling === 'calm' || i.feeling === 'joy')) types.push('visitation');

  const named = (i.deityNames ?? []).some((n) => n.length > 3 && new RegExp(`\\b${escapeRe(n.toLowerCase())}\\b`).test(t));
  if (named || keys.has('deity') || keys.has('animal-guide') || /\b(goddess|god|spirit guide|animal guide|higher power)\b/.test(t)) types.push('deity');

  if (i.flags?.prophetic || keys.has('prophetic-dream') || /(felt real|felt so real|vivid|premonition|foretold|knew it would happen|a warning)/.test(t)) types.push('prophetic');
  return types;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ───────────────────────────── Library links ─────────────────────────────

/** Library entries (herbs, crystals, deities, tools) a dream names, in the order they appear. */
export function libraryMentions(text: string, entries: LibraryRef[], limit = 6): LibraryRef[] {
  const t = text.toLowerCase().replace(/[‘’]/g, "'");
  const found: { at: number; ref: LibraryRef }[] = [];
  const seen = new Set<string>();
  for (const ref of entries) {
    const name = ref.name.toLowerCase().replace(/\(.*?\)/g, '').trim();
    if (name.length < 4 || seen.has(name)) continue;
    const m = new RegExp(`\\b${escapeRe(name)}(?:s|es)?\\b`).exec(t);
    if (m) {
      seen.add(name);
      found.push({ at: m.index, ref });
    }
  }
  return found.sort((a, b) => a.at - b.at).slice(0, limit).map((f) => f.ref);
}

// ───────────────────────────── Moon ─────────────────────────────

export type NightMoon = { phase: string; sign: string };

const PHASE_LINES: Record<string, string> = {
  'New Moon': 'A new moon is the dark of the cycle, when the sky gives no light and the inner world often speaks louder. Dreams under it are traditionally seen as seeds.',
  'Waxing Crescent': 'A waxing crescent is a moon of beginnings and intentions, so a dream under it can point at something just starting to take shape.',
  'First Quarter': 'The first quarter is a moon of decisions and friction, so a dream under it may be circling a choice you are close to making.',
  'Waxing Gibbous': 'A waxing gibbous moon is building towards fullness; dreams under it often carry the pressure of something nearly ready.',
  'Full Moon': 'The full moon is the brightest night of the month, and the old belief is that dreams under it run vivid, revealing and a little louder than usual.',
  'Waning Gibbous': 'A waning gibbous moon is a moon of sharing and gratitude, when what has been revealed is being taken in.',
  'Last Quarter': 'The last quarter is a moon of release, so a dream under it may show what you are ready to put down.',
  'Waning Crescent': 'A waning crescent is the quiet, tired end of the cycle, a time for rest and for letting things go, and dreams under it can be soft and hard to hold.',
};
const SIGN_ELEMENT: Record<string, string> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};
const ELEMENT_LINES: Record<string, string> = {
  fire: 'colours the night with drive and urgency',
  earth: 'steadies the night and turns attention to the body, home and what is practical',
  air: 'sets the mind moving, so thoughts, words and messages may feature',
  water: 'opens the night to feeling, memory and the things that are hard to say plainly',
};

// ───────────────────────────── Reading ─────────────────────────────

export type ReadingSymbol = {
  key: string;
  name: string;
  symbol?: DreamSymbol;
  personal?: string;
  said: string;
  count: number;
  paragraphs: string[];
};
export type ReadingSection = { id: 'opening' | 'symbols' | 'night' | 'questions' | 'do' | 'close'; title: string; paragraphs: string[] };
export type ReadingAction = { text: string; label?: string; href?: string };

export type Reading = {
  feeling: Feeling;
  types: DreamType[];
  symbols: ReadingSymbol[];
  /** Further symbols found, past the cap. */
  also: string[];
  library: LibraryRef[];
  sections: ReadingSection[];
  action: ReadingAction;
  /** When to look back at a possibly prophetic dream, "YYYY-MM-DD". */
  checkBack?: string;
  /** The reading as plain text, for keeping. */
  text: string;
};

export type ReadInput = {
  text: string;
  /** The morning it was written, "YYYY-MM-DD". */
  date: string;
  id?: string;
  mood?: Feeling | '' | null;
  feelingsNote?: string;
  flags?: { lucid?: boolean; recurring?: boolean; prophetic?: boolean };
  moon?: NightMoon;
  dictionary?: DictionaryEntry[];
  past?: PastDream[];
  library?: LibraryRef[];
};

export const MAX_SYMBOLS = 6;

const OPENERS: Record<Feeling, string[]> = {
  fear: [
    'This is a dream with fear in it, and that is worth taking seriously without reading doom into it.',
    'Fear runs through this dream, which usually means something real is asking for your attention.',
    'There is a tight, alert edge to this dream, the kind that comes when something feels at stake.',
  ],
  calm: [
    'This is a calm dream, and the quiet of it matters as much as anything that happens.',
    'A settled feeling holds this dream, even where the pictures are strange.',
    'There is a steadiness in this dream; it seems to be showing you something rather than warning you of it.',
  ],
  joy: [
    'This dream has real warmth in it, and it is worth keeping hold of that.',
    'Lightness runs through this dream, which is rarer and more telling than it sounds.',
    'There is gladness in this dream, and gladness is information too.',
  ],
  sad: [
    'This dream carries sorrow, and it is allowed to; dreams are one of the places feeling goes when waking life has no room for it.',
    'A heavy, tender feeling sits under this dream, as if something is being grieved or missed.',
    'There is an ache in this dream, and it probably has an older source than the pictures suggest.',
  ],
  anger: [
    'There is anger in this dream, and it may be pointing at a boundary that has been crossed.',
    'This dream has heat in it, which often means something unspoken is pressing for a voice.',
    'Anger runs through this dream, and it is worth asking what it is protecting.',
  ],
  confused: [
    'This dream is hard to pin down, and that confusion is part of its message.',
    'A fog of not-quite-knowing hangs over this dream, which is itself a clue about where you stand.',
    'This dream does not resolve neatly, and it does not need to for it to be useful.',
  ],
};

const TYPE_LINES: Record<DreamType, string> = {
  nightmare: 'It has the weight of a nightmare, and nightmares are often the mind rehearsing what it cannot yet say aloud.',
  recurring: 'It echoes an earlier dream: the same images have visited you in the last two months, and a returning dream tends to be asking to be heard.',
  lucid: 'At some point you knew you were dreaming, and that awareness is a skill worth noticing and practising.',
  visitation: 'It has the feel of a visitation, someone loved, present and at ease. Many traditions treat such dreams as a visit, and others as memory and grief finding a gentle way in. Either can be true for you.',
  deity: 'A guiding or divine presence seems to touch this dream. Hold the sense of it lightly and notice what you were given.',
  prophetic: 'It had the feel of something more than an ordinary dream. Dreams like that are worth writing down and checking back on, without needing to be believed.',
};

const CLOSES = [
  'You are the one who knows this dream best. Take what rings true and leave the rest.',
  'None of this is a verdict. It is a set of doors, and you decide which to open.',
  'The meanings above are old and modern lenses, not facts. Your own sense of it counts for more than any of them.',
  'Let it sit for a day or two; dreams often finish their meaning after you stop pushing on them.',
];

const VISITATION_ACTION = 'Set a small glass of water and a candle for them somewhere quiet, say their name, and tell them one thing you would like them to know. Let the candle burn down safely or put it out when you are ready.';
const NIGHTMARE_ACTION = 'Before sleep, take a protection bath and tell yourself the dream is over and you are safe. A simple ward helps too: salt across the windowsill, or a few lines of your own words at the door of the room.';
const GENERIC_ACTION = 'Write the dream out once more in your own words, and underline the one image that still has a pull on you.';
const DISTRESS_LINE = 'If dreams like this keep coming and are leaving you frightened or exhausted, it may help to talk them over with someone you trust, or with a doctor or counsellor. You do not have to carry them alone.';

function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}


const LEADS: Record<Feeling, string[]> = {
  calm: ['Calm here suggests', 'That you stayed calm points to', 'Feeling at ease hints at', 'With calm in it, this reads as', 'Being settled in it speaks of', 'The quiet you felt suggests'],
  fear: ['Fear here suggests', 'That you were afraid points to', 'Feeling frightened hints at', 'With fear in it, this reads as', 'The dread you felt speaks of', 'Being on edge here suggests'],
  joy: ['Joy here suggests', 'That you felt glad points to', 'Feeling light hints at', 'With joy in it, this reads as', 'The gladness you felt speaks of', 'Being happy in it suggests'],
  sad: ['Sorrow here suggests', 'That you felt sad points to', 'Feeling heavy hints at', 'With sadness in it, this reads as', 'The ache you felt speaks of', 'Being tearful here suggests'],
  anger: ['Anger here suggests', 'That you felt angry points to', 'Feeling heated hints at', 'With anger in it, this reads as', 'The heat you felt speaks of', 'Being furious here suggests'],
  confused: ['Confusion here suggests', 'That you felt lost points to', 'Feeling unsure hints at', 'With confusion in it, this reads as', 'The fog you felt speaks of', 'Being puzzled here suggests'],
};
const LEAD_PREFIX = /^(?:fear|calm|joy|sadness|sorrow|grief|anger|confusion|confused|sad|angry)\b[^.;:]{0,40}?\b(?:suggests?|points? to|hints? at|hints?|means|shows|says|reads as|speaks of)\s+/i;

/** The feeling line of a symbol, re-led so no two in a reading open alike. */
function releadFeeling(text: string, feeling: Feeling, n: number): string {
  const m = LEAD_PREFIX.exec(text);
  if (!m) return text;
  const rest = text.slice(m[0].length);
  const leads = LEADS[feeling];
  return `${leads[n % leads.length]} ${rest}`;
}

export function readDream(input: ReadInput): Reading {
  const { text, date } = input;
  const dictionary = input.dictionary ?? [];
  const all = matchSymbols(text, dictionary);
  const top = all.slice(0, MAX_SYMBOLS);
  const { feeling, scores } = dominantFeeling(text, input.mood, input.feelingsNote);
  const library = libraryMentions(text, input.library ?? []);
  const types = detectTypes({
    text,
    date,
    feeling,
    scores,
    matches: all,
    id: input.id,
    flags: input.flags,
    past: input.past,
    deityNames: (input.library ?? []).filter((l) => l.type === 'deity').map((l) => l.name),
  });
  const seed = hash(`${date}|${text}`);
  const { fresh, para } = composer();

  // Opening
  const names = top.slice(0, 3).map((m) => m.subject.name);
  const opening = [
    para(OPENERS[feeling][seed % 3]),
    names.length ? para(`Its strongest ${names.length === 1 ? 'image is' : 'images are'} ${joinNames(names)}.`) : para('No single symbol stands out, so the reading leans on the feeling of it.'),
    ...types.map((t) => para(TYPE_LINES[t])),
  ].filter(Boolean);
  const openingText = [opening[0], opening[1]].filter(Boolean).join(' ');
  const openingParas = [openingText, ...opening.slice(2)].filter(Boolean);

  // The symbols
  const symbols: ReadingSymbol[] = top.map((m, idx) => {
    const s = m.subject.symbol;
    const lead = (idx + seed) % 2 === 0;
    const paragraphs: string[] = [];
    if (m.subject.personal) paragraphs.push(para(`In your own dictionary, ${m.subject.name.toLowerCase()} means: ${m.subject.personal.replace(/[.\s]+$/, '')}.`));
    if (s) {
      const tradition = lead ? s.folk : s.psyche;
      const feel = releadFeeling(s.byFeeling[feeling], feeling, idx + seed);
      paragraphs.push(para(...(lead ? [tradition, feel] : [feel, tradition])));
      if (s.craft) paragraphs.push(para(s.craft));
    } else if (!m.subject.personal) paragraphs.push('');
    return { key: m.subject.key, name: m.subject.name, symbol: s, personal: m.subject.personal, said: m.said, count: m.count, paragraphs: paragraphs.filter(Boolean) };
  });

  // The night
  const night: string[] = [];
  if (input.moon) {
    const el = SIGN_ELEMENT[input.moon.sign];
    night.push(para(`The moon that night was ${input.moon.phase.toLowerCase()} in ${input.moon.sign}.`, PHASE_LINES[input.moon.phase]));
    if (el) night.push(para(`A moon in ${input.moon.sign}, ${el === 'fire' ? 'a' : 'an'} ${el} sign, ${ELEMENT_LINES[el]}. Moon lore like this is a lens rather than a rule.`));
  }

  // Questions: round-robin across the strongest symbols, rotated by the seed
  const pools = symbols.filter((s) => s.symbol).map((s) => questionsOf(s.symbol!));
  const questions = roundRobin(pools, seed, 3, fresh);

  // Something to do
  let action: ReadingAction = { text: input.text ? (symbols.find((s) => s.symbol?.action)?.symbol?.action ?? GENERIC_ACTION) : GENERIC_ACTION };
  let checkBack: string | undefined;
  if (types.includes('nightmare')) action = { text: NIGHTMARE_ACTION, label: 'Protection baths', href: '/rituals/craft/bath' };
  else if (types.includes('visitation')) action = { text: VISITATION_ACTION };
  else if (types.includes('prophetic')) {
    checkBack = addDays(date, 7);
    action = { text: `Note down the details you are sure of now, before they blur, then look back on ${checkBack} to see whether anything has echoed. Keep what you wrote exactly as it was.` };
  }
  fresh(action.text);

  // Close
  const close = [para(CLOSES[(seed >>> 3) % CLOSES.length])];
  const often = (input.past ?? []).filter((p) => p.id !== input.id).length >= 2 && types.includes('nightmare') && types.includes('recurring');
  if (often) close.unshift(para(DISTRESS_LINE));
  else if (types.includes('nightmare')) close.unshift(para('If dreams like this become frequent or distressing, it is fine to talk them over with someone you trust.'));

  const also = all.slice(MAX_SYMBOLS).map((m) => m.subject.name);
  const sections: ReadingSection[] = [
    { id: 'opening', title: 'Opening', paragraphs: openingParas },
    ...(symbols.length ? [{ id: 'symbols' as const, title: 'The symbols', paragraphs: [] }] : []),
    ...(night.length ? [{ id: 'night' as const, title: 'The night', paragraphs: night }] : []),
    ...(questions.length ? [{ id: 'questions' as const, title: 'Questions to sit with', paragraphs: questions }] : []),
    { id: 'do', title: 'Something to do', paragraphs: [action.text] },
    { id: 'close', title: 'Close', paragraphs: close.filter(Boolean) },
  ];

  const lines: string[] = [];
  for (const s of sections) {
    lines.push(s.title.toUpperCase());
    if (s.id === 'symbols') {
      for (const sym of symbols) lines.push(`${sym.name}\n${sym.paragraphs.join('\n')}`);
      if (also.length) lines.push(`Also present: ${also.join(', ')}.`);
    } else if (s.id === 'questions') lines.push(...s.paragraphs.map((q) => `- ${q}`));
    else lines.push(...s.paragraphs);
    lines.push('');
  }
  return { feeling, types, symbols, also, library, sections, action, checkBack, text: lines.join('\n').trim() };
}

// ───────────────────────────── Patterns ─────────────────────────────

export type PatternDream = {
  id: string;
  date: string;
  text: string;
  moonPhase: string;
  cameTrue?: { date: string; note: string } | null;
  prophetic?: boolean;
};

const MAIN_PHASES = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'];

/** "near the full moon", "under a waxing crescent". */
export function phaseWords(phase: string): string {
  const p = phase.toLowerCase();
  return MAIN_PHASES.includes(phase) ? `near the ${p}` : `under a ${p}`;
}

export type SymbolPattern = { key: string; name: string; count: number; phases: { phase: string; count: number }[]; line: string };

export type Patterns = {
  month: string;
  symbols: SymbolPattern[];
  pairings: { a: string; b: string; count: number }[];
  lines: string[];
};

/** Symbols per dream, with the person's dictionary applied. */
export function dreamSymbolKeys(text: string, dictionary: DictionaryEntry[] = []): { key: string; name: string }[] {
  return matchSymbols(text, dictionary).map((m) => ({ key: m.subject.key, name: m.subject.name }));
}

/** What keeps returning, by moon, and which symbols travel together. `now` fixes "this month". */
export function dreamPatterns(dreams: PatternDream[], now: Date, dictionary: DictionaryEntry[] = []): Patterns {
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = dreams.filter((d) => d.date.startsWith(month));
  const names = new Map<string, string>();
  const per = (list: PatternDream[]) =>
    list.map((d) => {
      const found = dreamSymbolKeys(d.text, dictionary);
      for (const f of found) names.set(f.key, f.name);
      return { d, keys: found.map((f) => f.key) };
    });
  const monthly = per(thisMonth);
  const counts = new Map<string, { count: number; phases: Map<string, number> }>();
  for (const { d, keys } of monthly) {
    for (const k of keys) {
      const c = counts.get(k) ?? { count: 0, phases: new Map() };
      c.count++;
      c.phases.set(d.moonPhase, (c.phases.get(d.moonPhase) ?? 0) + 1);
      counts.set(k, c);
    }
  }
  const symbols: SymbolPattern[] = [...counts.entries()]
    .map(([key, c]) => {
      const phases = [...c.phases.entries()].map(([phase, count]) => ({ phase, count })).sort((a, b) => b.count - a.count || a.phase.localeCompare(b.phase));
      const name = names.get(key) ?? key;
      let line = `${name} has appeared in ${c.count} ${c.count === 1 ? 'dream' : 'dreams'} this month`;
      if (c.count >= 3 && phases[0].count / c.count >= 0.5) line += `, mostly ${phaseWords(phases[0].phase)}`;
      return { key, name, count: c.count, phases, line: `${line}.` };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const pairs = new Map<string, number>();
  for (const { keys } of per(dreams)) {
    const u = [...new Set(keys)].sort();
    for (let x = 0; x < u.length; x++) for (let y = x + 1; y < u.length; y++) pairs.set(`${u[x]}|${u[y]}`, (pairs.get(`${u[x]}|${u[y]}`) ?? 0) + 1);
  }
  const pairings = [...pairs.entries()]
    .filter(([, n]) => n >= 2)
    .map(([k, count]) => {
      const [a, b] = k.split('|');
      return { a: names.get(a) ?? a, b: names.get(b) ?? b, count };
    })
    .sort((x, y) => y.count - x.count || x.a.localeCompare(y.a))
    .slice(0, 5);

  const lines = [
    ...symbols.filter((s) => s.count >= 2).slice(0, 3).map((s) => s.line),
    ...pairings.slice(0, 2).map((p) => `${p.a} and ${p.b} have come together in ${p.count} dreams.`),
  ];
  return { month, symbols, pairings, lines };
}

/** The symbol's share of dreams by moon phase, across all dreams. */
export function symbolByPhase(dreams: PatternDream[], key: string, dictionary: DictionaryEntry[] = []): { phase: string; count: number }[] {
  const phases = new Map<string, number>();
  for (const d of dreams) if (dreamSymbolKeys(d.text, dictionary).some((s) => s.key === key)) phases.set(d.moonPhase, (phases.get(d.moonPhase) ?? 0) + 1);
  return [...phases.entries()].map(([phase, count]) => ({ phase, count })).sort((a, b) => b.count - a.count || a.phase.localeCompare(b.phase));
}

// ───────────────────────────── Came true ─────────────────────────────

/** How many dreams were marked "came true", of all and of those flagged as possibly prophetic. */
export function cameTrueRate(dreams: Pick<PatternDream, 'cameTrue' | 'prophetic'>[]): { total: number; came: number; flagged: number; cameOfFlagged: number; line: string } {
  const total = dreams.length;
  const came = dreams.filter((d) => d.cameTrue).length;
  const flagged = dreams.filter((d) => d.prophetic || d.cameTrue).length;
  const cameOfFlagged = dreams.filter((d) => d.cameTrue && (d.prophetic || d.cameTrue)).length;
  const line = !came
    ? 'No dreams marked as having come true yet.'
    : `${came} of your ${total} ${total === 1 ? 'dream' : 'dreams'} ${came === 1 ? 'has' : 'have'} been marked as coming true (${Math.round((came / total) * 100)}%). Remember that memory favours the hits.`;
  return { total, came, flagged, cameOfFlagged, line };
}

// ─── The old "Common symbols" list, folded in ────────────────────────────
// The Grimoire once had a second, shorter symbol list (craft/hedge/
// dreamSymbols.ts) with a question to ask for each. This dictionary is the
// one list now; those questions join the questions of the symbol they name.

let asks: Map<string, string> | null = null;
function asksById(): Map<string, string> {
  if (asks) return asks;
  asks = new Map();
  for (const s of STARTERS) {
    const hit = [s.symbol, ...s.also].map((w) => matchSymbols(w)[0]?.subject.symbol).find(Boolean);
    if (hit && !asks.has(hit.id)) asks.set(hit.id, s.ask);
  }
  return asks;
}

/** A symbol's questions, with the old list's question for it first when there was one. */
export function questionsOf(symbol: DreamSymbol): string[] {
  const ask = asksById().get(symbol.id);
  return ask && !symbol.questions.includes(ask) ? [ask, ...symbol.questions] : symbol.questions;
}

/** A place to start with one symbol, from this dictionary: what it is often taken to mean, and a question to ask. */
export function symbolStart(word: string, dictionary: DictionaryEntry[] = []): { name: string; notes: string; ask: string; id: string } | null {
  const hit = matchSymbols(word, dictionary)[0]?.subject;
  if (!hit) return null;
  if (!hit.symbol) return hit.personal ? { id: hit.key, name: hit.name, notes: hit.personal, ask: 'What does it mean to you now?' } : null;
  return { id: hit.symbol.id, name: hit.symbol.name, notes: hit.symbol.psyche, ask: questionsOf(hit.symbol)[0] ?? '' };
}

/** The symbols named in some words (an omen, a note), each as a place to start. */
export function symbolStarts(text: string, max = 4): { name: string; notes: string; ask: string; id: string }[] {
  return matchSymbols(text)
    .map((m) => (m.subject.symbol ? { id: m.subject.symbol.id, name: m.subject.symbol.name, notes: m.subject.symbol.psyche, ask: questionsOf(m.subject.symbol)[0] ?? '' } : null))
    .filter((x): x is { name: string; notes: string; ask: string; id: string } => !!x)
    .slice(0, max);
}
