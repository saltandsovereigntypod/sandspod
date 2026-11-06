import assert from 'node:assert/strict';
import { test } from 'node:test';

import { newSession } from '../src/lib/craft/psychic/log.ts';
import {
  allLockedIn,
  chanceFor,
  draftPayload,
  keptSession,
  partnerBreakdown,
  resultsOf,
  roundTiming,
  scoreFor,
  senderFor,
  sessionEnd,
  sessionTable,
  whereAt,
  type Draft,
  type Guess,
} from '../src/lib/craft/psychic/telepathy.ts';

const S = { starts_at: '2026-12-01T20:00:00.000Z', rounds: 3, round_seconds: 60 };
const t0 = Date.parse(S.starts_at);

test('sender rotation', () => {
  const p = ['a', 'b', 'c'];
  assert.deepEqual([1, 2, 3, 4].map((n) => senderFor('alternate', p, n)), ['a', 'b', 'c', 'a']);
  assert.equal(senderFor('fixed', p, 5, 'b'), 'b');
  assert.equal(senderFor('fixed', p, 5, 'zz'), 'a');
  assert.equal(senderFor('random', p, 1, null, () => 0.99), 'c');
  assert.equal(senderFor('random', p, 1, null, () => 0), 'a');
});

test('round timing and sync: the same moment gives the same place', () => {
  assert.deepEqual(roundTiming(S, 2), { start: t0 + 80_000, reveal: t0 + 140_000, end: t0 + 160_000 });
  assert.equal(sessionEnd(S), t0 + 240_000);
  assert.deepEqual(whereAt(S, t0 - 5000), { phase: 'before', msToStart: 5000 });
  assert.deepEqual(whereAt(S, t0 + 10_000), { phase: 'round', n: 1, msLeft: 50_000 });
  assert.deepEqual(whereAt(S, t0 + 65_000), { phase: 'reveal', n: 1, msLeft: 15_000 });
  assert.deepEqual(whereAt(S, t0 + 85_000), { phase: 'round', n: 2, msLeft: 55_000 });
  assert.equal(whereAt(S, t0 + 240_000).phase, 'done');
  // Early reveal brings the reveal forward but not the next round.
  assert.deepEqual(whereAt(S, t0 + 30_000, { 1: t0 + 20_000 }), { phase: 'reveal', n: 1, msLeft: 50_000 });
});

const g = (n: number, user_id: string, guess: string): Guess => ({ round_n: n, user_id, guess, impressions: null });

test('scoring: hits, misses and unanswered rounds', () => {
  const rounds = [{ n: 1, sender_id: 'a' }, { n: 2, sender_id: 'b' }, { n: 3, sender_id: 'a' }];
  const results = resultsOf(rounds, { 1: 'star', 2: 'cross' }, [g(1, 'b', 'star'), g(1, 'c', 'cross'), g(2, 'a', 'cross'), g(2, 'b', 'star')]);
  assert.equal(results.length, 2);
  assert.deepEqual(scoreFor(results, 'b'), { trials: 1, hits: 1 });
  assert.deepEqual(scoreFor(results, 'a'), { trials: 1, hits: 1 });
  assert.deepEqual(scoreFor(results, 'c'), { trials: 2, hits: 0 });
  const t = sessionTable(results, ['a', 'b', 'c']);
  assert.deepEqual(t.find((x) => x.id === 'a'), { id: 'a', trials: 1, hits: 1, sent: 1, sentTrials: 2, sentHits: 1 });
  assert.equal(allLockedIn(['a', 'b', 'c'], 'a', [g(1, 'b', 'x')]), false);
  assert.equal(allLockedIn(['a', 'b', 'c'], 'a', [g(1, 'b', 'x'), g(1, 'c', 'y')]), true);
  assert.equal(chanceFor('symbols'), 0.2);
  assert.equal(chanceFor('picture'), 0.25);
});

test('kept session and per-partner stats', () => {
  const rounds = [{ n: 1, sender_id: 'a' }, { n: 2, sender_id: 'me' }];
  const results = resultsOf(rounds, { 1: 'star', 2: 'cups' }, [g(1, 'me', 'star'), g(2, 'a', 'wands')]);
  const k = keptSession({ sessionId: 's1', userId: 'me', type: 'symbols', title: '', results, names: { a: 'Ash' }, kind: 'pair' });
  assert.equal(k.trials, 1);
  assert.equal(k.hits, 1);
  assert.equal(k.chance, 0.2);
  const entry = { data: newSession({ kind: 'telepathy', summary: k.summary, trials: k.trials, hits: k.hits, chance: k.chance, detail: k.detail }) };
  const rows = partnerBreakdown([entry, entry]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Ash');
  assert.deepEqual([rows[0].received.trials, rows[0].received.hits, rows[0].sent.trials, rows[0].sent.hits], [2, 2, 2, 0]);
  assert.ok(rows[0].received.p < 0.05);
});

test('draft payload checks', () => {
  const now = new Date('2026-12-01T10:00:00Z');
  const d: Draft = { kind: 'pair', covenId: null, title: ' x ', target: 'picture', rounds: 5, seconds: 60, startsAt: null, senderMode: 'alternate', hostSends: true, sound: '', pool: Array.from({ length: 8 }, (_, i) => `c:${i}`) };
  const ok = draftPayload(d, now);
  assert.ok(ok.ok && ok.row.title === 'x' && ok.row.starts_at === '2026-12-01T10:01:30.000Z');
  assert.equal(draftPayload({ ...d, pool: [] }, now).ok, false);
  assert.equal(draftPayload({ ...d, kind: 'coven' }, now).ok, false);
  assert.equal(draftPayload({ ...d, startsAt: new Date(now.getTime() + 10_000) }, now).ok, false);
  assert.equal(draftPayload({ ...d, rounds: 99 }, now).ok, false);
});
