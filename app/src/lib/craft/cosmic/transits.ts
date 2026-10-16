// What touches a chart today: transiting planets in major aspect to the natal
// Sun, Moon and Ascendant, and the days the Moon passes through the person's
// sun and moon signs. Plus the short meanings the chart screen shows.

import { moonSign, nextMoonIngress, type ZodiacSign } from '../../moon.ts';
import { MOON_IN_SIGN, PLANET_RULES, SIGN_STYLE, SUN_SEASON } from '../../astro/meanings.ts';
import { planetLongitude, PLANETS, type Planet } from '../../astro/planets.ts';
import { natalOf, type NatalChart } from './chart.ts';

export type AspectName = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

export const ASPECTS: { name: AspectName; angle: number; symbol: string }[] = [
  { name: 'conjunction', angle: 0, symbol: '☌' },
  { name: 'sextile', angle: 60, symbol: '⚹' },
  { name: 'square', angle: 90, symbol: '□' },
  { name: 'trine', angle: 120, symbol: '△' },
  { name: 'opposition', angle: 180, symbol: '☍' },
];

/** Orb allowed for a transit: 3°, or 5° when the Moon is the one moving. */
export const transitOrb = (transiting: Planet) => (transiting === 'Moon' ? 5 : 3);

/** Shortest angular distance between two longitudes, 0–180. */
export function separation(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return d > 180 ? 360 - d : d;
}

/** The major aspect two longitudes make within `orb`, with how far from exact. */
export function aspectBetween(a: number, b: number, orb: number): { aspect: AspectName; off: number } | null {
  const sep = separation(a, b);
  let best: { aspect: AspectName; off: number } | null = null;
  for (const { name, angle } of ASPECTS) {
    const off = Math.abs(sep - angle);
    if (off <= orb && (!best || off < best.off)) best = { aspect: name, off };
  }
  return best;
}

export type NatalPoint = 'Sun' | 'Moon' | 'Ascendant';

export type Transit = {
  transiting: Planet;
  natal: NatalPoint;
  aspect: AspectName;
  /** Degrees from exact. */
  off: number;
  /** True while the aspect is getting closer. */
  applying: boolean;
};

export function natalPoints(chart: NatalChart): { point: NatalPoint; longitude: number }[] {
  const points: { point: NatalPoint; longitude: number }[] = [
    { point: 'Sun', longitude: natalOf(chart, 'Sun').longitude },
    { point: 'Moon', longitude: natalOf(chart, 'Moon').longitude },
  ];
  if (chart.ascendant) points.push({ point: 'Ascendant', longitude: chart.ascendant.longitude });
  return points;
}

/** Transits in orb at `now`, closest first. */
export function transitsAt(chart: NatalChart, now: Date): Transit[] {
  const later = new Date(now.getTime() + 3_600_000);
  const out: Transit[] = [];
  for (const planet of PLANETS) {
    const lon = planetLongitude(planet, now);
    const lonLater = planetLongitude(planet, later);
    for (const { point, longitude } of natalPoints(chart)) {
      const hit = aspectBetween(lon, longitude, transitOrb(planet));
      if (!hit) continue;
      const angle = ASPECTS.find((a) => a.name === hit.aspect)!.angle;
      const offLater = Math.abs(separation(lonLater, longitude) - angle);
      out.push({ transiting: planet, natal: point, aspect: hit.aspect, off: hit.off, applying: offLater < hit.off });
    }
  }
  return out.sort((a, b) => a.off - b.off);
}

const ASPECT_VERB: Record<AspectName, string> = {
  conjunction: 'joins',
  sextile: 'sextiles',
  square: 'squares',
  trine: 'trines',
  opposition: 'opposes',
};

export const ASPECT_TONE: Record<AspectName, string> = {
  conjunction: 'The two act as one: whatever this planet carries is turned up loud.',
  sextile: 'A small door opens; it helps if you make the first move.',
  square: 'Friction that asks for action rather than worry.',
  trine: 'An easy flow. A kind time for workings in this part of life.',
  opposition: 'A pull between two sides, often met through other people.',
};

const POINT_THEME: Record<NatalPoint, string> = {
  Sun: 'your sense of self and your vitality',
  Moon: 'your feelings, needs and home',
  Ascendant: 'your body, presence and how you come across',
};

export function transitLine(t: Transit): string {
  return `${t.transiting} (${PLANET_RULES[t.transiting]}) ${ASPECT_VERB[t.aspect]} your natal ${t.natal === 'Ascendant' ? 'rising' : t.natal}: ${POINT_THEME[t.natal]}.`;
}

/** Spells of time when the Moon is in `sign` that overlap [from, to). */
export function moonInSign(sign: ZodiacSign, from: Date, to: Date): { start: Date; end: Date }[] {
  const out: { start: Date; end: Date }[] = [];
  let t = from;
  for (let guard = 0; guard < 40 && t.getTime() < to.getTime(); guard++) {
    const here = moonSign(t);
    const ingress = nextMoonIngress(t);
    if (here === sign) {
      // A spell already under way at `from` is shown from `from`.
      out.push({ start: t, end: ingress.date });
    }
    t = new Date(ingress.date.getTime() + 60_000);
  }
  return out;
}

/** The calendar month containing `now`, in local time. */
export function monthAround(now: Date): { start: Date; end: Date } {
  return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
}

export const RISING: Record<ZodiacSign, string> = {
  Aries: 'You meet the world head-first: quick, frank and ready to begin.',
  Taurus: 'You come across calm and steady, slow to rush and easy to trust.',
  Gemini: 'You meet people with curiosity and conversation, quick to connect.',
  Cancer: 'You come across gentle and a little guarded, caring first and watching how others care.',
  Leo: 'You arrive warmly and get noticed, leading with heart and a little flair.',
  Virgo: 'You come across thoughtful and capable, the one who sees what needs doing.',
  Libra: 'You meet the world with charm and tact, looking for the balance in a room.',
  Scorpio: 'You come across quiet and intense, reading a room before you show yourself.',
  Sagittarius: 'You meet life openly and with humour, always half-packed for a journey.',
  Capricorn: 'You come across composed and serious, someone who means what they say.',
  Aquarius: 'You meet the world as yourself: friendly, a little apart, hard to predict.',
  Pisces: 'You come across soft and receptive, catching moods before words.',
};

export const sunMeaning = (sign: ZodiacSign) =>
  `Your core self and will shine ${SIGN_STYLE[sign]}. You were born in ${SUN_SEASON[sign]}.`;

export const moonMeaning = (sign: ZodiacSign) =>
  `Your inner life feels ${MOON_IN_SIGN[sign].mood}. Workings that suit your moon: ${MOON_IN_SIGN[sign].goodFor}.`;

export const midheavenMeaning = (sign: ZodiacSign) => `Your public path and calling are met ${SIGN_STYLE[sign]}.`;
