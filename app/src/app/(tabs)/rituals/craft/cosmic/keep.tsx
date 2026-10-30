import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, confirmAction, Field, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import {
  deleteAllCharts,
  keepChartsOnDevice,
  protectCharts,
  unlockCharts,
  unlockChartsWithRecovery,
  useAstro,
} from '../../../../../lib/astro/store';
import { MIN_PASSPHRASE } from '../../../../../lib/astro/vault';
import { useSession } from '../../../../../lib/session';
import { type } from '../../../../../theme';

// How birth charts are kept: encrypted on this device (the default), or
// encrypted with a passphrase and kept with the account so they follow you
// to the website and other devices. Nobody else can read them either way.
export default function KeepCharts() {
  const astro = useAstro();
  const { session } = useSession();
  const [pass, setPass] = useState('');
  const [again, setAgain] = useState('');
  const [recovery, setRecovery] = useState('');
  const [shownRecovery, setShownRecovery] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (work: () => Promise<void>) => {
    setProblem(null);
    setBusy(true);
    try {
      await work();
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'That didn’t work just now.');
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <RitualScreen back="Charts">
      <Title eyebrow="Charts">How your charts are kept</Title>
      <Body>
        A birth date, time and place are personal: together they can identify someone. So charts are encrypted on this device before they are stored,
        with the same encryption as Cycle & Moon (XChaCha20-Poly1305, with a key from your passphrase by scrypt). Charts you add for other people are kept
        the same way, and are never shared with anyone.
      </Body>

      {shownRecovery && (
        <Card accent>
          <SectionLabel>Your recovery key</SectionLabel>
          <Text selectable style={type.cardTitle}>
            {shownRecovery}
          </Text>
          <Body>Write it down and keep it somewhere safe. If you forget your passphrase, it is the only other way to open your charts. It won’t be shown again.</Body>
          <Button label="I’ve written it down" onPress={() => setShownRecovery(null)} />
        </Card>
      )}

      {astro.phase === 'locked' ? (
        <Card accent>
          <SectionLabel>Open your charts on this device</SectionLabel>
          <Field label="Passphrase" value={pass} onChange={setPass} placeholder="Your chart passphrase" />
          <Button label={busy ? (progress !== null ? `Opening… ${Math.round(progress * 100)}%` : 'Opening…') : 'Open'} disabled={busy} onPress={() => void run(() => unlockCharts(pass, setProgress))} />
          <Field label="Or your recovery key" value={recovery} onChange={setRecovery} placeholder="XXXX-XXXX-…" />
          <Button label="Open with the recovery key" variant="outline" disabled={busy} onPress={() => void run(() => unlockChartsWithRecovery(recovery))} />
        </Card>
      ) : astro.synced ? (
        <Card>
          <SectionLabel>Kept with your account</SectionLabel>
          <Body>Encrypted under your passphrase. Only the encrypted text reaches the server; nobody there can read it. Enter the passphrase once on each device.</Body>
          {astro.sync === 'unavailable' && <Notice>Keeping charts with your account isn’t ready on the server yet. They’re safe on this device meanwhile.</Notice>}
          <Button
            label="Keep them on this device only"
            variant="outline"
            disabled={busy}
            onPress={() =>
              void run(async () => {
                if (await confirmAction('Keep charts on this device only?', 'Your account’s encrypted copy is deleted. Other devices keep what they have but stop syncing.', 'Keep here only')) await keepChartsOnDevice();
              })
            }
          />
        </Card>
      ) : (
        <Card>
          <SectionLabel>On this device only</SectionLabel>
          <Body>Encrypted and kept on this phone. Nothing is sent. If you lose the phone or delete the app, they’re gone.</Body>
          {session ? (
            <>
              <Body>To have them on the website and your other devices too, choose a passphrase. It isn’t your account password, and it is never sent.</Body>
              <Field label={`Passphrase (at least ${MIN_PASSPHRASE} characters)`} value={pass} onChange={setPass} />
              <Field label="The same again" value={again} onChange={setAgain} />
              <Button
                label={busy ? (progress !== null ? `Protecting… ${Math.round(progress * 100)}%` : 'Protecting…') : 'Keep with my account'}
                disabled={busy}
                onPress={() =>
                  void run(async () => {
                    if (pass !== again) throw new Error('The two passphrases don’t match.');
                    setShownRecovery(await protectCharts(pass, setProgress));
                    setPass('');
                    setAgain('');
                  })
                }
              />
            </>
          ) : (
            <Body muted>Sign in to keep them with an account as well.</Body>
          )}
        </Card>
      )}

      {!!problem && <Notice>{problem}</Notice>}

      <View style={ui.gapSmall}>
        <SectionLabel>Delete</SectionLabel>
        <Button
          label="Delete all my charts"
          variant="text"
          disabled={busy}
          onPress={() =>
            void run(async () => {
              if (!(await confirmAction('Delete every chart?', 'All birth details are deleted from this device and from your account. This can’t be undone.', 'Delete all'))) return;
              await deleteAllCharts();
              router.replace('/rituals/craft/cosmic/charts' as Href);
            })
          }
        />
      </View>
      <Body muted>Settings like your house system and explanation level are ordinary settings, not birth details, and sync as usual.</Body>
    </RitualScreen>
  );
}
