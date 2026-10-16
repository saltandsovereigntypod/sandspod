import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ATTUNED_AT, attunementOf, DEEPLY_ATTUNED_AT, usesOf } from '../src/lib/altar/attunement.ts';
import { recordCharge } from '../src/lib/altar/charge.ts';
import { careForCrystal, recordOffering } from '../src/lib/altar/devotion.ts';
import { lightCandle, logAppEvent, snuffCandle, writeLivingState, readLivingState } from '../src/lib/altar/livingState.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const HOUR = 3_600_000;
const start = Date.UTC(2026, 9, 1, 20);
const at = (h: number) => new Date(start + h * HOUR).toISOString();

const candle = (): SavedObject => ({ type: 'candle', label: 'Red Candle', form: 'pillar', altarObjectId: 'c1' });

test('a new thing has no uses and no mark', () => {
  assert.equal(usesOf({ type: 'crystal' }), 0);
  const a = attunementOf(candle());
  assert.equal(a.attuned, false);
  assert.equal(a.line, '');
});

test('burns count, and after nine the candle is attuned', () => {
  let c = candle();
  for (let i = 0; i < ATTUNED_AT; i++) c = snuffCandle(lightCandle(c, at(i * 24)), at(i * 24 + 1));
  assert.equal(usesOf(c), ATTUNED_AT);
  const a = attunementOf(c);
  assert.equal(a.attuned, true);
  assert.equal(a.deeply, false);
  assert.match(a.line, /^Attuned · worked with 9 times/);
});

test('cleansings, charges, offerings and the app log count; moon charges and petitions do not', () => {
  const care = (o: SavedObject, kind: 'cleanse' | 'charge', h: number) =>
    careForCrystal(o, kind, { decision: 'x', purpose: 'Routine care', methods: ['Salt'], supports: [], occurredAt: at(h) }, at(h));
  let stone: SavedObject = { type: 'crystal', altarObjectId: 's1' };
  stone = care(care(stone, 'cleanse', 1), 'charge', 2);
  stone = recordCharge(stone, 'Moon charge', at(3));
  stone = logAppEvent(stone, { kind: 'petition', text: 'A petition was folded beneath it.' }, at(4));
  // A moon charge the altar recorded by itself.
  const state = readLivingState(stone, at(5));
  const crystal = state.crystal as Record<string, unknown>;
  stone = writeLivingState(stone, { ...state, crystal: { ...crystal, chargingHistory: [...(crystal.chargingHistory as unknown[]), { source: 'moon', occurredAt: at(5) }] } }, at(5));
  assert.equal(usesOf(stone), 3);

  let deity: SavedObject = { type: 'deity', altarObjectId: 'd1' };
  for (let i = 0; i < DEEPLY_ATTUNED_AT; i++) {
    deity = recordOffering(deity, { types: ['Food'], supports: [], customItems: 'bread', intention: '', message: '', status: 'Offered', customStatus: '', response: '', responseNotes: '', occurredAt: at(i) }, at(i));
  }
  const a = attunementOf(deity);
  assert.equal(a.deeply, true);
  assert.match(a.line, /^Deeply attuned/);
});
