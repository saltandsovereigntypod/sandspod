import assert from 'node:assert/strict';
import { test } from 'node:test';

import { liveRitualFor, turnLine } from '../src/lib/covens/altarPanel.ts';

const r = (id: string, extra: Record<string, unknown> = {}) => ({ id, status: 'live', kind: 'rite', current_step_id: `${id}-s1`, altar_id: null as string | null, ...extra });

test('the Ritual button shows only while a rite has a step in progress', () => {
  assert.equal(liveRitualFor([], 'a1'), null);
  assert.equal(liveRitualFor([r('x', { status: 'scheduled' })], 'a1'), null);
  assert.equal(liveRitualFor([r('x', { current_step_id: null })], 'a1'), null);
  // A meeting has its own screen.
  assert.equal(liveRitualFor([r('x', { kind: 'meeting' })], 'a1'), null);
  assert.equal(liveRitualFor([r('x')], 'a1')?.id, 'x');
});

test('it prefers the rite under way at this altar', () => {
  const list = [r('elsewhere', { altar_id: 'a2' }), r('here', { altar_id: 'a1' }), r('told')];
  assert.equal(liveRitualFor(list, 'a1')?.id, 'here');
  assert.equal(liveRitualFor(list, 'a1', 'told')?.id, 'told');
  assert.equal(liveRitualFor(list, 'a9')?.id, 'elsewhere');
});

test('whose turn it is now', () => {
  const nameOf = (id: string) => ({ u1: 'Ash', u2: 'Rowan' })[id] ?? 'A witch';
  assert.equal(turnLine({ turn_mode: 'together' }, 'u1', nameOf), 'Taken together.');
  assert.equal(turnLine({ turn_mode: 'in_turn', turn_order: [] }, 'u1', nameOf), 'Taken in turn.');
  assert.equal(turnLine({ turn_mode: 'in_turn', turn_order: ['u1', 'u2'], turn_at: 0 }, 'u1', nameOf), 'Taken in turn: your turn now (1 of 2).');
  assert.equal(turnLine({ turn_mode: 'in_turn', turn_order: ['u1', 'u2'], turn_at: 1 }, 'u1', nameOf), 'Taken in turn: Rowan’s turn now (2 of 2).');
  assert.equal(turnLine({ turn_mode: 'in_turn', turn_order: ['u1', 'u2'], turn_at: 2 }, 'u1', nameOf), 'Taken in turn; everyone has had theirs.');
});
