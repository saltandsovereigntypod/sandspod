import assert from 'node:assert/strict';
import { test } from 'node:test';

import { add, buildChart, castMothers, dotsIn, FIGURES, figureById, judgeIsEven, motherFromMarks, readChart } from '../src/lib/divination/geomancy.ts';

test('sixteen distinct figures, four per element', () => {
  assert.equal(FIGURES.length, 16);
  assert.equal(new Set(FIGURES.map((f) => f.lines.join(''))).size, 16);
  for (const e of ['Fire', 'Air', 'Water', 'Earth']) assert.equal(FIGURES.filter((f) => f.element === e).length, 4);
  assert.equal(dotsIn(figureById('populus')!), 8);
  assert.equal(dotsIn(figureById('via')!), 4);
});

test('adding figures: odd is one dot, even two; a figure plus itself is Populus', () => {
  const via = figureById('via')!;
  const pop = figureById('populus')!;
  assert.equal(add(via, via).id, 'populus');
  assert.equal(add(via, pop).id, 'via');
  assert.equal(add(figureById('puer')!, figureById('puella')!).id, 'conjunctio');
});

test('the shield is derived correctly', () => {
  const m = ['via', 'populus', 'puer', 'carcer'].map((id) => figureById(id)!);
  const c = buildChart(m);
  // Daughters are the Mothers' rows turned on their side.
  assert.equal(c.daughters[0].lines.join(''), m.map((x) => x.lines[0]).join(''));
  assert.equal(c.daughters[3].lines.join(''), m.map((x) => x.lines[3]).join(''));
  assert.equal(c.nieces[0].id, add(m[0], m[1]).id);
  assert.equal(c.nieces[1].id, add(m[2], m[3]).id);
  assert.equal(c.nieces[2].id, add(c.daughters[0], c.daughters[1]).id);
  assert.equal(c.rightWitness.id, add(c.nieces[0], c.nieces[1]).id);
  assert.equal(c.leftWitness.id, add(c.nieces[2], c.nieces[3]).id);
  assert.equal(c.judge.id, add(c.rightWitness, c.leftWitness).id);
  assert.equal(c.reconciler.id, add(c.judge, m[0]).id);
  assert.equal(c.houses.length, 16);
});

test('the Judge always has an even number of dots, whatever the Mothers', () => {
  let n = 0;
  const rnd = () => ((n = (n * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 2000; i++) assert.ok(judgeIsEven(buildChart(castMothers(rnd)).judge));
  // And exhaustively over every set of Mothers.
  for (let a = 0; a < 16; a++) for (let b = 0; b < 16; b += 3) for (let c = 0; c < 16; c += 5) for (let d = 0; d < 16; d += 7) {
    assert.ok(judgeIsEven(buildChart([FIGURES[a], FIGURES[b], FIGURES[c], FIGURES[d]]).judge));
  }
});

test('marks make a Mother by parity', () => {
  assert.equal(motherFromMarks([1, 2, 3, 4]).id, 'amissio');
  assert.equal(motherFromMarks([1, 1, 1, 1]).id, 'via');
  assert.equal(motherFromMarks([2, 4, 6, 8]).id, 'populus');
  assert.equal(motherFromMarks([9, 2, 2, 2]).id, 'laetitia');
});

test('the reading names the Judge and Witnesses, with no repeated sentence', () => {
  const c = buildChart(['via', 'albus', 'puer', 'carcer'].map((id) => figureById(id)!));
  const r = readChart(c, 'Should I move?', 'home', '2026-11-06');
  assert.match(r.text, new RegExp(c.judge.name));
  assert.match(r.text, /Right Witness/);
  const s = r.text.split(/(?<=[.?!])\s+/).map((x) => x.toLowerCase().trim()).filter((x) => x.length > 25);
  assert.equal(new Set(s).size, s.length);
});
