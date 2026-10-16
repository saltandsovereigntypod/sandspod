// Planting by the moon: the old almanac rule of the four quarters, and the
// fruitful and barren signs the Moon passes through. This is folk tradition,
// kept by gardeners for centuries, not settled horticulture; the screens say so.
// Pure, so it can be tested.

import { moonSign, moonState, type PhaseName, type ZodiacSign } from '../../moon.ts';

/** The four garden quarters of the lunar month. */
export type GardenQuarter = 'leaf' | 'fruit' | 'root' | 'rest';

export type QuarterAdvice = {
  quarter: GardenQuarter;
  /** "New moon to first quarter" */
  span: string;
  /** Short name for the glance list. */
  short: string;
  headline: string;
  why: string;
  tasks: string[];
  examples: string;
};

export const QUARTERS: Record<GardenQuarter, QuarterAdvice> = {
  leaf: {
    quarter: 'leaf',
    span: 'New moon to first quarter',
    short: 'Sow leaves',
    headline: 'Sow what grows above ground for its leaves',
    why: 'The light is growing and, the old gardeners said, sap and moisture rise with it. Seeds that make leaves and stems above ground were sown now.',
    tasks: [
      'Sow leafy annuals and greens',
      'Sow herbs grown for their leaves',
      'Take softwood cuttings',
      'Water seed trays and young seedlings',
    ],
    examples: 'Basil, parsley, coriander, dill, chamomile, lettuce, spinach, cabbage',
  },
  fruit: {
    quarter: 'fruit',
    span: 'First quarter to full moon',
    short: 'Sow fruit & seed',
    headline: 'Sow what bears fruit, flowers and seed',
    why: 'The moon is nearly full and the pull is strongest. Tradition gives this week to plants that flower, fruit and set seed above ground.',
    tasks: [
      'Sow fruiting and seed-bearing plants',
      'Sow flowers for cutting and for the altar',
      'Graft and pot on',
      'Feed plants coming into flower',
    ],
    examples: 'Tomatoes, beans, peas, squash, calendula, sunflowers, borage',
  },
  root: {
    quarter: 'root',
    span: 'Full moon to last quarter',
    short: 'Roots & planting out',
    headline: 'Plant roots, bulbs and perennials; move plants',
    why: 'The light wanes and the old belief is that the sap draws down into the roots. This was the time for anything that lives below ground or must root in well.',
    tasks: [
      'Sow and plant root crops',
      'Plant bulbs, corms and garlic',
      'Plant perennials, shrubs and trees',
      'Transplant and divide',
      'Take root cuttings',
    ],
    examples: 'Garlic, onions, carrots, potatoes, saffron crocus, rosemary, lavender, roses, fruit trees',
  },
  rest: {
    quarter: 'rest',
    span: 'Last quarter to new moon',
    short: 'Rest, weed & prune',
    headline: 'Rest the soil: weed, prune, compost and harvest to keep',
    why: 'The dark of the moon was the barren time. Nothing was sown; it was for clearing, cutting back and gathering what must store well and dry quickly.',
    tasks: [
      'Weed and clear beds',
      'Prune and cut back',
      'Turn the compost and mulch',
      'Harvest herbs and roots to dry or store',
      'Rest, plan and leave an offering for the land',
    ],
    examples: 'Drying bundles, storing garlic and roots, saving seed, cutting back mint and sage',
  },
};

/** Which garden quarter a moon fraction (0 new, 0.5 full) falls in. */
export function quarterOf(fraction: number): GardenQuarter {
  const f = ((fraction % 1) + 1) % 1;
  if (f < 0.25) return 'leaf';
  if (f < 0.5) return 'fruit';
  if (f < 0.75) return 'root';
  return 'rest';
}

export type Fertility = 'fruitful' | 'semi-fruitful' | 'barren';

export type SignNote = { sign: ZodiacSign; element: 'Fire' | 'Earth' | 'Air' | 'Water'; fertility: Fertility; note: string };

const SIGN_ELEMENT: Record<ZodiacSign, SignNote['element']> = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water',
};

// The almanac lists: the water signs most fruitful, Taurus and Capricorn
// productive, Libra half so (good for flowers), and the fire and air signs,
// with Virgo, barren.
const SIGN_FERTILITY: Record<ZodiacSign, Fertility> = {
  Aries: 'barren',
  Taurus: 'fruitful',
  Gemini: 'barren',
  Cancer: 'fruitful',
  Leo: 'barren',
  Virgo: 'barren',
  Libra: 'semi-fruitful',
  Scorpio: 'fruitful',
  Sagittarius: 'barren',
  Capricorn: 'fruitful',
  Aquarius: 'barren',
  Pisces: 'fruitful',
};

export function signNote(sign: ZodiacSign): SignNote {
  const element = SIGN_ELEMENT[sign];
  const fertility = SIGN_FERTILITY[sign];
  let note: string;
  if (sign === 'Virgo') note = 'An earth sign, but the almanacs count Virgo barren: good for weeding and cultivating, not for sowing.';
  else if (sign === 'Libra') note = 'An air sign the almanacs count half fruitful: kind to flowers and to plants grown for their scent.';
  else if (element === 'Water') note = 'A water sign, the most fruitful of all in the old lists: the best days for sowing and planting.';
  else if (element === 'Earth') note = 'An earth sign, counted productive: good for roots, perennials and anything that must last.';
  else if (element === 'Fire') note = 'A fire sign, counted barren: the old days for weeding, clearing, harvesting and drying.';
  else note = 'An air sign, counted barren: days for weeding, turning the soil and gathering.';
  return { sign, element, fertility, note };
}

export type GardenNight = {
  /** Evening of the night, 9pm local. */
  date: Date;
  phase: PhaseName;
  fraction: number;
  illumination: number;
  quarter: GardenQuarter;
  /** True on the night the moon turns into a new quarter. */
  turning: boolean;
  sign: ZodiacSign;
  fertility: Fertility;
};

/** 9pm on the day `offset` days from `from`, local time. */
export function eveningOf(from: Date, offset = 0): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset, 21);
}

export function gardenNight(evening: Date): GardenNight {
  const moon = moonState(evening);
  const sign = moonSign(evening);
  const quarter = quarterOf(moon.fraction);
  const yesterday = moonState(new Date(evening.getTime() - 86_400_000));
  return {
    date: evening,
    phase: moon.name,
    fraction: moon.fraction,
    illumination: moon.illumination,
    quarter,
    turning: quarterOf(yesterday.fraction) !== quarter,
    sign,
    fertility: SIGN_FERTILITY[sign],
  };
}

/** Tonight and the nights after it. */
export function gardenNights(from: Date, count: number): GardenNight[] {
  return Array.from({ length: count }, (_, i) => gardenNight(eveningOf(from, i)));
}

/** When the moon next moves into a different garden quarter, within about eight days. */
export function nextQuarterChange(from: Date): { quarter: GardenQuarter; date: Date } | null {
  const start = quarterOf(moonState(from).fraction);
  const step = 3_600_000;
  for (let t = from.getTime() + step; t < from.getTime() + 9 * 86_400_000; t += step) {
    const q = quarterOf(moonState(new Date(t)).fraction);
    if (q !== start) return { quarter: q, date: new Date(t) };
  }
  return null;
}

/** One line combining the quarter and the sign, for a night in the glance list. */
export function nightLine(night: GardenNight): string {
  const q = QUARTERS[night.quarter].short;
  if (night.quarter === 'rest') return q;
  if (night.fertility === 'barren') return `${q}, though the sign is barren`;
  if (night.fertility === 'fruitful' && SIGN_ELEMENT[night.sign] === 'Water') return `${q}, in a fruitful sign`;
  return q;
}
