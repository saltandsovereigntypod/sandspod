import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { EnrollmentCard, programHref, ProgramsLinks } from '../../../../../../components/covens/programs';
import { Pill, Pills, Words } from '../../../../../../components/covens/ui';
import { Card, MenuList, MenuRow, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage } from '../../../../../../lib/covens/model';
import { menteesOf, mentorOf, signsOffAsHead, waitingForMe } from '../../../../../../lib/covens/programs';
import { attemptsToScore, scoreLine } from '../../../../../../lib/covens/quiz';
import { scoreHref, threadHref } from '../../../../../../components/covens/training';

import { usePrograms } from '../../../../../../lib/covens/usePrograms';
import { colors, type } from '../../../../../../theme';

// Initiation & training: your programs, those open to you, and the people
// you mentor. Everyone's progress and Design are linked for those allowed.
export default function Programs() {
  const coven = useCoven();
  const { data, status, error, changed } = usePrograms();
  const [message, setMessage] = useState<string | null>(null);
  const me = coven.userId;
  const membership = coven.snapshot?.membership ?? null;
  const mine = data.enrollments.filter((e) => e.user_id === me && e.status !== 'withdrawn');
  const enrolled = new Set(data.enrollments.filter((e) => e.user_id === me).map((e) => e.program_id));
  const assignedToMe = (id: string) => data.assignments.some((a) => a.program_id === id && (a.user_id === me || (!!a.rank_id && a.rank_id === membership?.rank_id)));
  const open = data.programs.filter((p) => p.status === 'open' && !enrolled.has(p.id) && (p.self_enroll || assignedToMe(p.id)));
  const mentees = menteesOf(coven.mentors, me);
  const menteeEnrollments = data.enrollments.filter((e) => mentees.includes(e.user_id) && e.status !== 'withdrawn');
  const myMentor = mentorOf(coven.mentors, me);
  // Waiting for me: work to sign off, tests to score, and messages from those I oversee (the head's own work too).
  const who = { userId: me, mentees, programs: coven.perms.programs, head: signsOffAsHead(coven.perms, coven.standing.ok) };
  const toSign = waitingForMe(data.progress, data.tasks, who);
  const toScore = attemptsToScore(data.attempts, who);
  const myUnread = data.unread.filter((u) => u.trainee_id !== me);
  const taskTitle = (id: string) => data.tasks.find((t) => t.id === id)?.title ?? 'A step';
  const waitingCount = toSign.length + toScore.length + myUnread.length;

  const begin = async (programId: string) => {
    setMessage(null);
    try {
      await api.startProgram(programId);
      await changed();
      router.push(programHref(coven.slug, programId));
    } catch (e) {
      setMessage(errorMessage(e));
    }
  };

  return (
    <CovenScreen title="Initiation & training" onRefresh={changed}>
      <ProgramsLinks />
      {status === 'loading' && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {status === 'error' && <Notice>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      {status === 'ready' && (
        <>
          {waitingCount > 0 && (
            <Section label="Waiting for you">
              <MenuList>
                {toScore.map((a, i) => (
                  <MenuRow
                    key={a.id}
                    label={a.user_id === me ? `Score your own: ${a.title}` : `Score: ${coven.nameOf(a.user_id)}, ${a.title}`}
                    detail={scoreLine(a)}
                    icon="journey"
                    last={i === toScore.length - 1 && !toSign.length && !myUnread.length}
                    onPress={() => router.push(scoreHref(coven.slug, a.id))}
                  />
                ))}
                {toSign.map((p, i) => (
                  <View key={p.id}>
                    <MenuRow
                      label={p.user_id === me ? `Sign off your own: ${taskTitle(p.task_id)}` : `Sign off: ${coven.nameOf(p.user_id)}, ${taskTitle(p.task_id)}`}
                      detail={p.user_id === me ? 'Waiting for sign-off. As the coven’s head, you can sign off your own training.' : 'Waiting for sign-off'}
                      icon="journey"
                      onPress={() => router.push(`${programHref(coven.slug, p.program_id, p.user_id)}&task=${p.task_id}` as never)}
                    />
                    {p.user_id !== me && (
                      <MenuRow
                        label={`Message ${coven.nameOf(p.user_id)} about it`}
                        icon="letters"
                        last={i === toSign.length - 1 && !myUnread.length}
                        onPress={() => router.push(threadHref(coven.slug, p.enrollment_id, p.task_id))}
                      />
                    )}
                  </View>
                ))}
                {myUnread.map((u, i) => (
                  <MenuRow
                    key={`${u.enrollment_id}:${u.task_id}`}
                    label={`${coven.nameOf(u.trainee_id)}: ${taskTitle(u.task_id)}`}
                    detail={`${u.unread} new message${u.unread === 1 ? '' : 's'}`}
                    icon="letters"
                    count={u.unread}
                    last={i === myUnread.length - 1}
                    onPress={() => router.push(threadHref(coven.slug, u.enrollment_id, u.task_id))}
                  />
                ))}
              </MenuList>
            </Section>
          )}
          <Section label="Your programs">
            {!!myMentor && <Text style={type.caption}>Your mentor is {coven.nameOf(myMentor)}.</Text>}
            {mine.length ? (
              mine.map((e) => <EnrollmentCard key={e.id} enrollment={e} data={data} />)
            ) : (
              <Text style={type.caption}>
                You aren’t in any of the coven’s programs yet.
                {coven.perms.programs ? ' Design one under Design and assign.' : ' The coven’s leaders will assign one when it’s time, or you can begin one that’s open to all.'}
              </Text>
            )}
          </Section>
          {open.length > 0 && (
            <Section label="Open to you">
              {open.map((p) => (
                <Card key={p.id}>
                  <Pills>
                    <Pill label={p.kind === 'initiation' ? 'Initiation' : 'Training'} />
                  </Pills>
                  <Text style={type.cardTitle}>{p.title}</Text>
                  {!!p.summary && <Text style={type.body}>{p.summary}</Text>}
                  <Words text={p.description} />
                  <Button label="Begin" onPress={() => void begin(p.id)} disabled={!coven.standing.ok} />
                </Card>
              ))}
            </Section>
          )}
          {(mentees.length > 0 || menteeEnrollments.length > 0) && (
            <Section label="People you mentor">
              {menteeEnrollments.length ? (
                menteeEnrollments.map((e) => <EnrollmentCard key={e.id} enrollment={e} data={data} who />)
              ) : (
                <Text style={type.caption}>{mentees.map(coven.nameOf).join(', ')} {mentees.length === 1 ? 'isn’t' : 'aren’t'} in a program yet.</Text>
              )}
            </Section>
          )}
        </>
      )}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
});
