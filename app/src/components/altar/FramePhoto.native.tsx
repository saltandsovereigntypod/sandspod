// A photo in an ancestor frame's opening, on the phone: clipped to the
// opening (an oval or a rectangle), cropped to cover it, and softened to an
// old sepia print through a colour matrix when chosen (the same change the
// web's CSS filter makes).

import { Canvas, ColorMatrix, Group, Image, Skia, useImage, type DataSourceParam } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { View, type ImageSourcePropType } from 'react-native';

import type { FramePhotoRect } from '../../lib/altar/frame';
import { tintMatrix, type OfferingTint } from '../../lib/altar/offeringArt';

export const FRAME_PAPER = 'rgb(226,214,188)';

/** `unmirror`: the frame is flipped on the altar, but the photo in it reads the right way round. */
export function FramePhoto({ source, rect, tint, unmirror = false }: { source: ImageSourcePropType | null; rect: FramePhotoRect; tint: OfferingTint | null; unmirror?: boolean }) {
  const image = useImage((typeof source === 'number' ? source : !Array.isArray(source) && source && typeof source === 'object' ? source.uri ?? null : null) as DataSourceParam);
  const { width, height, oval } = rect;
  const clip = useMemo(() => {
    const bounds = Skia.XYWHRect(0, 0, width, height);
    return oval ? Skia.Path.Make().addOval(bounds) : Skia.Path.Make().addRect(bounds);
  }, [width, height, oval]);
  if (!(width > 0) || !(height > 0)) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        transform: unmirror ? [{ scaleX: -1 }] : undefined,
        left: rect.left,
        top: rect.top,
        width,
        height,
        borderRadius: oval ? Math.min(width, height) / 2 : 1,
        backgroundColor: image ? 'transparent' : FRAME_PAPER,
      }}
    >
      {image && (
        <Canvas style={{ width, height }} pointerEvents="none">
          <Group clip={clip}>
            <Image image={image} fit="cover" x={0} y={0} width={width} height={height}>
              {tint && <ColorMatrix matrix={tintMatrix(tint)} />}
            </Image>
          </Group>
        </Canvas>
      )}
    </View>
  );
}
