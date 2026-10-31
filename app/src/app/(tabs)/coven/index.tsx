import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { CovenToday } from '../../../components/covens/CovenToday';
import { Pill, Pills } from '../../../components/covens/ui';
import { Icon } from '../../../components/Icon';
import { Card, Chips, Field, MenuList, MenuRow, MoreScreen, Notice, Section } from '../../../components/more/ui';
import { SegmentedSwitch } from '../../../components/SegmentedSwitch';
import * as api from '../../../lib/covens/api';
import { refreshInvitations, useMyInvitations, type MyInvitation } from '../../../lib/covens/invitationsBadge';
import { invitationLine, inviteError, needsAgreements, needsProfile, parseInviteCode } from '../../../lib/covens/invites';
import { filterDirectory, JOINING, type Coven, type Joining } from '../../../lib/covens/model';
import { syncCovenReminders } from '../../../lib/covens/reminders';
import { pendingLabel } from '../../../lib/covens/requests';
import { refreshRequests, usePendingDetail } from '../../../lib/covens/requestsBadge';
import { covenGlance, type CovenTodayInput } from '../../../lib/covens/today';
import { refreshUnread, useUnread } from '../../../lib/covens/unread';
import { useCachedQuery } from '../../../lib/more/useCachedQuery';
import { preloadRememberedTab, useRememberedTab } from '../../../lib/rememberedTab';
import { asCovenTab, COVEN_TAB_KEY, COVEN_TABS, covenTabFor } from '../../../lib/screenTabs';
import { useSession } from '../../../lib/session';
import { colors, type } from '../../../theme';

void preloadRememberedTab(COVEN_TAB_KEY);

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'application', label: 'By application' },
] as const;

export default function Covens() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const directory = useCachedQuery<Coven[]>('covens-directory', api.fetchDirectory);
  const mine = useCachedQuery<Coven[]>(userId ? `covens-mine-${userId}` : null, () => api.fetchMyCovens(userId!));
  const me = useCachedQuery<api.Me>(userId ? `covens-me-${userId}` : null, () => api.fetchMe(userId!));
  // Shared with "Your covens" (CovenToday): positions and gatherings for each coven's card.
  const glance = useCachedQuery<CovenTodayInput | null>(userId ? `coven-today-${userId}` : null, () => api.fetchCovenToday(userId!));
  const applied = useCachedQuery(userId ? `covens-applied-${userId}` : null, () => api.fetchMyPendingApplications(userId!));
  const [query, setQuery] = useState('');
  const [joining, setJoining] = useState<'all' | Joining>('all');
  const [pulling, setPulling] = useState(false);
  const invitations = useMyInvitations();
  const [code, setCode] = useState('');
  const [codeNote, setCodeNote] = useState<string | null>(null);
  const openCode = () => {
    const found = parseInviteCode(code);
    if (!found) return setCodeNote('That doesn’t look like an invite code or link. A code is ten letters and numbers.');
    setCodeNote(null);
    setCode('');
    router.push(`/coven/join/${found}` as Href);
  };

  // Two tabs: the covens you belong to, and finding (or founding) one.
  const [remembered, rememberTab] = useRememberedTab(COVEN_TAB_KEY, asCovenTab);
  const params = useLocalSearchParams<{ tab?: string }>();
  const linked = asCovenTab(params.tab);
  useEffect(() => {
    if (!linked) return;
    rememberTab(linked);
    router.setParams({ tab: undefined });
  }, [linked, rememberTab]);
  const tab = covenTabFor({ linked, remembered, signedIn: !!session, covenCount: mine.data ? mine.data.length : null });

  // Keep rite reminders current whenever someone looks in on their covens.
  useEffect(() => {
    if (userId) void syncCovenReminders(userId);
  }, [userId]);

  const list = useMemo(() => filterDirectory(directory.data ?? [], query, joining), [directory.data, query, joining]);
  const mineIds = new Set((mine.data ?? []).map((c) => c.id));
  const pending = (applied.data ?? []).filter((a) => a.covens && !mineIds.has(a.coven_id));

  const moderation = me.data?.siteModerator ? (
    <MenuList>
      <MenuRow label="Coven moderation" detail="Reports, covens, site bans and moderators" icon="support" last onPress={() => router.push('/coven/moderation' as Href)} />
    </MenuList>
  ) : null;

  return (
    <MoreScreen
      title="Covens"
      eyebrow="Practise together"
      scrollKey={tab}
      refreshControl={
        <RefreshControl
          refreshing={pulling}
          tintColor={colors.gold}
          onRefresh={async () => {
            setPulling(true);
            await Promise.all([directory.refresh(), mine.refresh(), me.refresh(), glance.refresh(), applied.refresh(), refreshUnread(), refreshRequests(), refreshInvitations()]);
            setPulling(false);
          }}
        />
      }
    >
      <SegmentedSwitch label="Covens" options={COVEN_TABS} value={tab} onChange={rememberTab} />
      {me.data?.banned && <Notice>Your account can’t take part in covens.</Notice>}

      {tab === 'mine' ? (
        !session ? (
          <Card>
            <Text style={type.body}>Sign in to join a coven or see the ones you belong to.</Text>
            <Button label="Sign in" onPress={() => router.push('/sign-in')} />
          </Card>
        ) : (
          <>
            {invitations.length > 0 && (
              <Section label="Invitations">
                {invitations.map((inv) => (
                  <InvitationCard key={inv.id} invitation={inv} onJoined={() => void Promise.all([mine.refresh(), glance.refresh(), applied.refresh()])} />
                ))}
              </Section>
            )}

            <CovenToday />

            {!mine.data && mine.status !== 'offline' && <ActivityIndicator color={colors.gold} style={styles.loading} />}
            {!mine.data && mine.status === 'offline' && (
              <Card>
                <Text style={type.body}>Your covens couldn’t be loaded. Check your connection and try again.</Text>
                <Button label="Try again" variant="outline" onPress={mine.refresh} />
              </Card>
            )}
            {mine.data && mine.status === 'offline' && <Notice>Couldn’t refresh just now · showing the copy saved on this device</Notice>}
            {mine.data && !mine.data.length && (
              <Card>
                <Text style={type.cardTitle}>No coven yet</Text>
                <Text style={type.body}>
                  {pending.length
                    ? 'Your application is with the coven. While you wait, you can look at others or found one of your own.'
                    : 'When you join a coven it will be here, with its gatherings and messages. Find one to practise with, or found your own.'}
                </Text>
                <Button label="Find a coven" onPress={() => rememberTab('find')} />
              </Card>
            )}
            {!!mine.data?.length && (
              <Section label="Covens you belong to">
                {mine.data.map((c) => (
                  <MyCovenCard key={c.id} coven={c} glance={glance.data} />
                ))}
              </Section>
            )}

            {session && (
              <MenuList>
                <MenuRow label="Mentorship" detail="Your mentors and mentees, and the directory (adults only)" icon="journey" last onPress={() => router.push('/coven/mentorship' as Href)} />
              </MenuList>
            )}

            {pending.length > 0 && (
              <Section label="Waiting to hear back">
                <MenuList>
                  {pending.map((a, i) => (
                    <MenuRow
                      key={a.id}
                      label={a.covens!.name}
                      detail="Application waiting for review"
                      icon="community"
                      last={i === pending.length - 1}
                      onPress={() => router.push(`/coven/c/${a.covens!.slug}` as Href)}
                    />
                  ))}
                </MenuList>
              </Section>
            )}

            {moderation}
          </>
        )
      ) : (
        <>
          <Text style={type.body}>
            Find witches to practise with: covens with their own creed, rules and ways, a chat to talk in and altars you tend together. Covens are for adults (18+) and follow the community guidelines.
          </Text>

          {!session ? (
            <Card>
              <Text style={type.body}>Sign in to join a coven or found your own.</Text>
              <Button label="Sign in" onPress={() => router.push('/sign-in')} />
            </Card>
          ) : (
            <Section label="You">
              <MenuList>
                <MenuRow
                  label={me.data?.profile ? me.data.profile.display_name : 'Make your coven profile'}
                  detail={me.data?.profile ? 'Your coven profile' : 'The name other members see'}
                  icon="account"
                  onPress={() => router.push('/coven/profile' as Href)}
                />
                <MenuRow label="Found a coven" detail="Lead a coven of your own" icon="offer" onPress={() => router.push('/coven/new' as Href)} />
                <MenuRow label="Mentorship" detail="Find a mentor or offer to mentor (adults only)" icon="journey" last onPress={() => router.push('/coven/mentorship' as Href)} />
              </MenuList>
              {moderation}
            </Section>
          )}

          <Section label="Have an invite?">
            <Field
              label="Invite code or link"
              value={code}
              onChangeText={setCode}
              placeholder="Paste the link, or type the code"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={openCode}
            />
            <Button label="Open the invitation" variant="outline" onPress={openCode} disabled={!code.trim()} />
            {codeNote && <Notice>{codeNote}</Notice>}
          </Section>

          <Section label="Find a coven">
            <Field label="Search" value={query} onChangeText={setQuery} placeholder="Tradition, practice, place…" autoCapitalize="none" returnKeyType="search" />
            <Chips label="Joining" options={FILTERS} value={joining} onChange={setJoining} />
            {directory.status === 'offline' && directory.data && <Notice>Couldn’t refresh just now · showing the copy saved on this device</Notice>}
            {!directory.data && directory.status !== 'offline' && <ActivityIndicator color={colors.gold} style={styles.loading} />}
            {!directory.data && directory.status === 'offline' && (
              <Card>
                <Text style={type.body}>Covens couldn’t be loaded. Check your connection and try again.</Text>
                <Button label="Try again" variant="outline" onPress={directory.refresh} />
              </Card>
            )}
            {directory.data && !list.length && <Text style={type.caption}>{directory.data.length ? 'No covens match that.' : 'No covens are listed yet.'}</Text>}
            {list.map((c) => (
              <Card key={c.id}>
                <View style={styles.head}>
                  <Text style={type.cardTitle}>{c.name}</Text>
                  {!!c.tagline && <Text style={type.caption}>{c.tagline}</Text>}
                </View>
                <Pills>
                  {mineIds.has(c.id) && <Pill label="Your coven" tone="gold" />}
                  <Pill label={JOINING[c.joining].label} />
                  {!!c.tradition && <Pill label={c.tradition} />}
                  {typeof c.member_count === 'number' && <Pill label={`${c.member_count} ${c.member_count === 1 ? 'member' : 'members'}`} />}
                </Pills>
                {!!c.meeting_rhythm && <Text style={type.caption}>Meets {c.meeting_rhythm}</Text>}
                <Button label="Visit" variant="outline" onPress={() => router.push(`/coven/c/${c.slug}` as Href)} />
              </Card>
            ))}
          </Section>
        </>
      )}
    </MoreScreen>
  );
}

/**
 * An invitation sent to you: the coven, who sent it and their message, with
 * Accept and Decline. Accepting joins at once, unless the coven's agreements
 * (or your coven profile) come first: then its invitation screen opens.
 */
function InvitationCard({ invitation, onJoined }: { invitation: MyInvitation; onJoined: () => void }) {
  const [inviter, setInviter] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const by = invitation.invited_by;
  useEffect(() => {
    if (!by) return;
    let live = true;
    void api.fetchProfiles([by]).then(([p]) => live && setInviter(p?.display_name ?? null)).catch(() => {});
    return () => {
      live = false;
    };
  }, [by]);
  const coven = invitation.covens!;
  const answer = async (accept: boolean) => {
    setBusy(true);
    setNote(null);
    try {
      await api.respondToInvitation(invitation.id, accept);
      await refreshInvitations();
      if (accept) {
        onJoined();
        router.push(`/coven/c/${coven.slug}` as Href);
      }
    } catch (error) {
      if (accept && (needsAgreements(error) || needsProfile(error))) router.push(`/coven/invitation/${invitation.id}` as Href);
      else setNote(inviteError(error));
    }
    setBusy(false);
  };
  return (
    <Card tone="gold">
      <View style={styles.head}>
        <Text style={type.cardTitle}>{coven.name}</Text>
        {!!coven.tagline && <Text style={type.caption}>{coven.tagline}</Text>}
      </View>
      <Text style={type.body}>{invitationLine(inviter, invitation.message)}</Text>
      <View style={styles.answers}>
        <Button label={busy ? 'Joining…' : 'Accept'} onPress={() => void answer(true)} disabled={busy} />
        <Button label="Decline" variant="outline" onPress={() => void answer(false)} disabled={busy} />
      </View>
      {note && <Notice>{note}</Notice>}
    </Card>
  );
}

/**
 * One of your covens as a card: its name, your position there, unread
 * messages, its next gathering and the requests waiting for you (if you
 * review them). Tap it to open the coven.
 */
function MyCovenCard({ coven, glance }: { coven: Coven; glance: CovenTodayInput | null }) {
  const waiting = usePendingDetail(coven.id);
  const unread = useUnread(coven.id);
  const { position, next } = covenGlance(glance, coven.id);
  const requests = pendingLabel(waiting);
  const spoken = [
    coven.name,
    position && `Your position: ${position}`,
    unread > 0 && `${unread} unread ${unread === 1 ? 'message' : 'messages'}`,
    next && `Next: ${next.line}`,
    requests,
  ]
    .filter(Boolean)
    .join('. ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityHint="Opens the coven"
      onPress={() => router.push(`/coven/c/${coven.slug}` as Href)}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card>
        <View style={styles.cardHead}>
          <View style={styles.head}>
            <Text style={type.cardTitle}>{coven.name}</Text>
            {!!coven.tagline && <Text style={type.caption}>{coven.tagline}</Text>}
          </View>
          <Icon name="chevron" size={16} color={colors.gold} />
        </View>
        {(!!position || unread > 0) && (
          <Pills>
            {!!position && <Pill label={position} tone="gold" />}
            {unread > 0 && <Pill label={`${unread > 99 ? '99+' : unread} unread`} />}
          </Pills>
        )}
        {next && <Text style={type.caption}>{`${next.live ? 'Now' : next.meeting ? 'Next meeting' : 'Next gathering'}: ${next.line}`}</Text>}
        {!!requests && <Text style={[type.caption, styles.gold]}>{requests}</Text>}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  head: { flex: 1, gap: 4 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pressed: { opacity: 0.75 },
  gold: { color: colors.gold },
  answers: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
