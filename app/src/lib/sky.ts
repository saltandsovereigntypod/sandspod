// Everything the Today screen and the Sky screen say about the sky right now,
// computed from the date (and, for rise/set and planetary hours, a place).

import { eclipsesBetween, eclipseLabel, type Eclipse } from './astro/eclipses.ts';
import { currentHour, planetaryHours, type PlanetaryHour } from './astro/hours.ts';
import { RETROGRADE_MEANING, SUN_SEASON } from './astro/meanings.ts';
import {
  isRetrograde,
  nextIngress,
  nextStation,
  planetLongitude,
  PLANETS,
  signOf,
  type Planet,
  type Station,
} from './astro/planets.ts';
import { moonTimes, sunTimes, type Place, type RiseSet } from './astro/rise.ts';
import { voidOfCourse, type VoidOfCourse } from './astro/voidOfCourse.ts';
import type { ZodiacSign } from './moon.ts';

const DAY = 86_400_000;
const MOVING: Exclude<Planet, 'Sun' | 'Moon'>[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

export type PlanetNow = {
  planet: Planet;
  sign: ZodiacSign;
  degree: number;
  retrograde: boolean;
  nextSign: { sign: ZodiacSign; date: Date } | null;
};

export type RetrogradeNotice = {
  planet: Planet;
  /** 'now' while retrograde (until `date`), 'soon' when it turns retrograde within a week. */
  when: 'now' | 'soon';
  date: Date;
  meaning: string;
};

export type Sky = {
  planets: PlanetNow[];
  retrogrades: RetrogradeNotice[];
  voc: VoidOfCourse;
  /** True while the Moon is void of course right now. */
  vocNow: boolean;
  sunSign: ZodiacSign;
  sunSeason: string;
  sunSignEnds: Date | null;
  eclipses: Eclipse[];
};

export function skyNow(now: Date, options: { planets?: boolean } = {}): Sky {
  const planets = (options.planets === false ? (['Sun', 'Moon'] as Planet[]) : [...PLANETS]).map((planet) => {
    const longitude = planetLongitude(planet, now);
    return {
      planet,
      sign: signOf(longitude),
      degree: Math.floor(longitude % 30),
      retrograde: isRetrograde(planet, now),
      nextSign: planet === 'Pluto' || planet === 'Neptune' || planet === 'Uranus' ? null : nextIngress(planet, now, 800),
    };
  });

  const retrogrades: RetrogradeNotice[] = [];
  for (const planet of MOVING) {
    const station: Station | null = nextStation(planet, now, 400);
    if (!station) continue;
    const meaning = RETROGRADE_MEANING[planet] ?? '';
    if (station.turning === 'direct') retrogrades.push({ planet, when: 'now', date: station.date, meaning });
    else if (station.date.getTime() - now.getTime() < 7 * DAY) retrogrades.push({ planet, when: 'soon', date: station.date, meaning });
  }

  const voc = voidOfCourse(now);
  const sun = planets.find((p) => p.planet === 'Sun')!;
  return {
    planets,
    retrogrades,
    voc,
    vocNow: now.getTime() >= voc.start.getTime() && now.getTime() < voc.end.getTime(),
    sunSign: sun.sign,
    sunSeason: SUN_SEASON[sun.sign],
    sunSignEnds: sun.nextSign?.date ?? null,
    eclipses: eclipsesBetween(now, new Date(now.getTime() + 366 * DAY)),
  };
}

export type PlaceSky = { sun: RiseSet; moon: RiseSet; hour: PlanetaryHour | null; hours: PlanetaryHour[] | null };

export function placeSky(now: Date, place: Place): PlaceSky {
  return { sun: sunTimes(now, place), moon: moonTimes(now, place), hour: currentHour(now, place), hours: planetaryHours(now, place) };
}

export { eclipseLabel };
