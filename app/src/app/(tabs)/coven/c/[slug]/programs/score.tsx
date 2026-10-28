import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { AttemptResult } from '../../../../../../components/covens/quiz';
import { threadHref } from '../../../../../../components/covens/training';
import { Pill, Pills } from '../../../../../../components/covens/ui';
import { Card, Field, Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage } from '../../../../../../lib/covens/model';
import { mentorOf } from '../../../../../../lib/covens/programs';
import { ATTEMPT_STATUS, isWritten, passes, scoresPayload } from '../../../../../../lib/covens/quiz';
import { usePrograms } from '../../../../../../lib/covens/usePrograms';
import { colors, fonts, type } from '../../../../../../theme';

// Scoring a test: the choice questions already scored, and for each written
// answer the guide (rubric), points and a comment. Save for later, or give
// the result (passed or not, and the step done when passed).
export default function ScoreTest() {
  const { a: attemptId } = useLocalSearchParams<{ a: string }>();
  const coven = useCoven();
  const { data, status, changed } = usePrograms();
  const attempt = data.attempts.find((x) => x.id === attemptId);
  const [typed, setTyped] = useState<Record<string, { points: string; comment: string }> | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (status === 'loading') {
    return (
      <CovenScreen title="Score a test">
        <ActivityIndicator color={colors.gold} style={styles.loading} />
      </CovenScreen>
    );
  }
  if (!attempt) {
    return (
      <CovenScreen title="Score a test">
        <Text style={type.body}>That attempt isn’t here, or isn’t yours to score.</Text>
      </CovenScreen>
    );
  }
  const mayScore = attempt.user_id !== coven.userId && (coven.perms.programs || mentorOf(coven.mentors, attempt.user_id) === coven.userId);
  const open = attempt.status === 'submitted' || attempt.status === 'scored';
  const scores =
    typed ??
    Object.fromEntries(
      attempt.questions.filter(isWritten).map((q) => {
        const m = attempt.manual_scores[q.id];
        return [q.id, { points: m ? String(m.points) : '', comment: m?.comment ?? '' }];
      }),
    );
  const note = feedback ?? attempt.feedback ?? '';
  const manual = Object.values(scores).reduce((n, s) => n + (Number(s.points) || 0), 0);
  const total = attempt.auto_score + manual;
  const task = data.tasks.find((t) => t.id === attempt.task_id);

  const save = async (final: boolean) => {
    const { scores: clean, errors } = scoresPayload(attempt.questions, scores, final);
    if (errors.length) return setMessage(errors.slice(0, 3).join(' '));
    setBusy(true);
    setMessage(null);
    try {
      const saved = await api.scoreQuiz(attempt.id, clean, note, final);
      await changed();
      setMessage(final ? (saved.status === 'passed' ? 'Scored: passed. The step is done.' : 'Scored: not passed this time. They can see why, and take it again when allowed.') : 'Saved. They still see it waiting.');
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  return (
    <CovenScreen title="Score a test" scrollKey={attempt.id}>
      <Pills>
        <Pill label={coven.nameOf(attempt.user_id)} />
        <Pill label={`Attempt ${attempt.number}`} />
        <Pill label={ATTEMPT_STATUS[attempt.status]} tone={attempt.status === 'passed' ? 'gold' : undefined} />
      </Pills>
      <Text style={type.cardTitle}>{attempt.title}</Text>
      {task && <Text style={type.caption}>{task.title}</Text>}
      <Text style={styles.total}>
        {total} of {attempt.max} · {attempt.max ? Math.round((total / attempt.max) * 100) : 100}% ({attempt.pass_percent}% to pass){' '}
        {passes(total, attempt.max, attempt.pass_percent) ? '· passes' : '· not yet a pass'}
      </Text>
      <Text style={type.caption}>Choice questions: {attempt.auto_score} points, scored when handed in.</Text>
      {!mayScore && <Notice>Only their mentor or those who manage the coven’s programs score this test.</Notice>}

      {attempt.questions.map((q, i) => {
        if (!isWritten(q)) return null;
        const s = scores[q.id] ?? { points: '', comment: '' };
        const answer = attempt.answers[q.id];
        return (
          <Card key={q.id}>
            <Text style={type.eyebrow}>
              Question {i + 1} · up to {q.points} point{q.points === 1 ? '' : 's'}
            </Text>
            <Text style={styles.prompt}>{q.prompt}</Text>
            <Text style={type.body}>{typeof answer === 'string' && answer.trim() ? answer : 'No answer given.'}</Text>
            {!!q.rubric && (
              <Text style={type.caption}>
                <Text style={styles.label}>What a full answer includes: </Text>
                {q.rubric}
              </Text>
            )}
            {mayScore && open && (
              <View style={styles.row}>
                <Field
                  label={`Points (0 to ${q.points})`}
                  value={s.points}
                  onChangeText={(v) => setTyped({ ...scores, [q.id]: { ...s, points: v.replace(/[^0-9.]/g, '') } })}
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
                <Field label="A comment on this answer" value={s.comment} onChangeText={(v) => setTyped({ ...scores, [q.id]: { ...s, comment: v } })} multiline maxLength={2000} />
              </View>
            )}
          </Card>
        );
      })}

      {mayScore && open && (
        <>
          <Field label="A note on the whole test (optional)" value={note} onChangeText={setFeedback} multiline maxLength={4000} />
          <View style={styles.row}>
            <Button label={busy ? 'Saving…' : 'Give the result'} onPress={() => void save(true)} disabled={busy} />
            <Button label="Save for later" variant="outline" onPress={() => void save(false)} disabled={busy} />
          </View>
        </>
      )}
      {message && <Notice>{message}</Notice>}
      <Button label={`Talk with ${coven.nameOf(attempt.user_id)} about it`} variant="text" onPress={() => router.push(threadHref(coven.slug, attempt.enrollment_id, attempt.task_id))} />
      <Text style={type.eyebrow}>The whole attempt</Text>
      <AttemptResult attempt={attempt} showRubric self={false} />
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  row: { gap: 10 },
  total: { fontFamily: fonts.bodySemi, fontSize: 17, color: colors.cream },
  prompt: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
  label: { fontFamily: fonts.bodySemi, color: colors.cream },
});
