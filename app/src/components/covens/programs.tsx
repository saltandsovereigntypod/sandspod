// Pieces the Initiation & training screens share: a progress bar, a card for
// someone's place in a program, and the links between the views.

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { covenHref } from './CovenScreen';
import { scoreHref } from './training';
import { Pill, Pills } from './ui';
import { MenuList, MenuRow, Section } from '../more/ui';
import { useCoven } from '../../lib/covens/CovenContext';
import { ENROLLMENT_STATUS, enrollmentSummary, menteesOf, programOutline, signsOffAsHead, trainingToSignOff, type Enrollment } from '../../lib/covens/programs';
import { attemptsToScore, scoreLine } from '../../lib/covens/quiz';
import { unreadIn } from '../../lib/covens/training';
import { usePrograms, type ProgramData } from '../../lib/covens/usePrograms';
import { colors, radius, type } from '../../theme';

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percent }} accessibilityLabel={`${percent}% done`}>
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  );
}

export const programHref = (slug: string, programId: string, person?: string | null) =>
  covenHref(slug, `programs/${programId}${person ? `?person=${encodeURIComponent(person)}` : ''}`);

export function EnrollmentCard({ enrollment, data, who }: { enrollment: Enrollment; data: ProgramData; who?: boolean }) {
  const coven = useCoven();
  const program = data.programs.find((p) => p.id === enrollment.program_id);
  if (!program) return null;
  const s = enrollmentSummary(enrollment, programOutline(program.id, data.stages, data.tasks), data.progress);
  const stageLine =
    enrollment.status === 'completed'
      ? `Finished ${enrollment.completed_at ? new Date(enrollment.completed_at).toLocaleDateString() : ''}`
      : s.stage
        ? `Stage ${s.stageIndex + 1} of ${s.stageCount}: ${s.stage.title}`
        : '';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${who ? `${coven.nameOf(enrollment.user_id)}, ` : ''}${program.title}. ${stageLine}. ${s.percent}% done.`}
      onPress={() => router.push(programHref(coven.slug, program.id, who ? enrollment.user_id : null))}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Pills>
        {who && <Pill label={coven.nameOf(enrollment.user_id)} />}
        <Pill label={program.kind === 'initiation' ? 'Initiation' : 'Training'} />
        {enrollment.status !== 'active' && <Pill label={ENROLLMENT_STATUS[enrollment.status]} />}
        {s.waiting > 0 && <Pill label={`${s.waiting} waiting for sign-off`} tone="gold" />}
        {s.ready && <Pill label="Ready to pass the stage" tone="gold" />}
        {unreadIn(data.unread, enrollment.id) > 0 && <Pill label={`${unreadIn(data.unread, enrollment.id)} new message${unreadIn(data.unread, enrollment.id) === 1 ? '' : 's'}`} tone="gold" />}
      </Pills>
      <Text style={type.cardTitle}>{program.title}</Text>
      {!!stageLine && (
        <Text style={type.caption}>
          {stageLine}
          {s.daysLeft && enrollment.status === 'active' ? ` · at least ${s.daysLeft} more day${s.daysLeft === 1 ? '' : 's'}` : ''}
        </Text>
      )}
      <ProgressBar percent={s.percent} />
      {!who && s.next && enrollment.status === 'active' && <Text style={type.caption}>Next: {s.next.title}</Text>}
    </Pressable>
  );
}

/** Everyone's progress and Design, for those allowed. */
export function ProgramsLinks() {
  const coven = useCoven();
  const { perms } = coven;
  if (!perms.progress && !perms.programs) return null;
  return (
    <MenuList>
      {perms.progress && (
        <MenuRow label="Everyone’s progress" detail="Where each person is, and who mentors them" icon="journey" last={!perms.programs} onPress={() => router.push(covenHref(coven.slug, 'programs/people'))} />
      )}
      {perms.programs && <MenuRow label="Design and assign" detail="Programs, who takes them, and mentors" icon="settings" onPress={() => router.push(covenHref(coven.slug, 'programs/design'))} />}
      {perms.programs && <MenuRow label="Lessons and tests" detail="What the programs teach, and the tests that check it" icon="library" last onPress={() => router.push(covenHref(coven.slug, 'programs/library'))} />}
    </MenuList>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 999, backgroundColor: 'rgba(244,236,216,0.1)', overflow: 'hidden', marginVertical: 4 },
  fill: { height: '100%', borderRadius: 999, backgroundColor: colors.gold },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 16, gap: 6 },
  pressed: { opacity: 0.8 },
});

/**
 * Training to sign off, for the top of Review: work sent for sign-off,
 * stages ready to pass and written answers to score, for those this person
 * may sign off (the head's own too). Each opens the right place.
 */
export function TrainingToSignOff() {
  const coven = useCoven();
  const { data, status } = usePrograms();
  const me = coven.userId;
  const head = signsOffAsHead(coven.perms, coven.standing.ok);
  const who = { userId: me, mentees: menteesOf(coven.mentors, me), programs: coven.perms.programs, head };
  const { tasks, stages } = trainingToSignOff(data, who);
  const attempts = attemptsToScore(data.attempts, who);
  const person = (id: string) => (id === me ? 'You' : coven.nameOf(id));
  const program = (id: string) => data.programs.find((p) => p.id === id)?.title ?? 'A program';
  const taskTitle = (id: string) => data.tasks.find((t) => t.id === id)?.title ?? 'A step';
  const total = tasks.length + stages.length + attempts.length;
  if (status !== 'ready') return null;
  return (
    <Section label="Training to sign off">
      {!total && <Text style={type.caption}>Nothing is waiting for sign-off. You can also sign off any step from someone’s path: Members, then their name, then Training.</Text>}
      {head && <Text style={type.caption}>You’re the coven’s head, so you can sign off anyone’s training, your own included.</Text>}
      {total > 0 && (
        <MenuList>
          {tasks.map((p, i) => (
            <MenuRow
              key={p.id}
              label={`Sign off: ${person(p.user_id)}, ${taskTitle(p.task_id)}`}
              detail={`${program(p.program_id)} · sent for sign-off`}
              icon="journey"
              last={i === tasks.length - 1 && !stages.length && !attempts.length}
              onPress={() => router.push(`${programHref(coven.slug, p.program_id, p.user_id)}${p.user_id ? '&' : '?'}task=${p.task_id}` as never)}
            />
          ))}
          {stages.map(({ enrollment, stage, last: final }, i) => (
            <MenuRow
              key={`${enrollment.id}-${stage.id}`}
              label={`${final ? 'Confirm they’ve finished' : 'Pass the stage'}: ${person(enrollment.user_id)}, ${stage.title}`}
              detail={`${program(enrollment.program_id)} · every task signed off`}
              icon="journey"
              last={i === stages.length - 1 && !attempts.length}
              onPress={() => router.push(programHref(coven.slug, enrollment.program_id, enrollment.user_id) as never)}
            />
          ))}
          {attempts.map((a, i) => (
            <MenuRow
              key={a.id}
              label={`Score: ${person(a.user_id)}, ${a.title}`}
              detail={`Written answers · ${scoreLine(a)}`}
              icon="journey"
              last={i === attempts.length - 1}
              onPress={() => router.push(scoreHref(coven.slug, a.id))}
            />
          ))}
        </MenuList>
      )}
    </Section>
  );
}
