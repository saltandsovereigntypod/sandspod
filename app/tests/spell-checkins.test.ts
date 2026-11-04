import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  answerCheckIn,
  checkInDate,
  checkInReminders,
  checkInTimeline,
  dueCheckIn,
  offerCheckIns,
  pendingCheckIns,
  readCheckIns,
  startCheckIns,
  stopCheckIns,
} from '../src/lib/rituals/checkIns.ts';
import { readLookBack } from '../src/lib/rituals/lookBack.ts';
import { buildSchedule, DEFAULT_SETTINGS } from '../src/lib/reminders/schedule.ts';

const entry = (patch: Record<string, unknown> = {}) =>
  ({ id: 'w1', title: 'Steady work jar', metadata: {}, ritual_date: '2026-11-01', intention: null, moon_phase: null, ...patch }) as never;
const at = (key: string, hour = 12) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, hour);
};

test('check-ins fall a day, a week and four weeks after the working', () => {
  assert.equal(checkInDate('2026-11-01', 1), '2026-11-02');
  assert.equal(checkInDate('2026-11-01', 7), '2026-11-08');
  assert.equal(checkInDate('2026-11-01', 28), '2026-11-29');
  assert.equal(checkInDate('2026-12-20', 28), '2027-01-17');
});

test('offered for a recent working only, and once chosen, scheduled', () => {
  assert.equal(offerCheckIns(entry(), at('2026-11-01')), true);
  assert.equal(offerCheckIns(entry(), at('2026-12-01')), false);
  const on = startCheckIns(entry(), at('2026-11-01'));
  assert.equal(offerCheckIns(on, at('2026-11-01')), false);
  assert.deepEqual(readCheckIns(on), { on: true, from: '2026-11-01', notes: [] });
  assert.deepEqual(pendingCheckIns(on).map((p) => p.date), ['2026-11-02', '2026-11-08', '2026-11-29']);
  const reminders = checkInReminders(on);
  assert.deepEqual(reminders.map((r) => r.key), ['checkin:w1:1', 'checkin:w1:7', 'checkin:w1:28']);
  assert.equal(checkInReminders(stopCheckIns(on, at('2026-11-01'))).length, 0);
});

test('the latest check-in due is asked, once', () => {
  const on = startCheckIns(entry(), at('2026-11-01'));
  assert.equal(dueCheckIn(on, at('2026-11-01')), null);
  assert.equal(dueCheckIn(on, at('2026-11-02'))?.day, 1);
  // A missed day-one gives way to the week.
  assert.equal(dueCheckIn(on, at('2026-11-09'))?.day, 7);
  const written = answerCheckIn(on, 7, { feeling: 'signs', signs: 'An email out of the blue' }, at('2026-11-09'));
  assert.equal(dueCheckIn(written, at('2026-11-10')), null);
  assert.equal(dueCheckIn(written, at('2026-11-29'))?.day, 28);
  assert.deepEqual(checkInTimeline(written), [
    { id: 'w1:checkin:7', date: '2026-11-09', title: 'Check-in · Steady work jar', detail: 'A week on · Small signs · An email out of the blue' },
  ]);
});

test('the four-week check-in can answer "Did it work?"', () => {
  const on = startCheckIns(entry(), at('2026-11-01'));
  const done = answerCheckIn(on, 28, { feeling: 'arrived', signs: 'The job came through', answer: 'yes' }, at('2026-11-29'));
  assert.equal(readLookBack(done)?.answer, 'yes');
  assert.equal(readLookBack(done)?.outcome, 'The job came through');
  assert.equal(pendingCheckIns(done).length, 2);
});

test('the reminders ring under their own switch', () => {
  const sources = checkInReminders(startCheckIns(entry(), at('2026-11-01')));
  const now = at('2026-11-01', 8);
  const on = buildSchedule({ ...DEFAULT_SETTINGS, lookBacks: false }, [], now, 60, [], sources);
  assert.equal(on.filter((r) => r.key.startsWith('checkin:')).length, 3);
  const off = buildSchedule({ ...DEFAULT_SETTINGS, checkIns: false }, [], now, 60, [], sources);
  assert.equal(off.filter((r) => r.key.startsWith('checkin:')).length, 0);
});
