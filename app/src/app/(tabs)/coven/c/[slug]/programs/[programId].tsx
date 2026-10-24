import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { ProgressBar } from '../../../../../../components/covens/programs';
import { Pill, Pills, Words } from '../../../../../../components/covens/ui';
import { Card, Field, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage } from '../../../../../../lib/covens/model';
import {
  canCheck,
  canPass,
  checkedByLabel,
  ENROLLMENT_STATUS,
  enrollmentSummary,
  holidayName,
  kindLabel,
  mentorOf,
  PASSED_BY,
  programOutline,
  taskState,
  type Enrollment,
  type ProgramTask,
  type TaskProgress,
} from '../../../../../../lib/covens/programs';
import { usePrograms } from '../../../../../../lib/covens/usePrograms';
import { colors, fonts, radius, type } from '../../../../../../theme';

const date = (value: string | null | undefined) => (value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '');

// One person's path through one program: every stage, its tasks and what's
// been done. The person logs their work; their mentor or a program manager
// signs it off and confirms each stage.
export default function ProgramPath() {
  const { programId, person: personParam } = useLocalSearchParams<{ programId: string; person?: string }>();
  const coven = useCoven();
  const { data, status, changed } = usePrograms();
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const person = personParam || coven.userId || '';
  const self = person === coven.userId;
  const program = data.programs.find((p) => p.id === programId);
  const enrollment = data.enrollments.find((e) => e.program_id === programId && e.user_id === person);

  const act = async (work: () => Promise<unknown>, done?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      await changed();
      if (done) setMessage(done);
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  if (status === 'loading') {
    return (
      <CovenScreen title="Initiation & training">
        <ActivityIndicator color={colors.gold} style={styles.loading} />
      </CovenScreen>
    );
  }
  if (!program || !enrollment) {
    return (
      <CovenScreen title="Initiation & training">
        <Text style={type.body}>{self ? 'You aren’t in that program.' : 'That progress isn’t yours to see, or the program has changed.'}</Text>
      </CovenScreen>
    );
  }

  const outline = programOutline(program.id, data.stages, data.tasks);
  const s = enrollmentSummary(enrollment, outline, data.progress);
  const rows = new Map(data.progress.filter((p) => p.enrollment_id === enrollment.id).map((p) => [p.task_id, p]));
  const passes = data.passes.filter((p) => p.enrollment_id === enrollment.id);
  const who = { self, mentor: mentorOf(coven.mentors, person) === coven.userId, programs: coven.perms.programs };
  const mentor = mentorOf(coven.mentors, person);
  const award = program.award_rank_id ? coven.snapshot?.ranks.find((r) => r.id === program.award_rank_id)?.name : null;

  const pass = (override: boolean) => {
    const go = () => void act(() => api.passStage(enrollment.id, note, override), 'Stage passed.').then(() => setNote(''));
    if (!override) return go();
    Alert.alert('Pass this stage early?', 'Tasks not yet signed off, and any time the stage asks for, are set aside.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pass it', onPress: go },
    ]);
  };
  const setStatus = (to: 'active' | 'paused' | 'withdrawn') => {
    const go = () => void act(() => api.setEnrollmentStatus(enrollment.id, to));
    if (to !== 'withdrawn') return go();
    Alert.alert(self ? 'Step away from this program?' : `Withdraw ${coven.nameOf(person)}?`, 'The work done so far is kept. The program can be taken up again later.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Step away', style: 'destructive', onPress: go },
    ]);
  };

  return (
    <CovenScreen title={program.title} onRefresh={changed}>
      <Pills>
        <Pill label={program.kind === 'initiation' ? 'Initiation' : 'Training'} />
        <Pill label={ENROLLMENT_STATUS[enrollment.status]} tone={enrollment.status === 'completed' ? 'gold' : undefined} />
        {!self && <Pill label={coven.nameOf(person)} />}
      </Pills>
      {!!program.summary && <Text style={type.body}>{program.summary}</Text>}
      <Text style={type.caption}>
        Begun {date(enrollment.started_at)} · {s.approved} of {s.required} tasks done · {mentor ? `mentor: ${coven.nameOf(mentor)}` : 'no mentor yet'}
        {award ? ` · finishing it makes ${self ? 'you' : coven.nameOf(person)} ${award}` : ''}
      </Text>
      <ProgressBar percent={s.percent} />
      {enrollment.status === 'completed' && <Notice>✦ Finished {date(enrollment.completed_at)}.</Notice>}
      {enrollment.status === 'paused' && <Notice>This program is paused for now.</Notice>}
      {message && <Notice>{message}</Notice>}

      {outline.map((stage, index) => {
        const passed = passes.find((p) => p.stage_id === stage.id);
        const state = passed ? 'passed' : index === s.stageIndex && enrollment.status !== 'completed' ? 'current' : index < s.stageIndex ? 'passed' : 'later';
        return (
          <StageBlock key={`${stage.id}-${state}`} title={`Stage ${index + 1}: ${stage.title}`} state={state} passedNote={passed ? `Passed ${date(passed.passed_at)}${passed.passed_by ? ` (${coven.nameOf(passed.passed_by)})` : ''}${passed.note ? ` · “${passed.note}”` : ''}` : ''}>
            <Words text={stage.intro} />
            <Text style={type.caption}>
              {stage.min_days ? `At least ${stage.min_days} days in this stage. ` : ''}Passed when {PASSED_BY.find((p) => p.value === stage.passed_by)?.label.toLowerCase()} confirm{stage.passed_by === 'self' ? '' : 's'} it.
            </Text>
            {stage.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                row={rows.get(task.id)}
                enrollment={enrollment}
                later={state === 'later'}
                self={self}
                canSign={!!rows.get(task.id) && rows.get(task.id)!.status === 'submitted' && canCheck(task, who)}
                personName={coven.nameOf(person)}
                onChanged={changed}
              />
            ))}
            {state === 'current' && (
              <Card>
                <Text style={type.body}>
                  {s.tasksLeft ? `${s.tasksLeft} task${s.tasksLeft === 1 ? '' : 's'} still to be signed off.` : 'Every task is signed off.'}
                  {s.daysLeft ? ` At least ${s.daysLeft} more day${s.daysLeft === 1 ? '' : 's'} in this stage.` : ''}
                </Text>
                {enrollment.status === 'active' && canPass(stage, who) && (s.ready || (coven.perms.programs && !self)) && (
                  <>
                    <Field label={`A note for ${self ? 'your record' : coven.nameOf(person)} (optional)`} value={note} onChangeText={setNote} maxLength={2000} />
                    {s.ready ? (
                      <Button label={index === outline.length - 1 ? 'Confirm they’ve finished' : 'Confirm the stage is passed'} onPress={() => pass(false)} disabled={busy} />
                    ) : (
                      <Button label="Pass the stage early" variant="outline" onPress={() => pass(true)} disabled={busy} />
                    )}
                  </>
                )}
              </Card>
            )}
          </StageBlock>
        );
      })}

      <View style={styles.row}>
        {coven.perms.programs && !self && enrollment.status === 'active' && <Button label="Pause" variant="outline" onPress={() => setStatus('paused')} disabled={busy} />}
        {coven.perms.programs && !self && enrollment.status === 'paused' && <Button label="Resume" variant="outline" onPress={() => setStatus('active')} disabled={busy} />}
        {(coven.perms.programs || self) && (enrollment.status === 'active' || enrollment.status === 'paused') && (
          <Button label={self ? 'Step away from this program' : 'Withdraw them'} variant="text" onPress={() => setStatus('withdrawn')} disabled={busy} />
        )}
      </View>
      {!!program.description && (
        <Section label="About this program">
          <Words text={program.description} />
        </Section>
      )}
    </CovenScreen>
  );
}

function StageBlock({ title, state, passedNote, children }: { title: string; state: 'passed' | 'current' | 'later'; passedNote: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(state === 'current');
  return (
    <View style={[styles.stage, state === 'current' && styles.stageNow]}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((v) => !v)} style={styles.stageHead}>
        <Text style={[type.cardTitle, styles.flex]}>{title}</Text>
        {state === 'current' ? <Pill label="Now" tone="gold" /> : <Text style={type.caption}>{state === 'passed' ? '✓' : 'Later'}</Text>}
      </Pressable>
      {!!passedNote && <Text style={type.caption}>{passedNote}</Text>}
      {open && <View style={styles.stageBody}>{children}</View>}
    </View>
  );
}

function TaskRow({
  task,
  row,
  enrollment,
  later,
  self,
  canSign,
  personName,
  onChanged,
}: {
  task: ProgramTask;
  row: TaskProgress | undefined;
  enrollment: Enrollment;
  later: boolean;
  self: boolean;
  canSign: boolean;
  personName: string;
  onChanged: () => Promise<void>;
}) {
  const coven = useCoven();
  const [response, setResponse] = useState(row?.response ?? '');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const st = taskState(task, row);
  const holiday = holidayName(task.holiday);
  const canWork = self && enrollment.status === 'active' && !later && st.state !== 'approved' && st.state !== 'submitted' && coven.standing.ok;

  const run = async (work: () => Promise<unknown>) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      await onChanged();
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  return (
    <View style={styles.task} accessibilityLabel={`${task.title}. ${kindLabel(task.kind)}. ${st.label}.`}>
      <View style={styles.taskHead}>
        <View style={[styles.mark, st.state === 'approved' && styles.markDone, st.state === 'returned' && styles.markBack]}>
          <Text style={[styles.markText, st.state === 'approved' && styles.markTextDone]}>{st.state === 'approved' ? '✓' : st.state === 'submitted' ? '…' : '○'}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.taskTitle}>
            {task.title}
            {task.optional ? ' (optional)' : ''}
          </Text>
          <Text style={type.caption}>
            {kindLabel(task.kind)}
            {task.times > 1 ? ` · ${task.times} times` : ''}
            {task.minutes ? ` · about ${task.minutes} min` : ''}
            {holiday ? ` · ${holiday}` : ''} · signed off by {checkedByLabel(task.checked_by).toLowerCase()} · {st.label}
          </Text>
        </View>
      </View>
      {!later && <Words text={task.instructions} />}
      {!later && !!task.resources && <Text style={type.caption}>Resources: {task.resources}</Text>}
      {!!row?.response && !canWork && (
        <View style={styles.response}>
          <Text style={type.caption}>{self ? 'What you wrote' : `What ${personName} wrote`}</Text>
          <Words text={row.response} />
        </View>
      )}
      {!!row?.feedback && (
        <Text style={styles.feedback}>
          {row.status === 'returned' ? 'Sent back' : 'Note'}
          {row.checked_by ? ` from ${coven.nameOf(row.checked_by)}` : ''}: {row.feedback}
        </Text>
      )}
      {canWork && (
        <>
          {task.response === 'text' && <Field label="Your response" value={response} onChangeText={setResponse} multiline maxLength={8000} />}
          <View style={styles.row}>
            <Button
              label={task.times > 1 ? `Log one (${st.done + 1} of ${task.times})` : task.checked_by === 'self' ? 'Mark done' : 'Send for sign-off'}
              onPress={() => void run(() => api.recordTask(enrollment.id, task.id, response, 1))}
              disabled={busy}
            />
            {task.response === 'text' && <Button label="Save without sending" variant="outline" onPress={() => void run(() => api.recordTask(enrollment.id, task.id, response, 0))} disabled={busy} />}
          </View>
        </>
      )}
      {canSign && row && (
        <>
          <Field label={`Note to ${personName} (optional)`} value={feedback} onChangeText={setFeedback} multiline maxLength={2000} />
          <View style={styles.row}>
            <Button label="Sign it off" onPress={() => void run(() => api.checkTask(row.id, true, feedback))} disabled={busy} />
            <Button label="Send back" variant="outline" onPress={() => void run(() => api.checkTask(row.id, false, feedback))} disabled={busy} />
          </View>
        </>
      )}
      {message && <Notice>{message}</Notice>}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  flex: { flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stage: { borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.card, padding: 14, gap: 8 },
  stageNow: { borderColor: colors.gold, backgroundColor: 'rgba(185,160,93,0.06)' },
  stageHead: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 36 },
  stageBody: { gap: 10 },
  task: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline, paddingTop: 10, gap: 8 },
  taskHead: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  taskTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
  mark: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(226,195,109,0.6)', alignItems: 'center', justifyContent: 'center' },
  markDone: { backgroundColor: colors.gold, borderColor: colors.gold },
  markBack: { borderColor: 'rgba(243,160,110,0.8)' },
  markText: { color: colors.gold, fontFamily: fonts.bodySemi, fontSize: 13 },
  markTextDone: { color: colors.forestInk },
  response: { borderLeftWidth: 2, borderLeftColor: colors.hairline, paddingLeft: 10, gap: 4 },
  feedback: { fontFamily: fonts.body, fontSize: 14, color: '#f3d9a8' },
});
