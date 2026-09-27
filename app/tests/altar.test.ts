import assert from 'node:assert/strict';
import { test } from 'node:test';

import { websiteAssetKey, websiteAssetUrl } from '../src/lib/altar/assetPaths.ts';
import { builtInCabinet, formObjectLabel, objectFromForm, overrideKey, placeableForms } from '../src/lib/altar/cabinet.ts';
import { changeLayer, moveObject, resizeObject, rotateObject, toggleLight } from '../src/lib/altar/editor.ts';
import {
  boxAspect,
  boxFromSaved,
  setImageRatioLookup,
  boxToPixels,
  clampBox,
  displayBox,
  hitTest,
  NEW_OBJECT_SIZE,
  savedFromBox,
  STAGE_ASPECT,
  withCenter,
  withSize,
} from '../src/lib/altar/geometry.ts';
import { moveLayer, nextLayer, stackOrder } from '../src/lib/altar/layers.ts';
import { dressCandle, dressingOverlays, lightCandle, parseLivingState, snuffCandle } from '../src/lib/altar/livingState.ts';
import { altarDataFromDocument, altarFromRow, documentFromAltar, parseLocalAltars } from '../src/lib/altar/snapshot.ts';
import type { AltarData, SavedObject } from '../src/lib/altar/types.ts';

const close = (actual: number, expected: number, message?: string) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${message ?? ''} expected ${expected}, got ${actual}`);

// ---------- A faithful model of the website's DOM maths (storage.js / objects.js) ----------

/**
 * applyStagePositionPercent + keepObjectInsideStage: returns style.left/top
 * (the visual centre) and the visual size in px, for a button whose
 * offsetHeight is `offsetHeight` (offsetWidth is always 80).
 */
function websiteLoad(saved: SavedObject, stageWidth: number, offsetHeight = 80) {
  const stageHeight = stageWidth / STAGE_ASPECT;
  const scale = ((saved.sizePercent as number) * stageWidth) / 80;
  const width = 80 * scale;
  const height = offsetHeight * scale;
  let left = (saved.leftPercent as number) * stageWidth - width / 2;
  let top = (saved.topPercent as number) * stageHeight - height / 2;
  left = Math.max(width / 2, Math.min(left, stageWidth - width / 2));
  top = Math.max(height / 2, Math.min(top, stageHeight - height / 2));
  return { left, top, width, height };
}

/** getStagePositionPercent */
function websiteSave(left: number, top: number, width: number, height: number, stageWidth: number) {
  const stageHeight = stageWidth / STAGE_ASPECT;
  return {
    leftPercent: (left + width / 2) / stageWidth,
    topPercent: (top + height / 2) / stageHeight,
    sizePercent: width / stageWidth,
  };
}

// Natural sizes of the website's artwork used below.
const ratios: Record<string, number> = {
  'candle.png': 1536 / 500,
  'statue.png': 1536 / 1024,
  'sprig.png': 800 / 400,
  'key.png': 400 / 800,
};
setImageRatioLookup((path) => {
  const match = Object.keys(ratios).find((suffix) => path.endsWith(suffix));
  return match ? ratios[match] : null;
});

// A real object from saved_altars (the Lilith statue), positions only.
const lilith: SavedObject = {
  imagePath: '../assets/altar/objects/tools/deities/lilith/lilith-statue.png',
  type: 'deity',
  scale: '0.8044444444444444',
  rotation: '0',
  leftPercent: 0.6360650715162676,
  topPercent: 0.39277641441441435,
  sizePercent: 0.08888888888888889,
  zIndex: '19',
};

test('object boxes are as tall as the website’s buttons (measured in Chromium)', () => {
  assert.equal(boxAspect(1536 / 500) * 80, 211); // vigil candle
  assert.equal(boxAspect(1536 / 1024) * 80, 104); // deity statue
  assert.equal(boxAspect(800 / 400) * 80, 138); // herb sprig
  assert.equal(boxAspect(400 / 800) * 80, 80); // key: never shorter than square
  assert.equal(boxAspect(null), 1);
});

test('an object lands on the same spot of the altar at any stage width', () => {
  for (const width of [1400, 724, 390, 343]) {
    const web = websiteLoad(lilith, width, 104);
    const app = boxToPixels(displayBox(lilith), width);
    close(app.centerX, web.left, `centre x at ${width}px`);
    close(app.centerY, web.top, `centre y at ${width}px`);
    close(app.width, web.width, `width at ${width}px`);
    close(app.height, web.height, `height at ${width}px`);
  }
});

test('positions match what the website drew for a real saved altar', () => {
  // style.left / style.top read from the website's DOM on an 866px stage.
  const measured = [
    { object: { imagePath: 'red-candle.png', leftPercent: 0.5528201075223119, topPercent: 0.38125317180117185, sizePercent: 0.03272418189545265 }, left: 464.573, top: 148.298 },
    { object: { imagePath: 'lilith-statue.png', leftPercent: 0.6360650715162676, topPercent: 0.39277641441441435, sizePercent: 0.08888888888888889 }, left: 512.343, top: 141.247 },
    { object: { imagePath: 'cedar-sprig.png', leftPercent: 0.51323153422345, topPercent: 0.4142089047229048, sizePercent: 0.044689993861264585 }, left: 425.108, top: 168.34 },
    { object: { imagePath: 'key.png', leftPercent: 0.2, topPercent: 0.7, sizePercent: 0.2 }, left: 86.6, top: 254.3 },
  ];
  for (const { object, left, top } of measured) {
    const px = boxToPixels(displayBox(object), 866);
    assert.ok(Math.abs(px.centerX - left) < 0.25, `${object.imagePath} x ${px.centerX} vs ${left}`);
    assert.ok(Math.abs(px.centerY - top) < 0.25, `${object.imagePath} y ${px.centerY} vs ${top}`);
  }
});

test('the app writes back exactly what the website would save for the same picture', () => {
  const moved = withCenter(lilith, 0.3, 0.6);
  const px = boxToPixels(displayBox(moved), 724);
  const website = websiteSave(px.centerX, px.centerY, px.width, px.height, 724);
  close(moved.leftPercent!, website.leftPercent);
  close(moved.topPercent!, website.topPercent);
  close(moved.sizePercent!, website.sizePercent);
  // And the website puts it where the app showed it.
  const back = websiteLoad(moved, 390, 104);
  close(back.left / 390, 0.3);
  close(back.top / (390 / STAGE_ASPECT), 0.6);
});

test('box and saved fields convert both ways', () => {
  const box = boxFromSaved(lilith);
  close(box.cx, lilith.leftPercent! - lilith.sizePercent! / 2);
  close(box.cy, lilith.topPercent! - (lilith.sizePercent! * (104 / 80) * STAGE_ASPECT) / 2);
  const saved = savedFromBox(box);
  close(saved.leftPercent!, lilith.leftPercent!);
  close(saved.topPercent!, lilith.topPercent!);
  close(saved.sizePercent!, lilith.sizePercent!);
});

test('saves without sizePercent fall back to scale on the website’s 900px reference', () => {
  const box = boxFromSaved({ scale: '1.5', leftPercent: 0.5, topPercent: 0.5 });
  close(box.size, (80 * 1.5) / 900);
});

test('objects are kept inside the stage, cloths may hang off the edge', () => {
  const size = 0.1;
  const inside = clampBox({ cx: 0.99, cy: -0.2, size, aspect: 2 }, 'candle');
  close(inside.cx, 1 - size / 2);
  close(inside.cy, (size * 2 * STAGE_ASPECT) / 2);
  const cloth = clampBox({ cx: 1.2, cy: 0.5, size: 0.6, aspect: 1 }, 'cloth');
  close(cloth.cx, 1 - 0.6 * 0.25);
  assert.deepEqual(clampBox({ cx: 1.2, cy: 0.5, size: 0.6, aspect: 1 }, 'cloth', 'load'), { cx: 1.2, cy: 0.5, size: 0.6, aspect: 1 });
});

test('resizing keeps the centre and scales the website’s scale field in proportion', () => {
  const bigger = withSize(lilith, lilith.sizePercent! * 1.5);
  const before = displayBox(lilith);
  const after = displayBox(bigger);
  close(after.cx, before.cx);
  close(after.cy, before.cy);
  close(after.size, lilith.sizePercent! * 1.5);
  close(Number(bigger.scale), 0.8044444444444444 * 1.5);
  // The website's scale limits (0.35 to 3 at the reference width) still apply.
  close(withSize(lilith, 5).sizePercent!, (80 * 3) / 900);
});

test('hit testing finds the topmost object and respects rotation', () => {
  const a: SavedObject = { ...savedFromBox({ cx: 0.5, cy: 0.5, size: 0.2, aspect: 1 }), zIndex: '10', rotation: '0' };
  const b: SavedObject = { ...savedFromBox({ cx: 0.55, cy: 0.5, size: 0.2, aspect: 1 }), zIndex: '11', rotation: '0' };
  const entries = [{ object: a, id: 'a' }, { object: b, id: 'b' }];
  const ordered = stackOrder([a, b]).map((i) => entries[i]);
  const width = 400;
  const height = width / STAGE_ASPECT;
  assert.equal(hitTest(ordered, 0.52 * width, 0.5 * height, width)?.id, 'b');
  assert.equal(hitTest(ordered, 0.42 * width, 0.5 * height, width)?.id, 'a');
  assert.equal(hitTest(ordered, 0.05 * width, 0.05 * height, width), null);

  // A thin corner point of a 45° square is outside once rotated.
  const diamond: SavedObject = { ...savedFromBox({ cx: 0.5, cy: 0.5, size: 0.2, aspect: 1 }), rotation: '45' };
  const corner = { x: 0.5 * width + 0.095 * width, y: 0.5 * height + 0.095 * width };
  assert.equal(hitTest([{ object: diamond }], corner.x, corner.y, width), null);
  assert.ok(hitTest([{ object: { ...diamond, rotation: '0' } }], corner.x, corner.y, width));
});

// ---------- Layers ----------

test('layer order follows z-index, then order in the save', () => {
  const objects: SavedObject[] = [{ zIndex: '12' }, { zIndex: '10' }, { zIndex: '12' }, {}];
  assert.deepEqual(stackOrder(objects), [1, 3, 0, 2]);
  assert.equal(nextLayer(objects), 13);
  assert.equal(nextLayer([]), 11);
});

test('moving layers rewrites z-index without reordering the save', () => {
  const objects: SavedObject[] = [{ label: 'a', zIndex: '11' }, { label: 'b', zIndex: '15' }, { label: 'c', zIndex: '12' }];
  const front = moveLayer(objects, 0, 'front');
  assert.deepEqual(front.map((o) => o.label), ['a', 'b', 'c']);
  assert.deepEqual(stackOrder(front), [2, 1, 0]);
  const back = moveLayer(objects, 1, 'back');
  assert.deepEqual(stackOrder(back), [1, 0, 2]);
  const forward = moveLayer(objects, 0, 'forward');
  assert.deepEqual(stackOrder(forward), [2, 0, 1]);
  assert.equal(moveLayer(objects, 1, 'front'), objects, 'already on top: unchanged');
});

// ---------- Saved altar JSON ----------

const realishAltar: AltarData = {
  name: 'Moon Altar',
  savedAt: '2026-07-30T00:34:20.000Z',
  background: '/assets/altar/backgrounds/shelf-deity-altar.png',
  backgroundName: 'Deity Shelf Altar',
  groups: [],
  activeGroupId: null,
  futureTopLevelField: { keep: true },
  objects: [
    {
      imagePath: '../assets/altar/objects/candles/black-candle.PNG',
      label: 'Black Candle Vigil Candle',
      type: 'candle',
      form: 'vigil',
      color: 'black',
      scale: '0.7792614671303196',
      rotation: '0',
      flipped: 'false',
      locked: 'false',
      glowing: 'false',
      lit: 'false',
      livingState: JSON.stringify({
        version: 2,
        candle: { version: 2, form: 'vigil', expectedBurnMs: 604800000, firstLitAt: '', totalBurnMs: 0, currentBurnStartedAt: '', lastLitAt: '', burnHistory: [], dressings: [] },
        crystal: { dedication: '' },
      }),
      altarObjectId: 'obj-1',
      groupId: '',
      leftPercent: 0.5599172260584393,
      topPercent: 0.7805731691836837,
      sizePercent: 0.09290747745219906,
      zIndex: '18',
      ritualIncluded: 'false',
    },
  ],
};

test('an altar opened and saved unchanged is identical, unknown fields included', () => {
  const doc = documentFromAltar(realishAltar);
  const out = altarDataFromDocument(doc, 'Moon Altar', realishAltar.savedAt!);
  assert.deepEqual(JSON.parse(JSON.stringify(out)), JSON.parse(JSON.stringify(realishAltar)));
});

test('cloud rows read like the website’s getSavedAltars and never write row fields back', () => {
  const altar = altarFromRow({
    id: 'row-1',
    name: 'Renamed on the website',
    altar_data: realishAltar,
    created_at: '2026-07-30T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
  });
  assert.equal(altar.id, 'row-1');
  assert.equal(altar.name, 'Renamed on the website');
  assert.equal(altar.updatedAt, '2026-08-01T00:00:00Z');
  const out = altarDataFromDocument(documentFromAltar(altar), altar.name, 'now');
  assert.equal('id' in out, false);
  assert.equal('updatedAt' in out, false);
  assert.deepEqual(out.futureTopLevelField, { keep: true });
});

test('guest saves parse from an array or a single saved altar', () => {
  assert.equal(parseLocalAltars(JSON.stringify([{ id: 'a' }, { id: 'b' }])).length, 2);
  assert.equal(parseLocalAltars(JSON.stringify({ id: 'a' })).length, 1);
  assert.deepEqual(parseLocalAltars('not json'), []);
});

// ---------- Candles ----------

test('lighting and snuffing records the burn and keeps newer state fields', () => {
  const candle = realishAltar.objects![0];
  const lit = lightCandle(candle, '2026-09-01T20:00:00.000Z');
  assert.equal(lit.lit, 'true');
  const litState = parseLivingState(lit)!;
  assert.equal(litState.candle!.currentBurnStartedAt, '2026-09-01T20:00:00.000Z');
  assert.equal(litState.candle!.firstLitAt, '2026-09-01T20:00:00.000Z');
  assert.equal(litState.candle!.expectedBurnMs, 604800000, 'v2 candle fields survive');
  assert.equal(litState.version, 2, 'state version is not downgraded');

  const snuffed = snuffCandle(lit, '2026-09-01T20:30:00.000Z');
  const state = parseLivingState(snuffed)!;
  assert.equal(snuffed.lit, 'false');
  assert.equal(state.candle!.currentBurnStartedAt, '');
  assert.equal(state.candle!.totalBurnMs, 30 * 60 * 1000);
  assert.deepEqual(state.candle!.burnHistory, [
    { startedAt: '2026-09-01T20:00:00.000Z', endedAt: '2026-09-01T20:30:00.000Z', durationMs: 1800000 },
  ]);
});

test('only candles light', () => {
  const doc = documentFromAltar({ objects: [{ type: 'crystal', lit: 'false' }] });
  assert.equal(toggleLight(doc, 0, 'now'), doc);
});

test('candles take loose herb and oil dressings once each, shown as overlays', () => {
  const candle: SavedObject = { type: 'candle', livingState: '' };
  const loose: SavedObject = { type: 'herb', herb: 'lavender', form: 'loose', label: 'Lavender Loose' };
  const oil: SavedObject = { type: 'oil', herb: 'basil', form: 'oil', label: 'Basil Oil' };
  const sprig: SavedObject = { type: 'herb', herb: 'basil', form: 'sprig' };
  let dressed = dressCandle(candle, loose, 't1');
  dressed = dressCandle(dressed, loose, 't2');
  assert.deepEqual(dressingOverlays(dressed), { herb: true, oil: false });
  assert.equal(dressCandle(dressed, sprig, 't3'), dressed, 'sprigs cannot dress');
  dressed = dressCandle(dressed, oil, 't4');
  assert.deepEqual(dressingOverlays(dressed), { herb: true, oil: true });
  assert.equal(parseLivingState(dressed)!.candle!.dressings!.length, 2);
});

// ---------- Cabinet and placing ----------

test('the cabinet offers only forms the website has artwork for', () => {
  const red = builtInCabinet.find((item) => item.id === 'candles:red-candle')!;
  const forms = placeableForms(red);
  assert.deepEqual(forms.map((f) => f.form), ['vigil']);
  assert.equal(formObjectLabel(red, forms[0]), 'Red Candle Vigil Candle');
  const sage = builtInCabinet.find((item) => item.id === 'herbs:sage')!;
  assert.deepEqual(placeableForms(sage).map((f) => f.form), ['incense']);
  // A person's own image for a form makes it placeable, keyed like the website.
  const key = overrideKey(red, red.forms[0]);
  assert.equal(key, 'candle||chime-spell|red|||||Red Candle Chime / Spell Candle');
  assert.equal(placeableForms(red, { [key]: 'https://x/y.png' }).length, 2);
});

test('a placed object has the website’s fields, size and layer', () => {
  const key = builtInCabinet.find((item) => item.name === 'Key')!;
  const existing: SavedObject[] = [{ zIndex: '19' }];
  const placed = objectFromForm(key, key.forms[0], existing, '2026-09-01T00:00:00.000Z');
  const websiteKeys = Object.keys(realishAltar.objects![0]).filter((k) => k !== 'ritualIncluded');
  for (const k of websiteKeys) assert.ok(k in placed, `has ${k}`);
  assert.equal(placed.imagePath, '../assets/altar/objects/tools/key/key.png');
  assert.equal(placed.label, 'Key');
  assert.equal(placed.zIndex, '20');
  assert.ok(placed.altarObjectId);
  assert.equal(parseLivingState(placed)!.version, 1);
  const box = displayBox(placed);
  close(box.cx, 0.5);
  close(box.cy, 0.5);
  close(box.size, NEW_OBJECT_SIZE);
});

// ---------- Editing ----------

test('dragging a grouped object moves its group; locked objects stay', () => {
  const at = (cx: number, cy: number, extra: Partial<SavedObject> = {}): SavedObject => ({
    ...savedFromBox({ cx, cy, size: 0.1, aspect: 1 }),
    ...extra,
  });
  const doc = documentFromAltar({
    objects: [at(0.3, 0.5, { groupId: 'g' }), at(0.4, 0.5, { groupId: 'g' }), at(0.6, 0.5), at(0.2, 0.5, { groupId: 'g', locked: 'true' })],
  });
  const moved = moveObject(doc, 0, 0.35, 0.55);
  close(displayBox(moved.objects[0]).cx, 0.35);
  close(displayBox(moved.objects[1]).cx, 0.45);
  close(displayBox(moved.objects[1]).cy, 0.55);
  assert.equal(moved.objects[2], doc.objects[2]);
  assert.equal(moved.objects[3], doc.objects[3]);
  assert.equal(moveObject(moved, 3, 0.9, 0.9), moved);
});

test('saved image paths map to website asset keys', () => {
  assert.equal(websiteAssetKey('../assets/altar/objects/tools/key/key.png'), 'assets/altar/objects/tools/key/key.png');
  assert.equal(websiteAssetKey('/assets/altar/backgrounds/forest-scene.png'), 'assets/altar/backgrounds/forest-scene.png');
  assert.equal(websiteAssetKey('https://saltandsovereignty.com/assets/altar/x.png?v=2'), 'assets/altar/x.png');
  assert.equal(websiteAssetKey('https://abc.supabase.co/storage/v1/object/public/user-assets/u/cabinet/1.png'), null);
  assert.equal(websiteAssetUrl('assets/altar/a b.png'), 'https://saltandsovereignty.com/assets/altar/a%20b.png');
});

test('rotation accumulates in degrees and resize respects locks', () => {
  const doc = documentFromAltar({ objects: [{ ...lilith }, { ...lilith, locked: 'true' }] });
  assert.equal(rotateObject(rotateObject(doc, 0, 15), 0, 15).objects[0].rotation, '30');
  assert.equal(resizeObject(doc, 1, 2), doc);
  assert.equal(changeLayer(doc, 0, 'front').objects[0].zIndex, '11');
});
