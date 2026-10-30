// One place to ask for any piece of interpretation. Screens and the
// composer call these; they return null when a piece hasn't been written
// yet, and the caller shows "coming soon" (with the glossary) instead.

import type { AspectName, PatternName } from '../aspects.ts';
import type { ChartPointName, ZodiacSign } from '../signs.ts';
import { ASPECT_READINGS } from './aspects.ts';
import { ELEMENT_READINGS } from './balance.ts';
import { HOUSE_MEANINGS } from './houses.ts';
import { linkCusp, linkInHouse, linkInSign } from './links.ts';
import { MOON_IN_SIGN_READING } from './moonSigns.ts';
import { PATTERN_READINGS } from './patterns.ts';
import { PLANET_IN_HOUSE } from './planetInHouse.ts';
import { PLANET_IN_SIGN } from './planetInSign.ts';
import { POINT_READINGS } from './points.ts';
import { RISING_IN_SIGN } from './risingSigns.ts';
import { RULER_READINGS } from './ruler.ts';
import { SIGN_ON_CUSP } from './signOnCusp.ts';
import { SUN_IN_SIGN } from './sunSigns.ts';
import { TRANSIT_READINGS } from './transits.ts';
import { keys, type HouseMeaning, type Interpretation, type InterpretationTable } from './types.ts';

export type { HouseMeaning, Interpretation };

function rawInSign(body: ChartPointName, sign: ZodiacSign): Interpretation | null {
  if (body === 'Sun') return SUN_IN_SIGN[sign];
  if (body === 'Moon') return MOON_IN_SIGN_READING[sign];
  if (body === 'Ascendant') return RISING_IN_SIGN[sign];
  return PLANET_IN_SIGN[keys.planetInSign(body, sign)] ?? POINT_READINGS[keys.pointInSign(body, sign)] ?? null;
}

/** A body in a sign, with its links (planet guide, Library, rituals, journeys). */
export const inSign = (body: ChartPointName, sign: ZodiacSign): Interpretation | null => linkInSign(rawInSign(body, sign), body);

/** A body in a house, with its links. */
export const inHouse = (body: ChartPointName, house: number): Interpretation | null =>
  linkInHouse(PLANET_IN_HOUSE[keys.planetInHouse(body, house)] ?? POINT_READINGS[keys.pointInHouse(body, house)] ?? null, body, house);

/** A sign on a house cusp, with its links. */
export const signOnCusp = (house: number, sign: ZodiacSign): Interpretation | null => linkCusp(SIGN_ON_CUSP[keys.signOnCusp(house, sign)] ?? null, house, sign);

export const aspectReading = (a: ChartPointName, aspect: AspectName, b: ChartPointName): Interpretation | null => ASPECT_READINGS[keys.aspect(a, aspect, b)] ?? null;

export const transitReading = (transiting: ChartPointName, aspect: AspectName, natal: ChartPointName): Interpretation | null =>
  TRANSIT_READINGS[keys.transit(transiting, aspect, natal)] ?? null;

export const patternReading = (name: PatternName): Interpretation | null => PATTERN_READINGS[keys.pattern(name)] ?? null;

export const balanceReading = (kind: 'dominant' | 'missing', what: string): Interpretation | null => ELEMENT_READINGS[keys.balance(kind, what)] ?? null;

export const rulerReading = (ruler: ChartPointName, house: number): Interpretation | null => RULER_READINGS[keys.rulerInHouse(ruler, house)] ?? null;

export const houseMeaning = (house: number): HouseMeaning => HOUSE_MEANINGS[house - 1];

/** How much of the library is written, for the "coming soon" note and the tests. */
export function coverage(): { table: string; written: number }[] {
  const t = (table: string, data: InterpretationTable | Record<string, Interpretation>) => ({ table, written: Object.keys(data).length });
  return [
    t('Sun in sign', SUN_IN_SIGN),
    t('Moon in sign', MOON_IN_SIGN_READING),
    t('Rising sign', RISING_IN_SIGN),
    { table: 'Houses', written: HOUSE_MEANINGS.length },
    t('Planet in sign', PLANET_IN_SIGN),
    t('Planet in house', PLANET_IN_HOUSE),
    t('Sign on cusp', SIGN_ON_CUSP),
    t('Aspects', ASPECT_READINGS),
    t('Points', POINT_READINGS),
    t('Transits', TRANSIT_READINGS),
    t('Patterns', PATTERN_READINGS),
    t('Balance', ELEMENT_READINGS),
    t('Chart ruler', RULER_READINGS),
  ];
}
