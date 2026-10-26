import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  allDivinationEntries,
  allDivinationGroups,
  countOf,
  divinationGroups,
  divinationPage,
  divinationReadingRoute,
  divinationRoute,
  divinationWebPath,
  entryForDrawn,
  findDivination,
  parseDivinationParam,
  readMoreHref,
  staveId,
} from '../src/lib/divination/library.ts';
import { BLANK_RUNE, FEDA, RUNES } from '../src/lib/divination/staves.ts';
import { BLANK_RUNE_DEEP, OGHAM_DEEP, RUNES_DEEP, STAVE_SECTIONS, staveDeep } from '../src/lib/divination/stavesDeep.ts';
import { TAROT_DECK } from '../src/lib/divination/tarot.ts';
import { TAROT_DEEP, TAROT_GROUPS, TAROT_SECTIONS, wordsLine } from '../src/lib/divination/tarotDeep.ts';

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;
const art = (id: string) => new URL(`../../assets/divination/tarot/${id}.webp`, import.meta.url);
const appSheets = readFileSync(new URL('../src/lib/divination/tarotAssets.ts', import.meta.url), 'utf8');

test('every one of the 78 cards has three words and every section written', () => {
  assert.equal(TAROT_DECK.length, 78);
  assert.deepEqual(Object.keys(TAROT_DEEP).sort(), TAROT_DECK.map((c) => c.id).sort());
  for (const card of TAROT_DECK) {
    const deep = TAROT_DEEP[card.id];
    assert.equal(deep.words.length, 3, card.name);
    for (const word of deep.words) assert.ok(word.trim() && word === word.trim(), `${card.name}: "${word}"`);
    for (const { key } of TAROT_SECTIONS) assert.ok(deep[key]?.trim(), `${card.name}: ${key}`);
  }
});

test('each card runs to a reasonable length, with no section a stub', () => {
  for (const card of TAROT_DECK) {
    const deep = TAROT_DEEP[card.id];
    const words = TAROT_SECTIONS.reduce((sum, { key }) => sum + wordCount(deep[key]), 0);
    assert.ok(words >= 240 && words <= 430, `${card.name}: ${words} words`);
    for (const { key } of TAROT_SECTIONS) assert.ok(wordCount(deep[key]) >= (key === 'question' ? 5 : 15), `${card.name}: ${key} is too short`);
    assert.ok(deep.question.trim().endsWith('?'), `${card.name}: the question asks`);
  }
});

test('card ids match the pictures on the website and in the app', () => {
  for (const card of TAROT_DECK) {
    assert.ok(existsSync(art(card.id)), `website: ${card.id}.webp`);
    assert.ok(appSheets.includes(`'${card.id}': { sheet:`), `app: ${card.id} on a sheet`);
  }
});

test('the house voice: no exclamation marks, British spelling, straight from the image', () => {
  const all = [...Object.values(TAROT_DEEP), ...Object.values(RUNES_DEEP), ...Object.values(OGHAM_DEEP), BLANK_RUNE_DEEP];
  for (const deep of all) {
    const text = Object.values(deep).flat().join(' ');
    assert.doesNotMatch(text, /!/);
    assert.doesNotMatch(text, /\b(color|honor|favor|center|judgment)\b/i);
  }
  // The Golden Dawn's attributions where they're easy to get wrong.
  assert.match(TAROT_DEEP['08-strength'].correspondences, /Leo/);
  assert.match(TAROT_DEEP['11-justice'].correspondences, /Libra/);
  assert.match(TAROT_DEEP['00-the-fool'].correspondences, /Aleph/);
  assert.match(TAROT_DEEP['wands-02'].correspondences, /Mars in Aries/);
  assert.match(TAROT_DEEP['pentacles-10'].correspondences, /Mercury in Virgo/);
});

test('every rune and stave has three words and its sections, at a reasonable length', () => {
  assert.equal(Object.keys(RUNES_DEEP).length, 24);
  assert.equal(Object.keys(OGHAM_DEEP).length, 20);
  for (const stave of [...RUNES, BLANK_RUNE, ...FEDA]) {
    const deep = staveDeep(stave.name);
    assert.ok(deep, stave.name);
    assert.equal(deep.words.length, 3, stave.name);
    for (const { key } of STAVE_SECTIONS) if (key !== 'reversed') assert.ok(deep[key]?.trim(), `${stave.name}: ${key}`);
    const words = STAVE_SECTIONS.reduce((sum, { key }) => sum + wordCount(deep[key] ?? ''), 0);
    assert.ok(words >= 180 && words <= 380, `${stave.name}: ${words} words`);
  }
  // Reversed only for runes, and every reversed reading says it's modern.
  for (const deep of Object.values(OGHAM_DEEP)) assert.equal(deep.reversed, undefined);
  for (const [name, deep] of Object.entries(RUNES_DEEP)) if (deep.reversed) assert.match(deep.reversed, /modern/i, name);
  // Runes that look the same either way up aren't given a reversed reading.
  for (const name of ['Gebo', 'Hagalaz', 'Nauthiz', 'Isa', 'Jera', 'Eihwaz', 'Sowilo', 'Ingwaz', 'Dagaz']) assert.equal(RUNES_DEEP[name].reversed, undefined, name);
});

test('the drop-downs: Tarot by Major Arcana then suit, Runes by aett, Ogham by aicme, then Lenormand and Kipper', () => {
  const groups = allDivinationGroups();
  assert.deepEqual(groups.map((g) => g.label), ['Tarot', 'Runes', 'Ogham', 'Lenormand', 'Kipper']);
  assert.deepEqual(TAROT_GROUPS.map((g) => g.label), ['Major Arcana', 'Wands', 'Cups', 'Swords', 'Pentacles']);
  assert.deepEqual(groups.map(countOf), [78, 25, 20, 36, 36]);
  assert.equal(groups[0].subgroups[0].entries[0].name, 'The Fool');
  assert.equal(groups[0].subgroups[4].entries[13].name, 'King of Pentacles');
  assert.deepEqual(groups[1].subgroups.map((s) => s.entries[0].name), ['Fehu', 'Hagalaz', 'Tiwaz', 'Blank rune']);
  assert.deepEqual(groups[2].subgroups.map((s) => s.entries[0].name), ['Beith', 'Uath', 'Muin', 'Ailm']);
  const ids = allDivinationEntries().map((e) => `${e.kind}/${e.id}`);
  assert.equal(new Set(ids).size, ids.length);
});

test('a page has its place and its sections; the blank rune and ogham leave out what they lack', () => {
  const fool = divinationPage(findDivination('tarot', '00-the-fool')!);
  assert.equal(fool.eyebrow, 'Major Arcana · 0');
  assert.deepEqual(fool.sections.map((s) => s.label), TAROT_SECTIONS.map((s) => s.label));
  assert.equal(divinationPage(findDivination('tarot', 'cups-07')!).eyebrow, 'Minor Arcana · Cups');
  const fehu = divinationPage(findDivination('runes', 'fehu')!);
  assert.equal(fehu.eyebrow, 'Runes · Freyr’s aett · 1 of 24');
  assert.equal(fehu.gloss, 'cattle, wealth');
  assert.ok(fehu.sections.some((s) => s.key === 'reversed'));
  const beith = divinationPage(findDivination('ogham', 'beith')!);
  assert.equal(beith.eyebrow, 'Ogham · Aicme Beithe');
  assert.ok(!beith.sections.some((s) => s.key === 'reversed'));
  assert.equal(divinationPage(findDivination('runes', 'blank-rune')!).eyebrow, 'Runes · Modern');
});

test('search finds cards and staves by name, words and page, accents or not', () => {
  const names = (q: string) => divinationGroups(q).flatMap((g) => g.subgroups.flatMap((s) => s.entries.map((e) => e.name)));
  assert.equal(divinationGroups('').length, 5);
  assert.ok(names('tower').includes('The Tower'));
  assert.deepEqual(names('the tower upheaval'), ['The Tower']);
  assert.ok(names('cups').includes('Seven of Cups'));
  assert.ok(names('ngeadal').includes('nGéadal'));
  assert.ok(names('ur').includes('Úr'));
  assert.ok(names('hazel').includes('Coll'));
  assert.ok(names('salmon knowledge').includes('Coll'));
  assert.ok(names('aurochs').includes('Uruz'));
  assert.deepEqual(divinationGroups('zzzz-nothing'), []);
  // The empty groups go (Lenormand has a Tower of its own).
  assert.deepEqual(divinationGroups('tower').map((g) => g.label), ['Tarot', 'Lenormand']);
  assert.deepEqual(divinationGroups('aurochs').map((g) => g.label), ['Runes']);
});

test('from a drawn card or stave to its page, in the app and on the website', () => {
  assert.equal(staveId('nGéadal'), 'ngeadal');
  assert.equal(staveId('Úr'), 'ur');
  assert.equal(staveId('Blank rune'), 'blank-rune');
  const tower = entryForDrawn('The Tower')!;
  assert.equal(divinationRoute(tower), '/grimoire/divination/tarot/16-the-tower');
  // From a reading the page opens on top of it, so Back returns to the reading.
  assert.equal(divinationReadingRoute(tower), '/rituals/divination/card/tarot/16-the-tower');
  assert.equal(divinationWebPath(tower), '/grimoire/?divination=tarot/16-the-tower');
  assert.equal(parseDivinationParam('tarot/16-the-tower')?.name, 'The Tower');
  assert.equal(parseDivinationParam('ogham%2Fngeadal')?.name, 'nGéadal');
  assert.equal(parseDivinationParam('runes/nope'), null);
  assert.equal(readMoreHref('Úr'), '/grimoire/?divination=ogham/ur');
  assert.equal(readMoreHref('Not a card'), null);
  assert.equal(entryForDrawn('Blank rune')?.kind, 'runes');
  assert.equal(entryForDrawn('Dair')?.glyph, 'ᚇ');
  for (const card of TAROT_DECK) assert.ok(entryForDrawn(card.name), card.name);
  assert.equal(wordsLine(['beginnings', 'trust', 'freedom']), 'Beginnings · trust · freedom');
});
