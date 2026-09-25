import assert from 'node:assert/strict';
import { test } from 'node:test';

import { dayRulerLabel, daysBetween, longDate, nextSabbat, relativeDay } from '../src/lib/calendar.ts';

test('Thursday is Jupiter’s day', () => {
  assert.equal(dayRulerLabel(new Date(2026, 8, 24)), "Jupiter's day");
  assert.equal(dayRulerLabel(new Date(2026, 8, 27)), "The Sun's day");
});

test('next sabbat after late September is Samhain, 36 days out', () => {
  const now = new Date(2026, 8, 25, 21, 0);
  const sabbat = nextSabbat(now);
  assert.equal(sabbat.name, 'Samhain');
  assert.equal(daysBetween(now, sabbat.date), 36);
});

test('the sabbat day itself still counts as next', () => {
  assert.equal(nextSabbat(new Date(2026, 9, 31, 23, 0)).name, 'Samhain');
  assert.equal(nextSabbat(new Date(2026, 10, 1)).name, 'Yule');
});

test('the wheel turns over into the next year', () => {
  const sabbat = nextSabbat(new Date(2026, 11, 25));
  assert.equal(sabbat.name, 'Imbolc');
  assert.equal(sabbat.date.getFullYear(), 2027);
});

test('relative days and long dates', () => {
  const now = new Date(2026, 8, 25, 23, 30);
  assert.equal(relativeDay(now, new Date(2026, 8, 26, 1, 0)), 'tomorrow');
  assert.equal(relativeDay(now, new Date(2026, 8, 25, 8, 0)), 'today');
  assert.equal(relativeDay(now, new Date(2026, 9, 10)), 'Oct 10');
  assert.equal(longDate(now), 'Friday · September 25');
});
