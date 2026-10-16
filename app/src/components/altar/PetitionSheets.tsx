import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

import { Button } from '../Button';
import { useReducedMotion } from '../../lib/accessibility/store';
import type { CraftEntry } from '../../lib/craft/store';
import {
  FIRE_SAFETY,
  PETITION_ENDS,
  PETITION_TIMINGS,
  releaseDue,
  TITLE_MAX,
  WORDS_MAX,
  type Night,
  type Petition,
  type PetitionInput,
  type PetitionTiming,
} from '../../lib/altar/petitions';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

const useNative = Platform.OS !== 'web';
const day = (iso: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : '');

// ── Writing one ──────────────────────────────────────────────────────────

export function WritePetitionSheet({
  visible,
  candles,
  onClose,
  onWrite,
}: {
  visible: boolean;
  /** Candles on the altar it can be folded under. */
  candles: { id: string; label: string }[];
  onClose: () => void;
  onWrite: (input: PetitionInput, candleId: string | null) => void;
}) {
  const [title, setTitle] = useState('');
  const [words, setWords] = useState('');
  const [intention, setIntention] = useState('');
  const [timing, setTiming] = useState<PetitionTiming>('now');
  const [candle, setCandle] = useState<string | null>(null);
  useEffect(() => {
    if (!visible) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a blank page each time it opens
    setTitle('');
    setWords('');
    setIntention('');
    setTiming('now');
    setCandle(null);
  }, [visible]);

  return (
    <Sheet visible={visible} eyebrow="Petition paper" title="Write a petition" onClose={onClose}>
      <Text style={type.caption}>
        Write plainly, in the present tense, as if it’s already on its way. Fold it toward you to draw something in, away from you to send something off.
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="A name for it: Open roads"
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="Petition title"
        maxLength={TITLE_MAX}
        style={styles.input}
      />
      <TextInput
        value={words}
        onChangeText={setWords}
        placeholder="The words of your petition"
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="The words of your petition"
        maxLength={WORDS_MAX}
        multiline
        style={[styles.input, styles.multiline]}
      />
      <TextInput
        value={intention}
        onChangeText={setIntention}
        placeholder="Its intention, in a word or two (optional)"
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="Intention"
        maxLength={60}
        style={styles.input}
      />
      <Text style={type.eyebrow}>Moon timing</Text>
      <ChipRow>
        {PETITION_TIMINGS.map((t) => (
          <Chip key={t.id} label={t.label} accessibilityLabel={`${t.label}: ${t.detail}`} active={timing === t.id} onPress={() => setTiming(t.id)} />
        ))}
      </ChipRow>
      <Text style={type.caption}>{PETITION_TIMINGS.find((t) => t.id === timing)?.detail}</Text>
      <Text style={type.eyebrow}>Where it goes</Text>
      <ChipRow>
        <Chip label="In the petition box" active={candle == null} onPress={() => setCandle(null)} />
        {candles.map((c) => (
          <Chip key={c.id} label={`Under ${c.label}`} active={candle === c.id} onPress={() => setCandle(c.id)} />
        ))}
      </ChipRow>
      <Button
        label="Place the petition"
        onPress={() => onWrite({ title, words, intention, timing }, candle)}
        disabled={!title.trim() && !words.trim()}
      />
    </Sheet>
  );
}

// ── The petition box ─────────────────────────────────────────────────────

type Entry = CraftEntry<Petition>;
type Mode = { kind: 'list' } | { kind: 'burn'; entry: Entry } | { kind: 'night'; entry: Entry } | { kind: 'bury'; entry: Entry };

export function PetitionBoxSheet({
  visible,
  open,
  history,
  nights,
  onClose,
  onWrite,
  onBurn,
  onBury,
  onSchedule,
  onRelease,
}: {
  visible: boolean;
  open: Entry[];
  history: Entry[];
  nights: Night[];
  onClose: () => void;
  onWrite: () => void;
  onBurn: (entry: Entry) => void;
  onBury: (entry: Entry) => void;
  onSchedule: (entry: Entry, night: Night) => void;
  onRelease: (entry: Entry) => void;
}) {
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open on the list each time
    if (visible) setMode({ kind: 'list' });
  }, [visible]);
  const now = new Date();
  const back = () => setMode({ kind: 'list' });

  return (
    <Sheet
      visible={visible}
      eyebrow="This altar"
      title={mode.kind === 'burn' ? 'The burn bowl' : mode.kind === 'night' ? 'Choose a night' : mode.kind === 'bury' ? 'Bury it' : 'Petition box'}
      onClose={onClose}
    >
      {mode.kind === 'burn' ? (
        <BurnBowl
          petition={mode.entry.data}
          onBurned={() => {
            onBurn(mode.entry);
            back();
          }}
          onBack={back}
        />
      ) : mode.kind === 'night' ? (
        <>
          <Text style={type.body}>{`When will you release “${mode.entry.data.title}”? It stays in the box until then.`}</Text>
          {nights.map((n) => (
            <View key={n.id} style={styles.night}>
              <View style={{ flex: 1 }}>
                <Text style={type.cardTitle}>{n.label}</Text>
                <Text style={type.caption}>{`${n.why}. ${day(n.date.toISOString())}`}</Text>
              </View>
              <Button
                label="Choose"
                variant="outline"
                onPress={() => {
                  onSchedule(mode.entry, n);
                  back();
                }}
              />
            </View>
          ))}
          <Button label="Back to the box" variant="text" onPress={back} />
        </>
      ) : mode.kind === 'bury' ? (
        <>
          <Text style={type.body}>
            Burying gives a petition to the earth to work slowly: good for growth, healing and things that need time. Fold it small, use plain paper with no plastic or glitter, and bury it where it can rot down, in a garden, a pot of soil or at the foot of a tree you know.
          </Text>
          <Button
            label="I’ve buried it"
            onPress={() => {
              onBury(mode.entry);
              back();
            }}
          />
          <Button label="Not yet" variant="text" onPress={back} />
        </>
      ) : (
        <>
          <Button label="Write a petition" onPress={onWrite} />
          {open.length === 0 ? (
            <Text style={type.caption}>The box is empty. Petitions you write wait here, and on the altar, until you burn, bury or release them.</Text>
          ) : (
            open.map((entry) => {
              const p = entry.data;
              const due = releaseDue(p, now);
              const timing = PETITION_TIMINGS.find((t) => t.id === p.timing);
              return (
                <View key={entry.id} style={styles.card}>
                  <Text style={type.cardTitle}>{p.title}</Text>
                  {!!p.words && (
                    <Text style={styles.words} numberOfLines={4}>
                      {p.words}
                    </Text>
                  )}
                  <Text style={type.caption}>
                    {[
                      p.intention ? `For ${p.intention}` : '',
                      p.timing !== 'now' && timing ? `Timed for the ${timing.label}${p.timingAt ? `, ${day(p.timingAt)}` : ''}` : '',
                      p.place === 'candle' ? 'Folded under a candle' : '',
                      `Written ${day(p.writtenAt)}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                  {p.status === 'scheduled' && (
                    <Text style={[type.caption, due && styles.due]}>{due ? `Its night has come: ${p.releaseWhy.toLowerCase()}.` : `To be released ${day(p.releaseOn)}: ${p.releaseWhy.toLowerCase()}.`}</Text>
                  )}
                  <ChipRow>
                    <Chip label="Burn" symbol="✺" accessibilityLabel={`Burn ${p.title}`} onPress={() => setMode({ kind: 'burn', entry })} />
                    <Chip label="Bury" symbol="◒" accessibilityLabel={`Bury ${p.title}`} onPress={() => setMode({ kind: 'bury', entry })} />
                    {p.status === 'scheduled' ? (
                      <>
                        <Chip label={due ? 'Release it now' : 'Release now'} symbol="☾" active={due} onPress={() => onRelease(entry)} />
                        <Chip label="Another night" symbol="☽" onPress={() => setMode({ kind: 'night', entry })} />
                      </>
                    ) : (
                      <Chip label="Release on a night" symbol="☽" accessibilityLabel={`Choose a night to release ${p.title}`} onPress={() => setMode({ kind: 'night', entry })} />
                    )}
                  </ChipRow>
                </View>
              );
            })
          )}
          {history.length > 0 && (
            <View style={styles.history}>
              <Text style={type.eyebrow}>Done</Text>
              {history.map((entry) => (
                <Text key={entry.id} style={type.caption}>
                  {`${PETITION_ENDS[entry.data.status as keyof typeof PETITION_ENDS] ?? 'Done'} ${day(entry.data.doneAt)}: ${entry.data.title}`}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </Sheet>
  );
}

// ── The burn bowl ────────────────────────────────────────────────────────

const BURN_MS = 4200;

/** Burn the petition in a heatproof bowl here, with the fire-safety words for doing it for real. */
function BurnBowl({ petition, onBurned, onBack }: { petition: Petition; onBurned: () => void; onBack: () => void }) {
  const still = useReducedMotion();
  const [stage, setStage] = useState<'ready' | 'burning' | 'ash'>('ready');
  const [burn] = useState(() => new Animated.Value(0));
  const [flicker] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (stage !== 'burning') return;
    if (still) {
      burn.setValue(1);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no animation to wait for
      setStage('ash');
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, { toValue: 1, duration: 260, useNativeDriver: useNative }),
        Animated.timing(flicker, { toValue: 0, duration: 320, useNativeDriver: useNative }),
      ]),
    );
    loop.start();
    const run = Animated.timing(burn, { toValue: 1, duration: BURN_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: useNative });
    run.start(({ finished }) => {
      loop.stop();
      if (finished) setStage('ash');
    });
    return () => {
      run.stop();
      loop.stop();
    };
  }, [stage, still, burn, flicker]);

  const paperOpacity = burn.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 0.35, 0] });
  const paperScale = burn.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] });
  const fireOpacity = stage === 'burning' ? burn.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 0.9, 0] }) : 0;
  const fireScale = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] });
  const ashOpacity = burn.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0.2, 1] });

  return (
    <>
      <View style={styles.bowl} accessible accessibilityLabel={stage === 'ash' ? 'The petition has burned to ash in the bowl.' : stage === 'burning' ? 'The petition is burning in the bowl.' : `The petition “${petition.title}” in a heatproof bowl.`}>
        <Svg width={220} height={150} viewBox="0 0 220 150" style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="bowl-in" cx="50%" cy="40%" r="60%">
              <Stop offset="0" stopColor="rgb(70,66,60)" />
              <Stop offset="1" stopColor="rgb(30,28,26)" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={110} cy={92} rx={92} ry={26} fill="url(#bowl-in)" />
          <Path d="M18 92 Q24 140 110 142 Q196 140 202 92 Q196 118 110 118 Q24 118 18 92 Z" fill="rgb(54,50,46)" stroke="rgba(226,195,109,0.3)" />
        </Svg>
        <Animated.View style={[styles.ashPile, { opacity: ashOpacity }]} />
        <Animated.View style={[styles.paper, { opacity: paperOpacity, transform: [{ scale: paperScale }, { rotate: '-8deg' }] }]}>
          <Svg width="100%" height="100%" viewBox="0 0 40 30">
            <Path d="M2 4 L37 2 L38 27 L3 28 Z" fill="rgb(236,224,192)" />
            <Path d="M7 9 L30 8 M7 13 L27 12 M7 17 L31 16" stroke="rgba(110,60,40,0.5)" strokeWidth={0.8} strokeLinecap="round" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.fire, { opacity: fireOpacity, transform: [{ scaleY: fireScale }] }]}>
          <Svg width="100%" height="100%" viewBox="0 0 30 40">
            <Defs>
              <RadialGradient id="fire" cx="50%" cy="75%" r="70%">
                <Stop offset="0" stopColor="rgb(255,250,220)" />
                <Stop offset="0.35" stopColor="rgb(255,190,70)" />
                <Stop offset="0.75" stopColor="rgb(240,100,30)" stopOpacity={0.7} />
                <Stop offset="1" stopColor="rgb(240,100,30)" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Path d="M15 1 C22 12 28 18 26 28 C24 36 6 36 4 28 C2 20 10 14 15 1 Z" fill="url(#fire)" />
          </Svg>
        </Animated.View>
      </View>

      {stage === 'ready' && (
        <>
          <Text style={type.body}>Hold the words in mind once more, then let the fire carry them.</Text>
          <Button label="Burn it here" onPress={() => setStage('burning')} />
          <View style={styles.safety}>
            <Text style={type.eyebrow}>To do it for real</Text>
            <Text style={type.caption}>{FIRE_SAFETY}</Text>
          </View>
          <Button label="Back to the box" variant="text" onPress={onBack} />
        </>
      )}
      {stage === 'burning' && <Text style={type.caption} accessibilityLiveRegion="polite">Burning…</Text>}
      {stage === 'ash' && (
        <>
          <Text style={type.body} accessibilityLiveRegion="polite">
            It’s ash now. Scatter the cooled ash to the wind, bury it, or wash it away with water, and let it go.
          </Text>
          <Button label="It’s done" onPress={onBurned} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ground,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  card: { gap: 8, padding: 14, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.ground },
  words: { fontFamily: fonts.displayItalic, fontSize: 17, lineHeight: 22, color: colors.parchment },
  due: { color: colors.gold },
  history: { gap: 6 },
  night: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bowl: { width: 220, height: 150, alignSelf: 'center' },
  paper: { position: 'absolute', left: 70, top: 50, width: 80, height: 60 },
  fire: { position: 'absolute', left: 80, top: 8, width: 60, height: 90, transformOrigin: '50% 100%' },
  ashPile: { position: 'absolute', left: 82, top: 84, width: 56, height: 14, borderRadius: 999, backgroundColor: 'rgb(120,116,110)' },
  safety: { gap: 6, padding: 14, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.goldLine },
});
