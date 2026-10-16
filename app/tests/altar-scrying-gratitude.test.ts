import assert from 'node:assert/strict';
import { test } from 'node:test';

import { nextPhase } from '../src/lib/moon.ts';
import {
  beadPositions,
  beadsThisMoon,
  BOWL_CAPACITY,
  bowlFill,
  bowlLine,
  gratitudeEntry,
  gratitudeHistory,
  lunarMonth,
} from '../src/lib/altar/workings/gratitude.ts';
import { clock, hasNotes, reflectionPaths, scryingEntry, scryingJournalAnswers, secondsLeft } from '../src/lib/altar/workings/scrying.ts';

test('scrying: the clock, and the journal answers', () => {
  assert.equal(clock(300), '5:00');
  assert.equal(clock(59.2), '1:00');
  assert.equal(clock(-3), '0:00');
  assert.equal(secondsLeft(5, 0, 60_000), 240);
  const notes = { saw: ' a road ', symbols: 'a key', feelings: '' };
  assert.equal(hasNotes(notes), true);
  assert.equal(hasNotes({ saw: ' ', symbols: '', feelings: '' }), false);
  const answers = scryingJournalAnswers(notes, { minutes: 10, moonPhase: 'Waxing Crescent', altarName: 'Hearth', date: new Date(2026, 9, 16, 21) });
  assert.equal(answers.title, 'Water-bowl scrying');
  assert.equal(answers.what_happened_during, 'a road');
  assert.equal(answers.signs_and_symbols, 'a key');
  assert.equal(answers.ritual_date, '2026-10-16');
  assert.equal(answers.manual_minutes, '10');
  const entry = scryingEntry(notes, { altarId: 'a', minutes: 10, satMinutes: 7.6, moonPhase: 'x', at: 'now' });
  assert.equal(entry.satMinutes, 8);
  assert.equal(entry.saw, 'a road');
  const paths = reflectionPaths(4);
  assert.equal(paths.length, 4);
  assert.deepEqual(paths, reflectionPaths(4));
});

test('the lunar month runs new moon to new moon', () => {
  const at = new Date(2026, 9, 16, 12);
  const month = lunarMonth(at);
  assert.ok(month.start.getTime() <= at.getTime() && at.getTime() < month.end.getTime());
  const length = (month.end.getTime() - month.start.getTime()) / 86_400_000;
  assert.ok(length > 29 && length < 30, String(length));
  assert.equal(nextPhase(month.start, 'new').getTime(), month.end.getTime());
  // Just after the next new moon is a new month.
  assert.notEqual(lunarMonth(new Date(month.end.getTime() + 60_000)).key, month.key);
});

test('the gratitude bowl fills over the month, resets at the new moon, and keeps its history', () => {
  const at = new Date(2026, 9, 16, 12);
  const month = lunarMonth(at);
  const before = new Date(month.start.getTime() - 86_400_000);
  const entries = [
    { data: gratitudeEntry({ altarId: 'a', text: '  my sister  ', bead: 'Rose quartz' }, at) },
    { data: gratitudeEntry({ altarId: 'a', text: 'rain', bead: 'A river stone' }, new Date(at.getTime() - 3_600_000)) },
    { data: gratitudeEntry({ altarId: 'a', text: 'last moon', bead: 'Citrine' }, before) },
    { data: gratitudeEntry({ altarId: 'b', text: 'elsewhere', bead: 'Citrine' }, at) },
  ];
  assert.equal(entries[0].data.text, 'my sister');
  assert.match(entries[0].data.color, /^#/);
  const now = beadsThisMoon(entries, 'a', at);
  assert.deepEqual(now.map((e) => e.data.text), ['rain', 'my sister']);
  const history = gratitudeHistory(entries, 'a', at);
  assert.equal(history.length, 1);
  assert.equal(history[0].entries[0].data.text, 'last moon');
  assert.equal(bowlFill(0), 0);
  assert.equal(bowlFill(BOWL_CAPACITY + 5), 1);
  assert.match(bowlLine(2, month), /^2 beads since the new moon/);
  assert.match(bowlLine(0, month), /empty/);
});

test('beads settle from the bottom of the bowl upward, within it', () => {
  const beads = beadPositions(40);
  assert.equal(beads.length, BOWL_CAPACITY);
  for (const b of beads) assert.ok(b.x > 0 && b.x < 1 && b.y > 0 && b.y < 1);
  assert.ok(beads[0].y > beads[beads.length - 1].y, 'later beads sit higher');
});
