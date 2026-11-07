import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readFileSync } from 'node:fs';
import { addDraftPin, emptyPoppet, makePin, MAKING_STEPS, poppetObject, poppetStateOf, holdCount, pinPoppet, setLook, tendPoppet, unpinPoppet } from '../src/lib/altar/workings/poppet.ts';
import { BODY_ART, BODY_COLOURS, bodyToPicture, colourMeaning, dyeMatrix, EYES, lookWords, MAX_PINS, partPath, pictureToBody, PIN_COLOURS, pinAngle, poppetPlan, snapPin, zonePoint } from '../src/lib/altar/workings/poppetLook.ts';

const NOW = '2026-11-07T10:00:00.000Z';
const manifest = readFileSync(new URL('../src/lib/altar/assetManifest.ts', import.meta.url), 'utf8');
const packed = (path: string) => new RegExp(`'${path}': \\{[^}]*crop: \\{`).test(manifest);

test('poppet look: every part has a packed picture', () => {
  const paths = [...Object.values(BODY_ART).map((b) => b.path), ...EYES.filter((e) => e.path).map((e) => e.path), 'assets/altar/poppet/pin/head.png', 'assets/altar/poppet/pin/glint.png', 'assets/altar/poppet/pin/stub.png'];
  for (const p of paths) assert.ok(packed(p), p);
  const plan = poppetPlan({ body: 'cloth', eyes: 'cross' }, [{ x: 0.5, y: 0.5, colour: 'red' }])!;
  for (const part of ['body', 'eye', 'pinHead', 'pinGlint', 'pinStub'] as const) assert.ok(packed(partPath(plan, part)), part);
});

test('poppet look: dye keeps shading and only dyes the full bodies fully', () => {
  // A pixel at the median brightness becomes the dye colour.
  const m = dyeMatrix([112, 24, 30], 0.5, 1);
  const g = 0.5;
  const r = m[0] * g + m[1] * g + m[2] * g;
  assert.ok(Math.abs(r - 112 / 255) < 1e-6);
  assert.equal(m.length, 20);
  assert.deepEqual(m.slice(15), [0, 0, 0, 1, 0]);
  const cloth = poppetPlan({ body: 'cloth', colour: 'red' })!;
  const clay = poppetPlan({ body: 'clay', colour: 'red' })!;
  const bodyStep = (p: NonNullable<typeof cloth>) => p.steps.find((s) => s.kind === 'image' && s.part === 'body') as { matrix: number[] | null };
  assert.ok(bodyStep(clay).matrix![0] > bodyStep(cloth).matrix![0] - 0.2, 'clay keeps much of its own colour');
  assert.equal(bodyStep(poppetPlan({ body: 'cloth' })!).matrix, null);
  assert.equal(poppetPlan({ body: 'paper' }), null);
  assert.equal(poppetPlan({ body: 'corn' })!.body, 'husk');
  // Every dye colour carries its candle's meaning.
  for (const c of BODY_COLOURS) assert.ok(colourMeaning(c.key), c.key);
});

test('poppet look: eyes, pins and their depth', () => {
  const none = poppetPlan({ body: 'wax', eyes: 'none' })!;
  assert.equal(none.steps.filter((s) => s.kind !== 'pucker' && s.part === 'eye').length, 0);
  const button = poppetPlan({ body: 'wax', eyes: 'button' }, [{ x: 0.5, y: 0.4, colour: 'black' }])!;
  assert.equal(button.steps.filter((s) => s.kind === 'image' && s.part === 'eye').length, 2);
  // Each pin: a pucker, two shadows, the stub, the tinted head and its glint.
  assert.equal(button.steps.filter((s) => s.kind === 'pucker').length, 1);
  assert.equal(button.steps.filter((s) => s.kind === 'shadow' && s.part.startsWith('pin')).length, 2);
  const head = button.steps.find((s) => s.kind === 'image' && s.part === 'pinHead') as { matrix: number[] };
  assert.ok(head.matrix);
  assert.equal(pinAngle(0.5, 0.4), pinAngle(0.5, 0.4));
  assert.ok(Math.abs(pinAngle(0.2, 0.7)) <= 14);
  assert.equal(PIN_COLOURS.find((c) => c.key === 'black')!.meaning.includes('Banishing'), true);
});

test('poppet look: tapping snaps to a zone or stays free, and picture coordinates round-trip', () => {
  const heart = zonePoint('cloth', 'heart');
  assert.equal(snapPin('cloth', heart[0] + 0.02, heart[1] + 0.01).zone, 'heart');
  assert.equal(snapPin('cloth', 0.3, 0.68).zone, 'free');
  const [px, py] = bodyToPicture('root', 0.4, 0.6);
  const [bx, by] = pictureToBody('root', px, py);
  assert.ok(Math.abs(bx - 0.4) < 1e-9 && Math.abs(by - 0.6) < 1e-9);
});

test('poppet: the look and pins are kept, pins in and out are logged moments', () => {
  let d = { ...emptyPoppet(), purpose: 'Healing', made: MAKING_STEPS.map((s) => s.id) };
  d = setLook(d, { body: 'wax', colour: 'green', eyes: 'seam', stuffing: 'wool', taglock: 'name', seal: 'breath' });
  assert.equal(d.body, 'wax');
  d = addDraftPin(d, makePin({ x: 0.5, y: 0.4, zone: 'heart' }, 'white', '  for rest  ', NOW));
  const { item, object } = poppetObject(d, [], NOW, undefined, 'p2');
  assert.match(item.notes, /Green wax poppet, with closed seams for eyes, filled with wool, linked by name on paper, sealed with breath/);
  const s = poppetStateOf(object)!;
  assert.equal(s.look?.colour, 'green');
  assert.equal(s.pins.length, 1);
  assert.equal(s.pins[0].note, 'for rest');
  assert.equal(s.pins[0].meaning, PIN_COLOURS[1].meaning);
  const pinned = pinPoppet(object, makePin({ x: 0.2, y: 0.8, zone: 'free' }, 'red', '', NOW), NOW);
  assert.equal(poppetStateOf(pinned)!.pins.length, 2);
  const out = unpinPoppet(pinned, 0, NOW, 'thank you');
  const after = poppetStateOf(out)!;
  assert.equal(after.pins.length, 1);
  assert.equal(after.pins[0].colour, 'red');
  assert.deepEqual(after.tendings.map((t) => t.kind), ['pin', 'unpin']);
  assert.match(after.tendings[1].text, /Took out the White pin in the heart: for rest \(thank you\)/);
  assert.equal(holdCount(poppetStateOf(tendPoppet(out, NOW))!), 1);
  assert.ok(MAX_PINS >= 7);
  // An older poppet with no look still reads, with no look.
  assert.equal(lookWords({ body: 'clay' }), 'Clay poppet');
});
