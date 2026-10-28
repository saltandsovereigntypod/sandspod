import assert from 'node:assert/strict';
import { test } from 'node:test';

import { nextCovenRite, nextWorkingFirst, type CovenTodayInput } from '../src/lib/covens/today.ts';

const now = new Date(2026, 9, 28, 12, 0);
const at = (d: number, h: number) => new Date(2026, 9, d, h, 0).toISOString();
const input = (rituals: CovenTodayInput['rituals'], rsvps: CovenTodayInput['rsvps'] = []): CovenTodayInput => ({
  userId: 'u1',
  covens: [{ id: 'c1', slug: 'circle', name: 'Moon Circle' } as CovenTodayInput['covens'][number]],
  memberships: [{ coven_id: 'c1', user_id: 'u1', rank_id: null, status: 'active' }],
  programCovens: [],
  rituals,
  steps: [],
  rsvps,
  programs: [],
  stages: [],
  tasks: [],
  enrollments: [],
  progress: [],
  mentors: [],
});
const rite = (id: string, when: string, extra: Partial<CovenTodayInput['rituals'][number]> = {}) => ({ id, coven_id: 'c1', title: id, status: 'scheduled', scheduled_for: when, current_step_id: null, ...extra });

test("a coven's soonest scheduled rite is your next working", () => {
  const r = nextCovenRite(input([rite('Later', at(30, 20)), rite('Deipnon', at(29, 18)), rite('Draft', at(28, 20), { status: 'draft' })]), now);
  assert.equal(r?.title, 'Deipnon');
  assert.equal(r?.covenSlug, 'circle');
  assert.match(r!.detail, /Moon Circle · Will you come\?$/);
});

test("rites you can't make, and past days, are left out; meetings say so", () => {
  const r = nextCovenRite(input([rite('Old', at(27, 20)), rite('Skip', at(29, 18)), rite('Planning', at(31, 19), { kind: 'meeting' })], [{ ritual_id: 'Skip', user_id: 'u1', response: 'not_going' }]), now);
  assert.equal(r?.title, 'Planning');
  assert.equal(r?.meeting, true);
  assert.equal(nextCovenRite(null, now), null);
});

test('whichever comes first: your plan or the coven rite', () => {
  const r = nextCovenRite(input([rite('Deipnon', at(29, 18))]), now)!;
  assert.equal(nextWorkingFirst(new Date(2026, 9, 28, 21), r), 'plan');
  assert.equal(nextWorkingFirst(new Date(2026, 10, 2, 21), r), 'rite');
  assert.equal(nextWorkingFirst(null, r), 'rite');
  assert.equal(nextWorkingFirst(null, null), null);
});
