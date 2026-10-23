// A photo in an ancestor frame's opening, on the web: cropped to cover the
// opening (an oval or a rectangle) and, if chosen, softened to an old sepia
// print by a CSS filter. The phone draws the same with Skia (FramePhoto.native.tsx).

import { Image, View, type ImageSourcePropType } from 'react-native';

import type { FramePhotoRect } from '../../lib/altar/frame';
import { tintFilter, type OfferingTint } from '../../lib/altar/offeringArt';

/** What an empty opening shows: old paper, waiting for a photo. */
export const FRAME_PAPER = 'rgb(226,214,188)';

/** `unmirror`: the frame is flipped on the altar, but the photo in it reads the right way round. */
export function FramePhoto({ source, rect, tint, unmirror = false }: { source: ImageSourcePropType | null; rect: FramePhotoRect; tint: OfferingTint | null; unmirror?: boolean }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        transform: unmirror ? [{ scaleX: -1 }] : undefined,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        overflow: 'hidden',
        borderRadius: rect.oval ? '50%' : 1,
        backgroundColor: FRAME_PAPER,
      }}
    >
      {source && (
        <View style={[{ width: '100%', height: '100%' }, tint && { filter: tintFilter(tint) }]}>
          <Image source={source} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessibilityIgnoresInvertColors />
        </View>
      )}
    </View>
  );
}
