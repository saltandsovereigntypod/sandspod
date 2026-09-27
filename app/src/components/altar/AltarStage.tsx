import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { altarImageSource, candleHerbOverlay, candleOilOverlay, useImageRatio, useImageRatioVersion } from '../../lib/altar/assets';
import { DEFAULT_BACKGROUND } from '../../lib/altar/cabinet';
import { boxToPixels, candleLightRadius, displayBox, hitTest, IMAGE_INSET, rotationOf, STAGE_ASPECT } from '../../lib/altar/geometry';
import { stackOrder } from '../../lib/altar/layers';
import { dressingOverlays, isCandle, isLit } from '../../lib/altar/livingState';
import type { AltarDocument } from '../../lib/altar/snapshot';
import type { SavedObject } from '../../lib/altar/types';
import { colors, fonts } from '../../theme';

export type Viewport = { zoom: number; offsetX: number; offsetY: number };

type Props = {
  doc: AltarDocument;
  /** Width of the visible stage on screen; height follows the website's 16:9. */
  width: number;
  viewport: Viewport;
  selected: number | null;
  /** When dressing a candle, candles are highlighted and tapping one picks it. */
  highlightCandles?: boolean;
  onSelect: (index: number | null) => void;
  onGestureStart: (index: number) => void;
  onMove: (index: number, cx: number, cy: number) => void;
  onResize: (index: number, size: number) => void;
  onRotate: (index: number, degrees: number) => void;
  onGestureEnd: () => void;
  onViewportChange: (viewport: Viewport) => void;
};

/** Smallest hit area for tiny objects, in screen points. */
const MIN_TOUCH = 36;

export function clampViewport(viewport: Viewport, width: number): Viewport {
  const height = width / STAGE_ASPECT;
  const zoom = Math.max(1, Math.min(viewport.zoom, 4));
  const maxX = width * zoom - width;
  const maxY = height * zoom - height;
  return {
    zoom,
    offsetX: Math.max(0, Math.min(viewport.offsetX, maxX)),
    offsetY: Math.max(0, Math.min(viewport.offsetY, maxY)),
  };
}

type Active =
  | { kind: 'object'; index: number; cx: number; cy: number; size: number; rotation: number }
  | { kind: 'pan'; offsetX: number; offsetY: number }
  | null;

export function AltarStage(props: Props) {
  const { doc, width, viewport, selected, highlightCandles } = props;
  const height = width / STAGE_ASPECT;
  const stageWidth = width * viewport.zoom;
  const stageHeight = height * viewport.zoom;

  // Gestures are created once and read the latest props through this ref, so
  // a re-render mid-gesture never resets them.
  const latest = useRef(props);
  latest.current = props;
  const active = useRef<Active>(null);
  const moved = useRef(false);

  const gesture = useMemo(() => {
    const order = () => {
      const { doc: d } = latest.current;
      return stackOrder(d.objects).map((index) => ({ index, object: d.objects[index] }));
    };
    const stagePoint = (x: number, y: number) => {
      const { viewport: v, width: w } = latest.current;
      return { x: x + v.offsetX, y: y + v.offsetY, stageWidth: w * v.zoom };
    };
    const find = (x: number, y: number) => {
      const p = stagePoint(x, y);
      const { selected: sel, doc: d } = latest.current;
      // Prefer the selected object when the touch is on it, even under others.
      if (sel != null && d.objects[sel]) {
        const hit = hitTest([{ index: sel, object: d.objects[sel] }], p.x, p.y, p.stageWidth, MIN_TOUCH);
        if (hit) return hit.index;
      }
      return hitTest(order(), p.x, p.y, p.stageWidth, MIN_TOUCH)?.index ?? null;
    };
    const beginObject = (index: number) => {
      const object = latest.current.doc.objects[index];
      const box = displayBox(object);
      active.current = { kind: 'object', index, cx: box.cx, cy: box.cy, size: box.size, rotation: rotationOf(object) };
      latest.current.onGestureStart(index);
      if (latest.current.selected !== index) latest.current.onSelect(index);
    };
    // Pan, pinch and rotation run together; the shared state resets when the
    // last of them lets go.
    const running = new Set<string>();
    const started = (name: string) => running.add(name);
    const end = (name: string) => () => {
      if (!running.delete(name) || running.size > 0) return;
      if (active.current?.kind === 'object' && moved.current) latest.current.onGestureEnd();
      active.current = null;
      moved.current = false;
    };

    const tap = Gesture.Tap()
      .runOnJS(true)
      .maxDistance(12)
      .onEnd((e, success) => {
        if (!success) return;
        latest.current.onSelect(find(e.x, e.y));
      });

    const pan = Gesture.Pan()
      .runOnJS(true)
      .minDistance(4)
      .averageTouches(true)
      .onStart((e) => {
        started('pan');
        if (active.current) return;
        const index = find(e.x - e.translationX, e.y - e.translationY);
        if (index != null) {
          beginObject(index);
        } else {
          const v = latest.current.viewport;
          active.current = { kind: 'pan', offsetX: v.offsetX, offsetY: v.offsetY };
        }
      })
      .onUpdate((e) => {
        const a = active.current;
        const { width: w, viewport: v } = latest.current;
        if (!a) return;
        if (a.kind === 'pan') {
          if (v.zoom <= 1) return;
          latest.current.onViewportChange(
            clampViewport({ zoom: v.zoom, offsetX: a.offsetX - e.translationX, offsetY: a.offsetY - e.translationY }, w),
          );
          return;
        }
        const sw = w * v.zoom;
        const sh = sw / STAGE_ASPECT;
        moved.current = true;
        latest.current.onMove(a.index, a.cx + e.translationX / sw, a.cy + e.translationY / sh);
      })
      .onFinalize(end('pan'));

    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onStart((e) => {
        started('pinch');
        const sel = latest.current.selected;
        const index = sel ?? find(e.focalX, e.focalY);
        if (index == null) return;
        if (!active.current || active.current.kind !== 'object') beginObject(index);
      })
      .onUpdate((e) => {
        const a = active.current;
        if (a?.kind !== 'object') return;
        moved.current = true;
        latest.current.onResize(a.index, a.size * e.scale);
      })
      .onFinalize(end('pinch'));

    const rotation = Gesture.Rotation()
      .runOnJS(true)
      .onStart((e) => {
        started('rotation');
        const sel = latest.current.selected;
        const index = sel ?? find(e.anchorX, e.anchorY);
        if (index == null) return;
        if (!active.current || active.current.kind !== 'object') beginObject(index);
      })
      .onUpdate((e) => {
        const a = active.current;
        if (a?.kind !== 'object') return;
        moved.current = true;
        latest.current.onRotate(a.index, a.rotation + (e.rotation * 180) / Math.PI);
      })
      .onFinalize(end('rotation'));

    return Gesture.Race(Gesture.Simultaneous(pan, pinch, rotation), tap);
  }, []);

  // Re-render when a downloaded image's size becomes known (it sets the box height).
  const ratioVersion = useImageRatioVersion();
  const ordered = stackOrder(doc.objects);
  const lit = ordered.filter((i) => isCandle(doc.objects[i]) && isLit(doc.objects[i]));
  const background = altarImageSource(doc.background || DEFAULT_BACKGROUND);

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[styles.viewport, { width, height }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Your altar${doc.backgroundName ? `, ${doc.backgroundName}` : ''}, with ${doc.objects.length} ${
          doc.objects.length === 1 ? 'object' : 'objects'
        }. Drag an object to move it; pinch to resize and twist to rotate. Every action is also in the panel below.`}
      >
        <View
          style={{
            position: 'absolute',
            width: stageWidth,
            height: stageHeight,
            left: -viewport.offsetX,
            top: -viewport.offsetY,
          }}
        >
          {background && <Image source={background} style={styles.background} resizeMode="cover" />}

          {lit.length > 0 && <LightPools objects={lit.map((i) => doc.objects[i])} stageWidth={stageWidth} />}

          {ordered.map((index) => (
            <AltarObjectView
              key={`${doc.objects[index].altarObjectId || 'obj'}-${index}`}
              object={doc.objects[index]}
              stageWidth={stageWidth}
              selected={selected === index}
              highlighted={!!highlightCandles && isCandle(doc.objects[index])}
              ratioVersion={ratioVersion}
            />
          ))}

          {doc.objects.length === 0 && (
            <Text style={[styles.empty, { top: stageHeight * 0.3 }]} pointerEvents="none">
              The altar is empty. Choose what belongs here.
            </Text>
          )}
        </View>
      </View>
    </GestureDetector>
  );
}

/** The warm pools of light the website paints around lit candles (renderLighting). */
function LightPools({ objects, stageWidth }: { objects: SavedObject[]; stageWidth: number }) {
  const stageHeight = stageWidth / STAGE_ASPECT;
  return (
    <Svg width={stageWidth} height={stageHeight} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="candle-light" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="rgb(255,245,210)" stopOpacity={0.4} />
          <Stop offset="0.18" stopColor="rgb(255,220,150)" stopOpacity={0.25} />
          <Stop offset="0.45" stopColor="rgb(255,180,80)" stopOpacity={0.12} />
          <Stop offset="1" stopColor="rgb(255,180,80)" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {objects.map((object, i) => {
        const box = displayBox(object);
        const rect = boxToPixels(box, stageWidth);
        const angle = (rotationOf(object) * Math.PI) / 180;
        const boundsHeight = rect.width * Math.abs(Math.sin(angle)) + rect.height * Math.abs(Math.cos(angle));
        const y = rect.centerY - boundsHeight / 2 + boundsHeight * 0.1;
        return <Circle key={i} cx={rect.centerX} cy={y} r={candleLightRadius(box.size) * stageWidth} fill="url(#candle-light)" />;
      })}
    </Svg>
  );
}

const AltarObjectView = memo(function AltarObjectView({
  object,
  stageWidth,
  selected,
  highlighted,
}: {
  object: SavedObject;
  stageWidth: number;
  selected: boolean;
  highlighted: boolean;
  ratioVersion: number;
}) {
  const rect = boxToPixels(displayBox(object), stageWidth);
  const source = altarImageSource(object.imagePath);
  useImageRatio(object.imagePath);
  const overlays = dressingOverlays(object);
  const flipped = object.flipped === 'true';
  const glowing = object.glowing === 'true';
  const lit = isCandle(object) && isLit(object);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.object,
        {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          transform: [{ rotate: `${rotationOf(object)}deg` }, { scaleX: flipped ? -1 : 1 }],
        },
      ]}
    >
      {glowing && <View style={[styles.glow, { borderRadius: rect.width / 2 }]} />}
      {source ? (
        // The website's image sits in the button's content box (6px / 1px padding on 80px).
        <View style={[styles.content, { paddingHorizontal: rect.width * IMAGE_INSET.x, paddingVertical: rect.width * IMAGE_INSET.y }]}>
          <Image source={source} style={styles.fill} resizeMode="contain" />
        </View>
      ) : (
        <Text style={[styles.symbol, { fontSize: rect.width * 0.49 }]}>{object.fallbackSymbol || '✦'}</Text>
      )}
      {overlays.herb && <Image source={candleHerbOverlay} style={styles.herbOverlay} resizeMode="contain" />}
      {overlays.oil && <Image source={candleOilOverlay} style={styles.oilOverlay} resizeMode="contain" />}
      {lit && <Flame />}
      {(selected || highlighted) && <View style={[styles.outline, highlighted && !selected && styles.outlineSoft]} />}
    </View>
  );
});

const useNative = Platform.OS !== 'web';

/** The flame drawn above a lit candle's wick (altar.css .is-lit::before/::after). */
function Flame() {
  const flicker = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const speed = 700 + Math.random() * 450;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, { toValue: 1, duration: speed, useNativeDriver: useNative }),
        Animated.timing(flicker, { toValue: 0, duration: speed * 1.1, useNativeDriver: useNative }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [flicker]);

  const scaleY = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] });
  const opacity = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <>
      <View style={styles.flameHalo}>
        <Svg width="100%" height="100%" viewBox="0 0 10 10">
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="rgb(255,252,230)" stopOpacity={0.95} />
              <Stop offset="0.45" stopColor="rgb(255,220,130)" stopOpacity={0.75} />
              <Stop offset="0.7" stopColor="rgb(255,180,70)" stopOpacity={0.18} />
              <Stop offset="1" stopColor="rgb(255,180,70)" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={5} cy={5} r={5} fill="url(#halo)" />
        </Svg>
      </View>
      <Animated.View style={[styles.flame, { opacity, transform: [{ scaleY }] }]}>
        <Svg width="100%" height="100%" viewBox="0 0 10 18">
          <Defs>
            <RadialGradient id="flame" cx="50%" cy="18%" r="80%">
              <Stop offset="0" stopColor="rgb(255,255,240)" stopOpacity={1} />
              <Stop offset="0.18" stopColor="rgb(255,240,170)" stopOpacity={0.95} />
              <Stop offset="0.45" stopColor="rgb(255,195,70)" stopOpacity={0.92} />
              <Stop offset="0.7" stopColor="rgb(255,120,35)" stopOpacity={0.45} />
              <Stop offset="1" stopColor="rgb(255,120,35)" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={5} cy={9} rx={5} ry={9} fill="url(#flame)" />
        </Svg>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  viewport: {
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.night,
  },
  object: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  fill: { width: '100%', height: '100%' },
  content: { width: '100%', height: '100%' },
  background: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' },
  symbol: { color: colors.cream },
  glow: {
    position: 'absolute',
    left: '10%',
    top: '10%',
    width: '80%',
    height: '80%',
    backgroundColor: 'rgba(244,236,216,0.12)',
    boxShadow: '0 0 18px 6px rgba(185,160,93,0.55)',
  },
  herbOverlay: { position: 'absolute', top: '8%', left: '-1%', width: '100%', height: '80%' },
  oilOverlay: { position: 'absolute', top: '11%', left: '0%', width: '94%', height: '70%', opacity: 0.55 },
  flameHalo: { position: 'absolute', left: '46%', top: '-3%', width: '8%', height: '10%' },
  flame: { position: 'absolute', left: '45%', top: '-5%', width: '10%', height: '18%', transformOrigin: '50% 100%' },
  outline: {
    position: 'absolute',
    left: -3,
    top: -3,
    right: -3,
    bottom: -3,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderStyle: 'dashed',
    borderRadius: 6,
  },
  outlineSoft: { borderColor: 'rgba(226,195,109,0.55)' },
  empty: {
    position: 'absolute',
    left: '15%',
    width: '70%',
    textAlign: 'center',
    color: 'rgba(244,236,216,0.8)',
    fontFamily: fonts.displayItalic,
    fontSize: 16,
  },
});
