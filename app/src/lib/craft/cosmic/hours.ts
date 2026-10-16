// Planetary hours for a working day: what each planet's hour suits, the
// next hours of a chosen planet, and the void-of-course Moon for a day.

import { planetaryHours, type HourPlanet, type PlanetaryHour } from '../../astro/hours.ts';
import type { Place } from '../../astro/rise.ts';
import { voidOfCourse, type VoidOfCourse } from '../../astro/voidOfCourse.ts';

const DAY = 86_400_000;

export const HOUR_PLANETS: HourPlanet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/** What each planet's hour is traditionally used for. */
export const HOUR_SUITS: Record<HourPlanet, { short: string; suits: string }> = {
  Sun: {
    short: 'success and vitality',
    suits: 'Success, confidence, health and vitality, career, favour from people in authority, and blessing new ventures.',
  },
  Moon: {
    short: 'dreams and intuition',
    suits: 'Dreamwork, divination, intuition, home and family, water, travel, cleansing and emotional healing.',
  },
  Mars: {
    short: 'courage and protection',
    suits: 'Courage, protection, defence, physical energy, competition, cutting ties and banishing.',
  },
  Mercury: {
    short: 'words and study',
    suits: 'Communication, study, writing, business, contracts, travel plans and divination.',
  },
  Jupiter: {
    short: 'luck and growth',
    suits: 'Luck, abundance, growth, generosity, legal matters, learning and spiritual expansion.',
  },
  Venus: {
    short: 'love and beauty',
    suits: 'Love, friendship, beauty, art, pleasure, harmony and making peace.',
  },
  Saturn: {
    short: 'boundaries and endings',
    suits: 'Binding, banishing, boundaries, endings, discipline, protecting the home and work with the ancestors.',
  },
};

export const isNow = (h: PlanetaryHour, now: Date) => now.getTime() >= h.start.getTime() && now.getTime() < h.end.getTime();

/** The next `count` hours of `planet` from `now` (the current one included), up to a week ahead. */
export function nextHoursOf(planet: HourPlanet, now: Date, place: Place, count = 3): PlanetaryHour[] {
  const seen = new Set<number>();
  const out: PlanetaryHour[] = [];
  for (let k = 0; k < 8 && out.length < count; k++) {
    const hours = planetaryHours(new Date(now.getTime() + k * DAY), place);
    if (!hours) continue;
    for (const h of hours) {
      if (h.planet !== planet || h.end.getTime() <= now.getTime() || seen.has(h.start.getTime())) continue;
      seen.add(h.start.getTime());
      out.push(h);
    }
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, count);
}

/** Void-of-course spells that overlap the local day [dayStart, dayStart + 24h). */
export function vocForDay(dayStart: Date): VoidOfCourse[] {
  const end = dayStart.getTime() + DAY;
  const out: VoidOfCourse[] = [];
  let t = dayStart;
  for (let guard = 0; guard < 4 && t.getTime() < end; guard++) {
    const v = voidOfCourse(t);
    if (v.start.getTime() < end && v.end.getTime() > dayStart.getTime()) out.push(v);
    t = new Date(v.end.getTime() + 60_000);
  }
  return out;
}

export const startOfLocalDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
