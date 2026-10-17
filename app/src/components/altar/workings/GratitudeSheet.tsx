// The gratitude bowl: a bead or stone for each thing you're thankful for. The
// bowl fills over the lunar month and empties at the new moon; earlier moons
// are kept below. Saved in the craft store, `altar.gratitude`.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

import { Button } from '../../Button';
import { addEntry, removeEntry, useCraft } from '../../../lib/craft/store';
import {
  BEADS,
  beadPositions,
  beadsThisMoon,
  bowlLine,
  GRATITUDE_COLLECTION,
  GRATITUDE_MAX,
  gratitudeEntry,
  gratitudeHistory,
  lunarMonth,
  type GratitudeEntry,
} from '../../../lib/altar/workings/gratitude';
import { colors, type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { Field, Label, sheetStyles, type AltarContext } from './common';

type Props = { visible: boolean; altar: AltarContext; onClose: () => void };

/** The bowl, beads settling from the bottom up. */
export function GratitudeBowl({ colors: beads, size = 220 }: { colors: string[]; size?: number }) {
  const spots = beadPositions(beads.length);
  // On a 100 × 90 box the bowl's rim is at y 34 and its bottom near y 69; beads fill x 10–90.
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={beads.length ? `A bowl holding ${beads.length} bead${beads.length === 1 ? '' : 's'}` : 'An empty bowl'} style={styles.bowl}>
      <Svg width={size} height={size * 0.9} viewBox="0 0 100 90">
        <Defs>
          <RadialGradient id="grat-in" cx="50%" cy="30%" r="70%">
            <Stop offset="0" stopColor="#2a2620" />
            <Stop offset="1" stopColor="#14120f" />
          </RadialGradient>
        </Defs>
        <Path d="M8 34 q42 70 84 0 z" fill="#5c4632" stroke={colors.goldLine} strokeWidth={1.2} />
        <Ellipse cx={50} cy={34} rx={42} ry={9} fill="url(#grat-in)" stroke={colors.goldLine} strokeWidth={1} />
        {spots.map((s, i) => (
          <Circle key={i} cx={10 + s.x * 80} cy={34 + ((s.y - 0.35) / 0.55) * 32} r={s.r * 80} fill={beads[i]} stroke="#000" strokeOpacity={0.25} strokeWidth={0.5} />
        ))}
        <Ellipse cx={50} cy={34} rx={42} ry={9} fill="none" stroke={colors.goldLine} strokeWidth={1} />
      </Svg>
    </View>
  );
}

export function GratitudeSheet({ visible, altar, onClose }: Props) {
  const { entries } = useCraft<GratitudeEntry>(GRATITUDE_COLLECTION);
  const [text, setText] = useState('');
  const [bead, setBead] = useState(BEADS[0].label);
  const [showHistory, setShowHistory] = useState(false);
  const now = new Date();
  const month = lunarMonth(now);
  const current = beadsThisMoon(entries, altar.id, now);
  const history = gratitudeHistory(entries, altar.id, now);

  const add = () => {
    if (!text.trim()) return;
    void addEntry(GRATITUDE_COLLECTION, gratitudeEntry({ altarId: altar.id, text, bead }, new Date()));
    setText('');
  };

  return (
    <Sheet visible={visible} eyebrow="Gratitude bowl" title="Something to be thankful for" onClose={onClose}>
      <GratitudeBowl colors={current.map((e) => e.data.color)} />
      <Text style={[type.caption, styles.center]}>{bowlLine(current.length, month)}</Text>
      <Field label="What you’re grateful for" value={text} onChangeText={setText} placeholder="The rain this morning, a kind word…" maxLength={GRATITUDE_MAX} onSubmitEditing={add} returnKeyType="done" />
      <Label>A bead or stone for it</Label>
      <ChipRow>
        {BEADS.map((b) => (
          <Chip key={b.label} label={b.label} active={bead === b.label} onPress={() => setBead(b.label)} />
        ))}
      </ChipRow>
      <Button label="Drop it in the bowl" onPress={add} disabled={!text.trim()} />

      {current.length > 0 && (
        <View style={sheetStyles.section}>
          <Label>This moon</Label>
          {[...current].reverse().map((e) => (
            <View key={e.id} style={styles.line}>
              <View style={[styles.dot, { backgroundColor: e.data.color }]} />
              <View style={styles.lineText}>
                <Text style={type.body}>{e.data.text}</Text>
                <Text style={type.caption}>{new Date(e.data.at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
              </View>
              <Chip label="×" accessibilityLabel={`Take out ${e.data.text}`} onPress={() => void removeEntry(GRATITUDE_COLLECTION, e.id)} />
            </View>
          ))}
        </View>
      )}

      {history.length > 0 && (
        <View style={sheetStyles.section}>
          <Chip label={showHistory ? 'Hide earlier moons' : `Earlier moons (${history.length})`} onPress={() => setShowHistory((s) => !s)} />
          {showHistory &&
            history.map((h) => (
              <View key={h.moon} style={sheetStyles.card}>
                <Text style={sheetStyles.value}>
                  Moon of {new Date(`${h.moon}T12:00:00Z`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} · {h.entries.length} bead{h.entries.length === 1 ? '' : 's'}
                </Text>
                {h.entries.map((e) => (
                  <Text key={e.id} style={type.caption}>
                    {e.data.text}
                  </Text>
                ))}
              </View>
            ))}
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  bowl: { alignItems: 'center' },
  center: { textAlign: 'center' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lineText: { flex: 1 },
  dot: { width: 14, height: 14, borderRadius: 7 },
});
