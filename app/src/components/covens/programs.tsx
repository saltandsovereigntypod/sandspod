// Pieces the Initiation & training screens share: a progress bar, a card for
// someone's place in a program, and the links between the views.

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { covenHref } from './CovenScreen';
import { Pill, Pills } from './ui';
import { MenuList, MenuRow } from '../more/ui';
import { useCoven } from '../../lib/covens/CovenContext';
import { ENROLLMENT_STATUS, enrollmentSummary, programOutline, type Enrollment } from '../../lib/covens/programs';
import type { ProgramData } from '../../lib/covens/usePrograms';
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
      {perms.programs && <MenuRow label="Design and assign" detail="Programs, who takes them, and mentors" icon="settings" last onPress={() => router.push(covenHref(coven.slug, 'programs/design'))} />}
    </MenuList>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 999, backgroundColor: 'rgba(244,236,216,0.1)', overflow: 'hidden', marginVertical: 4 },
  fill: { height: '100%', borderRadius: 999, backgroundColor: colors.gold },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 16, gap: 6 },
  pressed: { opacity: 0.8 },
});
