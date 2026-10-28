import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CovenTodayInput } from '../src/lib/covens/today.ts';
import type { RitualPlan } from '../src/lib/rituals/types.ts';
import type { Tendable } from '../src/lib/tend/model.ts';
import { comingUp, covenHolidaysAhead, moonObservance, tendOn } from '../src/lib/widgetMore.ts';
import { widgetDay, widgetTimeline } from '../src/lib/widgetTimeline.ts';

const wheel = { traditions: ['wheel'], custom: [] };
const now = new Date(2026, 9, 28, 12, 0);
const at = (d: number, h: number, m = 9) => new Date(2026, m, d, h, 0).toISOString();
const plan = (date: string, title: string): RitualPlan =>
  ({ id: title, date, time: '21:00', title, intention: null, intentionKey: null, templateId: null, draft: null, ingredients: [], createdAt: '' }) as RitualPlan;

type Coven = CovenTodayInput['covens'][number];
const coven = (extra: Partial<Coven> = {}): Coven => ({ id: 'c1', slug: 'moon-circle', name: 'Moon Circle', ...extra }) as Coven;
const input = (rituals: CovenTodayInput['rituals'], rsvps: CovenTodayInput['rsvps'] = [], covens: Coven[] = [coven()]): CovenTodayInput => ({
  userId: 'u1',
  covens,
  memberships: [{ coven_id: 'c1', user_id: 'u1', rank_id: null, status: 'active' }],
  programCovens: [],
  rituals,
  steps: [],
  rsvps,
  programs: [],
  stages: [],
  tasks: [],
  enrollments: [],
  progress: [],
  mentors: [],
});
const rite = (id: string, when: string, extra: Partial<CovenTodayInput['rituals'][number]> = {}) => ({ id, coven_id: 'c1', title: id, status: 'scheduled', scheduled_for: when, current_step_id: null, ...extra });

const tendable = (kind: Tendable['kind'], title: string, dueAt: number | null, extra: Partial<Tendable> = {}): Tendable => ({
  key: `${kind}:${title}`,
  kind,
  group: kind === 'action' ? 'coven' : 'altar',
  title,
  detail: '',
  source: '',
  dueAt,
  tendedAt: null,
  actions: ['open'],
  ends: [],
  private: false,
  keywords: [],
  href: '/today',
  webHref: '/',
  ref: {},
  ...extra,
});

test('without covens or the list, the widgets show what they always have', () => {
  const props = widgetDay(now, wheel, [plan('2026-10-30', 'Ancestor supper')]);
  assert.equal(props.ritualTitle, 'Ancestor supper');
  assert.equal(props.ritualKind, 'plan');
  assert.equal(props.ritualUrl, 'saltandsovereignty://rituals/plan/Ancestor supper');
  assert.ok(props.comingUp?.every((c) => c.kind === 'holiday'));
  assert.equal(props.comingUp?.[0].name, 'Samhain');
  assert.equal(props.observance, '');
  assert.equal(props.card, '');
  assert.equal(widgetDay(now, wheel, []).ritualUrl, 'saltandsovereignty://rituals/planner');
});

test("a coven's rite that comes first is the next ritual, and opens the rite", () => {
  const more = { coven: input([rite('Moon Circle rite', at(29, 20))], [{ ritual_id: 'Moon Circle rite', user_id: 'u1', response: 'going' }]) };
  const props = widgetDay(now, wheel, [plan('2026-10-30', 'Ancestor supper')], [], {}, more);
  assert.equal(props.ritualKind, 'rite');
  assert.equal(props.ritualTitle, 'Moon Circle rite');
  assert.equal(props.ritualWhen, 'Tomorrow · 8:00 pm');
  assert.equal(props.ritualFrom, 'Moon Circle · You’re going');
  assert.equal(props.ritualUrl, 'saltandsovereignty://coven/c/moon-circle/ritual/Moon%20Circle%20rite');
  assert.match(props.ritualMoon, / in [A-Z]/);
  assert.deepEqual(props.ritualNeeds, []);
});

test("your own plan when it's sooner, and rites you'll miss are passed over", () => {
  const sooner = widgetDay(now, wheel, [plan('2026-10-28', 'Tonight’s candle')], [], {}, { coven: input([rite('Later rite', at(30, 20))]) });
  assert.equal(sooner.ritualKind, 'plan');
  const missed = widgetDay(now, wheel, [], [], {}, {
    coven: input([rite('Skip', at(29, 18)), rite('Planning', at(31, 19), { kind: 'meeting' })], [{ ritual_id: 'Skip', user_id: 'u1', response: 'not_going' }]),
  });
  assert.equal(missed.ritualTitle, 'Planning');
  assert.equal(missed.ritualKind, 'meeting');
  assert.equal(missed.ritualFrom, 'Moon Circle meeting · Will you come?');
});

test("your covens' holidays join yours, once each, saying who keeps them", () => {
  const covens = [coven({ practice_traditions: ['wheel'], practice_custom: [{ id: 'f', name: 'Founding Day', month: 10, day: 3, meaning: 'The night the circle first met.' }] })];
  const more = { coven: input([], [], covens) };
  const props = widgetDay(now, wheel, [], [], {}, more);
  const samhain = props.holidays.filter((h) => h.name === 'Samhain');
  assert.equal(samhain.length, 1);
  assert.equal(samhain[0].from, undefined);
  const founding = props.holidays.find((h) => h.name === 'Founding Day');
  assert.equal(founding?.from, 'Moon Circle');
  assert.equal(founding?.date, 'Tue, Nov 3');
  // With nothing of your own ahead, the coven's is the next holiday.
  const none = widgetDay(now, { traditions: [], custom: [] }, [], [], {}, more);
  assert.equal(none.nextHoliday?.name, 'Samhain');
  assert.equal(none.nextHoliday?.from, 'Moon Circle');
  assert.equal(covenHolidaysAhead(null, now, 30).length, 0);
});

test('Coming Up: what wants tending, rites, meeting actions and holidays, soonest first', () => {
  const day = new Date(2026, 9, 28);
  const tend = {
    items: [
      tendable('plant', 'Basil', day.getTime() + 3_600_000),
      tendable('action', 'Bring the candles', new Date(2026, 9, 29).getTime()), // due the 30th
      tendable('action', 'Far off', new Date(2026, 10, 20).getTime()),
      tendable('petition', 'For the house', null),
    ],
    records: [],
  };
  const list = comingUp(day, [{ name: 'Samhain', date: new Date(2026, 9, 31) }], { tend, coven: input([rite('Moon rite', at(29, 20))]), now: day });
  assert.deepEqual(
    list.map((c) => [c.kind, c.name, c.when]),
    [
      ['tend', 'Basil', 'today'],
      ['rite', 'Moon rite', 'tomorrow'],
      ['action', 'Bring the candles', 'Friday'],
      ['holiday', 'Samhain', 'Saturday'],
    ],
  );
  assert.equal(list[0].detail, 'Would like water');
  assert.equal(list[0].symbol, 'drop');
  assert.equal(list[1].detail, 'Moon Circle · Will you come?');
});

test('many things to tend are one line; a burning candle shows until it burns down', () => {
  const day = new Date(2026, 9, 28);
  const lit = { actions: ['snuff', 'word', 'open'] as Tendable['actions'] };
  const tend = {
    items: [
      tendable('plant', 'Basil', day.getTime()),
      tendable('plant', 'Rosemary', day.getTime()),
      tendable('offering', 'Bread', day.getTime()),
      tendable('candle', 'Hearth candle', new Date(2026, 9, 30, 21).getTime(), lit),
    ],
    records: [],
  };
  const list = comingUp(day, [], { tend, now: day });
  assert.equal(list.length, 1);
  assert.equal(list[0].name, '4 things want tending');
  assert.equal(list[0].detail, '2 plants, 1 offering and 1 candle');
  assert.equal(tendOn(tend, new Date(2026, 9, 30)).altar.some((i) => i.kind === 'candle'), true);
  assert.equal(tendOn(tend, new Date(2026, 9, 31)).altar.some((i) => i.kind === 'candle'), false);
});

test('the moon days your path keeps', () => {
  assert.deepEqual(moonObservance(now, null), { observance: '', observanceMeaning: '' });
  assert.equal(moonObservance(now, { calendar_traditions: 'wheel' }).observance, '');
  const hellenic = moonObservance(now, { calendar_traditions: 'wheel,hellenic_monthly' });
  assert.match(hellenic.observance, /^(Noumenia|Agathos Daimon|Hekate’s Deipnon) /);
  assert.ok(hellenic.observanceMeaning.length > 0);
  const patron = moonObservance(now, { calendar_traditions: 'wheel', my_deities: JSON.stringify([{ key: 'hekate', name: 'Hekate', level: 'patron', since: '' }]) });
  assert.match(patron.observance, /^Hekate’s Deipnon (tonight|tomorrow|[A-Z][a-z]+day|in \d+ days)$/);
  const off = moonObservance(now, { calendar_traditions: 'wheel', deipnon_prompt: false, my_deities: JSON.stringify([{ key: 'hekate', name: 'Hekate', level: 'patron', since: '' }]) });
  assert.equal(off.observance, '');
});

test("today's card is on today's entry only", () => {
  const timeline = widgetTimeline(now, wheel, [], [], 3, {}, { card: { name: 'The Star', reversed: true } });
  assert.equal(timeline[0].props.card, 'The Star, reversed');
  assert.equal(timeline[1].props.card, '');
});
