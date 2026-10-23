import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, CheckRow, Field, MoreScreen, Notice } from '../../../../components/more/ui';
import { WEBSITE_ORIGIN } from '../../../../lib/altar/assetPaths';
import * as api from '../../../../lib/covens/api';
import { errorMessage } from '../../../../lib/covens/model';
import { useSession } from '../../../../lib/session';
import { colors, type } from '../../../../theme';

// Your coven profile: the name other members see (never your email), and,
// the first time, that you're 18 or older and agree to the guidelines.
export default function CovenProfile() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [me, setMe] = useState<api.Me | null>(null);
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [bio, setBio] = useState('');
  const [adult, setAdult] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    api
      .fetchMe(userId)
      .then((next) => {
        setMe(next);
        setName(next.profile?.display_name ?? '');
        setPronouns(next.profile?.pronouns ?? '');
        setBio(next.profile?.bio ?? '');
      })
      .catch((error) => setMessage(errorMessage(error)));
  }, [userId]);

  if (!session) {
    return (
      <MoreScreen title="Coven profile" back={'/more/covens' as Href} backLabel="Back to Covens">
        <Card>
          <Text style={type.body}>Sign in to make your coven profile.</Text>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </Card>
      </MoreScreen>
    );
  }

  const existing = !!me?.profile;
  const save = async () => {
    if (!name.trim()) return setMessage('Choose the name other members will see.');
    if (!existing && (!adult || !agreed)) return setMessage('Covens are for adults who agree to the community guidelines.');
    setSaving(true);
    setMessage(null);
    try {
      const profile = await api.saveProfile(userId!, { display_name: name, pronouns, bio }, existing);
      setMe((prev) => (prev ? { ...prev, profile } : prev));
      setMessage('Saved.');
      if (!existing && router.canGoBack()) router.back();
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setSaving(false);
  };

  return (
    <MoreScreen title="Coven profile" eyebrow="Covens" back={'/more/covens' as Href} backLabel="Back to Covens">
      {!me && !message && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {me && (
        <>
          <Text style={type.body}>This is how you appear in covens. Members see this name, not your email.</Text>
          <Field label="Name in covens" value={name} onChangeText={setName} maxLength={60} />
          <Field label="Pronouns (optional)" value={pronouns} onChangeText={setPronouns} maxLength={40} />
          <Field label="A little about you (optional)" value={bio} onChangeText={setBio} multiline maxLength={600} />
          {!existing && (
            <Card>
              <CheckRow label="I am 18 or older" value={adult} onChange={setAdult} />
              <CheckRow label="I’ve read and agree to the coven guidelines" value={agreed} onChange={setAgreed}>
                <Text style={[type.caption, styles.link]} onPress={() => void WebBrowser.openBrowserAsync(`${WEBSITE_ORIGIN}/covens/guidelines/`)}>
                  Read the guidelines
                </Text>
              </CheckRow>
            </Card>
          )}
          <Button label={saving ? 'Saving…' : existing ? 'Save' : 'Make my profile'} onPress={save} disabled={saving} />
        </>
      )}
      {message && <Notice>{message}</Notice>}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 30 },
  link: { color: colors.gold, textDecorationLine: 'underline' },
});
