// Steps done for real at the coven's altar: the table, what choosing one
// fills in, that the choice survives saving, and how doing it counts.
import test from 'node:test';
import assert from 'node:assert/strict';

import { ALTAR_DEEDS, altarChoiceGroups, altarChoiceNote, altarChoicesOf, applyAltarChoice, AT_ALTAR, atAltarActions, atAltarOf, atAltarStep, deedFinish, deedQuery, isAltarDeed } from '../src/lib/covens/altarActions.ts';
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
  for (const deed of ['petition', 'intention', 'offering', 'light', 'incense', 'place', 'card', 'release', 'anoint', 'charge_crystal', 'bell']) assert.ok(isAltarDeed(deed) && ALTAR_DEEDS.includes(deed as never), deed);
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
  assert.ok(petition.instructions.endsWith('Fold it into the petition box, or beneath a candle.'), 'one "What to do"');
  assert.equal(stepWithItems(petition), '');
  assert.equal(petition.details.at_altar_as, 'write_petition');
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

test('the step’s one "At the altar" choice: done there, asked of people, or the altar by itself', () => {
  const groups = altarChoiceGroups();
  const values = groups.flatMap((g) => g.options.map((o) => o.value));
  assert.equal(new Set(values).size, values.length, 'nothing listed twice');
  assert.ok(values.includes('deed:write_petition') && values.includes('deed:ring_bell') && values.includes('deed:pour_libation'));
  assert.ok(values.includes('ask:vow') && !values.includes('ask:petition'), 'a petition is written at the altar, not twice');
  assert.ok(values.includes('effect:snuff_all') && !values.includes('effect:'));
  assert.ok(altarChoiceGroups(['ask:petition']).some((g) => g.options.some((o) => o.value === 'ask:petition')), 'an older step keeps its own');

  const blank = { ...blankBuilderStep('work'), instructions: '' };
  const libation = applyAltarChoice(blank, 'deed:pour_libation');
  assert.equal(libation.details.at_altar, 'offering');
  assert.equal(atAltarOf({ ...blank, ...libation, action: 'custom' })?.button, 'Pour your libation');
  assert.ok(libation.instructions && libation.instructions.length > 10, 'fills in what to do when empty');
  assert.equal(applyAltarChoice({ ...blank, instructions: 'Mine.' }, 'deed:pour_libation').instructions, undefined, 'keeps what was written');
  assert.deepEqual(altarChoicesOf({ ...blank, ...libation }), ['deed:pour_libation']);
  assert.match(altarChoiceNote({ ...blank, ...libation }), /Pour your libation/);

  const vow = applyAltarChoice({ ...blank, ...libation }, 'ask:vow');
  assert.equal(vow.contribution?.kind, 'vow');
  assert.equal(vow.details.at_altar, undefined);
  const snuff = applyAltarChoice({ ...blank, ...vow }, 'effect:snuff_all');
  assert.equal(snuff.altar_action, 'snuff_all');
  assert.equal(snuff.contribution, null);
  const none = applyAltarChoice({ ...blank, ...snuff }, '');
  assert.deepEqual(altarChoicesOf({ ...blank, ...none }), []);
  // A step saved with both a contribution and the altar's own change shows both.
  assert.deepEqual(altarChoicesOf({ action: 'x', details: {}, altar_action: 'light_candle', contribution: { kind: 'petition' } }), ['ask:petition', 'effect:light_candle']);
});
