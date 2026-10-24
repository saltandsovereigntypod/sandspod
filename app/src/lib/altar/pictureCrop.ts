// Showing one picture from a sheet (scripts/build-altar-assets.py packs each
// herb's and crystal's forms onto one): where the sheet goes so that only the
// picture's rect shows, fitted into a box the way resizeMode would fit a
// picture of its own. Without React Native, so it can be unit tested.

/** A picture's pixel rect on its sheet, and the sheet's size in pixels. */
export type PictureCrop = { x: number; y: number; w: number; h: number; sheetW: number; sheetH: number };

export type CropFit = 'contain' | 'cover' | 'stretch' | 'center';

type Box = { left: number; top: number; width: number; height: number };

/**
 * For a box `boxW` × `boxH`: `clip`, the part of the box the picture covers
 * (clip to it), and `sheet`, where the whole sheet is drawn, relative to the
 * clip's top left corner.
 */
export function cropLayout(crop: PictureCrop, boxW: number, boxH: number, fit: CropFit = 'contain'): { clip: Box; sheet: Box } {
  let sx: number;
  let sy: number;
  if (fit === 'stretch') {
    sx = boxW / crop.w;
    sy = boxH / crop.h;
  } else {
    const s =
      fit === 'cover'
        ? Math.max(boxW / crop.w, boxH / crop.h)
        : Math.min(boxW / crop.w, boxH / crop.h, fit === 'center' ? 1 : Infinity);
    sx = sy = s;
  }
  const pw = crop.w * sx;
  const ph = crop.h * sy;
  // The picture centred in the box; cover overflows it, so the clip is the box.
  const left = (boxW - pw) / 2;
  const top = (boxH - ph) / 2;
  const clip = fit === 'cover' ? { left: 0, top: 0, width: boxW, height: boxH } : { left, top, width: pw, height: ph };
  return {
    clip,
    sheet: {
      left: left - clip.left - crop.x * sx,
      top: top - clip.top - crop.y * sy,
      width: crop.sheetW * sx,
      height: crop.sheetH * sy,
    },
  };
}

/**
 * A part of the picture (fractions of it, as the widget cuts backgrounds) as a
 * rect in the pixels of a loaded image `imageW` × `imageH`: the sheet when
 * there's a crop (scaled, should it have loaded at another size), else the
 * picture itself. Rounded and kept inside the picture (sheet sizes are whole
 * pixels at the scale they were packed, so the cell's own edges stay whole).
 */
export function pixelRect(
  imageW: number,
  imageH: number,
  crop?: PictureCrop | null,
  part: { x: number; y: number; w: number; h: number } = { x: 0, y: 0, w: 1, h: 1 },
): { x: number; y: number; w: number; h: number } {
  const kx = crop ? imageW / crop.sheetW : 1;
  const ky = crop ? imageH / crop.sheetH : 1;
  const cell = crop ? { x: crop.x * kx, y: crop.y * ky, w: crop.w * kx, h: crop.h * ky } : { x: 0, y: 0, w: imageW, h: imageH };
  // The same rounding the widget has always used for a picture of its own.
  const x = Math.max(cell.x, Math.round(cell.x + part.x * cell.w));
  const y = Math.max(cell.y, Math.round(cell.y + part.y * cell.h));
  const w = Math.min(cell.x + cell.w - x, Math.round(part.w * cell.w));
  const h = Math.min(cell.y + cell.h - y, Math.round(part.h * cell.h));
  return { x, y, w, h };
}
