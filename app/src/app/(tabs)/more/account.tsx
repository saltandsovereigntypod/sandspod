import { router, type ErrorBoundaryProps } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { SignInMethods } from '../../../components/more/SignInMethods';
import { Card, Field, MenuList, MenuRow, MoreScreen, Notice, Section } from '../../../components/more/ui';
import { guestPreview } from '../../../lib/backup/migrate';
import { movingSummary, worthMoving } from '../../../lib/backup/migration';
import { useSession } from '../../../lib/session';
import {
  hasPasswordIdentity,
  MIN_PASSWORD_LENGTH,
  providerSummary,
  requestEmailChange,
  requestRecovery,
  updatePassword,
} from '../../../lib/settings/account';
import { formatLastSync, statusDetail, statusLabel } from '../../../lib/sync/status';
import { useCloudSync } from '../../../lib/sync/store';
import { colors, fonts, type } from '../../../theme';

export default function Account() {
  const { session, signOut } = useSession();
  const user = session?.user ?? null;
  const cloud = useCloudSync();
  const [guestWork, setGuestWork] = useState<string | null>(null);

  // Guest work still on this device, ready to bring into the account.
  useEffect(() => {
    let active = true;
    if (user)
      guestPreview().then((preview) => {
        if (active) setGuestWork(preview && worthMoving(preview.counts) ? movingSummary(preview.counts).join(' · ') : null);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (!user) {
    return (
      <MoreScreen title="Account" eyebrow="Guest Sanctuary" back="/more" backLabel="Back to More">
        <Card>
          <Text style={type.body}>
            Your work is kept only on this device. Sign in with your Salt &amp; Sovereignty account to open what you keep on
            the website and use it on any device.
          </Text>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </Card>
        <Text style={type.caption}>Before removing the app, save a guest backup from More → Backup and restore.</Text>
      </MoreScreen>
    );
  }

  return (
    <MoreScreen title="Account" eyebrow="Your Sanctuary account" back="/more" backLabel="Back to More">
      <Card>
        <Fact label="Signed in as" value={user.email ?? 'Current account'} />
        <Fact label="Sign-in method" value={providerSummary(user)} />
        <View accessibilityLiveRegion="polite">
          <Fact label="Cloud status" value={statusLabel(cloud.status)} />
        </View>
        <Fact label="Last successful sync" value={formatLastSync(cloud.lastSuccess)} />
        <Text style={type.caption}>
          {statusDetail(cloud.status)} Signing out doesn't delete anything; sign back in to see it again.
        </Text>
        <Button
          label="Sign out"
          variant="outline"
          onPress={async () => {
            await signOut();
            router.replace('/');
          }}
        />
      </Card>

      {!!guestWork && (
        <Section label="Guest work on this device">
          <MenuList>
            <MenuRow label="Bring it into your account" detail={guestWork} onPress={() => router.push('/more/guest-data')} last />
          </MenuList>
        </Section>
      )}

      <Section label="Ways to sign in">
        <SignInMethods user={user} />
      </Section>

      <Section label="Security">
        {hasPasswordIdentity(user) ? (
          <ChangePassword />
        ) : (
          <Card>
            <Text style={type.body}>
              This account signs in with {providerSummary(user)}, so there is no password to change here. To add one,
              choose “Add email and password” under Ways to sign in.
            </Text>
          </Card>
        )}
        <ChangeEmail currentEmail={user.email} />
        <Card>
          <Text style={type.cardTitle}>Password recovery link</Text>
          <Text style={type.caption}>We’ll email {user.email ?? 'your account address'} a link for choosing a new password.</Text>
          <RecoveryLink email={user.email ?? ''} />
        </Card>
      </Section>

      <Section label="Danger zone">
        <MenuList>
          <MenuRow
            label="Delete account"
            detail="Permanently remove your account and private data"
            onPress={() => router.push('/more/delete-account')}
            last
          />
        </MenuList>
      </Section>
    </MoreScreen>
  );
}

/** Runs an account request, showing its progress and outcome underneath. */
function useRequest() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  // A change to the account (USER_UPDATED) can arrive while a request is still
  // settling, and the screen may have closed by then: only touch it while open.
  const open = useRef(true);
  useEffect(
    () => () => {
      open.current = false;
    },
    [],
  );
  const run = async (pending: string, request: () => Promise<string>, onError?: () => void) => {
    setBusy(true);
    setStatus(pending);
    let outcome: string;
    try {
      outcome = await request();
    } catch (error) {
      try {
        onError?.();
      } catch {
        // Clearing the fields is a nicety; never let it end the request.
      }
      outcome = error instanceof Error && error.message ? error.message : 'That account change could not be completed. Please try again.';
    }
    if (!open.current) return;
    setStatus(outcome);
    setBusy(false);
  };
  return { busy, status, run };
}

function ChangePassword() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const { busy, status, run } = useRequest();
  const clear = () => {
    setPassword('');
    setConfirmation('');
  };

  return (
    <Card>
      <Text style={type.cardTitle}>Change password</Text>
      <Field
        label="New password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
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
      <Button
        label={busy ? 'One moment…' : 'Change password'}
        disabled={busy || !password}
        onPress={() =>
          run(
            'Updating your password…',
            async () => {
              await updatePassword(password, confirmation);
              clear();
              return 'Your password has been changed.';
            },
            clear,
          )
        }
      />
    </Card>
  );
}

function ChangeEmail({ currentEmail }: { currentEmail?: string | null }) {
  const [email, setEmail] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const { busy, status, run } = useRequest();

  return (
    <Card>
      <Text style={type.cardTitle}>Change email</Text>
      <Text style={type.caption}>Current email: {currentEmail ?? 'Unavailable'}</Text>
      <Field
        label="New email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <Field
        label="Confirm new email"
        value={confirmation}
        onChangeText={setConfirmation}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <Text style={type.caption}>
        We’ll send a confirmation email, and you may need to confirm at both your old and new addresses. Your account
        email changes only once that’s done.
      </Text>
      {!!status && <Notice>{status}</Notice>}
      <Button
        label={busy ? 'One moment…' : 'Request email change'}
        disabled={busy || !email}
        onPress={() =>
          run('Requesting your email change…', async () => {
            await requestEmailChange(currentEmail, email, confirmation);
            setEmail('');
            setConfirmation('');
            return 'Your request was sent. Check your email: the account email will update after the required confirmations.';
          })
        }
      />
    </Card>
  );
}

function RecoveryLink({ email }: { email: string }) {
  const { busy, status, run } = useRequest();
  return (
    <>
      {!!status && <Notice>{status}</Notice>}
      <Button
        label={busy ? 'One moment…' : 'Send recovery link'}
        variant="outline"
        disabled={busy || !email}
        onPress={() => run('Sending a recovery link…', () => requestRecovery(email))}
      />
    </>
  );
}

/**
 * If anything on this screen fails to draw (say, an account change arriving
 * mid-update), show a calm way back instead of closing the app.
 */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <MoreScreen title="Account" eyebrow="Your Sanctuary account" back="/more" backLabel="Back to More">
      <Card>
        <Text style={type.body}>
          This screen didn’t open properly. Your account and your work are safe; nothing was lost.
        </Text>
        <Button label="Try again" onPress={() => void retry()} />
      </Card>
    </MoreScreen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={type.eyebrow}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fact: { gap: 2 },
  value: { fontFamily: fonts.body, fontSize: 16, color: colors.cream },
});
