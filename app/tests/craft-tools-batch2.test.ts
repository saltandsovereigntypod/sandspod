import assert from 'node:assert/strict';
import { test } from 'node:test';

import { addPart, blendBlocks, blendProblem, blendSafety, defaultAs, dilution, emptyBlend, normaliseBlend, plantSafety, readBlend } from '../src/lib/craft/kitchen/blend.ts';
import { emptySpot, groupSpots, newWard, normaliseSpot, renewWard, wardDue, wardFromRecord, wardTendKey, wardTendRecord } from '../src/lib/craft/hearth/wards.ts';
import { tendReminders } from '../src/lib/tend/model.ts';
import { keptName, SCRIPTS, scriptPath, spelling, strokesOf, unicodeText, writeIn } from '../src/lib/sigil/alphabets.ts';
import { cleanPath } from '../src/lib/sigil/sigil.ts';
import { activationSteps, emptyGrid, gridProblem, gridProgress, logGrid, normaliseGrid, pointStones, SHAPES, shapePoints } from '../src/lib/craft/crystal/grids.ts';
import { gridIndices, gridLinkOf, gridObjects } from '../src/lib/altar/workings/crystalGrid.ts';
import { emptyPoppet, endPoppet, MAKING_STEPS, poppetObject, poppetProblem, poppetStateOf, tendPoppet } from '../src/lib/altar/workings/poppet.ts';
import { chantLine, emptyKnots, knotObject, knotOrder, knotsLine, knotStateOf, nextKnot, tieKnot, untieKnot } from '../src/lib/altar/workings/knots.ts';

const NOW = '2026-11-06T10:00:00.000Z';

test('blend: safety by form', () => {
  let oil = { ...emptyBlend('oil'), carrierMl: 10, strength: 2 };
  oil = addPart(oil, { name: 'Cinnamon', as: 'oil', parts: 1 });
  oil = addPart(oil, { name: 'Lavender', as: 'oil', parts: 2 });
  oil = addPart(oil, { name: 'Clove', as: 'oil', parts: 1 });
  const notes = blendSafety(oil);
  assert.ok(notes.some((n) => n.level === 'stop' && /Cinnamon/.test(n.title)));
  assert.ok(notes.some((n) => n.level === 'care' && /Clove/.test(n.title)));
  assert.equal(blendProblem(oil), 'Take out what’s marked “stop” before keeping this blend.');
  const d = dilution(oil)!;
  assert.equal(d.parts.find((p) => p.name === 'Cinnamon')!.drops, 0);
  assert.equal(d.parts.find((p) => p.name === 'Clove')!.drops, 1); // held to 0.5%
  assert.equal(d.parts.find((p) => p.name === 'Lavender')!.drops, 3);
  assert.match(d.line, /about 4 drops/);

  const tea = addPart(addPart(emptyBlend('tea'), { name: 'Frankincense', as: 'resin', parts: 1 }), { name: 'Chamomile', as: 'herb', parts: 2 });
  assert.ok(blendSafety(tea).some((n) => n.level === 'stop' && /Frankincense/.test(n.title)));
  assert.ok(blendSafety(tea).some((n) => n.title === 'Pets' && /Chamomile/.test(n.text)));

  const incense = addPart(emptyBlend('incense'), { name: 'Foxglove', as: 'herb', parts: 1 });
  assert.ok(blendSafety(incense).some((n) => n.level === 'stop'));
  assert.ok(blendSafety(addPart(emptyBlend('incense'), { name: 'Rose', as: 'herb', parts: 1 })).some((n) => /resin base/.test(n.text)));
  assert.equal(plantSafety('St. John’s Wort oil')?.skin, 'sun');
  assert.equal(defaultAs('Myrrh', 'incense'), 'resin');
  assert.equal(addPart(emptyBlend(), { name: '  ', as: 'herb', parts: 1 }).parts.length, 0);
});

test('blend: correspondences, pulls and keeping', () => {
  let b = { ...emptyBlend('incense', 'Protection') };
  for (const n of ['Rosemary', 'Basil', 'Frankincense', 'Lavender']) b = addPart(b, { name: n, as: defaultAs(n, 'incense'), parts: 1 });
  const r = readBlend(b);
  assert.ok(r.shared.length > 0);
  assert.ok(r.elements.length > 0);
  assert.ok(r.day);
  assert.ok(r.forIntent.length > 0);
  const blocks = blendBlocks(b);
  assert.equal(blocks[0].type, 'callout');
  assert.ok(blocks.some((x) => x.type === 'numbered_list'));
  const again = normaliseBlend(JSON.parse(JSON.stringify(b)));
  assert.deepEqual(again.parts.map((p) => p.name), ['Rosemary', 'Basil', 'Frankincense', 'Lavender']);
  assert.equal(normaliseBlend(null).form, 'incense');
});

test('wards: due, renewing and To tend reminders', () => {
  const today = new Date(2026, 10, 6, 10);
  const w = { ...newWard('salt', new Date(2026, 9, 1), 'w1'), remind: true };
  assert.equal(w.every, 30);
  assert.equal(wardDue(w, today).due, true);
  const r = renewWard(w, today);
  assert.equal(wardDue(r, today).days, 30);
  const spot = { ...emptySpot('front-door'), wards: [r] };
  const record = wardTendRecord('s1', spot, r, null)!;
  assert.equal(record.key, wardTendKey('w1'));
  assert.equal(record.own?.type, 'warding');
  assert.deepEqual(record.rhythm, { kind: 'every', every: 30 });
  assert.equal(wardTendRecord('s1', spot, { ...r, remind: false }, null), null);
  const rings = tendReminders([record], today, 40);
  assert.ok(rings.length >= 1);
  assert.equal(rings[0].at.getDate(), 6);
  assert.equal(rings[0].at.getMonth(), 11);
  const later = wardFromRecord(r, { ...record, tendedAt: new Date(2026, 11, 1, 12).toISOString() });
  assert.equal(later.renewed, '2026-12-01');
  assert.equal(normaliseSpot({ kind: 'nope', wards: [{ id: 'a', kind: 'iron', every: 9999 }] }).wards[0].every, 730);
  const groups = groupSpots([{ id: 'a', data: { ...emptySpot('window'), area: 'Upstairs' } }, { id: 'b', data: emptySpot('front-door') }]);
  assert.deepEqual(groups.map((g) => g.area), ['The house', 'Upstairs']);
});

test('alphabets: every script writes a word as a clean mark', () => {
  for (const s of SCRIPTS) {
    const w = writeIn(s.id, 'Brigid, Thorn & sing!');
    assert.ok(w.words.length === 3, s.id);
    assert.ok(w.words.every((word) => word.every((l) => l.glyph.length > 0)), s.id);
    assert.ok(cleanPath(scriptPath(s.id, w)), s.id);
    assert.ok(cleanPath(scriptPath(s.id, w, 'column')), s.id);
    assert.ok(strokesOf(s.id, w).length > 0);
  }
  assert.deepEqual(writeIn('theban', 'a!').dropped, ['!']);
  assert.equal(writeIn('theban', 'Will').words[0].length, 5); // W as two Vs
  assert.equal(unicodeText('futhark', writeIn('futhark', 'thing')), 'ᚦᛁᛜ');
  assert.equal(unicodeText('ogham', writeIn('ogham', 'ash oak')), '᚛ᚐᚄᚆ\u1680ᚑᚐᚉ᚜');
  assert.equal(unicodeText('theban', writeIn('theban', 'a')), null);
  assert.match(spelling(writeIn('river', 'Shalom')), /^SH Schin · A Aleph/);
  assert.equal(keptName('celestial', writeIn('celestial', 'Moon')), 'Celestial: MOON');
});

test('grids: shapes, stones and the log', () => {
  for (const s of SHAPES) assert.equal(shapePoints(s.key).length, s.points, s.key);
  const g = { ...emptyGrid('triangle'), intent: 'Calm', centre: { name: 'Amethyst' }, points: [{ name: 'Rose Quartz' }] };
  assert.equal(gridProblem(g), null);
  assert.equal(pointStones(g).length, 3);
  assert.equal(activationSteps(g).length, 6);
  const active = logGrid(normaliseGrid(g), 'activated', 'Lines traced', NOW);
  assert.equal(active.status, 'active');
  assert.equal(gridProgress(active, new Date(Date.parse(NOW) + 2 * 86_400_000)).line, 'Day 3 of 7');
  const objects = gridObjects('g1', g, [], NOW);
  assert.equal(objects.length, 4);
  assert.equal(gridLinkOf(objects[0])?.role, 'centre');
  assert.deepEqual(gridIndices(objects, 'g1'), [0, 1, 2, 3]);
});

test('poppet: consent, making, tending and ending', () => {
  let d = { ...emptyPoppet(), focus: 'other' as const, who: 'My sister', purpose: 'Healing' };
  assert.match(poppetProblem(d)!, /consent|asking/);
  d = { ...d, consent: true };
  // Ticking the making steps is optional: consent, purpose and who are enough.
  assert.equal(poppetProblem(d), null);
  d = { ...d, made: MAKING_STEPS.map((s) => s.id) };
  assert.equal(poppetProblem(d), null);
  const { item, object } = poppetObject(d, [], NOW, undefined, 'p1');
  assert.equal(item.type, 'poppet');
  assert.equal(item.details.poppet_focus, 'Someone else');
  const s = poppetStateOf(object)!;
  assert.deepEqual(s.pins, []);
  const tended = tendPoppet(object, NOW);
  assert.equal(poppetStateOf(tended)!.tendings.length, 1);
  const ended = endPoppet(tended, 'unpick', NOW);
  assert.equal(poppetStateOf(ended)!.ended?.how, 'unpick');
});

test('knots: nine-knot order, tying and untying', () => {
  assert.deepEqual(knotOrder(9), [1, 9, 5, 3, 7, 2, 8, 4, 6]);
  assert.equal(new Set(knotOrder(7)).size, 7);
  assert.equal(chantLine(1, 9, 'bind'), 'By knot of one, the spell’s begun.');
  let o = knotObject({ ...emptyKnots('ladder'), intent: 'A safe home', count: 3, mode: 'release', with: ['A black feather'] }, [], NOW);
  assert.equal(nextKnot(knotStateOf(o)!)?.n, 1);
  o = tieKnot(o, NOW);
  assert.equal(knotStateOf(o)!.knots[0].with, 'A black feather');
  o = tieKnot(tieKnot(o, NOW), NOW);
  assert.equal(nextKnot(knotStateOf(o)!), null);
  assert.equal(tieKnot(o, NOW), o);
  o = untieKnot(untieKnot(untieKnot(o, NOW), NOW), NOW);
  assert.equal(knotStateOf(o)!.ended?.how, 'untied');
  assert.match(knotsLine(knotStateOf(o)!), /^All untied/);
});
