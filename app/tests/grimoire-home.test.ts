import assert from 'node:assert/strict';
import { test } from 'node:test';

import { applyOps, pageSectionPatch } from '../src/lib/grimoire/edits.ts';
import {
  arrangeHome,
  emptyLayout,
  filterPages,
  forgetMissing,
  moveHomePart,
  pageKinds,
  parseLayout,
  personalParts,
  placeHomePart,
  renamePart,
  resetHome,
  serializeLayout,
  setPageKind,
  setPageSort,
  setPartHidden,
  setPartOpen,
  shownPages,
  sortPages,
} from '../src/lib/grimoire/layout.ts';
import type { GrimoireSnapshot, PageRow } from '../src/lib/grimoire/types.ts';

const section = (id: string, title: string, sort_order = 0) => ({ id, title, sort_order, created_at: '2026-01-01' });
const shelves = [
  { key: 'traditional', title: 'Everything Else' },
  { key: 'myPractice', title: 'My Practice' },
  { key: 'dreams', title: 'Dreams' },
];
const parts = personalParts({ sections: [section('b', 'Spells I use', 1), section('a', 'Hekate', 0)], loose: true, shelves });
const keys = (items: { key: string }[]) => items.map((i) => i.key);

test('the default home puts your pages first and the reference shelf last, closed', () => {
  const home = arrangeHome(emptyLayout(), parts);
  assert.deepEqual(keys(home), ['pages', 'section:a', 'section:b', 'myPractice', 'dreams', 'traditional']);
  assert.equal(home.find((i) => i.key === 'traditional')!.open, false);
  assert.equal(home.find((i) => i.key === 'section:a')!.open, true);
  assert.equal(home[1].title, 'Hekate');
});

test('parts can be moved, hidden, renamed and opened, and a new section falls into place', () => {
  let layout = moveHomePart(emptyLayout(), parts, 'dreams', 'up');
  layout = moveHomePart(layout, parts, 'dreams', 'up');
  assert.deepEqual(keys(arrangeHome(layout, parts)), ['pages', 'section:a', 'dreams', 'section:b', 'myPractice', 'traditional']);
  // Can't move past the ends.
  assert.equal(moveHomePart(layout, parts, 'pages', 'up'), layout);
  layout = setPartHidden(layout, 'myPractice', true);
  assert.deepEqual(keys(arrangeHome(layout, parts)), ['pages', 'section:a', 'dreams', 'section:b', 'traditional']);
  assert.equal(arrangeHome(layout, parts, { withHidden: true }).find((i) => i.key === 'myPractice')!.hidden, true);
  layout = renamePart(layout, 'dreams', '  Night journal ', 'Dreams');
  assert.equal(arrangeHome(layout, parts).find((i) => i.key === 'dreams')!.title, 'Night journal');
  assert.deepEqual(renamePart(layout, 'dreams', 'Dreams', 'Dreams').titles, {});
  layout = setPartOpen(layout, 'traditional', true);
  assert.equal(arrangeHome(layout, parts).find((i) => i.key === 'traditional')!.open, true);
  // A section made later lands after the part before it by default.
  const more = personalParts({ sections: [section('a', 'Hekate', 0), section('b', 'Spells I use', 1), section('c', 'Moon', 2)], loose: true, shelves });
  assert.deepEqual(keys(arrangeHome(layout, more)), ['pages', 'section:a', 'dreams', 'section:b', 'section:c', 'traditional']);
  // Dragging puts a part at a place.
  assert.deepEqual(keys(arrangeHome(placeHomePart(layout, parts, 'traditional', 0), parts)).slice(0, 2), ['traditional', 'pages']);
  assert.deepEqual(resetHome(setPageSort(layout, 'az')), { ...emptyLayout(), sort: 'az' });
});

test('the layout saves as small JSON and reads back safely', () => {
  assert.equal(serializeLayout(emptyLayout()), '');
  const layout = setPageKind(setPageSort(setPartHidden(setPartOpen(emptyLayout(), 'traditional', true), 'dreams', true), 'newest'), 'spell');
  const text = serializeLayout(layout);
  assert.deepEqual(parseLayout(text), layout);
  assert.deepEqual(parseLayout('not json'), emptyLayout());
  assert.deepEqual(parseLayout({ order: ['ok', 'no spaces allowed', 3], sort: 'sideways', titles: { ok: 'Fine', bad: '' }, open: { ok: 'yes' } }), { ...emptyLayout(), order: ['ok'], titles: { ok: 'Fine' } });
  // Deleted sections are forgotten; built-in shelves are kept even when switched off.
  const pruned = forgetMissing({ ...emptyLayout(), order: ['section:gone', 'section:a', 'myPath'], open: { 'section:gone': false } }, parts);
  assert.deepEqual(pruned.order, ['section:a', 'myPath']);
  assert.deepEqual(pruned.open, {});
});

const page = (id: string, extra: Partial<PageRow> = {}): PageRow => ({
  id,
  book_id: 'bk',
  section_id: null,
  title: id,
  page_type: 'blank',
  sort_order: 0,
  metadata: {},
  created_at: '2026-01-01',
  updated_at: null,
  ...extra,
});

test('pages sort newest, oldest, A to Z or your own order, and filter by kind', () => {
  const list = [page('Moon water', { sort_order: 2, created_at: '2026-03-01', page_type: 'spell' }), page('ash', { sort_order: 0, created_at: '2026-01-05' }), page('Beltane', { sort_order: 1, created_at: '2026-05-01', page_type: 'ritual' })];
  assert.deepEqual(sortPages(list, 'custom').map((p) => p.id), ['ash', 'Beltane', 'Moon water']);
  assert.deepEqual(sortPages(list, 'newest').map((p) => p.id), ['Beltane', 'Moon water', 'ash']);
  assert.deepEqual(sortPages(list, 'oldest').map((p) => p.id), ['ash', 'Moon water', 'Beltane']);
  assert.deepEqual(sortPages(list, 'az').map((p) => p.id), ['ash', 'Beltane', 'Moon water']);
  assert.deepEqual(filterPages(list, 'spell').map((p) => p.id), ['Moon water']);
  assert.deepEqual(shownPages(list, { sort: 'az', kind: null }).length, 3);
  assert.deepEqual(pageKinds(list).map((k) => k.label), ['Pages', 'Rituals', 'Spells']);
});

test('a page can be filed in another section, at its end', () => {
  const snap: GrimoireSnapshot = { fetchedAt: '', books: [], sections: [], pages: [page('p1'), page('p2', { section_id: 's1', sort_order: 4 })], blocks: [], links: [] };
  const op = pageSectionPatch(snap, { userId: 'u', now: 'now' }, snap.pages[0], 's1');
  assert.deepEqual(op?.patch, { section_id: 's1', sort_order: 5, updated_at: 'now' });
  assert.equal(applyOps(snap, [op!]).pages[0].section_id, 's1');
  assert.equal(pageSectionPatch(snap, { userId: 'u', now: 'now' }, snap.pages[1], 's1'), null);
});
