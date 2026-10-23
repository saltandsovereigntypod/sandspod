// Depth from the phone's tilt: as you tip the phone, the background shifts a
// little one way and the objects a little less, so the altar has depth, and
// candle flames lean against the tilt as real ones would. Tilt is measured
// from however you're holding the phone (that slowly becomes the new rest),
// so it never needs holding flat. Off with Reduce Motion or Tilt depth.

import { Accelerometer } from 'expo-sensors';
import { createContext, useContext, useEffect, useState } from 'react';
import { Animated, Platform } from 'react-native';

import { useAccessibility } from '../../lib/accessibility/store';

/** -1 … 1 each way: x right side down, y top toward you. */
export type Tilt = { x: Animated.Value; y: Animated.Value };

const TiltContext = createContext<Tilt | null>(null);
export const TiltProvider = TiltContext.Provider;
export const useTilt = () => useContext(TiltContext);

/** How far from rest counts as a full tilt, in g. */
const FULL = 0.28;
/** How quickly the rest follows how you hold it (per reading). */
const SETTLE = 0.015;
/** How much each reading is smoothed. */
const SMOOTH = 0.25;

/** The phone's tilt while `on` (and Tilt depth is on and motion isn't reduced); null otherwise. */
export function useTiltSource(on: boolean): Tilt | null {
  const prefs = useAccessibility();
  const enabled = on && prefs.tiltDepth && !prefs.reduceMotion && Platform.OS !== 'web';
  const [tilt] = useState<Tilt>(() => ({ x: new Animated.Value(0), y: new Animated.Value(0) }));
  useEffect(() => {
    if (!enabled) {
      tilt.x.setValue(0);
      tilt.y.setValue(0);
      return;
    }
    let rest: { x: number; y: number } | null = null;
    let now = { x: 0, y: 0 };
    let sub: { remove: () => void } | null = null;
    let stopped = false;
    void Accelerometer.isAvailableAsync()
      .then((available) => {
        if (!available || stopped) return;
        Accelerometer.setUpdateInterval(33);
        sub = Accelerometer.addListener(({ x, y }) => {
          if (!rest) rest = { x, y };
          rest = { x: rest.x + (x - rest.x) * SETTLE, y: rest.y + (y - rest.y) * SETTLE };
          const tx = Math.max(-1, Math.min(1, (x - rest.x) / FULL));
          const ty = Math.max(-1, Math.min(1, (y - rest.y) / FULL));
          now = { x: now.x + (tx - now.x) * SMOOTH, y: now.y + (ty - now.y) * SMOOTH };
          tilt.x.setValue(now.x);
          tilt.y.setValue(now.y);
        });
      })
      .catch(() => {});
    return () => {
      stopped = true;
      sub?.remove();
      tilt.x.setValue(0);
      tilt.y.setValue(0);
    };
  }, [enabled, tilt]);
  return enabled ? tilt : null;
}

/** A layer shifted by the tilt: `depth` points at a full tilt (background more, objects less). */
export function tiltShift(tilt: Tilt | null, depth: number) {
  if (!tilt) return null;
  return {
    transform: [
      { translateX: tilt.x.interpolate({ inputRange: [-1, 1], outputRange: [depth, -depth] }) },
      { translateY: tilt.y.interpolate({ inputRange: [-1, 1], outputRange: [-depth * 0.7, depth * 0.7] }) },
    ],
  };
}
