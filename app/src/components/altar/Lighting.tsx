// The light candles cast on the altar, moving with their flames: each lit
// candle's flame shares how bright it burns, which way it leans and how tall
// it stands (FlameMotion), and the warm pool on the altar, the glow in its
// wax, the shadows objects cast away from it and the room's own breathing
// light all follow it. At night the room darkens except where candles light it.

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Mask, RadialGradient, Rect, Stop } from 'react-native-svg';

import { pictureBox } from '../../lib/altar/flame';
import { boxToPixels, candleLightRadius, displayBox, imageRatio, rotationOf, STAGE_ASPECT } from '../../lib/altar/geometry';
import { isCandle, isLit } from '../../lib/altar/livingState';
import type { SavedObject } from '../../lib/altar/types';
import { candleGeometry } from './CandleMarks';


// ── The flames' motion, shared ────────────────────────────────────────────

/** How a flame is moving now: `glow` 0.7–1, `lean` in degrees, `tall` 0.6 (short, fat) … 1.5 (tall, thin). */
export type FlameMotion = { glow: Animated.Value; lean: Animated.Value; tall: Animated.Value };

export function useFlameMotion(): FlameMotion {
  const [motion] = useState<FlameMotion>(() => ({ glow: new Animated.Value(1), lean: new Animated.Value(0), tall: new Animated.Value(1) }));
  return motion;
}

const flames = new Map<string, FlameMotion>();
let version = 0;
const listeners = new Set<() => void>();
const changed = () => {
  version += 1;
  listeners.forEach((l) => l());
};

/** Lets the light, shadows and wax around a candle follow its flame (the stage's flame; a close-up's flame only while the stage has none). */
export function useShareFlame(uid: string, motion: FlameMotion, on: boolean) {
  useEffect(() => {
    if (!on || !uid) return;
    if (flames.has(uid)) return;
    flames.set(uid, motion);
    changed();
    return () => {
      if (flames.get(uid) === motion) {
        flames.delete(uid);
        changed();
      }
    };
  }, [uid, motion, on]);
}

function useFlames(): Map<string, FlameMotion> {
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => version,
  );
  return flames;
}

const uidOf = (object: SavedObject) => String(object.altarObjectId || '');

// ── Where things stand ────────────────────────────────────────────────────

/** The foot of an object's picture on the stage (where it meets the altar), and the picture's width and height, in pixels. */
function footOf(object: SavedObject, stageWidth: number) {
  const rect = boxToPixels(displayBox(object), stageWidth);
  const ratio = object.imagePath ? imageRatio(String(object.imagePath)) : null;
  const pic = ratio ? pictureBox(ratio, rect.height / rect.width) : { left: 0.1, top: 0.1, width: 0.8, height: 0.82 };
  const angle = (rotationOf(object) * Math.PI) / 180;
  // The foot, turned with the object about its centre.
  const fx = rect.left + (pic.left + pic.width / 2) * rect.width - rect.centerX;
  const fy = rect.top + (pic.top + pic.height) * rect.height - rect.centerY;
  return {
    x: rect.centerX + fx * Math.cos(angle) - fy * Math.sin(angle),
    y: rect.centerY + fx * Math.sin(angle) + fy * Math.cos(angle),
    width: pic.width * rect.width,
    height: pic.height * rect.height,
    rect,
  };
}

/** Where a lit candle's light comes from: a little below the top of its (burned-down) candle. */
function lightOf(object: SavedObject, stageWidth: number, now: number) {
  const box = displayBox(object);
  const rect = boxToPixels(box, stageWidth);
  const angle = (rotationOf(object) * Math.PI) / 180;
  const boundsHeight = rect.width * Math.abs(Math.sin(angle)) + rect.height * Math.abs(Math.cos(angle));
  const y = rect.centerY - boundsHeight / 2 + boundsHeight * 0.1 + candleGeometry(object, rect.width, rect.height, now).dropPx * Math.abs(Math.cos(angle));
  return { x: rect.centerX, y, r: candleLightRadius(box.size) * stageWidth };
}

// ── The light ─────────────────────────────────────────────────────────────

/**
 * The warm pools of light the website paints around lit candles
 * (renderLighting), each brightening and dimming with its flame, swaying as
 * it leans, and the whole room breathing faintly with the candlelight.
 */
export function LightPools({ objects, stageWidth, now }: { objects: SavedObject[]; stageWidth: number; now: number }) {
  const shared = useFlames();
  const stageHeight = stageWidth / STAGE_ASPECT;
  const first = objects.map((o) => shared.get(uidOf(o))).find(Boolean);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {first && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgb(255,170,90)', opacity: first.glow.interpolate({ inputRange: [0.7, 1], outputRange: [0.015, 0.02 + 0.012 * Math.min(4, objects.length)] }) },
          ]}
        />
      )}
      {objects.map((object, i) => {
        const light = lightOf(object, stageWidth, now);
        const motion = shared.get(uidOf(object));
        const size = light.r * 2;
        const style = motion
          ? {
              opacity: motion.glow.interpolate({ inputRange: [0.7, 1], outputRange: [0.68, 1] }),
              transform: [
                { translateX: motion.lean.interpolate({ inputRange: [-30, 30], outputRange: [-light.r * 0.07, light.r * 0.07] }) },
                { scale: motion.tall.interpolate({ inputRange: [0.6, 1.5], outputRange: [0.95, 1.06] }) },
              ],
            }
          : null;
        return (
          <Animated.View key={`${uidOf(object)}-${i}`} style={[{ position: 'absolute', left: light.x - light.r, top: light.y - light.r, width: size, height: size }, style]}>
            <Svg width={size} height={size}>
              <Defs>
                <RadialGradient id={`candle-light-${i}`} cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor="rgb(255,245,210)" stopOpacity={0.42} />
                  <Stop offset="0.18" stopColor="rgb(255,220,150)" stopOpacity={0.27} />
                  <Stop offset="0.45" stopColor="rgb(255,180,80)" stopOpacity={0.13} />
                  <Stop offset="1" stopColor="rgb(255,180,80)" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx={light.r} cy={light.r} r={light.r} fill={`url(#candle-light-${i})`} />
            </Svg>
          </Animated.View>
        );
      })}
      {/* Keeps the layer the stage's size, so nothing above shifts. */}
      <View style={{ width: stageWidth, height: stageHeight }} />
    </View>
  );
}

// ── Shadows ───────────────────────────────────────────────────────────────

/** At most this many cast shadows at once, nearest first. */
const MAX_SHADOWS = 24;
/** How much flatter the altar's surface looks than the stage (shadows fall across it, so their up-and-down is squashed). */
const SURFACE = 0.4;

/**
 * The faint shadows objects cast away from each lit candle near them,
 * stretching across the altar, swinging as the flame leans and shortening
 * as it stands tall.
 */
export function CastShadows({ objects, stageWidth, now }: { objects: SavedObject[]; stageWidth: number; now: number }) {
  const shared = useFlames();
  const candles = objects.filter((o) => isCandle(o) && isLit(o));
  if (!candles.length) return null;
  const shadows: { key: string; x: number; y: number; length: number; thick: number; angle: number; strength: number; motion?: FlameMotion }[] = [];
  for (const candle of candles) {
    const source = footOf(candle, stageWidth);
    const reach = lightOf(candle, stageWidth, now).r * 1.7;
    for (const object of objects) {
      if (object === candle) continue;
      const foot = footOf(object, stageWidth);
      const dx = foot.x - source.x;
      const dy = foot.y - source.y;
      const distance = Math.hypot(dx, dy);
      if (distance > reach || distance < 2) continue;
      const near = 1 - distance / reach;
      // Across the altar's surface: sideways stays long, toward or away from you shortens.
      const angle = Math.atan2(dy * SURFACE, dx);
      const along = Math.hypot(Math.cos(Math.atan2(dy, dx)), SURFACE * Math.sin(Math.atan2(dy, dx)));
      const length = foot.height * (0.45 + 0.55 * near) * along;
      if (length < 4) continue;
      shadows.push({
        key: `${uidOf(candle)}>${uidOf(object)}`,
        // Starting a little up behind the object's foot, so it never shows a gap under it.
        x: foot.x,
        y: foot.y - foot.height * 0.08,
        length,
        thick: Math.max(3, foot.width * 0.55),
        angle: (angle * 180) / Math.PI,
        strength: 0.42 * Math.pow(near, 1.1),
        motion: shared.get(uidOf(candle)),
      });
    }
  }
  shadows.sort((a, b) => b.strength - a.strength);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {shadows.slice(0, MAX_SHADOWS).map((s) => {
        const half = s.length / 2;
        const moving = s.motion
          ? {
              opacity: s.motion.glow.interpolate({ inputRange: [0.7, 1], outputRange: [s.strength * 0.8, s.strength] }),
              transform: [
                { translateX: -half },
                { rotate: s.motion.lean.interpolate({ inputRange: [-30, 30], outputRange: ['9deg', '-9deg'] }) },
                { scaleX: s.motion.tall.interpolate({ inputRange: [0.6, 1.5], outputRange: [1.14, 0.88] }) },
                { translateX: half },
              ],
            }
          : { opacity: s.strength };
        return (
          <View
            key={s.key}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y - s.thick / 2,
              width: s.length,
              height: s.thick,
              // Turned about its near end, at the object's foot.
              transform: [{ translateX: -half }, { rotate: `${s.angle}deg` }, { translateX: half }],
            }}
          >
            <Animated.View style={[StyleSheet.absoluteFill, moving]}>
              <Svg width={s.length} height={s.thick} viewBox="0 0 100 20" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="cast-shadow" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="rgb(0,0,0)" stopOpacity={0.9} />
                    <Stop offset="0.55" stopColor="rgb(0,0,0)" stopOpacity={0.45} />
                    <Stop offset="1" stopColor="rgb(0,0,0)" stopOpacity={0} />
                  </LinearGradient>
                </Defs>
                <Ellipse cx={42} cy={10} rx={52} ry={8.5} fill="url(#cast-shadow)" />
              </Svg>
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}

// ── The glow in the wax ───────────────────────────────────────────────────

/**
 * A lit candle's wax glowing from inside below the flame, as real wax does:
 * warm and bright at the top, fading down the body, and breathing with the
 * flame. Shows through the glass of a novena or jar too.
 */
export function WaxGlow({ object, width, height, now, motion }: { object: SavedObject; width: number; height: number; now: number; motion: FlameMotion }) {
  const geometry = candleGeometry(object, width, height, now);
  const { burn, pic } = geometry;
  if (!burn || !pic || burn.mode === 'none') return null;
  const cx = (geometry.flame.centerX / 100) * width;
  const half = burn.half * pic.width;
  const rim = Math.max(1.2, half * 0.2);
  const surface = pic.top + burn.waxTop * pic.height;
  const bottom = pic.top + burn.bottom * pic.height;
  const depth = Math.min(bottom - surface, Math.max(half * 2.6, (bottom - surface) * 0.45));
  if (!(depth > 2)) return null;
  const id = `wax-glow-${uidOf(object)}-${Math.round(width)}`;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: cx - half,
        top: surface - rim,
        width: half * 2,
        height: depth + rim,
        opacity: motion.glow.interpolate({ inputRange: [0.7, 1], outputRange: [0.5, 1] }),
      }}
    >
      <Svg width={half * 2} height={depth + rim}>
        <Defs>
          <LinearGradient id={`${id}-down`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgb(255,222,150)" stopOpacity={0.62} />
            <Stop offset="0.3" stopColor="rgb(255,184,96)" stopOpacity={0.32} />
            <Stop offset="1" stopColor="rgb(255,160,70)" stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id={`${id}-across`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="rgb(255,255,255)" stopOpacity={0.25} />
            <Stop offset="0.5" stopColor="rgb(255,255,255)" stopOpacity={1} />
            <Stop offset="1" stopColor="rgb(255,255,255)" stopOpacity={0.25} />
          </LinearGradient>
          <Mask id={`${id}-mask`}>
            <Rect x={0} y={0} width={half * 2} height={depth + rim} fill={`url(#${id}-across)`} />
          </Mask>
        </Defs>
        <Rect x={0} y={0} width={half * 2} height={depth + rim} fill={`url(#${id}-down)`} mask={`url(#${id}-mask)`} rx={half * 0.25} />
      </Svg>
    </Animated.View>
  );
}

// ── Night ─────────────────────────────────────────────────────────────────

/**
 * The room after dark: everything dimmer, except round each lit candle,
 * where its light holds the dark back. `darkness` 0 (day) … ~0.45 (night).
 */
export function NightVeil({ objects, stageWidth, now, darkness }: { objects: SavedObject[]; stageWidth: number; now: number; darkness: number }) {
  if (!(darkness > 0.01)) return null;
  const stageHeight = stageWidth / STAGE_ASPECT;
  const lights = objects.filter((o) => isCandle(o) && isLit(o)).map((o) => lightOf(o, stageWidth, now));
  return (
    <Svg width={stageWidth} height={stageHeight} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="night-hole" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="rgb(0,0,0)" stopOpacity={1} />
          <Stop offset="0.45" stopColor="rgb(0,0,0)" stopOpacity={0.7} />
          <Stop offset="1" stopColor="rgb(0,0,0)" stopOpacity={0} />
        </RadialGradient>
        <Mask id="night-mask">
          <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill="rgb(255,255,255)" />
          {lights.map((l, i) => (
            <Circle key={i} cx={l.x} cy={l.y} r={l.r * 2.1} fill="url(#night-hole)" />
          ))}
        </Mask>
      </Defs>
      <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill="rgb(6,9,22)" opacity={darkness} mask="url(#night-mask)" />
    </Svg>
  );
}

