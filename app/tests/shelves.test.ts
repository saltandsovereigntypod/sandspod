import assert from 'node:assert/strict';
import test from 'node:test';

import {
  bestBy,
  cleanItem,
  isLow,
  markLow,
  matchIngredients,
  newItem,
  pastBest,
  restock,
  shelfFor,
  shelfStory,
  shelfTendRecord,
  shoppingList,
  sortShelf,
  tendKeyOf,
  tendPlanFor,
  usedInWorking,
  whereSuggestions,
} from '../src/lib/shelves/model.ts';
import { dueOf, editOwn, normalizeRecord, ownTendables, recordDone } from '../src/lib/tend/model.ts';

const now = new Date('2026-11-04T12:00:00');

test('things go on the shelf their drawer or name says', () => {
  assert.equal(shelfFor('crystals', 'Rose Quartz'), 'crystals');
  assert.equal(shelfFor('herbs', 'Frankincense'), 'herbs');
  assert.equal(shelfFor('', 'Moon water'), 'oils');
  assert.equal(shelfFor('tools', 'Rider–Waite tarot deck'), 'decks');
  assert.equal(shelfFor('deities', 'Hekate'), 'statues');
  assert.equal(shelfFor('', 'Honey jar'), 'jars');
  assert.equal(shelfFor('natural', 'Pine cone'), 'other');
  assert.equal(shelfFor('', 'Green Witchcraft (book)'), 'books');
});

test('tending defaults by shelf', () => {
  assert.deepEqual(tendPlanFor('crystals')?.rhythm, { kind: 'moon', moon: 'full' });
  assert.deepEqual(tendPlanFor('herbs')?.rhythm, { kind: 'every', every: 365 });
  assert.deepEqual(tendPlanFor('oils', 'Moon water')?.rhythm, { kind: 'moon', moon: 'full' });
  assert.deepEqual(tendPlanFor('oils', 'Rose oil')?.rhythm, { kind: 'every', every: 365 });
  assert.deepEqual(tendPlanFor('jars')?.rhythm, { kind: 'every', every: 30 });
  assert.deepEqual(tendPlanFor('statues')?.rhythm, { kind: 'every', every: 30 });
  assert.equal(tendPlanFor('decks'), null);
  assert.equal(tendPlanFor('candles'), null);
  assert.equal(tendPlanFor('other'), null);
  assert.equal(newItem({ name: 'Tarot', shelf: 'decks' }).tend.on, false);
  assert.equal(newItem({ name: 'Amethyst', shelf: 'crystals' }).tend.on, true);
});

test('best by: about a year from when you got it, herbs and oils only', () => {
  const sage = newItem({ name: 'Sage', shelf: 'herbs', acquired: '2025-10-01' });
  assert.equal(bestBy(sage), '2026-10-01');
  assert.equal(pastBest(sage, now), true);
  assert.equal(pastBest({ ...sage, acquired: '2026-06-01' }, now), false);
  assert.equal(bestBy(newItem({ name: 'Moon water', shelf: 'oils', acquired: '2026-01-01' })), '');
  assert.equal(bestBy(newItem({ name: 'Amethyst', shelf: 'crystals', acquired: '2026-01-01' })), '');
});

test('its To tend record: linked by id, counted from when you got it, opens on the shelf', () => {
  const sage = newItem({ name: 'Sage', shelf: 'herbs', acquired: '2025-10-01' });
  const record = shelfTendRecord('abc', sage, null)!;
  assert.equal(record.key, tendKeyOf('abc'));
  assert.equal(record.own?.shelf, 'abc');
  assert.deepEqual(record.rhythm, { kind: 'every', every: 365 });
  assert.ok(record.tendedAt.startsWith('2025-10-01'));
  // Kept through a round trip and an edit from To tend.
  const saved = normalizeRecord(JSON.parse(JSON.stringify(record)))!;
  assert.equal(saved.own?.shelf, 'abc');
  assert.equal(editOwn(saved, { name: 'Sage bundle', type: 'other', rhythm: { kind: 'weekly' } }).own?.shelf, 'abc');
  const [item] = ownTendables([saved]);
  assert.equal(item.href, '/rituals/shelves/abc');
  assert.equal(dueOf(item, saved, now).state, 'due');
  // Done: next a year on.
  assert.equal(dueOf(item, recordDone(saved, now), now).state, 'later');
  // Turned off, or a shelf that asks nothing: no record.
  assert.equal(shelfTendRecord('abc', { ...sage, tend: { on: false, rhythm: null } }, null), null);
  assert.equal(shelfTendRecord('d', newItem({ name: 'Tarot', shelf: 'decks' }), null), null);
  // Your own rhythm wins.
  const deck = newItem({ name: 'Tarot', shelf: 'decks', tend: { on: true, rhythm: { kind: 'moon', moon: 'new' } } });
  assert.deepEqual(shelfTendRecord('d', deck, null)?.rhythm, { kind: 'moon', moon: 'new' });
});

test('running low goes on the shopping list, grouped by shelf; restocking brings it back up', () => {
  const sage = newItem({ name: 'Sage', shelf: 'herbs' });
  const candle = newItem({ name: 'White candle', shelf: 'candles', qty: { kind: 'count', n: 0 } });
  const quartz = newItem({ name: 'Clear quartz', shelf: 'crystals' });
  assert.equal(isLow(sage), false);
  assert.equal(isLow(candle), true);
  const lowSage = markLow(sage);
  assert.deepEqual(lowSage.qty, { kind: 'level', level: 'low' });
  const list = shoppingList([
    { id: '1', item: lowSage },
    { id: '2', item: candle },
    { id: '3', item: quartz },
  ]);
  assert.deepEqual(
    list.map((g) => [g.shelf, g.items.map((i) => i.id)]),
    [
      ['herbs', ['1']],
      ['candles', ['2']],
    ],
  );
  const back = restock(lowSage, now);
  assert.equal(back.low, false);
  assert.deepEqual(back.qty, { kind: 'level', level: 'full' });
  assert.deepEqual(restock(candle, now, 3).qty, { kind: 'count', n: 3 });
  assert.equal(restock(candle, now).restocks.length, 1);
});

test('used in a spell: kept in its story, counted down only when asked', () => {
  const candle = newItem({ name: 'White candle', shelf: 'candles', qty: { kind: 'count', n: 1 } });
  const used = usedInWorking(candle, 'Protection jar', now);
  assert.deepEqual(used.qty, { kind: 'count', n: 1 });
  assert.equal(used.uses.length, 1);
  const counted = usedInWorking({ ...candle, countDown: true }, 'Protection jar', now);
  assert.deepEqual(counted.qty, { kind: 'count', n: 0 });
  assert.equal(counted.low, true);
  const story = shelfStory({ ...counted, acquired: '2026-01-01', source: 'gift', sourceText: 'from Nan' }, null);
  assert.equal(story[0].text, 'Used in Protection jar.');
  assert.equal(story.at(-1)?.text, 'Given to you (from Nan).');
});

test('you have these / you’ll need these', () => {
  const entries = [
    { id: 'r', item: newItem({ name: 'Rosemary', shelf: 'herbs', ref: 'traditional/herb/rosemary' }) },
    { id: 'w', item: newItem({ name: 'White Candle', shelf: 'candles' }) },
    { id: 'b', item: newItem({ name: 'Bay leaves', shelf: 'herbs' }) },
    { id: 'x', item: newItem({ name: 'Black candle', shelf: 'candles', qty: { kind: 'count', n: 0 } }) },
  ];
  const { have, need } = matchIngredients(
    [
      { name: '1 tsp finely chopped fresh rosemary', ref: 'traditional/herb/rosemary' },
      { name: 'A white candle' },
      { name: 'Three bay leaves' },
      { name: 'A black candle' },
      { name: 'Salt' },
      { name: 'A candle' },
    ],
    entries,
  );
  assert.deepEqual(
    have.map((h) => h.id),
    ['r', 'w', 'b'],
  );
  assert.deepEqual(
    need.map((n) => n.name),
    ['A black candle', 'Salt', 'A candle'],
  );
});

test('where it’s kept: suggestions from earlier answers, most used first', () => {
  assert.deepEqual(whereSuggestions([{ where: 'Kitchen shelf' }, { where: 'kitchen shelf' }, { where: 'Altar drawer' }, { where: '' }]), ['Kitchen shelf', 'Altar drawer']);
});

test('search and sort', () => {
  const e = (id: string, name: string, shelf: Parameters<typeof newItem>[0]['shelf'], createdAt: string, extra = {}) => ({ id, createdAt, item: newItem({ name, shelf, ...extra }) });
  const entries = [e('1', 'Sage', 'herbs', '2026-01-02', { where: 'Kitchen' }), e('2', 'Amethyst', 'crystals', '2026-01-03'), e('3', 'Bay', 'herbs', '2026-01-01', { low: true })];
  assert.deepEqual(sortShelf(entries, 'shelf').map((x) => x.id), ['2', '3', '1']);
  assert.deepEqual(sortShelf(entries, 'name').map((x) => x.id), ['2', '3', '1']);
  assert.deepEqual(sortShelf(entries, 'added').map((x) => x.id), ['2', '1', '3']);
  assert.deepEqual(sortShelf(entries, 'low').map((x) => x.id), ['3', '2', '1']);
  assert.deepEqual(sortShelf(entries, 'tending', '', (id) => (id === '1' ? 5 : null)).map((x) => x.id), ['1', '2', '3']);
  assert.deepEqual(sortShelf(entries, 'name', 'kitchen').map((x) => x.id), ['1']);
  assert.equal(cleanItem({}).name, 'Something of mine');
});
