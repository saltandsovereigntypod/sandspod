import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pictureBox } from '../src/lib/altar/flame.ts';
import { boxToPixels, displayBox, setImageRatioLookup } from '../src/lib/altar/geometry.ts';
import { dressCandle, dressingOverlays, lightCandle } from '../src/lib/altar/livingState.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import { burnDown } from '../src/lib/altar/wax.ts';
import { altarPictures, altarScene, burnPieces, burnStepTimes, GLASS_EMPTY, HERB_OVERLAY } from '../src/lib/altarWidget.ts';

const MIN = 60_000;
const HOUR = 60 * MIN;
const start = Date.UTC(2026, 9, 1, 19);
const PATH = '../assets/altar/candles/chime/pink.png';
const NOVENA = '../assets/altar/objects/candles/novena/purple-novena.png';
setImageRatioLookup((path) => (path === PATH ? 4 : path === NOVENA ? 2.6 : null));
const chime = (): SavedObject => lightCandle({ type: 'candle', label: 'Pink Candle', form: 'chime-spell', imagePath: PATH, altarObjectId: 'c1', x: '50', y: '50' }, new Date(start).toISOString());
const aspectOf = (o: SavedObject) => {
  const px = boxToPixels(displayBox(o), 1);
  return px.height / px.width;
};

test('a candle that has burned shorter goes to the widget in pieces, where the stage draws them', () => {
  const candle = chime();
  assert.equal(burnPieces(candle, aspectOf(candle), start), null, 'a fresh candle is drawn whole');
  const now = start + HOUR;
  const aspect = aspectOf(candle);
  const burn = burnPieces(candle, aspect, now)!;
  const shape = burnDown(candle, now)!;
  const pic = pictureBox(4, aspect);
  // Its top (rim and wick) set down on what is left of its body, as CandlePicture.
  const [body, cap] = burn.pieces;
  assert.ok(Math.abs(cap.crop!.y) < 1e-9 && Math.abs(cap.crop!.h - shape.capEnd) < 1e-9);
  assert.ok(Math.abs(cap.rect.y - (pic.top + burn.drop)) < 0.002, 'the top comes down by the drop');
  assert.ok(Math.abs(burn.drop / pic.height - shape.drop) <= 0.011, `drawn in steps: ${burn.drop / pic.height} vs ${shape.drop}`);
  assert.ok(Math.abs(body.rect.y - (cap.rect.y + cap.rect.h)) < 1e-9, 'the body meets the top');
  assert.ok(Math.abs(body.rect.y + body.rect.h - (pic.top + pic.height)) < 0.002, 'and stands where the candle stood');
  assert.ok(Math.abs(body.rect.x - pic.left) < 0.002 && Math.abs(body.rect.w - pic.width) < 0.002);
});

test('the widget draws the pieces once they are made, the flame on what is left, and dressings only on wax', () => {
  const candle = dressCandle(chime(), { type: 'herb', label: 'Rosemary', form: 'loose', altarObjectId: 'h1' }, new Date(start).toISOString());
  assert.ok(dressingOverlays(candle).herb, 'dressed with loose herb');
  const now = start + 90 * MIN;
  const before = altarScene([candle], () => '', now)[0];
  assert.ok(!before.burned, 'without its pieces yet, the whole picture still shows');
  const made = (id: string) => `file:///${id}`;
  const item = altarScene([candle], made, now)[0];
  const whole = altarScene([candle], made)[0];
  assert.equal(item.burned, true);
  assert.equal(item.image, '');
  assert.ok(item.flame!.y > whole.flame!.y, 'the flame comes down with the top');
  const herb = item.overlays.filter((o) => o.image.includes(HERB_OVERLAY));
  assert.equal(herb.length, 1);
  assert.ok(herb[0].image.includes('#burn:'), 'the herb is cut to the wax left');
});

test('the timeline steps down with the candle, and not at all for one that is out', () => {
  const altar = { id: 'a', name: 'A', objects: [chime()] } as never;
  const steps = burnStepTimes([altar], new Date(start), 12, 24);
  assert.ok(steps.length > 5 && steps.length <= 24, `steps: ${steps.length}`);
  assert.ok(steps.every((t, i) => i === 0 || t > steps[i - 1]));
  const out = { id: 'b', name: 'B', objects: [{ ...chime(), lit: 'false' }] } as never;
  assert.deepEqual(burnStepTimes([out], new Date(start)), []);
});

test('a candle in glass stays whole on the widget, with the glass above its sunken wax empty', () => {
  const lit = new Date(start).toISOString();
  const novena: SavedObject = lightCandle({ type: 'candle', label: 'Purple Novena', form: 'novena', imagePath: NOVENA, altarObjectId: 'n1', x: '50', y: '50' }, lit);
  const now = start + 4 * 24 * HOUR;
  const aspect = aspectOf(novena);
  const burn = burnPieces(novena, aspect, now)!;
  assert.equal(burn.whole, true);
  const [glass] = burn.pieces;
  assert.equal(glass.path, GLASS_EMPTY);
  const pic = pictureBox(2.6, aspect);
  const shape = burnDown(novena, now)!;
  assert.ok(Math.abs(glass.rect.y + glass.rect.h - (pic.top + shape.waxTop * pic.height)) < 0.012, 'down to the wax');
  assert.ok(Math.abs(glass.stretch! - (glass.rect.h * aspect) / glass.rect.w) < 0.002, 'its picture is made to the shape it is drawn');
  const item = altarScene([novena], (id) => `file:///${id}`, now)[0];
  assert.equal(item.image, `file:///${NOVENA}`, 'the candle itself is still drawn');
  assert.ok(item.overlays.some((o) => o.image.includes(GLASS_EMPTY)));
  const altar = { id: 'a', name: 'A', objects: [novena] } as never;
  const made = altarPictures(altar, 3, now).find((p) => p.path === GLASS_EMPTY)!;
  assert.ok(made.height! > 0 && made.alpha);
});
