// "Your chart, read in full": the composer walks a chart in a fixed order
// and asks the registry for each piece. A piece that's written comes back
// ready; one that isn't comes back as `coming-soon`, with a one-line
// sketch built from the planet's and sign's keywords and the glossary
// terms to read meanwhile, so the reading is never blank. Pure.

import { aspectDef, PATTERN_LABEL } from '../aspects.ts';
import { PLANET_RULES, SIGN_STYLE } from '../meanings.ts';
import { positionOf, type Chart, type Position } from '../natal.ts';
import type { Planet } from '../planets.ts';
import { DIGNITY_LABEL, MODERN_RULER, SIGNS, TRADITIONAL_RULER, type ChartPointName } from '../signs.ts';
import type { ProgressedPhase, ReturnChart, TransitHit } from '../forecast.ts';
import { ordinalHouse } from './houses.ts';
import {
  aspectReading,
  balanceReading,
  chartRulerReading,
  houseMeaning,
  inHouse,
  inSign,
  patternReading,
  progressedMoonHouse,
  progressedMoonSign,
  progressedPhaseReading,
  returnGuide,
  returnHouseReading,
  rulerReading,
  signOnCusp,
  transitReading,
  type Interpretation,
} from './registry.ts';

export type ReadingPiece =
  | { status: 'ready'; title: string; reading: Interpretation; terms: string[] }
  | { status: 'coming-soon'; title: string; sketch: string; terms: string[] };

export type ReadingSection = { id: string; title: string; intro?: string; pieces: ReadingPiece[] };

const termId = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
export { ordinalHouse };

const PLANET_WORDS: Partial<Record<ChartPointName, string>> = {
  ...PLANET_RULES,
  Chiron: 'wounds that teach and the healer in you',
  'North Node': 'growth and direction',
  'South Node': 'what comes easily from the past',
  Lilith: 'the wild and refused self',
  'Part of Fortune': 'fortune, comfort and the body',
  Midheaven: 'vocation and public life',
};

function piece(title: string, reading: Interpretation | null, sketch: string, terms: string[]): ReadingPiece {
  return reading ? { status: 'ready', title, reading, terms } : { status: 'coming-soon', title, sketch, terms };
}

function signSketch(p: Position): string {
  const words = PLANET_WORDS[p.point];
  const dignity = p.dignity ? ` It is in its ${DIGNITY_LABEL[p.dignity].toLowerCase()} here.` : '';
  return words ? `${p.point} (${words}) works ${SIGN_STYLE[p.sign]} in ${p.sign}.${dignity}` : `${p.point} in ${p.sign}.`;
}

function houseSketch(p: Position): string {
  const h = houseMeaning(p.house!);
  return `${p.point} brings its themes into the ${ordinalHouse(p.house!)}: ${h.keywords.slice(0, 4).join(', ')}.`;
}

/** The whole reading, section by section. */
export function composeReading(chart: Chart): ReadingSection[] {
  const sections: ReadingSection[] = [];
  const hasHouses = !!chart.houses;

  // The big three.
  const big: ReadingPiece[] = [];
  for (const name of ['Sun', 'Moon', 'Ascendant'] as const) {
    const p = positionOf(chart, name);
    if (!p) continue;
    const title = name === 'Ascendant' ? `${p.sign} rising` : `${name} in ${p.sign}`;
    big.push(piece(title, inSign(name, p.sign), signSketch(p), [termId(name), termId(p.sign)]));
  }
  sections.push({
    id: 'big-three',
    title: 'Sun, Moon and rising',
    intro: chart.timeKnown ? undefined : 'Without a birth time there is no rising sign, and the Moon\'s degree is approximate.',
    pieces: big,
  });

  // The chart ruler.
  if (chart.ruler) {
    const r = positionOf(chart, chart.ruler.traditional);
    const modern = chart.ruler.modern !== chart.ruler.traditional ? ` (in modern astrology also ${chart.ruler.modern})` : '';
    if (r) {
      sections.push({
        id: 'ruler',
        title: 'Your chart ruler',
        intro: `With ${chart.ruler.sign} rising, your chart ruler is ${chart.ruler.traditional}${modern}. It sits in ${r.sign}${r.house ? `, in the ${ordinalHouse(r.house)}` : ''}.`,
        pieces: [
          piece(
            `${chart.ruler.traditional} rules your chart`,
            chartRulerReading(chart.ruler.traditional),
            `${chart.ruler.traditional} (${PLANET_RULES[chart.ruler.traditional as Planet]}) steers the whole chart.`,
            ['chart-ruler', termId(chart.ruler.traditional)],
          ),
          ...(chart.ruler.modern !== chart.ruler.traditional
            ? [piece(`${chart.ruler.modern}, the modern co-ruler`, chartRulerReading(chart.ruler.modern), `${chart.ruler.modern} (${PLANET_RULES[chart.ruler.modern]}) also colours the chart.`, ['chart-ruler', termId(chart.ruler.modern)])]
            : []),
          piece(
            `${chart.ruler.traditional} in the ${r.house ? ordinalHouse(r.house) : 'chart'}`,
            r.house ? rulerReading(chart.ruler.traditional, r.house) : null,
            `Your life's direction is coloured by ${chart.ruler.traditional} (${PLANET_RULES[chart.ruler.traditional as Planet]})${r.house ? `, and drawn toward ${houseMeaning(r.house).keywords.slice(0, 3).join(', ')}` : ''}.`,
            ['chart-ruler', termId(chart.ruler.traditional)],
          ),
        ],
      });
    }
  }

  // The planets, in sign and house.
  const planets: ReadingPiece[] = [];
  for (const p of chart.positions) {
    if (['Sun', 'Moon', 'Ascendant', 'Descendant', 'IC', 'Midheaven', 'South Node'].includes(p.point)) continue;
    planets.push(piece(`${p.point} in ${p.sign}${p.retrograde ? ', retrograde' : ''}`, inSign(p.point, p.sign), signSketch(p), [termId(p.point), termId(p.sign)]));
    if (hasHouses && p.house) planets.push(piece(`${p.point} in the ${ordinalHouse(p.house)}`, inHouse(p.point, p.house), houseSketch(p), [termId(p.point), `house-${p.house}`]));
  }
  const sun = positionOf(chart, 'Sun');
  const moon = positionOf(chart, 'Moon');
  for (const p of [sun, moon]) {
    if (p && hasHouses && p.house) planets.unshift(piece(`${p.point} in the ${ordinalHouse(p.house)}`, inHouse(p.point, p.house), houseSketch(p), [termId(p.point), `house-${p.house}`]));
  }
  const mc = positionOf(chart, 'Midheaven');
  if (mc) planets.push(piece(`Midheaven in ${mc.sign}`, inSign('Midheaven', mc.sign), `Your public path and calling are met ${SIGN_STYLE[mc.sign]}.`, ['midheaven', termId(mc.sign)]));
  sections.push({ id: 'planets', title: 'The planets and points', pieces: planets });

  // The houses.
  if (hasHouses) {
    const houses: ReadingPiece[] = [];
    for (let n = 1; n <= 12; n++) {
      const h = houseMeaning(n);
      const cusp = chart.houses!.cusps[n - 1];
      const cuspSign = SIGNS[Math.floor(cusp / 30) % 12];
      const inside = chart.positions.filter((p) => p.house === n && !['Ascendant', 'Midheaven', 'Descendant', 'IC'].includes(p.point)).map((p) => p.point);
      const ruler = TRADITIONAL_RULER[cuspSign];
      const modern = MODERN_RULER[cuspSign];
      const rulerAt = positionOf(chart, ruler);
      const onCusp = signOnCusp(n, cuspSign);
      houses.push({
        status: 'ready',
        title: `${n}. ${h.name}`,
        terms: [`house-${n}`, termId(cuspSign)],
        reading: {
          simple: onCusp ? `${h.simple} ${onCusp.simple}` : h.simple,
          detailed: `${h.detailed}\n\n${cuspSign} is on the cusp${inside.length ? `, and ${inside.join(', ')} ${inside.length === 1 ? 'is' : 'are'} here` : ', and no planet is here'}. Its ruler, ${ruler}${modern !== ruler ? ` (modern: ${modern})` : ''}, is in ${rulerAt ? `${rulerAt.sign}${rulerAt.house ? `, the ${ordinalHouse(rulerAt.house)}` : ''}` : 'the chart'}.${onCusp ? `\n\n${onCusp.detailed}` : ''}`,
          magic: onCusp ? `${h.magic} ${onCusp.magic}` : h.magic,
          ...(onCusp?.shadow ? { shadow: onCusp.shadow } : {}),
          ...(onCusp?.links ? { links: onCusp.links } : {}),
        },
      });
    }
    sections.push({ id: 'houses', title: 'The twelve houses', pieces: houses });
  }

  // Aspects: the ten tightest between planets.
  const aspects = chart.aspects.filter((a) => !['Part of Fortune', 'Lilith'].includes(a.a) && !['Part of Fortune', 'Lilith'].includes(a.b)).slice(0, 12);
  sections.push({
    id: 'aspects',
    title: 'The closest aspects',
    pieces: aspects.map((a) => {
      const def = aspectDef(a.aspect);
      return piece(
        `${a.a} ${a.aspect} ${a.b}`,
        aspectReading(a.a, a.aspect, a.b),
        `${a.a} (${PLANET_WORDS[a.a] ?? a.a}) and ${a.b} (${PLANET_WORDS[a.b] ?? a.b}), ${a.orb.toFixed(1)}° from an exact ${a.aspect} (${def.angle}°): ${def.tone === 'soft' ? 'an easy flow between them' : def.tone === 'hard' ? 'friction that asks for effort' : def.tone === 'blend' ? 'the two acting as one' : 'a subtle link'}.`,
        [termId(a.a), a.aspect, termId(a.b)],
      );
    }),
  });

  // Patterns.
  if (chart.patterns.length) {
    sections.push({
      id: 'patterns',
      title: 'Patterns',
      pieces: chart.patterns.map((p) =>
        piece(
          `${PATTERN_LABEL[p.name]}: ${p.points.join(', ')}${p.sign ? ` in ${p.sign}` : p.house ? ` in the ${ordinalHouse(p.house)}` : ''}`,
          patternReading(p.name),
          `${p.points.join(', ')} form a ${PATTERN_LABEL[p.name].toLowerCase()}${p.apex ? `, focused on ${p.apex}` : ''}.`,
          [p.name],
        ),
      ),
    });
  }

  // Balance.
  const b = chart.balance;
  const balance: ReadingPiece[] = [
    piece(`Mostly ${b.dominantElement}`, balanceReading('dominant', b.dominantElement), `The ${b.dominantElement} signs are strongest in your chart.`, ['elements', b.dominantElement]),
    ...b.missingElements.map((e) => piece(`No ${e}`, balanceReading('missing', e), `No planet is in a ${e} sign; many people find they seek ${e} in others or grow it with care.`, ['elements', e])),
    piece(`Mostly ${b.dominantModality}`, balanceReading('dominant', b.dominantModality), `Cardinal starts, fixed sustains, mutable adapts: you lean ${b.dominantModality}.`, ['modalities', b.dominantModality]),
    ...(['cardinal', 'fixed', 'mutable'] as const)
      .filter((m) => b.modalities[m].points.length === 0)
      .map((m) => piece(`No ${m}`, balanceReading('missing', m), `No planet is in a ${m} sign.`, ['modalities', m])),
  ];
  const polar = b.polarity.yang.score === b.polarity.yin.score ? null : b.polarity.yang.score > b.polarity.yin.score ? 'yang' : 'yin';
  if (polar) balance.push(piece(`Mostly ${polar}`, balanceReading('dominant', polar), `The ${polar} signs lead in your chart.`, ['polarity']));
  for (const side of leaningSides(b)) {
    const label = { above: 'Mostly above the horizon', below: 'Mostly below the horizon', east: 'Mostly on the eastern side', west: 'Mostly on the western side' }[side];
    balance.push(piece(label, balanceReading('dominant', side), `Most of your planets are on the ${side} side of the chart.`, ['houses']));
  }
  const q = leadingQuadrant(b);
  if (q) balance.push(piece(`Mostly in quadrant ${q}`, balanceReading('dominant', `quadrant-${q}`), `Most of your planets are in houses ${q * 3 - 2} to ${q * 3}.`, ['houses']));
  sections.push({ id: 'balance', title: 'Balance', pieces: balance });

  return sections;
}

/** The halves of the chart holding at least seven of the ten planets. */
export function leaningSides(b: Chart['balance']): ('above' | 'below' | 'east' | 'west')[] {
  if (!b.hemispheres) return [];
  return (['above', 'below', 'east', 'west'] as const).filter((side) => b.hemispheres![side].length >= 7);
}

/** The quadrant holding the most planets, when it holds at least four and more than any other. */
export function leadingQuadrant(b: Chart['balance']): number | null {
  if (!b.quadrants) return null;
  const counts = b.quadrants.map((q) => q.length);
  const max = Math.max(...counts);
  return max >= 4 && counts.filter((c) => c === max).length === 1 ? counts.indexOf(max) + 1 : null;
}

/** A transit as a reading piece, for the transits list. */
export function transitPiece(h: Pick<TransitHit, 'transiting' | 'aspect' | 'natal'>): ReadingPiece {
  const def = aspectDef(h.aspect);
  return piece(
    `Transiting ${h.transiting} ${h.aspect} natal ${h.natal}`,
    transitReading(h.transiting, h.aspect, h.natal),
    `${h.transiting} (${PLANET_WORDS[h.transiting] ?? h.transiting}) is passing ${def.tone === 'soft' ? 'in easy aspect to' : def.tone === 'hard' ? 'in hard aspect to' : 'over'} your ${h.natal} (${PLANET_WORDS[h.natal] ?? h.natal}).`,
    ['transit', termId(h.transiting), h.aspect, termId(h.natal)],
  );
}

/** The progressed Moon's sign, natal house and phase, as reading pieces. */
export function progressedPieces(p: { moon: { position: Position; natalHouse: number | null }; phase: ProgressedPhase }): ReadingPiece[] {
  const out = [piece(`Progressed Moon in ${p.moon.position.sign}`, progressedMoonSign(p.moon.position.sign), `An emotional chapter coloured ${SIGN_STYLE[p.moon.position.sign]}.`, ['progressions', 'moon', termId(p.moon.position.sign)])];
  if (p.moon.natalHouse) out.push(piece(`Progressed Moon in your ${ordinalHouse(p.moon.natalHouse)}`, progressedMoonHouse(p.moon.natalHouse), houseSketch({ ...p.moon.position, house: p.moon.natalHouse }), ['progressions', `house-${p.moon.natalHouse}`]));
  out.push(piece(`Progressed ${p.phase} phase`, progressedPhaseReading(p.phase), `The progressed lunar phase is ${p.phase.toLowerCase()}.`, ['progressions', 'moon-phases']));
  return out;
}

/** How to read a return, and its light's house. */
export function returnPieces(r: Pick<ReturnChart, 'kind' | 'chart'>): ReadingPiece[] {
  const light = positionOf(r.chart, r.kind === 'solar' ? 'Sun' : 'Moon');
  const out: ReadingPiece[] = [{ status: 'ready', title: r.kind === 'solar' ? 'Reading a solar return' : 'Reading a lunar return', reading: returnGuide(r.kind), terms: [r.kind === 'solar' ? 'solar-return' : 'lunar-return', 'returns'] }];
  if (light?.house) out.push(piece(`The ${light.point} in the return's ${ordinalHouse(light.house)}`, returnHouseReading(r.kind, light.house), houseSketch(light), [`house-${light.house}`]));
  return out;
}

/** How many pieces are written, of how many shown, for a gentle progress note. */
export function readingProgress(sections: ReadingSection[]): { ready: number; total: number } {
  const all = sections.flatMap((s) => s.pieces);
  return { ready: all.filter((p) => p.status === 'ready').length, total: all.length };
}
