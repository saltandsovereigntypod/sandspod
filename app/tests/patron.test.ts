import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ruleDates, upcomingSacred, devotionOfDay } from '../src/lib/patron/days.ts';
import { DEITY_DEVOTIONS } from '../src/lib/patron/devotions.ts';
import { PATRON_GUIDE } from '../src/lib/patron/guide.ts';
import { deitiesValue, findDeity, myDeities, patrons, withDeity, withoutDeity, type MyDeity } from '../src/lib/patron/mine.ts';

test('my deities: parse, order, add, update, remove', () => {
  assert.deepEqual(myDeities(null), []);
  assert.deepEqual(myDeities({ my_deities: 'not json' }), []);
  const a: MyDeity = { key: 'hekate', name: 'Hekate', level: 'exploring', since: '2026-10-01' };
  const b: MyDeity = { key: null, name: 'My grandmother’s saint', level: 'patron', since: '' };
  let list = withDeity(withDeity([], a), b);
  const read = myDeities({ my_deities: deitiesValue(list) });
  assert.deepEqual(read.map((d) => d.name), ['My grandmother’s saint', 'Hekate']);
  list = withDeity(list, { ...a, level: 'dedicated' });
  assert.equal(list.length, 2);
  assert.equal(findDeity(list, 'hekate')?.level, 'dedicated');
  assert.equal(findDeity(list, null, 'my grandmother’s saint')?.level, 'patron');
  assert.deepEqual(patrons(list).map((d) => d.name), ['My grandmother’s saint']);
  assert.equal(withoutDeity(list, a).length, 1);
  assert.equal(myDeities({ my_deities: JSON.stringify([{ name: 'X', level: 'weird' }, { level: 'patron' }]) })[0].level, 'exploring');
});

test('sacred day rules', () => {
  const from = new Date(2026, 9, 1); // 1 Oct 2026
  assert.equal(ruleDates({ kind: 'weekday', day: 4 }, from, 7).length, 1); // one Thursday a week
  assert.equal(ruleDates({ kind: 'weekday', day: 4 }, from, 7)[0].getDay(), 4);
  assert.deepEqual(ruleDates({ kind: 'fixed', month: 10, day: 31 }, from, 40).map((d) => d.getDate()), [31]);
  // Full moon 26 Oct 2026 (USNO: 04:12 UT); dark moon 10 Oct, first crescent the day after.
  assert.ok(ruleDates({ kind: 'moon', phase: 'full' }, from, 31).some((d) => d.getMonth() === 9 && (d.getDate() === 25 || d.getDate() === 26)));
  const dark = ruleDates({ kind: 'moon', phase: 'dark' }, from, 31)[0];
  const crescent = ruleDates({ kind: 'moon', phase: 'new' }, from, 31)[0];
  assert.equal(Math.round((crescent.getTime() - dark.getTime()) / 86_400_000), 1);
  assert.ok(ruleDates({ kind: 'attic', day: 'last' }, from, 31).length >= 1);
  assert.ok(ruleDates({ kind: 'holiday', tradition: 'wheel', id: 'samhain' }, from, 40).some((d) => d.getDate() === 31));
});

test('every deity has well-formed devotions and real sacred days within a year', () => {
  assert.ok(DEITY_DEVOTIONS.length >= 60);
  const from = new Date(2026, 0, 1);
  for (const d of DEITY_DEVOTIONS) {
    assert.ok(d.devotions.length >= 3 && d.approach && d.sacred.length, d.key);
    assert.ok(upcomingSacred(d, from, 400).length > 0, `${d.key} has no sacred day in a year`);
    assert.ok(devotionOfDay(d, from));
  }
  assert.ok(PATRON_GUIDE.sections.length >= 8 && PATRON_GUIDE.knowAndDont.known);
});
