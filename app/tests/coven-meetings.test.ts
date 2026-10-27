// Coven meetings (lib/covens/meetings.ts): who a meeting is for, its chat's
// window and who reads it afterwards, what passes, actions carried forward,
// and the minutes. The database keeps the same rules
// (supabase/migrations/20261107000200_coven_meetings.sql).
import test from 'node:test';
import assert from 'node:assert/strict';

import { blankBuilderStep, builderPayload, builderProblem, cleanPlan, ritualPayload, stepWho, type BuilderStep, type RitualPlan } from '../src/lib/covens/builder.ts';
import { voteOptions } from '../src/lib/covens/fields.ts';
import { draftFromTemplate, RITUAL_TEMPLATES, templateOf } from '../src/lib/covens/templates.ts';
import { groupsFor, searchActions } from '../src/lib/covens/stepActions.ts';
import { tallyVotes } from '../src/lib/covens/script.ts';
import { covenTendables } from '../src/lib/tend/gather.ts';
import {
  actionDueLine,
  actionRemindAt,
  actionTasks,
  audienceLabel,
  chatAccess,
  chatLine,
  chatWindow,
  cleanAudience,
  cleanState,
  composeMinutes,
  electionResult,
  floorState,
  historyKeys,
  historyLabel,
  inAudience,
  itemTimer,
  maySecond,
  meetingPowers,
  meetingRoleId,
  minutesText,
  motionResult,
  outstandingActions,
  readsHistory,
  stepResult,
  voteCalled,
  type MeetingAction,
  type MeetingRow,
} from '../src/lib/covens/meetings.ts';

const names: Record<string, string> = { head: 'Head', sage: 'Sage', willow: 'Willow', oak: 'Oak', rowan: 'Rowan' };
const nameOf = (id: string) => names[id] ?? 'Someone';
const ranks = [{ id: 'elder', name: 'Elder' }, { id: 'initiate', name: 'Initiate' }];
const member = (rank: string | null) => ({ status: 'active', rank_id: rank });
const viewer = (userId: string, rank: string | null, extra: Partial<{ head: boolean; site: boolean }> = {}) => ({ userId, membership: member(rank), ...extra });

const plan: RitualPlan = cleanPlan({
  sections: [{ id: 'business', name: 'Business' }, { id: 'closing', name: 'Closing' }],
  roles: [
    { id: 'c', name: 'Chair', cast: [{ kind: 'user', id: 'sage' }] },
    { id: 's', name: 'Note taker', cast: [{ kind: 'user', id: 'willow' }] },
  ],
  meeting: { lead_minutes: 20, length_minutes: 60, series: 'elders' },
}, 'meeting');

const meeting = (patch: Partial<MeetingRow> = {}): MeetingRow => ({
  id: 'm1',
  kind: 'meeting',
  status: 'scheduled',
  scheduled_for: '2026-12-05T19:00:00Z',
  plan,
  audience: [{ kind: 'rank', id: 'elder' }],
  created_by: 'head',
  ...patch,
});

const step = (patch: Partial<BuilderStep>): BuilderStep => ({ ...blankBuilderStep(patch.section ?? 'business'), title: 'An item', ...patch });

test('a meeting kept to the Elders is open to them, its roles, its planner and the head; not to Rowan', () => {
  const m = meeting();
  assert.equal(inAudience(m, viewer('oak', 'elder')), true);
  assert.equal(inAudience(m, viewer('willow', 'initiate')), true, 'cast as note taker');
  assert.equal(inAudience(m, viewer('rowan', 'initiate')), false);
  assert.equal(inAudience(m, viewer('rowan', 'initiate', { head: true })), true);
  assert.equal(inAudience(m, viewer('mod', null, { site: true })), true);
  assert.equal(inAudience(meeting({ audience: null }), viewer('rowan', 'initiate')), true, 'null is the whole coven');
  assert.equal(inAudience(m, { userId: 'oak', membership: { status: 'left', rank_id: 'elder' } }), false, 'not once they have left');
  assert.equal(cleanAudience([{ kind: 'coven', id: 'coven' }]), null);
  assert.equal(cleanAudience([]), null);
  assert.equal(audienceLabel(m.audience, ranks, nameOf), 'Every Elder');
  assert.equal(audienceLabel(null, ranks, nameOf), 'Everyone in the coven');
});

test('the Chair and Secretary are found by their settings or their names', () => {
  assert.equal(meetingRoleId(plan, 'chair'), 'c');
  assert.equal(meetingRoleId(plan, 'secretary'), 's', 'a note taker keeps the notes');
  assert.equal(meetingRoleId({ ...plan, meeting: { chair_role: 's' } }, 'chair'), 's');
  const p = meetingPowers(meeting(), { ...viewer('sage', 'elder'), leads: false, standing: true });
  assert.deepEqual(p, { open: true, chair: true, secretary: false, steers: true, keepsNotes: true });
  const w = meetingPowers(meeting(), { ...viewer('willow', 'initiate'), leads: false, standing: true });
  assert.equal(w.steers, false);
  assert.equal(w.keepsNotes, true);
  const r = meetingPowers(meeting(), { ...viewer('rowan', 'initiate'), leads: true, standing: true });
  assert.equal(r.steers, false, 'leading rituals is not enough when the meeting is not open to you');
});

test('the chat opens before the start by the lead time and closes at the planned end, or when the meeting ends', () => {
  const start = Date.parse('2026-12-05T19:00:00Z');
  const m = meeting();
  const w = chatWindow(m, null, start - 30 * 60_000);
  assert.equal(w.opensAt, start - 20 * 60_000);
  assert.equal(w.closesAt, start + 60 * 60_000);
  assert.equal(w.open, false);
  assert.equal(chatWindow(m, null, start - 10 * 60_000).open, true);
  assert.equal(chatWindow(m, null, start + 61 * 60_000).open, false, 'past its planned end');
  // Opened early by the Chair.
  assert.equal(chatWindow(m, { chat_opened_at: new Date(start - 60 * 60_000).toISOString(), chat_closed_at: null, chat_until: null }, start - 50 * 60_000).open, true);
  // Under way: open however long it runs, unless the Chair closes it.
  const live = meeting({ status: 'live', started_at: new Date(start).toISOString() });
  assert.equal(chatWindow(live, null, start + 5 * 3_600_000).open, true);
  assert.equal(chatWindow(live, { chat_opened_at: null, chat_closed_at: new Date(start).toISOString(), chat_until: null }, start + 60_000).open, false);
  // Ended: closed, unless kept open a while longer.
  const done = meeting({ status: 'done', started_at: new Date(start).toISOString(), ended_at: new Date(start + 3_600_000).toISOString() });
  assert.equal(chatWindow(done, null, start + 3_600_000 + 1).open, false);
  const kept = { chat_opened_at: null, chat_closed_at: null, chat_until: new Date(start + 2 * 3_600_000).toISOString() };
  assert.equal(chatWindow(done, kept, start + 90 * 60_000).open, true);
  assert.equal(chatWindow(meeting({ status: 'cancelled' }), null, start).open, false);
  assert.equal(chatWindow(meeting({ status: 'draft' }), null, start).opensAt, null, 'a draft opens only when the Chair opens it');
});

test('afterwards only those the head chose read the whole chat; everyone else has the minutes', () => {
  const start = Date.parse('2026-12-05T19:00:00Z');
  const done = meeting({ status: 'done', started_at: new Date(start).toISOString(), ended_at: new Date(start + 3_600_000).toISOString() });
  const later = start + 2 * 3_600_000;
  const keys = historyKeys(null, null);
  assert.deepEqual(keys, ['chair', 'secretary']);
  const access = (id: string, rank: string | null, k = keys, extra = {}) => chatAccess(done, null, k, { ...viewer(id, rank, extra), standing: true }, later);
  assert.equal(access('sage', 'elder').read, true, 'the Chair');
  assert.equal(access('willow', 'initiate').read, true, 'the Secretary');
  assert.equal(access('oak', 'elder').read, false, 'an Elder only gets the minutes');
  assert.equal(access('rowan', 'initiate', keys, { head: true }).read, true, 'the head always');
  assert.equal(access('oak', 'elder', historyKeys(['audience'], null)).read, true, 'when the head lets everyone at it read');
  assert.equal(access('oak', 'elder', historyKeys(null, ['rank:elder'])).read, true, 'the coven’s default');
  assert.equal(access('rowan', 'initiate', ['audience']).read, false, 'never someone it was not for');
  assert.equal(readsHistory(done, ['user:oak'], viewer('oak', 'elder')), true);
  // During the meeting everyone it is for reads and writes.
  const live = meeting({ status: 'live', started_at: new Date(start).toISOString() });
  const during = chatAccess(live, null, keys, { ...viewer('oak', 'elder'), standing: true }, start + 60_000);
  assert.equal(during.read && during.write, true);
  assert.equal(chatAccess(live, null, keys, { ...viewer('oak', 'elder'), standing: false }, start + 60_000).write, false, 'not out of good standing');
  assert.equal(historyLabel(keys, plan, ranks, nameOf), 'The Chair, the Note taker and the coven’s head');
  assert.match(chatLine(done, access('oak', 'elder'), later), /minutes are kept/);
  assert.match(chatLine(meeting(), chatAccess(meeting(), null, keys, { ...viewer('oak', 'elder'), standing: true }, start - 3_600_000), start - 3_600_000), /opens/);
});

test('motions pass by their threshold, with a quorum counting every vote', () => {
  const t = (f: number, a: number, ab = 0) => tallyVotes(['For', 'Against', 'Abstain'], [...Array(f).fill({ choice: 'For' }), ...Array(a).fill({ choice: 'Against' }), ...Array(ab).fill({ choice: 'Abstain' })]);
  assert.equal(motionResult(t(3, 2)).outcome, 'carried');
  assert.equal(motionResult(t(2, 2)).outcome, 'tied');
  assert.equal(motionResult(t(4, 2, 5), { threshold: 'two_thirds' }).outcome, 'carried', 'abstentions do not count');
  assert.equal(motionResult(t(3, 2), { threshold: 'two_thirds' }).outcome, 'failed');
  assert.equal(motionResult(t(5, 1), { threshold: 'unanimous' }).outcome, 'failed');
  assert.equal(motionResult(t(5, 0, 2), { threshold: 'unanimous' }).outcome, 'carried');
  assert.equal(motionResult(t(2, 0), { quorum: 3 }).outcome, 'no_quorum');
  assert.equal(motionResult(t(0, 0)).outcome, 'none');
  assert.equal(motionResult(t(4, 2, 1), { threshold: 'two_thirds' }).line, 'Carried: 4 for, 2 against, 1 abstaining. Two-thirds were needed.');
  const e = tallyVotes(['Sage', 'Oak', 'Abstain'], [{ choice: 'Sage' }, { choice: 'Sage' }, { choice: 'Oak' }, { choice: 'Abstain' }]);
  assert.deepEqual(electionResult(e, 'Treasurer'), { outcome: 'elected', winner: 'Sage', line: 'Sage elected as Treasurer (2 of 4 votes).' });
  assert.equal(electionResult(tallyVotes(['Sage', 'Oak', 'Abstain'], [{ choice: 'Sage' }, { choice: 'Oak' }]), 'X').outcome, 'tied');
  assert.deepEqual(voteOptions({ candidates: ['Sage', 'Oak'] }), ['Sage', 'Oak', 'Abstain']);
  const motion = step({ action: 'motion', details: { fields: { motion: 'Monthly', threshold: 'two_thirds' } } });
  assert.equal(stepResult(motion, { For: 2, Against: 1 }).outcome, 'carried');
  assert.equal(stepResult(step({ action: 'election', details: { fields: { position: 'Treasurer', candidates: ['Sage', 'Oak'] } } }), { Oak: 3, Sage: 1 }).winner, 'Oak');
});

test('a motion is seconded by anyone but its proposer, and voted on once the Chair calls it', () => {
  const motion = step({ action: 'motion', details: { fields: { motion: 'Monthly', proposer: ['user:sage'] } } });
  assert.equal(maySecond(motion, undefined, 'sage', true), false);
  assert.equal(maySecond(motion, undefined, 'oak', true), true);
  assert.equal(maySecond(motion, { seconded_by: 'willow' }, 'oak', true), false);
  assert.equal(maySecond(motion, { vote_called_at: 'x' }, 'oak', true), false);
  assert.equal(voteCalled(motion, undefined), false);
  assert.equal(voteCalled(motion, { vote_called_at: '2026-12-05T19:10:00Z' }), true);
  assert.equal(voteCalled(step({ action: 'vote' }), undefined), true);
  // Voters may vote; they don't lead the step.
  const who = stepWho(step({ action: 'motion', roles: ['c'], details: { fields: { motion: 'x', voters: ['rank:elder'] } } }), plan, []);
  assert.deepEqual(who.assignees, [{ kind: 'user', id: 'sage' }]);
  assert.match(builderProblem('M', plan, [step({ action: 'motion' })], [{ id: 'sage', name: 'Sage', eligible: true }, { id: 'willow', name: 'Willow', eligible: true }], nameOf), /motion/);
  assert.match(builderProblem('M', plan, [step({ action: 'election', details: { fields: { position: 'Treasurer' } } })], [{ id: 'sage', name: 'Sage', eligible: true }, { id: 'willow', name: 'Willow', eligible: true }], nameOf), /candidate/);
});

test('an item keeps time, and the floor is held by one person at a time', () => {
  const at = Date.parse('2026-12-05T19:00:00Z');
  assert.equal(itemTimer(null, 10), null);
  assert.equal(itemTimer(new Date(at).toISOString(), 10, 5, at + 4 * 60_000)!.line, '11 min left of 15');
  assert.equal(itemTimer(new Date(at).toISOString(), 10, 0, at + 13 * 60_000)!.line, '3 min over (10 planned)');
  assert.equal(itemTimer(new Date(at).toISOString(), null, 0, at + 2 * 60_000)!.line, '2 min so far');
  const state = cleanState({ floor_user: 'oak', hands: ['willow', 'oak', 7], items: { s1: { notes: 'Talked.', amendments: [{ id: 'a', text: 'Bi-monthly', status: 'odd', at: 'x' }] } } }, 'm1');
  assert.equal(state.items.s1.amendments![0].status, 'proposed');
  const f = floorState(state, 'oak', nameOf);
  assert.equal(f.speaking, true);
  assert.deepEqual(f.queue, ['willow']);
  assert.equal(floorState(state, 'willow', nameOf).line, 'Oak has the floor.');
  assert.equal(floorState(state, 'willow', nameOf).handUp, true);
});

const action = (patch: Partial<MeetingAction>): MeetingAction => ({ id: 'a1', ritual_id: 'old', coven_id: 'cv', step_id: null, body: 'Book the hall', assignees: [{ kind: 'user', id: 'rowan' }], due_on: '2026-12-10', status: 'open', done_by: null, done_at: null, created_by: 'sage', created_at: '2026-11-01T00:00:00Z', ...patch });

test('open actions carry forward to the next meeting of the same kind, and remind the day before', () => {
  const current = meeting({ id: 'now', scheduled_for: '2026-12-05T19:00:00Z' });
  const old = meeting({ id: 'old', status: 'done', scheduled_for: '2026-11-01T19:00:00Z' });
  const other = meeting({ id: 'other', status: 'done', scheduled_for: '2026-11-02T19:00:00Z', plan: { ...plan, meeting: { series: 'treasury' } } });
  const future = meeting({ id: 'future', scheduled_for: '2027-01-05T19:00:00Z' });
  const list = [action({}), action({ id: 'a2', status: 'done' }), action({ id: 'a3', ritual_id: 'other' }), action({ id: 'a4', ritual_id: 'future' }), action({ id: 'a5', due_on: '2026-11-20' })];
  assert.deepEqual(outstandingActions(list, [current, old, other, future], current).map((a) => a.id), ['a5', 'a1']);
  const now = new Date(2026, 11, 5, 12).getTime();
  assert.equal(actionDueLine({ due_on: '2026-12-05', status: 'open' }, now), 'Due today');
  assert.equal(actionDueLine({ due_on: '2026-12-06', status: 'open' }, now), 'Due tomorrow');
  assert.match(actionDueLine({ due_on: '2026-12-01', status: 'open' }, now), /^Overdue since/);
  assert.equal(actionDueLine({ due_on: null, status: 'open' }, now), 'No date set');
  assert.equal(actionRemindAt('2026-12-10')!.getTime(), new Date(2026, 11, 9, 9).getTime());
  const tasks = actionTasks(list, () => member('initiate'), 'rowan', () => 'Elders’ meeting', now);
  assert.deepEqual(tasks.map((t) => t.stepId), ['action-a1', 'action-a3', 'action-a4'], 'open, yours, and not yet past its reminder');
  assert.equal(actionTasks(list, () => member('elder'), 'oak', () => '', now).length, 0, 'not someone else’s');
});

test('the minutes have who was there, each item, motions and their results, actions and the next meeting, never the chat', () => {
  const d = draftFromTemplate(templateOf('officials_meeting')!);
  const p: RitualPlan = { ...d.plan, roles: d.plan.roles.map((r) => (r.id === 'chair' ? { ...r, cast: [{ kind: 'user' as const, id: 'sage' }] } : r.id === 'secretary' ? { ...r, cast: [{ kind: 'user' as const, id: 'willow' }] } : r)) };
  const steps = d.steps.map((s, i) => ({ ...s, key: `s${i + 1}`, started_at: i < 7 ? '2026-12-05T19:00:00Z' : null, completed_at: i < 7 ? '2026-12-05T19:05:00Z' : null }));
  const motion = steps.find((s) => s.action === 'motion')!;
  motion.details = { ...motion.details, fields: { ...motion.details.fields, motion: 'That we meet monthly', ballot: 'secret' } };
  const next = steps.find((s) => s.action === 'set_next_meeting')!;
  next.details = { fields: { date: '2027-01-09', time: '19:30', place: 'Oak’s house' } };
  next.started_at = '2026-12-05T20:00:00Z';
  const minutes = composeMinutes({
    ritual: { ...meeting({ status: 'done', started_at: '2026-12-05T19:00:00Z', plan: p }), title: 'Elders’ meeting' },
    steps,
    attendees: ['sage', 'willow', 'oak'],
    apologies: [{ user_id: 'rowan', note: 'Away', excused: true }],
    state: cleanState({ items: { [motion.key]: { seconded_by: 'oak', notes: 'Agreed after some talk.', amendments: [{ id: 'x', text: 'Bi-monthly', by: 'willow', status: 'rejected', at: '' }] } } }, 'm1'),
    votes: [{ step_id: motion.key, counts: { For: 3, Against: 0, Abstain: 0 }, total: 3, ballots: null, closed: true }],
    actions: [action({ ritual_id: 'm1', step_id: motion.key })],
    outstanding: [action({ id: 'old', body: 'Find a new candle supplier' })],
    ranks,
    nameOf,
  });
  const text = minutesText(minutes);
  assert.match(minutes.title, /^Elders’ meeting · minutes/);
  assert.match(text, /PRESENT\nOak, Sage, Willow/);
  assert.match(text, /APOLOGIES\n• Rowan \(excused\)/);
  assert.match(text, /OUTSTANDING FROM LAST TIME\n• Find a new candle supplier · Rowan/);
  assert.match(text, /Motion: That we meet monthly\nProposed by Chair \(Sage\)\. Seconded by Oak\./);
  assert.match(text, /Amendment from Willow: Bi-monthly \(set aside\)\./);
  assert.match(text, /Carried: 3 for, 0 against\./);
  assert.match(text, /Agreed after some talk\./);
  assert.match(text, /Action: Book the hall · Rowan · by/);
  assert.match(text, /NEXT MEETING\n2027-01-09 at 19:30, Oak’s house/);
  assert.match(text, /Not reached\./, 'items not reached say so');
  assert.doesNotMatch(text, /For: /, 'a secret ballot shows only its totals');
});

test('meetings choose from meeting steps; rites never see them', () => {
  assert.ok(groupsFor('rite').every((g) => g.id !== 'meeting'));
  assert.equal(groupsFor('meeting')[0].id, 'meeting');
  assert.ok(searchActions('motion', 'meeting').some((a) => a.id === 'motion'));
  assert.equal(searchActions('motion', 'rite').some((a) => a.id === 'motion'), false);
  assert.ok(searchActions('', 'rite').some((a) => a.id === 'cast_circle'));
  for (const id of ['officials_meeting', 'business_meeting', 'rite_planning', 'elections', 'treasury_review', 'study_checkin']) {
    const t = templateOf(id)!;
    assert.equal(t.kind, 'meeting', id);
    const d = draftFromTemplate(t);
    assert.equal(meetingRoleId(d.plan, 'chair'), 'chair', id);
    assert.ok(d.plan.meeting?.series, id);
    assert.deepEqual(cleanPlan(d.plan, 'meeting').meeting, d.plan.meeting, `${id} settings survive cleaning`);
    assert.equal(builderPayload(d.plan, d.steps).length, d.steps.length);
  }
  assert.ok(RITUAL_TEMPLATES.filter((t) => t.kind === 'meeting').length >= 7);
});

test('a meeting is saved with who it is for; a rite never is', () => {
  const fields = { title: 'M', intention: '', description: '', scheduled_for: null, status: 'draft', occasion: '', occasion_name: '' };
  assert.deepEqual(ritualPayload(fields, 'meeting', plan, [{ kind: 'rank', id: 'elder' }]).audience, [{ kind: 'rank', id: 'elder' }]);
  assert.equal(ritualPayload(fields, 'meeting', plan, [{ kind: 'coven', id: 'coven' }]).audience, null);
  assert.equal(ritualPayload(fields, 'rite', plan, [{ kind: 'rank', id: 'elder' }]).audience, null);
  assert.equal('audience' in ritualPayload(fields, 'meeting', plan), false, 'left out, the saved one is kept');
  assert.deepEqual(cleanPlan({ ...plan, meeting: { lead_minutes: '999', length_minutes: 2, chair_role: 'nope', minutes_view: 'everyone', series: '  x ' } }, 'meeting').meeting, { lead_minutes: 240, length_minutes: 5, series: 'x' });
});

test('an action agreed at a meeting lands on its people’s To tend list until it is done', () => {
  const part = {
    userId: 'rowan',
    covens: [{ id: 'cv', slug: 'oak', name: 'Oak Coven' }],
    memberships: [{ coven_id: 'cv', user_id: 'rowan', rank_id: 'initiate', status: 'active' as const }],
    petitions: [],
    tendings: [],
    contributions: [],
    rituals: [{ id: 'm1', coven_id: 'cv', title: 'Elders’ meeting', status: 'done', scheduled_for: '2026-12-05T19:00:00Z' }],
    steps: [],
    mentorships: [],
    checkins: [],
    actions: [
      { id: 'a1', ritual_id: 'm1', coven_id: 'cv', body: 'Book the hall', assignees: [{ kind: 'user', id: 'rowan' }], due_on: '2026-12-10', status: 'open', created_at: '' },
      { id: 'a2', ritual_id: 'm1', coven_id: 'cv', body: 'Not mine', assignees: [{ kind: 'rank', id: 'elder' }], due_on: null, status: 'open', created_at: '' },
      { id: 'a3', ritual_id: 'm1', coven_id: 'cv', body: 'Done already', assignees: [{ kind: 'user', id: 'rowan' }], due_on: null, status: 'done', created_at: '' },
    ],
    nameOf,
  };
  const items = covenTendables(part, new Date(2026, 11, 1));
  assert.deepEqual(items.map((i) => i.key), ['action:a1']);
  assert.equal(items[0].kind, 'action');
  assert.deepEqual(items[0].actions, ['done', 'open']);
  assert.equal(items[0].dueAt, new Date(2026, 11, 9).getTime(), 'a day before it is due');
  assert.match(items[0].href, /ritual\/m1$/);
});
