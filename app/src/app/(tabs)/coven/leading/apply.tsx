import * as WebBrowser from 'expo-web-browser';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, CheckRow, Chips, Field, MenuList, MenuRow, MoreScreen, Notice, Section } from '../../../../components/more/ui';
import { WEBSITE_ORIGIN } from '../../../../lib/altar/assetPaths';
import * as api from '../../../../lib/covens/api';
import {
  BADGE_LABEL,
  emptyDraft,
  LEADER_TITLES,
  listingState,
  QUESTIONS,
  STATUS_WORDS,
  trainingStatus,
  validateApplication,
  type ApplicationDraft,
  type ListingApplication,
  type TrainingRow,
} from '../../../../lib/covens/founding';
import { fetchTraining, latestListing, submitListing, withdrawListing } from '../../../../lib/covens/foundingApi';
import { errorMessage } from '../../../../lib/covens/model';
import { useSession } from '../../../../lib/session';
import { colors, type } from '../../../../theme';

const TITLE_OPTIONS = [...LEADER_TITLES.map((t) => ({ value: t as string, label: t })), { value: 'own', label: 'My own title' }];

// A coven's application to be listed in Find a coven: where it stands, the
// moderators' note, and the form (after the founder's training). Website:
// covens/leading/?apply=<slug>.
export default function ApplyListing() {
  const { c } = useLocalSearchParams<{ c: string }>();
  const slug = String(c ?? '');
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [snap, setSnap] = useState<api.CovenSnapshot | null | undefined>(undefined);
  const [latest, setLatest] = useState<ListingApplication | null>(null);
  const [rows, setRows] = useState<TrainingRow[]>([]);
  const [draft, setDraft] = useState<ApplicationDraft>(emptyDraft());
  const [titleChoice, setTitleChoice] = useState<string>('Leader');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) return setSnap(null);
    try {
      const s = await api.fetchCoven(slug, userId);
      setSnap(s);
      if (s && userId) {
        const [l, t] = await Promise.all([latestListing(s.coven.id), fetchTraining(userId)]);
        setLatest(l);
        setRows(t);
        if (l && (l.status === 'changes' || l.status === 'declined')) {
          setDraft(emptyDraft(l));
          setTitleChoice((LEADER_TITLES as readonly string[]).includes(l.leader_title) ? l.leader_title : 'own');
        }
      }
    } catch (error) {
      setMessage(errorMessage(error));
      setSnap(null);
    }
  }, [slug, userId]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const back = '/coven/leading' as Href;
  if (!session) {
    return (
      <MoreScreen title="Apply to be listed" back={back} backLabel="Leading a coven">
        <Button label="Sign in" onPress={() => router.push('/sign-in')} />
      </MoreScreen>
    );
  }
  if (snap === undefined) {
    return (
      <MoreScreen title="Apply to be listed" back={back} backLabel="Leading a coven">
        <ActivityIndicator color={colors.gold} />
      </MoreScreen>
    );
  }
  if (!snap) {
    return (
      <MoreScreen title="Apply to be listed" back={back} backLabel="Leading a coven">
        <Notice>That coven wasn’t found.</Notice>
      </MoreScreen>
    );
  }

  const { coven } = snap;
  const rank = snap.ranks.find((r) => r.id === snap.membership?.rank_id);
  const manages = coven.founder_id === userId || !!rank?.can_manage;
  const state = listingState(coven, latest);
  const training = trainingStatus(rows);
  const set = (key: keyof ApplicationDraft, value: string | boolean) => setDraft((d) => ({ ...d, [key]: value }));

  const send = async () => {
    const errors = validateApplication(draft, training.done);
    if (errors.length) return setMessage(errors.join(' '));
    setBusy(true);
    setMessage(null);
    try {
      setLatest(await submitListing(coven.id, draft));
      setMessage('Sent. The moderators will read it and you’ll hear when they answer.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };
  const withdraw = async () => {
    if (!latest) return;
    setBusy(true);
    try {
      setLatest(await withdrawListing(latest.id));
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  return (
    <MoreScreen title={coven.name} eyebrow="Find a coven listing" back={back} backLabel="Leading a coven">
      <Card tone={state.key === 'listed' || state.key === 'approved' ? 'gold' : undefined}>
        <Text style={type.body}>{state.line}</Text>
        {latest && <Text style={type.caption}>Latest application: {STATUS_WORDS[latest.status]}.</Text>}
        {!!latest?.moderator_note && (latest.status === 'changes' || latest.status === 'declined') && (
          <Text style={type.body}>
            The moderators wrote: “{latest.moderator_note}”
          </Text>
        )}
        {latest?.status === 'pending' && manages && <Button label="Withdraw the application" variant="outline" disabled={busy} onPress={() => void withdraw()} />}
      </Card>

      {!manages && <Notice tone="muted">Only the coven’s leaders can apply for it to be listed.</Notice>}

      {manages && state.canApply && latest?.status !== 'pending' && (
        <>
          {!training.done ? (
            <Card>
              <Text style={type.body}>First, the founder’s training: {training.line}</Text>
              <Button label={training.next ? `Continue: ${training.next.title}` : 'Open the training'} onPress={() => router.push((training.next ? `/coven/leading/${training.next.slug}` : '/coven/leading') as Href)} />
            </Card>
          ) : (
            <Section label="Your application">
              <Text style={type.caption}>
                {BADGE_LABEL}: your training shows on the application. The moderators read every one; most are answered within a few days.
              </Text>
              <Chips label="Your title as leader" options={TITLE_OPTIONS} value={titleChoice} onChange={(v) => (setTitleChoice(v), v !== 'own' && set('leader_title', v))} />
              {titleChoice === 'own' && <Field label="Your own title" value={draft.leader_title} onChangeText={(t) => set('leader_title', t)} maxLength={60} placeholder="Elder, Keeper, Gothi…" />}
              {QUESTIONS.map((q) => (
                <Field key={q.key} label={q.label} hint={q.hint} value={draft[q.key]} onChangeText={(t) => set(q.key, t)} multiline maxLength={q.max} />
              ))}
              <CheckRow label="I will lead this coven by the coven guidelines and the community guidelines." value={draft.agree} onChange={(v) => set('agree', v)}>
                <Text style={[type.caption, styles.link]} onPress={() => void WebBrowser.openBrowserAsync(`${WEBSITE_ORIGIN}/covens/guidelines/`)}>
                  Read the coven guidelines
                </Text>
              </CheckRow>
              <CheckRow label="I am 18 or older." value={draft.adult} onChange={(v) => set('adult', v)} />
              <Button label={busy ? 'Sending…' : 'Send to the moderators'} disabled={busy} onPress={() => void send()} />
            </Section>
          )}
        </>
      )}
      {message && <Notice>{message}</Notice>}

      <MenuList>
        <MenuRow label="Open the coven" icon="community" onPress={() => router.push(`/coven/c/${coven.slug}` as Href)} />
        <MenuRow label="The founder’s training" icon="books" last onPress={() => router.push(back)} />
      </MenuList>
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.gold, textDecorationLine: 'underline' },
});
