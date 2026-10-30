// Pieces of the Learn Astrology course screens: progress kept in the synced
// craft store, a lesson's links as buttons, and "In your chart".

import { router, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { astroLinkAppHref, astroLinkLabel, type AstroLink, type YourChartKind } from '../../lib/astro/course';
import { COURSE_COLLECTION, newCourseProgress, normalizeCourseProgress, pickProgress, type CourseProgress } from '../../lib/astro/course/progress';
import { yourChartLines } from '../../lib/astro/course/yourChart';
import { term } from '../../lib/astro/glossary';
import type { Chart } from '../../lib/astro/natal';
import { addEntry, updateEntry, useCraft } from '../../lib/craft/store';
import { colors, fonts, radius, type } from '../../theme';
import { Card, SectionLabel } from '../rituals/ui';
import { openTerm, TermText } from './Explain';

/** The course progress (null before anything is saved) and a way to change it. */
export function useCourseProgress(): { progress: CourseProgress | null; ready: boolean; change: (fn: (p: CourseProgress) => CourseProgress) => Promise<void> } {
  const { entries, ready } = useCraft<CourseProgress>(COURSE_COLLECTION);
  const entry = useMemo(() => pickProgress(entries), [entries]);
  const progress = useMemo(() => (entry ? normalizeCourseProgress(entry.data) : null), [entry]);
  const change = useCallback(
    async (fn: (p: CourseProgress) => CourseProgress) => {
      if (entry) await updateEntry<CourseProgress>(COURSE_COLLECTION, entry.id, fn(normalizeCourseProgress(entry.data)));
      else await addEntry<CourseProgress>(COURSE_COLLECTION, fn(newCourseProgress(new Date())));
    },
    [entry],
  );
  return { progress, ready, change };
}

/** A lesson's links: glossary terms open in place, the rest go to their pages. */
export function LessonLinks({ links, label = 'Go further' }: { links: AstroLink[]; label?: string }) {
  if (!links.length) return null;
  return (
    <View style={styles.links}>
      <SectionLabel>{label}</SectionLabel>
      <View style={styles.wrap}>
        {links.map((link) => {
          const href = astroLinkAppHref(link);
          const text = astroLinkLabel(link, (id) => term(id)?.term);
          if (link.kind !== 'term' && !href) return null;
          return (
            <Pressable
              key={`${link.kind}:${link.id}`}
              accessibilityRole={link.kind === 'term' ? 'button' : 'link'}
              accessibilityLabel={text}
              onPress={() => (link.kind === 'term' ? openTerm(link.id) : router.push(href as Href))}
              style={({ pressed }) => [styles.link, pressed && styles.pressed]}
            >
              <Text style={styles.linkText}>{`${text} ›`}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** What the lesson's subject looks like in the person's own chart. */
export function YourChartCard({ kind, chart, hasChart }: { kind: YourChartKind; chart: Chart | null; hasChart: boolean }) {
  const lines = useMemo(() => (chart ? yourChartLines(kind, chart) : null), [kind, chart]);
  if (!hasChart) {
    return (
      <Card>
        <SectionLabel>In your chart</SectionLabel>
        <TermText style={type.body} text="Add your birth chart to see this lesson in your own chart." />
        <Pressable accessibilityRole="link" onPress={() => router.push('/rituals/craft/cosmic/charts' as Href)} style={styles.inline}>
          <Text style={styles.linkText}>Add your chart ›</Text>
        </Pressable>
      </Card>
    );
  }
  if (!lines?.length) return null;
  return (
    <Card accent>
      <SectionLabel>In your chart</SectionLabel>
      {lines.map((line) => (
        <TermText key={line} style={type.body} text={line} />
      ))}
    </Card>
  );
}

/** A thin progress bar, 0–100. */
export function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: percent }} style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, percent))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  links: { gap: 6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: radius.tile, backgroundColor: colors.surfaceRaised },
  inline: { minHeight: 44, justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  linkText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: colors.gold },
});
