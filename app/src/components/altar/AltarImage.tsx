import { useState } from 'react';
import { Image, StyleSheet, View, type ImageResizeMode, type ImageStyle, type StyleProp } from 'react-native';

import type { AltarPicture } from '../../lib/altar/assets';
import { cropLayout } from '../../lib/altar/pictureCrop';

/**
 * An altar picture (lib/altar/assets altarPicture) where an <Image> of it
 * would go. A picture of its own is exactly that <Image>; one on a sheet (a
 * herb's or crystal's form) is the sheet in a clipped box, scaled and moved
 * so only its rect shows, fitted as `resizeMode` would fit it.
 */
export function AltarImage({
  picture,
  style,
  resizeMode = 'cover',
  accessibilityLabel,
}: {
  picture: AltarPicture;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  accessibilityLabel?: string;
}) {
  const flat = StyleSheet.flatten(style) ?? {};
  // A box given in the style is known at once; otherwise measured, as TarotArt does.
  const given = typeof flat.width === 'number' && typeof flat.height === 'number' ? { width: flat.width, height: flat.height } : null;
  const [measured, setMeasured] = useState<{ width: number; height: number } | null>(null);
  if (!picture.crop) {
    return <Image source={picture.source} style={style} resizeMode={resizeMode} accessibilityLabel={accessibilityLabel} />;
  }
  const box = given ?? measured;
  const fit = resizeMode === 'cover' ? 'cover' : resizeMode === 'stretch' ? 'stretch' : resizeMode === 'center' ? 'center' : 'contain';
  const layout = box && box.width > 0 && box.height > 0 ? cropLayout(picture.crop, box.width, box.height, fit) : null;
  // Image-only styles (tint) can't go on the box; everything else (size, opacity, transforms) does.
  const { tintColor: _tint, resizeMode: _mode, objectFit: _fit, ...boxStyle } = flat as ImageStyle & { objectFit?: unknown };
  return (
    <View
      style={[boxStyle, styles.box]}
      onLayout={given ? undefined : (e) => setMeasured({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      {layout && (
        <View style={[styles.clip, layout.clip]}>
          <Image source={picture.source} style={[styles.sheet, layout.sheet, flat.tintColor != null && { tintColor: flat.tintColor }]} resizeMode="stretch" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { position: 'absolute', overflow: 'hidden' },
  box: { overflow: 'hidden' },
  sheet: { position: 'absolute' },
});
