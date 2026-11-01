// Glossary: the twelve houses, built from the house meanings the chart
// reading uses (interpret/houses.ts), so the two never disagree.

import { HOUSE_MEANINGS } from '../interpret/houses.ts';
import type { GlossaryEntry } from './types.ts';

const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const KIND: Record<string, string> = {
  angular: 'An angular house (1, 4, 7, 10): the strongest places, where planets act most visibly.',
  succedent: 'A succedent house (2, 5, 8, 11): the houses that follow the angles, of resources and what is built up.',
  cadent: 'A cadent house (3, 6, 9, 12): the houses that "fall away" from the angles, of learning, adjusting and change.',
};

export const HOUSE_TERMS: GlossaryEntry[] = HOUSE_MEANINGS.map((h) => ({
  id: `house-${h.house}`,
  term: `${ORDINAL[h.house - 1][0].toUpperCase()}${ORDINAL[h.house - 1].slice(1)} house`,
  category: 'house',
  symbol: String(h.house),
  aliases: [`${h.house}${h.house === 1 ? 'st' : h.house === 2 ? 'nd' : h.house === 3 ? 'rd' : 'th'} house`, `house ${h.house}`],
  simple: h.simple,
  detailed: {
    sky: `${KIND[h.kind]} Its natural sign, the one that would sit on it if Aries were rising, is ${h.naturalSign}. Where its cusp falls depends on the house system (see House systems).`,
    traditions: h.detailed,
    craft: h.craft,
    care: `Keywords: ${h.keywords.join(', ')}. A house without planets is not empty of meaning: read its cusp's sign and where that sign's ruler sits.`,
  },
  related: ['houses', 'house-systems', h.house === 1 ? 'ascendant' : h.house === 4 ? 'imum-coeli' : h.house === 7 ? 'descendant' : h.house === 10 ? 'midheaven' : 'cusp'],
}));
