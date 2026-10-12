import assert from 'node:assert/strict';
import test from 'node:test';

import { libraryShelves } from '../src/lib/grimoire/libraryShelves.ts';
import { buildLibrary } from '../src/lib/library/model.ts';
import type { PracticeRow } from '../src/lib/library/types.ts';

const practice: PracticeRow[] = [
  { entity_id: 'traditional/herb/rosemary', name: 'Rosemary', type: 'herb', my_practice: { Notes: 'Grows by my door' } } as unknown as PracticeRow,
  { entity_id: 'practice/note/moon-water', name: 'Moon water', type: 'note', my_practice: { Notes: 'Left out on the full moon' } } as unknown as PracticeRow,
];

test('both Library shelves appear by default, My Practice first, as on the website', () => {
  const shelves = libraryShelves(buildLibrary(practice), {});
  assert.deepEqual(shelves.map((s) => s.title), ['My Practice', 'Traditional Information']);
  const mine = shelves[0];
  assert.deepEqual(mine.groups.map((g) => g.label), ['Herbs', 'Notes']);
  assert.equal(mine.count, 2);
  assert.ok(shelves[1].count > 10, 'the Traditional Library is on its shelf');
  assert.ok(shelves[1].groups.every((g) => g.entries.every((e, i, all) => i === 0 || all[i - 1].name.localeCompare(e.name) <= 0)));
});

test('each shelf follows its Living Library setting', () => {
  const entries = buildLibrary(practice);
  assert.deepEqual(libraryShelves(entries, { library_traditional_enabled: false }).map((s) => s.key), ['myPractice']);
  assert.deepEqual(libraryShelves(entries, { library_myPractice_enabled: false }).map((s) => s.key), ['traditional']);
  assert.deepEqual(libraryShelves(entries, { library_myPractice_enabled: false, library_traditional_enabled: false }), []);
});

test('an empty My Practice shelf is left out', () => {
  assert.deepEqual(libraryShelves(buildLibrary([]), {}).map((s) => s.key), ['traditional']);
});
