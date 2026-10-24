import { useState } from 'react';
import { Image, StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { TAROT_SHEET, type TarotArtPlace } from '../../lib/divination/tarotAssets';

/**
 * One card's picture from its sheet (see scripts/build-divination-assets.py),
 * filling the box it's given and cropped to cover it, as resizeMode="cover"
 * would for a card of its own.
 */
export function TarotArt({ place, style, accessibilityLabel }: { place: TarotArtPlace; style?: StyleProp<ViewStyle | ImageStyle>; accessibilityLabel?: string }) {
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const { cols, rows, cellWidth, cellHeight } = TAROT_SHEET;
  let picture = null;
  if (box && box.width > 0 && box.height > 0) {
    const scale = Math.max(box.width / cellWidth, box.height / cellHeight);
    const cw = cellWidth * scale;
    const ch = cellHeight * scale;
    picture = (
      <Image
        source={place.sheet}
        accessibilityIgnoresInvertColors
        style={{
          position: 'absolute',
          width: cw * cols,
          height: ch * rows,
          left: -place.col * cw + (box.width - cw) / 2,
          top: -place.row * ch + (box.height - ch) / 2,
        }}
      />
    );
  }
  return (
    <View
      style={[style as StyleProp<ViewStyle>, styles.clip]}
      onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      {picture}
    </View>
  );
}

const styles = StyleSheet.create({ clip: { overflow: 'hidden' } });
