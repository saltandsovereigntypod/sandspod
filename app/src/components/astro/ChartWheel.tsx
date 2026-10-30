// The birth chart drawn as a wheel: the zodiac around the edge, the houses,
// the planets and points, and the aspect lines in the middle. The rising
// degree sits on the left, as in most Western charts (0° Aries when there is
// no birth time). Every planet, sign and house number is a real button over
// the drawing (44pt, labelled for screen readers), and aspect lines answer a
// tap too, so anything on the wheel opens its explanation.

import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { aspectDef, type AspectHit } from '../../lib/astro/aspects';
import type { Chart, Position } from '../../lib/astro/natal';
import { POINT_GLYPH, SIGN_GLYPH, SIGNS, elementOf, type ChartPointName } from '../../lib/astro/signs';
import type { ZodiacSign } from '../../lib/moon';
import { colors, fonts } from '../../theme';

const RAD = Math.PI / 180;

const ELEMENT_TINT = { fire: 'rgba(214,120,72,0.16)', earth: 'rgba(136,150,96,0.16)', air: 'rgba(170,190,210,0.12)', water: 'rgba(90,140,180,0.16)' } as const;
const ASPECT_COLOR = { soft: '#7fb0c9', hard: '#d9826a', blend: colors.gold, minor: 'rgba(230,220,194,0.5)' } as const;

export type WheelTap =
  | { kind: 'point'; point: ChartPointName; position: Position; ring: 'natal' | 'outer' }
  | { kind: 'sign'; sign: ZodiacSign }
  | { kind: 'house'; house: number }
  | { kind: 'aspect'; aspect: AspectHit };

type Props = {
  chart: Chart;
  size: number;
  onTap: (tap: WheelTap) => void;
  /** A second ring: transits or another person's chart (synastry). */
  outer?: Position[];
  outerLabel?: string;
  /** Aspects to draw between the rings instead of the chart's own. */
  aspects?: AspectHit[];
  /** Hide the aspect lines (crowded charts). */
  noAspects?: boolean;
};

const WHEEL_POINTS: ChartPointName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node', 'South Node', 'Lilith', 'Part of Fortune'];

/** Spread glyphs that would overlap, keeping their order around the circle. */
function spread(longitudes: number[], minGap: number): number[] {
  const order = longitudes.map((lon, i) => ({ lon, i })).sort((a, b) => a.lon - b.lon);
  const placed = order.map((o) => o.lon);
  for (let pass = 0; pass < 40; pass++) {
    let moved = false;
    for (let k = 0; k < placed.length; k++) {
      const next = (k + 1) % placed.length;
      let gap = placed[next] - placed[k];
      if (next === 0) gap += 360;
      if (placed.length > 1 && gap < minGap) {
        const push = (minGap - gap) / 2;
        placed[k] -= push;
        placed[next] += push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const out = new Array<number>(longitudes.length);
  order.forEach((o, k) => (out[o.i] = placed[k]));
  return out;
}

export function ChartWheel({ chart, size, onTap, outer, outerLabel, aspects, noAspects }: Props) {
  const c = size / 2;
  const rOuter = c - 2;
  const rSigns = rOuter - size * 0.085;
  const rOuterRing = outer ? rSigns - size * 0.075 : rSigns;
  const rHouses = rOuterRing - size * 0.055;
  const rPlanets = rHouses - size * 0.045;
  const rAspects = rHouses - size * 0.135;
  // House numbers sit on their own inner ring, clear of the planets.
  const rHouseNum = rAspects + size * 0.024;
  const asc = chart.houses?.ascendant ?? chart.solarCusps?.[0] ?? 0;
  const cusps = chart.houses?.cusps ?? chart.solarCusps;

  // Screen angle: the rising degree on the left, the zodiac running counter-clockwise.
  const at = (lon: number, r: number) => {
    const t = (180 + (lon - asc)) * RAD;
    return { x: c + r * Math.cos(t), y: c - r * Math.sin(t) };
  };
  const arc = (from: number, to: number, r1: number, r2: number) => {
    const a = at(from, r1);
    const b = at(to, r1);
    const d = at(to, r2);
    const e = at(from, r2);
    const span = ((to - from) % 360 + 360) % 360;
    const large = span > 180 ? 1 : 0;
    // Counter-clockwise on screen is "sweep 0" with y pointing down.
    return `M${a.x},${a.y} A${r1},${r1} 0 ${large} 0 ${b.x},${b.y} L${d.x},${d.y} A${r2},${r2} 0 ${large} 1 ${e.x},${e.y} Z`;
  };

  const natal = useMemo(() => chart.positions.filter((p) => WHEEL_POINTS.includes(p.point)), [chart]);
  const natalSpread = useMemo(() => spread(natal.map((p) => p.longitude), 7.5), [natal]);
  const outerSpread = useMemo(() => (outer ? spread(outer.map((p) => p.longitude), 7.5) : []), [outer]);
  const lines = noAspects ? [] : (aspects ?? chart.aspects).filter((a) => aspectDef(a.aspect).major || a.orb < 1.5);
  const lonOf = (point: ChartPointName, ring: 'natal' | 'outer') =>
    (ring === 'outer' ? outer : chart.positions)?.find((p) => p.point === point)?.longitude ?? null;

  const glyphSize = Math.max(13, size * 0.042);
  const hit = 36;

  return (
    <View style={{ width: size, height: size }} accessible={false}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={rOuter} fill={colors.surface} stroke={colors.goldLine} strokeWidth={1} />
        {SIGNS.map((sign, i) => (
          <Path key={sign} d={arc(i * 30, i * 30 + 30, rOuter, rSigns)} fill={ELEMENT_TINT[elementOf(sign)]} stroke={colors.goldLine} strokeWidth={0.75} onPress={() => onTap({ kind: 'sign', sign })} />
        ))}
        {SIGNS.map((sign, i) => {
          const p = at(i * 30 + 15, (rOuter + rSigns) / 2);
          return (
            <SvgText key={sign} x={p.x} y={p.y + glyphSize * 0.35} fontSize={glyphSize} fill={colors.gold} textAnchor="middle">
              {SIGN_GLYPH[sign]}
            </SvgText>
          );
        })}
        {/* Degree ticks every 10°. */}
        {Array.from({ length: 36 }, (_, i) => {
          const a = at(i * 10, rSigns);
          const b = at(i * 10, rSigns - 4);
          return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors.goldLine} strokeWidth={0.75} />;
        })}
        {outer && <Circle cx={c} cy={c} r={rOuterRing} fill="none" stroke={colors.hairline} strokeWidth={1} />}
        <Circle cx={c} cy={c} r={rHouses} fill={colors.ground} stroke={colors.goldLine} strokeWidth={0.75} />
        <Circle cx={c} cy={c} r={rAspects} fill="none" stroke={colors.hairline} strokeWidth={0.75} />
        {cusps?.map((cusp, i) => {
          const angle = chart.houses && (i === 0 || i === 3 || i === 6 || i === 9);
          const a = at(cusp, angle ? rOuterRing : rHouses);
          const b = at(cusp, rAspects);
          return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={angle ? colors.gold : colors.goldLine} strokeWidth={angle ? 1.5 : 0.75} strokeDasharray={chart.houses ? undefined : '3,3'} />;
        })}
        {cusps?.map((cusp, i) => {
          const next = cusps[(i + 1) % 12];
          const mid = cusp + (((next - cusp) % 360 + 360) % 360) / 2;
          const p = at(mid, rHouseNum);
          return (
            <SvgText key={i} x={p.x} y={p.y + 4} fontSize={glyphSize * 0.62} fill={colors.muted} textAnchor="middle">
              {String(i + 1)}
            </SvgText>
          );
        })}
        <G>
          {lines.map((a) => {
            const la = lonOf(a.a, outer ? 'outer' : 'natal') ?? lonOf(a.a, 'natal');
            const lb = lonOf(a.b, 'natal');
            if (la === null || lb === null) return null;
            const p = at(la, rAspects);
            const q = at(lb, rAspects);
            const def = aspectDef(a.aspect);
            return (
              <G key={`${a.a}-${a.b}-${a.aspect}`} onPress={() => onTap({ kind: 'aspect', aspect: a })}>
                <Line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="transparent" strokeWidth={12} />
                <Line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={ASPECT_COLOR[def.tone]} strokeWidth={def.major ? 1.2 : 0.8} strokeOpacity={Math.max(0.35, 1 - a.orb / 8)} strokeDasharray={def.major ? undefined : '4,3'} />
              </G>
            );
          })}
        </G>
        {natal.map((p, i) => {
          const g = at(natalSpread[i], rPlanets);
          const tick = at(p.longitude, rHouses);
          const tick2 = at(p.longitude, rHouses - 5);
          return (
            <G key={p.point}>
              <Line x1={tick.x} y1={tick.y} x2={tick2.x} y2={tick2.y} stroke={colors.cream} strokeWidth={1} />
              <SvgText x={g.x} y={g.y + glyphSize * 0.35} fontSize={glyphSize} fill={colors.cream} textAnchor="middle" fontFamily={fonts.body}>
                {POINT_GLYPH[p.point]}
              </SvgText>
              {p.retrograde && (
                <SvgText x={g.x + glyphSize * 0.6} y={g.y + glyphSize * 0.75} fontSize={glyphSize * 0.45} fill={colors.muted}>
                  ℞
                </SvgText>
              )}
            </G>
          );
        })}
        {outer?.map((p, i) => {
          const g = at(outerSpread[i], (rSigns + rOuterRing) / 2);
          return (
            <SvgText key={p.point} x={g.x} y={g.y + glyphSize * 0.32} fontSize={glyphSize * 0.9} fill="#9fc6da" textAnchor="middle">
              {POINT_GLYPH[p.point]}
            </SvgText>
          );
        })}
        {chart.houses && (
          <>
            <SvgText x={at(chart.houses.ascendant, rHouses - 10).x + 4} y={c - 4} fontSize={glyphSize * 0.6} fill={colors.gold}>
              AC
            </SvgText>
          </>
        )}
      </Svg>

      {/* The buttons over the drawing: houses and signs first, so the planets sit on top. */}
      {cusps?.map((cusp, i) => {
        const next = cusps[(i + 1) % 12];
        const mid = cusp + (((next - cusp) % 360 + 360) % 360) / 2;
        const p = at(mid, rHouseNum);
        return (
          <Pressable
            key={`h-${i}`}
            accessibilityRole="button"
            accessibilityLabel={`House ${i + 1}`}
            onPress={() => onTap({ kind: 'house', house: i + 1 })}
            style={[styles.hit, { left: p.x - 14, top: p.y - 14, width: 28, height: 28 }]}
          />
        );
      })}
      {SIGNS.map((sign, i) => {
        const p = at(i * 30 + 15, (rOuter + rSigns) / 2);
        return (
          <Pressable
            key={`s-${sign}`}
            accessibilityRole="button"
            accessibilityLabel={sign}
            onPress={() => onTap({ kind: 'sign', sign })}
            style={[styles.hit, { left: p.x - 16, top: p.y - 16, width: 32, height: 32 }]}
          />
        );
      })}
      {natal.map((p, i) => {
        const g = at(natalSpread[i], rPlanets);
        return (
          <Pressable
            key={`b-${p.point}`}
            accessibilityRole="button"
            accessibilityLabel={`${p.point}, ${p.degree} degrees ${p.sign}${p.house ? `, house ${p.house}` : ''}${p.retrograde ? ', retrograde' : ''}`}
            onPress={() => onTap({ kind: 'point', point: p.point, position: p, ring: 'natal' })}
            style={[styles.hit, { left: g.x - hit / 2, top: g.y - hit / 2, width: hit, height: hit }]}
          />
        );
      })}
      {outer?.map((p, i) => {
        const g = at(outerSpread[i], (rSigns + rOuterRing) / 2);
        return (
          <Pressable
            key={`o-${p.point}`}
            accessibilityRole="button"
            accessibilityLabel={`${outerLabel ?? 'Outer'} ${p.point}, ${p.degree} degrees ${p.sign}`}
            onPress={() => onTap({ kind: 'point', point: p.point, position: p, ring: 'outer' })}
            style={[styles.hit, { left: g.x - hit / 2 + 6, top: g.y - hit / 2 + 6, width: hit - 12, height: hit - 12 }]}
          />
        );
      })}
      {!chart.houses && (
        <Text style={[styles.note, { top: c - 8 }]} accessibilityElementsHidden>
          {chart.solarCusps ? 'Solar chart' : 'No birth time: no houses'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { position: 'absolute', borderRadius: 999 },
  note: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: fonts.body, fontSize: 11, color: colors.muted },
});
