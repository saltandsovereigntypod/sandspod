import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { EnrollmentCard } from '../../../../../../components/covens/programs';
import { Chips, Notice } from '../../../../../../components/more/ui';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { mentorOf } from '../../../../../../lib/covens/programs';
import { usePrograms } from '../../../../../../lib/covens/usePrograms';
import { colors, type } from '../../../../../../theme';

// Everyone's progress, for those the coven's head allows (and program managers).
export default function People() {
  const coven = useCoven();
  const { data, status, error, changed } = usePrograms();
  const [filter, setFilter] = useState('all');
  const programs = data.programs.filter((p) => p.status !== 'draft');
  const list = data.enrollments
    .filter((e) => e.status !== 'withdrawn' && (filter === 'all' || e.program_id === filter))
    .sort((a, b) => coven.nameOf(a.user_id).localeCompare(coven.nameOf(b.user_id)));

  return (
    <CovenScreen title="Everyone’s progress" onRefresh={changed}>
      {!coven.perms.progress && <Text style={type.body}>Only those the coven’s head allows see everyone’s progress.</Text>}
      {status === 'loading' && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {status === 'error' && <Notice>{error}</Notice>}
      {coven.perms.progress && status === 'ready' && (
        <>
          {programs.length > 1 && <Chips label="Program" options={[{ value: 'all', label: 'All' }, ...programs.map((p) => ({ value: p.id, label: p.title }))]} value={filter} onChange={setFilter} />}
          {!list.length && <Text style={type.caption}>No one is in {filter === 'all' ? 'a program' : 'this program'} yet.</Text>}
          {list.map((e) => (
            <React.Fragment key={e.id}>
              <EnrollmentCard enrollment={e} data={data} who />
              <Text style={[type.caption, styles.mentor]}>{mentorOf(coven.mentors, e.user_id) ? `Mentor: ${coven.nameOf(mentorOf(coven.mentors, e.user_id))}` : 'No mentor yet'}</Text>
            </React.Fragment>
          ))}
        </>
      )}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  mentor: { marginTop: -6, marginLeft: 6 },
});
