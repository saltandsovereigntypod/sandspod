// The astrology settings, read from Sanctuary settings (the same keys on
// the website): Explanations (Simple or Detailed), the house system, the
// zodiac, which nodes, and the aspect orbs. Pure.

import { parseOrbs } from './aspects.ts';
import { HOUSE_SYSTEMS, type HouseSystem } from './houses.ts';
import type { ChartOptions } from './natal.ts';

export type ExplainLevel = 'simple' | 'detailed';

type SettingsLike = Record<string, unknown> | null | undefined;

export const explainLevel = (settings: SettingsLike): ExplainLevel => (settings?.astro_explanations === 'detailed' ? 'detailed' : 'simple');

export function chartOptionsFrom(settings: SettingsLike, extra: Partial<ChartOptions> = {}): ChartOptions {
  const hs = String(settings?.astro_house_system ?? 'placidus') as HouseSystem;
  return {
    houseSystem: HOUSE_SYSTEMS.includes(hs) && hs !== 'porphyry' ? hs : 'placidus',
    zodiac: settings?.astro_zodiac === 'sidereal' ? 'sidereal' : 'tropical',
    nodes: settings?.astro_nodes === 'mean' ? 'mean' : 'true',
    orbs: parseOrbs(settings?.astro_orbs ?? ''),
    solarChart: false,
    ...extra,
  };
}
