import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Chip, Chips, Field, RitualScreen, Title, ui } from '../../../../../components/rituals/ui';
import { useAccessibility } from '../../../../../lib/accessibility/store';
import { guruBead, MALA_SIZES, malaLine, malaMinutes, startMala, tapBead, undoBead, type MalaEvent } from '../../../../../lib/meditation/mala';
import { colors, fonts } from '../../../../../theme';

// The mala counter (lib/meditation/mala.ts): tap anywhere in the space for
// each bead, a buzz with each, a stronger one at the end of a round, and a
// long press for the guru bead. What you counted and the mantra go to the
// log. Website: /practice/meditation/mala/.
export default function MalaCounter() {
  const prefs = useAccessibility();
  const [mantra, setMantra] = useState('');
  const [mala, setMala] = useState(() => startMala(108));

  const feel = (event: MalaEvent) => {
    if (!prefs.haptics || Platform.OS === 'web' || event === 'none') return;
    const p =
      event === 'round'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : event === 'guru'
          ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
          : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void p.catch(() => {});
  };
  const tap = () => {
    const r = tapBead(mala, Date.now());
    setMala(r.mala);
    feel(r.event);
  };
  const guru = () => {
    const r = guruBead(mala);
    setMala(r.mala);
    feel(r.event);
  };
  const keep = () =>
    router.push({
      pathname: '/rituals/craft/meditation/log',
      params: { at: new Date(mala.startedAt ?? Date.now()).toISOString(), minutes: String(malaMinutes(mala, Date.now())), timed: '1', kind: 'mantra', mantra: mantra.trim(), count: String(mala.total) },
    });

  return (
    <RitualScreen back="Meditation">
      <Title eyebrow="Meditation">Mala and mantra</Title>
      <Field label="Your mantra or chant (optional)" value={mantra} onChange={setMantra} />
      {mala.total === 0 && (
        <Chips>
          {MALA_SIZES.map((n) => (
            <Chip key={n} label={`${n} beads`} selected={mala.size === n} onPress={() => setMala(startMala(n))} />
          ))}
        </Chips>
      )}
      <Pressable
        style={styles.space}
        onPress={tap}
        onLongPress={guru}
        delayLongPress={600}
        accessibilityRole="button"
        accessibilityLabel={`Count a bead. ${malaLine(mala)}`}
        accessibilityHint="Press and hold for the guru bead, which closes the round"
      >
        <Text style={styles.count}>{mala.bead}</Text>
        <Text style={styles.of}>{malaLine(mala)}</Text>
        {!!mantra.trim() && <Text style={styles.mantra}>{mantra.trim()}</Text>}
        <Text style={styles.hint}>Tap anywhere here for each bead · hold for the guru bead</Text>
      </Pressable>
      <View style={ui.gapSmall}>
        {mala.total > 0 && <Button label="Keep it in your log" onPress={keep} />}
        {mala.total > 0 && <Button label="One back" variant="text" onPress={() => setMala(undoBead(mala))} />}
        {mala.total > 0 && <Button label="Begin again" variant="text" onPress={() => setMala(startMala(mala.size))} />}
      </View>
      <Body muted>By custom the guru bead, the larger one where the mala’s ends meet, isn’t counted: you turn back there rather than crossing it. Customs differ between traditions; keep your own teacher’s way if you have one.</Body>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  space: { minHeight: 300, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(226,195,109,0.35)', backgroundColor: 'rgba(226,195,109,0.06)', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  count: { fontFamily: fonts.display, fontSize: 88, color: colors.cream, fontVariant: ['tabular-nums'] },
  of: { fontFamily: fonts.body, fontSize: 16, color: colors.muted },
  mantra: { fontFamily: fonts.display, fontSize: 22, color: colors.gold, textAlign: 'center' },
  hint: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: 'center' },
});
