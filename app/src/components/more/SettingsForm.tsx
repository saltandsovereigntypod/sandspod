// Shared frame for a settings screen: edits a draft copy and saves it in one
// go with "Save changes", the way the website's settings form does.

import type { Href } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { useMySettings } from '../../lib/settings/store';
import type { Settings } from '../../lib/settings/defaults';
import { colors, type } from '../../theme';
import { Button } from '../Button';
import { MoreScreen, Notice } from './ui';

export function SettingsForm({
  title,
  eyebrow = 'Settings',
  back = '/more/settings',
  children,
}: {
  title: string;
  eyebrow?: string;
  back?: Href;
  children: (draft: Settings, set: <K extends keyof Settings>(key: K, value: Settings[K]) => void) => ReactNode;
}) {
  const { settings, status, save, signedIn } = useMySettings();
  const [draft, setDraft] = useState<Settings | null>(settings);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) setDraft(settings);
  }, [settings, dirty]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirty(true);
    setNotice('Unsaved changes.');
  };

  const onSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await save(draft);
      setDirty(false);
      setNotice(signedIn ? 'Settings saved to your account.' : 'Settings saved on this device.');
    } catch {
      setNotice('Settings could not be saved. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MoreScreen title={title} eyebrow={eyebrow} back={back} backLabel="Back">
      {!draft ? (
        <ActivityIndicator color={colors.gold} />
      ) : (
        <>
          {status === 'offline' && <Notice>Offline · showing the settings saved on this device</Notice>}
          {children(draft, set)}
          {!!notice && <Notice tone={dirty ? 'gold' : 'muted'}>{notice}</Notice>}
          <Button label={saving ? 'Saving…' : 'Save changes'} disabled={!dirty || saving} onPress={onSave} />
          {!signedIn && (
            <Text style={type.caption}>You're a guest, so these stay on this device. Sign in to use them everywhere.</Text>
          )}
        </>
      )}
    </MoreScreen>
  );
}
