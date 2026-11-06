import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DEPTH_DAYS, readCup, TEA_SYMBOLS } from '../src/lib/divination/tea.ts';
import { readSigns, SMOKE_FORMS, WAX_FORMS } from '../src/lib/divination/smokeWax.ts';
import { findSymbols, sentenceKey } from '../src/lib/symbolReading.ts';

const sample = () =>
  readCup({
    question: 'Will I get the new job?',
    date: '2026-11-06',
    seen: [
      { id: 'key', depth: 'rim', side: 'handle' },
      { id: 'bird', depth: 'middle', side: 'opposite' },
      { id: 'ring', depth: 'bottom', side: 'between' },
    ],
  });

test('tea dictionary is sound', () => {
  assert.ok(TEA_SYMBOLS.length >= 75);
  assert.equal(new Set(TEA_SYMBOLS.map((s) => s.id)).size, TEA_SYMBOLS.length);
  for (const s of TEA_SYMBOLS) assert.ok(s.name && s.theme && s.meaning && s.question && ['good', 'hard', 'mixed'].includes(s.tone), s.id);
});

test('tea timing: rim is soonest, bottom furthest', () => {
  assert.ok(DEPTH_DAYS.rim[1] <= DEPTH_DAYS.middle[0]);
  assert.ok(DEPTH_DAYS.middle[1] <= DEPTH_DAYS.bottom[0]);
  const r = sample();
  assert.equal(r.lean, 'favourable');
  assert.match(r.text, /near the rim/);
  assert.match(r.text, /Will I get the new job\?/);
});

test('no sentence is repeated in a reading, and openers vary', () => {
  const r = sample();
  const sentences = r.text.split(/(?<=[.?!])\s+/).map(sentenceKey).filter((s) => s.length > 25);
  assert.equal(new Set(sentences).size, sentences.length);
  const leads = r.symbols.map((s) => s.paragraphs[0].split(' ').slice(0, 2).join(' '));
  assert.ok(new Set(leads).size > 1);
});

test('search finds by name and partial word', () => {
  assert.equal(findSymbols(TEA_SYMBOLS, 'snak')[0].id, 'snake');
  assert.equal(findSymbols(TEA_SYMBOLS, 'vessel')[0].id, 'boat');
});

test('smoke and wax readings compose', () => {
  assert.ok(SMOKE_FORMS.length >= 10 && WAX_FORMS.length >= 10);
  const s = readSigns({ kind: 'smoke', forms: ['rises-straight', 'toward-me'], shapes: ['bird'], question: '', date: '2026-11-06', label: 'Frankincense' });
  assert.equal(s.lean, 'favourable');
  assert.match(s.text, /capnomancy/);
  const w = readSigns({ kind: 'wax', forms: ['wax-ring'], shapes: ['key'], question: 'x', date: '2026-11-06' });
  assert.match(w.text, /New Year/);
});
