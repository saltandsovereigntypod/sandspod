import { router, useLocalSearchParams, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { LessonLinks, useCourseProgress, YourChartCard } from '../../../../../components/astro/course';
import { TermChips } from '../../../../../components/astro/Explain';
import { useCharts } from '../../../../../components/astro/useCharts';
import { LessonView } from '../../../../../components/covens/Lesson';
import { Body, RitualScreen, Title } from '../../../../../components/rituals/ui';
import { chapterOfLesson, COURSE_HREF, lessonAppHref, lessonById, lessonPlace, nextLesson, quizAppHref } from '../../../../../lib/astro/course';
import { markLesson } from '../../../../../lib/astro/course/progress';
import { type } from '../../../../../theme';

// One lesson of Learn astrology: its words (the coven courses' lesson reader),
// what it looks like in your chart, the terms it teaches, where to go further,
// and "Mark as read" with the way on.
export default function AstroLesson() {
  const { l } = useLocalSearchParams<{ l?: string }>();
  const lesson = lessonById(l);
  const chapter = lesson ? chapterOfLesson(lesson.id) : null;
  const { progress, change } = useCourseProgress();
  const { mine, astro } = useCharts();

  if (!lesson || !chapter) {
    return (
      <RitualScreen back="Learn astrology">
        <Title eyebrow="Learn astrology">Lesson not found</Title>
        <Button label="All chapters" variant="outline" onPress={() => router.replace(COURSE_HREF.app as Href)} />
      </RitualScreen>
    );
  }
  const read = !!progress?.read[lesson.id];
  const after = nextLesson(lesson.id);
  const lastOfChapter = chapter.lessons[chapter.lessons.length - 1].id === lesson.id;
  const go = async () => {
    if (!read) await change((p) => markLesson(p, lesson.id, true, new Date()));
    router.replace((lastOfChapter ? quizAppHref(chapter.id) : after ? lessonAppHref(after.id) : COURSE_HREF.app) as Href);
  };

  return (
    <RitualScreen back="Learn astrology">
      <Title eyebrow={chapter.title}>{lesson.title}</Title>
      <Text style={type.caption}>{`${lessonPlace(lesson.id)} · about ${lesson.minutes} min${read ? ' · read' : ''}`}</Text>
      <Body muted>{lesson.summary}</Body>
      <LessonView body={lesson.body} />
      {lesson.yourChart && astro.phase !== 'locked' && <YourChartCard kind={lesson.yourChart} chart={mine?.chart ?? null} hasChart={!!mine} />}
      <TermChips ids={lesson.terms} label="Terms in this lesson" />
      <LessonLinks links={lesson.links} />
      <View style={styles.row}>
        <Button label={lastOfChapter ? 'Done: take the chapter quiz' : after ? `Done: next, ${after.title}` : 'Done'} onPress={() => void go()} />
        {read ? (
          <Button label="Mark as not read" variant="text" onPress={() => void change((p) => markLesson(p, lesson.id, false, new Date()))} />
        ) : (
          <Button label="Mark as read" variant="outline" onPress={() => void change((p) => markLesson(p, lesson.id, true, new Date()))} />
        )}
        <Button label="All chapters" variant="text" onPress={() => router.replace(COURSE_HREF.app as Href)} />
      </View>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
});
