// Steps done for real at the coven's altar: the table, what choosing one
// fills in, that the choice survives saving, and how doing it counts.
import test from 'node:test';
import assert from 'node:assert/strict';

import { ALTAR_DEEDS, AT_ALTAR, atAltarActions, atAltarOf, atAltarStep, deedFinish, deedQuery, isAltarDeed } from '../src/lib/covens/altarActions.ts';
import { actionOf, actionsByGroup, groupsFor } from '../src/lib/covens/stepActions.ts';
import { blankPlan, builderPayload, builderStepFrom, blankBuilderStep } from '../src/lib/covens/builder.ts';
import { stepEnder, stepWithItems } from '../src/lib/covens/stepFlow.ts';
import type { RitualStep } from '../src/lib/covens/model.ts';

test('every altar step names a real action, once, with a plain name and a button', () => {
  for (const row of AT_ALTAR) {
    assert.ok(actionOf(row.action), row.action);
    assert.ok(row.name && row.button && !/!/.test(row.button + row.name), row.action);
  }
  assert.equal(new Set(AT_ALTAR.map((r) => r.action)).size, AT_ALTAR.length);
  for (const deed of ['petition', 'intention', 'offering', 'light', 'incense', 'place', 'card', 'release', 'anoint', 'charge_crystal']) assert.ok(isAltarDeed(deed) && ALTAR_DEEDS.includes(deed as never), deed);
  assert.equal(isAltarDeed('rotate'), false);
});

test('"At the altar" is a kind of step for rites, not meetings, listed under plain names', () => {
  assert.equal(groupsFor('rite')[0].id, 'altar');
  assert.ok(!groupsFor('meeting').some((g) => g.id === 'altar'));
  assert.ok(actionsByGroup().some((g) => g.group.id === 'altar'));
  const list = atAltarActions();
  assert.equal(list.length, AT_ALTAR.length);
  assert.ok(list.some((a) => a.label === 'Make an offering' && a.id === 'place_offering'));
  assert.deepEqual(atAltarActions('petition').map((a) => a.id), ['write_petition', 'burn_petitions', 'bury_petitions', 'release_petitions']);
});

test('choosing one fills in its five parts', () => {
  const petition = atAltarStep('write_petition')!;
  assert.equal(petition.title, 'Write a petition');
  assert.ok(petition.instructions.length > 10);
  assert.equal(petition.turn_mode, 'together');
  assert.deepEqual(petition.assignees, []);
  assert.equal(petition.altar_action, '');
  assert.equal(petition.contribution, null, 'the altar’s writer takes the words, not the ritual');
  assert.equal(petition.details.at_altar, 'petition');
  assert.equal(stepWithItems(petition), 'Fold it into the petition box, or beneath a candle.');
  assert.equal(stepEnder(petition), 'leader');
  assert.equal(atAltarStep('light_candle')!.turn_mode, 'in_turn');
  assert.equal(atAltarStep('vote'), null);
});

test('the deed is kept on the step’s details through saving', () => {
  const plan = blankPlan();
  const step = { ...blankBuilderStep('work'), ...atAltarStep('burn_petitions')! };
  const [saved] = builderPayload(plan, [step]);
  assert.equal(saved.details.at_altar, 'release');
  const back = builderStepFrom({ ...(saved as unknown as RitualStep), id: 's1', ritual_id: 'r1', position: 0 } as RitualStep, plan);
  assert.equal(atAltarOf(back)?.button, 'Burn your petition');
  assert.equal(atAltarOf({ action: 'write_petition', details: { at_altar: 'nonsense' } }), null);
  assert.equal(atAltarOf({ action: 'write_petition', details: {} }), null, 'only steps chosen at the altar');
});

test('doing it at the altar is your Done, and passes your turn', () => {
  assert.deepEqual(deedFinish({ turn_mode: 'together' }, 'u1'), { done: true, passTurn: false });
  assert.deepEqual(deedFinish({ turn_mode: 'in_turn', turn_order: ['u2', 'u1'], turn_at: 1 }, 'u1'), { done: true, passTurn: true });
  assert.deepEqual(deedFinish({ turn_mode: 'in_turn', turn_order: ['u2', 'u1'], turn_at: 0 }, 'u1'), { done: true, passTurn: false });
  assert.deepEqual(deedFinish({ turn_mode: 'in_turn' }, null), { done: false, passTurn: false });
  assert.equal(deedQuery('petition', 'a b'), 'do=petition&step=a%20b');
});
