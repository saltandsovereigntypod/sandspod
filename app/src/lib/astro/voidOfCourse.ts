// The void-of-course Moon: from the Moon's last major aspect (conjunction,
// sextile, square, trine, opposition) to a planet while in a sign, until it
// enters the next sign. Aspects are counted to the Sun and all planets
// through Pluto, as most modern ephemerides do.

import { nextMoonIngress, moonLongitude, type ZodiacSign } from '../moon.ts';
import { planetLongitude, type Planet } from './planets.ts';

const ASPECTS = [0, 60, 90, 120, 180];
const BODIES: Planet[] = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const HOUR = 3_600_000;

/** Distance (degrees, -180..180) from the nearest exact `aspect` between the Moon and `body`. */
function offset(date: Date, body: Planet, aspect: number): number {
  const separation = ((moonLongitude(date) - planetLongitude(body, date)) % 360 + 360) % 360;
  // Both sides of an aspect count (a trine at 120 or 240).
  const targets = aspect === 0 || aspect === 180 ? [aspect] : [aspect, 360 - aspect];
  let best = 999;
  for (const target of targets) {
    const d = (((separation - target) % 360) + 540) % 360 - 180;
    if (Math.abs(d) < Math.abs(best)) best = d;
  }
  return best;
}

export type VoidOfCourse = { start: Date; end: Date; nextSign: ZodiacSign };

/** The void-of-course period that ends at the Moon's next sign change after `from`. */
export function voidOfCourse(from: Date): VoidOfCourse {
  const ingress = nextMoonIngress(from);
  const end = ingress.date.getTime();
  // Look back far enough to cover the whole time in this sign (under 2.6 days).
  let lastExact = end - 3 * 24 * HOUR;
  const signStart = (() => {
    let t = end - 60_000;
    const sign = Math.floor(moonLongitude(new Date(t)) / 30);
    while (Math.floor(moonLongitude(new Date(t - HOUR)) / 30) === sign && end - t < 3 * 24 * HOUR) t -= HOUR;
    return t;
  })();
  let found = signStart;
  for (const body of BODIES) {
    for (const aspect of ASPECTS) {
      let t = signStart;
      let prev = offset(new Date(t), body, aspect);
      while (t < end) {
        const next = Math.min(t + HOUR, end);
        const value = offset(new Date(next), body, aspect);
        // A sign change in a small offset means the aspect was exact in between.
        if (Math.sign(value) !== Math.sign(prev) && Math.abs(value - prev) < 10) {
          let low = t;
          let high = next;
          while (high - low > 30_000) {
            const mid = (low + high) / 2;
            if (Math.sign(offset(new Date(mid), body, aspect)) === Math.sign(prev)) low = mid;
            else high = mid;
          }
          if (high > found) found = high;
        }
        t = next;
        prev = value;
      }
    }
  }
  lastExact = found;
  return { start: new Date(lastExact), end: ingress.date, nextSign: ingress.sign };
}
