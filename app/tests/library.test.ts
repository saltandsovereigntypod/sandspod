import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildLibrary,
  correspondences,
  entryIntro,
  findByName,
  guestPracticeRows,
  layerFields,
  searchLibrary,
  traditionalEntries,
  visibleLayers,
} from '../src/lib/library/model.ts';
import type { PracticeRow } from '../src/lib/library/types.ts';
import { defaultSettings, normalizeSettings } from '../src/lib/settings/defaults.ts';

const row = (extra: Partial<PracticeRow>): PracticeRow => ({
  entity_id: 'e1',
  name: 'basil',
  type: 'herb',
  image: null,
  my_practice: {},
  community: {},
  updated_at: null,
  ...extra,
});

test('every Traditional Library entry is present, including candle styles and the guide', () => {
  const entries = traditionalEntries();
  assert.equal(entries.filter((e) => e.type === 'herb').length, 20);
  const names = entries.map((e) => e.name);
  assert.ok(names.includes('Basil'));
  assert.ok(names.includes('Candle Magic Guide'));
  assert.ok(names.includes('Tea Light Candle'));
  assert.equal(new Set(entries.map((e) => e.id)).size, entries.length);
});

test('search puts name matches first and needs every word', () => {
  const entries = traditionalEntries();
  assert.equal(searchLibrary(entries, 'basil')[0].name, 'Basil');
  assert.equal(searchLibrary(entries, 'BAY')[0].name, 'Bay');
  const protection = searchLibrary(entries, 'protection', { type: 'herb' });
  assert.ok(protection.length > 3);
  assert.ok(protection.every((e) => e.type === 'herb'));
  assert.deepEqual(searchLibrary(entries, 'basil zzzz'), []);
  assert.equal(searchLibrary(entries, '', { limit: 5 }).length, 5);
});

test('My Practice rows join the matching traditional entry by type and name', () => {
  const library = buildLibrary([
    row({ my_practice: { Uses: 'Money bowls', PairsWith: 'Cinnamon' } }),
    row({ entity_id: 'e2', name: 'Chamomile', my_practice: {} }),
    row({ entity_id: 'e3', name: 'Moon Water', type: 'apothecary', my_practice: { Notes: 'Charged at full moon' } }),
    row({ entity_id: 'e4', name: 'Empty thing', type: 'note', my_practice: {} }),
  ]);
  const basil = library.find((e) => e.id === 'traditional:herb:basil');
  assert.deepEqual(basil?.myPractice, { Uses: 'Money bowls', PairsWith: 'Cinnamon' });
  assert.deepEqual(basil?.practiceEntityIds, ['e1']);
  const moonWater = library.find((e) => e.id === 'practice:e3');
  assert.equal(moonWater?.category, 'Apothecary');
  assert.equal(library.some((e) => e.id === 'practice:e4'), false);
  assert.ok(searchLibrary(library, 'money', { mine: true }).some((e) => e.name === 'Basil'));
});

test('guest Library data from the website becomes practice rows', () => {
  const rows = guestPracticeRows({
    entities: { x: { id: 'x', name: 'Rosemary', type: 'herb', image: 'data:image/png;base64,AAA', myPractice: { Notes: 'Door wash' } } },
  });
  assert.deepEqual(rows[0], {
    entity_id: 'x',
    name: 'Rosemary',
    type: 'herb',
    image: null,
    my_practice: { Notes: 'Door wash' },
    community: null,
    updated_at: null,
  });
  assert.deepEqual(guestPracticeRows(null), []);
});

test('page fields follow reading order, split lists into chips and obey settings', () => {
  const basil = traditionalEntries().find((e) => e.id === 'traditional:herb:basil')!;
  const fields = layerFields(basil.traditional, 'traditional');
  assert.equal(fields[0].key, 'Overview');
  assert.equal(fields.some((f) => f.key === 'DisplayName' || f.key === 'tags'), false);
  assert.deepEqual(fields.find((f) => f.key === 'PairsWith')?.chips, ['Rosemary', 'cinnamon', 'bay', 'citrine']);

  const settings = normalizeSettings({ settings: { library_traditional_pairings: false, library_traditional_notes: false } });
  const filtered = layerFields(basil.traditional, 'traditional', settings);
  assert.equal(filtered.some((f) => f.key === 'PairsWith'), false);
  assert.equal(filtered.some((f) => f.key === 'Overview'), false); // unknown fields count as notes
  assert.ok(filtered.some((f) => f.key === 'Uses'));
});

test('layers follow the chosen order and hide disabled ones', () => {
  assert.deepEqual(visibleLayers(defaultSettings()), ['myPractice', 'traditional']);
  const settings = normalizeSettings({
    settings: { library_layer_order: 'community,myPractice,traditional', library_community_enabled: true },
  });
  assert.deepEqual(visibleLayers(settings), ['community', 'myPractice', 'traditional']);
});

test('names resolve to entries for pairing chips and ingredient suggestions', () => {
  const entries = traditionalEntries();
  assert.equal(findByName(entries, 'rosemary')?.id, 'traditional:herb:rosemary');
  assert.equal(findByName(entries, 'Citrine', 'crystal')?.type, 'crystal');
  assert.equal(findByName(entries, 'nothing like this'), null);
});

test('intro and correspondences read from the traditional layer', () => {
  const basil = traditionalEntries().find((e) => e.id === 'traditional:herb:basil')!;
  assert.match(entryIntro(basil), /^Traditionally associated with protection/);
  assert.deepEqual(correspondences(basil), [
    { label: 'Element', value: 'Fire' },
    { label: 'Planet', value: 'Mars' },
  ]);
});
