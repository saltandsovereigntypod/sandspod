import assert from 'node:assert/strict';
import { test } from 'node:test';

import { nextPhase } from '../src/lib/moon.ts';
import { buildSchedule, DEFAULT_SETTINGS, MAX_REMINDERS, normalizeSettings, type ReminderSettings } from '../src/lib/reminders/schedule.ts';
import type { RitualPlan } from '../src/lib/rituals/types.ts';

const settings = (change: Partial<ReminderSettings>): ReminderSettings => normalizeSettings({ ...DEFAULT_SETTINGS, ...change });
const onlyFull = { new: false, firstQuarter: false, full: true, lastQuarter: false };

const plan = (id: string, date: string, time: string): RitualPlan => ({
  id,
  date,
  time,
  title: `Plan ${id}`,
  intention: null,
  intentionKey: null,
  templateId: null,
  draft: null,
  ingredients: [],
  createdAt: '',
});

test('stored settings are cleaned up and defaulted', () => {
  assert.deepEqual(normalizeSettings(null), DEFAULT_SETTINGS);
  const odd = normalizeSettings({ phases: { full: true, new: 'yes' }, phaseHour: 99, ritualLeadMinutes: -5, rituals: false });
  assert.equal(odd.phases.full, true);
  assert.equal(odd.phases.new, false);
  assert.equal(odd.phaseHour, DEFAULT_SETTINGS.phaseHour);
  assert.equal(odd.ritualLeadMinutes, DEFAULT_SETTINGS.ritualLeadMinutes);
  assert.equal(odd.rituals, false);
});

test('a full moon reminder lands at the chosen hour on the day of the full moon', () => {
  const now = new Date(2026, 8, 20, 12);
  const full = nextPhase(now, 'full');
  const [first] = buildSchedule(settings({ phases: onlyFull, phaseHour: 19, rituals: false }), [], now);
  assert.equal(first.kind, 'moon');
  assert.equal(first.at.getFullYear(), full.getFullYear());
  assert.equal(first.at.getMonth(), full.getMonth());
  assert.equal(first.at.getDate(), full.getDate());
  assert.equal(first.at.getHours(), 19);
  assert.equal(first.at.getMinutes(), 0);
  assert.match(first.title, /^Full Moon in \w+ (tonight|today)$/);
  assert.match(first.body, /^Exact at \d{1,2}:\d{2} (am|pm)\./);
});

test('the evening before is added when asked for', () => {
  const now = new Date(2026, 8, 20, 12);
  const list = buildSchedule(settings({ phases: onlyFull, dayBefore: true, rituals: false }), [], now);
  const [eve, day] = list;
  assert.equal(eve.key.startsWith('moon-eve:'), true);
  assert.match(eve.title, /tomorrow$/);
  // One calendar day apart at the same hour (not always 24h: clocks change).
  const nextDay = new Date(eve.at.getFullYear(), eve.at.getMonth(), eve.at.getDate() + 1, eve.at.getHours());
  assert.equal(day.at.getTime(), nextDay.getTime());
});

test('only chosen phases, only in the future, only inside the horizon', () => {
  const now = new Date(2026, 8, 20, 12);
  const list = buildSchedule(settings({ phases: { ...onlyFull, new: true }, rituals: false }), [], now, 60);
  assert.ok(list.length >= 3 && list.length <= 5, `${list.length} new and full moons in 60 days`);
  assert.ok(list.every((r) => r.at > now && r.at.getTime() <= now.getTime() + 60 * 86_400_000));
  assert.ok(list.every((r) => /^(New|Full) Moon/.test(r.title)));
  const keys = new Set(list.map((r) => r.key));
  assert.equal(keys.size, list.length, 'keys are unique');
  assert.equal(buildSchedule(settings({ rituals: false }), [], now).length, 0, 'nothing chosen, nothing scheduled');
});

test('planned rituals are reminded the chosen time before they begin', () => {
  const now = new Date(2026, 8, 25, 12);
  const plans = [plan('a', '2026-09-25', '21:00'), plan('b', '2026-09-24', '21:00'), plan('c', '2026-09-25', '12:30')];
  const list = buildSchedule(settings({ ritualLeadMinutes: 60 }), plans, now);
  assert.deepEqual(list.map((r) => r.key), ['ritual:a:2026-09-25:21:00'], 'past plans and passed reminders are dropped');
  assert.equal(list[0].at.getHours(), 20);
  assert.equal(list[0].url, '/rituals/plan/a');
  assert.match(list[0].body, /in an hour, at 9:00 pm/);
  assert.equal(buildSchedule(settings({ rituals: false }), plans, now).length, 0);
});

test('never more than iOS allows', () => {
  const now = new Date(2026, 0, 1);
  const every = settings({ phases: { new: true, firstQuarter: true, full: true, lastQuarter: true }, dayBefore: true });
  const plans = Array.from({ length: 70 }, (_, i) => plan(String(i), `2026-01-${String((i % 28) + 2).padStart(2, '0')}`, '21:00'));
  const list = buildSchedule(every, plans, now);
  assert.equal(list.length, MAX_REMINDERS);
  for (let i = 1; i < list.length; i += 1) assert.ok(list[i].at >= list[i - 1].at);
});

test('a plan that has begun gets no reminder', () => {
  const now = new Date(2026, 8, 25, 12);
  const done = { ...plan('d', '2026-09-25', '21:00'), doneAt: now.toISOString() };
  assert.equal(buildSchedule(settings({}), [done], now).length, 0);
});

test('custom moon reminders: a set minute, earlier heads-ups, the exact moment and your own note', () => {
  const now = new Date(2026, 8, 20, 12);
  // The full moon after next, so even the week-before reminder is still to come.
  const full = nextPhase(new Date(nextPhase(now, 'full').getTime() + 86_400_000), 'full');
  const list = buildSchedule(
    settings({
      phases: onlyFull,
      phaseHour: 20,
      phaseMinute: 30,
      daysAhead: [7, 3],
      atExact: true,
      notes: { new: '', firstQuarter: '', full: 'Charge the crystals', lastQuarter: '' },
      rituals: false,
    }),
    [],
    now,
  ).filter((r) => r.key.endsWith(full.toISOString().slice(0, 10)));
  const byKind = Object.fromEntries(list.map((r) => [r.key.split(':')[0], r]));
  assert.deepEqual(Object.keys(byKind).sort(), ['moon', 'moon-ahead3', 'moon-ahead7', 'moon-exact']);
  assert.equal(byKind.moon.at.getHours(), 20);
  assert.equal(byKind.moon.at.getMinutes(), 30);
  assert.match(byKind.moon.body, /Charge the crystals$/);
  assert.match(byKind['moon-ahead7'].title, /in a week$/);
  const weekBefore = new Date(full.getFullYear(), full.getMonth(), full.getDate() - 7, 20, 30);
  assert.equal(byKind['moon-ahead7'].at.getTime(), weekBefore.getTime());
  assert.equal(byKind['moon-exact'].at.getTime(), full.getTime());
  assert.equal(byKind['moon-exact'].body, 'Charge the crystals');
});

test('odd custom settings are cleaned up', () => {
  const odd = normalizeSettings({ phaseMinute: 7, daysAhead: [3, 5, '7'], notes: { full: 'x'.repeat(500), new: 4 } });
  assert.equal(odd.phaseMinute, 0);
  assert.deepEqual(odd.daysAhead, [3, 7]);
  assert.equal(odd.notes.full.length, 120);
  assert.equal(odd.notes.new, '');
});
