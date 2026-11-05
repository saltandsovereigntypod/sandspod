import assert from 'node:assert/strict';
import test from 'node:test';

import { balance, extremes, groupOf, midpoint, pairings } from '../src/lib/astro/relationship.ts';

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
