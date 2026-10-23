// The real sky over the altar: the light follows your actual sunrise, sunset
// and dusk (gold at dawn, plain by day, rose at dusk, blue at night), a small
// window can show tonight's real moon, and the season (by hemisphere) adds a
// faint accent. Tints sit between the background and the objects; the room's
// darkness after sunset lies over everything, lit back round each candle. Pure, so it can be tested.

import { sunTimes, type Place } from '../astro/rise.ts';
import { sunLongitude } from '../moon.ts';

const MIN = 60_000;
const HOUR = 60 * MIN;

/** How long either side of sunrise and sunset counts as dawn or dusk. */
export const TWILIGHT_MS = 45 * MIN;

export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';

/** The part of the day it is where you are: from the real sunrise and sunset, or from the clock when we don't know where you are. */
export function dayPhase(now: Date, place: Place | null): DayPhase {
  const at = now.getTime();
  if (place) {
    const { rise, set } = sunTimes(now, place);
    if (rise && set) {
      if (Math.abs(at - rise.getTime()) <= TWILIGHT_MS) return 'dawn';
      if (Math.abs(at - set.getTime()) <= TWILIGHT_MS) return 'dusk';
      const up = rise.getTime() < set.getTime() ? at > rise.getTime() && at < set.getTime() : at > rise.getTime() || at < set.getTime();
      return up ? 'day' : 'night';
    }
    if (rise || set) {
      const edge = (rise ?? set)!.getTime();
      if (Math.abs(at - edge) <= TWILIGHT_MS) return rise ? 'dawn' : 'dusk';
      return rise ? (at > edge ? 'day' : 'night') : at < edge ? 'day' : 'night';
    }
    // The midnight sun or the polar night: summer or winter at the place decides.
    return seasonAt(now, place.latitude) === 'summer' ? 'day' : 'night';
  }
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour >= 5.75 && hour < 7.25) return 'dawn';
  if (hour >= 7.25 && hour < 18.25) return 'day';
  if (hour >= 18.25 && hour < 19.75) return 'dusk';
  return 'night';
}

export type Tint = { color: string; opacity: number };

/** The light laid over the altar's background at each part of the day. */
export const DAY_TINTS: Record<DayPhase, Tint> = {
  dawn: { color: 'rgb(255,186,110)', opacity: 0.14 },
  day: { color: 'rgb(214,230,255)', opacity: 0.06 },
  dusk: { color: 'rgb(214,112,138)', opacity: 0.16 },
  night: { color: 'rgb(24,40,96)', opacity: 0.26 },
};

/** How dark the room is at each part of the day, before the candles light it back (laid over the objects too). */
export const DAY_DARKNESS: Record<DayPhase, number> = { dawn: 0.16, day: 0, dusk: 0.22, night: 0.42 };

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/** The astronomical season, turned around south of the equator. */
export function seasonAt(now: Date, latitude: number | null): Season {
  const longitude = sunLongitude(now);
  const north: Season = longitude < 90 ? 'spring' : longitude < 180 ? 'summer' : longitude < 270 ? 'autumn' : 'winter';
  if (latitude == null || latitude >= 0) return north;
  return ({ spring: 'autumn', summer: 'winter', autumn: 'spring', winter: 'summer' } as const)[north];
}

/** A faint edge of colour for the season: new green, warm gold, amber, frost. */
export const SEASON_ACCENTS: Record<Season, Tint> = {
  spring: { color: 'rgb(150,200,120)', opacity: 0.1 },
  summer: { color: 'rgb(240,200,90)', opacity: 0.09 },
  autumn: { color: 'rgb(200,110,50)', opacity: 0.12 },
  winter: { color: 'rgb(170,200,235)', opacity: 0.12 },
};

export type Ambient = { phase: DayPhase; tint: Tint; darkness: number; season: Season; accent: Tint; label: string };

export function ambientAt(now: Date, place: Place | null): Ambient {
  const phase = dayPhase(now, place);
  const season = seasonAt(now, place ? place.latitude : null);
  const words: Record<DayPhase, string> = { dawn: 'dawn light', day: 'daylight', dusk: 'dusk light', night: 'night light' };
  return { phase, tint: DAY_TINTS[phase], darkness: DAY_DARKNESS[phase], season, accent: SEASON_ACCENTS[season], label: `${words[phase]}, ${season}` };
}

/** When to look again: soon around sunrise and sunset, otherwise every quarter hour. */
export function nextAmbientCheck(now: Date, place: Place | null): number {
  if (place) {
    const { rise, set } = sunTimes(now, place);
    const edges = [rise, set]
      .filter((d): d is Date => !!d)
      .flatMap((d) => [d.getTime() - TWILIGHT_MS, d.getTime() + TWILIGHT_MS])
      .filter((t) => t > now.getTime());
    const soonest = edges.length ? Math.min(...edges) : Infinity;
    return Math.max(MIN, Math.min(soonest - now.getTime() + 1000, 15 * MIN));
  }
  return 15 * MIN;
}

/** The moon window is drawn as seen from the southern hemisphere when you're there (lit side turned round). */
export const moonMirrored = (place: Place | null) => !!place && place.latitude < 0;

export const _test = { HOUR };
