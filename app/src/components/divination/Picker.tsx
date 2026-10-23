// Choosing a spread: the one chosen, with a picture of its shape, and the
// rest a tap away in their groups (Quick, Classic, Moon & seasons, Deep work,
// Your spreads), each with a little picture so you can see the shape before
// you draw. Wrapping tiles, so a long list stays easy on a phone.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { groupedSpreads, type DrawKind, type Spread } from '../../lib/divination/draw';
import { colors, fonts, radius } from '../../theme';
import { SectionLabel } from '../rituals/ui';
import { SpreadDiagram } from './Spread';

type Props = {
  kind: DrawKind;
  custom: Spread[];
  chosen: Spread;
  open: boolean;
  onToggle: () => void;
  onChoose: (id: string) => void;
  onMake: () => void;
};

export function SpreadPicker({ kind, custom, chosen, open, onToggle, onChoose, onMake }: Props) {
  const groups = groupedSpreads(kind, custom);
  const shown = chosen.hidden ? groups.flatMap((g) => g.spreads).find((s) => s.variant?.id === chosen.id) ?? chosen : chosen;
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Spread: ${shown.label}. ${open ? 'Hide the other spreads' : 'Choose another spread'}`}
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={({ pressed }) => [styles.current, pressed && styles.pressed]}
      >
        <View style={styles.picture}>
          <SpreadDiagram spread={chosen} size={56} />
        </View>
        <View style={styles.currentText}>
          <Text style={styles.currentLabel}>{shown.label}</Text>
          <Text style={styles.more}>{open ? 'Hide the other spreads ▴' : `${chosen.positions.length === 1 ? 'One place' : `${chosen.positions.length} places`} · Choose another ▾`}</Text>
        </View>
      </Pressable>

      {open && (
        <View style={styles.groups}>
          {groups.map(({ group, spreads }) => (
            <View key={group.id} style={styles.group}>
              <SectionLabel>{group.label}</SectionLabel>
              <View style={styles.tiles}>
                {spreads.map((s) => (
                  <Tile key={s.id} spread={s} selected={s.id === shown.id} onPress={() => onChoose(s.id)} />
                ))}
                {group.id === 'yours' && <MakeTile onPress={onMake} />}
              </View>
            </View>
          ))}
          {!groups.some((g) => g.group.id === 'yours') && (
            <View style={styles.group}>
              <SectionLabel>Your spreads</SectionLabel>
              <View style={styles.tiles}>
                <MakeTile onPress={onMake} />
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function Tile({ spread, selected, onPress }: { spread: Spread; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${spread.label}, ${spread.positions.length === 1 ? 'one place' : `${spread.positions.length} places`}`}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, selected && styles.tileOn, pressed && styles.pressed]}
    >
      <View style={styles.tilePicture}>
        <SpreadDiagram spread={spread} size={52} />
      </View>
      <Text style={[styles.tileLabel, selected && styles.tileLabelOn]} numberOfLines={3}>
        {spread.label}
      </Text>
    </Pressable>
  );
}

function MakeTile({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Make your own spread" onPress={onPress} style={({ pressed }) => [styles.tile, styles.make, pressed && styles.pressed]}>
      <View style={styles.tilePicture}>
        <Text style={styles.plus}>+</Text>
      </View>
      <Text style={styles.tileLabel}>Make your own</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  pressed: { opacity: 0.7 },
  current: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.surface,
  },
  picture: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  currentText: { flex: 1, gap: 2 },
  currentLabel: { fontFamily: fonts.display, fontSize: 20, color: colors.cream },
  more: { fontFamily: fonts.body, fontSize: 13, color: colors.gold },
  groups: { gap: 16 },
  group: { gap: 8 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: 102,
    minHeight: 120,
    padding: 8,
    gap: 6,
    alignItems: 'center',
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: 'rgba(244,236,216,0.18)',
    backgroundColor: colors.surface,
  },
  tileOn: { borderColor: colors.gold, backgroundColor: colors.surfaceRaised },
  tilePicture: { height: 56, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 16, color: colors.parchment, textAlign: 'center' },
  tileLabelOn: { color: colors.gold, fontFamily: fonts.bodySemi },
  make: { borderStyle: 'dashed', borderColor: colors.goldLine },
  plus: { fontFamily: fonts.display, fontSize: 34, color: colors.gold },
});
