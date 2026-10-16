// The altar's workings and its reading in two short lists, so the panel keeps
// to a few chips: make a spell jar or a sachet, keep a spell over days, scry,
// fill the gratitude bowl; or read the altar, set its intention, lay it out
// with meaning (and let things settle onto the directions while you arrange).

import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { colors, fonts, radius, touch, type } from '../../theme';
import { Sheet } from './Sheet';

export type MoreAction = 'jar' | 'sachet' | 'spell' | 'scry' | 'gratitude' | 'read' | 'intention' | 'layouts' | 'tonight';

type Row = { id: MoreAction; symbol: string; title: string; line: string; needsSave?: boolean };

const WORKINGS: Row[] = [
  { id: 'jar', symbol: '⚱', title: 'Spell jar', line: 'Build a jar in layers, a word spoken with each, and seal it with wax.' },
  { id: 'sachet', symbol: '❦', title: 'Sachet or charm bag', line: 'Fill it, tie it with knots, carry it, and feed it on its day.' },
  { id: 'spell', symbol: '◔', title: 'Spell over days', line: 'A seven-day candle, nine nights, a moon’s jar: the altar keeps count.', needsSave: true },
  { id: 'scry', symbol: '◉', title: 'Scrying bowl', line: 'A quiet, timed sit with dark water, then a few words on what came.', needsSave: true },
  { id: 'gratitude', symbol: '❂', title: 'Gratitude bowl', line: 'A bead for each thing you’re thankful for, filling through the moon.', needsSave: true },
];

const READING: Row[] = [
  { id: 'read', symbol: '☉', title: 'Read this altar', line: 'Its elements and planets, what it speaks of, and one thing to round it out.' },
  { id: 'intention', symbol: '✧', title: 'Intention', line: 'One line on what this altar is for, and how each piece holds it.', needsSave: true },
  { id: 'layouts', symbol: '✣', title: 'Layouts with meaning', line: 'The four directions, a triangle, a pentacle, a grid, God and Goddess.' },
];

type Props = {
  visible: boolean;
  section: 'workings' | 'reading';
  /** Whether the altar is saved (some of these are kept with it). */
  saved: boolean;
  /** The altar came from Tonight's altar: offer why each piece is there. */
  tonight: boolean;
  intention: string;
  snap: boolean;
  onSnap: (on: boolean) => void;
  onPick: (action: MoreAction) => void;
  onClose: () => void;
};

export function MoreSheet({ visible, section, saved, tonight, intention, snap, onSnap, onPick, onClose }: Props) {
  const rows = section === 'workings' ? WORKINGS : tonight ? [{ id: 'tonight' as const, symbol: '☾', title: 'Why these pieces', line: 'Why each piece of tonight’s altar is there, and what could stand in for it.' }, ...READING] : READING;
  return (
    <Sheet visible={visible} size="half" eyebrow={section === 'workings' ? 'Workings' : 'Read & arrange'} title={section === 'workings' ? 'Work at this altar' : 'Read and arrange it'} onClose={onClose}>
      {section === 'reading' && !!intention && <Text style={styles.intention}>{`“${intention}”`}</Text>}
      <View style={styles.list}>
        {rows.map((row) => (
          <Pressable
            key={row.id}
            onPress={() => onPick(row.id)}
            accessibilityRole="button"
            accessibilityLabel={row.title}
            accessibilityHint={row.needsSave && !saved ? `${row.line} Save the altar first; it’s kept with it.` : row.line}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.symbol}>{row.symbol}</Text>
            <View style={styles.rowText}>
              <Text style={styles.title}>{row.title}</Text>
              <Text style={type.caption}>{row.needsSave && !saved ? `${row.line} Kept with the altar once it’s saved.` : row.line}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      {section === 'reading' && (
        <View style={styles.toggle}>
          <View style={styles.rowText}>
            <Text style={styles.title}>Snap to meaning</Text>
            <Text style={type.caption}>While you drag, things near the four directions or the centre settle onto them.</Text>
          </View>
          <Switch value={snap} onValueChange={onSnap} accessibilityLabel="Snap to meaning while arranging" trackColor={{ true: colors.gold, false: colors.hairline }} />
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    minHeight: touch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceRaised,
  },
  symbol: { width: 28, textAlign: 'center', color: colors.gold, fontSize: 22 },
  rowText: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
  intention: { fontFamily: fonts.displayItalic, fontSize: 18, lineHeight: 24, color: colors.parchment },
  toggle: { minHeight: touch, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 12 },
});
