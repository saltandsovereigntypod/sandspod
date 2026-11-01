// One place to ask for any piece of interpretation. Screens and the
// composer call these; they return null when a piece hasn't been written
// yet, and the caller shows "coming soon" (with the glossary) instead.

import type { AspectName, PatternName } from '../aspects.ts';
import { MODERN_RULER, TRADITIONAL_RULER, type ChartPointName, type ZodiacSign } from '../signs.ts';
import { ASPECT_READINGS, minorAspectReading } from './aspects.ts';
import { ELEMENT_READINGS } from './balance.ts';
import { deepenBig } from './bigThreeDeeper.ts';
import { HOUSE_MEANINGS, houseAllies, ordinalHouse } from './houses.ts';
import { linkCusp, linkHouse, linkInHouse, linkInSign } from './links.ts';
import { MOON_IN_SIGN_READING } from './moonSigns.ts';
import { PATTERN_READINGS } from './patterns.ts';
import { PLANET_IN_HOUSE } from './planetInHouse.ts';
import { PLANET_IN_SIGN } from './planetInSign.ts';
import { POINT_READINGS } from './points.ts';
import { RISING_IN_SIGN } from './risingSigns.ts';
import { RULER_READINGS } from './ruler.ts';
import { SIGN_ON_CUSP } from './signOnCusp.ts';
import { SUN_IN_SIGN } from './sunSigns.ts';
import { PROGRESSED_MOON_HOUSE, PROGRESSED_MOON_SIGN, PROGRESSED_PHASE_READINGS, RETURN_GUIDES, RETURN_HOUSE_READINGS, TRANSIT_READINGS } from './transits.ts';
import type { ProgressedPhase } from '../forecast.ts';
import { keys, type HouseMeaning, type Interpretation, type InterpretationTable } from './types.ts';

export type { HouseMeaning, Interpretation };

function rawInSign(body: ChartPointName, sign: ZodiacSign): Interpretation | null {
  if (body === 'Sun') return deepenBig(SUN_IN_SIGN[sign], 'Sun', sign);
  if (body === 'Moon') return deepenBig(MOON_IN_SIGN_READING[sign], 'Moon', sign);
  if (body === 'Ascendant') return deepenBig(RISING_IN_SIGN[sign], 'Ascendant', sign);
  return PLANET_IN_SIGN[keys.planetInSign(body, sign)] ?? POINT_READINGS[keys.pointInSign(body, sign)] ?? null;
}

/** A body in a sign, with its links (planet guide, Library, rituals, journeys). */
export const inSign = (body: ChartPointName, sign: ZodiacSign): Interpretation | null => linkInSign(rawInSign(body, sign), body);

/** A body in a house, with its links. */
export const inHouse = (body: ChartPointName, house: number): Interpretation | null =>
  linkInHouse(PLANET_IN_HOUSE[keys.planetInHouse(body, house)] ?? POINT_READINGS[keys.pointInHouse(body, house)] ?? null, body, house);

/** A sign on a house cusp, with its links. */
export const signOnCusp = (house: number, sign: ZodiacSign): Interpretation | null => linkCusp(SIGN_ON_CUSP[keys.signOnCusp(house, sign)] ?? null, house, sign);

/** A natal aspect; the minor aspects share one reading each, joined with the pair's own line. */
export const aspectReading = (a: ChartPointName, aspect: AspectName, b: ChartPointName): Interpretation | null =>
  ASPECT_READINGS[keys.aspect(a, aspect, b)] ?? minorAspectReading(a, aspect, b);

export const transitReading = (transiting: ChartPointName, aspect: AspectName, natal: ChartPointName): Interpretation | null =>
  TRANSIT_READINGS[keys.transit(transiting, aspect, natal)] ?? null;

export const patternReading = (name: PatternName): Interpretation | null => PATTERN_READINGS[keys.pattern(name)] ?? null;

export const balanceReading = (kind: 'dominant' | 'missing', what: string): Interpretation | null => ELEMENT_READINGS[keys.balance(kind, what)] ?? null;

export const rulerReading = (ruler: ChartPointName, house: number): Interpretation | null => RULER_READINGS[keys.rulerInHouse(ruler, house)] ?? null;

/** The chart ruler as a planet, whatever its house. */
export const chartRulerReading = (ruler: ChartPointName): Interpretation | null => RULER_READINGS[keys.chartRuler(ruler)] ?? null;

/** How to read a solar or lunar return. */
export const returnGuide = (kind: 'solar' | 'lunar'): Interpretation => RETURN_GUIDES[kind];

/** A solar return's Sun, or a lunar return's Moon, in a house of the return chart. */
export const returnHouseReading = (kind: 'solar' | 'lunar', house: number): Interpretation | null => RETURN_HOUSE_READINGS[`${kind}|house|${house}`] ?? null;

/** The progressed Moon in a sign, in a natal house, and the progressed lunar phase. */
export const progressedMoonSign = (sign: ZodiacSign): Interpretation | null => PROGRESSED_MOON_SIGN[`sign|${sign}`] ?? null;
export const progressedMoonHouse = (house: number): Interpretation | null => PROGRESSED_MOON_HOUSE[`house|${house}`] ?? null;
export const progressedPhaseReading = (phase: ProgressedPhase): Interpretation | null => PROGRESSED_PHASE_READINGS[`phase|${phase}`] ?? null;

export const houseMeaning = (house: number): HouseMeaning => HOUSE_MEANINGS[house - 1];

/** What a chart puts in a house, for its card: the cusp sign, the bodies in it, and where the cusp ruler sits. */
export type HouseInChart = { sign: ZodiacSign; inside: string[]; rulerAt: { sign: ZodiacSign; house?: number | null } | null };

/**
 * One house's card, the same on the chart screen, the house sheet and the
 * reading (app and website). Simple: the house and its cusp sign in a few
 * sentences, and the short craft line. Detailed: the house's full reading,
 * then this chart's cusp, ruler and planets, then the sign on the cusp read in
 * depth; and the full craft text with the cusp sign's craft line.
 */
export function houseReading(house: number, inChart?: HouseInChart | null): Interpretation {
  const h = houseMeaning(house);
  const sign = inChart?.sign ?? null;
  const onCusp = sign ? signOnCusp(house, sign) : null;
  let here = '';
  if (inChart && sign) {
    const ruler = TRADITIONAL_RULER[sign];
    const modern = MODERN_RULER[sign];
    const { inside, rulerAt } = inChart;
    const where = rulerAt ? `${rulerAt.sign}${rulerAt.house ? `, in the ${ordinalHouse(rulerAt.house)}` : ''}` : 'the chart';
    const tie = !rulerAt?.house
      ? 'see where it sits for where these matters lead'
      : rulerAt.house === house
        ? 'a ruler in its own house keeps these matters strongly in your own hands'
        : `the matters of this house are tied to ${houseMeaning(rulerAt.house).keywords.slice(0, 2).join(', ')} and ${houseMeaning(rulerAt.house).keywords[2]}`;
    here = `In your chart: ${sign} is on the cusp of the ${ordinalHouse(house)}${inside.length ? `, and ${inside.length > 1 ? `${inside.slice(0, -1).join(', ')} and ${inside[inside.length - 1]}` : inside[0]} ${inside.length === 1 ? 'is' : 'are'} here` : ', and no planet is here, so read it through its cusp and ruler'}. Its ruler, ${ruler}${modern !== ruler ? ` (in modern astrology also ${modern})` : ''}, is in ${where}: ${tie}.`;
  }
  const reading: Interpretation = {
    simple: onCusp ? `${h.simple} ${onCusp.simple}` : h.simple,
    detailed: [h.detailed, here, onCusp?.detailed].filter(Boolean).join('\n\n'),
    magic: h.magic,
    magicDetailed: onCusp ? `${h.craft} ${onCusp.magic}` : h.craft,
    ...(onCusp?.shadow ? { shadow: onCusp.shadow } : {}),
    ...(onCusp?.links ? { links: onCusp.links } : {}),
  };
  return linkHouse(reading, house, sign, houseAllies(h, (s) => TRADITIONAL_RULER[s]));
}

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
    t('Returns', RETURN_HOUSE_READINGS),
    t('Progressed Moon', { ...PROGRESSED_MOON_SIGN, ...PROGRESSED_MOON_HOUSE, ...PROGRESSED_PHASE_READINGS }),
  ];
}
