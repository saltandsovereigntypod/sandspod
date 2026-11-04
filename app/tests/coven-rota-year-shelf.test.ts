// The coven's duties rota (rotation, passing over, swaps and trades), its
// year in review, and the shared shelf's "the coven has this".
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { applySwaps, assignRota, cleanDuty, dutyNames, moveInRotation, nextDutiesFor, swapStillFits, type RotaDuty, type RotaGathering, type RotaSwap } from '../src/lib/covens/rota.ts';
import { canEditThing, covenHas, covenHasLine, fromRow, toRow } from '../src/lib/covens/shelf.ts';
import { reviewYearNear, yearReview, yearReviewText, type ReviewRitual } from '../src/lib/covens/yearReview.ts';
import { newItem } from '../src/lib/shelves/model.ts';
import { rotaNote, rotaRecipients, wantsRota } from '../../supabase/functions/coven-notify/rota.ts';

const duty = (id: string, rotation: string[], extra: Partial<RotaDuty> = {}): RotaDuty => ({
  id,
  coven_id: 'c',
  name: id,
  detail: null,
  applies: 'all',
  rotation,
  starts_at: '2026-01-01T00:00:00Z',
  sort_order: 0,
  active: true,
  ...extra,
});
const g = (id: string, day: number, extra: Partial<RotaGathering> = {}): RotaGathering => ({ id, scheduled_for: `2026-02-${String(day).padStart(2, '0')}T19:00:00Z`, status: 'scheduled', kind: 'rite', ...extra });
const swap = (extra: Partial<RotaSwap>): RotaSwap => ({
  id: 's',
  coven_id: 'c',
  ritual_id: 'g1',
  duty_id: 'candles',
  from_user: 'a',
  to_user: 'b',
  exchange_duty_id: null,
  note: null,
  status: 'accepted',
  requested_by: 'a',
  created_at: '2026-01-10T00:00:00Z',
  ...extra,
});
const who = (list: ReturnType<typeof assignRota>, ritualId: string, dutyId: string) => list.find((a) => a.ritualId === ritualId && a.dutyId === dutyId)?.userId;

test('a duty turns through its people in order, gathering by gathering', () => {
  const list = assignRota({ duties: [duty('candles', ['a', 'b', 'c'])], gatherings: [g('g3', 3), g('g1', 1), g('g2', 2), g('g4', 4)], members: ['a', 'b', 'c'] });
  assert.deepEqual(['g1', 'g2', 'g3', 'g4'].map((id) => who(list, id, 'candles')), ['a', 'b', 'c', 'a']);
});

test('cancelled gatherings, those before the start and the wrong kind do not count', () => {
  const gatherings = [g('g0', 1, { scheduled_for: '2025-12-20T19:00:00Z' }), g('g1', 1), g('gx', 2, { status: 'cancelled' }), g('m', 3, { kind: 'meeting' }), g('g2', 4)];
  const list = assignRota({ duties: [duty('candles', ['a', 'b'], { applies: 'rite' })], gatherings, members: ['a', 'b'] });
  assert.equal(who(list, 'g1', 'candles'), 'a');
  assert.equal(who(list, 'g2', 'candles'), 'b');
  assert.equal(who(list, 'gx', 'candles'), undefined);
  assert.equal(who(list, 'm', 'candles'), undefined);
});

test('someone away or gone is passed over for that gathering only, preferring someone without a duty', () => {
  const duties = [duty('host', ['b', 'c'], { sort_order: 0 }), duty('candles', ['a', 'b', 'c'], { sort_order: 1 })];
  const list = assignRota({ duties, gatherings: [g('g1', 1), g('g2', 2)], members: ['a', 'b', 'c'], away: { g1: ['a'] } });
  // g1: host is b; candles was a's turn, a is away, b is busy hosting, so c.
  assert.equal(who(list, 'g1', 'host'), 'b');
  const cover = list.find((x) => x.ritualId === 'g1' && x.dutyId === 'candles')!;
  assert.equal(cover.userId, 'c');
  assert.equal(cover.covered, true);
  assert.equal(cover.turnOf, 'a');
  // The order doesn't move: g2 is still b's turn for candles.
  assert.equal(who(list, 'g2', 'candles'), 'b');
  const gone = assignRota({ duties: [duty('candles', ['a', 'z'])], gatherings: [g('g1', 1), g('g2', 2)], members: ['a'] });
  assert.equal(who(gone, 'g2', 'candles'), 'a');
  const nobody = assignRota({ duties: [duty('candles', ['a'])], gatherings: [g('g1', 1)], members: ['a'], away: { g1: ['a'] } });
  assert.equal(who(nobody, 'g1', 'candles'), null);
});

test('accepted swaps hand over a turn; a trade swaps both; others are ignored', () => {
  const duties = [duty('candles', ['a', 'b']), duty('clean', ['b', 'a'], { sort_order: 1 })];
  const base = assignRota({ duties, gatherings: [g('g1', 1)], members: ['a', 'b'] });
  assert.equal(who(base, 'g1', 'candles'), 'a');
  assert.equal(who(base, 'g1', 'clean'), 'b');
  const handed = applySwaps(base, [swap({})]);
  assert.equal(who(handed, 'g1', 'candles'), 'b');
  assert.equal(who(handed, 'g1', 'clean'), 'b');
  const traded = applySwaps(base, [swap({ exchange_duty_id: 'clean' })]);
  assert.equal(who(traded, 'g1', 'candles'), 'b');
  assert.equal(who(traded, 'g1', 'clean'), 'a');
  assert.equal(traded.every((x) => x.swapped), true);
  for (const status of ['pending', 'declined', 'withdrawn'] as const) assert.equal(who(applySwaps(base, [swap({ status })]), 'g1', 'candles'), 'a');
  // A swap from someone who no longer has it is set aside.
  assert.equal(who(applySwaps(base, [swap({ from_user: 'b', to_user: 'a' })]), 'g1', 'candles'), 'a');
  assert.equal(swapStillFits(swap({ status: 'pending' }), base, ['a', 'b']), true);
  assert.equal(swapStillFits(swap({ status: 'pending' }), base, ['a']), false);
});

test('your next duty, and the tidy-ups', () => {
  const duties = [duty('candles', ['a', 'b']), duty('host', ['a'])];
  const gatherings = [g('g1', 1), g('g2', 2), g('g3', 3)];
  const list = assignRota({ duties, gatherings, members: ['a', 'b'] });
  const next = nextDutiesFor(list, gatherings, 'b', new Date('2026-01-20T00:00:00Z'));
  assert.equal(next?.gathering.id, 'g2');
  assert.deepEqual(next?.dutyIds, ['candles']);
  assert.deepEqual(nextDutiesFor(list, gatherings, 'a', new Date('2026-02-02T12:00:00Z'))?.dutyIds, ['host']);
  assert.equal(dutyNames(['candles', 'host'], [{ id: 'candles', name: 'Brings the candles' }, { id: 'host', name: 'Hosts' }]), 'Brings the candles and Hosts');
  assert.deepEqual(cleanDuty({ name: '  Hosts ', applies: 'nope', rotation: ['a', 'a', '', 'b'] }), { name: 'Hosts', detail: null, applies: 'all', rotation: ['a', 'b'] });
  assert.deepEqual(moveInRotation(['a', 'b', 'c'], 'c', -1), ['a', 'c', 'b']);
  assert.deepEqual(moveInRotation(['a', 'b'], 'a', -1), ['a', 'b']);
});

test('swap notes (coven-notify rota.ts): who hears, and the words', () => {
  const pending = { from_user: 'a', to_user: 'b', requested_by: 'a', status: 'pending' };
  assert.deepEqual(rotaRecipients(pending, 'asked', 'a'), ['b']);
  assert.deepEqual(rotaRecipients(pending, 'asked', 'z'), []);
  assert.deepEqual(rotaRecipients({ ...pending, status: 'accepted' }, 'answered', 'b'), ['a']);
  assert.deepEqual(rotaRecipients({ ...pending, status: 'accepted' }, 'answered', 'a'), []);
  assert.deepEqual(rotaRecipients({ ...pending, status: 'accepted', requested_by: 'lead' }, 'answered', 'lead'), ['a', 'b']);
  const base = { status: 'pending', who: 'Hazel', duty: 'Brings the candles', gathering: 'Full moon esbat', covenName: 'Hollow Oak', covenSlug: 'hollow-oak', ritualId: 'r1', reassigned: false, toRecipient: 'to' as const };
  assert.equal(rotaNote({ ...base, event: 'asked' }).body, 'Hazel asks you to take “Brings the candles” at Full moon esbat.');
  assert.equal(rotaNote({ ...base, event: 'answered', status: 'declined' }).body, 'Hazel can’t take “Brings the candles” at Full moon esbat. It stays with you.');
  assert.equal(rotaNote({ ...base, event: 'asked' }).url, '/coven/c/hollow-oak/ritual/r1');
  assert.equal(wantsRota(JSON.stringify({ paused: true })), false);
  assert.equal(wantsRota(null), true);
});

const r = (id: string, date: string, extra: Partial<ReviewRitual> = {}): ReviewRitual => ({ id, title: id, kind: 'rite', status: 'done', occasion: null, occasion_name: null, scheduled_for: date, ...extra });

test('the year in review counts what was held, by kind and sabbat', () => {
  const rituals = [
    r('Imbolc', '2026-02-01T19:00:00Z', { occasion: 'sabbat', occasion_name: 'Imbolc', started_at: '2026-02-01T19:00:00Z', ended_at: '2026-02-01T20:30:00Z' }),
    r('Full', '2026-02-12T19:00:00Z', { occasion: 'full_moon' }),
    r('Full2', '2026-03-12T19:00:00Z', { occasion: 'full_moon' }),
    r('Meet', '2026-02-20T19:00:00Z', { kind: 'meeting' }),
    r('Off', '2026-04-01T19:00:00Z', { status: 'cancelled' }),
    r('Last', '2025-12-21T19:00:00Z', { occasion: 'sabbat', occasion_name: 'Yule' }),
  ];
  const attendance = [
    { ritual_id: 'Imbolc', user_id: 'a', present: true },
    { ritual_id: 'Imbolc', user_id: 'b', present: true },
    { ritual_id: 'Full', user_id: 'a', present: true },
    { ritual_id: 'Full2', user_id: 'a', present: true },
    { ritual_id: 'Meet', user_id: 'a', present: true },
    { ritual_id: 'Full', user_id: 'b', present: false },
  ];
  const input = {
    year: 2026,
    userId: 'b',
    rituals,
    attendance,
    seesAllAttendance: true,
    members: [
      { user_id: 'a', joined_at: '2025-01-01T00:00:00Z' },
      { user_id: 'b', joined_at: '2026-01-15T00:00:00Z' },
    ],
    pages: [{ title: 'Our circle casting', created_at: '2026-03-01T00:00:00Z' }, { title: 'Old', created_at: '2025-03-01T00:00:00Z' }],
    altarThings: [
      { label: 'White candle', at: '2026-02-01T00:00:00Z' },
      { label: 'White candle', at: '2026-03-01T00:00:00Z' },
      { label: 'Chalice', at: '2026-03-01T00:00:00Z' },
    ],
    petitions: [{ created_at: '2026-05-01T00:00:00Z' }],
    shelfAdded: [],
  };
  const y = yearReview(input);
  assert.equal(y.held, 4);
  assert.equal(y.rites, 3);
  assert.equal(y.meetings, 1);
  assert.deepEqual(y.byOccasion, [{ label: 'Full moon', count: 2 }, { label: 'Imbolc', count: 1 }]);
  assert.deepEqual(y.sabbats, ['Imbolc']);
  assert.deepEqual(y.busiestMonth, { month: 'February', count: 3 });
  assert.equal(y.longestMinutes, 90);
  assert.deepEqual(y.attendance.best, { title: 'Imbolc', count: 2 });
  assert.deepEqual(y.attendance.steadfast, ['a']);
  assert.deepEqual(y.attendance.mine, { came: 1, of: 4 });
  assert.deepEqual(y.newMembers, ['b']);
  assert.deepEqual(y.pages, { count: 1, titles: ['Our circle casting'] });
  assert.deepEqual(y.altarTop[0], { label: 'White candle', count: 2 });
  assert.equal(y.petitions, 1);
  // Without the record, nobody else's attendance is drawn on.
  const own = yearReview({ ...input, seesAllAttendance: false, attendance: attendance.filter((a) => a.user_id === 'b') });
  assert.equal(own.attendance.best, null);
  assert.deepEqual(own.attendance.steadfast, []);
  assert.deepEqual(own.attendance.mine, { came: 1, of: 4 });
  const text = yearReviewText(y, 'Hollow Oak', (id) => ({ a: 'Hazel', b: 'Rowan' })[id] ?? 'Someone');
  assert.match(text, /^Hollow Oak: our 2026/);
  assert.match(text, /We gathered 4 times: 3 rites and 1 meeting\./);
  assert.match(text, /At every gathering: Hazel\./);
  assert.match(text, /Welcomed: Rowan\./);
  assert.doesNotMatch(text, /!/);
});

test('the year is offered on the home in December and January', () => {
  assert.equal(reviewYearNear(new Date(2026, 11, 3)), 2026);
  assert.equal(reviewYearNear(new Date(2027, 0, 20)), 2026);
  assert.equal(reviewYearNear(new Date(2026, 10, 30)), null);
});

test('the shared shelf: who may change things, and the coven has this', () => {
  const row = { id: 't1', coven_id: 'c', item: toRow(newItem({ name: 'White candles', shelf: 'candles' }), { holderId: 'a', needsCleansing: false }).item, name: 'White candles', holder_id: 'a', needs_cleansing: true, cleansed_on: null, added_by: 'b', created_at: '2026-01-01' };
  const thing = fromRow(row);
  assert.equal(thing.item.name, 'White candles');
  assert.equal(thing.needsCleansing, true);
  assert.equal('uses' in (row.item as object), false);
  assert.equal(canEditThing(thing, 'a', false), true);
  assert.equal(canEditThing(thing, 'b', false), true);
  assert.equal(canEditThing(thing, 'z', false), false);
  assert.equal(canEditThing(thing, 'z', true), true);
  const found = covenHas([{ name: 'white candle' }, { name: 'rosemary' }], [thing]);
  assert.equal(found.length, 1);
  assert.equal(covenHasLine(found, () => 'Hazel'), 'The coven has White candles (held by Hazel).');
});
