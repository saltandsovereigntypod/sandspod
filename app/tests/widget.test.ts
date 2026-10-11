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
