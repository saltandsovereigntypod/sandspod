// The faces of what's drawn: Pamela Colman Smith's tarot cards, their backs,
// runes carved on stones and ogham cut along wooden staves, and the flip
// that turns one over. No new art: the runes and ogham are their own letters.

import { useFonts } from 'expo-font';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { tarotImages } from '../../lib/divination/tarotAssets';
import { TarotArt } from './TarotArt';
import { tarotCard } from '../../lib/divination/tarot';
import { colors, fonts } from '../../theme';

// Not every phone has the runic and ogham letters; these Noto fonts (SIL Open
// Font Licence) carry them. Loaded only when a rune or stave is shown.
const STAVE_FONTS = {
  NotoSansRunic: require('../../../assets/fonts/NotoSansRunic-Regular.ttf'),
  NotoSansOgham: require('../../../assets/fonts/NotoSansOgham-Regular.ttf'),
};

/** Width over height of the scanned cards. */
export const CARD_RATIO = 0.58;

/** A card turning over: the back until `revealed`, then the face. */
export function Flip({
  revealed,
  still,
  width,
  height,
  back,
  front,
  onPress,
  label,
  hint,
  selected,
  turned,
  radius = 8,
}: {
  revealed: boolean;
  /** Reduced motion: change faces without turning. */
  still: boolean;
  width: number;
  height: number;
  back: ReactNode;
  front: ReactNode;
  onPress: () => void;
  label: string;
  hint?: string;
  selected?: boolean;
  /** Lay the whole thing on its side (the Celtic Cross's crossing card). */
  turned?: boolean;
  /** The outline's corner, to follow a stone's or a stave's shape. */
  radius?: number;
}) {
  const [turn] = useState(() => new Animated.Value(revealed ? 1 : 0));
  useEffect(() => {
    if (still) {
      turn.setValue(revealed ? 1 : 0);
      return;
    }
    Animated.timing(turn, { toValue: revealed ? 1 : 0, duration: 520, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [revealed, still, turn]);

  const backTurn = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontTurn = turn.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  // Backface hiding isn't reliable everywhere, so each side also fades at the halfway point.
  const backShow = turn.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const frontShow = turn.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [0, 0, 1, 1] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [{ width, height }, turned && styles.turned, pressed && styles.pressed]}
    >
      <Animated.View style={[styles.side, { opacity: backShow, transform: [{ perspective: 900 }, { rotateY: backTurn }] }]}>{back}</Animated.View>
      <Animated.View style={[styles.side, { opacity: frontShow, transform: [{ perspective: 900 }, { rotateY: frontTurn }] }]}>{front}</Animated.View>
      {selected && <View style={[styles.side, styles.selected, styles.noTouch, { borderRadius: radius }]} />}
    </Pressable>
  );
}

/** A Rider–Waite–Smith card, upside down when reversed. */
export function TarotFace({ name, reversed }: { name: string; reversed: boolean }) {
  const card = tarotCard(name);
  const source = card ? tarotImages[card.id] : undefined;
  return (
    <View style={[styles.card, reversed && styles.upsideDown]}>
      {source ? (
        <TarotArt place={source} style={styles.fill} />
      ) : (
        <Text style={styles.cardName}>{name}</Text>
      )}
    </View>
  );
}

/** The back of a card: deep green, a gold border, the moon between two stars. */
export function CardBack() {
  return (
    <View style={[styles.card, styles.back]}>
      <Svg width="100%" height="100%" viewBox="0 0 58 100" preserveAspectRatio="none">
        <Rect x={3} y={3} width={52} height={94} rx={3} fill="none" stroke={colors.goldDeep} strokeWidth={0.8} />
        <Rect x={5.5} y={5.5} width={47} height={89} rx={2} fill="none" stroke={colors.goldLine} strokeWidth={0.5} />
        <Path d="M29 14 L44 50 L29 86 L14 50 Z" fill="none" stroke={colors.goldLine} strokeWidth={0.6} />
      </Svg>
      <View style={[styles.backMark, styles.noTouch]}>
        <Svg width={34} height={34} viewBox="0 0 24 24">
          <Path d="M15.5 4.5a7.5 7.5 0 1 0 4 13.6A6 6 0 0 1 15.5 4.5z" fill="none" stroke={colors.gold} strokeWidth={1.3} />
          <Circle cx={5} cy={4} r={0.9} fill={colors.gold} />
          <Circle cx={20} cy={21} r={0.9} fill={colors.gold} />
        </Svg>
      </View>
    </View>
  );
}

/** A rune cut into a pale river stone; blank for the back or the blank rune. */
export function RuneStone({ glyph, size }: { glyph: string; size: number }) {
  const [loaded] = useFonts(STAVE_FONTS);
  return (
    <View style={[styles.stone, { width: size, height: size * 1.18, borderRadius: size * 0.42 }]}>
      <View style={[styles.stoneSheen, styles.noTouch, { borderRadius: size * 0.42 }]} />
      {!!glyph && (
        <Text style={[styles.carved, loaded && styles.runic, { fontSize: size * 0.62, lineHeight: size * 0.8 }]} accessible={false}>
          {glyph}
        </Text>
      )}
    </View>
  );
}

/** An ogham letter cut along the edge of a wooden stave, read from the bottom up. */
export function OghamStave({ glyph, width, height }: { glyph: string; width: number; height: number }) {
  const [loaded] = useFonts(STAVE_FONTS);
  return (
    <View style={[styles.stave, { width, height, borderRadius: width * 0.3 }]}>
      <View style={[styles.grain, styles.noTouch]} />
      {!!glyph && (
        <View style={[styles.staveLetter, { width: height, height: width, left: (width - height) / 2, top: (height - width) / 2 }]}>
          <Text style={[styles.cut, loaded && styles.ogham, { fontSize: width * 1.5, lineHeight: width * 1.6 }]} accessible={false}>
            {glyph}
          </Text>
        </View>
      )}
    </View>
  );
}

/** A rune or ogham letter in gold on a small tile, for lists (an ogham letter stands upright, as on a stave). */
export function StaveGlyph({ glyph, kind, size }: { glyph: string; kind: 'runes' | 'ogham'; size: number }) {
  const [loaded] = useFonts(STAVE_FONTS);
  return (
    <View style={[styles.glyphTile, { width: size, height: size * 1.3 }]} accessible={false}>
      {!!glyph && (
        <Text
          style={[
            styles.glyph,
            loaded && (kind === 'runes' ? styles.runic : styles.ogham),
            { fontSize: size * 0.62, lineHeight: size * 0.8 },
            kind === 'ogham' && styles.glyphUpright,
          ]}
        >
          {glyph}
        </Text>
      )}
    </View>
  );
}

const fillAll = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

const styles = StyleSheet.create({
  side: { ...fillAll, backfaceVisibility: 'hidden' },
  turned: { transform: [{ rotate: '90deg' }] },
  pressed: { opacity: 0.85 },
  noTouch: { pointerEvents: 'none' },
  selected: { borderRadius: 8, borderWidth: 2, borderColor: colors.gold },
  fill: { width: '100%', height: '100%' },
  card: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: 'rgba(226,195,109,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upsideDown: { transform: [{ rotate: '180deg' }] },
  cardName: { fontFamily: fonts.display, fontSize: 16, color: colors.forestInk, textAlign: 'center', padding: 6 },
  back: { backgroundColor: '#123020', borderColor: colors.goldDeep },
  backMark: { ...fillAll, alignItems: 'center', justifyContent: 'center' },
  stone: {
    backgroundColor: '#8f8b80',
    borderWidth: 1,
    borderColor: '#6e6a60',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stoneSheen: {
    ...fillAll,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  // Cut into the stone: dark letter, a pale lip below it, a touch of gold in the groove.
  carved: {
    color: '#3b2a16',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(244,236,216,0.55)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 0.5,
  },
  runic: { fontFamily: 'NotoSansRunic', fontWeight: 'normal' },
  ogham: { fontFamily: 'NotoSansOgham' },
  stave: {
    backgroundColor: '#7a5636',
    borderWidth: 1,
    borderColor: '#5a3c22',
    overflow: 'hidden',
  },
  grain: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '28%',
    width: '18%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(40,22,8,0.18)',
  },
  glyphTile: {
    borderRadius: 6,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glyph: { color: colors.gold, textAlign: 'center' },
  glyphUpright: { transform: [{ rotate: '-90deg' }] },
  staveLetter: { position: 'absolute', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-90deg' }] },
  cut: {
    color: '#2a180a',
    textAlign: 'center',
    textShadowColor: 'rgba(230,200,150,0.45)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 0.5,
  },
});
