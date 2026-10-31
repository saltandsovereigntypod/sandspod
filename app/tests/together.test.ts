// Rituals together and mentorship: the shared ritual's step reducer (the same
// rules as the database's live_ritual_act), who's here and the shared ending,
// invite codes and where the steps come from; mentorship's eligibility
// (adults only, on both sides), pairing rules, the directory's filter and a
// pairing's stages; and the phone notes' choices (coven-notify together.ts)
// read the same way as the app's own Reminders choices.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  activePeople,
  canChat,
  cleanSteps,
  endingCount,
  ERRORS,
  isOver,
  journalAnswers,
  liveLink,
  parseLiveCode,
  reduceLive,
  sourceHref,
  startFromDraft,
  startFromGathering,
  whoIsHere,
  type LivePerson,
  type LiveState,
} from '../src/lib/together/live.ts';
import {
  canAsk,
  canPair,
  checkinDue,
  cleanLink,
  cleanListing,
  filterDirectory,
  itemHref,
  linkChoices,
  myStanding,
  pairingLine,
  sortPairings,
  stageOf,
  type MentorListing,
  type Mentorship,
} from '../src/lib/together/mentorship.ts';
import { liveNote, mentorshipNote, wantsTogether } from '../../supabase/functions/coven-notify/together.ts';
import { normalizePrefs } from '../src/lib/reminders/prefs.ts';
import type { TemplateDraft } from '../src/lib/rituals/types.ts';

const blankDraft = (): TemplateDraft => ({
  id: null,
  title: 'Full moon',
  intention: 'Release',
  preparation: 'Cleanse the space.',
  closing: 'Thank the moon.',
  linked_altar_id: null,
  grimoire_page_id: null,
  ingredients: [],
  kind: 'template',
  steps: [
    { id: null, title: 'Light the candle', instructions: 'A white one.', spoken_text: 'I am here.', minutes: '', completion_mode: 'manual', actions: [] },
    { id: null, title: 'Raise the cone', instructions: 'Circle and chant.', spoken_text: '', minutes: '5', completion_mode: 'manual', actions: [] },
  ],
});

const HOST = 'host';
const A = 'a';
const B = 'b';
const now = new Date('2026-11-01T20:00:00Z');
const base: LiveState = { host_id: HOST, leader_id: null, status: 'gathering', current_step: -1, candle_lit_at: null, candle_lit_by: null, quiet: false, version: 0, started_at: null, ended_at: null, steps_count: 3 };
const person = (user_id: string, extra: Partial<LivePerson> = {}): LivePerson => ({
  live_id: 'l',
  user_id,
  role: user_id === HOST ? 'host' : 'guest',
  joined_at: '2026-11-01T19:50:00Z',
  last_seen_at: '2026-11-01T19:59:30Z',
  done_at: null,
  left_at: null,
  removed_at: null,
  quiet: false,
  ...extra,
});
const people = [person(HOST), person(A), person(B)];

test('the leader moves everyone through the steps, and next from the last opens the shared ending', () => {
  let s = reduceLive(base, { type: 'begin' }, HOST, people, now);
  assert.ok(s.ok);
  assert.equal(s.state.status, 'live');
  assert.equal(s.state.current_step, 0);
  assert.equal(s.state.version, 1);
  assert.equal(s.state.started_at, now.toISOString());
  s = reduceLive(s.state, { type: 'next' }, HOST, people, now);
  s = reduceLive(s.state, { type: 'next' }, HOST, people, now);
  assert.equal(s.state.current_step, 2);
  s = reduceLive(s.state, { type: 'next' }, HOST, people, now);
  assert.equal(s.state.status, 'closing');
  assert.equal(s.state.current_step, 2);
  s = reduceLive(s.state, { type: 'back' }, HOST, people, now);
  assert.equal(s.state.status, 'live');
  assert.equal(s.state.current_step, 2);
  s = reduceLive(s.state, { type: 'go', step: 0 }, HOST, people, now);
  assert.equal(s.state.current_step, 0);
  const first = reduceLive(s.state, { type: 'back' }, HOST, people, now);
  assert.equal(first.ok, false);
  assert.equal(!first.ok && first.error, ERRORS.first);
  assert.equal(reduceLive(s.state, { type: 'go', step: 3 }, HOST, people, now).ok, false);
});

test('only the one leading moves the steps; passing the lead hands it on, and the host can take it back', () => {
  const live = reduceLive(base, { type: 'begin' }, HOST, people, now).state;
  const guest = reduceLive(live, { type: 'next' }, A, people, now);
  assert.equal(guest.ok, false);
  assert.equal(guest.state, live);
  const passed = reduceLive(live, { type: 'pass', to: A }, HOST, people, now);
  assert.equal(passed.state.leader_id, A);
  assert.ok(reduceLive(passed.state, { type: 'next' }, A, people, now).ok);
  assert.equal(reduceLive(passed.state, { type: 'next' }, HOST, people, now).ok, false);
  // The leader passes it on; the host takes it back (leader_id null means the host).
  assert.equal(reduceLive(passed.state, { type: 'pass', to: B }, A, people, now).state.leader_id, B);
  assert.equal(reduceLive(passed.state, { type: 'pass', to: HOST }, HOST, people, now).state.leader_id, null);
  // Never to someone who left or was asked to leave.
  const gone = [person(HOST), person(A), person(B, { removed_at: now.toISOString() })];
  assert.equal(reduceLive(live, { type: 'pass', to: B }, HOST, gone, now).ok, false);
  // A guest can't pass it.
  assert.equal(reduceLive(live, { type: 'pass', to: A }, B, people, now).ok, false);
});

test('the shared candle is lit once; quiet and end are the host’s; nothing happens after the end', () => {
  const lit = reduceLive(base, { type: 'light' }, HOST, people, now);
  assert.equal(lit.state.candle_lit_at, now.toISOString());
  assert.equal(lit.state.candle_lit_by, HOST);
  const again = reduceLive(lit.state, { type: 'light' }, HOST, people, new Date('2026-11-01T21:00:00Z'));
  assert.equal(again.state, lit.state);
  assert.equal(reduceLive(base, { type: 'light' }, A, people, now).ok, false);
  assert.equal(reduceLive(base, { type: 'quiet', on: true }, A, people, now).ok, false);
  assert.equal(reduceLive(base, { type: 'quiet', on: true }, HOST, people, now).state.quiet, true);
  const ended = reduceLive(base, { type: 'end' }, HOST, people, now);
  assert.equal(ended.state.status, 'ended');
  assert.equal(reduceLive(base, { type: 'end' }, A, people, now).ok, false);
  for (const action of [{ type: 'begin' }, { type: 'next' }, { type: 'light' }] as const) {
    const r = reduceLive(ended.state, action, HOST, people, now);
    assert.equal(r.ok, false);
    assert.equal(!r.ok && r.error, ERRORS.ended);
  }
});

test('who is here, the shared ending and the chat', () => {
  const list = [person(A, { joined_at: '2026-11-01T19:40:00Z' }), person(HOST), person(B, { last_seen_at: '2026-11-01T19:50:00Z' }), person('gone', { left_at: '2026-11-01T19:55:00Z' })];
  assert.deepEqual(whoIsHere(list, [], now).map((p) => p.user_id), [HOST, A]);
  assert.deepEqual(whoIsHere(list, [B], now).map((p) => p.user_id), [HOST, A, B]);
  assert.equal(activePeople(list).length, 3);
  assert.deepEqual(endingCount([person(HOST, { done_at: 'x' }), person(A)]), { done: 1, of: 2, all: false });
  assert.deepEqual(endingCount([person(HOST, { done_at: 'x' }), person(A, { done_at: 'y' }), person(B, { removed_at: 'z' })]), { done: 2, of: 2, all: true });
  assert.equal(canChat({ status: 'live', quiet: false }, person(A)), true);
  assert.equal(canChat({ status: 'live', quiet: true }, person(A)), false);
  assert.equal(canChat({ status: 'ended', quiet: false }, person(A)), false);
  assert.equal(canChat({ status: 'live', quiet: false }, person(A, { removed_at: 'x' })), false);
  assert.equal(isOver({ status: 'live', updated_at: '2026-11-01T07:00:00Z' }, now), true);
  assert.equal(isOver({ status: 'live', updated_at: '2026-11-01T19:00:00Z' }, now), false);
});

test('invite codes, links, steps from a draft or a gathering, and the journal note', () => {
  assert.equal(parseLiveCode('k7q2-mx9p'), 'K7Q2MX9P');
  assert.equal(parseLiveCode(liveLink('K7Q2MX9P')), 'K7Q2MX9P');
  assert.equal(parseLiveCode('saltandsovereignty://rituals/together?code=K7Q2MX9P'), 'K7Q2MX9P');
  assert.equal(parseLiveCode('K7Q2'), null);
  assert.equal(parseLiveCode('https://example.com/x'), null);

  const start = startFromDraft(blankDraft(), { kind: 'premade', ref: 'wicca-full-moon' });
  assert.equal(start.steps.length, 2);
  assert.deepEqual(start.steps[1], { title: 'Raise the cone', body: 'Circle and chant.', spoken: '', minutes: 5 });
  assert.equal(start.source.preparation, 'Cleanse the space.');
  assert.equal(sourceHref(start.source, true), '/rituals/premade/wicca-full-moon');
  assert.equal(sourceHref(start.source, false), '/rituals/premade/?id=wicca-full-moon');

  const gathering = startFromGathering({ id: 'r1', title: 'Esbat', intention: null }, [
    { position: 2, title: 'Close', instructions: null, spoken_text: 'Hail and farewell', duration_minutes: null },
    { position: 1, title: 'Open', instructions: 'Cast', spoken_text: null, duration_minutes: 3 },
  ], 'moon-circle');
  assert.deepEqual(gathering.steps.map((s) => s.title), ['Open', 'Close']);
  assert.equal(sourceHref(gathering.source, true), '/coven/c/moon-circle/ritual/r1');

  assert.equal(cleanSteps([{ title: ' ' }, { title: 'x'.repeat(200), minutes: -2 }]).length, 1);
  assert.equal(cleanSteps(Array.from({ length: 80 }, () => ({ title: 'a' }))).length, 60);
  const answers = journalAnswers({ title: 'Esbat', intention: 'Release', steps: gathering.steps }, '  Felt held. ', 4, now);
  assert.equal(answers.notes, 'Felt held.');
  assert.match(answers.what_happened_during, /Done together with 3 others, live\. Steps: Open · Close/);
  assert.equal(answers.ritual_date, '2026-11-01');
});

const listing = (user_id: string, extra: Partial<MentorListing> = {}): MentorListing => ({
  user_id,
  offers: true,
  seeks: false,
  traditions: [],
  topics: [],
  about: null,
  in_directory: true,
  in_covens: true,
  adult_confirmed_at: '2026-10-01T00:00:00Z',
  boundaries_agreed_at: '2026-10-01T00:00:00Z',
  ...extra,
});

test('mentorship is for adults with both confirmations, never otherwise', () => {
  const adult = { age_confirmed_at: '2026-01-01T00:00:00Z' };
  assert.equal(myStanding({ signedIn: false, profile: null, banned: false, listing: null }), 'sign-in');
  assert.equal(myStanding({ signedIn: true, profile: null, banned: false, listing: listing('x') }), 'profile');
  assert.equal(myStanding({ signedIn: true, profile: { age_confirmed_at: null }, banned: false, listing: listing('x') }), 'profile');
  assert.equal(myStanding({ signedIn: true, profile: adult, banned: true, listing: listing('x') }), 'banned');
  assert.equal(myStanding({ signedIn: true, profile: adult, banned: false, listing: null }), 'setup');
  assert.equal(myStanding({ signedIn: true, profile: adult, banned: false, listing: { adult_confirmed_at: 'x', boundaries_agreed_at: '' } }), 'setup');
  assert.equal(myStanding({ signedIn: true, profile: adult, banned: false, listing: listing('x') }), 'ok');

  const ok = (id: string) => ({ id, standing: 'ok' as const });
  assert.deepEqual(canPair({ a: ok('a'), b: ok('b'), blocked: false, open: [] }), { ok: true });
  assert.equal(canPair({ a: ok('a'), b: { id: 'b', standing: 'setup' }, blocked: false, open: [] }).ok, false);
  assert.equal(canPair({ a: ok('a'), b: { id: 'b', standing: 'profile' }, blocked: false, open: [] }).ok, false);
  assert.equal(canPair({ a: ok('a'), b: ok('a'), blocked: false, open: [] }).ok, false);
  assert.equal(canPair({ a: ok('a'), b: ok('b'), blocked: true, open: [] }).ok, false);
  assert.equal(canPair({ a: ok('a'), b: ok('b'), blocked: false, open: [{ mentor_id: 'b', mentee_id: 'a', status: 'active' }] }).ok, false);
  assert.equal(canPair({ a: ok('a'), b: ok('b'), blocked: false, open: [{ mentor_id: 'b', mentee_id: 'a', status: 'ended' }] }).ok, true);
  assert.equal(canPair({ a: ok('a'), b: ok('b'), blocked: false, open: [], coven: { aMember: true, bMember: false } }).ok, false);
  assert.equal(canAsk(listing('x', { offers: true, seeks: false }), 'mentee'), true);
  assert.equal(canAsk(listing('x', { offers: true, seeks: false }), 'mentor'), false);
});

test('the directory filters by role, tradition and topics, never yourself nor the blocked', () => {
  const list = [
    listing('me'),
    listing('hazel', { traditions: ['norse'], topics: ['divination', 'herbs'] }),
    listing('rowan', { traditions: ['eclectic'], topics: ['herbs'] }),
    listing('ash', { traditions: ['hellenic'], topics: ['herbs'] }),
    listing('blocked', { topics: ['herbs'] }),
    listing('seeker', { offers: false, seeks: true, topics: ['herbs'] }),
  ];
  const names: Record<string, string> = { hazel: 'Hazel', rowan: 'Rowan', ash: 'Ash', blocked: 'Bee', seeker: 'Sky' };
  const nameOf = (id: string) => names[id] ?? '';
  const ids = (f: Parameters<typeof filterDirectory>[1]) => filterDirectory(list, f, 'me', ['blocked'], nameOf).map((l) => l.user_id);
  assert.deepEqual(ids({ want: 'mentor', tradition: null, topics: [] }), ['ash', 'hazel', 'rowan']);
  assert.deepEqual(ids({ want: 'mentor', tradition: 'norse', topics: [] }), ['hazel', 'rowan']);
  assert.deepEqual(ids({ want: 'mentor', tradition: null, topics: ['divination', 'herbs'] }), ['hazel', 'ash', 'rowan']);
  assert.deepEqual(ids({ want: 'mentor', tradition: null, topics: ['divination'] }), ['hazel']);
  assert.deepEqual(ids({ want: 'mentee', tradition: null, topics: [] }), ['seeker']);
  assert.deepEqual(ids({ want: 'mentor', tradition: null, topics: [], query: 'row' }), ['rowan']);
  const clean = cleanListing({ offers: true, traditions: ['norse', 'made-up', 'norse'], topics: ['herbs', 'nope'], about: '  hi  ' });
  assert.deepEqual(clean, { offers: true, seeks: false, traditions: ['norse'], topics: ['herbs'], about: 'hi', in_directory: false, in_covens: true });
});

test('a pairing’s stages and words, check-ins, and links from goals and reading', () => {
  const m: Mentorship = {
    id: 'm1',
    coven_id: null,
    mentor_id: 'hazel',
    mentee_id: 'rowan',
    status: 'proposed',
    proposed_by: 'rowan',
    paired_by: null,
    note: null,
    mentor_ok_at: null,
    mentee_ok_at: '2026-10-30T00:00:00Z',
    started_at: null,
    ended_at: null,
    ended_by: null,
    created_at: '2026-10-30T00:00:00Z',
  };
  const nameOf = (id: string) => (id === 'hazel' ? 'Hazel' : 'Rowan');
  assert.equal(stageOf(m, 'hazel'), 'waiting-me');
  assert.equal(stageOf(m, 'rowan'), 'waiting-them');
  assert.equal(pairingLine(m, 'hazel', nameOf), 'Rowan asks you to mentor them');
  assert.equal(pairingLine({ ...m, paired_by: 'leader' }, 'hazel', nameOf), 'Your coven suggests mentoring Rowan');
  const active = { ...m, status: 'active' as const, mentor_ok_at: 'x', started_at: '2026-10-20T00:00:00Z' };
  assert.equal(pairingLine(active, 'rowan', nameOf), 'Mentored by Hazel');
  assert.deepEqual(sortPairings([{ ...active, id: 'a', created_at: '2026-10-01' }, { ...m, id: 'b' }], 'hazel').map((x) => x.id), ['b', 'a']);
  assert.equal(checkinDue(active, [], now), true);
  assert.equal(checkinDue(active, [{ created_at: '2026-10-25T00:00:00Z' }], now), false);
  assert.equal(checkinDue(active, [{ created_at: '2026-10-10T00:00:00Z' }], now), true);
  assert.equal(checkinDue(m, [], now), false);

  const choices = linkChoices('brigid', [{ id: 'deity-brigid', title: 'Brigid: Exalted One' }], false);
  assert.deepEqual(choices, [{ kind: 'journey', id: 'deity-brigid', label: 'Brigid: Exalted One' }]);
  assert.ok(linkChoices('', [], true).some((l) => l.kind === 'coven' && l.id === 'programs'));
  assert.ok(!linkChoices('', [], false).some((l) => l.kind === 'coven'));
  assert.equal(itemHref({ kind: 'journey', id: 'deity-brigid' }, true), '/rituals/journeys/deity-brigid');
  assert.equal(itemHref({ kind: 'page', id: 'grimoire' }, false), '/grimoire/');
  assert.equal(cleanLink({ kind: 'nonsense' as never, id: 'x' }), null);
  assert.equal(cleanLink({ kind: 'journey', id: 'deity-brigid' })?.kind, 'journey');
});

test('phone notes honour the same Reminders choices the app reads', () => {
  const d = normalizePrefs(null);
  assert.deepEqual(d.together, { live: true, mentorship: true });
  assert.equal(wantsTogether(null, 'live', now), true);
  const off = { together: { live: false, mentorship: true } };
  assert.equal(normalizePrefs(off).together.live, false);
  assert.equal(wantsTogether(JSON.stringify(off), 'live', now), false);
  assert.equal(wantsTogether(off, 'mentorship', now), true);
  assert.equal(wantsTogether({ paused: true }, 'mentorship', now), false);
  assert.equal(wantsTogether({ paused: true, pausedUntil: '2026-10-01' }, 'mentorship', now), true);
  assert.equal(liveNote({ title: 'Esbat', who: 'Hazel', covenName: 'Moon Circle', liveId: 'l1' }).url, '/rituals/together/l1');
  assert.equal(mentorshipNote({ event: 'asked', who: 'Rowan', role: 'mentor', mentorshipId: 'm1' }).body, 'Rowan asks you to mentor them.');
  assert.equal(mentorshipNote({ event: 'asked', who: 'Hazel', role: 'mentee', mentorshipId: 'm1' }).body, 'Hazel offers to mentor you.');
});
