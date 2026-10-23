import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../../components/Button';
import { CovenScreen } from '../../../../../../../components/covens/CovenScreen';
import { CheckRow, Chips, Field, Notice } from '../../../../../../../components/more/ui';
import * as api from '../../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../../lib/covens/CovenContext';
import { DOCUMENT_KINDS, errorMessage, type CovenDocument, type DocumentKind } from '../../../../../../../lib/covens/model';
import { type } from '../../../../../../../theme';

const WHO = [
  { value: 'public', label: 'Everyone, before they join' },
  { value: 'members', label: 'Members only' },
] as const;

export default function ManagePage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const coven = useCoven();
  const docs = coven.snapshot?.documents ?? [];
  const doc = docs.find((d) => d.id === id) ?? null;
  const ready = !!coven.snapshot && (id === 'new' || !!doc);
  return (
    <CovenScreen title={doc ? doc.title : 'Add a page'} need="manage">
      {ready ? <PageForm key={doc?.id ?? 'new'} doc={doc} nextPosition={(docs.length + 1) * 10} /> : <Text style={type.caption}>This page couldn’t be found.</Text>}
    </CovenScreen>
  );
}

function PageForm({ doc, nextPosition }: { doc: CovenDocument | null; nextPosition: number }) {
  const coven = useCoven();
  const [title, setTitle] = useState(doc?.title ?? '');
  const [kind, setKind] = useState<DocumentKind>((doc?.kind as DocumentKind) ?? 'rules');
  const [body, setBody] = useState(doc?.body ?? '');
  const [visibility, setVisibility] = useState<'public' | 'members'>(doc?.visibility ?? 'public');
  const [position, setPosition] = useState(String(doc?.position ?? nextPosition));
  const [signed, setSigned] = useState(doc?.requires_signature ?? false);
  const [published, setPublished] = useState(doc?.published !== false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const covenId = coven.snapshot!.coven.id;

  const save = async () => {
    if (!title.trim()) return setMessage('Give the page a title.');
    if (signed && visibility !== 'public') return setMessage('An agreement must be readable by everyone, so seekers can sign it before they join.');
    setBusy(true);
    setMessage(null);
    try {
      await api.saveDocument({
        ...(doc ? { id: doc.id } : {}),
        coven_id: covenId,
        title: title.trim(),
        kind,
        body,
        visibility,
        position: Number(position) || 0,
        requires_signature: signed,
        published,
      });
      await coven.refresh();
      if (router.canGoBack()) router.back();
      else setMessage('Saved.');
    } catch (error) {
      setMessage(errorMessage(error));
      setBusy(false);
    }
  };

  const remove = () =>
    Alert.alert('Delete this page?', 'Its signatures go with it.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteDocument(doc!.id);
            await coven.refresh();
            if (router.canGoBack()) router.back();
          } catch (error) {
            setMessage(errorMessage(error));
          }
        },
      },
    ]);

  return (
    <>
      <Field label="Title" value={title} onChangeText={setTitle} maxLength={120} />
      <Chips label="Kind" options={DOCUMENT_KINDS} value={kind} onChange={setKind} />
      <Field label="Words" value={body} onChangeText={setBody} multiline maxLength={20000} style={styles.body} />
      <Chips label="Who can read it" options={WHO} value={visibility} onChange={setVisibility} />
      <Field label="Order (lower comes first)" value={position} onChangeText={(text) => setPosition(text.replace(/[^0-9]/g, ''))} keyboardType="number-pad" maxLength={3} />
      <CheckRow label="Members must sign this (it must be readable by everyone)" value={signed} onChange={setSigned} />
      <CheckRow label="Published" value={published} onChange={setPublished} />
      {doc?.requires_signature && <Text style={type.caption}>Version {doc.version}. Changing its title or words asks every member to sign it again before they can speak or tend the altar.</Text>}
      <View style={styles.row}>
        <Button label={busy ? 'Saving…' : doc ? 'Save' : 'Add'} onPress={save} disabled={busy} />
        {doc && <Button label="Delete" variant="text" onPress={remove} />}
      </View>
      {message && <Notice>{message}</Notice>}
    </>
  );
}

const styles = StyleSheet.create({
  body: { minHeight: 200 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
