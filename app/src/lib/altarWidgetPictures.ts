// The pictures the Altar widget draws: each picture copied into a folder the
// widget can read, cut and shrunk to its size on the widget, plus the widget's
// own artwork. Shared by the iPhone and Android widgets.

import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat, type ImageRef } from 'expo-image-manipulator';

import { altarImageSource } from './altar/assets';
import type { SavedAltar } from './altar/types';
import { altarPictures, type AltarWidgetArt } from './altarWidget';

export function hash(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** A local copy of a saved picture path, to shrink. */
async function localUri(path: string): Promise<string | null> {
  const source = altarImageSource(path);
  if (source == null) return null;
  if (typeof source === 'number') {
    const asset = Asset.fromModule(source);
    await asset.downloadAsync();
    return asset.localUri ?? asset.uri;
  }
  const uri = !Array.isArray(source) && typeof source === 'object' ? source.uri : undefined;
  if (!uri || uri.startsWith('data:')) return null;
  if (/^https?:/i.test(uri)) {
    const dir = new Directory(Paths.cache, 'widget-downloads');
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const target = new File(dir, `${hash(uri)}`);
    if (!target.exists) await File.downloadFileAsync(uri, target);
    return target.uri;
  }
  return uri;
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
 * widget). Made once and kept; ones no longer shown are cleared away.
 */
export async function preparePictures(root: string, altars: SavedAltar[], scale?: number): Promise<{ pictures: Map<string, string>; art: AltarWidgetArt }> {
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

  for (const altar of altars) {
    for (const { id, path, width, crop } of altarPictures(altar, scale)) {
      if (pictures.has(id)) continue;
      const isBackground = !!crop;
      const name = `${hash(`${id}|${crop ? [crop.x, crop.y, crop.w, crop.h].map((v) => v.toFixed(4)).join(',') : ''}`)}-${width}${isBackground ? '.jpg' : '.png'}`;
      const file = new File(dir, name);
      try {
        if (!file.exists) {
          const uri = await localUri(path);
          if (!uri) continue;
          let source: string | ImageRef = uri;
          if (crop) {
            // Cut out just what this widget size shows (in the picture's own pixels).
            const full = await ImageManipulator.manipulate(uri).renderAsync();
            const x = Math.max(0, Math.round(crop.x * full.width));
            const y = Math.max(0, Math.round(crop.y * full.height));
            const w = Math.min(full.width - x, Math.round(crop.w * full.width));
            const h = Math.min(full.height - y, Math.round(crop.h * full.height));
            source = await ImageManipulator.manipulate(full).crop({ originX: x, originY: y, width: w, height: h }).renderAsync();
          }
          const image = await ImageManipulator.manipulate(source).resize({ width }).renderAsync();
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

