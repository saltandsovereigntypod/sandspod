const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Catalog = require("../js/sanctuary-asset-catalog.js");

// The altar shows each object picture's WebP twin; the .png path stays its
// identity (saved altars, the app, the flame, lookups).

function pictures(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return pictures(full);
    return /\.png$/i.test(entry.name) ? [full] : [];
  });
}

function pngSize(file) {
  const b = fs.readFileSync(file).subarray(0, 24);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function webpSize(file) {
  const b = fs.readFileSync(file).subarray(0, 30);
  assert.equal(b.toString("ascii", 0, 4), "RIFF", file);
  assert.equal(b.toString("ascii", 8, 12), "WEBP", file);
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3), alpha: Boolean(b[20] & 0x10) };
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff), alpha: true };
  }
  return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff, alpha: false };
}

test("object pictures show as WebP twins while the .png path stays their identity", () => {
  const candle = "/assets/altar/objects/candles/taper/red-taper.png";
  assert.equal(Catalog.displayPath(candle), "/assets/altar/objects/candles/taper/red-taper.webp");
  assert.equal(Catalog.thumbnailPath(candle), "/assets/altar/objects/candles/taper/red-taper.thumb.webp");
  assert.equal(Catalog.displayPath("../assets/altar/overlays/candle-oil-overlay.png"), "../assets/altar/overlays/candle-oil-overlay.webp");
  assert.equal(Catalog.displayPath("assets/altar/objects/herbs/rosemary/rosemary-sprig.png"), "assets/altar/objects/herbs/rosemary/rosemary-sprig.webp");
  assert.equal(Catalog.displayPath("/assets/altar/objects/candles/black-candle.PNG"), "/assets/altar/objects/candles/black-candle.webp");
  // Round trips, the capitalised originals included.
  for (const original of [candle, "../assets/altar/objects/candles/black-candle.PNG", "/assets/altar/objects/candles/white-candle.PNG", "assets/altar/objects/tools/salt-circle/2E77AAEA-4775-4EB3-9EEF-659AB1218A61.png", "https://saltandsovereignty.com/assets/altar/objects/crystals/jet/jet-chips.png"]) {
    assert.equal(Catalog.assetPath(Catalog.displayPath(original)), original);
    assert.equal(Catalog.assetPath(Catalog.thumbnailPath(original)), original);
  }
  // Anything else is left alone.
  for (const other of ["", "data:image/png;base64,AAAA", "https://example.supabase.co/storage/v1/object/public/altar-images/me/photo.png", "/assets/headshot-560.webp", "/assets/divination/tarot/13-death.webp"]) {
    assert.equal(Catalog.displayPath(other), other);
    assert.equal(Catalog.assetPath(other), other);
  }
});

test("showImage keeps the saved path on the <img>; imagePath reads it back", () => {
  const img = (src = "") => {
    const attrs = { src };
    return { dataset: {}, set src(value) { attrs.src = value; }, get src() { return attrs.src; }, getAttribute: (name) => attrs[name] ?? null };
  };
  const saved = "../assets/altar/objects/candles/pillar/green-pillar.png";
  const shown = Catalog.showImage(img(), saved);
  assert.equal(shown.src, "../assets/altar/objects/candles/pillar/green-pillar.webp");
  assert.equal(shown.dataset.assetPath, saved);
  assert.equal(Catalog.imagePath(shown), saved);
  // An <img> made before (no data-asset-path) still maps back.
  assert.equal(Catalog.imagePath(img("/assets/altar/objects/candles/black-candle.webp")), "/assets/altar/objects/candles/black-candle.PNG");
  // A picture of your own is shown as it is.
  const own = Catalog.showImage(img(), "data:image/png;base64,AAAA");
  assert.equal(own.src, "data:image/png;base64,AAAA");
  assert.equal(own.dataset.assetPath, undefined);
  assert.equal(Catalog.imagePath(own), "data:image/png;base64,AAAA");
  assert.equal(Catalog.imagePath(null), "");
});

test("every object picture has both WebP twins, the same shape, with alpha", () => {
  const files = [...pictures("assets/altar/objects"), ...pictures("assets/altar/overlays")];
  assert.ok(files.length > 1000, `${files.length} pictures`);
  const uppercase = [];
  for (const file of files) {
    const posix = file.split(path.sep).join("/");
    if (/\.PNG$/.test(posix)) uppercase.push(posix);
    const display = posix.replace(/\.png$/i, ".webp");
    const thumb = posix.replace(/\.png$/i, ".thumb.webp");
    assert.equal(Catalog.displayPath(posix), display);
    assert.equal(Catalog.assetPath(display), posix);
    const original = pngSize(file);
    for (const [copy, longest] of [[display, posix.includes("/cloths/") ? 2400 : 840], [thumb, 290]]) {
      assert.ok(fs.existsSync(copy), `${copy} is missing: run python3 scripts/build-altar-object-webp.py`);
      const size = webpSize(copy);
      assert.ok(size.alpha, `${copy} keeps its transparency`);
      assert.ok(Math.max(size.width, size.height) <= longest, `${copy} is ${size.width}x${size.height}`);
      const ratio = (size.height / size.width) / (original.height / original.width);
      assert.ok(Math.abs(ratio - 1) < 0.01, `${copy} keeps the original's shape`);
    }
  }
  assert.deepEqual(uppercase.sort(), ["assets/altar/objects/candles/black-candle.PNG", "assets/altar/objects/candles/white-candle.PNG"], "the catalogue's UPPERCASE_PNG lists every .PNG");
});

test("the altar reads an object's .png path, never the WebP it shows", () => {
  const objects = fs.readFileSync("altar/js/features/objects.js", "utf8");
  assert.match(objects, /function getObjectImagePath[\s\S]{0,300}SanctuaryAssetCatalog\?\.imagePath/);
  const bridge = fs.readFileSync("altar/js/features/app-altar-bridge.js", "utf8");
  assert.doesNotMatch(bridge, /noteRatio\(img\.getAttribute\("src"\)|imagePath = img \? img\.getAttribute\("src"\)/);
  assert.match(fs.readFileSync("js/altar-flame.js", "utf8"), /flameLayout\(global\.SanctuaryAssetCatalog\?\.imagePath\?\.\(img\)/);
  for (const file of ["altar/js/core/storage.js", "altar/js/features/objects.js"]) {
    assert.match(fs.readFileSync(file, "utf8"), /SanctuaryAssetCatalog\.showImage\(img,/, file);
  }
});
