import assert from 'node:assert/strict';
import { test } from 'node:test';

import { blankCorrespondence, forLibraryEntry, pairNames, type MyCorrespondence } from '../src/lib/craft/eclectic/correspondences.ts';
import { blankSpec, specFromParams } from '../src/lib/rituals/spellcraft/index.ts';
import { builderParams, findCorrespondences, finderIntent, intentsForTide, planetOfDay, suggestedTiming } from '../src/lib/rituals/spellcraft/finder.ts';

const mine = (id: string, patch: Partial<MyCorrespondence>) => ({ id, data: { ...blankCorrespondence(), ...patch } });

test('nothing asked finds nothing', () => {
  const r = findCorrespondences({});
  assert.equal(r.empty, true);
  assert.equal(r.herb.length + r.crystal.length + r.candle.length, 0);
});

test('an intention finds Library herbs, stones and candles for it, never a dangerous plant', () => {
  const r = findCorrespondences({ intent: 'protection' });
  assert.ok(r.herb.length > 0 && r.crystal.length > 0 && r.candle.length > 0);
  assert.ok(r.herb.every((h) => !h.danger));
  assert.ok(r.herb.every((h) => /protect|ward|shield|bound|defen/i.test(`${h.uses} ${h.why}`)));
});

test('a planet and a day narrow to that planet', () => {
  const venus = findCorrespondences({ planet: 'Venus' });
  assert.ok(venus.herb.length > 0);
  assert.ok(venus.herb.every((h) => h.planet === 'Venus'));
  assert.equal(planetOfDay('Friday'), 'Venus');
  const friday = findCorrespondences({ day: 'Friday' });
  assert.deepEqual(friday.herb.map((h) => h.ref), venus.herb.map((h) => h.ref));
});

test('a colour finds its candle first', () => {
  const r = findCorrespondences({ colour: 'Green' });
  assert.match(r.candle[0].name, /green/i);
});

test('a word finds the herb by name', () => {
  const r = findCorrespondences({ text: 'rosemary' });
  assert.equal(r.herb[0].name, 'Rosemary');
});

test('the moon leads to the intents it suits', () => {
  assert.ok(intentsForTide('waning').some((i) => i.key === 'banishing'));
  const r = findCorrespondences({ moon: 'waning' });
  assert.ok(r.herb.length > 0);
  assert.equal(finderIntent({ moon: 'waning' }), intentsForTide('waning')[0].key);
});

test('your own correspondences count: notes on an entry, and matches of their own', () => {
  const notes = [
    mine('a', { name: 'Rosemary', ref: 'traditional:herb:rosemary', meaning: 'my grandmother, remembrance', pairs: 'bay, white candle' }),
    mine('b', { name: 'My grandmother’s ring', meaning: 'remembrance and protection' }),
  ];
  const r = findCorrespondences({ text: 'grandmother' }, { mine: notes });
  assert.equal(r.herb[0]?.name, 'Rosemary');
  assert.deepEqual(r.herb[0].mine, ['my grandmother, remembrance']);
  assert.deepEqual(r.mine.map((m) => m.id), ['b']);
  const anc = findCorrespondences({ intent: 'ancestors' }, { mine: notes });
  assert.ok(anc.herb.some((h) => h.name === 'Rosemary' && h.mine.length === 1));
});

test('pairings and notes show on the Library entry they are about', () => {
  const list = [
    mine('a', { name: 'Rosemary', ref: 'traditional:herb:rosemary', meaning: 'remembrance', pairs: 'Bay; white candle' }),
    mine('b', { name: 'Lavender', meaning: 'sleep' }),
    mine('c', { name: 'Hearth', pairs: 'rosemary, salt' }),
  ];
  assert.deepEqual(pairNames(list[0].data), ['Bay', 'white candle']);
  const rosemary = forLibraryEntry(list, { id: 'traditional:herb:rosemary', name: 'Rosemary' });
  assert.deepEqual(rosemary.about.map((e) => e.id), ['a']);
  assert.deepEqual(rosemary.pairedWith.map((e) => e.id), ['c']);
  assert.deepEqual(forLibraryEntry(list, { id: 'traditional:herb:lavender', name: 'Lavender' }).about.map((e) => e.id), ['b']);
});

test('Build a spell carries the choices, timing and your own things to the builder', () => {
  const timing = suggestedTiming({ intent: 'love' });
  assert.equal(timing.moon, 'waxing');
  assert.equal(timing.planet, 'Venus');
  const params = builderParams([{ ref: 'traditional/herb/rose', name: 'Rose' }], ['my ring'], timing);
  assert.deepEqual(params, { from: 'finder', intent: 'love', moon: 'waxing', planet: 'Venus', add: 'traditional/herb/rose', own: 'my ring' });
  const spec = specFromParams(params, () => [{ ref: 'traditional/herb/basil', name: 'Basil', type: 'herb' }], () => null);
  assert.deepEqual(spec.ingredients.map((i) => i.name), ['Rose', 'my ring']);
  assert.equal(spec.moon, 'waxing');
  assert.equal(spec.planet, 'Venus');
  assert.equal(spec.intent, 'love');
  // Without the finder, starters are still added as before.
  assert.equal(specFromParams({ intent: 'love' }, () => [{ ref: 'traditional/herb/basil', name: 'Basil', type: 'herb' }], () => null).ingredients.length, 1);
  assert.equal(blankSpec().moon, null);
});
