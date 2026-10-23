// An offering's picture going over, on the phone: browned, dulled and a
// little darker through a colour matrix (lib/altar/offeringArt tintMatrix, the
// same change the web's CSS filter makes), drawn over the plain picture.

import { Canvas, ColorMatrix, Image, useImage, type DataSourceParam } from '@shopify/react-native-skia';
import type { ImageSourcePropType } from 'react-native';

export const HAS_AGED = true;

export function AgedPicture({ source, width, height, matrix }: { source: ImageSourcePropType; width: number; height: number; matrix: number[] }) {
  const image = useImage((typeof source === 'number' ? source : !Array.isArray(source) && source && typeof source === 'object' ? source.uri ?? null : null) as DataSourceParam);
  if (!image || !(width > 0) || !(height > 0)) return null;
  return (
    <Canvas style={{ position: 'absolute', left: 0, top: 0, width, height }} pointerEvents="none">
      <Image image={image} fit="contain" x={0} y={0} width={width} height={height}>
        <ColorMatrix matrix={matrix} />
      </Image>
    </Canvas>
  );
}
