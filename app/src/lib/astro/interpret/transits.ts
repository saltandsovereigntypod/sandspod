// A transiting body's aspect to a natal one. Key: keys.transit(transiting, aspect, natal).
//
// Written: Jupiter, Saturn, Uranus, Neptune, Pluto, Chiron and the North Node
// over the natal Sun, Moon, Mercury, Venus, Mars, Ascendant and Midheaven, by
// conjunction, square, opposition, trine and sextile (from transitData.ts:
// each pair's own words for the conjunction, the hard and the soft aspects,
// with what each aspect, transiting body and natal point adds); and the life
// cycles, each a transit to the planet's own natal place (the Saturn return is
// 'Saturn|conjunction|Saturn'). Also here: how to read a solar or lunar return
// and its Sun or Moon in each house, and the progressed Moon through the signs,
// the houses and its phases with the progressed Sun.

import type { ProgressedPhase } from '../forecast.ts';
import type { ChartPointName, ZodiacSign } from '../signs.ts';
import { BODY_WORDS } from './aspects.ts';
import { TRANSIT_SEEDS, type TransitGroup } from './transitData.ts';
import { TRANSIT_DEEPER_A } from './transitDeeperA.ts';
import { TRANSIT_DEEPER_B } from './transitDeeperB.ts';
import { keys, tidyParagraphs, type Interpretation, type InterpretationTable } from './types.ts';

export const TRANSITING_BODIES: ChartPointName[] = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node'];
export const TRANSIT_TARGETS: ChartPointName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant', 'Midheaven'];
export const TRANSIT_ASPECTS = ['conjunction', 'sextile', 'square', 'trine', 'opposition'] as const;
type TransitAspect = (typeof TRANSIT_ASPECTS)[number];

const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];

const GROUP: Record<TransitAspect, TransitGroup> = { conjunction: 'conjunction', square: 'hard', opposition: 'hard', trine: 'soft', sextile: 'soft' };

/** What a transit of each body is like, and how long it lasts. */
export const TRANSIT_VOICE: Partial<Record<ChartPointName, string>> = {
  Jupiter: 'Jupiter takes about twelve years to go round the zodiac, so its transits last a few weeks, or a few months when it turns retrograde across the point. They bring growth, help and a wider view.',
  Saturn: 'Saturn takes about twenty-nine years round the zodiac; its transits last months and often come in three passes (direct, retrograde, direct again). They bring tests, structure and things that last.',
  Uranus: 'Uranus takes eighty-four years round the zodiac; its transits build over a year or two, with sudden moments inside them. They bring awakenings, freedom and change.',
  Neptune: 'Neptune takes about 165 years round the zodiac; its transits are slow and misty, lasting a year or two. They bring dissolving, longing, compassion and spiritual opening.',
  Pluto: 'Pluto takes about 248 years round the zodiac; its transits last two years or more and work deep. They bring endings, power and rebirth.',
  Chiron: 'Chiron takes about fifty years round the zodiac, moving fast in some signs and slowly in others; its transits last months. They bring old hurts to the surface to be tended.',
  'North Node': 'The nodes move backwards through the zodiac in about 18.6 years, staying around a year and a half in each sign; eclipses happen near them. The North Node points forward to growth; the South Node, opposite, to release.',
};

/** What each natal point is, in a transit reading. */
export const TRANSIT_TARGET_NOTE: Partial<Record<ChartPointName, string>> = {
  Sun: 'Your natal Sun is your core self, vitality and purpose.',
  Moon: 'Your natal Moon is your feelings, needs, body rhythms and home.',
  Mercury: 'Your natal Mercury is how you think, learn, speak and move about.',
  Venus: 'Your natal Venus is love, pleasure, money and what you value.',
  Mars: 'Your natal Mars is drive, courage, anger and the body\'s energy.',
  Ascendant: 'Your Ascendant is your body, manner and the direction of your life; a transit to it is felt personally, and a transit opposite it falls on your Descendant, the place of partners.',
  Midheaven: 'Your Midheaven is your vocation and public life; a transit opposite it falls on the IC, home and roots.',
};

const ASPECT_LINE: Record<TransitAspect, string> = {
  conjunction: 'The conjunction is the start of a new cycle between the two: the most strongly felt of the transits.',
  square: 'The square is a turning point felt from within: pressure to act or change, often felt as frustration until you do.',
  opposition: 'The opposition is the cycle\'s full moon: what began at the conjunction comes to light, often through other people or events.',
  trine: 'The trine is easy and supportive, so it can pass unnoticed; use it on purpose.',
  sextile: 'The sextile is an opening that needs a small step from you.',
};

const ASPECT_SIMPLE: Record<TransitAspect, string> = {
  conjunction: '',
  square: ' As a square, it pushes from within.',
  opposition: ' As an opposition, it often comes through other people.',
  trine: ' As a trine, it flows; use it.',
  sextile: ' As a sextile, it opens a door you choose to walk through.',
};

/** The transiting body's own correspondences, for the working. */
const TRANSIT_MAGIC: Partial<Record<ChartPointName, string>> = {
  Jupiter: 'Jupiter\'s help comes on Thursdays and in Jupiter hours, with blue or purple candles, sage, oak and lapis.',
  Saturn: 'Saturn\'s help comes on Saturdays and in Saturn hours, with black candles, salt, cypress and onyx.',
  Uranus: 'Uranus answers sudden, inventive work: storm water, clear quartz and a working done the moment it occurs to you.',
  Neptune: 'Neptune answers water and dream: moon water, sea salt, amethyst and a dream journal kept by the bed.',
  Pluto: 'Pluto answers the dark moon: obsidian, a black candle and something written and burned.',
  Chiron: 'Chiron answers healing arts: yarrow, comfrey, chamomile and a green candle.',
  'North Node': 'The nodes answer the eclipse seasons: a black and a white candle lit together, and dragon\'s blood.',
};

const ASPECT_TIMING: Record<TransitAspect, string> = {
  conjunction: 'Begin the working as the transit begins and renew it at each pass.',
  square: 'Work at the exact square to turn pressure into action.',
  opposition: 'Work at the exact opposition to bring what is hidden into balance.',
  trine: 'Work while the trine lasts to make the most of the ease.',
  sextile: 'Work while the sextile lasts, and act on it within days.',
};

/** The life cycles: transits of a planet to its own natal place. */
export const CYCLE_READINGS: InterpretationTable = {
  [keys.transit('Jupiter', 'conjunction', 'Jupiter')]: {
    simple: 'Your Jupiter return, about every twelve years (around 12, 24, 36, 48, 60, 72, 84): a new cycle of growth, faith and opportunity begins.',
    detailed:
      'Jupiter comes back to its birth place roughly every twelve years. Each return opens a new chapter of growth: a time to widen your world through study, travel, faith or generosity, and to notice what you now believe. Many people remember their Jupiter returns as times of new beginnings, moving, or meeting a teacher.\n\nRead the return through Jupiter\'s natal sign and house, which show where the growth wants to happen. The year before is often a time of clearing space.',
    magic: 'A Jupiter return is a season for blessing and increase: a gratitude rite, a new altar to your guides, a vow to learn something for twelve years. Thursdays, blue and purple candles, oak, bay and sage.',
  },
  [keys.transit('Jupiter', 'opposition', 'Jupiter')]: {
    simple: 'About six years after each Jupiter return: the growth begun then is tested by the wider world, and you see what it has become.',
    detailed:
      'Halfway round its twelve-year cycle, transiting Jupiter opposes its natal place. What you reached for at the last return is now in full view, sometimes as success, sometimes as overreach. Other people, teachers and institutions often show you where you have grown and where you have promised too much.\n\nIt is a time to share what you have, and to rebalance faith with good sense.',
    magic: 'Work a gratitude and sharing rite: give away something from your abundance, and bless what has grown.',
  },
  [keys.transit('Saturn', 'conjunction', 'Saturn')]: {
    simple: 'Your Saturn return, around 29, 58 and 87: a coming of age, when life asks you to build on what is truly yours and let go of the rest.',
    detailed:
      'Saturn takes about twenty-nine and a half years to go round the zodiac, so it returns to its birth place in your late twenties, late fifties and late eighties. The first return is astrology\'s best-known transit: a coming of age when the life you inherited or drifted into is tested. Careers, relationships, homes and beliefs that don\'t fit often end, and what is real is built on.\n\nIt can feel heavy, and it lasts about two years from first to last pass. Many people look back on it as the time they became themselves. The second return asks what your elder years are for; the third is a harvest of wisdom.',
    magic: 'A Saturn return is a time for vows and foundations: a dedication, a rite of passage, a commitment to a path or practice. Saturdays, black and indigo candles, salt, cypress and onyx; honour your elders and ancestors, and bind away what you are leaving behind.',
    shadow: 'Fear, heaviness and clinging to structures that are ending.',
  },
  [keys.transit('Saturn', 'square', 'Saturn')]: {
    simple: 'Around 7, 21, 36, 51 and 66, Saturn squares its natal place: a checkpoint where structures are tested and must be adjusted.',
    detailed:
      'Between returns, transiting Saturn squares its natal place twice: the waxing square (about seven years after a return) and the waning square (about seven years before the next). Each is a checkpoint. At the waxing square, what you began must be built upon or abandoned; at the waning square, what you built is examined and what no longer serves starts to be cleared.\n\nThese squares often coincide with changes in school, work or family. Steady effort and honest review carry you through.',
    magic: 'Work a checking and mending rite: tidy the altar, renew wards and protections, and recommit to the practices that hold you.',
  },
  [keys.transit('Saturn', 'opposition', 'Saturn')]: {
    simple: 'Around 14–15, 44 and 73, Saturn opposes its natal place: a time of reckoning with others, authority and the shape of your life.',
    detailed:
      'Halfway through its cycle, Saturn opposes its natal position. In adolescence it marks the push against rules and parents; in midlife it often brings career peaks or crises and a hard look at commitments; later it is a review before the third return.\n\nThe opposition shows the structure of your life from the outside, often through other people\'s demands. It asks for balance between duty and self.',
    magic: 'Balance work: two candles, black and white, one for your duties and one for yourself, lit together on a Saturday.',
  },
  [keys.transit('Uranus', 'square', 'Uranus')]: {
    simple: 'Around 21 and 63, Uranus squares its natal place: a restless urge for independence and change.',
    detailed:
      'Uranus\'s waxing square, around 21, coincides with leaving home, rebellion and finding your own path; the waning square, around 63, often brings retirement, reinvention and a second freedom.\n\nBoth ask you to break with what confines you, and to choose change rather than be ambushed by it.',
    magic: 'Freedom work: untie a knotted cord, gather storm water, write what you are breaking free of and burn it.',
  },
  [keys.transit('Uranus', 'opposition', 'Uranus')]: {
    simple: 'Around 40–42, Uranus opposes its natal place: the heart of the midlife awakening, when what you have suppressed asks to live.',
    detailed:
      'The Uranus opposition is the classic signature of the midlife turning. Half of Uranus\'s eighty-four-year cycle is done, and parts of you set aside in your twenties ask to be lived. Some people change career, relationships or appearance; others make quieter inner revolutions.\n\nIt often overlaps with Neptune\'s and Pluto\'s squares to themselves, so the early forties can feel like a whole-life reckoning. The gift is authenticity: becoming more yourself while there is time.',
    magic: 'An awakening rite: name what you have kept asleep and invite it in. Clear quartz, electric blue, storm water, and something you have never done before.',
    shadow: 'Breaking things for the sake of it, or refusing all change and calling it peace.',
  },
  [keys.transit('Neptune', 'square', 'Neptune')]: {
    simple: 'Around 39–42, Neptune squares its natal place: old dreams dissolve and a deeper longing for meaning appears.',
    detailed:
      'Neptune\'s square to itself, part of the midlife transits, often brings disillusionment with goals that once seemed everything, and a pull toward spirit, art or service.\n\nThe fog is a doorway: what dissolves makes room for a truer dream. Avoid escape; make space for devotion.',
    magic: 'Dreamwork and devotion: keep a dream journal through the transit, and make a water offering at each new moon.',
  },
  [keys.transit('Pluto', 'square', 'Pluto')]: {
    simple: 'Pluto squares its natal place in midlife (its timing depends on your generation): a deep reckoning with power, fear and what must end.',
    detailed:
      'Because Pluto moves at very different speeds through the signs, people born in the mid-twentieth century met this square around 36–40; those born later meet it later. It brings buried matters to the surface: power, control, grief and desire.\n\nIt is a time to face what you have avoided and let something die so that something truer can live.',
    magic: 'Shadow work at the dark moon: obsidian, a black candle, and a written letter to what you are ready to bury.',
  },
  [keys.transit('Chiron', 'conjunction', 'Chiron')]: {
    simple: 'Your Chiron return, around 49–51: the old wound comes round again, ready to become your wisdom.',
    detailed:
      'Chiron takes about fifty years to complete its orbit, so the return comes around fifty. Many people find their oldest hurts resurfacing, not to wound again but to be finally understood. It is often the time someone becomes a mentor, a healer or a teacher of what they learned the hard way.\n\nRead it through Chiron\'s natal sign and house.',
    magic: 'A healing and elder rite: tend the wound with herbs (yarrow, comfrey, chamomile), then teach or give something from what it taught you.',
  },
  [keys.transit('North Node', 'conjunction', 'North Node')]: {
    simple: 'Your nodal return, about every 18.6 years (around 18–19, 37, 56, 74): a reset of direction, often around eclipses.',
    detailed:
      'The nodes come back to their birth places about every eighteen and a half years, with eclipses near your natal nodes. These returns often bring meetings, endings and choices that feel destined: leaving home at 18, a change of path at 37, new purpose at 56.\n\nThe North Node\'s sign and house show what you are growing toward; the return asks whether you are walking that way.',
    magic: 'An eclipse-season rite of direction: draw a card or cast lots for your path, and set an intention at the eclipse new moon.',
  },
  [keys.transit('North Node', 'opposition', 'North Node')]: {
    simple: 'About nine years after each nodal return (around 9, 28, 47, 65): the nodal reversal, when old habits and new growth swap places for a while.',
    detailed:
      'When the transiting North Node crosses your natal South Node, the familiar and the new are reversed. Old patterns, people or places may come back, sometimes to be released for good.\n\nIt is a time to honour your past and let it go, with eclipses lighting up the axis.',
    magic: 'A release rite at the eclipse full moon: write what you are finishing and give it to running water.',
  },
};

/** A further paragraph per group and a further craft line for each seed (transitDeeperA/B.ts). */
export const TRANSIT_DEEPER = { ...TRANSIT_DEEPER_A, ...TRANSIT_DEEPER_B };
const GROUP_INDEX: Record<TransitGroup, 0 | 1 | 2> = { conjunction: 0, hard: 1, soft: 2 };

function build(): InterpretationTable {
  const out: InterpretationTable = {};
  for (const t of TRANSITING_BODIES)
    for (const n of TRANSIT_TARGETS) {
      const seed = TRANSIT_SEEDS[`${t}|${n}`];
      if (!seed) continue;
      for (const aspect of TRANSIT_ASPECTS) {
        const [simple, written] = seed[GROUP[aspect]];
        const deeper = TRANSIT_DEEPER[`${t}|${n}`];
        const extra = deeper?.[GROUP_INDEX[GROUP[aspect]]];
        const detailed = extra ? `${written}\n\n${extra}` : written;
        out[keys.transit(t, aspect, n)] = {
          simple: `${simple}${simple.length < 60 ? ` Transiting ${t} is working on ${BODY_WORDS[n]}.` : ''}${ASPECT_SIMPLE[aspect]}`,
          detailed: `${tidyParagraphs(detailed)}\n\n${seed.core} ${TRANSIT_TARGET_NOTE[n]} ${ASPECT_LINE[aspect]}\n\n${TRANSIT_VOICE[t]}`,
          magic: `${seed.magic}${deeper ? ` ${deeper[3]}` : ''} ${TRANSIT_MAGIC[t]} ${ASPECT_TIMING[aspect]}`,
        };
      }
    }
  return { ...out, ...CYCLE_READINGS };
}

export const TRANSIT_READINGS: InterpretationTable = build();

// ── Returns ──────────────────────────────────────────────────────────────

/** How to read a solar or a lunar return chart. */
export const RETURN_GUIDES: Record<'solar' | 'lunar', Interpretation> = {
  solar: {
    simple: 'A solar return is the chart for the moment the Sun comes back to its exact birth degree, once a year near your birthday. It is read for the year ahead.',
    detailed:
      'Cast for the moment of return (and, many say, for where you are that day rather than where you were born), the solar return is a snapshot of the year from one birthday to the next. Read it in steps:\n\n1. The house the Sun falls in: the year\'s main stage.\n2. The rising sign and its ruler: the year\'s tone and how you meet it.\n3. Planets on the angles (close to the Ascendant, Midheaven, Descendant or IC): the year\'s loudest themes.\n4. The Moon\'s sign and house: where feelings and needs gather.\n5. How the return chart lies on your natal chart: return angles on natal planets are strong.\n\nRead it alongside the year\'s transits; the return sets the scene, the transits time the events. Treat it as a weather map, not a script.',
    magic: 'Your solar return is your personal new year: light a candle at the exact moment, write intentions for the year, bless yourself with sun-charged water, and keep the chart in your Grimoire to look back on.',
    sources: 'Solar returns go back to the ancient Greek-speaking and Persian astrologers (Masha\'allah and Abu Ma\'shar wrote on the "revolutions of the years of nativities").',
  },
  lunar: {
    simple: 'A lunar return is the chart for each time the Moon comes back to its birth degree, about every 27 days. It is read for the month ahead.',
    detailed:
      'The lunar return repeats the solar return\'s method on a monthly scale. Look first at the house the Moon falls in (where your feelings and needs will gather this month), then at the rising sign, and at any planets on the angles.\n\nBecause it comes thirteen times a year, it is best for noticing rhythms: keep a short journal for each return and patterns of mood and energy show themselves over a year.',
    magic: 'Each lunar return is a small personal full moon: refresh your moon water, tend the altar, and set one intention for the month.',
  },
};

const RETURN_HOUSE: { solar: string; lunar: string; magic: string }[] = [
  { solar: 'A year about you: your body, appearance and a fresh start. You are the project.', lunar: 'A month to focus on yourself, your body and how you feel in it.', magic: 'self-blessing and glamour' },
  { solar: 'A year about money, possessions, skills and self-worth. Build security.', lunar: 'A month for money, comforts and what you value.', magic: 'prosperity jars and money spells' },
  { solar: 'A year of learning, writing, short trips, siblings and neighbours.', lunar: 'A busy month of messages, errands and conversations.', magic: 'word magic and travel protection' },
  { solar: 'A year about home, family and roots: moving, renovating or tending family.', lunar: 'A month to nest, rest at home and tend family.', magic: 'home blessing and ancestor offerings' },
  { solar: 'A year of creativity, romance, play and children. Let yourself enjoy it.', lunar: 'A month for fun, creativity and love.', magic: 'love, joy and creative magic' },
  { solar: 'A year about work, health and daily routine. Build good habits.', lunar: 'A month to sort routines, work and health.', magic: 'health and cleansing work' },
  { solar: 'A year about partnership: marriage, business partners, or important one-to-one relationships.', lunar: 'A month where relationships take the stage.', magic: 'partnership and harmony spells' },
  { solar: 'A year of depth: shared money, intimacy, endings and transformation.', lunar: 'A month of intensity, shared resources and inner change.', magic: 'shadow work and protection' },
  { solar: 'A year of travel, study, belief and big horizons.', lunar: 'A month to learn, travel or think about meaning.', magic: 'study blessings and journeys' },
  { solar: 'A year about career, reputation and achievement. You are seen.', lunar: 'A month focused on work and public life.', magic: 'career and success spells' },
  { solar: 'A year of friends, groups, community and hopes for the future.', lunar: 'A month for friends and community.', magic: 'community and wish magic' },
  { solar: 'A quiet, inward year: rest, retreat, spirituality and endings before a new start.', lunar: 'A quiet month: rest, retreat and dreams.', magic: 'dreamwork, rest and release' },
];

/** A solar or lunar return's light in each house. Key: `${kind}|house|${n}`. */
export const RETURN_HOUSE_READINGS: InterpretationTable = Object.fromEntries(
  (['solar', 'lunar'] as const).flatMap((kind) =>
    RETURN_HOUSE.map((h, i) => {
      const n = i + 1;
      const body = kind === 'solar' ? 'Sun' : 'Moon';
      const span = kind === 'solar' ? 'year' : 'month';
      return [
        `${kind}|house|${n}`,
        {
          simple: kind === 'solar' ? h.solar : h.lunar,
          detailed: `The ${body} in the ${ORD[i]} house of your ${kind} return puts the ${span}'s light there. ${kind === 'solar' ? h.solar : h.lunar} Read this with the return's rising sign and anything on its angles, and with what your natal ${ORD[i]} house holds.`,
          magic: `For this ${span}, ${h.magic} suit the work, timed to the ${kind === 'solar' ? 'birthday and the new moons that follow' : 'lunar return itself'}.`,
        },
      ];
    }),
  ),
);

// ── The progressed Moon ──────────────────────────────────────────────────

const PROGRESSED_SIGN: Record<ZodiacSign, [string, string, string]> = {
  Aries: ['A bold, restless chapter: you want to start things and act for yourself.', 'Feelings become quicker and more direct; patience runs short. It is a time of new beginnings, independence and courage, often after a long period of waiting.', 'courage and new-start spells'],
  Taurus: ['A slow, settling chapter: comfort, security and the body matter.', 'Feelings steady. You want to build, save, garden and enjoy. Change slows down, and that is the point.', 'prosperity, garden and home magic'],
  Gemini: ['A curious, busy chapter: learning, talking and moving about.', 'Feelings become lighter and more changeable. You need variety, conversation and new ideas.', 'word magic and study blessings'],
  Cancer: ['A tender, home-centred chapter: family, roots and belonging.', 'Feelings deepen and turn toward home. Moving, nesting, children and family matters come to the fore.', 'hearth and family magic'],
  Leo: ['A warm, expressive chapter: creativity, joy and being seen.', 'Feelings want expression. Romance, play, art and confidence grow.', 'creative and confidence magic'],
  Virgo: ['A practical, healing chapter: work, health and getting things right.', 'Feelings turn toward usefulness. You sort, refine and improve, and tend body and routine.', 'health and cleansing work'],
  Libra: ['A relational chapter: partnership, beauty and balance.', 'Feelings seek company and harmony. Relationships, art and fairness take centre stage.', 'love and harmony spells'],
  Scorpio: ['A deep, intense chapter: intimacy, endings and transformation.', 'Feelings go deep. Old matters surface to be faced, and bonds become profound.', 'shadow work and protection'],
  Sagittarius: ['An expansive chapter: travel, study and searching for meaning.', 'Feelings want freedom and adventure. Beliefs widen, and you may travel or study.', 'journey and wisdom magic'],
  Capricorn: ['A serious, building chapter: responsibility, ambition and structure.', 'Feelings become more reserved and purposeful. You build for the long term.', 'career and endurance magic'],
  Aquarius: ['An independent chapter: friends, causes and change.', 'Feelings detach a little; you want freedom and community, and may break with old patterns.', 'community and freedom magic'],
  Pisces: ['A dreamy, closing chapter: spirit, compassion and endings before a new cycle.', 'Feelings become porous and intuitive. Rest, retreat, spirituality and letting go prepare you for the next progressed Aries chapter.', 'dreamwork and devotion'],
};

/** The progressed Moon in each sign. Key: `sign|${sign}`. */
export const PROGRESSED_MOON_SIGN: InterpretationTable = Object.fromEntries(
  (Object.keys(PROGRESSED_SIGN) as ZodiacSign[]).map((sign) => {
    const [simple, detailed, magic] = PROGRESSED_SIGN[sign];
    return [
      `sign|${sign}`,
      {
        simple,
        detailed: `${detailed}\n\nThe progressed Moon spends about two and a half years in each sign, and its sign shows the emotional climate of that chapter: what you need, what comforts you, and what you are growing through. Read it with the house it passes through.`,
        magic: `While the progressed Moon is in ${sign}, ${magic} suit your practice, and so does the transiting Moon's monthly visit to ${sign}.`,
      },
    ];
  }),
);

const PROGRESSED_HOUSE: [string, string][] = [
  ['Your focus turns to yourself: a new start, a new look, a new direction.', 'self-blessing'],
  ['Your focus turns to money, possessions and self-worth.', 'prosperity'],
  ['Your focus turns to learning, writing, siblings and your local world.', 'word magic'],
  ['Your focus turns to home, family and roots; a time to nest or move.', 'hearth magic'],
  ['Your focus turns to creativity, romance, children and joy.', 'creative magic'],
  ['Your focus turns to work, health and daily routines.', 'health work'],
  ['Your focus turns to partnership and one-to-one relationships.', 'partnership magic'],
  ['Your focus turns to intimacy, shared resources and inner change.', 'shadow work'],
  ['Your focus turns to travel, study and meaning.', 'journey magic'],
  ['Your focus turns to career, reputation and public life.', 'career magic'],
  ['Your focus turns to friends, groups and hopes.', 'community magic'],
  ['Your focus turns inward: rest, retreat, spirituality and endings.', 'dreamwork'],
];

/** The progressed Moon through each natal house. Key: `house|${n}`. */
export const PROGRESSED_MOON_HOUSE: InterpretationTable = Object.fromEntries(
  PROGRESSED_HOUSE.map(([line, magic], i) => [
    `house|${i + 1}`,
    {
      simple: line,
      detailed: `${line} The progressed Moon spends roughly two to three years in each house of your natal chart, so it marks a chapter, not a day.\n\nThat house's matters are where your emotional life gathers now: what you need, what you notice, what you tend. Planets in the house will be touched as the Moon passes them.`,
      magic: `Lean on ${magic} in this chapter, and on the ${ORD[i]} house's own correspondences.`,
    },
  ]),
);

const PHASE: Record<ProgressedPhase, [string, string]> = {
  New: ['A new thirty-year cycle begins: seeds, instinct and starting again, often without knowing where it leads.', 'new-moon intentions'],
  Crescent: ['Struggling forward: the new direction meets resistance from the old, and you push on.', 'courage spells'],
  'First Quarter': ['Crisis in action: you build, decide and commit to the direction.', 'action and commitment work'],
  Gibbous: ['Refining: you improve, study and perfect what you are building.', 'refining and study'],
  Full: ['Fulfilment and awareness: what you built is seen, and relationships mirror it back.', 'full-moon charging and gratitude'],
  Disseminating: ['Sharing: you teach and spread what you learned.', 'teaching and blessing'],
  'Last Quarter': ['Turning away: old structures are questioned and you begin to let go.', 'release work'],
  Balsamic: ['Closing: rest, wisdom and endings before a new cycle; a time for spirit and solitude.', 'dark-moon rest and banishing'],
};

/** The progressed lunar phase. Key: `phase|${phase}`. */
export const PROGRESSED_PHASE_READINGS: InterpretationTable = Object.fromEntries(
  (Object.keys(PHASE) as ProgressedPhase[]).map((p) => [
    `phase|${p}`,
    {
      simple: PHASE[p][0],
      detailed: `${PHASE[p][0]}\n\nThe progressed Sun and Moon make a full cycle of phases in about thirty years, each phase lasting three to four years. Dane Rudhyar, who popularised the idea, read it as the great rhythm of a life; the ${p.toLowerCase()} phase is one season of it.`,
      magic: `In this phase, ${PHASE[p][1]} match the season of your life, as they match the Moon's own phase each month.`,
      sources: 'Dane Rudhyar, The Lunation Cycle (1967).',
    },
  ]),
);
