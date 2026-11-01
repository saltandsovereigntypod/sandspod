// The chart ruler: the planet that rules the rising sign. Keys:
//   keys.chartRuler(planet)       'Mars|ruler'   the chart ruler is this planet
//   keys.rulerInHouse(planet, n)  'Mars|house|10' the chart ruler in a house
// Written for the seven traditional rulers and the three modern ones
// (Uranus for Aquarius, Neptune for Pisces, Pluto for Scorpio rising), in
// every house. Complete.

import type { ChartPointName } from '../signs.ts';
import { HOUSE_MEANINGS } from './houses.ts';
import { keys, type InterpretationTable } from './types.ts';

type RulerVoice = { rising: string; simple: string; detailed: string; style: string; magic: string };

const RULERS: Partial<Record<ChartPointName, RulerVoice>> = {
  Sun: {
    rising: 'Leo',
    simple: 'With Leo rising, the Sun rules your chart: your life is steered by purpose, warmth and the wish to shine.',
    detailed: 'The Sun as chart ruler makes the whole chart turn on identity and vitality: you live best when you are wholehearted, creative and visible. Its sign and house show where you are meant to shine, and your health follows your sense of purpose.',
    style: 'by shining, leading and creating',
    magic: 'The Sun is your personal ruler: Sundays, the hour of the Sun, gold and sunflowers are always yours to call on.',
  },
  Moon: {
    rising: 'Cancer',
    simple: 'With Cancer rising, the Moon rules your chart: your life follows feeling, care and the tides of your moods.',
    detailed: 'The Moon as chart ruler makes the whole chart responsive and changeable: your direction shifts with your needs and the people you care for. Its sign, house and phase at birth say a great deal about your life, and the monthly Moon cycle will affect you more than most.',
    style: 'by caring, sensing and belonging',
    magic: 'The Moon is your personal ruler: Mondays, the lunar phases, silver and moon water are always yours.',
  },
  Mercury: {
    rising: 'Gemini or Virgo',
    simple: 'With Gemini or Virgo rising, Mercury rules your chart: your life is steered by curiosity, learning and skill.',
    detailed: 'Mercury as chart ruler makes the mind the engine of your life: you find your way by thinking, talking, studying and making. Its sign and house show what you most need to learn and where you use your wits; its retrogrades will often be noticeable for you.',
    style: 'by learning, speaking and making',
    magic: 'Mercury is your personal ruler: Wednesdays, the hour of Mercury, ink, agate and lavender are always yours.',
  },
  Venus: {
    rising: 'Taurus or Libra',
    simple: 'With Taurus or Libra rising, Venus rules your chart: your life is steered by love, beauty, pleasure and relationships.',
    detailed: 'Venus as chart ruler makes harmony and value central: you find your way through relationships, art and what you love. Its sign and house show where you seek beauty and connection, and how you attract what you need.',
    style: 'by loving, harmonising and enjoying',
    magic: 'Venus is your personal ruler: Fridays, the hour of Venus, roses, copper and rose quartz are always yours.',
  },
  Mars: {
    rising: 'Aries (or Scorpio, traditionally)',
    simple: 'With Aries (or, traditionally, Scorpio) rising, Mars rules your chart: your life is steered by drive, courage and challenge.',
    detailed: 'Mars as chart ruler makes action the theme of your life: you find your way by doing, competing and defending. Its sign and house show where you fight, and where your energy goes; looking after your body and your temper matters.',
    style: 'by acting, striving and protecting',
    magic: 'Mars is your personal ruler: Tuesdays, the hour of Mars, red candles, iron and carnelian are always yours.',
  },
  Jupiter: {
    rising: 'Sagittarius (or Pisces, traditionally)',
    simple: 'With Sagittarius (or, traditionally, Pisces) rising, Jupiter rules your chart: your life is steered by faith, growth and the search for meaning.',
    detailed: 'Jupiter as chart ruler gives an expansive life direction: you find your way through learning, travel, generosity and belief. Its sign and house show where you grow and where luck tends to find you.',
    style: 'by seeking, teaching and growing',
    magic: 'Jupiter is your personal ruler: Thursdays, the hour of Jupiter, blue and purple, oak and sage are always yours.',
  },
  Saturn: {
    rising: 'Capricorn (or Aquarius, traditionally)',
    simple: 'With Capricorn (or, traditionally, Aquarius) rising, Saturn rules your chart: your life is steered by responsibility, effort and time.',
    detailed: 'Saturn as chart ruler gives a life that matures with age: you find your way through discipline, structure and earned authority, and often feel younger as you grow older. Its sign and house show where you build and what you must master.',
    style: 'by building, enduring and mastering',
    magic: 'Saturn is your personal ruler: Saturdays, the hour of Saturn, black candles, salt and onyx are always yours.',
  },
  Uranus: {
    rising: 'Aquarius (in modern astrology)',
    simple: 'With Aquarius rising, modern astrologers name Uranus as co-ruler beside Saturn: your life is steered by freedom, originality and change.',
    detailed: 'Uranus as modern chart ruler adds a need to be different and to break new ground. Traditional astrologers read Saturn alone; many modern readers weigh both, Saturn for structure and Uranus for the sudden turns.',
    style: 'by innovating, rebelling and freeing',
    magic: 'Uranus adds storm water, clear quartz and sudden inspiration to your personal magic.',
  },
  Neptune: {
    rising: 'Pisces (in modern astrology)',
    simple: 'With Pisces rising, modern astrologers name Neptune as co-ruler beside Jupiter: your life is steered by imagination, compassion and spirit.',
    detailed: 'Neptune as modern chart ruler adds a dreamy, porous quality to your life\'s direction. Traditional astrologers read Jupiter alone; many modern readers weigh both, Jupiter for faith and growth and Neptune for vision and surrender.',
    style: 'by dreaming, healing and dissolving',
    magic: 'Neptune adds sea water, amethyst and dreamwork to your personal magic.',
  },
  Pluto: {
    rising: 'Scorpio (in modern astrology)',
    simple: 'With Scorpio rising, modern astrologers name Pluto as co-ruler beside Mars: your life is steered by depth, power and transformation.',
    detailed: 'Pluto as modern chart ruler adds intensity and repeated rebirths to your life\'s direction. Traditional astrologers read Mars alone; many modern readers weigh both, Mars for courage and Pluto for depth.',
    style: 'by transforming, uncovering and renewing',
    magic: 'Pluto adds obsidian, the dark moon and shadow work to your personal magic.',
  },
};

export const RULER_PLANETS = Object.keys(RULERS) as ChartPointName[];

const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];

const HOUSE_DIRECTION = [
  'Life is about you: your body, your presence and becoming yourself. You are your own project, and your personality is hard to miss.',
  'Life is drawn to resources and worth: earning, owning, building security and knowing what you value.',
  'Life is drawn to learning, talking, writing and your local world: siblings, neighbours and the daily round.',
  'Life is drawn home: family, roots, property and the private self. Many with this placement come into their own later in life.',
  'Life is drawn to creativity, pleasure, romance and children: making things and enjoying them.',
  'Life is drawn to work, service, health and craft: being useful and doing things well.',
  'Life is drawn to others: partnership, marriage, collaboration and the people who mirror you.',
  'Life is drawn to depth: intimacy, shared resources, crisis, death and rebirth, and the hidden.',
  'Life is drawn to the far horizon: travel, study, faith, philosophy and teaching.',
  'Life is drawn to career and public life: achievement, reputation and leaving a mark.',
  'Life is drawn to friends, groups and causes: community, networks and hopes for the future.',
  'Life is drawn inward and behind the scenes: solitude, spirit, retreat, healing and the unseen.',
];

function build(): InterpretationTable {
  const out: InterpretationTable = {};
  for (const planet of RULER_PLANETS) {
    const r = RULERS[planet]!;
    out[keys.chartRuler(planet)] = {
      simple: r.simple,
      detailed: `${r.detailed}\n\nThe chart ruler is the planet that rules your rising sign (${r.rising}). Ancient astrologers called it the ruler of the Hour, and read its condition (its sign, house, speed and aspects) as the condition of the whole life.`,
      magic: r.magic,
    };
    for (const h of HOUSE_MEANINGS) {
      const n = h.house;
      out[keys.rulerInHouse(planet, n)] = {
        simple: `${planet} rules your chart from the ${ORD[n - 1]} house. ${HOUSE_DIRECTION[n - 1]}`,
        detailed: `${HOUSE_DIRECTION[n - 1]} You meet it ${r.style}: ${planet}'s way.\n\nThe chart ruler's house is where the whole chart is "sent": the area of life your rising sign's energy is spent on. ${h.kind === 'angular' ? 'An angular house makes the ruler strong and visible.' : h.kind === 'succedent' ? 'A succedent house makes the ruler steady and accumulating.' : 'A cadent house makes the ruler work through learning, service or quiet adjustment.'} Read this with ${planet}'s sign and aspects.`,
        magic: `${r.magic} Aim your personal workings at ${h.keywords.slice(0, 3).join(', ')}. ${h.magic}`,
      };
    }
  }
  return out;
}

export const RULER_READINGS: InterpretationTable = build();
