import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CHARMS, classify, ownCharm, readCast, throwCharms, touching } from '../src/lib/divination/charms.ts';

test('charm set is sound', () => {
  assert.ok(CHARMS.length >= 30);
  assert.equal(new Set(CHARMS.map((c) => c.id)).size, CHARMS.length);
  for (const c of CHARMS) assert.ok(c.name && c.meaning && c.shadow && c.question && c.theme, c.id);
});

test('zones: ring, side, level, inside and quarter', () => {
  assert.equal(classify({ charmId: 'key', x: 0, y: 0, up: true }).ring, 'centre');
  const z = classify({ charmId: 'key', x: -0.5, y: 0.1, up: false });
  assert.equal(z.ring, 'near');
  assert.equal(z.side, 'left');
  assert.equal(z.up, false);
  assert.equal(classify({ charmId: 'key', x: 0.9, y: 0.1, up: true }).ring, 'far');
  assert.equal(classify({ charmId: 'key', x: 0.9, y: 0.1, up: true }).quarter, 'east');
  const out = classify({ charmId: 'key', x: 0.9, y: 0.9, up: true });
  assert.equal(out.ring, 'outside');
  assert.equal(out.inside, false);
  assert.equal(classify({ charmId: 'key', x: 0, y: -0.7, up: true }).quarter, 'south');
});

test('touching pairs chain together', () => {
  const c = (x: number, y: number) => ({ charmId: 'key', x, y, up: true });
  assert.deepEqual(touching([c(0, 0), c(0.15, 0), c(0.3, 0), c(0.9, 0.9)]), [[0, 1, 2]]);
  assert.deepEqual(touching([c(0, 0), c(0.5, 0)]), []);
});

test('reading from positions', () => {
  const set = [...CHARMS.slice(0, 3), ownCharm('Pebble', 'the day I stopped')];
  const casts = [
    { charmId: 'key', x: 0, y: 0, up: true },
    { charmId: 'coin', x: 0.1, y: 0.05, up: false },
    { charmId: 'bone', x: -0.9, y: 0.1, up: true },
    { charmId: 'own-pebble', x: 1.1, y: 0.8, up: true },
  ];
  const r = readCast(casts, set, 'Should I stay?', '2026-11-06');
  assert.match(r.text, /touching/);
  assert.match(r.text, /outside the circle/);
  assert.match(r.text, /the day I stopped/i);
  const s = r.text.split(/(?<=[.?!])\s+/).map((x) => x.toLowerCase().trim()).filter((x) => x.length > 25);
  assert.equal(new Set(s).size, s.length);
  assert.equal(throwCharms(CHARMS).length, CHARMS.length);
});
