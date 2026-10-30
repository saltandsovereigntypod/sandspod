import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Card, Notice, RitualScreen, SectionLabel, SignInCard, Title, confirmAction, ui } from '../../../../components/rituals/ui';
import { communityDate } from '../../../../lib/community/model';
import { canChange, canSendUpdate, canWithdraw, ritualFacts, savesLabel, sharedStatusLabel, sharerName, type SharedRitual } from '../../../../lib/rituals/community';
import { useMyShares, withdrawRitual } from '../../../../lib/rituals/communityApi';
import { useSession } from '../../../../lib/session';
import { colors, type } from '../../../../theme';

// My shared rituals: each one's status and the moderators' note, with ways to
// change one that's waiting or returned, send an update to a published one,
// or withdraw it. Those who lead a coven's rituals see its shares too.
// (There are no notifications yet: the status here, and on the website, is
// where a decision shows.)
export default function MySharedRituals() {
  const { session } = useSession();
  const { data, status, refresh } = useMyShares();
  const [message, setMessage] = useState<string | null>(null);

  if (!session) {
    return (
      <RitualScreen back="Community Rituals">
        <Title>My shared rituals</Title>
        <SignInCard title="Sign in to see what you’ve shared" body="Rituals you share are kept with your account." />
      </RitualScreen>
    );
  }

  const withdraw = async (row: SharedRitual) => {
    const ok = await confirmAction(
      'Withdraw this ritual?',
      row.status === 'published' ? 'It leaves Community Rituals. Copies people have already added to their rituals stay theirs.' : 'It won’t be reviewed or published.',
      'Withdraw',
    );
    if (!ok) return;
    try {
      await withdrawRitual(row.id);
      setMessage(`“${row.title}” is withdrawn.`);
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Please try again.');
    }
  };

  const card = (row: SharedRitual) => (
    <Card key={row.id} accent={row.status === 'needs_revision'}>
      <Text style={[type.eyebrow, row.status === 'needs_revision' && ui.gold]}>{sharedStatusLabel(row.status)}</Text>
      <Text style={type.cardTitle}>{row.title}</Text>
      <Body muted>
        {[`Credited to ${sharerName(row)}`, ritualFacts(row), row.version > 1 ? `version ${row.version}` : '', communityDate(row.submitted_at), savesLabel(row.save_count)]
          .filter(Boolean)
          .join(' · ')}
      </Body>
      {!!row.reviewer_note && (
        <View style={ui.gapSmall}>
          <Body muted>From the moderators</Body>
          <Body>{row.reviewer_note}</Body>
        </View>
      )}
      <View style={ui.actions}>
        {row.status === 'published' && (
          <Button label="Open it" variant="outline" onPress={() => router.push({ pathname: '/rituals/community/[id]', params: { id: row.id } })} />
        )}
        {canChange(row) && row.user_id === session.user.id && (
          <Button
            label={row.status === 'needs_revision' ? 'Change it and send again' : 'Change it'}
            variant="outline"
            onPress={() => router.push({ pathname: '/rituals/community/share', params: { edit: row.id } })}
          />
        )}
        {canSendUpdate(row) && (
          <Button label="Send an update" variant="outline" onPress={() => router.push({ pathname: '/rituals/community/share', params: { update: row.id } })} />
        )}
        {canWithdraw(row) && <Button label="Withdraw" variant="text" onPress={() => void withdraw(row)} />}
      </View>
    </Card>
  );

  const mine = data?.mine.filter((r) => r.status !== 'superseded') ?? [];
  const covens = data?.covens.filter((r) => r.status !== 'superseded' && r.status !== 'withdrawn') ?? [];

  return (
    <RitualScreen back="Community Rituals" onRefresh={refresh}>
      <Title eyebrow="Community Rituals">My shared rituals</Title>
      <Body>Every ritual is reviewed before it appears. A moderator may publish it, return it to you with a note, or decline it. Check back here to see where each stands.</Body>
      {!!message && <Notice>{message}</Notice>}
      {!data && status !== 'offline' && <ActivityIndicator color={colors.gold} />}
      {status === 'offline' && <Notice>Couldn’t refresh just now · showing the copy saved on this phone</Notice>}
      {data && !data.ready && <Body>Community Rituals is on its way. You’ll be able to share once it opens.</Body>}
      {data?.ready && (
        <>
          {mine.length ? mine.map(card) : <Body muted>You haven’t shared a ritual yet.</Body>}
          <Button label="Share a ritual" variant="outline" onPress={() => router.push('/rituals/community/share')} />
          {covens.length > 0 && (
            <View style={ui.gap}>
              <SectionLabel>Shared for your covens</SectionLabel>
              {covens.map(card)}
            </View>
          )}
        </>
      )}
    </RitualScreen>
  );
}
