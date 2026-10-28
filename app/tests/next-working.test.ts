import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { NextCovenRite } from '../src/lib/covens/today.ts';
import { nextWorkingCard } from '../src/lib/rituals/nextWorking.ts';

const plan = { id: 'p1', title: 'Full moon release', when: 'Friday, Oct 30', sky: 'Full Moon in Taurus' };
const rite: NextCovenRite = {
  ritualId: 'r1',
  covenSlug: 'circle',
  covenName: 'Moon Circle',
  title: 'Samhain rite',
  meeting: false,
  at: new Date(2026, 9, 31, 20),
  detail: 'Saturday at 8:00 PM · Moon Circle · You’re going',
};

test('a ritual under way comes first, with its step', () => {
  const card = nextWorkingCard({ active: { status: 'paused', title: '', step: 'Cast the circle' }, plan, rite, first: 'plan' });
  assert.equal(card.kind, 'active');
  assert.equal(card.eyebrow, 'Paused');
  assert.equal(card.title, 'Your ritual');
  assert.deepEqual(card.lines, ['Cast the circle']);
  assert.deepEqual(card.action, { label: 'Continue the ritual', target: { kind: 'run' } });
  const noStep = nextWorkingCard({ active: { status: 'live', title: 'Esbat' }, plan: null, rite: null, first: null });
  assert.equal(noStep.eyebrow, 'Under way');
  assert.deepEqual(noStep.lines, ['Finish and journal it when you are ready.']);
});

test("a coven's rite, when it comes first, with your own plan after it", () => {
  const card = nextWorkingCard({ plan, rite, first: 'rite' });
  assert.equal(card.kind, 'rite');
  assert.equal(card.title, 'Samhain rite');
  assert.deepEqual(card.lines, [rite.detail, 'Then your own: Full moon release, Friday, Oct 30']);
  assert.deepEqual(card.action, { label: 'See the rite', target: { kind: 'rite', covenSlug: 'circle', ritualId: 'r1' } });
  assert.equal(nextWorkingCard({ plan: null, rite: { ...rite, meeting: true }, first: 'rite' }).action.label, 'See the meeting');
});

test('your own plan, when it comes first, with the coven after it', () => {
  const card = nextWorkingCard({ plan, rite, first: 'plan' });
  assert.equal(card.kind, 'plan');
  assert.deepEqual(card.lines, ['Friday, Oct 30 · Full Moon in Taurus', 'Then with Moon Circle: Samhain rite']);
  assert.deepEqual(card.action, { label: 'Open the plan', target: { kind: 'plan', id: 'p1' } });
  assert.deepEqual(nextWorkingCard({ plan, rite: null, first: 'plan' }).lines, ['Friday, Oct 30 · Full Moon in Taurus']);
});

test('nothing planned: the planner', () => {
  const card = nextWorkingCard({ plan: null, rite: null, first: null });
  assert.equal(card.kind, 'none');
  assert.equal(card.title, 'Nothing planned yet');
  assert.deepEqual(card.action, { label: 'Plan a ritual', target: { kind: 'planner' } });
  // Leaving out a ritual under way (the Rituals home has its own card) falls through to the plan.
  assert.equal(nextWorkingCard({ active: null, plan, rite: null, first: 'plan' }).kind, 'plan');
});
