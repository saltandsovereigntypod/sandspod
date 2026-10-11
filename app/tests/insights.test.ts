import assert from 'node:assert/strict';
import { test } from 'node:test';

import { moonState, nextPhase } from '../src/lib/moon.ts';
import { journalInsights, journalPhase, journalThemes, lunationOf } from '../src/lib/rituals/insights.ts';
import type { JournalRow } from '../src/lib/rituals/types.ts';

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
let n = 0;
const entry = (date: Date, title: string, extra: Partial<JournalRow> = {}): JournalRow =>
  ({ id: `j${++n}`, title, intention: null, ritual_date: key(date), moon_phase: null, results: null, ...extra }) as JournalRow;

test('a ritual’s phase is read from the entry, or from its date', () => {
  const full = nextPhase(new Date(2026, 8, 1), 'full');
  assert.equal(journalPhase(entry(full, 'x', { moon_phase: 'Waning Crescent' })), 'Waning Crescent');
  const waxingDay = new Date(full.getFullYear(), full.getMonth(), full.getDate() - 4);
  assert.equal(journalPhase(entry(waxingDay, 'x')), 'Waxing Gibbous');
});

test('themes come from the planner’s intention words', () => {
  assert.deepEqual(journalThemes(entry(new Date(), 'Money bowl', { intention: 'abundance and luck' })), ['Prosperity']);
  assert.deepEqual(journalThemes(entry(new Date(), 'Protection jar for the house')), ['Protection']);
  assert.deepEqual(journalThemes(entry(new Date(), 'Tea and quiet')), []);
});

test('patterns: tide, themes, weekday, streak and the last ritual under this phase', () => {
  const now = new Date(2026, 9, 26, 12); // the Full Moon of 26 October 2026
  assert.equal(moonState(now).name, 'Full Moon');
  const lastFull = nextPhase(new Date(2026, 8, 1), 'full'); // 26 September
  const waxing = (base: Date, days: number) => new Date(base.getFullYear(), base.getMonth(), base.getDate() - days);
  const entries = [
    entry(lastFull, 'Full moon protection rite', { moon_phase: 'Full Moon' }),
    entry(waxing(lastFull, 4), 'Money bowl', { intention: 'prosperity' }),
    entry(waxing(lastFull, 5), 'Abundance candle', { results: 'A raise' }),
    entry(waxing(now, 4), 'Prosperity oil'),
    entry(new Date(2026, 7, 15), 'Old one', { moon_phase: 'Last Quarter' }),
  ];
  const insights = journalInsights(entries, now);
  assert.equal(insights.total, 5);
  assert.match(insights.lines.join(' '), /Most of your rituals fall on waxing moons: 3 of 5\./);
  assert.match(insights.lines.join(' '), /prosperity on waxing moons/);
  assert.equal(insights.lastThisPhase?.entry.title, 'Full moon protection rite');
  assert.equal(insights.thisMoon, 1);
  assert.ok(insights.moonStreak >= 2, `streak ${insights.moonStreak}`);
  assert.match(insights.lines[0], /moons in a row/);
  assert.deepEqual(insights.watching.map((e) => e.title), ['Abundance candle']);
  assert.equal(insights.byPhase.reduce((sum, p) => sum + p.count, 0), 5);
});

test('quiet journals say little, and the future is ignored', () => {
  const now = new Date(2026, 9, 11);
  const few = journalInsights([entry(new Date(2026, 9, 1), 'One'), entry(new Date(2027, 0, 1), 'Planned ahead')], now);
  assert.equal(few.total, 1);
  assert.deepEqual(few.lines, []);
  assert.equal(journalInsights([], now).total, 0);
  // A ritual recorded this morning counts, even though rituals are read at 9 pm.
  assert.equal(journalInsights([entry(now, 'This morning')], new Date(2026, 9, 11, 8)).total, 1);
});

test('lunations run from new moon to new moon', () => {
  const nm = nextPhase(new Date(2026, 9, 1), 'new');
  assert.equal(lunationOf(new Date(nm.getTime() + 60_000)), lunationOf(new Date(nm.getTime() - 60_000)) + 1);
});
