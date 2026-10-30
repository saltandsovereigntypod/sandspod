import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SPREADS } from '../src/lib/divination/draw.ts';
import { traditionalEntries } from '../src/lib/library/model.ts';
import { moonState, nextPhase } from '../src/lib/moon.ts';
import { premadeById } from '../src/lib/rituals/premade/index.ts';
import { classifyMoonType, historyReading } from '../src/lib/cycle/history.ts';
import {
  addDays,
  changeSettings,
  cycleDayOn,
  cycleLength,
  dayKey,
  emptyData,
  emptyNote,
  lutealDays,
  mergeData,
  nextBleedEstimate,
  normalizeData,
  putNote,
  seasonForCycleDay,
  setFlow,
  type BleedMoon,
} from '../src/lib/cycle/model.ts';
import { addPastBleeds, calendarMonth, checkPastBleeds, dateOrderFor, editBleed, entryWithLength, parsePastList } from '../src/lib/cycle/past.ts';
import { exactReading, MOON_PHASES, READINGS } from '../src/lib/cycle/readings.ts';
import { COMFORT, comfortNow, redFlags, SYMPTOMS, symptomInsights, withSymptom } from '../src/lib/cycle/symptoms.ts';
import { decryptData, encryptData, newDataKey, unlockWithPassphrase, type Vault } from '../src/lib/cycle/vault.ts';
import type { CycleData, Intensity } from '../src/lib/cycle/types.ts';

let n = 0;
const id = () => `p${++n}`;
const at = (key: string, hour = 12) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, hour);
};
const every = (start: string, gaps: number[]) => gaps.reduce<string[]>((list, g) => [...list, addDays(list[list.length - 1], g)], [start]);
const TODAY = '2026-10-30';
const NOW = at(TODAY);
/** Past periods added the way the screens add them: starts, each five days long. */
function history(starts: string[], base: CycleData = emptyData()): CycleData {
  return addPastBleeds(base, starts.map((s) => entryWithLength(s, 5)), id, NOW).data;
}

// ── Past periods ─────────────────────────────────────────────────────────

test('past periods: many at once, checked for future dates, overlaps and bad ends', () => {
  const starts = every('2026-05-04', [28, 29, 27, 30, 28]);
  const { data, added, problems } = addPastBleeds(emptyData(), starts.map((s) => entryWithLength(s, 5)), id, NOW);
  assert.equal(added, 6);
  assert.deepEqual(problems, []);
  assert.deepEqual(data.bleeds.map((b) => b.start), starts);
  assert.equal(data.bleeds[0].end, '2026-05-08');
  // Against what's kept and each other.
  const check = checkPastBleeds(
    data,
    [
      { start: '2026-11-02', end: null }, // the future
      { start: '2026-05-06', end: null }, // inside a kept bleed
      { start: starts[2], end: null }, // already logged
      { start: '2026-04-01', end: '2026-03-30' }, // ends before it begins
      { start: '2026-03-01', end: '2026-03-20' }, // too long
      { start: '2026-02-01', end: '2026-02-05' },
      { start: '2026-02-03', end: null }, // overlaps the one above
      { start: '2026-01-04', end: '2026-01-08' },
      { start: 'yesterday', end: null },
    ],
    TODAY,
  );
  assert.deepEqual(check.ok.map((e) => e.start), ['2026-01-04', '2026-02-01']);
  const reasons = Object.fromEntries(check.problems.map((p) => [p.start, p.reason]));
  assert.deepEqual(reasons, {
    '2026-11-02': 'future',
    '2026-05-06': 'overlap',
    [starts[2]]: 'duplicate',
    '2026-04-01': 'end-before-start',
    '2026-03-01': 'too-long',
    '2026-02-03': 'overlap',
    yesterday: 'invalid',
  });
  for (const p of check.problems) assert.doesNotMatch(p.message, /!/);
  // An end in the future isn't kept either.
  assert.equal(checkPastBleeds(emptyData(), [{ start: '2026-10-28', end: '2026-11-01' }], TODAY).problems[0].reason, 'future');
});

test('past periods: editing moves a bleed, refuses an overlap, and keeps only the flow inside it', () => {
  let data = history(['2026-08-03', '2026-09-01']);
  data = setFlow(data, '2026-09-01', 'heavy', NOW);
  data = setFlow(data, '2026-09-04', 'light', NOW);
  const b = data.bleeds[1];
  const moved = editBleed(data, b.id, '2026-09-02', '2026-09-05', NOW);
  assert.equal(moved.problem, null);
  const after = moved.data.bleeds.find((x) => x.id === b.id)!;
  assert.deepEqual([after.start, after.end, after.flow], ['2026-09-02', '2026-09-05', { '2026-09-04': 'light' }]);
  const clash = editBleed(data, b.id, '2026-08-05', null, NOW);
  assert.equal(clash.problem?.reason, 'overlap');
  assert.equal(clash.data, data);
});

test('past periods: a pasted list of dates, in the usual ways people write them', () => {
  const text = [
    '2026-04-06',
    '4 May 2026 to 8 May 2026',
    'June 1, 2026 - 5 days',
    '29/06/2026',
    '27th July',
    'Aug 24 2026; 21 Sept 2026',
    'when it rained',
    '2026-01-05, 2026-02-02, 2026-03-03',
  ].join('\n');
  const { entries, unread } = parsePastList(text, 'dmy', TODAY);
  assert.deepEqual(entries, [
    { start: '2026-04-06', end: null },
    { start: '2026-05-04', end: '2026-05-08' },
    { start: '2026-06-01', end: '2026-06-05' },
    { start: '2026-06-29', end: null },
    { start: '2026-07-27', end: null },
    { start: '2026-08-24', end: null },
    { start: '2026-09-21', end: null },
    { start: '2026-01-05', end: null },
    { start: '2026-02-02', end: null },
    { start: '2026-03-03', end: null },
  ]);
  assert.deepEqual(unread, ['when it rained']);
  // Slashed dates follow the order chosen, unless a number over 12 settles it.
  assert.deepEqual(parsePastList('03/04/2026', 'mdy', TODAY).entries, [{ start: '2026-03-04', end: null }]);
  assert.deepEqual(parsePastList('03/04/2026', 'dmy', TODAY).entries, [{ start: '2026-04-03', end: null }]);
  assert.deepEqual(parsePastList('25/04/26', 'mdy', TODAY).entries, [{ start: '2026-04-25', end: null }]);
  // A day with no year is the latest one not in the future.
  assert.deepEqual(parsePastList('12 December', 'dmy', TODAY).entries, [{ start: '2025-12-12', end: null }]);
  assert.equal(dateOrderFor('en-US'), 'mdy');
  assert.equal(dateOrderFor('en-GB'), 'dmy');
});

test('past periods: the calendar marks logged bleeds, picked days and the future', () => {
  const data = history(['2026-10-05']);
  const weeks = calendarMonth(data, 2026, 9, ['2026-10-01'], TODAY);
  const days = weeks.flat();
  assert.equal(weeks[0][0].key, '2026-09-28'); // Monday first
  const day = (k: string) => days.find((d) => d.key === k)!;
  assert.ok(day('2026-10-05').start && day('2026-10-05').bleeding);
  assert.ok(day('2026-10-09').bleeding && !day('2026-10-10').bleeding);
  assert.ok(day('2026-10-01').picked);
  assert.ok(day('2026-10-31').future && !day('2026-10-30').future);
});

// ── Cycle length ─────────────────────────────────────────────────────────

test('cycle length: from history, exactly, or a range; and the seasons scale with it', () => {
  const data = history(every('2026-05-04', [28, 30, 27, 31, 29]));
  assert.deepEqual(cycleLength(data), { typical: 29, min: 27, max: 31, source: 'history' });
  // One cycle isn't a history yet.
  assert.equal(cycleLength(history(['2026-09-01', '2026-09-30'])).source, 'default');
  assert.deepEqual(cycleLength(emptyData()), { typical: 28, min: 28, max: 28, source: 'default' });
  const exact = changeSettings(data, { length: { mode: 'exact', exact: 26, min: 26, max: 30 } }, NOW);
  assert.deepEqual(cycleLength(exact), { typical: 26, min: 26, max: 26, source: 'exact' });
  const range = changeSettings(data, { length: { mode: 'range', exact: 28, min: 27, max: 31 } }, NOW);
  assert.deepEqual(cycleLength(range), { typical: 29, min: 27, max: 31, source: 'range' });
  // A range read back the wrong way round is put right; silly numbers are held in.
  assert.deepEqual(normalizeData({ settings: { length: { mode: 'range', min: 33, max: 25, exact: 300 } } }).settings.length, { mode: 'range', exact: 50, min: 25, max: 33 });
  // The luteal side stays about 14 days; the follicular side takes the difference.
  assert.equal(lutealDays(28), 14);
  assert.equal(lutealDays(35), 14);
  assert.equal(lutealDays(21), 12);
  const firstSummer = (len: number) => Array.from({ length: len }, (_, i) => seasonForCycleDay(i + 1, len, 5)).indexOf('summer') + 1;
  assert.equal(firstSummer(28), 13);
  assert.equal(firstSummer(35), 20);
  // The open cycle is laid out over the chosen length.
  const last = range.bleeds[range.bleeds.length - 1].start;
  assert.equal(cycleDayOn(range, addDays(last, 17))!.length, 29);
  assert.equal(cycleDayOn(exact, addDays(last, 17))!.length, 26);
});

test('the next period: a day when exact, a window when a range is set', () => {
  const data = history(every('2026-07-07', [28, 28, 28]));
  const last = data.bleeds[data.bleeds.length - 1].start; // 2026-09-29
  const now = at(addDays(last, 20)); // cycle day 21
  const exact = changeSettings(data, { length: { mode: 'exact', exact: 28, min: 26, max: 30 } }, NOW);
  const e = nextBleedEstimate(exact, now)!;
  assert.equal(e.span, null);
  assert.equal(e.from, addDays(last, 28));
  assert.equal(e.line, 'Your bleed may start in about 8 days, around 27 October.');
  const range = changeSettings(data, { length: { mode: 'range', exact: 28, min: 27, max: 31 } }, NOW);
  const r = nextBleedEstimate(range, now)!;
  assert.deepEqual(r.span, [7, 11]);
  assert.deepEqual([r.from, r.to], ['2026-10-26', '2026-10-30']);
  assert.equal(r.line, 'Your bleed may start between 26 and 30 October.');
  // Across a month's end.
  const later = nextBleedEstimate(changeSettings(data, { length: { mode: 'range', exact: 28, min: 30, max: 35 } }, NOW), now)!;
  assert.equal(later.line, 'Your bleed may start between 29 October and 3 November.');
  // Into the window: any day now.
  assert.equal(nextBleedEstimate(range, at(addDays(last, 28)))!.line, 'Your bleed may start any day now, up to about 30 October.');
  // A chosen length gives an estimate even with one bleed logged; pregnancy still none.
  const one = changeSettings(history([last]), { length: { mode: 'range', exact: 28, min: 27, max: 31 } }, NOW);
  assert.ok(nextBleedEstimate(one, now));
  assert.equal(nextBleedEstimate(changeSettings(one, { situations: ['pregnant'] }, NOW), now), null);
});

// ── What am I? ───────────────────────────────────────────────────────────

const moons = (patterns: BleedMoon['pattern'][]) => patterns.map((pattern) => ({ pattern }) as BleedMoon);

test('moon type: the pattern and how sure it is', () => {
  assert.equal(classifyMoonType([]), null);
  const strong = classifyMoonType(moons(['red', 'red', 'red', 'red', 'red', 'white']))!;
  assert.equal(strong.headline, 'Based on 6 cycles: Red Moon, strongly');
  assert.equal(strong.strength, 'strongly');
  assert.equal(classifyMoonType(moons(['pink', 'pink', 'pink', 'red', 'white', 'purple']))!.headline, 'Based on 6 cycles: mostly Pink Moon');
  const mixed = classifyMoonType(moons(['white', 'pink', 'white', 'pink', 'pink', 'white']))!;
  assert.equal(mixed.strength, 'mixed');
  assert.match(mixed.headline, /^Based on 6 cycles: mixed between (White and Pink|Pink and White) Moon$/);
  assert.equal(classifyMoonType(moons(['white', 'pink', 'red', 'purple', 'white', 'red', 'pink', 'purple']))!.strength, 'moving');
  const early = classifyMoonType(moons(['purple', 'purple']))!;
  assert.equal(early.strength, 'early');
  assert.equal(early.headline, 'Based on 2 cycles: leaning Purple Moon, too early to say');
  assert.equal(classifyMoonType(moons(['red', 'red', 'red']))!.strength, 'strongly');
});

/** The days of `count` moons of one phase in a row, from `from`. */
function phases(from: Date, phase: 'new' | 'full', count: number): string[] {
  const out: string[] = [];
  let t = from;
  for (let i = 0; i < count; i++) {
    const d = nextPhase(t, phase);
    out.push(dayKey(d));
    t = new Date(d.getTime() + 86_400_000);
  }
  return out;
}

test('what am I: averages, steadiness, bleed length, each bleed on the moon, and how it shifted', () => {
  // Six bleeds beginning at full moons, then (after a longer cycle) three at new moons.
  const fulls = phases(new Date(2025, 11, 20), 'full', 6);
  const news = phases(new Date(at(fulls[5]).getTime() + 20 * 86_400_000), 'new', 3);
  const data = history([...fulls, ...news]);
  const r = historyReading(data);
  assert.equal(r.bleedCount, 9);
  assert.equal(r.cycles, 6); // the latest six are read
  assert.ok(r.average! > 29 && r.average! < 36, String(r.average));
  assert.equal(r.bleedAverage, 5);
  assert.equal(r.moons[0].bleed.start, news[2]);
  for (const m of r.moons) assert.ok(m.lunarDay >= 1 && m.lunarDay <= 30);
  for (const m of r.moons.slice(3)) assert.equal(m.pattern, 'red', m.bleed.start);
  for (const m of r.moons.slice(0, 3)) assert.equal(m.pattern, 'white', m.bleed.start);
  assert.equal(r.type!.headline, 'Based on 9 cycles: mostly Red Moon');
  assert.match(r.shift!, /earlier bleeds leaned Red Moon, your more recent ones lean White Moon/);
  assert.ok(r.lines.length >= 2);
  const steady = historyReading(history(every('2026-03-01', [29, 30, 29, 30, 29])));
  assert.equal(steady.steadiness, 'very steady');
  assert.match(steady.lines[1], /close to the moon’s own month/);
  assert.equal(historyReading(history(every('2026-03-01', [24, 35, 26, 33]))).steadiness, 'varies');
  assert.equal(historyReading(emptyData()).type, null);
});

// ── Today's exact reading ────────────────────────────────────────────────

test('all 32 readings are there, distinct, and open real things', () => {
  const library = new Set(traditionalEntries().map((e) => e.id));
  const spreads = new Set(SPREADS.map((s) => s.id));
  const seen = { title: new Set<string>(), line: new Set<string>(), practice: new Set<string>(), prompt: new Set<string>() };
  let count = 0;
  for (const season of ['winter', 'spring', 'summer', 'autumn'] as const) {
    assert.deepEqual(Object.keys(READINGS[season]).sort(), [...MOON_PHASES].sort());
    for (const phase of MOON_PHASES) {
      const r = READINGS[season][phase];
      count++;
      for (const k of ['title', 'line', 'practice', 'prompt'] as const) {
        assert.ok(r[k].length > 5, `${season}/${phase} ${k}`);
        assert.ok(!seen[k].has(r[k]), `${season}/${phase} repeats a ${k}`);
        seen[k].add(r[k]);
        assert.doesNotMatch(r[k], /!/);
      }
      assert.ok(r.links.length >= 1);
      for (const link of r.links) {
        if (link.kind === 'premade') assert.ok(premadeById(link.id), link.id);
        if (link.kind === 'library') assert.ok(library.has(link.id), link.id);
        if (link.kind === 'spread') assert.ok(spreads.has(link.id), link.id);
      }
    }
  }
  assert.equal(count, 32);
});

test('today’s exact reading: cycle day, season and phase, the exact moon and its next turn', () => {
  const data = history(every('2026-08-04', [28, 28]));
  const last = data.bleeds[data.bleeds.length - 1].start;
  const now = at(addDays(last, 21)); // cycle day 22
  const r = exactReading(data, now);
  const moon = moonState(now);
  assert.equal(r.cycleDay, 22);
  assert.equal(r.season, 'autumn');
  assert.equal(r.moon.name, moon.name);
  assert.equal(r.moon.illumination, Math.round(moon.illumination * 100));
  assert.ok(r.moon.next.days >= 0 && r.moon.next.days <= 9);
  assert.notEqual(r.moon.next.name, r.moon.name);
  assert.match(r.headline, /^Cycle day 22 · inner autumn \(luteal\) · [a-z ]+ moon$/);
  assert.match(r.moonLine, /^[A-Z][a-z]+( [A-Z][a-z]+)?, \d+% lit · [a-z ]+ (today|tomorrow|in \d+ days)$/);
  assert.equal(r.reading, READINGS.autumn[r.moon.key]);
  // Every moon phase name has its reading.
  for (let d = 0; d < 30; d++) assert.ok(exactReading(data, at(addDays(last, d))).reading);
  // Following the moon alone, the moon gives the season.
  const moonOnly = exactReading(changeSettings(data, { mode: 'moon' }, NOW), now);
  assert.equal(moonOnly.cycleDay, null);
  assert.equal(moonOnly.byMoon, true);
  assert.match(moonOnly.headline, /^Inner \w+ by the moon · /);
});

// ── Symptoms ─────────────────────────────────────────────────────────────

/** Notes with symptoms on given cycle days of each bleed. */
function withSymptoms(data: CycleData, perCycle: (cycle: number) => [day: number, id: string, level: Intensity][]): CycleData {
  let next = data;
  data.bleeds.forEach((b, i) => {
    for (const [day, sid, level] of perCycle(i)) {
      const date = addDays(b.start, day - 1);
      if (date > TODAY) continue;
      const note = next.notes.find((x) => x.date === date) ?? emptyNote(date);
      next = putNote(next, withSymptom(note, sid, level), NOW);
    }
  });
  return next;
}

test('symptom logging: intensities, custom names, and a note with only symptoms is kept', () => {
  let note = withSymptom(emptyNote('2026-10-01'), 'cramps', 2);
  note = withSymptom(note, 'Jaw ache', 1, true);
  let data = putNote(emptyData(), note, NOW);
  assert.deepEqual(data.notes[0].symptoms, { cramps: 2 });
  assert.deepEqual(data.notes[0].custom, { 'Jaw ache': 1 });
  data = putNote(data, withSymptom(withSymptom(note, 'cramps', null), 'Jaw ache', null, true), NOW);
  assert.equal(data.notes.length, 0);
  // Bad levels and names are dropped when read back.
  const read = normalizeData({ notes: [{ date: '2026-10-02', symptoms: { cramps: 7, headache: 3, '': 2 }, custom: { ' Itchy eyes ': 2, x: 'loud' } }] });
  assert.deepEqual(read.notes[0].symptoms, { headache: 3 });
  assert.deepEqual(read.notes[0].custom, { 'Itchy eyes': 2 });
  for (const s of SYMPTOMS) assert.ok(COMFORT[s.id], s.id);
  for (const c of Object.values(COMFORT)) assert.ok(c.safety.length > 10);
});

test('symptom insights: timing, easing, season, only past the thresholds', () => {
  const base = history(every('2026-04-06', [28, 28, 28, 28, 28, 28]));
  // Too little: one cycle with headaches.
  const one = withSymptoms(base, (i) => (i === 0 ? [[25, 'headache', 2], [26, 'headache', 2], [27, 'headache', 1]] : []));
  assert.deepEqual(symptomInsights(one), []);
  // Headaches late in three cycles; cramps easing; bloating in inner autumn.
  const lots = withSymptoms(base, (i) => [
    ...(i < 3 ? ([[25 + (i % 2), 'headache', 2], [27, 'headache', 2]] as [number, string, Intensity][]) : []),
    ...(i >= 3 && i <= 5 ? ([[1, 'cramps', (6 - i) as Intensity], [2, 'cramps', (6 - i) as Intensity]] as [number, string, Intensity][]) : []),
    ...(i < 4 ? ([[21, 'bloating', 1], [22, 'bloating', 1]] as [number, string, Intensity][]) : []),
  ]);
  const lines = symptomInsights(lots);
  const text = lines.map((l) => `${l.text} [${l.basis}]`).join('\n');
  assert.ok(lines.some((l) => l.kind === 'timing' && l.symptom === 'headache' && /^Headaches tend to come (on cycle days? 2\d(–27)?|\d(–\d)? days? before your bleed)\.$/.test(l.text)), text);
  assert.ok(lines.some((l) => l.kind === 'trend' && l.symptom === 'cramps' && /^Cramps have eased over your last 3 cycles/.test(l.text)), text);
  assert.ok(lines.some((l) => l.symptom === 'bloating' && /^Bloating (tends to come|comes mostly in inner autumn)/.test(l.text)), text);
  for (const l of lines) assert.ok(l.basis.length > 3);
});

test('symptom insights: the moon, only with enough days logged', () => {
  // Poor sleep near every full moon over four months, and calm days at other times.
  let data = history(every('2026-06-01', [29, 29, 29, 29]));
  for (let k = 0; k < 140; k += 2) {
    const date = addDays('2026-06-01', k);
    const full = Math.abs(moonState(at(date)).fraction - 0.5) < 0.125;
    data = putNote(data, withSymptom(emptyNote(date), full ? 'insomnia' : 'calm', 1), NOW);
  }
  const moonLines = symptomInsights(data).filter((l) => l.kind === 'moon');
  assert.ok(moonLines.some((l) => l.text === 'You sleep worse near the full moon.'), JSON.stringify(moonLines));
  // A few days only: nothing about the moon.
  assert.deepEqual(symptomInsights({ ...data, notes: data.notes.slice(0, 6) }).filter((l) => l.kind === 'moon'), []);
});

test('red flags and comfort: gentle, and only when logged', () => {
  let data = history(['2026-08-03', '2026-08-31', '2026-09-28']);
  assert.deepEqual(redFlags(data, NOW), []);
  data = setFlow(data, '2026-08-04', 'heavy', NOW);
  data = setFlow(data, '2026-09-01', 'heavy', NOW);
  const flags = redFlags(data, NOW);
  assert.equal(flags.length, 1);
  assert.match(flags[0], /heavy flow more than once.*doctor or nurse/);
  for (const f of flags) assert.doesNotMatch(f, /diagnos|you have [a-z]+ (disease|disorder|syndrome)/i);
  // A late bleed, gently.
  assert.match(redFlags(history(['2026-09-01']), NOW).join(' '), /It’s been 59 days/);
  // Comfort for what was logged in the last few days, else for what the season usually brings.
  const today = putNote(data, withSymptom(withSymptom(emptyNote(TODAY), 'headache', 1), 'cramps', 3), NOW);
  const c = comfortNow(today, TODAY, 'autumn');
  assert.equal(c.from, 'recent');
  assert.deepEqual(c.comforts.map((x) => x.title), ['For cramps', 'For headaches']);
  assert.deepEqual(comfortNow(emptyData(), TODAY, 'winter'), { comforts: [], from: null });
});

// ── Keeping it ───────────────────────────────────────────────────────────

// A vault encrypted by the first release (content version 1), as in tests/cycle-moon.test.js.
const V1_VAULT: Vault = {"version": 1, "kdf": {"name": "scrypt", "N": 1024, "r": 8, "p": 1, "salt": "NQUXT6ub7MBbbqC67XxlfA=="}, "passKey": "BAawwZCqv+PyeSf/LRZFbZgdX0tNRmUfXEW/3APbG76PsdR1jZVLIAa+s7UYlfjik3owDekau5JHRoYXT69Cqamjhxbx27q2", "recoveryKey": "dX1v9V1saeukJUQ0UTnCIeqcACpeq0PHaNWwzB5RBsMu7PuN5aMD0cWLetw6mYIfbDiwDmEFUKV1NBlmVimTVcf7alD1S1dg", "data": "uMqWoy+v0CMDu0O28XHBUz4GIDkR7sG84AqucfSjFqFGtdKxkqwcj3hWFhpTGT5xSiC/xqgsY5veHQZ8zPDe9lmoPs8QvDP9MhJPXdR6GzYbYYzARprnlsSWbaTJ9fpcQCa6sGfX3nYkbbsUAoEKHGZxDNVIoZUolWMnHKPh25zlBvXte/afF8S9eNvCngqbKuz7MSIRWD8/yI/NlvQbia9Y5jYpRlcI4Tr+UpXPeySiUtMP10AanJMC/a9CIxrIM+zNZyBc/dkrH2ep3VZFQaj+gYtdRpj9lfZ1QscKkwrAVVvL5e9YwumAnwwjRQ4vVYK+nEf8DlrXOxB6cVN+hURaOZkbq6Euyh7cw20QzuIhy4mqq7kfHTfCHirYtOWqcdguQw1uT6VHk3J7hr3ayT86CR0wGtBXQBopkDIXLVNpm/T0+ozT48h73neewOTzBcA2zV7CrXMpWpK8t5ebPsv3ixKhg73pLu+d1XvDWzO3rZ+r/4ZBSQpu8IpBVrrSM0qi2d7RgbCZ/qC7Yd22S2O0gD0s2B5bKukyMqYBL8XPUSv/9BVOBHi82keO9+BH5yUaCSxt4I4PszgATvN01i7791p6HKwuB3DgrPxrwYq6jXWBlVOAi81H+BH7Be0G5zXRuE9oeh/+0o67/FhstB0NCpkYrP04z171qyUtPD5+njiLRUkYXHrYQYtdn60/EhuvC/Lc2NK0cElY5wVd", "updatedAt": "2026-10-30T12:00:00.000Z"};

test('a version 1 vault opens and comes back as version 2, with nothing lost', async () => {
  const key = await unlockWithPassphrase(V1_VAULT, 'moon over the water');
  const data = decryptData(key, V1_VAULT.data);
  assert.equal(data.version, 2);
  assert.deepEqual(data.bleeds.map((b) => [b.start, b.end]), [['2026-10-03', '2026-10-07']]);
  assert.equal(data.notes[0].dreams, 'an owl over water');
  assert.deepEqual([data.notes[0].symptoms, data.notes[0].custom], [{}, {}]);
  assert.equal(data.settings.archetypes, true);
  assert.equal(data.settings.length.mode, 'auto');
  // Saved again, it's version 2, and opens the same.
  const again = decryptData(key, encryptData(key, putNote(data, withSymptom(data.notes[0], 'cramps', 2), NOW)));
  assert.equal(again.version, 2);
  assert.deepEqual(again.notes[0].symptoms, { cramps: 2 });
});

test('merging with a copy from an older app keeps the symptoms it doesn’t know about', () => {
  const k = newDataKey();
  let mine = putNote(history(['2026-10-01']), withSymptom(emptyNote('2026-10-02'), 'bloating', 2), NOW);
  mine = changeSettings(mine, { length: { mode: 'range', exact: 28, min: 27, max: 31 } }, NOW);
  // An older app opens it, drops what it doesn't know, and saves without changing when each part was saved.
  const old = JSON.parse(JSON.stringify(mine));
  old.version = 1;
  for (const note of old.notes) {
    delete note.symptoms;
    delete note.custom;
  }
  delete old.settings.length;
  const theirs = decryptData(k, encryptData(k, old));
  for (const merged of [mergeData(theirs, mine), mergeData(mine, theirs)]) {
    assert.deepEqual(merged.notes[0].symptoms, { bloating: 2 });
    assert.equal(merged.settings.length.mode, 'range');
  }
  // A genuinely newer note still wins.
  const newer = putNote(theirs, { ...theirs.notes[0], text: 'later' }, new Date(NOW.getTime() + 60_000));
  assert.equal(mergeData(mine, newer).notes[0].text, 'later');
});

test('nothing new is readable in what is stored', () => {
  const k = newDataKey();
  const data = putNote(history(['2026-10-01']), withSymptom(withSymptom(emptyNote('2026-10-02'), 'cramps', 3), 'Jaw ache', 1, true), NOW);
  const sealed = encryptData(k, changeSettings(data, { length: { mode: 'exact', exact: 27, min: 26, max: 30 } }, NOW));
  for (const word of ['cramps', 'Jaw', 'exact', '2026-10', 'symptoms']) assert.ok(!sealed.includes(word), word);
});
