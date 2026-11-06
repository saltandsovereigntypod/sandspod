import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { Button } from '../../../../components/Button';
import { LessonView } from '../../../../components/covens/Lesson';
import { QuestionView } from '../../../../components/covens/quiz';
import { Card, Field, MenuList, MenuRow, MoreScreen, Notice, Section } from '../../../../components/more/ui';
import { LinkChips } from '../../../../components/year/parts';
import type { CourseModule } from '../../../../lib/covens/courses/types';
import { BADGE_LABEL, FOUNDER_MODULES, FOUNDER_REFLECTIONS, moduleBySlug, moduleParts, reflectionKey, scoreModule, trainingStatus, type TrainingRow } from '../../../../lib/covens/founding';
import { fetchTraining, loadFounderCourse, recordTraining } from '../../../../lib/covens/foundingApi';
import { readingTime } from '../../../../lib/covens/lesson';
import { errorMessage } from '../../../../lib/covens/model';
import type { Answers } from '../../../../lib/covens/quiz';
import { useSession } from '../../../../lib/session';
import { colors, type } from '../../../../theme';

// One module of the founder's training: the lesson, a reflection kept on this
// device only, and the short test (choice questions, scored here; passing is
// recorded with record_leader_training). Website: covens/leading/?m=<slug>.
export default function LeadingModule() {
  const { module: slug } = useLocalSearchParams<{ module: string }>();
  const meta = moduleBySlug(slug);
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [course, setCourse] = useState<CourseModule | null | undefined>(undefined);
  const [rows, setRows] = useState<TrainingRow[]>([]);
  const [reflection, setReflection] = useState('');
  const [kept, setKept] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<{ score: number; max: number; passed: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void loadFounderCourse().then((c) => live && setCourse(c));
    if (meta)
      void AsyncStorage.getItem(reflectionKey(meta.slug))
        .then((v) => live && v && setReflection(v))
        .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [meta]);
  useEffect(() => {
    if (userId) void fetchTraining(userId).then(setRows);
  }, [userId]);

  const back = '/coven/leading' as Href;
  if (!meta) {
    return (
      <MoreScreen title="Leading a coven" back={back} backLabel="Leading a coven">
        <Notice>That module wasn’t found.</Notice>
      </MoreScreen>
    );
  }
  const index = FOUNDER_MODULES.indexOf(meta);
  const next = FOUNDER_MODULES[index + 1] ?? null;
  const { doc, quiz } = moduleParts(course, meta.slug);
  const passedBefore = rows.some((r) => r.module_id === meta.id);

  const keep = async () => {
    await AsyncStorage.setItem(reflectionKey(meta.slug), reflection).catch(() => undefined);
    setKept(true);
  };
  const submit = async () => {
    if (!quiz) return;
    const scored = scoreModule(quiz, answers);
    if (scored.unanswered) return setMessage(`Answer every question first (${scored.unanswered} left).`);
    setResult(scored);
    setMessage(null);
    if (!scored.passed) return;
    if (!userId) return setMessage('Sign in to keep your progress.');
    setBusy(true);
    try {
      await recordTraining(meta.id, scored.score, scored.max);
      const fresh = await fetchTraining(userId);
      setRows(fresh);
      if (trainingStatus(fresh).done) setMessage(`Every module passed: you have the ${BADGE_LABEL} badge.`);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  return (
    <MoreScreen title={meta.title} eyebrow={`Leading a coven · module ${index + 1} of ${FOUNDER_MODULES.length}`} back={back} backLabel="Leading a coven">
      {course === undefined && <ActivityIndicator color={colors.gold} />}
      {course === null && <Notice>The lesson couldn’t be fetched. The courses come from the website, so please check your connection and try again.</Notice>}
      {passedBefore && <Notice tone="muted">You have passed this module. Read it again whenever you like.</Notice>}
      {!!doc && (
        <>
          <Text style={type.caption}>{readingTime(doc)}</Text>
          <Text style={type.body}>{doc.summary}</Text>
          <LessonView body={doc.body} />
          {!!doc.links?.length && <LinkChips links={doc.links} />}
        </>
      )}

      {!!doc && (
        <Section label="Reflection">
          <Card>
            <Text style={type.body}>{FOUNDER_REFLECTIONS[meta.slug]}</Text>
            <Field
              label="Your reflection (kept on this device only)"
              value={reflection}
              onChangeText={(t) => {
                setReflection(t);
                setKept(false);
              }}
              multiline
              maxLength={8000}
            />
            <Button label={kept ? 'Kept' : 'Keep my reflection'} variant="outline" disabled={!reflection.trim() || kept} onPress={() => void keep()} />
            <Text style={type.caption}>Not sent to anyone, and not part of the test. You might copy it into your ritual journal or your coven’s rules.</Text>
          </Card>
        </Section>
      )}

      {!!quiz && (
        <Section label={quiz.title}>
          <Text style={type.caption}>{quiz.intro} The pass mark is {quiz.passPercent}%; you may take it again.</Text>
          {quiz.questions.map((q, i) => (
            <QuestionView key={q.id} question={q} number={i + 1} of={quiz.questions.length} answer={answers[q.id]} onAnswer={(a) => setAnswers((prev) => ({ ...prev, [q.id]: a }))} />
          ))}
          {result && (
            <Card tone={result.passed ? 'gold' : undefined}>
              <Text style={type.cardTitle}>{result.passed ? 'Passed' : 'Not passed yet'}</Text>
              <Text style={type.body}>
                {result.score} of {result.max}. {result.passed ? 'Well done.' : 'Read the lesson again, then try once more.'}
              </Text>
              {quiz.questions.map((q, i) => (
                <Text key={q.id} style={type.caption}>
                  {i + 1}. {q.explanation}
                </Text>
              ))}
            </Card>
          )}
          <Button label={busy ? 'Saving…' : result && !result.passed ? 'Check my answers again' : 'Check my answers'} disabled={busy} onPress={() => void submit()} />
          {result && !result.passed && <Button label="Start the test again" variant="outline" onPress={() => (setAnswers({}), setResult(null))} />}
        </Section>
      )}
      {message && <Notice>{message}</Notice>}

      <MenuList>
        {next && <MenuRow label={`Next: ${next.title}`} icon="books" onPress={() => router.replace(`/coven/leading/${next.slug}` as Href)} />}
        <MenuRow label="All the modules" icon="library" last onPress={() => router.replace(back)} />
      </MenuList>
    </MoreScreen>
  );
}
