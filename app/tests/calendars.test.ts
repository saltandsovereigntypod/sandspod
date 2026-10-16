// The calendar registry and the settings that choose calendars (src/lib/calendars/index.ts).
process.env.TZ = 'UTC';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CALENDARS,
  calendarById,
  calendarChoices,
  calendarEventsBetween,
  calendarsForSettings,
  calendarSettingsKey,
  hemisphereOf,
  leadLine,
  mergeCalendarEvents,
  primaryCalendar,
  shownCalendars,
  todayLines,
  withShown,
} from '../src/lib/calendars/index.ts';
import { TRADITIONAL_CALENDARS } from '../src/lib/calendars/registry.ts';
import type { Holiday } from '../src/lib/holidays.ts';
import { buildToday } from '../src/lib/today.ts';
import { widgetDay } from '../src/lib/widgetTimeline.ts';

const today = new Date(2026, 9, 16, 12);
const someTraditional = TRADITIONAL_CALENDARS[0];

test('the registry: the moon first, every calendar once, each complete', () => {
  assert.equal(CALENDARS[0].id, 'moon');
  assert.equal(new Set(CALENDARS.map((c) => c.id)).size, CALENDARS.length);
  for (const def of CALENDARS) {
    assert.ok(def.name && def.about && def.sources.length, def.id);
    assert.ok(['historical', 'reconstructed', 'modern'].includes(def.confidence), def.id);
    for (const choice of def.choices ?? []) assert.ok(choice.options.some((o) => o.value === choice.default), `${def.id}.${choice.key}`);
  }
  assert.equal(calendarById('moon')?.id, 'moon');
  assert.equal(calendarById('nope'), undefined);
});

test('primaryCalendar reads calendar_count_by and defaults to standard', () => {
  assert.equal(primaryCalendar(null), 'standard');
  assert.equal(primaryCalendar({}), 'standard');
  assert.equal(primaryCalendar({ calendar_count_by: 'moon' }), 'moon');
  assert.equal(primaryCalendar({ calendar_count_by: 'roman' }), 'standard');
  // calendar_primary names the main holiday tradition and doesn't change the counting.
  assert.equal(primaryCalendar({ calendar_primary: 'moon' }), 'standard');
});

test('shownCalendars reads the calendar_extra list, ignoring unknown ids and the leading moon', () => {
  assert.deepEqual(shownCalendars(null), []);
  assert.deepEqual(shownCalendars({ calendar_extra: ' moon , nope,' }), ['moon']);
  assert.deepEqual(shownCalendars({ calendar_extra: 'moon', calendar_count_by: 'moon' }), []);
  if (someTraditional) {
    // Registry order, not saved order.
    assert.deepEqual(shownCalendars({ calendar_extra: `${someTraditional.id},moon` }), ['moon', someTraditional.id]);
  }
  assert.equal(withShown({ calendar_extra: 'moon' }, 'moon', false), '');
  assert.equal(withShown({ calendar_extra: '' }, 'moon', true), 'moon');
  assert.equal(withShown({ calendar_extra: 'moon' }, 'moon', true), 'moon');
});

test('calendarChoices: saved values, defaults, and nothing invalid', () => {
  assert.deepEqual(calendarChoices(null, 'moon'), { names: 'folk', yearStart: 'winter-solstice', blue: 'seasonal' });
  assert.deepEqual(calendarChoices({ calendar_opt_moon_names: 'numbered', calendar_opt_moon_blue: 'sometimes' }, 'moon'), {
    names: 'numbered',
    yearStart: 'winter-solstice',
    blue: 'seasonal',
  });
  assert.deepEqual(calendarChoices({}, 'nope'), {});
});

test('hemisphere: the choice, else the place, else the southern Wheel, else north', () => {
  assert.equal(hemisphereOf(null, null), 'north');
  assert.equal(hemisphereOf({}, { latitude: -33.9, longitude: 151.2 }), 'south');
  assert.equal(hemisphereOf({ calendar_hemisphere: 'north' }, { latitude: -33.9, longitude: 151.2 }), 'north');
  assert.equal(hemisphereOf({ calendar_traditions: 'wheel_south' }, null), 'south');
  assert.equal(hemisphereOf({ calendar_traditions: 'wheel_south,wheel' }, null), 'north');
});

test('todayLines: nothing by default; the moon leads when chosen; extras follow', () => {
  assert.deepEqual(todayLines(today, null, null), []);
  const lead = todayLines(today, { calendar_count_by: 'moon' }, null);
  assert.equal(lead.length, 1);
  assert.equal(lead[0].lead, true);
  assert.equal(lead[0].short, 'Hunter’s Moon · day 7');
  const numbered = todayLines(today, { calendar_count_by: 'moon', calendar_opt_moon_names: 'numbered' }, null);
  assert.equal(numbered[0].short, 'Moon 10 · day 7');
  const beside = todayLines(today, { calendar_extra: 'moon' }, null);
  assert.equal(beside[0].lead, false);
  if (someTraditional) {
    const both = todayLines(today, { calendar_count_by: 'moon', calendar_extra: someTraditional.id }, null);
    assert.deepEqual(both.map((l) => [l.id, l.lead]), [['moon', true], [someTraditional.id, false]]);
  }
  assert.equal(leadLine(today, { calendar_count_by: 'moon' }, null), 'Hunter’s Moon · day 7');
  assert.equal(leadLine(today, {}, null), '');
});

test('calendarsForSettings puts calendars of my path first', () => {
  const all = calendarsForSettings({}, []);
  assert.equal(all[0].id, 'moon');
  assert.ok(!calendarsForSettings({ calendar_count_by: 'moon' }, []).some((c) => c.id === 'moon'));
  const withPath = TRADITIONAL_CALENDARS.find((c) => c.path);
  if (withPath?.path) assert.equal(calendarsForSettings({}, [withPath.path])[0].id, withPath.id);
});

test('calendar observances merge in among the holidays', () => {
  const events = calendarEventsBetween(new Date(2026, 9, 1), new Date(2026, 9, 31), { calendar_count_by: 'moon' }, null);
  assert.deepEqual(events.map((e) => e.id), ['moon-new-2026-10-10', 'moon-full-2026-10-26']);
  const samhain: Holiday = {
    id: 'wheel-samhain-2026-9-31',
    name: 'Samhain',
    meaning: '',
    date: new Date(2026, 9, 31),
    days: 1,
    traditions: ['Wheel of the Year'],
    traditionIds: ['wheel'],
    recurs: 'yearly',
  };
  const merged = mergeCalendarEvents([samhain], events);
  assert.deepEqual(merged.map((h) => h.name), ['Hunter’s Moon begins', 'Hunter’s Moon · full moon', 'Samhain']);
  assert.deepEqual(merged[0].traditionIds, ['calendar:moon']);
  // A same-named observance on the same day joins the holiday rather than repeating it.
  const twice = mergeCalendarEvents([samhain], [{ calendar: 'moon', id: 'x', name: 'Samhain eve', meaning: '', date: new Date(2026, 9, 31), days: 1 }]);
  assert.equal(twice.length, 1);
  assert.deepEqual(twice[0].traditionIds, ['wheel', 'calendar:moon']);
});

test('Today shows a calendar observance running today, but the horizon skips the moon’s own', () => {
  const events = calendarEventsBetween(new Date(2026, 9, 10), new Date(2026, 11, 10), { calendar_count_by: 'moon' }, null);
  const model = buildToday(new Date(2026, 9, 10, 12), { traditions: ['wheel'], custom: [] }, 'wheel', events);
  assert.deepEqual(model.holidaysToday.map((h) => h.name), ['Hunter’s Moon begins']);
  assert.equal(model.holidayTerms[0], 'The moon');
  assert.equal(model.horizon.find((h) => h.kind === 'holiday')?.title, 'Samhain');
});

test('the widgets carry the lead line when counting by the moon', () => {
  const settings = { calendar_count_by: 'moon' };
  const props = widgetDay(new Date(2026, 9, 16, 8), { traditions: ['wheel'], custom: [] }, [], [], { lead: (day) => leadLine(day, settings, null) });
  assert.equal(props.calendarLine, 'Hunter’s Moon · day 7');
  assert.equal(widgetDay(new Date(2026, 9, 16, 8), { traditions: ['wheel'], custom: [] }, []).calendarLine, '');
});

test('calendarSettingsKey changes with any calendar setting only', () => {
  const a = calendarSettingsKey({ calendar_count_by: 'moon', preferred_name: 'A' });
  assert.equal(a, calendarSettingsKey({ calendar_count_by: 'moon', preferred_name: 'B' }));
  assert.notEqual(a, calendarSettingsKey({ calendar_count_by: 'moon', calendar_opt_moon_names: 'numbered' }));
});
