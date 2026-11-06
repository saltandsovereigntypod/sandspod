// Planning a crystal grid: its shape (drawn as a small map of where the
// stones go), the centre stone and the points from your own stones or the
// Living Library's, the intent and how long it runs. Shared by Craft →
// Crystal → Grids and the altar's Workings.

import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { DURATIONS, pointStones, SHAPES, shapeOf, shapePoints, type Grid, type GridStone } from '../../lib/craft/crystal/grids';
import { STONES } from '../../lib/craft/crystal/collections';
import { normaliseStone, type Stone } from '../../lib/craft/crystal/stones';
import { useCraft } from '../../lib/craft/store';
import { useLibrary } from '../../lib/library';
import { colors, fonts, radius, touch, type } from '../../theme';

const INTENTS = ['Calm', 'Protection', 'Love', 'Abundance', 'Healing', 'Clarity', 'Sleep', 'Courage'];

/** The shape as dots joined to the centre, with the stones' names on hover for screen readers. */
export function GridMap({ grid, size = 160 }: { grid: Pick<Grid, 'shape' | 'centre' | 'points'>; size?: number }) {
  const pts = shapePoints(grid.shape);
  const stones = pointStones(grid);
  const c = size / 2;
  const r = size * 0.38;
  const label = `${shapeOf(grid.shape).label} grid: ${grid.centre?.name ?? 'no centre stone yet'} in the middle${stones.length ? `, ${[...new Set(stones.map((s) => s.name))].join(', ')} round it` : ''}`;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {pts.map((p, i) => (
          <Line key={`l${i}`} x1={c} y1={c} x2={c + p.x * r} y2={c + p.y * r} stroke={colors.goldLine} strokeWidth={1} />
        ))}
        {pts.map((p, i) => {
          const n = pts[(i + 1) % pts.length];
          return grid.shape === 'spiral' && i === pts.length - 1 ? null : <Line key={`o${i}`} x1={c + p.x * r} y1={c + p.y * r} x2={c + n.x * r} y2={c + n.y * r} stroke={colors.goldLine} strokeWidth={1} />;
        })}
        <Circle cx={c} cy={c} r={10} fill={grid.centre ? colors.gold : colors.surfaceRaised} stroke={colors.gold} />
        {pts.map((p, i) => (
          <Circle key={`p${i}`} cx={c + p.x * r} cy={c + p.y * r} r={7} fill={stones[i] ? colors.parchment : colors.surfaceRaised} stroke={colors.gold} />
        ))}
      </Svg>
    </View>
  );
}

function Pill({ label, on, onPress, hint }: { label: string; on?: boolean; onPress: () => void; hint?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!on }} accessibilityLabel={hint ?? label} onPress={onPress} style={[styles.pill, on && styles.pillOn]}>
      <Text style={[styles.pillText, on && styles.pillTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function GridBuilder({ grid, onChange }: { grid: Grid; onChange: (next: Grid) => void }) {
  const { entries: mine } = useCraft<Stone>(STONES);
  const { entries: library } = useLibrary();
  const [query, setQuery] = useState('');
  const [picking, setPicking] = useState<'centre' | 'points'>('centre');
  const own: GridStone[] = useMemo(() => mine.map((e) => normaliseStone(e.data)).map((s, i) => ({ name: s.name, stoneId: mine[i].id, key: s.key ?? null })), [mine]);
  const found: GridStone[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return library
      .filter((e) => e.type === 'crystal' && e.name.toLowerCase().includes(q))
      .slice(0, 8)
      .map((e) => ({ name: e.name, key: e.id.split(':')[2] ?? null }));
  }, [query, library]);
  const pick = (s: GridStone) => {
    if (picking === 'centre') {
      onChange({ ...grid, centre: s });
      setPicking('points');
    } else if (!grid.points.some((p) => p.name === s.name) && grid.points.length < 6) onChange({ ...grid, points: [...grid.points, s] });
    setQuery('');
  };

  return (
    <View style={styles.wrap}>
      <GridMap grid={grid} />
      <Text style={type.eyebrow}>Shape</Text>
      <View style={styles.row}>
        {SHAPES.map((s) => (
          <Pill key={s.key} label={s.label} on={grid.shape === s.key} onPress={() => onChange({ ...grid, shape: s.key })} />
        ))}
      </View>
      <Text style={type.caption}>{shapeOf(grid.shape).line}</Text>

      <Text style={type.eyebrow}>For</Text>
      <View style={styles.row}>
        {INTENTS.map((i) => (
          <Pill key={i} label={i} on={grid.intent === i} onPress={() => onChange({ ...grid, intent: i })} />
        ))}
      </View>
      <TextInput value={grid.intent} onChangeText={(intent) => onChange({ ...grid, intent: intent.slice(0, 120) })} placeholder="Or in your own words" placeholderTextColor={colors.tabInactive} accessibilityLabel="What the grid is for" style={styles.input} />

      <Text style={type.eyebrow}>Stones</Text>
      <View style={styles.row}>
        <Pill label={grid.centre ? `Centre: ${grid.centre.name}` : 'Choose the centre'} on={picking === 'centre'} onPress={() => setPicking('centre')} />
        <Pill label={grid.points.length ? `Points: ${grid.points.map((p) => p.name).join(', ')}` : 'Choose the points'} on={picking === 'points'} onPress={() => setPicking('points')} />
      </View>
      <Text style={type.caption}>{picking === 'centre' ? 'The centre stone holds the intent; a clear quartz point is the usual choice.' : 'Up to six kinds; they repeat round the shape in turn.'}</Text>
      {own.length > 0 && (
        <View style={styles.row}>
          {own.map((s) => (
            <Pill key={s.stoneId} label={s.name} hint={`Add ${s.name}, from My stones`} onPress={() => pick(s)} />
          ))}
        </View>
      )}
      <TextInput value={query} onChangeText={setQuery} placeholder="Search the Library’s stones…" placeholderTextColor={colors.tabInactive} accessibilityLabel="Search stones" style={styles.input} />
      {found.length > 0 && (
        <View style={styles.row}>
          {found.map((s) => (
            <Pill key={s.name} label={`+ ${s.name}`} hint={`Add ${s.name}`} onPress={() => pick(s)} />
          ))}
        </View>
      )}
      {grid.points.length > 0 && (
        <View style={styles.row}>
          {grid.points.map((p, i) => (
            <Pill key={p.name} label={`${p.name}  ×`} hint={`Take out ${p.name}`} onPress={() => onChange({ ...grid, points: grid.points.filter((_, j) => j !== i) })} />
          ))}
        </View>
      )}

      <Text style={type.eyebrow}>How long</Text>
      <View style={styles.row}>
        {DURATIONS.map((d) => (
          <Pill key={d.days} label={d.label} on={grid.days === d.days} onPress={() => onChange({ ...grid, days: d.days })} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { minHeight: touch, justifyContent: 'center', paddingHorizontal: 14, borderRadius: radius.chip, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.hairline, maxWidth: '100%' },
  pillOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  pillText: { fontFamily: fonts.body, fontSize: 15, color: colors.cream },
  pillTextOn: { color: colors.forestInk },
  input: { minHeight: touch, borderRadius: radius.button, borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: 12, color: colors.cream, fontFamily: fonts.body, fontSize: 16, backgroundColor: colors.surface },
});
