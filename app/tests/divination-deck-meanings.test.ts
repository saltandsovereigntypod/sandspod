import assert from 'node:assert/strict';
import { test } from 'node:test';

import { todaysCard, todaysCardLabel } from '../src/lib/divination/daily.ts';
import { DECK_MEANINGS, deckMeaning, deckPage, deckReadingLines, hasOwnReading, readingSource } from '../src/lib/divination/deckMeanings/index.ts';
import { MARSEILLE_MEANINGS } from '../src/lib/divination/deckMeanings/marseille.ts';
import { DECK_CARD_IDS } from '../src/lib/divination/decks.ts';
import { cameUpText, meaningOf, readingFromDraw, spreadById } from '../src/lib/divination/draw.ts';
import { divinationReadingRoute, divinationWebPath, readMoreHref } from '../src/lib/divination/links.ts';
import { TAROT_DECK, tarotCard } from '../src/lib/divination/tarot.ts';
import { cardWords } from '../src/lib/widgetMore.ts';

test('the Tarot de Marseille has its own reading for every one of the 78 cards, and nothing else', () => {
  assert.deepEqual(Object.keys(MARSEILLE_MEANINGS).sort(), [...DECK_CARD_IDS].sort());
  for (const [id, m] of Object.entries(MARSEILLE_MEANINGS)) {
    assert.ok(m.picture.length > 20, `${id} picture`);
    for (const side of [m.upright, m.reversed]) {
      assert.ok(side.keywords.trim(), `${id} keywords`);
      assert.ok(side.text.length > 40, `${id} text`);
      assert.ok(!side.text.includes('!'), `${id}: no exclamation marks`);
    }
  }
});

test('the Marseille keeps its own numbers and names on the trumps', () => {
  assert.equal(MARSEILLE_MEANINGS['08-strength'].title, 'XI · La Force');
  assert.equal(MARSEILLE_MEANINGS['11-justice'].title, 'VIII · La Justice');
  assert.equal(MARSEILLE_MEANINGS['00-the-fool'].title, 'Le Mat');
  assert.equal(MARSEILLE_MEANINGS['16-the-tower'].title, 'XVI · La Maison Dieu');
  assert.match(MARSEILLE_MEANINGS['06-the-lovers'].picture, /between two women/);
  // Every numbered card and court says how it's read, by number and suit or by rank.
  for (const card of TAROT_DECK.filter((c) => c.arcana === 'minor')) assert.ok(MARSEILLE_MEANINGS[card.id].note, card.id);
});

test('deckMeaning gives the deck’s own reading, with its title and picture', () => {
  const r = deckMeaning('marseille', '08-strength')!;
  assert.equal(r.reading, 'marseille');
  assert.ok(hasOwnReading(r));
  assert.equal(r.title, 'XI · La Force');
  assert.equal(r.upright, MARSEILLE_MEANINGS['08-strength'].upright);
  assert.notEqual(r.upright.text, tarotCard('08-strength')!.upright.text);
  assert.ok(r.picture);
  assert.equal(readingSource(r), 'Read as the Tarot de Marseille reads it.');
  // A numbered card without a title of its own takes the deck's title for it.
  assert.equal(deckMeaning('marseille', 'pentacles-14')!.title, 'Roy de Deniers');
});

test('deckMeaning falls back to Waite’s for the Rider–Waite–Smith, an unknown deck, or a card the deck lacks', () => {
  const rws = deckMeaning('rws', '16-the-tower')!;
  assert.equal(rws.reading, 'rws');
  assert.equal(rws.upright, tarotCard('16-the-tower')!.upright);
  assert.equal(rws.title, null);
  assert.equal(rws.picture, null);
  assert.equal(readingSource(rws), null);
  assert.deepEqual(deckReadingLines(rws), []);
  assert.equal(deckMeaning('no-such-deck', '16-the-tower')!.deck, 'rws');
  assert.equal(deckMeaning(undefined, '16-the-tower')!.reading, 'rws');
  assert.equal(deckMeaning('marseille', 'not-a-card'), null);

  // A deck with no reading for a card reads as Waite's, says so, and keeps its own title.
  const saved = DECK_MEANINGS['sola-busca'];
  DECK_MEANINGS['sola-busca'] = {};
  try {
    const sb = deckMeaning('sola-busca', '08-strength')!;
    assert.equal(sb.reading, 'rws');
    assert.equal(sb.upright, tarotCard('08-strength')!.upright);
    assert.equal(sb.title, 'VIII · Nerone');
    assert.match(readingSource(sb)!, /Waite’s .* no reading of its own here yet/);
    assert.equal(deckPage('sola-busca', '08-strength'), null);
  } finally {
    DECK_MEANINGS['sola-busca'] = saved;
  }
});

test('a card’s page leads with the deck’s own reading', () => {
  assert.equal(deckPage('rws', '00-the-fool'), null);
  const page = deckPage('marseille', '00-the-fool')!;
  assert.equal(page.heading, 'In the Tarot de Marseille');
  assert.equal(page.title, 'Le Mat');
  assert.deepEqual(
    page.sections.map((s) => s.key),
    ['picture', 'upright', 'reversed', 'note'],
  );
  assert.match(page.about!, /reversals/);
});

test('a drawn card reads in the deck it was drawn with', () => {
  const item = { name: 'Strength', reversed: true };
  assert.equal(meaningOf(item)!.meaning, tarotCard('Strength')!.reversed);
  const m = meaningOf(item, null, 'marseille')!;
  assert.equal(m.meaning, MARSEILLE_MEANINGS['08-strength'].reversed);
  assert.equal(m.inDeck!.title, 'XI · La Force');
  assert.equal(deckReadingLines(m.inDeck)[0], 'In the Tarot de Marseille: XI · La Force');

  const spread = spreadById('daily')!;
  const draw = { spread: 'daily', items: [item] };
  assert.match(cameUpText(spread, draw, { tarotDeck: 'marseille' }), /Strength, reversed \(force without control/);
  const reading = readingFromDraw(spread, draw, { now: new Date(2026, 9, 28), deck: 'marseille' });
  assert.equal(reading.deck, 'marseille');
  assert.ok(reading.cameUp.includes(MARSEILLE_MEANINGS['08-strength'].reversed.keywords));
  // Without a deck, Waite's words, as before.
  assert.ok(readingFromDraw(spread, draw, { now: new Date(2026, 9, 28) }).cameUp.includes(tarotCard('Strength')!.reversed.keywords));
});

test('the card of the day and its widget line carry the deck’s name for the card', () => {
  const now = new Date(2026, 9, 28, 9);
  const reading = readingFromDraw(spreadById('daily')!, { spread: 'daily', items: [{ name: 'Strength', reversed: false }] }, { now, deck: 'marseille' });
  const kept = todaysCard([{ id: 'r1', createdAt: now.toISOString(), data: reading } as never], now)!;
  assert.equal(kept.deck, 'marseille');
  assert.equal(kept.title, 'XI · La Force');
  assert.equal(todaysCardLabel(kept), 'Strength (XI · La Force)');
  assert.equal(cardWords(kept), 'XI · La Force');
  assert.equal(cardWords({ name: 'The Star', reversed: true }), 'The Star, reversed');
});

test('a tarot card’s page link carries the deck it was drawn with', () => {
  assert.equal(divinationReadingRoute({ kind: 'tarot', id: '08-strength' }, 'marseille'), '/rituals/divination/card/tarot/08-strength?deck=marseille');
  assert.equal(divinationReadingRoute({ kind: 'tarot', id: '08-strength' }), '/rituals/divination/card/tarot/08-strength');
  assert.equal(divinationWebPath({ kind: 'runes', id: 'fehu' }, 'marseille'), '/grimoire/?divination=runes/fehu');
  assert.equal(readMoreHref('Strength', 'sola-busca'), '/grimoire/?divination=tarot/08-strength&deck=sola-busca');
});
