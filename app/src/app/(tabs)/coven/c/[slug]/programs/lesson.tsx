import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen, covenHref } from '../../../../../../components/covens/CovenScreen';
import { LessonView } from '../../../../../../components/covens/Lesson';
import { threadHref } from '../../../../../../components/covens/training';
import { Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { readingTime } from '../../../../../../lib/covens/lesson';
import { errorMessage } from '../../../../../../lib/covens/model';
import { docsForTask, fileLabel, isImage, isRead } from '../../../../../../lib/covens/training';
import { usePrograms } from '../../../../../../lib/covens/usePrograms';
import { colors, radius, type } from '../../../../../../theme';

// The lesson reader: a lesson's words (and its file, if it has one), how long
// it takes, "Mark as read", and the way on to the next lesson of the step.
export default function LessonReader() {
  const { doc: docId, e: enrollmentId, t: taskId } = useLocalSearchParams<{ doc: string; e?: string; t?: string }>();
  const coven = useCoven();
  const { data, status, reload } = usePrograms();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [picture, setPicture] = useState<{ path: string; url: string } | null>(null);
  const doc = data.docs.find((d) => d.id === docId);
  const enrollment = enrollmentId ? data.enrollments.find((e) => e.id === enrollmentId) : undefined;
  const reader = enrollment?.user_id ?? coven.userId;
  const self = reader === coven.userId;
  const read = !!doc && isRead(data.reads, reader, doc.id);
  const siblings = taskId ? docsForTask(taskId, data.links, data.docs) : [];
  const at = siblings.findIndex((d) => d.id === docId);
  const next = at >= 0 ? siblings[at + 1] : undefined;

  const path = doc?.file_path && isImage(doc.file_type) ? doc.file_path : null;
  useEffect(() => {
    if (!path) return;
    let live = true;
    api
      .lessonFileUrl(path)
      .then((url) => live && setPicture({ path, url }))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [path]);
  const fileUrl = picture && picture.path === path ? picture.url : null;

  if (status === 'loading') {
    return (
      <CovenScreen title="Lesson">
        <ActivityIndicator color={colors.gold} style={styles.loading} />
      </CovenScreen>
    );
  }
  if (!doc) {
    return (
      <CovenScreen title="Lesson">
        <Text style={type.body}>That lesson isn’t here any more. The coven may have changed it.</Text>
      </CovenScreen>
    );
  }

  const mark = async (on: boolean) => {
    setBusy(true);
    setMessage(null);
    try {
      await api.markDocRead(doc.id, on);
      await reload();
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };
  const openFile = async () => {
    try {
      await WebBrowser.openBrowserAsync(await api.lessonFileUrl(doc.file_path!));
    } catch (e) {
      setMessage(errorMessage(e));
    }
  };

  return (
    <CovenScreen title={doc.title} scrollKey={doc.id}>
      <Text style={type.caption}>
        {readingTime(doc)}
        {read ? (self ? ' · You’ve read this' : ` · ${coven.nameOf(reader ?? '')} has read this`) : ''}
        {siblings.length > 1 && at >= 0 ? ` · Lesson ${at + 1} of ${siblings.length}` : ''}
      </Text>
      {!!doc.summary && <Text style={[type.body, styles.summary]}>{doc.summary}</Text>}
      {!!doc.file_path && (
        <View style={styles.file}>
          {fileUrl && <Image source={{ uri: fileUrl }} style={styles.image} resizeMode="contain" accessibilityLabel={doc.file_name ?? doc.title} />}
          <Button label={`Open ${fileLabel(doc)}`} variant="outline" onPress={() => void openFile()} />
        </View>
      )}
      <LessonView body={doc.body} />
      {message && <Notice>{message}</Notice>}
      <View style={styles.row}>
        {self && (read ? <Button label="Mark as not read" variant="text" onPress={() => void mark(false)} disabled={busy} /> : <Button label="Mark as read" onPress={() => void mark(true)} disabled={busy} />)}
        {next && <Button label={`Next: ${next.title}`} variant={read || !self ? 'primary' : 'outline'} onPress={() => router.replace(`${covenHref(coven.slug, 'programs/lesson')}?doc=${next.id}&e=${enrollmentId ?? ''}&t=${taskId ?? ''}` as never)} />}
        {enrollment && taskId && <Button label="Ask about this lesson" variant="outline" onPress={() => router.push(threadHref(coven.slug, enrollment.id, taskId))} />}
      </View>
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  summary: { fontStyle: 'italic' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  file: { gap: 8 },
  image: { width: '100%', height: 320, borderRadius: radius.tile, backgroundColor: colors.surface },
});
