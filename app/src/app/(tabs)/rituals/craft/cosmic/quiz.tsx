import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { useCourseProgress } from '../../../../../components/astro/course';
import { QuestionView } from '../../../../../components/covens/quiz';
import { Body, Card, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { chapterById, CHAPTERS, COURSE_HREF, lessonAppHref } from '../../../../../lib/astro/course';
import { recordQuiz, scoreQuiz, type QuizResult } from '../../../../../lib/astro/course/progress';
import { answerWords, rightWords, unanswered, type Answers } from '../../../../../lib/covens/quiz';
import { colors, type } from '../../../../../theme';

// A chapter's quiz: every question on one page (the coven tests' question
// view), scored at once, with each answer explained. The best score is kept;
// a quiz can be taken as often as you like.
export default function AstroQuiz() {
  const { c } = useLocalSearchParams<{ c?: string }>();
  const chapter = chapterById(c);
  const { progress, change } = useCourseProgress();
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!chapter) {
    return (
      <RitualScreen back="Learn astrology">
        <Title eyebrow="Learn astrology">Quiz not found</Title>
        <Button label="All chapters" variant="outline" onPress={() => router.replace(COURSE_HREF.app as Href)} />
      </RitualScreen>
    );
  }
  const quiz = chapter.quiz;
  const record = progress?.quizzes[quiz.id];
  const index = CHAPTERS.indexOf(chapter);
  const following = CHAPTERS[index + 1];

  const submit = async () => {
    const missing = unanswered(quiz.questions, answers);
    if (missing.length) {
      setMessage(`Answer every question first (question ${missing.map((i) => i + 1).join(', ')}).`);
      return;
    }
    setMessage(null);
    const r = scoreQuiz(quiz, answers);
    setResult(r);
    await change((p) => recordQuiz(p, quiz.id, r, new Date()));
  };
  const again = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <RitualScreen back="Learn astrology">
      <Title eyebrow={`Chapter ${index + 1} quiz`}>{quiz.title}</Title>
      <Body muted>{`${quiz.intro} ${quiz.passPercent}% to pass; take it as often as you like.${record ? ` Your best so far: ${record.best}%${record.passed ? ', passed' : ''}.` : ''}`}</Body>

      {!result ? (
        <View style={ui.gap}>
          {quiz.questions.map((q, i) => (
            <QuestionView key={q.id} question={q} number={i + 1} of={quiz.questions.length} answer={answers[q.id]} onAnswer={(a) => setAnswers((prev) => ({ ...prev, [q.id]: a }))} />
          ))}
          {message && <Notice>{message}</Notice>}
          <Button label="Check my answers" onPress={() => void submit()} />
        </View>
      ) : (
        <View style={ui.gap}>
          <Card accent>
            <SectionLabel>{result.passed ? 'Passed' : 'Not passed yet'}</SectionLabel>
            <Text style={type.cardTitle}>{`${result.total} of ${result.max} · ${result.percent}%`}</Text>
            <Body>{result.passed ? 'Well done. The answers are below, each with the reason.' : `You need ${quiz.passPercent}% to pass. Read the explanations below, look back at the lessons, and try again whenever you are ready.`}</Body>
          </Card>
          {quiz.questions.map((q, i) => (
            <Card key={q.id}>
              <Text style={type.eyebrow}>{`Question ${i + 1} · ${result.right[q.id] ? 'right' : 'not quite'}`}</Text>
              <Text style={type.cardTitle}>{q.prompt}</Text>
              <Body>{`Your answer: ${answerWords(q, answers[q.id]) || 'none'}`}</Body>
              {!result.right[q.id] && <Text style={[type.body, styles.right]}>{`The answer: ${rightWords(q)}`}</Text>}
              <Body muted>{q.explanation}</Body>
            </Card>
          ))}
          <View style={styles.row}>
            {result.passed && following ? (
              <Button label={`Next chapter: ${following.title}`} onPress={() => router.replace(lessonAppHref(following.lessons[0].id) as Href)} />
            ) : (
              <Button label="Try again" onPress={again} />
            )}
            {!result.passed && <Button label="Back to the lessons" variant="outline" onPress={() => router.replace(lessonAppHref(chapter.lessons[0].id) as Href)} />}
            <Button label="All chapters" variant="text" onPress={() => router.replace(COURSE_HREF.app as Href)} />
            {result.passed && <Button label="Take it again" variant="text" onPress={again} />}
          </View>
        </View>
      )}
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  right: { color: colors.gold },
});
