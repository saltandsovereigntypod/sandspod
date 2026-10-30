// The interpretation library's schema: the typed tables a chart reading is
// built from. Phase 1 (this build) writes the Sun, Moon and Ascendant in all
// twelve signs and the twelve houses; every other table is defined here and
// left empty, and the screens show "coming soon" for any piece not written
// yet (never a blank). The next builder fills the tables in the files named
// below and registers nothing else: registry.ts already reads them.
//
// HOW TO ADD CONTENT
//
// 1. Every piece is an `Interpretation`: { simple, detailed, magic }.
//    * simple: one to three plain sentences for a beginner. No jargon, or
//      jargon that the glossary explains (glossary terms are made tappable
//      automatically in the app and on the website).
//    * detailed: a fuller reading, a paragraph or two (plain text; a blank
//      line between paragraphs). Can name dignities, rulers, traditions.
//    * magic: how it ties into the craft: what workings, timing,
//      correspondences, deities or practices suit it. One short paragraph.
//    * Optional `shadow` (the difficult side, said kindly) and `sources`
//      (where a traditional meaning comes from, e.g. "Valens, Anthology II").
//    House voice: warm, plain, specific; no exclamation marks; British
//    spelling; "traditionally", "many astrologers read", never fate or doom.
//
// 2. Tables and their keys (key builders are below, use them):
//    * PLANET_IN_SIGN       interpret/planetInSign.ts   key: `${body}|${sign}`        e.g. 'Venus|Scorpio'
//                           (Sun, Moon in all signs and the Ascendant are already in
//                           sunSigns.ts, moonSigns.ts, risingSigns.ts; don't repeat them)
//    * PLANET_IN_HOUSE      interpret/planetInHouse.ts  key: `${body}|${house}`       e.g. 'Mars|10'
//    * SIGN_ON_CUSP         interpret/signOnCusp.ts     key: `${house}|${sign}`       e.g. '7|Libra'
//    * ASPECT_READINGS      interpret/aspects.ts        key: `${a}|${aspect}|${b}`    bodies in BODY_ORDER order, e.g. 'Sun|square|Saturn'
//    * POINT_READINGS       interpret/points.ts         key: `${point}|${sign}` or `${point}|house|${n}`, e.g. 'North Node|Leo', 'Part of Fortune|house|2'
//    * TRANSIT_READINGS     interpret/transits.ts       key: `${transiting}|${aspect}|${natal}` e.g. 'Saturn|conjunction|Moon'
//    * PATTERN_READINGS     interpret/patterns.ts       key: pattern name ('grand-trine', 't-square', ...)
//    * ELEMENT_READINGS     interpret/balance.ts        keys: 'dominant|fire', 'missing|water', 'dominant|cardinal' ...
//    * RULER_READINGS       interpret/ruler.ts          key: `${ruler}|house|${n}` (the chart ruler in a house), `${ruler}|ruler`
//    Body names are exactly as in lib/astro/signs.ts ChartPointName:
//    'Sun' ... 'Pluto', 'Chiron', 'North Node', 'South Node', 'Lilith',
//    'Part of Fortune', 'Ascendant', 'Midheaven'. Signs are 'Aries' ... 'Pisces'.
//    Aspect names: lib/astro/aspects.ts ASPECT_NAMES.
//
// 3. The composer (compose.ts) walks a chart and asks the registry for each
//    piece; missing pieces become `{ status: 'coming-soon' }` sections, which
//    the screens show as a short note pointing to the glossary instead.
//
// 4. A "Learn Astrology" course can use the same Interpretation shape and the
//    glossary (lib/astro/glossary.ts); see LessonSeed below for the planned shape.
//    (Built: lib/astro/course/, in the coven courses' lesson and quiz format.)
//
// Phase 2 wrote the aspects, points (Part of Fortune, Midheaven), transits and
// life cycles, returns, the progressed Moon, patterns, balance and the chart
// ruler; app/tests/astro-interpret.test.ts checks they are complete.

import type { AspectName, PatternName } from '../aspects.ts';
import type { ChartPointName, ZodiacSign } from '../signs.ts';

export type Interpretation = {
  simple: string;
  detailed: string;
  magic: string;
  /** The harder side, said kindly. */
  shadow?: string;
  /** Where a traditional meaning comes from. */
  sources?: string;
};

export type HouseMeaning = {
  house: number;
  name: string;
  keywords: string[];
  kind: 'angular' | 'succedent' | 'cadent';
  naturalSign: ZodiacSign;
  simple: string;
  detailed: string;
  magic: string;
};

/** The order bodies are written in aspect keys (the faster first). */
export const BODY_ORDER: ChartPointName[] = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node', 'South Node', 'Lilith', 'Part of Fortune', 'Ascendant', 'Midheaven',
];

export const keys = {
  planetInSign: (body: ChartPointName, sign: ZodiacSign) => `${body}|${sign}`,
  planetInHouse: (body: ChartPointName, house: number) => `${body}|${house}`,
  signOnCusp: (house: number, sign: ZodiacSign) => `${house}|${sign}`,
  aspect: (a: ChartPointName, aspect: AspectName, b: ChartPointName) => {
    const [x, y] = BODY_ORDER.indexOf(a) <= BODY_ORDER.indexOf(b) ? [a, b] : [b, a];
    return `${x}|${aspect}|${y}`;
  },
  pointInSign: (point: ChartPointName, sign: ZodiacSign) => `${point}|${sign}`,
  pointInHouse: (point: ChartPointName, house: number) => `${point}|house|${house}`,
  transit: (transiting: ChartPointName, aspect: AspectName, natal: ChartPointName) => `${transiting}|${aspect}|${natal}`,
  pattern: (name: PatternName) => name,
  balance: (kind: 'dominant' | 'missing', what: string) => `${kind}|${what}`,
  rulerInHouse: (ruler: ChartPointName, house: number) => `${ruler}|house|${house}`,
  /** The chart ruler itself, whichever house it is in: 'Mars|ruler'. */
  chartRuler: (ruler: ChartPointName) => `${ruler}|ruler`,
};

export type InterpretationTable = Record<string, Interpretation>;

/** Join a short closing paragraph (a line of advice) onto the one before it. */
export function tidyParagraphs(text: string): string {
  const parts = text.split('\n\n');
  const out: string[] = [];
  for (const p of parts) {
    if (out.length && p.length < 60) out[out.length - 1] = `${out[out.length - 1]} ${p}`;
    else out.push(p);
  }
  return out.join('\n\n');
}

/** A planned lesson in the Learn Astrology course (for the next builder). */
export type LessonSeed = {
  id: string;
  title: string;
  /** Glossary ids the lesson teaches. */
  terms: string[];
  body: Interpretation;
  /** A small exercise with the person's own chart. */
  practice?: string;
};
