// Reading the painted pictures at build time, with nothing but Node: a PNG's
// size, its pixels, and where the opening is inside an ancestor frame (the
// flat white, or transparent, region the photo is drawn into). Used by
// build-altar-artwork.mjs; pure, so it can be tested (tests/altar-frame.test.ts).

import { Buffer } from 'node:buffer';
import zlib from 'node:zlib';

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

const isPng = (buf) => buf && buf.length > 24 && SIGNATURE.every((b, i) => buf[i] === b);

/** A PNG's pixel size from its header, or null when it isn't a PNG. */
export function pngSize(buf) {
  if (!isPng(buf)) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

/**
 * A PNG's pixels as RGBA bytes, or null for what this doesn't read
 * (interlaced pictures, or bit depths other than 8 and 16).
 */
export function decodePng(buf) {
  if (!isPng(buf)) return null;
  let pos = 8;
  let width = 0;
  let height = 0;
  let depth = 0;
  let colorType = 0;
  let interlace = 0;
  let palette = null;
  let alphas = null;
  const data = [];
  while (pos + 8 <= buf.length) {
    const length = buf.readUInt32BE(pos);
    const kind = buf.toString('latin1', pos + 4, pos + 8);
    const body = buf.subarray(pos + 8, pos + 8 + length);
    if (kind === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      depth = body[8];
      colorType = body[9];
      interlace = body[12];
    } else if (kind === 'PLTE') palette = body;
    else if (kind === 'tRNS') alphas = body;
    else if (kind === 'IDAT') data.push(body);
    else if (kind === 'IEND') break;
    pos += 12 + length;
  }
  const channels = CHANNELS[colorType];
  if (!width || !height || !channels || interlace || (depth !== 8 && depth !== 16)) return null;
  const raw = zlib.inflateSync(Buffer.concat(data));
  const bytesPer = (channels * depth) / 8;
  const stride = width * bytesPer;
  if (raw.length < height * (stride + 1)) return null;
  const rows = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bytesPer ? rows[out + x - bytesPer] : 0;
      const b = y > 0 ? rows[out - stride + x] : 0;
      const c = x >= bytesPer && y > 0 ? rows[out - stride + x - bytesPer] : 0;
      const v = line[x];
      rows[out + x] = filter === 1 ? v + a : filter === 2 ? v + b : filter === 3 ? v + ((a + b) >> 1) : filter === 4 ? v + paeth(a, b, c) : v;
    }
  }
  const rgba = new Uint8Array(width * height * 4);
  const step = depth / 8;
  const at = (i, ch) => rows[i * bytesPer + ch * step];
  for (let i = 0; i < width * height; i++) {
    let r;
    let g;
    let b;
    let a = 255;
    if (colorType === 0 || colorType === 4) {
      r = g = b = at(i, 0);
      if (colorType === 4) a = at(i, 1);
    } else if (colorType === 3) {
      const index = rows[i];
      r = palette ? palette[index * 3] : 0;
      g = palette ? palette[index * 3 + 1] : 0;
      b = palette ? palette[index * 3 + 2] : 0;
      a = alphas && index < alphas.length ? alphas[index] : 255;
    } else {
      r = at(i, 0);
      g = at(i, 1);
      b = at(i, 2);
      if (colorType === 6) a = at(i, 3);
    }
    rgba.set([r, g, b, a], i * 4);
  }
  return { width, height, rgba };
}

/** Open: see-through, or flat white (allowing for a little softening by the painter's tools). */
const isOpen = (rgba, i) => rgba[i * 4 + 3] < 24 || (rgba[i * 4] >= 242 && rgba[i * 4 + 1] >= 242 && rgba[i * 4 + 2] >= 242);

/**
 * Where a frame's opening is, as fractions of the picture: the open region
 * (white or transparent) that holds the picture's middle and doesn't run out
 * to its edge, and whether it's oval (an ellipse fills about π/4 of its box)
 * or a rectangle. Null when there is no such region.
 */
export function findOpening({ width, height, rgba }) {
  if (!(width > 2) || !(height > 2)) return null;
  // The opening holds the middle: start from the nearest open pixel to it.
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  let seed = -1;
  const reach = Math.floor(Math.min(width, height) / 6);
  for (let r = 0; r <= reach && seed < 0; r++) {
    for (let dy = -r; dy <= r && seed < 0; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const i = (cy + dy) * width + (cx + dx);
        if (isOpen(rgba, i)) {
          seed = i;
          break;
        }
      }
    }
  }
  if (seed < 0) return null;
  const seen = new Uint8Array(width * height);
  const stack = new Int32Array(width * height);
  let top = 0;
  stack[top++] = seed;
  seen[seed] = 1;
  let count = 0;
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  while (top > 0) {
    const i = stack[--top];
    const x = i % width;
    const y = (i - x) / width;
    // Open all the way to the picture's edge: the background, not an opening.
    if (x === 0 || y === 0 || x === width - 1 || y === height - 1) return null;
    count++;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    for (const n of [i - 1, i + 1, i - width, i + width]) {
      if (!seen[n] && isOpen(rgba, n)) {
        seen[n] = 1;
        stack[top++] = n;
      }
    }
  }
  const boxW = maxX - minX + 1;
  const boxH = maxY - minY + 1;
  // Too small to be the opening (a highlight or a fleck of white paint).
  if (boxW < width * 0.12 || boxH < height * 0.12) return null;
  const fill = count / (boxW * boxH);
  const r4 = (n) => Math.round(n * 10000) / 10000;
  return { left: r4(minX / width), top: r4(minY / height), width: r4(boxW / width), height: r4(boxH / height), oval: fill < 0.9 };
}
