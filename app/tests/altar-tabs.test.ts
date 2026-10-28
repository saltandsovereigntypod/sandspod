import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CovenAltar } from '../src/lib/covens/altarDoc.ts';
import { altarKind, covensToStartIn, groupCovenAltars, keepsAltar, orderCovenAltars, thingsLabel, type CovenAltarsInput } from '../src/lib/covens/altarsAcross.ts';
import { ALTAR_TAB_KEY, ALTAR_TABS, asAltarTab } from '../src/lib/screenTabs.ts';

test('Altar has two tabs, Personal first, remembered under its own key', () => {
  assert.deepEqual(ALTAR_TABS.map((t) => t.label), ['Personal', 'Coven']);
  assert.equal(ALTAR_TAB_KEY, 'saltAltarTab');
  assert.equal(asAltarTab('coven'), 'coven');
  assert.equal(asAltarTab(['personal']), 'personal');
  assert.equal(asAltarTab('mine'), null);
  assert.equal(asAltarTab(undefined), null);
});

const altar = (id: string, extra: Partial<CovenAltar> = {}): CovenAltar => ({
  id,
  coven_id: 'c1',
  name: id,
  is_main: false,
  edit_mode: 'members',
  locked: false,
  background: '',
  background_name: '',
  groups: [],
  active_group_id: null,
  extra: {},
  archived_at: null,
  created_by: 'u2',
  updated_by: null,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
  ...extra,
});
const petition = { petition_id: 'p1' };

test("a coven's altars: the ritual altar first, then the others newest first, then petition altars; archived left out", () => {
  const list = [
    altar('old', { created_at: '2026-09-01T00:00:00Z' }),
    altar('plea', { extra: petition, created_at: '2026-10-20T00:00:00Z' }),
    altar('new', { created_at: '2026-10-10T00:00:00Z' }),
    altar('main', { is_main: true, created_at: '2026-01-01T00:00:00Z' }),
    altar('gone', { archived_at: '2026-10-11T00:00:00Z' }),
  ];
  assert.deepEqual(orderCovenAltars(list).map((a) => a.id), ['main', 'new', 'old', 'plea']);
});

test('archived altars are listed only for those who may restore them', () => {
  assert.equal(keepsAltar(altar('a'), true, 'u1'), true, 'a keeper of every altar');
  assert.equal(keepsAltar(altar('a', { created_by: 'u1' }), false, 'u1'), true, 'whoever started it');
  assert.equal(keepsAltar(altar('a'), false, 'u1'), false);
  assert.equal(keepsAltar(altar('a', { is_main: true }), true, 'u1'), false, 'the ritual altar is never archived');
  assert.equal(keepsAltar(altar('a', { extra: petition }), true, 'u1'), false, 'a petition keeps its own altar');
  assert.equal(keepsAltar(altar('a', { created_by: null }), false, null), false);
});

const coven = (id: string, name: string, altars: CovenAltar[], extra: Partial<CovenAltarsInput> = {}): CovenAltarsInput => ({
  coven: { id, slug: id, name },
  altars,
  counts: {},
  canStart: false,
  keeps: false,
  ...extra,
});

test('covens are grouped under their names, in order of name, each with its own archive', () => {
  const groups = groupCovenAltars(
    [
      coven('c2', 'willow Hearth', [altar('w-main', { is_main: true }), altar('w-gone', { archived_at: '2026-10-02T00:00:00Z', created_by: 'u1' }), altar('w-theirs', { archived_at: '2026-10-02T00:00:00Z' })], { canStart: true }),
      coven('c1', 'Ash Circle', [altar('a1'), altar('a-main', { is_main: true })], { counts: { a1: 3 } }),
      coven('c3', 'Moon Circle', [], { canStart: true, keeps: true }),
    ],
    'u1',
  );
  assert.deepEqual(groups.map((g) => g.coven.name), ['Ash Circle', 'Moon Circle', 'willow Hearth']);
  assert.deepEqual(groups[0].altars.map((a) => a.id), ['a-main', 'a1']);
  assert.equal(groups[0].counts.a1, 3);
  assert.deepEqual(groups[1].altars, [], 'a coven with no altars still has its group');
  assert.deepEqual(groups[2].altars.map((a) => a.id), ['w-main']);
  assert.deepEqual(groups[2].archived.map((a) => a.id), ['w-gone'], 'only the archived altar you started');
  assert.deepEqual(covensToStartIn(groups).map((c) => c.name), ['Moon Circle', 'willow Hearth']);
  assert.deepEqual(groupCovenAltars([], 'u1'), []);
});

test("an altar's card names what it is and how many things are on it", () => {
  assert.equal(altarKind(altar('a', { is_main: true })), 'The ritual altar');
  assert.equal(altarKind(altar('a', { extra: petition })), 'A petition’s altar');
  assert.equal(altarKind(altar('a')), 'A coven altar');
  assert.equal(thingsLabel(1), '1 thing');
  assert.equal(thingsLabel(0), '0 things');
  assert.equal(thingsLabel(undefined), '0 things');
});
