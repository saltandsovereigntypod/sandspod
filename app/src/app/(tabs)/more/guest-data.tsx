import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { Button } from '../../../components/Button';
import { Card, MoreScreen, Notice, Section } from '../../../components/more/ui';
import { useAltars } from '../../../lib/altar/store';
import { dismiss, guestPreview, moveGuestData, type MoveResult } from '../../../lib/backup/migrate';
import { movingSummary, worthMoving, type Preview } from '../../../lib/backup/migration';
import { exportBackup } from '../../../lib/backup/run';
import { useRituals } from '../../../lib/rituals/store';
import { useSession } from '../../../lib/session';
import { colors, type } from '../../../theme';

// The website's "Guest Sanctuary Found" card (js/guest-account-migration-ui.js):
// what this device still holds from before signing in, and moving it into
// the account.
export default function GuestData() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const userRef = useRef(userId);
  useEffect(() => {
    userRef.current = userId;
  }, [userId]);
  const altars = useAltars();
  const rituals = useRituals();
  const [preview, setPreview] = useState<Preview | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<MoveResult | null>(null);

  useEffect(() => {
    let active = true;
    guestPreview().then((next) => active && setPreview(next));
    return () => {
      active = false;
    };
  }, [result]);

  const ritualCount = rituals.deviceCount;
  const lines = preview ? movingSummary(preview.counts) : [];
  if (ritualCount) lines.push(`${ritualCount} ${ritualCount === 1 ? 'ritual record' : 'ritual records'}`);
  const anything = (!!preview && worthMoving(preview.counts)) || ritualCount > 0;
  const notes = (preview?.unsupported ?? []).filter((note) => !/Book of Shadows/.test(note));

  const saveBackup = async () => {
    setBusy(true);
    const saved = await exportBackup(null, setStatus, 'guest');
    setStatus(saved.ok ? 'Guest backup saved. You can bring your work over now.' : saved.message);
    setBusy(false);
  };

  const move = async () => {
    if (!userId) return;
    setBusy(true);
    setStatus('Preparing your migration…');
    const outcome = await moveGuestData(userId, () => userRef.current, setStatus);
    if (outcome.ok) await altars.refresh();
    setResult(outcome);
    setStatus(null);
    setBusy(false);
  };

  if (!userId) {
    return (
      <MoreScreen title="Guest work" eyebrow="Account & Data" back="/more/account" backLabel="Back to Account">
        <Card>
          <Text style={type.body}>Sign in to bring the work you kept on this device as a guest into your account.</Text>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </Card>
      </MoreScreen>
    );
  }

  return (
    <MoreScreen title="Guest work" eyebrow="Account & Data" back="/more/account" backLabel="Back to Account">
      {result && (
        <Card tone={result.ok ? 'gold' : undefined}>
          <Text style={type.cardTitle}>{result.ok ? 'Migration complete' : 'Nothing was lost'}</Text>
          <Text style={type.body}>{result.message}</Text>
          {result.notes.map((note) => (
            <Text key={note} style={type.caption}>
              {note}
            </Text>
          ))}
          {result.ok && <Button label="Done" variant="outline" onPress={() => router.replace('/more/account')} />}
        </Card>
      )}

      {preview === undefined ? (
        <ActivityIndicator color={colors.gold} />
      ) : !anything ? (
        !result?.ok && (
          <Card>
            <Text style={type.body}>There’s no guest work on this device to bring over.</Text>
          </Card>
        )
      ) : (
        <>
          <Card>
            <Text style={type.cardTitle}>This device still holds guest work</Text>
            <Text style={type.body}>
              You kept this on the phone before signing in. Bring it into your account to see it on the website and your
              other devices.
            </Text>
            {lines.map((line) => (
              <Text key={line} style={type.body}>
                {`·  ${line}`}
              </Text>
            ))}
            <Text style={type.caption}>
              Anything your account already has is kept as it is. Once everything is safely in your account, the guest
              copy is cleared from this device; if anything goes wrong, it stays here untouched.
            </Text>
          </Card>

          {notes.length > 0 && (
            <Section label="Worth knowing">
              {notes.map((note) => (
                <Notice key={note} tone="muted">
                  {note}
                </Notice>
              ))}
            </Section>
          )}

          {!!status && <Notice>{status}</Notice>}
          {busy ? (
            <ActivityIndicator color={colors.gold} />
          ) : (
            <>
              <Button label="Bring it into my account" onPress={move} />
              <Button label="Save a guest backup first" variant="outline" onPress={saveBackup} />
              <Button
                label="Don’t ask again"
                variant="text"
                onPress={async () => {
                  if (preview) await dismiss(userId, preview.fingerprint);
                  router.back();
                }}
              />
            </>
          )}
        </>
      )}
    </MoreScreen>
  );
}
