import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Card, CheckRow, Chips, Field, Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage } from '../../../../../../lib/covens/model';
import { emptyQuestion, isChoice, maxPoints, nextQuestionId, QUESTION_TYPES, retype, validateQuiz, type DraftQuiz, type Question } from '../../../../../../lib/covens/quiz';
import { usePrograms } from '../../../../../../lib/covens/usePrograms';
import { colors, type } from '../../../../../../theme';

const num = (v: string, fallback: number) => (v.replace(/[^0-9]/g, '') === '' ? fallback : Number(v.replace(/[^0-9]/g, '')));

// Writing or changing one of the coven's tests: its pass mark, retakes and
// wait, and each question with its answers, the right ones, its points, the
// explanation shown once the test is passed, and (for written answers) the scoring guide.
// Attempts already made keep the questions as they were.
export default function QuizEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const coven = useCoven();
  const { data, status, changed } = usePrograms();
  const existing = id ? data.quizzes.find((q) => q.id === id) : undefined;
  if (status === 'loading') {
    return (
      <CovenScreen title="Test">
        <ActivityIndicator color={colors.gold} style={styles.loading} />
      </CovenScreen>
    );
  }
  if (!coven.perms.programs || (id && !existing)) {
    return (
      <CovenScreen title="Test">
        <Text style={type.body}>{coven.perms.programs ? 'That test was not found.' : 'Only those the coven’s head has chosen write its tests.'}</Text>
      </CovenScreen>
    );
  }
  const start: DraftQuiz = existing
    ? { title: existing.title, intro: existing.intro ?? '', pass_percent: existing.pass_percent, retakes: existing.retakes, wait_hours: existing.wait_hours, questions: existing.questions }
    : { title: '', intro: '', pass_percent: 80, retakes: 2, wait_hours: 24, questions: [emptyQuestion(1)] };
  return <Editor key={id ?? 'new'} id={id ?? null} start={start} source={existing?.source_id ?? null} onSaved={changed} />;
}

function Editor({ id, start, source, onSaved }: { id: string | null; start: DraftQuiz; source: string | null; onSaved: () => Promise<void> }) {
  const coven = useCoven();
  const [quiz, setQuiz] = useState<DraftQuiz>(JSON.parse(JSON.stringify(start)) as DraftQuiz);
  const [open, setOpen] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const setQ = (i: number, next: Partial<Question>) => setQuiz((q) => ({ ...q, questions: q.questions.map((x, j) => (j === i ? { ...x, ...next } : x)) }));
  const move = (i: number, by: number) =>
    setQuiz((q) => {
      const to = i + by;
      if (to < 0 || to >= q.questions.length) return q;
      const list = [...q.questions];
      [list[i], list[to]] = [list[to], list[i]];
      return { ...q, questions: list };
    });

  const save = async () => {
    const clean = { ...quiz, questions: quiz.questions.map((x) => (isChoice(x) ? { ...x, options: (x.options ?? []).map((o) => o.trim()) } : x)) };
    const errors = validateQuiz(clean);
    if (errors.length) return setMessage(errors.slice(0, 4).join(' '));
    setBusy(true);
    setMessage(null);
    try {
      await api.saveQuiz(coven.snapshot!.coven.id, id, clean);
      await onSaved();
      if (router.canGoBack()) router.back();
      else setMessage('Saved.');
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  return (
    <CovenScreen title={id ? 'Edit the test' : 'A new test'}>
      {!!source && <Notice>Copied from a ready-made course. This is the coven’s own copy: change it as you like.</Notice>}
      <Field label="Title" value={quiz.title} onChangeText={(title) => setQuiz({ ...quiz, title })} maxLength={160} />
      <Field label="Shown before they begin" value={quiz.intro} onChangeText={(intro) => setQuiz({ ...quiz, intro })} multiline maxLength={4000} />
      <View style={styles.three}>
        <Field label="Pass mark (%)" value={String(quiz.pass_percent)} onChangeText={(v) => setQuiz({ ...quiz, pass_percent: num(v, 0) })} keyboardType="number-pad" maxLength={3} />
        <Field label="Retakes allowed" value={String(quiz.retakes)} onChangeText={(v) => setQuiz({ ...quiz, retakes: num(v, 0) })} keyboardType="number-pad" maxLength={2} />
        <Field label="Hours between attempts" value={String(quiz.wait_hours)} onChangeText={(v) => setQuiz({ ...quiz, wait_hours: num(v, 0) })} keyboardType="number-pad" maxLength={3} />
      </View>
      <Text style={type.caption}>
        {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'} · {maxPoints(quiz.questions)} points. Choice questions are scored at once; written answers by their mentor or the coven’s leaders, against your guide.
      </Text>

      {quiz.questions.map((q, i) => (
        <Card key={`${q.id}-${i}`}>
          <View style={styles.head}>
            <Text style={[type.cardTitle, styles.flex]} onPress={() => setOpen(open === i ? -1 : i)}>
              {i + 1}. {q.prompt || 'A new question'}
            </Text>
            <Button label={open === i ? 'Close' : 'Open'} variant="text" onPress={() => setOpen(open === i ? -1 : i)} />
          </View>
          {open === i && (
            <View style={styles.gap}>
              <Chips label="Kind" options={QUESTION_TYPES} value={q.type} onChange={(t) => setQ(i, retype(q, t))} />
              <Field label="The question" value={q.prompt} onChangeText={(prompt) => setQ(i, { prompt })} multiline maxLength={2000} />
              {isChoice(q) && (
                <View style={styles.gap}>
                  <Text style={type.eyebrow}>{q.type === 'multi' ? 'Answers (tick every right one)' : 'Answers (tick the right one)'}</Text>
                  {(q.options ?? []).map((o, k) => (
                    <View key={k} style={styles.option}>
                      <CheckRow
                        label={q.type === 'truefalse' ? o : `Answer ${k + 1}`}
                        value={(q.correct ?? []).includes(k)}
                        onChange={(on) => {
                          const now = q.correct ?? [];
                          setQ(i, { correct: q.type === 'multi' ? (on ? [...now, k].sort((a, b) => a - b) : now.filter((c) => c !== k)) : [k] });
                        }}
                      />
                      {q.type !== 'truefalse' && (
                        <>
                          <Field label={`Answer ${k + 1}`} value={o} onChangeText={(text) => setQ(i, { options: (q.options ?? []).map((x, m) => (m === k ? text : x)) })} maxLength={500} />
                          {(q.options ?? []).length > 2 && (
                            <Button
                              label="Remove this answer"
                              variant="text"
                              onPress={() =>
                                setQ(i, {
                                  options: (q.options ?? []).filter((_, m) => m !== k),
                                  correct: (q.correct ?? []).filter((c) => c !== k).map((c) => (c > k ? c - 1 : c)),
                                })
                              }
                            />
                          )}
                        </>
                      )}
                    </View>
                  ))}
                  {q.type !== 'truefalse' && (q.options ?? []).length < 12 && <Button label="Add an answer" variant="outline" onPress={() => setQ(i, { options: [...(q.options ?? []), ''] })} />}
                </View>
              )}
              <Field label="Points" value={String(q.points)} onChangeText={(v) => setQ(i, { points: num(v, 0) })} keyboardType="number-pad" maxLength={3} />
              <Field label="Explanation, shown once they’ve passed the test (teach the point again)" value={q.explanation} onChangeText={(explanation) => setQ(i, { explanation })} multiline maxLength={4000} />
              {!isChoice(q) && <Field label="Scoring guide: what a full-marks answer includes" value={q.rubric ?? ''} onChangeText={(rubric) => setQ(i, { rubric })} multiline maxLength={4000} />}
              <View style={styles.row}>
                <Button label="Move up" variant="text" onPress={() => move(i, -1)} />
                <Button label="Move down" variant="text" onPress={() => move(i, 1)} />
                <Button label="Remove question" variant="text" onPress={() => setQuiz({ ...quiz, questions: quiz.questions.filter((_, j) => j !== i) })} />
              </View>
            </View>
          )}
        </Card>
      ))}
      <Button
        label="Add a question"
        variant="outline"
        onPress={() => {
          setQuiz({ ...quiz, questions: [...quiz.questions, { ...emptyQuestion(1), id: nextQuestionId(quiz.questions) }] });
          setOpen(quiz.questions.length);
        }}
      />
      <Button label={busy ? 'Saving…' : 'Save the test'} onPress={() => void save()} disabled={busy} />
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  flex: { flex: 1 },
  gap: { gap: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  three: { gap: 8 },
  option: { gap: 4, borderLeftWidth: 2, borderLeftColor: colors.hairline, paddingLeft: 10 },
});
