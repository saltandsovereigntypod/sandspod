// Shared frame for a settings screen. Every change saves itself a moment
// later (lib/settings/autosave.ts), with a quiet "Saved" beneath, the way
// Accessibility, Reminders and the draw screen already do; leaving the
// screen saves anything still waiting. Only the keys changed here are
// saved, onto the latest settings, so a change made elsewhere meanwhile
// (a reminder, a deity's sacred days) is kept.

import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { createAutosave, autosaveNote, type Autosave, type AutosaveState } from '../../lib/settings/autosave';
import { patchMySettings, useMySettings } from '../../lib/settings/store';
import type { Settings } from '../../lib/settings/defaults';
import { colors, type } from '../../theme';
import { Button } from '../Button';
import { MoreScreen, Notice } from './ui';

/** A `back` link passed to a settings page (`?back=/today`): only a path inside the app. */
export function safeBack(value: unknown): Href | null {
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') ? (v as Href) : null;
}

export function SettingsForm({
  title,
  eyebrow = 'Settings',
  back = '/more/settings',
  children,
  after,
}: {
  title: string;
  eyebrow?: string;
  back?: Href;
  children: (draft: Settings, set: <K extends keyof Settings>(key: K, value: Settings[K]) => void) => ReactNode;
  /** Shown below the settings, for previews that aren't settings themselves. */
  after?: (draft: Settings) => ReactNode;
}) {
  const { settings, status, signedIn } = useMySettings();
  const params = useLocalSearchParams<{ back?: string }>();
  const from = safeBack(params.back);
  const [draft, setDraft] = useState<Settings | null>(settings);
  const [state, setState] = useState<AutosaveState>('idle');
  const [auto] = useState<Autosave<Settings>>(() =>
    createAutosave<Settings>({
      save: async (changes) => {
        await patchMySettings(changes);
      },
      onState: setState,
    }),
  );

  const busy = state === 'waiting' || state === 'saving' || state === 'failed';
  useEffect(() => {
    if (!busy) setDraft(settings);
  }, [settings, busy]);

  // Leaving the screen (another tab, Back, or the app closing it) saves what's waiting.
  useFocusEffect(
    useCallback(
      () => () => {
        void auto.flush();
      },
      [auto],
    ),
  );
  useEffect(
    () => () => {
      void auto.flush();
    },
    [auto],
  );

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    auto.change(key, value);
  };

  const note = autosaveNote(state, signedIn);

  return (
    <MoreScreen
      title={title}
      eyebrow={eyebrow}
      back={from ?? back}
      backLabel="Back"
      onBack={
        from
          ? () => {
              void auto.flush();
              router.navigate(from);
            }
          : undefined
      }
    >
      {!draft ? (
        <ActivityIndicator color={colors.gold} />
      ) : (
        <>
          {status === 'offline' && <Notice>Offline · showing the settings saved on this device</Notice>}
          {children(draft, set)}
          {!!note && <Notice tone={state === 'failed' ? 'gold' : 'muted'}>{note}</Notice>}
          {state === 'failed' && <Button label="Try again" variant="outline" onPress={() => void auto.flush()} />}
          {!signedIn && (
            <Text style={type.caption}>You're a guest, so these stay on this device. Sign in to use them everywhere.</Text>
          )}
          {after?.(draft)}
        </>
      )}
    </MoreScreen>
  );
}
