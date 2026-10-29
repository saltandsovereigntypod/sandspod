import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.TZ = 'UTC';

const M = await import('../src/lib/covens/moonCalendar.ts');
const { calendarChoices, leadLine } = await import('../src/lib/calendars/index.ts');

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);
const coven = {
  id: 'c1',
  name: 'Oak Coven',
  practice_calendars: ['attic', 'nonsense'],
  moon_calendar: { calendar_count_by: 'moon', calendar_opt_moon_yearStart: 'attic', calendar_opt_moon_names: 'attic', calendar_opt_moon_blue: 'monthly', stray: 'x', calendar_opt_moon_southNames: 'sideways' },
};

test('the coven’s calendar is read safely, and a missing column is nothing set', () => {
  assert.deepEqual(M.readCovenMoon(coven.moon_calendar), { calendar_count_by: 'moon', calendar_opt_moon_yearStart: 'attic', calendar_opt_moon_names: 'attic', calendar_opt_moon_blue: 'monthly' });
  assert.deepEqual(M.readCovenMoon(null), {});
  assert.deepEqual(M.readCovenMoon([1]), {});
  assert.deepEqual(M.covenCalendarIds(coven), ['attic']);
  assert.equal(M.hasCovenCounting({ id: 'x' }), false);
  assert.deepEqual(M.covenFollowsLines({ id: 'x' }), []);
  assert.equal(M.covenCalendarState({}, { id: 'x' }), 'none');
});

test('what the coven follows, in plain words', () => {
  const lines = M.covenFollowsLines(coven);
  assert.equal(lines[0], 'The coven counts its days by the moon’s months, from new moon to new moon.');
  assert.equal(lines[1], 'Beside the date it shows the Attic (Athenian) calendar.');
  assert.ok(lines.includes('The year begins at the first new moon after the summer solstice (Attic).'));
  assert.ok(lines.includes('The months are named by the Attic months (Hekatombaion, Metageitnion…).'));
  assert.ok(!lines.some((l) => l.startsWith('South of the equator')));
  assert.equal(M.covenMoonLine(coven, day(2026, 7, 20), null), 'Hekatombaion · day 7');
  // A choice following a calendar the coven doesn't show reads as the default.
  const unshown = { ...coven, practice_calendars: [] };
  assert.ok(M.covenFollowsLines(unshown).includes('The year begins at the first new moon on or after the winter solstice.'));
});

test('taking the coven’s calendar: the changes, in words; then put back', () => {
  const mine: Record<string, unknown> = { calendar_count_by: 'standard', calendar_extra: 'roman', calendar_opt_moon_names: 'numbered' };
  assert.equal(M.covenCalendarState(mine, coven), 'offer');
  const { lines } = M.covenCalendarChanges(mine, coven);
  assert.deepEqual(lines, [
    { label: 'Also show', from: '', to: 'adds the Attic (Athenian) calendar' },
    { label: 'Count my days by', from: 'Standard', to: 'The moon' },
    { label: 'Name the months', from: 'First Moon, Second Moon…', to: 'The Attic months' },
    { label: 'The year begins', from: 'After the winter solstice', to: 'As the Attic calendar' },
    { label: 'A Blue Moon is', from: 'The third of four in a season', to: 'The second in a month' },
  ]);
  const taken = { ...mine, ...M.takeCovenCalendar(mine, coven) };
  assert.equal(taken.calendar_extra, 'roman,attic');
  assert.deepEqual(calendarChoices(taken, 'moon'), { names: 'attic', southNames: 'turned', yearStart: 'attic', blue: 'monthly' });
  assert.equal(leadLine(day(2026, 7, 20), taken, null), 'Hekatombaion · day 7');
  assert.equal(M.covenCalendarState(taken, coven), 'applied');
  assert.equal(M.covenMoonLineIfDifferent(coven, taken, day(2026, 7, 20), null), '');
  assert.equal(M.covenMoonLineIfDifferent(coven, mine, day(2026, 7, 20), null), 'Hekatombaion · day 7');

  // The coven changes its calendar: asked, never changed.
  const changed = { ...coven, moon_calendar: { ...coven.moon_calendar, calendar_opt_moon_blue: 'seasonal' } };
  assert.equal(M.covenCalendarState(taken, changed), 'changed');
  const updated = { ...taken, ...M.takeCovenCalendar(taken, changed) };
  assert.equal(M.covenCalendarState(updated, changed), 'applied');

  // Putting back restores what was there before the first time.
  const back = { ...updated, ...M.restoreMyCalendar(updated) };
  assert.equal(back.calendar_count_by, 'standard');
  assert.equal(back.calendar_extra, 'roman');
  assert.equal(back.calendar_opt_moon_names, 'numbered');
  assert.equal(back.calendar_opt_moon_yearStart, '');
  assert.deepEqual(calendarChoices(back, 'moon'), calendarChoices(mine, 'moon'));
  assert.equal(M.covenCalendarState(back, changed), 'kept');
  assert.equal(M.canRestore(back, changed), false);
});

test('keeping your own is remembered until the coven changes', () => {
  const mine: Record<string, unknown> = {};
  const kept = { ...mine, ...M.keepMyCalendar(mine, coven) };
  assert.equal(M.covenCalendarState(kept, coven), 'kept');
  assert.equal(kept.calendar_count_by, undefined);
  const changed = { ...coven, practice_calendars: ['attic', 'roman'] };
  assert.equal(M.covenCalendarState(kept, changed), 'offer');
  // Already the same: nothing to offer.
  const same = { ...M.covenSettings(coven), calendar_opt_moon_names: 'attic' };
  assert.equal(M.covenCalendarState(same, coven), 'same');
  assert.deepEqual(M.readFollowed({ calendar_coven: 'not json' }), {});
});
