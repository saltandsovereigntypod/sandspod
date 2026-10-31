// The Norse & Heathen course set (courses/norse/), checked to the Hellenic,
// Wheel, Wicca and Celtic sets' standard: reconstructionist-informed and
// honest about its sources (the Eddas, skalds, sagas, Snorri and his biases,
// runestones, archaeology), reconstruction told apart from modern practice,
// plainly inclusive (the racist misuse of Heathen symbols and folkish ideology
// named and rejected, Declaration 127), keeping the seven Norse holy days and
// linking the Norse deities, journeys, rituals, rune draws and seasonal objects.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkSet, loadSet } from './courseSetChecks.ts';
import { composeProgram, PATH } from '../src/lib/covens/courses/index.ts';

const modules = await loadSet('norse');
const wheel = await loadSet('wheel');
checkSet('norse', modules, 'norse', wheel);

const body = (id: string) => modules.find((m) => m.id === id)!.docs.map((d) => d.body).join('\n');
const everything = modules.flatMap((m) => m.docs.map((d) => d.body)).join('\n');
const links = modules.flatMap((m) => [...m.docs.flatMap((d) => d.links ?? []), ...m.stages.flatMap((s) => s.tasks.flatMap((t) => t.links ?? []))]);
const has = (kind: string, id: string) => links.some((l) => l.kind === kind && l.id === id);

test('norse: the sources are named, with their limits, and Snorri read with care', () => {
  const tradition = body('norse-tradition');
  for (const name of ['Poetic Edda', 'Codex Regius', 'Völuspá', 'Hávamál', 'skald', 'Heimskringla', 'Tacitus', 'Adam of Bremen', 'Ibn Fadlan', 'Bede', 'Saxo', 'runestones', 'Uppåkra', 'Jacob Grimm']) assert.match(tradition, new RegExp(name), name);
  assert.match(tradition, /by Christians/, 'the Eddas and sagas were written down by Christians');
  assert.match(tradition, /euhemerism/, 'Snorri’s euhemerism');
  assert.match(tradition, /handbook for poets/);
  assert.match(tradition, /Hotherus/, 'Saxo’s Baldr compared with Snorri’s');
});

test('norse: reconstruction told apart from modern practice, in every lesson', () => {
  const tradition = body('norse-tradition');
  for (const word of ['reconstruction', 're-creation', 'innovation', 'UPG', 'Ásatrúarfélagið', 'The Troth', 'Forn S']) assert.match(tradition, new RegExp(word), word);
  for (const m of modules) for (const d of m.docs) {
    assert.match(d.body, /## What's old and what's modern/, `${d.id} marks old and modern`);
    assert.match(d.body, /\*\*Modern:\*\*/, `${d.id} names what is modern`);
  }
  assert.match(body('norse-tradition'), /\*\*innovation:\*\* things that are new, such as[^.]*Nine Noble Virtues/);
  assert.match(body('norse-initiation'), /blank rune/);
  assert.match(body('norse-initiation'), /von List/);
  assert.match(body('norse-lore'), /no heathen equinox festival is recorded/);
});

test('norse: the far-right misuse is named and rejected, and the set is inclusive', () => {
  const misuse = modules.find((m) => m.id === 'norse-tradition')!.docs.find((d) => d.id === 'norse-tradition-symbols-and-misuse')!.body;
  assert.match(misuse, /Declaration 127/);
  assert.match(misuse, /verse 127 of the \*\*Hávamál/);
  assert.match(misuse, /Black Sun/);
  assert.match(misuse, /Wewelsburg/);
  assert.match(misuse, /folkish/);
  for (const m of ['norse-seeker', 'norse-tradition', 'norse-devotion', 'norse-elder', 'norse-high-priestess']) assert.match(body(m), /every ancestry/, `${m} says the gods are open to every ancestry`);
  assert.match(everything, /A DNA test is never needed/);
  assert.match(everything, /does not teach animal sacrifice/);
  assert.match(everything, /No oath may cover harm|may never cover/);
});

test('norse: respectful of living cultures, and links the closed & living traditions guide', () => {
  assert.match(everything, /living Christian/);
  assert.match(everything, /Sámi/);
  assert.match(everything, /closed and living traditions/);
  assert.ok(has('closed', ''), 'the guide itself');
  assert.ok(has('closed', 'sami'), 'the Sámi entry');
});

test('norse: links the Norse deities, their journeys, the rituals, the rune draws and the calendars', () => {
  for (const d of ['odin', 'thor', 'frigg', 'tyr', 'freyr', 'freyja', 'njord', 'skadi', 'heimdall', 'baldur', 'idunn', 'loki', 'hel', 'norns']) assert.ok(has('library', `traditional:deity:${d}`), d);
  for (const j of ['path-norse', 'deity-odin', 'deity-thor', 'deity-freyja', 'deity-freyr', 'deity-frigg', 'deity-tyr', 'deity-skadi', 'deity-loki', 'deity-hel', 'deity-baldur', 'deity-idunn']) assert.ok(has('journey', j), j);
  for (const r of ['folk-simple-blot', 'folk-havamal-reflection', 'folk-jol-rune-casting', 'hedge-house-spirit-offering']) assert.ok(has('premade', r), r);
  for (const s of ['one-rune', 'three-runes', 'five-rune-cross', 'nine-rune-cast', 'nine-worlds']) assert.ok(has('spread', s), s);
  for (const o of ['drinking-horn', 'hlautbolli', 'midsummer-birch', 'odins-sheaf', 'yule-goat']) assert.ok(has('seasonal', o), o);
  assert.ok(links.some((l) => l.kind === 'holy' && l.id.startsWith('icelandic-')), 'the Old Icelandic calendar');
});

test('norse: the seven holy days, with the Wheel’s lessons where they share a season', () => {
  const lore = modules.find((m) => m.id === 'norse-lore')!;
  const festival = lore.stages.flatMap((s) => s.tasks).filter((t) => t.holiday);
  const wheelOf: Record<string, string> = { midsummer: 'litha', haustblot: 'mabon', jol: 'yule' };
  assert.equal(festival.length, 7);
  for (const t of festival) {
    const slug = t.holiday!.split('/')[1];
    assert.deepEqual(t.docs, [`norse-lore-${slug}`, ...(wheelOf[slug] ? [`wheel-lore-${wheelOf[slug]}`] : [])]);
    assert.ok(t.solitary, `${t.title} has a solitary way`);
    assert.ok((t.links ?? []).some((l) => l.kind === 'seasonal'), `${t.title} offers something for the altar`);
    assert.ok((t.links ?? []).some((l) => l.kind === 'spread'), `${t.title} offers a draw`);
  }
});

test('norse: all five programs compose, with the borrowed Wheel lessons included', () => {
  for (const step of PATH) {
    const p = composeProgram('norse', step, undefined, 'Norse & Heathen')!;
    assert.ok(p, step.key);
    assert.deepEqual(p.missing, [], `${p.id} has every module`);
    for (const t of p.stages.flatMap((s) => s.tasks)) for (const d of t.docs ?? []) assert.ok(p.docs.some((x) => x.id === d), `${p.id}: ${d}`);
  }
  const initiate = composeProgram('norse', PATH[2], undefined, 'Norse & Heathen')!;
  assert.ok(initiate.docs.some((d) => d.id === 'wheel-lore-yule'));
  assert.ok(initiate.stages.flatMap((s) => s.tasks).some((t) => t.holiday === 'norse/jol'));
});

test('norse: every step that needs a coven or a festival has a solitary way', () => {
  for (const m of modules) {
    for (const t of m.stages.flatMap((s) => s.tasks)) {
      if (t.kind === 'attend' || t.kind === 'meeting' || t.kind === 'oath' || t.holiday || (t.kind === 'ritual' && t.checked_by !== 'self')) assert.ok(t.solitary, `${m.id}: ${t.title}`);
    }
  }
});
