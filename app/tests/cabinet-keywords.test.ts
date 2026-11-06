// Cabinet keywords are magical uses only: at least four per item, never the
// item's own name, a colour, a form, a category or a generic word, and no two
// near-synonyms within one item (rules in cabinetKeywordRules.ts).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { builtInCabinet } from '../src/lib/altar/cabinet.ts';
import { keywordProblems } from '../src/lib/altar/cabinetKeywordRules.ts';

test('every cabinet item has at least four distinct magical-use keywords', () => {
  const problems = builtInCabinet.flatMap((item) => keywordProblems(item.id, item.name, item.keywords));
  assert.equal(problems.length, 0, `${problems.length} problems:\n${problems.join('\n')}`);
});
