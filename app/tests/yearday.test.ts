import assert from 'node:assert/strict';
import { test } from 'node:test';

import { coursePrograms, moduleIndex } from '../src/lib/covens/courses/index.ts';
import { linkTargetLabel } from '../src/lib/covens/courses/linkTargets.ts';
import { JOURNEYS } from '../src/lib/journeys/registry.ts';
import { premadeById } from '../src/lib/rituals/premade/index.ts';
import { holidaysBetween } from '../src/lib/holidays.ts';
import { nextPhase } from '../src/lib/moon.ts';
import {
  allReadings,
  currentYear,
  daysBetween,
  dayKey,
  DEDICATION_STAGE,
  dedicate,
  moonSummary,
  moonView,
  MOONS,
  nearNewMoon,
  LINK_LABELS,
  linkLabel,
  newYear,
  normalizeYear,
  positionOn,
  READINGS,
  readKey,
  setCheck,
  setDone,
  setReflection,
  setStart,
  startChoices,
  stopYear,
  todayLine,
  TRACKS,
  yearReminders,
  yearSchedule,
  yearStatus,
} from '../src/lib/yearday/index.ts';

test('every reading is a course lesson the catalog carries, named as the course names it', () => {
  const docs = moduleIndex().docs;
  const inCatalog = new Set(coursePrograms().flatMap((p) => p.docs.map((d) => d.id)));
  for (const [id, r] of Object.entries(READINGS)) {
    const doc = docs.get(id);
    assert.ok(doc, `no lesson ${id}`);
    assert.equal(r.title, doc.title, id);
    assert.equal(r.minutes, doc.minutes, id);
    assert.ok(inCatalog.has(id), `${id} is not in course-programs.json`);
  }
  for (const m of MOONS) for (const id of [...m.core, ...m.wheel, ...Object.values(m.lens ?? {}).flat()]) assert.ok(READINGS[id], `${m.id}: ${id} not in READINGS`);
});

test('thirteen moons, each with something to read, do, reflect on and check, for every track', () => {
  assert.deepEqual(MOONS.map((m) => m.id), MOONS.map((_, i) => `m${i + 1}`));
  for (const t of TRACKS) {
    for (const m of MOONS) {
      const v = moonView({ track: t.id, startDate: '2026-11-09' }, m.n)!;
      assert.ok(v.readings.length > 0, `${t.id} ${m.id} has readings`);
      assert.ok(v.practices.length > 0 && m.reflect.length > 0 && m.milestones.length > 0, m.id);
      const keys = v.practices.map((p) => p.key);
      assert.equal(new Set(keys).size, keys.length, `${t.id} ${m.id} unique keys`);
    }
    assert.ok(allReadings(t.id).length >= 40, t.id);
  }
});

test('every link, journey and ready-made rite exists, and the journeys end in a dedication', () => {
  for (const m of MOONS) for (const p of m.practices) for (const l of p.links) assert.ok(linkTargetLabel(l), `${m.id}/${p.id}: ${l.kind}:${l.id}`);
  const named = [...MOONS.flatMap((m) => m.practices.flatMap((p) => p.links)), ...TRACKS.flatMap((t) => [{ kind: 'premade' as const, id: t.dedication }, { kind: 'premade' as const, id: t.moonRite }, { kind: 'journey' as const, id: t.journey }, ...(t.noteLink ? [t.noteLink] : [])])];
  for (const l of named) if (l.kind !== 'page') assert.equal(linkLabel(l), linkTargetLabel(l), `${l.kind}:${l.id}`);
  for (const [key, label] of Object.entries(LINK_LABELS)) assert.ok(named.some((l) => `${l.kind}:${l.id}` === key), `${key} (${label}) is used`);
  for (const t of TRACKS) {
    const j = JOURNEYS.find((x) => x.id === t.journey);
    assert.ok(j, t.journey);
    assert.equal(j.stages[DEDICATION_STAGE].kind, 'dedication', t.journey);
    assert.ok(j.stages[DEDICATION_STAGE].rite, `${t.journey} has a rite`);
    assert.ok(premadeById(t.dedication), t.dedication);
    assert.ok(premadeById(t.moonRite), t.moonRite);
    if (t.noteLink) assert.ok(linkTargetLabel(t.noteLink), `${t.id} note link`);
  }
});

test('the schedule: thirteen moons from the start to a year and a day', () => {
  const s = yearSchedule('2026-03-05');
  assert.equal(s.windows.length, 13);
  assert.equal(s.day, '2027-03-06');
  assert.equal(s.windows[0].start, '2026-03-05');
  assert.equal(s.windows[12].end, s.day);
  for (let i = 1; i < 13; i++) assert.equal(s.windows[i].start, s.windows[i - 1].end);
  for (const w of s.windows.slice(0, 12)) assert.ok(Math.abs(daysBetween(w.start, w.end) - 29.5) <= 1.5, `${w.id} ${w.start}→${w.end}`);
  assert.ok(daysBetween(s.windows[12].start, s.day) >= 9 && daysBetween(s.windows[12].start, s.day) <= 14);
  assert.deepEqual(positionOn(s, '2026-03-04'), { phase: 'before' });
  assert.deepEqual(positionOn(s, '2026-03-05'), { phase: 'moon', n: 1 });
  assert.deepEqual(positionOn(s, s.windows[2].start), { phase: 'moon', n: 3 });
  assert.deepEqual(positionOn(s, '2027-03-05'), { phase: 'moon', n: 13 });
  assert.deepEqual(positionOn(s, '2027-03-06'), { phase: 'day' });
  assert.deepEqual(positionOn(s, '2027-04-01'), { phase: 'after' });
});

test('begun at a new moon, every moon begins at a new moon', () => {
  const nm = nextPhase(new Date(2026, 10, 1), 'new');
  const start = dayKey(nm);
  assert.ok(nearNewMoon(start));
  const s = yearSchedule(start);
  assert.ok(s.aligned);
  for (const w of s.windows) assert.ok(nearNewMoon(w.start), `${w.id} ${w.start}`);
  assert.equal(yearSchedule('2026-11-01').aligned, nearNewMoon('2026-11-01'));
});

test('start choices: today, the next new moon and the track’s festivals, in order', () => {
  const now = new Date(2026, 9, 31, 10);
  const c = startChoices(now, 'eclectic');
  assert.equal(c[0].key, 'today');
  assert.ok(c.some((x) => x.key === 'new-moon' && nearNewMoon(x.date)));
  assert.ok(c.some((x) => x.label === 'Yule'));
  assert.deepEqual(c.map((x) => x.date), [...c.map((x) => x.date)].sort());
  assert.ok(startChoices(now, 'norse').some((x) => x.key.startsWith('festival:norse-')));
});

test('a moon holds the festivals of the track’s calendar and the moon’s rite, with the festival’s lesson', () => {
  const cfg = { track: 'eclectic' as const, startDate: '2026-11-09' };
  const s = yearSchedule(cfg.startDate);
  const yuleMoon = s.windows.find((w) => w.start <= '2026-12-21' && w.end > '2026-12-21')!;
  const v = moonView(cfg, yuleMoon.n)!;
  assert.ok(v.practices.some((p) => p.kind === 'festival' && p.key.startsWith('festival:wheel-yule:2026-12-21')));
  assert.ok(v.readings.some((r) => r.id === 'wheel-lore-yule' && r.festival === 'Yule'));
  assert.ok(v.practices.some((p) => p.kind === 'moon' && p.key.startsWith('full:')));
  // Every festival in the year appears once, across the moons.
  const all = MOONS.flatMap((m) => moonView(cfg, m.n)!.practices.filter((p) => p.kind === 'festival'));
  assert.equal(all.length, holidaysBetween(new Date(2026, 10, 9), new Date(2027, 10, 9), { traditions: ['wheel'], custom: [] }).length);
  // Wicca also gives the Wheel's history; the Hellenic track keeps the new moon.
  const w = moonView({ ...cfg, track: 'wicca' }, yuleMoon.n)!;
  assert.ok(w.readings.some((r) => r.id === 'wicca-lore-yule') && w.readings.some((r) => r.id === 'wheel-lore-yule'));
  assert.ok(moonView({ ...cfg, track: 'hellenic' }, 2)!.practices.some((p) => p.key.startsWith('new:')));
  // The southern Wheel keeps Midsummer in December.
  const south = moonView({ ...cfg, south: true }, yuleMoon.n)!;
  assert.ok(south.practices.some((p) => p.key.startsWith('festival:wheel-litha:')));
});

test('progress: done, checks, reflections, summaries, start moved, status', () => {
  const now = new Date(2026, 10, 9, 9);
  let p = newYear('celtic', '2026-11-09', now);
  assert.equal(yearStatus(p, '2026-11-08'), 'waiting');
  assert.equal(yearStatus(p, '2026-11-09'), 'active');
  const v = moonView({ track: p.track, startDate: p.startDate }, 1)!;
  p = setDone(p, readKey(v.readings[0].id), true, now);
  p = setDone(p, v.practices[0].key, true, now);
  p = setCheck(p, 'm1:0', true, now);
  p = setReflection(p, 'm1', '  A good beginning. ', now);
  const s = moonSummary(p, v);
  assert.equal(s.done, 2);
  assert.equal(s.checks, 1);
  assert.ok(s.reflected);
  assert.deepEqual(setDone(p, v.practices[0].key, false, now).done[v.practices[0].key], undefined);
  assert.equal(setReflection(p, 'm1', '   ', now).reflections.m1, undefined);
  assert.equal(setStart(p, 'nonsense').startDate, '2026-11-09');
  assert.equal(setStart(p, '2026-12-01').done[v.practices[0].key], p.done[v.practices[0].key]);
  assert.equal(yearStatus(p, '2027-11-10'), 'complete');
  assert.equal(yearStatus(dedicate(p, now, 'Kept at the hearth.'), '2027-11-10'), 'dedicated');
  assert.equal(yearStatus(stopYear(p, now), '2027-01-01'), 'stopped');
});

test('normalising and choosing the year in hand', () => {
  assert.equal(normalizeYear({ startDate: 'x' }), null);
  const n = normalizeYear({ startDate: '2026-11-09', track: 'nope', done: { a: 'x', b: 3 } })!;
  assert.equal(n.track, 'eclectic');
  assert.deepEqual(n.done, { a: 'x' });
  assert.equal(n.remind, true);
  const old = { id: 'a', createdAt: '2026-01-01', data: stopYear(newYear('norse', '2026-01-01', new Date()), new Date()) };
  const live = { id: 'b', createdAt: '2026-02-01', data: newYear('wicca', '2026-02-01', new Date()) };
  assert.equal(currentYear([old, live])?.id, 'b');
  assert.equal(currentYear([old]), null);
});

test('Today’s line: before, “Moon 3 of 13”, the day and after', () => {
  const p = newYear('eclectic', '2026-11-09', new Date(2026, 10, 1));
  const s = yearSchedule(p.startDate);
  assert.match(todayLine(p, '2026-11-08')!.line, /begins tomorrow/);
  const line = todayLine(p, s.windows[2].start)!;
  assert.match(line.line, /^Moon 3 of 13 · /);
  assert.equal(line.href, '/rituals/year/moon/3');
  assert.equal(todayLine(p, s.day)!.line, 'Today is your day of dedication');
  assert.match(todayLine(p, '2028-01-01')!.line, /complete/);
  assert.equal(todayLine(dedicate(p, new Date()), s.windows[2].start), null);
});

test('reminders: each moon’s beginning and reflection, and the day, within the horizon', () => {
  const cfg = { track: 'eclectic' as const, startDate: '2026-11-09' };
  const all = yearReminders(cfg, new Date(2026, 10, 1), 400);
  assert.equal(all.filter((r) => r.key.includes(':begin:')).length, 13);
  assert.equal(all.filter((r) => r.key.includes(':reflect:')).length, 13);
  assert.ok(all.some((r) => r.key.endsWith(':day') && dayKey(r.at) === '2027-11-10'));
  assert.equal(new Set(all.map((r) => r.key)).size, all.length);
  const soon = yearReminders(cfg, new Date(2026, 10, 1), 40);
  assert.ok(soon.length >= 2 && soon.every((r) => r.at.getTime() <= new Date(2026, 11, 11).getTime()));
  assert.equal(soon[0].title, 'Moon 1 of 13 begins: The threshold');
});
