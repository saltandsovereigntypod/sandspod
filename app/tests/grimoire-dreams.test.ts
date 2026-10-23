import assert from 'node:assert/strict';
import { test } from 'node:test';

import { blankDream, dreamMoon, dreamMoonDisc, morningDreamPrompt, quickDream, type Dream, type DreamEntry } from '../src/lib/craft/hedge/dreams.ts';
import { DREAM_ROUTES, DREAMS_SHELF, dreamSearchResults, dreamShelfLine, withDreamsShelf } from '../src/lib/grimoire/dreams.ts';
import { buildSchedule, DEFAULT_SETTINGS, normalizeSettings } from '../src/lib/reminders/schedule.ts';

const dream = (id: string, date: string, change: Partial<Dream> = {}): DreamEntry => ({
  id,
  createdAt: `${date}T08:00:00.000Z`,
  data: { ...blankDream(new Date(2026, 0, 1)), date, ...dreamMoon(date), ...change },
});

test('Dreams sits straight after My Practice among the built-in shelves', () => {
  const dreams = { key: DREAMS_SHELF.key };
  const keys = (list: { key: string }[]) => list.map((s) => s.key);
  assert.deepEqual(keys(withDreamsShelf([{ key: 'myPractice' }, { key: 'myPath' }, { key: 'traditional' }], dreams)), ['myPractice', 'dreams', 'myPath', 'traditional']);
  // My Practice turned off: Dreams comes first.
  assert.deepEqual(keys(withDreamsShelf([{ key: 'traditional' }], dreams)), ['dreams', 'traditional']);
  assert.deepEqual(keys(withDreamsShelf([], dreams)), ['dreams']);
  // Never twice.
  assert.deepEqual(keys(withDreamsShelf([{ key: 'myPractice' }, { key: 'dreams' }], dreams)), ['myPractice', 'dreams']);
});

test('a Grimoire search finds dreams by their words, symbols and moon, newest first', () => {
  const list = [
    dream('a', '2026-03-01', { title: 'The flooded house', symbols: ['water', 'house'] }),
    dream('b', '2026-05-10', { title: 'Hare on the hill', dream: 'A hare watched me from the water’s edge' }),
    dream('c', '2026-04-02', { title: 'Exam again' }),
  ];
  assert.deepEqual(dreamSearchResults(list, 'water').map((e) => e.id), ['b', 'a']);
  assert.deepEqual(dreamSearchResults(list, ''), []);
  assert.equal(dreamSearchResults(list, 'water', 1).length, 1);
  assert.deepEqual(dreamSearchResults(list, dreamMoon('2026-04-02').moonPhase.toLowerCase()).map((e) => e.id).includes('c'), true);
});

test('the Dreams line on the contents says how many and the last one', () => {
  assert.match(dreamShelfLine([]), /Write down a dream/);
  const line = dreamShelfLine([dream('a', '2026-03-01', { title: 'Old' }), dream('b', '2026-05-10', { title: 'Newest' })]);
  assert.match(line, /^2 dreams · last: Newest, under a /);
});

test('dream routes live in the Grimoire', () => {
  assert.equal(DREAM_ROUTES.journal, '/grimoire/dreams');
  assert.equal(DREAM_ROUTES.dream('x y'), '/grimoire/dreams/x%20y');
  assert.equal(DREAM_ROUTES.edit('abc'), '/grimoire/dreams/edit?id=abc');
});

test('the moon disc of a dream night matches its phase', () => {
  const full = dreamMoonDisc('2026-10-26'); // full moon on 26 October 2026
  assert.ok(full.illumination > 0.9);
  const anyDay = dreamMoonDisc('2026-03-14');
  assert.ok(anyDay.illumination >= 0 && anyDay.illumination <= 1);
});

test('a quick dream is dated this morning, titled by its first words', () => {
  const now = new Date(2026, 9, 23, 7, 15);
  const short = quickDream('  A black dog at the gate.  ', now);
  assert.equal(short.date, '2026-10-23');
  assert.equal(short.title, 'A black dog at the gate');
  assert.equal(short.dream, 'A black dog at the gate.');
  assert.deepEqual({ phase: short.moonPhase, sign: short.moonSign }, { phase: dreamMoon('2026-10-23').moonPhase, sign: dreamMoon('2026-10-23').moonSign });
  const long = quickDream('I was walking through a house with too many rooms, all of them cold', now);
  assert.equal(long.title, 'I was walking through a house…');
});

test('the morning prompt: mornings only, for dream keepers, until this morning’s is written', () => {
  const morning = new Date(2026, 9, 23, 7, 0);
  const keeper = { keepsHedge: true, reminderOn: false, dreams: [] };
  const prompt = morningDreamPrompt(morning, keeper);
  assert.ok(prompt);
  assert.equal(prompt.title, 'Write down last night’s dream');
  assert.match(prompt.detail, new RegExp(dreamMoon('2026-10-23').moonPhase));
  assert.equal(morningDreamPrompt(new Date(2026, 9, 23, 3, 59), keeper), null);
  assert.equal(morningDreamPrompt(new Date(2026, 9, 23, 12, 0), keeper), null);
  assert.equal(morningDreamPrompt(morning, { keepsHedge: false, reminderOn: false, dreams: [] }), null);
  assert.ok(morningDreamPrompt(morning, { keepsHedge: false, reminderOn: true, dreams: [] }));
  assert.ok(morningDreamPrompt(morning, { keepsHedge: false, reminderOn: false, dreams: [dream('a', '2026-10-20')] }));
  assert.equal(morningDreamPrompt(morning, { ...keeper, dreams: [dream('a', '2026-10-23')] }), null);
});

test('the dream reminder is off by default, and rings each morning for two weeks when on', () => {
  assert.equal(DEFAULT_SETTINGS.dreamMorning, false);
  const old = normalizeSettings({ rituals: false, devotionMorning: true });
  assert.equal(old.dreamMorning, false);
  assert.equal(old.dreamMorningAt, 7 * 60);
  const now = new Date(2026, 9, 23, 9, 0);
  assert.equal(buildSchedule(old, [], now).filter((r) => r.kind === 'dream').length, 0);
  const on = normalizeSettings({ rituals: false, dreamMorning: true, dreamMorningAt: 6 * 60 + 45 });
  const list = buildSchedule(on, [], now).filter((r) => r.kind === 'dream');
  assert.equal(list.length, 14); // today's 6:45 has passed
  assert.equal(list[0].at.getHours(), 6);
  assert.equal(list[0].at.getMinutes(), 45);
  assert.equal(list[0].title, 'Last night’s dream');
  assert.equal(list[0].url, '/grimoire/dreams/edit');
  assert.equal(new Set(list.map((r) => r.key)).size, list.length);
  assert.equal(normalizeSettings({ dreamMorning: true, dreamMorningAt: 9999 }).dreamMorningAt, 7 * 60);
});
