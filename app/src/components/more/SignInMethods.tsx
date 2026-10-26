// "Ways to sign in" on More → Account: every sign-in that opens this one
// account, with ways to add Apple, Google, or an email and password, and to
// remove any but the last. The website has the same in Account & Data.

import type { User, UserIdentity } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { appleSignInAvailable } from '../../lib/appleSignIn';
import { validatePasswordPair, MIN_PASSWORD_LENGTH } from '../../lib/settings/accountRules';
import {
  canRemove,
  linkedMessage,
  linkErrorMessage,
  passwordAddedMessage,
  providerName,
  signInRows,
  unlinkedMessage,
  unlinkErrorMessage,
  waysToAdd,
  type SignInProvider,
} from '../../lib/settings/signInMethods';
import { addPassword, addWay, loadIdentities, removeWay } from '../../lib/settings/signIns';
import { colors, fonts, type } from '../../theme';
import { Button } from '../Button';
import { Card, Field, Notice } from './ui';

export function SignInMethods({ user }: { user: User }) {
  const [identities, setIdentities] = useState<UserIdentity[]>(user.identities ?? []);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [addingPassword, setAddingPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const refresh = useCallback(async () => {
    try {
      const next = await loadIdentities();
      setIdentities(next);
      return next;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    appleSignInAvailable().then(setAppleAvailable);
  }, []);

  // A new session (after adding or removing one) carries the new list.
  const identityCount = user.identities?.length;
  const passwordFlag = user.user_metadata?.password_sign_in;
  useEffect(() => {
    let active = true;
    loadIdentities()
      .then((next) => {
        if (active) setIdentities(next);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [identityCount, passwordFlag]);

  const rows = signInRows(identities, user);
  const toAdd = waysToAdd(rows, { apple: appleAvailable, google: true, email: !!user.email });

  async function add(provider: Exclude<SignInProvider, 'email'>) {
    setBusy(true);
    setConfirming(null);
    setStatus(`Opening ${providerName(provider)}…`);
    try {
      const result = await addWay(provider);
      if (result === 'redirecting') return; // The web page is leaving for the provider.
      if (result === 'cancelled') setStatus(null);
      else {
        await refresh();
        setStatus(linkedMessage(provider));
      }
    } catch (error) {
      // A code the auth-callback screen used first still links it; check before saying it failed.
      const next = await refresh();
      setStatus(next?.some((identity) => identity.provider === provider) ? linkedMessage(provider) : linkErrorMessage(error, provider));
    }
    setBusy(false);
  }

  async function remove(identity: UserIdentity) {
    setBusy(true);
    setStatus(`Removing ${providerName(identity.provider)}…`);
    try {
      await removeWay(identity);
      await refresh();
      setStatus(unlinkedMessage(identity.provider));
    } catch (error) {
      setStatus(unlinkErrorMessage(error, identity.provider));
    }
    setConfirming(null);
    setBusy(false);
  }

  async function savePassword() {
    const validation = validatePasswordPair(password, confirmation);
    if (!validation.valid) {
      setStatus(validation.message);
      return;
    }
    setBusy(true);
    setStatus('Adding your password…');
    try {
      await addPassword(password, confirmation);
      setAddingPassword(false);
      setStatus(passwordAddedMessage(user.email ?? ''));
    } catch (error) {
      setStatus(linkErrorMessage(error, 'email'));
    }
    setPassword('');
    setConfirmation('');
    setBusy(false);
  }

  return (
    <Card>
      <Text style={type.caption}>
        Each of these opens this same account, in the app and on the website. Add another so you can always find your
        way back in.
      </Text>

      {rows.map((row) => {
        const identity = row.identity as UserIdentity | null;
        const removable = !!identity && row.removable && canRemove(identities, identity);
        return (
          <View key={row.key} style={styles.row}>
            <View style={styles.rowText} accessible accessibilityLabel={[row.label, row.detail].filter(Boolean).join(', ')}>
              <Text style={styles.label}>{row.label}</Text>
              {!!row.detail && <Text style={type.caption}>{row.detail}</Text>}
            </View>
            {removable && confirming !== row.key && (
              <Button
                label="Remove"
                variant="text"
                disabled={busy}
                onPress={() => setConfirming(row.key)}
                accessibilityHint={`Stops ${row.label} opening this account`}
              />
            )}
            {removable && confirming === row.key && (
              <View style={styles.confirm}>
                <Text style={type.caption}>Remove {row.label}?</Text>
                <View style={styles.buttons}>
                  <Button label="Keep it" variant="text" disabled={busy} onPress={() => setConfirming(null)} />
                  <Button label="Yes, remove" variant="outline" disabled={busy} onPress={() => void remove(identity)} />
                </View>
              </View>
            )}
          </View>
        );
      })}
      {rows.length === 1 && (
        <Text style={type.caption}>This is your only way to sign in, so it can’t be removed until you add another.</Text>
      )}

      {!!status && <Notice>{status}</Notice>}

      {toAdd.includes('apple') && (
        <Button label="Add Apple" variant="outline" disabled={busy} onPress={() => void add('apple')} />
      )}
      {toAdd.includes('google') && (
        <Button label="Add Google" variant="outline" disabled={busy} onPress={() => void add('google')} />
      )}
      {toAdd.includes('email') && !addingPassword && (
        <Button
          label="Add email and password"
          variant="outline"
          disabled={busy}
          onPress={() => {
            setStatus(null);
            setAddingPassword(true);
          }}
        />
      )}
      {toAdd.includes('email') && addingPassword && (
        <View style={styles.form}>
          <Text style={type.caption}>
            Choose a password to use with {user.email}. You’ll still be able to sign in the way you do now.
          </Text>
          <Field
            label="Password"
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <Field
            label="Confirm password"
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <View style={styles.buttons}>
            <Button
              label="Cancel"
              variant="text"
              disabled={busy}
              onPress={() => {
                setAddingPassword(false);
                setPassword('');
                setConfirmation('');
              }}
            />
            <Button label={busy ? 'One moment…' : 'Add password'} disabled={busy || !password} onPress={() => void savePassword()} />
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6, paddingVertical: 4 },
  rowText: { gap: 2, flexShrink: 1, minWidth: 160 },
  label: { fontFamily: fonts.body, fontSize: 16, color: colors.cream },
  confirm: { gap: 4 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  form: { gap: 12 },
});
