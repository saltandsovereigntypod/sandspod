// The twelve houses: what each part of life is, as the glossary and the
// chart reading tell it. Complete content (phase 1); the Detailed text and the
// fuller craft text were deepened after owner feedback (several paragraphs
// each: traditional and modern meanings, what the house shows in a life, its
// strength as an angular, succedent or cadent house, how the cusp sign, its
// ruler and planets there colour it, and workings, timing, offerings and
// correspondences for the craft).
//
// Traditional names and meanings follow Vettius Valens (Anthology), Paulus
// Alexandrinus (Introduction), Firmicus Maternus (Mathesis) and, for the
// medieval and Renaissance readings, Abu Ma'shar and William Lilly
// (Christian Astrology, 1647). "Hellenistic" here always means the historical
// period of Greek-speaking astrology, never Hellenic religion.

import type { Classical } from '../signs.ts';
import type { HouseMeaning } from './types.ts';

const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
/** "seventh house": kept here, apart from the reading tables, so light modules can use it. */
export const ordinalHouse = (n: number) => `${ORDINAL[n - 1]} house`;

/** The first mention of the Hellenistic astrologers in a reading, said so no one mistakes it for Hellenic religion. */
export const HELLENISTIC_ASTROLOGERS =
  'the Hellenistic astrologers (the Greek-speaking astrologers of the late ancient Mediterranean, from about the first century BCE, where Western astrology began)';

/** What each kind of house means for the planets in it: one shared paragraph per kind. */
export const HOUSE_KIND_TEXT: Record<HouseMeaning['kind'], string> = {
  angular:
    'This is an angular house, one of the four that begin at the angles of the chart (the Ascendant, the IC, the Descendant and the Midheaven). Traditional astrologers counted the angles the strongest places in a chart: planets here act soonest and most visibly, and what they promise tends to happen in the open, where other people can see it. Modern astrologers link the angular houses with the cardinal signs and with initiative. A planet within a few degrees of the angle itself is one of the loudest voices in the whole chart.',
  succedent:
    'This is a succedent house, one of the four that follow (succeed) the angles. Traditionally these were places of middling strength: what an angle begins, the house after it gathers, holds and builds on, which is why so many succedent houses are about resources of one kind or another. Modern astrologers link them with the fixed signs and with staying power. Planets here tend to work steadily and over time, through what accumulates, rather than through sudden events.',
  cadent:
    'This is a cadent house, one of the four that fall away (from the Latin cadere, to fall) from the angles. Traditional astrologers counted these the weakest places, where planets struggle to act out in the world and work in the background instead. Modern astrologers link them with the mutable signs and read them as houses of learning, adjustment and preparation. Some also point to Michel Gauquelin\'s twentieth-century statistical studies, which found planets just past the rising and culminating points (so in the twelfth and ninth houses) unusually often in the charts of eminent people, though those results are still argued over. Read planets here as quietly influential rather than simply weak.',
};

/** A house traditionally in aversion to the Ascendant: it makes no classical aspect to the first house. */
const AVERSION =
  'Traditionally this is also one of the four houses (the second, sixth, eighth and twelfth) that make no classical aspect to the Ascendant. Older astrologers said such places "cannot see" the native, so their matters can feel harder to steer directly.';

export const HOUSE_MEANINGS: HouseMeaning[] = [
  {
    house: 1,
    name: 'The house of self',
    keywords: ['body', 'appearance', 'temperament', 'beginnings', 'vitality'],
    kind: 'angular',
    naturalSign: 'Aries',
    joy: 'Mercury',
    simple: 'The first house is you: your body, your way of meeting the world, and how life begins for you. It starts at the Ascendant.',
    detailed: [
      `In traditional astrology the first house is the hōroskopos, the "hour-marker", which ${HELLENISTIC_ASTROLOGERS} also called the helm of the chart: the place that steers everything else. It shows life itself, the body and its health, the temperament, the face and manner, and the general direction a life takes. It is the joy of Mercury, the house where Mercury was said to rejoice, because the first breath is where the mind and the body first meet the world. Medieval astrologers such as Abu Ma'shar and, later, William Lilly read it for the native's life, stature and complexion, and for the start of any matter.`,
      'Modern astrology reads the first house as the self-image and the persona: the part of you people meet first, your instinctive way of starting things, your physical energy and how you take up space. Psychological astrologers see it as the mask that is also a real face, the style you have grown into because it worked.',
      'In a life, the first house shows how you arrive: whether you walk into a room quietly or announce yourself, how quickly you act, how robust or sensitive your body is, and how you handle new beginnings of any kind, from new jobs to new places. Because it starts at the Ascendant, which moves a degree about every four minutes, it is the most personal house in the chart and the one most dependent on an accurate birth time.',
      HOUSE_KIND_TEXT.angular,
      'The sign on the cusp is your rising sign, and its ruler is the ruler of the whole chart, so the first house is read twice over: through the rising sign\'s manner and through wherever that ruler sits. Planets in the first house are hard to hide. They show in the body and the face, in first impressions and in how you meet challenges: Mars here often gives a quick, bold manner, Venus a pleasing one, Saturn a reserved and serious one, the Moon a changeable and responsive one. A planet close to the Ascendant itself is especially strong and may describe you better than your Sun sign does.',
    ].join('\n\n'),
    magic: 'Planets here are part of your personal power: lean on their days, hours and correspondences in any working for yourself. Self-blessing, glamour and protection of the body begin here.',
    craft: 'The first house is the house of workings for yourself: self-blessing, glamour, protection of the body, health and vitality spells, and any rite of new beginning or new identity, such as a dedication, a name taken in the craft, or a new chapter of life. Time them by your chart ruler: its day of the week and its planetary hours (see the Hours tool) are your strongest personal times, and the days when the Moon passes over your Ascendant each month are good for small acts of self-care and renewal. A rising-sign altar is a good start: a candle in your rising sign\'s colour, a stone for the chart ruler, and an object that stands for your body and your face to the world. Rosemary for clarity and protection, Basil and Carnelian for courage in beginnings, and Clear Quartz as a general amplifier all suit first-house work, and a simple offering of water and bread to the start of each new year of your life (your birthday, or your solar return) honours it.',
  },
  {
    house: 2,
    name: 'The house of resources',
    keywords: ['money', 'possessions', 'values', 'self-worth', 'livelihood'],
    kind: 'succedent',
    naturalSign: 'Taurus',
    simple: 'The second house is what you have and what you value: money, belongings, skills you earn by, and your sense of worth.',
    detailed: [
      `${HELLENISTIC_ASTROLOGERS[0].toUpperCase()}${HELLENISTIC_ASTROLOGERS.slice(1)} called the second house the "gate of Hades" in some texts, as the house that rises next after the Ascendant (it is still below the horizon, under the earth). Its main meaning was livelihood: the native's possessions, the means of living, and how wealth comes and goes. Medieval and Renaissance astrologers kept this, reading the second house for riches, movable goods (what you can carry, as opposed to land, which belongs to the fourth), loans and the profit of any undertaking. In horary astrology it shows the querent's money and things they own.`,
      'Modern astrology widens it from money to values: what you consider worth having, your sense of your own worth, your talents and earning skills, and your relationship with comfort, the body\'s pleasures and security. Many astrologers read it as the house of what you can rely on, whether that is savings, a trade or simply a steady sense of being enough.',
      'In a life, the second house shows how you earn and spend, whether money comes easily or by effort, what you hold on to and what you let go, and what you are prepared to work for. It is also where many people meet their questions about self-worth: whether they charge enough, give themselves permission to enjoy what they have, or feel safe only when they own more.',
      HOUSE_KIND_TEXT.succedent,
      AVERSION,
      'The sign on the cusp describes your style with resources: a fire sign spends and earns boldly, an earth sign steadily, an air sign through ideas and trade, a water sign through feeling and care. The cusp ruler shows where your money comes from, by its house: in the tenth through career, in the seventh through partners or clients, in the sixth through daily work. Planets here colour the means: Venus through art, beauty or pleasant work, Mars through effort and enterprise, Mercury through words and trade, Jupiter through generosity and growth, Saturn through patience and slow building. With no planets here, read the cusp sign and its ruler: an empty second house is not a sign of poverty.',
    ].join('\n\n'),
    magic: 'Prosperity work, money jars and abundance spells. A planet here suggests the means: Venus through art or pleasant work, Mars through effort, Mercury through words and trade.',
    craft: 'Second-house magic is prosperity and security work: money jars and bowls, abundance grids, candle spells for steady income, blessings for the tools you earn by, and spells for self-worth, which often unlock the rest. Work while the Moon is waxing for increase and while it wanes to clear debt or a scarcity habit; Thursdays (Jupiter) for growth and Fridays (Venus, who rules the natural second sign, Taurus) for comfort and value; and the hours of your second-house ruler, found with the Hours tool. Correspondences: Basil, Cinnamon, Mint and Patchouli among herbs; Citrine, Pyrite and Green Aventurine among stones; green and gold candles; a coin from your first wage or a recent payment on the altar. A small regular offering, such as the first coin of each month set aside, or bread and honey left out with thanks, keeps the house fed. Be honest about what you ask for: the old texts link this house with the means of living, not wealth for its own sake.',
  },
  {
    house: 3,
    name: 'The house of communication',
    keywords: ['siblings', 'neighbours', 'short journeys', 'learning', 'speech', 'writing'],
    kind: 'cadent',
    naturalSign: 'Gemini',
    joy: 'Moon',
    simple: 'The third house is your near world: siblings, neighbours, daily travel, early learning, and how you speak and write.',
    detailed: [
      `${HELLENISTIC_ASTROLOGERS[0].toUpperCase()}${HELLENISTIC_ASTROLOGERS.slice(1)} called the third house the house of the Goddess (thea), and it is the joy of the Moon, who rejoices here. As well as brothers, sisters, relatives and friends, it was linked with rites, religious duties and omens: the everyday, close-to-home side of religion, as opposed to the great temples and oracles of its opposite, the ninth house of the God. Medieval and Renaissance astrologers such as Lilly read it for brethren, sisters, kindred, neighbours, short journeys and inland travel, letters, rumours and messengers.`,
      'Modern astrology keeps siblings, neighbours and short trips and adds the everyday mind: how you think, learn, speak, write and listen, your early schooling, your local community, and the habits of communication you grew up with. It is the house of the commute, the group chat, the corner shop and the notebook.',
      'In a life, the third house shows how you take in information and pass it on, how you got on with siblings and cousins (and how you still do), how much you move around your own area, and whether learning came easily in childhood. It describes the texture of ordinary days: errands, messages, small conversations and the people you see without planning to.',
      HOUSE_KIND_TEXT.cadent,
      'The sign on the cusp describes your way with words and the near world: Gemini or Virgo quick and curious, Taurus slow and sure, Scorpio probing, Sagittarius blunt and broad. Its ruler, by sign and house, shows where your thinking most likes to go. Planets here colour the mind and the neighbourhood: Mercury here is at home and talkative, the Moon (in her joy) gives a feeling, intuitive mind and close ties with siblings, Mars sharp speech and quick travel, Saturn careful, serious study and sometimes a distant or burdened sibling bond, Jupiter a love of learning and fortunate short journeys. An empty third house still speaks through its cusp and ruler.',
    ].join('\n\n'),
    magic: 'Word magic, letter spells, petition writing, travel protection and divination by signs and omens.',
    craft: 'The third house is the house of word magic and small daily omens: petitions and letter spells, sigils, written charms carried in a pocket, blessings for a car or a bike or a daily route, spells for study and exams, and reconciliation with a sibling or neighbour. As the Moon\'s joy and the old house of the Goddess, it also suits everyday devotion and simple omen-reading: noticing birds, overheard words and signs on a walk, keeping an omen diary, or a short tea-leaf reading at the kitchen table. Wednesdays and Mercury hours suit it, as do Mondays and Moon hours for its omen side; the waxing Moon helps learning and messages to land. Correspondences: Lavender, Mint, Peppermint and Fennel; Fluorite for study, Blue Lace Agate and Sodalite for clear speech; yellow candles, good paper and coloured ink. Offer a written thank-you, or a coin at a local crossroads, to the spirits of your own streets.',
  },
  {
    house: 4,
    name: 'The house of home and roots',
    keywords: ['home', 'family', 'ancestors', 'land', 'endings', 'private life'],
    kind: 'angular',
    naturalSign: 'Cancer',
    simple: 'The fourth house is home and roots: family, ancestry, where you come from and the private self. It begins at the IC, the bottom of the chart.',
    detailed: [
      `${HELLENISTIC_ASTROLOGERS[0].toUpperCase()}${HELLENISTIC_ASTROLOGERS.slice(1)} called the fourth house the subterraneous place (hypogeion), the angle under the earth. It shows the parents (the father especially in many old texts), land, houses and buildings, inheritance of property, things hidden underground including buried treasure, and the end of matters: how a life, or any undertaking, finally turns out. Lilly read it for the father, lands, houses, towns, fields and gardens, mines and the grave, and the end of anything.`,
      'Modern astrology reads the fourth house as emotional foundations: the home you grew up in and the one you make, family patterns, ancestry and heritage, your private life and the self you are when nobody is watching. Many astrologers read it for the nurturing parent, while others keep the older reading of the father; it is best read for whichever parent most shaped your sense of home.',
      'In a life, the fourth house shows what home means to you and where you feel rooted, how you relate to your family and its history, your relationship with land and place, and how you end things and grow old. Because it is the lowest point of the chart, it is also the base everything else stands on: an unsettled fourth house is often felt as restlessness that no outer success settles.',
      HOUSE_KIND_TEXT.angular,
      'The sign on the IC, the cusp of the fourth house, describes the atmosphere of home: Cancer or Taurus warm and settled, Capricorn structured and dutiful, Aries lively and sometimes combative, Aquarius unconventional, Pisces porous and dreamy. Its ruler, by sign and house, shows where you find your roots, which may be far from your family home. Planets here colour home and family: the Moon at home here and deeply attached, Saturn duty and sometimes a hard or distant parent, Jupiter a generous home and often property, Mars a lively or quarrelsome household, Venus a love of a beautiful home. A planet near the IC itself often shows in the second half of life.',
    ].join('\n\n'),
    magic: 'Hearth and home blessing, house protection, ancestor altars, land spirits and burying spells. A planet here shows what your home asks of you.',
    craft: 'Fourth-house magic is hearth, land and ancestors: blessing and protecting a home, house cleansing, an ancestor altar with photographs, names or keepsakes, offerings to the spirits of the land you live on, and spells that are buried or kept under the threshold or in the garden. Mondays and Moon hours suit it (the Moon rules Cancer, its natural sign), as do dark and new Moons for ancestor and endings work and the full Moon for blessing a house. Correspondences: Rosemary and Bay (laurel) by the door, Hyssop and Sage for cleansing, Juniper for protection, Moonstone and Selenite for the home, Jet and Smoky Quartz for ancestors and grounding, and Salt for the threshold. Offer water, bread, a little of each family meal or a candle on an anniversary to your dead, and something from the kitchen to the house itself. If your family history is painful, the fourth house also holds the home and kin you choose: tend those too.',
  },
  {
    house: 5,
    name: 'The house of pleasure and creation',
    keywords: ['children', 'creativity', 'play', 'romance', 'joy', 'risk'],
    kind: 'succedent',
    naturalSign: 'Leo',
    joy: 'Venus',
    simple: 'The fifth house is joy: creativity, play, romance, children and whatever you make for the love of it.',
    detailed: [
      `${HELLENISTIC_ASTROLOGERS[0].toUpperCase()}${HELLENISTIC_ASTROLOGERS.slice(1)} called the fifth house Good Fortune (agathē tychē), and it is the joy of Venus, who rejoices here. It was the house of children, pleasure, feasting, gifts and the good things life brings. Medieval and Renaissance astrologers read it for children and pregnancy, pleasure, entertainments, taverns and banquets, gifts, and, in horary, messengers and ambassadors. It was one of the good houses, easy on the planets placed there.`,
      'Modern astrology reads the fifth house as self-expression and creativity: art, performance, play, hobbies, games, love affairs and romance, children and the inner child, and what you do purely because it delights you. It is also the house of taking a chance: speculation, gambling and risks taken for the thrill of it.',
      'In a life, the fifth house shows how you play, what you create and how freely you share it, your experience of children (your own, other people\'s, or creative work as offspring), and the tone of your romances, especially the early, courting stage of love. A strong fifth house often shows a person who needs a creative outlet to stay well.',
      HOUSE_KIND_TEXT.succedent,
      'The sign on the cusp describes how you take your pleasure and make things: Leo or Aries boldly and visibly, Taurus through the senses and handwork, Virgo through craft and detail, Pisces through dream and music. Its ruler, by house, shows where joy and creativity are drawn: in the ninth through travel and study, in the eleventh through friends and groups. Planets here colour play, love and children: Venus (in her joy) brings charm, art and happy romance, the Sun creative pride and a need to shine, Jupiter generosity and often children or students, Mars passionate, competitive play, Saturn serious creative discipline and sometimes delayed or careful parenthood. An empty fifth house is read through its cusp and ruler, not as an absence of joy.',
    ].join('\n\n'),
    magic: 'Creative magic, art as offering, fertility (of any kind), love that delights, and glamour for joy rather than gain.',
    craft: 'Fifth-house magic is creative and joyful: art made as an offering, music, dance and song in ritual, fertility magic (for children, or for any project you want to bring to life), love spells that ask for delight rather than control, glamour for pleasure, and blessings for children in your care. It is the right house to remember that ritual can be fun. Sundays and Sun hours suit it (the Sun rules Leo, its natural sign), and Fridays and Venus hours for its love and pleasure side; the waxing and full Moon favour creation and celebration, and Beltane and the height of summer are its festivals. Correspondences: Sunflower, Calendula, Rose and Orange; Carnelian and Sunstone for creative fire, Rose Quartz for love, Citrine for joy; gold and orange candles. Offer what you made: a song, a painting, a cake shared with friends. A feast is one of the oldest offerings there is.',
  },
  {
    house: 6,
    name: 'The house of work and health',
    keywords: ['daily work', 'health', 'routine', 'service', 'animals', 'illness'],
    kind: 'cadent',
    naturalSign: 'Virgo',
    joy: 'Mars',
    simple: 'The sixth house is daily life: work and routines, health and illness, service, and the care of animals.',
    detailed: [
      `${HELLENISTIC_ASTROLOGERS[0].toUpperCase()}${HELLENISTIC_ASTROLOGERS.slice(1)} called the sixth house Bad Fortune (kakē tychē), and it is the joy of Mars, who rejoices in this house of toil and trouble. It showed illness and injury, enemies of lower standing, slaves and servants, and hard labour. Medieval and Renaissance astrologers read it for sickness and its causes, servants and employees, small animals (sheep, goats, pets) and the work of tenants and labourers. It was counted a difficult place, weak for the planets there.`,
      'Modern astrology has softened it into the house of daily life: work routines and conditions, habits, health and the body\'s upkeep, diet and exercise, service to others, colleagues and employees, and pets and working animals. Many astrologers read it as the house where we learn skills by repetition and improve things one small step at a time.',
      'In a life, the sixth house shows how you work day to day, how you get on with colleagues, how your health tends to go and what wears you down, and the kind of routines that keep you well. It is also where people meet the limits of the body and learn to care for it, and where service, given freely or as a job, shapes the self.',
      HOUSE_KIND_TEXT.cadent,
      AVERSION,
      'The sign on the cusp describes your working style and the body\'s needs: Virgo careful and analytical, Capricorn disciplined, Leo proud of good work, Pisces adaptable but in need of rest and boundaries. Its ruler, by sign and house, shows where your daily work leads and what supports your health. Planets here colour work and health: Mars (in his joy) gives energy for hard work and sometimes fevers or strains, Saturn steady endurance and chronic issues to manage, Venus pleasant working conditions, Mercury mental work and nervous strain, the Moon a changeable routine and close bonds with animals. Treat what the chart says about health as a prompt for care, never as a diagnosis.',
    ].join('\n\n'),
    magic: 'Healing work (beside proper care), herbalism, cleansing, kitchen and household magic, familiars and working animals, and spells for steady work.',
    craft: 'Sixth-house magic is practical and daily: healing work alongside proper medical care, herbalism and kitchen magic, cleansing the body and the house, blessings for a workplace or work tools, spells for steady work and good colleagues, and care for familiars, pets and working animals. Small daily rites belong here too: a morning blessing, a cleansing wash, a tidy altar kept clean. Wednesdays and Mercury hours suit it (Mercury rules Virgo, its natural sign), and Tuesdays and Mars hours for its effort and vigour; the waning Moon helps release illness and bad habits, the waxing Moon builds health and new routines. Correspondences: Thyme, Rosemary, Chamomile, Lemon Balm, Nettle and Calendula among herbs; Bloodstone, Fluorite, Moss Agate and Amethyst among stones; green and blue candles. A healing broth or a warm cup offered and then drunk is a sixth-house working in itself. Never let magic replace a doctor or a vet: this house is about tending the body faithfully.',
  },
  {
    house: 7,
    name: 'The house of partnership',
    keywords: ['marriage', 'partners', 'contracts', 'open enemies', 'others'],
    kind: 'angular',
    naturalSign: 'Libra',
    simple: 'The seventh house is the people you face one to one: partners, spouses, close collaborators, and open rivals. It begins at the Descendant.',
    detailed: [
      `${HELLENISTIC_ASTROLOGERS[0].toUpperCase()}${HELLENISTIC_ASTROLOGERS.slice(1)} called the seventh house the setting place (dysis), the angle where planets go down in the west. It showed marriage and the spouse, partnerships, lawsuits and open enemies, and, as the place where the light sets, old age and the approach of death. Medieval and Renaissance astrologers read it for marriage, love and public enemies, partners in business, contracts and lawsuits, and in horary for thieves, fugitives and "the other party" in any question.`,
      'Modern astrology reads the seventh house as committed relationship: marriage and long partnership, business partners, close collaborators, agents and clients, and rivals met face to face. Psychological astrologers add projection: the qualities we look for, or disown and then find, in other people. It is the house of "you" as the first is the house of "I".',
      'In a life, the seventh house shows what you seek in a partner and what you attract, how you behave in close one-to-one relationships, how you handle contracts and agreements, and how you deal with open conflict. It often describes the partner themselves, or the kind of person who keeps arriving in your life until you have learnt what they bring.',
      HOUSE_KIND_TEXT.angular,
      'The sign on the cusp, your Descendant, is always opposite your rising sign: what you meet in others balances the way you meet the world. Aries rising brings Libra on the Descendant, a search for harmony in partners; Leo rising brings Aquarius, a need for independent, unusual partners. Its ruler, by sign and house, shows where you meet partners and how the relationship lives: in the tenth through work, in the ninth abroad or through study. Planets here colour partnership: Venus brings ease and affection, Jupiter generous or fortunate partners, Saturn commitment that is serious, sometimes late, and built to last, Mars passion and conflict, Uranus a need for freedom inside a bond. An empty seventh house does not mean no partner.',
    ].join('\n\n'),
    magic: 'Partnership blessings, handfasting, contract spells, reconciliation, and work on how you relate.',
    craft: 'Seventh-house magic is the magic of two: blessings for a partnership, handfastings and anniversaries, sweetening jars and honey spells for goodwill, reconciliation work, spells to bring a fair contract or a good business partner, and protection in a dispute. Ethical care matters most here: work on the relationship and on yourself, not on another person\'s will, and use the house\'s protective side for honest defence rather than harm. Fridays and Venus hours suit it (Venus rules Libra, its natural sign), the full Moon (Sun and Moon opposite, as partners face each other) for blessing a bond, and the waning Moon for ending a partnership kindly. Correspondences: Rose, Jasmine, Lavender and Vanilla; Rose Quartz, Rhodonite and Emerald; paired candles, two of everything on the altar, pink and green. Share an offering: a cake or a cup made and taken together, or two flowers left side by side.',
  },
  {
    house: 8,
    name: 'The house of death and shared things',
    keywords: ['death', 'inheritance', 'debts', 'shared resources', 'intimacy', 'the occult'],
    kind: 'succedent',
    naturalSign: 'Scorpio',
    simple: 'The eighth house is what is shared and what ends: other people\'s money, debts and inheritance, intimacy, death and transformation.',
    detailed: [
      `${HELLENISTIC_ASTROLOGERS[0].toUpperCase()}${HELLENISTIC_ASTROLOGERS.slice(1)} called the eighth house the idle place (argos topos), the house that follows the setting angle, and read it as the beginning of death: the manner and quality of death, inheritance, and the spouse's goods and dowry. Medieval and Renaissance astrologers read it for death and its kind, wills and legacies, the partner's money, fear and anguish, and debts owed by or to others. It was one of the hard houses, weak and inactive for the planets placed there.`,
      'Modern astrology reads the eighth house as merging and transformation: shared money (a partner\'s income, loans, taxes, investments, inheritance), sexuality and deep intimacy, crisis, psychology, the occult and hidden knowledge, and death and rebirth in every sense. Many astrologers see it as the house where we let others in, and where control has to be given up.',
      'In a life, the eighth house shows how you handle money that is not wholly yours, how you deal with debt, trust and power in close bonds, your experience of loss and grief, your relationship with sex and vulnerability, and your draw to the hidden and the occult. It is often where the biggest inner changes of a life take place, usually after an ending.',
      HOUSE_KIND_TEXT.succedent,
      AVERSION,
      'The sign on the cusp describes how you meet shared things and endings: Scorpio or Capricorn guarded and serious, Aries or Sagittarius brave and quick to move on, Taurus slow to let go, Pisces open and sometimes boundary-less. Its ruler, by sign and house, shows where shared resources and transformation come from: in the seventh through a partner, in the tenth through career. Planets here colour intimacy and change: Pluto or Mars intensity and power struggles that transform, Jupiter inheritance or generous support, Saturn debts and a cautious, careful approach to trust, Venus money or affection through others, the Moon deep emotional bonds and a feeling for the dead. Nothing in this house predicts the timing or manner of anyone\'s death: modern ethical practice does not read it that way.',
    ].join('\n\n'),
    magic: 'Shadow work, death and ancestor work, rites of passage, debt and inheritance matters, and deep transformation.',
    craft: 'Eighth-house magic goes deep: shadow work and journalling, grief rites and letting go of the dead, ancestor and death work, rites of passage, spells to clear debt or settle an inheritance fairly, protection in intimacy and power, and the study of the occult itself. Rebirth work, such as a symbolic burial and rising, belongs here. Tuesdays and Mars hours suit it (Mars is the traditional ruler of Scorpio, its natural sign), the dark and waning Moon for endings, release and talking with the dead, and Samhain and the turn of autumn are its season. Correspondences: Mugwort, Wormwood, Myrrh, Yew (to be honoured, not handled: it is poisonous) and Cypress among plants; Obsidian, Jet, Smoky Quartz and Garnet among stones; black and deep red candles. Offer a lit candle and a glass of water to your dead, and give back something real when you ask for help through a hard change. Take care with heavy work: ground afterwards, and do not work alone on grief that needs a person beside you.',
  },
  {
    house: 9,
    name: 'The house of faith and far travel',
    keywords: ['religion', 'philosophy', 'higher learning', 'long journeys', 'dreams', 'divination'],
    kind: 'cadent',
    naturalSign: 'Sagittarius',
    joy: 'Sun',
    simple: 'The ninth house is the far horizon: faith, philosophy, higher learning, long journeys and the search for meaning.',
    detailed: [
      `${HELLENISTIC_ASTROLOGERS[0].toUpperCase()}${HELLENISTIC_ASTROLOGERS.slice(1)} called the ninth house the house of the God (theos), and it is the joy of the Sun, who rejoices here. It showed religion and the gods, oracles and divination, dreams, travel abroad, foreign lands and wisdom. It is the counterpart of the third house of the Goddess: the great temples and far journeys, where the third holds the local shrine and the daily errand. Medieval and Renaissance astrologers read it for religion, the church and clergy, long voyages, learning and books, dreams and visions, and the spouse's kin.`,
      'Modern astrology reads the ninth house as belief and meaning: philosophy and worldview, religion and spirituality, higher education and universities, law, publishing and teaching, long-distance travel and foreign cultures, and the search for a bigger picture. It is where curiosity becomes a quest.',
      'In a life, the ninth house shows what you believe and how you came to believe it, how you learn once school is over, your experience of travel and of people from other places, and the teachers and teachings that shape you. It often shows how a person relates to a spiritual path, and whether they lead or follow on it.',
      HOUSE_KIND_TEXT.cadent,
      'The sign on the cusp describes how you seek meaning: Sagittarius or Leo with enthusiasm and faith, Virgo through careful study, Scorpio through mysteries, Aquarius through ideas and reform, Cancer through family religion or tradition. Its ruler, by sign and house, shows where your path to meaning leads. Planets here colour faith and travel: the Sun (in his joy) gives a strong, often public, sense of purpose, Jupiter a love of learning and fortunate journeys, the Moon a life lived partly abroad or in dream, Saturn serious study and a hard-won faith, Mercury the scholar and writer, Neptune mysticism and the visionary. An empty ninth house still describes your beliefs, through its cusp and ruler.',
    ].join('\n\n'),
    magic: 'Devotion and deity work, divination and dream oracles, pilgrimage, study of the craft, and travel blessings.',
    craft: 'Ninth-house magic is devotion and divination: deity work and a devotional altar, prayers and hymns, oracles and dream incubation (asking for a dream and recording it), tarot and other divination, pilgrimage to a sacred place, blessings for long journeys and for study, and the study of the craft and its history. Thursdays and Jupiter hours suit it (Jupiter rules Sagittarius, its natural sign), and Sundays and Sun hours honour the Sun in his joy; the full Moon is good for oracles and the waxing Moon for study and travel. Correspondences: Bay (laurel, the leaf of oracles), Frankincense, Sage and Star Anise; Lapis Lazuli, Sodalite, Turquoise and Amethyst; purple, royal blue and gold candles. Offer incense, a reading of a hymn or poem, or a stargazing vigil. When you take up practices from other cultures here, learn how they are taught and respect the closed and living traditions.',
  },
  {
    house: 10,
    name: 'The house of vocation',
    keywords: ['career', 'reputation', 'public life', 'achievement', 'authority'],
    kind: 'angular',
    naturalSign: 'Capricorn',
    simple: 'The tenth house is your public life: vocation, reputation and what you are known for. In most systems it begins at the Midheaven.',
    detailed: [
      `${HELLENISTIC_ASTROLOGERS[0].toUpperCase()}${HELLENISTIC_ASTROLOGERS.slice(1)} called the tenth house the midheaven place (mesouranēma), the highest of the angles, and counted it the strongest place in the chart after the Ascendant: a planet here was "upon" or over-seeing all the others. It showed action and profession, honour and rank, and those who rule. Medieval and Renaissance astrologers read it for kings and magistrates, honour, preferment, the trade or profession, and, in Lilly, the mother.`,
      'Modern astrology reads the tenth house as career and calling: ambition, achievement, public image and reputation, the people in authority over you and the authority you come to hold, and the parent who most shaped your sense of duty and the world\'s expectations. It is what you do in the world and what the world knows you for.',
      'In a life, the tenth house shows the shape of your working life, the kind of recognition you seek, how you deal with bosses and responsibility, and the mark you hope to leave. It is not only paid work: caring, creating, campaigning and running a coven are all tenth-house callings. Planets here often rise into view as life goes on.',
      HOUSE_KIND_TEXT.angular,
      'The sign on the cusp is, in most house systems, the sign of your Midheaven, and describes how you go about your public life: Capricorn ambitious and enduring, Aries pioneering, Libra diplomatic, Pisces artistic or compassionate. (In whole sign houses the tenth is simply the tenth sign from the rising sign, and the Midheaven can fall in the ninth or eleventh.) Its ruler, by sign and house, shows where your calling leads. Planets here are public: the Sun gives a wish to lead and be seen, Jupiter honours and opportunity, Saturn slow, solid achievement and sometimes the weight of responsibility, Mars ambition and competition, Venus success through charm and art, the Moon a public life with ups and downs. An empty tenth house is read through the Midheaven and its ruler.',
    ].join('\n\n'),
    magic: 'Career and recognition work, job spells, reputation and protection in public, and long-term goals.',
    craft: 'Tenth-house magic is career and reputation work: spells for a job or promotion, success and recognition, protection of your good name, blessings for a business or a public project, and rites for long-term goals that will take years. A vision board, a written ten-year aim kept on the altar, or a sigil for your calling all suit it. Saturdays and Saturn hours suit its slow building (Saturn rules Capricorn, its natural sign), Sundays and Sun hours its wish to shine, and noon, when the Sun is at its own midheaven, is the house\'s hour of the day; work with the waxing Moon for growth and the full Moon for recognition. Correspondences: Bay (laurel, the victor\'s leaf), Cinnamon, Cedar and Oak; Tiger Eye, Pyrite, Onyx and Garnet; gold, black and dark green candles. Offer the first fruit of a success: a gift, a donation or a share of your first earnings from new work.',
  },
  {
    house: 11,
    name: 'The house of friends and hopes',
    keywords: ['friends', 'groups', 'allies', 'hopes', 'benefactors', 'community'],
    kind: 'succedent',
    naturalSign: 'Aquarius',
    joy: 'Jupiter',
    simple: 'The eleventh house is your people and your hopes: friends, allies, groups, covens and causes, and the future you wish for.',
    detailed: [
      `${HELLENISTIC_ASTROLOGERS[0].toUpperCase()}${HELLENISTIC_ASTROLOGERS.slice(1)} called the eleventh house the Good Spirit (agathos daimōn), and it is the joy of Jupiter, who rejoices here. It showed friends, patrons and benefactors, gifts and favours, and hopes for the future, and it was counted one of the best houses of the chart. Medieval and Renaissance astrologers read it for friends, hope, trust and comfort, the favour of the powerful, the king\'s counsellors, and the profit of the tenth house\'s work.`,
      'Modern astrology reads the eleventh house as community: friends, networks and groups, clubs, societies and covens, causes and collective work, ideals and hopes for the future, and the gifts that come through other people. It is where the self joins something bigger than one life.',
      'In a life, the eleventh house shows what kind of friend you are and what kind of friends you find, how you belong to groups, the causes that move you, the help that comes to you from unexpected people, and your wishes and plans for the future. A strong eleventh house is often found in people who do their best work alongside others.',
      HOUSE_KIND_TEXT.succedent,
      'The sign on the cusp describes your style of friendship and group life: Aquarius or Gemini sociable and idea-driven, Capricorn a few loyal, long friendships, Cancer friends who become family, Leo a warm circle with you at its heart. Its ruler, by sign and house, shows where friends and hopes come from: in the ninth through study or faith, in the sixth through work. Planets here colour community: Jupiter (in his joy) brings generous friends and fortunate allies, Venus warm and affectionate friendships, Saturn few but lasting friends and responsibility in groups, Mars activism and sometimes quarrels, Uranus unusual and changing circles. An empty eleventh house is read through its cusp and ruler.',
    ].join('\n\n'),
    magic: 'Coven and group work, wishing magic, friendship spells and community blessings.',
    craft: 'Eleventh-house magic is group and wishing magic: coven work and group rituals, blessings for a circle, friendship spells, wishing magic for the future, community blessings and spells for a cause, and charms that ask for help to come through good people. A wish written on a bay leaf and burned, a shared candle lit at the same hour by friends in different places, or a coven cord with a knot for each member all suit it. Thursdays and Jupiter hours honour Jupiter in his joy, and Saturdays and Saturn hours suit its traditional ruler (Saturn rules Aquarius, its natural sign); the waxing Moon carries wishes, and the full Moon is the classic time for group rites. Correspondences: Bay, Star Anise and Lavender; Amethyst, Aquamarine, Turquoise and Clear Quartz; blue and turquoise candles. Offer to the group itself: food brought to share, time given to a cause, or thanks spoken aloud for the people who have helped you.',
  },
  {
    house: 12,
    name: 'The house of the hidden',
    keywords: ['solitude', 'secrets', 'retreat', 'sorrow', 'the unconscious', 'spirituality'],
    kind: 'cadent',
    naturalSign: 'Pisces',
    joy: 'Saturn',
    simple: 'The twelfth house is what is hidden: solitude, retreat, secrets, sorrows, dreams and the life of the spirit.',
    detailed: [
      `${HELLENISTIC_ASTROLOGERS[0].toUpperCase()}${HELLENISTIC_ASTROLOGERS.slice(1)} called the twelfth house the Bad Spirit (kakos daimōn), and it is the joy of Saturn, who rejoices in this house of solitude and confinement. It showed enemies, especially hidden ones, captivity, grief and suffering, and losses. Medieval and Renaissance astrologers read it for secret enemies, imprisonment, sorrow, self-undoing, witches (Lilly lists them here), large animals such as horses and cattle, and hospitals and places of confinement.`,
      'Modern astrology reads the twelfth house as the hidden life: the unconscious, dreams, solitude and retreat, spirituality and mysticism, compassion and self-sacrifice, institutions such as hospitals, prisons, monasteries and retreats, and what is kept secret, from others or from yourself. Many astrologers see it as the house of endings before a new beginning, since it ends just as the first house begins.',
      'In a life, the twelfth house shows what you need to withdraw for, how you deal with what you cannot control, your inner and dream life, the patterns that undo you until you see them, and the quiet ways you give to others. It is often strong in the charts of artists, healers, mystics and people who work behind the scenes.',
      HOUSE_KIND_TEXT.cadent,
      AVERSION,
      'The sign on the cusp describes how you retreat and what lies hidden: Pisces or Cancer a deep, dreamy inner life, Virgo worry turned inward, Aries anger kept unspoken, Sagittarius a private faith. It is also the sign just above your rising sign, so it is close to the surface even when hidden. Its ruler, by sign and house, shows where the hidden comes to light. Planets here work out of sight: Saturn (in his joy) can give real strength in solitude and discipline in spiritual work, Venus a secret love or quiet kindness, the Moon a sensitive, psychic and private nature, Mars hidden anger or courage, Jupiter a protective presence often called a guardian angel, Neptune mystic gifts. A planet within a few degrees of the Ascendant, though in the twelfth, often acts as if it were in the first.',
    ].join('\n\n'),
    magic: 'Solitary practice, meditation, dreamwork, hidden and protective magic, retreat, and the spirit world.',
    craft: 'Twelfth-house magic is quiet and inward: solitary practice and retreat, meditation, dreamwork and dream pillows, a dream journal, contact with spirits and guides, hidden and protective magic (charms kept secret, wards against unseen harm), spells to break a self-undoing pattern, and compassion work for those in hospitals, prisons or other confinement. Silence and darkness are its tools. Saturdays and Saturn hours honour Saturn in his joy, and Thursdays and Jupiter hours its traditional ruler (Jupiter rules Pisces, its natural sign); the dark Moon and the last days of the waning Moon suit it best, as do the days before your birthday, when your solar year is ending. Correspondences: Mugwort and Lavender for dreams, Myrrh and Sandalwood for spirit work, Amethyst, Labradorite, Moonstone and Black Tourmaline among stones; deep blue, violet and black candles. Offer silence: an hour unplugged, a candle left to burn while you sit with it, or a quiet act of kindness that no one will ever know was yours.',
  },
];

/** Planets associated with each house in the craft: the ruler of its natural sign and the planet in its joy. */
export const houseAllies = (h: HouseMeaning, rulerOf: (sign: HouseMeaning['naturalSign']) => Classical): Classical[] =>
  [...new Set([rulerOf(h.naturalSign), ...(h.joy ? [h.joy] : [])])];
