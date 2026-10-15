import assert from 'node:assert/strict';
import { test } from 'node:test';

import { nextPhase } from '../src/lib/moon.ts';
import type { RitualPlan } from '../src/lib/rituals/types.ts';
import { widgetDay, widgetTimeline } from '../src/lib/widgetTimeline.ts';

const wheel = { traditions: ['wheel'], custom: [] };
const plan = (date: string, title: string): RitualPlan =>
  ({ id: title, date, time: '21:00', title, intention: null, intentionKey: null, templateId: null, draft: null, ingredients: [], createdAt: '' }) as RitualPlan;

test('a full moon day shows the full moon and points to the next phase', () => {
  const full = nextPhase(new Date(2026, 9, 1), 'full'); // 26 October 2026
  const day = new Date(full.getFullYear(), full.getMonth(), full.getDate(), 8);
  const props = widgetDay(day, wheel, []);
  assert.equal(props.phase, 'Full Moon');
  assert.equal(props.symbol, 'moonphase.full.moon');
  assert.ok(props.percent >= 98);
  assert.match(props.next, /^Last Quarter /);
  assert.match(props.holiday, /^Samhain (in \d+ days|Saturday|Sunday|Friday|Thursday|Wednesday)$/);
  assert.equal(props.holidayToday, false);
  assert.equal(props.ritual, '');
});

test('a holiday on its day, and the next ritual from that day on', () => {
  const samhain = new Date(2026, 9, 31, 9);
  const props = widgetDay(samhain, wheel, [plan('2026-10-30', 'Too early'), plan('2026-11-01', 'Ancestor supper')]);
  assert.equal(props.holiday, 'Samhain');
  assert.equal(props.holidayToday, true);
  assert.match(props.ritual, /^Ancestor supper · Tomorrow · 9:00 pm$/i);
});

test('a month of days, one per midnight after now', () => {
  const now = new Date(2026, 9, 11, 15, 30);
  const timeline = widgetTimeline(now, wheel, []);
  assert.equal(timeline.length, 30);
  assert.equal(timeline[0].date, now);
  assert.equal(timeline[1].date.getTime(), new Date(2026, 9, 12).getTime());
  assert.equal(timeline[29].date.getDate(), 9);
  assert.ok(timeline.every((t) => t.props.symbol.startsWith('moonphase.')));
});

test('coming moon phases and holidays, soonest first', () => {
  const day = new Date(2026, 9, 15, 10);
  const props = widgetDay(day, wheel, []);
  assert.equal(props.phases.length, 5);
  assert.ok(props.phases.every((p) => p.symbol.startsWith('moonphase.')));
  assert.ok(props.phases.some((p) => /^Full Moon in [A-Z]/.test(p.name)));
  assert.equal(props.holidays[0].name, 'Samhain');
  assert.equal(props.holidays[0].days, 16);
  assert.equal(props.holidays[0].date, 'Sat, Oct 31');
  assert.equal(props.nextHoliday?.name, 'Samhain');
  assert.ok(props.holidayMeaning.length > 0);
});

test('the next ritual with its intention and what to gather', () => {
  const day = new Date(2026, 9, 30, 9);
  const supper = {
    ...plan('2026-10-31', 'Ancestor supper'),
    intention: 'Honour my grandmother',
    ingredients: [
      { ref: 'a', name: 'Black candle', type: 'candle' },
      { ref: 'b', name: 'Rosemary', type: 'herb' },
      { ref: 'c', name: 'Rosemary', type: 'herb' },
    ],
  };
  const props = widgetDay(day, wheel, [supper]);
  assert.equal(props.ritualId, 'Ancestor supper');
  assert.equal(props.ritualTitle, 'Ancestor supper');
  assert.equal(props.ritualWhen, 'Tomorrow · 9:00 pm');
  assert.equal(props.ritualIntention, 'Honour my grandmother');
  assert.deepEqual(props.ritualNeeds, ['Black candle', 'Rosemary']);
  assert.match(props.ritualMoon, / in [A-Z]/);
});

test('a ritual from a template borrows its ingredients and preparation', () => {
  const day = new Date(2026, 9, 30, 9);
  const fromTemplate = { ...plan('2026-11-02', 'Warding'), templateId: 't1' };
  const template = { id: 't1', title: 'Warding', intention: 'Protect the house', preparation: 'Sweep the threshold.', metadata: {} } as never;
  const props = widgetDay(day, wheel, [fromTemplate], [template]);
  assert.equal(props.ritualIntention, 'Protect the house');
  assert.deepEqual(props.ritualNeeds, []);
  assert.equal(props.ritualPrep, 'Sweep the threshold.');
  assert.equal(widgetDay(day, wheel, []).ritualId, '');
});
