// Founding a coven: the founder's training (its modules match the database's
// list, every lesson has a test the device can score and links that open),
// where a coven stands with Find a coven, the application's checks, the
// moderators' phone notes, and reactions in a ritual together.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { FOUNDER_COURSE } from '../src/lib/covens/courses/index.ts';
import { courseLinkAppHref, courseLinkSiteHref } from '../src/lib/covens/courseLinks.ts';
import {
  emptyDraft,
  FOUNDER_MODULES,
  FOUNDER_REFLECTIONS,
  listingState,
  moduleParts,
  scoreModule,
  trainingStatus,
  validateApplication,
  validateDecision,
} from '../src/lib/covens/founding.ts';
import { reactionLine, readReaction, shownReactions, REACTION_SHOW_MS } from '../src/lib/together/live.ts';
import { listingAnswerNote, listingAskedNote } from '../../supabase/functions/coven-notify/founding.ts';

const migration = readFileSync(new URL('../../supabase/migrations/20261129000000_coven_founders_live.sql', import.meta.url), 'utf8');

test('the modules are the database’s, in order, and each has a lesson, a reflection and a test', () => {
  const listed = migration.match(/leader_training_modules\(\)[\s\S]*?array\[([\s\S]*?)\]::text\[\]/)?.[1] ?? '';
  const ids = [...listed.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids, FOUNDER_MODULES.map((m) => m.id));
  for (const m of FOUNDER_MODULES) {
    const { doc, quiz } = moduleParts(FOUNDER_COURSE, m.slug);
    assert.ok(doc && doc.body.length > 3000, `${m.id}: a lesson with depth`);
    assert.equal(doc!.title, m.title);
    assert.ok(quiz, `${m.id}: a test`);
    assert.ok(quiz!.questions.every((q) => ['single', 'multi', 'truefalse'].includes(q.type) && q.correct?.length), `${m.id}: every question scored on the device`);
    assert.ok(FOUNDER_REFLECTIONS[m.slug], `${m.id}: a reflection`);
    for (const link of doc!.links ?? []) {
      assert.ok(courseLinkAppHref(link), `${m.id}: ${link.kind}:${link.id} opens in the app`);
      assert.ok(courseLinkSiteHref(link), `${m.id}: ${link.kind}:${link.id} opens on the website`);
    }
    const right = Object.fromEntries(quiz!.questions.map((q) => [q.id, q.correct!]));
    assert.deepEqual(scoreModule(quiz!, right), { score: quiz!.questions.length, max: quiz!.questions.length, passed: true, unanswered: 0 });
    const oneWrong = { ...right, q1: [99] };
    assert.equal(scoreModule(quiz!, oneWrong).passed, true, '4 of 5 is 80%');
    assert.equal(scoreModule(quiz!, { ...oneWrong, q2: [99] }).passed, false);
  }
  assert.ok(!/!/.test(FOUNDER_COURSE.docs.map((d) => d.body).join('')), 'no exclamation marks');
});

test('training status and the badge', () => {
  assert.equal(trainingStatus([]).done, false);
  assert.equal(trainingStatus([]).next?.slug, 'holding-space');
  const all = trainingStatus(FOUNDER_MODULES.map((m) => ({ module_id: m.id })));
  assert.equal(all.done, true);
  assert.equal(all.next, null);
  assert.equal(trainingStatus([{ module_id: 'core-founder-holding-space' }, { module_id: 'something-else' }]).count, 1);
});

test('where a coven stands with Find a coven', () => {
  assert.equal(listingState({ listing_approved_at: '2026-01-01', visibility: 'listed' }, null).key, 'listed');
  assert.equal(listingState({ listing_approved_at: '2026-01-01', visibility: 'unlisted' }, null).key, 'approved');
  assert.equal(listingState({ listing_approved_at: null, visibility: 'unlisted' }, null).key, 'none');
  assert.equal(listingState({ listing_approved_at: null, visibility: 'unlisted' }, { status: 'pending', moderator_note: null }).canApply, false);
  assert.equal(listingState({ listing_approved_at: null, visibility: 'unlisted' }, { status: 'changes', moderator_note: 'More on safety' }).canApply, true);
});

test('the application and the moderators’ answer are checked', () => {
  const blank = emptyDraft();
  assert.ok(validateApplication(blank, false).length >= 6);
  const full = { ...blank, path: 'Hedge', experience: 'Ten years', why: 'Friends', safety: 'Consent first', agree: true, adult: true };
  assert.deepEqual(validateApplication(full, true), []);
  assert.ok(validateApplication(full, false).some((e) => /training/.test(e)));
  assert.ok(validateApplication({ ...full, adult: false }, true).some((e) => /18/.test(e)));
  assert.equal(validateDecision('approved', ''), null);
  assert.ok(validateDecision('declined', '  '));
});

test('phone notes for listing applications', () => {
  assert.equal(listingAskedNote({ covenName: 'Thistle', who: 'Rowan', again: false }).url, '/coven/moderation');
  const changes = listingAnswerNote({ covenName: 'Thistle', covenSlug: 'thistle', status: 'changes', note: 'Say more about safety' });
  assert.match(changes.body, /Say more about safety/);
  assert.equal(changes.url, '/coven/leading/apply?c=thistle');
  assert.match(listingAnswerNote({ covenName: 'Thistle', covenSlug: 'thistle', status: 'approved', note: null }).body, /Find a coven/);
});

test('reactions in a ritual together', () => {
  assert.equal(readReaction({ key: 'flame', user_id: 'a' }), null);
  const r = readReaction({ key: 'candle', user_id: 'a' }, 1000)!;
  assert.equal(r.key, 'candle');
  assert.deepEqual(shownReactions([r], 1000 + REACTION_SHOW_MS + 1), []);
  assert.equal(reactionLine([r], () => 'Rowan'), '🕯️ Rowan');
});
