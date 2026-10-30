import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { ProgressBar, useCourseProgress } from '../../../../../components/astro/course';
import { Body, Card, Expander, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { CHAPTERS, lessonAppHref, quizAppHref } from '../../../../../lib/astro/course';
import { chapterState, courseSummary, nextStep } from '../../../../../lib/astro/course/progress';
import { colors, fonts, radius, type } from '../../../../../theme';

// Learn astrology, the course: twelve chapters from the beginning, each with
// lessons and a quiz. Progress is kept with the practice tools (synced when
// signed in), the same as on the website.
export default function AstroCourse() {
  const { progress } = useCourseProgress();
  const sum = courseSummary(progress);
  const next = nextStep(progress);

  return (
    <RitualScreen back="Cosmic & celestial">
      <Title eyebrow="Cosmic & celestial">Learn astrology</Title>
      <Body muted>A course from the very beginning to reading charts with confidence: twelve chapters, each a few short lessons and a quiz. Lessons show their subject in your own chart where they can.</Body>

      <Card accent>
        <SectionLabel>Your progress</SectionLabel>
        <Text style={type.cardTitle}>{`${sum.lessonsRead} of ${sum.lessons} lessons read · ${sum.quizzesPassed} of ${sum.quizzes} quizzes passed`}</Text>
        <ProgressBar percent={sum.percent} label={`${sum.percent}% of the course`} />
        {next ? (
          <Button
            label={next.kind === 'lesson' ? (sum.lessonsRead ? `Continue: ${next.lesson.title}` : `Begin: ${next.lesson.title}`) : `Take the quiz: ${next.chapter.title}`}
            onPress={() => router.push((next.kind === 'lesson' ? lessonAppHref(next.lesson.id) : quizAppHref(next.chapter.id)) as Href)}
          />
        ) : (
          <Body>Every lesson read and every quiz passed. Well done; keep the course for reference, and keep reading your chart.</Body>
        )}
      </Card>

      <View style={ui.gapSmall}>
        {CHAPTERS.map((c, i) => {
          const st = chapterState(progress, c);
          return (
            <Expander key={c.id} title={`${i + 1}. ${c.title}${st.done ? ' ✓' : ''}`} initiallyOpen={next?.chapter.id === c.id}>
              <Body muted>{c.summary}</Body>
              {c.lessons.map((l) => (
                <Pressable key={l.id} accessibilityRole="button" accessibilityLabel={`${l.title}${progress?.read[l.id] ? ', read' : ''}`} onPress={() => router.push(lessonAppHref(l.id) as Href)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                  <Text style={styles.mark}>{progress?.read[l.id] ? '✓' : '○'}</Text>
                  <View style={styles.flex}>
                    <Text style={styles.name}>{l.title}</Text>
                    <Text style={type.caption} numberOfLines={2}>{`${l.summary} · ${l.minutes} min`}</Text>
                  </View>
                </Pressable>
              ))}
              <Pressable accessibilityRole="button" onPress={() => router.push(quizAppHref(c.id) as Href)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                <Text style={styles.mark}>{st.quiz?.passed ? '✓' : '?'}</Text>
                <View style={styles.flex}>
                  <Text style={styles.name}>{`Quiz: ${c.quiz.title}`}</Text>
                  <Text style={type.caption}>{st.quiz ? `Best ${st.quiz.best}% · ${st.quiz.passed ? 'passed' : `${c.quiz.passPercent}% to pass`}` : `${c.quiz.questions.length} questions · ${c.quiz.passPercent}% to pass`}</Text>
                </View>
              </Pressable>
            </Expander>
          );
        })}
      </View>

      <Pressable accessibilityRole="link" onPress={() => router.push('/rituals/craft/cosmic/learn' as Href)} style={styles.link}>
        <Text style={styles.linkText}>The glossary: every term explained ›</Text>
      </Pressable>
      <Body muted>These are traditional meanings and tools for reflection, not destiny.</Body>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surfaceRaised, borderRadius: radius.tile },
  pressed: { opacity: 0.7 },
  mark: { width: 24, fontSize: 18, color: colors.gold, textAlign: 'center' },
  name: { fontFamily: fonts.display, fontSize: 19, color: colors.cream },
  flex: { flex: 1 },
  link: { minHeight: 44, justifyContent: 'center' },
  linkText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold },
});
