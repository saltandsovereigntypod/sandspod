// What a candle's own life leaves on it, drawn over its picture: it burns
// down (CandlePicture keeps its top and loses wax beneath, or the wax sinks in
// its glass), words carved down the wax that melt away from the top as it
// burns, a sheen of oil and flecks of herb where it was dressed, a warm pool
// of melted wax under a lit flame with drips running down, the tunnel or wide
// pool its burns have left, and the remnant when it has burned down. Reads
// only the object (lib/altar/wax.ts, flame.ts and workings/dressing.ts); the
// stage and the close-up both draw it, at any size.

import { memo } from 'react';
import { Image, type ImageSourcePropType, type ImageStyle, StyleSheet, View, type StyleProp } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, G, LinearGradient, Line, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { flameLayout, lowerFlame, pictureBox, type FlameLayout } from '../../lib/altar/flame';
import { imageRatio } from '../../lib/altar/geometry';
import { candleLifeForm, carvingsOf, dressingsOf, isLit } from '../../lib/altar/livingState';
import type { SavedObject } from '../../lib/altar/types';
import { burnDown, burnProgress, LOW_FORMS, waxLook, type BurnDown } from '../../lib/altar/wax';
import { ingredientColor, waxColor } from '../../lib/altar/workings/colors';
import { carvingRemaining } from '../../lib/altar/workings/dressing';
import { fonts } from '../../theme';

/** For candles of forms without a measured shape (people's own pictures): about how wide the wax is, as a fraction of the box's width either side of the wick. */
const HALF_WIDTH: Record<string, number> = {
  taper: 0.09,
  'chime-spell': 0.08,
  'beeswax-rolled': 0.1,
  birthday: 0.05,
  'seven-knob': 0.13,
  'double-action': 0.12,
  reversible: 0.12,
  pillar: 0.3,
  jar: 0.3,
  vigil: 0.3,
  novena: 0.3,
  figure: 0.22,
};

/** Fixed spots for herb flecks, so they don't jump about between renders: [x across the wax -1..1, y down the body 0..1]. */
const FLECKS: [number, number][] = [
  [-0.55, 0.12], [0.35, 0.2], [-0.2, 0.33], [0.6, 0.41], [-0.62, 0.52], [0.12, 0.6], [0.45, 0.7], [-0.35, 0.78], [0.2, 0.86], [-0.05, 0.47],
];
/** Where drips run from, across the top (-1 one edge, 1 the other), and how long each may get. */
const DRIPS: [number, number][] = [[-0.92, 0.55], [0.88, 0.8], [-0.45, 0.4], [0.55, 1], [0.1, 0.5], [-0.78, 0.9]];

// ── Colour ────────────────────────────────────────────────────────────────

const rgbOf = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h.slice(0, 6), 16);
  return Number.isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [200, 190, 170];
};
const mix = (hex: string, to: [number, number, number], t: number) => {
  const c = rgbOf(hex);
  return `rgb(${c.map((v, i) => Math.round(v + (to[i] - v) * t)).join(',')})`;
};
const lightness = (hex: string) => {
  const [r, g, b] = rgbOf(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

/** A carving in this wax: the groove a shade into the wax's own colour (darker in pale wax, paler in dark), with a faint lit edge. */
function incision(waxHex: string) {
  if (lightness(waxHex) < 0.32) return { groove: mix(waxHex, [235, 222, 200], 0.34), grooveOpacity: 0.85, edge: 'rgb(0,0,0)', edgeOpacity: 0.55 };
  return { groove: mix(waxHex, [40, 16, 8], 0.55), grooveOpacity: 0.7, edge: mix(waxHex, [255, 253, 246], 0.6), edgeOpacity: 0.5 };
}

/** Drips in the candle's own wax: a little glossier, with a darker edge and a glint. */
function dripLook(waxHex: string, lit: boolean) {
  const dark = lightness(waxHex) < 0.32;
  return {
    fill: mix(waxHex, dark ? [90, 84, 78] : [255, 250, 240], lit ? 0.14 : 0.08),
    edge: mix(waxHex, dark ? [0, 0, 0] : [40, 20, 10], 0.5),
    shine: mix(waxHex, [255, 255, 250], dark ? 0.4 : 0.7),
  };
}

// ── Where things are ──────────────────────────────────────────────────────

export type CandleGeometry = {
  /** How it has burned down, or null for forms with nothing to burn down. */
  burn: BurnDown | null;
  /** The picture in the box, in pixels. */
  pic: { left: number; top: number; width: number; height: number } | null;
  /** The flame on its wick, moved down as the candle burns shorter. */
  flame: FlameLayout;
  /** How far the top has come down, in pixels. */
  dropPx: number;
};

/** Where a candle's picture, wax top and flame are in a box `width` × `height`. */
export function candleGeometry(object: SavedObject, width: number, height: number, now: number): CandleGeometry {
  const ratio = object.imagePath ? imageRatio(object.imagePath) : null;
  const base = flameLayout(object.imagePath, ratio);
  const burn = ratio ? burnDown(object, now) : null;
  if (!ratio || !burn || !(height > 0)) return { burn: null, pic: null, flame: base, dropPx: 0 };
  const box = pictureBox(ratio, height / width);
  const pic = { left: box.left * width, top: box.top * height, width: box.width * width, height: box.height * height };
  const dropPx = burn.drop * pic.height;
  return { burn, pic, flame: lowerFlame(base, (dropPx / height) * 100), dropPx };
}

// ── The picture, burned down ──────────────────────────────────────────────

type PictureProps = { source: ImageSourcePropType; geometry: CandleGeometry; style?: StyleProp<ImageStyle> };

/**
 * The candle's picture, shorter as it burns: a free-standing candle keeps its
 * top (rim and wick) set down on what is left of its body; a figure or a two-
 * colour candle burns away from the head; a candle in glass is drawn whole
 * (CandleMarks sinks the wax inside it).
 */
export function CandlePicture({ source, geometry, style }: PictureProps) {
  const { burn, pic, dropPx } = geometry;
  if (!burn || !pic || burn.mode === 'glass' || burn.mode === 'none' || !(dropPx > 0.25)) return null;
  const image = (offset: number) => <Image source={source} style={[{ position: 'absolute', left: 0, top: -offset, width: pic.width, height: pic.height }, style]} resizeMode="stretch" />;
  if (burn.mode === 'crop') {
    return (
      <View pointerEvents="none" style={[styles.clip, { left: pic.left, top: pic.top + dropPx, width: pic.width, height: Math.max(0, pic.height - dropPx) }]}>
        {image(dropPx)}
      </View>
    );
  }
  const capPx = burn.capEnd * pic.height;
  return (
    <>
      <View pointerEvents="none" style={[styles.clip, { left: pic.left, top: pic.top + capPx + dropPx, width: pic.width, height: Math.max(0, pic.height - capPx - dropPx) }]}>
        {image(capPx + dropPx)}
      </View>
      <View pointerEvents="none" style={[styles.clip, { left: pic.left, top: pic.top + dropPx, width: pic.width, height: capPx + 0.75 }]}>
        {image(0)}
      </View>
    </>
  );
}

/** Whether CandlePicture draws the candle (so the stage leaves out the whole picture). */
export const drawsBurnedDown = (geometry: CandleGeometry) =>
  !!geometry.burn && !!geometry.pic && (geometry.burn.mode === 'cap' || geometry.burn.mode === 'crop') && geometry.dropPx > 0.25;

// ── The marks ─────────────────────────────────────────────────────────────

type Props = {
  object: SavedObject;
  width: number;
  height: number;
  now: number;
  uid: string;
  /** The picture is mirrored: the words are turned back so they still read. */
  flipped?: boolean;
  geometry?: CandleGeometry;
};

export const CandleMarks = memo(function CandleMarks({ object, width, height, now, uid, flipped, geometry }: Props) {
  if (!(width > 0) || !(height > 0)) return null;
  const form = candleLifeForm(object);
  if (LOW_FORMS.has(form)) return null;
  const carvings = carvingsOf(object).slice(0, 2);
  const dressings = dressingsOf(object);
  const wax = waxLook(object, now);
  const lit = isLit(object);
  const geo = geometry ?? candleGeometry(object, width, height, now);
  const { burn, pic } = geo;
  if (!carvings.length && !dressings.length && wax.kind === 'even' && !wax.melt && !(burn && burn.drop > 0)) return null;

  // Everything in pixels of the box.
  const flame = geo.flame;
  const cx = (flame.centerX / 100) * width;
  let half: number;
  let surface: number; // the top of the wax now
  let bottom: number;
  let carveTop: number; // where carving starts on the candle as it was new
  if (burn && pic) {
    half = burn.half * pic.width;
    surface = pic.top + burn.waxTop * pic.height;
    bottom = pic.top + burn.bottom * pic.height;
    carveTop = pic.top + ((burn.mode === 'cap' ? burn.capEnd : burn.top) + 0.03) * pic.height;
  } else {
    half = (HALF_WIDTH[form] ?? 0.2) * width;
    surface = Math.max(2, ((flame.flameTop + flame.flameHeight) / 100) * height + 1);
    bottom = height * 0.93;
    carveTop = surface + (bottom - surface) * 0.06;
  }
  const body = Math.max(1, bottom - surface);
  // A carving's letters above this line have melted (cap: the kept top covers the body's old top).
  const goneLine = burn && pic ? surface + (burn.mode === 'cap' ? (burn.capEnd - burn.top) * pic.height : 0) : surface;
  const rim = Math.max(1.2, half * 0.2); // the ellipse depth of the wax's top
  const waxHex = waxColor(String(object.color || 'white'));
  const cut = incision(waxHex);
  const drip = dripLook(waxHex, lit);
  const oil = dressings.some((d) => d.type === 'oil');
  const herbs = dressings.filter((d) => d.type === 'herb');
  const progress = burnProgress(object, now);
  const glass = burn?.mode === 'glass' && pic ? burn : null;

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} viewBox={`0 0 ${width} ${height}`} pointerEvents="none">
      <Defs>
        <LinearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="rgb(255,236,180)" stopOpacity={0} />
          <Stop offset="0.35" stopColor="rgb(255,236,180)" stopOpacity={0.3} />
          <Stop offset="0.5" stopColor="rgb(255,250,230)" stopOpacity={0.42} />
          <Stop offset="0.7" stopColor="rgb(255,236,180)" stopOpacity={0.14} />
          <Stop offset="1" stopColor="rgb(255,236,180)" stopOpacity={0} />
        </LinearGradient>
        <RadialGradient id={`pool-${uid}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="rgb(255,250,215)" stopOpacity={1} />
          <Stop offset="0.45" stopColor="rgb(255,214,130)" stopOpacity={0.85} />
          <Stop offset="1" stopColor="rgb(255,170,70)" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id={`glow-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="rgb(255,206,120)" stopOpacity={0.75} />
          <Stop offset="0.5" stopColor="rgb(255,190,100)" stopOpacity={0.25} />
          <Stop offset="1" stopColor="rgb(255,190,100)" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="rgb(40,34,30)" stopOpacity={0.82} />
          <Stop offset="0.22" stopColor="rgb(70,64,58)" stopOpacity={0.7} />
          <Stop offset="0.3" stopColor="rgb(220,220,214)" stopOpacity={0.55} />
          <Stop offset="0.38" stopColor="rgb(70,64,58)" stopOpacity={0.7} />
          <Stop offset="1" stopColor="rgb(40,34,30)" stopOpacity={0.82} />
        </LinearGradient>
        <LinearGradient id={`soot-${uid}`} x1="0.15" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor="rgb(12,10,9)" stopOpacity={0.95} />
          <Stop offset="0.35" stopColor="rgb(22,18,16)" stopOpacity={0.6} />
          <Stop offset="0.8" stopColor="rgb(30,26,22)" stopOpacity={0.15} />
          <Stop offset="1" stopColor="rgb(30,26,22)" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* In glass: the wax has sunk, leaving the glass above it empty. */}
      {glass && pic && glass.drop > 0 && (
        <>
          <Rect x={cx - half} y={pic.top + glass.top * pic.height - rim} width={half * 2} height={glass.drop * pic.height + rim} fill={`url(#glass-${uid})`} />
          {/* Soot: the glass above the wax blackens over the burn, heaviest near the rim and on one side. */}
          <Rect x={cx - half * 1.04} y={pic.top + glass.top * pic.height - rim} width={half * 2.08} height={glass.drop * pic.height + rim * 0.6} fill={`url(#soot-${uid})`} opacity={Math.min(0.85, 0.15 + progress * 0.85)} />
          <Ellipse cx={cx} cy={surface} rx={half} ry={rim} fill={mix(waxHex, [255, 255, 255], 0.25)} />
          {/* The melted top: glossy, catching the light. */}
          <Ellipse cx={cx - half * 0.32} cy={surface - rim * 0.12} rx={half * 0.34} ry={rim * 0.32} fill="rgb(255,255,250)" opacity={lit ? 0.6 : 0.32} />
          {lit && <Ellipse cx={cx} cy={surface + rim * 0.1} rx={half * 0.7} ry={rim * 0.6} fill={`url(#pool-${uid})`} opacity={0.75} />}
          <Line x1={cx} y1={surface - rim * 1.6} x2={cx} y2={surface} stroke="rgb(30,20,14)" strokeWidth={Math.max(0.8, half * 0.06)} strokeLinecap="round" />
        </>
      )}

      {/* Burned away from the head: a soft melted top, and the wick. */}
      {burn?.mode === 'crop' && burn.drop > 0 && (
        <>
          <Ellipse cx={cx} cy={surface} rx={half} ry={rim} fill={mix(waxHex, [255, 255, 255], 0.2)} />
          <Line x1={cx} y1={surface - rim * 1.8} x2={cx} y2={surface} stroke="rgb(30,20,14)" strokeWidth={Math.max(0.8, half * 0.06)} strokeLinecap="round" />
        </>
      )}

      {/* Oil: a sheen down one side of the wax. */}
      {oil && <Rect x={cx - half * 0.85} y={surface + body * 0.04} width={half * 0.9} height={body * 0.9} rx={half * 0.4} fill={`url(#sheen-${uid})`} />}

      {/* Herbs: flecks pressed into the wax, in their own colours. */}
      {herbs.length > 0 &&
        FLECKS.slice(0, Math.min(FLECKS.length, 4 + herbs.length * 2)).map(([fx, fy], i) => {
          const herb = herbs[i % herbs.length];
          return (
            <Ellipse
              key={`f${i}`}
              cx={cx + fx * half * 0.8}
              cy={surface + fy * body}
              rx={Math.max(0.9, half * 0.09)}
              ry={Math.max(0.6, half * 0.06)}
              fill={ingredientColor(String(herb.herb || herb.label || ''))}
              opacity={0.85}
            />
          );
        })}

      {/* Carvings: cut along the candle's length, as people carve them, in the wax's own colour; melting away from the top as it burns. */}
      {carvings.map((carving, column) => {
        const text = carving.text;
        const n = Math.max(1, [...text].length);
        const columns = carvings.length;
        const lane = (half * 2 * 0.86) / columns; // the width each carving has across the wax
        const span = Math.max(1, bottom - carveTop - body * 0.05);
        // Letter height across the wax (cap height ≈ 0.62 of the size); the word's length (≈ 0.46 a letter) must fit down it.
        const size = Math.min(lane * 0.85, (span * 0.86) / (0.46 * n), 30);
        if (size < 3) return null;
        const length = 0.46 * n * size;
        const x = cx + (columns > 1 ? (column === 0 ? -0.5 : 0.5) * lane : 0);
        const mid = carveTop + span * 0.48; // a little high, so it lasts into the burn
        const start = mid - length / 2;
        const remains = burn ? null : carvingRemaining(text, progress);
        const melted = remains ? start + remains.meltLine * length : goneLine + size * 0.15;
        const clipTop = Math.max(melted, start - size);
        if (clipTop >= start + length) return null;
        const id = `carve-${uid}-${column}-${Math.round(width)}x${Math.round(height)}`;
        const glyph = { fontSize: size, fontFamily: fonts.display, textAnchor: 'middle' as const, letterSpacing: size * 0.02 };
        return (
          <G key={`c${column}`}>
            <Defs>
              <ClipPath id={id}>
                <Rect x={cx - half * 0.94} y={clipTop} width={half * 1.88} height={Math.max(0, bottom - clipTop)} />
              </ClipPath>
            </Defs>
            <G clipPath={`url(#${id})`}>
              <G transform={`translate(${x} ${mid}) rotate(90)${flipped ? ' scale(1 -1)' : ''}`}>
                <SvgText {...glyph} x={size * 0.03} y={size * 0.31 + size * 0.04} fill={cut.edge} fillOpacity={cut.edgeOpacity}>
                  {text}
                </SvgText>
                <SvgText {...glyph} x={0} y={size * 0.31} fill={cut.groove} fillOpacity={cut.grooveOpacity}>
                  {text}
                </SvgText>
              </G>
            </G>
          </G>
        );
      })}

      {/* Wax its burns have left: a tunnel round the wick, or a wide pool. */}
      {wax.kind === 'tunnel' && (
        <>
          <Ellipse cx={cx} cy={surface + rim * 0.3} rx={half * 0.95} ry={rim} fill={mix(waxHex, [255, 248, 236], 0.45)} opacity={0.6} />
          <Ellipse cx={cx} cy={surface + rim * 0.45} rx={half * (0.34 + 0.22 * wax.amount)} ry={rim * (0.55 + 0.2 * wax.amount)} fill="rgb(40,20,10)" opacity={0.55 + 0.3 * wax.amount} />
        </>
      )}
      {wax.kind === 'pool' && (
        <>
          <Ellipse cx={cx} cy={surface + rim * 0.35} rx={half * 0.94} ry={rim * 0.95} fill={mix(waxHex, [255, 250, 236], 0.55)} opacity={0.5 + 0.3 * wax.amount} stroke="rgb(255,252,240)" strokeOpacity={0.65} strokeWidth={Math.max(0.5, half * 0.04)} />
          <Ellipse cx={cx - half * 0.3} cy={surface + rim * 0.2} rx={half * 0.28} ry={rim * 0.3} fill="rgb(255,255,250)" opacity={0.55} />
        </>
      )}

      {/* Lit: the top glows and a pool of molten wax gathers under the flame. */}
      {lit && wax.melt > 0 && (
        <>
          <Rect x={cx - half} y={surface} width={half * 2} height={Math.min(body, Math.max(rim * 3, body * 0.16))} fill={`url(#glow-${uid})`} opacity={(lightness(waxHex) < 0.32 ? 0.22 : 0.4) + 0.3 * wax.melt} />
          <Ellipse cx={cx} cy={surface + rim * 0.35} rx={half * (0.45 + 0.5 * wax.melt)} ry={rim * (0.55 + 0.45 * wax.melt)} fill={`url(#pool-${uid})`} opacity={0.6 + 0.4 * wax.melt} />
        </>
      )}

      {/* Drips: the candle's own wax run down from the top, each ending in a bead. */}
      {wax.drips > 0 &&
        DRIPS.slice(0, wax.drips).map(([dx, len], i) => {
          const x = cx + dx * half * 0.84;
          const l = Math.min(body * 0.7, body * (0.08 + 0.26 * len * Math.max(wax.amount, wax.melt * 0.7)));
          const w = Math.max(1.1, half * 0.17);
          const r = w * 0.62; // the bead at its end
          const top = surface + rim * (0.3 + 0.3 * (1 - Math.abs(dx)));
          const end = top + l;
          const d = `M ${x - w * 0.55} ${top} C ${x - w * 0.5} ${top + l * 0.4} ${x - w * 0.3} ${end - r * 1.6} ${x - r} ${end} A ${r} ${r} 0 1 0 ${x + r} ${end} C ${x + w * 0.3} ${end - r * 1.6} ${x + w * 0.5} ${top + l * 0.4} ${x + w * 0.55} ${top} Z`;
          return (
            <G key={`d${i}`}>
              <Path d={d} fill={drip.fill} stroke={drip.edge} strokeOpacity={0.45} strokeWidth={Math.max(0.3, w * 0.08)} />
              <Path d={`M ${x - w * 0.18} ${top + w * 0.6} L ${x - w * 0.14} ${end - r * 0.4}`} stroke={drip.shine} strokeOpacity={0.35} strokeWidth={Math.max(0.3, w * 0.14)} strokeLinecap="round" />
              <Ellipse cx={x - r * 0.3} cy={end - r * 0.15} rx={r * 0.28} ry={r * 0.22} fill={drip.shine} opacity={0.4} />
            </G>
          );
        })}

      {/* Burned down: its remnant of wax, spread at the foot. */}
      {wax.kind === 'remnant' && wax.amount > 0 && (
        <>
          <Ellipse cx={cx} cy={bottom - rim * 0.3} rx={Math.max(half * 2, width * 0.2)} ry={Math.max(2, rim * 1.2, width * 0.05)} fill={mix(waxHex, [70, 66, 60], 0.25)} opacity={0.88} stroke={mix(waxHex, [20, 10, 5], 0.45)} strokeOpacity={0.55} strokeWidth={Math.max(0.5, width * 0.012)} />
          <Ellipse cx={cx + half * 0.6} cy={bottom - rim * 0.1} rx={Math.max(half * 0.7, width * 0.06)} ry={Math.max(1, width * 0.025)} fill={mix(waxHex, [20, 10, 5], 0.3)} opacity={0.5} />
          <Ellipse cx={cx - half * 0.5} cy={bottom - rim * 0.55} rx={Math.max(half * 0.7, width * 0.07)} ry={Math.max(0.8, width * 0.018)} fill="rgb(255,250,236)" opacity={0.35} />
        </>
      )}
    </Svg>
  );
});

const styles = StyleSheet.create({
  clip: { position: 'absolute', overflow: 'hidden' },
});
