import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ceromancyResult,
  drawResult,
  firstKeywords,
  pendulumResult,
  resultChip,
  scryingReading,
  scryingResult,
  withNotes,
} from '../src/lib/altar/divinationResult.ts';

const AT = '2026-11-04T20:00:00.000Z';

test('firstKeywords keeps the first few, trimmed', () => {
  assert.equal(firstKeywords('hope, renewal, calm, faith'), 'hope, renewal, calm');
  assert.equal(firstKeywords('hope; renewal', 1), 'hope');
  assert.equal(firstKeywords(null), '');
});

test('pendulum result: the answer, with the question beneath', () => {
  const r = pendulumResult('Yes', ' Should I go? ', 'r1', AT);
  assert.equal(r.answer, 'Yes');
  assert.equal(r.detail, '“Should I go?”');
  assert.equal(resultChip(r), 'Pendulum · Yes');
  assert.equal(pendulumResult('No', '', null, AT).detail, '');
});

test('tarot says which way up; runes are named as they are', () => {
  const t = drawResult('tarot', [{ name: 'The Star', reversed: false, keywords: 'hope, renewal, calm, faith' }], '', 'r2', AT);
  assert.equal(t.answer, 'The Star, upright');
  assert.equal(t.detail, 'hope, renewal, calm');
  assert.equal(drawResult('tarot', [{ name: 'The Tower', reversed: true }], '', null, AT).answer, 'The Tower, reversed');
  const rune = drawResult('runes', [{ name: 'Fehu', keywords: 'wealth, plenty' }], '', null, AT);
  assert.equal(rune.answer, 'Fehu');
  assert.equal(rune.eyebrow, 'Runes');
  const laid = drawResult('reading', [{ name: 'Death', reversed: false, keywords: 'endings' }, { name: 'The Sun', reversed: true, keywords: 'joy, warmth' }], '', 'r3', AT, 'tarot');
  assert.equal(laid.answer, 'Death, upright · The Sun, reversed');
  assert.equal(laid.detail, 'endings · joy');
  assert.equal(laid.eyebrow, 'Tarot');
});

test('scrying shows its minutes; the chip is the same', () => {
  const r = scryingResult('the bowl', 9.6, 'a door, half open', 'r4', AT);
  assert.equal(r.answer, 'Scrying · 10 min');
  assert.equal(resultChip(r), 'Scrying · 10 min');
  assert.equal(r.detail, 'a door, half open');
});

test('candle reading keeps its own notes', () => {
  const r = ceromancyResult('A tall, steady flame', ' warm ', AT);
  assert.equal(r.notes, 'warm');
  assert.equal(r.readingId, null);
});

test('scrying becomes a reading; notes land in What you make of it', () => {
  const reading = scryingReading({ saw: 'a door', symbols: '', feelings: 'calm' }, { vessel: 'the bowl', minutes: 1, date: new Date(2026, 10, 4, 20) });
  assert.equal(reading.method, 'scrying');
  assert.equal(reading.date, '2026-11-04');
  assert.equal(reading.cameUp, 'Scrying · the bowl · 1 minute\nSaw: a door\nFelt: calm');
  assert.equal(withNotes(reading, '  it felt like an invitation ').interpretation, 'it felt like an invitation');
});

test('a card the coven drew arrives once, and only if it is not yours', async () => {
  const { newlyLaid, laidResult, readingForResult, canKeepNotes } = await import('../src/lib/altar/divinationResult.ts');
  const card = (id: string, readingId: string, drawn: string, method = 'tarot') =>
    ({ altarObjectId: id, livingState: JSON.stringify({ app: { reading: { id: readingId, drawn, method } } }) }) as never;
  const objects = [card('a', 'r-mine', 'The Star'), card('b', 'r-theirs', 'The Moon, reversed'), card('c', 'r-old', 'Fehu', 'runes')];
  const fresh = newlyLaid(objects, new Set(['c']), new Set(['r-mine']));
  assert.deepEqual(fresh.map((o) => o.altarObjectId), ['b']);
  const r = laidResult(fresh[0], 'illusion, fear', AT)!;
  assert.equal(r.answer, 'The Moon, reversed');
  assert.equal(r.eyebrow, 'Tarot · drawn at the coven altar');
  assert.equal(r.readingId, null);
  assert.ok(canKeepNotes(r));
  const mine = readingForResult(r, ' a quiet warning ', new Date(2026, 10, 4, 20));
  assert.equal(mine.method, 'tarot');
  assert.deepEqual(mine.drawn, ['The Moon, reversed']);
  assert.equal(mine.interpretation, 'a quiet warning');
});

test('notes on a candle reading are kept with the candle', async () => {
  const { withCandleNotes } = await import('../src/lib/altar/divinationResult.ts');
  const { readingsOf } = await import('../src/lib/altar/ceromancy.ts');
  const candle = { altarObjectId: 'k', livingState: JSON.stringify({ app: { readings: [{ id: 'x', burnId: 'b', at: AT, flame: 'steady', smoke: [], wax: [], notes: '', text: '' }] } }) } as never;
  const next = withCandleNotes(candle, 'x', ' all well ', AT);
  assert.equal(readingsOf(next)[0].notes, 'all well');
  assert.match(readingsOf(next)[0].text, /My notes: all well/);
  assert.equal(withCandleNotes(candle, 'nope', 'x', AT), candle);
  assert.equal(readingsOf(withCandleNotes(candle, '', 'latest', AT))[0].notes, 'latest');
});
