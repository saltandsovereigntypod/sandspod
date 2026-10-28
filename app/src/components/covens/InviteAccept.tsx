// Accepting an invitation to a coven, from an invite link (coven/join/[code])
// or one sent to you (coven/invitation/[id]): sign in, make your coven
// profile, read and sign the coven's agreements, then Accept, which opens the
// coven. An invitation counts as the coven's approval, so there's no
// application. The website's join page (covens/join/) runs the same steps.

import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Button } from '../Button';
import { covenHref } from './CovenScreen';
import { Words } from './ui';
import { Card, CheckRow, Field, MoreScreen, Notice, Section } from '../more/ui';
import * as api from '../../lib/covens/api';
import { refreshInvitations } from '../../lib/covens/invitationsBadge';
import { inviteError, needsAgreements } from '../../lib/covens/invites';
import { KIND_LABELS, unsignedAgreements } from '../../lib/covens/model';
import { useSession } from '../../lib/session';
import { colors, type } from '../../theme';

type Loaded = { snapshot: api.CovenSnapshot | null; me: api.Me | null };

export function InviteAccept({
  title,
  here,
  slug,
  intro,
  problem,
  accept,
  decline,
}: {
  title: string;
  /** This screen's own address, to come back to after signing in. */
  here: string;
  /** The coven's address, once known. */
  slug: string | null;
  /** The invitation itself: the coven, who sent it. */
  intro: ReactNode;
  /** Why it can't be accepted (expired, revoked…), if it can't. */
  problem?: string | null;
  accept: () => Promise<unknown>;
  decline?: () => Promise<unknown>;
}) {
  const { session, ready } = useSession();
  const userId = session?.user.id ?? null;
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const [typedName, setTypedName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Look again whenever the screen comes back (from signing in or making a profile).
  useFocusEffect(
    useCallback(() => {
      if (!slug) return;
      let live = true;
      void Promise.all([api.fetchCoven(slug, userId).catch(() => null), userId ? api.fetchMe(userId).catch(() => null) : Promise.resolve(null)]).then(([snapshot, me]) => {
        if (live) setLoaded({ snapshot, me });
      });
      return () => {
        live = false;
      };
    }, [slug, userId]),
  );

  const snap = loaded?.snapshot ?? null;
  const me = loaded?.me ?? null;
  const unsigned = snap ? unsignedAgreements(snap.documents, snap.signatures, userId) : [];
  const member = snap?.membership?.status === 'active';
  const signedName = typedName ?? me?.profile?.display_name ?? '';
  const open = () => router.replace(covenHref(slug!));

  const go = async () => {
    if (unsigned.some((d) => !agreed[d.id])) return setMessage('Read and agree to each agreement first.');
    if (unsigned.length && !signedName.trim()) return setMessage('Sign with your name.');
    setBusy(true);
    setMessage(null);
    try {
      for (const doc of unsigned) await api.sign(doc.id, signedName.trim());
      await accept();
      void refreshInvitations();
      open();
    } catch (error) {
      setMessage(needsAgreements(error) ? 'The coven’s agreements changed. Read them again below.' : inviteError(error));
      if (slug) setLoaded({ snapshot: await api.fetchCoven(slug, userId).catch(() => snap), me });
    }
    setBusy(false);
  };

  const no = async () => {
    if (!decline) return;
    setBusy(true);
    try {
      await decline();
      void refreshInvitations();
      router.replace('/coven' as Href);
    } catch (error) {
      setMessage(inviteError(error));
    }
    setBusy(false);
  };

  let body: ReactNode;
  if (problem) body = <Notice>{problem}</Notice>;
  else if (!ready || (slug && !loaded)) body = <ActivityIndicator color={colors.gold} style={styles.loading} />;
  else if (!session) {
    body = (
      <Card>
        <Text style={type.body}>Sign in to accept. Your Sanctuary account works in the app and on the website.</Text>
        <Button label="Sign in" onPress={() => router.push(`/sign-in?next=${encodeURIComponent(here)}` as Href)} />
        <Button label="Create an account" variant="outline" onPress={() => router.push(`/sign-in?mode=create&next=${encodeURIComponent(here)}` as Href)} />
      </Card>
    );
  } else if (me?.banned) body = <Notice>Your account can’t take part in covens.</Notice>;
  else if (member) {
    body = (
      <Card>
        <Text style={type.body}>You’re already in this coven.</Text>
        <Button label="Open the coven" onPress={open} />
      </Card>
    );
  } else if (!snap) body = <Notice>This coven isn’t open right now.</Notice>;
  else if (!me?.profile) {
    body = (
      <Card>
        <Text style={type.body}>First, make your coven profile: the name other members see, and confirming you’re 18 or older. Then come back here to accept.</Text>
        <Button label="Make my profile" onPress={() => router.push('/coven/profile' as Href)} />
      </Card>
    );
  } else {
    body = (
      <>
        {unsigned.length > 0 && <Text style={type.body}>The coven asks every member to sign {unsigned.length === 1 ? 'its agreement' : 'its agreements'} first.</Text>}
        {unsigned.map((doc) => (
          <Section key={doc.id} label={KIND_LABELS[doc.kind] ?? 'Agreement'}>
            <Card>
              <Text style={type.cardTitle}>{doc.title}</Text>
              <Words text={doc.body} />
              <CheckRow label={`I have read and agree to “${doc.title}”`} value={!!agreed[doc.id]} onChange={(v) => setAgreed((prev) => ({ ...prev, [doc.id]: v }))} />
            </Card>
          </Section>
        ))}
        {unsigned.length > 0 && <Field label="Sign with your name" value={signedName} onChangeText={setTypedName} maxLength={80} />}
        <Button label={busy ? 'Joining…' : unsigned.length ? 'Sign and accept' : 'Accept'} onPress={() => void go()} disabled={busy} />
        {decline && <Button label="Decline" variant="outline" onPress={() => void no()} disabled={busy} />}
      </>
    );
  }

  return (
    <MoreScreen title={title} eyebrow="Covens" back={'/coven' as Href} backLabel="Back to Covens">
      {intro}
      {body}
      {message && <Notice>{message}</Notice>}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
});
