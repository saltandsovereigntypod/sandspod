// Coven requests: who hears about a new application or request to advance
// (the coven's reviewers, never the one who asked, nor anyone who turned it
// off), the answer sent back to the one who asked, the counts on the Coven
// tab and each coven's Review, and the choice kept with the synced Reminders
// (`reminders_v2`) so the app, the website and the coven-notify edge function
// all read it the same way.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { covenSources, reviewsCoven, type Standing } from '../src/lib/reminders/covens.ts';
import { countPending, covenTabCount, pendingIn, pendingLabel, requestsWanted } from '../src/lib/covens/requests.ts';
import { DEFAULT_PREFS, normalizePrefs, prefsValue, readPrefs, requestsOn, setRequestsFor, withChange, PREFS_KEY } from '../src/lib/reminders/prefs.ts';
import { normalizeSettings, settingsRow } from '../src/lib/settings/defaults.ts';
import type { Coven, Member, Rank } from '../src/lib/covens/model.ts';
import { answerNote, isFresh, requestNote, reviewersOf, wantsNotice } from '../../supabase/functions/coven-notify/requests.ts';

const NOW = new Date(2026, 9, 26, 12, 0);

const ranks = [
  { id: 'r-member', coven_id: 'c1', name: 'Member', level: 1 },
  { id: 'r-elder', coven_id: 'c1', name: 'Elder', level: 5, can_review: true },
  { id: 'r-priestess', coven_id: 'c1', name: 'High Priestess', level: 9, can_manage: true },
  { id: 'r-keeper', coven_id: 'c1', name: 'Keeper', level: 4, can_moderate: true },
] as Rank[];
const members = [
  { user_id: 'founder', rank_id: 'r-member', status: 'active' },
  { user_id: 'elder', rank_id: 'r-elder', status: 'active' },
  { user_id: 'priestess', rank_id: 'r-priestess', status: 'active' },
  { user_id: 'keeper', rank_id: 'r-keeper', status: 'active' },
  { user_id: 'member', rank_id: 'r-member', status: 'active' },
  { user_id: 'left-elder', rank_id: 'r-elder', status: 'left' },
];

test('reviewers are the founder and positions that review or lead, still active', () => {
  const who = reviewersOf({ founderId: 'founder', covenStatus: 'active', members, ranks });
  assert.deepEqual(who.sort(), ['elder', 'founder', 'priestess']);
  assert.ok(!who.includes('member'), 'an ordinary member does not');
  assert.ok(!who.includes('keeper'), 'a moderating position alone does not');
  assert.ok(!who.includes('left-elder'), 'someone who left does not');
  assert.deepEqual(reviewersOf({ founderId: 'founder', covenStatus: 'suspended', members, ranks }), [], 'a paused coven rings no one');
});

test('the edge function and the app agree on who reviews', () => {
  const coven = { id: 'c1', slug: 'moon-circle', name: 'Moon Circle', status: 'active', founder_id: 'founder' } as Coven;
  const fromFunction = reviewersOf({ founderId: 'founder', covenStatus: 'active', members, ranks }).sort();
  const fromApp = members
    .filter((m) => reviewsCoven({ coven, membership: { coven_id: 'c1', ...m } as Member, ranks }, m.user_id))
    .map((m) => m.user_id)
    .sort();
  assert.deepEqual(fromFunction, fromApp);
});

test('the one who asked is never told about their own request', () => {
  // An elder asking to become High Priestess is a reviewer, but not of their own request (as the function filters it).
  const recipients = reviewersOf({ founderId: 'founder', covenStatus: 'active', members, ranks }).filter((u) => u !== 'elder');
  assert.ok(!recipients.includes('elder'));
  assert.ok(recipients.includes('founder'));
});

test('a reviewer who turned a coven off, or all of them, or paused reminders, is not told', () => {
  const on = prefsValue(DEFAULT_PREFS);
  const offHere = prefsValue(setRequestsFor(DEFAULT_PREFS, 'c1', false));
  const allOff = prefsValue(withChange(DEFAULT_PREFS, 'requests.on', false));
  const paused = prefsValue(withChange(withChange(DEFAULT_PREFS, 'paused', true), 'pausedUntil', '2026-11-02'));
  assert.equal(wantsNotice(on, 'new', 'c1', NOW), true);
  assert.equal(wantsNotice(null, 'new', 'c1', NOW), true, 'nothing saved: on');
  assert.equal(wantsNotice('', 'new', 'c1', NOW), true);
  assert.equal(wantsNotice('{not json', 'new', 'c1', NOW), true);
  assert.equal(wantsNotice(offHere, 'new', 'c1', NOW), false);
  assert.equal(wantsNotice(offHere, 'new', 'c2', NOW), true, 'other covens still ring');
  assert.equal(wantsNotice(allOff, 'new', 'c2', NOW), false);
  assert.equal(wantsNotice(paused, 'new', 'c1', NOW), false);
  assert.equal(wantsNotice(paused, 'new', 'c1', new Date(2026, 10, 3, 12)), true, 'the pause ends');
  // Hearing back about your own is its own choice.
  assert.equal(wantsNotice(allOff, 'answer', 'c1', NOW), true);
  assert.equal(wantsNotice(prefsValue(withChange(DEFAULT_PREFS, 'requests.answers', false)), 'answer', 'c1', NOW), false);
});

test('the function, the website and the app read the choice the same way', () => {
  const cases = [DEFAULT_PREFS, setRequestsFor(DEFAULT_PREFS, 'c1', false), withChange(DEFAULT_PREFS, 'requests.on', false), setRequestsFor(withChange(DEFAULT_PREFS, 'requests.on', false), 'c2', true, ['c1', 'c2'])];
  for (const prefs of cases) {
    const saved = prefsValue(prefs);
    for (const id of ['c1', 'c2', 'c3']) {
      const app = requestsOn(readPrefs(normalizeSettings({ [PREFS_KEY]: saved })), id);
      assert.equal(wantsNotice(saved, 'new', id, NOW), app, `function ${id}`);
      assert.equal(requestsWanted(saved, id), app, `website ${id}`);
    }
  }
});

test('turning one coven back on while all are off keeps the others off', () => {
  const off = withChange(DEFAULT_PREFS, 'requests.on', false);
  const next = setRequestsFor(off, 'c2', true, ['c1', 'c2', 'c3']);
  assert.equal(next.requests.on, true);
  assert.equal(requestsOn(next, 'c2'), true);
  assert.equal(requestsOn(next, 'c1'), false);
  assert.equal(requestsOn(next, 'c3'), false);
});

test('the choice round-trips through the settings row the website and app share', () => {
  const prefs = withChange(setRequestsFor(DEFAULT_PREFS, 'c1', false), 'requests.answers', false);
  const row = settingsRow(normalizeSettings({ [PREFS_KEY]: prefsValue(prefs) }), 'u1', NOW);
  const back = readPrefs(normalizeSettings({ settings: row.settings }), null);
  assert.deepEqual(back.requests, { on: true, off: ['c1'], answers: false });
  // Older saved choices without it read as on.
  assert.deepEqual(normalizePrefs({ version: 2 }).requests, { on: true, off: [], answers: true });
  assert.deepEqual(normalizePrefs({ requests: { on: 'yes', off: ['c1', 3, 'c1'] } }).requests, { on: true, off: ['c1'], answers: true });
});

test('the reviewer note: title and body, opening Review', () => {
  assert.deepEqual(requestNote({ kind: 'application', covenName: 'Moon Circle', covenSlug: 'moon-circle', who: 'Rowan' }), {
    title: 'New application · Moon Circle',
    body: 'Rowan asked to join',
    url: '/coven/c/moon-circle/review',
  });
  const adv = requestNote({ kind: 'advancement', covenName: 'Moon Circle', covenSlug: 'moon-circle', who: 'Rowan', rankName: 'Elder' });
  assert.equal(adv.body, 'Rowan asked to become Elder');
  assert.equal(adv.url, '/coven/c/moon-circle/review');
});

test('the answer to the one who asked, with the reviewer’s note', () => {
  const yes = answerNote({ kind: 'application', approved: true, covenName: 'Moon Circle', covenSlug: 'moon-circle', note: 'Glad to have you.' });
  assert.equal(yes.url, '/coven/c/moon-circle');
  assert.match(yes.body, /accepted/);
  assert.match(yes.body, /“Glad to have you\.”/);
  const no = answerNote({ kind: 'application', approved: false, covenName: 'Moon Circle', covenSlug: 'moon-circle', note: '  ' });
  assert.equal(no.url, '/coven', 'a declined application opens the coven list');
  assert.doesNotMatch(no.body, /“/);
  const rose = answerNote({ kind: 'advancement', approved: true, covenName: 'Moon Circle', covenSlug: 'moon-circle', rankName: 'Elder' });
  assert.equal(rose.body, 'You’re now Elder.');
  const not = answerNote({ kind: 'advancement', approved: false, covenName: 'Moon Circle', covenSlug: 'moon-circle', rankName: 'Elder', note: 'x'.repeat(400) });
  assert.equal(not.url, '/coven/c/moon-circle/path');
  assert.ok(not.body.length < 260, 'a long note is shortened');
  for (const n of [yes, no, rose, not]) assert.doesNotMatch(`${n.title} ${n.body}`, /!/);
});

test('only a fresh request rings', () => {
  const at = (minutesAgo: number) => new Date(NOW.getTime() - minutesAgo * 60_000).toISOString();
  assert.equal(isFresh(at(1), NOW), true);
  assert.equal(isFresh(at(6), NOW), false);
  assert.equal(isFresh(null, NOW), false);
});

test('counts: only covens you review, only waiting ones, never your own', () => {
  const apps = [
    { coven_id: 'c1', user_id: 'a' },
    { coven_id: 'c1', user_id: 'b' },
    { coven_id: 'c1', user_id: 'me' },
    { coven_id: 'c2', user_id: 'c' },
    { coven_id: 'c1', user_id: 'd', status: 'approved' },
  ];
  const advs = [
    { coven_id: 'c1', user_id: 'e' },
    { coven_id: 'c3', user_id: 'f' },
  ];
  const counts = countPending(apps, advs, ['c1', 'c3'], 'me');
  assert.deepEqual(counts, { c1: { applications: 2, advancements: 1 }, c3: { applications: 0, advancements: 1 } });
  assert.equal(pendingIn(counts, 'c1'), 3);
  assert.equal(pendingIn(counts, 'c2'), 0, 'a coven you don’t review counts nothing');
  assert.equal(pendingIn(counts), 4);
  assert.equal(pendingLabel(counts.c1), '2 applications and a request to advance waiting');
  assert.equal(pendingLabel(counts.c3), 'A request to advance waiting');
  assert.equal(pendingLabel({ applications: 0, advancements: 0 }), '');
});

test('the Coven tab counts unread messages and requests together', () => {
  assert.deepEqual(covenTabCount(3, 2), { count: 5, label: '3 unread messages, 2 requests to review' });
  assert.deepEqual(covenTabCount(0, 1), { count: 1, label: '1 request to review' });
  assert.deepEqual(covenTabCount(1, 0), { count: 1, label: '1 unread message' });
  assert.equal(covenTabCount(0, 0).count, 0);
});

test('Reminders list the covens you review', () => {
  const coven = { id: 'c1', slug: 'moon-circle', name: 'Moon Circle', status: 'active', founder_id: 'founder' } as Coven;
  const standing = (userId: string): Standing => ({ coven, membership: { coven_id: 'c1', ...members.find((m) => m.user_id === userId)! } as Member, ranks });
  assert.equal(covenSources([standing('elder')], [], 'elder', NOW)[0].reviewer, true);
  assert.equal(covenSources([standing('member')], [], 'member', NOW)[0].reviewer, false);
  assert.equal(covenSources([standing('founder')], [], 'founder', NOW)[0].reviewer, true);
});
