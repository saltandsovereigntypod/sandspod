// The zodiac's bones: each sign's element, modality, polarity, glyph and
// rulers, the planets' glyphs, and the essential dignities (domicile,
// exaltation, detriment, fall) as the Hellenistic and medieval astrologers
// set them out, with the modern rulers of Uranus, Neptune and Pluto beside
// the traditional ones. Pure data.

import { SIGNS, type ZodiacSign } from '../moon.ts';
import type { Body } from './ephemeris.ts';
import type { Planet } from './planets.ts';

export { SIGNS, type ZodiacSign };

export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';
export type Polarity = 'yang' | 'yin';

export const ELEMENTS: Element[] = ['fire', 'earth', 'air', 'water'];
export const MODALITIES: Modality[] = ['cardinal', 'fixed', 'mutable'];

export const SIGN_GLYPH: Record<ZodiacSign, string> = {
  Aries: '♈︎', Taurus: '♉︎', Gemini: '♊︎', Cancer: '♋︎', Leo: '♌︎', Virgo: '♍︎',
  Libra: '♎︎', Scorpio: '♏︎', Sagittarius: '♐︎', Capricorn: '♑︎', Aquarius: '♒︎', Pisces: '♓︎',
};

export type ChartPointName = Body | 'Part of Fortune' | 'Ascendant' | 'Midheaven' | 'Descendant' | 'IC';

export const POINT_GLYPH: Record<ChartPointName, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷', 'North Node': '☊', 'South Node': '☋', Lilith: '⚸', 'Part of Fortune': '⊗',
  Ascendant: 'AC', Midheaven: 'MC', Descendant: 'DC', IC: 'IC',
};

export const signIndex = (sign: ZodiacSign) => SIGNS.indexOf(sign);
export const elementOf = (sign: ZodiacSign): Element => ELEMENTS[signIndex(sign) % 4];
export const modalityOf = (sign: ZodiacSign): Modality => MODALITIES[signIndex(sign) % 3];
export const polarityOf = (sign: ZodiacSign): Polarity => (signIndex(sign) % 2 === 0 ? 'yang' : 'yin');
export const oppositeSign = (sign: ZodiacSign): ZodiacSign => SIGNS[(signIndex(sign) + 6) % 12];

export type Classical = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn';
export const CLASSICAL: Classical[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

/** The traditional ruler of each sign (the seven visible planets). */
export const TRADITIONAL_RULER: Record<ZodiacSign, Classical> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
  Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

/** The modern ruler, where it differs: Uranus for Aquarius, Neptune for Pisces, Pluto for Scorpio. */
export const MODERN_RULER: Record<ZodiacSign, Planet> = {
  ...TRADITIONAL_RULER,
  Scorpio: 'Pluto',
  Aquarius: 'Uranus',
  Pisces: 'Neptune',
};

/** The signs each planet rules (traditional first, then modern). */
export function domiciles(planet: Planet): ZodiacSign[] {
  const out = SIGNS.filter((s) => TRADITIONAL_RULER[s] === planet);
  for (const s of SIGNS) if (MODERN_RULER[s] === planet && !out.includes(s)) out.push(s);
  return out;
}

/** Where each of the seven is exalted (Ptolemy, Tetrabiblos I.19). The outer planets have no agreed exaltation. */
export const EXALTATION: Partial<Record<Planet, ZodiacSign>> = {
  Sun: 'Aries', Moon: 'Taurus', Mercury: 'Virgo', Venus: 'Pisces', Mars: 'Capricorn', Jupiter: 'Cancer', Saturn: 'Libra',
};

export type Dignity = 'domicile' | 'exaltation' | 'detriment' | 'fall';

/** A planet's essential dignity in a sign, or null when it is peregrine (none of the four). */
export function dignityOf(planet: Planet, sign: ZodiacSign): Dignity | null {
  const homes = domiciles(planet);
  if (homes.includes(sign)) return 'domicile';
  if (EXALTATION[planet] === sign) return 'exaltation';
  if (homes.some((h) => oppositeSign(h) === sign)) return 'detriment';
  const ex = EXALTATION[planet];
  if (ex && oppositeSign(ex) === sign) return 'fall';
  return null;
}

export const DIGNITY_LABEL: Record<Dignity, string> = { domicile: 'Domicile', exaltation: 'Exalted', detriment: 'Detriment', fall: 'Fall' };

/** Decans: each sign's three ten-degree faces, ruled in the Chaldean order from Mars at 0° Aries (the "faces" of Hellenistic astrology). */
const CHALDEAN: Classical[] = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
export function decanOf(longitude: number): { decan: 1 | 2 | 3; ruler: Classical; triplicityRuler: Planet } {
  const lon = ((longitude % 360) + 360) % 360;
  const index = Math.floor(lon / 10); // 0..35
  const ruler = CHALDEAN[(index + 2) % 7]; // 0° Aries begins with Mars
  const sign = SIGNS[Math.floor(lon / 30)];
  const decan = ((index % 3) + 1) as 1 | 2 | 3;
  // The modern "triplicity" decans: the ruler of the sign of the same element that comes 0, 4 or 8 signs on.
  const triplicityRuler = MODERN_RULER[SIGNS[(signIndex(sign) + (decan - 1) * 4) % 12]];
  return { decan, ruler, triplicityRuler };
}
