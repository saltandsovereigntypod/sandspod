import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { EnrollmentCard, programHref, ProgramsLinks } from '../../../../../../components/covens/programs';
import { Pill, Pills, Words } from '../../../../../../components/covens/ui';
import { Card, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage } from '../../../../../../lib/covens/model';
import { menteesOf, mentorOf } from '../../../../../../lib/covens/programs';
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
