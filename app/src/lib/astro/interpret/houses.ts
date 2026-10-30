// The twelve houses: what each part of life is, as the glossary and the
// chart reading tell it. Complete content (phase 1).

import type { HouseMeaning } from './types.ts';

const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
/** "seventh house": kept here, apart from the reading tables, so light modules can use it. */
export const ordinalHouse = (n: number) => `${ORDINAL[n - 1]} house`;

export const HOUSE_MEANINGS: HouseMeaning[] = [
  {
    house: 1,
    name: 'The house of self',
    keywords: ['body', 'appearance', 'temperament', 'beginnings', 'vitality'],
    kind: 'angular',
    naturalSign: 'Aries',
    simple: 'The first house is you: your body, your way of meeting the world, and how life begins for you. It starts at the Ascendant.',
    detailed:
      'Called the hōroskopos or "helm" by Hellenistic astrologers, the first house shows life, the body, health and character, and the direction of a life overall. Planets here colour how you come across and are hard to hide. It is the joy of Mercury, who was said to rejoice here. Modern astrology reads the self-image, the persona and personal initiative.',
    magic: 'Planets here are part of your personal power: lean on their days, hours and correspondences in any working for yourself. Self-blessing, glamour and protection of the body begin here.',
  },
  {
    house: 2,
    name: 'The house of resources',
    keywords: ['money', 'possessions', 'values', 'self-worth', 'livelihood'],
    kind: 'succedent',
    naturalSign: 'Taurus',
    simple: 'The second house is what you have and what you value: money, belongings, skills you earn by, and your sense of worth.',
    detailed:
      'The Hellenistic "gate of Hades" (as the house after the rising one, under the earth) and the house of livelihood. Traditional readers looked here for wealth, how it comes and goes. Modern astrology adds values, self-esteem and the body\'s comforts.',
    magic: 'Prosperity work, money jars and abundance spells. A planet here suggests the means: Venus through art or pleasant work, Mars through effort, Mercury through words and trade.',
  },
  {
    house: 3,
    name: 'The house of communication',
    keywords: ['siblings', 'neighbours', 'short journeys', 'learning', 'speech', 'writing'],
    kind: 'cadent',
    naturalSign: 'Gemini',
    simple: 'The third house is your near world: siblings, neighbours, daily travel, early learning, and how you speak and write.',
    detailed:
      'The joy of the Moon, called the "goddess" house by Hellenistic astrologers, linked with rites and omens as well as siblings and short travel. Modern astrology reads the everyday mind, learning, local community and communication habits.',
    magic: 'Word magic, letter spells, petition writing, travel protection and divination by signs and omens.',
  },
  {
    house: 4,
    name: 'The house of home and roots',
    keywords: ['home', 'family', 'ancestors', 'land', 'endings', 'private life'],
    kind: 'angular',
    naturalSign: 'Cancer',
    simple: 'The fourth house is home and roots: family, ancestry, where you come from and the private self. It begins at the IC, the bottom of the chart.',
    detailed:
      'The "subterraneous" angle: parents (especially the father in many old texts), land, buildings, hidden treasure and the end of matters. Modern astrology reads emotional foundations, the inner home and family patterns.',
    magic: 'Hearth and home blessing, house protection, ancestor altars, land spirits and burying spells. A planet here shows what your home asks of you.',
  },
  {
    house: 5,
    name: 'The house of pleasure and creation',
    keywords: ['children', 'creativity', 'play', 'romance', 'joy', 'risk'],
    kind: 'succedent',
    naturalSign: 'Leo',
    simple: 'The fifth house is joy: creativity, play, romance, children and whatever you make for the love of it.',
    detailed:
      'The joy of Venus, "good fortune" in Hellenistic astrology, the house of children, pleasure, feasts and gifts. Modern astrology reads self-expression, love affairs, hobbies, games and the inner child.',
    magic: 'Creative magic, art as offering, fertility (of any kind), love that delights, and glamour for joy rather than gain.',
  },
  {
    house: 6,
    name: 'The house of work and health',
    keywords: ['daily work', 'health', 'routine', 'service', 'animals', 'illness'],
    kind: 'cadent',
    naturalSign: 'Virgo',
    simple: 'The sixth house is daily life: work and routines, health and illness, service, and the care of animals.',
    detailed:
      'The joy of Mars, called "bad fortune" in Hellenistic astrology: injury, illness, servants and toil. Modern astrology has softened it into daily habits, the body\'s maintenance, work conditions and service.',
    magic: 'Healing work (beside proper care), herbalism, cleansing, kitchen and household magic, familiars and working animals, and spells for steady work.',
  },
  {
    house: 7,
    name: 'The house of partnership',
    keywords: ['marriage', 'partners', 'contracts', 'open enemies', 'others'],
    kind: 'angular',
    naturalSign: 'Libra',
    simple: 'The seventh house is the people you face one to one: partners, spouses, close collaborators, and open rivals. It begins at the Descendant.',
    detailed:
      'The setting place: marriage, partnerships, lawsuits and open enemies in traditional astrology. Modern astrology reads committed relationship, what we seek and project in others, and contracts.',
    magic: 'Partnership blessings, handfasting, contract spells, reconciliation, and work on how you relate.',
  },
  {
    house: 8,
    name: 'The house of death and shared things',
    keywords: ['death', 'inheritance', 'debts', 'shared resources', 'intimacy', 'the occult'],
    kind: 'succedent',
    naturalSign: 'Scorpio',
    simple: 'The eighth house is what is shared and what ends: other people\'s money, debts and inheritance, intimacy, death and transformation.',
    detailed:
      'The "idle place" and house of death in Hellenistic astrology, also inheritance and the spouse\'s resources. Modern astrology reads merging, sexuality, crisis, psychology, the occult and rebirth.',
    magic: 'Shadow work, death and ancestor work, rites of passage, debt and inheritance matters, and deep transformation.',
  },
  {
    house: 9,
    name: 'The house of faith and far travel',
    keywords: ['religion', 'philosophy', 'higher learning', 'long journeys', 'dreams', 'divination'],
    kind: 'cadent',
    naturalSign: 'Sagittarius',
    simple: 'The ninth house is the far horizon: faith, philosophy, higher learning, long journeys and the search for meaning.',
    detailed:
      'The joy of the Sun, the "god" house of Hellenistic astrology: religion, oracles, dreams, foreign lands and wisdom. Modern astrology reads belief, worldview, publishing and teaching.',
    magic: 'Devotion and deity work, divination and dream oracles, pilgrimage, study of the craft, and travel blessings.',
  },
  {
    house: 10,
    name: 'The house of vocation',
    keywords: ['career', 'reputation', 'public life', 'achievement', 'authority'],
    kind: 'angular',
    naturalSign: 'Capricorn',
    simple: 'The tenth house is your public life: vocation, reputation and what you are known for. In most systems it begins at the Midheaven.',
    detailed:
      'The "midheaven" place, the strongest angle in Hellenistic astrology: action, profession, honour and rulers. Modern astrology reads career, ambition, public image and the parent who shaped your sense of duty.',
    magic: 'Career and recognition work, job spells, reputation and protection in public, and long-term goals.',
  },
  {
    house: 11,
    name: 'The house of friends and hopes',
    keywords: ['friends', 'groups', 'allies', 'hopes', 'benefactors', 'community'],
    kind: 'succedent',
    naturalSign: 'Aquarius',
    simple: 'The eleventh house is your people and your hopes: friends, allies, groups, covens and causes, and the future you wish for.',
    detailed:
      'The joy of Jupiter, the "good spirit" house of Hellenistic astrology: friends, patrons, gifts and hopes. Modern astrology reads community, networks, ideals and collective work.',
    magic: 'Coven and group work, wishing magic, friendship spells and community blessings.',
  },
  {
    house: 12,
    name: 'The house of the hidden',
    keywords: ['solitude', 'secrets', 'retreat', 'sorrow', 'the unconscious', 'spirituality'],
    kind: 'cadent',
    naturalSign: 'Pisces',
    simple: 'The twelfth house is what is hidden: solitude, retreat, secrets, sorrows, dreams and the life of the spirit.',
    detailed:
      'The joy of Saturn, the "bad spirit" house of Hellenistic astrology: confinement, hidden enemies, grief and self-undoing. Modern astrology reads the unconscious, retreat, compassion, institutions and mysticism.',
    magic: 'Solitary practice, meditation, dreamwork, hidden and protective magic, retreat, and the spirit world.',
  },
];
