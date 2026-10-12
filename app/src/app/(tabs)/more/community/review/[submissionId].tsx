import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Card, Field, MoreScreen, Notice, Paragraphs, Section, Tags } from '../../../../../components/more/ui';
import {
  markRepliesRead,
  saveModeratorNotes,
  sendAdminMessage,
  setReviewStatus,
  useIsReviewer,
  useMessages,
  useReview,
} from '../../../../../lib/community/api';
import {
  authorName,
  communityDate,
  noteTypeLabel,
  paragraphs,
  REVIEW_ACTIONS,
  statusLabel,
  typeLabel,
  type ReviewAction,
} from '../../../../../lib/community/model';
import { useSession } from '../../../../../lib/session';
import { colors, radius, type } from '../../../../../theme';

const DONE: Record<ReviewAction, string> = {
  approved: 'Approved.',
  needs_revision: 'Moved to Needs revision.',
  published: 'Published. It now appears in the Community Grimoire.',
  rejected: 'Rejected.',
  archived: 'Moved to Archived.',
};

// One submission in the review inbox: the writing, status buttons, private
// moderator notes and the conversation with the person who offered it.
export default function ReviewSubmission() {
  const { submissionId } = useLocalSearchParams<{ submissionId: string }>();
  const { session } = useSession();
  const isReviewer = useIsReviewer();
  const { data, status, refresh } = useReview();
  const { data: messages, status: messagesStatus, refresh: refreshMessages } = useMessages(isReviewer ? submissionId : undefined);
  const row = data?.submissions.find((item) => item.id === submissionId) ?? null;

  const [notes, setNotes] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Opening a submission marks the submitter's replies as read, as on the website.
  useEffect(() => {
    if (!isReviewer || !submissionId || !data?.unread.bySubmission[submissionId]) return;
    markRepliesRead(submissionId).then(refresh, () => {});
  }, [isReviewer, submissionId, data, refresh]);

  if (!isReviewer || !session) {
    return (
      <MoreScreen title="Review submissions" back="/more" backLabel="Back to More">
        <Text style={type.body}>Only Salt & Sovereignty reviewers can open this page.</Text>
      </MoreScreen>
    );
  }

  if (!row) {
    return (
      <MoreScreen title="Review submissions" back="/more/community/review" backLabel="Back to the review inbox">
        {!data && status !== 'offline' ? <ActivityIndicator color={colors.gold} /> : <Text style={type.body}>This submission couldn’t be found.</Text>}
      </MoreScreen>
    );
  }

  const currentNotes = notes ?? row.moderator_notes ?? '';
  const parent = row.parent_submission_id ? data?.submissions.find((item) => item.id === row.parent_submission_id) : null;
  const folder = row.admin_folder === 'archived' ? 'Archived' : statusLabel(row.status);

  const run = async (work: () => Promise<void>, done: string, failed: string) => {
    setBusy(true);
    setNotice(null);
    try {
      await work();
      setNotice(done);
      await refresh();
    } catch {
      setNotice(failed);
    } finally {
      setBusy(false);
    }
  };

  const act = (action: ReviewAction) =>
    run(() => setReviewStatus(row.id, action, currentNotes), DONE[action], 'That didn’t save. Check your connection and try again.');

  const send = () =>
    run(
      async () => {
        await sendAdminMessage(row.id, session.user.id, reply);
        setReply('');
        await refreshMessages();
      },
      'Message sent. They’ll see it in My submissions.',
      reply.trim() ? 'The message couldn’t be sent. Check your connection and try again.' : 'Write a message first.',
    );

  return (
    <MoreScreen
      title={row.title}
      eyebrow={`${typeLabel(row.submission_type)} · ${folder}`}
      back="/more/community/review"
      backLabel="Back to the review inbox"
    >
      <Text style={type.caption}>
        {[
          `Offered by ${authorName(row)}${row.anonymous ? '' : row.display_as ? ` (${row.display_as.replace('_', ' ')})` : ''}`,
          communityDate(row.created_at),
          row.user_id ? 'signed in' : 'guest',
        ].join(' · ')}
      </Text>
      {row.submission_type === 'community_note' && (
        <Text style={type.caption}>
          {noteTypeLabel(row.note_type)} on “{parent?.title ?? 'a Community Grimoire page'}”
        </Text>
      )}
      {(row.tags ?? []).length > 0 && <Tags items={row.tags ?? []} />}
      <Paragraphs items={paragraphs(row.body)} style={styles.body} />

      <Section label="Decision">
        <View style={styles.actions}>
          {REVIEW_ACTIONS.map((action) => {
            const current = action.value === 'archived' ? row.admin_folder === 'archived' : row.status === action.value && row.admin_folder !== 'archived';
            return (
              <Button
                key={action.value}
                label={action.label}
                variant={action.value === 'published' ? 'primary' : 'outline'}
                disabled={busy || current}
                onPress={() => void act(action.value)}
                style={styles.action}
              />
            );
          })}
        </View>
        {!!notice && <Notice>{notice}</Notice>}
      </Section>

      <Section label="Private moderator notes">
        <Field label="Not shown to the submitter" value={currentNotes} onChangeText={setNotes} multiline />
        <Button
          label="Save notes"
          variant="outline"
          disabled={busy || notes === null}
          onPress={() => void run(() => saveModeratorNotes(row.id, currentNotes), 'Notes saved.', 'Notes couldn’t be saved.')}
        />
      </Section>

      <Section label="Conversation">
        {!messages && messagesStatus !== 'offline' && <ActivityIndicator color={colors.gold} />}
        {messages?.length === 0 && <Text style={type.caption}>No conversation yet.</Text>}
        {messages?.map((message) => {
          const fromUs = message.sender_role === 'admin';
          return (
            <View
              key={message.id}
              accessible
              accessibilityLabel={`${fromUs ? 'Salt & Sovereignty' : authorName(row)}: ${message.message}`}
              style={[styles.bubble, fromUs ? styles.ours : styles.theirs]}
            >
              <Text style={type.eyebrow}>
                {[fromUs ? 'Salt & Sovereignty' : authorName(row), communityDate(message.created_at)].filter(Boolean).join(' · ')}
              </Text>
              <Paragraphs items={paragraphs(message.message)} />
            </View>
          );
        })}
        {row.user_id ? (
          <>
            <Field label="Message visible to the submitter" value={reply} onChangeText={setReply} multiline />
            <Button label={busy ? 'Sending…' : 'Send message'} disabled={busy} onPress={() => void send()} />
          </>
        ) : (
          <Card>
            <Text style={type.caption}>This was offered as a guest, so there’s no account to message.</Text>
          </Card>
        )}
      </Section>
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.cream, fontSize: 16, lineHeight: 25 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { flexGrow: 1, flexBasis: 140 },
  bubble: { borderRadius: radius.tile, padding: 14, gap: 6, borderWidth: 1 },
  ours: { backgroundColor: colors.surfaceRaised, borderColor: colors.goldLine, marginLeft: 24 },
  theirs: { backgroundColor: colors.surface, borderColor: colors.hairline, marginRight: 24 },
});
