// Simple horizontal bars, drawn as Your moon draws its phases
// (rituals/journal/insights.tsx) and Cycle & Moon its progress: a label, a
// gold bar on a raised track, the count. Each row is read out whole by a
// screen reader ("Cups: 4 draws"), and the number is always written, so the
// bar is never the only way to read it. A row can open something (a card's
// page) and carry a small moon disc or a note under its label.

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, type } from '../../theme';
import { MoonDisc } from '../MoonDisc';

export type BarRow = {
  key: string;
  label: string;
  count: number;
  /** A word after the label, in the caption style ("fire"). */
  note?: string | null;
  /** A line under the bar ("Most often: The Star"). */
  detail?: string | null;
  /** The moon's look beside it, for phase rows. */
  moon?: { illumination: number; waxing: boolean };
  onPress?: () => void;
};

/** How lit each phase is, for the little moons. */
export const PHASE_LIGHT: Record<string, { illumination: number; waxing: boolean }> = {
  'New Moon': { illumination: 0, waxing: true },
  'Waxing Crescent': { illumination: 0.25, waxing: true },
  'First Quarter': { illumination: 0.5, waxing: true },
  'Waxing Gibbous': { illumination: 0.8, waxing: true },
  'Full Moon': { illumination: 1, waxing: true },
  'Waning Gibbous': { illumination: 0.8, waxing: false },
  'Last Quarter': { illumination: 0.5, waxing: false },
  'Waning Crescent': { illumination: 0.25, waxing: false },
};

export function Bars({ rows, unit, wideLabel, footer }: { rows: BarRow[]; unit: [string, string]; wideLabel?: boolean; footer?: ReactNode }) {
  const most = Math.max(1, ...rows.map((r) => r.count));
  return (
    <View style={styles.list}>
      {rows.map((r) => {
        const words = `${r.label}${r.note ? ` (${r.note})` : ''}: ${r.count} ${r.count === 1 ? unit[0] : unit[1]}${r.detail ? `. ${r.detail}` : ''}`;
        const body = (
          <>
            <View style={styles.bar}>
              {r.moon && <MoonDisc size={20} illumination={r.moon.illumination} waxing={r.moon.waxing} halo={false} />}
              <Text style={[styles.label, wideLabel && styles.labelWide]} numberOfLines={1}>
                {r.label}
                {!!r.note && <Text style={styles.note}>{` ${r.note}`}</Text>}
              </Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${r.count ? Math.max(3, (r.count / most) * 100) : 0}%` }]} />
              </View>
              <Text style={styles.count}>{r.count}</Text>
            </View>
            {!!r.detail && <Text style={[type.caption, styles.detail]}>{r.detail}</Text>}
          </>
        );
        return r.onPress ? (
          <Pressable key={r.key} accessibilityRole="button" accessibilityLabel={words} onPress={r.onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            {body}
          </Pressable>
        ) : (
          <View key={r.key} accessible accessibilityLabel={words} style={styles.row}>
            {body}
          </View>
        );
      })}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: { gap: 2 },
  pressed: { opacity: 0.7 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 28 },
  label: { width: 118, fontFamily: fonts.body, fontSize: 13, color: colors.parchment },
  labelWide: { width: 150 },
  note: { fontSize: 12, color: colors.muted },
  track: { flex: 1, height: 8, borderRadius: radius.tile, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  fill: { height: 8, borderRadius: radius.tile, backgroundColor: colors.gold },
  count: { minWidth: 24, textAlign: 'right', fontFamily: fonts.bodySemi, fontSize: 13, color: colors.cream },
  detail: { paddingLeft: 2 },
});
