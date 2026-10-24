// An altar picture for the phone's Skia drawings (LitPicture, AgedPicture).
// Imported only by .native files. A picture on a sheet (a herb's or crystal's
// form, lib/altar/assets altarPicture) is cut out into an image of its own, so
// a shader sampling round its edges (the candlelight's rim) never reaches its
// neighbours on the sheet.

import { AlphaType, ColorType, Skia, useImage, type DataSourceParam, type SkImage } from '@shopify/react-native-skia';
import { useMemo } from 'react';

import type { AltarPicture } from '../../lib/altar/assets';
import { pixelRect } from '../../lib/altar/pictureCrop';

function dataSource(picture: AltarPicture | null): DataSourceParam {
  const source = picture?.source;
  return (typeof source === 'number' ? source : !Array.isArray(source) && source && typeof source === 'object' ? source.uri ?? null : null) as DataSourceParam;
}

/** The picture as a Skia image (just its rect when it's on a sheet), or null while loading or if it can't be made. */
export function useAltarSkiaImage(picture: AltarPicture | null): SkImage | null {
  const image = useImage(dataSource(picture));
  const crop = picture?.crop;
  return useMemo(() => {
    if (!image || !crop) return image;
    try {
      const { x, y, w, h } = pixelRect(image.width(), image.height(), crop);
      const info = { width: w, height: h, colorType: ColorType.RGBA_8888, alphaType: AlphaType.Premul };
      const pixels = image.readPixels(x, y, info);
      if (!(pixels instanceof Uint8Array)) return null;
      return Skia.Image.MakeImage(info, Skia.Data.fromBytes(pixels), w * 4);
    } catch {
      return null;
    }
  }, [image, crop]);
}
