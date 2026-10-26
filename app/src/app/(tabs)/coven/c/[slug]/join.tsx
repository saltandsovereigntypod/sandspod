import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../components/covens/CovenScreen';
import { Words } from '../../../../../components/covens/ui';
import { Card, CheckRow, Field, Notice, Section } from '../../../../../components/more/ui';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { errorMessage, KIND_LABELS, missingAnswers } from '../../../../../lib/covens/model';
import { type } from '../../../../../theme';

// Reading and signing the coven's agreements, then joining or applying.
// Members come here too when an agreement changes and needs signing again.
export default function JoinCoven() {
  const coven = useCoven();
  const snap = coven.snapshot;
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  // Your coven name, until you type another (the profile can arrive after the screen opens).
  const [typedName, setSignedName] = useState<string | null>(null);
  const signedName = typedName ?? coven.me?.profile?.display_name ?? '';
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Back from making your profile (or anywhere else): look again, so the
  // new profile counts and the button wakes up.
  const { refresh } = coven;
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (!snap) return <CovenScreen title="Join" need="public">{null}</CovenScreen>;
  const info = snap.coven;
  const member = coven.perms.member;
  const pending = snap.application?.status === 'pending' ? snap.application : null;
  const questions = info.application_questions ?? [];
  const needsProfile = !coven.me?.profile;

  const submit = async () => {
    if (needsProfile) {
      // The profile may have been made since this screen last looked.
      const mine = coven.userId ? await api.fetchMe(coven.userId).catch(() => null) : null;
      if (!mine?.profile) return router.push('/coven/profile' as Href);
      coven.setMe(mine);
    }
    if (coven.unsigned.some((d) => !agreed[d.id])) return setMessage('Read and agree to each agreement first.');
    if (coven.unsigned.length && !signedName.trim()) return setMessage('Sign with your name.');
    if (!member && info.joining === 'application' && missingAnswers(questions, answers).length) return setMessage('Please answer the questions marked required.');
    setBusy(true);
    setMessage(null);
    try {
      for (const doc of coven.unsigned) await api.sign(doc.id, signedName.trim());
      if (!member) {
        if (info.joining === 'open') await api.join(info.id);
        else await api.apply(info.id, answers, note);
      }
      await coven.refresh();
      setMessage(member ? 'Signed. Thank you.' : info.joining === 'open' ? 'Welcome to the coven.' : 'Your application is with the coven.');
      if (member || info.joining === 'open') router.replace(covenHref(coven.slug));
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const withdraw = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await api.withdrawApplication(pending.id);
      await coven.refresh();
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  if (pending) {
    return (
      <CovenScreen title="Your application" need="public">
        <Card>
          <Text style={type.body}>Your application to {info.name} is waiting for review. You’ll see the answer here.</Text>
          {questions.map((q) => (
            <View key={q.id} style={styles.answer}>
              <Text style={type.caption}>{q.prompt}</Text>
              <Text style={type.body}>{pending.answers?.[q.id] || '—'}</Text>
            </View>
          ))}
          <Button label="Withdraw my application" variant="outline" onPress={withdraw} disabled={busy} />
        </Card>
        {message && <Notice>{message}</Notice>}
      </CovenScreen>
    );
  }

  const closed = !member && (info.joining === 'closed' || info.status !== 'active');
  return (
    <CovenScreen title={member ? 'Sign the agreements' : info.joining === 'open' ? 'Join the coven' : 'Apply to join'} need="public">
      {closed ? (
        <Card>
          <Text style={type.body}>This coven isn’t welcoming new members right now.</Text>
        </Card>
      ) : (
        <>
          {needsProfile && (
            <Card>
              <Text style={type.body}>First, make your coven profile: the name other members see, and confirming you’re 18 or older.</Text>
              <Button label="Make my profile" onPress={() => router.push('/coven/profile' as Href)} />
            </Card>
          )}
          {member && !coven.unsigned.length && <Text style={type.body}>You’ve signed everything the coven asks. Thank you.</Text>}
          {coven.unsigned.map((doc) => (
            <Section key={doc.id} label={KIND_LABELS[doc.kind] ?? 'Agreement'}>
              <Card>
                <Text style={type.cardTitle}>{doc.title}</Text>
                <Words text={doc.body} />
                <CheckRow label={`I have read and agree to “${doc.title}”`} value={!!agreed[doc.id]} onChange={(v) => setAgreed((prev) => ({ ...prev, [doc.id]: v }))} />
              </Card>
            </Section>
          ))}
          {coven.unsigned.length > 0 && <Field label="Sign with your name" value={signedName} onChangeText={setSignedName} maxLength={80} />}
          {!member && info.joining === 'application' && (
            <Section label="Your application">
              {questions.map((q) => (
                <Field
                  key={q.id}
                  label={`${q.prompt}${q.required ? ' (required)' : ''}`}
                  value={answers[q.id] ?? ''}
                  onChangeText={(text) => setAnswers((prev) => ({ ...prev, [q.id]: text }))}
                  multiline
                  maxLength={2000}
                />
              ))}
              <Field label="Anything else you’d like the coven to know (optional)" value={note} onChangeText={setNote} multiline maxLength={2000} />
            </Section>
          )}
          {(!member || coven.unsigned.length > 0) && (
            <Button
              label={busy ? 'Sending…' : member ? 'Sign' : info.joining === 'open' ? 'Sign and join' : 'Sign and apply'}
              onPress={submit}
              disabled={busy}
            />
          )}
        </>
      )}
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  answer: { gap: 2 },
});
