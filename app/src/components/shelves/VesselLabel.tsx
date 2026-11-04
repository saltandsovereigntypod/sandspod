import { Platform, Text, View } from 'react-native';

import { altarPicture } from '../../lib/altar/assets';
import { containedRect, LABEL_COLOURS, labelFontSize, VESSELS, type LabelFont, type LabelStyle, type Rect, type VesselKind } from '../../lib/altar/vesselLabel';
import { fonts } from '../../theme';
import { AltarImage } from '../altar/AltarImage';

// The label fonts: the app's own Cormorant italic, then the device's script and
// handwriting faces (no new font files; Android and other browsers fall back
// to their own cursive). The website's .vl--* classes use the same faces.
export const LABEL_FAMILY: Record<LabelFont, string | undefined> = {
  ink: fonts.displayItalic,
  script: Platform.select({ ios: 'Snell Roundhand', android: 'cursive', default: '"Snell Roundhand", "Apple Chancery", "URW Chancery L", "Segoe Script", cursive' }),
  hand: Platform.select({ ios: 'Bradley Hand', android: 'casual', default: '"Bradley Hand", "Segoe Print", "Comic Neue", "Comic Sans MS", cursive' }),
};

/** A label drawn at `rect` (in its parent's pixels): paper, ink and edge in its style, the words as large as fit. */
export function VesselLabelText({ rect, text, labelStyle, font, vertical }: { rect: Rect; text: string; labelStyle: LabelStyle; font: LabelFont; vertical?: boolean }) {
  const c = LABEL_COLOURS[labelStyle];
  const size = labelFontSize(text, rect.w, rect.h, vertical);
  const across = vertical ? rect.h : rect.w;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        backgroundColor: c.paper,
        borderColor: c.edge,
        borderWidth: Math.max(0.5, Math.min(rect.w, rect.h) * 0.05),
        borderRadius: Math.min(rect.w, rect.h) * 0.12,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        opacity: 0.96,
      }}
    >
      <Text
        numberOfLines={vertical ? 1 : 2}
        style={{
          width: across * 0.94,
          textAlign: 'center',
          color: c.ink,
          fontFamily: LABEL_FAMILY[font],
          fontSize: size,
          lineHeight: size * 1.08,
          transform: vertical ? [{ rotate: '-90deg' }] : undefined,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

/**
 * A labelled container, `width` × `height`, standing on the box's floor: the
 * container, the herb's own picture filling a jar when there is one, and its
 * label.
 */
export function VesselPicture({
  vessel,
  text,
  labelStyle,
  font,
  width,
  height,
  fillImage,
}: {
  vessel: VesselKind;
  text: string;
  labelStyle: LabelStyle;
  font: LabelFont;
  width: number;
  height: number;
  fillImage?: string;
}) {
  const v = VESSELS[vessel];
  const picture = altarPicture(v.image);
  const body = containedRect(width, height, v.ratio, { x: 0, y: 0, w: 1, h: 1 }, true);
  const fill = v.fill && fillImage ? altarPicture(fillImage) : null;
  const fillRect = v.fill && fill ? containedRect(width, height, v.ratio, v.fill, true) : null;
  return (
    <View pointerEvents="none" style={{ width, height }}>
      {picture && <AltarImage picture={picture} resizeMode="contain" style={{ position: 'absolute', left: body.x, top: body.y, width: body.w, height: body.h }} />}
      {fill && fillRect && (
        <AltarImage picture={fill} resizeMode="contain" style={{ position: 'absolute', left: fillRect.x, top: fillRect.y + fillRect.h * 0.25, width: fillRect.w, height: fillRect.h * 0.75, opacity: 0.85 }} />
      )}
      <VesselLabelText rect={containedRect(width, height, v.ratio, v.label, true)} text={text} labelStyle={labelStyle} font={font} vertical={v.vertical} />
    </View>
  );
}
