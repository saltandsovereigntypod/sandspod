import assert from 'node:assert/strict';
import test from 'node:test';

import { isSyncable, mergePlans, planFromRow, planRow, unsyncedPlans } from '../src/lib/rituals/planSync.ts';
import type { RitualPlan } from '../src/lib/rituals/types.ts';

const user = '11111111-1111-4111-8111-111111111111';
const now = new Date('2026-09-26T12:00:00Z');

function plan(overrides: Partial<RitualPlan> = {}): RitualPlan {
  return {
    id: 'a0a0a0a0-0000-4000-8000-000000000001',
    date: '2026-10-02',
    time: '21:30',
    title: 'Full moon release',
    intention: 'Let go',
    intentionKey: 'banishing',
    templateId: null,
    draft: null,
    ingredients: [{ ref: 'traditional/herb/rosemary', name: 'Rosemary', type: 'herb' }],
    createdAt: '2026-09-20T10:00:00.000Z',
    ...overrides,
  };
}

test('a plan becomes a ritual_plans row the table accepts', () => {
  const row = planRow(plan(), user, now);
  assert.equal(row.user_id, user);
  assert.equal(row.planned_date, '2026-10-02');
  assert.equal(row.planned_time, '21:30');
  assert.equal(row.updated_at, now.toISOString());
  assert.equal(row.created_at, '2026-09-20T10:00:00.000Z');
  assert.equal(planRow(plan({ time: 'evening' }), user, now).planned_time, '21:00');
  assert.equal('calendarEventId' in row, false);
});

test('calendar details stay with the phone that wrote them', () => {
  const local = plan({ addToCalendar: true, calendarEventId: 'evt-1', calendarId: 'cal-1' });
  const back = planFromRow(planRow(local, user, now), local);
  assert.equal(back.calendarEventId, 'evt-1');
  assert.equal(back.calendarId, 'cal-1');
  assert.equal(back.syncedTo, user);
  const elsewhere = planFromRow(planRow(local, user, now));
  assert.equal(elsewhere.calendarEventId, null);
});

test('merging keeps stored plans and plans not sent yet, and drops ones removed elsewhere', () => {
  const stored = plan({ id: 'stored', syncedTo: user });
  const offline = plan({ id: 'offline' });
  const removedElsewhere = plan({ id: 'gone', syncedTo: user });
  const merged = mergePlans([stored, offline, removedElsewhere], [planRow(stored, user, now)], user);
  assert.deepEqual(merged.map((p) => p.id).sort(), ['offline', 'stored']);
});

test('another account\'s rows and unsaveable plans are never mixed in', () => {
  const other = planRow(plan({ id: 'theirs' }), '22222222-2222-4222-8222-222222222222', now);
  assert.deepEqual(mergePlans([], [other], user), []);
  assert.equal(isSyncable(plan({ date: 'someday' })), false);
  assert.equal(isSyncable(plan({ title: '  ' })), false);
  assert.deepEqual(unsyncedPlans([plan({ date: 'someday' }), plan({ id: 'ok' })]).map((p) => p.id), ['ok']);
});
