// To tend: things of your own (cleansing the house, salt lines, a spiritual
// bath), kept in `tend.rhythms` as records of kind `own`: every X days, when
// each is next due from its last time, its history of completions, its
// reminders and its Grimoire note.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { gatherTendables } from '../src/lib/tend/gather.ts';
import {
  cleanRhythm,
  DONE_MAX,
  donePage,
  dueOf,
  editOwn,
  newOwnRecord,
  normalizeRecord,
  ownTendables,
  recordDone,
  removeDone,
  rhythmLabel,
  tendList,
  tendReminders,
  TEND_COLLECTION,
  type Tendable,
} from '../src/lib/tend/model.ts';

const NOW = new Date(2026, 10, 1, 10, 0);
const daysAgo = (n: number) => new Date(2026, 10, 1 - n, 12, 0);

test('own things live in tend.rhythms, with no new collection', () => {
  assert.equal(TEND_COLLECTION, 'tend.rhythms');
  const r = newOwnRecord({ name: ' Cleanse the house ', type: 'cleansing', rhythm: { kind: 'every', every: 14 } }, 'abc');
  assert.equal(r.key, 'own:abc');
  assert.equal(r.kind, 'own');
  assert.equal(r.title, 'Cleanse the house');
  assert.deepEqual(r.own, { type: 'cleansing', other: '', notes: '', grimoire: false });
  assert.deepEqual(r.rhythm, { kind: 'every', every: 14 });
  assert.deepEqual(normalizeRecord(JSON.parse(JSON.stringify(r))), r);
});

test('every X days is a whole number from 1 to 365', () => {
  assert.deepEqual(cleanRhythm({ kind: 'every', every: 0 }), { kind: 'every', every: 7 });
  assert.deepEqual(cleanRhythm({ kind: 'every', every: 900 }), { kind: 'every', every: 365 });
  assert.deepEqual(cleanRhythm({ kind: 'every', every: '3' }), { kind: 'every', every: 3 });
  assert.equal(rhythmLabel({ kind: 'every', every: 1 }), 'Every day');
  assert.equal(rhythmLabel({ kind: 'every', every: 10 }), 'Every 10 days');
});

test('next due counts from the last completion and the rhythm', () => {
  const base = newOwnRecord({ name: 'Cleanse the house', type: 'cleansing', rhythm: { kind: 'every', every: 14 } }, 'a');
  const item = ownTendables([base])[0];
  // Never done: due today.
  assert.equal(dueOf(item, base, NOW).line, 'Not done yet · due today');
  assert.equal(dueOf(item, base, NOW).state, 'due');
  // Done 9 days ago, every 14 days: due in 5.
  const nine = recordDone(base, daysAgo(9));
  const due = dueOf(item, nine, NOW);
  assert.equal(due.state, 'later');
  assert.equal(due.line, 'Last done 9 days ago · due in 5 days');
  // Done 16 days ago: overdue by 2.
  const late = dueOf(item, recordDone(base, daysAgo(16)), NOW);
  assert.equal(late.state, 'due');
  assert.equal(late.line, 'Last done 16 days ago · overdue by 2 days');
  // Done 14 days ago: due today; done today: due in 14.
  assert.equal(dueOf(item, recordDone(base, daysAgo(14)), NOW).line, 'Last done 14 days ago · due today');
  assert.equal(dueOf(item, recordDone(base, NOW), NOW).line, 'Last done today · due in 14 days');
  // Every X days works for any tended thing too.
  const candle = { kind: 'petition' as const, dueAt: null, tendedAt: daysAgo(2).getTime() };
  assert.match(dueOf(candle, { ...base, kind: 'petition', rhythm: { kind: 'every', every: 3 } }, NOW).line, /^Every 3 days · next /);
});

test('completions keep a history of the last 50, the latest counting', () => {
  let r = newOwnRecord({ name: 'Salt lines', type: 'salt', rhythm: { kind: 'weekly' } }, 'b');
  r = recordDone(r, daysAgo(1), ['Thresholds', ' '], ' swept ');
  assert.deepEqual(r.done, [{ at: daysAgo(1).toISOString(), how: ['Thresholds'], note: 'swept' }]);
  // Done on an earlier day, after: kept in order, the last time stays the latest.
  r = recordDone(r, daysAgo(5));
  assert.equal(r.done?.[0].at, daysAgo(5).toISOString());
  assert.equal(r.tendedAt, daysAgo(1).toISOString());
  assert.equal(r.times, 2);
  // Taking one out goes back to the one before.
  r = removeDone(r, daysAgo(1).toISOString());
  assert.equal(r.tendedAt, daysAgo(5).toISOString());
  for (let i = 0; i < 60; i++) r = recordDone(r, new Date(2026, 0, 1 + i, 12));
  assert.equal(r.done?.length, DONE_MAX);
});

test('own things join the list, Today and the reminders; ended or removed ones don’t', () => {
  const r = { ...newOwnRecord({ name: 'Wash the altar cloths', type: 'cloths', rhythm: { kind: 'every', every: 10 } }, 'c'), remind: true };
  const items: Tendable[] = gatherTendables({ now: NOW, records: [r] });
  assert.equal(items.length, 1);
  assert.equal(items[0].group, 'own');
  assert.equal(items[0].detail, 'Wash altar cloths');
  const list = tendList(items, [r], NOW);
  assert.equal(list.today.length, 1);
  assert.equal(ownTendables([{ ...r, ended: { how: 'let-go', at: NOW.toISOString(), note: '' } }]).length, 0);
  // Done 3 days ago, every 10 days: rings in 7 days, at nine in the morning.
  const reminders = tendReminders([recordDone(r, daysAgo(3))], NOW, 14);
  assert.equal(reminders.length, 1);
  assert.equal(reminders[0].at.getTime(), new Date(2026, 10, 8, 9, 0).getTime());
  assert.match(reminders[0].body, /^Wash altar cloths\./);
  // Overdue, with nine o'clock gone: it asks tomorrow, then every 10 days.
  const overdue = tendReminders([recordDone(r, daysAgo(30))], NOW, 14);
  assert.deepEqual(overdue.map((x) => x.at.getTime()), [new Date(2026, 10, 2, 9, 0).getTime(), new Date(2026, 10, 12, 9, 0).getTime()]);
});

test('something else, in your own words, and the Grimoire note', () => {
  const r = editOwn(newOwnRecord({ name: '', type: 'other', other: 'Feed the house spirit', rhythm: { kind: 'daily' }, grimoire: true }, 'd'), {
    name: '',
    type: 'other',
    other: 'Feed the house spirit',
    notes: 'Milk & bread',
    rhythm: { kind: 'daily' },
    grimoire: true,
  });
  assert.equal(r.title, 'Feed the house spirit');
  assert.equal(r.own?.grimoire, true);
  const done = recordDone(r, NOW, ['Words or a prayer'], 'Quiet <night>').done![0];
  const page = donePage(r, done);
  assert.equal(page.sectionTitle, 'Tending');
  assert.match(page.blocks[0].content, /^Feed the house spirit, done on /);
  assert.equal(page.blocks[1].content, 'How: Words or a prayer.');
  assert.equal(page.blocks[2].content, 'Quiet &lt;night&gt;');
});
