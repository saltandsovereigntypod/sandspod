import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, CheckRow, Chips, Field, MoreScreen, Notice, Section } from '../../../../components/more/ui';
import { insertSubmission } from '../../../../lib/community/api';
import { DISPLAY_AS, OFFERING_TYPES, offeringPayload, type DisplayAs } from '../../../../lib/community/model';
import { useSession } from '../../../../lib/session';
import { getMySettings } from '../../../../lib/settings/store';
import { colors, fonts, touch, type } from '../../../../theme';

type OfferingType = (typeof OFFERING_TYPES)[number]['value'];

export default function Offer() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [submissionType, setSubmissionType] = useState<OfferingType>('community_grimoire');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [displayAs, setDisplayAs] = useState<DisplayAs>('anonymous');
  const [tags, setTags] = useState('');
  const [original, setOriginal] = useState(false);
  const [terms, setTerms] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setMessage(null);
    const settings = await getMySettings(userId);
    const result = offeringPayload(
      { submissionType, title, body, displayAs, tags, originalWorkConfirmed: original, termsAgreed: terms },
      { userId, names: settings },
    );
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setSending(true);
    try {
      await insertSubmission(result.payload);
      setSent(true);
    } catch {
      setMessage('Your offering could not be sent. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <MoreScreen title="Thank you" eyebrow="Offering received" back="/more" backLabel="Back to More">
        <Card tone="gold">
          <Text style={type.body}>
            Your offering has been received. Every submission is personally reviewed before finding its place within Salt
            &amp; Sovereignty.
          </Text>
          {userId ? (
            <Button label="See my submissions" onPress={() => router.replace('/more/community/mine')} />
          ) : (
            <Text style={type.caption}>Sign in next time to follow its review and read any replies.</Text>
          )}
          <Button
            label="Offer something else"
            variant="outline"
            onPress={() => {
              setTitle('');
              setBody('');
              setTags('');
              setOriginal(false);
              setTerms(false);
              setSent(false);
            }}
          />
        </Card>
      </MoreScreen>
    );
  }

  return (
    <MoreScreen title="Offer to the Sanctuary" eyebrow="Make an offering" back="/more" backLabel="Back to More">
      <Text style={type.body}>
        Share a ritual, story, dream, question, reflection or piece of your practice. Every offering is personally
        reviewed.
      </Text>

      <Section label="What would you like to offer?">
        <Chips label="What would you like to offer?" options={OFFERING_TYPES} value={submissionType} onChange={setSubmissionType} />
      </Section>

      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field label="Your offering" value={body} onChangeText={setBody} multiline style={styles.tall} />

      <Section label="Publish or reference as">
        <Chips label="Publish or reference as" options={DISPLAY_AS} value={displayAs} onChange={setDisplayAs} />
        {displayAs !== 'anonymous' && (
          <Text style={type.caption}>Uses the name saved in Settings → Identity.</Text>
        )}
      </Section>

      <Field
        label="Tags"
        value={tags}
        onChangeText={setTags}
        placeholder="Hekate, protection, dreamwork"
        hint="Separate tags with commas."
        autoCapitalize="none"
      />

      <View>
        <CheckRow label="This is my own work, or I have permission to share it." value={original} onChange={setOriginal} />
        <CheckRow label="I have read and agree to the Submission Terms." value={terms} onChange={setTerms}>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Read the Submission Terms"
            onPress={() => router.push('/more/community/terms')}
            style={styles.link}
          >
            <Text style={styles.linkText}>Read the Submission Terms</Text>
          </Pressable>
        </CheckRow>
      </View>

      {!userId && (
        <Text style={type.caption}>
          You're offering as a guest. Sign in to follow its review and read replies in My submissions.
        </Text>
      )}
      {!!message && <Notice>{message}</Notice>}
      <Button label={sending ? 'Sending…' : '✦ Offer to the Sanctuary'} disabled={sending} onPress={submit} />
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  tall: { minHeight: 200 },
  link: { minHeight: touch, justifyContent: 'center', alignSelf: 'flex-start' },
  linkText: { color: colors.gold, fontFamily: fonts.body, fontSize: 14, textDecorationLine: 'underline' },
});
