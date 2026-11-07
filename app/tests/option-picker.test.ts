import assert from 'node:assert/strict';
import { test } from 'node:test';

import { filterOptions, shouldFold, shouldSearch, summaryLabel } from '../src/lib/optionPicker.ts';

const opt = (label: string, selected = false) => ({ key: label, label, selected });

test('long lists fold, short lists keep their chips', () => {
  assert.equal(shouldFold(6), false);
  assert.equal(shouldFold(8), false);
  assert.equal(shouldFold(9), true);
  assert.equal(shouldSearch(12), false);
  assert.equal(shouldSearch(13), true);
});

test('search ignores case and accents and matches every word', () => {
  const list = [opt('Love & attraction'), opt('Protection'), opt('Lughnasadh'), opt('Déjà vu work')];
  assert.deepEqual(filterOptions(list, '').map((o) => o.label), list.map((o) => o.label));
  assert.deepEqual(filterOptions(list, 'PROT').map((o) => o.label), ['Protection']);
  assert.deepEqual(filterOptions(list, 'deja').map((o) => o.label), ['Déjà vu work']);
  assert.deepEqual(filterOptions(list, 'attraction love').map((o) => o.label), ['Love & attraction']);
  assert.deepEqual(filterOptions(list, 'zzz'), []);
});

test('the row names one or two choices, then counts', () => {
  assert.equal(summaryLabel([opt('A'), opt('B')]), 'Choose');
  assert.equal(summaryLabel([opt('A'), opt('B')], 'Any'), 'Any');
  assert.equal(summaryLabel([opt('A', true), opt('B')]), 'A');
  assert.equal(summaryLabel([opt('A', true), opt('B', true)]), 'A, B');
  assert.equal(summaryLabel([opt('A', true), opt('B', true), opt('C', true)]), '3 chosen');
});
