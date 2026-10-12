import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tonightAltar } from '../src/lib/altar/tonight.ts';

test('the weekday chooses the candle, herb and stone', () => {
  const tuesday = new Date(2026, 9, 13, 18);
  const altar = tonightAltar(tuesday, [], 'Waxing Crescent');
  assert.match(altar.reason, /^Mars’s day/);
  assert.equal(altar.doc.objects.length, 3);
  assert.equal(altar.doc.objects[0].color, 'red');
  assert.equal(altar.doc.objects[1].herb, 'basil');
  // Spread across the altar, left to right, each on top of the last.
  const xs = altar.doc.objects.map((o) => o.leftPercent ?? 0);
  assert.ok(xs[0] < xs[1] && xs[1] < xs[2], xs.join(','));
});

test('a full or new moon adds its own touch', () => {
  const friday = new Date(2026, 9, 16, 18);
  const full = tonightAltar(friday, [], 'Full Moon');
  assert.equal(full.doc.objects.length, 4);
  assert.match(full.reason, /under the full moon$/);
  assert.equal(tonightAltar(friday, [], 'New Moon').doc.objects.at(-1)?.type, 'vessel');
});

test('a holiday brings its traditional things', () => {
  const samhain = tonightAltar(new Date(2026, 9, 31, 18), [{ id: 'samhain', name: 'Samhain' }], 'Waxing Crescent');
  assert.equal(samhain.reason, 'Samhain');
  assert.equal(samhain.labels[0], 'Black Vigil Candle');
  assert.equal(samhain.labels[1], 'Orange Vigil Candle');
  assert.ok(samhain.labels.some((l) => /Cauldron/.test(l)));
  const gaelic = tonightAltar(new Date(2026, 9, 31, 18), [{ id: 'samhain_gaelic', name: 'Samhain (Oíche Shamhna)' }], 'x');
  assert.equal(gaelic.doc.objects.length, 5);
  // Holidays without a set fall back to the weekday.
  assert.match(tonightAltar(new Date(2026, 9, 13, 18), [{ id: 'thargelia', name: 'Thargelia' }], 'x').reason, /^Mars’s day/);
});
