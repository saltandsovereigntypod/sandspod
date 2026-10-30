// The Wicca course set (courses/wicca/), checked to the Hellenic and Wheel
// sets' standard: public, non-oathbound Wicca, honest about British
// Traditional Wicca and its history, keeping the Wheel's eight festivals and
// sending people to the Wheel's own lessons for their history.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkSet, loadSet } from './courseSetChecks.ts';
import { composeProgram, PATH } from '../src/lib/covens/courses/index.ts';

const modules = await loadSet('wicca');
const wheel = await loadSet('wheel');
checkSet('wicca', modules, 'wheel', wheel);

const body = (id: string) => modules.find((m) => m.id === id)!.docs.map((d) => d.body).join('\n');
const everything = modules.flatMap((m) => m.docs.map((d) => d.body)).join('\n');

test('wicca: the history is told honestly, names and dates', () => {
  const history = body('wicca-tradition');
  for (const name of ['Gardner', 'Valiente', 'Leland', 'Murray', 'Crowley', 'Cunningham', 'Sanders', 'Buckland', 'Hutton']) assert.match(history, new RegExp(name), name);
  assert.match(history, /Charge of the Goddess/);
  assert.match(history, /1964/, 'the Rede made public in 1964');
  assert.match(history, /High Magic's Aid/, 'the Threefold Law’s first appearance');
  assert.match(history, /variously|in very different ways/, 'the Threefold Law is variously held');
});

test('wicca: British Traditional Wicca is named as initiatory and oathbound, and its material is not taught', () => {
  assert.match(everything, /British Traditional Wicca/);
  assert.match(everything, /Gardnerian/);
  assert.match(everything, /Alexandrian/);
  assert.match(everything, /oathbound/);
  assert.match(everything, /not taught here|does \*\*not\*\* teach|is \*\*not taught in this course\*\*/);
  assert.match(body('wicca-tradition'), /eclectic/i);
  // Every lesson that touches drawing down or the degrees says it describes only what is public.
  assert.match(body('wicca-ritual'), /publicly/);
  assert.match(body('wicca-initiation'), /public terms|publicly/);
});

test('wicca: consent and safety where Wicca most needs them', () => {
  assert.match(everything, /skyclad/i);
  assert.match(everything, /never required|never expected/i);
  assert.match(everything, /in token/);
  assert.match(everything, /No genuine coven requires sex/);
  assert.match(everything, /never cover|may never cover/i, 'oaths never cover harm');
  assert.match(everything, /carrying a blade in public/, 'the athame and the law');
});

test('wicca: the sabbats send people to the Wheel’s own lessons rather than repeat them', () => {
  const lore = modules.find((m) => m.id === 'wicca-lore')!;
  const festival = lore.stages.flatMap((s) => s.tasks).filter((t) => t.holiday);
  assert.equal(festival.length, 8);
  for (const t of festival) {
    const slug = t.holiday!.split('/')[1];
    assert.deepEqual(t.docs, [`wicca-lore-${slug}`, `wheel-lore-${slug}`]);
    assert.ok(t.solitary, `${t.title} has a solitary way`);
  }
});

test('wicca: all five programs compose, with the borrowed Wheel lessons included', () => {
  for (const step of PATH) {
    const p = composeProgram('wicca', step, undefined, 'Wicca')!;
    assert.ok(p, step.key);
    assert.deepEqual(p.missing, [], `${p.id} has every module`);
    for (const t of p.stages.flatMap((s) => s.tasks)) for (const d of t.docs ?? []) assert.ok(p.docs.some((x) => x.id === d), `${p.id}: ${d}`);
  }
  const initiate = composeProgram('wicca', PATH[2], undefined, 'Wicca')!;
  assert.ok(initiate.docs.some((d) => d.id === 'wheel-lore-samhain'));
  assert.ok(initiate.stages.flatMap((s) => s.tasks).some((t) => t.holiday === 'wheel/samhain'));
});

test('wicca: every step that needs a coven has a solitary way', () => {
  for (const m of modules) {
    for (const t of m.stages.flatMap((s) => s.tasks)) {
      if (t.kind === 'attend' || t.kind === 'meeting') assert.ok(t.solitary, `${m.id}: ${t.title}`);
    }
  }
});
