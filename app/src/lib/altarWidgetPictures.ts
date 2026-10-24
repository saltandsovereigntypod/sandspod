// The pictures the Altar widget draws: each picture copied into a folder the
// widget can read, cut and shrunk to its size on the widget, plus the widget's
// own artwork. Shared by the iPhone and Android widgets.

import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat, type ImageRef } from 'expo-image-manipulator';

import { altarPicture } from './altar/assets';
import { altarsAt } from './altar/burnout';
import { pixelRect, type PictureCrop } from './altar/pictureCrop';
import type { SavedAltar } from './altar/types';
import { altarPictures, GLASS_EMPTY, type AltarWidgetArt } from './altarWidget';

export function hash(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/**
 * A local copy of a saved picture path, to shrink, and when the app bundles it
 * on a sheet (a herb's or crystal's form) its rect there, to cut out first.
 */
async function localFile(path: string): Promise<{ uri: string; sheet?: PictureCrop } | null> {
  if (path === GLASS_EMPTY) {
    const asset = Asset.fromModule(require('../../assets/widget/glass-empty.png'));
    await asset.downloadAsync();
    return { uri: asset.localUri ?? asset.uri };
  }
  const picture = altarPicture(path);
  if (picture == null) return null;
  const { source } = picture;
  if (typeof source === 'number') {
    const asset = Asset.fromModule(source);
    await asset.downloadAsync();
    return { uri: asset.localUri ?? asset.uri, sheet: picture.crop };
  }
  const uri = !Array.isArray(source) && typeof source === 'object' ? source.uri : undefined;
  if (!uri || uri.startsWith('data:')) return null;
  if (/^https?:/i.test(uri)) {
    const dir = new Directory(Paths.cache, 'widget-downloads');
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const target = new File(dir, `${hash(uri)}`);
    if (!target.exists) await File.downloadFileAsync(uri, target);
    return { uri: target.uri };
  }
  return { uri };
}

/** The widget's own artwork: flames, light and the shading behind its words and buttons. */
export const WIDGET_ART: Record<Required<keyof AltarWidgetArt>, number> = {
  flame: require('../../assets/widget/flame.png'),
  halo: require('../../assets/widget/halo.png'),
  pool: require('../../assets/widget/pool.png'),
  scrimTop: require('../../assets/widget/scrim-top.png'),
  scrimBottom: require('../../assets/widget/scrim-bottom.png'),
  panel: require('../../assets/widget/panel.png'),
  button: require('../../assets/widget/button.png'),
  buttonGold: require('../../assets/widget/button-gold.png'),
  pill: require('../../assets/widget/pill.png'),
  pillGold: require('../../assets/widget/pill-gold.png'),
};

/**
 * Copies of the pictures in the folder the widget can read, each made just big
 * enough for its size on the widget (iOS refuses pictures far bigger than the
 * widget). Made once and kept; ones no longer shown are cleared away. With
 * `times` (the widget's timeline), also the pieces of each candle as it will
 * have burned down at each.
 */
export async function preparePictures(root: string, altars: SavedAltar[], scale?: number, times: number[] = [Date.now()]): Promise<{ pictures: Map<string, string>; art: AltarWidgetArt }> {
  const dir = new Directory(root, 'altar');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const pictures = new Map<string, string>();
  const keep = new Set<string>();

  const art = {} as AltarWidgetArt;
  for (const [name, module] of Object.entries(WIDGET_ART) as [keyof AltarWidgetArt, number][]) {
    const file = new File(dir, `art-${name}.png`);
    keep.add(file.name);
    try {
      if (!file.exists) {
        const asset = Asset.fromModule(module);
        await asset.downloadAsync();
        new File(asset.localUri ?? asset.uri).copy(file);
      }
      art[name] = file.uri;
    } catch {
      art[name] = '';
    }
  }

  const states = times.flatMap((at) => altarsAt(altars, new Date(at)).map((altar) => ({ altar, at })));
  for (const { altar, at } of states) {
    for (const { id, path, width, height, crop, alpha } of altarPictures(altar, scale, at)) {
      if (pictures.has(id)) continue;
      const isBackground = !!crop && !alpha;
      const name = `${hash(`${id}|${crop ? [crop.x, crop.y, crop.w, crop.h].map((v) => v.toFixed(4)).join(',') : ''}`)}-${width}${height ? `x${height}` : ''}${isBackground ? '.jpg' : '.png'}`;
      const file = new File(dir, name);
      try {
        if (!file.exists) {
          const local = await localFile(path);
          if (!local) continue;
          let source: string | ImageRef = local.uri;
          if (crop || local.sheet) {
            // Cut out just the picture from its sheet, and just what this widget size shows (in the picture's own pixels).
            const full = await ImageManipulator.manipulate(local.uri).renderAsync();
            const { x, y, w, h } = pixelRect(full.width, full.height, local.sheet, crop);
            source = await ImageManipulator.manipulate(full).crop({ originX: x, originY: y, width: w, height: h }).renderAsync();
          }
          const image = await ImageManipulator.manipulate(source).resize(height ? { width, height } : { width }).renderAsync();
          const saved = await image.saveAsync(isBackground ? { format: SaveFormat.JPEG, compress: 0.85 } : { format: SaveFormat.PNG });
          new File(saved.uri).move(file);
        }
        pictures.set(id, file.uri);
        keep.add(file.name);
      } catch {
        // A picture that can't be made is simply left out of the scene.
      }
    }
  }
  for (const entry of dir.list()) {
    if (entry instanceof File && !keep.has(entry.name)) {
      try {
        entry.delete();
      } catch {
        // Not worth stopping for.
      }
    }
  }
  return { pictures, art };
}

/** The widget's storage only holds plain values: drop nulls and undefined anywhere in the props. */
export function withoutEmpties<T>(value: T): T {
  if (Array.isArray(value)) return value.filter((v) => v != null).map(withoutEmpties) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v != null && !(typeof v === 'number' && !Number.isFinite(v)))
        .map(([k, v]) => [k, withoutEmpties(v)]),
    ) as T;
  }
  return value;
}

