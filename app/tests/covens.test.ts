import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  altarActionButton,
  applyChange,
  bookSections,
  candleImage,
  candleState,
  canTend,
  chatMessages,
  filterDirectory,
  missingAnswers,
  myTurn,
  occasionLabel,
  orderDocuments,
  permissions,
  riteReminders,
  ritualGroups,
  rsvpSummary,
  standing,
  stepAssignee,
  stepIsMine,
  unsignedAgreements,
  type BookPage,
  type Coven,
  type CovenDocument,
  type Member,
  type Petition,
  type Rank,
  type Ritual,
  type RitualStep,
} from '../src/lib/covens/model.ts';

const coven = (over: Partial<Coven> = {}): Coven => ({
  id: 'c1',
  slug: 'moon',
  name: 'Moon Circle',
  tagline: 'Under the moon',
  description: 'We gather at the full moon.',
  tradition: 'Eclectic',
  tags: ['lunar', 'herbs'],
  meeting_rhythm: 'monthly',
  joining: 'open',
  visibility: 'listed',
  status: 'active',
  moderation_note: null,
  application_questions: [],
  altar_background: null,
  founder_id: 'founder',
  created_at: '2026-10-01T00:00:00Z',
  ...over,
});
const member = (user_id: string, rank_id: string | null = 'r-member', over: Partial<Member> = {}): Member => ({ coven_id: 'c1', user_id, rank_id, status: 'active', muted_until: null, joined_at: '', ...over });
const ranks: Rank[] = [
  { id: 'r-member', coven_id: 'c1', name: 'Seeker', description: null, requirements: null, level: 10 },
  { id: 'r-scribe', coven_id: 'c1', name: 'Scribe', description: null, requirements: null, level: 20, can_write_book: true },
  { id: 'r-elder', coven_id: 'c1', name: 'Elder', description: null, requirements: null, level: 50, can_review: true, can_schedule_rites: true, can_approve_book: true },
];
const ritual = (over: Partial<Ritual> = {}): Ritual => ({
  id: 'rit1',
  coven_id: 'c1',
  title: 'Full moon rite',
  intention: null,
  description: null,
  scheduled_for: null,
  status: 'scheduled',
  occasion: null,
  occasion_name: null,
  current_step_id: null,
  led_by: null,
  ended_at: null,
  ...over,
});
const step = (id: string, position: number, over: Partial<RitualStep> = {}): RitualStep => ({
  id,
  ritual_id: 'rit1',
  coven_id: 'c1',
  position,
  title: `Step ${position}`,
  instructions: null,
  spoken_text: null,
  duration_minutes: null,
  assigned_user_id: null,
  assigned_rank_id: null,
  completed_at: null,
  completed_by: null,
  altar_action: null,
  altar_color: null,
  altar_form: null,
  altar_label: null,
  ...over,
});

test('permissions follow the founder and the position’s powers', () => {
  const founder = permissions({ coven: coven(), membership: member('founder', null), ranks, userId: 'founder' });
  assert.equal(founder.manage, true);
  assert.equal(founder.approveBook, true);
  assert.equal(founder.level, 1000);

  const elder = permissions({ coven: coven(), membership: member('e', 'r-elder'), ranks, userId: 'e' });
  assert.deepEqual([elder.manage, elder.review, elder.schedule, elder.writeBook, elder.approveBook, elder.lead], [false, true, true, true, true, false]);

  const scribe = permissions({ coven: coven(), membership: member('s', 'r-scribe'), ranks, userId: 's' });
  assert.deepEqual([scribe.writeBook, scribe.approveBook, scribe.schedule], [true, false, false]);

  const left = permissions({ coven: coven(), membership: member('x', 'r-elder', { status: 'left' }), ranks, userId: 'x' });
  assert.equal(left.member, false);
  assert.equal(left.review, false);

  const paused = permissions({ coven: coven({ status: 'suspended' }), membership: member('e', 'r-elder'), ranks, userId: 'e' });
  assert.equal(paused.member, true);
  assert.equal(paused.review, false);

  const muted = permissions({ coven: coven(), membership: member('m', 'r-member', { muted_until: '2026-10-24T00:00:00Z' }), ranks, userId: 'm', now: Date.parse('2026-10-23T00:00:00Z') });
  assert.equal(muted.muted, true);

  assert.equal(permissions({ coven: coven(), membership: null, ranks, userId: 'mod', siteModerator: true }).site, true);
});

test('only current versions of agreements count as signed, and standing says why not', () => {
  const docs: CovenDocument[] = [
    { id: 'd2', coven_id: 'c1', kind: 'agreement', title: 'Agreement', body: '', visibility: 'members', requires_signature: true, published: true, position: 0, version: 2 },
    { id: 'd1', coven_id: 'c1', kind: 'creed', title: 'Creed', body: '', visibility: 'public', requires_signature: true, published: true, position: 0, version: 1 },
    { id: 'd3', coven_id: 'c1', kind: 'rules', title: 'Rules', body: '', visibility: 'public', requires_signature: false, published: true, position: 0, version: 1 },
  ];
  assert.deepEqual(orderDocuments(docs).map((d) => d.kind), ['creed', 'rules', 'agreement']);
  const unsigned = unsignedAgreements(docs, [{ document_id: 'd1', version: 1, user_id: 'u' }, { document_id: 'd2', version: 1, user_id: 'u' }], 'u');
  assert.deepEqual(unsigned.map((d) => d.id), ['d2']);

  const perms = permissions({ coven: coven(), membership: member('u'), ranks, userId: 'u' });
  assert.deepEqual(standing(perms, unsigned, false), { ok: false, reasons: ['Sign the coven’s updated agreements to take part.'] });
  assert.equal(standing(perms, [], false).ok, true);
  assert.equal(standing(perms, [], true).ok, false);
});

test('the directory searches every field, and required questions must be answered', () => {
  const list = [coven(), coven({ id: 'c2', name: 'Hearth', tags: ['kitchen'], joining: 'application', tradition: null, description: null })];
  assert.deepEqual(filterDirectory(list, 'kitchen').map((c) => c.id), ['c2']);
  assert.deepEqual(filterDirectory(list, 'moon LUNAR').map((c) => c.id), ['c1']);
  assert.deepEqual(filterDirectory(list, '', 'application').map((c) => c.id), ['c2']);
  const questions = [{ id: 'q1', prompt: 'Why?', required: true }, { id: 'q2', prompt: 'Else?', required: false }];
  assert.deepEqual(missingAnswers(questions, { q1: '  ' }).map((q) => q.id), ['q1']);
  assert.deepEqual(missingAnswers(questions, { q1: 'Because' }), []);
});

test('live changes insert, update and delete by id; blocked words are hidden', () => {
  let list = [{ id: 'a', n: 1 }];
  list = applyChange(list, { eventType: 'INSERT', new: { id: 'b', n: 2 } });
  list = applyChange(list, { eventType: 'UPDATE', new: { id: 'a', n: 3 } });
  assert.deepEqual(list, [{ id: 'a', n: 3 }, { id: 'b', n: 2 }]);
  list = applyChange(list, { eventType: 'DELETE', new: {}, old: { id: 'a' } });
  assert.deepEqual(list, [{ id: 'b', n: 2 }]);

  const base = { coven_id: 'c1', edited_at: null, deleted_at: null, deleted_by: null };
  const chat = chatMessages(
    [
      { ...base, id: '2', user_id: 'troll', body: 'hi', created_at: '2026-10-23T10:01:00Z' },
      { ...base, id: '1', user_id: 'u', body: 'hello', created_at: '2026-10-23T10:00:00Z' },
    ],
    ['troll'],
  );
  assert.deepEqual(chat.map((m) => [m.id, m.hidden]), [['1', false], ['2', true]]);
});

test('a step is yours by name, by position, or because it’s the whole coven’s', () => {
  const me = member('u', 'r-scribe');
  assert.equal(stepIsMine(step('s1', 1, { assigned_user_id: 'u' }), me, 'u'), true);
  assert.equal(stepIsMine(step('s1', 1, { assigned_user_id: 'other' }), me, 'u'), false);
  assert.equal(stepIsMine(step('s1', 1, { assigned_rank_id: 'r-scribe' }), me, 'u'), true);
  assert.equal(stepIsMine(step('s1', 1, { assigned_rank_id: 'r-elder' }), me, 'u'), false);
  assert.equal(stepIsMine(step('s1', 1), me, 'u'), true);
  assert.equal(stepIsMine(step('s1', 1), member('u', null, { status: 'left' }), 'u'), false);
  assert.equal(stepAssignee(step('s1', 1, { assigned_rank_id: 'r-elder' }), ranks, () => '').label, 'Every Elder');
  assert.equal(stepAssignee(step('s1', 1, { assigned_user_id: 'u' }), ranks, () => 'Rowan').label, 'Rowan');

  const steps = [step('s1', 1, { assigned_user_id: 'other' }), step('s2', 2, { assigned_rank_id: 'r-scribe' })];
  assert.equal(myTurn([ritual({ status: 'live', current_step_id: 's1' })], steps, me, 'u'), null);
  assert.equal(myTurn([ritual({ status: 'live', current_step_id: 's2' })], steps, me, 'u')?.step.id, 's2');
});

test('rites group by state, carry their occasion, and count answers', () => {
  const groups = ritualGroups([
    ritual({ id: 'a', status: 'scheduled', scheduled_for: '2026-11-05T20:00:00Z' }),
    ritual({ id: 'b', status: 'scheduled', scheduled_for: '2026-10-30T20:00:00Z' }),
    ritual({ id: 'c', status: 'live' }),
    ritual({ id: 'd', status: 'done' }),
  ]);
  assert.deepEqual(groups.upcoming.map((r) => r.id), ['b', 'a']);
  assert.deepEqual(groups.live.map((r) => r.id), ['c']);
  assert.deepEqual(groups.past.map((r) => r.id), ['d']);
  assert.equal(occasionLabel({ occasion: 'full_moon', occasion_name: 'Hunter’s Moon' }), 'Full moon · Hunter’s Moon');
  assert.equal(occasionLabel({ occasion: 'sabbat', occasion_name: 'Samhain' }), 'Samhain');
  assert.equal(occasionLabel({ occasion: null, occasion_name: null }), '');

  const summary = rsvpSummary(
    [
      { ritual_id: 'a', coven_id: 'c1', user_id: 'u', response: 'going' },
      { ritual_id: 'a', coven_id: 'c1', user_id: 'v', response: 'maybe' },
      { ritual_id: 'b', coven_id: 'c1', user_id: 'w', response: 'going' },
    ],
    'a',
    'u',
  );
  assert.deepEqual([summary.going.length, summary.maybe.length, summary.mine], [1, 1, 'going']);
});

test('rite reminders come a day and an hour before, only for those coming', () => {
  const now = Date.parse('2026-10-23T12:00:00Z');
  const rites = [
    { coven: { name: 'Moon Circle', slug: 'moon' }, ritual: ritual({ id: 'a', scheduled_for: '2026-10-25T20:00:00Z' }), response: 'going' as const },
    { coven: { name: 'Moon Circle', slug: 'moon' }, ritual: ritual({ id: 'b', scheduled_for: '2026-10-23T12:30:00Z' }), response: 'maybe' as const },
    { coven: { name: 'Moon Circle', slug: 'moon' }, ritual: ritual({ id: 'c', scheduled_for: '2026-10-26T20:00:00Z' }), response: 'not_going' as const },
    { coven: { name: 'Moon Circle', slug: 'moon' }, ritual: ritual({ id: 'd', scheduled_for: '2026-10-26T20:00:00Z' }), response: null },
  ];
  const reminders = riteReminders(rites, now);
  assert.deepEqual(reminders.map((r) => r.key), ['coven-rite-a-day', 'coven-rite-a-hour']);
  assert.equal(reminders[0].url, '/more/covens/moon/ritual/a');
  assert.equal(reminders[0].at.toISOString(), '2026-10-24T20:00:00.000Z');
});

test('candles burn down and use the website’s pictures', () => {
  const lit = { kind: 'candle' as const, lit: true, lit_at: '2026-10-23T12:00:00Z', burn_minutes: 60 };
  assert.deepEqual(candleState(lit, Date.parse('2026-10-23T12:30:00Z')), { lit: true, burntOut: false, remaining: 0.5, minutesLeft: 30 });
  assert.equal(candleState(lit, Date.parse('2026-10-23T14:00:00Z')).burntOut, true);
  assert.equal(candleState({ ...lit, kind: 'object' }).lit, false);
  assert.equal(candleImage('white', 'vigil'), '/assets/altar/objects/candles/white-candle.PNG');
  assert.equal(candleImage('red', 'taper'), '/assets/altar/objects/candles/taper/red-taper.png');
  assert.equal(candleImage('nonsense', 'nope'), '/assets/altar/objects/candles/white-candle.PNG');
  assert.equal(altarActionButton({ altar_action: 'place_item', altar_label: 'salt' }), 'Place salt on the altar');
});

test('the book groups pages by section, and petitions are tended twice a day at most', () => {
  const page = (id: string, title: string, section: string | null): BookPage => ({ id, coven_id: 'c1', title, section, body: '', version: 1, author_id: null, published_by: null, published_at: '' });
  const sections = bookSections([page('1', 'Zodiac', null), page('2', 'Opening', 'Rites'), page('3', 'Closing', 'Rites')]);
  assert.deepEqual(sections.map((s) => [s.section, s.pages.map((p) => p.title)]), [['Rites', ['Closing', 'Opening']], ['Pages', ['Zodiac']]]);

  const petition: Petition = { id: 'p1', coven_id: 'c1', user_id: 'v', title: 'Healing', body: null, color: 'blue', status: 'open', outcome_note: null, last_tended_at: null, created_at: '' };
  const now = Date.parse('2026-10-23T12:00:00Z');
  const tended = [{ id: 't', petition_id: 'p1', user_id: 'u', note: null, created_at: '2026-10-23T06:00:00Z' }];
  assert.equal(canTend(petition, tended, 'u', now), false);
  assert.equal(canTend(petition, tended, 'w', now), true);
  assert.equal(canTend(petition, tended, 'u', Date.parse('2026-10-23T19:00:00Z')), true);
  assert.equal(canTend({ ...petition, status: 'answered' }, [], 'u', now), false);
});
