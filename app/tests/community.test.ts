import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  authorName,
  communityDate,
  fieldNotePayload,
  filterEntries,
  notesFor,
  offeringPayload,
  paragraphs,
  parseTags,
  replyActivity,
  replyPayload,
  senderLabel,
  statusLabel,
  typeLabel,
  type SubmissionRow,
} from '../src/lib/community/model.ts';

const entry = (id: string, extra: Partial<SubmissionRow> = {}): SubmissionRow => ({
  id,
  user_id: null,
  parent_submission_id: null,
  submission_type: 'community_grimoire',
  note_type: null,
  title: 'Untitled',
  body: '',
  display_as: 'anonymous',
  display_name: 'Anonymous',
  anonymous: true,
  tags: [],
  status: 'published',
  reviewer_response: null,
  created_at: '2026-09-01T12:00:00Z',
  updated_at: '2026-09-01T12:00:00Z',
  ...extra,
});

const offering = {
  submissionType: 'ritual_experience',
  title: '  Dark moon release ',
  body: ' I burned the list. ',
  displayAs: 'magical_name' as const,
  tags: 'Hekate, release, ,dark moon',
  originalWorkConfirmed: true,
  termsAgreed: true,
};

test('an offering matches the row the website inserts', () => {
  const result = offeringPayload(offering, { userId: 'u1', names: { magical_name: 'Nightshade' } });
  assert.deepEqual(result, {
    ok: true,
    payload: {
      user_id: 'u1',
      submission_type: 'ritual_experience',
      title: 'Dark moon release',
      body: 'I burned the list.',
      display_as: 'magical_name',
      display_name: 'Nightshade',
      anonymous: false,
      tags: ['Hekate', 'release', 'dark moon'],
      original_work_confirmed: true,
      terms_agreed: true,
      status: 'pending',
    },
  });
});

test('guests can offer anonymously; missing names fall back like the website', () => {
  const guest = offeringPayload({ ...offering, displayAs: 'anonymous' }, { userId: null, names: {} });
  assert.ok(guest.ok && guest.payload.user_id === null && guest.payload.display_name === 'Anonymous' && guest.payload.anonymous);
  const unnamed = offeringPayload({ ...offering, displayAs: 'preferred_name' }, { userId: 'u1', names: {} });
  assert.ok(unnamed.ok && unnamed.payload.display_name === 'Preferred Name');
});

test('offerings need a title, body, confirmation and the terms', () => {
  assert.equal(offeringPayload({ ...offering, title: ' ' }, { userId: null, names: {} }).ok, false);
  assert.equal(offeringPayload({ ...offering, termsAgreed: false }, { userId: null, names: {} }).ok, false);
  assert.equal(offeringPayload({ ...offering, originalWorkConfirmed: false }, { userId: null, names: {} }).ok, false);
  assert.equal(offeringPayload({ ...offering, submissionType: 'community_note' }, { userId: null, names: {} }).ok, false);
});

test('a Field Note matches the website’s insert', () => {
  const result = fieldNotePayload(
    { noteType: 'substitution', displayName: ' Rowan ', body: ' Used thyme instead. ', termsAgreed: true },
    { userId: null, parent: { id: 'p1', title: 'Money bowl' } },
  );
  assert.deepEqual(result, {
    ok: true,
    payload: {
      user_id: null,
      parent_submission_id: 'p1',
      submission_type: 'community_note',
      note_type: 'substitution',
      title: 'Field Note on: Money bowl',
      body: 'Used thyme instead.',
      display_as: 'custom',
      display_name: 'Rowan',
      anonymous: false,
      tags: ['field-note', 'substitution'],
      original_work_confirmed: true,
      terms_agreed: true,
      status: 'pending',
    },
  });
  const anon = fieldNotePayload(
    { noteType: 'bogus', displayName: '', body: 'x'.repeat(2000), termsAgreed: true },
    { userId: 'u', parent: { id: 'p', title: '' } },
  );
  assert.ok(anon.ok);
  if (anon.ok) {
    assert.equal(anon.payload.note_type, 'reflection');
    assert.equal(anon.payload.display_as, 'anonymous');
    assert.equal((anon.payload.body as string).length, 1200);
    assert.equal(anon.payload.title, 'Field Note on: Community Grimoire Page');
  }
});

test('replies and their activity update', () => {
  assert.equal(replyPayload('s', 'u', '   '), null);
  assert.deepEqual(replyPayload('s', 'u', ' Thank you '), { submission_id: 's', user_id: 'u', sender_role: 'user', message: 'Thank you' });
  assert.deepEqual(replyActivity(new Date('2026-09-25T10:00:00Z')), {
    admin_folder: 'active',
    archived_at: null,
    last_activity_at: '2026-09-25T10:00:00.000Z',
    updated_at: '2026-09-25T10:00:00.000Z',
  });
  assert.equal(senderLabel({ sender_role: 'admin' }), 'Salt & Sovereignty');
  assert.equal(senderLabel({ sender_role: 'user' }), 'You');
});

test('search and type filters work like the website', () => {
  const entries = [
    entry('a', { title: 'Hekate at the crossroads', tags: ['Hekate'] }),
    entry('b', { title: 'Flying dream', submission_type: 'dream_experience', display_name: 'Moth', anonymous: false }),
    entry('c', { title: 'Salt line', body: 'A protection ritual' }),
  ];
  assert.deepEqual(filterEntries(entries, 'hekate', 'all').map((e) => e.id), ['a']);
  assert.deepEqual(filterEntries(entries, '', 'dream_experience').map((e) => e.id), ['b']);
  assert.deepEqual(filterEntries(entries, 'moth', 'all').map((e) => e.id), ['b']);
  assert.deepEqual(filterEntries(entries, 'PROTECTION', 'all').map((e) => e.id), ['c']);
  assert.deepEqual(filterEntries(entries, 'protection', 'dream_experience'), []);
});

test('labels, authors, notes and dates', () => {
  assert.equal(typeLabel('podcast'), 'Podcast Story or Question');
  assert.equal(typeLabel('mystery'), 'Community Offering');
  assert.equal(statusLabel('needs_revision'), 'Needs revision');
  assert.equal(authorName({ anonymous: true, display_name: 'Rowan' }), 'Anonymous');
  assert.equal(authorName({ anonymous: false, display_name: null }), 'Community Member');
  assert.deepEqual(notesFor([entry('n', { parent_submission_id: 'a' }), entry('m')], 'a').map((n) => n.id), ['n']);
  assert.deepEqual(parseTags(' a, ,b '), ['a', 'b']);
  assert.deepEqual(paragraphs('One\n\n Two \n'), ['One', 'Two']);
  assert.equal(communityDate('2026-09-01T12:00:00Z'), 'September 1, 2026');
  assert.equal(communityDate('nope'), '');
});
