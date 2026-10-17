import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { objectsLinkedTo, pageChoices, pageLinkOf, resolvePageLink, withoutPageLink, withPageLink } from '../src/lib/altar/connect/grimoire.ts';
import {
  availableLookBacks,
  lookBack,
  sceneSignature,
  snapshotDue,
  snapshotObjects,
  snapshotsToPrune,
  timeline,
  type HistoryEntry,
} from '../src/lib/altar/connect/history.ts';
import { cardFileName, composeScene, composeShareCard, moonPath } from '../src/lib/altar/connect/shareCard.ts';
import { appHistoryOf, lightCandle } from '../src/lib/altar/livingState.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import type { GrimoireSnapshot } from '../src/lib/grimoire/types.ts';

const NOW = new Date(2026, 9, 16, 21);
const iso = NOW.toISOString();
const DAY = 86_400_000;
const place = (id: string, form?: string, cx = 0.5): SavedObject => {
  const item = builtInCabinet.find((i) => i.id === id)!;
  return objectFromForm(item, form ? item.forms.find((f) => f.form === form)! : item.forms.find((f) => !!f.image)!, [], iso, {}, { cx, cy: 0.6 });
};

const grimoire: GrimoireSnapshot = {
  fetchedAt: iso,
  books: [{ id: 'b', title: 'Book', created_at: null, updated_at: null }],
  sections: [{ id: 's1', book_id: 'b', title: 'Herbs', sort_order: 0, created_at: null }],
  pages: [
    { id: 'p1', book_id: 'b', section_id: null, title: 'Full moon notes', page_type: 'blank', sort_order: 0, metadata: null, created_at: null, updated_at: null },
    { id: 'p2', book_id: 'b', section_id: 's1', title: 'Rosemary lore', page_type: 'blank', sort_order: 1, metadata: null, created_at: null, updated_at: null },
  ],
  blocks: [],
  links: [],
};

test('any object can link to a Book of Shadows page through livingState.app.pageId', () => {
  const sprig = place('herbs:rosemary', 'sprig');
  const linked = withPageLink(sprig, { id: 'p2', title: 'Rosemary lore' }, iso);
  assert.deepEqual(pageLinkOf(linked), { pageId: 'p2', title: 'Rosemary lore' });
  assert.match(appHistoryOf(linked).at(-1)!.text, /Rosemary lore/);
  assert.equal(withPageLink(linked, { id: 'p2', title: 'Rosemary lore' }, iso), linked);
  assert.deepEqual(resolvePageLink(pageLinkOf(linked), grimoire), { title: 'Rosemary lore', exists: true });
  assert.equal(resolvePageLink({ pageId: 'gone', title: 'Old' }, grimoire)!.exists, false);
  assert.equal(resolvePageLink(pageLinkOf(linked), null)!.exists, null);
  assert.equal(pageLinkOf(withoutPageLink(linked, iso)), null);
  assert.deepEqual(objectsLinkedTo([sprig, linked], 'p2'), [linked]);

  const choices = pageChoices(grimoire, 'Rosemary Sprig');
  assert.equal(choices[0].id, 'p2');
  assert.equal(choices[0].suggested, true);
  assert.equal(choices[0].section, 'Herbs');
  assert.deepEqual(pageChoices(grimoire, '', 'moon').map((c) => c.id), ['p1']);
});

const entry = (id: string, data: unknown): HistoryEntry => ({ id, createdAt: iso, data: data as HistoryEntry['data'] });

test('snapshots are taken at most once a day, and only when the altar changed', () => {
  const objects = [place('candles:white-candle', 'taper', 0.4), place('crystals:amethyst', undefined, 0.6)];
  const altar = { id: 'a1', name: 'Hearth', background: '', objects };
  const first = snapshotDue([], altar, NOW)!;
  assert.equal(first.kind, 'snapshot');
  assert.equal(first.objects.length, 2);
  assert.equal((first.objects[0] as SavedObject).livingState, undefined, 'living state is left out');
  assert.equal(first.summary, '2 things');
  const list = [entry('h1', first)];
  assert.equal(snapshotDue(list, { ...altar, objects: [objects[0]] }, new Date(NOW.getTime() + 3600_000)), null, 'same day');
  assert.equal(snapshotDue(list, altar, new Date(NOW.getTime() + DAY)), null, 'unchanged');
  const lit = [lightCandle(objects[0], iso), objects[1]];
  assert.notEqual(sceneSignature(lit, ''), sceneSignature(objects, ''));
  const next = snapshotDue(list, { ...altar, objects: lit }, new Date(NOW.getTime() + DAY))!;
  assert.equal(next.summary, '2 things · 1 candle lit');
  assert.equal(snapshotDue([], { ...altar, objects: [] }, NOW), null, 'a bare new altar waits');
});

test('look back a month, a season or a year, and see the timeline', () => {
  const objects = [place('candles:white-candle', 'taper')];
  const at = (daysAgo: number) => new Date(NOW.getTime() - daysAgo * DAY);
  const snaps = [3, 29, 40, 95, 360, 700].map((d, i) => entry(`s${i}`, { ...snapshotDue([], { id: 'a1', name: 'Hearth', background: '', objects: objects.map((o) => ({ ...o, label: `v${i}` })) }, at(d))! }));
  const lines = [entry('l1', { altarId: 'a1', text: 'The bay sprig was returned to nature.', at: at(1).toISOString() }), entry('l2', { altarId: 'other', text: 'x', at: iso })];
  const all = [...snaps, ...lines];
  assert.equal(lookBack(all, 'a1', 'month', NOW)!.id, 's1');
  assert.equal(lookBack(all, 'a1', 'season', NOW)!.id, 's3');
  assert.equal(lookBack(all, 'a1', 'year', NOW)!.id, 's4');
  assert.equal(lookBack(all, 'a1', 'week', NOW), null);
  assert.deepEqual(availableLookBacks(all, 'a1', NOW).map((l) => l.id), ['month', 'season', 'year']);
  const items = timeline(all, 'a1');
  assert.equal(items.length, 7);
  assert.equal(items[0].kind, 'line');
  assert.equal(items[1].id, 's0');
  assert.equal(snapshotObjects(snaps[0].data as never).length, 1);
});

test('old snapshots thin out to one a week, then one a month', () => {
  const objects = [place('candles:white-candle', 'taper')];
  const at = (daysAgo: number) => new Date(NOW.getTime() - daysAgo * DAY);
  const days = [1, 2, 3, 100, 101, 102, 500, 510];
  const list = days.map((d, i) => entry(`s${i}`, snapshotDue([], { id: 'a1', name: 'H', background: '', objects: objects.map((o) => ({ ...o, label: `v${i}` })) }, at(d))!));
  const drop = snapshotsToPrune(list, 'a1', NOW);
  assert.ok(!drop.includes('s0') && !drop.includes('s1') && !drop.includes('s2'), 'recent days are kept');
  assert.ok(drop.length >= 2, 'older ones in one week or month are thinned');
});

test('the share card lays the altar out with its name, moon and date', () => {
  const candle = lightCandle(place('candles:white-candle', 'taper', 0.45), iso);
  const objects: SavedObject[] = [candle, place('crystals:amethyst', undefined, 0.55), { label: 'Rune', fallbackSymbol: 'ᛉ', type: 'tool', leftPercent: 0.5, topPercent: 0.7, sizePercent: 0.05, altarObjectId: 'r1' }];
  const card = composeShareCard({ name: 'Hearth', objects, background: '', at: NOW });
  assert.equal(card.width, 1080);
  assert.equal(card.height, 1350);
  assert.equal(card.panelY, 1080);
  assert.equal(card.items.length, 3);
  assert.ok(card.items[0].flame, 'a lit candle has a flame');
  assert.equal(card.pools.length, 1);
  assert.equal(card.items[2].symbol, 'ᛉ');
  assert.match(card.line, /Moon|Crescent|Quarter|Gibbous/);
  assert.match(card.line, /October 16, 2026/);
  // The background covers the whole scene.
  const bg = card.background.rect;
  assert.ok(bg.x <= 0 && bg.y <= 0 && bg.x + bg.w >= 1080 && bg.y + bg.h >= 1080);
  // Everything sits inside the picture.
  for (const item of card.items) assert.ok(item.rect.x >= -1 && item.rect.x + item.rect.w <= 1081, item.key);
  const thumb = composeScene(objects, '', { width: 160, height: 90 });
  assert.equal(thumb.width, 160);
  assert.equal(cardFileName('My Hearth & Home!', NOW), 'altar-my-hearth-home-2026-10-16.png');
  assert.equal(moonPath(10, 10, 5, 0, true), '');
  assert.match(moonPath(10, 10, 5, 0.6, true), /^M 10 5 A 5 5 0 0 1 10 15/);
});
