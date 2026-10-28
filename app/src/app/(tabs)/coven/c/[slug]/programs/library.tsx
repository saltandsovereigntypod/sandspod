import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Field, MenuList, MenuRow, Notice, Section } from '../../../../../../components/more/ui';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { readingTime } from '../../../../../../lib/covens/lesson';
import { maxPoints } from '../../../../../../lib/covens/quiz';
import { fileLabel, tasksUsing } from '../../../../../../lib/covens/training';
import { usePrograms } from '../../../../../../lib/covens/usePrograms';
import { colors, type } from '../../../../../../theme';

// The coven's lessons and tests: those copied in from ready-made courses
// (the coven's own copies, to change as it likes) and those it writes.
export default function Library() {
  const coven = useCoven();
  const { data, status, error, changed } = usePrograms();
  const [q, setQ] = useState('');
  const find = q.trim().toLowerCase();
  const docs = data.docs.filter((d) => !find || d.title.toLowerCase().includes(find) || (d.summary ?? '').toLowerCase().includes(find));
  const quizzes = data.quizzes.filter((x) => !find || x.title.toLowerCase().includes(find)).sort((a, b) => a.title.localeCompare(b.title));
  const usedOn = (n: number) => (n ? `on ${n} step${n === 1 ? '' : 's'}` : 'on no step yet');

  return (
    <CovenScreen title="Lessons and tests" onRefresh={changed}>
      {!coven.perms.programs && <Text style={type.body}>Only those the coven’s head has chosen write its lessons and tests.</Text>}
      {status === 'loading' && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {status === 'error' && <Notice>{error}</Notice>}
      {coven.perms.programs && status === 'ready' && (
        <>
          <Text style={type.body}>Lessons teach a step; a test checks what was learned. Change any of them: every program that uses one shows your changes.</Text>
          <Field label="Find a lesson or test" value={q} onChangeText={setQ} autoCapitalize="none" />
          <Section label={`Lessons (${data.docs.length})`}>
            <Button label="Write a lesson" onPress={() => router.push(covenHref(coven.slug, 'programs/lesson-edit'))} />
            {!docs.length && <Text style={type.caption}>{data.docs.length ? 'None match.' : 'No lessons yet. Copy a ready-made program, or write your own.'}</Text>}
            {docs.length > 0 && (
              <MenuList>
                {docs.slice(0, 200).map((d, i) => (
                  <MenuRow
                    key={d.id}
                    label={d.title}
                    detail={[readingTime(d), usedOn(tasksUsing(d.id, data.links).length), d.file_path ? fileLabel(d) : '', d.source_id ? 'ready-made' : 'the coven’s own'].filter(Boolean).join(' · ')}
                    icon="library"
                    last={i === Math.min(docs.length, 200) - 1}
                    onPress={() => router.push(`${covenHref(coven.slug, 'programs/lesson-edit')}?id=${d.id}` as never)}
                  />
                ))}
              </MenuList>
            )}
          </Section>
          <Section label={`Tests (${data.quizzes.length})`}>
            <Button label="Write a test" variant="outline" onPress={() => router.push(covenHref(coven.slug, 'programs/quiz-edit'))} />
            {quizzes.length > 0 && (
              <MenuList>
                {quizzes.map((x, i) => (
                  <MenuRow
                    key={x.id}
                    label={x.title}
                    detail={`${x.questions.length} questions · ${maxPoints(x.questions)} points · ${x.pass_percent}% to pass · ${usedOn(data.tasks.filter((t) => t.quiz_id === x.id).length)}`}
                    icon="journey"
                    last={i === quizzes.length - 1}
                    onPress={() => router.push(`${covenHref(coven.slug, 'programs/quiz-edit')}?id=${x.id}` as never)}
                  />
                ))}
              </MenuList>
            )}
          </Section>
        </>
      )}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
});
