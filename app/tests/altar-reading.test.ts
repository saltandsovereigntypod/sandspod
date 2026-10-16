import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, objectFromForm, placeableForms } from '../src/lib/altar/cabinet.ts';
import { entryByName, objectCorrespondences } from '../src/lib/altar/reading/correspondence.ts';
import { coherence, intentionEntry, intentionFor, intentionKeywords, scoreAltar, supportFor } from '../src/lib/altar/reading/intention.ts';
import { readAltar } from '../src/lib/altar/reading/reading.ts';
import { addLayer, emptyJar, jarLayer, jarObject, sealJar } from '../src/lib/altar/workings/spellJar.ts';
import type { CabinetItem, SavedObject } from '../src/lib/altar/types.ts';

const NOW = '2026-10-16T20:00:00.000Z';
const place = (itemId: string, form?: string): SavedObject => {
  const item = builtInCabinet.find((i) => i.id === itemId)!;
  const forms = placeableForms(item);
  return objectFromForm(item, forms.find((f) => f.form === form) ?? forms[0], [], NOW);
};

const loveAltar = () => [
  place('candles:pink-candle', 'taper'),
  place('candles:red-candle', 'taper'),
  place('herbs:rose', 'sprig'),
  place('crystals:rose-quartz', 'point'),
  place('deities:aphrodite-statue'),
];

test('names find their Library entries loosely', () => {
  assert.equal(entryByName('Rose oil')?.id, 'traditional:herb:rose');
  assert.equal(entryByName('dried lavender')?.id, 'traditional:herb:lavender');
  assert.equal(entryByName('Red candle', null, 'candle')?.name, 'Red Candle');
  assert.equal(entryByName(''), null);
});

test('a spell jar reads as all its ingredients', () => {
  let jar = emptyJar('Money');
  jar = addLayer(jar, jarLayer({ label: 'Basil', source: 'library', herb: 'basil' }, NOW));
  jar = addLayer(jar, jarLayer({ label: 'Citrine', source: 'library', crystal: 'citrine' }, NOW));
  const { object } = jarObject(sealJar(jar, 'green', NOW), [], NOW);
  const parts = objectCorrespondences(object);
  assert.deepEqual(parts.map((p) => p.name), ['Basil', 'Citrine']);
});

test('intentions: keywords, themes, and how each piece supports it', () => {
  assert.deepEqual(intentionKeywords('Bring more money and steady work').themes, ['prosperity']);
  assert.ok(intentionKeywords('Calm sleep for the house').themes.includes('peace'));
  const objects = loveAltar();
  const rose = supportFor(objects[2], 'Self-love and tenderness');
  assert.ok(rose.score > 0, rose.note);
  assert.match(rose.note, /speaks to it/);
  const scored = scoreAltar(objects, 'love');
  assert.equal(scored.length, 5);
  assert.ok(coherence(scored) >= 0.8, String(coherence(scored)));
  assert.deepEqual(scoreAltar(objects, '   '), []);
  const e = intentionEntry('a', '  Love,   gently  ', NOW);
  assert.equal(e.text, 'Love, gently');
  const pick = intentionFor(
    [
      { data: intentionEntry('a', 'old', '2026-01-01T00:00:00Z'), updatedAt: '2026-01-01T00:00:00Z' },
      { data: intentionEntry('a', 'new', '2026-02-01T00:00:00Z'), updatedAt: '2026-02-01T00:00:00Z' },
      { data: intentionEntry('b', 'other', NOW), updatedAt: NOW },
    ],
    'a',
  );
  assert.equal(pick?.data.text, 'new');
});

test('the reading: balance, what it speaks of, coherence, and one suggestion for the gap', () => {
  const reading = readAltar({ objects: loveAltar(), intention: 'love' });
  assert.equal(reading.pieces, 5);
  assert.ok(reading.dominant.includes('love'), reading.dominant.join());
  assert.ok(reading.planets.some((p) => p.key === 'Venus'));
  assert.ok(reading.intention && reading.intention.score >= 0.8);
  assert.ok(reading.suggestion, 'a suggestion');
  const gap = reading.suggestion!.element;
  assert.equal(reading.elements[gap], Math.min(...Object.values(reading.elements)));
  assert.ok(reading.suggestion!.cabinetItemId, 'it can be placed from the cabinet');
  assert.ok(reading.sentences.length >= 4);
  for (const s of reading.sentences) assert.match(s, /[.!]$/, s);
  assert.ok(reading.sentences.some((s) => /speaks of/.test(s)));
});

test('the suggestion prefers something already in your cabinet', () => {
  const plain = readAltar({ objects: loveAltar() });
  const gap = plain.suggestion!.element;
  // Find another Library stone or herb of that element and pretend it's yours.
  const theirs = builtInCabinet.find((i) => {
    if (i.category !== 'crystals' && i.category !== 'herbs') return false;
    const e = entryByName(i.name);
    return e && i.name !== plain.suggestion!.name && e.traditional?.Element === gap;
  })!;
  const mine: CabinetItem = { ...theirs, id: 'custom:x', customCabinetItemId: 'x' };
  const reading = readAltar({ objects: loveAltar(), cabinet: [mine] });
  assert.equal(reading.suggestion!.name.toLowerCase(), theirs.name.toLowerCase());
  assert.equal(reading.suggestion!.owned, true);
  assert.match(reading.suggestion!.why, /already in your cabinet/);
});

test('gentle clash notes where traditional opposites meet', () => {
  const objects = [
    place('candles:red-candle', 'taper'),
    place('herbs:basil', 'sprig'),
    place('crystals:moonstone', 'tumbled'),
    place('herbs:jasmine', 'sprig'),
    place('candles:pink-candle', 'taper'),
  ];
  const reading = readAltar({ objects });
  assert.ok(reading.clashes.length >= 1 && reading.clashes.length <= 2, reading.clashes.join(' | '));
  assert.ok(reading.clashes.some((c) => /opposite/.test(c)));
  assert.equal(readAltar({ objects: [] }).sentences.length, 1);
});
