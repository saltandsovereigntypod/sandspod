import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, CheckRow, Chips, Field, MoreScreen, Notice, Paragraphs, Section, Tags } from '../../../../components/more/ui';
import { insertSubmission, usePublished } from '../../../../lib/community/api';
import {
  authorName,
  communityDate,
  DISPLAY_NAME_MAX,
  FIELD_NOTE_MAX,
  fieldNotePayload,
  NOTE_TYPES,
  noteTypeLabel,
  notesFor,
  paragraphs,
  typeLabel,
  type SubmissionRow,
} from '../../../../lib/community/model';
import { useSession } from '../../../../lib/session';
import { colors, type } from '../../../../theme';

export default function CommunityEntry() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const { data, status } = usePublished();
  const entry = data?.entries.find((item) => item.id === entryId) ?? null;
  const notes = data ? notesFor(data.notes, entryId) : [];

  if (!entry) {
    return (
      <MoreScreen title="Community Grimoire" back="/more/community" backLabel="Back to the Community Grimoire">
        {!data && status !== 'offline' ? (
          <ActivityIndicator color={colors.gold} />
        ) : (
          <Text style={type.body}>This page couldn't be found. It may have been moved or unpublished.</Text>
        )}
      </MoreScreen>
    );
  }

  const date = communityDate(entry.updated_at || entry.created_at);
  return (
    <MoreScreen
      title={entry.title}
      eyebrow={typeLabel(entry.submission_type)}
      back="/more/community"
      backLabel="Back to the Community Grimoire"
    >
      <Text style={type.caption}>{[`Offered by ${authorName(entry)}`, date].filter(Boolean).join(' · ')}</Text>
      {(entry.tags ?? []).length > 0 && <Tags items={entry.tags ?? []} />}
      <Paragraphs items={paragraphs(entry.body)} style={styles.body} />

      <Section label="Practitioner Field Notes">
        {notes.length === 0 ? (
          <Text style={type.caption}>No Field Notes have been published for this page yet.</Text>
        ) : (
          notes.map((note) => <NoteCard key={note.id} note={note} />)
        )}
      </Section>

      <FieldNoteForm entry={entry} />
    </MoreScreen>
  );
}

function NoteCard({ note }: { note: SubmissionRow }) {
  const date = communityDate(note.created_at);
  return (
    <Card>
      <Text style={type.eyebrow}>{noteTypeLabel(note.note_type)}</Text>
      <Paragraphs items={paragraphs(note.body)} />
      <Text style={type.caption}>{[`Offered by ${authorName(note)}`, date].filter(Boolean).join(' · ')}</Text>
    </Card>
  );
}

type NoteType = (typeof NOTE_TYPES)[number]['value'];

function FieldNoteForm({ entry }: { entry: SubmissionRow }) {
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>('reflection');
  const [displayName, setDisplayName] = useState('');
  const [body, setBody] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) {
    return (
      <View style={styles.formGap}>
        {!!message && <Notice>{message}</Notice>}
        <Button label="Offer a Field Note or question" variant="outline" onPress={() => { setOpen(true); setMessage(null); }} />
      </View>
    );
  }

  const submit = async () => {
    const result = fieldNotePayload(
      { noteType, displayName, body, termsAgreed: agreed },
      { userId: session?.user.id ?? null, parent: entry },
    );
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setSending(true);
    setMessage(null);
    try {
      await insertSubmission(result.payload);
      setBody('');
      setDisplayName('');
      setAgreed(false);
      setOpen(false);
      setMessage('Your Field Note has been received and will appear here if approved.');
    } catch {
      setMessage('Your Field Note could not be sent. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <Text style={type.cardTitle}>Offer a Field Note</Text>
      <Chips label="What kind of note is this?" options={NOTE_TYPES} value={noteType} onChange={setNoteType} />
      <Field
        label="Display name (optional)"
        value={displayName}
        onChangeText={setDisplayName}
        maxLength={DISPLAY_NAME_MAX}
        placeholder="Anonymous if left blank"
      />
      <Field
        label="Your Field Note"
        value={body}
        onChangeText={setBody}
        maxLength={FIELD_NOTE_MAX}
        multiline
        placeholder="An outcome, substitution, question or reflection…"
      />
      <CheckRow label="I understand Field Notes are reviewed before appearing publicly." value={agreed} onChange={setAgreed} />
      {!!message && <Notice>{message}</Notice>}
      <Button label={sending ? 'Sending…' : 'Offer Field Note'} disabled={sending} onPress={submit} />
      <Button label="Cancel" variant="text" onPress={() => setOpen(false)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.cream, fontSize: 16, lineHeight: 25 },
  formGap: { gap: 12 },
});
