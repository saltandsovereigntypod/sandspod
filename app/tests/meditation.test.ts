import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fromTimer, kindLabel, newSit, normalizeSit, sitPage, type SitEntry } from '../src/lib/meditation/log.ts';
import { minutesWords, mostSettled, sitStats, timeOfDay } from '../src/lib/meditation/patterns.ts';
import { bellsDue, bellsOf, breathAt, BREATHS, cleanPlan, clockLabel, elapsedOf, endBellAt, pauseClock, planParams, resumeClock, sitState, sitStateAt, startClock, type SitPlan } from '../src/lib/meditation/timer.ts';
import { sitTogetherOf, sitTogetherStart, startIn } from '../src/lib/meditation/together.ts';
import { meditationDone, newOwnRecord, normalizeRecord } from '../src/lib/tend/model.ts';

const MIN = 60_000;
const plan = (p: Partial<SitPlan>): SitPlan => cleanPlan({ ...p });

test('a plan is cleaned, and survives being passed as strings', () => {
  assert.deepEqual(cleanPlan({}), { minutes: 10, settle: 0, warm: 0, startBell: true, endBell: true, every: 0, signal: 'bell' });
  const p = plan({ minutes: null, settle: 2, warm: 1, every: 5, signal: 'vibrate', startBell: false });
  assert.deepEqual(cleanPlan(planParams(p)), p);
  assert.equal(cleanPlan({ minutes: -4 }).minutes, 10);
  assert.equal(cleanPlan({ minutes: 'open' }).minutes, null);
});

test('settling in, the sit and coming back follow one another', () => {
  const p = plan({ minutes: 10, settle: 2, warm: 3 });
  assert.equal(sitStateAt(p, 0).phase, 'settle');
  assert.equal(sitStateAt(p, 1 * MIN).phaseLeftMs, 1 * MIN);
  assert.equal(sitStateAt(p, 1 * MIN).leftMs, 14 * MIN);
  const sit = sitStateAt(p, 5 * MIN);
  assert.equal(sit.phase, 'sit');
  assert.equal(sit.sitMs, 3 * MIN);
  assert.equal(sit.phaseLeftMs, 7 * MIN);
  const warm = sitStateAt(p, 13 * MIN);
  assert.equal(warm.phase, 'warm');
  assert.equal(warm.sitMs, 10 * MIN);
  assert.equal(warm.phaseLeftMs, 2 * MIN);
  assert.equal(sitStateAt(p, 15 * MIN).phase, 'done');
});

test('an open-ended sit goes on until it is ended, then comes back', () => {
  const p = plan({ minutes: null, settle: 1, warm: 2 });
  const s = sitStateAt(p, 90 * MIN);
  assert.equal(s.phase, 'sit');
  assert.equal(s.leftMs, null);
  assert.equal(s.sitMs, 89 * MIN);
  const ended = sitStateAt(p, 31 * MIN + 1, 31 * MIN);
  assert.equal(ended.phase, 'warm');
  assert.equal(ended.sitMs, 30 * MIN);
  assert.equal(sitStateAt(p, 34 * MIN, 31 * MIN).phase, 'done');
});

test('bells: start after settling, at each interval, three to end', () => {
  const bells = bellsOf(plan({ minutes: 20, settle: 2, every: 5 }));
  assert.deepEqual(
    bells.map((b) => [b.kind, b.atMs / MIN, b.times]),
    [
      ['start', 2, 1],
      ['interval', 7, 1],
      ['interval', 12, 1],
      ['interval', 17, 1],
      ['end', 22, 3],
    ],
  );
  // No interval on the end bell's own moment.
  assert.equal(bellsOf(plan({ minutes: 10, every: 5 })).filter((b) => b.kind === 'interval').length, 1);
  assert.deepEqual(bellsOf(plan({ minutes: 10, startBell: false, endBell: false })), []);
  // Open-ended: intervals go on, the end bell rings when it's ended.
  const open = bellsOf(plan({ minutes: null, every: 10 }));
  assert.ok(open.length > 20);
  assert.ok(!open.some((b) => b.kind === 'end'));
});

test('coming back from the background rings only a fresh bell, never a backlog', () => {
  const bells = bellsOf(plan({ minutes: 20, every: 5 }));
  assert.deepEqual(bellsDue(bells, 4.9 * MIN, 5 * MIN + 500).map((b) => b.kind), ['interval']);
  // Away for 12 minutes: the bells at 5 and 10 passed long ago.
  assert.deepEqual(bellsDue(bells, 1 * MIN, 13 * MIN), []);
  // Away, and back just as the 15-minute bell rings: that one only.
  assert.deepEqual(bellsDue(bells, 1 * MIN, 15 * MIN + 1000).map((b) => b.atMs / MIN), [15]);
  assert.deepEqual(bellsDue(bells, 0, 0).length, 0);
  assert.deepEqual(bellsDue(bells, -1, 0).map((b) => b.kind), ['start']);
});

test('the clock is read from when it began, with pauses left out', () => {
  const t0 = Date.UTC(2026, 10, 3, 7, 0);
  let c = startClock(t0);
  assert.equal(elapsedOf(c, t0 + 4 * MIN), 4 * MIN);
  c = pauseClock(c, t0 + 4 * MIN);
  assert.equal(elapsedOf(c, t0 + 9 * MIN), 4 * MIN);
  c = resumeClock(c, t0 + 9 * MIN);
  assert.equal(elapsedOf(c, t0 + 10 * MIN), 5 * MIN);
  const p = plan({ minutes: 10, settle: 1 });
  assert.equal(sitState(p, c, t0 + 10 * MIN).sitMs, 4 * MIN);
  // The end bell's moment, for a notification while away: moved on by the pause.
  assert.equal(endBellAt(p, c, t0 + 10 * MIN), t0 + 16 * MIN);
  assert.equal(endBellAt(p, pauseClock(c, t0 + 11 * MIN), t0 + 11 * MIN), null);
  assert.equal(endBellAt(plan({ minutes: null }), c, t0), null);
  assert.equal(endBellAt(p, c, t0 + 20 * MIN), null);
});

test('clock labels and breath pacing', () => {
  assert.equal(clockLabel(65_000), '1:05');
  assert.equal(clockLabel(3_725_000), '1:02:05');
  assert.equal(clockLabel(-5), '0:00');
  const box = BREATHS[0].pattern;
  assert.deepEqual(breathAt(box, 2000), { stage: 'in', scale: 0.5, left: 2, cycle: 0 });
  assert.equal(breathAt(box, 5000).stage, 'hold');
  assert.equal(breathAt(box, 5000).scale, 1);
  assert.equal(breathAt(box, 10_000).scale, 0.5);
  assert.equal(breathAt(box, 13_000).stage, 'rest');
  assert.equal(breathAt(box, 17_000).cycle, 1);
  const f478 = BREATHS[1].pattern;
  assert.equal(breathAt(f478, 11_000 + 7_999).stage, 'out');
  assert.equal(breathAt(f478, 19_000).stage, 'in');
});

let id = 0;
const sit = (at: string, minutes: number, extra: Record<string, unknown> = {}): SitEntry => ({ id: `s${++id}`, data: newSit({ at, minutes, kind: 'breath', ...extra }) });

test('a sit is kept clean, with its moon noted', () => {
  const s = normalizeSit({ at: '2026-11-03T07:30:00Z', minutes: '20', kind: 'candle', settled: 9, tags: ['images', 'nonsense', 'images'] });
  assert.equal(s.minutes, 20);
  assert.equal(s.settled, null);
  assert.deepEqual(s.tags, ['images']);
  assert.ok(s.moonPhase);
  assert.equal(kindLabel({ kind: 'other', other: 'Chanting' }), 'Chanting');
  const t0 = Date.UTC(2026, 10, 3, 7, 0);
  assert.deepEqual(fromTimer(t0, 19.6 * MIN, plan({ settle: 2 })), { at: new Date(t0 + 2 * MIN).toISOString(), minutes: 20 });
  const page = sitPage('abc', newSit({ at: '2026-11-03T07:30:00Z', minutes: 15, kind: 'body', cameUp: 'A <door>', settled: 4 }));
  assert.equal(page.ref, 'meditation-sit:abc');
  assert.ok(page.blocks.some((b) => b.content === 'A &lt;door&gt;'));
});

test('streaks and minutes this week, month and year', () => {
  const now = new Date(2026, 10, 4, 21, 0); // Wednesday 4 Nov
  const list = [
    sit(new Date(2026, 10, 4, 7).toISOString(), 20),
    sit(new Date(2026, 10, 3, 7).toISOString(), 10),
    sit(new Date(2026, 10, 2, 7).toISOString(), 15, { kind: 'candle' }),
    sit(new Date(2026, 10, 1, 7).toISOString(), 5), // Sunday: last week
    sit(new Date(2026, 9, 20, 7).toISOString(), 30),
    sit(new Date(2025, 11, 31, 7).toISOString(), 60),
  ];
  const s = sitStats(list, now);
  assert.equal(s.streak.current, 4);
  assert.equal(s.minutes.week, 45);
  assert.equal(s.minutes.month, 50);
  assert.equal(s.minutes.year, 80);
  assert.equal(s.minutes.all, 140);
  assert.equal(s.kinds[0].label, 'Breath');
  assert.equal(s.kinds[0].sits, 5);
  assert.equal(minutesWords(125), '2 hours 5 minutes');
});

test('correlations need enough sits, and a real difference', () => {
  const now = new Date(2026, 10, 30, 22);
  const list: SitEntry[] = [];
  for (let d = 1; d <= 4; d++) list.push(sit(new Date(2026, 10, d, 7).toISOString(), 10, { settled: 5 }));
  for (let d = 5; d <= 8; d++) list.push(sit(new Date(2026, 10, d, 22).toISOString(), 10, { settled: 2 }));
  const s = sitStats(list, now);
  assert.equal(timeOfDay(new Date(2026, 10, 1, 2)), 'night');
  assert.equal(mostSettled(s.byTime)?.key, 'morning');
  assert.ok(s.lines.some((l) => l.includes('most settled in the morning')));
  // One group alone is not a pattern.
  assert.equal(mostSettled(sitStats(list.slice(0, 4), now).byTime), null);
});

test('To tend: only your own things you linked are marked, once a day', () => {
  const linked = newOwnRecord({ name: 'Morning sit', type: 'other', other: 'Meditation', rhythm: { kind: 'daily' }, meditations: true }, 'a');
  const plain = newOwnRecord({ name: 'Cleanse the house', type: 'cleansing', rhythm: { kind: 'weekly' } }, 'b');
  assert.equal(plain.own?.meditations, undefined);
  // It survives being saved and read back.
  assert.equal(normalizeRecord(JSON.parse(JSON.stringify(linked)))?.own?.meditations, true);
  const at = new Date(2026, 10, 3, 7, 30);
  const changed = meditationDone([linked, plain, { ...linked, key: 'own:c', ended: { how: 'closed', at: '', note: '' } }], at);
  assert.equal(changed.length, 1);
  assert.equal(changed[0].key, linked.key);
  assert.equal(changed[0].done?.length, 1);
  assert.deepEqual(changed[0].done?.[0].how, ['Meditation']);
  // A second sit the same day changes nothing; the next day it counts again.
  assert.equal(meditationDone(changed, new Date(2026, 10, 3, 21)).length, 0);
  assert.equal(meditationDone(changed, new Date(2026, 10, 4, 7)).length, 1);
});

test('sit together: everyone starts from the same moment', () => {
  const p = plan({ minutes: 20, settle: 2, every: 5 });
  const start = sitTogetherStart(p, new Date('2026-11-03T19:30:00Z'));
  assert.equal(start.source.kind, 'sit');
  assert.equal(start.steps[0].minutes, 22);
  const live = { source: start.source, started_at: '2026-11-03T19:25:00Z', status: 'live' as const };
  assert.deepEqual(sitTogetherOf(live), { plan: p, startAt: Date.parse('2026-11-03T19:30:00Z'), sound: null });
  // Without a set time: when the leader began, and nothing before that.
  const open = sitTogetherStart(plan({ minutes: null }), null);
  assert.equal(open.steps[0].minutes, null);
  assert.equal(sitTogetherOf({ source: open.source, started_at: null, status: 'gathering' })?.startAt, null);
  assert.equal(sitTogetherOf({ source: open.source, started_at: '2026-11-03T19:25:00Z', status: 'live' })?.startAt, Date.parse('2026-11-03T19:25:00Z'));
  assert.equal(sitTogetherOf({ source: { kind: 'free' }, started_at: null, status: 'live' }), null);
  assert.equal(startIn(5, new Date('2026-11-03T19:30:20Z')).toISOString(), '2026-11-03T19:35:00.000Z');
});
