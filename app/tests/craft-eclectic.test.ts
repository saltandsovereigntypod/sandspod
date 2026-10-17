import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  agreement,
  blankCorrespondence,
  byName,
  correspondenceDetail,
  entryById,
  filterCorrespondences,
  mySide,
  pickableEntries,
  sampler,
  searchPickable,
  traditionalSide,
  type MyCorrespondence,
} from '../src/lib/craft/eclectic/correspondences.ts';
import { CRAFT_TOOLS } from '../src/lib/craft/practices.ts';
import { PRACTICES } from '../src/lib/rituals/premade/index.ts';

const mine = (patch: Partial<MyCorrespondence>) => ({ data: { ...blankCorrespondence(), ...patch } });

test('picks from herbs, crystals, candles, deities and tools, without guide pages', () => {
  const entries = pickableEntries();
  const types = new Set(entries.map((e) => e.type));
  assert.deepEqual([...types].sort(), ['candle', 'crystal', 'deity', 'herb', 'tool']);
  assert.ok(!entries.some((e) => e.id.includes(':_')));
  assert.ok(entries.length > 150);
});

test('searches the Library picker, names first', () => {
  const entries = pickableEntries();
  const found = searchPickable(entries, 'bas', 'herb');
  assert.equal(found[0].id, 'traditional:herb:basil');
  assert.ok(searchPickable(entries, 'aphrodite', null).some((e) => e.id === 'traditional:deity:aphrodite'));
  assert.equal(searchPickable(entries, '', 'crystal', 5).length, 5);
});

test('sets the Library’s correspondences beside yours', () => {
  const basil = entryById('traditional:herb:basil')!;
  const side = traditionalSide(basil);
  assert.deepEqual(side.slice(0, 2), [
    { label: 'Element', value: 'Fire' },
    { label: 'Planet', value: 'Mars' },
  ]);
  const aphrodite = entryById('traditional:deity:aphrodite')!;
  assert.equal(traditionalSide(aphrodite)[0].value, 'Greek');

  const c = { ...blankCorrespondence(), name: 'Basil', element: 'fire', planet: 'Venus', meaning: 'My gran’s kitchen' };
  assert.deepEqual(
    agreement(c, basil).map((a) => [a.label, a.same]),
    [
      ['Element', true],
      ['Planet', false],
    ],
  );
  assert.deepEqual(mySide(c).map((p) => p.label), ['Meaning', 'Element', 'Planet']);
});

test('filters and sorts your correspondences', () => {
  const list = [
    mine({ name: 'rosemary', meaning: 'Remembrance', element: 'Fire', source: 'tradition' }),
    mine({ name: 'Basil', meaning: 'Courage before interviews', element: 'Fire', source: 'experience' }),
    mine({ name: 'Moonstone', meaning: 'Sleep', element: 'Water', planet: 'Moon', source: 'intuition' }),
  ];
  assert.equal(filterCorrespondences(list, { query: 'interview' }).length, 1);
  assert.equal(filterCorrespondences(list, { element: 'fire' }).length, 2);
  assert.equal(filterCorrespondences(list, { source: 'intuition' })[0].data.name, 'Moonstone');
  assert.equal(filterCorrespondences(list, { query: 'moon water' }).length, 1);
  assert.deepEqual(byName(list).map((c) => c.data.name), ['Basil', 'Moonstone', 'rosemary']);
  assert.equal(correspondenceDetail(list[2].data), 'Sleep — Water · Moon');
});

test('the sampler offers one tool from every other practice and turns daily', () => {
  const today = sampler(new Date(2026, 9, 16));
  assert.equal(today.length, PRACTICES.length - 1);
  assert.ok(!today.some((s) => s.practice === 'eclectic'));
  for (const s of today) assert.ok(CRAFT_TOOLS[s.practice].includes(s.tool));
  const tomorrow = sampler(new Date(2026, 9, 17));
  assert.notDeepEqual(
    today.map((s) => s.tool.title),
    tomorrow.map((s) => s.tool.title),
  );
});
