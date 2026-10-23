// The ancestor frame: its opening found from its picture at build time, a
// photo of your own drawn into it, an old sepia look, a name and dates
// (by hand or from Hedge → Ancestors), and the same saved shape everywhere.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import zlib from 'node:zlib';

import { decodePng, findOpening, pngSize } from '../scripts/frame-opening.mjs';
import { ancestorOf } from '../src/lib/altar/connect/ancestor.ts';
import {
  AGED_PHOTO,
  captionFromAncestor,
  frameCaption,
  frameOf,
  framePhotoRect,
  framePhotoTint,
  isFrame,
  removeFramePhoto,
  setFrameAged,
  setFrameCaption,
  setFramePhoto,
} from '../src/lib/altar/frame.ts';
import { pictureBox } from '../src/lib/altar/flame.ts';
import { appHistoryOf } from '../src/lib/altar/livingState.ts';
import { objectFromForm } from '../src/lib/altar/cabinet.ts';
import { offeringOf, perishableItself } from '../src/lib/altar/offerings.ts';
import { altarDataFromDocument, documentFromAltar, emptyDocument } from '../src/lib/altar/snapshot.ts';
import type { CabinetItem, SavedObject } from '../src/lib/altar/types.ts';
import type { AncestorEntry } from '../src/lib/craft/hedge/ancestors.ts';

// ── A small PNG writer, to make test pictures ──────────────────────────────

function chunk(kind: string, data: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(kind, 4, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([Buffer.from(kind, 'latin1'), data])) >>> 0, 0);
  return Buffer.concat([head, data, crc]);
}

/** An RGBA PNG from a pixel function, each row with a different filter so the decoder's unfiltering is tried. */
function png(width: number, height: number, pixel: (x: number, y: number) => [number, number, number, number]): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  let previous = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(stride);
    for (let x = 0; x < width; x++) row.set(pixel(x, y), x * 4);
    const filter = y % 5;
    raw[y * (stride + 1)] = filter;
    for (let i = 0; i < stride; i++) {
      const a = i >= 4 ? row[i - 4] : 0;
      const b = previous[i];
      const c = i >= 4 ? previous[i - 4] : 0;
      const p = a + b - c;
      const paeth = Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c;
      const predict = filter === 1 ? a : filter === 2 ? b : filter === 3 ? (a + b) >> 1 : filter === 4 ? paeth : 0;
      raw[y * (stride + 1) + 1 + i] = (row[i] - predict) & 255;
    }
    previous = row;
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const CLEAR: [number, number, number, number] = [0, 0, 0, 0];
const WHITE: [number, number, number, number] = [255, 255, 255, 255];
const GILT: [number, number, number, number] = [196, 152, 60, 255];

test('a PNG is read back pixel for pixel, whatever filter each row used', () => {
  const pixel = (x: number, y: number): [number, number, number, number] => [(x * 37) & 255, (y * 53) & 255, (x * y) & 255, 255 - ((x + y) & 255)];
  const buf = png(23, 17, pixel);
  assert.deepEqual(pngSize(buf), { width: 23, height: 17 });
  const decoded = decodePng(buf)!;
  assert.equal(decoded.width, 23);
  for (const [x, y] of [[0, 0], [22, 16], [5, 9], [11, 3]]) assert.deepEqual([...decoded.rgba.slice((y * 23 + x) * 4, (y * 23 + x) * 4 + 4)], pixel(x, y));
  assert.equal(pngSize(Buffer.from('not a png at all, really')), null);
});

test('a frame’s white rectangular opening is found from its picture', () => {
  // A 100 × 150 gilt frame on a clear background, with a flat white opening.
  const buf = png(100, 150, (x, y) => {
    if (x < 6 || x > 93 || y < 6 || y > 143) return CLEAR;
    if (x >= 20 && x < 80 && y >= 25 && y < 125) return WHITE;
    return GILT;
  });
  const opening = findOpening(decodePng(buf)!);
  assert.deepEqual(opening, { left: 0.2, top: 0.1667, width: 0.6, height: 0.6667, oval: false });
});

test('an oval opening made clear by background removal is found, and told from the background', () => {
  // Both the opening and the outside are see-through; the gilt ring keeps them apart.
  const inOval = (x: number, y: number) => ((x - 60) / 35) ** 2 + ((y - 80) / 50) ** 2 <= 1;
  const inFrame = (x: number, y: number) => ((x - 60) / 52) ** 2 + ((y - 80) / 70) ** 2 <= 1;
  const buf = png(120, 160, (x, y) => (inOval(x, y) ? CLEAR : inFrame(x, y) ? GILT : CLEAR));
  const opening = findOpening(decodePng(buf)!)!;
  assert.equal(opening.oval, true);
  assert.ok(Math.abs(opening.left - 25 / 120) < 0.02 && Math.abs(opening.width - 71 / 120) < 0.02, JSON.stringify(opening));
  assert.ok(Math.abs(opening.top - 30 / 160) < 0.02 && Math.abs(opening.height - 101 / 160) < 0.02, JSON.stringify(opening));
});

test('no opening is found in a solid picture, or one open to its edge', () => {
  assert.equal(findOpening(decodePng(png(40, 40, () => GILT))!), null);
  // A gap in the frame lets the "opening" run out to the edge: that's background, not an opening.
  const broken = png(60, 60, (x, y) => (x >= 15 && x < 45 && y >= 15 && y < 45) || (x >= 28 && x < 32 && y < 15) ? WHITE : GILT);
  assert.equal(findOpening(decodePng(broken)!), null);
  // A fleck of white in the middle is too small to be an opening.
  assert.equal(findOpening(decodePng(png(100, 100, (x, y) => (x >= 49 && x < 52 && y >= 49 && y < 52 ? WHITE : GILT)))!), null);
});

// ── The frame on the altar ────────────────────────────────────────────────

const FRAMES = {
  gilt: { image: '../assets/altar/objects/tools/ancestor-frame/ancestor-frame-gilt.png', ratio: 1.5, opening: { left: 0.2, top: 0.2, width: 0.6, height: 0.5, oval: true } },
  wood: { image: '../assets/altar/objects/tools/ancestor-frame/ancestor-frame-wood.png', ratio: 1.25, opening: null },
};
const FRAME_ITEM: CabinetItem = {
  id: 'tools:ancestor-frame',
  category: 'tools',
  name: 'Ancestor Frame',
  keywords: [],
  forms: [
    { label: 'Gilt', image: FRAMES.gilt.image, type: 'tool', tool: 'ancestor-frame', form: 'gilt' },
    { label: 'Wood', image: FRAMES.wood.image, type: 'tool', tool: 'ancestor-frame', form: 'wood' },
  ],
};
const NOW = '2026-10-23T19:00:00.000Z';
const frameObject = (style = 0, existing: SavedObject[] = []) => objectFromForm(FRAME_ITEM, FRAME_ITEM.forms[style], existing, NOW);
const NAN: AncestorEntry = {
  id: 'anc-1',
  createdAt: NOW,
  data: { name: 'Rose Avery', relation: 'grandmother', born: { year: 1932, month: 5, day: 14 }, died: { year: 2019, month: 6, day: 3 }, loved: 'marigolds', memory: '' },
};

test('a placed frame is a tool, and several can stand on one altar', () => {
  const first = frameObject(0);
  const second = frameObject(1, [first]);
  assert.ok(isFrame(first) && isFrame(second));
  assert.equal(first.label, 'Ancestor Frame Gilt');
  assert.notEqual(first.zIndex, second.zIndex);
  assert.deepEqual(frameOf(first), { photo: '', storagePath: '', aged: false, name: '', dates: '' });
});

test('the photo is drawn in the frame’s opening, wherever the frame is in its box', () => {
  const frame = frameObject(0);
  // In a 100 × 150 box, the picture sits where the stage draws it, and the opening in it.
  const rect = framePhotoRect(frame, 100, 150, FRAMES)!;
  const pic = pictureBox(1.5, 1.5);
  assert.equal(rect.oval, true);
  assert.ok(Math.abs(rect.left - (pic.left + 0.2 * pic.width) * 100) < 0.2, JSON.stringify(rect));
  assert.ok(Math.abs(rect.top - (pic.top + 0.2 * pic.height) * 150) < 0.2, JSON.stringify(rect));
  assert.ok(Math.abs(rect.width - 0.6 * pic.width * 100) < 0.2, JSON.stringify(rect));
  assert.ok(Math.abs(rect.height / rect.width - (0.5 * 1.5) / 0.6) < 0.05, 'keeps the opening’s shape');
  // A wider box: the picture is centred, and so is the opening.
  const wide = framePhotoRect(frame, 300, 150, FRAMES)!;
  assert.ok(Math.abs(wide.left + wide.width / 2 - 150) < 1);
  // A frame whose opening wasn't found, or a picture of your own in its place: nothing drawn.
  assert.equal(framePhotoRect(frameObject(1), 100, 125, FRAMES), null);
  assert.equal(framePhotoRect({ ...frame, imagePath: 'https://example.com/mine.png' }, 100, 150, FRAMES), null);
});

test('a photo, an old sepia look and a name and dates are kept with the frame, and logged', () => {
  let frame = frameObject(0);
  frame = setFramePhoto(frame, 'https://x.supabase.co/storage/v1/object/public/user-assets/u/ancestor-photos/a.jpg', 'u/ancestor-photos/a.jpg', NOW);
  assert.equal(frameOf(frame).photo.endsWith('a.jpg'), true);
  assert.equal(framePhotoTint(frame), null);
  frame = setFrameAged(frame, true, NOW);
  assert.deepEqual(framePhotoTint(frame), AGED_PHOTO);
  frame = setFrameCaption(frame, captionFromAncestor(NAN), NOW);
  assert.equal(frame.label, 'In memory of Rose Avery');
  assert.equal(frame.plaqueText, 'Rose Avery');
  assert.deepEqual(frameCaption(frame), { title: 'In memory of Rose Avery', dates: '1932–2019' });
  // Linked to her in Ancestors, as a memorial candle is.
  assert.deepEqual(ancestorOf(frame), { id: 'anc-1', name: 'Rose Avery' });
  // A name typed by hand unlinks it.
  const typed = setFrameCaption(frame, { name: 'Nan', dates: 'always' }, NOW);
  assert.equal(ancestorOf(typed), null);
  assert.deepEqual(frameCaption(typed), { title: 'In memory of Nan', dates: 'always' });
  // Called Rose, it's still never a wilting flower.
  assert.equal(perishableItself(frame), null);
  assert.equal(offeringOf(frame), null);
  const removed = removeFramePhoto(frame, NOW);
  assert.equal(frameOf(removed).photo, '');
  assert.equal(frameOf(removed).name, 'Rose Avery');
  assert.deepEqual(
    appHistoryOf(removed).map((e) => e.text),
    ['Set a photo in the frame.', 'Gave the photo an old sepia look.', 'Named the frame for Rose Avery, 1932–2019.', 'Took the photo out of the frame.'],
  );
});

test('the frame keeps the same saved shape through a save and a load (the website reads the same)', () => {
  let frame = frameObject(0);
  frame = setFramePhoto(frame, 'data:image/jpeg;base64,AAAA', '', NOW);
  frame = setFrameAged(frame, true, NOW);
  frame = setFrameCaption(frame, captionFromAncestor(NAN), NOW);
  const doc = { ...emptyDocument(), objects: [frame] };
  const data = JSON.parse(JSON.stringify(altarDataFromDocument(doc, 'Ancestors', NOW)));
  const back = documentFromAltar(data).objects[0];
  assert.equal(back.type, 'tool');
  assert.equal(back.tool, 'ancestor-frame');
  assert.equal(back.form, 'gilt');
  const state = JSON.parse(String(back.livingState));
  assert.deepEqual(state.app.frame, { photo: 'data:image/jpeg;base64,AAAA', storagePath: '', aged: true, name: 'Rose Avery', dates: '1932–2019' });
  assert.deepEqual(state.app.ancestor, { id: 'anc-1', name: 'Rose Avery' });
  assert.deepEqual(frameOf(back), frameOf(frame));
});
