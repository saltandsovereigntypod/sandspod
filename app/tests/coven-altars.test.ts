import assert from 'node:assert/strict';
import { test } from 'node:test';

import { diff, documentFromRows, keyed, sceneOf, tendedBy, withObject, withScene, type CovenAltar } from '../src/lib/covens/altarDoc.ts';
import { circleSpot, stepAltarChange } from '../src/lib/covens/ritualAltar.ts';
import { countMessage, covenTotal } from '../src/lib/covens/unreadCount.ts';
import { permissions, type Coven, type Member, type Rank } from '../src/lib/covens/model.ts';
import { candleLife, isLit } from '../src/lib/altar/livingState.ts';
import type { AltarDocument } from '../src/lib/altar/snapshot.ts';

const altar = {
  id: 'a1',
  coven_id: 'c1',
  name: 'The ritual altar',
  is_main: true,
  edit_mode: 'chosen',
  locked: false,
  background: '/assets/altar/backgrounds/ocean.png',
  background_name: 'Moonlit Shore',
  groups: [],
  active_group_id: null,
  extra: {},
  archived_at: null,
  created_by: null,
  updated_by: null,
  created_at: '2026-10-24T00:00:00Z',
  updated_at: '2026-10-24T00:00:00Z',
} satisfies CovenAltar;

const rows = [
  { object_key: 'b', position: 2, data: { label: 'Bowl', leftPercent: 0.7 } },
  { object_key: 'a', position: 1, data: { label: 'Candle', leftPercent: 0.3 } },
];

test('a coven altar reads as one document, objects in the order they were set down', () => {
  const doc = documentFromRows(altar, rows);
  assert.deepEqual(doc.objects.map((o) => o.altarObjectId), ['a', 'b']);
  assert.equal(doc.background, '/assets/altar/backgrounds/ocean.png');
  assert.equal(doc.backgroundName, 'Moonlit Shore');
});

test('only what changed is sent: one moved candle, one new stone, one cleared bowl, the scene', () => {
  const doc = documentFromRows(altar, rows);
  const saved = new Map(doc.objects.map((o) => [String(o.altarObjectId), JSON.stringify(o)]));
  const scene = JSON.stringify(sceneOf(doc));
  assert.deepEqual(diff(doc, saved, scene), []);

  const moved: AltarDocument = {
    ...doc,
    background: '/assets/altar/backgrounds/river.png',
    objects: [{ ...doc.objects[0], leftPercent: 0.4 }, { label: 'Stone', altarObjectId: 'c' }],
  };
  const changes = diff(moved, saved, scene);
  assert.deepEqual(
    changes.map((c) => (c.kind === 'scene' ? 'scene' : `${c.key}:${c.data ? 'set' : 'gone'}`)),
    ['a:set', 'c:set', 'b:gone', 'scene'],
  );
});

test('changes from others fold in object by object, and leave the rest alone', () => {
  const doc = documentFromRows(altar, rows);
  const same = withObject(doc, 'a', { label: 'Candle', leftPercent: 0.3 });
  assert.equal(same, doc, 'an echo of what is already there changes nothing');
  const moved = withObject(doc, 'a', { label: 'Candle', leftPercent: 0.5 });
  assert.equal(moved.objects[0].leftPercent, 0.5);
  assert.equal(moved.objects[1], doc.objects[1]);
  const added = withObject(doc, 'z', { label: 'Feather' });
  assert.deepEqual(added.objects.map((o) => o.altarObjectId), ['a', 'b', 'z']);
  const cleared = withObject(doc, 'b', null);
  assert.deepEqual(cleared.objects.map((o) => o.altarObjectId), ['a']);
  assert.equal(withObject(doc, 'nope', null), doc);
  const scene = { ...sceneOf(doc), backgroundName: 'Forest River' };
  assert.equal(withScene(doc, scene).backgroundName, 'Forest River');
  assert.equal(withScene(doc, sceneOf(doc)), doc);
});

test('objects without an id get one before they are saved', () => {
  const doc = keyed({ ...documentFromRows(altar, []), objects: [{ label: 'New' }] });
  assert.ok(doc.objects[0].altarObjectId);
});

test('who tends an altar, in a few words', () => {
  assert.equal(tendedBy(altar), 'Tended by those the coven’s head chooses');
  assert.equal(tendedBy({ ...altar, is_main: false }), 'Tended by those its keeper chooses');
  assert.equal(tendedBy({ ...altar, edit_mode: 'members' }), 'Everyone tends it');
  assert.equal(tendedBy({ ...altar, locked: true }), 'Locked by its keeper');
});

test('a ritual step lights your candle in the circle, and lights or snuffs them all', () => {
  const now = '2026-10-31T20:00:00.000Z';
  const empty = documentFromRows(altar, []);
  const light = stepAltarChange({ altar_action: 'light_candle', altar_color: 'red', altar_form: 'chime', altar_label: null, altar_image: null, title: 'Call the south' }, { title: 'Samhain' }, 'Rowan', 0, now);
  assert.ok(light);
  const lit = light!(empty);
  assert.equal(lit.objects.length, 1);
  const candle = lit.objects[0];
  assert.equal(candle.label, 'Rowan’s candle');
  assert.equal(candle.color, 'red');
  assert.equal(candle.form, 'chime-spell');
  assert.match(String(candle.imagePath), /candles\/chime\/red-chime\.png$/);
  assert.ok(isLit(candle));
  assert.ok(!candleLife(candle).spent);

  const second = light!(lit);
  assert.equal(second.objects.length, 2);
  const snuff = stepAltarChange({ altar_action: 'snuff_all', altar_color: null, altar_form: null, altar_label: null, altar_image: null, title: 'Close' }, { title: 'Samhain' }, 'Ash', 2, now)!;
  assert.ok(snuff(second).objects.every((o) => !isLit(o)));

  const offering = stepAltarChange({ altar_action: 'place_item', altar_color: null, altar_form: null, altar_label: 'Apples', altar_image: '/assets/altar/objects/tools/key/key.png', title: 'Offer' }, { title: 'Samhain' }, 'Ash', 0, now)!;
  const placed = offering(empty).objects[0];
  assert.equal(placed.label, 'Apples');
  assert.match(String(placed.imagePath), /key\.png$/);
});

test('candles gather in rings of twelve, each ring closer in', () => {
  const first = circleSpot(0);
  assert.ok(Math.abs(first.cx - 0.5) < 1e-9 && first.cy < 0.62);
  const ring2 = circleSpot(12);
  assert.ok(0.62 - ring2.cy < 0.62 - first.cy);
  for (let n = 0; n < 40; n++) {
    const spot = circleSpot(n);
    assert.ok(spot.cx >= 0.05 && spot.cx <= 0.95 && spot.cy >= 0.2 && spot.cy <= 0.95);
  }
});

test('unread chat counts others’ messages, not yours or the chat you are reading', () => {
  const read = { c1: '2026-10-24T10:00:00Z' };
  let counts = countMessage({}, { coven_id: 'c1', user_id: 'u2', created_at: '2026-10-24T11:00:00Z' }, 'u1', read, null);
  assert.deepEqual(counts, { c1: 1 });
  counts = countMessage(counts, { coven_id: 'c1', user_id: 'u1', created_at: '2026-10-24T11:01:00Z' }, 'u1', read, null);
  assert.deepEqual(counts, { c1: 1 });
  counts = countMessage(counts, { coven_id: 'c1', user_id: 'u3', created_at: '2026-10-24T09:00:00Z' }, 'u1', read, null);
  assert.deepEqual(counts, { c1: 1 }, 'older than when you last read');
  counts = countMessage(counts, { coven_id: 'c1', user_id: 'u3', created_at: '2026-10-24T12:00:00Z' }, 'u1', read, 'c1');
  assert.deepEqual(counts, { c1: 1 }, 'the chat open in front of you');
  counts = countMessage(counts, { coven_id: 'c2', user_id: 'u3', created_at: '2026-10-24T12:00:00Z' }, 'u1', read, 'c1');
  assert.deepEqual(counts, { c1: 1, c2: 1 });
});

test('the head decides what each position does with altars and chat', () => {
  const coven = { id: 'c1', founder_id: 'head', status: 'active' } as Coven;
  const rank = (over: Partial<Rank>) => ({ id: 'r1', coven_id: 'c1', name: 'Seeker', level: 1, ...over }) as Rank;
  const member = (userId: string) => ({ coven_id: 'c1', user_id: userId, rank_id: 'r1', status: 'active' }) as Member;
  const of = (r: Rank, userId = 'u1') => permissions({ coven, membership: member(userId), ranks: [r], userId });

  const plain = of(rank({}));
  assert.equal(plain.startAltars, true, 'on unless turned off');
  assert.equal(plain.chat, true, 'on unless turned off');
  assert.equal(plain.tendAltars, false);
  assert.equal(plain.keepAltars, false);

  const quiet = of(rank({ can_chat: false, can_start_altars: false }));
  assert.equal(quiet.chat, false);
  assert.equal(quiet.startAltars, false);

  const tender = of(rank({ can_tend_altars: true }));
  assert.equal(tender.tendAltars, true);
  assert.equal(tender.keepAltars, false);

  const keeper = of(rank({ can_keep_altars: true, can_start_altars: false }));
  assert.equal(keeper.keepAltars, true);
  assert.equal(keeper.tendAltars, true);
  assert.equal(keeper.startAltars, true, 'keepers start altars');

  const head = of(rank({ can_chat: false, can_start_altars: false }), 'head');
  assert.ok(head.chat && head.startAltars && head.tendAltars && head.keepAltars, 'the head always can');
});

test('the ritual planner: steps, parts, dates and what a step can place', async () => {
  const planner = await import('../src/lib/covens/planner.ts');
  const people = [
    { id: 'u1', name: 'Rowan', eligible: true },
    { id: 'u2', name: 'Sage', eligible: false },
  ];
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? 'Wren';
  const step = (over: Partial<import('../src/lib/covens/planner.ts').DraftStep>) => ({ ...planner.blankStep(), title: 'Cast the circle', ...over });

  assert.equal(planner.plannerProblem('', [step({})], people, nameOf), 'Give the ritual a name.');
  assert.equal(planner.plannerProblem('Full moon', [step({ altar_action: 'place_item' })], people, nameOf), 'Step 1: choose what is placed on the altar.');
  assert.match(planner.plannerProblem('Full moon', [step({ assigned_user_id: 'u2' })], people, nameOf), /Sage hasn’t signed/);
  assert.match(planner.plannerProblem('Full moon', [step({ assigned_user_id: 'u9' })], people, nameOf), /Wren is no longer a member/);
  assert.equal(planner.plannerProblem('Full moon', [step({ assigned_user_id: 'u1' }), step({ title: '' })], people, nameOf), '');

  const payload = planner.stepsPayload([step({ altar_action: 'light_candle', altar_color: 'green', altar_image: '/x.png' }), step({ title: '  ' }), step({ altar_action: 'place_item', altar_image: '/assets/altar/a.png', altar_label: 'Apple', altar_color: 'red' })]);
  assert.equal(payload.length, 2, 'blank steps are left out');
  assert.equal(payload[0].altar_color, 'green');
  assert.equal(payload[0].altar_image, '', 'a candle step carries no picture');
  assert.equal(payload[1].altar_color, '', 'a placing step carries no candle');
  assert.equal(payload[1].altar_label, 'Apple');

  const copied = planner.stepsFromTemplate([
    { title: 'Close', instructions: null, spoken_text: 'It is done.', duration_seconds: 125, sort_order: 2 },
    { title: 'Open', instructions: 'Face east.', spoken_text: null, duration_seconds: null, sort_order: 1 },
    { title: ' ', instructions: null, spoken_text: null, duration_seconds: null, sort_order: 3 },
  ]);
  assert.deepEqual(copied.map((s) => s.title), ['Open', 'Close']);
  assert.equal(copied[1].duration_minutes, 2);
  assert.equal(copied[0].assigned_user_id, null);

  const at = planner.toFields('2026-10-31T19:30:00');
  assert.deepEqual(at, { date: '2026-10-31', time: '19:30' });
  assert.equal(new Date(planner.fromFields('2026-10-31', '19:30') as string).getHours(), 19);
  assert.equal(planner.fromFields('', ''), null);
  assert.ok(planner.fromFields('31/10/2026', '19:30') instanceof Error);
  assert.ok(planner.fromFields('2026-02-30', '19:30') instanceof Error);

  const suggestions = planner.occasionSuggestions(new Date('2026-10-01T12:00:00Z'));
  assert.ok(suggestions.some((s) => s.occasion === 'full_moon'));
  assert.ok(suggestions.some((s) => s.name === 'Samhain'));
  assert.equal(planner.suggestionTime({ occasion: 'sabbat', date: new Date('2026-10-31T03:00:00') }).getHours(), 20);

  assert.ok(planner.PLACEABLE.length > 50);
  assert.ok(planner.PLACEABLE.every((p) => /^\/assets\/altar\//.test(p.image)), 'pictures pass the database rule');
  assert.ok(planner.searchPlaceable('rose').length > 0);
});
