import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet } from '../src/lib/altar/cabinet.ts';
import { displayBox } from '../src/lib/altar/geometry.ts';
import { explainTonight, swapsFor, tonightTheme } from '../src/lib/altar/reading/tonightExplained.ts';
import { tonightAltar } from '../src/lib/altar/tonight.ts';
import type { CabinetItem } from '../src/lib/altar/types.ts';

const evening = (d: number, m = 9) => new Date(2026, m, d, 18);

test('the theme comes from the day, a holiday, or the moon', () => {
  const tue = evening(13);
  assert.deepEqual(tonightTheme(tonightAltar(tue, [], 'x'), tue), { planet: 'Mars', holiday: null, moon: null });
  assert.equal(tonightTheme(tonightAltar(tue, [], 'Full Moon'), tue).moon, 'full');
  const samhain = tonightAltar(evening(31), [{ id: 'samhain', name: 'Samhain' }], 'x');
  assert.deepEqual(tonightTheme(samhain, evening(31)), { planet: null, holiday: 'Samhain', moon: null });
});

test('every piece says why it’s there', () => {
  const date = evening(13);
  const tonight = tonightAltar(date, [], 'Full Moon');
  const explained = explainTonight(tonight, date);
  assert.equal(explained.length, tonight.doc.objects.length);
  for (const piece of explained) assert.match(piece.why, /^.+: .+\.$/, piece.why);
  const red = explained.find((p) => /Red/.test(p.label))!;
  assert.match(red.why, /Mars’s colour/);
  assert.ok(explained.some((p) => /full moon/.test(p.why)));
  const samhain = tonightAltar(evening(31), [{ id: 'samhain', name: 'Samhain' }], 'x');
  assert.ok(explainTonight(samhain, evening(31)).some((p) => /Samhain/.test(p.why)));
});

test('swaps share the correspondence, stand on the same spot, and put your own things first', () => {
  const date = evening(13);
  const tonight = tonightAltar(date, [], 'x');
  const index = tonight.doc.objects.findIndex((o) => o.crystal === 'garnet');
  const garnet = tonight.doc.objects[index];
  const swaps = swapsFor(garnet, { others: tonight.doc.objects, now: date.toISOString() });
  assert.ok(swaps.length > 0);
  for (const s of swaps) {
    assert.notEqual(s.object.crystal, 'garnet');
    assert.equal(s.object.type, 'crystal');
    const a = displayBox(garnet);
    const b = displayBox(s.object);
    assert.ok(Math.abs(a.cx - b.cx) < 1e-6, 'same place across');
    assert.ok(Math.abs(a.cy + a.size * a.aspect * 0.8889 - (b.cy + b.size * b.aspect * 0.8889)) < 0.02, 'same footing');
    assert.equal(s.object.zIndex, garnet.zIndex);
  }
  const last = swaps[swaps.length - 1];
  const theirs = builtInCabinet.find((i) => i.id === last.itemId)!;
  const mine: CabinetItem = { ...theirs, id: 'custom:mine', customCabinetItemId: 'mine' };
  const withMine = swapsFor(garnet, { cabinet: [mine], others: tonight.doc.objects });
  assert.equal(withMine[0].owned, true);
  assert.match(withMine[0].why, /it’s yours/);
  assert.deepEqual(swapsFor({ type: 'cloth' }), []);
});
