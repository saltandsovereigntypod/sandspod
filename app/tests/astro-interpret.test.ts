// The interpretation library's second part is complete: natal aspects between
// every pair of bodies, the points, transits and life cycles, returns, the
// progressed Moon, patterns, balance and the chart ruler; no two readings say
// the same thing; and the composer uses every table.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PATTERN_NAMES } from '../src/lib/astro/aspects.ts';
import { progressionsFor, returnChart, transitsTo, LUNAR_PHASES } from '../src/lib/astro/forecast.ts';
import { ASPECT_BODIES, ASPECT_PAIRS, ASPECT_READINGS, MAJOR_ASPECTS, MINOR_ASPECT_READINGS, ONLY } from '../src/lib/astro/interpret/aspects.ts';
import { ELEMENT_READINGS } from '../src/lib/astro/interpret/balance.ts';
import { composeReading, leadingQuadrant, leaningSides, progressedPieces, returnPieces, transitPiece } from '../src/lib/astro/interpret/compose.ts';
import { PATTERN_READINGS } from '../src/lib/astro/interpret/patterns.ts';
import { POINT_READINGS } from '../src/lib/astro/interpret/points.ts';
import { aspectReading, chartRulerReading, coverage, inHouse, inSign, progressedMoonHouse, progressedMoonSign, progressedPhaseReading, returnGuide, returnHouseReading, rulerReading, transitReading } from '../src/lib/astro/interpret/registry.ts';
import { RULER_PLANETS, RULER_READINGS } from '../src/lib/astro/interpret/ruler.ts';
import {
  CYCLE_READINGS,
  PROGRESSED_MOON_HOUSE,
  PROGRESSED_MOON_SIGN,
  PROGRESSED_PHASE_READINGS,
  RETURN_HOUSE_READINGS,
  TRANSIT_ASPECTS,
  TRANSIT_READINGS,
  TRANSIT_TARGETS,
  TRANSITING_BODIES,
} from '../src/lib/astro/interpret/transits.ts';
import { keys, type Interpretation, type InterpretationTable } from '../src/lib/astro/interpret/types.ts';
import { castChart } from '../src/lib/astro/natal.ts';
import { ELEMENTS, MODALITIES, SIGNS } from '../src/lib/astro/signs.ts';

const TABLES: Record<string, InterpretationTable> = {
  aspects: ASPECT_READINGS,
  points: POINT_READINGS,
  transits: TRANSIT_READINGS,
  returns: RETURN_HOUSE_READINGS,
  'progressed sign': PROGRESSED_MOON_SIGN,
  'progressed house': PROGRESSED_MOON_HOUSE,
  'progressed phase': PROGRESSED_PHASE_READINGS,
  patterns: PATTERN_READINGS,
  balance: ELEMENT_READINGS,
  ruler: RULER_READINGS,
  minor: MINOR_ASPECT_READINGS as InterpretationTable,
};

function wellFormed(where: string, r: Interpretation | null | undefined) {
  assert.ok(r, `${where} is missing`);
  for (const field of ['simple', 'detailed', 'magic'] as const) {
    assert.ok(typeof r[field] === 'string' && r[field].trim().length > 20, `${where}: ${field} is too short`);
    assert.ok(!/!/.test(r[field]), `${where}: ${field} has an exclamation mark`);
    assert.ok(!/\b(color|center|behavior|realize|organize)\b/i.test(r[field]), `${where}: ${field} uses American spelling`);
    assert.ok(!/\bundefined\b|\bnull\b|\$\{/.test(r[field]), `${where}: ${field} has a template slip`);
  }
  assert.ok(r.detailed.length > r.simple.length, `${where}: detailed is no longer than simple`);
}

test('every pair of bodies has its natal aspects written, except those the sky cannot make', () => {
  assert.equal(ASPECT_BODIES.length, 14);
  let n = 0;
  for (let i = 0; i < ASPECT_BODIES.length; i++)
    for (let j = i + 1; j < ASPECT_BODIES.length; j++) {
      const [a, b] = [ASPECT_BODIES[i], ASPECT_BODIES[j]];
      const pair = `${a}|${b}`;
      assert.ok(ASPECT_PAIRS[pair], `no seed for ${pair}`);
      const possible = ONLY[pair] ?? MAJOR_ASPECTS;
      for (const aspect of MAJOR_ASPECTS) {
        const r = ASPECT_READINGS[keys.aspect(a, aspect, b)];
        if (possible.includes(aspect)) {
          wellFormed(`${a} ${aspect} ${b}`, r);
          // Either order of the bodies finds it.
          assert.equal(aspectReading(b, aspect, a), r);
          n++;
        } else assert.equal(r, undefined, `${a} ${aspect} ${b} can't happen`);
      }
    }
  assert.equal(n, 91 * 5 - 13);
  assert.equal(Object.keys(ASPECT_READINGS).length, n);
});

test('the minor aspects share one reading each, joined with the pair', () => {
  for (const aspect of ['quincunx', 'semisextile', 'semisquare', 'sesquiquadrate', 'quintile', 'biquintile'] as const) {
    wellFormed(aspect, MINOR_ASPECT_READINGS[aspect]);
    const r = aspectReading('Mars', aspect, 'Moon')!;
    assert.ok(r.detailed.startsWith(ASPECT_PAIRS['Moon|Mars'].core), aspect);
  }
});

test('points, patterns, balance and the chart ruler are complete', () => {
  for (const sign of SIGNS) {
    wellFormed(`Part of Fortune in ${sign}`, inSign('Part of Fortune', sign));
    wellFormed(`Midheaven in ${sign}`, inSign('Midheaven', sign));
  }
  for (let h = 1; h <= 12; h++) wellFormed(`Part of Fortune in house ${h}`, inHouse('Part of Fortune', h));
  for (const p of PATTERN_NAMES) wellFormed(p, PATTERN_READINGS[p]);
  for (const kind of ['dominant', 'missing'] as const) {
    for (const e of ELEMENTS) wellFormed(`${kind} ${e}`, ELEMENT_READINGS[keys.balance(kind, e)]);
    for (const m of MODALITIES) wellFormed(`${kind} ${m}`, ELEMENT_READINGS[keys.balance(kind, m)]);
  }
  for (const w of ['yang', 'yin', 'above', 'below', 'east', 'west', 'quadrant-1', 'quadrant-2', 'quadrant-3', 'quadrant-4']) wellFormed(w, ELEMENT_READINGS[keys.balance('dominant', w)]);
  assert.deepEqual(RULER_PLANETS, ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);
  for (const planet of RULER_PLANETS) {
    wellFormed(`${planet} rules the chart`, chartRulerReading(planet));
    for (let h = 1; h <= 12; h++) wellFormed(`${planet} ruling from house ${h}`, rulerReading(planet, h));
  }
});

test('transits of the slow bodies to the personal points, the life cycles, returns and the progressed Moon are complete', () => {
  for (const t of TRANSITING_BODIES) for (const n of TRANSIT_TARGETS) for (const a of TRANSIT_ASPECTS) wellFormed(`transiting ${t} ${a} ${n}`, transitReading(t, a, n));
  for (const [key, label] of [
    ['Saturn|conjunction|Saturn', 'Saturn return'],
    ['Jupiter|conjunction|Jupiter', 'Jupiter return'],
    ['North Node|conjunction|North Node', 'nodal return'],
    ['Uranus|opposition|Uranus', 'Uranus opposition'],
    ['Chiron|conjunction|Chiron', 'Chiron return'],
  ])
    wellFormed(label, TRANSIT_READINGS[key]);
  for (const key of Object.keys(CYCLE_READINGS)) wellFormed(key, CYCLE_READINGS[key]);
  wellFormed('solar return guide', returnGuide('solar'));
  wellFormed('lunar return guide', returnGuide('lunar'));
  for (let h = 1; h <= 12; h++) {
    wellFormed(`solar return house ${h}`, returnHouseReading('solar', h));
    wellFormed(`lunar return house ${h}`, returnHouseReading('lunar', h));
    wellFormed(`progressed Moon house ${h}`, progressedMoonHouse(h));
  }
  for (const sign of SIGNS) wellFormed(`progressed Moon in ${sign}`, progressedMoonSign(sign));
  for (const phase of LUNAR_PHASES) wellFormed(`progressed ${phase}`, progressedPhaseReading(phase));
});

test('no two readings say the same thing', () => {
  for (const field of ['simple', 'detailed', 'magic'] as const) {
    const seen = new Map<string, string>();
    for (const [table, data] of Object.entries(TABLES))
      for (const [key, r] of Object.entries(data)) {
        if (field === 'magic' && (table === 'ruler' || table.startsWith('progressed') || table === 'returns')) continue;
        const where = `${table} ${key}`;
        const text = r[field];
        assert.ok(!seen.has(text), `${where} repeats the ${field} of ${seen.get(text)}`);
        seen.set(text, where);
      }
  }
});

test('the composer uses the tables: ruler, aspects, patterns, balance, transits, returns and progressions', () => {
  const chart = castChart({ date: '1990-06-15', time: '14:30', utcOffsetMinutes: 60, latitude: 51.5, longitude: -0.13 })!;
  const sections = composeReading(chart);
  const ready = (id: string) => sections.find((s) => s.id === id)!.pieces.every((p) => p.status === 'ready');
  for (const id of ['ruler', 'aspects', 'balance']) assert.ok(ready(id), id);
  if (chart.patterns.length) assert.ok(ready('patterns'));
  const hit = transitsTo(chart, new Date(Date.UTC(2026, 9, 30))).find((h) => TRANSITING_BODIES.includes(h.transiting) && TRANSIT_TARGETS.includes(h.natal) && h.transiting !== h.natal);
  if (hit) assert.equal(transitPiece(hit).status, 'ready');
  assert.ok(progressedPieces(progressionsFor(chart, new Date(Date.UTC(2026, 9, 30)))).every((p) => p.status === 'ready'));
  assert.ok(returnPieces(returnChart(chart, 'solar', new Date(Date.UTC(2026, 0, 1)), null)).every((p) => p.status === 'ready'));
  // Hemisphere and quadrant pieces only when a side or quadrant clearly leads.
  assert.deepEqual(leaningSides({ ...chart.balance, hemispheres: { above: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'], below: ['Uranus', 'Neptune', 'Pluto'], east: [], west: [] } }), ['above']);
  assert.equal(leadingQuadrant({ ...chart.balance, quadrants: [['Sun', 'Moon', 'Mars', 'Venus'], ['Saturn'], [], []] }), 1);
  assert.equal(leadingQuadrant({ ...chart.balance, quadrants: [['Sun', 'Moon'], ['Saturn', 'Mars'], [], []] }), null);
  const c = Object.fromEntries(coverage().map((x) => [x.table, x.written]));
  assert.equal(c.Aspects, 442);
  assert.equal(c['Chart ruler'], 130);
});
