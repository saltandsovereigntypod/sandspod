// Look closer: the selected object drawn large, with everything its life has
// left on it (a candle burned down, its carvings, dressings, wax and flame;
// incense smoking; a charge's glow; an offering going over), so the detail
// can be seen without zooming the altar. The same drawing as the stage
// (AltarObjectArt), only bigger, with a few words on what you're seeing.

import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { altarImageSource } from '../../lib/altar/assets';
import { chargeDetail, chargeOf } from '../../lib/altar/charge';
import { displayBox } from '../../lib/altar/geometry';
import { incenseLife, isIncense } from '../../lib/altar/incense';
import { carvingsOf, dressingsOf, isCandle } from '../../lib/altar/livingState';
import { freshnessLine, offeringFreshness } from '../../lib/altar/offerings';
import type { SavedObject } from '../../lib/altar/types';
import { burnedDownLine, burnProgress, meltLine, waxLook } from '../../lib/altar/wax';
import { carvingLine } from '../../lib/altar/workings/dressing';
import { colors, radius, type } from '../../theme';
import { AltarObjectArt } from './AltarStage';
import { Sheet } from './Sheet';

type Props = {
  visible: boolean;
  object: SavedObject | null;
  label: string;
  /** The altar's background, laid dim behind it. */
  background?: string;
  /** How it's aging and how charged it is, as the stage shows them. */
  agedOpacity?: number;
  droop?: number;
  charge?: number;
  onClose: () => void;
};

export function CloseUpSheet({ visible, object, label, background, agedOpacity, droop, charge, onClose }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!visible) return;
    const opened = setTimeout(() => setNow(Date.now()), 0);
    const timer = setInterval(() => setNow(Date.now()), 20_000);
    return () => {
      clearTimeout(opened);
      clearInterval(timer);
    };
  }, [visible]);
  const window = useWindowDimensions();
  if (!object) return null;

  const aspect = displayBox(object).aspect || 1;
  // As large as fits: most of the sheet's width, and not taller than about half the screen.
  const maxWidth = Math.min(window.width - 64, 360);
  const maxHeight = Math.max(200, Math.min(window.height * 0.46, 420));
  const width = Math.min(maxWidth * (aspect < 1 ? 0.8 : 0.62), maxHeight / aspect);
  const height = width * aspect;
  // Room above it for a flame, smoke or glow.
  const frameHeight = height + Math.max(110, width * 0.7);
  const backdrop = altarImageSource(background);
  const lines = closeUpLines(object, now);

  return (
    <Sheet visible={visible} eyebrow="Look closer" title={label} onClose={onClose}>
      <View style={[styles.frame, { height: frameHeight }]} accessible accessibilityRole="image" accessibilityLabel={`${label}, close up. ${lines.join(' ')}`}>
        {backdrop && <Image source={backdrop} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={6} />}
        <View style={[StyleSheet.absoluteFill, styles.dim]} />
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="closeup-light" cx="50%" cy="55%" r="55%">
              <Stop offset="0" stopColor="rgb(255,236,200)" stopOpacity={0.16} />
              <Stop offset="1" stopColor="rgb(255,236,200)" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx="50%" cy="55%" rx="55%" ry="50%" fill="url(#closeup-light)" />
        </Svg>
        <View style={[styles.object, { width, height, top: frameHeight - height - 18 }]}>
          <AltarObjectArt object={object} width={width} height={height} agedOpacity={agedOpacity} droop={droop} charge={charge} now={now} />
        </View>
      </View>
      {lines.length > 0 && (
        <View style={styles.lines}>
          {lines.map((line, i) => (
            <Text key={i} style={type.caption}>
              {line}
            </Text>
          ))}
        </View>
      )}
    </Sheet>
  );
}

/** A few plain words on what the close-up shows. */
function closeUpLines(object: SavedObject, now: number): string[] {
  const lines: string[] = [];
  if (isCandle(object)) {
    lines.push(burnedDownLine(object, now));
    const melt = meltLine(object, now);
    if (melt) lines.push(melt);
    const wax = waxLook(object, now);
    if (wax.line) lines.push(wax.line);
    const progress = burnProgress(object, now);
    for (const carving of carvingsOf(object)) lines.push(carvingLine(carving, progress));
    const dressings = dressingsOf(object);
    if (dressings.length) lines.push(`Dressed with ${dressings.map((d) => d.label).filter(Boolean).join(', ')}.`);
  }
  if (isIncense(object)) {
    const incense = incenseLife(object, now);
    if (incense.lit) lines.push('Smoke is rising from it.');
    else if (incense.ash) lines.push('Burned to ash.');
  }
  const fresh = offeringFreshness(object, now);
  if (fresh) lines.push(freshnessLine(fresh.kind, fresh));
  const charge = chargeOf(object, now);
  if (charge && charge.strength > 0) lines.push(`A ${charge.level === 'strong' ? 'strong' : 'settling'} charge glows about it. ${chargeDetail(charge)}`);
  return lines.filter(Boolean);
}

const styles = StyleSheet.create({
  frame: { borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: colors.goldLine, backgroundColor: colors.night },
  dim: { backgroundColor: 'rgba(6,8,6,0.45)' },
  object: { position: 'absolute', alignSelf: 'center' },
  lines: { gap: 6 },
});
