// The quarters in a coven ritual: one quarter's own steps, calling them one
// at a time by those chosen, the ritual's own order (lib/covens/quarterSteps.ts,
// lib/altar/circle.ts).
import assert from 'node:assert/strict';
import test from 'node:test';

import { callQuarter, cleanQuarterOrder, nextToCall, nextToRelease, orderStartingWith, quarterSpotAt, quartersOf, releaseQuarter, circleReminder } from '../src/lib/altar/circle.ts';
import { AT_ALTAR, atAltarStep } from '../src/lib/covens/altarActions.ts';
import { builderPayload, blankPlan, blankBuilderStep, builderStepFrom, cleanPlan } from '../src/lib/covens/builder.ts';
import { partsOf, fieldsFor } from '../src/lib/covens/fields.ts';
import { quarterDeed, quarterGlowFor, quarterPart, quarterStepOf, quarterTurnOrder, needsQuarterTurns, ritualQuarterOrder, withQuarterOrder } from '../src/lib/covens/quarterSteps.ts';
import { DEED_HOWTO, glowsForMe, panelBarLine } from '../src/lib/covens/ritualPanel.ts';
import { liveFlow } from '../src/lib/covens/stepFlow.ts';
import { actionOf } from '../src/lib/covens/stepActions.ts';

const NORTH_FIRST = orderStartingWith('north');

test('an order: all four once; North first goes sunwise from the North', () => {
  assert.deepEqual(NORTH_FIRST, ['north', 'east', 'south', 'west']);
  assert.equal(cleanQuarterOrder(['north', 'east', 'east', 'west']), null);
  assert.equal(cleanQuarterOrder(['north', 'east']), null);
  assert.deepEqual(cleanQuarterOrder(['west', 'north', 'east', 'south']), ['west', 'north', 'east', 'south']);
});

test('the altar follows the ritual’s order, and releases in reverse of it', () => {
  let extra: Record<string, unknown> = {};
  assert.equal(nextToCall(quartersOf(extra), NORTH_FIRST), 'north');
  extra = callQuarter(extra, 'north', NORTH_FIRST).extra;
  assert.deepEqual(quartersOf(extra).order, NORTH_FIRST);
  assert.equal(nextToCall(quartersOf(extra)), 'east');
  // Out of order is allowed; the guide stays the ritual's.
  extra = callQuarter(extra, 'south').extra;
  assert.equal(nextToCall(quartersOf(extra)), 'east');
  extra = callQuarter(extra, 'east').extra;
  extra = callQuarter(extra, 'west').extra;
  // Release: West, South, East, North (the reverse of the order, not of the calls).
  assert.equal(nextToRelease(quartersOf(extra)), 'west');
  assert.match(circleReminder(extra)!, /West, South, East, North/);
  assert.equal(releaseQuarter(extra, 'north').ok, false);
  for (const id of ['west', 'south', 'east', 'north'] as const) {
    const r = releaseQuarter(extra, id);
    assert.ok(r.ok, id);
    extra = r.extra;
  }
  assert.equal('quarters' in extra, false);
  // The usual order isn't written down.
  assert.equal('order' in (callQuarter({}, 'east').extra.quarters as object), false);
});

test('a tap finds the quarter’s marker', () => {
  assert.equal(quarterSpotAt(0.94, 0.5, 1.6), 'east');
  assert.equal(quarterSpotAt(0.5, 0.1, 1.6), 'north');
  assert.equal(quarterSpotAt(0.5, 0.5, 1.6), null);
});

test('each quarter is a step of its own, with a how-to, to call and to release', () => {
  for (const name of ['Call the East', 'Call the South', 'Call the West', 'Call the North', 'Release the East', 'Release the North', 'Call the quarters', 'Release the quarters', 'Call the quarters, one at a time']) {
    const row = AT_ALTAR.find((a) => a.name === name);
    assert.ok(row, name);
    assert.ok(actionOf(row.action), `${name} is an action`);
    assert.ok(DEED_HOWTO[row.action], `${name} has a how-to`);
  }
  const east = atAltarStep('call_air')!;
  assert.equal(east.title, 'Call the East');
  const qs = quarterStepOf(east)!;
  assert.deepEqual([qs.mode, qs.single], ['call', 'east']);
  assert.deepEqual(quarterDeed(qs, 0), { kind: 'call_quarter', quarter: 'east' });
  assert.equal(quarterStepOf(atAltarStep('release_earth'))!.single, 'north');
  assert.equal(atAltarStep('call_quarters_turns')!.turn_mode, 'in_turn');
});

const turnsStep = (action = 'call_quarters_turns') => ({
  ...atAltarStep(action)!,
  details: {
    ...atAltarStep(action)!.details,
    fields: {
      directions: ['east', 'south', 'west', 'north'],
      parts: [
        { part: 'east', who: 'user:ash', words: 'Ash’s own words for the East.' },
        { part: 'south', who: 'role:maiden' },
        { part: 'west', who: 'user:ash' },
        { part: 'north', who: 'user:rowan' },
      ],
    },
  },
});
const roles = [{ id: 'maiden', name: 'Maiden', cast: [{ kind: 'user' as const, id: 'birch' }] }];

test('one at a time: each quarter’s caller in the ritual’s order, released in reverse', () => {
  const qs = quarterStepOf(turnsStep(), NORTH_FIRST)!;
  assert.equal(qs.turns, true);
  assert.deepEqual(qs.quarters, NORTH_FIRST);
  assert.deepEqual(quarterTurnOrder(qs, roles, 'leader'), ['rowan', 'ash', 'birch', 'ash']);
  assert.deepEqual(quarterPart(qs, 1), { id: 'east', line: 'Call the East', words: 'Ash’s own words for the East.' });
  assert.match(quarterPart(qs, 2)!.words, /Guardians of the South/);
  assert.deepEqual(quarterDeed(qs, 3), { kind: 'call_quarter', quarter: 'west' });
  const release = quarterStepOf(turnsStep('release_quarters_turns'), NORTH_FIRST)!;
  assert.deepEqual(release.quarters, ['west', 'south', 'east', 'north']);
  assert.match(quarterPart(release, 0)!.words, /Hail and farewell/);
  // Set once, before anyone has taken a turn.
  assert.equal(needsQuarterTurns(['rowan', 'ash'], { turn_order: ['ash', 'rowan'], turn_at: 0 }), true);
  assert.equal(needsQuarterTurns(['rowan', 'ash'], { turn_order: ['rowan', 'ash'], turn_at: 0 }), false);
  assert.equal(needsQuarterTurns(['rowan', 'ash'], { turn_order: ['ash', 'rowan'], turn_at: 1 }), false);
  // No one chosen for any quarter: the usual turns stand.
  assert.equal(quarterTurnOrder(quarterStepOf({ ...turnsStep(), details: { ...turnsStep().details, fields: {} } }), roles, 'leader'), null);
});

test('live: "Your turn: call the East", and only the holder’s quarter glows', () => {
  const step = { ...turnsStep(), id: 's1', turn_mode: 'in_turn', turn_order: ['rowan', 'ash', 'birch', 'ash'], turn_at: 1 };
  const base = { step, index: 0, total: 3, roles, leaderId: 'rowan', leads: false, membership: { status: 'active', rank_id: null }, presence: [], objects: null, nameOf: (id: string) => id, doerName: 'Everyone', quarterOrder: NORTH_FIRST };
  const ash = liveFlow({ ...base, userId: 'ash' });
  assert.equal(ash.myTurn, true);
  assert.equal(ash.turn.heading, 'Your turn: call the East');
  assert.equal(ash.turn.body, 'Ash’s own words for the East.');
  assert.equal(panelBarLine({ index: 0, title: step.title, mine: true, myTurn: true, kind: 'turns', iDone: false, complete: false, isEnder: false, quarterLine: ash.quarter?.line }), 'Step 1 · Your turn: call the East');
  const qs = quarterStepOf(step, NORTH_FIRST);
  const glow = (flow: typeof ash) => quarterGlowFor(qs, step.turn_at, glowsForMe({ kind: flow.kind, mine: true, myTurn: flow.myTurn, hasOrder: true, iDone: flow.iDone, complete: flow.progress.complete }));
  assert.equal(glow(ash), 'east');
  assert.equal(glow(liveFlow({ ...base, userId: 'rowan' })), null);
  assert.equal(glow(liveFlow({ ...base, userId: 'birch' })), null);
});

test('the ritual’s order is kept in its plan, and on its quarters steps when saved', () => {
  const plan = cleanPlan({ ...blankPlan(), quarter_order: NORTH_FIRST });
  assert.deepEqual(plan.quarter_order, NORTH_FIRST);
  assert.equal(cleanPlan({ ...blankPlan(), quarter_order: ['north', 'north', 'east', 'west'] }).quarter_order, undefined);
  assert.equal(cleanPlan({ ...blankPlan(), quarter_order: ['east', 'south', 'west', 'north'] }).quarter_order, undefined);
  const step = { ...blankBuilderStep(plan.sections[0].id), ...atAltarStep('call_quarters')!, details: { ...atAltarStep('call_quarters')!.details } };
  const other = { ...blankBuilderStep(plan.sections[0].id), title: 'Ground', action: 'ground_centre' };
  const [saved, plain] = builderPayload(plan, [step, other]);
  assert.deepEqual((saved.details as { quarter_order?: string[] }).quarter_order, NORTH_FIRST);
  assert.equal((plain.details as { quarter_order?: string[] }).quarter_order, undefined);
  // Read back from the steps when the saved plan has lost it.
  const back = builderStepFrom({ ...(saved as object), id: 'x', ritual_id: 'r' } as never, blankPlan());
  assert.deepEqual(ritualQuarterOrder(blankPlan(), [back]), NORTH_FIRST);
  assert.deepEqual(withQuarterOrder(blankPlan(), [back]).quarter_order, NORTH_FIRST);
  // The callers are listed in the ritual's order while planning.
  const specs = fieldsFor('call_quarters');
  const parts = partsOf(specs.find((s) => s.type === 'parts')!, { directions: ['east', 'south', 'west', 'north'] }, specs, NORTH_FIRST);
  assert.deepEqual(parts.map((p) => p.part), NORTH_FIRST);
});
