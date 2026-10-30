// The Celtic course set (courses/celtic/), checked to the Hellenic, Wheel and
// Wicca sets' standard: reconstructionist-informed and honest about its
// sources, keeping the Gaelic and Brythonic streams, respectful of the living
// cultures, keeping the four Gaelic fire festivals and sending people to the
// Wheel's own lessons for their wider history.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkSet, loadSet } from './courseSetChecks.ts';
import { composeProgram, PATH } from '../src/lib/covens/courses/index.ts';

const modules = await loadSet('celtic');
const wheel = await loadSet('wheel');
checkSet('celtic', modules, 'celtic', wheel);

const body = (id: string) => modules.find((m) => m.id === id)!.docs.map((d) => d.body).join('\n');
const everything = modules.flatMap((m) => m.docs.map((d) => d.body)).join('\n');

test('celtic: the sources are named, with their limits', () => {
  const tradition = body('celtic-tradition');
  for (const name of ['Lebor Gabála', 'Mabinogi', 'Cath Maige Tuired', 'Caesar', 'Carmina Gadelica', 'Carmichael', 'Iolo Morganwg', 'Lhuyd']) assert.match(tradition, new RegExp(name), name);
  assert.match(tradition, /written by Christians|Christian scholars/, 'the medieval literature was written by Christians');
  assert.match(tradition, /archaeology/i);
  assert.match(tradition, /know almost nothing of what the druids actually taught/);
});

test('celtic: both streams, and the modern paths told apart', () => {
  for (const word of ['Gaelic', 'Brythonic', 'Irish', 'Scottish Gaelic', 'Manx', 'Welsh', 'Cornish', 'Breton']) assert.match(everything, new RegExp(word), word);
  const paths = body('celtic-tradition');
  for (const name of ['Celtic Reconstructionism', 'Gaelic Polytheism', 'OBOD', 'ADF', 'eclectic']) assert.match(paths, new RegExp(name), name);
  assert.match(paths, /Graves/, 'the tree calendar is Graves’s');
});

test('celtic: respectful of the living cultures, and marks the modern', () => {
  assert.match(everything, /living Christian/);
  assert.match(everything, /closed and living traditions/);
  assert.match(everything, /learn(ing)? (even a little of )?a(ny)? Celtic language|Learning a Celtic language/i);
  for (const m of modules) for (const d of m.docs) assert.match(d.body, /## What's old and what's modern/, `${d.id} marks old and modern`);
  for (const m of modules) for (const d of m.docs) assert.match(d.body, /\*\*Modern:\*\*/, `${d.id} names what is modern`);
  for (const d of modules.flatMap((m) => m.docs)) assert.ok((d.links ?? []).length >= 1);
  assert.ok(modules.some((m) => m.docs.some((d) => (d.links ?? []).some((l) => l.kind === 'closed'))), 'links the closed & living traditions guide');
});

test('celtic: the Otherworld, ogham and the geis are handled with care', () => {
  assert.match(everything, /does not teach summoning/);
  assert.match(everything, /Bridget Cleary/);
  assert.match(body('celtic-initiation'), /literary motif/, 'the geis as a literary motif');
  assert.match(body('celtic-initiation'), /Ogham divination as practised now is \*\*modern\*\*/);
  assert.match(everything, /never cover|may never cover/i, 'oaths never cover harm');
});

test('celtic: the fire festivals send people to the Wheel’s own lessons rather than repeat them', () => {
  const lore = modules.find((m) => m.id === 'celtic-lore')!;
  const festival = lore.stages.flatMap((s) => s.tasks).filter((t) => t.holiday);
  const wheelOf: Record<string, string> = { samhain_gaelic: 'samhain', la_fheile_bride: 'imbolc', bealtaine: 'beltane', lughnasadh: 'lammas' };
  assert.equal(festival.length, 4);
  for (const t of festival) {
    const slug = t.holiday!.split('/')[1];
    assert.deepEqual(t.docs, [`celtic-lore-${slug}`, `wheel-lore-${wheelOf[slug]}`]);
    assert.ok(t.solitary, `${t.title} has a solitary way`);
    assert.ok((t.links ?? []).some((l) => l.kind === 'seasonal'), `${t.title} offers something for the altar`);
  }
});

test('celtic: all five programs compose, with the borrowed Wheel lessons included', () => {
  for (const step of PATH) {
    const p = composeProgram('celtic', step, undefined, 'Celtic')!;
    assert.ok(p, step.key);
    assert.deepEqual(p.missing, [], `${p.id} has every module`);
    for (const t of p.stages.flatMap((s) => s.tasks)) for (const d of t.docs ?? []) assert.ok(p.docs.some((x) => x.id === d), `${p.id}: ${d}`);
  }
  const initiate = composeProgram('celtic', PATH[2], undefined, 'Celtic')!;
  assert.ok(initiate.docs.some((d) => d.id === 'wheel-lore-samhain'));
  assert.ok(initiate.stages.flatMap((s) => s.tasks).some((t) => t.holiday === 'celtic/samhain_gaelic'));
});

test('celtic: every step that needs a coven has a solitary way', () => {
  for (const m of modules) {
    for (const t of m.stages.flatMap((s) => s.tasks)) {
      if (t.kind === 'attend' || t.kind === 'meeting') assert.ok(t.solitary, `${m.id}: ${t.title}`);
    }
  }
});
