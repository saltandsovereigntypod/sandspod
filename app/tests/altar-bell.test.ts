// The altar bell: what ringing to cleanse keeps in the altar's History (and
// that it leaves To tend alone), the toast, the per-person rate limit and what a coven altar hears.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import * as bell from '../src/lib/altar/bell.ts';

const { CLEANSED_HISTORY, CLEANSED_LINE, isBell, readRing, ringAllowed } = bell;

test('a bell is a tool called bell', () => {
  assert.equal(isBell({ type: 'tool', tool: 'bell' }), true);
  assert.equal(isBell({ type: 'tool', tool: 'besom' }), false);
  assert.equal(isBell(null), false);
});

test('ringing to cleanse is kept in the altar\'s History, not on To tend', () => {
  assert.equal(CLEANSED_HISTORY, 'Space cleansed with the bell.');
  assert.equal(CLEANSED_LINE, 'The space is cleared.');
  for (const gone of ['cleansingToMark', 'cleanseFromEntries', 'cleansedLine', 'BELL_HOW']) assert.equal(gone in bell, false);
});

test('one ring per person per 1.5 seconds', () => {
  const last = new Map<string, number>();
  assert.equal(ringAllowed(last, 'a', 1000), true);
  assert.equal(ringAllowed(last, 'a', 2000), false);
  assert.equal(ringAllowed(last, 'b', 2000), true);
  assert.equal(ringAllowed(last, 'a', 2600), true);
});

test('a ring from the channel is read, your own and nonsense ignored', () => {
  assert.deepEqual(readRing({ from: 'x', kind: 'cleanse', key: 'k' }, 'me'), { from: 'x', kind: 'cleanse', key: 'k' });
  assert.equal(readRing({ from: 'me', kind: 'ring' }, 'me'), null);
  assert.equal(readRing({ from: 'x', kind: 'shout' }, 'me'), null);
  assert.equal(readRing(null, 'me'), null);
});
