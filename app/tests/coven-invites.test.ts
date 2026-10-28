// Coven invitations: reading a code from whatever was pasted, the link and
// what Share sends, a new link's choices, how a link stands, invitations
// waiting, where sign-in goes next, the Coven tab's count, the synced choice
// (`reminders_v2` invitations) and the phone notes coven-notify sends.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  activeLinks,
  afterSignIn,
  appInviteLink,
  CODE_ALPHABET,
  EXPIRY_CHOICES,
  invitationLine,
  invitationOpen,
  inviteError,
  inviteLink,
  linkOptions,
  linkState,
  linkSummary,
  needsAgreements,
  needsProfile,
  openInvitations,
  parseInviteCode,
  previewLine,
  reasonWords,
  searchReady,
  shareMessage,
  USES_CHOICES,
} from '../src/lib/covens/invites.ts';
import { covenTabCount } from '../src/lib/covens/requests.ts';
import { DEFAULT_PREFS, normalizePrefs, withChange } from '../src/lib/reminders/prefs.ts';
import { wantsCovenPush } from '../src/lib/reminders/covenNotifications.ts';
import { acceptedNote, invitedNote, wantsInvitation } from '../../supabase/functions/coven-notify/invitations.ts';

const NOW = new Date(2026, 9, 28, 12, 0).getTime();
const days = (n: number) => new Date(NOW + n * 86400000).toISOString();

test('the code alphabet has no look-alikes and 32 letters', () => {
  assert.equal(CODE_ALPHABET.length, 32);
  for (const c of '01IO') assert.ok(!CODE_ALPHABET.includes(c), c);
  assert.equal(new Set(CODE_ALPHABET).size, 32);
});

test('a code is read from the code itself, the website link or the app link', () => {
  assert.equal(parseInviteCode('K7Q2MX9P4R'), 'K7Q2MX9P4R');
  assert.equal(parseInviteCode('  k7q2-mx9p 4r '), 'K7Q2MX9P4R');
  assert.equal(parseInviteCode('https://saltandsovereignty.com/covens/join/?code=K7Q2MX9P4R'), 'K7Q2MX9P4R');
  assert.equal(parseInviteCode('Join Moon Circle on Salt & Sovereignty: https://saltandsovereignty.com/covens/join/?code=k7q2mx9p4r'), 'K7Q2MX9P4R');
  assert.equal(parseInviteCode('saltandsovereignty://coven/join/K7Q2MX9P4R'), 'K7Q2MX9P4R');
  assert.equal(parseInviteCode('https://saltandsovereignty.com/covens/join/?code=K7Q2MX9P4R&utm=x'), 'K7Q2MX9P4R');
  assert.equal(parseInviteCode('K7Q2MX9P4'), null, 'too short');
  assert.equal(parseInviteCode('K7Q2MX9P4O'), null, 'O is never in a code');
  assert.equal(parseInviteCode('https://example.com/'), null);
  assert.equal(parseInviteCode(''), null);
  assert.equal(parseInviteCode(null), null);
});

test('the link to share, the app link and the message', () => {
  assert.equal(inviteLink('K7Q2MX9P4R'), 'https://saltandsovereignty.com/covens/join/?code=K7Q2MX9P4R');
  assert.equal(appInviteLink('K7Q2MX9P4R'), 'saltandsovereignty://coven/join/K7Q2MX9P4R');
  assert.equal(shareMessage('Moon Circle', inviteLink('K7Q2MX9P4R')), 'Join Moon Circle on Salt & Sovereignty: https://saltandsovereignty.com/covens/join/?code=K7Q2MX9P4R');
  assert.equal(parseInviteCode(shareMessage('Moon Circle', inviteLink('K7Q2MX9P4R'))), 'K7Q2MX9P4R', 'the message reads back');
});

test('a new link: 7 days, 30 days or never; once, 5, 25 or unlimited', () => {
  assert.deepEqual(EXPIRY_CHOICES.map((c) => c.days), [7, 30, null]);
  assert.deepEqual(USES_CHOICES.map((c) => c.uses), [1, 5, 25, null]);
  assert.deepEqual(linkOptions('30', '5'), { days: 30, uses: 5 });
  assert.deepEqual(linkOptions('never', 'unlimited'), { days: null, uses: null });
  assert.deepEqual(linkOptions('nonsense', 'nonsense'), { days: 7, uses: null });
});

test('how a link stands, and its line', () => {
  const base = { expires_at: days(7), max_uses: 5, uses: 2, revoked_at: null };
  assert.equal(linkState(base, NOW), 'active');
  assert.equal(linkState({ ...base, revoked_at: days(-1) }, NOW), 'revoked');
  assert.equal(linkState({ ...base, expires_at: days(-1) }, NOW), 'expired');
  assert.equal(linkState({ ...base, uses: 5 }, NOW), 'used_up');
  assert.equal(linkState({ ...base, expires_at: null, max_uses: null, uses: 900 }, NOW), 'active');
  assert.match(linkSummary(base, NOW), /^Used 2 of 5 · until \d+ \w{3}$/);
  assert.equal(linkSummary({ ...base, expires_at: null, max_uses: null, uses: 0 }, NOW), 'Not used yet · no end date');
  assert.equal(linkSummary({ ...base, expires_at: null, max_uses: null, uses: 1 }, NOW), 'Used once · no end date');
  assert.equal(linkSummary({ ...base, uses: 5 }, NOW), 'Used 5 of 5 · used up');
  assert.equal(linkSummary({ ...base, revoked_at: days(0) }, NOW), 'Used 2 of 5 · revoked');
  const links = [
    { ...base, created_at: days(-3) },
    { ...base, created_at: days(-1) },
    { ...base, created_at: days(-2), revoked_at: days(-1) },
  ];
  assert.deepEqual(activeLinks(links, NOW).map((l) => l.created_at), [days(-1), days(-3)]);
});

test('why a link can’t be used, and the preview’s line', () => {
  for (const r of ['revoked', 'expired', 'used_up', 'coven_not_active', 'not_found'] as const) assert.ok(reasonWords(r).length > 10, r);
  assert.equal(reasonWords(null), '');
  assert.equal(previewLine({ name: 'Moon', slug: 'moon', tagline: null, tradition: 'Hedge', member_count: 12 }), 'Hedge · 12 members');
  assert.equal(previewLine({ name: 'Moon', slug: 'moon', tagline: null, tradition: null, member_count: 1 }), '1 member');
  for (const words of [reasonWords('expired'), reasonWords('used_up')]) assert.ok(!/referr/i.test(words) && !/!/.test(words));
});

test('invitations waiting: 30 days, one per coven, none for covens you’re in', () => {
  assert.ok(invitationOpen({ status: 'pending', created_at: days(-29) }, NOW));
  assert.ok(!invitationOpen({ status: 'pending', created_at: days(-31) }, NOW));
  assert.ok(!invitationOpen({ status: 'accepted', created_at: days(-1) }, NOW));
  const rows = [
    { id: 'a', coven_id: 'c1', status: 'pending' as const, created_at: days(-2) },
    { id: 'b', coven_id: 'c1', status: 'pending' as const, created_at: days(-1) },
    { id: 'c', coven_id: 'c2', status: 'pending' as const, created_at: days(-40) },
    { id: 'd', coven_id: 'c3', status: 'pending' as const, created_at: days(-3) },
    { id: 'e', coven_id: 'c4', status: 'declined' as const, created_at: days(-1) },
  ];
  assert.deepEqual(openInvitations(rows, [], NOW).map((r) => r.id), ['b', 'd']);
  assert.deepEqual(openInvitations(rows, ['c3'], NOW).map((r) => r.id), ['b']);
  assert.equal(invitationLine('Hazel', '  Come and sit with us '), 'Hazel invited you: “Come and sit with us”');
  assert.equal(invitationLine(null, null), 'Someone invited you to join.');
});

test('searching needs two letters', () => {
  assert.ok(!searchReady(' r '));
  assert.ok(searchReady('ro'));
});

test('sign-in goes back to an invitation, and nowhere else', () => {
  assert.equal(afterSignIn('/coven/join/K7Q2MX9P4R'), '/coven/join/K7Q2MX9P4R');
  assert.equal(afterSignIn('/coven/invitation/0d8e2c1a-1111-4222-8333-444455556666'), '/coven/invitation/0d8e2c1a-1111-4222-8333-444455556666');
  assert.equal(afterSignIn('https://evil.example/'), '/today');
  assert.equal(afterSignIn('/coven/c/moon/manage'), '/today');
  assert.equal(afterSignIn(undefined), '/today');
  assert.equal(afterSignIn(['/coven/join/K7Q2MX9P4R']), '/today');
});

test('errors: agreements and profile first, and before the database has invitations', () => {
  assert.ok(needsAgreements(new Error("Please sign the coven's agreements first.")));
  assert.ok(!needsAgreements(new Error('This coven is full.')));
  assert.ok(needsProfile(new Error('Set up your community profile first (and confirm you are 18 or older).')));
  assert.equal(inviteError(new Error('Could not find the function public.coven_invite_preview(p_code) in the schema cache')), 'Invitations aren’t ready yet. Please try again later.');
  assert.equal(inviteError(new Error('This coven is full.')), 'This coven is full.');
});

test('the Coven tab counts invitations with messages and requests', () => {
  assert.deepEqual(covenTabCount(0, 0), { count: 0, label: '' });
  assert.deepEqual(covenTabCount(2, 1, 1), { count: 4, label: '2 unread messages, 1 request to review, 1 invitation waiting' });
  assert.deepEqual(covenTabCount(0, 0, 3), { count: 3, label: '3 invitations waiting' });
});

test('the invitations choice is kept with the synced reminders, on by default', () => {
  assert.deepEqual(DEFAULT_PREFS.invitations, { on: true, accepted: true });
  assert.deepEqual(normalizePrefs({}).invitations, { on: true, accepted: true });
  assert.deepEqual(normalizePrefs({ invitations: { on: false, accepted: 'yes' } }).invitations, { on: false, accepted: true });
  const off = withChange(DEFAULT_PREFS, 'invitations.on', false);
  assert.equal(off.invitations.on, false);
  assert.equal(off.invitations.accepted, true);
  assert.ok(wantsCovenPush([], DEFAULT_PREFS), 'invitations alone are a reason to sign the phone up');
});

test('coven-notify reads the same choice, and the pause', () => {
  const now = new Date(2026, 9, 28, 12);
  assert.ok(wantsInvitation(null, 'new', now));
  assert.ok(wantsInvitation(JSON.stringify(DEFAULT_PREFS), 'answer', now));
  const saved = JSON.stringify(withChange(DEFAULT_PREFS, 'invitations.on', false));
  assert.ok(!wantsInvitation(saved, 'new', now));
  assert.ok(wantsInvitation(saved, 'answer', now));
  assert.ok(!wantsInvitation(JSON.stringify(withChange(DEFAULT_PREFS, 'invitations.accepted', false)), 'answer', now));
  assert.ok(!wantsInvitation(JSON.stringify({ ...DEFAULT_PREFS, paused: true, pausedUntil: '' }), 'new', now));
  assert.ok(!wantsInvitation(JSON.stringify({ ...DEFAULT_PREFS, paused: true, pausedUntil: '2026-11-01' }), 'new', now));
  assert.ok(wantsInvitation(JSON.stringify({ ...DEFAULT_PREFS, paused: true, pausedUntil: '2026-10-01' }), 'new', now));
  assert.ok(wantsInvitation('not json', 'new', now));
  // Each app-side value agrees with the edge function's reading.
  for (const on of [true, false]) for (const accepted of [true, false]) {
    const prefs = normalizePrefs({ invitations: { on, accepted } });
    assert.equal(wantsInvitation(JSON.stringify(prefs), 'new', now), prefs.invitations.on);
    assert.equal(wantsInvitation(JSON.stringify(prefs), 'answer', now), prefs.invitations.accepted);
  }
});

test('the phone notes: "You’re invited to …" from the inviter, and the acceptance', () => {
  const note = invitedNote({ covenName: 'Moon Circle', invitationId: 'i1', who: 'Hazel', message: 'Come and sit with us' });
  assert.equal(note.title, 'You’re invited to Moon Circle');
  assert.equal(note.body, 'From Hazel: “Come and sit with us”');
  assert.equal(note.url, '/coven/invitation/i1');
  assert.equal(invitedNote({ covenName: 'Moon Circle', invitationId: 'i1', who: 'Hazel' }).body, 'From Hazel');
  assert.ok(invitedNote({ covenName: 'M', invitationId: 'i', who: 'H', message: 'x'.repeat(400) }).body.length < 160);
  const back = acceptedNote({ covenName: 'Moon Circle', covenSlug: 'moon-circle', who: 'Rowan' });
  assert.deepEqual(back, { title: 'Moon Circle', body: 'Rowan accepted your invitation and joined the coven.', url: '/coven/c/moon-circle/members' });
});
