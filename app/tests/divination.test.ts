import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { ELDER_FUTHARK, normalizeReading, OGHAM, TAROT, type ReadingEntry } from '../src/lib/craft/hedge/readings.ts';
import { DAILY_LABEL, drawOnToday, todaysCard } from '../src/lib/divination/daily.ts';
import {
  cameUpText,
  drawOfReading,
  drawOptions,
  drawSpread,
  meaningOf,
  poolFor,
  readingFromDraw,
  secureRandom,
  shuffle,
  spreadById,
  SPREADS,
  spreadsFor,
} from '../src/lib/divination/draw.ts';
import { BLANK_RUNE, FEDA, RUNES } from '../src/lib/divination/staves.ts';
import { TAROT_DECK, tarotCard } from '../src/lib/divination/tarot.ts';

/** A repeatable generator for tests (mulberry32). */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sentences = (text: string) => text.split(/(?<=[.?])\s+/).filter(Boolean).length;

test('the deck is the reading log’s 78 cards, in its order, with unique ids', () => {
  assert.equal(TAROT_DECK.length, 78);
  assert.deepEqual(
    TAROT_DECK.map((c) => c.name),
    TAROT,
  );
  assert.equal(new Set(TAROT_DECK.map((c) => c.id)).size, 78);
  assert.equal(tarotCard('The Fool')?.id, '00-the-fool');
  assert.equal(tarotCard('King of Pentacles')?.id, 'pentacles-14');
  assert.equal(tarotCard('10-wheel-of-fortune')?.name, 'Wheel of Fortune');
});

test('every card, rune and stave has keywords and a few plain sentences, upright and reversed', () => {
  for (const card of TAROT_DECK) {
    for (const m of [card.upright, card.reversed]) {
      assert.ok(m.keywords.length > 3, card.name);
      const n = sentences(m.text);
      assert.ok(n >= 1 && n <= 4, `${card.name}: ${n} sentences`);
      assert.ok(!m.text.includes('!'), card.name);
    }
    assert.notEqual(card.upright.text, card.reversed.text, card.name);
  }
  for (const s of [...RUNES, ...FEDA, BLANK_RUNE]) {
    assert.ok(s.keywords && s.text && !s.text.includes('!'), s.name);
  }
  assert.deepEqual(
    RUNES.map((r) => r.name),
    ELDER_FUTHARK.map((r) => r.name),
  );
  assert.deepEqual(
    FEDA.map((f) => f.name),
    OGHAM.map((o) => o.name),
  );
  // The ogham block runs Beith (U+1681) to Iodhadh (U+1694) in this order.
  FEDA.forEach((f, i) => assert.equal(f.glyph.codePointAt(0), 0x1681 + i, f.name));
});

test('a shuffle keeps every item once and is fair over many runs', () => {
  const random = seeded(7);
  const items = ['a', 'b', 'c', 'd'];
  const first = new Map(items.map((x) => [x, 0]));
  for (let i = 0; i < 8000; i++) {
    const out = shuffle(items, random);
    assert.deepEqual([...out].sort(), items);
    first.set(out[0], first.get(out[0])! + 1);
  }
  for (const n of first.values()) assert.ok(n > 1800 && n < 2200, `first place ${n} times of 8000`);
  assert.deepEqual(items, ['a', 'b', 'c', 'd']);
});

test('the secure random number is in [0, 1)', () => {
  for (let i = 0; i < 1000; i++) {
    const x = secureRandom();
    assert.ok(x >= 0 && x < 1);
  }
});

test('a spread lays out as many as it has places, never the same card twice', () => {
  const random = seeded(42);
  const celtic = spreadById('celtic-cross')!;
  const draw = drawSpread(celtic, { reversals: false, blankRune: false }, random);
  assert.equal(draw.items.length, 10);
  assert.equal(new Set(draw.items.map((d) => d.name)).size, 10);
  assert.ok(draw.items.every((d) => !d.reversed));
  assert.equal(spreadsFor('tarot').length, 28); // the four first drawn, and the spreads added since (divination-spreads.test.ts, divination-crossroads.test.ts)
  // Spreads for decks of your own need a deck (tests/oracle-decks.test.ts).
  for (const s of SPREADS.filter((x) => x.kind !== 'oracle')) assert.equal(drawSpread(s, { reversals: true, blankRune: true }, random).items.length, s.positions.length);
});

test('reversals come up only when turned on, about half the time, and only for tarot', () => {
  const random = seeded(3);
  const three = spreadById('past-present-future')!;
  let reversed = 0;
  for (let i = 0; i < 1000; i++) reversed += drawSpread(three, { reversals: true, blankRune: false }, random).items.filter((d) => d.reversed).length;
  assert.ok(reversed > 1350 && reversed < 1650, `${reversed} of 3000`);
  const runes = spreadById('three-runes')!;
  assert.ok(drawSpread(runes, { reversals: true, blankRune: false }, random).items.every((d) => !d.reversed));
});

test('the blank rune is in the bag only when chosen', () => {
  assert.equal(poolFor('runes', { reversals: false, blankRune: false }).length, 24);
  assert.ok(!poolFor('runes', { reversals: false, blankRune: false }).includes(BLANK_RUNE.name));
  assert.equal(poolFor('runes', { reversals: false, blankRune: true }).length, 25);
  assert.equal(poolFor('ogham', { reversals: false, blankRune: true }).length, 20);
  assert.deepEqual(drawOptions(null), { reversals: false, blankRune: false });
  assert.deepEqual(drawOptions({ divination_reversals: true, divination_blank_rune: true }), { reversals: true, blankRune: true });
});

test('a draw becomes a reading in the log’s own shape, which survives normalizing', () => {
  const spread = spreadById('past-present-future')!;
  const draw = { spread: spread.id, items: [{ name: 'The Tower', reversed: true }, { name: 'The Star', reversed: false }, { name: 'Ace of Cups', reversed: false }] };
  const now = new Date(2026, 9, 23, 20);
  const reading = readingFromDraw(spread, draw, { question: '  Should I move?  ', now });
  assert.equal(reading.method, 'tarot');
  assert.equal(reading.date, '2026-10-23');
  assert.equal(reading.question, 'Should I move?');
  assert.deepEqual(reading.drawn, ['The Tower', 'The Star', 'Ace of Cups']);
  assert.equal(reading.lookBack, '2026-11-22');
  assert.equal(reading.outcome, '');
  assert.ok(reading.moonPhase);
  const lines = reading.cameUp.split('\n');
  assert.equal(lines[0], 'Past, present, future');
  assert.equal(lines[1], `Past: The Tower, reversed (${tarotCard('The Tower')!.reversed.keywords})`);
  assert.ok(lines[2].startsWith('Present: The Star (hope'));
  assert.deepEqual(normalizeReading(JSON.parse(JSON.stringify(reading))), reading);
  assert.deepEqual(Object.keys(reading).sort(), Object.keys(normalizeReading({})).sort());

  const runes = spreadById('one-rune')!;
  const cast = readingFromDraw(runes, { spread: runes.id, items: [{ name: 'Fehu', reversed: false }] }, { now, lookBack: '' });
  assert.equal(cast.method, 'runes');
  assert.equal(cast.lookBack, '');
  assert.equal(cast.cameUp, `One rune\nFehu (${RUNES[0].keywords})`);
  const staves = spreadById('three-staves')!;
  assert.equal(readingFromDraw(staves, drawSpread(staves, { reversals: true, blankRune: false }, seeded(1)), { now }).method, 'ogham');
});

test('meanings are found for cards, runes, staves and the blank rune', () => {
  assert.equal(meaningOf({ name: 'Death', reversed: false })?.meaning, tarotCard('Death')!.upright);
  assert.equal(meaningOf({ name: 'Death', reversed: true })?.meaning, tarotCard('Death')!.reversed);
  assert.equal(meaningOf({ name: 'Algiz', reversed: false })?.glyph, 'ᛉ');
  assert.equal(meaningOf({ name: 'Coll', reversed: false })?.gloss, 'hazel');
  assert.equal(meaningOf({ name: BLANK_RUNE.name, reversed: false })?.glyph, '');
  assert.equal(meaningOf({ name: 'Nonsense', reversed: false }), null);
});

test('today’s card of the day is found among the readings', () => {
  const now = new Date(2026, 9, 23, 9);
  const daily = spreadById('daily')!;
  const entry = (id: string, createdAt: string, data: unknown): ReadingEntry => ({ id, createdAt, data: normalizeReading(data) });
  const kept = readingFromDraw(daily, { spread: 'daily', items: [{ name: 'The Moon', reversed: true }] }, { now });
  assert.equal(kept.cameUp.split('\n')[0], DAILY_LABEL);
  assert.equal(kept.lookBack, '2026-10-24');
  const yesterday = { ...kept, date: '2026-10-22' };
  const three = readingFromDraw(spreadById('past-present-future')!, drawSpread(spreadById('past-present-future')!, { reversals: false, blankRune: false }, seeded(9)), { now });
  assert.equal(todaysCard([entry('y', '2026-10-22T08:00:00Z', yesterday), entry('t', '2026-10-23T08:00:00Z', three)], now), null);
  assert.deepEqual(todaysCard([entry('a', '2026-10-23T08:00:00Z', kept), entry('t', '2026-10-23T09:00:00Z', three)], now), { id: 'a', name: 'The Moon', reversed: true });
  const upright = readingFromDraw(daily, { spread: 'daily', items: [{ name: 'The Sun', reversed: false }] }, { now });
  assert.equal(todaysCard([entry('b', '2026-10-23T10:00:00Z', upright), entry('a', '2026-10-23T08:00:00Z', kept)], now)?.name, 'The Sun');
  assert.equal(todaysCard([entry('b', '2026-10-23T10:00:00Z', upright)], now)?.reversed, false);
  assert.equal(cameUpText(daily, { spread: 'daily', items: [{ name: 'The Sun', reversed: false }] }).split('\n').length, 2);
});

test('a kept draw can be laid out again from its reading', () => {
  const now = new Date(2026, 9, 23, 9);
  const celtic = spreadById('celtic-cross')!;
  const draw = drawSpread(celtic, { reversals: true, blankRune: false }, seeded(11));
  assert.ok(draw.items.some((d) => d.reversed));
  const back = drawOfReading(readingFromDraw(celtic, draw, { now }));
  assert.equal(back?.spread.id, 'celtic-cross');
  assert.deepEqual(back?.draw.items, draw.items);
  const runes = spreadById('three-runes')!;
  const cast = drawSpread(runes, { reversals: false, blankRune: true }, seeded(5));
  assert.deepEqual(drawOfReading(readingFromDraw(runes, cast, { now }))?.draw.items, cast.items);
  // Logged by hand, or changed since: nothing to lay out.
  assert.equal(drawOfReading({ method: 'tarot', drawn: ['The Fool'], cameUp: 'A good feeling' }), null);
  assert.equal(drawOfReading({ method: 'tarot', drawn: ['The Fool', 'The Star'], cameUp: 'Card of the day\nThe Fool (beginnings)' }), null);
  assert.equal(drawOfReading({ method: 'runes', drawn: ['The Fool'], cameUp: 'One rune\nThe Fool' }), null);
});

test('every card has its picture, on the website and on one of the app’s sheets', () => {
  const manifest = readFileSync(new URL('../src/lib/divination/tarotAssets.ts', import.meta.url), 'utf8');
  const sheets = [...manifest.matchAll(/require\('\.\.\/\.\.\/\.\.\/(assets\/divination\/tarot-sheets\/[^']+)'\)/g)].map((m) => m[1]);
  assert.ok(sheets.length >= 6);
  for (const sheet of sheets) assert.ok(existsSync(new URL(`../${sheet}`, import.meta.url)), sheet);
  const places = new Set<string>();
  for (const card of TAROT_DECK) {
    assert.ok(existsSync(new URL(`../../assets/divination/tarot/${card.id}.webp`, import.meta.url)), card.id);
    // The Rider–Waite–Smith's place (the other decks: divination-decks.test.ts).
    const m = manifest.match(new RegExp(`'${card.id}': \\{ sheet: sheets\\.rws\\[(\\d+)\\], col: (\\d+), row: (\\d+) \\}`));
    assert.ok(m, card.id);
    const key = m!.slice(1).join(',');
    assert.ok(!places.has(key), `${card.id} shares a place`);
    places.add(key);
  }
});

test('Today offers a card unless it has been turned off', () => {
  assert.equal(drawOnToday(null), true);
  assert.equal(drawOnToday({}), true);
  assert.equal(drawOnToday({ today_draw: false }), false);
});
