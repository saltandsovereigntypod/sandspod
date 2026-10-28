import assert from 'node:assert/strict';
import { test } from 'node:test';

import { applyWidgetAction, altarAtPlace, chooseSlot, placeAltars, previewWidgetAction, slotAltars, slotNumbers, widgetAltar, type WidgetAction, type WidgetAltar } from '../src/lib/altarWidget.ts';
import { isLit } from '../src/lib/altar/livingState.ts';
import type { SavedAltar } from '../src/lib/altar/types.ts';
import {
  canTendFromWidget,
  covenAltarIdOf,
  covenAltarLink,
  covenSavedAltar,
  covenSlotId,
  covenSlotIds,
  covenWidgetExtras,
  covenWidgetName,
  isCovenSlot,
  mergeCovenFetch,
  routeWidgetActions,
  type CovenWidgetEntry,
} from '../src/lib/covenAltarWidget.ts';

const mine = (id: string, updatedAt: string): SavedAltar => ({ id, name: `Altar ${id}`, updatedAt, objects: [] });

const entry = (altarId: string, over: Partial<CovenWidgetEntry> = {}): CovenWidgetEntry => ({
  altarId,
  covenId: 'coven-1',
  covenName: 'Salt & Sovereignty Coven',
  covenSlug: 'salt-sovereignty',
  altarName: 'Test Altar',
  archived: false,
  doc: {
    background: '',
    backgroundName: '',
    groups: [],
    activeGroupId: null,
    extra: {},
    objects: [
      { type: 'candle', label: 'White Candle', color: 'white', altarObjectId: 'k-candle' },
      { type: 'deity', label: 'Brigid', altarObjectId: 'k-brigid' },
    ],
  },
  tendable: true,
  updatedAt: '2026-10-20T10:00:00Z',
  fetchedAt: '2026-10-28T10:00:00Z',
  ...over,
});

const action = (altarId: string, kind: WidgetAction['kind'], key = '', at = '2026-10-28T12:00:00Z'): WidgetAction => ({ id: `${at}-${kind}-${key}-${altarId}`, altarId, kind, key, at });

test('a coven altar is kept in a place as coven:<id>, and your own altar ids stay as they were', () => {
  assert.equal(covenSlotId('a1'), 'coven:a1');
  assert.equal(covenAltarIdOf('coven:a1'), 'a1');
  assert.equal(covenAltarIdOf('3f0c2b1e-0000-4000-8000-000000000000'), null);
  assert.equal(covenAltarIdOf('coven:'), null);
  assert.equal(covenAltarIdOf(null), null);
  assert.equal(isCovenSlot('coven:a1'), true);
  assert.equal(isCovenSlot('my-altar'), false);
  assert.deepEqual(covenSlotIds([null, 'coven:a1', 'mine', 'coven:a2', null, 'coven:a1']), ['a1', 'a2']);
});

test('choosing a place works the same for a coven altar, and never takes the same id as your own altar', () => {
  let chosen: (string | null)[] = ['a1', null, null, null, null, null];
  chosen = chooseSlot(chosen, covenSlotId('a1'), 2);
  assert.deepEqual(chosen.slice(0, 2), ['a1', 'coven:a1']);
  chosen = chooseSlot(chosen, covenSlotId('a1'), 4);
  assert.deepEqual(chosen.slice(0, 4), ['a1', null, null, 'coven:a1']);
  chosen = chooseSlot(chosen, covenSlotId('a1'), 0);
  assert.equal(chosen.includes('coven:a1'), false);
});

test('the coven altar is named with its coven and drawn like one of your own', () => {
  assert.equal(covenWidgetName('Test Altar', 'Salt & Sovereignty Coven'), 'Test Altar · Salt & Sovereignty Coven');
  assert.equal(covenWidgetName('', ''), 'Coven altar');
  const saved = covenSavedAltar(entry('a1'));
  assert.equal(saved.id, 'coven:a1');
  assert.equal(saved.name, 'Test Altar · Salt & Sovereignty Coven');
  const shown = widgetAltar(saved, () => '', new Date('2026-10-28T12:00:00Z'));
  assert.equal(shown.name, 'Test Altar · Salt & Sovereignty Coven');
  assert.deepEqual(shown.candles.map((c) => c.key), ['k-candle']);
  assert.deepEqual(shown.presences.map((p) => p.key), ['k-brigid']);
  assert.equal(covenSavedAltar(entry('a1', { archived: true })).archived, true);
});

test('places keep their number: a coven altar only sits where you put it, and an empty place stays empty', () => {
  const altars = [mine('old', '2026-01-01'), mine('new', '2026-10-01'), covenSavedAltar(entry('a1'))];
  const chosen = [null, null, 'coven:a1', null, null, null];
  const places = placeAltars(altars, chosen);
  assert.deepEqual(places.map((a) => a?.id ?? null), ['new', 'old', 'coven:a1', null, null, null]);
  assert.deepEqual(slotAltars(altars, chosen).map((a) => a.id), ['new', 'old', 'coven:a1']);
  assert.equal(slotNumbers(altars, chosen).get('coven:a1'), 3);

  // Not chosen: never fills a place by itself.
  assert.equal(slotAltars(altars, Array(6).fill(null)).some((a) => a.id === 'coven:a1'), false);
  // Gone (deleted, or you left the coven): its place is empty, not taken by another.
  const withoutIt = [mine('only', '2026-10-01')];
  const gone = placeAltars(withoutIt, [null, null, 'coven:a1', null, null, null]);
  assert.deepEqual(gone.map((a) => a?.id ?? null), ['only', null, null, null, null, null]);
});

test('a widget set to a place finds its altar by place, and older data by order', () => {
  const w = (id: string, slot?: number) => ({ id, slot }) as WidgetAltar;
  const sent = [w('new', 1), w('coven:a1', 3)];
  assert.equal(altarAtPlace(sent, 3)?.id, 'coven:a1');
  assert.equal(altarAtPlace(sent, 2), undefined);
  const older = [w('x'), w('y')];
  assert.equal(altarAtPlace(older, 2)?.id, 'y');
  assert.equal(altarAtPlace(older, 5)?.id, 'x');
});

test('taps are routed to your own altars or to each coven altar', () => {
  const taps = [action('mine', 'light'), action('coven:a1', 'offer', 'k-brigid'), action('coven:a2', 'snuff'), action('coven:a1', 'light')];
  const { personal, coven } = routeWidgetActions(taps);
  assert.deepEqual(personal.map((a) => a.altarId), ['mine']);
  assert.deepEqual([...coven.keys()], ['a1', 'a2']);
  assert.deepEqual(coven.get('a1')!.map((a) => a.kind), ['offer', 'light']);
});

test('a coven altar can be tended from the widget only when you may tend it and no ritual holds it', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  assert.equal(canTendFromWidget({ can_edit: true, keeper: false, ritual_id: null, reason: null }, now), true);
  assert.equal(canTendFromWidget({ can_edit: false, keeper: false, ritual_id: null, reason: 'Only this altar’s keeper tends it.' }, now), false);
  assert.equal(canTendFromWidget({ can_edit: true, keeper: true, ritual_id: 'r1', reason: null }, now), false);
  assert.equal(canTendFromWidget({ can_edit: true, keeper: false, ritual_id: null, reason: null, held_until: '2026-10-28T13:00:00Z' }, now), false);
  assert.equal(canTendFromWidget({ can_edit: true, keeper: false, ritual_id: null, reason: null, held_until: '2026-10-28T11:00:00Z' }, now), true);
  assert.equal(canTendFromWidget(null, now), false);
});

test('a look-only coven altar opens its coven screen and ignores taps', () => {
  assert.deepEqual(covenWidgetExtras(entry('a1')), { link: 'saltandsovereignty://coven/c/salt-sovereignty/altars/a1' });
  assert.deepEqual(covenWidgetExtras(entry('a1', { tendable: false })), { link: covenAltarLink(entry('a1')), readOnly: true });
  assert.deepEqual(covenWidgetExtras(undefined), {});

  const shown = { ...widgetAltar(covenSavedAltar(entry('a1')), () => '', new Date('2026-10-28T12:00:00Z')), readOnly: true };
  const after = previewWidgetAction([shown], action('coven:a1', 'light'));
  assert.equal(after[0], shown);
});

test('a widget tap changes the coven altar the same way as your own', () => {
  const doc = applyWidgetAction(entry('a1').doc, action('coven:a1', 'light', 'k-candle'), '2026-10-28T12:00:00Z');
  assert.equal(isLit(doc.objects[0]), true);
  assert.equal(doc.objects[0].altarObjectId, 'k-candle');
});

test('after a fetch: kept altars stay when offline, and ones the coven no longer shows you are gone', () => {
  const kept = { a1: entry('a1'), a2: entry('a2') };
  const offline = mergeCovenFetch(['a1', 'a2', 'a3'], kept, { ok: false });
  assert.deepEqual(Object.keys(offline.entries), ['a1', 'a2']);
  assert.deepEqual(offline.gone, []);

  const fresh = entry('a1', { altarName: 'Renamed' });
  const online = mergeCovenFetch(['a1', 'a2'], kept, { ok: true, entries: [fresh] });
  assert.equal(online.entries.a1.altarName, 'Renamed');
  assert.deepEqual(online.gone, ['a2']);
});
