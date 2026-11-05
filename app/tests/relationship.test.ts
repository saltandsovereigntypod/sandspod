import assert from 'node:assert/strict';
import test from 'node:test';

import { castChart } from '../src/lib/astro/natal.ts';
import { balance, dedupe, elementSummary, extremes, groupOf, midpoint, pairings, reading, strengthLabel, strengthScore, tiltOf } from '../src/lib/astro/relationship.ts';
import { MAJOR_ASPECTS, PAIRS, fillNames, pairReading } from '../src/lib/astro/relationshipPairs.ts';
import { OVERLAY_TEXT } from '../src/lib/astro/relationshipHouses.ts';
import { COMPOSITE_SIGN, SIGN_TOUCH } from '../src/lib/astro/relationshipSigns.ts';
import { REL_TYPES } from '../src/lib/astro/relationshipText.ts';
import { SIGNS } from '../src/lib/astro/signs.ts';

test('midpoint takes the shorter arc and wraps at 0/360', () => {
  assert.equal(midpoint(350, 10), 0);
  assert.equal(midpoint(10, 350), 0);
  assert.equal(midpoint(0, 90), 45);
  assert.equal(midpoint(300, 40), 350);
  assert.equal(midpoint(20, 20), 20);
});

test('contacts are grouped by planet and aspect family', () => {
  assert.equal(groupOf('Mercury', 'Venus', 'harm'), 'talk');
  assert.equal(groupOf('Mars', 'Moon', 'hard'), 'watch');
  assert.equal(groupOf('Sun', 'Moon', 'hard'), 'grow');
  assert.equal(groupOf('Saturn', 'Venus', 'harm'), 'grow');
  assert.equal(groupOf('Sun', 'Venus', 'conj'), 'bring');
  assert.equal(groupOf('Jupiter', 'Moon', 'harm'), 'bring');
  assert.equal(groupOf('Sun', 'Moon', 'harm'), 'flows');
});

test('element balance counts the seven classical planets across people', () => {
  const t = balance([
    [{ point: 'Sun', sign: 'Aries' }, { point: 'Moon', sign: 'Leo' }, { point: 'Uranus', sign: 'Aries' }],
    [{ point: 'Sun', sign: 'Taurus' }],
  ]);
  assert.deepEqual(t.elements, { fire: 2, earth: 1, air: 0, water: 0 });
  assert.equal(t.modalities.cardinal, 1);
  assert.equal(extremes(t).most, 'fire');
});

test('pairings join complementary elements', () => {
  const out = pairings([{ name: 'A', sunSign: 'Aries' }, { name: 'B', sunSign: 'Gemini' }, { name: 'C', sunSign: 'Taurus' }]);
  assert.equal(out.length, 1);
  assert.match(out[0], /^A .* with B/);
});

const P8 = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Ascendant'] as const;

test('every planet pair has its own reading for every major aspect, all different', () => {
  const seen = new Set<string>();
  for (let i = 0; i < P8.length; i++)
    for (let j = i; j < P8.length; j++) {
      for (const asp of MAJOR_ASPECTS)
        for (const t of REL_TYPES) {
          const text = pairReading(P8[i], P8[j], asp, t.key);
          assert.ok(text && text.split('. ').length >= 2, `${P8[i]}|${P8[j]} ${asp}`);
          seen.add(text);
        }
      // reverse order finds the same pair
      assert.equal(pairReading(P8[j], P8[i], 'trine', 'romantic'), pairReading(P8[i], P8[j], 'trine', 'romantic'));
    }
  assert.equal(Object.keys(PAIRS).length, 36);
  assert.ok(seen.size >= 180);
  for (const e of Object.values(PAIRS)) assert.notEqual(e.text.square, e.text.opposition);
});

test('relationship type changes the wording, not just the order', () => {
  assert.notEqual(pairReading('Venus', 'Mars', 'conjunction', 'romantic'), pairReading('Venus', 'Mars', 'conjunction', 'friendship'));
  assert.notEqual(pairReading('Mars', 'Mars', 'square', 'family'), pairReading('Mars', 'Mars', 'square', 'coven'));
});

test('names fill in whose planet is whose', () => {
  assert.equal(fillNames('{Saturn} steadies {Venus}.', { Saturn: 'Ash', Venus: 'Bo' }), 'Ash steadies Bo.');
  assert.equal(fillNames('{Saturn} steadies.', {}), 'the Saturn person steadies.');
});

test('strength ranks tight, weighty contacts above wide, light ones', () => {
  const tightLights = strengthScore({ a: 'Sun', b: 'Moon', aspect: 'conjunction', orb: 0.3 });
  const wideLights = strengthScore({ a: 'Sun', b: 'Moon', aspect: 'conjunction', orb: 6.5 });
  const tightOuter = strengthScore({ a: 'Jupiter', b: 'Saturn', aspect: 'sextile', orb: 0.3 });
  assert.ok(tightLights > wideLights && tightLights > tightOuter);
  assert.equal(strengthLabel(tightLights), 'Strong');
  assert.equal(strengthLabel(tightOuter), 'Moderate');
  assert.equal(strengthLabel(strengthScore({ a: 'Jupiter', b: 'Jupiter', aspect: 'sextile', orb: 3.8 })), 'Light');
});

test('dedupe drops sentences already on the page', () => {
  const seen = new Set<string>();
  assert.equal(dedupe('One thing. Two things.', seen), 'One thing. Two things.');
  assert.equal(dedupe('Two things. Three things.', seen), 'Three things.');
  assert.equal(dedupe('One thing.', seen), '');
});

test('element summary picks a crowded and an empty element, or says balanced', () => {
  const t = (fire: number, earth: number, air: number, water: number) => ({ elements: { fire, earth, air, water }, modalities: { cardinal: 0, fixed: 0, mutable: 0 } });
  const s = elementSummary(t(2, 3, 1, 8));
  assert.equal(s.many, 'water');
  assert.equal(s.few, 'air');
  assert.equal(s.lines.length, 2);
  const even = elementSummary(t(4, 3, 4, 3));
  assert.equal(even.many, null);
  assert.equal(even.few, null);
  assert.match(even.lines[0], /evenly/);
});

test('tilt reads the strongest contacts as easy, hard or mixed', () => {
  const c = (family: 'harm' | 'hard' | 'conj', a = 'Sun', b = 'Moon') => ({ family, hit: { a, b, aspect: 'trine', orb: 1 } }) as never;
  assert.equal(tiltOf([c('harm'), c('harm'), c('hard')]), 'easy');
  assert.equal(tiltOf([c('hard'), c('conj', 'Mars', 'Venus')]), 'hard');
  assert.equal(tiltOf([c('harm'), c('hard')]), 'mixed');
  assert.equal(tiltOf([]), 'none');
});

test('house, sign and composite tables are complete', () => {
  for (const p of Object.values(OVERLAY_TEXT)) for (let h = 1; h <= 12; h++) assert.ok(p[h]);
  for (const sign of SIGNS) {
    for (const t of Object.values(SIGN_TOUCH)) assert.ok(t[sign]);
    for (const t of Object.values(COMPOSITE_SIGN)) assert.ok(t[sign]);
  }
});

test('a full reading: heart of 3–5 sentences, strongest first, no sentence repeated', () => {
  const a = castChart({ date: '1990-06-15', time: '14:30', utcOffsetMinutes: 60, latitude: 51.5, longitude: -0.12 })!;
  const b = castChart({ date: '1992-11-02', time: '08:10', utcOffsetMinutes: 0, latitude: 53.4, longitude: -2.24 })!;
  for (const t of REL_TYPES) {
    const r = reading(a, b, t.key, 'Ash', 'Bo');
    assert.ok(r.heart.length >= 3 && r.heart.length <= 5, t.key);
    assert.doesNotMatch(r.heart.join(' '), /%|score/i);
    for (const g of r.groups) for (let i = 1; i < g.contacts.length; i++) assert.ok(g.contacts[i - 1].score * 1.15 >= g.contacts[i].score);
    assert.ok(r.overlays && r.overlays.length === 12);
    assert.ok(r.composite.length >= 3);
    const all = [...r.heart, ...r.groups.flatMap((g) => g.contacts.flatMap((c) => [c.text, c.whose ?? '', c.lens ?? ''])), ...r.signs.flatMap((s) => s.lines), ...r.overlays!.map((o) => o.text), ...r.composite];
    const sentences = all.flatMap((x) => x.split(/(?<=[.?])\s+(?=[A-Z“])/)).filter(Boolean);
    assert.equal(new Set(sentences.map((x) => x.toLowerCase())).size, sentences.length, t.key);
    assert.doesNotMatch(all.join(' '), /\{\w+\}/);
  }
});
