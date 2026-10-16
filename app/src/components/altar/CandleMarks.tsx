// What a candle's own life leaves on it, drawn over its picture: words carved
// down the wax that melt away from the top as it burns, a faint sheen of oil
// and flecks of herb where it was dressed, and the wax itself: a tunnel round
// the wick from short burns, a wide pool from long ones, drips down a taper,
// and the remnant left when it has burned down. All quiet, all beneath the
// flame. Reads only the object (lib/altar/wax.ts and workings/dressing.ts).

import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { flameLayout } from '../../lib/altar/flame';
import { imageRatio } from '../../lib/altar/geometry';
import { candleLifeForm, carvingsOf, dressingsOf } from '../../lib/altar/livingState';
import type { SavedObject } from '../../lib/altar/types';
import { burnProgress, LOW_FORMS, waxLook } from '../../lib/altar/wax';
import { ingredientColor, waxColor } from '../../lib/altar/workings/colors';
import { carvingRemaining } from '../../lib/altar/workings/dressing';
import { fonts } from '../../theme';

/** About how wide the wax is, as a fraction of the box's width either side of the wick. */
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
/** Where drips run from, across the top, and how long each may get. */
const DRIPS: [number, number][] = [[-0.9, 0.5], [0.85, 0.7], [-0.4, 0.35], [0.5, 0.9], [0.05, 0.45], [-0.75, 0.8]];

type Props = { object: SavedObject; width: number; height: number; now: number; uid: string; /** The picture is mirrored: the words are turned back so they still read. */ flipped?: boolean };

export const CandleMarks = memo(function CandleMarks({ object, width, height, now, uid, flipped }: Props) {
  if (!(width > 0) || !(height > 0)) return null;
  const form = candleLifeForm(object);
  const carvings = carvingsOf(object).slice(0, 2);
  const dressings = dressingsOf(object);
  const wax = waxLook(object, now);
  const low = LOW_FORMS.has(form);
  if (!carvings.length && !dressings.length && wax.kind === 'even') return null;

  // Draw in box widths × box heights of 100 × H, so circles stay round.
  const H = (height / width) * 100;
  const flame = flameLayout(object.imagePath, object.imagePath ? imageRatio(object.imagePath) : null);
  const cx = flame.centerX;
  const half = (HALF_WIDTH[form] ?? 0.2) * 100;
  // The wax's top is where the flame stands; its foot near the box's bottom.
  const top = Math.max(2, ((flame.flameTop + flame.flameHeight) / 100) * H + 1);
  const bottom = H * 0.93;
  const body = Math.max(1, bottom - top);
  const waxHex = waxColor(String(object.color || 'white'));
  const oil = dressings.some((d) => d.type === 'oil');
  const herbs = dressings.filter((d) => d.type === 'herb');
  const progress = burnProgress(object, now);

  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} viewBox={`0 0 100 ${H}`} pointerEvents="none">
      <Defs>
        <LinearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="rgb(255,236,180)" stopOpacity={0} />
          <Stop offset="0.35" stopColor="rgb(255,236,180)" stopOpacity={0.28} />
          <Stop offset="0.5" stopColor="rgb(255,250,230)" stopOpacity={0.38} />
          <Stop offset="0.7" stopColor="rgb(255,236,180)" stopOpacity={0.12} />
          <Stop offset="1" stopColor="rgb(255,236,180)" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Oil: a faint sheen down one side of the wax. */}
      {oil && !low && <Rect x={cx - half * 0.85} y={top + body * 0.04} width={half * 0.9} height={body * 0.9} rx={half * 0.4} fill={`url(#sheen-${uid})`} />}

      {/* Herbs: a few flecks pressed into the wax, in their own colours. */}
      {!low &&
        herbs.length > 0 &&
        FLECKS.slice(0, Math.min(FLECKS.length, 4 + herbs.length * 2)).map(([fx, fy], i) => {
          const herb = herbs[i % herbs.length];
          return (
            <Ellipse
              key={`f${i}`}
              cx={cx + fx * half * 0.8}
              cy={top + fy * body}
              rx={Math.max(0.9, half * 0.07)}
              ry={Math.max(0.6, half * 0.045)}
              fill={ingredientColor(String(herb.herb || herb.label || ''))}
              opacity={0.75}
            />
          );
        })}

      {/* Carvings: down the wax, the top letters melting first as it burns. */}
      {!low &&
        carvings.map((carving, column) => {
          const remains = carvingRemaining(carving.text, progress);
          const glyphs = remains.glyphs;
          const span = body * 0.66;
          const size = Math.min(half * (carvings.length > 1 ? 0.7 : 0.95), span / Math.max(1, glyphs.length), 14);
          const x = carvings.length > 1 ? cx + (column === 0 ? -0.42 : 0.42) * half : cx;
          return glyphs.map((g, i) =>
            g.opacity > 0 && g.char.trim() ? (
              <SvgText
                key={`c${column}-${i}`}
                x={x}
                y={top + body * 0.08 + size * (i + 0.85)}
                fontSize={size}
                fontFamily={fonts.display}
                textAnchor="middle"
                fill="rgb(70,34,18)"
                fillOpacity={0.62 * g.opacity}
                stroke="rgb(255,240,220)"
                strokeOpacity={0.18 * g.opacity}
                strokeWidth={size * 0.06}
                transform={flipped ? `translate(${2 * x} 0) scale(-1 1)` : undefined}
              >
                {g.char}
              </SvgText>
            ) : null,
          );
        })}

      {/* Wax: a tunnel round the wick, a wide pool, drips, or the remnant. */}
      {wax.kind === 'tunnel' && (
        <>
          <Ellipse cx={cx} cy={top + 0.6} rx={half * 0.95} ry={Math.max(1, half * 0.16)} fill="rgb(255,244,228)" opacity={0.22} />
          <Ellipse cx={cx} cy={top + 0.9} rx={half * (0.32 + 0.2 * wax.amount)} ry={Math.max(0.8, half * 0.1)} fill="rgb(45,22,10)" opacity={0.25 + 0.3 * wax.amount} />
        </>
      )}
      {wax.kind === 'pool' && <Ellipse cx={cx} cy={top + 0.8} rx={half * 0.92} ry={Math.max(1, half * 0.15)} fill="rgb(255,246,226)" opacity={0.18 + 0.2 * wax.amount} stroke="rgb(255,250,236)" strokeOpacity={0.3} strokeWidth={0.4} />}
      {wax.kind === 'drips' &&
        DRIPS.slice(0, wax.drips).map(([dx, len], i) => {
          const x = cx + dx * Math.max(half, 3);
          const l = body * 0.12 * len * (0.6 + wax.amount);
          const w = Math.max(0.9, half * 0.18);
          return <Path key={`d${i}`} d={`M ${x - w / 2} ${top} L ${x - w / 2} ${top + l} Q ${x} ${top + l + w * 1.2} ${x + w / 2} ${top + l} L ${x + w / 2} ${top} Z`} fill={waxHex} opacity={0.82} />;
        })}
      {wax.kind === 'remnant' && wax.amount > 0 && (
        <>
          <Ellipse cx={cx} cy={H * 0.955} rx={Math.max(half * 1.25, 9)} ry={Math.max(1.6, H * 0.022)} fill={waxHex} opacity={0.72} />
          <Ellipse cx={cx - half * 0.2} cy={H * 0.948} rx={Math.max(half * 0.5, 3.5)} ry={Math.max(0.7, H * 0.009)} fill="rgb(255,250,236)" opacity={0.25} />
        </>
      )}
    </Svg>
  );
});
