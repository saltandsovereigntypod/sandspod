import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { programHref } from '../../../../../../components/covens/programs';
import { Field, Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage } from '../../../../../../lib/covens/model';
import { mentorOf } from '../../../../../../lib/covens/programs';
import { authorRole, threadWith, type ProgramMessage } from '../../../../../../lib/covens/training';
import { usePrograms } from '../../../../../../lib/covens/usePrograms';
import { colors, fonts, radius, type } from '../../../../../../theme';

const when = (value: string) => new Date(value).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

// The conversation on one step of someone's program: between them and those
// who oversee their training (their mentor, those who manage programs, the
// coven's head). No one else in the coven reads it.
export default function StepThread() {
  const { e: enrollmentId, t: taskId } = useLocalSearchParams<{ e: string; t: string }>();
  const coven = useCoven();
  const { data, status } = usePrograms();
  const [messages, setMessages] = useState<ProgramMessage[] | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { loadNames, refreshPrograms } = coven;
  const enrollment = data.enrollments.find((x) => x.id === enrollmentId);
  const task = data.tasks.find((x) => x.id === taskId);

  const [nonce, setNonce] = useState(0);
  const load = useCallback(async () => setNonce((n) => n + 1), []);
  useEffect(() => {
    if (!enrollmentId || !taskId) return;
    let live = true;
    api
      .fetchProgramMessages(enrollmentId, taskId)
      .then(async (list) => {
        if (!live) return;
        setMessages(list);
        void loadNames(list.map((m) => m.author_id).filter((id): id is string => !!id));
        await api.readProgramThread(enrollmentId, taskId);
        void refreshPrograms();
      })
      .catch((e) => {
        if (!live) return;
        setMessages([]);
        setMessage(errorMessage(e));
      });
    return () => {
      live = false;
    };
  }, [enrollmentId, taskId, nonce, loadNames, refreshPrograms]);
  useEffect(() => {
    if (!enrollmentId) return;
    return api.listenProgramThread(enrollmentId, () => setNonce((n) => n + 1));
  }, [enrollmentId]);

  if (status === 'loading' || messages === null) {
    return (
      <CovenScreen title="Conversation">
        <ActivityIndicator color={colors.gold} style={styles.loading} />
      </CovenScreen>
    );
  }
  if (!enrollment || !task) {
    return (
      <CovenScreen title="Conversation">
        <Text style={type.body}>This conversation is between someone in training and those who oversee them, and isn’t yours to read.</Text>
      </CovenScreen>
    );
  }
  const self = enrollment.user_id === coven.userId;
  const mentor = mentorOf(coven.mentors, enrollment.user_id);
  const headId = coven.snapshot?.coven.founder_id ?? null;

  const send = async () => {
    if (!draft.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      await api.postProgramMessage(enrollment.id, task.id, draft);
      setDraft('');
      await load();
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };
  const remove = async (id: string) => {
    try {
      await api.removeProgramMessage(id);
      await load();
    } catch (e) {
      setMessage(errorMessage(e));
    }
  };

  return (
    <CovenScreen title={task.title} eyebrow="Conversation" scrollKey={`${enrollment.id}:${task.id}`}>
      <Text style={type.caption}>With {threadWith({ self, mentorName: mentor ? coven.nameOf(mentor) : null, traineeName: coven.nameOf(enrollment.user_id) })}. No one else in the coven reads it.</Text>
      {!messages.length && <Text style={type.body}>{self ? 'Ask a question, say what you found hard, or share what you noticed. It stays with this step.' : 'Nothing written here yet.'}</Text>}
      {messages.map((m) => {
        const mine = m.author_id === coven.userId;
        const role = authorRole(m.author_id, { traineeId: enrollment.user_id, mentorId: mentor, headId });
        return (
          <View key={m.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
            <Text style={type.caption}>
              {m.author_id ? (mine ? 'You' : coven.nameOf(m.author_id)) : 'Someone'}
              {role ? ` · ${role}` : ''} · {when(m.created_at)}
            </Text>
            {m.deleted_at ? <Text style={[type.body, styles.removed]}>Removed</Text> : <Text style={type.body}>{m.body}</Text>}
            {mine && !m.deleted_at && <Button label="Remove" variant="text" onPress={() => void remove(m.id)} />}
          </View>
        );
      })}
      <Field label={self ? 'Write to your mentor and the coven’s leaders' : `Write to ${coven.nameOf(enrollment.user_id)}`} value={draft} onChangeText={setDraft} multiline maxLength={4000} />
      <View style={styles.row}>
        <Button label={busy ? 'Sending…' : 'Send'} onPress={() => void send()} disabled={busy || !draft.trim()} />
        <Button label="Back to the step" variant="outline" onPress={() => router.push(`${programHref(coven.slug, enrollment.program_id, self ? null : enrollment.user_id)}${self ? '?' : '&'}task=${task.id}` as never)} />
      </View>
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bubble: { borderRadius: radius.tile, padding: 12, gap: 4, maxWidth: '92%' },
  mine: { alignSelf: 'flex-end', backgroundColor: 'rgba(226,195,109,0.12)' },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline },
  removed: { fontFamily: fonts.body, fontStyle: 'italic', color: colors.muted },
});
