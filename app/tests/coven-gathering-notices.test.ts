// Coven gathering notes: who hears (a gathering's own choice, then the
// coven's closest rule, else everyone it is for), the words in the planner,
// what changed since the last note (scheduled, moved, cancelled, and by hand
// a first announcement or a reminder), the notes' words, and each member's
// "Coven gatherings" choice in the synced Reminders, read the same way by the
// app, the website and the coven-notify edge function.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cleanPlan, removeRole } from '../src/lib/covens/builder.ts';
import { permissions, RANK_POWERS, rankPowers, savableRankFlags, type Rank } from '../src/lib/covens/model.ts';
import {
  addNoticeKey,
  cleanNoticeWho,
  cleanScope,
  effectiveNotice,
  maySendNotice,
  noticeLabelOptions,
  noticeLine,
  noticeName,
  noticeScopes,
  reachLine,
  ruleChoices,
  scopeLabel,
  sendLabel,
  sentLine,
  waitLine,
} from '../src/lib/covens/notices.ts';
import { RITUAL_TEMPLATES } from '../src/lib/covens/templates.ts';
import { DEFAULT_PREFS, gatheringsOn, normalizePrefs, prefsValue, setGatheringsFor } from '../src/lib/reminders/prefs.ts';
import { cleanNote, gatheringEvent, gatheringName, gatheringNote, manualEvent, wantsGathering, whenWords, type SentNotice } from '../../supabase/functions/coven-notify/gatherings.ts';

const NOW = new Date('2026-10-27T12:00:00Z');
const ranks = [
  { id: 'elder', name: 'Elder' },
  { id: 'initiate', name: 'Initiate' },
];
const words = { ranks, nameOf: (id: string) => ({ rowan: 'Rowan', sage: 'Sage' })[id] ?? 'Someone' };

test('names compare without case, spacing or curly quotes, as the database does', () => {
  assert.equal(noticeName('  Hekate’s   DEIPNON '), "hekate's deipnon");
  assert.equal(cleanScope('name:  The Deipnon'), 'name:the deipnon');
  assert.equal(cleanScope('series:Officials'), 'series:officials');
  assert.equal(cleanScope('occasion:full_moon'), 'occasion:full_moon');
  assert.equal(cleanScope('occasion:Bad Id'), null);
  assert.equal(cleanScope('name:   '), null);
  assert.equal(cleanScope('nonsense'), null);
});

test('the rules that could apply, closest first', () => {
  assert.deepEqual(noticeScopes({ kind: 'rite', occasion: 'other', occasion_name: 'Deipnon' }), ['name:deipnon', 'occasion:other', 'rite']);
  assert.deepEqual(noticeScopes({ kind: 'rite', occasion: null, occasion_name: 'Hekate’s Deipnon' }), ["name:hekate's deipnon", 'rite']);
  assert.deepEqual(noticeScopes({ kind: 'meeting', plan: { meeting: { series: 'Officials' } } }), ['series:officials', 'meeting']);
  assert.deepEqual(noticeScopes({ kind: 'meeting', plan: { template: 'business-meeting' } }), ['series:business-meeting', 'meeting']);
  assert.deepEqual(noticeScopes({ kind: 'meeting', plan: {} }), ['meeting']);
});

test('who keys are cleaned as the database cleans them', () => {
  assert.deepEqual(cleanNoticeWho(['rank:elder', 'user:rowan', 'role:x', 'parts', 'parts', 7]), ['rank:elder', 'user:rowan', 'parts']);
  assert.deepEqual(cleanNoticeWho(['role:x', 'role:y'], [{ id: 'x' }]), ['role:x']);
  assert.deepEqual(cleanNoticeWho(['none']), ['none']);
  assert.deepEqual(cleanNoticeWho(['none', 'parts']), ['parts']);
  assert.deepEqual(cleanNoticeWho(['parts', 'coven']), ['coven']);
  assert.deepEqual(cleanNoticeWho([]), []);
  assert.deepEqual(addNoticeKey(['rank:elder'], 'none'), ['none']);
  assert.deepEqual(addNoticeKey(['none'], 'rank:elder'), ['rank:elder']);
  assert.deepEqual(addNoticeKey(['coven'], 'user:rowan'), ['user:rowan']);
  assert.deepEqual(addNoticeKey(['user:rowan'], 'user:rowan'), ['user:rowan']);
});

test('a gathering’s own choice, then the closest rule, then everyone it is for', () => {
  const rules = [
    { scope: 'rite', who: ['rank:elder'] },
    { scope: 'name:deipnon', who: ['user:rowan'] },
    { scope: 'occasion:full_moon', who: ['coven'] },
    { scope: 'series:officials', who: ['parts'] },
  ];
  assert.deepEqual(effectiveNotice({ kind: 'rite', occasion: 'new_moon', occasion_name: 'Deipnon' }, rules), { who: ['user:rowan'], source: 'name:deipnon' });
  assert.deepEqual(effectiveNotice({ kind: 'rite', occasion: 'full_moon' }, rules), { who: ['coven'], source: 'occasion:full_moon' });
  assert.deepEqual(effectiveNotice({ kind: 'rite', occasion: 'esbat' }, rules), { who: ['rank:elder'], source: 'rite' });
  assert.deepEqual(effectiveNotice({ kind: 'meeting', plan: { meeting: { series: 'officials' } } }, rules), { who: ['parts'], source: 'series:officials' });
  assert.deepEqual(effectiveNotice({ kind: 'meeting', plan: {} }, rules), { who: null, source: 'default' });
  const own = { kind: 'rite', occasion_name: 'Deipnon', plan: { roles: [{ id: 'lead', name: 'Lead', cast: [] }], notify: ['role:lead', 'role:gone'] } };
  assert.deepEqual(effectiveNotice(own, rules), { who: ['role:lead'], source: 'gathering' });
});

test('the planner says who hears and why, in words', () => {
  const rules = [{ scope: 'name:hekate\'s deipnon', who: ['rank:elder', 'user:sage'] }];
  const opts = noticeLabelOptions(RITUAL_TEMPLATES, []);
  assert.equal(noticeLine({ kind: 'rite', occasion: 'new_moon', occasion_name: 'Hekate’s Deipnon' }, rules, words, opts), 'Every Elder and Sage · from the coven’s rule for Hekate’s Deipnon');
  assert.equal(noticeLine({ kind: 'rite', occasion: 'esbat' }, [], words, opts), 'Everyone in the coven · as no rule says otherwise');
  assert.equal(noticeLine({ kind: 'meeting', audience: [{ kind: 'rank', id: 'elder' }], plan: {} }, [{ scope: 'meeting', who: ['coven'] }], words, opts), 'Everyone in the coven, among those it is for · from the coven’s rule for meetings');
  assert.equal(noticeLine({ kind: 'meeting', audience: [{ kind: 'rank', id: 'elder' }], plan: {} }, [], words, opts), 'Everyone the meeting is for · as no rule says otherwise');
  assert.equal(
    noticeLine({ kind: 'meeting', plan: { roles: [{ id: 'chair', name: 'Chair', cast: [] }], notify: ['role:chair', 'none'] } }, [], words, opts),
    'The Chair · chosen for this gathering',
  );
  assert.equal(noticeLine({ kind: 'rite', plan: { notify: ['none'] } }, [], words, opts), 'No one · chosen for this gathering');
  assert.equal(scopeLabel('occasion:full_moon'), 'Full moons');
  assert.equal(scopeLabel('series:officials', opts), 'Officials’ meetings');
  assert.equal(scopeLabel('series:ours'), 'Meetings that follow on from “ours”');
  assert.equal(scopeLabel('name:deipnon'), 'Deipnon');
});

test('a rule can be added for an occasion, a name the coven has used, or a kind of meeting', () => {
  const opts = noticeLabelOptions(RITUAL_TEMPLATES, [{ occasion_name: 'Deipnon' }, { occasion_name: 'deipnon ' }]);
  const choices = ruleChoices({ occasions: [{ value: 'full_moon', label: 'Full moon' }], names: opts.names, series: opts.series, taken: ['rite', 'meeting', 'name:samhain'] });
  assert.ok(choices.some((c) => c.scope === 'occasion:full_moon'));
  assert.equal(choices.filter((c) => c.scope === 'name:deipnon').length, 1, 'once each');
  assert.ok(!choices.some((c) => c.scope === 'name:samhain'), 'not one already set');
  assert.ok(choices.some((c) => c.scope === 'series:officials' && c.label === 'Officials’ meetings'));
});

test('the plan keeps who hears; taking a role away takes it from the choice', () => {
  const plan = cleanPlan({ roles: [{ id: 'lead', name: 'Lead', cast: [] }], notify: ['role:lead', 'rank:elder', 'role:gone'] });
  assert.deepEqual(plan.notify, ['role:lead', 'rank:elder']);
  assert.equal(cleanPlan({ notify: [] }).notify, undefined, 'none is the rules');
  const { plan: without } = removeRole(plan, [], 'lead');
  assert.deepEqual(without.notify, ['rank:elder']);
  const { plan: bare } = removeRole(cleanPlan({ roles: [{ id: 'lead', name: 'Lead', cast: [] }], notify: ['role:lead'] }), [], 'lead');
  assert.equal(bare.notify, undefined);
});

test('the notices power: the head, those who lead the coven, and positions given it', () => {
  const ranks: Rank[] = [
    { id: 'r1', coven_id: 'c', name: 'Summoner', description: null, requirements: null, level: 3, can_set_gathering_notices: true },
    { id: 'r2', coven_id: 'c', name: 'Elder', description: null, requirements: null, level: 5, can_schedule_rites: true },
    { id: 'r3', coven_id: 'c', name: 'High Priestess', description: null, requirements: null, level: 9, can_manage: true },
  ];
  const coven = { id: 'c', status: 'active', founder_id: 'head' } as never;
  const p = (user: string, rank: string | null) => permissions({ coven, membership: { coven_id: 'c', user_id: user, rank_id: rank, status: 'active' } as never, ranks, userId: user });
  assert.equal(p('head', null).notices, true);
  assert.equal(p('a', 'r1').notices, true);
  assert.equal(p('b', 'r2').notices, false);
  assert.equal(p('c', 'r3').notices, true);
  assert.ok(RANK_POWERS.some((x) => x.key === 'can_set_gathering_notices'));
  assert.ok(rankPowers(ranks[0]).includes('chooses who hears about gatherings'));
  // Before the column exists, an unticked power isn't sent (so saving still works); once it does, it is.
  assert.deepEqual(savableRankFlags({ can_review: true, can_set_gathering_notices: false }, [{ id: 'x', can_review: true }]), { can_review: true });
  assert.deepEqual(savableRankFlags({ can_set_gathering_notices: false }, [{ id: 'x', can_set_gathering_notices: false }]), { can_set_gathering_notices: false });
  assert.deepEqual(savableRankFlags({ can_set_gathering_notices: true }, [{ id: 'x' }]), { can_set_gathering_notices: true });
});

// ─── What changed ─────────────────────────────────────────────────────────

const AT = '2026-10-30T19:00:00Z';
const LATER = '2026-10-31T19:00:00Z';
const sent = (list: [SentNotice['event'], string | null, string[]?][]): SentNotice[] => list.map(([event, at, recipients], i) => ({ seq: i + 1, event, scheduled_for: at, recipients: recipients ?? [] }));

test('scheduled once, moved when its time changes, cancelled when it comes off', () => {
  assert.deepEqual(gatheringEvent({ status: 'scheduled', scheduled_for: AT }, [], NOW), { event: 'scheduled', heard: [], previous: null });
  assert.equal(gatheringEvent({ status: 'scheduled', scheduled_for: AT }, sent([['scheduled', AT]]), NOW), null, 'nothing changed');
  assert.deepEqual(gatheringEvent({ status: 'scheduled', scheduled_for: LATER }, sent([['scheduled', AT, ['a']], ['reminder', AT, ['b']]]), NOW), { event: 'moved', heard: ['a', 'b'], previous: AT });
  assert.equal(gatheringEvent({ status: 'scheduled', scheduled_for: AT }, sent([['scheduled', AT], ['reminder', AT]]), NOW), null, 'a reminder changes nothing');
  assert.deepEqual(gatheringEvent({ status: 'draft', scheduled_for: AT }, sent([['scheduled', AT, ['a']]]), NOW), { event: 'cancelled', heard: ['a'], previous: AT });
  assert.deepEqual(gatheringEvent(null, sent([['scheduled', AT, ['a']], ['moved', LATER, ['a', 'c']]]), NOW), { event: 'cancelled', heard: ['a', 'c'], previous: LATER });
  assert.equal(gatheringEvent({ status: 'cancelled', scheduled_for: AT }, sent([['scheduled', AT], ['cancelled', AT]]), NOW), null, 'once');
  assert.deepEqual(gatheringEvent({ status: 'scheduled', scheduled_for: AT }, sent([['scheduled', AT], ['cancelled', AT]]), NOW), { event: 'scheduled', heard: [], previous: null }, 'back on the calendar');
});

test('drafts and the past never ring', () => {
  assert.equal(gatheringEvent({ status: 'draft', scheduled_for: AT }, [], NOW), null);
  assert.equal(gatheringEvent({ status: 'scheduled', scheduled_for: '2026-10-01T19:00:00Z' }, [], NOW), null);
  assert.equal(gatheringEvent({ status: 'cancelled', scheduled_for: '2026-10-01T19:00:00Z' }, sent([['scheduled', '2026-10-01T19:00:00Z']]), NOW), null, 'a past one coming off');
  assert.equal(gatheringEvent({ status: 'scheduled', scheduled_for: null }, [], NOW), null);
  assert.equal(gatheringEvent({ status: 'done', scheduled_for: AT }, sent([['scheduled', AT]]), NOW), null, 'held is not cancelled');
});

test('by hand: the first announcement, then reminders', () => {
  assert.deepEqual(manualEvent({ status: 'scheduled', scheduled_for: AT }, [], NOW), { event: 'scheduled', heard: [] });
  assert.equal(manualEvent({ status: 'scheduled', scheduled_for: AT }, sent([['scheduled', AT, ['a']]]), NOW)?.event, 'reminder');
  assert.equal(manualEvent({ status: 'scheduled', scheduled_for: AT }, sent([['scheduled', AT], ['cancelled', AT]]), NOW)?.event, 'scheduled');
  assert.equal(manualEvent({ status: 'draft', scheduled_for: AT }, [], NOW), null);
  assert.equal(manualEvent({ status: 'scheduled', scheduled_for: '2026-10-01T19:00:00Z' }, [], NOW), null);
  assert.equal(cleanNote('  Bring\n a <b>candle</b>\u0007  '), 'Bring a bcandle/b');
  assert.equal(cleanNote('x'.repeat(250)).length, 200);
  assert.equal(cleanNote(null), '');
});

test('who may send by hand, and the words around it', () => {
  const r = { status: 'scheduled', scheduled_for: AT, created_by: 'me' };
  const now = NOW.getTime();
  assert.equal(maySendNotice(r, { member: true, notices: true }, 'x', now), true);
  assert.equal(maySendNotice(r, { member: true, moderate: true }, 'x', now), true);
  assert.equal(maySendNotice(r, { member: true }, 'me', now), true, 'whoever planned it');
  assert.equal(maySendNotice(r, { member: true }, 'x', now), false);
  assert.equal(maySendNotice({ ...r, status: 'draft' }, { member: true, notices: true }, 'x', now), false);
  assert.equal(maySendNotice({ ...r, scheduled_for: '2026-10-01T19:00:00Z' }, { site: true }, 'x', now), false);
  assert.equal(sendLabel({ announced: false }), 'Let them know it’s on the calendar');
  assert.equal(sendLabel({ announced: true }), 'Send a reminder');
  assert.match(reachLine(4), /^This goes to 4 people/);
  assert.match(reachLine(1), /^This goes to one person/);
  assert.equal(waitLine(null), null);
  assert.equal(waitLine('2026-10-27T12:10:00Z', now)?.startsWith('A notification went out'), true);
  assert.equal(waitLine('2026-10-27T11:50:00Z', now), null);
  assert.equal(sentLine({ sent: 3, recipients: 4, event: 'reminder' }), 'Reminder sent to 4 people.');
  assert.equal(sentLine({ sent: 1, recipients: 1, event: 'scheduled' }), 'Sent to one person.');
  assert.match(sentLine({ error: 'too_soon' }), /half hour/);
  assert.match(sentLine(null), /couldn’t be sent/);
});

// ─── The notes ─────────────────────────────────────────────────────────

test('the date in the coven’s time zone with the time, else the planner’s, without', () => {
  assert.equal(whenWords('2026-10-30T19:00:00Z', { coven: 'Europe/London' }, NOW), 'Friday 30 October at 7:00 pm');
  assert.equal(whenWords('2026-10-31T02:30:00Z', { coven: 'America/Los_Angeles' }, NOW), 'Friday 30 October at 7:30 pm');
  assert.equal(whenWords('2026-10-31T02:30:00Z', { planner: 'America/Los_Angeles' }, NOW), 'Friday 30 October');
  assert.equal(whenWords('2026-10-31T02:30:00Z', { coven: 'Not/AZone' }, NOW), 'Saturday 31 October', 'UTC when neither is known');
  assert.equal(whenWords('2027-01-05T19:00:00Z', {}, NOW), 'Tuesday 5 January 2027');
});

test('the notes’ words', () => {
  const base = { kind: 'rite', title: 'Deipnon', covenName: 'Salt & Sovereignty', covenSlug: 'salt', ritualId: 'r1', scheduledFor: '2026-10-30T19:00:00Z', zones: { planner: 'Europe/London' }, now: NOW };
  const on = gatheringNote({ ...base, event: 'scheduled' });
  assert.equal(on.body, 'Deipnon is on Salt & Sovereignty’s calendar for Friday 30 October. Tap to RSVP.');
  assert.equal(on.title, 'Salt & Sovereignty');
  assert.equal(on.url, '/coven/c/salt/ritual/r1');
  assert.equal(gatheringNote({ ...base, event: 'moved', scheduledFor: '2026-10-31T19:00:00Z' }).body, 'Deipnon has moved to Saturday 31 October. Tap to see the details.');
  const off = gatheringNote({ ...base, event: 'cancelled', previous: '2026-10-30T19:00:00Z' });
  assert.equal(off.body, 'Deipnon, planned for Friday 30 October, is off the calendar.');
  assert.equal(off.url, '/coven/c/salt/rituals');
  assert.equal(gatheringNote({ ...base, event: 'reminder' }).body, 'Reminder: Deipnon with Salt & Sovereignty is Friday 30 October. Tap to see it.');
  assert.equal(gatheringNote({ ...base, event: 'reminder', note: '  Bring a candle.\n' }).body, 'Reminder: Deipnon with Salt & Sovereignty is Friday 30 October. Tap to see it.\nBring a candle.');
  const meeting = { ...base, kind: 'meeting', title: 'Planning' };
  assert.equal(gatheringNote({ ...meeting, event: 'scheduled' }).body, 'A meeting, Planning, is on Salt & Sovereignty’s calendar for Friday 30 October. Tap to RSVP.');
  assert.equal(gatheringNote({ ...meeting, event: 'cancelled', previous: base.scheduledFor }).body, 'A meeting, Planning, planned for Friday 30 October, is off the calendar.');
  assert.equal(gatheringNote({ ...meeting, event: 'cancelled' }).body, 'A meeting, Planning, is off the calendar.');
  assert.equal(gatheringNote({ ...meeting, event: 'reminder' }).body, 'Reminder: the Planning meeting with Salt & Sovereignty is Friday 30 October. Tap to see it.');
  assert.equal(gatheringName('meeting', 'Officials’ meeting'), 'Officials’ meeting');
  for (const event of ['scheduled', 'moved', 'cancelled', 'reminder'] as const) assert.ok(!gatheringNote({ ...base, event, previous: AT }).body.includes('!'), 'no exclamation marks');
});

// ─── Each member's choice ───────────────────────────────────────────────

test('coven gatherings are on by default, and can be turned off for all or one coven', () => {
  assert.deepEqual(DEFAULT_PREFS.gatherings, { on: true, off: [] });
  assert.deepEqual(normalizePrefs({ gatherings: { on: 'yes', off: ['c1', 3, 'c1'] } }).gatherings, { on: true, off: ['c1'] });
  const prefs = normalizePrefs({});
  assert.equal(gatheringsOn(prefs, 'c1'), true);
  const one = setGatheringsFor(prefs, 'c1', false);
  assert.equal(gatheringsOn(one, 'c1'), false);
  assert.equal(gatheringsOn(one, 'c2'), true);
  const allOff = normalizePrefs({ gatherings: { on: false } });
  const back = setGatheringsFor(allOff, 'c2', true, ['c1', 'c2', 'c3']);
  assert.equal(gatheringsOn(back, 'c2'), true);
  assert.equal(gatheringsOn(back, 'c1'), false, 'the others stay as they were');
  // The edge function reads the saved value the same way.
  for (const p of [prefs, one, allOff, back]) for (const c of ['c1', 'c2', 'c3']) assert.equal(wantsGathering(prefsValue(p), c, NOW), gatheringsOn(p, c), `${c}`);
  assert.equal(wantsGathering(null, 'c1', NOW), true, 'nothing saved: on');
  assert.equal(wantsGathering(JSON.stringify({ paused: true, pausedUntil: '' }), 'c1', NOW), false, 'paused');
  assert.equal(wantsGathering(JSON.stringify({ paused: true, pausedUntil: '2026-10-20' }), 'c1', NOW), true, 'a pause that has ended');
  assert.equal(wantsGathering('not json', 'c1', NOW), true);
});
