import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { dressingOverlays, dressingsOf } from '../src/lib/altar/livingState.ts';
import { carvingRemaining, dressingCorrespondences, dressingEntry, dressWith } from '../src/lib/altar/workings/dressing.ts';

const NOW = '2026-10-16T20:00:00.000Z';
const candle = () => {
  const item = builtInCabinet.find((i) => i.id === 'candles:pink-candle')!;
  return objectFromForm(item, item.forms.find((f) => f.form === 'taper')!, [], NOW);
};

test('an oil and a herb become dressings in the website’s shape, with a direction', () => {
  const oil = dressingEntry('oil', 'Rose', 'draw', NOW);
  assert.deepEqual({ type: oil.type, herb: oil.herb, form: oil.form, label: oil.label }, { type: 'oil', herb: 'rose', form: 'oil', label: 'Rose oil' });
  assert.equal(oil.direction, 'draw');
  const herb = dressingEntry('herb', "St John's Wort", 'banish', NOW);
  assert.equal(herb.herb, 'st_johns_wort');
  assert.equal(herb.form, 'loose');
  const typed = dressingEntry('oil', 'Florida water oil', 'draw', NOW);
  assert.equal(typed.herb, '');
  assert.equal(typed.label, 'Florida water oil');
});

test('dressing a candle adds them once, and the website’s overlays show', () => {
  const entries = [dressingEntry('oil', 'Rose', 'draw', NOW), dressingEntry('herb', 'Lavender', 'draw', NOW), dressingEntry('oil', 'Rose', 'draw', NOW)];
  const dressed = dressWith(candle(), entries, NOW);
  assert.equal(dressingsOf(dressed).length, 2);
  assert.deepEqual(dressingOverlays(dressed), { herb: true, oil: true });
  assert.equal(dressWith(dressed, [dressingEntry('oil', 'rose', 'draw', NOW)], NOW), dressed);
  const notCandle = { ...candle(), type: 'crystal' };
  assert.equal(dressWith(notCandle, entries, NOW), notCandle);
});

test('dressings add up to their combined correspondences', () => {
  const reading = dressingCorrespondences([dressingEntry('oil', 'Rose', 'draw', NOW), dressingEntry('herb', 'Jasmine', 'draw', NOW)]);
  assert.equal(reading.direction, 'draw');
  assert.ok(reading.uses.includes('love'), reading.uses.join());
  assert.ok(reading.planets.length > 0);
  assert.match(reading.summary, /love/);
  assert.match(reading.summary, /drawing in/);
  const mixed = dressingCorrespondences([dressingEntry('oil', 'Rose', 'draw', NOW), dressingEntry('herb', 'Rue', 'banish', NOW)]);
  assert.equal(mixed.direction, 'mixed');
  assert.equal(dressingCorrespondences([]).summary, 'Not dressed yet.');
});

test('a carving burns away from the top as the candle burns', () => {
  const fresh = carvingRemaining('LOVE', 0);
  assert.equal(fresh.remaining, 1);
  assert.equal(fresh.visibleText, 'LOVE');
  assert.ok(fresh.glyphs.every((g) => g.opacity === 1));
  const half = carvingRemaining('LOVE', 0.35);
  assert.equal(half.visibleText, 'VE');
  assert.ok(Math.abs(half.remaining - 0.5) < 1e-9);
  const partway = carvingRemaining('LOVE', 0.0875);
  assert.equal(partway.glyphs[0].opacity, 0.5);
  const gone = carvingRemaining('LOVE', 0.8);
  assert.equal(gone.visibleText, '');
  assert.equal(gone.remaining, 0);
  assert.equal(carvingRemaining('LOVE', Number.NaN).remaining, 1);
  assert.equal(carvingRemaining('', 0.5).glyphs.length, 0);
});
