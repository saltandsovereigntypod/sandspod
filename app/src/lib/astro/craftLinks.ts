// Where a birth chart meets the craft: personal correspondences from the
// chart ruler (and the Sun and Moon's rulers), the deities tied to the
// chart's strongest planets, the natal altar, and a line for Today from the
// sky's touch on the chart. Pure; the screens turn names into links to the
// Living Library, the deity journeys and the altar.

import { aspectDef } from './aspects.ts';
import { transitsTo, type TransitHit } from './forecast.ts';
import { PLANET_RULES } from './meanings.ts';
import { positionOf, type Chart } from './natal.ts';
import { ordinalHouse } from './interpret/houses.ts';
import { PLANET_GUIDES, type DeityLink, type PlanetDeity, type PlanetGuide } from './planetGuides.ts';
import { CLASSICAL, TRADITIONAL_RULER, type Classical, type ChartPointName, type ZodiacSign } from './signs.ts';
import { myDeities, patrons } from '../patron/mine.ts';

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

/** A deity someone keeps (My deities): a Living Library key and/or a name. */
export type PatronLike = { key?: string | null; name: string };

/** The patrons in someone's settings (the `my_deities` setting); none when signed out or unset. */
export const patronsFromSettings = (settings: Record<string, unknown> | null | undefined): PatronLike[] => patrons(myDeities(settings));

const nameKey = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/^the\s+/, '')
    .replace(/[^a-z]/g, '');

/** The patron this guide deity is, if any: by Library key or by name. */
function patronFor(name: string, list: PatronLike[]): PatronLike | null {
  const k = nameKey(name);
  if (!k) return null;
  return list.find((p) => (p.key ? nameKey(p.key) === k : false) || nameKey(p.name) === k) ?? null;
}

export type ChartDeity = PlanetDeity & {
  planet: Classical;
  why: string;
  /** One of the person's patrons. */
  patron?: boolean;
  /** "Hekate, your patron, links to your chart ruler, Saturn." */
  patronLine?: string;
};

const theName = (planet: Classical) => (planet === 'Sun' || planet === 'Moon' ? `the ${planet}` : planet);

/**
 * Deities tied to the strong planets, with the planet and why. Names match
 * the Living Library. Any of the person's patrons among them come first,
 * with a line saying so (and are never cut by the limit).
 */
export function deitiesForChart(chart: Chart, patronList: PatronLike[] = [], limit = 8): ChartDeity[] {
  const out: ChartDeity[] = [];
  for (const s of strongPlacements(chart)) {
    for (const d of PLANET_GUIDES[s.planet].deities) {
      if (out.some((o) => o.name === d.name)) continue;
      const entry: ChartDeity = { ...d, planet: s.planet, why: s.reasons.join(', ') };
      if (patronFor(d.name, patronList)) {
        entry.patron = true;
        entry.patronLine =
          chart.ruler?.traditional === s.planet
            ? `${d.name}, your patron, links to your chart ruler, ${s.planet}.`
            : `${d.name}, your patron, links to ${theName(s.planet)}, ${s.reasons[0]} in your chart.`;
      }
      out.push(entry);
    }
  }
  const mine = out.filter((d) => d.patron);
  return [...mine, ...out.filter((d) => !d.patron)].slice(0, Math.max(limit, mine.length));
}

export type PatronPlanet = {
  name: string;
  planet: Classical;
  link: DeityLink;
  sign: ZodiacSign;
  house: number | null;
  /** "Your patron Apollo is tied to the Sun; in your chart the Sun is in Leo, in the fifth house." */
  line: string;
};

/**
 * Patrons tied in the guides to a planet that isn't among the chart's strong
 * placements (so deitiesForChart doesn't show them): where that planet sits.
 */
export function patronPlanets(chart: Chart, patronList: PatronLike[]): PatronPlanet[] {
  if (!patronList.length) return [];
  const shown = deitiesForChart(chart, patronList, Infinity).filter((d) => d.patron);
  const out: PatronPlanet[] = [];
  for (const planet of CLASSICAL) {
    const p = positionOf(chart, planet);
    if (!p) continue;
    for (const d of PLANET_GUIDES[planet].deities) {
      if (!patronFor(d.name, patronList) || shown.some((s) => s.name === d.name)) continue;
      const where = `${p.sign}${p.house ? `, in the ${ordinalHouse(p.house)}` : ''}`;
      const how = d.link === 'modern' ? ' in modern practice' : '';
      out.push({
        name: d.name,
        planet,
        link: d.link,
        sign: p.sign,
        house: p.house ?? null,
        line: `Your patron ${d.name} is tied to ${theName(planet)}${how}; in your chart ${theName(planet)} is in ${where}.`,
      });
    }
  }
  return out;
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
