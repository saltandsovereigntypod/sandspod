import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';

import { Button } from '../../../../components/Button';
import { Body, Card, Chip, Chips, Field, List, Notice, RitualScreen, Row, SectionLabel, Title } from '../../../../components/rituals/ui';
import { newEntryHref, useTimelineLists } from '../../../../components/journal/useTimeline';
import { dueItems, itemLookBack } from '../../../../lib/altar/apothecaryLookBack';
import { useWorkshop } from '../../../../lib/altar/workshop';
import { fullDate } from '../../../../lib/calendar';
import { isTimelineKind, kindCounts, mergeTimeline, searchTimeline, TIMELINE_KINDS, timelineKindLabel, type TimelineKind } from '../../../../lib/journal/timeline';
import { dueLookBacks, readLookBack } from '../../../../lib/rituals/lookBack';
import { refresh, useRituals } from '../../../../lib/rituals/store';

const PAGE = 60;

// The one Journal: rituals, dreams, readings, meditation sits, cycle notes and
// the four practice journals (Shadow work, Deity & spirit, Ancestors, Omens &
// signs), newest first, narrowed by kind. Each entry stays in its own store
// and opens its own page; the old hubs (/rituals/journals, /grimoire/journals)
// arrive here. Merging and sorting: lib/journal/timeline.ts.
export default function Journal() {
  const params = useLocalSearchParams<{ kind?: string }>();
  const rituals = useRituals();
  const due = useMemo(() => dueLookBacks(rituals.journal, new Date()), [rituals.journal]);
  const { apothecary } = useWorkshop();
  const dueMade = useMemo(() => dueItems(apothecary, new Date()), [apothecary]);
  const withLookBack = apothecary.filter((i) => !!itemLookBack(i)).length;
  const { lists, cycleLocked } = useTimelineLists();
  const [only, setOnly] = useState<TimelineKind | null>(isTimelineKind(params.kind) ? params.kind : null);
  const [query, setQuery] = useState('');
  const [picking, setPicking] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const all = useMemo(() => mergeTimeline(lists), [lists]);
  const counts = useMemo(() => kindCounts(all), [all]);
  const items = useMemo(() => searchTimeline(only ? all.filter((i) => i.kind === only) : all, query), [all, only, query]);
  const onlyDef = TIMELINE_KINDS.find((k) => k.kind === only);

  return (
    <RitualScreen back="Back" onRefresh={refresh}>
      <Title eyebrow={`${all.length} ${all.length === 1 ? 'entry' : 'entries'}`}>Journal</Title>
      <Body muted>Everything you keep, newest first: rituals, dreams, readings, sits, cycle notes and your practice journals.</Body>
      {rituals.status === 'offline' && <Notice>Couldn’t refresh just now · showing the copy saved on this phone</Notice>}
      <Button label={picking ? 'Close' : 'New entry'} variant={picking ? 'outline' : undefined} onPress={() => setPicking((p) => !p)} />
      {picking && (
        <List>
          {TIMELINE_KINDS.map((k, i) => (
            <Row
              key={k.kind}
              icon="grimoire"
              title={k.write}
              last={i === TIMELINE_KINDS.length - 1}
              onPress={() => {
                setPicking(false);
                router.push(newEntryHref(k.kind) as Href);
              }}
            />
          ))}
        </List>
      )}

      {due.length + dueMade.length > 0 && (
        <>
          <SectionLabel>Did it work?</SectionLabel>
          <List>
            {due.map((entry, i) => (
              <Row
                key={entry.id}
                icon="grimoire"
                title={entry.title || 'Untitled Ritual'}
                detail={`Look back since ${fullDate(readLookBack(entry)?.date) ?? ''}`}
                last={i === due.length - 1 && !dueMade.length}
                onPress={() => router.push({ pathname: '/rituals/journal/[id]', params: { id: entry.id } })}
              />
            ))}
            {dueMade.map((item, i) => (
              <Row
                key={item.id}
                icon="altar"
                title={item.name}
                detail={`${item.typeLabel} · look back since ${fullDate(itemLookBack(item)?.date) ?? ''}`}
                last={i === dueMade.length - 1}
                onPress={() => router.push({ pathname: '/rituals/apothecary/[id]', params: { id: item.id } })}
              />
            ))}
          </List>
        </>
      )}

      <Chips>
        <Chip label="All" selected={!only} onPress={() => setOnly(null)} />
        {TIMELINE_KINDS.map((k) => (
          <Chip
            key={k.kind}
            label={counts[k.kind] ? `${k.label} ${counts[k.kind]}` : k.label}
            selected={only === k.kind}
            onPress={() => setOnly(only === k.kind ? null : k.kind)}
          />
        ))}
      </Chips>
      {all.length > 0 && <Field label="Search your journal" value={query} onChange={setQuery} placeholder="A word, a card, a god, a feeling…" />}
      {only === 'cycle' && cycleLocked && <Notice>Your cycle notes are locked on this device · open Cycle & Moon to unlock them</Notice>}

      {items.length === 0 ? (
        <Card>
          <Body>
            {all.length === 0
              ? 'Nothing kept yet. Finish a ritual, write down a dream, log a reading or a sit, and it will be kept here.'
              : query
                ? 'Nothing matches that.'
                : `No ${onlyDef ? onlyDef.label.toLowerCase() : 'entries'} yet.`}
          </Body>
          {onlyDef && <Button label={onlyDef.write} variant="outline" onPress={() => router.push(newEntryHref(onlyDef.kind) as Href)} />}
        </Card>
      ) : (
        <List>
          {items.slice(0, shown).map((item, i, list) => (
            <Row
              key={`${item.kind}:${item.id}`}
              icon={item.kind === 'ritual' ? 'rituals' : item.kind === 'reading' ? 'wheel' : item.kind === 'sit' || item.kind === 'cycle' ? 'today' : 'grimoire'}
              title={item.title}
              detail={[only ? null : timelineKindLabel(item.kind), item.date ? fullDate(item.date)?.replace(/, \d{4}$/, '') : null, item.detail].filter(Boolean).join(' · ')}
              last={i === list.length - 1}
              onPress={() => router.push(item.href as Href)}
            />
          ))}
        </List>
      )}
      {items.length > shown && <Button label={`Show more (${items.length - shown})`} variant="outline" onPress={() => setShown((n) => n + PAGE)} />}

      <SectionLabel>More from your journal</SectionLabel>
      <List>
        <Row icon="today" title="Your moon" detail="Patterns in your rituals: which moons you work under, and what for" onPress={() => router.push('/rituals/journal/insights')} />
        <Row icon="grimoire" title="Dream symbols" detail="The symbols that come back in your dreams" onPress={() => router.push('/grimoire/dreams/symbols' as Href)} />
        <Row icon="calendar" title="Reading patterns" detail="The cards you draw most, by moon and day" onPress={() => router.push('/rituals/divination/patterns' as Href)} />
        {apothecary.length > 0 && (
          <Row
            icon="altar"
            title="Apothecary: jars & sachets"
            detail={withLookBack ? `Did they work? ${withLookBack} with a look-back day` : 'Did they work? Choose a day to look back'}
            onPress={() => router.push('/rituals/apothecary')}
          />
        )}
        <Row icon="grimoire" title="Where journals are kept" detail="Show each practice journal in your Grimoire as well, or only here" last onPress={() => router.push('/more/settings/book' as Href)} />
      </List>
    </RitualScreen>
  );
}
