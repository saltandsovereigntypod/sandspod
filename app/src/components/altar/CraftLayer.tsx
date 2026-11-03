// What the round-two tools leave on the altar, drawn over the objects: the
// crystal grid's lines of light between its stones, and steam rising from a
// cauldron while its simmer pot is going (lib/altar/craftTools.ts). Still
// with Reduce Motion. The website draws the same (altar/js/features/altar-craft.js).

import { memo, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Line } from 'react-native-svg';

import { useReducedMotion } from '../../lib/accessibility/store';
import { gridLines, isCauldron, simmerSteam } from '../../lib/altar/craftTools';
import { displayBox, STAGE_ASPECT } from '../../lib/altar/geometry';
import type { AltarDocument } from '../../lib/altar/snapshot';

type Props = { doc: AltarDocument; stageWidth: number; stageHeight: number; now: number };

function Steam({ x, y, size, strength }: { x: number; y: number; size: number; strength: number }) {
  const still = useReducedMotion();
  const [rise] = useState(() => [0, 1, 2].map(() => new Animated.Value(0)));
  useEffect(() => {
    if (still) return;
    const loops = rise.map((v, i) =>
      Animated.loop(Animated.sequence([Animated.delay(i * 900), Animated.timing(v, { toValue: 1, duration: 2700, easing: Easing.out(Easing.quad), useNativeDriver: true })])),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [still, rise]);
  return (
    <>
      {rise.map((v, i) => {
        const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.9] });
        const translateX = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, (i - 1) * size * 0.08, (i - 1) * size * 0.16] });
        const opacity = still ? 0.3 * strength : v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.45 * strength, 0] });
        const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] });
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{ position: 'absolute', left: x - size * 0.2 + (i - 1) * size * 0.12, top: y - size * 0.35, width: size * 0.4, height: size * 0.4, opacity, transform: [{ translateX }, { translateY }, { scale }] }}
          >
            <Svg width="100%" height="100%" viewBox="0 0 10 10">
              <Ellipse cx={5} cy={5} rx={4} ry={5} fill="#e8ece8" />
            </Svg>
          </Animated.View>
        );
      })}
    </>
  );
}

export const CraftLayer = memo(function CraftLayer({ doc, stageWidth: w, stageHeight: h, now }: Props) {
  const lines = gridLines(doc);
  const pots = doc.objects.filter((o) => isCauldron(o) && simmerSteam(o, now) > 0);
  if (!lines.length && !pots.length) return null;
  const unit = w / 600;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {lines.length > 0 && (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          {lines.map((l, i) => (
            <Line key={`g${i}`} x1={l.x1 * w} y1={l.y1 * h} x2={l.x2 * w} y2={l.y2 * h} stroke="rgb(230,236,255)" strokeOpacity={0.25} strokeWidth={6 * unit} strokeLinecap="round" />
          ))}
          {lines.map((l, i) => (
            <Line key={`c${i}`} x1={l.x1 * w} y1={l.y1 * h} x2={l.x2 * w} y2={l.y2 * h} stroke="rgb(245,248,255)" strokeOpacity={0.85} strokeWidth={1.2 * unit} strokeLinecap="round" />
          ))}
        </Svg>
      )}
      {pots.map((o) => {
        const b = displayBox(o);
        const size = b.size * w;
        const top = (b.cy - (b.size * b.aspect * STAGE_ASPECT) / 2) * h;
        return <Steam key={String(o.altarObjectId)} x={b.cx * w} y={top} size={size} strength={simmerSteam(o, now)} />;
      })}
    </View>
  );
});
