// A short page for each main part of the app the first time someone reaches
// it: Today, the altar, rituals, divination, the Grimoire, practice,
// calendars, covens and sync (the pages are in lib/welcomeTour). Swipe or tap
// through, skippable, remembered on the device, and shown again from More →
// How to use the app. The Modal stays mounted and only `visible` changes (on
// iOS, removing a presented Modal can leave a layer that swallows taps).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { Modal, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from './Button';
import { Icon } from './Icon';
import { MoonDisc } from './MoonDisc';
import { MoreIcon } from './more/MoreIcon';
import { onReplayTour, TOUR_PAGES, TOUR_SEEN_KEY, type TourIcon } from '../lib/welcomeTour';
import { colors, fonts, type } from '../theme';

export function WelcomeTour() {
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(TOUR_SEEN_KEY)
      .then((seen) => {
        if (live && !seen) setVisible(true);
      })
      .catch(() => undefined);
    const stop = onReplayTour(() => {
      setPage(0);
      setVisible(true);
    });
    return () => {
      live = false;
      stop();
    };
  }, []);

  const close = () => {
    setVisible(false);
    AsyncStorage.setItem(TOUR_SEEN_KEY, new Date().toISOString()).catch(() => undefined);
  };
  const current = TOUR_PAGES[page];
  const last = page === TOUR_PAGES.length - 1;

  // A swipe left moves on, a swipe right goes back. The responder is made once,
  // so it steps the page through the state setter rather than a stale `page`.
  const step = (by: number) => setPage((p) => turnPage(p, by));
  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 16 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_, g) => {
          if (g.dx < -40) setPage((p) => turnPage(p, 1));
          else if (g.dx > 40) setPage((p) => turnPage(p, -1));
        },
      }),
    [],
  );

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={close}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          {page > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Back a page" onPress={() => step(-1)} hitSlop={10} style={styles.skip}>
              <Text style={styles.skipText}>Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable accessibilityRole="button" accessibilityLabel="Skip the welcome" onPress={close} hitSlop={10} style={styles.skip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
        <View style={styles.body} accessibilityLiveRegion="polite" {...swipe.panHandlers}>
          <View style={styles.art}>
            <TourArt icon={current.icon} />
          </View>
          <Text style={[type.eyebrow, styles.center]}>{`${page + 1} of ${TOUR_PAGES.length}`}</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {current.title}
          </Text>
          <Text style={styles.text}>{current.body}</Text>
        </View>
        <View style={styles.dots} accessible={false}>
          {TOUR_PAGES.map((p, i) => (
            <View key={p.title} style={[styles.dot, i === page && styles.dotOn]} />
          ))}
        </View>
        <Button label={last ? 'Begin' : 'Next'} onPress={() => (last ? close() : step(1))} style={styles.big} />
      </SafeAreaView>
    </Modal>
  );
}

const turnPage = (page: number, by: number) => Math.min(TOUR_PAGES.length - 1, Math.max(0, page + by));

function TourArt({ icon }: { icon: TourIcon }) {
  if (icon === 'moon') return <MoonDisc size={120} illumination={0.62} waxing />;
  return (
    <View style={styles.iconRing}>
      {'tab' in icon ? <Icon name={icon.tab} size={44} color={colors.gold} /> : <MoreIcon name={icon.more} size={44} color={colors.gold} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground, paddingHorizontal: 28, paddingBottom: 24 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
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
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 18 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.surfaceRaised },
  dotOn: { backgroundColor: colors.gold },
  big: { minHeight: 52 },
});
