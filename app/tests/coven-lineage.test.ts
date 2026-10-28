// Daughter covens: the disclosure, a mother head's powers, the lineage lines,
// founding choices, the library, the log's words, handing on, head reports,
// and the phone notes coven-notify sends (supabase/functions/coven-notify/lineage.ts).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  bookAttribution,
  copiedFrom,
  copySummary,
  daughterLabel,
  disclosureText,
  eventLine,
  handOnDefault,
  handOnSummary,
  hivedLine,
  inactiveFor,
  libraryState,
  MEMBERSHIP_CHOICES,
  overrideWords,
  requestProblems,
  roleBadge,
  slugFrom,
  stepDownOptions,
  transferCandidates,
  withAncestor,
  type HeadReport,
  type LineageEvent,
} from '../src/lib/covens/lineage.ts';
import { permissions, type Rank } from '../src/lib/covens/model.ts';
import { leadershipNote, lineageAudience, lineageNote, overridesNote, overrideWords as notifyOverrideWords } from '../../supabase/functions/coven-notify/lineage.ts';

const rank = (id: string, name: string, level: number, extra: Partial<Rank> = {}): Rank => ({ id, coven_id: 'c', name, description: null, requirements: null, level, ...extra });
const RANKS = [rank('s', 'Seeker', 1), rank('e', 'Elder', 4, { can_review: true }), rank('h', 'High Priestess', 5, { can_manage: true })];

test('the disclosure names the mother, its head and any covens above', () => {
  const head = { id: 'a', name: 'Hazel', title: 'High Priestess' };
  assert.equal(disclosureText({ coven: 'Willow Hollow', mother: 'Moon Circle', head }), 'Willow Hollow is a daughter coven of Moon Circle. Moon Circle’s High Priestess, Hazel, has final say over this coven.');
  const chain = disclosureText({ coven: 'Little Fern', mother: 'Willow Hollow', head: { id: 'b', name: 'Bramble', title: 'High Priest' }, above: [{ coven: 'Moon Circle', head, depth: 2 }] });
  assert.match(chain, /Willow Hollow’s High Priest, Bramble, has final say/);
  assert.match(chain, /So does Moon Circle’s High Priestess, Hazel, as head of the coven Willow Hollow descends from\./);
});

test('a mother coven head holds every power without being a member', () => {
  const base = permissions({ coven: { id: 'c', status: 'active', founder_id: 'x' } as never, membership: null, ranks: RANKS, userId: 'a' });
  assert.equal(base.manage, false);
  const p = withAncestor(base, true);
  assert.ok(p.ancestor && p.member && p.founder && p.manage && p.review && p.moderate && p.programs && p.keepAltars && p.approveBook);
  assert.equal(p.level, 1001);
  assert.equal(withAncestor(base, false).manage, false);
  assert.equal(roleBadge({ ancestor: true, member: false, founder: true }), 'Mother coven');
  assert.equal(roleBadge({ ancestor: false, member: true, founder: true, rankName: 'High Priestess' }), 'High Priestess · head');
  assert.equal(roleBadge({ ancestor: false, member: false, founder: false }), null);
});

test('lineage lines respect what you may see', () => {
  assert.equal(hivedLine({ mother: { id: 'm', name: 'Moon Circle', slug: 'moon-circle', head: { id: 'a', name: 'Hazel', title: 'HPS' } }, hived_at: '2026-10-15T12:00:00Z' }), 'Hived from Moon Circle in October 2026');
  assert.equal(hivedLine({ mother: { id: 'm', name: null, slug: null, head: { id: 'a', name: 'Hazel', title: 'HPS' } }, hived_at: null }), 'Hived from a coven that keeps itself unlisted');
  assert.equal(daughterLabel({ id: 'd', name: null, slug: null }), 'An unlisted daughter coven');
});

test('founding: the address, the problems, the choices and what carries across', () => {
  assert.equal(slugFrom('Willow  Hollow!'), 'willow-hollow');
  assert.equal(slugFrom('Ćwierć Księżyca'), 'cwierc-ksiezyca');
  assert.deepEqual(requestProblems({ name: 'Willow Hollow', slug: 'willow-hollow' }), []);
  assert.equal(requestProblems({ name: 'W', slug: 'Bad Slug' }).length, 2);
  assert.deepEqual(MEMBERSHIP_CHOICES.map((c) => c.value), ['stay', 'visiting', 'leave']);
  assert.match(MEMBERSHIP_CHOICES[1].detail('Moon Circle'), /give up your position there and its powers/);
  assert.equal(copySummary({}), 'Nothing carried across; the new coven starts fresh.');
  assert.equal(copySummary({ documents: true, calendar: true }), 'Carries across: creed, rules and agreements and practice calendar.');
});

test('copies say where they came from; the library says what changed', () => {
  const copies = [{ kind: 'document' as const, item_id: 'd1', from: 'Moon Circle', copied_at: '2026-10-01T00:00:00Z', pushed_at: null }];
  assert.equal(copiedFrom(copies, 'document', 'd1'), 'Copied from Moon Circle');
  assert.equal(copiedFrom(copies, 'rank', 'd1'), null);
  assert.equal(bookAttribution({ copied_from: { coven_name: 'Moon Circle' } }), 'From Moon Circle’s Book');
  assert.equal(bookAttribution({}), null);
  const item = { kind: 'program' as const, item_id: 'p', title: 'First degree', shared_at: '2026-09-01T00:00:00Z', changed_at: '2026-10-05T00:00:00Z' };
  assert.equal(libraryState({ ...item, copy: null }), 'new');
  assert.equal(libraryState({ ...item, copy: { item_id: 'q', copied_at: '2026-10-01T00:00:00Z', pushed_at: null } }), 'changed');
  assert.equal(libraryState({ ...item, copy: { item_id: 'q', copied_at: '2026-10-01T00:00:00Z', pushed_at: '2026-10-06T00:00:00Z' } }), 'current');
});

test('the log says what a mother coven head changed, in plain words, the same as the phone note', () => {
  const samples = [
    { table: 'coven_ranks', op: 'update', label: 'Seeker' },
    { table: 'coven_applications', op: 'update', status: 'approved', label: 'Rowan' },
    { table: 'coven_members', op: 'update', status: 'removed', label: 'Clover' },
    { table: 'coven_documents', op: 'insert', label: 'Our creed' },
    { table: 'mystery', op: 'delete' },
  ];
  assert.deepEqual(samples.map(overrideWords), ['changed a position “Seeker”', 'approved an application “Rowan”', 'removed “Clover”', 'added a page “Our creed”', 'removed something']);
  for (const s of samples) assert.equal(overrideWords(s), notifyOverrideWords(s));
  const names: Record<string, string> = { a: 'Hazel', b: 'Bramble' };
  const nameOf = (id: string | null | undefined) => (id ? names[id] ?? 'A witch' : 'A witch');
  const e = (event: LineageEvent['event'], detail: Record<string, unknown> = {}): LineageEvent => ({ id: '1', coven_id: 'd', other_coven_id: 'm', other_coven_name: 'Moon Circle', event, actor: 'a', detail, note: null, created_at: '' });
  assert.equal(eventLine(e('override', { table: 'coven_ranks', op: 'update', label: 'Seeker' }), nameOf), 'Hazel, head of Moon Circle, changed a position “Seeker”.');
  assert.equal(eventLine(e('founded', { head: 'b' }), nameOf), 'Founded as a daughter coven of Moon Circle, led by Bramble.');
  assert.equal(eventLine(e('head_appointed', { to: 'b' }), nameOf), 'Hazel, head of Moon Circle, made Bramble the coven’s head.');
  assert.match(eventLine(e('released'), nameOf), /independent of each other now/);
});

test('handing on: the old head never keeps the power to lead', () => {
  assert.equal(handOnDefault(RANKS, RANKS[2]).rank?.id, 'e');
  assert.equal(handOnDefault(RANKS, RANKS[2]).words, 'You become Elder, without the power to lead the coven.');
  const noElder = RANKS.filter((r) => r.name !== 'Elder');
  assert.equal(handOnDefault(noElder, noElder[1]).words, 'You keep the title High Priestess, without the power to lead the coven.');
  assert.equal(handOnDefault(RANKS, RANKS[2], false).words, 'Its current head becomes Elder, without the power to lead the coven.');
  assert.equal(handOnDefault(RANKS, RANKS[0]).words, 'You stay Seeker.');
  // Elder with every place held (open positions' seat_limit): their own position without the lead, as coven_hand_on does.
  const full = RANKS.map((r) => (r.id === 'e' ? { ...r, seat_limit: 1 } : r));
  assert.equal(handOnDefault(full, full[2], true, () => 1).words, 'You keep the title High Priestess, without the power to lead the coven.');
  assert.equal(handOnDefault(full, full[2], true, () => 0).rank?.id, 'e');
  assert.deepEqual(stepDownOptions(RANKS).map((r) => r.id), ['e', 's']);
  const words = handOnSummary({ name: 'Rowan', covenName: 'Moon Circle', choice: 'step_down', keepWords: '', stepTo: RANKS[0] });
  assert.equal(words, 'Rowan becomes the head of Moon Circle, with every power over it. You step down to Seeker. Only one person leads the coven; the new head can give more powers later.');
});

test('head reports: how long away, and who could lead, the named successor first', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  assert.equal(inactiveFor(null, now), 'not known');
  assert.equal(inactiveFor('2026-10-28T06:00:00Z', now), 'less than a day');
  assert.equal(inactiveFor('2026-09-20T12:00:00Z', now), '38 days');
  assert.equal(inactiveFor('2026-05-01T12:00:00Z', now), '6 months');
  const report = {
    successors: [
      { id: 'y', which: 2, name: 'Yarrow', active: true },
      { id: 'e', which: 1, name: 'Ember', active: false },
    ],
    leaders: [{ id: 'y', name: 'Yarrow', position: 'Elder' }, { id: 'b', name: 'Bramble', position: 'Elder' }],
  } as unknown as HeadReport;
  assert.deepEqual(transferCandidates(report).map((c) => c.label), ['Yarrow (named second)', 'Bramble (Elder)']);
});

test('coven-notify: who hears, and the words', () => {
  assert.deepEqual(lineageAudience('declined'), { rings: true, kind: 'answer' });
  assert.deepEqual(lineageAudience('override'), { rings: false, kind: 'new' });
  const requested = lineageNote({ event: 'requested', who: 'Bramble', coven: { name: 'Moon Circle', slug: 'moon-circle' }, daughterName: 'Willow Hollow' });
  assert.equal(requested.body, 'Bramble asked to found Willow Hollow, a daughter coven.');
  assert.equal(requested.url, '/coven/c/moon-circle/lineage');
  const founded = lineageNote({ event: 'founded', who: 'Hazel', coven: { name: 'Willow Hollow', slug: 'willow-hollow' }, other: { name: 'Moon Circle', slug: 'moon-circle' } });
  assert.match(founded.body, /Moon Circle’s head has final say over it/);
  const pushed = lineageNote({ event: 'pushed', who: 'Hazel', coven: { name: 'Willow Hollow', slug: 'willow-hollow' }, other: { name: 'Moon Circle', slug: 'moon-circle' }, title: 'Our creed' });
  assert.equal(pushed.body, 'Hazel, head of Moon Circle, updated “Our creed” in Willow Hollow.');
  const o = overridesNote({ who: 'Hazel', mother: 'Moon Circle', coven: { name: 'Willow Hollow', slug: 'willow-hollow' }, changes: ['changed a position “Seeker”', 'changed a page “Our creed”', 'approved an application “Rowan”', 'removed “Clover”'] });
  assert.equal(o.body, 'Hazel, head of Moon Circle, changed a position “Seeker”, changed a page “Our creed” and approved an application “Rowan” and 1 more.');
  assert.equal(leadershipNote({ event: 'handed_on', coven: { name: 'Moon Circle', slug: 'moon-circle' }, from: 'Hazel', to: 'Yarrow' })?.body, 'Hazel handed on leadership to Yarrow.');
  assert.match(leadershipNote({ event: 'archived_no_head', coven: { name: 'Moon Circle', slug: 'moon-circle' } })!.body, /no one was named to lead it/);
  assert.equal(leadershipNote({ event: 'head_reported', coven: { name: 'x', slug: 'x' } }), null);
});
