// The moon wheel: this lunar month as a ring (new moon at the top, full at
// the bottom), each day coloured by their inner season, with marks where
// their recent bleeds began and a dot for today. The website draws the same
// wheel from the same model (rituals/cycle/cycle.js).

import { Text, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import { PATTERN_COLOURS, SEASON_COLOURS } from '../../lib/cycle/content';
import { PATTERN_NAMES, SEASON_NAMES, wheelArc, wheelPoint, type WheelModel } from '../../lib/cycle/model';
import { colors, type } from '../../theme';

export function CycleWheel({ wheel, size = 280 }: { wheel: WheelModel; size?: number }) {
  const c = size / 2;
  const ring = size * 0.36;
  const inner = size * 0.27;
  const n = wheel.days.length;
  const seasons = [...new Set(wheel.days.map((d) => d.season))];
  const label = `The moon wheel for this lunar month. ${seasons.map((s) => SEASON_NAMES[s]).join(', ')}. ${
    wheel.bleeds.length ? `${wheel.bleeds.length} recent ${wheel.bleeds.length === 1 ? 'bleed' : 'bleeds'} marked: ${wheel.bleeds.map((b) => PATTERN_NAMES[b.pattern]).join(', ')}.` : ''
  }`;
  const today = wheelPoint(wheel.today, c, c, ring);
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ alignItems: 'center', gap: 8 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={c} cy={c} r={ring} stroke={colors.hairline} strokeWidth={22} fill="none" />
        {wheel.days.map((d, i) => {
          const from = i / n;
          const to = (i + 1) / n - 0.002;
          return <Path key={d.key} d={wheelArc(from, to, c, c, ring)} stroke={SEASON_COLOURS[d.season]} strokeOpacity={d.byMoon ? 0.55 : 0.9} strokeWidth={d.bleeding ? 26 : 18} fill="none" />;
        })}
        {wheel.marks.map((m) => {
          const p = wheelPoint(m.fraction, c, c, size * 0.46);
          return (
            <G key={m.name}>
              <Circle cx={p.x} cy={p.y} r={7} fill={m.fraction === 0 ? colors.night : m.fraction === 0.5 ? colors.cream : colors.surfaceRaised} stroke={colors.goldLine} strokeWidth={1} />
            </G>
          );
        })}
        {wheel.bleeds.map((b, i) => {
          const p = wheelPoint(b.fraction, c, c, inner);
          return <Circle key={`${b.start}-${i}`} cx={p.x} cy={p.y} r={i === 0 ? 7 : 5} fill={PATTERN_COLOURS[b.pattern]} opacity={i === 0 ? 1 : 0.7} stroke={colors.night} strokeWidth={1} />;
        })}
        <Circle cx={today.x} cy={today.y} r={9} fill="none" stroke={colors.cream} strokeWidth={2.5} />
        <SvgText x={c} y={c - 4} fill={colors.cream} fontSize={15} textAnchor="middle">
          this lunar month
        </SvgText>
        <SvgText x={c} y={c + 16} fill={colors.muted} fontSize={12} textAnchor="middle">
          new at the top · full below
        </SvgText>
      </Svg>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {(['winter', 'spring', 'summer', 'autumn'] as const).map((s) => (
          <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: SEASON_COLOURS[s] }} />
            <Text style={type.caption}>{SEASON_NAMES[s]}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.cream }} />
          <Text style={type.caption}>today</Text>
        </View>
        {wheel.bleeds.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: PATTERN_COLOURS[wheel.bleeds[0].pattern] }} />
            <Text style={type.caption}>where a bleed began</Text>
          </View>
        )}
      </View>
    </View>
  );
}
