import assert from 'node:assert/strict';
import { test } from 'node:test';

import { glanceLine, resolveAltarEntry, stateRows, traditionalSplit } from '../src/lib/altar/companion.ts';
import { buildLibrary } from '../src/lib/library/model.ts';

const entries = buildLibrary([
  { entity_id: 'mine-1', name: 'Lavender', type: 'herb', image: null, my_practice: { Notes: 'Sleep sachet' }, community: null, updated_at: null },
]);

test('altar objects find their Living Library entry like the website', () => {
  assert.equal(resolveAltarEntry(entries, { type: 'oil', herb: 'lavender', form: 'oil' })?.id, 'traditional:herb:lavender');
  assert.equal(resolveAltarEntry(entries, { type: 'candle', color: 'red' })?.id, 'traditional:candle:red');
  assert.equal(resolveAltarEntry(entries, { type: 'crystal', crystal: 'clear_quartz' })?.id, 'traditional:crystal:clear_quartz');
  assert.equal(resolveAltarEntry(entries, { type: 'vessel', vessel: 'offering_bowl' })?.id, 'traditional:vessel:offering_bowl');
  // A practice entity folded into a traditional entry resolves to that entry.
  assert.equal(resolveAltarEntry(entries, { type: 'herb', entityId: 'mine-1' })?.id, 'traditional:herb:lavender');
  assert.equal(resolveAltarEntry(entries, { type: 'cloth', label: 'Green cloth' }), null);
});

test('the glance line gives element, planet and a few uses, and respects settings', () => {
  const red = resolveAltarEntry(entries, { type: 'candle', color: 'red' })!;
  assert.match(glanceLine(red), /^Fire · Mars · \w/);
  assert.doesNotMatch(glanceLine(red, { library_traditional_correspondences: false } as never), /Fire/);
});

test('warnings stay in view and the rest folds away', () => {
  const lavender = resolveAltarEntry(entries, { herb: 'lavender' })!;
  const split = traditionalSplit(lavender);
  assert.equal(split.lead.length, 2);
  assert.ok(split.warnings.some((field) => field.key === 'SafetyAndRespect'));
  assert.ok(split.rest.length > 0);
  assert.ok(![...split.lead, ...split.rest].some((field) => field.key === 'Element'));
});

test('state rows describe a candle and a jar', () => {
  const now = new Date(2026, 9, 11, 12);
  const candle = {
    type: 'candle',
    apothecaryIngredients: '[]',
    livingState: JSON.stringify({ candle: { totalBurnMs: 5_400_000, lastLitAt: new Date(2026, 9, 10, 20).toISOString(), dressings: [{ label: 'Rosemary oil' }] } }),
  };
  assert.deepEqual(stateRows(candle, now), [
    { label: 'Burned in all', value: '1 h 30 min' },
    { label: 'Last lit', value: 'Yesterday' },
    { label: 'Dressed with', value: 'Rosemary oil' },
  ]);
  const jar = { type: 'apothecary', apothecaryType: 'Spell jar', apothecaryIntention: 'Protection', apothecaryIngredients: JSON.stringify(['Salt', { name: 'Rosemary' }]) };
  assert.deepEqual(stateRows(jar, now).slice(0, 3), [
    { label: 'Kind', value: 'Spell jar' },
    { label: 'Intention', value: 'Protection' },
    { label: 'Inside', value: 'Salt, Rosemary' },
  ]);
});

test('the cabinet shows each item’s two best-known uses', async () => {
  const { cabinetEntry, topUses } = await import('../src/lib/altar/companion.ts');
  const { builtInCabinet } = await import('../src/lib/altar/cabinet.ts');
  const red = builtInCabinet.find((item) => item.name === 'Red Candle')!;
  assert.equal(topUses(cabinetEntry(entries, red, red.forms[0])), 'passion · courage');
  const lavender = builtInCabinet.find((item) => item.name === 'Lavender')!;
  assert.equal(topUses(cabinetEntry(entries, lavender, lavender.forms[0])), 'peace · sleep');
  assert.equal(topUses(null), '');
});

test('a candle can be carved, shows it, and the carving can be smoothed away', async () => {
  const { carveCandle, carvingsOf, uncarveCandle } = await import('../src/lib/altar/livingState.ts');
  const now = new Date(2026, 9, 11, 12).toISOString();
  let candle: import('../src/lib/altar/types.ts').SavedObject = { type: 'candle', label: 'Green Candle' };
  candle = carveCandle(candle, '  Abundance ', now);
  candle = carveCandle(candle, 'abundance', now);
  candle = carveCandle(candle, 'Ash', now);
  assert.deepEqual(carvingsOf(candle).map((c) => c.text), ['Abundance', 'Ash']);
  assert.ok(stateRows(candle, new Date(now)).some((r) => r.label === 'Carved with' && r.value === '“Abundance”, “Ash”'));
  assert.deepEqual(carvingsOf(uncarveCandle(candle, now, 0)).map((c) => c.text), ['Ash']);
  assert.equal(carvingsOf(uncarveCandle(candle, now)).length, 0);
  // Only candles take carvings, and nothing blank is carved.
  assert.equal(carveCandle({ type: 'crystal' }, 'Calm', now).livingState, undefined);
  assert.equal(carveCandle(candle, '   ', now), candle);
});
