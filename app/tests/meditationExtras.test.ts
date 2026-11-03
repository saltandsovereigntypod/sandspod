import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cleanExtras, extrasParams, logParams, NO_EXTRAS } from '../src/lib/meditation/extras.ts';
import { breathSquareSvg, candleSvg, mandalaSvg, moonSvg, sigilFocusSvg, squarePoint } from '../src/lib/meditation/focus.ts';
import { newSit, normalizeSit, promptsFor, SIT_KINDS, type SitEntry } from '../src/lib/meditation/log.ts';
import { guruBead, malaLine, malaMinutes, startMala, tapBead, undoBead } from '../src/lib/meditation/mala.ts';
import { beforeAfter, beforeAfterLines } from '../src/lib/meditation/patterns.ts';
import { focusFor, programmeRun, runActive, sabbatProgress, suggestionsFor, todayProgrammes } from '../src/lib/meditation/programmes.ts';
import { lineAt, lineSlotMs, presetParams, presetPlan, SCRIPTS } from '../src/lib/meditation/scripts.ts';
import { binauralAt, bowlStrikes, callbackStart, cleanMix, cleanShared, frameAt, masterAt, mixLine, soundTick, strikesDue, withShared } from '../src/lib/meditation/sound.ts';
import { binauralSamples, callbackBeats, drumLoopBeats, drumSamples, fitHz, wavBytes } from '../src/lib/meditation/synth.ts';
import { cleanPlan } from '../src/lib/meditation/timer.ts';
import { sitTogetherOf, sitTogetherStart } from '../src/lib/meditation/together.ts';
import { altarChoiceGroups, altarChoicesOf, applyAltarChoice, sitStepOf } from '../src/lib/covens/altarActions.ts';

const MIN = 60_000;

test('script lines are paced to the sit, fade in and out, and the last one stays', () => {
  const s = { lines: ['a', 'b', 'c', 'd'] };
  // A 10-minute sit: the lines share the first nine tenths.
  assert.equal(lineSlotMs(4, 10 * MIN), 135_000 > 120_000 ? 120_000 : 135_000);
  assert.equal(lineSlotMs(10, 3 * MIN), 16_200);
  assert.equal(lineSlotMs(10, 30_000), 10_000);
  assert.equal(lineSlotMs(10, null), 45_000);
  assert.equal(lineAt(s, -1, 10 * MIN), null);
  const slot = lineSlotMs(4, 4 * MIN);
  assert.deepEqual(lineAt(s, 0, 4 * MIN), { index: 0, opacity: 0 });
  assert.deepEqual(lineAt(s, 1500, 4 * MIN), { index: 0, opacity: 0.5 });
  assert.equal(lineAt(s, slot - 1500, 4 * MIN)!.opacity, 0.5);
  assert.equal(lineAt(s, slot + 5000, 4 * MIN)!.index, 1);
  assert.deepEqual(lineAt(s, 3 * slot + 60_000, 4 * MIN), { index: 3, opacity: 1 });
  assert.equal(lineAt(s, 60 * MIN, 4 * MIN)!.index, 3);
  for (const x of SCRIPTS) {
    assert.ok(x.lines.length >= 10, x.id);
    assert.ok(x.lines.every((l) => !l.includes('!')), x.id);
  }
});

test('presets: Ground & centre is three minutes, Clearing five, with their guidance', () => {
  assert.equal(presetPlan('ground').minutes, 3);
  assert.equal(presetPlan('clearing').minutes, 5);
  const p = presetParams('clearing');
  assert.equal(cleanPlan(p).minutes, 5);
  assert.equal(cleanExtras(p).script, 'clearing');
});

test('a coven step can start a timed sit for everyone', () => {
  const step = { details: {}, instructions: 'x' };
  assert.ok(altarChoiceGroups().some((g) => g.options.some((o) => o.value === 'sit:ground')));
  const patch = applyAltarChoice(step, 'sit:ground');
  assert.equal(patch.details.sit_preset, 'ground');
  assert.deepEqual(altarChoicesOf({ details: patch.details }), ['sit:ground']);
  assert.equal(sitStepOf({ details: patch.details })!.minutes, 3);
  assert.equal(applyAltarChoice({ details: patch.details }, '').details.sit_preset, undefined);
  assert.equal(sitStepOf({ details: { sit_preset: 'nope' } }), null);
});

test('the mala counts beads and rounds, and the guru bead closes a round', () => {
  let m = startMala(27);
  assert.equal(startMala(5).size, 108);
  let ev = '';
  for (let i = 0; i < 26; i++) ({ mala: m, event: ev } = tapBead(m, 1000 + i));
  assert.equal(ev, 'bead');
  assert.equal(m.bead, 26);
  ({ mala: m, event: ev } = tapBead(m, 2000));
  assert.equal(ev, 'round');
  assert.deepEqual([m.bead, m.rounds, m.total, m.startedAt], [0, 1, 27, 1000]);
  assert.equal(guruBead(m).event, 'none');
  m = tapBead(tapBead(m, 3000).mala, 3001).mala;
  const g = guruBead(m);
  assert.equal(g.event, 'guru');
  assert.deepEqual([g.mala.bead, g.mala.rounds, g.mala.total], [0, 2, 29]);
  assert.equal(malaLine(g.mala), '0 of 27 · 2 rounds · 29 in all');
  const back = undoBead(startMala(27));
  assert.equal(back.total, 0);
  const u = undoBead(tapBead(startMala(27), 0).mala);
  assert.deepEqual([u.bead, u.total], [0, 0]);
  assert.equal(malaMinutes(m, 1000 + 4 * MIN), 4);
  assert.equal(malaMinutes(startMala(27), 0), 0);
});

const entry = (id: string, at: string, more: Record<string, unknown> = {}): SitEntry => ({ id, data: normalizeSit({ at, minutes: 10, kind: 'grounding', ...more }) });

test('before and after are kept, and Patterns shows the change', () => {
  const s = newSit({ at: '2026-11-01T08:00:00Z', minutes: 10, before: 2, after: 4, intention: '  Steady  ', mantra: 'om', count: 108, steps: 0 });
  assert.deepEqual([s.before, s.after, s.intention, s.mantra, s.count, s.steps], [2, 4, 'Steady', 'om', 108, undefined]);
  assert.equal(normalizeSit({ at: '2026-11-01T08:00:00Z', before: 9 }).before, undefined);
  assert.ok(SIT_KINDS.some((k) => k.value === 'mantra'));
  assert.equal(promptsFor('pathworking').length, 2);
  const list = [entry('a', '2026-11-01T08:00:00Z', { before: 2, after: 4 }), entry('b', '2026-11-02T08:00:00Z', { before: 3, after: 4 }), entry('c', '2026-11-03T08:00:00Z', { before: 4, after: 4 }), entry('d', '2026-11-03T09:00:00Z', { before: 3 })];
  const b = beforeAfter(list);
  assert.deepEqual([b.pairs, b.before, b.after, b.change, b.up, b.same, b.down], [3, 3, 4, 1, 2, 1, 0]);
  assert.deepEqual(b.byKind, [{ label: 'Grounding & centring', pairs: 3, change: 1 }]);
  const lines = beforeAfterLines(b);
  assert.equal(lines[0], 'Before a sit you’ve felt 3 of 5 on average, and after, 4.');
  assert.equal(lines[1], '2 of 3 sits left you feeling better than when you began.');
  assert.deepEqual(beforeAfterLines(beforeAfter(list.slice(0, 2))), []);
});

test('extras survive being passed as strings, and go on to the log', () => {
  const mix = cleanMix({ levels: { rain: 0.5, drum: 0.8 }, tempo: 4.4 });
  const e = { ...NO_EXTRAS, kind: 'walking' as const, script: 'body' as const, focus: 'candle' as const, sound: mix, intention: 'Calm', before: 2, programme: 'grounding7', step: '3' };
  const back = cleanExtras(extrasParams(e));
  assert.deepEqual(back, { ...e, sigil: '' });
  assert.deepEqual(cleanExtras({}), NO_EXTRAS);
  assert.equal(cleanExtras({ sound: '{bad' }).sound, null);
  const log = logParams({ at: '2026-11-03T08:00:00.000Z', minutes: 10 }, back, { after: 4, steps: 900 });
  assert.deepEqual(log, { at: '2026-11-03T08:00:00.000Z', minutes: '10', timed: '1', kind: 'walking', script: 'body', intention: 'Calm', before: '2', after: '4', steps: '900', programme: 'grounding7', step: '3' });
});

test('programme progress is read from the log, and a day 1 starts a new run', () => {
  const now = new Date(2026, 10, 3, 20);
  const day = (d: number, step: string, programme = 'grounding7') => entry(`${programme}${d}${step}`, new Date(2026, 10, d, 8).toISOString(), { programme, step });
  const none = programmeRun([], 'grounding7', now);
  assert.deepEqual([none.done, none.next, none.started, none.complete], [0, 1, null, false]);
  const run = programmeRun([day(1, '1'), day(2, '2'), day(2, '2')], 'grounding7', now);
  assert.deepEqual([run.done, run.today, run.next], [2, false, 3]);
  assert.ok(runActive(run, now));
  const today = programmeRun([day(1, '1'), day(2, '2'), day(3, '3')], 'grounding7', now);
  assert.deepEqual([today.done, today.today, today.next], [3, true, 3]);
  const again = programmeRun([day(1, '1'), day(2, '2'), day(3, '1')], 'grounding7', now);
  assert.equal(again.done, 1);
  const full = programmeRun([1, 2, 3, 4, 5, 6, 7].map((d) => entry(`f${d}`, new Date(2026, 9, d, 8).toISOString(), { programme: 'grounding7', step: String(d) })), 'grounding7', now);
  assert.ok(full.complete);
  assert.ok(!runActive(full, now));
  assert.equal(focusFor('grounding7', 3, now).title, 'The body');
  assert.ok(focusFor('moon28', 1, now).title);
  const lines = todayProgrammes([day(1, '1'), day(2, '2')], [{ id: 'samhain', name: 'Samhain', date: '2026-11-03' }], now);
  assert.deepEqual(
    lines.map((l) => l.title),
    ['7 days of grounding', 'A sit for Samhain'],
  );
});

test('Sabbat sits count one for each festival this year', () => {
  const now = new Date(2026, 10, 3, 12);
  const festivals = [
    { id: 'imbolc', name: 'Imbolc', date: '2026-02-01' },
    { id: 'samhain', name: 'Samhain', date: '2026-11-03' },
    { id: 'yule', name: 'Yule', date: '2026-12-21' },
  ];
  const sits = [entry('a', '2026-02-01T10:00:00Z', { programme: 'sabbats', step: 'imbolc' }), entry('b', '2025-12-21T10:00:00Z', { programme: 'sabbats', step: 'yule' })];
  const p = sabbatProgress(sits, festivals, now);
  assert.deepEqual(p.done, ['imbolc']);
  assert.equal(p.total, 3);
  assert.equal(p.today?.id, 'samhain');
  assert.equal(p.next?.id, 'yule');
  const s = suggestionsFor(now, [festivals[1]], [{ name: 'Hekate', level: 'patron' }, { name: 'Brigid', level: 'exploring' }]);
  assert.equal(s.length, 3);
  assert.equal(s[1].step, 'samhain');
  assert.equal(s[2].title, 'Sitting with Hekate');
});

test('the sound mix fades in and out and stops with the timer', () => {
  const plan = cleanPlan({ minutes: 10, settle: 1, warm: 1 });
  assert.equal(masterAt(plan, -5), 0);
  assert.equal(masterAt(plan, 6000), 0.5);
  assert.equal(masterAt(plan, 5 * MIN), 1);
  assert.equal(masterAt(plan, 12 * MIN - 6000), 0.5);
  assert.equal(masterAt(plan, 12 * MIN), 0);
  const open = cleanPlan({ minutes: 'open' });
  assert.equal(masterAt(open, 60 * MIN), 1);
  assert.equal(masterAt(open, 61 * MIN, 60 * MIN), 0);
  const mix = cleanMix({ levels: { rain: 0.5, drone: 0.8, nope: 1 }, key: 'G' });
  assert.deepEqual(Object.keys(mix.levels).sort(), ['drone', 'rain']);
  assert.equal(mixLine(mix), 'Drone in G · Rain');
  assert.deepEqual(frameAt(mix, plan, 12 * MIN), []);
  const f = frameAt(mix, plan, 5 * MIN);
  assert.deepEqual(
    f.map((v) => v.key),
    ['rain', 'drone:195.99'],
  );
  assert.equal(f[0].volume, 0.5);
  // Binaural layers come with a soft pink under them when no noise is chosen.
  const bin = frameAt(cleanMix({ levels: { binaural: 0.8 }, binaural: 'alpha', carrier: 150 }), plan, 5 * MIN);
  assert.deepEqual(
    bin.map((v) => v.key),
    ['pink', 'binaural:150:10'],
  );
});

test('the drum plays through the sit and calls you back at the end', () => {
  const plan = cleanPlan({ minutes: 10, settle: 1 });
  const mix = cleanMix({ levels: { drum: 0.8 }, tempo: 4.5 });
  const cb = callbackStart(mix, plan)!;
  assert.equal(cb, 11 * MIN - callbackBeats(4.5).seconds * 1000);
  assert.deepEqual(frameAt(mix, plan, 30_000), []);
  const d = frameAt(mix, plan, 2 * MIN);
  assert.equal(d[0].key, 'drum:4.5');
  assert.equal(d[0].atMs, MIN);
  const c = frameAt(mix, plan, cb + 1000);
  assert.deepEqual([c[0].key, c[0].atMs], ['callback:4.5', 1000]);
  assert.equal(callbackStart(mix, cleanPlan({ minutes: 2 })), null);
  assert.equal(callbackStart(mix, cleanPlan({ minutes: 'open' })), null);
  // Three rounds of seven, a quick run, and three of seven again.
  const beats = callbackBeats(4.5);
  assert.equal(beats.beats.filter((b) => b.strong).length >= 42, true);
  assert.ok(beats.seconds > 40 && beats.seconds < 70);
});

test('bowls are struck in rounds, the latest only, and only when fresh', () => {
  const plan = cleanPlan({ minutes: 2 });
  const mix = cleanMix({ levels: { bowls: 0.5 }, bowlSet: 'both', bowlEvery: 15 });
  const strikes = bowlStrikes(mix, plan);
  assert.deepEqual(
    strikes.map((s) => s.tone),
    [0, 1, 2, 3, 4, 5, 6, 7],
  );
  assert.deepEqual(strikesDue(strikes, -1, 0), [strikes[0]]);
  assert.deepEqual(strikesDue(strikes, 0, 31_000), [strikes[2]]);
  assert.deepEqual(strikesDue(strikes, 0, 40_000), []);
  const t = soundTick(mix, plan, strikes, 14_000, 15_500);
  assert.equal(t.strike?.key, 'bowl:293.66');
  assert.equal(bowlStrikes(cleanMix({}), plan).length, 0);
});

test('the slow descent moves from alpha to theta', () => {
  const plan = cleanPlan({ minutes: 30 });
  const mix = cleanMix({ levels: { binaural: 0.5 }, binaural: 'descent' });
  assert.deepEqual(binauralAt(mix, plan, 0), [{ beat: 10, weight: 1 }]);
  const mid = binauralAt(mix, plan, 9 * MIN);
  assert.equal(mid.length, 2);
  assert.deepEqual(binauralAt(mix, plan, 30 * MIN), [{ beat: 5, weight: 1 }]);
  assert.deepEqual(binauralAt(cleanMix({ binaural: 'custom', beat: 3 }), plan, 0), [{ beat: 3, weight: 1 }]);
});

test('sounds are made seamless: whole cycles, whole beats', () => {
  assert.equal(fitHz(201.3), 201.25);
  const loop = drumLoopBeats(4.5);
  assert.equal(loop.beats.length % 4, 0);
  assert.ok(Math.abs(loop.seconds * 4.5 - loop.beats.length) < 1e-9);
  const pcm = binauralSamples(150, 6, 2000);
  assert.equal(pcm.channels.length, 2);
  // The loop's last sample leads straight into its first.
  const [l] = pcm.channels;
  assert.ok(Math.abs(l[l.length - 1] - (0.5 * Math.sin((-2 * Math.PI * 150) / 2000))) < 1e-3);
  const wav = wavBytes({ rate: 8000, channels: [new Float32Array([0, 1, -1])], loop: true });
  assert.equal(wav.length, 44 + 6);
  assert.equal(String.fromCharCode(...wav.slice(0, 4)), 'RIFF');
  assert.equal(drumSamples(4.5, 4000).channels[0].length, Math.round(loop.seconds * 4000));
});

test('a sit together can carry a shared drum or bowls, in step', () => {
  const s = sitTogetherStart(cleanPlan({ minutes: 20 }), new Date('2026-11-03T19:30:00Z'), '', '', { layer: 'drum', tempo: 5, bowlSet: 'chakras', bowlEvery: 30 });
  const got = sitTogetherOf({ source: s.source, started_at: null, status: 'gathering' })!;
  assert.deepEqual(got.sound, { layer: 'drum', tempo: 5, bowlSet: 'chakras', bowlEvery: 30 });
  assert.equal(sitTogetherOf({ source: sitTogetherStart(cleanPlan({}), null).source, started_at: null, status: 'gathering' })!.sound, null);
  assert.equal(cleanShared({ layer: 'harp' }), null);
  const mine = cleanMix({ levels: { rain: 0.5 }, tempo: 3 });
  const both = withShared(mine, got.sound)!;
  assert.deepEqual(both.levels, { drum: 0.5, rain: 0.5 });
  assert.equal(both.tempo, 5);
});

test('focus pictures are drawn from the time', () => {
  assert.notEqual(candleSvg(0), candleSvg(700));
  assert.ok(moonSvg(new Date(2026, 10, 3)).startsWith('<svg'));
  assert.ok(mandalaSvg(0).includes('<polygon'));
  assert.ok(sigilFocusSvg({ d: 'M 10 10 L 90 90', ring: true }, 30_000).includes('rotate(90 50 50)'));
  const box = { inhale: 4, hold: 4, exhale: 4, rest: 4 };
  assert.deepEqual(squarePoint(box, 0), { x: 15, y: 85 });
  assert.deepEqual(squarePoint(box, 2000), { x: 15, y: 50 });
  assert.deepEqual(squarePoint(box, 6000), { x: 50, y: 15 });
  assert.deepEqual(squarePoint(box, 10_000), { x: 85, y: 50 });
  assert.deepEqual(squarePoint(box, 14_000), { x: 50, y: 85 });
  assert.ok(breathSquareSvg(box, 0).includes('cx="15"'));
});
