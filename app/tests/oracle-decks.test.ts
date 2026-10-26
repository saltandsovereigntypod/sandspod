import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { normalizeReading } from '../src/lib/craft/hedge/readings.ts';
import {
  BY_HAND,
  canDraw,
  drawOfReading,
  drawOptions,
  drawSpread,
  KINDS,
  meaningOf,
  ownDeckSpreadById,
  ownDeckSpreads,
  poolFor,
  readingFromDraw,
  spreadById,
  spreadsFor,
  SPREADS,
  type Spread,
} from '../src/lib/divination/draw.ts';
import { halfBox, layoutOf, overlaps, type Laid } from '../src/lib/divination/layout.ts';
import { allDivinationGroups, countOf, divinationPage, entryForDrawn, findDivination, readMoreHref } from '../src/lib/divination/library.ts';
import {
  blankOwnDeck,
  DECKS_COLLECTION,
  deckStoragePaths,
  importCards,
  MAX_CARDS,
  normalizeOwnDeck,
  ownDecks,
  parseCardList,
  tidyOwnDeck,
  type OwnDeckData,
} from '../src/lib/divination/oracle/decks.ts';
import { hiddenKinds, HIDDEN_KINDS_KEY, KIND_CHOICES, shownKinds, withKindShown } from '../src/lib/divination/oracle/kinds.ts';
import { KIPPER } from '../src/lib/divination/oracle/kipper.ts';
import { HOUSES, LENORMAND, playingCardText } from '../src/lib/divination/oracle/lenormand.ts';
import { KNOWN_PAIRS, pairsAlong, pairsForSpread, readPair } from '../src/lib/divination/oracle/pairs.ts';
import { ORACLE_SPREADS } from '../src/lib/divination/oracle/spreads.ts';
import { BLANK_RUNE, FEDA, RUNES } from '../src/lib/divination/staves.ts';
import { TAROT_DECK } from '../src/lib/divination/tarot.ts';

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const opts = drawOptions({});
const voice = (text: string, what: string) => {
  assert.doesNotMatch(text, /!/, `${what}: no exclamation marks`);
  assert.doesNotMatch(text, /\b(color|honor|favor|center|judgment)\b/i, `${what}: British spelling`);
};

// ─── The decks ───────────────────────────────────────────────────────────

test('Lenormand: thirty-six cards in order, each with its own playing card and every meaning written', () => {
  assert.equal(LENORMAND.length, 36);
  assert.deepEqual(LENORMAND.map((c) => c.number), Array.from({ length: 36 }, (_, i) => i + 1));
  assert.equal(new Set(LENORMAND.map((c) => c.id)).size, 36);
  assert.equal(LENORMAND[0].id, '01-rider');
  assert.equal(LENORMAND[35].id, '36-cross');
  // The inserts are the thirty-six cards of a piquet pack, six to ace, each once.
  assert.equal(new Set(LENORMAND.map((c) => c.playing)).size, 36);
  for (const c of LENORMAND) assert.match(c.playing, /^(A|K|Q|J|10|9|8|7|6)[♥♦♣♠]$/, c.name);
  // A few that are easy to get wrong.
  const by = Object.fromEntries(LENORMAND.map((c) => [c.name, c.playing]));
  assert.equal(by.Rider, '9♥');
  assert.equal(by.House, 'K♥');
  assert.equal(by.Ring, 'A♣');
  assert.equal(by.Man, 'A♥');
  assert.equal(by.Woman, 'A♠');
  assert.equal(by.Cross, '6♣');
  for (const c of LENORMAND) {
    assert.equal(c.words.length, 3, c.name);
    for (const key of ['noun', 'adjective', 'subject', 'modifier', 'timing', 'image', 'house', 'question'] as const) assert.ok(c[key].trim(), `${c.name}: ${key}`);
    assert.ok(c.meaning.keywords.trim() && c.meaning.text.trim(), c.name);
    assert.ok(c.question.endsWith('?'), c.name);
    voice(Object.values(c).flat().join(' ') + JSON.stringify(c.meaning), c.name);
    assert.match(playingCardText(c), new RegExp(c.playingName));
  }
});

test('Kipper: thirty-six cards in order, with their German names and every meaning written', () => {
  assert.equal(KIPPER.length, 36);
  assert.deepEqual(KIPPER.map((c) => c.number), Array.from({ length: 36 }, (_, i) => i + 1));
  assert.equal(new Set(KIPPER.map((c) => c.id)).size, 36);
  assert.equal(KIPPER[0].name, 'Main Person (Man)');
  assert.equal(KIPPER[1].name, 'Main Person (Woman)');
  assert.equal(KIPPER[19].german, 'Haus');
  assert.equal(KIPPER[35].german, 'Hoffnung, großes Wasser');
  for (const c of KIPPER) {
    assert.equal(c.words.length, 3, c.name);
    for (const key of ['german', 'card', 'love', 'work', 'nearFar', 'question'] as const) assert.ok(c[key].trim(), `${c.name}: ${key}`);
    assert.ok(c.meaning.keywords.trim() && c.meaning.text.trim(), c.name);
    assert.ok(c.question.endsWith('?'), c.name);
    voice(JSON.stringify(c), c.name);
  }
});

test('every name that can be drawn is unique across all the decks, runes and staves', () => {
  const names = [...TAROT_DECK.map((c) => c.name), ...RUNES.map((r) => r.name), BLANK_RUNE.name, ...FEDA.map((f) => f.name), ...LENORMAND.map((c) => c.name), ...KIPPER.map((c) => c.name)];
  assert.equal(new Set(names).size, names.length);
});

test('the Lenormand pictures: every card on an app sheet and on the website, from two sheets', () => {
  const manifest = readFileSync(new URL('../src/lib/divination/oracle/lenormandAssets.ts', import.meta.url), 'utf8');
  const sheets = [...manifest.matchAll(/require\('(\.\.\/[^']+)'\)/g)].map((m) => m[1]);
  assert.equal(sheets.length, 2);
  for (const sheet of sheets) assert.ok(existsSync(new URL(`../src/lib/divination/oracle/${sheet}`, import.meta.url)), sheet);
  const places = [...manifest.matchAll(/'([0-9]{2}-[a-z-]+)': \{ sheet: sheets\[(\d)\], col: (\d), row: (\d) \}/g)];
  assert.deepEqual(places.map((m) => m[1]), LENORMAND.map((c) => c.id));
  const cells = new Set(places.map((m) => `${m[2]}/${m[3]}/${m[4]}`));
  assert.equal(cells.size, 36, 'no two cards share a cell');
  for (const m of places) assert.ok(Number(m[3]) < 6 && Number(m[4]) < 3, `${m[1]} inside its sheet`);
  for (const c of LENORMAND) assert.ok(existsSync(new URL(`../../assets/divination/lenormand/${c.id}.webp`, import.meta.url)), `website: ${c.id}.webp`);
  // Where they came from is written down.
  const sources = readFileSync(new URL('../assets/divination/decks/lenormand/SOURCES.md', import.meta.url), 'utf8');
  assert.match(sources, /btv1b10529584r/);
  assert.match(sources, /upload\.wikimedia\.org/);
});

// ─── Pairs ───────────────────────────────────────────────────────────────

test('the pair helper reads the first card as the subject and the second as what kind', () => {
  const ship = readPair('Ship', 'Rider')!;
  assert.equal(ship.title, 'Ship + Rider');
  assert.equal(ship.subject.name, 'Ship');
  assert.equal(ship.modifier.name, 'Rider');
  assert.ok(ship.known);
  assert.match(ship.text, /journey soon/);
  assert.equal(ship.gist, 'A journey, or something far away: quick, on its way.');
  // Order matters.
  assert.notEqual(readPair('Rider', 'Ship')!.gist, ship.gist);
  const plain = readPair('Garden', 'Dog')!;
  assert.ok(!plain.known);
  assert.match(plain.text, /Garden names the matter/);
  assert.match(plain.text, /a gathering that is loyal/);
  assert.equal(readPair('Ship', 'The Tower'), null);
  for (const t of KNOWN_PAIRS) {
    const [a, b] = t.split(' + ');
    assert.ok(readPair(a, b)?.known, t);
  }
});

test('pairs are read along a line, along each row of the box, and beside the Man and Woman in the Grand Tableau', () => {
  assert.deepEqual(pairsAlong(['Ship', 'Rider', 'Letter']).map((p) => p.title), ['Ship + Rider', 'Rider + Letter']);
  assert.deepEqual(pairsForSpread('lenormand-one', ['Sun']), []);
  assert.equal(pairsForSpread('lenormand-five', LENORMAND.slice(0, 5).map((c) => c.name)).length, 4);
  assert.equal(pairsForSpread('lenormand-box', LENORMAND.slice(0, 9).map((c) => c.name)).length, 6);
  assert.deepEqual(pairsForSpread('kipper-three', ['A Gift', 'Work', 'Expectation']), []);
  const names = LENORMAND.map((c) => c.name); // the Man is 28th: row 4, column 4
  assert.deepEqual(pairsForSpread('lenormand-grand-tableau', names).map((p) => p.title), ['Letter + Man', 'Man + Woman', 'Man + Woman', 'Woman + Lily']);
  // At the end of a row, or among the four beneath, there's no neighbour across the edge.
  const edge = [...names];
  [edge[7], edge[27]] = [edge[27], edge[7]]; // the Man to the end of the first row
  assert.ok(!pairsForSpread('lenormand-grand-tableau', edge).some((p) => p.title === `Man + ${edge[8]}`));
});

// ─── Spreads and layouts ─────────────────────────────────────────────────

function assertSound(l: Laid, what: string) {
  for (const [i, s] of l.slots.entries()) {
    const { hw, hh } = halfBox(l.item, s.rot);
    assert.ok(s.cx - hw >= -1e-6 && s.cx + hw <= l.width + 1e-6, `${what}: ${i + 1} off the side`);
    assert.ok(s.cy - hh >= -1e-6 && s.cy + hh <= l.height + 1e-6, `${what}: ${i + 1} off the top or bottom`);
  }
  for (let i = 0; i < l.slots.length; i++)
    for (let j = i + 1; j < l.slots.length; j++)
      assert.ok(!overlaps(l.item, { x: l.slots[i].cx, y: l.slots[i].cy }, { x: l.slots[j].cx, y: l.slots[j].cy }, 0.01), `${what}: ${i + 1} and ${j + 1} overlap`);
}

test('the Lenormand and Kipper spreads, as asked for', () => {
  assert.deepEqual(spreadsFor('lenormand').map((s) => s.positions.length), [1, 2, 3, 5, 9, 36]);
  assert.deepEqual(spreadsFor('kipper').map((s) => s.positions.length), [3, 9, 36]);
  for (const s of ORACLE_SPREADS) {
    assert.ok(SPREADS.includes(s), s.id);
    for (const p of s.positions) assert.ok(p.name && p.about, `${s.id}: ${p.name}`);
    assertSound(layoutOf(s), s.id);
  }
  assert.deepEqual(KINDS.map((k) => k.id), ['tarot', 'runes', 'ogham', 'lenormand', 'kipper', 'oracle']);
  // The Grand Tableau's places are the houses, in the cards' order.
  const gt = spreadById('lenormand-grand-tableau')!;
  assert.deepEqual(gt.positions, HOUSES);
  assert.equal(gt.positions[0].name, 'House of the Rider');
  assert.equal(gt.positions[35].name, 'House of the Cross');
  assert.match(spreadById('kipper-grand-tableau')!.positions[9].name, /House 10: A Journey/);
});

test('the Grand Tableau lies in four rows of eight with four beneath, centred; Kipper’s in four rows of nine', () => {
  const l = layoutOf(spreadById('lenormand-grand-tableau')!);
  assert.equal(l.slots.length, 36);
  const rows = new Map<number, number[]>();
  for (const s of l.slots) rows.set(s.cy, [...(rows.get(s.cy) ?? []), s.cx]);
  assert.deepEqual([...rows.values()].map((r) => r.length), [8, 8, 8, 8, 4]);
  const top = [...rows.values()][0];
  const last = [...rows.values()][4];
  const mid = (xs: number[]) => (Math.min(...xs) + Math.max(...xs)) / 2;
  assert.ok(Math.abs(mid(top) - mid(last)) < 1e-6, 'the four beneath are centred');
  // Read left to right, top to bottom.
  for (let i = 1; i < 32; i++) assert.ok(l.slots[i].cy > l.slots[i - 1].cy || l.slots[i].cx > l.slots[i - 1].cx, `place ${i + 1}`);
  const k = layoutOf(spreadById('kipper-grand-tableau')!);
  assert.deepEqual([...new Set(k.slots.map((s) => s.cy))].length, 4);
  assert.equal(new Set(k.slots.map((s) => s.cx)).size, 9);
  // Lenormand cards are squarer than tarot cards.
  assert.ok(l.item.h < layoutOf(spreadById('celtic-cross')!).item.h);
});

test('Lenormand and Kipper draw every card once, never reversed', () => {
  const r = seeded(4);
  const gt = drawSpread(spreadById('lenormand-grand-tableau')!, { reversals: true, blankRune: false }, r);
  assert.equal(new Set(gt.items.map((i) => i.name)).size, 36);
  assert.ok(gt.items.every((i) => !i.reversed));
  const kgt = drawSpread(spreadById('kipper-grand-tableau')!, opts, r);
  assert.deepEqual(new Set(kgt.items.map((i) => i.name)), new Set(KIPPER.map((c) => c.name)));
  assert.equal(meaningOf({ name: 'Rider', reversed: false })?.lenormand?.id, '01-rider');
  assert.equal(meaningOf({ name: 'Rider', reversed: false })?.gloss, '1 · Nine of Hearts');
  assert.equal(meaningOf({ name: 'The House', reversed: false })?.kipper?.german, 'Haus');
});

// ─── Decks of your own ───────────────────────────────────────────────────

const myDeck = (): OwnDeckData =>
  tidyOwnDeck({
    ...blankOwnDeck(),
    name: 'Wild Unknown Animals',
    reversals: true,
    cards: [
      { id: 'a', name: 'Owl', keywords: 'wisdom', meaning: 'See in the dark.', reversed: 'Not seeing.', photo: 'https://example.org/owl.jpg', photoPath: 'u/oracle-decks/owl.jpg' },
      { id: 'b', name: 'Fox', keywords: 'cunning', meaning: 'Be clever.', reversed: '', photo: '', photoPath: '' },
      { id: 'c', name: 'Hare', keywords: '', meaning: '', reversed: '', photo: '', photoPath: '' },
      { id: 'd', name: 'The Tower', keywords: 'my own tower', meaning: 'Not the tarot one.', reversed: '', photo: '', photoPath: '' },
    ],
  });

test('a deck of your own is kept whole: named, unique card names, blank cards dropped, photos only from real addresses', () => {
  assert.equal(DECKS_COLLECTION, 'hedge.oracleDecks');
  const tidy = tidyOwnDeck({
    ...blankOwnDeck(),
    cards: [
      { id: 'x', name: 'Moon', keywords: '', meaning: '', reversed: '', photo: 'javascript:alert(1)', photoPath: '' },
      { id: 'y', name: 'moon', keywords: '', meaning: 'second', reversed: '', photo: '', photoPath: '' },
      { id: 'z', name: '', keywords: '', meaning: '', reversed: '', photo: '', photoPath: '' },
    ],
  });
  assert.equal(tidy.name, 'My deck');
  assert.deepEqual(tidy.cards.map((c) => c.name), ['Moon', 'moon (2)']);
  assert.equal(tidy.cards[0].photo, '');
  const odd = normalizeOwnDeck({ name: 7, cards: [{ id: 'q' }, { id: 'q', name: 'Two' }, 'nonsense'], reversals: 'yes' });
  assert.equal(odd.reversals, false);
  assert.equal(new Set(odd.cards.map((c) => c.id)).size, 3);
  assert.deepEqual(normalizeOwnDeck(JSON.parse(JSON.stringify(myDeck()))), myDeck());
  assert.deepEqual(deckStoragePaths(myDeck()), ['u/oracle-decks/owl.jpg']);
  const listed = ownDecks([
    { id: '2', data: { name: 'Zodiac' } },
    { id: '1', data: myDeck() },
  ]);
  assert.deepEqual(listed.map((d) => d.data.name), ['Wild Unknown Animals', 'Zodiac']);
});

test('pasting a list of cards: "Name — meaning", three parts, numbers and bullets, filling in what was blank', () => {
  assert.deepEqual(parseCardList('1. The Well — rest, renewal\n\n- Ancestors: those who came before\n• Crow | messages | Listen.\nBare name\n12) Sun - joy'), [
    { name: 'The Well', keywords: '', meaning: 'rest, renewal' },
    { name: 'Ancestors', keywords: '', meaning: 'those who came before' },
    { name: 'Crow', keywords: 'messages', meaning: 'Listen.' },
    { name: 'Bare name', keywords: '', meaning: '' },
    { name: 'Sun', keywords: '', meaning: 'joy' },
  ]);
  const { deck, added, updated, skipped } = importCards(myDeck(), 'Hare — speed, fertility — Move fast.\nOwl — something else\nBear — strength');
  assert.equal(added, 1);
  assert.equal(updated, 1);
  assert.equal(skipped, 0);
  assert.equal(deck.cards.find((c) => c.name === 'Hare')!.meaning, 'Move fast.');
  assert.equal(deck.cards.find((c) => c.name === 'Owl')!.meaning, 'See in the dark.', 'what you wrote is kept');
  assert.equal(deck.cards.at(-1)!.name, 'Bear');
  const full = importCards({ ...blankOwnDeck(), cards: [] }, Array.from({ length: MAX_CARDS + 5 }, (_, i) => `Card ${i}`).join('\n'));
  assert.equal(full.added, MAX_CARDS);
  assert.equal(full.skipped, 5);
});

test('drawing from your deck with any spread: its own, a tarot spread, or one of yours', () => {
  const deck = myDeck();
  const spreads = ownDeckSpreads();
  assert.equal(spreads[0].id, 'oracle-one');
  assert.ok(spreads.every((s) => s.kind === 'oracle'));
  assert.ok(spreads.some((s) => s.id === 'celtic-cross'));
  assert.equal(spreadsFor('oracle')[0].id, 'oracle-one');
  assert.equal(ownDeckSpreadById('rune-cast'), null);
  assert.equal(ownDeckSpreadById('nine-rune-cast'), null, 'not a rune cast');
  const three = ownDeckSpreadById('past-present-future')!;
  assert.equal(three.kind, 'oracle');
  assert.deepEqual(poolFor('oracle', opts, deck), ['Owl', 'Fox', 'Hare', 'The Tower']);
  assert.ok(canDraw(three, opts, deck));
  assert.ok(!canDraw(ownDeckSpreadById('celtic-cross')!, opts, deck), 'four cards cannot fill ten places');
  let reversed = 0;
  for (let k = 0; k < 40; k++) {
    const d = drawSpread(three, opts, seeded(k), deck);
    assert.equal(d.items.length, 3);
    assert.ok(d.items.every((i) => deck.cards.some((c) => c.name === i.name)));
    reversed += d.items.filter((i) => i.reversed).length;
  }
  assert.ok(reversed > 0, 'this deck reads reversals');
  const upright = drawSpread(three, opts, seeded(1), { ...deck, reversals: false });
  assert.ok(upright.items.every((i) => !i.reversed));
  // A card of your own is read from your deck, even one named like a tarot card.
  const m = meaningOf({ name: 'The Tower', reversed: false }, deck)!;
  assert.equal(m.own?.id, 'd');
  assert.equal(m.meaning.text, 'Not the tarot one.');
  assert.equal(meaningOf({ name: 'Owl', reversed: true }, deck)!.meaning.text, 'Not seeing.');
  assert.match(meaningOf({ name: 'Hare', reversed: false }, deck)!.meaning.text, /haven’t written a meaning/);
  // A spread of your own for cards is offered too.
  const mine: Spread = { id: 'custom-q', kind: 'tarot', group: 'yours', label: 'The gate', detail: '', positions: [{ name: 'In', about: '' }, { name: 'Out', about: '' }], lookBackDays: 30, shape: 'line' };
  assert.ok(ownDeckSpreads([mine]).some((s) => s.id === 'custom-q' && s.kind === 'oracle'));
});

test('readings from your deck, from Lenormand and Kipper, and logged by hand go into the log and lay out again', () => {
  const deck = { id: 'deck-1', data: myDeck() };
  const now = new Date(2026, 9, 26, 12);
  const three = ownDeckSpreadById('past-present-future')!;
  const d = { spread: three.id, items: [{ name: 'Owl', reversed: true }, { name: 'The Tower', reversed: false }, { name: 'Fox', reversed: false }] };
  const reading = readingFromDraw(three, d, { now, deck, question: 'Which way?' });
  assert.equal(reading.method, 'oracle');
  assert.equal(reading.deck, 'deck-1');
  assert.equal(reading.cameUp.split('\n')[0], 'Past, present, future · Wild Unknown Animals');
  assert.match(reading.cameUp, /Past: Owl, reversed \(wisdom, reversed\)/);
  // Through the database and back (normalizeReading is what both the app and the website read with).
  const kept = normalizeReading(JSON.parse(JSON.stringify(reading)));
  assert.deepEqual(kept, reading);
  const again = drawOfReading(kept, [], [deck])!;
  assert.equal(again.spread.id, 'past-present-future');
  assert.equal(again.spread.kind, 'oracle');
  assert.equal(again.deck?.id, 'deck-1');
  assert.deepEqual(again.draw.items, d.items);
  assert.equal(drawOfReading(kept, [], []), null, 'a deleted deck lays out no longer, but the reading stays');
  // Logged by hand: said so on the first line, and still laid out.
  const byHand = readingFromDraw(three, d, { now, deck, byHand: true });
  assert.equal(byHand.cameUp.split('\n')[0], `Past, present, future · Wild Unknown Animals · ${BY_HAND}`);
  assert.ok(drawOfReading(byHand, [], [deck]));
  // Lenormand and Kipper keep their own method, and no deck.
  const box = spreadById('lenormand-box')!;
  const lenDraw = drawSpread(box, opts, seeded(9));
  const len = readingFromDraw(box, lenDraw, { now, byHand: true });
  assert.equal(len.method, 'lenormand');
  assert.equal('deck' in len, false);
  assert.deepEqual(drawOfReading(normalizeReading(JSON.parse(JSON.stringify(len))))!.draw.items, lenDraw.items);
  const kgt = spreadById('kipper-grand-tableau')!;
  const kDraw = drawSpread(kgt, opts, seeded(2));
  assert.deepEqual(drawOfReading(readingFromDraw(kgt, kDraw, { now }))!.draw.items, kDraw.items);
  // Old readings without a deck stay as they were.
  assert.equal('deck' in normalizeReading({ method: 'tarot', drawn: [] }), false);
});

// ─── Settings and the Grimoire ───────────────────────────────────────────

test('show or hide each kind on the draw screen', () => {
  assert.equal(HIDDEN_KINDS_KEY, 'divination_hidden_kinds');
  assert.deepEqual(KIND_CHOICES.map((k) => k.id), KINDS.map((k) => k.id));
  assert.deepEqual(hiddenKinds({}), []);
  assert.deepEqual(hiddenKinds({ divination_hidden_kinds: 'kipper, nonsense,oracle' }), ['kipper', 'oracle']);
  assert.equal(withKindShown({}, 'kipper', false), 'kipper');
  assert.equal(withKindShown({ divination_hidden_kinds: 'kipper,runes' }, 'kipper', true), 'runes');
  assert.equal(withKindShown({ divination_hidden_kinds: 'oracle' }, 'runes', false), 'runes,oracle');
  const s = { divination_hidden_kinds: 'runes,ogham,kipper' };
  assert.deepEqual(shownKinds(KINDS, s).map((k) => k.id), ['tarot', 'lenormand', 'oracle']);
  assert.deepEqual(shownKinds(KINDS, s, 'kipper').map((k) => k.id), ['tarot', 'lenormand', 'kipper', 'oracle'], 'the kind in use stays');
  assert.deepEqual(shownKinds(KINDS, { divination_hidden_kinds: KINDS.map((k) => k.id).join(',') }).map((k) => k.id), ['tarot'], 'never nothing');
});

test('Lenormand and Kipper in the Grimoire: every card with its three words and its page', () => {
  const groups = allDivinationGroups();
  const len = groups.find((g) => g.kind === 'lenormand')!;
  const kip = groups.find((g) => g.kind === 'kipper')!;
  assert.equal(countOf(len), 36);
  assert.equal(countOf(kip), 36);
  const rider = divinationPage(findDivination('lenormand', '01-rider')!);
  assert.equal(rider.eyebrow, 'Lenormand · 1 of 36');
  assert.deepEqual(rider.sections.map((s) => s.key), ['image', 'meaning', 'subject', 'modifier', 'pairs', 'timing', 'playing', 'house', 'question']);
  const house = divinationPage(findDivination('kipper', '20-the-house')!);
  assert.equal(house.gloss, 'Haus');
  for (const e of [...len.subgroups, ...kip.subgroups].flatMap((s) => s.entries)) {
    const page = divinationPage(e);
    assert.ok(page.sections.every((s) => s.text.trim()), e.name);
    assert.equal(e.words.length, 3);
  }
  assert.equal(entryForDrawn('Rider')?.kind, 'lenormand');
  assert.equal(entryForDrawn('Main Person (Woman)')?.kind, 'kipper');
  assert.equal(readMoreHref('Clover'), '/grimoire/?divination=lenormand/02-clover');
});
