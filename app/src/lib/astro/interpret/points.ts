// Points by sign and house. Key: keys.pointInSign / keys.pointInHouse.
//
// Written: the Part of Fortune in every sign and house, and the Midheaven in
// every sign. (The chart engine doesn't compute the Vertex, so it has no
// readings; the rulers of the four angles are read through the chart ruler,
// ruler.ts, and the houses' own rulers in the reading's house section.)
// The nodes and Lilith by sign and house are not written here yet.

import { SIGNS, TRADITIONAL_RULER, type ZodiacSign } from '../signs.ts';
import { deepenBig } from './bigThreeDeeper.ts';
import { HOUSE_MEANINGS } from './houses.ts';
import { keys, type InterpretationTable } from './types.ts';

const FORTUNE_SIGN: Record<ZodiacSign, [simple: string, how: string]> = {
  Aries: ['Your luck comes when you act first and trust your nerve.', 'Fortune favours initiative here: chances come to the one who moves, competes and begins. Wellbeing comes through physical activity and independence.'],
  Taurus: ['Your luck comes through patience, the body and building slowly.', 'Fortune grows like a garden here: steady work, good food, land, craft and savings. Wellbeing comes through comfort and the senses.'],
  Gemini: ['Your luck comes through words, contacts and curiosity.', 'Fortune arrives in conversations, messages, short trips and learning. Wellbeing comes from a lively mind and good company.'],
  Cancer: ['Your luck comes through home, family and caring for others.', 'Fortune is found close to home: family ties, property, nurturing work and a safe nest. Wellbeing comes from belonging.'],
  Leo: ['Your luck comes when you shine, create and lead with heart.', 'Fortune follows generosity and self-expression: performance, children, creative work. Wellbeing comes from joy and being seen.'],
  Virgo: ['Your luck comes through skill, service and careful work.', 'Fortune is earned by craft and attention to detail, and by helping. Wellbeing comes through good routines and health.'],
  Libra: ['Your luck comes through partnership, fairness and beauty.', 'Fortune arrives through others: partners, collaborators, clients, a pleasing manner. Wellbeing comes from harmony.'],
  Scorpio: ['Your luck comes through depth, trust and shared resources.', 'Fortune lies in what is hidden or shared: research, investment, inheritance, deep bonds. Wellbeing comes from emotional honesty.'],
  Sagittarius: ['Your luck comes through faith, travel and learning.', 'Fortune is found far off: travel, study, teaching and faith. Wellbeing comes from freedom and meaning.'],
  Capricorn: ['Your luck comes through effort, responsibility and time.', 'Fortune is built: careers, structures, reputation earned slowly. Wellbeing comes from achievement and self-respect.'],
  Aquarius: ['Your luck comes through friends, groups and fresh ideas.', 'Fortune arrives through community, networks, causes and invention. Wellbeing comes from freedom and belonging to something larger.'],
  Pisces: ['Your luck comes through intuition, compassion and letting go.', 'Fortune flows through imagination, art, spirit and kindness, often unplanned. Wellbeing comes from rest and faith.'],
};

const MC_SIGN: Record<ZodiacSign, [simple: string, detail: string, magic: string]> = {
  Aries: ['Your public path calls for courage and leadership. You are seen as a pioneer.', 'With Aries on the Midheaven you are drawn to work where you can lead, start things and compete: running your own venture, physical or protective work, campaigning. Your reputation is built on initiative.', 'Courage and success spells at noon on a Tuesday; carnelian on the desk.'],
  Taurus: ['Your public path is steady and practical. You are seen as reliable and grounded.', 'Taurus on the Midheaven draws you to work that builds lasting value: finance, land, food, craft, music and beauty. Your reputation grows slowly and holds.', 'Prosperity work on a Friday; a green candle and a coin on the altar.'],
  Gemini: ['Your public path involves words and ideas. You are seen as clever and versatile.', 'Gemini on the Midheaven suits teaching, writing, media, trade and anything with variety. You may have more than one career.', 'Word magic on a Wednesday; write your aim in yellow ink.'],
  Cancer: ['Your public path involves care. You are seen as nurturing and protective.', 'Cancer on the Midheaven draws you to caring professions, homes, food, history and family business. Your public life often grows from your private one.', 'Moon magic on a Monday; moon water to anoint your work tools.'],
  Leo: ['Your public path calls you to shine. You are seen as warm and creative.', 'Leo on the Midheaven suits leadership, the arts, performance and work with children. You want to be recognised for what you create.', 'Sun magic at noon on a Sunday; gold candles and sunflowers.'],
  Virgo: ['Your public path is skilled service. You are seen as capable and precise.', 'Virgo on the Midheaven draws you to health, crafts, analysis and work that improves things. Your reputation rests on competence.', 'Mercury magic on a Wednesday; herbs bundled for good work.'],
  Libra: ['Your public path involves people and beauty. You are seen as fair and gracious.', 'Libra on the Midheaven suits law, art, design, diplomacy and partnership work. You do best in collaboration.', 'Venus magic on a Friday; balanced pairs of candles.'],
  Scorpio: ['Your public path goes deep. You are seen as intense and capable.', 'Scorpio on the Midheaven draws you to research, healing, finance, crisis work and the hidden. Your reputation is built on depth and trust.', 'Protection and power work on a Tuesday or at the dark moon.'],
  Sagittarius: ['Your public path is about meaning and horizons. You are seen as wise or adventurous.', 'Sagittarius on the Midheaven suits teaching, publishing, law, travel and faith. You want work with a larger purpose.', 'Jupiter magic on a Thursday; bay leaves for success.'],
  Capricorn: ['Your public path is ambitious and enduring. You are seen as an authority.', 'Capricorn on the Midheaven draws you to leadership, institutions and long careers built step by step. Its own sign on its own house: ambition is natural to you.', 'Saturn magic on a Saturday; a black candle for endurance.'],
  Aquarius: ['Your public path is original. You are seen as an innovator or reformer.', 'Aquarius on the Midheaven suits technology, science, community and causes. You may change careers suddenly.', 'Change and community magic; storm water and clear quartz.'],
  Pisces: ['Your public path is compassionate or artistic. You are seen as gentle and inspired.', 'Pisces on the Midheaven draws you to the arts, healing, spirituality and service. Your calling may be hard to name but strongly felt.', 'Neptune and Jupiter magic; sea water and amethyst.'],
};

function build(): InterpretationTable {
  const out: InterpretationTable = {};
  for (const sign of SIGNS) {
    const [simple, how] = FORTUNE_SIGN[sign];
    const ruler = TRADITIONAL_RULER[sign];
    out[keys.pointInSign('Part of Fortune', sign)] = {
      simple,
      detailed: `${how}\n\nThe Part of Fortune is the oldest of the lots used by ancient astrologers: the Moon's distance from the Sun, measured from the Ascendant (reversed in a night chart). It shows the body, wellbeing and the material luck that comes to you. Its ruler, here ${ruler}, shows by its sign and house how that fortune arrives.`,
      magic: `Charge a coin or charm for luck under the ${sign} moon and carry it; ${ruler}'s day and hour suit fortune work for you.`,
      sources: 'Vettius Valens, Anthology II; Paulus Alexandrinus, Introduction.',
    };
    const [mSimple, mDetail, mMagic] = MC_SIGN[sign];
    out[keys.pointInSign('Midheaven', sign)] = deepenBig(
      {
        simple: mSimple,
        detailed: `${mDetail}\n\nThe Midheaven is the point of the zodiac culminating (crossing the meridian, due south in the northern hemisphere) at your birth: vocation, reputation and the life you build in public. It is not always the point straight overhead.`,
        magic: mMagic,
      },
      'Midheaven',
      sign,
    );
  }
  for (const h of HOUSE_MEANINGS) {
    out[keys.pointInHouse('Part of Fortune', h.house)] = {
      simple: `Your fortune and wellbeing are found in the matters of the ${h.name.toLowerCase().replace(/^the /, '')}: ${h.keywords.slice(0, 3).join(', ')}.`,
      detailed: `With the Part of Fortune in the ${ORD[h.house - 1]} house, luck, comfort and bodily wellbeing gather around ${h.keywords.slice(0, 4).join(', ')}. Ancient astrologers also counted houses from the Part of Fortune itself: the eleventh from it was the place of acquisition, and planets there showed how wealth comes.\n\n${h.kind === 'angular' ? 'An angular house gives the Part strength and visibility.' : h.kind === 'succedent' ? 'A succedent house gives the Part steadiness: fortune that accumulates.' : 'A cadent house makes the Part quieter: fortune that comes through work, learning or behind the scenes.'}`,
      magic: `Prosperity and wellbeing work aimed at ${h.keywords.slice(0, 2).join(' and ')}: ${h.magic}`,
    };
  }
  return out;
}

const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];

export const POINT_READINGS: InterpretationTable = build();
