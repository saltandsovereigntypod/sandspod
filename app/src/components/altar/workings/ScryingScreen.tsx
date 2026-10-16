// Water-bowl scrying: a full-screen, quiet dark bowl with slow reflections
// drifting on the water (a still image when motion is reduced), a timer, and
// then a few words on what came, saved to the ritual journal.

import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, type ModalProps, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { Button } from '../../Button';
import { useReducedMotion } from '../../../lib/accessibility/store';
import { addEntry } from '../../../lib/craft/store';
import { moonState } from '../../../lib/moon';
import { saveJournal } from '../../../lib/rituals/store';
import {
  clock,
  hasNotes,
  reflectionPaths,
  SCRYING_COLLECTION,
  SCRYING_MINUTES,
  SCRYING_PROMPTS,
  scryingEntry,
  scryingJournalAnswers,
  secondsLeft,
  type ScryingNotes,
} from '../../../lib/altar/workings/scrying';
import { colors, fonts, touch, type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Field, type AltarContext } from './common';

const ORIENTATIONS: ModalProps['supportedOrientations'] = ['portrait', 'landscape-left', 'landscape-right'];

type Props = {
  visible: boolean;
  altar: AltarContext;
  onClose: () => void;
  /** Called once the notes are saved; `where` says which store took them. */
  onSaved?: (where: 'journal' | 'craft') => void;
};

type Phase = 'choose' | 'sit' | 'write' | 'done';

export function ScryingScreen({ visible, altar, onClose, onSaved }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} supportedOrientations={ORIENTATIONS} statusBarTranslucent>
      <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) }]}>
        {visible && <Scrying altar={altar} onClose={onClose} onSaved={onSaved} />}
      </View>
    </Modal>
  );
}

function Bowl({ size, still }: { size: number; still: boolean }) {
  const [paths] = useState(() => reflectionPaths(4));
  const [drifts] = useState(() => paths.map(() => new Animated.Value(0)));
  useEffect(() => {
    if (still) return;
    const loops = drifts.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: paths[i].period, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: paths[i].period, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [still, drifts, paths]);

  const water = size * 0.78;
  return (
    <View style={{ width: size, height: size * 0.62 }} accessible accessibilityRole="image" accessibilityLabel="A dark bowl of still water, faint light moving on its surface">
      <Svg width={size} height={size * 0.62} viewBox="0 0 100 62" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="scry-water" cx="50%" cy="45%" r="55%">
            <Stop offset="0" stopColor="#0d1a22" />
            <Stop offset="1" stopColor="#030607" />
          </RadialGradient>
          <RadialGradient id="scry-bowl" cx="50%" cy="20%" r="80%">
            <Stop offset="0" stopColor="#3a3a36" />
            <Stop offset="1" stopColor="#141412" />
          </RadialGradient>
        </Defs>
        <Ellipse cx={50} cy={34} rx={48} ry={26} fill="url(#scry-bowl)" />
        <Ellipse cx={50} cy={26} rx={46} ry={18} fill="#2a2a27" />
        <Ellipse cx={50} cy={27} rx={41} ry={15} fill="url(#scry-water)" />
      </Svg>
      {/* The reflections ride on the water's surface. */}
      <View style={[styles.surface, { left: (size - water) / 2, width: water, top: size * 0.62 * 0.2, height: size * 0.62 * 0.48 }]} pointerEvents="none">
        {paths.map((p, i) => {
          const w = p.rx * 2 * water;
          const h = p.ry * 2 * water;
          const translateX = drifts[i].interpolate({ inputRange: [0, 1], outputRange: [0, p.driftX * water] });
          const translateY = drifts[i].interpolate({ inputRange: [0, 1], outputRange: [0, p.driftY * water] });
          const opacity = drifts[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [p.opacity, p.opacity * 1.8, p.opacity] });
          return (
            <Animated.View
              key={i}
              style={{ position: 'absolute', left: p.cx * water - w / 2, top: (p.cy - 0.3) * water * 0.6, width: w, height: h, opacity, transform: [{ translateX }, { translateY }] }}
            >
              <Svg width={w} height={h} viewBox="0 0 10 10" preserveAspectRatio="none">
                <Ellipse cx={5} cy={5} rx={5} ry={5} fill="#cfe3ea" />
              </Svg>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

function Scrying({ altar, onClose, onSaved }: Omit<Props, 'visible'>) {
  const still = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const [phase, setPhase] = useState<Phase>('choose');
  const [minutes, setMinutes] = useState<number>(SCRYING_MINUTES[0]);
  const [startedAt, setStartedAt] = useState(0);
  const [tick, setTick] = useState(0);
  const [notes, setNotes] = useState<ScryingNotes>({ saw: '', symbols: '', feelings: '' });
  const [sat, setSat] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedTo, setSavedTo] = useState<'journal' | 'craft' | null>(null);
  const left = phase === 'sit' ? secondsLeft(minutes, startedAt, tick || startedAt) : minutes * 60;

  useEffect(() => {
    if (phase !== 'sit') return;
    const id = setInterval(() => {
      const t = Date.now();
      setTick(t);
      if (secondsLeft(minutes, startedAt, t) <= 0) {
        setSat(minutes);
        setPhase('write');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, minutes, startedAt]);

  const begin = () => {
    const t = Date.now();
    setStartedAt(t);
    setTick(t);
    setPhase('sit');
  };
  const stopEarly = () => {
    setSat((Date.now() - startedAt) / 60_000);
    setPhase('write');
  };
  const save = async () => {
    setSaving(true);
    const at = new Date();
    const moonPhase = moonState(at).name;
    let where: 'journal' | 'craft' = 'journal';
    try {
      await saveJournal({ session: null, answers: scryingJournalAnswers(notes, { minutes: Math.max(1, Math.round(sat)), moonPhase, altarName: altar.name, date: at }) });
    } catch {
      where = 'craft';
      await addEntry(SCRYING_COLLECTION, scryingEntry(notes, { altarId: altar.id, minutes, satMinutes: sat, moonPhase, at: at.toISOString() }));
    }
    setSaving(false);
    setSavedTo(where);
    setPhase('done');
    onSaved?.(where);
  };

  const bowlSize = Math.min(width - 32, height * 0.9, 520);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.top}>
        <Text style={type.eyebrow}>Water-bowl scrying</Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close scrying" style={styles.close}>
          <Text style={styles.closeText}>{phase === 'sit' ? 'Leave' : 'Done'}</Text>
        </Pressable>
      </View>

      {(phase === 'choose' || phase === 'sit') && <Bowl size={bowlSize} still={still || phase === 'choose'} />}

      {phase === 'choose' && (
        <View style={styles.block}>
          <Text style={styles.lede}>Dim the lights. Let your eyes soften on the water, and let whatever comes, come.</Text>
          <ChipRow>
            {SCRYING_MINUTES.map((m) => (
              <Chip key={m} label={`${m} minutes`} active={minutes === m} onPress={() => setMinutes(m)} />
            ))}
          </ChipRow>
          <Button label="Begin" onPress={begin} />
        </View>
      )}

      {phase === 'sit' && (
        <View style={styles.block}>
          <Text style={styles.clock} accessibilityLiveRegion="polite" accessibilityLabel={`${Math.ceil(left / 60)} minutes left`}>
            {clock(left)}
          </Text>
          <Button label="I’m finished" variant="text" onPress={stopEarly} />
        </View>
      )}

      {phase === 'write' && (
        <View style={styles.block}>
          <Text style={styles.lede}>Before it fades: a few words.</Text>
          {SCRYING_PROMPTS.map((p) => (
            <View key={p.key} style={styles.prompt}>
              <Text style={type.eyebrow}>{p.label}</Text>
              <Field label={p.label} value={notes[p.key]} onChangeText={(v) => setNotes((n) => ({ ...n, [p.key]: v }))} placeholder={p.placeholder} multiline maxLength={2000} />
            </View>
          ))}
          <Button label={saving ? 'Saving…' : 'Save to my journal'} onPress={() => void save()} disabled={saving || !hasNotes(notes)} />
          <Button label="Close without saving" variant="text" onPress={onClose} />
        </View>
      )}

      {phase === 'done' && (
        <View style={styles.block}>
          <Text style={styles.lede}>{savedTo === 'journal' ? 'Saved to your ritual journal.' : 'Saved with this altar.'} Drink some water, and come back to the room.</Text>
          <Button label="Close" onPress={onClose} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#030504' },
  content: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 16, gap: 20 },
  top: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { minHeight: touch, minWidth: touch, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  closeText: { color: colors.gold, fontFamily: fonts.bodySemi, fontSize: 15 },
  surface: { position: 'absolute', overflow: 'hidden', borderRadius: 999 },
  block: { alignSelf: 'stretch', maxWidth: 560, width: '100%', alignItems: 'stretch', gap: 14 },
  lede: { fontFamily: fonts.displayItalic, fontSize: 21, lineHeight: 28, color: colors.parchment, textAlign: 'center' },
  clock: { fontFamily: fonts.display, fontSize: 44, color: colors.muted, textAlign: 'center', opacity: 0.8 },
  prompt: { gap: 6 },
});
