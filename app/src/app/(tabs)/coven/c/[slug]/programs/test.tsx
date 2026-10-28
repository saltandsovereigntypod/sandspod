import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { AttemptResult, QuestionView } from '../../../../../../components/covens/quiz';
import { scoreHref, threadHref } from '../../../../../../components/covens/training';
import { Pill, Pills, Words } from '../../../../../../components/covens/ui';
import { Card, Chips, MenuList, MenuRow, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage } from '../../../../../../lib/covens/model';
import { HEAD_OWN_TRAINING, mentorOf, signsOffAsHead } from '../../../../../../lib/covens/programs';
import {
  ATTEMPT_STATUS,
  draftKey,
  maxPoints,
  readDraft,
  scoreLine,
  standingLine,
  unanswered,
  type Answer,
  type Answers,
  type Attempt,
  type CovenQuiz,
  type QuizStanding,
} from '../../../../../../lib/covens/quiz';
import { usePrograms } from '../../../../../../lib/covens/usePrograms';
import { colors, type } from '../../../../../../theme';

const when = (value: string) => new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });

// A step's test: before it (what it asks, attempts left), taking it (one
// question at a time or all at once, the draft kept on this device as you
// go), the result (with the right answers and explanations once passed), and
// every attempt. Those overseeing see the attempts and score them.
export default function StepTest() {
  const { e: enrollmentId, t: taskId } = useLocalSearchParams<{ e: string; t: string }>();
  const coven = useCoven();
  const { data, status, reload, changed } = usePrograms();
  const enrollment = data.enrollments.find((x) => x.id === enrollmentId);
  const task = data.tasks.find((x) => x.id === taskId);
  const self = !!enrollment && enrollment.user_id === coven.userId;
  const [quiz, setQuiz] = useState<CovenQuiz | null | undefined>(undefined);
  const [standing, setStanding] = useState<QuizStanding | null>(null);
  const [mode, setMode] = useState<'overview' | 'taking' | { attempt: string }>('overview');
  const [layout, setLayout] = useState<'one' | 'all'>('one');
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const saving = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = enrollmentId && taskId ? draftKey(enrollmentId, taskId) : '';

  const quizId = task?.quiz_id ?? null;
  const [nonce, setNonce] = useState(0);
  const load = useCallback(async () => setNonce((n) => n + 1), []);
  useEffect(() => {
    if (!quizId || !enrollmentId || !taskId) return;
    let live = true;
    Promise.all([api.quizView(quizId, enrollmentId).catch(() => null), api.quizStanding(enrollmentId, taskId).catch(() => null)]).then(([view, stand]) => {
      if (!live) return;
      setQuiz(view);
      setStanding(stand);
    });
    return () => {
      live = false;
    };
  }, [quizId, enrollmentId, taskId, nonce]);
  // A draft from before, on this device.
  useEffect(() => {
    if (!key || !self) return;
    AsyncStorage.getItem(key)
      .then((raw) => {
        const draft = readDraft(raw);
        if (draft) {
          setAnswers(draft.answers);
          setIndex(draft.index);
        }
      })
      .catch(() => {});
  }, [key, self]);

  const answer = (qid: string, a: Answer) => {
    setAnswers((prev) => {
      const next = { ...prev, [qid]: a };
      if (saving.current) clearTimeout(saving.current);
      saving.current = setTimeout(() => void AsyncStorage.setItem(key, JSON.stringify({ answers: next, at: Date.now(), index })).catch(() => {}), 400);
      return next;
    });
  };

  if (status === 'loading' || quiz === undefined) {
    return (
      <CovenScreen title="Test">
        <ActivityIndicator color={colors.gold} style={styles.loading} />
      </CovenScreen>
    );
  }
  if (!enrollment || !task || !quiz) {
    return (
      <CovenScreen title="Test">
        <Text style={type.body}>This test isn’t here any more, or isn’t yours to see.</Text>
      </CovenScreen>
    );
  }

  const attempts = data.attempts.filter((a) => a.enrollment_id === enrollment.id && a.task_id === task.id).sort((a, b) => b.number - a.number);
  const can = standingLine(standing);
  const questions = quiz.questions;
  const viewing = typeof mode === 'object' ? attempts.find((a) => a.id === mode.attempt) : undefined;
  const mentor = mentorOf(coven.mentors, enrollment.user_id);
  // The coven's head scores anyone's test, her own too.
  const head = signsOffAsHead(coven.perms, coven.standing.ok);
  const mayScore = head || (!self && (coven.perms.programs || mentor === coven.userId));

  const handIn = async () => {
    const left = unanswered(questions, answers);
    const go = async () => {
      setBusy(true);
      setMessage(null);
      try {
        const saved = await api.submitQuiz(enrollment.id, task.id, answers);
        await AsyncStorage.removeItem(key).catch(() => {});
        setAnswers({});
        setIndex(0);
        await Promise.all([changed(), load()]);
        setMode({ attempt: saved.id });
      } catch (e) {
        setMessage(errorMessage(e));
      }
      setBusy(false);
    };
    if (!left.length) return void go();
    const words = `Question${left.length === 1 ? '' : 's'} ${left.join(', ')} ${left.length === 1 ? 'has' : 'have'} no answer yet.`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`${words} Hand it in anyway?`)) void go();
      return;
    }
    Alert.alert('Hand it in anyway?', words, [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Hand it in', onPress: () => void go() },
    ]);
  };
  const allow = async () => {
    setBusy(true);
    try {
      setStanding(await api.allowRetake(enrollment.id, task.id));
      setMessage('Another attempt is allowed, with no wait before it.');
      await reload();
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  // ── One attempt's result ──
  if (viewing) {
    const final = viewing.status === 'passed' || viewing.status === 'failed';
    return (
      <CovenScreen title={quiz.title} onBack={() => setMode('overview')} backLabel="Back to the test" scrollKey={`attempt-${viewing.id}`}>
        <Pills>
          <Pill label={`Attempt ${viewing.number}`} />
          <Pill label={ATTEMPT_STATUS[viewing.status]} tone={viewing.status === 'passed' ? 'gold' : viewing.status === 'failed' ? 'warn' : undefined} />
        </Pills>
        <Text style={type.cardTitle}>{scoreLine(viewing)}</Text>
        <Text style={type.caption}>
          Handed in {when(viewing.submitted_at)} · {viewing.pass_percent}% to pass
          {viewing.scored_by && final ? ` · scored by ${coven.nameOf(viewing.scored_by)}` : ''}
        </Text>
        {viewing.status === 'passed' && <Notice>Passed. This step is done.</Notice>}
        {viewing.status === 'failed' && self && <Notice>{can.line || 'Not passed this time.'} See which questions to look at again below, and ask your mentor about anything unclear.</Notice>}
        {!final && <Notice>{self ? 'The choice questions are scored. Your written answers are with your mentor or the coven’s leaders, who will score them.' : 'Written answers are waiting to be scored.'}</Notice>}
        {!!viewing.feedback && final && (
          <Card>
            <Text style={type.eyebrow}>A note from {viewing.scored_by ? coven.nameOf(viewing.scored_by) : 'your mentor'}</Text>
            <Words text={viewing.feedback} />
          </Card>
        )}
        <AttemptResult attempt={viewing} showRubric={!self || head} self={self} />
        <View style={styles.row}>
          {mayScore && !final && <Button label="Score it" onPress={() => router.push(scoreHref(coven.slug, viewing.id))} />}
          <Button label={self ? 'Talk about your result' : `Talk with ${coven.nameOf(enrollment.user_id)} about it`} variant="outline" onPress={() => router.push(threadHref(coven.slug, enrollment.id, task.id))} />
        </View>
      </CovenScreen>
    );
  }

  // ── Taking it ──
  if (mode === 'taking') {
    const q = questions[Math.min(index, questions.length - 1)];
    return (
      <CovenScreen title={quiz.title} onBack={() => setMode('overview')} backLabel="Back (your answers are kept)" scrollKey={`take-${index}-${layout}`}>
        <Chips
          label="Show"
          options={[
            { value: 'one', label: 'One question at a time' },
            { value: 'all', label: 'The whole test' },
          ]}
          value={layout}
          onChange={setLayout}
        />
        <Text style={type.caption}>Your answers are kept on this device as you go, until you hand the test in.</Text>
        {layout === 'one' ? (
          <>
            <QuestionView question={q} number={index + 1} of={questions.length} answer={answers[q.id]} onAnswer={(a) => answer(q.id, a)} />
            <View style={styles.row}>
              {index > 0 && <Button label="Back" variant="outline" onPress={() => setIndex(index - 1)} />}
              {index < questions.length - 1 ? <Button label="Next question" onPress={() => setIndex(index + 1)} /> : <Button label={busy ? 'Handing it in…' : 'Hand it in'} onPress={() => void handIn()} disabled={busy} />}
            </View>
          </>
        ) : (
          <>
            {questions.map((x, i) => (
              <Card key={x.id}>
                <QuestionView question={x} number={i + 1} of={questions.length} answer={answers[x.id]} onAnswer={(a) => answer(x.id, a)} />
              </Card>
            ))}
            <Button label={busy ? 'Handing it in…' : 'Hand it in'} onPress={() => void handIn()} disabled={busy} />
          </>
        )}
        {message && <Notice>{message}</Notice>}
      </CovenScreen>
    );
  }

  // ── Before it, and the attempts ──
  const written = questions.filter((q) => q.type === 'short' || q.type === 'long').length;
  const begun = Object.keys(answers).length > 0;
  return (
    <CovenScreen title={quiz.title} onRefresh={async () => void (await Promise.all([reload(), load()]))}>
      <Pills>
        <Pill label={task.title} />
        {!self && <Pill label={coven.nameOf(enrollment.user_id)} />}
      </Pills>
      <Words text={quiz.intro} />
      <Text style={type.caption}>
        {questions.length} question{questions.length === 1 ? '' : 's'} · {maxPoints(questions)} points · {quiz.pass_percent}% to pass
        {written ? ` · ${written} written answer${written === 1 ? '' : 's'}, scored by your mentor or the coven’s leaders` : ''}
        {` · ${quiz.retakes} retake${quiz.retakes === 1 ? '' : 's'}${quiz.wait_hours ? `, ${quiz.wait_hours} hours apart` : ''}`}
      </Text>
      {self && !!can.line && <Notice>{can.line}</Notice>}
      {self && can.canTake && (
        <Button label={begun ? 'Carry on with your answers' : attempts.length ? 'Take it again' : 'Begin the test'} onPress={() => setMode('taking')} disabled={!questions.length} />
      )}
      {self && !questions.length && <Text style={type.caption}>This test has no questions yet.</Text>}
      {self && head && <Text style={type.caption}>{HEAD_OWN_TRAINING}</Text>}
      {(head || (!self && coven.perms.programs)) && standing && standing.used >= standing.allowed && !standing.passed && (
        <Button label="Allow one more attempt" variant="outline" onPress={() => void allow()} disabled={busy} />
      )}
      {message && <Notice>{message}</Notice>}
      <Section label={self ? 'Your attempts' : 'Attempts'}>
        {!attempts.length && <Text style={type.caption}>{self ? 'None yet.' : 'They haven’t taken it yet.'}</Text>}
        {attempts.length > 0 && (
          <MenuList>
            {attempts.map((a: Attempt, i) => (
              <MenuRow
                key={a.id}
                label={`Attempt ${a.number}: ${ATTEMPT_STATUS[a.status]}`}
                detail={`${scoreLine(a)} · ${when(a.submitted_at)}`}
                last={i === attempts.length - 1}
                onPress={() => (mayScore && (a.status === 'submitted' || a.status === 'scored') ? router.push(scoreHref(coven.slug, a.id)) : setMode({ attempt: a.id }))}
              />
            ))}
          </MenuList>
        )}
      </Section>
      <Button label={self ? 'Ask about this test' : `Talk with ${coven.nameOf(enrollment.user_id)} about it`} variant="text" onPress={() => router.push(threadHref(coven.slug, enrollment.id, task.id))} />
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
