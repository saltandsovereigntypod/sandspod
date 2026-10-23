import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, CheckRow, Chips, Field, MoreScreen, Notice } from '../../../../components/more/ui';
import { WEBSITE_ORIGIN } from '../../../../lib/altar/assetPaths';
import * as api from '../../../../lib/covens/api';
import { errorMessage, parseTags, slugify, validateCoven, type Joining } from '../../../../lib/covens/model';
import { useSession } from '../../../../lib/session';
import { colors, type } from '../../../../theme';

const JOIN_OPTIONS = [
  { value: 'application', label: 'By application' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Not yet' },
] as const;
const JOIN_DETAIL: Record<Joining, string> = {
  application: 'You review each person who applies.',
  open: 'Anyone who signs the agreements can join.',
  closed: 'Not taking members yet.',
};
const LISTING = [
  { value: 'listed', label: 'Listed' },
  { value: 'unlisted', label: 'Unlisted (link only)' },
] as const;

// Found a coven. The database sets up its first positions (Seeker to the
// founder's own title), empty creed, rules and requirements pages and a
// starter member agreement, which the founder then makes their own in Manage.
export default function FoundCoven() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [me, setMe] = useState<api.Me | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [tradition, setTradition] = useState('');
  const [rhythm, setRhythm] = useState('');
  const [tags, setTags] = useState('');
  const [joining, setJoining] = useState<Joining>('application');
  const [visibility, setVisibility] = useState<'listed' | 'unlisted'>('listed');
  const [founderRank, setFounderRank] = useState('High Priestess');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userId) api.fetchMe(userId).then(setMe).catch((error) => setMessage(errorMessage(error)));
  }, [userId]);

  const back = '/more/covens' as Href;
  if (!session) {
    return (
      <MoreScreen title="Found a coven" back={back} backLabel="Back to Covens">
        <Card>
          <Text style={type.body}>Sign in to found a coven.</Text>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </Card>
      </MoreScreen>
    );
  }

  const address = slugEdited ? slug : slugify(name);
  const found = async () => {
    const draft = { name, slug: address, tagline, description, tradition, meeting_rhythm: rhythm, tags: parseTags(tags), joining, visibility, founder_rank: founderRank };
    const errors = validateCoven(draft);
    if (!agreed) errors.push('Agree to lead by the community guidelines.');
    if (errors.length) return setMessage(errors.join(' '));
    setBusy(true);
    setMessage(null);
    try {
      const created = await api.createCoven(draft);
      router.replace(`/more/covens/c/${created.slug}/manage` as Href);
    } catch (error) {
      setMessage(/duplicate|already/i.test(String((error as Error)?.message)) ? 'Another coven already has that address. Choose another.' : errorMessage(error));
      setBusy(false);
    }
  };

  return (
    <MoreScreen title="Found a coven" eyebrow="Covens" back={back} backLabel="Back to Covens">
      {!me && !message && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {me?.banned && <Notice>Your account can’t take part in covens.</Notice>}
      {me && !me.banned && !me.profile && (
        <Card>
          <Text style={type.body}>Before you found a coven, choose the name other witches will see and confirm you are 18 or older.</Text>
          <Button label="Make my coven profile" onPress={() => router.push('/more/covens/profile' as Href)} />
        </Card>
      )}
      {me?.profile && !me.banned && (
        <>
          <Text style={type.body}>
            You’ll lead this coven as its founder. Once it’s founded you can write its creed, rules, requirements and agreements, rename its positions and add questions for people who apply.
          </Text>
          <Field label="Coven name" value={name} onChangeText={setName} maxLength={80} placeholder="The Thistle & Moon Circle" />
          <Field
            label="Web address"
            value={address}
            onChangeText={(text) => {
              setSlugEdited(true);
              setSlug(text.toLowerCase().replace(/[^a-z0-9-]/g, ''));
            }}
            maxLength={60}
            autoCapitalize="none"
            autoCorrect={false}
            hint={address ? `saltandsovereignty.com/covens/coven/?c=${address}` : undefined}
          />
          <Field label="One line about the coven" value={tagline} onChangeText={setTagline} maxLength={160} placeholder="A hedge-witch circle for the new and full moons" />
          <Field label="Who you are and how you practise" value={description} onChangeText={setDescription} multiline maxLength={5000} />
          <Field label="Tradition or path (optional)" value={tradition} onChangeText={setTradition} maxLength={80} placeholder="Eclectic, Hellenic, Green…" />
          <Field label="When you gather (optional)" value={rhythm} onChangeText={setRhythm} maxLength={160} placeholder="New and full moons, 8pm Eastern" />
          <Field label="Tags, separated by commas (optional)" value={tags} onChangeText={setTags} placeholder="beginners welcome, moon work" />
          <Chips label="How witches join" options={JOIN_OPTIONS} value={joining} onChange={setJoining} />
          <Text style={type.caption}>{JOIN_DETAIL[joining]}</Text>
          <Chips label="Directory" options={LISTING} value={visibility} onChange={setVisibility} />
          <Field label="Your title as leader" value={founderRank} onChangeText={setFounderRank} maxLength={60} />
          <CheckRow label="I’ll lead this coven by the community guidelines, and I understand the Salt & Sovereignty moderators can see and act on every coven." value={agreed} onChange={setAgreed}>
            <Text style={[type.caption, styles.link]} onPress={() => void WebBrowser.openBrowserAsync(`${WEBSITE_ORIGIN}/covens/guidelines/`)}>
              Read the guidelines
            </Text>
          </CheckRow>
          <Button label={busy ? 'Founding…' : '✦ Found the coven'} onPress={found} disabled={busy} />
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
