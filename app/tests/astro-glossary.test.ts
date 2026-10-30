// The astrology glossary is complete (every term has a Simple and a
// Detailed explanation), its links hold, terms are found in text, and the
// interpretation library's phase-1 content is all there.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { GLOSSARY, linkTerms, searchTerms, term } from '../src/lib/astro/glossary.ts';
import { composeReading, readingProgress } from '../src/lib/astro/interpret/compose.ts';
import { HOUSE_MEANINGS } from '../src/lib/astro/interpret/houses.ts';
import { coverage, inSign } from '../src/lib/astro/interpret/registry.ts';
import { keys } from '../src/lib/astro/interpret/types.ts';
import { castChart } from '../src/lib/astro/natal.ts';
import { GUIDE_ORDER, PLANET_GUIDES } from '../src/lib/astro/planetGuides.ts';
import { SIGNS } from '../src/lib/astro/signs.ts';
import { TRADITIONAL_LIBRARY } from '../src/lib/library/traditionalData.ts';

const REQUIRED = [
  // every planet, Chiron, the nodes, Lilith, the Part of Fortune, the angles
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'north-node', 'south-node', 'lilith', 'part-of-fortune',
  'ascendant', 'descendant', 'midheaven', 'imum-coeli',
  ...SIGNS.map((s) => s.toLowerCase()),
  ...Array.from({ length: 12 }, (_, i) => `house-${i + 1}`),
  'elements', 'fire', 'earth', 'air', 'water', 'modalities', 'cardinal', 'fixed', 'mutable', 'polarity',
  'rulership', 'dignity', 'domicile', 'exaltation', 'detriment', 'fall',
  'aspects', 'orb', 'conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx', 'semisextile', 'semisquare', 'sesquiquadrate', 'quintile', 'biquintile',
  'grand-trine', 't-square', 'grand-cross', 'yod', 'stellium', 'kite',
  'retrograde', 'shadow-period', 'station', 'void-of-course',
  'eclipse', 'solar-eclipse', 'lunar-eclipse', 'saros', 'lunation', 'new-moon', 'full-moon',
  'planetary-days', 'planetary-hours', 'chaldean-order',
  'house-systems', 'placidus', 'whole-sign', 'equal-house',
  'tropical', 'sidereal', 'ayanamsa', 'lahiri',
  'transit', 'progressions', 'returns', 'solar-return', 'lunar-return', 'synastry', 'decans', 'cusp',
];

test('every required term is in the glossary', () => {
  for (const id of REQUIRED) assert.ok(term(id), `missing: ${id}`);
});

test('every term has a Simple and a Detailed explanation, and its links hold', () => {
  const ids = new Set<string>();
  for (const e of GLOSSARY) {
    assert.ok(!ids.has(e.id), `duplicate id ${e.id}`);
    ids.add(e.id);
    assert.ok(e.simple.length > 30, `${e.id}: simple is too short`);
    const detailed = Object.values(e.detailed).filter(Boolean);
    assert.ok(detailed.length >= 2, `${e.id}: detailed needs at least two parts`);
    assert.ok(detailed.join(' ').length > 120, `${e.id}: detailed is too short`);
    for (const r of e.related ?? []) assert.ok(term(r), `${e.id} → ${r}`);
    // House voice: no exclamation marks.
    assert.ok(!/!/.test(e.simple + detailed.join(' ')), `${e.id} has an exclamation mark`);
  }
  // The required ones get the whole of it: astronomy or history, tradition and craft.
  for (const id of REQUIRED.filter((i) => !i.startsWith('house-'))) {
    const d = term(id)!.detailed;
    assert.ok(d.traditions, `${id} has no traditions part`);
  }
});

test('terms are found in ordinary sentences, once each, and plain words are left alone', () => {
  const pieces = linkTerms('The Moon in Scorpio is void of course; prices fall, but Venus in fall is another matter. Leo rising, Placidus houses.');
  const linked = pieces.filter((p) => p.term).map((p) => p.term);
  assert.deepEqual(linked, ['moon', 'scorpio', 'void-of-course', 'venus', 'fall', 'leo', 'ascendant', 'placidus']);
  assert.equal(pieces.map((p) => p.text).join(''), 'The Moon in Scorpio is void of course; prices fall, but Venus in fall is another matter. Leo rising, Placidus houses.');
  assert.deepEqual(linkTerms('Sunday and moonrise').filter((p) => p.term), []);
  assert.deepEqual(linkTerms('Mars and Mars', { skip: ['mars'] }).filter((p) => p.term), []);
  assert.equal(searchTerms('retro')[0].id, 'retrograde');
});

test('the Sun, Moon and Ascendant are written in all twelve signs, and the twelve houses', () => {
  for (const sign of SIGNS) {
    for (const body of ['Sun', 'Moon', 'Ascendant'] as const) {
      const r = inSign(body, sign);
      assert.ok(r && r.simple && r.detailed && r.magic, `${body} in ${sign}`);
      assert.ok(!/!/.test(r.simple + r.detailed + r.magic), `${body} in ${sign} has an exclamation mark`);
    }
  }
  assert.equal(HOUSE_MEANINGS.length, 12);
  HOUSE_MEANINGS.forEach((h, i) => {
    assert.equal(h.house, i + 1);
    assert.ok(h.simple && h.detailed && h.magic && h.keywords.length >= 4);
  });
  const c = Object.fromEntries(coverage().map((x) => [x.table, x.written]));
  assert.equal(c['Sun in sign'] + c['Moon in sign'] + c['Rising sign'], 36);
  assert.equal(keys.aspect('Saturn', 'square', 'Sun'), 'Sun|square|Saturn');
});

test('the composer reads a whole chart, with "coming soon" for what isn’t written', () => {
  const chart = castChart({ date: '1990-06-15', time: '14:30', utcOffsetMinutes: 60, latitude: 51.5, longitude: -0.13 })!;
  const sections = composeReading(chart);
  const ids = sections.map((s) => s.id);
  for (const id of ['big-three', 'ruler', 'planets', 'houses', 'aspects', 'balance']) assert.ok(ids.includes(id), id);
  const big = sections.find((s) => s.id === 'big-three')!;
  assert.equal(big.pieces.length, 3);
  assert.ok(big.pieces.every((p) => p.status === 'ready'));
  const soon = sections.flatMap((s) => s.pieces).filter((p) => p.status === 'coming-soon');
  assert.ok(soon.length > 0);
  for (const p of soon) assert.ok(p.status === 'coming-soon' && p.sketch.length > 10 && p.terms.length > 0, p.title);
  const progress = readingProgress(sections);
  assert.ok(progress.ready >= 15 && progress.ready < progress.total);
  // Without a time: no rising, no houses section, still never blank.
  const noTime = composeReading(castChart({ date: '1990-06-15', time: '', utcOffsetMinutes: 60 })!);
  assert.equal(noTime.find((s) => s.id === 'big-three')!.pieces.length, 2);
  assert.ok(!noTime.some((s) => s.id === 'houses'));
});

test('planet guides name herbs, stones and deities the Living Library has', () => {
  const names = (type: string) => new Set(Object.values((TRADITIONAL_LIBRARY as Record<string, Record<string, { DisplayName?: string }>>)[type]).map((e) => e.DisplayName));
  const herbs = names('herb');
  const stones = names('crystal');
  const deities = names('deity');
  for (const p of GUIDE_ORDER) {
    const g = PLANET_GUIDES[p];
    for (const h of g.herbs) assert.ok(herbs.has(h), `${p} herb ${h}`);
    for (const s of g.stones) assert.ok(stones.has(s), `${p} stone ${s}`);
    const inLibrary = g.deities.filter((d) => deities.has(d.name));
    assert.ok(inLibrary.length >= 3, `${p}: deities in the Library`);
    assert.ok(g.angel.source && g.sourcing);
  }
});
