import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { LessonView } from '../../../../../../components/covens/Lesson';
import { Card, Chips, Field, Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { readingTime } from '../../../../../../lib/covens/lesson';
import { lessonFileBytes, pickLessonFile } from '../../../../../../lib/covens/lessonFile';
import { errorMessage } from '../../../../../../lib/covens/model';
import { emptyDoc, fileLabel, tasksUsing, validateDoc, type DraftDoc } from '../../../../../../lib/covens/training';
import { usePrograms } from '../../../../../../lib/covens/usePrograms';
import { colors, type } from '../../../../../../theme';

const HOW = `Headings start with ## (or ###). Leave a blank line between paragraphs. Lists: "- " for bullets, "1. " for steps. **Bold** and *italic*. A line starting with "> **Safety:**", "> **Try this:**", "> **Note:**" or "> **Your coven:**" makes a box. "---" draws a line.`;

// Writing or changing one of the coven's lessons: its words (in the lessons'
// simple Markdown, with a preview), its reading time, and a PDF or picture.
export default function LessonEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const coven = useCoven();
  const { data, status, changed } = usePrograms();
  const existing = id ? data.docs.find((d) => d.id === id) : undefined;
  if (status === 'loading') {
    return (
      <CovenScreen title="Lesson">
        <ActivityIndicator color={colors.gold} style={styles.loading} />
      </CovenScreen>
    );
  }
  if (!coven.perms.programs) {
    return (
      <CovenScreen title="Lesson">
        <Text style={type.body}>Only those the coven’s head has chosen write its lessons.</Text>
      </CovenScreen>
    );
  }
  if (id && !existing) {
    return (
      <CovenScreen title="Lesson">
        <Text style={type.body}>That lesson was not found.</Text>
      </CovenScreen>
    );
  }
  return (
    <Editor
      key={id ?? 'new'}
      id={id ?? null}
      start={existing ? { title: existing.title, summary: existing.summary ?? '', minutes: existing.minutes, body: existing.body, file_path: existing.file_path, file_name: existing.file_name, file_type: existing.file_type } : emptyDoc()}
      used={id ? tasksUsing(id, data.links).length : 0}
      source={existing?.source_id ?? null}
      onSaved={changed}
    />
  );
}

function Editor({ id, start, used, source, onSaved }: { id: string | null; start: DraftDoc; used: number; source: string | null; onSaved: () => Promise<void> }) {
  const coven = useCoven();
  const covenId = coven.snapshot!.coven.id;
  const [doc, setDoc] = useState<DraftDoc>(start);
  const [view, setView] = useState<'write' | 'preview'>('write');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const set = (next: Partial<DraftDoc>) => setDoc((d) => ({ ...d, ...next }));

  const attach = async () => {
    setMessage(null);
    try {
      const picked = await pickLessonFile();
      if (!picked) return;
      setBusy(true);
      const uploaded = await api.uploadLessonFile(covenId, await lessonFileBytes(picked), picked.type, picked.name);
      set(uploaded);
      setMessage('File added. Save the lesson to keep it.');
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };
  const save = async () => {
    const errors = validateDoc(doc);
    if (errors.length) return setMessage(errors.join(' '));
    setBusy(true);
    setMessage(null);
    try {
      await api.saveDoc(covenId, id, doc);
      await onSaved();
      if (router.canGoBack()) router.back();
      else setMessage('Saved.');
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };
  const remove = () => {
    const go = async () => {
      setBusy(true);
      try {
        await api.deleteDoc(id!);
        await onSaved();
        if (router.canGoBack()) router.back();
      } catch (e) {
        setMessage(errorMessage(e));
        setBusy(false);
      }
    };
    const words = used ? `It comes off the ${used} step${used === 1 ? '' : 's'} it’s on, and who has read it is forgotten.` : 'It isn’t on any step.';
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`Delete this lesson? ${words}`)) void go();
      return;
    }
    Alert.alert('Delete this lesson?', words, [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void go() },
    ]);
  };

  return (
    <CovenScreen title={id ? 'Edit the lesson' : 'A new lesson'}>
      {!!source && <Notice>Copied from a ready-made course. This is the coven’s own copy: change it as you like.</Notice>}
      {used > 1 && <Text style={type.caption}>On {used} steps. Changes show on all of them.</Text>}
      <Field label="Title" value={doc.title} onChangeText={(title) => set({ title })} maxLength={160} />
      <Field label="What it teaches, in a sentence or two" value={doc.summary} onChangeText={(summary) => set({ summary })} multiline maxLength={600} />
      <Field
        label="About how long to read and try (minutes)"
        value={doc.minutes === null ? '' : String(doc.minutes)}
        onChangeText={(v) => set({ minutes: v.replace(/[^0-9]/g, '') === '' ? null : Number(v.replace(/[^0-9]/g, '')) })}
        keyboardType="number-pad"
        maxLength={3}
        hint={`Left empty: ${readingTime({ minutes: null, body: doc.body }).toLowerCase()}, from its length.`}
      />
      <Chips
        label="Show"
        options={[
          { value: 'write', label: 'Write' },
          { value: 'preview', label: 'Preview' },
        ]}
        value={view}
        onChange={setView}
      />
      {view === 'write' ? (
        <Field label="The lesson" value={doc.body} onChangeText={(body) => set({ body })} multiline maxLength={60000} style={styles.body} hint={HOW} />
      ) : (
        <Card>
          <LessonView body={doc.body || '*Nothing written yet.*'} />
        </Card>
      )}
      <Card>
        <Text style={type.eyebrow}>A file (optional)</Text>
        <Text style={type.caption}>A PDF or a picture, up to 15 MB. Only the coven’s members can open it.</Text>
        {doc.file_path ? (
          <View style={styles.row}>
            <Text style={[type.body, styles.flex]}>{fileLabel(doc)}</Text>
            <Button label="Remove the file" variant="text" onPress={() => set({ file_path: null, file_name: null, file_type: null })} />
          </View>
        ) : (
          <Button label="Add a PDF or picture" variant="outline" onPress={() => void attach()} disabled={busy} />
        )}
      </Card>
      <View style={styles.row}>
        <Button label={busy ? 'Saving…' : 'Save the lesson'} onPress={() => void save()} disabled={busy} />
        {id && <Button label="Delete" variant="text" onPress={remove} disabled={busy} />}
      </View>
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  flex: { flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  body: { minHeight: 320 },
});
