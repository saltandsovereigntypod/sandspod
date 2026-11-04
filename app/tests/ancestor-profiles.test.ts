// Ancestor profiles: foods, stories, a photo and the other days kept for
// them, which come round with their birthdays and death days, and their
// reminders (off unless turned on in Reminders → Your ancestors' days).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ancestorNotes, keptDaysText, normalizeAncestor, parseKeptDays, upcomingAnniversaries, type AncestorEntry } from '../src/lib/craft/hedge/ancestors.ts';
import { calendarReminders } from '../src/lib/reminders/plan.ts';
import { DEFAULT_PREFS, normalizePrefs, summaries, withChange } from '../src/lib/reminders/prefs.ts';
import { DEFAULT_SETTINGS } from '../src/lib/reminders/schedule.ts';

test('kept days are read from plain lines, and what cannot be read is said', () => {
  const { days, unread } = parseKeptDays('24 June Name day\n12/9 Wedding day\nMay 3rd, Her saint’s day\n31/2 Nonsense\nsoon');
  assert.deepEqual(days, [
    { month: 6, day: 24, name: 'Name day' },
    { month: 9, day: 12, name: 'Wedding day' },
    { month: 5, day: 3, name: 'Her saint’s day' },
  ]);
  assert.deepEqual(unread, ['31/2 Nonsense', 'soon']);
  assert.equal(keptDaysText(days), '24 June Name day\n12 September Wedding day\n3 May Her saint’s day');
  assert.deepEqual(parseKeptDays(keptDaysText(days)).days, days, 'round trip');
});

test('older saved people read with the new fields blank', () => {
  const a = normalizeAncestor({ name: 'Nan', days: [{ month: 13, day: 1, name: 'x' }, { month: 6, day: 24, name: ' Name day ' }] });
  assert.equal(a.foods, '');
  assert.equal(a.stories, '');
  assert.equal(a.photo, '');
  assert.deepEqual(a.days, [{ month: 6, day: 24, name: 'Name day' }]);
});

const nan: AncestorEntry = {
  id: 'nan',
  createdAt: '2026-01-01T00:00:00.000Z',
  data: { ...normalizeAncestor({ name: 'Nan' }), born: { year: 1932, month: 11, day: 10 }, days: [{ month: 11, day: 6, name: 'Name day' }] },
};

test('kept days come round with the birthday', () => {
  const coming = upcomingAnniversaries([nan], new Date(2026, 10, 4), 10);
  assert.deepEqual(coming.map((a) => [a.kind, a.label ?? null, a.inDays]), [['kept', 'Name day', 2], ['birth', null, 6]]);
});

test('their days become reminders only when turned on', () => {
  const now = new Date(2026, 10, 4, 12);
  const input = { appSettings: null, legacy: DEFAULT_SETTINGS, ancestors: [nan], now, horizonDays: 14 };
  assert.equal(calendarReminders({ ...input, prefs: DEFAULT_PREFS }).filter((r) => r.key.startsWith('ancestor:')).length, 0);
  const prefs = withChange(withChange(DEFAULT_PREFS, 'ancestors.on', true), 'ancestors.leads', [0, 1]);
  const list = calendarReminders({ ...input, prefs }).filter((r) => r.key.startsWith('ancestor:'));
  assert.deepEqual(list.map((r) => r.title), ['Nan: Name day tomorrow', 'Nan: Name day today', 'Nan’s birthday tomorrow', 'Nan’s birthday today']);
  assert.equal(list[0].at.getHours(), 9);
  assert.equal(list[0].url, '/rituals/craft/hedge/ancestors/nan');
  assert.equal(summaries(prefs, null, now).ancestors, 'On the day and the day before at 9:00 am');
  assert.deepEqual(normalizePrefs(JSON.parse(JSON.stringify(prefs))).ancestors, prefs.ancestors);
  assert.equal(ancestorNotes([nan], now, { at: 600, leads: [] }, 3)[0].at.getHours(), 10);
});
