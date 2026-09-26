import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, Chips, Field, MoreScreen, Notice, Tags } from '../../../../components/more/ui';
import { usePublished } from '../../../../lib/community/api';
import { authorName, communityDate, filterEntries, TYPE_FILTERS, typeLabel, type SubmissionRow } from '../../../../lib/community/model';
import { colors, fonts, radius, type } from '../../../../theme';

type Filter = (typeof TYPE_FILTERS)[number]['value'];

export default function CommunityGrimoire() {
  const { data, status, refresh } = usePublished();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [pulling, setPulling] = useState(false);

  const entries = data?.entries ?? [];
  const shown = filterEntries(entries, search, filter);

  return (
    <MoreScreen
      title="Community Grimoire"
      eyebrow="The Living Archive"
      back="/more"
      backLabel="Back to More"
      refreshControl={
        <RefreshControl
          refreshing={pulling}
          tintColor={colors.gold}
          onRefresh={async () => {
            setPulling(true);
            await refresh();
            setPulling(false);
          }}
        />
      }
    >
      <Text style={type.body}>
        Ritual reflections, dream notes, spellwork and hard-won wisdom offered by the Salt &amp; Sovereignty community.
        Every page is reviewed before it appears here.
      </Text>

      <View style={styles.tools}>
        <Field
          label="Search"
          value={search}
          onChangeText={setSearch}
          placeholder="Title, tag or keyword"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Chips label="Filter by type" options={TYPE_FILTERS} value={filter} onChange={setFilter} />
      </View>

      {status === 'offline' && data && <Notice>Offline · showing the copy saved on this device</Notice>}

      {!data && (status === 'loading' || status === 'idle') && <ActivityIndicator color={colors.gold} style={styles.loading} />}

      {!data && status === 'offline' && (
        <Card>
          <Text style={type.cardTitle}>The Grimoire couldn't open</Text>
          <Text style={type.body}>Check your connection and try again.</Text>
          <Button label="Try again" variant="outline" onPress={refresh} />
        </Card>
      )}

      {data && entries.length === 0 && (
        <Card>
          <Text style={type.body}>No pages have been published yet. The Community Grimoire is waiting for its first offerings.</Text>
        </Card>
      )}

      {data && entries.length > 0 && (
        <Text style={type.caption} accessibilityLiveRegion="polite">
          {shown.length === 0
            ? 'No published pages match that search.'
            : `${shown.length} published page${shown.length === 1 ? '' : 's'}`}
        </Text>
      )}

      <View style={styles.list}>
        {shown.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </View>

      <Card tone="gold">
        <Text style={type.eyebrow}>Offer a page</Text>
        <Text style={type.cardTitle}>Want to contribute?</Text>
        <Text style={type.body}>Share a ritual reflection, dream, piece of practice wisdom or story for review.</Text>
        <Button label="Make an offering" onPress={() => router.push('/more/community/offer')} />
      </Card>
    </MoreScreen>
  );
}

function EntryCard({ entry }: { entry: SubmissionRow }) {
  const date = communityDate(entry.updated_at || entry.created_at);
  const byline = [`Offered by ${authorName(entry)}`, date].filter(Boolean).join(' · ');
  const tags = entry.tags ?? [];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.title}. ${typeLabel(entry.submission_type)}. ${byline}`}
      accessibilityHint="Opens the page"
      onPress={() => router.push({ pathname: '/more/community/[entryId]', params: { entryId: entry.id } })}
      style={({ pressed }) => [styles.entry, pressed && styles.pressed]}
    >
      <Text style={type.eyebrow}>{typeLabel(entry.submission_type)}</Text>
      <Text style={styles.entryTitle}>{entry.title}</Text>
      <Text style={type.caption}>{byline}</Text>
      {tags.length > 0 && <Tags items={tags.slice(0, 6)} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tools: { gap: 12 },
  loading: { marginTop: 24 },
  list: { gap: 12 },
  entry: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    gap: 6,
  },
  entryTitle: { fontFamily: fonts.display, fontSize: 23, lineHeight: 27, color: colors.cream },
  pressed: { opacity: 0.75 },
});
