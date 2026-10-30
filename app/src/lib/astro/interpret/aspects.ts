// Natal aspects between two bodies. Key: keys.aspect(a, aspect, b).
//
// Every pair among the Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn,
// Uranus, Neptune, Pluto, Chiron, the North Node, the Ascendant and the
// Midheaven, in the five major aspects, is written from a seed (aspectData/):
// the pair's own line and paragraph for that aspect, what the two do together,
// what each body stands for when the seed is short, what the aspect itself is,
// and the pair's magic with the aspect's way of working it. Aspects the sky
// can't make are left out (Mercury and Venus never stray far from the Sun or
// each other; the Ascendant and Midheaven are never conjunct or opposite),
// and the South Node is read through the North Node (always exactly opposite).
//
// The six minor aspects have one shared reading each (MINOR_ASPECT_READINGS),
// which the registry joins with the pair's own line when a chart has one.

import type { AspectName } from '../aspects.ts';
import type { ChartPointName } from '../signs.ts';
import { LIGHT_PAIRS } from './aspectData/lights.ts';
import { MOON_PAIRS } from './aspectData/moon.ts';
import { OUTER_PAIRS } from './aspectData/outer.ts';
import { PERSONAL_PAIRS } from './aspectData/personal.ts';
import { MAJOR_ASPECTS, type MajorAspect, type PairSeed } from './aspectData/types.ts';
import { VENUS_MARS_PAIRS } from './aspectData/venusMars.ts';
import { BODY_ORDER, keys, tidyParagraphs, type Interpretation, type InterpretationTable } from './types.ts';

export { MAJOR_ASPECTS, type MajorAspect };

/** The bodies whose natal aspects are written, in key order. */
export const ASPECT_BODIES: ChartPointName[] = BODY_ORDER.filter((b) => !['South Node', 'Lilith', 'Part of Fortune'].includes(b));

/** Every pair's seed, keyed 'A|B' in BODY_ORDER. */
export const ASPECT_PAIRS: Record<string, PairSeed> = { ...LIGHT_PAIRS, ...MOON_PAIRS, ...PERSONAL_PAIRS, ...VENUS_MARS_PAIRS, ...OUTER_PAIRS };

/** What each body stands for, added to a reading whose own paragraph is short. */
export const BODY_NOTE: Partial<Record<ChartPointName, string>> = {
  Sun: 'The Sun is your core self and vitality: what you are here to become.',
  Moon: 'The Moon is your feelings, needs and instincts: what makes you feel safe.',
  Mercury: 'Mercury is the mind, speech, learning and the hands.',
  Venus: 'Venus is love, pleasure, beauty and what you value.',
  Mars: 'Mars is drive, courage, anger and how you go after what you want.',
  Jupiter: 'Jupiter is growth, faith, generosity and good fortune.',
  Saturn: 'Saturn is structure, time, duty and the strength that comes from limits.',
  Uranus: 'Uranus is change, freedom, invention and the sudden turn.',
  Neptune: 'Neptune is imagination, spirit, compassion and the dissolving of edges.',
  Pluto: 'Pluto is depth, power and the transformation that comes through endings.',
  Chiron: 'Chiron, the small body between Saturn and Uranus named for the wounded healer of Greek myth, shows where you were hurt and how that becomes wisdom.',
  'North Node': 'The North Node is where the Moon\'s path crosses the Sun\'s heading north: the direction of growth in this life. The South Node, exactly opposite, holds what comes easily and what to grow beyond.',
  Ascendant: 'The Ascendant is the eastern horizon at your birth: the body, your manner and how you begin things, so whatever touches it shows on the surface.',
  Midheaven: 'The Midheaven is the highest point of the zodiac at your birth: vocation, reputation and the life you build in the world.',
};

/** Correspondences for each body, added to magic that doesn't name its own. */
export const BODY_MAGIC: Partial<Record<ChartPointName, string>> = {
  Sun: 'For the Sun: Sundays and Sun hours, gold candles, frankincense, calendula and citrine.',
  Moon: 'For the Moon: Mondays and Moon hours, silver candles, moonstone, jasmine and moon water.',
  Mercury: 'For Mercury: Wednesdays and Mercury hours, yellow or orange candles, agate, lavender and ink.',
  Venus: 'For Venus: Fridays and Venus hours, pink and green candles, rose quartz, rose and copper.',
  Mars: 'For Mars: Tuesdays and Mars hours, red candles, carnelian, nettle and iron.',
  Jupiter: 'For Jupiter: Thursdays and Jupiter hours, blue and purple candles, lapis, sage and oak.',
  Saturn: 'For Saturn: Saturdays and Saturn hours, black candles, onyx, cypress and salt.',
  Uranus: 'For Uranus (a modern planet with no day of its own; many use Wednesday): storm water, clear quartz and electric blue.',
  Neptune: 'For Neptune (many use Monday or Thursday): sea water, amethyst, mugwort and sea-green candles.',
  Pluto: 'For Pluto (many use Saturday or Tuesday): the dark moon, obsidian, pomegranate and black candles.',
  Chiron: 'For Chiron: green candles, yarrow, comfrey and chamomile, and any healing art you practise.',
  'North Node': 'For the nodes: the eclipse seasons, dragon\'s blood, and a black and a white candle lit together.',
  Ascendant: 'For the Ascendant: sunrise, and whatever you wear or carry on the body.',
  Midheaven: 'For the Midheaven: noon, and workings for your name and calling.',
};

/** What each major aspect is, said once at the end of the reading. */
export const ASPECT_TEACHING: Record<MajorAspect, string> = {
  conjunction: 'A conjunction (0°) fuses two bodies: they act together, for good and ill, and it can be hard to tell where one ends and the other begins.',
  sextile: 'A sextile (60°) is an opening between signs of friendly elements: a helpful link that pays off when you do something with it.',
  square: 'A square (90°) is tension between two needs that won\'t sit still together. Traditionally hard, it is also the aspect most people build their strength around.',
  trine: 'A trine (120°) joins bodies in signs of the same element: an easy flow and a natural gift, which can be taken for granted.',
  opposition: 'An opposition (180°) puts two bodies on opposite sides of the sky: a see-saw, often met through other people, that asks for balance rather than a winner.',
};

/** How each major aspect is worked in the craft, after the pair's own magic. */
export const ASPECT_MAGIC: Record<MajorAspect, string> = {
  conjunction: 'As a conjunction, call on them as one: a single candle for both, lit in the hour of either.',
  sextile: 'A sextile opens with a small deliberate act: write the intention down and do one thing toward it within the week.',
  square: 'A square is energy waiting to be used: give the friction a working with a clear aim rather than letting it run you.',
  trine: 'A trine is a gift already given: use it in workings for others as well as yourself, and give thanks for it.',
  opposition: 'An opposition likes balance: two candles, one for each, set at opposite sides of the altar and lit together.',
};

const SLOW = new Set<ChartPointName>(['Saturn', 'Uranus', 'Neptune', 'Pluto']);
const GENERATION =
  'Both move slowly, so everyone born within months of you shares this aspect. It matters most personally when one of the two also touches your Sun, Moon, a personal planet or an angle.';

/** Aspects the sky can't make, so not written: 'A|B' → the aspects that are possible. */
export const ONLY: Record<string, MajorAspect[]> = {
  'Sun|Mercury': ['conjunction'],
  'Sun|Venus': ['conjunction'],
  'Mercury|Venus': ['conjunction', 'sextile'],
  'Ascendant|Midheaven': ['sextile', 'square', 'trine'],
};

const SHORT = 320;

/** Each body in a few words, for the second sentence of a short simple line. */
export const BODY_WORDS: Partial<Record<ChartPointName, string>> = {
  Sun: 'your sense of self',
  Moon: 'your feelings and needs',
  Mercury: 'your mind and voice',
  Venus: 'love and what you value',
  Mars: 'your drive and courage',
  Jupiter: 'growth and faith',
  Saturn: 'duty and structure',
  Uranus: 'change and freedom',
  Neptune: 'dreams and spirit',
  Pluto: 'depth and power',
  Chiron: 'the old wound and the healer in you',
  'North Node': 'your path of growth',
  Ascendant: 'how you meet the world',
  Midheaven: 'your calling and public life',
};

const LINK: Record<MajorAspect, (a: string, b: string) => string> = {
  conjunction: (a, b) => `The conjunction fuses ${a} with ${b}.`,
  sextile: (a, b) => `The sextile opens a door between ${a} and ${b}.`,
  square: (a, b) => `The square sets ${a} against ${b}, and the friction teaches.`,
  trine: (a, b) => `The trine lets ${a} flow easily into ${b}.`,
  opposition: (a, b) => `The opposition balances ${a} across from ${b}.`,
};

function build(): InterpretationTable {
  const out: InterpretationTable = {};
  for (let i = 0; i < ASPECT_BODIES.length; i++)
    for (let j = i + 1; j < ASPECT_BODIES.length; j++) {
      const [a, b] = [ASPECT_BODIES[i], ASPECT_BODIES[j]];
      const seed = ASPECT_PAIRS[`${a}|${b}`];
      if (!seed) continue;
      for (const aspect of MAJOR_ASPECTS) {
        const own = seed[aspect];
        if (!own) continue;
        const [simple, detailed] = own;
        const short = detailed.length < SHORT;
        const notes = short ? [BODY_NOTE[a], BODY_NOTE[b]].filter(Boolean).join(' ') : '';
        const generation = SLOW.has(a) && SLOW.has(b) ?`\n\n${GENERATION}` : '';
        const ownMagic = seed.magic.length < 160 ? ` ${[BODY_MAGIC[a], BODY_MAGIC[b]].filter(Boolean).join(' ')}` : '';
        out[keys.aspect(a, aspect, b)] = {
          simple: simple.length < 80 ? `${simple} ${LINK[aspect](BODY_WORDS[a]!, BODY_WORDS[b]!)}` : simple,
          detailed: `${tidyParagraphs(detailed)}\n\n${seed.core}${notes ? ` ${notes}` : ''} ${ASPECT_TEACHING[aspect]}${generation}`,
          magic: `${seed.magic}${ownMagic} ${ASPECT_MAGIC[aspect]}`,
        };
      }
    }
  return out;
}

export const ASPECT_READINGS: InterpretationTable = build();

/** The minor aspects: one shared reading each, joined with the pair's own line where the chart has one. */
export const MINOR_ASPECT_READINGS: Partial<Record<AspectName, Interpretation>> = {
  quincunx: {
    simple: 'A quincunx (150°) links two parts of you that have nothing in common, so they keep needing small adjustments to live together.',
    detailed:
      'The quincunx or inconjunct joins signs that share no element, modality or polarity, and are not next to each other: fire and earth that are five signs apart, say. Nothing about them fits, so they cannot blend, fight or flow; they can only adjust. Many astrologers read it as a nagging, low-level discomfort, a sense of something slightly off, that shows up in health, habits or routines (the sixth and eighth houses are quincunx the Ascendant).\n\nThe quincunx was not used by Ptolemy; Kepler and later astrologers brought it in, and modern astrology gives it real weight, especially in the yod. The work is patient adjustment and humour: the two will never match, and they don\'t need to.',
    magic: 'Quincunx magic is small, steady and practical: daily rituals, health workings, adjusting a spell rather than recasting it. A cord tied with a knot that you loosen and retie suits it.',
  },
  semisextile: {
    simple: 'A semisextile (30°) joins neighbouring signs: a slight, slow link between two parts of you that can learn from each other.',
    detailed:
      'The semisextile joins one sign to the next, which always differ in element and modality, so the link is subtle: each sign reacts to the one before it. Many astrologers read it as a minor opportunity, mild friction that teaches, or the kind of growth that happens over years rather than days.\n\nIt carries little weight on its own, and its orb is small. Notice it when it joins a light or an angle, or when it links two strong parts of a chart.',
    magic: 'Semisextile magic is gradual: workings in small steps over a whole month, one sign of the Moon at a time.',
  },
  semisquare: {
    simple: 'A semisquare (45°) is half a square: a small, nagging friction that pushes you to act.',
    detailed:
      'The semisquare cuts the square in half. It has the square\'s tension without its size: irritation, impatience, a low hum of pressure. Kepler, who looked for harmonies in the sky, valued it, and modern astrologers (especially in the German Hamburg and cosmobiology schools) read the eighth-harmonic aspects closely.\n\nIn a natal chart it shows a minor stress point that motivates action. Watch it most when it ties a light to a slow planet.',
    magic: 'Semisquare magic is quick, focused action: a short, sharp working to clear a small obstacle.',
  },
  sesquiquadrate: {
    simple: 'A sesquiquadrate (135°) is a square and a half: friction that comes and goes and asks for adjustment.',
    detailed:
      'The sesquiquadrate, or sesquisquare, is 135°: a square plus a semisquare. It carries a restless, agitated quality, like a square that has been shifted slightly off its line, and is often read as tension that surfaces under stress.\n\nLike the semisquare it belongs to the eighth harmonic, valued by Kepler and the cosmobiology schools. In practice, notice it with tight orbs and the lights.',
    magic: 'Sesquiquadrate magic suits release work: unknotting, cord cutting and clearing rites done when the tension rises.',
  },
  quintile: {
    simple: 'A quintile (72°) is a fifth of the circle: a link of talent, style and creative gift between two parts of you.',
    detailed:
      'The quintile divides the circle by five. Kepler introduced it, and modern astrologers (notably John Addey in his work on harmonics) read it as a mark of talent, creativity and the particular way a person shapes things. It is less about events than about style.\n\nWith a tight orb it often shows a skill that grows with practice: a craft, a way of seeing, a gift for form.',
    magic: 'Quintile magic is craft and artistry: the pentagram, the five points, and any spell made beautifully by hand.',
  },
  biquintile: {
    simple: 'A biquintile (144°) is two fifths of the circle: a creative gift that tends to show itself later, through practice.',
    detailed:
      'The biquintile is the quintile doubled, 144°. Like the quintile it belongs to the fifth harmonic, introduced by Kepler and developed in modern harmonic astrology, and is read as talent and creative intelligence.\n\nWhere the quintile is a style, the biquintile is often described as a skill you grow into: unusual problem solving, or an art discovered in adulthood.',
    magic: 'Biquintile magic is the patient craft of a lifetime: a working you refine each year.',
  },
};

/** A minor aspect between two bodies, with the pair's own line first. */
export function minorAspectReading(a: ChartPointName, aspect: AspectName, b: ChartPointName): Interpretation | null {
  const minor = MINOR_ASPECT_READINGS[aspect];
  if (!minor) return null;
  const key = keys.aspect(a, 'conjunction', b).split('|');
  const seed = ASPECT_PAIRS[`${key[0]}|${key[2]}`];
  if (!seed) return { ...minor };
  return { simple: minor.simple, detailed: `${seed.core}\n\n${minor.detailed}`, magic: minor.magic };
}
