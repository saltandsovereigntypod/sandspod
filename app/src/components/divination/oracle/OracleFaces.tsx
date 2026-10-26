// The faces of Lenormand, Kipper and your own cards. Lenormand shows the
// Bruges cards of the 1890s from their sheets; Kipper, with no complete
// public-domain printing to hand, is drawn here in words (its number, its
// name and its German name); a card of your own shows its photo, or its
// name and words when it has none. The backs are the app's own card back.

import { useState, type ReactNode } from 'react';
import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import type { Drawn } from '../../../lib/divination/draw';
import { ownCard, type OwnDeckData } from '../../../lib/divination/oracle/decks';
import { kipperCard } from '../../../lib/divination/oracle/kipper';
import { lenormandCard } from '../../../lib/divination/oracle/lenormand';
import { LENORMAND_SHEET, lenormandImages, type SheetPlace } from '../../../lib/divination/oracle/lenormandAssets';
import { colors, fonts } from '../../../theme';

/** One card's picture from a sheet, filling its box and cropped to cover it. */
export function SheetArt({
  place,
  sheet,
  style,
  accessibilityLabel,
}: {
  place: SheetPlace;
  sheet: { cols: number; rows: number; cellWidth: number; cellHeight: number };
  style?: StyleProp<ViewStyle | ImageStyle>;
  accessibilityLabel?: string;
}) {
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const { cols, rows, cellWidth, cellHeight } = sheet;
  let picture: ReactNode = null;
  if (box && box.width > 0 && box.height > 0) {
    const scale = Math.max(box.width / cellWidth, box.height / cellHeight);
    const cw = cellWidth * scale;
    const ch = cellHeight * scale;
    picture = (
      <Image
        source={place.sheet}
        accessibilityIgnoresInvertColors
        style={{ position: 'absolute', width: cw * cols, height: ch * rows, left: -place.col * cw + (box.width - cw) / 2, top: -place.row * ch + (box.height - ch) / 2 }}
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

/** A Lenormand card by its id, from the Bruges sheets. */
export function LenormandArt({ id, style, accessibilityLabel }: { id: string; style?: StyleProp<ViewStyle>; accessibilityLabel?: string }) {
  const place = lenormandImages[id];
  if (!place) return <View style={style} />;
  return <SheetArt place={place} sheet={LENORMAND_SHEET} style={style} accessibilityLabel={accessibilityLabel} />;
}

export function LenormandFace({ name }: { name: string }) {
  const card = lenormandCard(name);
  return <View style={styles.card}>{card ? <LenormandArt id={card.id} style={styles.fill} /> : <Text style={styles.plainName}>{name}</Text>}</View>;
}

/** A Kipper card drawn in words, sized to its width: number at the top, name in the middle, German name beneath. */
export function KipperFace({ name, width }: { name: string; width: number }) {
  const card = kipperCard(name);
  const small = width < 56;
  return (
    <View style={[styles.card, styles.kipper]}>
      <View style={[styles.kipperFrame, { margin: Math.max(2, width * 0.05) }]}>
        <Text style={[styles.kipperNumber, { fontSize: Math.max(9, width * 0.2) }]}>{card?.number ?? ''}</Text>
        {!small && (
          <Text style={[styles.kipperName, { fontSize: Math.max(8, Math.min(16, width * 0.13)), lineHeight: Math.max(10, Math.min(19, width * 0.16)) }]} numberOfLines={4}>
            {card?.name ?? name}
          </Text>
        )}
        {width >= 90 && !!card && (
          <Text style={[styles.kipperGerman, { fontSize: Math.min(12, width * 0.09) }]} numberOfLines={2}>
            {card.german}
          </Text>
        )}
      </View>
    </View>
  );
}

/** A card from a deck of your own: its photo, or its name and words. Upside down when reversed. */
export function OwnCardFace({ name, reversed, deck, width }: { name: string; reversed: boolean; deck: OwnDeckData | null; width: number }) {
  const card = deck ? ownCard(deck, name) : null;
  return (
    <View style={[styles.card, reversed && styles.upsideDown]}>
      {card?.photo ? (
        <Image source={{ uri: card.photo }} style={styles.fill} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : (
        <View style={styles.ownPlain}>
          <Text style={[styles.ownName, { fontSize: Math.max(8, Math.min(17, width * 0.14)) }]} numberOfLines={4}>
            {name}
          </Text>
          {width >= 90 && !!card?.keywords && (
            <Text style={[styles.ownWords, { fontSize: Math.min(12, width * 0.09) }]} numberOfLines={3}>
              {card.keywords}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

/** The face for an oracle kind's drawn card, or null for tarot, runes and ogham. */
export function oracleFront(kind: string, item: Drawn, width: number, deck: OwnDeckData | null): ReactNode | null {
  if (kind === 'lenormand') return <LenormandFace name={item.name} />;
  if (kind === 'kipper') return <KipperFace name={item.name} width={width} />;
  if (kind === 'oracle') return <OwnCardFace name={item.name} reversed={item.reversed} deck={deck} width={width} />;
  return null;
}

const fill = { width: '100%', height: '100%' } as const;

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  fill,
  card: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: 'rgba(226,195,109,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upsideDown: { transform: [{ rotate: '180deg' }] },
  plainName: { fontFamily: fonts.display, fontSize: 14, color: colors.forestInk, textAlign: 'center', padding: 4 },
  kipper: { backgroundColor: '#efe4c8' },
  kipperFrame: {
    flex: 1,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#7a5a2e',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  kipperNumber: { fontFamily: fonts.display, color: '#7a2e1e', textAlign: 'center' },
  kipperName: { fontFamily: fonts.display, color: colors.forestInk, textAlign: 'center' },
  kipperGerman: { fontFamily: fonts.displayItalic, color: '#5b4a2e', textAlign: 'center' },
  ownPlain: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 6, backgroundColor: '#f1e8d2' },
  ownName: { fontFamily: fonts.display, color: colors.forestInk, textAlign: 'center' },
  ownWords: { fontFamily: fonts.displayItalic, color: '#5b4a2e', textAlign: 'center' },
});
