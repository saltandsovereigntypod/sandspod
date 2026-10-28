// Waiting lists for full positions (lib/covens/queue.ts, coven-notify's
// queue.ts) and a test's answers only once passed (lib/covens/quiz.ts):
// line order and places, the member's and the leaders' words, reordering,
// the proposal card's choices, the phone notes, and a result without the key
// still saying which questions were right.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { ordinal as noteOrdinal, promotedNote, proposedNote, queuedNote } from '../../supabase/functions/coven-notify/queue.ts';
import { entryLine, eventLine, inLine, isFull, moved, myPlaceLine, ordinal, othersInLine, proposalLine, proposals, readEntries, readList, type QueueEntry } from '../src/lib/covens/queue.ts';
import { attemptLines, hasKey, keyLine, scoreLine, type Attempt, type Question } from '../src/lib/covens/quiz.ts';

const entry = (over: Partial<QueueEntry>): QueueEntry => ({
  id: 'q1',
  coven_id: 'c',
  rank_id: 'r',
  user_id: 'u1',
  name: 'Rowan',
  source: 'program',
  source_id: null,
  qualified_at: '2026-10-01T10:00:00Z',
  queued_at: '2026-10-01T10:00:00Z',
  status: 'waiting',
  proposed_at: null,
  deferred_at: null,
  decided_at: null,
  note: null,
  place: 1,
  ...over,
});

test('ordinals, in the app and in the phone note alike', () => {
  for (const [n, w] of [[1, '1st'], [2, '2nd'], [3, '3rd'], [4, '4th'], [11, '11th'], [12, '12th'], [13, '13th'], [21, '21st'], [22, '22nd'], [101, '101st'], [111, '111th']] as const) {
    assert.equal(ordinal(n), w);
    assert.equal(noteOrdinal(n), w);
  }
});

test('line order: whoever is proposed first, then by when they joined', () => {
  const list = readEntries([
    { id: 'b', name: 'Bramble', queued_at: '2026-10-02T00:00:00Z', status: 'waiting', source: 'application', place: 3 },
    { id: 'a', name: 'Ash', queued_at: '2026-10-01T00:00:00Z', status: 'waiting', source: 'program', place: 2 },
    { id: 'c', name: 'Clover', queued_at: '2026-10-03T00:00:00Z', status: 'proposed', source: 'leader', place: 1, held: 2 },
    { id: 'junk', status: 'nonsense', source: 'nowhere' },
    null,
    'x',
  ]);
  assert.deepEqual(list.map((e) => e.id), ['c', 'junk', 'a', 'b'], 'not-quite rows kept, the rest dropped');
  assert.equal(list[0].id, 'c', 'proposed first');
  assert.equal(list.find((e) => e.id === 'junk')?.status, 'waiting', 'unknown status read as waiting');
  assert.equal(list.find((e) => e.id === 'junk')?.source, 'leader', 'unknown source read as the leader’s');
  assert.equal(list[0].held, 2);
  assert.ok(inLine(entry({ id: 'x', queued_at: '2026-01-01T00:00:00Z' }), entry({ id: 'y', queued_at: '2026-01-02T00:00:00Z' })) < 0);
  assert.deepEqual(readEntries('nope'), []);
});

test('the member’s line: "You’re 2nd in line for Initiate"', () => {
  assert.equal(myPlaceLine(entry({ place: 2 }), 'Initiate'), 'You’re 2nd in line for Initiate.');
  assert.equal(myPlaceLine(entry({ place: null }), 'Initiate'), 'You’re on the waiting list for Initiate.');
  assert.equal(myPlaceLine(entry({ status: 'proposed' }), 'Initiate'), 'A place is free in Initiate and you’re next in line. The coven’s head will confirm it.');
});

test('entries and what happened, in words', () => {
  const line = entryLine(entry({ source: 'application', qualified_at: '2026-11-03T12:00:00Z' }), 'en-GB');
  assert.match(line, /^Request approved · since 3 November$/);
  assert.match(entryLine(entry({ status: 'proposed' })), /proposed for the free place$/);
  assert.match(entryLine(entry({ status: 'proposed', deferred_at: '2026-11-04T00:00:00Z' })), /proposed, kept for now$/);
  assert.equal(eventLine({ action: 'promoted', name: 'Rowan', actor: 'Hazel', note: null }), 'Rowan moved up (Hazel)');
  assert.equal(eventLine({ action: 'passed_over', name: 'Rowan', actor: 'Hazel', note: 'Asked to wait a season.' }), 'Rowan taken off the list (Hazel): Asked to wait a season.');
  assert.equal(eventLine({ action: 'withdrawn', name: 'Rowan', actor: null, note: null }), 'Rowan withdrew');
  assert.equal(eventLine({ action: 'left', name: 'Rowan', actor: 'Hazel', note: 'Left the coven.' }), 'Rowan left the list: Left the coven.', 'never "by" for leaving');
  const list = readList({ rank_id: 'r', seat_limit: 2, held: 2, entries: [{ id: 'a', status: 'waiting' }], history: [{ action: 'queued', name: 'Ash', at: '2026-10-01T00:00:00Z' }] });
  assert.equal(list?.entries.length, 1);
  assert.equal(list?.history[0].action, 'queued');
  assert.equal(readList(null), null);
});

test('reordering moves one place at a time and never off the ends', () => {
  assert.deepEqual(moved(['a', 'b', 'c'], 'b', -1), ['b', 'a', 'c']);
  assert.deepEqual(moved(['a', 'b', 'c'], 'b', 1), ['a', 'c', 'b']);
  assert.deepEqual(moved(['a', 'b', 'c'], 'a', -1), ['a', 'b', 'c']);
  assert.deepEqual(moved(['a', 'b', 'c'], 'c', 1), ['a', 'b', 'c']);
  assert.deepEqual(moved(['a'], 'z', 1), ['a']);
});

test('the Review card: proposals not kept for now first, and the others on the same list', () => {
  const all = [
    entry({ id: 'p1', rank_id: 'r1', status: 'proposed', deferred_at: '2026-10-05T00:00:00Z', proposed_at: '2026-10-01T00:00:00Z' }),
    entry({ id: 'p2', rank_id: 'r2', status: 'proposed', proposed_at: '2026-10-04T00:00:00Z' }),
    entry({ id: 'w1', rank_id: 'r2', queued_at: '2026-10-02T00:00:00Z' }),
    entry({ id: 'w2', rank_id: 'r2', queued_at: '2026-10-01T00:00:00Z' }),
    entry({ id: 'w3', rank_id: 'r1' }),
  ];
  assert.deepEqual(proposals(all).map((e) => e.id), ['p2', 'p1']);
  assert.deepEqual(othersInLine(all, all[1]).map((e) => e.id), ['w2', 'w1']);
  assert.equal(proposalLine('Initiate', 'Rowan'), 'A place is free in Initiate. Rowan is next in line.');
  assert.ok(isFull(1, 1) && !isFull(2, 1) && !isFull(null, 40));
});

test('the phone notes: queued, proposed, promoted', () => {
  assert.deepEqual(queuedNote({ source: 'program', rankName: 'Initiate', covenName: 'Moon Circle', covenSlug: 'moon-circle', place: 2 }), {
    title: 'Moon Circle',
    body: 'Your training is complete. Initiate is full, so you’re #2 on its waiting list.',
    url: '/coven/c/moon-circle/standing',
  });
  assert.equal(queuedNote({ source: 'application', rankName: 'Initiate', covenName: 'M', covenSlug: 'm', place: 1 }).body, 'Your request to become Initiate was approved. Initiate is full, so you’re #1 on its waiting list.');
  assert.equal(queuedNote({ source: 'leader', rankName: 'Initiate', covenName: 'M', covenSlug: 'm', place: 3 }).body, 'You’re #3 on the waiting list for Initiate.');
  assert.equal(queuedNote({ source: 'program', rankName: 'Initiate', covenName: 'M', covenSlug: 'm', place: null }).body, 'Your training is complete. Initiate is full, so you’re on its waiting list.');
  assert.deepEqual(proposedNote({ rankName: 'Initiate', who: 'Rowan', covenName: 'Moon Circle', covenSlug: 'moon-circle' }), {
    title: 'Waiting list · Moon Circle',
    body: 'A place is free in Initiate. Rowan is next in line.',
    url: '/coven/c/moon-circle/review',
  });
  assert.deepEqual(promotedNote({ rankName: 'Initiate', covenName: 'Moon Circle', covenSlug: 'moon-circle' }), { title: 'Moon Circle', body: 'You’re now Initiate in Moon Circle.', url: '/coven/c/moon-circle' });
});

test('coven-notify takes { queue_id, event } and respects the "Coven requests" choice', () => {
  const src = readFileSync(new URL('../../supabase/functions/coven-notify/index.ts', import.meta.url), 'utf8');
  assert.match(src, /payload\.queue_id && \["queued", "proposed", "promoted"\]\.includes\(payload\.event\)/);
  assert.match(src, /wantsNotice\(saved\.get\(u\) \?\? null, wants, q\.coven_id, now\)/);
  assert.match(src, /coven_queue_deciders/);
  assert.match(src, /\.is\("queued_notified_at", null\)/);
  assert.match(src, /\.is\("promoted_notified_at", null\)/);
});

// ─── A result without the key ─────────────────────────────────────────

const questions: Question[] = [
  { id: 'q1', type: 'single', prompt: 'Grounding is?', options: ['Draining', 'Settling'], correct: [1], points: 1, explanation: 'It settles.' },
  { id: 'q2', type: 'multi', prompt: 'Safe practice?', options: ['Stop', 'Push', 'Ground'], correct: [0, 2], points: 2, explanation: 'Both.' },
  { id: 'q3', type: 'short', prompt: 'Describe grounding.', points: 2, explanation: 'Roots.', rubric: 'Breath and earth.' },
];
const stripped = questions.map((q) => {
  const copy: Partial<Question> = { ...q };
  delete copy.correct;
  delete copy.explanation;
  delete copy.rubric;
  return copy as Question;
});
const attempt = (over: Partial<Attempt>): Attempt => ({
  id: 'a1', enrollment_id: 'e', task_id: 't', quiz_id: 'z', coven_id: 'c', user_id: 'u', number: 1, title: 'T',
  questions, pass_percent: 80, answers: { q1: [1], q2: [0], q3: 'Breathe.' }, auto_score: 1, manual_scores: { q3: { points: 1, comment: 'More on breath.' } },
  total: 2, max: 5, status: 'failed', scored_by: 'm', feedback: null, submitted_at: '2026-10-28T10:00:00Z', scored_at: '2026-10-28T11:00:00Z', ...over,
});

test('without the key, the marks still say which questions were right', () => {
  const a = attempt({ questions: stripped, marks: { q1: true, q2: false } });
  assert.ok(!hasKey(a) && hasKey(attempt({})));
  const lines = attemptLines(a);
  assert.deepEqual(lines.map((l) => l.right), [true, false, null]);
  assert.deepEqual(lines.map((l) => l.points), [1, 0, 1], 'points for each, the written one as scored');
  assert.equal(lines[2].comment, 'More on breath.', 'the mentor’s comment');
  assert.equal(scoreLine(a), '2 of 5 (40%)');
  // No marks (a mentor taking the same test): neither right nor wrong shown.
  assert.deepEqual(attemptLines(attempt({ questions: stripped })).map((l) => l.right), [null, null, null]);
  // With the key, it's worked out as before.
  assert.deepEqual(attemptLines(attempt({})).map((l) => l.right), [true, false, null]);
});

test('what the result says about the key', () => {
  const a = attempt({ questions: stripped, marks: { q1: true, q2: false } });
  assert.match(keyLine(a, true), /^The right answers and their explanations show here once you’ve passed this test\./);
  assert.match(keyLine(a, false), /^You’re taking this test yourself/);
  assert.equal(keyLine(attempt({}), true), '', 'nothing to say once the key is there');
});

test('the app and the website read attempts through coven_quiz_attempts_seen', () => {
  const api = readFileSync(new URL('../src/lib/covens/api.ts', import.meta.url), 'utf8');
  assert.match(api, /rpc<Attempt\[\]>\('coven_quiz_attempts_seen', \{ p_coven: covenId \}\)/);
  const site = readFileSync(new URL('../../covens/coven-data.js', import.meta.url), 'utf8');
  assert.match(site, /rpc\("coven_quiz_attempts_seen", \{ p_coven: covenId \}\)/);
});
