// An offering's picture going over, on the phone: browned, dulled and a
// little darker through a colour matrix (lib/altar/offeringArt tintMatrix, the
// same change the web's CSS filter makes), drawn over the plain picture.

import { Canvas, ColorMatrix, Image } from '@shopify/react-native-skia';

import type { AltarPicture } from '../../lib/altar/assets';
import { useAltarSkiaImage } from './altarSkiaImage';

export const HAS_AGED = true;

export function AgedPicture({ picture, width, height, matrix }: { picture: AltarPicture; width: number; height: number; matrix: number[] }) {
  const image = useAltarSkiaImage(picture);
  if (!image || !(width > 0) || !(height > 0)) return null;
  return (
    <Canvas style={{ position: 'absolute', left: 0, top: 0, width, height }} pointerEvents="none">
      <Image image={image} fit="contain" x={0} y={0} width={width} height={height}>
        <ColorMatrix matrix={matrix} />
      </Image>
    </Canvas>
  );
}
