import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Card, Field, MoreScreen, Notice, Paragraphs, Section } from '../../../../../components/more/ui';
import { sendReply, useMessages, useMySubmissions } from '../../../../../lib/community/api';
import { communityDate, paragraphs, senderLabel, statusLabel, typeLabel } from '../../../../../lib/community/model';
import { useSession } from '../../../../../lib/session';
import { colors, radius, type } from '../../../../../theme';

export default function SubmissionThread() {
  const { submissionId } = useLocalSearchParams<{ submissionId: string }>();
  const { session } = useSession();
  const { data: mine, status: mineStatus } = useMySubmissions();
  const { data: messages, status, refresh } = useMessages(submissionId);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const submission = mine?.find((row) => row.id === submissionId) ?? null;

  if (!session) {
    return (
      <MoreScreen title="My submissions" back="/more/community/mine" backLabel="Back to My submissions">
        <Card>
          <Text style={type.body}>Sign in to read replies to your offerings.</Text>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </Card>
      </MoreScreen>
    );
  }

  if (!submission) {
    return (
      <MoreScreen title="My submissions" back="/more/community/mine" backLabel="Back to My submissions">
        {!mine && mineStatus !== 'offline' ? (
          <ActivityIndicator color={colors.gold} />
        ) : (
          <Text style={type.body}>This submission couldn't be found.</Text>
        )}
      </MoreScreen>
    );
  }

  const send = async () => {
    if (!reply.trim()) {
      setNotice('Write a reply first.');
      return;
    }
    setSending(true);
    setNotice(null);
    try {
      await sendReply(submission.id, session.user.id, reply);
      setReply('');
      setNotice('Reply sent.');
      await refresh();
    } catch {
      setNotice('Reply could not be sent. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <MoreScreen
      title={submission.title}
      eyebrow={`${typeLabel(submission.submission_type)} · ${statusLabel(submission.status)}`}
      back="/more/community/mine"
      backLabel="Back to My submissions"
    >
      <Text style={type.caption}>Offered {communityDate(submission.created_at)}</Text>
      <Paragraphs items={paragraphs(submission.body)} style={styles.body} />

      <Section label="Response from Salt & Sovereignty">
        {submission.reviewer_response ? (
          <Card tone="gold">
            <Paragraphs items={paragraphs(submission.reviewer_response)} />
          </Card>
        ) : (
          <Text style={type.caption}>No response has been added yet.</Text>
        )}
      </Section>

      <Section label="Conversation">
        {!messages && status !== 'offline' && <ActivityIndicator color={colors.gold} />}
        {status === 'offline' && <Notice>Offline · replies may be out of date</Notice>}
        {messages?.length === 0 && <Text style={type.caption}>No messages yet.</Text>}
        {messages?.map((message) => {
          const fromUs = message.sender_role !== 'admin';
          return (
            <View
              key={message.id}
              accessible
              accessibilityLabel={`${senderLabel(message)}: ${message.message}`}
              style={[styles.bubble, fromUs ? styles.mine : styles.theirs]}
            >
              <Text style={type.eyebrow}>
                {[senderLabel(message), communityDate(message.created_at)].filter(Boolean).join(' · ')}
              </Text>
              <Paragraphs items={paragraphs(message.message)} />
            </View>
          );
        })}
      </Section>

      <Field label="Reply or ask a question" value={reply} onChangeText={setReply} multiline />
      {!!notice && <Notice>{notice}</Notice>}
      <Button label={sending ? 'Sending…' : 'Send reply'} variant="outline" disabled={sending} onPress={send} />
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.cream, fontSize: 16, lineHeight: 25 },
  bubble: { borderRadius: radius.tile, padding: 14, gap: 6, borderWidth: 1 },
  mine: { backgroundColor: colors.surface, borderColor: colors.hairline, marginLeft: 24 },
  theirs: { backgroundColor: colors.surfaceRaised, borderColor: colors.goldLine, marginRight: 24 },
});
