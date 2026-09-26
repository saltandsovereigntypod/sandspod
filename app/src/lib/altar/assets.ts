import { useEffect, useSyncExternalStore } from 'react';
import { Image, type ImageSourcePropType } from 'react-native';

import { bundledAltarAssets } from './assetManifest';
import { websiteAssetKey, websiteAssetUrl } from './assetPaths';
import { setImageRatioLookup } from './geometry';

const lowerCaseIndex = new Map(Object.keys(bundledAltarAssets).map((key) => [key.toLowerCase(), key]));

function bundled(path: string) {
  const key = websiteAssetKey(path);
  if (!key) return { key: null, entry: undefined };
  return { key, entry: bundledAltarAssets[key] ?? bundledAltarAssets[lowerCaseIndex.get(key.toLowerCase()) ?? ''] };
}

/**
 * The image to show for a saved path: the app's bundled copy of the website's
 * artwork when there is one (works offline), otherwise the same file from the
 * website, otherwise the URL itself (custom uploads in Supabase storage).
 */
export function altarImageSource(path: string | undefined | null): ImageSourcePropType | null {
  if (!path) return null;
  const { key, entry } = bundled(path);
  if (entry) return entry.source;
  if (key) return { uri: websiteAssetUrl(key) };
  if (/^https?:\/\//i.test(path)) return { uri: path };
  return null;
}

function remoteUri(path: string): string | null {
  const { key, entry } = bundled(path);
  if (entry) return null;
  if (key) return websiteAssetUrl(key);
  return /^https?:\/\//i.test(path) ? path : null;
}

// Natural height / width of each image. The website sizes object boxes from
// it, so the geometry needs it too: bundled art is known up front, other
// images are measured once when first shown.
const measured = new Map<string, number>();
const pending = new Set<string>();
let version = 0;
const listeners = new Set<() => void>();

setImageRatioLookup((path) => {
  const { entry } = bundled(path);
  if (entry) return entry.height / entry.width;
  const uri = remoteUri(path);
  return uri ? (measured.get(uri) ?? null) : null;
});

function measure(path: string) {
  const uri = remoteUri(path);
  if (!uri || measured.has(uri) || pending.has(uri)) return;
  pending.add(uri);
  Image.getSize(
    uri,
    (width, height) => {
      pending.delete(uri);
      if (width > 0 && height > 0) {
        measured.set(uri, height / width);
        version += 1;
        listeners.forEach((listener) => listener());
      }
    },
    () => pending.delete(uri),
  );
}

/** Measure a downloaded image the first time an object uses it. */
export function useImageRatio(path: string | undefined) {
  useEffect(() => {
    if (path) measure(path);
  }, [path]);
}

/** Bumps whenever a downloaded image's size becomes known. */
export function useImageRatioVersion(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => version,
  );
}

export const candleHerbOverlay = bundledAltarAssets['assets/altar/overlays/candle-herb-overlay.png'].source;
export const candleOilOverlay = bundledAltarAssets['assets/altar/overlays/candle-oil-overlay.png'].source;
