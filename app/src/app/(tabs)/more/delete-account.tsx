import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Card, Field, MoreScreen, Notice, Section } from '../../../components/more/ui';
import { exportBackup } from '../../../lib/backup/run';
import { useSession } from '../../../lib/session';
import {
  ACCOUNT_DELETION_ENABLED,
  DELETE_CONFIRMATION,
  deletePhraseMatches,
  forgetAccountOnDevice,
  isRecentSignIn,
  RECENT_SIGN_IN_MINUTES,
  requestAccountDeletion,
} from '../../../lib/settings/account';
import { colors, fonts, type } from '../../../theme';

const WHAT_HAPPENS = [
  'Your settings, altars, Book of Shadows, Living Library, Apothecary, rituals and uploaded images are deleted.',
  'Offerings that were never published, and your messages about them, are deleted.',
  'Published Community Grimoire pages stay, but your name and account are removed from them.',
  'Your sign-in is deleted last. This can’t be undone, and the account works on neither the app nor the website afterwards.',
];

export default function DeleteAccount() {
  const { session, signOut } = useSession();
  const user = session?.user ?? null;
  const [backedUp, setBackedUp] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (!user) {
    return (
      <MoreScreen title="Delete account" back="/more/account" backLabel="Back to Account">
        <Card>
          <Text style={type.body}>Sign in to the account you want to delete.</Text>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </Card>
      </MoreScreen>
    );
  }

  const recent = isRecentSignIn(user);
  const ready = ACCOUNT_DELETION_ENABLED && backedUp && recent && deletePhraseMatches(phrase);

  const backup = async () => {
    setBusy(true);
    const result = await exportBackup(user.id, setStatus, 'complete');
    setBusy(false);
    setBackedUp(result.ok);
    setStatus(result.ok ? 'Backup saved. Keep it somewhere private.' : result.message);
  };

  const reauthenticate = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  const remove = async () => {
    if (!ready) return;
    setBusy(true);
    setStatus('Deleting your account…');
    const result = await requestAccountDeletion();
    if (result.ok) {
      await forgetAccountOnDevice(user.id);
      await signOut().catch(() => {});
      router.replace('/');
      return;
    }
    setBusy(false);
    setStatus(result.message);
  };

  return (
    <MoreScreen title="Delete account" eyebrow="Danger zone" back="/more/account" backLabel="Back to Account">
      <Card>
        <Text style={type.cardTitle}>What happens</Text>
        {WHAT_HAPPENS.map((line) => (
          <Text key={line} style={type.body}>
            • {line}
          </Text>
        ))}
      </Card>

      {!ACCOUNT_DELETION_ENABLED && (
        <Card tone="gold">
          <Text style={type.body}>
            Account deletion isn't switched on yet: the secure deletion service is still being set up. Nothing can be
            deleted from here for now.
          </Text>
        </Card>
      )}

      <Section label="1 · Save a complete backup">
        <Button
          label={backedUp ? 'Backup saved ✓' : 'Save complete backup'}
          variant={backedUp ? 'outline' : 'primary'}
          disabled={busy}
          onPress={backup}
        />
      </Section>

      <Section label="2 · Confirm it's you">
        {recent ? (
          <Text style={type.caption}>You signed in recently. ✓</Text>
        ) : (
          <View style={styles.gap}>
            <Text style={type.caption}>
              For your safety, sign in again (within {RECENT_SIGN_IN_MINUTES} minutes) before deleting your account.
            </Text>
            <Button label="Sign in again" variant="outline" onPress={reauthenticate} />
          </View>
        )}
      </Section>

      <Section label="3 · Type the phrase">
        <Text style={styles.phrase} selectable>
          {DELETE_CONFIRMATION}
        </Text>
        <Field
          label="Confirmation phrase"
          value={phrase}
          onChangeText={setPhrase}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
        />
      </Section>

      {!!status && <Notice>{status}</Notice>}
      <Button
        label={busy ? 'Please wait…' : 'Delete my account forever'}
        disabled={!ready || busy}
        onPress={remove}
        style={styles.danger}
        accessibilityHint="Permanently deletes your Salt and Sovereignty account"
      />
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 10 },
  phrase: { fontFamily: fonts.bodySemi, fontSize: 14, letterSpacing: 0.5, color: colors.cream },
  danger: { backgroundColor: '#c9745f' },
});
