import assert from 'node:assert/strict';
import { test } from 'node:test';

import { planFor, readSetFor, setForParams } from '../src/lib/rituals/setFor.ts';

test('a chosen time travels through the link and back', () => {
  const s = { date: '2026-11-05', time: '21:30', hour: 'Venus', intent: 'love', why: 'Waxing moon in Taurus.' };
  assert.deepEqual(readSetFor(setForParams(s)), s);
  assert.equal(readSetFor({ setDate: '2026-11-05' }), null);
  assert.equal(readSetFor({ setDate: 'soon', setTime: '21:30' }), null);
});

test('the plan sets the saved ritual for that time', () => {
  const plan = planFor({ date: '2026-11-05', time: '21:30' }, { id: 't1', title: '  ', intention: '' }, { label: 'Love', plannerKey: 'love' }, new Date('2026-11-01T00:00:00Z'));
  assert.equal(plan.templateId, 't1');
  assert.equal(plan.title, 'Love working');
  assert.equal(plan.intention, 'Love');
  assert.equal(plan.intentionKey, 'love');
  assert.equal(plan.date, '2026-11-05');
  assert.equal(plan.time, '21:30');
  assert.equal(plan.draft, null);
});
