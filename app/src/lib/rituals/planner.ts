// Choosing a night: the moon's phase and the planetary ruler of the weekday,
// the two timing traditions the website teaches, plus Library ingredients
// whose uses and planet match the intention.

import { dayRuler } from '../calendar.ts';
import { moonState, type PhaseName } from '../moon.ts';
import { LIBRARY_ITEMS, type LibraryItem, type LibraryItemType } from './libraryData.ts';

/** Where the moon is in its cycle, as it matters for timing a working. */
export type MoonTide = 'new' | 'waxing' | 'full' | 'waning';

export type Intention = {
  key: string;
  label: string;
  /** Tides that suit this work, best first. */
  tides: MoonTide[];
  /** Weekday planets that suit it, best first. */
  planets: string[];
  /** Words matched against Library uses and tags. */
  keywords: string[];
  /** One line on why these timings. */
  why: string;
};

export const INTENTIONS: Intention[] = [
  {
    key: 'protection',
    label: 'Protection',
    tides: ['full', 'waxing'],
    planets: ['Mars', 'Saturn', 'Sun'],
    keywords: ['protection', 'warding', 'shielding', 'boundaries'],
    why: 'A strong moon lends power to wards; Mars and Saturn guard and set limits.',
  },
  {
    key: 'prosperity',
    label: 'Prosperity',
    tides: ['waxing', 'full'],
    planets: ['Jupiter', 'Sun'],
    keywords: ['prosperity', 'abundance', 'money', 'luck', 'success', 'wealth'],
    why: 'Work for growth while the moon grows; Jupiter rules abundance.',
  },
  {
    key: 'love',
    label: 'Love',
    tides: ['waxing', 'full'],
    planets: ['Venus'],
    keywords: ['love', 'self-love', 'compassion', 'beauty', 'friendship', 'heart'],
    why: 'Draw love in as the moon waxes; Friday belongs to Venus.',
  },
  {
    key: 'healing',
    label: 'Healing',
    tides: ['waxing', 'full'],
    planets: ['Sun', 'Moon'],
    keywords: ['healing', 'calm', 'compassion', 'vitality'],
    why: 'Build strength with the growing moon; the Sun restores vitality.',
  },
  {
    key: 'banishing',
    label: 'Banishing',
    tides: ['waning', 'new'],
    planets: ['Saturn', 'Mars'],
    keywords: ['banishing', 'uncrossing', 'shadow work', 'boundaries', 'absorbing negativity'],
    why: 'Let things go as the moon shrinks; Saturn ends and binds.',
  },
  {
    key: 'intuition',
    label: 'Intuition & dreams',
    tides: ['full', 'waxing'],
    planets: ['Moon'],
    keywords: ['intuition', 'dreams', 'divination', 'psychic', 'dream work', 'lunar'],
    why: 'The full moon opens the inner eye; Monday is the Moon’s own day.',
  },
  {
    key: 'courage',
    label: 'Courage',
    tides: ['waxing', 'full'],
    planets: ['Mars', 'Sun'],
    keywords: ['courage', 'strength', 'confidence', 'determination'],
    why: 'Grow boldness with the waxing moon; Tuesday is ruled by Mars.',
  },
  {
    key: 'cleansing',
    label: 'Cleansing',
    tides: ['waning', 'full'],
    planets: ['Saturn', 'Moon'],
    keywords: ['cleansing', 'purification', 'blessing'],
    why: 'Wash away as the moon wanes; Saturday clears the slate.',
  },
  {
    key: 'beginnings',
    label: 'New beginnings',
    tides: ['new', 'waxing'],
    planets: ['Sun', 'Moon'],
    keywords: ['new beginnings', 'growth', 'opportunity', 'creativity', 'motivation'],
    why: 'Plant seeds at the new moon; the Sun brings them to light.',
  },
  {
    key: 'study',
    label: 'Study & words',
    tides: ['waxing'],
    planets: ['Mercury'],
    keywords: ['communication', 'clarity', 'focus', 'study', 'learning', 'wisdom', 'truth'],
    why: 'Let understanding grow with the moon; Wednesday is Mercury’s.',
  },
  {
    key: 'peace',
    label: 'Peace & rest',
    tides: ['waning', 'full'],
    planets: ['Moon', 'Venus'],
    keywords: ['peace', 'sleep', 'calm', 'stress relief', 'balance'],
    why: 'Release tension as the moon wanes; Monday and Friday are gentle days.',
  },
];

export function intentionByKey(key: string | null | undefined): Intention | null {
  return INTENTIONS.find((i) => i.key === key) ?? null;
}

/** New and full count for the nights within about a day of the exact phase. */
export function tideOf(name: PhaseName, fraction: number): MoonTide {
  if (name === 'New Moon') return 'new';
  if (name === 'Full Moon') return 'full';
  return fraction < 0.5 ? 'waxing' : 'waning';
}

const TIDE_LABELS: Record<MoonTide, string> = {
  new: 'New moon',
  waxing: 'Waxing moon',
  full: 'Full moon',
  waning: 'Waning moon',
};

export type NightSuggestion = {
  /** Evening of the night, local time. */
  date: Date;
  phase: PhaseName;
  tide: MoonTide;
  illumination: number;
  planet: string;
  score: number;
  /** "Waxing moon · Venus's day" */
  reason: string;
  best: boolean;
};

/** The hour a working "on this night" is judged at. */
export const EVENING_HOUR = 21;

function eveningOf(day: Date): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), EVENING_HOUR, 0, 0, 0);
}

export function scoreNight(intention: Intention, evening: Date): Omit<NightSuggestion, 'best'> {
  const moon = moonState(evening);
  const tide = tideOf(moon.name, moon.fraction);
  const { planet } = dayRuler(evening);

  const tideRank = intention.tides.indexOf(tide);
  const planetRank = intention.planets.indexOf(planet);
  // The moon matters most: a night in the wrong tide never qualifies.
  let score = tideRank < 0 ? 0 : tideRank === 0 ? 4 : 3;
  // The exact phase is a stronger night than the days around it.
  if (score && (tide === 'full' || tide === 'new')) score += 1;
  if (score && planetRank >= 0) score += planetRank === 0 ? 3 : 2;

  const dayLabel = planet === 'Sun' || planet === 'Moon' ? `the ${planet}'s day` : `${planet}'s day`;
  const reason = planetRank >= 0 ? `${TIDE_LABELS[tide]} · ${dayLabel}` : TIDE_LABELS[tide];
  return { date: evening, phase: moon.name, tide, illumination: moon.illumination, planet, score, reason };
}

/**
 * The best nights in the coming weeks for an intention, in date order.
 * Tonight counts if it is not yet past the evening hour.
 */
export function suggestNights(intention: Intention, from: Date, options: { days?: number; count?: number } = {}): NightSuggestion[] {
  const days = options.days ?? 30;
  const count = options.count ?? 5;
  const start = from.getHours() >= EVENING_HOUR + 2 ? 1 : 0;

  const nights: Omit<NightSuggestion, 'best'>[] = [];
  for (let i = start; i < start + days; i += 1) {
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const scored = scoreNight(intention, eveningOf(day));
    if (scored.score > 0) nights.push(scored);
  }
  const top = [...nights]
    .sort((a, b) => b.score - a.score || a.date.getTime() - b.date.getTime())
    .slice(0, count);
  const bestScore = top[0]?.score ?? 0;
  const firstBest = top.find((n) => n.score === bestScore);
  return top
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((night) => ({ ...night, best: night === firstBest }));
}

/** What a particular night is good for, most fitting first. */
export function nightFits(evening: Date): { intention: Intention; score: number }[] {
  return INTENTIONS.map((intention) => ({ intention, score: scoreNight(intention, evening).score }))
    .filter((fit) => fit.score >= 5)
    .sort((a, b) => b.score - a.score);
}

function matchScore(item: LibraryItem, intention: Intention): number {
  const haystack = [item.uses.toLowerCase(), ...item.tags];
  let score = 0;
  for (const word of intention.keywords) {
    if (item.tags.includes(word)) score += 3;
    else if (haystack.some((text) => text.includes(word))) score += 2;
  }
  if (score === 0) return 0;
  if (item.planet && intention.planets.includes(item.planet)) score += item.planet === intention.planets[0] ? 2 : 1;
  return score;
}

export type IngredientSuggestions = Record<LibraryItemType, LibraryItem[]>;

const LIMITS: Record<LibraryItemType, number> = { herb: 4, crystal: 3, candle: 2 };

/** Library herbs, crystals and candle colors for an intention, best first. */
export function suggestIngredients(intention: Intention, items: LibraryItem[] = LIBRARY_ITEMS): IngredientSuggestions {
  const result: IngredientSuggestions = { herb: [], crystal: [], candle: [] };
  for (const type of Object.keys(result) as LibraryItemType[]) {
    result[type] = items
      .filter((item) => item.type === type)
      .map((item) => ({ item, score: matchScore(item, intention) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
      .slice(0, LIMITS[type])
      .map((entry) => entry.item);
  }
  return result;
}

export function libraryItem(ref: string): LibraryItem | null {
  return LIBRARY_ITEMS.find((item) => item.ref === ref) ?? null;
}
