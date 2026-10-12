import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useSession } from '../lib/session';
import { MIN_PASSWORD_LENGTH, updatePassword } from '../lib/settings/account';
import { type } from '../theme';
import { Button } from './Button';
import { Card, Field, MoreScreen, Notice } from './more/ui';

/**
 * Shown over everything after a password recovery link signs someone in, so
 * they can choose a new password before carrying on (the website's
 * /account/reset-password/ page).
 */
export function PasswordRecovery() {
  const { finishPasswordRecovery } = useSession();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setStatus('Updating your password…');
    try {
      await updatePassword(password, confirmation);
      finishPasswordRecovery();
    } catch (error) {
      setPassword('');
      setConfirmation('');
      setStatus(error instanceof Error ? error.message : 'Your password could not be changed.');
      setBusy(false);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <MoreScreen title="Choose a new password" eyebrow="Password recovery">
        <Card>
          <Text style={type.body}>
            You opened a password recovery link. Choose a new password of at least {MIN_PASSWORD_LENGTH} characters.
          </Text>
          <Field
            label="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <Field
            label="Confirm new password"
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
          {!!status && <Notice>{status}</Notice>}
          <Button label={busy ? 'One moment…' : 'Save new password'} disabled={busy || !password} onPress={save} />
          <Button label="Not now" variant="text" disabled={busy} onPress={finishPasswordRecovery} />
        </Card>
      </MoreScreen>
    </View>
  );
}
