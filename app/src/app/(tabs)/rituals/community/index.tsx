import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Card, Chip, Chips, Field, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { showEverything, useHiddenCommunity } from '../../../../lib/community/hidden';
import {
  COMMUNITY_KINDS,
  COMMUNITY_MOONS,
  COMMUNITY_SORTS,
  communityFacets,
  filterCommunity,
  isRitualHidden,
  mySharesLine,
  ritualFacts,
  savesLabel,
  sharerName,
  type CommunityFilter,
  type CommunitySort,
} from '../../../../lib/rituals/community';
import { useIsRitualModerator, useMyShares, usePublishedRituals } from '../../../../lib/rituals/communityApi';
import { useSession } from '../../../../lib/session';
import { colors } from '../../../../theme';

type Facet = 'tradition' | 'deity' | 'occasion' | 'material';

// Community Rituals: rituals and spells the community has shared, reviewed
// first. Search by sharer, title, kind, tradition, deity, occasion, moon or
// what it needs; open one to add it to your rituals or do it once. The
// website's /rituals/community/ is the same page.
export default function CommunityRituals() {
  const params = useLocalSearchParams<{ sharer?: string; sharerName?: string }>();
  const { session } = useSession();
  const { data, status, refresh } = usePublishedRituals();
  const mine = useMyShares();
  const moderator = useIsRitualModerator();
  const hidden = useHiddenCommunity();
  const [filter, setFilter] = useState<CommunityFilter>({ query: '', sort: 'newest', sharer: params.sharer ?? null });
  const [more, setMore] = useState(false);

  const rituals = useMemo(() => (data?.rituals ?? []).filter((r) => !isRitualHidden(r, hidden)), [data, hidden]);
  const facets = useMemo(() => communityFacets(rituals), [rituals]);
  const shown = useMemo(() => filterCommunity(rituals, filter), [rituals, filter]);
  const set = (patch: Partial<CommunityFilter>) => setFilter((f) => ({ ...f, ...patch }));
  const toggle = (name: keyof CommunityFilter, value: string) => set({ [name]: filter[name] === value ? null : value } as Partial<CommunityFilter>);
  const filtering = !!(filter.query.trim() || filter.kind || filter.moon || filter.tradition || filter.deity || filter.occasion || filter.material || filter.sharer);
  const hiding = hidden.posts.length + hidden.authors.length > 0;

  const facetChips = (label: string, name: Facet, values: string[]) =>
    values.length > 0 && (
      <View style={ui.gapSmall}>
        <Body muted>{label}</Body>
        <Chips>
          {values.map((v) => (
            <Chip key={v} label={v} selected={filter[name] === v} onPress={() => toggle(name, v)} />
          ))}
        </Chips>
      </View>
    );

  return (
    <RitualScreen back="Rituals" onRefresh={refresh}>
      <Title eyebrow="Shared by the community">Community Rituals</Title>
      <Body>Rituals, spells and rites the Salt &amp; Sovereignty community has shared, each reviewed before it appears. Add one to your rituals, or do it once.</Body>

      {data && !data.ready && (
        <Card>
          <Body>Community Rituals is on its way. Shared rituals will appear here once it opens.</Body>
        </Card>
      )}

      {status === 'offline' && data && <Notice>Couldn’t refresh just now · showing the copy saved on this phone</Notice>}
      {!data && status === 'offline' && (
        <Card>
          <Body>Community Rituals couldn’t open. Check your connection and try again.</Body>
          <Button label="Try again" variant="outline" onPress={refresh} />
        </Card>
      )}
      {!data && status !== 'offline' && <ActivityIndicator color={colors.gold} />}

      {session ? (
        <List>
          <Row icon="rituals" title="Share a ritual" detail="One of your templates, or a coven’s you lead" onPress={() => router.push('/rituals/community/share')} />
          <Row
            icon="grimoire"
            title="My shared rituals"
            detail={mine.data?.ready ? mySharesLine(mine.data.mine) : 'What you’ve shared and where each stands'}
            last={!moderator}
            onPress={() => router.push('/rituals/community/mine')}
          />
          {moderator && <Row icon="bell" title="Review shared rituals" detail="Publish, return or decline" last onPress={() => router.push('/rituals/community/review')} />}
        </List>
      ) : (
        <Body muted>Sign in to share your own rituals, and to add these to yours.</Body>
      )}

      {data?.ready && (
        <Card>
          <Field label="Search" value={filter.query} onChange={(query) => set({ query })} placeholder="Sharer, title, deity, herb, Samhain…" />
          <View style={ui.gapSmall}>
            <Body muted>Kind</Body>
            <Chips>
              {COMMUNITY_KINDS.map((k) => (
                <Chip key={k.value} label={k.label} selected={filter.kind === k.value} onPress={() => toggle('kind', k.value)} />
              ))}
            </Chips>
          </View>
          <View style={ui.gapSmall}>
            <Body muted>Moon</Body>
            <Chips>
              {COMMUNITY_MOONS.map((m) => (
                <Chip key={m.value} label={m.label} selected={filter.moon === m.value} onPress={() => toggle('moon', m.value)} />
              ))}
            </Chips>
          </View>
          {more ? (
            <>
              {facetChips('Tradition or path', 'tradition', facets.traditions)}
              {facetChips('Deity', 'deity', facets.deities)}
              {facetChips('Occasion or holiday', 'occasion', facets.occasions)}
              {facetChips('What it needs', 'material', facets.materials)}
            </>
          ) : (
            <Button label="More filters" variant="text" onPress={() => setMore(true)} />
          )}
          <View style={ui.gapSmall}>
            <Body muted>Sort</Body>
            <Chips>
              {COMMUNITY_SORTS.map((s) => (
                <Chip key={s.value} label={s.label} selected={filter.sort === s.value} onPress={() => set({ sort: s.value as CommunitySort })} />
              ))}
            </Chips>
          </View>
          {filtering && <Button label="Clear the search and filters" variant="text" onPress={() => setFilter({ query: '', sort: filter.sort })} />}
        </Card>
      )}

      {data?.ready && (
        <View style={ui.gapSmall}>
          <SectionLabel>
            {filter.sharer
              ? `From ${params.sharerName || 'this sharer'}`
              : filtering
                ? `${shown.length} ${shown.length === 1 ? 'ritual' : 'rituals'}`
                : `${rituals.length} shared ${rituals.length === 1 ? 'ritual' : 'rituals'}`}
          </SectionLabel>
          {shown.length ? (
            <List>
              {shown.map((r, i) => (
                <Row
                  key={r.id}
                  icon="rituals"
                  title={r.title}
                  detail={[sharerName(r), ritualFacts(r), savesLabel(r.save_count)].filter(Boolean).join(' · ')}
                  last={i === shown.length - 1}
                  onPress={() => router.push({ pathname: '/rituals/community/[id]', params: { id: r.id } })}
                />
              ))}
            </List>
          ) : (
            <Card>
              <Body>{rituals.length ? 'Nothing matches all of those. Try fewer filters.' : 'Nothing has been shared yet. Yours could be the first.'}</Body>
            </Card>
          )}
        </View>
      )}

      {hiding && <Button label="Show rituals and people you’ve hidden" variant="text" onPress={showEverything} />}
    </RitualScreen>
  );
}
