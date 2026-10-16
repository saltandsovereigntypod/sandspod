// A spell jar drawn in SVG: glass, the layers stacked inside in their
// colours, and the wax seal over the cork once it's sealed.

import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useReducedMotion } from '../../../lib/accessibility/store';
import type { LayerBand } from '../../../lib/altar/workings/spellJar';
import { colors } from '../../../theme';

type Props = {
  bands: LayerBand[];
  /** The wax colour (hex) once sealed. */
  seal?: string | null;
  size?: number;
  /** Change this to give the jar a gentle shake (shake to renew). */
  shakeKey?: number;
};

// Drawn on a 100 × 140 box: shoulders at y 34, base at 132.
const BODY = 'M30 22 h40 v8 q0 4 6 8 q14 9 14 26 v52 q0 16 -16 16 h-48 q-16 0 -16 -16 v-52 q0 -17 14 -26 q6 -4 6 -8 z';
const INSIDE_TOP = 40;
const INSIDE_BOTTOM = 130;

export function JarVisual({ bands, seal, size = 150, shakeKey = 0 }: Props) {
  const reduceMotion = useReducedMotion();
  const [tilt] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!shakeKey || reduceMotion) return;
    tilt.setValue(0);
    Animated.sequence(
      [6, -6, 4, -4, 2, 0].map((toValue) => Animated.timing(tilt, { toValue, duration: 90, useNativeDriver: true })),
    ).start();
  }, [shakeKey, reduceMotion, tilt]);
  const rotate = tilt.interpolate({ inputRange: [-10, 10], outputRange: ['-10deg', '10deg'] });
  const height = INSIDE_BOTTOM - INSIDE_TOP;
  const label = bands.length
    ? `A spell jar with ${bands.length} layer${bands.length === 1 ? '' : 's'}: ${bands.map((b) => b.label).join(', ')}${seal ? ', sealed with wax' : ''}`
    : 'An empty spell jar';

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={size} height={size * 1.4} viewBox="0 0 100 140">
          <Defs>
            <ClipPath id="jar-inside">
              <Path d={BODY} />
            </ClipPath>
            <LinearGradient id="jar-glass" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
              <Stop offset="0.35" stopColor="#ffffff" stopOpacity="0.03" />
              <Stop offset="1" stopColor="#ffffff" stopOpacity="0.1" />
            </LinearGradient>
          </Defs>
          <G clipPath="url(#jar-inside)">
            {bands.map((band, i) => {
              const y1 = INSIDE_BOTTOM - band.to * height;
              const y0 = INSIDE_BOTTOM - band.from * height;
              return <Rect key={`${band.label}-${i}`} x={0} y={y1} width={100} height={Math.max(0, y0 - y1) + 0.6} fill={band.color} opacity={0.92} />;
            })}
          </G>
          <Path d={BODY} fill="url(#jar-glass)" stroke={colors.goldLine} strokeWidth={1.6} />
          {/* The cork. */}
          <Rect x={33} y={10} width={34} height={14} rx={3} fill="#a07a4f" stroke="#7a5a38" strokeWidth={1} />
          {seal ? (
            <G>
              <Ellipse cx={50} cy={13} rx={21} ry={8} fill={seal} />
              <Path d={`M32 15 q-2 8 1 10 q3 -2 2 -10 z M62 16 q0 9 3 9 q2 -3 0 -10 z M46 18 q-1 6 2 7 q2 -2 1 -7 z`} fill={seal} />
              <Ellipse cx={45} cy={10} rx={6} ry={2} fill="#ffffff" opacity={0.18} />
            </G>
          ) : null}
          {/* A glint on the glass. */}
          <Path d="M22 62 q-2 20 0 44" stroke="#ffffff" strokeOpacity={0.18} strokeWidth={3} strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}
