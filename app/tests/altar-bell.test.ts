// The altar bell: which of your own Cleansing things ringing to cleanse marks
// done, the toast, the per-person rate limit and what a coven altar hears.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BELL_HOW, cleanseFromEntries, cleansedLine, cleansingToMark, isBell, readRing, ringAllowed } from '../src/lib/altar/bell.ts';
import { newOwnRecord, recordDone, recordEnded } from '../src/lib/tend/model.ts';

const now = new Date(2026, 10, 2, 12);
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

test('a bell is a tool called bell', () => {
  assert.equal(isBell({ type: 'tool', tool: 'bell' }), true);
  assert.equal(isBell({ type: 'tool', tool: 'besom' }), false);
  assert.equal(isBell(null), false);
  assert.equal(BELL_HOW, 'Sound / bells');
});

test('the most overdue cleansing is marked, else the first; nothing when there is none', () => {
  const every = (n: number) => ({ kind: 'every' as const, every: n });
  const house = recordDone(newOwnRecord({ name: 'Cleanse the house', type: 'cleansing', rhythm: every(7) }, 'a'), daysAgo(9));
  const room = recordDone(newOwnRecord({ name: 'Cleanse my room', type: 'cleansing', rhythm: every(7) }, 'b'), daysAgo(20));
  const salt = recordDone(newOwnRecord({ name: 'Salt the doors', type: 'salt', rhythm: every(7) }, 'c'), daysAgo(40));
  assert.equal(cleansingToMark([house, room, salt], now)?.title, 'Cleanse my room');
  const fresh = recordDone(newOwnRecord({ name: 'Fresh', type: 'cleansing', rhythm: every(7) }, 'd'), daysAgo(1));
  const later = recordDone(newOwnRecord({ name: 'Later', type: 'cleansing', rhythm: every(30) }, 'e'), daysAgo(2));
  assert.equal(cleansingToMark([fresh, later], now)?.title, 'Fresh');
  const ended = recordEnded(room, 'closed', '', now);
  assert.equal(cleansingToMark([salt, ended], now), null);
  assert.equal(cleansedLine(null), 'The space is cleared.');
  assert.equal(cleansedLine('Cleanse the house'), 'The space is cleared. “Cleanse the house” is marked done.');
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

test('the website marks the newest copy of the cleansing done with bells', () => {
  const house = newOwnRecord({ name: 'Cleanse the house', type: 'cleansing', rhythm: { kind: 'weekly' } }, 'a');
  const found = cleanseFromEntries([{ id: 'old', data: house, updatedAt: '2026-01-01' }, { id: 'new', data: house, updatedAt: '2026-02-01' }], now);
  assert.equal(found?.id, 'new');
  assert.equal(found?.title, 'Cleanse the house');
  assert.deepEqual(found?.record.done?.at(-1)?.how, ['Sound / bells']);
  assert.equal(cleanseFromEntries([], now), null);
});
