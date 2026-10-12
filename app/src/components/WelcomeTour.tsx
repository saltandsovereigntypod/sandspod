// Three short pages the first time someone reaches the app: what Today, the
// altar and Rituals are for. Shown once, skippable, and remembered on the
// device. The Modal stays mounted and only `visible` changes (on iOS,
// removing a presented Modal can leave a layer that swallows taps).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { MoonDisc } from './MoonDisc';
import { colors, fonts, type } from '../theme';

const SEEN_KEY = 'welcome.tour.v1';

const PAGES: { icon: IconName | 'moon'; title: string; body: string }[] = [
  {
    icon: 'moon',
    title: 'Each day begins on Today',
    body: 'Tonight’s moon and its sign, the holidays from the calendars you follow, what the day is good for, and a question to sit with. On the new and full moon it also shows what you did last time.',
  },
  {
    icon: 'altar',
    title: 'Your altar, piece by piece',
    body: 'Place candles, herbs, crystals and tools from the cabinet. Tap anything to learn its correspondences, light and dress a candle, or carve a word into it. “Set tonight’s altar” on Today starts one for you.',
  },
  {
    icon: 'rituals',
    title: 'Rituals by the moon',
    body: 'Plan a working for the right night, run it step by step with gentle timers, then journal what happened. Over time, “Your moon” shows the patterns in your practice.',
  },
];

export function WelcomeTour() {
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(SEEN_KEY)
      .then((seen) => {
        if (live && !seen) setVisible(true);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  const close = () => {
    setVisible(false);
    AsyncStorage.setItem(SEEN_KEY, new Date().toISOString()).catch(() => undefined);
  };
  const current = PAGES[page];
  const last = page === PAGES.length - 1;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={close}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <Pressable accessibilityRole="button" accessibilityLabel="Skip the welcome" onPress={close} hitSlop={10} style={styles.skip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
        <View style={styles.body} accessibilityLiveRegion="polite">
          <View style={styles.art}>
            {current.icon === 'moon' ? (
              <MoonDisc size={120} illumination={0.62} waxing />
            ) : (
              <View style={styles.iconRing}>
                <Icon name={current.icon} size={44} color={colors.gold} />
              </View>
            )}
          </View>
          <Text style={[type.eyebrow, styles.center]}>{`${page + 1} of ${PAGES.length}`}</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {current.title}
          </Text>
          <Text style={styles.text}>{current.body}</Text>
        </View>
        <View style={styles.dots} accessible={false}>
          {PAGES.map((p, i) => (
            <View key={p.title} style={[styles.dot, i === page && styles.dotOn]} />
          ))}
        </View>
        <Button label={last ? 'Begin' : 'Next'} onPress={() => (last ? close() : setPage(page + 1))} style={styles.big} />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground, paddingHorizontal: 28, paddingBottom: 24 },
  top: { alignItems: 'flex-end', paddingTop: 8 },
  skip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  skipText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold },
  body: { flex: 1, justifyContent: 'center', gap: 12 },
  art: { alignItems: 'center', marginBottom: 20 },
  iconRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 37, color: colors.cream, textAlign: 'center' },
  text: { ...type.body, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 18 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.surfaceRaised },
  dotOn: { backgroundColor: colors.gold },
  big: { minHeight: 52 },
});
