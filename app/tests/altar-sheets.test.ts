import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import { websiteAssetKey } from '../src/lib/altar/assetPaths.ts';
import { ALTAR_ARTWORK } from '../src/lib/altar/artworkData.ts';
import { cropLayout, pixelRect, type PictureCrop } from '../src/lib/altar/pictureCrop.ts';

// The generated manifests require() their pictures: here each require gives back its path.
(globalThis as { require?: unknown }).require = (path: string) => path;
const { bundledAltarAssets } = (await import('../src/lib/altar/assetManifest.ts')) as unknown as {
  bundledAltarAssets: Record<string, { source: string; width: number; height: number; crop?: PictureCrop }>;
};

const appFile = (source: string) => new URL(`../${source.replace(/^(\.\.\/)+/, '')}`, import.meta.url);

/** A WebP file's pixel size, from its header. */
function webpSize(file: URL): { w: number; h: number } {
  const b = readFileSync(file);
  assert.equal(b.toString('ascii', 0, 4), 'RIFF');
  assert.equal(b.toString('ascii', 8, 12), 'WEBP');
  const chunk = b.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (chunk === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { w: 1 + (bits & 0x3fff), h: 1 + ((bits >> 14) & 0x3fff) };
  }
  return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
}

// Forms a stone isn't sold in (no picture) aren't offered, so aren't packed.
const packedForms = (['herbs', 'crystals'] as const).flatMap((category) =>
  ALTAR_ARTWORK.items[category].flatMap((item) => item.forms.filter((f) => f.form !== 'incense' && f.image).map((f) => ({ category, name: item.name, image: f.image }))),
);

test('every herb and crystal form is on its item’s sheet, inside it', () => {
  assert.ok(packedForms.length >= 380);
  for (const { category, name, image } of packedForms) {
    const key = websiteAssetKey(image)!;
    const entry = bundledAltarAssets[key];
    assert.ok(entry, `${name}: ${key}`);
    assert.ok(entry.crop, `${key} is not on a sheet`);
    assert.match(entry.source, new RegExp(`assets/altar/sheets/${category}/[a-z0-9-]+\\.webp$`), key);
    const { x, y, w, h, sheetW, sheetH } = entry.crop;
    assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= sheetW && y + h <= sheetH, `${key} lies off its sheet`);
    assert.ok(existsSync(appFile(entry.source)), entry.source);
    assert.deepEqual(webpSize(appFile(entry.source)), { w: sheetW, h: sheetH }, entry.source);
    // The website sizes the object from the original's shape: the cell keeps it.
    assert.ok(Math.abs(h / w - entry.height / entry.width) < 0.01, `${key} is out of shape`);
  }
});

test('every potted plant’s stage picture resolves to its plant’s sheet', () => {
  // Empty until the painter's pictures land and the scripts are run; then each stage is checked.
  for (const [id, stages] of Object.entries(ALTAR_ARTWORK.plants)) {
    for (const [stage, image] of Object.entries(stages)) {
      assert.equal(image, `../assets/altar/objects/plants/${id}/${id}-${stage}.png`);
      const key = websiteAssetKey(image)!;
      const entry = bundledAltarAssets[key];
      assert.ok(entry, `${id} ${stage}: ${key}`);
      assert.ok(entry.crop, `${key} is not on a sheet`);
      assert.equal(entry.source.replace(/^(\.\.\/)+/, ''), `assets/altar/sheets/plants/${id}.webp`, key);
      const { x, y, w, h, sheetW, sheetH } = entry.crop;
      assert.ok(x >= 0 && y >= 0 && x + w <= sheetW && y + h <= sheetH, `${key} lies off its sheet`);
    }
  }
});

/** The packer's own functions, from Python (null where Python or Pillow isn't installed). */
function packer(code: string): string | null {
  const load = ['import importlib.util, json', "spec = importlib.util.spec_from_file_location('packer', 'scripts/build-altar-assets.py')", 'm = importlib.util.module_from_spec(spec)', 'spec.loader.exec_module(m)'];
  try {
    return execFileSync('python3', ['-B', '-c', [...load, code].join('\n')], { cwd: new URL('..', import.meta.url), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

test('the asset script packs each potted plant’s three stages onto one sheet', (t) => {
  const out = packer(
    "print(json.dumps([m.packed_group('objects/plants/snake-plant/snake-plant-young.png'), m.packed_group('objects/plants/basil/basil-lush.png'), m.packed_group('objects/plants/basil/basil-wilted.png'), m.packed_group('objects/plants/basil/basil.png'), m.PACKED_FORMS['plants'], m.shelf_layout([(683, 1024), (683, 1024), (600, 1024)])]))",
  );
  if (out == null) return t.skip('python3 with Pillow is not installed');
  const [young, lush, wilted, bare, order, [w, h, places]] = JSON.parse(out) as [unknown, unknown, unknown, unknown, string[], [number, number, [number, number][]]];
  assert.deepEqual(young, ['plants', 'snake-plant', 'young']);
  assert.deepEqual(lush, ['plants', 'basil', 'lush']);
  assert.equal(wilted, null);
  assert.equal(bare, null);
  assert.deepEqual(order, ['young', 'established', 'lush']);
  // Three cells, none overlapping, each with its gap, all on the sheet.
  const sizes = [
    [683, 1024],
    [683, 1024],
    [600, 1024],
  ];
  const rects = places.map(([x, y], i) => ({ x, y, w: sizes[i][0], h: sizes[i][1] }));
  assert.ok(w <= 4096 && h <= 4096);
  for (const r of rects) assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= w && r.y + r.h <= h);
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i];
      const b = rects[j];
      assert.ok(Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w), b.y - (a.y + a.h), a.y - (b.y + b.h)) >= 8);
    }
  }
});

test('no two pictures on a sheet overlap, and each keeps a gap round it', () => {
  const bySheet = new Map<string, PictureCrop[]>();
  for (const entry of Object.values(bundledAltarAssets)) {
    if (entry.crop) bySheet.set(entry.source, [...(bySheet.get(entry.source) ?? []), entry.crop]);
  }
  assert.ok(bySheet.size >= 100);
  for (const [sheet, rects] of bySheet) {
    for (const a of rects) assert.ok(a.sheetW === rects[0].sheetW && a.sheetH === rects[0].sheetH, sheet);
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i];
        const b = rects[j];
        const gap = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w), b.y - (a.y + a.h), a.y - (b.y + b.h));
        assert.ok(gap >= 4, `${sheet}: two pictures ${gap < 0 ? 'overlap' : 'touch'}`);
      }
    }
  }
});

test('everything else is still a picture of its own', () => {
  const singles = [
    ...Object.values(ALTAR_ARTWORK.shelfTools),
    ...Object.values(ALTAR_ARTWORK.natural),
    ...Object.values(ALTAR_ARTWORK.seasonal),
    ...ALTAR_ARTWORK.backgrounds.map((b) => b.assetPath),
    ...(['deities', 'tools', 'vessels'] as const).flatMap((c) => ALTAR_ARTWORK.items[c].flatMap((i) => i.forms.map((f) => f.image))),
    '../assets/altar/objects/herbs/incense/incense.png',
    '../assets/altar/objects/herbs/herb-mix/herb-mix.png',
    '../assets/altar/objects/candles/votive/red-votive.png',
    'assets/altar/overlays/candle-herb-overlay.png',
  ];
  let checked = 0;
  for (const path of singles) {
    const key = websiteAssetKey(path);
    const entry = key ? bundledAltarAssets[key] : undefined;
    if (!entry) continue;
    checked++;
    assert.equal(entry.crop, undefined, key!);
    assert.equal(entry.source.replace(/^(\.\.\/)+/, ''), key!.replace(/\.png$/i, '.webp'), key!);
    assert.ok(existsSync(appFile(entry.source)), entry.source);
  }
  assert.ok(checked >= 100, `only ${checked} single pictures found`);
});

test('the app bundles well under the 1000 files an update may carry', () => {
  const altar = new Set(Object.values(bundledAltarAssets).map((e) => e.source));
  const tarot = new Set([...readFileSync(new URL('../src/lib/divination/tarotAssets.ts', import.meta.url), 'utf8').matchAll(/require\('([^']+)'\)/g)].map((m) => m[1]));
  for (const file of [...altar, ...tarot]) assert.ok(existsSync(appFile(file)), file);
  const total = altar.size + tarot.size;
  assert.ok(total < 900, `${total} bundled pictures: leave room under EAS Update's 1000`);
});

test('a sheet is placed so only the picture’s rect shows, fitted like resizeMode', () => {
  const crop = { x: 400, y: 100, w: 200, h: 100, sheetW: 1000, sheetH: 500 };
  // contain: 2:1 into a 100 × 100 box is 100 × 50, centred; the sheet at half scale.
  assert.deepEqual(cropLayout(crop, 100, 100, 'contain'), {
    clip: { left: 0, top: 25, width: 100, height: 50 },
    sheet: { left: -200, top: -50, width: 500, height: 250 },
  });
  // cover: fills the box, overflowing sideways; the clip is the box.
  assert.deepEqual(cropLayout(crop, 100, 100, 'cover'), {
    clip: { left: 0, top: 0, width: 100, height: 100 },
    sheet: { left: -50 - 400, top: -100, width: 1000, height: 500 },
  });
  assert.deepEqual(cropLayout(crop, 400, 50, 'stretch').sheet, { left: -800, top: -50, width: 2000, height: 250 });
  // center: never scaled up.
  assert.deepEqual(cropLayout(crop, 1000, 1000, 'center').clip, { left: 400, top: 450, width: 200, height: 100 });
  // The picture's own pixels land exactly on the clip.
  const { clip, sheet } = cropLayout(crop, 300, 90, 'contain');
  const s = sheet.width / crop.sheetW;
  assert.ok(Math.abs(sheet.left + crop.x * s) < 1e-9 && Math.abs(sheet.top + crop.y * s) < 1e-9);
  assert.ok(Math.abs(crop.w * s - clip.width) < 1e-9 && Math.abs(crop.h * s - clip.height) < 1e-9);
});

test('the widget cuts a picture from its sheet, and a picture of its own as before', () => {
  const crop = { x: 408, y: 0, w: 400, h: 800, sheetW: 808, sheetH: 1208 };
  assert.deepEqual(pixelRect(808, 1208, crop), { x: 408, y: 0, w: 400, h: 800 });
  assert.deepEqual(pixelRect(808, 1208, crop, { x: 0.25, y: 0.5, w: 0.5, h: 0.5 }), { x: 508, y: 400, w: 200, h: 400 });
  // Never past the picture's own edge into its neighbour.
  assert.deepEqual(pixelRect(808, 1208, crop, { x: 0.9, y: 0, w: 0.3, h: 1 }), { x: 768, y: 0, w: 40, h: 800 });
  // A sheet loaded at half size.
  assert.deepEqual(pixelRect(404, 604, crop), { x: 204, y: 0, w: 200, h: 400 });
  // Unpacked: the widget's old maths exactly.
  const part = { x: 0.1234, y: 0.3, w: 0.95, h: 0.333 };
  const W = 1600;
  const H = 1067;
  const x = Math.max(0, Math.round(part.x * W));
  const y = Math.max(0, Math.round(part.y * H));
  assert.deepEqual(pixelRect(W, H, undefined, part), { x, y, w: Math.min(W - x, Math.round(part.w * W)), h: Math.min(H - y, Math.round(part.h * H)) });
});
