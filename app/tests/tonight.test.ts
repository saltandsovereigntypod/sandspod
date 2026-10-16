import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, placeableForms } from '../src/lib/altar/cabinet.ts';
import { displayBox } from '../src/lib/altar/geometry.ts';
import { tonightAltar } from '../src/lib/altar/tonight.ts';

const evening = (d: number, m = 9) => new Date(2026, m, d, 18);

test('the weekday sets a full altar: centrepiece, paired candles, herbs, offering, stones and a tool', () => {
  const altar = tonightAltar(evening(13), [], 'Waxing Crescent');
  assert.match(altar.reason, /^Mars’s day/);
  assert.equal(altar.doc.objects.length, 11);
  const types = altar.doc.objects.map((o) => o.type);
  assert.equal(types.filter((t) => t === 'candle').length, 4);
  assert.ok(types.includes('deity'));
  assert.ok(types.includes('crystal'));
  assert.ok(altar.labels.some((l) => /Mars/.test(l)));
});

test('every day and holiday uses things that are in the cabinet, in the form asked for', () => {
  const holidays = ['samhain', 'yule', 'imbolc', 'ostara', 'beltane', 'litha', 'lughnasadh', 'mabon', 'deipnon', 'noumenia'];
  const altars = [
    ...[11, 12, 13, 14, 15, 16, 17].map((d) => tonightAltar(evening(d), [], 'x')),
    ...holidays.map((id) => tonightAltar(evening(1), [{ id, name: id }], 'x')),
  ];
  for (const altar of altars) {
    assert.ok(altar.doc.objects.length >= 11, `${altar.reason}: ${altar.doc.objects.length}`);
    for (const object of altar.doc.objects) assert.ok(object.imagePath, `${altar.reason}: ${object.label} has a picture`);
  }
  // Nothing silently swapped for another form of the same thing.
  const ids = new Set(builtInCabinet.flatMap((i) => placeableForms(i).map((f) => f.image)));
  for (const altar of altars) for (const object of altar.doc.objects) assert.ok(ids.has(String(object.imagePath)), object.imagePath);
});

test('laid out like a real altar: symmetric, back to front, nearer things drawn on top', () => {
  const objects = tonightAltar(evening(16), [], 'x').doc.objects;
  const bottoms = objects.map((o) => {
    const b = displayBox(o);
    return b.cy + (b.size * b.aspect * (16 / 9)) / 2;
  });
  for (let i = 1; i < bottoms.length; i++) assert.ok(bottoms[i] >= bottoms[i - 1] - 0.02, 'each is drawn after the ones behind it');
  const layers = objects.map((o) => Number(o.zIndex));
  assert.deepEqual([...layers].sort((a, b) => a - b), layers);
  const xs = objects.map((o) => displayBox(o).cx);
  assert.ok(Math.min(...xs) < 0.3 && Math.max(...xs) > 0.7, 'spread across the table');
});

test('a full or new moon adds its own touch', () => {
  const full = tonightAltar(evening(16), [], 'Full Moon');
  assert.equal(full.doc.objects.length, 16);
  assert.match(full.reason, /under the full moon$/);
  assert.equal(full.doc.objects.filter((o) => o.form === 'tea-light').length, 4);
  const dark = tonightAltar(evening(16), [], 'New Moon');
  assert.match(dark.reason, /at the new moon$/);
  assert.ok(dark.doc.objects.some((o) => o.type === 'vessel' && /spell-jar/.test(String(o.imagePath))));
});

test('a holiday brings its traditional things and its own setting', () => {
  const samhain = tonightAltar(evening(31), [{ id: 'samhain', name: 'Samhain' }], 'Waxing Crescent');
  assert.equal(samhain.reason, 'Samhain');
  assert.ok(samhain.labels.some((l) => /Cauldron/.test(l)));
  assert.ok(samhain.labels.some((l) => /Raven Skull/i.test(l)));
  assert.match(samhain.doc.backgroundName, /Gothic/);
  const gaelic = tonightAltar(evening(31), [{ id: 'samhain_gaelic', name: 'Samhain (Oíche Shamhna)' }], 'x');
  assert.equal(gaelic.reason, 'Samhain (Oíche Shamhna)');
  // Holidays without a set fall back to the weekday.
  assert.match(tonightAltar(evening(13), [{ id: 'thargelia', name: 'Thargelia' }], 'x').reason, /^Mars’s day/);
});
