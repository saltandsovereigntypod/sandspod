import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CLOSED_TRADITIONS } from '../src/lib/library/closed/index.ts';
import { PROGRAMS, beatAt, binauralVoices, breathAt, carriersAt, cleanCustom, compile, cueNow, customProgram, deityProgramId, gainAt, hourCarrier, interpolate, kitProgram, openPrograms, patronChoice, planetNow, programById, programStrikes, programTick, resolveProgram, stageLengths } from '../src/lib/meditation/programs.ts';

test('interpolates piecewise', () => {
  assert.equal(interpolate([10, 6], 0.5), 8);
  assert.equal(interpolate([10, 10, 6], 0.75), 8);
  assert.equal(interpolate([5], 0.9), 5);
});

test('stage lengths scale to any total, the return kept fixed', () => {
  const st = [{ weight: 1 }, { weight: 3 }, { weight: 1, fixedMin: 4 }];
  const l = stageLengths(st, 20 * 60000);
  assert.equal(l[2], 4 * 60000);
  assert.equal(l[1], 3 * l[0]);
  assert.equal(l.reduce((a, b) => a + b, 0), 20 * 60000);
  assert.equal(stageLengths(st, 6 * 60000)[2], 6 * 60000 * 0.35);
});

test('every program compiles at every length, fills its time, and deep ones end in the return', () => {
  for (const p of PROGRAMS) {
    for (const m of p.lengths) {
      const c = compile(resolveProgram(p), m);
      assert.equal(Math.round(c.segments[c.segments.length - 1].endMs), m * 60000);
      if (p.deep) assert.ok(beatAt(c, c.totalMs - 1) >= 12, `${p.id} ends waking`);
      assert.ok(p.cues.every((q) => q.at !== undefined || q.fromEnd !== undefined));
    }
  }
});

test('beat ramps and holds', () => {
  const c = compile(programById('obe')!, 60);
  assert.equal(beatAt(c, 0), 10);
  assert.ok(beatAt(c, c.totalMs - 1) >= 12.9);
  const s = compile(programById('centering')!, 10, { schumann: true });
  assert.equal(beatAt(s, s.totalMs / 2), 7.83);
});

test('binaural voices sit on the lattice and carriers crossfade', () => {
  const c = compile(programById('chakra')!, 21);
  const seg = c.segments[0];
  const v = binauralVoices(c, seg.endMs - 1000);
  assert.ok(v.some((x) => x.key.startsWith('binaural:256:')) && v.some((x) => x.key.startsWith('binaural:288:')));
  assert.equal(carriersAt(c, 1000).length, 1);
});

test('cues, strikes, sleep fade and breath', () => {
  const c = compile(programById('dev-hekate')!, 20);
  assert.ok(c.cues.filter((q) => q.strike).length >= 3);
  assert.ok(cueNow(c, c.cues[0].atMs + 1000));
  assert.equal(cueNow(c, c.cues[0].atMs + 100000)?.text === c.cues[0].text, false);
  const sl = compile(programById('sleep')!, 30);
  assert.equal(gainAt(sl, 0), 1);
  assert.ok(gainAt(sl, sl.totalMs - 60000) < 0.1);
  assert.equal(breathAt(0).phase, 'in');
  assert.equal(breathAt(4000).scale, 1);
  assert.equal(breathAt(10000).scale, 0.55);
  const t = programTick(c, programStrikes(c), -1, 30000);
  assert.ok(t.voices.some((x) => x.key.startsWith('binaural:')));
});

test('planetary hour picks the carrier from the current hour', () => {
  const h = [{ planet: 'Mars', start: new Date(0), end: new Date(1000) }, { planet: 'Venus', start: new Date(1000), end: new Date(2000) }];
  assert.equal(planetNow(h, new Date(1500)), 'Venus');
  assert.equal(planetNow(h, new Date(5000)), null);
  assert.equal(resolveProgram(programById('planetary-hour')!, { planet: 'Venus' }).carrier, 'venus');
  assert.equal(hourCarrier('Saturn'), 'saturn');
  assert.equal(resolveProgram(programById('planetary-hour')!, {}).carrier, 'sun');
});

test('patron mapping', () => {
  assert.equal(deityProgramId({ key: 'traditional/deity/hekate', name: 'Hekate' }), 'dev-hekate');
  assert.equal(deityProgramId({ key: null, name: 'Selene' }), 'dev-artemis');
  assert.equal(deityProgramId({ key: null, name: 'Sekhmet' }), null);
  assert.equal(patronChoice([{ key: null, name: 'Sekhmet', level: 'exploring' }, { key: null, name: 'Freyja', level: 'patron' }]).programId, 'dev-freyja');
  assert.equal(patronChoice([]).programId, 'patron');
  const r = resolveProgram(programById('patron')!, { deity: { key: null, name: 'Sekhmet' } });
  assert.equal(r.carrier, 'mars');
  assert.equal(r.hold, 10);
  assert.equal(r.deep, false);
});

test('closed traditions are left out', () => {
  const ids = CLOSED_TRADITIONS.map((t) => t.id);
  assert.equal(openPrograms(PROGRAMS, ids).length, PROGRAMS.length);
  assert.equal(openPrograms([{ ...PROGRAMS[0], tradition: 'hoodoo' }, PROGRAMS[0]], ids).length, 1);
});

test('custom programs are cleaned and keep a return when deep', () => {
  const s = cleanCustom({ hold: 4, returnMin: 0, carrier: 'bad', bed: 'x', cues: [{ atMin: 3, text: ' hi ' }, { text: '' }] });
  assert.equal(s.returnMin, 3);
  assert.equal(s.carrier, 'om');
  assert.equal(s.cues.length, 1);
  const p = customProgram(s);
  const c = compile(p, p.length);
  assert.ok(beatAt(c, c.totalMs - 1) >= 12);
  assert.equal(kitProgram('moon-dark')?.id, 'dev-hekate');
  assert.equal(kitProgram('wheel_south-samhain')?.id, 'ancestors');
});
