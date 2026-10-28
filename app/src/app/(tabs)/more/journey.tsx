import { router, type Href } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { Chips, MenuList, MenuRow, MoreScreen, Paragraphs, Section } from '../../../components/more/ui';
import { useWorkshop } from '../../../lib/altar/workshop';
import {
  buildTimeline,
  CATEGORY_LABELS,
  categoriesOf,
  chronicleRecords,
  filterEvents,
  groupEvents,
  milestones,
  recentThreads,
  reflectiveSummary,
  type ChronicleTarget,
  type Direction,
  type Grouping,
} from '../../../lib/chronicle';
import { useGrimoire } from '../../../lib/grimoire/store';
import { MY_CHRONICLE } from '../../../lib/names';
import { libraryHref, useLibrary } from '../../../lib/library';
import { useRituals } from '../../../lib/rituals/store';
import { useMySettings } from '../../../lib/settings/store';
import { colors, fonts, radius, touch, type } from '../../../theme';

const INTRO =
  'Every practice tells a story. Some chapters are full of rituals, discoveries, and devotion. Others are quieter, marked only by a journal entry, an offering, or the lighting of a candle. My chronicle is not a measure of progress. It gathers the threads of your practice so you can remember how your path unfolded.';

const DIRECTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
] as const;
const GROUPINGS = [
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
] as const;

// Records open inside the More tab, so Back comes straight back to the chronicle.
function hrefFor(target: ChronicleTarget): Href {
  switch (target.kind) {
    case 'entry':
      return libraryHref({ id: target.id });
    case 'page':
      return { pathname: '/more/page/[pageId]', params: { pageId: target.id } };
    case 'journal':
      return { pathname: '/more/journal/[id]', params: { id: target.id } };
    case 'template':
      return { pathname: '/more/templates/[id]', params: { id: target.id } };
    default:
      return '/rituals/run';
  }
}

/** My chronicle (once My Journey): the Sanctuary's personal chronicle (the website's My Sanctuary → My Journey). */
export default function Journey() {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const [category, setCategory] = useState('all');
  const [direction, setDirection] = useState<Direction>('newest');
  const [grouping, setGrouping] = useState<Grouping>('month');

  const { entries, relations } = useLibrary();
  const { snapshot } = useGrimoire();
  const { apothecary } = useWorkshop();
  const { journal, templates, active } = useRituals();
  const { settings } = useMySettings();
  const layers = useMemo(() => {
    const s = (settings ?? {}) as Record<string, unknown>;
    return { traditional: s.library_traditional_enabled !== false, myPractice: s.library_myPractice_enabled !== false, community: s.library_community_enabled !== false };
  }, [settings]);

  const all = useMemo(
    () =>
      buildTimeline(
        chronicleRecords({
          library: entries,
          relations,
          pages: snapshot?.pages ?? [],
          blocks: snapshot?.blocks ?? [],
          apothecary,
          journal,
          templates,
          active,
          layers,
        }),
      ),
    [entries, relations, snapshot, apothecary, journal, templates, active, layers],
  );
  const categories = useMemo(
    () => [{ value: 'all', label: 'All' }, ...categoriesOf(all).map((key) => ({ value: key, label: CATEGORY_LABELS[key] || key }))],
    [all],
  );
  const groups = useMemo(
    () => groupEvents(filterEvents(all, { query: deferred, category, direction }), grouping),
    [all, deferred, category, direction, grouping],
  );
  const firsts = useMemo(() => milestones(all), [all]);
  const patterns = useMemo(() => reflectiveSummary(all), [all]);
  const threads = useMemo(() => recentThreads(all), [all]);
  const nameOf = (entityId: string) => entries.find((entry) => entry.id === entityId)?.name;

  return (
    <MoreScreen title={MY_CHRONICLE} eyebrow="A Personal Chronicle" back="/more" backLabel="Back to More">
      <Text style={type.body}>{INTRO}</Text>

      {all.length > 0 ? (
        <>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search this chronicle"
            placeholderTextColor={colors.tabInactive}
            accessibilityLabel="Search this chronicle"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={styles.input}
          />
          <Chips label="Show" options={categories} value={categories.some((c) => c.value === category) ? category : 'all'} onChange={setCategory} />
          <Chips label="Order" options={DIRECTIONS} value={direction} onChange={setDirection} />
          <Chips label="Group by" options={GROUPINGS} value={grouping} onChange={setGrouping} />

          {groups.length === 0 && <Text style={type.body}>Nothing in your chronicle matches this yet.</Text>}
          {groups.map((group) => (
            <Section key={group.label} label={group.label}>
              <MenuList>
                {group.items.map((event, index) => {
                  const target = event.target;
                  return (
                    <MenuRow
                      key={`${event.source}:${event.id}:${event.timestamp}`}
                      label={event.title}
                      detail={[new Date(event.timestamp).toLocaleDateString(), event.description].filter(Boolean).join(' · ')}
                      last={index === group.items.length - 1}
                      onPress={target ? () => router.push(hrefFor(target)) : undefined}
                    />
                  );
                })}
              </MenuList>
            </Section>
          ))}

          {firsts.length > 0 && (
            <Section label="First Pages">
              {firsts.map((item) => (
                <Text key={item.label} style={type.body}>
                  <Text style={styles.strong}>{item.label}</Text>
                  {`\n${item.event.title}`}
                </Text>
              ))}
            </Section>
          )}
          {patterns.length > 0 && (
            <Section label="Recorded Patterns">
              <Paragraphs items={patterns} />
            </Section>
          )}
          {threads.length > 0 && (
            <Section label="Recent Threads">
              <Paragraphs items={threads.map((thread) => (nameOf(thread.entityId) ? `${nameOf(thread.entityId)}: ${thread.text}` : thread.text))} />
            </Section>
          )}
        </>
      ) : (
        <Section>
          <Text style={type.body}>Your recorded journey begins with the first thing you choose to keep.</Text>
          <MenuList>
            <MenuRow label="Open your Grimoire" onPress={() => router.push('/grimoire')} />
            <MenuRow label="Visit the Altar" onPress={() => router.push('/altar')} />
            <MenuRow label="Create or Open a Ritual" last onPress={() => router.push('/rituals')} />
          </MenuList>
        </Section>
      )}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  strong: { fontFamily: fonts.bodySemi, color: colors.cream },
});
