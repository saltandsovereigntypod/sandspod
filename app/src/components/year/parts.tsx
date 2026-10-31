// Small pieces shared by A Year and a Day's screens (src/app/(tabs)/rituals/year):
// where each view lives, and a practice's links as buttons that open the
// Sanctuary's own tools.

import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { courseLinkAppHref, type CourseLink } from '../../lib/covens/courseLinks';
import { linkLabel } from '../../lib/yearday/plan';
import { colors, type } from '../../theme';
import { Chip, Chips } from '../rituals/ui';

export const yearHref = (): Href => '/rituals/year' as Href;
export const moonHref = (n: number): Href => ({ pathname: '/rituals/year/moon/[n]', params: { n: String(n) } }) as Href;
export const lessonHref = (docId: string, moon?: number): Href =>
  ({ pathname: '/rituals/year/lesson/[docId]', params: { docId, ...(moon ? { moon: String(moon) } : {}) } }) as Href;
export const dayHref = (): Href => '/rituals/year/day' as Href;

/** Local day words: "Monday 9 November". */
export const dayWords = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
export const fullWords = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
export const shortWords = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/** A practice's links, each a button. */
export function LinkChips({ links }: { links: CourseLink[] }) {
  const open = links.map((l) => ({ link: l, href: courseLinkAppHref(l) })).filter((x) => !!x.href);
  if (!open.length) return null;
  return (
    <Chips>
      {open.map(({ link, href }) => (
        <Chip key={`${link.kind}:${link.id}`} label={`${linkLabel(link)} ›`} onPress={() => router.push(href as Href)} />
      ))}
    </Chips>
  );
}

/** A thin bar for how far through something is. */
export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }} style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }]} />
    </View>
  );
}

export function Kicker({ children }: { children: string }) {
  return <Text style={[type.eyebrow, styles.gold]}>{children}</Text>;
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(202,191,157,0.18)', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  gold: { color: colors.gold },
});
