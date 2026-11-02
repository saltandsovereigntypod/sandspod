// How a coven ritual step runs: who moves it on (the leader by default), the
// pop-ups while it runs, when it is finished by itself, and the planner's
// warnings and "What members will see".
import test from 'node:test';
import assert from 'node:assert/strict';

import { addRole, blankBuilderStep, blankPlan, builderStepFrom, builderWarnings, castRole, memberPreview } from '../src/lib/covens/builder.ts';
import { completePopup, doneIn, enderLabel, flowKind, itemsOnAltar, liveFlow, mayMoveOn, presentIn, stepEnder, stepProgress, stepStartText, turnPopup } from '../src/lib/covens/stepFlow.ts';
import type { RitualStep } from '../src/lib/covens/model.ts';

const nameOf = (id: string) => ({ u1: 'Rowan', u2: 'Ash', u3: 'Wren' })[id] ?? 'A member';
const member = { status: 'active', rank_id: null };

test('every step is moved on by the leader unless the planner chose someone', () => {
  assert.equal(stepEnder({}), 'leader');
  assert.equal(stepEnder({ details: { ender: 'nonsense' } }), 'leader');
  assert.equal(stepEnder({ details: { ender: 'user:u2' } }), 'user:u2');
  // An older saved step with no ender reads as the leader's.
  const plan = blankPlan();
  const old = builderStepFrom({ id: 's1', ritual_id: 'r', title: 'Cast the circle', details: { who: { roles: [], people: [] } } } as unknown as RitualStep, plan);
  assert.equal(stepEnder(old), 'leader');
  assert.equal(enderLabel('leader', { roles: [], nameOf }), 'The leader');
  assert.equal(enderLabel('leader', { roles: [], nameOf }, 'Rowan'), 'Rowan');
  assert.equal(enderLabel('user:u2', { roles: [], nameOf }), 'Ash');
});

test('who may move a step on', () => {
  const roles = [{ id: 'm', name: 'Maiden', cast: [{ kind: 'user' as const, id: 'u3' }] }, { id: 'e', name: 'East caller', cast: [] }];
  assert.equal(mayMoveOn('leader', { roles, leads: true, userId: 'u1', membership: member }), true);
  assert.equal(mayMoveOn('leader', { roles, leads: false, userId: 'u2', membership: member }), false);
  assert.equal(mayMoveOn('user:u2', { roles, leads: false, userId: 'u2', membership: member }), true);
  assert.equal(mayMoveOn('user:u2', { roles, leads: true, userId: 'u1', membership: member }), false, 'only the one chosen');
  assert.equal(mayMoveOn('role:m', { roles, leads: false, userId: 'u3', membership: member }), true);
  assert.equal(mayMoveOn('role:e', { roles, leads: true, userId: 'u1', membership: member }), true, 'a role no one plays falls to the leader');
});

test('the kind of step', () => {
  assert.equal(flowKind({ turn_mode: 'in_turn' }), 'turns');
  assert.equal(flowKind({ turn_mode: 'together' }), 'together');
  assert.equal(flowKind({ turn_mode: 'assigned', assignees: [{ kind: 'user', id: 'u1' }] }), 'one');
  assert.equal(flowKind({ turn_mode: 'assigned', assignees: [] }), 'together');
  assert.equal(flowKind({ turn_mode: 'on_behalf', assignees: [{ kind: 'rank', id: 'r' }] }), 'one');
});

test('step-start pop-up text', () => {
  const turns = stepStartText({ index: 1, total: 7, title: 'Light the candles', kind: 'turns', items: ['White candle', 'Rosemary'], withItems: 'Light yours from the one before.', enderName: 'Rowan' });
  assert.equal(turns.heading, 'Step 2 of 7 · Light the candles');
  assert.deepEqual(turns.lines, [
    'One person at a time. When it’s your turn you’ll get another pop-up. Your part is under the Ritual button.',
    'On the altar: White candle and Rosemary.',
    'With them: Light yours from the one before.',
    'Rowan moves us on.',
  ]);
  assert.equal(stepStartText({ index: 0, total: 2, title: 'Breathe', kind: 'together', enderName: '' }).lines[0], 'Everyone together. Tap Done when you’ve finished.');
  assert.equal(stepStartText({ index: 0, total: 2, title: 'Read', kind: 'one', doerName: 'Ash', enderName: 'The leader' }).lines.join(' '), 'Ash does this step. The leader moves us on.');
  assert.equal(turnPopup('').button, 'I’ve done my part');
  assert.equal(completePopup({ isEnder: true, last: false, index: 1, enderName: 'Rowan' }).heading, 'Everyone’s done. Move to step 3?');
  assert.equal(completePopup({ isEnder: true, last: true, index: 6, enderName: 'Rowan' }).heading, 'Everyone’s done. Finish the ritual?');
  assert.deepEqual(completePopup({ isEnder: false, last: false, index: 1, enderName: 'Rowan' }), { heading: 'Waiting for Rowan to move on…', button: null });
});

test('a step finishes by itself', () => {
  // One at a time: after the last person passes.
  assert.equal(stepProgress({ kind: 'turns', turns: { order: ['u1', 'u2'], at: 1 }, present: [], done: [] }).complete, false);
  assert.equal(stepProgress({ kind: 'turns', turns: { order: ['u1', 'u2'], at: 2 }, present: [], done: [] }).complete, true);
  // Together: everyone here has tapped Done.
  const presence = [{ user_id: 'u1', place: 'ritual', done: 's1' }, { user_id: 'u2', place: 'altar:a', done: null }, { user_id: 'u3', place: 'chat' }];
  assert.deepEqual(presentIn(presence), ['u1', 'u2']);
  assert.deepEqual(doneIn(presence, 's1'), ['u1']);
  const together = stepProgress({ kind: 'together', present: presentIn(presence), done: doneIn(presence, 's1') });
  assert.deepEqual(together, { complete: false, waiting: '1 of 2 done' });
  assert.equal(stepProgress({ kind: 'together', present: ['u1', 'u2'], done: ['u1', 'u2'] }).complete, true);
  // ...or the time is up.
  assert.equal(stepProgress({ kind: 'together', present: ['u1', 'u2'], done: [], endsAt: 1000, now: 2000 }).complete, true);
  // One person: when they tap Done.
  assert.equal(stepProgress({ kind: 'one', present: ['u1'], done: ['u1'], doers: ['u2'] }).complete, false);
  assert.equal(stepProgress({ kind: 'one', present: ['u1'], done: ['u2'], doers: ['u2'] }).complete, true);
  // Items: each ticks when it is on the altar; turns and items together.
  const items = itemsOnAltar([{ name: 'White candle', image: 'w.png' }, { name: 'Rosemary' }], [{ imagePath: 'w.png' }, { label: 'Rowan: rosemary' }]);
  assert.deepEqual(items, [{ name: 'White candle', placed: true }, { name: 'Rosemary', placed: true }]);
  const half = itemsOnAltar([{ name: 'White candle', image: 'w.png' }, { name: 'Salt' }], [{ imagePath: 'w.png' }]);
  const both = stepProgress({ kind: 'turns', turns: { order: ['u1'], at: 1 }, present: [], done: [], items: half });
  assert.deepEqual(both, { complete: false, waiting: 'Still to place: Salt' });
});

test('planner warnings: a candle spoken of but not placed, turns no one can take, an ender no one plays', () => {
  let plan = blankPlan();
  const added = addRole(plan, 'Maiden');
  plan = added.plan;
  const section = plan.sections[0].id;
  const candle = { ...blankBuilderStep(section), title: 'Light the way', instructions: 'Each lights a candle.' };
  const turns = { ...blankBuilderStep(section), title: 'Speak', turn_mode: 'in_turn' as const, roles: [added.id] };
  const ender = { ...blankBuilderStep(section), title: 'Close', details: { ender: `role:${added.id}` } };
  const warnings = builderWarnings(plan, [candle, turns, ender]);
  assert.ok(warnings.some((w) => w.startsWith('Step 1 speaks of a candle')));
  assert.ok(warnings.some((w) => w.startsWith('Step 2 is one at a time, but no one is cast')));
  // The whole coven taking turns is fine: everyone present takes one.
  assert.ok(!builderWarnings(plan, [{ ...turns, roles: [] }]).some((w) => w.includes('one at a time')));
  // A later step putting out a candle lit earlier needs no candle of its own.
  const lit = { ...blankBuilderStep(section), title: 'Light the candle', altar_action: 'light_candle' as const };
  assert.ok(!builderWarnings(plan, [lit, { ...blankBuilderStep(section), title: 'Put out the candle' }]).some((w) => w.includes('speaks of a candle')));
  assert.ok(warnings.some((w) => w.includes('moved on by Maiden, but no one is cast')));
  // With a candle placed and the role cast, those go.
  plan = castRole(plan, added.id, [{ kind: 'user', id: 'u3' }]);
  const placed = { ...candle, items: [{ key: 'candle-white', name: 'White candle', image: 'w.png', category: 'candle' }] };
  const fine = builderWarnings(plan, [placed, turns, ender]);
  assert.deepEqual(fine, []);
});

test('What members will see, step by step', () => {
  const plan = blankPlan();
  const section = plan.sections[0].id;
  const steps = [
    { ...blankBuilderStep(section), title: 'Ground', turn_mode: 'together' as const },
    { ...blankBuilderStep(section), title: 'Read the charge', assignees: [{ kind: 'user' as const, id: 'u2' }], details: { ender: 'user:u2' } },
  ];
  const seen = memberPreview(plan, steps, { roles: [], ranks: [], nameOf });
  assert.equal(seen[0].heading, 'Step 1 of 2 · Ground');
  assert.equal(seen[0].lines.at(-1), 'The leader moves us on.');
  assert.deepEqual(seen[1].lines, ['Ash does this step.', 'Ash moves us on.']);
});

test('the step under way, all together (as the live screens use it)', () => {
  const step = { id: 's2', title: 'Ground', turn_mode: 'together', assignees: [], items: [{ name: 'Salt', image: 's.png' }], details: { with_items: 'Sprinkle it in a ring.' } };
  const base = { step, index: 1, total: 3, roles: [], leaderId: 'u1', userId: 'u2', membership: member, nameOf, doerName: 'The whole coven' };
  const waiting = liveFlow({ ...base, leads: false, presence: [{ user_id: 'u1', place: 'ritual' }, { user_id: 'u2', place: 'altar:a', done: 's2' }], objects: [] });
  assert.equal(waiting.start.heading, 'Step 2 of 3 · Ground');
  assert.equal(waiting.start.lines.at(-1), 'Rowan moves us on.');
  assert.equal(waiting.iDone, true);
  assert.equal(waiting.progress.complete, false);
  assert.equal(waiting.isEnder, false);
  const ready = liveFlow({ ...base, userId: 'u1', leads: true, presence: [{ user_id: 'u1', place: 'ritual', done: 's2' }, { user_id: 'u2', place: 'altar:a', done: 's2' }], objects: [{ imagePath: 's.png' }] });
  assert.equal(ready.progress.complete, true);
  assert.deepEqual(ready.complete, { heading: 'Everyone’s done. Move to step 3?', button: 'Move to step 3' });
});
