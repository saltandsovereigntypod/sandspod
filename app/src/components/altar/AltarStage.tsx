import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useReducedMotion } from '../../lib/accessibility/store';
import type { Tint } from '../../lib/altar/ambient';
import { incenseLife, isIncense, smokeOrigin } from '../../lib/altar/incense';
import { isPetitionPaper } from '../../lib/altar/petitions';
import { MoonDisc } from '../MoonDisc';
import { altarImageSource, candleHerbOverlay, candleOilOverlay, useImageRatio, useImageRatioVersion } from '../../lib/altar/assets';
import { DEFAULT_BACKGROUND } from '../../lib/altar/cabinet';
import { flameLayout, type FlameLayout } from '../../lib/altar/flame';
import { boxToPixels, candleLightRadius, displayBox, hitTest, IMAGE_INSET, imageRatio, rotationOf, STAGE_ASPECT } from '../../lib/altar/geometry';
import { stackOrder } from '../../lib/altar/layers';
import { candleLife, dressingOverlays, isCandle, isLit } from '../../lib/altar/livingState';
import type { AltarDocument } from '../../lib/altar/snapshot';
import type { SavedObject } from '../../lib/altar/types';
import { colors, fonts } from '../../theme';

export type Viewport = { zoom: number; offsetX: number; offsetY: number };

/** The real sky laid over the background (never over the objects). */
export type StageSky = {
  tint: Tint;
  accent: Tint;
  /** Tonight's moon in a little window, or null to leave it out. */
  moon: { illumination: number; waxing: boolean; mirrored: boolean } | null;
  /** Spoken with the stage's label ("dusk light, autumn; a waxing crescent moon"). */
  label: string;
};

/** How an aging offering looks now, by altarObjectId. */
export type AgingLooks = Record<string, { opacity: number; droop: number }>;

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
  sky?: StageSky | null;
  aging?: AgingLooks;
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
  const sky = props.sky ?? null;
  const aging = props.aging ?? {};

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[styles.viewport, { width, height }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Your altar${doc.backgroundName ? `, ${doc.backgroundName}` : ''}, with ${doc.objects.length} ${
          doc.objects.length === 1 ? 'object' : 'objects'
        }${sky?.label ? `, in ${sky.label}` : ''}. Drag an object to move it; pinch to resize and twist to rotate. Every action is also in the panel below.`}
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

          {sky && <SkyLayer sky={sky} stageWidth={stageWidth} />}

          {lit.length > 0 && <LightPools objects={lit.map((i) => doc.objects[i])} stageWidth={stageWidth} />}

          {ordered.map((index) => (
            <AltarObjectView
              key={`${doc.objects[index].altarObjectId || 'obj'}-${index}`}
              object={doc.objects[index]}
              stageWidth={stageWidth}
              selected={selected === index}
              highlighted={!!highlightCandles && isCandle(doc.objects[index])}
              ratioVersion={ratioVersion}
              agedOpacity={aging[String(doc.objects[index].altarObjectId)]?.opacity ?? 1}
              droop={aging[String(doc.objects[index].altarObjectId)]?.droop ?? 0}
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
  agedOpacity,
  droop,
}: {
  object: SavedObject;
  stageWidth: number;
  selected: boolean;
  highlighted: boolean;
  ratioVersion: number;
  agedOpacity: number;
  droop: number;
}) {
  const rect = boxToPixels(displayBox(object), stageWidth);
  const source = altarImageSource(object.imagePath);
  useImageRatio(object.imagePath);
  const overlays = dressingOverlays(object);
  const flipped = object.flipped === 'true';
  const glowing = object.glowing === 'true';
  const lit = isCandle(object) && isLit(object);
  // A candle that has burned down fades, with a word to say so (candle-lifecycle.js).
  const spent = isCandle(object) && !lit && candleLife(object).spent;
  const smoke = useSnuffSmoke(lit);
  // The flame sits on this picture's wick (the vigil candles keep the website's spot).
  const flame = lit || smoke != null ? flameLayout(object.imagePath, object.imagePath ? imageRatio(object.imagePath) : null) : null;
  // Incense burns with an ember and drifting smoke, and leaves ash.
  const incense = isIncense(object) ? incenseLife(object) : null;
  const ash = !!incense?.ash;
  const paper = isPetitionPaper(object) && !source;

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
      <View style={[styles.layer, agedOpacity < 1 && { opacity: agedOpacity }, droop > 0 && { transformOrigin: '50% 100%', transform: [{ rotate: `${droop}deg` }, { scaleY: 1 - droop / 120 }] }]}>
      {glowing && <View style={[styles.glow, { borderRadius: rect.width / 2 }]} />}
      {source ? (
        // The website's image sits in the button's content box (6px / 1px padding on 80px).
        <View style={[styles.content, { paddingHorizontal: rect.width * IMAGE_INSET.x, paddingVertical: rect.width * IMAGE_INSET.y }]}>
          <Image source={source} style={[styles.fill, (spent || ash) && styles.spentImage]} resizeMode="contain" />
        </View>
      ) : paper ? (
        <PetitionPaper />
      ) : (
        <Text style={[styles.symbol, { fontSize: rect.width * 0.49 }]}>{object.fallbackSymbol || '✦'}</Text>
      )}
      </View>
      {overlays.herb && <Image source={candleHerbOverlay} style={styles.herbOverlay} resizeMode="contain" />}
      {overlays.oil && <Image source={candleOilOverlay} style={styles.oilOverlay} resizeMode="contain" />}
      {lit && flame && <Flame layout={flame} />}
      {smoke != null && flame && <Smoke key={smoke} layout={flame} />}
      {incense?.lit && <IncenseSmoke origin={smokeOrigin(object)} width={rect.width} />}
      {ash && <View style={styles.ash} />}
      {ash && (
        <Text style={[styles.spentLabel, { fontSize: Math.max(8, Math.min(13, rect.width * 0.16)), transform: [{ scaleX: flipped ? -1 : 1 }] }]} numberOfLines={1}>
          Ash
        </Text>
      )}
      {spent && (
        <Text style={[styles.spentLabel, { fontSize: Math.max(8, Math.min(13, rect.width * 0.16)), transform: [{ scaleX: flipped ? -1 : 1 }] }]} numberOfLines={1}>
          Spent
        </Text>
      )}
      {(selected || highlighted) && <View style={[styles.outline, highlighted && !selected && styles.outlineSoft]} />}
    </View>
  );
});

const useNative = Platform.OS !== 'web';

/**
 * The real sky: the light of the hour laid over the background, a faint
 * seasonal edge along the foot of the altar, and tonight's moon in a small
 * window high in a corner. All of it sits beneath the objects.
 */
function SkyLayer({ sky, stageWidth }: { sky: StageSky; stageWidth: number }) {
  const stageHeight = stageWidth / STAGE_ASPECT;
  const windowSize = Math.max(28, Math.min(64, stageWidth * 0.075));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {sky.tint.opacity > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: sky.tint.color, opacity: sky.tint.opacity }]} />}
      {sky.accent.opacity > 0 && (
        <Svg width={stageWidth} height={stageHeight} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="season" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.62" stopColor={sky.accent.color} stopOpacity={0} />
              <Stop offset="1" stopColor={sky.accent.color} stopOpacity={sky.accent.opacity * 2.4} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill="url(#season)" />
        </Svg>
      )}
      {sky.moon && (
        <View style={[styles.moonWindow, { width: windowSize, height: windowSize, borderRadius: windowSize / 2, top: stageHeight * 0.04, right: stageWidth * 0.025 }]}>
          <View style={sky.moon.mirrored ? { transform: [{ scaleX: -1 }] } : null}>
            <MoonDisc size={windowSize * 0.72} illumination={sky.moon.illumination} waxing={sky.moon.waxing} halo={false} />
          </View>
        </View>
      )}
    </View>
  );
}

/** A folded petition paper (the website shows its symbol instead). */
function PetitionPaper() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 40 40">
      <Path d="M5 9 L33 6 L35 31 L7 34 Z" fill="rgb(236,224,192)" stroke="rgba(90,70,40,0.55)" strokeWidth={0.8} />
      <Path d="M6 21.5 L34 18.5" stroke="rgba(90,70,40,0.35)" strokeWidth={0.7} />
      <Path d="M10 13 L28 11 M10 16 L25 14.3 M10 25 L29 23 M10 28 L22 26.8" stroke="rgba(110,60,40,0.5)" strokeWidth={0.6} strokeLinecap="round" />
    </Svg>
  );
}

const WISPS = [0, 1, 2];
/** How long one wisp of incense smoke takes to rise and fade. */
const WISP_MS = 5200;

/** Smoke drifting up from lit incense, with a glowing ember; one still, faint wisp with Reduce Motion. */
function IncenseSmoke({ origin, width }: { origin: { x: number; y: number }; width: number }) {
  const still = useReducedMotion();
  const [rise] = useState(() => WISPS.map(() => new Animated.Value(0)));
  useEffect(() => {
    if (still) {
      rise.forEach((v) => v.setValue(0.35));
      return;
    }
    const loops = rise.map((value, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay((i * WISP_MS) / WISPS.length),
          Animated.timing(value, { toValue: 1, duration: WISP_MS, easing: Easing.out(Easing.quad), useNativeDriver: useNative }),
          Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: useNative }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [rise, still]);

  const wisp = Math.max(10, width * 0.5);
  const ember = Math.max(3, width * 0.07);
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'visible' }]}>
      {rise.map((value, i) => {
        const opacity = still ? 0.28 : value.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 0.42, 0.18, 0] });
        const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [0, -wisp * 2.2] });
        const translateX = value.interpolate({ inputRange: [0, 0.35, 0.7, 1], outputRange: [0, wisp * (i % 2 ? 0.18 : -0.15), wisp * (i % 2 ? -0.1 : 0.22), wisp * 0.3] });
        const scale = value.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.6] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: `${origin.x * 100}%`,
              top: `${origin.y * 100}%`,
              width: wisp,
              height: wisp * 1.4,
              marginLeft: -wisp / 2,
              marginTop: -wisp * 1.3,
              opacity,
              transform: [{ translateX }, { translateY }, { scale }],
            }}
          >
            <Svg width="100%" height="100%" viewBox="0 0 10 14">
              <Defs>
                <RadialGradient id={`wisp-${i}`} cx="50%" cy="60%" r="50%">
                  <Stop offset="0" stopColor="rgb(222,222,214)" stopOpacity={0.7} />
                  <Stop offset="1" stopColor="rgb(222,222,214)" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Ellipse cx={5} cy={8} rx={4} ry={6} fill={`url(#wisp-${i})`} />
            </Svg>
          </Animated.View>
        );
      })}
      <View
        style={{
          position: 'absolute',
          left: `${origin.x * 100}%`,
          top: `${origin.y * 100}%`,
          width: ember,
          height: ember,
          marginLeft: -ember / 2,
          marginTop: -ember / 2,
          borderRadius: ember / 2,
          backgroundColor: 'rgb(255,120,40)',
          boxShadow: '0 0 6px 2px rgba(255,140,60,0.7)',
        }}
      />
    </View>
  );
}

/** How long the snuffed-candle smoke lasts (candles.js extinguishFlame). */
const SMOKE_MS = 1400;

/** Whether the person has asked for less motion (kept current while the altar is open). */
function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => active && setReduce(value))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

/**
 * A fresh key while a candle that was lit has just been put out, so the
 * smoke puff plays once; null otherwise, and always null with Reduce Motion.
 */
function useSnuffSmoke(lit: boolean): number | null {
  const reduce = useReduceMotion();
  const [wasLit, setWasLit] = useState(lit);
  const [smoke, setSmoke] = useState<number | null>(null);
  if (wasLit !== lit) {
    setWasLit(lit);
    setSmoke(!lit && !reduce ? (smoke ?? 0) + 1 : null);
  }
  useEffect(() => {
    if (smoke == null) return;
    const timer = setTimeout(() => setSmoke(null), SMOKE_MS);
    return () => clearTimeout(timer);
  }, [smoke]);
  return smoke;
}

/** The puff of smoke over a candle just put out (altar.css .is-extinguishing::after). */
function Smoke({ layout }: { layout: FlameLayout }) {
  const [rise] = useState(() => new Animated.Value(0));
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const run = Animated.timing(rise, { toValue: 1, duration: SMOKE_MS, easing: Easing.out(Easing.ease), useNativeDriver: useNative });
    run.start();
    return () => run.stop();
  }, [rise]);

  const opacity = rise.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.65, 0] });
  const scale = rise.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.45] });
  // The website drifts 22px up from a puff about 18px tall; follow the puff's own size.
  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 1.2] });
  const translateX = rise.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.04] });

  return (
    <Animated.View
      style={[styles.smoke, { left: `${layout.centerX - 5}%`, top: `${layout.smokeTop}%`, height: `${layout.smokeHeight}%` }, { opacity, transform: [{ translateX }, { translateY }, { scale }] }]}
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
    >
      <Svg width="100%" height="100%" viewBox="0 0 10 22">
        <Defs>
          <RadialGradient id="smoke-low" cx="50%" cy="80%" r="38%">
            <Stop offset="0" stopColor="rgb(210,210,200)" stopOpacity={0.55} />
            <Stop offset="1" stopColor="rgb(210,210,200)" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="smoke-mid" cx="45%" cy="45%" r="42%">
            <Stop offset="0" stopColor="rgb(210,210,200)" stopOpacity={0.35} />
            <Stop offset="1" stopColor="rgb(210,210,200)" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="smoke-high" cx="58%" cy="18%" r="46%">
            <Stop offset="0" stopColor="rgb(210,210,200)" stopOpacity={0.22} />
            <Stop offset="1" stopColor="rgb(210,210,200)" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={5} cy={11} rx={5} ry={11} fill="url(#smoke-low)" />
        <Ellipse cx={5} cy={11} rx={5} ry={11} fill="url(#smoke-mid)" />
        <Ellipse cx={5} cy={11} rx={5} ry={11} fill="url(#smoke-high)" />
      </Svg>
    </Animated.View>
  );
}

/** The flame drawn above a lit candle's wick (altar.css .is-lit::before/::after). */
function Flame({ layout }: { layout: FlameLayout }) {
  const flicker = useRef(new Animated.Value(0)).current;
  // Reduce motion: a steady flame instead of a flickering one.
  const still = useReducedMotion();
  useEffect(() => {
    if (still) {
      flicker.setValue(0.5);
      return;
    }
    const speed = 700 + Math.random() * 450;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, { toValue: 1, duration: speed, useNativeDriver: useNative }),
        Animated.timing(flicker, { toValue: 0, duration: speed * 1.1, useNativeDriver: useNative }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [flicker, still]);

  const scaleY = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] });
  const opacity = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <>
      <View style={[styles.flameHalo, { left: `${layout.centerX - 4}%`, top: `${layout.haloTop}%`, height: `${layout.haloHeight}%` }]}>
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
      <Animated.View
        style={[styles.flame, { left: `${layout.centerX - 5}%`, top: `${layout.flameTop}%`, height: `${layout.flameHeight}%` }, { opacity, transform: [{ scaleY }] }]}
      >
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
  layer: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ash: {
    position: 'absolute',
    bottom: '1%',
    left: '22%',
    width: '56%',
    height: '5%',
    borderRadius: 999,
    backgroundColor: 'rgba(150,146,138,0.85)',
  },
  moonWindow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,18,40,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(226,195,109,0.35)',
  },
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
  smoke: { position: 'absolute', left: '45%', top: '-10%', width: '10%', height: '22%' },
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
  spentImage: Platform.OS === 'ios' ? { opacity: 0.45 } : { opacity: 0.6, filter: 'grayscale(1)' },
  spentLabel: {
    position: 'absolute',
    bottom: '2%',
    color: colors.parchment,
    fontFamily: fonts.bodySemi,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowColor: '#000',
    textShadowRadius: 3,
  },
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
