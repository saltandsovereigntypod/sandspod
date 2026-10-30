// "In your chart": what a lesson's subject looks like in the learner's own
// birth chart, as a few plain lines (terms in them are made tappable by the
// screens). Pure; null when the chart can't show it (no houses without a
// birth time, say), and the lesson reads fine without it.

import { aspectDef, PATTERN_LABEL } from '../aspects.ts';
import { natalAltarPlanet, transitLineFor } from '../craftLinks.ts';
import { progressionsFor, transitsTo } from '../forecast.ts';
import { ordinalHouse } from '../interpret/compose.ts';
import { HOUR_SUITS } from '../../craft/cosmic/hours.ts';
import { positionOf, type Chart, type Position } from '../natal.ts';
import { DIGNITY_LABEL, elementOf, TRADITIONAL_RULER } from '../signs.ts';
import type { YourChartKind } from './types.ts';

const at = (p: Position) => `${p.point} in ${p.sign}${p.house ? `, in the ${ordinalHouse(p.house)}` : ''}${p.retrograde ? ' (retrograde)' : ''}`;
const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const DAY: Record<string, string> = { Sun: 'Sunday', Moon: 'Monday', Mars: 'Tuesday', Mercury: 'Wednesday', Jupiter: 'Thursday', Venus: 'Friday', Saturn: 'Saturday' };

const PHASE_AT_BIRTH = (angle: number) =>
  angle < 45 ? 'a new moon' : angle < 90 ? 'a waxing crescent' : angle < 135 ? 'a first-quarter moon' : angle < 180 ? 'a waxing gibbous moon' : angle < 225 ? 'a full moon' : angle < 270 ? 'a waning gibbous moon' : angle < 315 ? 'a last-quarter moon' : 'a balsamic (waning crescent) moon';

/** The lines for one kind, or null when this chart can't show it. */
export function yourChartLines(kind: YourChartKind, chart: Chart, now: Date = new Date()): string[] | null {
  const sun = positionOf(chart, 'Sun');
  const moon = positionOf(chart, 'Moon');
  const asc = positionOf(chart, 'Ascendant');
  switch (kind) {
    case 'big-three': {
      const lines = [sun && `Your Sun: ${at(sun)}.`, moon && `Your Moon: ${at(moon)}.`, asc ? `Your rising sign: ${asc.sign}.` : 'Without a birth time and place there is no rising sign yet.'].filter(Boolean) as string[];
      if (sun && moon) {
        const same = elementOf(sun.sign) === elementOf(moon.sign);
        lines.push(same ? `Your Sun and Moon share the ${elementOf(sun.sign)} element.` : `Your Sun is ${elementOf(sun.sign)} and your Moon is ${elementOf(moon.sign)}.`);
      }
      return lines;
    }
    case 'planets':
      return chart.positions.filter((p) => PLANETS.includes(p.point)).map((p) => `${at(p)}.`);
    case 'elements': {
      const b = chart.balance;
      return [
        `Strongest element: ${b.dominantElement} (${b.elements[b.dominantElement].points.join(', ')}).`,
        b.missingElements.length ? `No planets in ${b.missingElements.join(' or ')}.` : 'Every element has at least one planet.',
        `Strongest modality: ${b.dominantModality}. Yang ${b.polarity.yang.score}, yin ${b.polarity.yin.score}.`,
      ];
    }
    case 'houses': {
      if (!chart.houses || !asc) return null;
      const counts = new Map<number, string[]>();
      for (const p of chart.positions) if (PLANETS.includes(p.point) && p.house) counts.set(p.house, [...(counts.get(p.house) ?? []), p.point]);
      const busiest = [...counts].sort((a, b) => b[1].length - a[1].length)[0];
      const empty = Array.from({ length: 12 }, (_, i) => i + 1).filter((n) => !counts.has(n));
      return [
        `Your first house begins at ${asc.sign} rising.`,
        busiest ? `Your busiest house: the ${ordinalHouse(busiest[0])}, with ${busiest[1].join(', ')}.` : '',
        empty.length ? `Houses with no planets: ${empty.join(', ')}. Read them through their cusp signs and rulers.` : '',
      ].filter(Boolean);
    }
    case 'aspects': {
      const list = chart.aspects.filter((a) => !['Part of Fortune', 'Lilith'].includes(a.a) && !['Part of Fortune', 'Lilith'].includes(a.b)).slice(0, 5);
      if (!list.length) return null;
      return list.map((a) => `${a.a} ${a.aspect} ${a.b} (${aspectDef(a.aspect).angle}°), ${a.orb.toFixed(1)}° from exact${a.applying === null ? '' : a.applying ? ', applying' : ', separating'}.`);
    }
    case 'ruler': {
      if (!chart.ruler) return null;
      const r = positionOf(chart, chart.ruler.traditional);
      return [
        `With ${chart.ruler.sign} rising, your chart ruler is ${chart.ruler.traditional}${chart.ruler.modern !== chart.ruler.traditional ? ` (and in modern astrology ${chart.ruler.modern})` : ''}.`,
        r ? `${at(r)}.` : '',
      ].filter(Boolean);
    }
    case 'dignities': {
      const lines = chart.positions.filter((p) => p.dignity).map((p) => `${p.point} in ${p.sign}: ${DIGNITY_LABEL[p.dignity!].toLowerCase()}.`);
      if (!lines.length) lines.push('None of your planets is in its domicile, exaltation, detriment or fall: they are peregrine, and read through their rulers and aspects.');
      if (chart.sect) lines.push(chart.sect === 'day' ? 'A day chart: the Sun was above the horizon, so Jupiter and Saturn lead the chart\'s sect.' : 'A night chart: the Sun was below the horizon, so Venus and Mars lead the chart\'s sect.');
      return lines;
    }
    case 'patterns':
      return chart.patterns.length
        ? chart.patterns.map((p) => `${PATTERN_LABEL[p.name]}: ${p.points.join(', ')}${p.sign ? ` in ${p.sign}` : p.house ? ` in the ${ordinalHouse(p.house)}` : ''}.`)
        : ['No major patterns: your aspects work one by one.'];
    case 'transits': {
      const hits = transitsTo(chart, now).filter((h) => !['Moon', 'Sun', 'Mercury', 'Venus'].includes(h.transiting)).slice(0, 4);
      return hits.length ? hits.map((h) => `${transitLineFor(h)}.`) : ['No slow planet is in close aspect to your chart today.'];
    }
    case 'progressions': {
      const p = progressionsFor(chart, now);
      return [
        `Your progressed Moon is in ${p.moon.position.sign}${p.moon.natalHouse ? `, in your natal ${ordinalHouse(p.moon.natalHouse)}` : ''}.`,
        p.moon.nextSign ? `It moves into ${p.moon.nextSign.sign} in ${p.moon.nextSign.date.getFullYear()}.` : '',
        `Your progressed lunar phase: ${p.phase}.`,
        p.changedSign.length ? `Changed sign by progression: ${p.changedSign.map((c) => `${c.point} into ${c.to}`).join(', ')}.` : '',
      ].filter(Boolean);
    }
    case 'moon': {
      if (!sun || !moon) return null;
      const angle = (((moon.longitude - sun.longitude) % 360) + 360) % 360;
      return [`You were born under ${PHASE_AT_BIRTH(angle)}, with the Moon in ${moon.sign}.`, `The Moon was ${Math.round(angle)}° ahead of the Sun.`];
    }
    case 'magic': {
      const lines: string[] = [];
      if (chart.ruler) lines.push(`Your chart ruler is ${chart.ruler.traditional}: ${DAY[chart.ruler.traditional]} and the hours of ${chart.ruler.traditional} are yours, good for ${HOUR_SUITS[chart.ruler.traditional].short}.`);
      const altar = natalAltarPlanet(chart);
      lines.push(`The planet your chart leans on most is ${altar}.`);
      lines.push(`Your strongest element is ${chart.balance.dominantElement}${chart.balance.missingElements.length ? `; build ${chart.balance.missingElements.join(' and ')} on purpose` : ''}.`);
      if (sun) lines.push(`Your Sun's ruler is ${TRADITIONAL_RULER[sun.sign]}.`);
      return lines;
    }
  }
  return null;
}
