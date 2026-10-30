// The astrology glossary: every term the app uses, each explained twice.
//
// * simple: one or two plain sentences for someone who has never read a
//   horoscope.
// * detailed: for someone who wants the whole of it, in up to five parts:
//   the sky (the astronomy behind it), history, how traditions read it, its
//   use in the craft, and what to take care over.
//
// Which one shows follows the setting "Explanations: Simple · Detailed"
// (`astro_explanations` in user settings), and any card can be flipped on
// its own. Any text in the app can make its terms tappable with
// `linkTerms()`, which finds them by their names and aliases.
//
// The framing throughout: these are traditional meanings and tools for
// reflection, not destiny.
//
// Adding a term: put it in the right file under glossary/, give it a unique
// id (lower-case, hyphens), and run the tests (app/tests/astro-glossary.test.ts
// checks every term has both explanations and that related ids exist).

import { ASPECT_TERMS } from './glossary/aspects.ts';
import { BODY_TERMS } from './glossary/bodies.ts';
import { CONCEPT_TERMS } from './glossary/concepts.ts';
import { HOUSE_TERMS } from './glossary/houses.ts';
import { SIGN_TERMS } from './glossary/signs.ts';
import { TECHNIQUE_TERMS } from './glossary/techniques.ts';
import type { GlossaryEntry, TermCategory } from './glossary/types.ts';

export type { GlossaryEntry, TermCategory, TermDetail, TermLink } from './glossary/types.ts';
export { DETAIL_SECTIONS } from './glossary/types.ts';

export const GLOSSARY: GlossaryEntry[] = [...BODY_TERMS, ...SIGN_TERMS, ...HOUSE_TERMS, ...ASPECT_TERMS, ...CONCEPT_TERMS, ...TECHNIQUE_TERMS];

const byId = new Map(GLOSSARY.map((e) => [e.id, e]));

export const term = (id: string): GlossaryEntry | null => byId.get(id) ?? null;

export const CATEGORY_LABEL: Record<TermCategory, string> = {
  basics: 'The basics',
  planet: 'The planets',
  point: 'Points and lots',
  angle: 'The angles',
  sign: 'The signs',
  house: 'The houses',
  element: 'Elements, modalities and polarity',
  dignity: 'Rulership and dignity',
  aspect: 'Aspects',
  pattern: 'Aspect patterns',
  motion: 'How planets move',
  moon: 'The Moon and lunations',
  eclipse: 'Eclipses',
  timing: 'Planetary days and hours',
  'house-system': 'House systems',
  zodiac: 'Zodiacs',
  technique: 'Techniques',
};

export const CATEGORY_ORDER: TermCategory[] = [
  'basics', 'planet', 'point', 'angle', 'sign', 'house', 'element', 'dignity', 'aspect', 'pattern', 'motion', 'moon', 'eclipse', 'timing', 'house-system', 'zodiac', 'technique',
];

export function termsIn(category: TermCategory): GlossaryEntry[] {
  return GLOSSARY.filter((e) => e.category === category);
}

/** Terms whose name, alias or simple text match a search. */
export function searchTerms(query: string): GlossaryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const score = (e: GlossaryEntry) => {
    const names = [e.term, ...(e.aliases ?? [])].map((n) => n.toLowerCase());
    if (names.includes(q)) return 3;
    if (names.some((n) => n.startsWith(q))) return 2;
    if (names.some((n) => n.includes(q))) return 1.5;
    if (e.simple.toLowerCase().includes(q)) return 1;
    return 0;
  };
  return GLOSSARY.map((e) => ({ e, s: score(e) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.e.term.localeCompare(b.e.term))
    .map((x) => x.e);
}

// ── Making terms tappable in any text ───────────────────────────────────

export type TextPiece = { text: string; term?: string };

type Matcher = { re: RegExp; ids: Map<string, string> };
let matcher: Matcher | null = null;

/** Words that are names of terms but also ordinary words; only linked when written with a capital. */
const CAPITALISED_ONLY = new Set(['sun', 'moon', 'mars', 'venus', 'mercury', 'earth', 'fire', 'air', 'water', 'fall', 'square', 'trine', 'cusp', 'houses', 'house']);

function buildMatcher(): Matcher {
  const ids = new Map<string, string>();
  for (const e of GLOSSARY) {
    for (const name of [e.term, ...(e.aliases ?? [])]) {
      const key = name.toLowerCase();
      if (!ids.has(key)) ids.set(key, e.id);
    }
  }
  const names = [...ids.keys()].sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // No lookbehind (older Safari lacks it): the character before is captured instead.
  return { re: new RegExp(`(^|[^\\w’'-])(${names.join('|')})(?![\\w-])`, 'gi'), ids };
}

/**
 * Split text into plain pieces and term pieces. Each term is linked once
 * (its first mention); `skip` leaves out terms already explained nearby
 * (the card's own subject, say). Ordinary words that double as terms
 * ("fall", "fire", "square") are linked only when capitalised.
 */
export function linkTerms(text: string, options: { skip?: string[]; only?: string[] } = {}): TextPiece[] {
  if (!matcher) matcher = buildMatcher();
  const seen = new Set(options.skip ?? []);
  const out: TextPiece[] = [];
  let last = 0;
  matcher.re.lastIndex = 0;
  for (let m = matcher.re.exec(text); m; m = matcher.re.exec(text)) {
    const word = m[2];
    const start = m.index + m[1].length;
    // Let the next search start right after the word (the separator may begin the next match).
    matcher.re.lastIndex = start + word.length;
    const id = matcher.ids.get(word.toLowerCase());
    if (!id || seen.has(id) || (options.only && !options.only.includes(id))) continue;
    if (CAPITALISED_ONLY.has(word.toLowerCase()) && word[0] === word[0].toLowerCase()) continue;
    seen.add(id);
    if (start > last) out.push({ text: text.slice(last, start) });
    out.push({ text: word, term: id });
    last = start + word.length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** The term id for a sign, planet or point name ("Scorpio" → "scorpio", "North Node" → "north-node"). */
export const termIdFor = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
