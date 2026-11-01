import assert from 'node:assert/strict';
import { test } from 'node:test';

import { covenGlance, type CovenTodayInput } from '../src/lib/covens/today.ts';
import { asCovenTab, asTodayTab, COVEN_TABS, covenTabFor, TODAY_SECTIONS, TODAY_TABS, todayTabFor } from '../src/lib/screenTabs.ts';

test('Today has two tabs, Today first', () => {
  assert.deepEqual(TODAY_TABS.map((t) => t.label), ['Today', 'Sky & Lore']);
  assert.deepEqual(COVEN_TABS.map((t) => t.label), ['My covens', 'Find a coven']);
});

test('a stored or linked tab name is read only when it is one of the tabs', () => {
  assert.equal(asTodayTab('sky'), 'sky');
  assert.equal(asTodayTab(['today']), 'today');
  assert.equal(asTodayTab('lore'), null);
  assert.equal(asTodayTab(null), null);
  assert.equal(asCovenTab('find'), 'find');
  assert.equal(asCovenTab(42), null);
});

test('a link to a section of Today lands on the tab that holds it', () => {
  for (const section of ['moon', 'holiday', 'working', 'covens', 'tend', 'did-it-work', 'dream', 'deipnon', 'card', 'altar', 'reflect', 'horizon']) {
    assert.equal(todayTabFor({ section }), 'today', section);
  }
  for (const section of ['sky', 'hours', 'correspondences', 'practice']) {
    assert.equal(todayTabFor({ section }), 'sky', section);
  }
  assert.equal(todayTabFor({ section: '#Horizon' }), 'today');
  assert.equal(todayTabFor({ tab: 'sky', section: 'moon' }), 'sky', 'a tab named outright wins');
  assert.equal(todayTabFor({ section: 'nowhere' }), null);
  assert.equal(todayTabFor({ section: 'constructor' }), null);
  assert.equal(todayTabFor({}), null);
  assert.ok(Object.values(TODAY_SECTIONS).every((t) => t === 'today' || t === 'sky'));
});

test('the Coven tab opens on a link, then the last tab used, then by whether you belong to a coven', () => {
  assert.equal(covenTabFor({ linked: 'find', remembered: 'mine', signedIn: true, covenCount: 2 }), 'find');
  assert.equal(covenTabFor({ remembered: 'find', signedIn: true, covenCount: 2 }), 'find');
  assert.equal(covenTabFor({ remembered: 'mine', signedIn: true, covenCount: 0 }), 'mine');
  assert.equal(covenTabFor({ signedIn: true, covenCount: 1 }), 'mine');
  assert.equal(covenTabFor({ signedIn: true, covenCount: 0 }), 'find');
  assert.equal(covenTabFor({ signedIn: false, covenCount: null }), 'find');
  assert.equal(covenTabFor({ signedIn: true, covenCount: null }), 'mine', 'still loading');
  assert.equal(covenTabFor({ remembered: 'junk', signedIn: true, covenCount: 0 }), 'find');
});

const now = new Date(2026, 9, 28, 12, 0);
const at = (d: number, h: number) => new Date(2026, 9, d, h, 0).toISOString();
const input = (extra: Partial<CovenTodayInput> = {}): CovenTodayInput => ({
  userId: 'u1',
  covens: [
    { id: 'c1', slug: 'circle', name: 'Moon Circle', founder_id: 'u2' } as CovenTodayInput['covens'][number],
    { id: 'c2', slug: 'hearth', name: 'Hearth', founder_id: 'u1' } as CovenTodayInput['covens'][number],
  ],
  memberships: [
    { coven_id: 'c1', user_id: 'u1', rank_id: 'r1', status: 'active' },
    { coven_id: 'c2', user_id: 'u1', rank_id: null, status: 'active' },
  ],
  ranks: [{ id: 'r1', coven_id: 'c1', name: 'Initiate' }],
  programCovens: [],
  rituals: [],
  steps: [],
  rsvps: [],
  programs: [],
  stages: [],
  tasks: [],
  enrollments: [],
  progress: [],
  mentors: [],
  ...extra,
});
const rite = (id: string, coven: string, when: string, extra: Partial<CovenTodayInput['rituals'][number]> = {}) => ({ id, coven_id: coven, title: id, status: 'scheduled', scheduled_for: when, current_step_id: null, ...extra });

test("a coven's card names your position, or Founder for the founder without one", () => {
  assert.equal(covenGlance(input(), 'c1', now).position, 'Initiate');
  assert.equal(covenGlance(input(), 'c2', now).position, 'Founder');
  assert.equal(covenGlance(input({ ranks: undefined }), 'c1', now).position, null);
  assert.deepEqual(covenGlance(null, 'c1', now), { position: null, next: null });
});

test("a coven's card shows its next gathering: one under way, else the soonest from today", () => {
  const rituals = [rite('Later', 'c1', at(30, 20)), rite('Samhain', 'c1', at(29, 19), { kind: 'meeting' }), rite('Old', 'c1', at(20, 19)), rite('Elsewhere', 'c2', at(28, 20)), rite('Draft', 'c1', at(28, 20), { status: 'draft' })];
  const next = covenGlance(input({ rituals }), 'c1', now).next;
  assert.equal(next?.title, 'Samhain');
  assert.equal(next?.meeting, true);
  assert.match(next!.line, /^Samhain, tomorrow at /);
  const live = covenGlance(input({ rituals: [...rituals, rite('Circle', 'c1', at(28, 11), { status: 'live' })] }), 'c1', now).next;
  assert.equal(live?.line, 'Circle is under way');
  assert.equal(live?.live, true);
  assert.equal(covenGlance(input({ rituals: [rite('Old', 'c1', at(20, 19))] }), 'c1', now).next, null);
});
