import assert from 'node:assert/strict';
import { test } from 'node:test';

import { normalizeReading, type ReadingEntry } from '../src/lib/craft/hedge/readings.ts';
import { cardHistory, cardHistoryLine, cardRoute, cardWebPath, dayStreaks, divinationPatterns, drawnItems, patternLines, readingsInRange, themesOf } from '../src/lib/divination/patterns.ts';

let n = 0;
const reading = (date: string, method: string, drawn: string[], extra: Record<string, unknown> = {}): ReadingEntry => ({
  id: `r${++n}`,
  createdAt: `${date}T20:00:00.000Z`,
  data: normalizeReading({ date, method, drawn, cameUp: '', question: '', ...extra }),
});

test('reversals are read from what came up', () => {
  const items = drawnItems({ drawn: ['The Tower', 'The Star'], cameUp: 'Past and future\nPast: The Tower, reversed (upheaval delayed)\nFuture: The Star (hope)' });
  assert.deepEqual(items, [
    { name: 'The Tower', reversed: true },
    { name: 'The Star', reversed: false },
  ]);
});

test('counts cards, suits, reversals, decks and links to the card pages', () => {
  const list = [
    reading('2026-10-01', 'tarot', ['The Tower'], { cameUp: 'Card of the day\nThe Tower, reversed (x)', deck: 'marseille' }),
    reading('2026-10-02', 'tarot', ['The Tower', 'Ace of Cups'], { deck: 'marseille' }),
    reading('2026-10-03', 'tarot', ['Two of Wands']),
    reading('2026-10-03', 'runes', ['Fehu', 'Tiwaz']),
  ];
  const p = divinationPatterns(list, new Date(2026, 9, 3, 12));
  assert.equal(p.readings, 4);
  assert.equal(p.draws, 6);
  const tower = p.top[0];
  assert.equal(tower.name, 'The Tower');
  assert.equal(tower.count, 2);
  assert.equal(tower.reversed, 1);
  assert.equal(tower.deck, 'marseille');
  assert.ok(tower.title, 'the Marseille has its own name for the Tower');
  assert.equal(cardRoute(tower), '/grimoire/divination/tarot/16-the-tower?deck=marseille');
  assert.equal(cardWebPath(tower), '/grimoire/?divination=tarot/16-the-tower&deck=marseille');
  const tarot = p.balances.find((b) => b.kind === 'tarot')!;
  assert.deepEqual(
    tarot.bars.map((b) => [b.key, b.count]),
    [
      ['major', 2],
      ['Wands', 1],
      ['Cups', 1],
      ['Swords', 0],
      ['Pentacles', 0],
    ],
  );
  const runes = p.balances.find((b) => b.kind === 'runes')!;
  assert.deepEqual(
    runes.bars.map((b) => b.count),
    [1, 0, 1],
  );
  assert.deepEqual(p.reversals, { reversible: 4, reversed: 1, share: 0.25 });
  assert.deepEqual(
    p.tarotDecks.map((d) => [d.deck, d.count]),
    [
      ['marseille', 2],
      ['rws', 1],
    ],
  );
  const tarotMet = p.notMet.find((m) => m.kind === 'tarot')!;
  assert.equal(tarotMet.total, 78);
  assert.equal(tarotMet.met, 3);
  assert.equal(tarotMet.missing.length, 75);
  assert.ok(!p.notMet.some((m) => m.kind === 'ogham'), 'only systems you use');
  assert.equal(p.streaks.card?.name, 'The Tower');
  assert.equal(p.streaks.card?.run, 2);
});

test('themes gather the cards that recur around a kind of question', () => {
  assert.deepEqual(themesOf({ question: 'Should I take the new job?', linkedTo: undefined }), ['work', 'choice']);
  assert.deepEqual(themesOf({ question: '', linkedTo: { kind: 'dream', id: 'd1', title: '' } }), ['dream']);
  const list = [reading('2026-09-01', 'tarot', ['The Lovers'], { question: 'My relationship?' }), reading('2026-09-05', 'tarot', ['The Lovers', 'The Moon'], { question: 'Does my partner love me' })];
  const p = divinationPatterns(list, new Date(2026, 9, 1));
  const love = p.themes.find((t) => t.key === 'love')!;
  assert.equal(love.readings, 2);
  assert.deepEqual(
    love.cards.map((c) => [c.name, c.count]),
    [['The Lovers', 2]],
  );
});

test('by moon phase and planetary day', () => {
  // 4 October 2026 is a Sunday.
  const list = [reading('2026-10-04', 'runes', ['Sowilo'], { moonPhase: 'Full Moon' }), reading('2026-10-04', 'runes', ['Sowilo'], { moonPhase: 'Full Moon' })];
  const p = divinationPatterns(list, new Date(2026, 9, 4));
  assert.deepEqual(p.byPhase.find((r) => r.phase === 'Full Moon'), { phase: 'Full Moon', readings: 2, top: 'Sowilo' });
  assert.deepEqual(p.byDay[0], { day: 'Sunday', planet: 'Sun', readings: 2, top: 'Sowilo' });
  assert.equal(p.byDay[1].planet, 'Moon');
});

test('streaks of days with a reading', () => {
  const s = dayStreaks(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-07', '2026-10-08', '2026-10-08'], new Date(2026, 9, 9, 9));
  assert.deepEqual(s, { current: 2, longest: 3, longestEnd: '2026-10-03', days: 5 });
  assert.equal(dayStreaks(['2026-10-01'], new Date(2026, 9, 9)).current, 0);
});

test('ranges, and the opening lines', () => {
  const list = [reading('2025-01-01', 'tarot', ['The Sun']), reading('2026-10-01', 'tarot', ['The Sun']), reading('2026-10-08', 'tarot', ['The Sun'])];
  const now = new Date(2026, 9, 9);
  assert.equal(readingsInRange(list, 'all', now).length, 3);
  assert.equal(readingsInRange(list, '30', now).length, 2);
  assert.equal(readingsInRange(list, '365', now).length, 2);
  const lines = patternLines(divinationPatterns(list, now));
  assert.equal(lines[0], '3 readings, 3 cards, runes and staves drawn.');
  assert.equal(lines[1], 'The Sun has come most often: 3 times.');
});

test('a card’s own history, for its page', () => {
  const list = [
    reading('2026-10-01', 'tarot', ['The Moon'], { cameUp: 'Card of the day\nThe Moon, reversed (x)' }),
    reading('2026-10-05', 'tarot', ['The Moon', 'The Sun']),
  ];
  const h = cardHistory(list, 'The Moon');
  assert.equal(h.count, 2);
  assert.equal(h.reversed, 1);
  assert.equal(h.last?.date, '2026-10-05');
  assert.equal(cardHistoryLine(h), 'You’ve drawn it twice, once reversed.');
  assert.equal(cardHistoryLine(cardHistory(list, 'The Fool')), null);
});

test('a card from a deck of your own has no page', () => {
  const p = divinationPatterns([reading('2026-10-01', 'oracle', ['My Raven'], { deck: 'deck1' })], new Date(2026, 9, 1));
  assert.equal(p.top[0].ref, null);
  assert.equal(cardRoute(p.top[0]), null);
  assert.deepEqual(p.notMet, []);
});
