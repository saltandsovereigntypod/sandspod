// The teaching on a program step: its lessons, its test, practice logged a
// session at a time (with a timer), and the way into its conversation.
// Used by the program path screen; the rules are lib/covens/training.ts and quiz.ts.

import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { covenHref } from './CovenScreen';
import { Pill, Pills } from './ui';
import { Field, MenuList, MenuRow, Notice } from '../more/ui';
import * as api from '../../lib/covens/api';
import { useCoven } from '../../lib/covens/CovenContext';
import { readingTime } from '../../lib/covens/lesson';
import { errorMessage } from '../../lib/covens/model';
import type { Enrollment, ProgramTask, TaskProgress } from '../../lib/covens/programs';
import { ATTEMPT_STATUS, scoreLine, type Attempt } from '../../lib/covens/quiz';
import {
  cleanDay,
  clock,
  fileLabel,
  isRead,
  lessonsLine,
  minutesPractised,
  sessionsLine,
  sessionsOf,
  timerElapsed,
  timerMinutes,
  timerPause,
  timerStart,
  todayKey,
  type DocRead,
  type ProgramDoc,
  type TimerState,
} from '../../lib/covens/training';
import { colors, fonts, radius, type } from '../../theme';

export const lessonHref = (slug: string, docId: string, enrollmentId?: string, taskId?: string) =>
  `${covenHref(slug, 'programs/lesson')}?doc=${encodeURIComponent(docId)}${enrollmentId ? `&e=${encodeURIComponent(enrollmentId)}` : ''}${taskId ? `&t=${encodeURIComponent(taskId)}` : ''}` as Href;
export const testHref = (slug: string, enrollmentId: string, taskId: string) => `${covenHref(slug, 'programs/test')}?e=${encodeURIComponent(enrollmentId)}&t=${encodeURIComponent(taskId)}` as Href;
export const scoreHref = (slug: string, attemptId: string) => `${covenHref(slug, 'programs/score')}?a=${encodeURIComponent(attemptId)}` as Href;
export const threadHref = (slug: string, enrollmentId: string, taskId: string) => `${covenHref(slug, 'programs/thread')}?e=${encodeURIComponent(enrollmentId)}&t=${encodeURIComponent(taskId)}` as Href;

/** The lessons on a step, each opening the reader. */
export function TaskLessons({ docs, reads, person, enrollmentId, taskId }: { docs: ProgramDoc[]; reads: DocRead[]; person: string; enrollmentId: string; taskId: string }) {
  const coven = useCoven();
  if (!docs.length) return null;
  return (
    <View style={styles.gap}>
      <Text style={type.eyebrow}>{lessonsLine(docs, reads, person)}</Text>
      <MenuList>
        {docs.map((d, i) => (
          <MenuRow
            key={d.id}
            label={`${isRead(reads, person, d.id) ? '✓ ' : ''}${d.title}`}
            detail={[readingTime(d), d.file_path ? fileLabel(d) : ''].filter(Boolean).join(' · ')}
            icon="library"
            last={i === docs.length - 1}
            onPress={() => router.push(lessonHref(coven.slug, d.id, enrollmentId, taskId))}
          />
        ))}
      </MenuList>
    </View>
  );
}

/** A step's test: how it stands, and the way to take it or see the results. */
export function TestCard({ task, enrollment, attempts, self, later }: { task: ProgramTask; enrollment: Enrollment; attempts: Attempt[]; self: boolean; later: boolean }) {
  const coven = useCoven();
  const mine = attempts.filter((a) => a.enrollment_id === enrollment.id && a.task_id === task.id).sort((a, b) => b.number - a.number);
  const last = mine[0];
  const passed = mine.some((a) => a.status === 'passed');
  const label = self ? (passed || last ? 'Your test and results' : 'Take the test') : mine.length ? 'Their test and results' : 'The test';
  return (
    <View style={styles.test}>
      <Pills>
        <Pill label="Test" tone="gold" />
        {last && <Pill label={passed ? 'Passed' : ATTEMPT_STATUS[last.status]} tone={passed ? 'gold' : last.status === 'failed' ? 'warn' : undefined} />}
        {mine.length > 0 && <Pill label={`${mine.length} attempt${mine.length === 1 ? '' : 's'}`} />}
      </Pills>
      {last && <Text style={type.caption}>Last: {scoreLine(last)}</Text>}
      {!later && <Button label={label} variant={self && !passed ? 'primary' : 'outline'} onPress={() => router.push(testHref(coven.slug, enrollment.id, task.id))} />}
    </View>
  );
}

/** "Conversation with your mentor · 2 new": the way into a step's thread. */
export function ThreadRow({ enrollment, taskId, unread, self, mentorName, personName }: { enrollment: Enrollment; taskId: string; unread: number; self: boolean; mentorName: string | null; personName: string }) {
  const coven = useCoven();
  const label = self ? (mentorName ? `Talk with ${mentorName} about this step` : 'Talk with the coven’s leaders about this step') : `Talk with ${personName} about this step`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}${unread ? `, ${unread} new` : ''}`}
      onPress={() => router.push(threadHref(coven.slug, enrollment.id, taskId))}
      style={({ pressed }) => [styles.thread, pressed && styles.pressed]}
    >
      <Text style={[styles.threadText, styles.flex]}>{label}</Text>
      {unread > 0 && (
        <View style={styles.count}>
          <Text style={styles.countText}>{unread > 99 ? '99+' : unread} new</Text>
        </View>
      )}
    </Pressable>
  );
}

/** Practice logged session by session: the count, the sessions, and (for the person) a form and a timer. */
export function PracticeLog({
  task,
  row,
  enrollment,
  canWork,
  onChanged,
}: {
  task: ProgramTask;
  row: TaskProgress | undefined;
  enrollment: Enrollment;
  canWork: boolean;
  onChanged: () => Promise<void>;
}) {
  const sessions = sessionsOf(row);
  const [on, setOn] = useState(todayKey());
  const [minutes, setMinutes] = useState(task.minutes ? String(task.minutes) : '');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState<TimerState>({ startedAt: null, banked: 0 });
  const [, tick] = useState(0);
  const running = !!timer.startedAt;
  const all = (row?.times_done ?? 0) >= task.times;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const elapsed = timerElapsed(timer);
  const target = task.minutes ? task.minutes * 60 : 0;

  const log = async () => {
    const day = cleanDay(on.trim());
    if (!day) return setMessage('Write the day as year-month-day, like 2026-10-28.');
    const m = Number(minutes.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(m) || m > 1440) return setMessage('Minutes from 0 to 1,440.');
    setBusy(true);
    setMessage(null);
    try {
      await api.logPractice(enrollment.id, task.id, day, m, note);
      setNote('');
      setTimer({ startedAt: null, banked: 0 });
      await onChanged();
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };
  const remove = async (index: number) => {
    setBusy(true);
    setMessage(null);
    try {
      await api.removePractice(enrollment.id, task.id, index);
      await onChanged();
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  return (
    <View style={styles.gap}>
      <Text style={styles.count2}>
        {sessionsLine(task, row)}
        {sessions.length ? ` · ${minutesPractised(sessions)} minutes in all` : ''}
      </Text>
      {sessions.map((s, i) => (
        <View key={`${s.on}-${i}`} style={styles.session}>
          <Text style={[type.caption, styles.flex]}>
            {new Date(`${s.on}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} · {s.minutes} min{s.note ? ` · ${s.note}` : ''}
          </Text>
          {canWork && <Button label="Take back" variant="text" onPress={() => void remove(i)} disabled={busy} />}
        </View>
      ))}
      {canWork && !all && (
        <View style={styles.form}>
          <Text style={type.eyebrow}>Log a session</Text>
          {!!task.minutes && (
            <View style={styles.timer}>
              <Text style={styles.clock} accessibilityLabel={`Timer ${clock(elapsed)}`} accessibilityLiveRegion="polite">
                {clock(elapsed)}
                {target ? <Text style={type.caption}> of {clock(target)}</Text> : null}
              </Text>
              {elapsed >= target && target > 0 && <Text style={type.caption}>That’s the time this practice asks for. Finish gently, then log it.</Text>}
              <View style={styles.row}>
                {running ? <Button label="Pause" variant="outline" onPress={() => setTimer(timerPause(timer))} /> : <Button label={elapsed ? 'Carry on' : 'Start the timer'} variant="outline" onPress={() => setTimer(timerStart(timer))} />}
                {elapsed > 0 && !running && (
                  <Button
                    label="Use these minutes"
                    variant="text"
                    onPress={() => {
                      setMinutes(String(timerMinutes(elapsed)));
                    }}
                  />
                )}
                {elapsed > 0 && !running && <Button label="Reset" variant="text" onPress={() => setTimer({ startedAt: null, banked: 0 })} />}
              </View>
            </View>
          )}
          <Field label="Day (year-month-day)" value={on} onChangeText={setOn} maxLength={10} autoCapitalize="none" />
          <Field label="Minutes" value={minutes} onChangeText={(v) => setMinutes(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" maxLength={4} />
          <Field label="A note (optional)" value={note} onChangeText={setNote} maxLength={1000} multiline />
          <Button label={`Log this session (${Math.min(task.times, (row?.times_done ?? 0) + 1)} of ${task.times})`} onPress={() => void log()} disabled={busy || running} />
        </View>
      )}
      {message && <Notice>{message}</Notice>}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 8 },
  flex: { flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  test: { borderWidth: 1, borderColor: colors.goldLine, borderRadius: radius.tile, padding: 12, gap: 8 },
  thread: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingVertical: 8 },
  threadText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold },
  pressed: { opacity: 0.7 },
  count: { backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { color: colors.forestInk, fontFamily: fonts.bodySemi, fontSize: 12 },
  count2: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
  session: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  form: { gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline, paddingTop: 8 },
  timer: { gap: 6, alignItems: 'flex-start' },
  clock: { fontFamily: fonts.display, fontSize: 36, color: colors.cream },
});
