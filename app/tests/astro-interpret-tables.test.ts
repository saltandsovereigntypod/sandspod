// The interpretation library's big tables are complete: every planet and
// point in every sign and house, and every sign on every cusp, each with a
// Simple, Detailed and craft reading; no two readings share a text; the
// house voice holds; and every link a reading carries leads somewhere real
// (planet guides, Living Library entries, premade rituals, journeys).

import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { TermLink } from '../src/lib/astro/glossary.ts';
import { composeReading } from '../src/lib/astro/interpret/compose.ts';
import { BODY_LINKS, HOUSE_LINKS, LIBRARY_DEITIES, LIBRARY_HERBS_AND_STONES, libraryMentions } from '../src/lib/astro/interpret/links.ts';
import { PLANET_IN_HOUSE, PLANET_IN_HOUSE_BY_BODY } from '../src/lib/astro/interpret/planetInHouse.ts';
import { PLANET_IN_SIGN, PLANET_IN_SIGN_BY_BODY } from '../src/lib/astro/interpret/planetInSign.ts';
import { coverage, inHouse, inSign, signOnCusp } from '../src/lib/astro/interpret/registry.ts';
import { SIGN_ON_CUSP } from '../src/lib/astro/interpret/signOnCusp.ts';
import type { Interpretation } from '../src/lib/astro/interpret/types.ts';
import { castChart } from '../src/lib/astro/natal.ts';
import { PLANET_GUIDES } from '../src/lib/astro/planetGuides.ts';
import { SIGNS, type ChartPointName } from '../src/lib/astro/signs.ts';
import { JOURNEY_CATALOG } from '../src/lib/journeys/catalog.ts';
import { TRADITIONAL_LIBRARY } from '../src/lib/library/traditionalData.ts';
import { premadeById } from '../src/lib/rituals/premade/index.ts';

const IN_SIGN: ChartPointName[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node', 'South Node', 'Lilith'];
const IN_HOUSE: ChartPointName[] = ['Sun', 'Moon', ...IN_SIGN];
const HOUSES = Array.from({ length: 12 }, (_, i) => i + 1);

function checkReading(label: string, r: Interpretation | null | undefined) {
  assert.ok(r, `${label}: missing`);
  assert.ok(r.simple.trim().length >= 40, `${label}: simple is too short`);
  assert.ok(r.detailed.trim().length >= 200, `${label}: detailed is too short`);
  assert.ok(r.magic.trim().length >= 40, `${label}: magic is too short`);
  const all = [r.simple, r.detailed, r.magic, r.shadow ?? ''].join(' ');
  assert.ok(!/!/.test(all), `${label}: exclamation mark`);
  assert.ok(!/\p{Extended_Pictographic}/u.test(all), `${label}: emoji`);
  assert.ok(!/\b(?:color|favor|center|realize|honor)\b/i.test(all), `${label}: American spelling`);
  assert.ok(!/\s$/.test(r.simple) && !/\s$/.test(r.detailed) && !/\s$/.test(r.magic), `${label}: trailing space`);
}

test('every planet and point is written in all twelve signs', () => {
  for (const body of IN_SIGN) {
    assert.ok(PLANET_IN_SIGN_BY_BODY[body], `${body}: no table`);
    for (const sign of SIGNS) checkReading(`${body} in ${sign}`, inSign(body, sign));
  }
  assert.equal(Object.keys(PLANET_IN_SIGN).length, IN_SIGN.length * 12);
});

test('every planet and point is written in all twelve houses', () => {
  for (const body of IN_HOUSE) {
    assert.equal(PLANET_IN_HOUSE_BY_BODY[body]?.length, 12, `${body}: needs twelve houses`);
    for (const house of HOUSES) checkReading(`${body} in house ${house}`, inHouse(body, house));
  }
  assert.equal(Object.keys(PLANET_IN_HOUSE).length, IN_HOUSE.length * 12);
});

test('every sign is written on every house cusp', () => {
  for (const house of HOUSES) for (const sign of SIGNS) checkReading(`${sign} on cusp ${house}`, signOnCusp(house, sign));
  assert.equal(Object.keys(SIGN_ON_CUSP).length, 144);
  const c = Object.fromEntries(coverage().map((x) => [x.table, x.written]));
  assert.equal(c['Planet in sign'], 144);
  assert.equal(c['Planet in house'], 168);
  assert.equal(c['Sign on cusp'], 144);
});

test('no two readings share a text', () => {
  const seen = new Map<string, string>();
  const tables: [string, Record<string, Interpretation>][] = [['sign', PLANET_IN_SIGN], ['house', PLANET_IN_HOUSE], ['cusp', SIGN_ON_CUSP]];
  for (const [name, table] of tables) {
    for (const [key, r] of Object.entries(table)) {
      for (const field of ['simple', 'detailed', 'magic', 'shadow'] as const) {
        const text = r[field];
        if (!text) continue;
        const id = `${name} ${key} ${field}`;
        assert.ok(!seen.has(text), `${id} repeats ${seen.get(text)}`);
        seen.set(text, id);
      }
    }
  }
});

const names = (type: string) => new Set(Object.values((TRADITIONAL_LIBRARY as Record<string, Record<string, { DisplayName?: string }>>)[type]).map((e) => e.DisplayName));

test('every link target exists', () => {
  const library = new Set([...names('herb'), ...names('crystal'), ...names('deity')]);
  for (const n of [...LIBRARY_HERBS_AND_STONES, ...LIBRARY_DEITIES]) assert.ok(library.has(n), `not in the Living Library: ${n}`);
  const journeys = new Set(JOURNEY_CATALOG.map((j) => j.id));
  const check = (where: string, l: TermLink) => {
    if (l.kind === 'planet-guide') assert.ok(PLANET_GUIDES[l.planet as keyof typeof PLANET_GUIDES], `${where}: guide ${l.planet}`);
    if (l.kind === 'library') assert.ok(library.has(l.name), `${where}: library ${l.name}`);
    if (l.kind === 'premade') assert.ok(premadeById(l.id), `${where}: premade ${l.id}`);
    if (l.kind === 'journey') assert.ok(journeys.has(l.id), `${where}: journey ${l.id}`);
  };
  for (const [body, links] of Object.entries(BODY_LINKS)) for (const l of links!) check(body, l);
  for (const [house, l] of Object.entries(HOUSE_LINKS)) check(`house ${house}`, l);
  // Every reading handed out carries links, and they all resolve.
  let withLibrary = 0;
  for (const sign of SIGNS) {
    for (const body of ['Sun', 'Moon', 'Ascendant', ...IN_SIGN] as ChartPointName[]) {
      const r = inSign(body, sign)!;
      assert.ok(r.links?.length, `${body} in ${sign}: no links`);
      r.links!.forEach((l) => check(`${body} in ${sign}`, l));
      if (r.links!.some((l) => l.kind === 'library')) withLibrary++;
    }
    for (const house of HOUSES) signOnCusp(house, sign)!.links!.forEach((l) => check(`${sign} on ${house}`, l));
  }
  for (const body of IN_HOUSE) for (const house of HOUSES) inHouse(body, house)!.links!.forEach((l) => check(`${body} in ${house}`, l));
  assert.ok(withLibrary > 100, `only ${withLibrary} sign readings link the Library`);
});

test('Library names are found in magic text, longest first, once each', () => {
  assert.deepEqual(libraryMentions('Rose Quartz, rose and St John’s Wort; Hekate and rose again'), ['Rose Quartz', 'Rose', 'St John’s Wort', 'Hekate']);
  assert.deepEqual(libraryMentions('Set the candle down; a pan of water'), []);
});

test('the composer has no "coming soon" left for planets, houses and cusps', () => {
  const chart = castChart({ date: '1990-06-15', time: '14:30', utcOffsetMinutes: 60, latitude: 51.5, longitude: -0.13 })!;
  const sections = composeReading(chart);
  const planets = sections.find((s) => s.id === 'planets')!;
  const soon = planets.pieces.filter((p) => p.status === 'coming-soon' && !p.title.startsWith('Midheaven') && !p.title.startsWith('Part of Fortune'));
  assert.deepEqual(soon.map((p) => p.title), []);
  const houses = sections.find((s) => s.id === 'houses')!;
  assert.equal(houses.pieces.length, 12);
  for (const p of houses.pieces) {
    assert.ok(p.status === 'ready');
    if (p.status === 'ready') assert.ok(p.reading.links?.length, `${p.title}: cusp links`);
  }
});
