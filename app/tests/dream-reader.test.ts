import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ALL_SYMBOLS,
  cameTrueRate,
  dominantFeeling,
  dreamPatterns,
  feelingScores,
  libraryMentions,
  matchSymbols,
  readDream,
  stem,
  detectTypes,
  type DictionaryEntry,
} from '../src/lib/dreams/reader.ts';

const SAMPLE = "I was in my grandmother's house and the basement was flooding. A black cat kept leading me to a door I couldn't open. I wasn't scared, it felt calm, like she was there with me.";
const keys = (t: string, d: DictionaryEntry[] = []) => matchSymbols(t, d).map((m) => m.subject.key);

test('stemming folds plurals, -ing and -ed', () => {
  assert.equal(stem('cats'), stem('cat'));
  assert.equal(stem('flooding'), stem('flooded'));
  assert.equal(stem('chasing'), stem('chased'));
  assert.equal(stem('houses'), stem('house'));
});

test('matching: word boundaries, case, plurals and phrases first', () => {
  assert.ok(ALL_SYMBOLS.length > 100);
  assert.ok(keys('A BLACK CAT sat there').includes('black-cat'));
  assert.ok(!keys('A black cat sat there').includes('cat') || keys('A black cat sat there')[0] === 'black-cat');
  assert.ok(keys('The basement was flooding').includes('flood'));
  assert.deepEqual(keys('catalogue'), []);
});

test('a feeling word is not also a symbol', () => {
  assert.ok(!keys('I was scared').includes('injury'));
});

test('overlapping matches are deduped: each word counts once', () => {
  const m = matchSymbols('black cat black cat black cat');
  assert.equal(m.length, 1);
  assert.equal(m[0].count, 3);
});

test('ranking favours frequency and earliness', () => {
  const m = matchSymbols('a door. a door. a door. then water far away');
  assert.equal(m[0].subject.key, 'door');
});

test('feelings read negation and the mood pick', () => {
  assert.ok(feelingScores("I wasn't scared").calm >= 1);
  assert.equal(feelingScores("I wasn't scared").fear, 0);
  assert.equal(dominantFeeling(SAMPLE).feeling, 'calm');
  assert.equal(dominantFeeling('I was terrified and afraid, so scared').feeling, 'fear');
  assert.equal(dominantFeeling('a plain dream', 'sad').feeling, 'sad');
  assert.equal(dominantFeeling('a plain dream').feeling, 'calm');
  assert.equal(dominantFeeling('it was a strange place, I was unsure').feeling, 'confused');
});

const base = (text: string, extra: Partial<Parameters<typeof detectTypes>[0]> = {}) => {
  const matches = matchSymbols(text);
  const { feeling, scores } = dominantFeeling(text);
  return detectTypes({ text, date: '2026-11-05', feeling, scores, matches, ...extra });
};

test('dream types', () => {
  assert.ok(base('I was terrified, so scared and afraid, running').includes('nightmare'));
  assert.ok(base('I knew I was dreaming and flew').includes('lucid'));
  assert.ok(base(SAMPLE).includes('visitation'));
  assert.ok(base('It felt so real, like a premonition').includes('prophetic'));
  assert.ok(base('A goddess spoke to me').includes('deity'));
  assert.ok(base('Isis was there', { deityNames: ['Isis'] }).includes('deity'));
  const past = [{ id: 'a', date: '2026-10-20', symbolKeys: ['door', 'flood'] }];
  assert.ok(base(SAMPLE, { past }).includes('recurring'));
  assert.ok(!base(SAMPLE, { past: [{ id: 'a', date: '2026-07-01', symbolKeys: ['door', 'flood'] }] }).includes('recurring'));
  assert.ok(!base(SAMPLE, { past: [{ id: 'a', date: '2026-10-20', symbolKeys: ['door'] }] }).includes('recurring'));
});

test('library mentions', () => {
  const lib = [
    { id: 'h1', name: 'Rosemary', type: 'herb' },
    { id: 'c1', name: 'Amethyst', type: 'crystal' },
    { id: 'x', name: 'Oak', type: 'herb' },
  ];
  assert.deepEqual(libraryMentions('I held amethyst and burned rosemary', lib).map((l) => l.id), ['c1', 'h1']);
  assert.deepEqual(libraryMentions('oak trees', lib), []);
});

test('personal meanings win and are shown first', () => {
  const dict: DictionaryEntry[] = [{ word: 'cats', also: [], meaning: 'my grandmother' }];
  const r = readDream({ text: 'A cat sat on the wall and I felt calm.', date: '2026-11-05', dictionary: dict });
  const cat = r.symbols.find((s) => s.key === 'cat');
  assert.ok(cat);
  assert.equal(cat!.personal, 'my grandmother');
  assert.ok(cat!.paragraphs[0].startsWith('In your own dictionary'));
  const own: DictionaryEntry[] = [{ word: 'red door', also: [], meaning: 'the way home' }];
  const r2 = readDream({ text: 'There was a red door.', date: '2026-11-05', dictionary: own });
  assert.equal(r2.symbols[0].key, 'own:red door');
  assert.equal(r2.symbols[0].name, 'Red door');
});

test('composition: capped, no repeated sentences, deterministic, sectioned', () => {
  const text = 'water door cat dog snake house tree moon bridge car mirror and a bird flew over the river. I was afraid.';
  const r = readDream({ text, date: '2026-11-05', moon: { phase: 'Full Moon', sign: 'Pisces' } });
  assert.equal(r.symbols.length, 6);
  assert.ok(r.also.length > 0);
  const sentences = r.text.split(/(?<=[.?!])\s+|\n/).map((s) => s.trim().toLowerCase()).filter((s) => s.length > 25);
  assert.equal(new Set(sentences).size, sentences.length);
  assert.deepEqual(readDream({ text, date: '2026-11-05', moon: { phase: 'Full Moon', sign: 'Pisces' } }), r);
  assert.deepEqual(r.sections.map((s) => s.id), ['opening', 'symbols', 'night', 'questions', 'do', 'close']);
  assert.equal(r.sections.find((s) => s.id === 'questions')!.paragraphs.length, 3);
});

test('actions by type', () => {
  const night = readDream({ text: 'I was terrified and so scared and afraid of the dark', date: '2026-11-05' });
  assert.ok(night.types.includes('nightmare'));
  assert.equal(night.action.href, '/rituals/craft/bath');
  const pro = readDream({ text: 'It felt so real, a premonition of a letter', date: '2026-11-05' });
  assert.equal(pro.checkBack, '2026-11-12');
  const visit = readDream({ text: SAMPLE, date: '2026-11-05' });
  assert.ok(/candle/.test(visit.action.text));
});

test('patterns: monthly symbols by moon, pairings, came true', () => {
  const d = (id: string, date: string, text: string, moonPhase: string) => ({ id, date, text, moonPhase });
  const dreams = [
    d('1', '2026-11-01', 'water and a door', 'Full Moon'),
    d('2', '2026-11-03', 'the water rose, a door', 'Full Moon'),
    d('3', '2026-11-04', 'swimming in water', 'Full Moon'),
    d('4', '2026-10-01', 'a door', 'New Moon'),
  ];
  const p = dreamPatterns(dreams, new Date(2026, 10, 10));
  const water = p.symbols.find((s) => s.key === 'water');
  assert.equal(water?.count, 3);
  assert.equal(water?.line, 'Water has appeared in 3 dreams this month, mostly near the full moon.');
  assert.ok(p.pairings.some((x) => x.count >= 2));
  const rate = cameTrueRate([{ cameTrue: { date: '2026-11-09', note: 'x' } }, {}, {}, {}]);
  assert.equal(rate.came, 1);
  assert.match(rate.line, /25%/);
});
