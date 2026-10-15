import assert from 'node:assert/strict';
import { test } from 'node:test';

import { offeringsOf } from '../src/lib/altar/devotion.ts';
import { isLit, readLivingState } from '../src/lib/altar/livingState.ts';
import { documentFromAltar } from '../src/lib/altar/snapshot.ts';
import type { SavedAltar } from '../src/lib/altar/types.ts';
import { boxToPixels, displayBox } from '../src/lib/altar/geometry.ts';
import { altarPictures, applyWidgetActions, chooseSlot, slotAltars, WIDGET_VIEWS, widgetAltar, type WidgetAction } from '../src/lib/altarWidget.ts';

const altar = (id: string, updatedAt: string, objects: SavedAltar['objects'] = []): SavedAltar => ({
  id,
  name: `Altar ${id}`,
  updatedAt,
  background: '../assets/altar/backgrounds/candlelit-cave.png',
  objects,
});

const hearth = altar('hearth', '2026-10-10T00:00:00Z', [
  { type: 'candle', label: 'Red Candle', color: 'red', altarObjectId: 'c1', imagePath: '../assets/altar/objects/candles/red-candle.png' },
  { type: 'candle', label: 'White Candle', color: 'white', altarObjectId: 'c2', lit: 'true', livingState: JSON.stringify({ candle: { currentBurnStartedAt: '2026-10-15T18:00:00.000Z' } }) },
  { type: 'deity', label: 'Hecate', altarObjectId: 'd1' },
  { type: 'crystal', label: 'Amethyst', altarObjectId: 'x1' },
  { type: 'herb', label: 'Rosemary', altarObjectId: 'h1' },
]);

test('the widget sees the candles, presences and crystals, with pictures', () => {
  const shown = widgetAltar(hearth, (path) => `file:///w/${path.split('/').pop()}`, new Date('2026-10-15T20:00:00Z'));
  assert.equal(shown.name, 'Altar hearth');
  assert.equal(shown.background, 'file:///w/candlelit-cave.png');
  assert.equal(shown.items, 5);
  assert.deepEqual(
    shown.candles.map((c) => [c.key, c.lit, c.since, c.color]),
    [
      ['c1', false, '', '#c8433a'],
      ['c2', true, '2026-10-15T18:00:00.000Z', '#f4ecd8'],
    ],
  );
  assert.equal(shown.candles[0].image, 'file:///w/red-candle.png');
  assert.deepEqual(shown.presences.map((p) => [p.key, p.label, p.lastOffering]), [['d1', 'Hecate', '']]);
  assert.deepEqual(shown.crystals.map((c) => c.label), ['Amethyst']);
});

test('places: chosen altars first, then the most recent', () => {
  const older = altar('older', '2026-01-01T00:00:00Z');
  const newer = altar('newer', '2026-09-01T00:00:00Z');
  assert.deepEqual(slotAltars([older, hearth, newer], []).map((a) => a.id), ['hearth', 'newer', 'older']);
  assert.deepEqual(slotAltars([older, hearth, newer], ['older']).map((a) => a.id), ['older', 'hearth', 'newer']);
  assert.deepEqual(slotAltars([older, hearth], [null, null, 'older']).map((a) => a.id), ['hearth', 'older']);
  // Moving an altar empties its old place; 0 takes it off.
  assert.deepEqual(chooseSlot(['a', null, null, null, null, null], 'a', 3), [null, null, 'a', null, null, null]);
  assert.deepEqual(chooseSlot(['a', 'b', null, null, null, null], 'a', 0), [null, 'b', null, null, null, null]);
});

test('taps on the widget are carried out on the real altar', () => {
  const at = '2026-10-15T21:00:00.000Z';
  const actions: WidgetAction[] = [
    { id: '1', altarId: 'hearth', kind: 'light', key: '', at },
    { id: '2', altarId: 'hearth', kind: 'offer', key: 'd1', at },
    { id: '3', altarId: 'hearth', kind: 'cleanse', key: '', at },
    { id: '4', altarId: 'gone', kind: 'light', key: '', at },
  ];
  const changed = applyWidgetActions([hearth], actions, at);
  assert.equal(changed.length, 1);
  const objects = changed[0].doc.objects;
  assert.ok(objects.filter((o) => o.type === 'candle').every(isLit));
  assert.equal(readLivingState(objects[0], at).candle?.currentBurnStartedAt, at);
  // The candle already burning keeps its start.
  assert.equal(readLivingState(objects[1], at).candle?.currentBurnStartedAt, '2026-10-15T18:00:00.000Z');
  const offerings = offeringsOf(objects[2], at);
  assert.equal(offerings.length, 1);
  assert.equal(offerings[0].occurredAt, at);
  assert.equal((readLivingState(objects[3], at).crystal as Record<string, unknown>).lastCleansedAt, at);
  // Nothing else on the altar is touched.
  assert.deepEqual(objects[4], documentFromAltar(hearth).objects[4]);
});

test('snuffing one candle records its burn and leaves the other alone', () => {
  const at = '2026-10-15T20:00:00.000Z';
  const changed = applyWidgetActions([hearth], [{ id: '1', altarId: 'hearth', kind: 'snuff', key: 'c2', at }], at);
  const [red, white] = changed[0].doc.objects;
  assert.equal(isLit(white), false);
  assert.equal(readLivingState(white, at).candle?.totalBurnMs, 2 * 3600_000);
  assert.equal(red, documentFromAltar(hearth).objects[0]);
  // Snuffing what's already out changes nothing at all.
  assert.deepEqual(applyWidgetActions([hearth], [{ id: '2', altarId: 'hearth', kind: 'snuff', key: 'c1', at }], at), []);
});

test('the scene draws each object where the app does, back to front', () => {
  const shown = widgetAltar(hearth, (path) => `file:///w/${path.split('/').pop()}`, new Date('2026-10-15T20:00:00Z'));
  // Only objects with a picture are drawn.
  assert.deepEqual(shown.scene.map((s) => s.key), ['c1']);
  const red = shown.scene[0];
  assert.equal(red.candle, true);
  assert.equal(red.lit, false);
  assert.ok(red.flame && red.halo && red.pool);
  assert.equal(red.image, 'file:///w/red-candle.png');
  const box = boxToPixels(displayBox(hearth.objects![0]), 1);
  assert.deepEqual(red.box, { x: box.left, y: box.top, w: box.width, h: box.height });
  for (const size of ['small', 'medium', 'large'] as const) {
    const frame = shown.frames[size];
    assert.ok(frame.W >= WIDGET_VIEWS[size].w, size);
    assert.ok(frame.ox >= 0 && frame.oy >= 0, size);
    assert.match(frame.background, /^file:\/\/\/w\//);
  }
});

test('pictures: a cut of the background per widget size, objects sized to show sharply', () => {
  const pictures = altarPictures(hearth);
  const cuts = pictures.filter((p) => p.crop);
  assert.equal(cuts.length, 3);
  for (const cut of cuts) {
    assert.ok(cut.crop!.x >= 0 && cut.crop!.y >= 0 && cut.crop!.x + cut.crop!.w <= 1.0001 && cut.crop!.y + cut.crop!.h <= 1.0001, JSON.stringify(cut.crop));
  }
  assert.ok(pictures.every((p) => p.width >= 48 && p.width <= 1092));
  assert.ok(pictures.some((p) => p.path.endsWith('red-candle.png')));
});
