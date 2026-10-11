// The day at a glance: what it is good for (weekday planet + Moon phase +
// Moon sign), its traditional correspondences, and a reflection prompt.

import { MOON_IN_SIGN, PHASE_GOOD_FOR } from './astro/meanings.ts';
import type { Holiday } from './holidays.ts';
import type { PhaseName, ZodiacSign } from './moon.ts';

export type Correspondences = {
  planet: string;
  colors: string[];
  crystals: string[];
  herbs: string[];
  metal: string;
  incense: string;
  candle: string;
};

/** Traditional planetary correspondences of the weekdays (index matches Date.getDay()). */
export const DAY_CORRESPONDENCES: Correspondences[] = [
  { planet: 'Sun', colors: ['Gold', 'Yellow'], crystals: ['Citrine', 'Sunstone', 'Tiger’s Eye'], herbs: ['Sunflower', 'Marigold', 'Cinnamon'], metal: 'Gold', incense: 'Frankincense', candle: 'Gold or yellow' },
  { planet: 'Moon', colors: ['Silver', 'White'], crystals: ['Moonstone', 'Selenite', 'Pearl'], herbs: ['Jasmine', 'Mugwort', 'Willow'], metal: 'Silver', incense: 'Jasmine or sandalwood', candle: 'White or silver' },
  { planet: 'Mars', colors: ['Red'], crystals: ['Carnelian', 'Garnet', 'Bloodstone'], herbs: ['Basil', 'Ginger', 'Black Pepper'], metal: 'Iron', incense: 'Dragon’s blood', candle: 'Red' },
  { planet: 'Mercury', colors: ['Orange', 'Yellow'], crystals: ['Agate', 'Aventurine', 'Fluorite'], herbs: ['Lavender', 'Dill', 'Peppermint'], metal: 'Quicksilver (symbolically)', incense: 'Lavender', candle: 'Orange or yellow' },
  { planet: 'Jupiter', colors: ['Royal blue', 'Purple'], crystals: ['Amethyst', 'Lapis Lazuli', 'Sapphire'], herbs: ['Sage', 'Clove', 'Nutmeg'], metal: 'Tin', incense: 'Cedar', candle: 'Blue or purple' },
  { planet: 'Venus', colors: ['Green', 'Pink'], crystals: ['Rose Quartz', 'Emerald', 'Jade'], herbs: ['Rose', 'Yarrow', 'Vanilla'], metal: 'Copper', incense: 'Rose', candle: 'Green or pink' },
  { planet: 'Saturn', colors: ['Black', 'Indigo'], crystals: ['Obsidian', 'Onyx', 'Jet'], herbs: ['Myrrh', 'Comfrey', 'Cypress'], metal: 'Lead', incense: 'Myrrh', candle: 'Black' },
];

export const correspondencesFor = (date: Date) => DAY_CORRESPONDENCES[date.getDay()];

/** e.g. "The New Moon in Libra is good for rest, setting intentions …, and for love and friendship, …" */
export function goodForToday(phase: PhaseName, moonSign: ZodiacSign): string {
  return `The ${phase} in ${moonSign} is good for ${PHASE_GOOD_FOR[phase]}, and for ${MOON_IN_SIGN[moonSign].goodFor}.`;
}

const PROMPTS: Record<'growing' | 'full' | 'waning' | 'dark', string[]> = {
  dark: [
    'What seed do you want to plant in the dark this month?',
    'What do you need to rest from before you begin again?',
    'If this month had one word, what would it be?',
  ],
  growing: [
    'What small step can you take today toward what you planted?',
    'Where do you feel momentum building in your life?',
    'What support or resource would help your intention grow?',
  ],
  full: [
    'What has come to fullness for you since the new moon?',
    'What are you most grateful for right now?',
    'What is the full moon illuminating that you hadn’t seen?',
  ],
  waning: [
    'What are you ready to release?',
    'What lesson from this cycle do you want to carry forward?',
    'What habit or story no longer serves you?',
  ],
};

/** A reflection prompt for the day, from the Moon's phase (or today's holiday). */
export function journalPrompt(date: Date, phase: PhaseName, holidays: Holiday[] = []): string {
  if (holidays.length) return `How will you mark ${holidays[0].name} today, and what does it ask of you this year?`;
  const group =
    phase === 'New Moon' || phase === 'Waning Crescent'
      ? 'dark'
      : phase === 'Full Moon'
        ? 'full'
        : phase.startsWith('Waxing') || phase === 'First Quarter'
          ? 'growing'
          : 'waning';
  const list = PROMPTS[group];
  const dayNumber = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86_400_000);
  return list[((dayNumber % list.length) + list.length) % list.length];
}
