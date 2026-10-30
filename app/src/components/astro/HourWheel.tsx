// The planetary day as a wheel: its 24 hours from sunrise to the next
// sunrise, each segment as long as that hour really is where you are (long
// summer days, short winter ones), the day hours light and the night hours
// dark, the hour you're in picked out in gold with a countdown in the middle.
// Each segment is a button that says whose hour it is and when.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import type { PlanetaryHour } from '../../lib/astro/hours';
import { POINT_GLYPH } from '../../lib/astro/signs';
import { timeOfDay } from '../../lib/calendar';
import { colors, fonts, type } from '../../theme';

const TAU = Math.PI * 2;

export function countdown(ms: number): string {
  const mins = Math.max(0, Math.round(ms / 60_000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h} h ${m} min` : `${m} min`;
}

export function HourWheel({ hours, now, size, onPick }: { hours: PlanetaryHour[]; now: Date; size: number; onPick: (h: PlanetaryHour) => void }) {
  const c = size / 2;
  const r1 = c - 2;
  const r2 = c * 0.62;
  const start = hours[0].start.getTime();
  const total = hours[hours.length - 1].end.getTime() - start;
  // Sunrise on the left (east), the day arching over the top, the night below.
  const angle = (t: number) => Math.PI - ((t - start) / total) * TAU;
  const pt = (a: number, r: number) => ({ x: c + r * Math.cos(a), y: c - r * Math.sin(a) });
  const current = hours.find((h) => now.getTime() >= h.start.getTime() && now.getTime() < h.end.getTime()) ?? null;

  const seg = (h: PlanetaryHour) => {
    const a0 = angle(h.start.getTime());
    const a1 = angle(h.end.getTime());
    const p = pt(a0, r1);
    const q = pt(a1, r1);
    const s = pt(a1, r2);
    const t = pt(a0, r2);
    const large = a0 - a1 > Math.PI ? 1 : 0;
    return `M${p.x},${p.y} A${r1},${r1} 0 ${large} 1 ${q.x},${q.y} L${s.x},${s.y} A${r2},${r2} 0 ${large} 0 ${t.x},${t.y} Z`;
  };
  const nowAngle = angle(now.getTime());
  const hand = pt(nowAngle, r1 + 1);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {hours.map((h) => {
          const on = h === current;
          return (
            <Path
              key={h.start.toISOString()}
              d={seg(h)}
              fill={on ? colors.gold : h.night ? colors.night : colors.surfaceRaised}
              stroke={colors.goldLine}
              strokeWidth={0.75}
            />
          );
        })}
        {hours.map((h) => {
          const mid = (angle(h.start.getTime()) + angle(h.end.getTime())) / 2;
          const p = pt(mid, (r1 + r2) / 2);
          const on = h === current;
          return (
            <SvgText key={`g-${h.start.toISOString()}`} x={p.x} y={p.y + 5} fontSize={14} fill={on ? colors.forestInk : h.night ? colors.muted : colors.cream} textAnchor="middle">
              {POINT_GLYPH[h.planet]}
            </SvgText>
          );
        })}
        {now.getTime() >= start && now.getTime() < start + total && <Circle cx={hand.x} cy={hand.y} r={4} fill={colors.cream} />}
      </Svg>
      {hours.map((h) => {
        const mid = (angle(h.start.getTime()) + angle(h.end.getTime())) / 2;
        const p = pt(mid, (r1 + r2) / 2);
        return (
          <Pressable
            key={`b-${h.start.toISOString()}`}
            accessibilityRole="button"
            accessibilityLabel={`${h === current ? 'Now. ' : ''}${h.planet} hour, ${timeOfDay(h.start)} to ${timeOfDay(h.end)}${h.night ? ', night' : ''}`}
            onPress={() => onPick(h)}
            style={[styles.hit, { left: p.x - 18, top: p.y - 18 }]}
          />
        );
      })}
      <View style={[styles.centre, { left: c - r2 + 8, top: c - r2 + 8, width: (r2 - 8) * 2, height: (r2 - 8) * 2 }]} pointerEvents="none">
        {current ? (
          <>
            <Text style={type.eyebrow}>Now</Text>
            <Text style={styles.big}>{`${POINT_GLYPH[current.planet]} ${current.planet}`}</Text>
            <Text style={[type.caption, styles.centreText]}>{`${countdown(current.end.getTime() - now.getTime())} left`}</Text>
          </>
        ) : (
          <Text style={[type.caption, styles.centreText]}>Sunrise to sunrise</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { position: 'absolute', width: 36, height: 36, borderRadius: 18 },
  centre: { position: 'absolute', alignItems: 'center', justifyContent: 'center', gap: 2 },
  big: { fontFamily: fonts.display, fontSize: 26, color: colors.gold, textAlign: 'center' },
  centreText: { textAlign: 'center' },
});
