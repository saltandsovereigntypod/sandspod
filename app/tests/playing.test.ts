import assert from 'node:assert/strict';
import { test } from 'node:test';

import { JOKERS, PLAYING, PLAYING_ALL, SUITS } from '../src/lib/divination/oracle/playing.ts';
import { KIPPER } from '../src/lib/divination/oracle/kipper.ts';
import { LENORMAND } from '../src/lib/divination/oracle/lenormand.ts';
import { TAROT_DECK } from '../src/lib/divination/tarot.ts';

test('the deck is a full standard pack', () => {
  assert.equal(PLAYING.length, 52);
  assert.equal(JOKERS.length, 2);
  for (const s of SUITS) assert.equal(PLAYING.filter((c) => c.suit === s.id).length, 13);
  assert.equal(new Set(PLAYING_ALL.map((c) => c.id)).size, 54);
  assert.equal(new Set(PLAYING_ALL.map((c) => c.name)).size, 54);
  assert.equal(PLAYING[0].name, 'Ace of Hearts');
  assert.equal(PLAYING[51].name, 'King of Spades');
});

test('every card has a meaning, a reversed meaning and general, love and money readings, none repeated', () => {
  const seen = new Set<string>();
  for (const c of PLAYING_ALL) {
    for (const t of [c.meaning.keywords, c.meaning.text, c.reversed.keywords, c.reversed.text, c.reading.general, c.reading.love, c.reading.money]) {
      assert.ok(t && t.length > 3, `${c.id} has an empty field`);
    }
    for (const t of [c.meaning.text, c.reading.general, c.reading.love, c.reading.money]) {
      assert.ok(!seen.has(t), `${c.id} repeats a text`);
      seen.add(t);
    }
  }
});

test('names do not collide with the other decks', () => {
  const others = new Set([...TAROT_DECK.map((c) => c.name), ...LENORMAND.map((c) => c.name), ...KIPPER.map((c) => c.name)]);
  for (const c of PLAYING_ALL) assert.ok(!others.has(c.name), c.name);
});
