import assert from 'node:assert/strict';
import { test } from 'node:test';

import { dateKey, dayIndex, daysByDate, devotionFor, EVENING, eveningFirst, MORNING, weekDots, weekWords, type DevotionDay } from '../src/lib/craft/solitary/devotion.ts';

test('about sixty original prompts, unique, with the right kinds for morning and evening', () => {
  assert.ok(MORNING.length + EVENING.length >= 60);
  const ids = new Set<string>();
  for (const p of [...MORNING, ...EVENING]) {
    assert.ok(!ids.has(p.id), p.id);
    ids.add(p.id);
    assert.ok(p.title && p.text.length > 30, p.id);
    if (p.kind === 'reading') assert.ok(p.reading && p.reading.length > 40, p.id);
  }
  const morningKinds = new Set(MORNING.map((p) => p.kind));
  for (const k of ['intention', 'gratitude', 'breath', 'reading']) assert.ok(morningKinds.has(k as never), k);
  const eveningKinds = new Set(EVENING.map((p) => p.kind));
  for (const k of ['reflection', 'release', 'thanks']) assert.ok(eveningKinds.has(k as never), k);
});

test('the day’s practice is picked by date, the same all day, and changes every day', () => {
  const a = devotionFor('2026-10-16');
  assert.deepEqual(devotionFor('2026-10-16'), a);
  const b = devotionFor('2026-10-17');
  assert.notEqual(a.morning.id, b.morning.id);
  assert.notEqual(a.evening.id, b.evening.id);
  // Over a full cycle, every prompt is used.
  const mornings = new Set<string>();
  const evenings = new Set<string>();
  const start = dayIndex('2026-01-01');
  for (let i = 0; i < 60; i++) {
    const key = dateKey(new Date(Date.UTC(1970, 0, 1 + start + i, 12)));
    const d = devotionFor(key);
    mornings.add(d.morning.id);
    evenings.add(d.evening.id);
  }
  assert.equal(mornings.size, MORNING.length);
  assert.equal(evenings.size, EVENING.length);
  assert.ok(devotionFor('1969-12-01').morning, 'dates before 1970 still pick');
});

test('records for the same date are read together', () => {
  const entries = [
    { id: '1', updatedAt: '2026-10-16T08:00:00Z', data: { date: '2026-10-16', morning: true, evening: false } as DevotionDay },
    { id: '2', updatedAt: '2026-10-16T21:00:00Z', data: { date: '2026-10-16', morning: false, evening: true, note: 'Quiet night.' } as DevotionDay },
    { id: '3', updatedAt: '2026-10-15T21:00:00Z', data: { date: '2026-10-15', morning: false, evening: true } as DevotionDay },
  ];
  const days = daysByDate(entries);
  assert.equal(days.size, 2);
  const today = days.get('2026-10-16')!;
  assert.equal(today.morning, true);
  assert.equal(today.evening, true);
  assert.equal(today.note, 'Quiet night.');
  assert.deepEqual(today.ids, ['1', '2']);
});

test('the week is seven gentle dots ending today, with no streak', () => {
  const days = new Map<string, DevotionDay>([
    ['2026-10-16', { date: '2026-10-16', morning: true, evening: false }],
    ['2026-10-14', { date: '2026-10-14', morning: false, evening: true }],
    ['2026-10-09', { date: '2026-10-09', morning: true, evening: true }],
  ]);
  const dots = weekDots(days, new Date(2026, 9, 16, 9));
  assert.equal(dots.length, 7);
  assert.equal(dots[0].date, '2026-10-10');
  assert.equal(dots[6].date, '2026-10-16');
  assert.equal(dots[6].today, true);
  assert.equal(dots[6].weekday, 'Fri');
  assert.equal(dots.filter((d) => d.morning || d.evening).length, 2);
  assert.match(weekWords(dots), /2 days/);
  assert.doesNotMatch(weekWords(dots), /streak|missed|broke/i);
  assert.match(weekWords(weekDots(new Map(), new Date(2026, 9, 16))), /fresh week/);
});

test('evening comes first from mid-afternoon', () => {
  assert.equal(eveningFirst(new Date(2026, 9, 16, 9)), false);
  assert.equal(eveningFirst(new Date(2026, 9, 16, 19)), true);
});
