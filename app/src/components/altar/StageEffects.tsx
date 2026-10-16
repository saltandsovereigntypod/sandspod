// Quiet things the stage draws around objects: the faint glow a charged object
// keeps (fading as its charge does), the short moment that plays when
// something is cleansed or charged (smoke curling, a salt circle drawn,
// moonlight or sunlight washing over it, a tone rippling out), and the guide
// that shows where a dragged object would settle. Reduce Motion: the moment
// shows still, and the glow never moves anyway.

import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { useReducedMotion } from '../../lib/accessibility/store';
import { MOMENT_MS, type MomentKind } from '../../lib/altar/charge';
import { colors, fonts } from '../../theme';

const useNative = Platform.OS !== 'web';

/** Where a charge's glints sit round the object: [x, y] as fractions of its box, and how big. */
const GLINTS: [number, number, number][] = [[0.12, 0.18, 1], [0.86, 0.32, 0.8], [0.22, 0.62, 0.65], [0.8, 0.74, 0.9]];

/**
 * A charged object's glow: pale moon-silver round it, as strong as its charge,
 * breathing slowly, with a few glints about it while the charge is strong.
 * Drawn behind its picture. Reduce Motion: the same glow, still.
 */
export function ChargeAura({ strength, id }: { strength: number; id: string }) {
  const still = useReducedMotion();
  const [breath] = useState(() => new Animated.Value(still ? 1 : 0));
  useEffect(() => {
    if (still) {
      breath.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
        Animated.timing(breath, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: useNative }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath, still]);
  if (!(strength > 0.02)) return null;
  const opacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const glints = strength > 0.35 ? GLINTS.slice(0, strength > 0.7 ? 4 : 2) : [];
  return (
    <>
      <Animated.View style={[styles.aura, { opacity }]} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <RadialGradient id={`charge-${id}`} cx="50%" cy="55%" r="50%">
              <Stop offset="0" stopColor="rgb(236,242,255)" stopOpacity={0.95 * strength} />
              <Stop offset="0.4" stopColor="rgb(196,212,255)" stopOpacity={0.6 * strength} />
              <Stop offset="0.75" stopColor="rgb(170,190,250)" stopOpacity={0.22 * strength} />
              <Stop offset="1" stopColor="rgb(170,190,250)" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={50} cy={55} rx={50} ry={48} fill={`url(#charge-${id})`} />
        </Svg>
      </Animated.View>
      {glints.map(([x, y, size], i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[styles.glint, { left: `${x * 100}%`, top: `${y * 100}%`, width: `${16 * size}%`, aspectRatio: 1, opacity: still ? 0.9 : breath.interpolate({ inputRange: [0, 1], outputRange: i % 2 ? [1, 0.35] : [0.35, 1] }) }]}
        >
          <Svg width="100%" height="100%" viewBox="0 0 10 10">
            <Path d="M5 0 L5.9 4.1 L10 5 L5.9 5.9 L5 10 L4.1 5.9 L0 5 L4.1 4.1 Z" fill="rgb(240,246,255)" />
            <Circle cx={5} cy={5} r={1.3} fill="rgb(255,255,255)" />
          </Svg>
        </Animated.View>
      ))}
    </>
  );
}

type Rect = { left: number; top: number; width: number; height: number };

/** One moment over one object. `rect` is in stage pixels. */
export function Moment({ kind, rect }: { kind: MomentKind; rect: Rect }) {
  const still = useReducedMotion();
  const [t] = useState(() => new Animated.Value(still ? 0.5 : 0));
  useEffect(() => {
    if (still) return;
    const run = Animated.timing(t, { toValue: 1, duration: MOMENT_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: useNative });
    run.start();
    return () => run.stop();
  }, [t, still]);

  // Fade in, hold, fade out (Reduce Motion: a still, soft version).
  const fade = still ? 0.85 : t.interpolate({ inputRange: [0, 0.12, 0.75, 1], outputRange: [0, 1, 0.9, 0] });
  const size = Math.max(rect.width, rect.height * 0.6);
  const cx = rect.left + rect.width / 2;
  const base = rect.top + rect.height * 0.92;

  if (kind === 'moon' || kind === 'sun') {
    const tone = kind === 'moon' ? 'rgb(206,222,255)' : 'rgb(255,214,140)';
    const translateY = still ? 0 : t.interpolate({ inputRange: [0, 1], outputRange: [-rect.height * 0.35, 0] });
    const w = Math.max(rect.width * 3, 90);
    const h = Math.max(rect.height * 1.8, 90);
    return (
      <Animated.View pointerEvents="none" style={{ position: 'absolute', left: cx - w / 2, top: rect.top - h * 0.25, width: w, height: h, opacity: fade, transform: [{ translateY }] }}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={`shaft-${kind}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={tone} stopOpacity={0} />
              <Stop offset="0.5" stopColor={tone} stopOpacity={0.35} />
              <Stop offset="1" stopColor={tone} stopOpacity={0} />
            </LinearGradient>
            <RadialGradient id={`wash-${kind}`} cx="50%" cy="52%" r="50%">
              <Stop offset="0" stopColor={tone} stopOpacity={0.9} />
              <Stop offset="0.5" stopColor={tone} stopOpacity={0.45} />
              <Stop offset="1" stopColor={tone} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={50} cy={52} rx={49} ry={47} fill={`url(#wash-${kind})`} />
          {/* A shaft of light falling onto it. */}
          <Path d="M40 0 L60 0 L57 72 L43 72 Z" fill={`url(#shaft-${kind})`} />
        </Svg>
      </Animated.View>
    );
  }

  if (kind === 'sound') {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {[0, 1, 2].map((i) => {
          const start = i * 0.18;
          const scale = still ? 0.7 + i * 0.35 : t.interpolate({ inputRange: [0, start, 1], outputRange: [0.3, 0.3, 1.7 + i * 0.2], extrapolate: 'clamp' });
          const opacity = still ? 0.7 - i * 0.15 : t.interpolate({ inputRange: [0, start, start + 0.1, 1], outputRange: [0, 0, 0.95, 0], extrapolate: 'clamp' });
          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: cx - size / 2,
                top: rect.top + rect.height / 2 - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 2.5,
                borderColor: 'rgba(250,236,196,0.95)',
                boxShadow: '0 0 6px rgba(255,236,190,0.6)',
                opacity,
                transform: [{ scale }],
              }}
            />
          );
        })}
      </View>
    );
  }

  if (kind === 'salt') {
    // Grains around the object's foot, appearing one by one round the circle.
    const n = 24;
    const rx = Math.max(rect.width * 0.85, 18);
    const ry = rx * 0.3;
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 + Math.PI / 2;
          const appear = i / n;
          const opacity = still ? 0.8 : t.interpolate({ inputRange: [0, appear * 0.6, appear * 0.6 + 0.08, 0.85, 1], outputRange: [0, 0, 1, 1, 0], extrapolate: 'clamp' });
          const grain = Math.max(3, rect.width * 0.07);
          return (
            <Animated.View
              key={i}
              style={{ position: 'absolute', left: cx + Math.cos(a) * rx - grain / 2, top: base + Math.sin(a) * ry - grain / 2, width: grain, height: grain, borderRadius: grain / 2, backgroundColor: 'rgb(250,248,240)', boxShadow: '0 0 3px rgba(255,255,255,0.8)', opacity }}
            />
          );
        })}
      </View>
    );
  }

  // Smoke: three wisps curling up and around it.
  const wisp = Math.max(28, rect.width * 1.1);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {[0, 1, 2].map((i) => {
        const side = i === 1 ? 1 : -1;
        const translateY = still ? -rect.height * 0.3 * (i + 1) * 0.5 : t.interpolate({ inputRange: [0, 1], outputRange: [0, -rect.height * (0.8 + i * 0.15)] });
        const translateX = still ? 0 : t.interpolate({ inputRange: [0, 0.3, 0.6, 1], outputRange: [side * rect.width * 0.35, -side * rect.width * 0.4, side * rect.width * 0.3, -side * rect.width * 0.1] });
        const scale = still ? 1 : t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.6] });
        const opacity = still ? 0.6 : t.interpolate({ inputRange: [0, 0.2 + i * 0.05, 0.75, 1], outputRange: [0, 0.9, 0.5, 0] });
        return (
          <Animated.View
            key={i}
            style={{ position: 'absolute', left: cx - wisp / 2, top: base - wisp, width: wisp, height: wisp * 1.3, opacity, transform: [{ translateX }, { translateY }, { scale }] }}
          >
            <Svg width="100%" height="100%" viewBox="0 0 10 13">
              <Defs>
                <RadialGradient id={`moment-wisp-${i}`} cx="50%" cy="55%" r="50%">
                  <Stop offset="0" stopColor="rgb(222,224,230)" stopOpacity={0.95} />
                  <Stop offset="0.55" stopColor="rgb(176,180,192)" stopOpacity={0.5} />
                  <Stop offset="1" stopColor="rgb(176,180,192)" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Ellipse cx={5} cy={7} rx={4.5} ry={6} fill={`url(#moment-wisp-${i})`} />
            </Svg>
          </Animated.View>
        );
      })}
    </View>
  );
}

/** Where a dragged object would settle: a dashed ring on the spot and its name. Stage pixels. */
export function SnapGuide({ x, y, role, scale, width, height }: { x: number; y: number; role: string; scale: number; width: number; height: number }) {
  const r = Math.max(10, 18 * scale);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Ellipse cx={x} cy={y} rx={r * 1.6} ry={r * 0.55} stroke={colors.gold} strokeOpacity={0.85} strokeWidth={1.5} strokeDasharray="4 4" fill="rgba(226,195,109,0.08)" />
        <Circle cx={x} cy={y} r={2} fill={colors.gold} />
      </Svg>
      <Text style={[styles.role, { left: x - 80, top: y + r * 0.7 }]} numberOfLines={1}>
        {role}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  aura: { position: 'absolute', left: '-45%', top: '-18%', width: '190%', height: '136%' },
  glint: { position: 'absolute', marginLeft: '-8%', marginTop: '-8%' },
  role: {
    position: 'absolute',
    width: 160,
    textAlign: 'center',
    color: colors.gold,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 0.5,
    textShadowColor: '#000',
    textShadowRadius: 3,
  },
});
