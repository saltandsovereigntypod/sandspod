// Planetary hours: daylight and night are each split into twelve hours,
// ruled in the Chaldean order (Saturn, Jupiter, Mars, Sun, Venus, Mercury,
// Moon), starting at sunrise with the planet that rules the day.

import { sunTimes, type Place } from './rise.ts';

export type HourPlanet = 'Saturn' | 'Jupiter' | 'Mars' | 'Sun' | 'Venus' | 'Mercury' | 'Moon';
const CHALDEAN: HourPlanet[] = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
// Index matches Date.getDay(): Sunday is the Sun's day.
const DAY_RULER: HourPlanet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export type PlanetaryHour = { planet: HourPlanet; start: Date; end: Date; night: boolean };

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12);

/** The 24 planetary hours of the planetary day that contains `now` (it begins at sunrise). */
export function planetaryHours(now: Date, place: Place): PlanetaryHour[] | null {
  let day = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  let today = sunTimes(day, place);
  if (!today.rise || !today.set) return null;
  // Before sunrise it is still the night of yesterday's planetary day.
  if (now.getTime() < today.rise.getTime()) {
    day = addDays(day, -1);
    today = sunTimes(day, place);
    if (!today.rise || !today.set) return null;
  }
  const tomorrow = sunTimes(addDays(day, 1), place);
  if (!tomorrow.rise) return null;
  const hours: PlanetaryHour[] = [];
  let index = CHALDEAN.indexOf(DAY_RULER[day.getDay()]);
  const span = (from: Date, to: Date, night: boolean) => {
    const length = (to.getTime() - from.getTime()) / 12;
    for (let i = 0; i < 12; i++) {
      hours.push({ planet: CHALDEAN[index % 7], start: new Date(from.getTime() + i * length), end: new Date(from.getTime() + (i + 1) * length), night });
      index++;
    }
  };
  span(today.rise, today.set, false);
  span(today.set, tomorrow.rise, true);
  return hours;
}

export function currentHour(now: Date, place: Place): PlanetaryHour | null {
  return planetaryHours(now, place)?.find((h) => now.getTime() >= h.start.getTime() && now.getTime() < h.end.getTime()) ?? null;
}
