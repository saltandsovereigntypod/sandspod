import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { CovenToday } from '../../../components/covens/CovenToday';
import { Pill, Pills } from '../../../components/covens/ui';
import { Card, Chips, Field, MenuList, MenuRow, MoreScreen, Notice, Section } from '../../../components/more/ui';
import * as api from '../../../lib/covens/api';
import { filterDirectory, JOINING, type Coven, type Joining } from '../../../lib/covens/model';
import { syncCovenReminders } from '../../../lib/covens/reminders';
import { pendingLabel } from '../../../lib/covens/requests';
import { usePendingDetail } from '../../../lib/covens/requestsBadge';
import { useCachedQuery } from '../../../lib/more/useCachedQuery';
import { useSession } from '../../../lib/session';
import { colors, type } from '../../../theme';

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
  const [query, setQuery] = useState('');
  const [joining, setJoining] = useState<'all' | Joining>('all');
  const [pulling, setPulling] = useState(false);

  // Keep rite reminders current whenever someone looks in on their covens.
  useEffect(() => {
    if (userId) void syncCovenReminders(userId);
  }, [userId]);

  const list = useMemo(() => filterDirectory(directory.data ?? [], query, joining), [directory.data, query, joining]);
  const mineIds = new Set((mine.data ?? []).map((c) => c.id));

  return (
    <MoreScreen
      title="Covens"
      eyebrow="Practise together"
      refreshControl={
        <RefreshControl
          refreshing={pulling}
          tintColor={colors.gold}
          onRefresh={async () => {
            setPulling(true);
            await Promise.all([directory.refresh(), mine.refresh(), me.refresh()]);
            setPulling(false);
          }}
        />
      }
    >
      <Text style={type.body}>
        Find witches to practise with: covens with their own creed, rules and ways, a chat to talk in and altars you tend together. Covens are for adults (18+) and follow the community guidelines.
      </Text>

      {!!session && <CovenToday />}

      {!session ? (
        <Card>
          <Text style={type.body}>Sign in to join a coven or see the ones you belong to.</Text>
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
            {(mine.data ?? []).map((c) => (
              <MyCovenRow key={c.id} coven={c} />
            ))}
            <MenuRow
              label="Found a coven"
              detail="Lead a coven of your own"
              icon="offer"
              last={!me.data?.siteModerator}
              onPress={() => router.push('/coven/new' as Href)}
            />
            {me.data?.siteModerator && (
              <MenuRow label="Coven moderation" detail="Reports, covens, site bans and moderators" icon="support" last onPress={() => router.push('/coven/moderation' as Href)} />
            )}
          </MenuList>
          {me.data?.banned && <Notice>Your account can’t take part in covens.</Notice>}
        </Section>
      )}

      <Section label="Find a coven">
        <Field label="Search" value={query} onChangeText={setQuery} placeholder="Tradition, practice, place…" autoCapitalize="none" returnKeyType="search" />
        <Chips label="Joining" options={FILTERS} value={joining} onChange={setJoining} />
        {directory.status === 'offline' && directory.data && <Notice>Offline · showing the copy saved on this device</Notice>}
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
    </MoreScreen>
  );
}

/** One of your covens, with the requests waiting for you there (if you review them). */
function MyCovenRow({ coven }: { coven: Coven }) {
  const waiting = usePendingDetail(coven.id);
  return (
    <MenuRow
      label={coven.name}
      detail={pendingLabel(waiting) || coven.tagline || 'Your coven'}
      icon="community"
      count={(waiting?.applications ?? 0) + (waiting?.advancements ?? 0)}
      onPress={() => router.push(`/coven/c/${coven.slug}` as Href)}
    />
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  head: { gap: 4 },
});
