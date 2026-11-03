// What the altar's tools leave on it, drawn over the objects: the cast
// circle's glowing ring (lib/altar/circle.ts), the quarters lit at the
// altar's edges, the thin line of light following an athame or wand while a
// circle is traced, and the debris the besom sweeps away (spent matches, the
// ash of a burned petition: lib/altar/toolRites.ts). Shared with the website
// (altar/js/features/altar-rites.js), which draws the same.

import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { circleOf, QUARTER_SPOT, quarterColor, quarterOf, quartersOf, type Pt } from '../../lib/altar/circle';
import type { AltarDocument } from '../../lib/altar/snapshot';
import { debrisOf } from '../../lib/altar/toolRites';

type Props = {
  doc: AltarDocument;
  stageWidth: number;
  stageHeight: number;
  /** A circle being traced: its points as stage fractions, and its colour. */
  trail?: { points: Pt[]; color: string } | null;
};

export const RiteLayer = memo(function RiteLayer({ doc, stageWidth: w, stageHeight: h, trail }: Props) {
  const circle = circleOf(doc.extra);
  const quarters = quartersOf(doc.extra);
  const debris = debrisOf(doc.extra);
  if (!circle && !quarters.open.length && !debris.length && !trail?.points.length) return null;
  const unit = w / 600;
  return (
    <Svg pointerEvents="none" width={w} height={h} style={StyleSheet.absoluteFill}>
      {debris.map((d) =>
        d.kind === 'match' ? (
          <G key={d.id}>
            <Line x1={d.x * w - 9 * unit} y1={d.y * h + 2 * unit} x2={d.x * w + 9 * unit} y2={d.y * h - 2 * unit} stroke="rgb(196,160,112)" strokeWidth={1.6 * unit} strokeLinecap="round" />
            <Circle cx={d.x * w - 9 * unit} cy={d.y * h + 2 * unit} r={2 * unit} fill="rgb(30,24,22)" />
          </G>
        ) : (
          <G key={d.id} opacity={0.85}>
            <Circle cx={d.x * w} cy={d.y * h} r={7 * unit} fill="rgb(90,86,82)" opacity={0.55} />
            <Circle cx={d.x * w + 3 * unit} cy={d.y * h - 1.5 * unit} r={4 * unit} fill="rgb(150,146,140)" opacity={0.6} />
            <Circle cx={d.x * w - 3.5 * unit} cy={d.y * h + 1 * unit} r={2.5 * unit} fill="rgb(40,36,34)" opacity={0.7} />
          </G>
        ),
      )}
      {circle && (
        <G>
          <Rect x={3 * unit} y={3 * unit} width={w - 6 * unit} height={h - 6 * unit} rx={14 * unit} stroke={circle.color} strokeOpacity={0.18} strokeWidth={14 * unit} fill="none" />
          <Rect x={3 * unit} y={3 * unit} width={w - 6 * unit} height={h - 6 * unit} rx={14 * unit} stroke={circle.color} strokeOpacity={0.4} strokeWidth={5 * unit} fill="none" />
          <Rect x={3 * unit} y={3 * unit} width={w - 6 * unit} height={h - 6 * unit} rx={14 * unit} stroke={circle.color} strokeOpacity={0.95} strokeWidth={1.4 * unit} fill="none" />
        </G>
      )}
      {quarters.open.map((id) => {
        const spot = QUARTER_SPOT[id];
        const color = quarterColor(quarters, id);
        return (
          <G key={id}>
            <Circle cx={spot.x * w} cy={spot.y * h} r={16 * unit} fill={color} opacity={0.22} />
            <Circle cx={spot.x * w} cy={spot.y * h} r={9 * unit} fill={color} opacity={0.85} />
            <SvgText x={spot.x * w} y={spot.y * h + 3.6 * unit} fontSize={10 * unit} fontWeight="700" fill="rgb(28,22,30)" textAnchor="middle">
              {quarterOf(id)!.name[0]}
            </SvgText>
          </G>
        );
      })}
      {trail && trail.points.length > 1 && (
        <G>
          <Polyline points={trail.points.map((p) => `${p.x * w},${p.y * h}`).join(' ')} stroke={trail.color} strokeOpacity={0.3} strokeWidth={6 * unit} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Polyline points={trail.points.map((p) => `${p.x * w},${p.y * h}`).join(' ')} stroke={trail.color} strokeWidth={1.6 * unit} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </G>
      )}
    </Svg>
  );
});
