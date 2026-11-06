import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet } from '../src/lib/altar/cabinet.ts';
import { keywordLine } from '../src/lib/altar/cabinetKeywords.ts';

test('every built-in cabinet item has at least four keywords', () => {
  const short = builtInCabinet.filter((item) => item.keywords.filter((k) => k.trim()).length < 4).map((item) => item.id);
  assert.deepEqual(short, []);
});

test('keywordLine title-cases, caps at four and joins with a middle dot', () => {
  assert.equal(keywordLine(['protection', 'love', 'sleep', 'dreams', 'extra']), 'Protection · Love · Sleep · Dreams');
  assert.equal(keywordLine(['fairy lore', 'yes-or-no questions']), 'Fairy Lore · Yes-Or-No Questions');
  assert.equal(keywordLine([]), '');
});
