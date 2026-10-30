// Where a birth chart meets the craft: personal correspondences from the
// chart ruler (and the Sun and Moon's rulers), the deities tied to the
// chart's strongest planets, the natal altar, and a line for Today from the
// sky's touch on the chart. Pure; the screens turn names into links to the
// Living Library, the deity journeys and the altar.

import { aspectDef } from './aspects.ts';
import { transitsTo, type TransitHit } from './forecast.ts';
import { PLANET_RULES } from './meanings.ts';
import { positionOf, type Chart } from './natal.ts';
import { PLANET_GUIDES, type PlanetGuide } from './planetGuides.ts';
import { CLASSICAL, TRADITIONAL_RULER, type Classical, type ChartPointName } from './signs.ts';

export type PersonalAlly = {
  planet: Classical;
  /** Why this planet is yours. */
  why: string;
  guide: PlanetGuide;
};

/**
 * The person's planetary allies, strongest first: the chart ruler (with a
 * birth time), then the rulers of the Sun's and Moon's signs.
 */
export function personalAllies(chart: Chart): PersonalAlly[] {
  const out: PersonalAlly[] = [];
  const add = (planet: Classical, why: string) => {
    const have = out.find((a) => a.planet === planet);
    if (have) have.why += `; ${why}`;
    else out.push({ planet, why, guide: PLANET_GUIDES[planet] });
  };
  if (chart.ruler) add(chart.ruler.traditional, `your chart ruler (${chart.ruler.sign} rising)`);
  const sun = positionOf(chart, 'Sun');
  const moon = positionOf(chart, 'Moon');
  if (sun) add(TRADITIONAL_RULER[sun.sign], `rules your Sun sign, ${sun.sign}`);
  if (moon) add(TRADITIONAL_RULER[moon.sign], `rules your Moon sign, ${moon.sign}`);
  return out;
}

export type StrongPlacement = { planet: Classical; reasons: string[] };

/**
 * The chart's strongest classical planets: those at home or exalted, on an
 * angle (houses 1, 4, 7, 10), the chart ruler, and the lights. Deities
 * linked to these are offered as a place to start (never as an assignment).
 */
export function strongPlacements(chart: Chart): StrongPlacement[] {
  const out = new Map<Classical, string[]>();
  const add = (planet: Classical, reason: string) => out.set(planet, [...(out.get(planet) ?? []), reason]);
  for (const planet of CLASSICAL) {
    const p = positionOf(chart, planet);
    if (!p) continue;
    if (p.dignity === 'domicile') add(planet, `at home in ${p.sign}`);
    if (p.dignity === 'exaltation') add(planet, `exalted in ${p.sign}`);
    if (p.house && [1, 4, 7, 10].includes(p.house)) add(planet, `on an angle, in the ${['', 'first', '', '', 'fourth', '', '', 'seventh', '', '', 'tenth'][p.house]} house`);
  }
  if (chart.ruler) add(chart.ruler.traditional, 'your chart ruler');
  return [...out.entries()].map(([planet, reasons]) => ({ planet, reasons })).sort((a, b) => b.reasons.length - a.reasons.length);
}

/** Deities tied to the strong planets, with the planet and why. Names match the Living Library. */
export function deitiesForChart(chart: Chart, limit = 8): { name: string; tradition: string; note: string; planet: Classical; why: string }[] {
  const out: { name: string; tradition: string; note: string; planet: Classical; why: string }[] = [];
  for (const s of strongPlacements(chart)) {
    for (const d of PLANET_GUIDES[s.planet].deities) {
      if (out.some((o) => o.name === d.name)) continue;
      out.push({ ...d, planet: s.planet, why: s.reasons.join(', ') });
    }
  }
  return out.slice(0, limit);
}

/** The natal altar: the chart ruler's planet (or the Sun sign's ruler without a time). */
export function natalAltarPlanet(chart: Chart): Classical {
  if (chart.ruler) return chart.ruler.traditional;
  return TRADITIONAL_RULER[positionOf(chart, 'Sun')!.sign];
}

const VERB: Record<string, string> = {
  conjunction: 'is with',
  opposition: 'opposes',
  trine: 'trines',
  square: 'squares',
  sextile: 'sextiles',
  quincunx: 'is quincunx',
};

const POINT_THEME: Partial<Record<ChartPointName, string>> = {
  ...PLANET_RULES,
  Ascendant: 'your body and presence',
  Midheaven: 'your calling and public life',
  'North Node': 'your direction of growth',
  Chiron: 'old wounds and healing',
};

/** "Saturn squares your natal Moon: …" — the strongest transit, for Today. */
export function transitLineFor(hit: TransitHit): string {
  const natal = hit.natal === 'Ascendant' ? 'rising degree' : hit.natal === 'Midheaven' ? 'Midheaven' : `natal ${hit.natal}`;
  const tone = aspectDef(hit.aspect).tone;
  const how = tone === 'soft' ? 'an easy time for' : tone === 'hard' ? 'a push to work on' : 'a strong focus on';
  return `${hit.transiting} ${VERB[hit.aspect] ?? hit.aspect} your ${natal}: ${how} ${POINT_THEME[hit.natal] ?? 'that part of you'}.`;
}

/** Today's one line from the sky to your chart, or null when nothing is close. Slow planets lead; the Moon only when nothing else is. */
export function todayLine(chart: Chart, now: Date): { line: string; hit: TransitHit } | null {
  const hits = transitsTo(chart, now).filter((h) => h.transiting !== 'North Node');
  const best = hits.find((h) => h.transiting !== 'Moon') ?? hits[0];
  return best ? { line: transitLineFor(best), hit: best } : null;
}
