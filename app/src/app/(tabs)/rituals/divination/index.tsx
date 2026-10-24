import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Card, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { fullDate, relativeDay } from '../../../../lib/calendar';
import {
  comeBackTo,
  frequentDraws,
  methodLabel,
  METHODS,
  normalizeReading,
  READINGS,
  searchReadings,
  sortReadings,
  waiting,
  type ReadingEntry,
  type ReadingMethod,
} from '../../../../lib/craft/hedge/readings';
import { useCraft } from '../../../../lib/craft/store';
import { dateFromKey } from '../../../../lib/rituals/lifecycle';

const open = (id: string) => router.push(`/rituals/divination/${id}` as Href);

function detail(e: ReadingEntry): string {
  const d = e.data;
  return [methodLabel(d.method), fullDate(d.date)?.replace(/, \d{4}$/, ''), d.drawn.slice(0, 3).join(', ') || null, d.outcome ? 'looked back' : null].filter(Boolean).join(' · ');
}

export default function Readings() {
  const { entries, ready } = useCraft<unknown>(READINGS);
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState<ReadingMethod | null>(null);
  const now = useMemo(() => new Date(), []);
  const all = useMemo(() => sortReadings(entries.map((e) => ({ ...e, data: normalizeReading(e.data) }))), [entries]);
  const due = useMemo(() => comeBackTo(all, now), [all, now]);
  const later = useMemo(() => waiting(all, now), [all, now]);
  const found = useMemo(() => searchReadings(all, query, method), [all, query, method]);
  const repeats = useMemo(() => frequentDraws(all, 6), [all]);
  const used = METHODS.filter((m) => all.some((e) => e.data.method === m.id));

  return (
    <RitualScreen back="Back">
      <Title eyebrow={all.length ? `${all.length} ${all.length === 1 ? 'reading' : 'readings'}` : 'For every practice'}>Divination</Title>
      <View style={ui.actions}>
        <Button label="Draw cards, runes or ogham" onPress={() => router.push('/rituals/divination/draw' as Href)} />
        <Button label="Log a reading" variant="outline" onPress={() => router.push('/rituals/divination/edit' as Href)} />
        <Button label="Make a spread" variant="text" onPress={() => router.push('/rituals/divination/spread' as Href)} />
      </View>

      {!ready ? (
        <Body muted>Opening…</Body>
      ) : all.length === 0 ? (
        <Card>
          <Body>Draw cards, runes or ogham here, or log a reading you did by hand: what you asked, what came up and what you made of it, and a day to come back. When that day comes, the reading waits here for you to write what really happened: the best way to learn your own cards, runes and cup.</Body>
        </Card>
      ) : (
        <>
          {due.length > 0 && (
            <View style={ui.gapSmall}>
              <SectionLabel>Come back to</SectionLabel>
              <Body muted>Their look-back day has come. What happened?</Body>
              <List>
                {due.map((e, i) => (
                  <Row key={e.id} icon="wheel" title={e.data.question || 'A reading'} detail={detail(e)} last={i === due.length - 1} onPress={() => open(e.id)} />
                ))}
              </List>
            </View>
          )}

          {later.length > 0 && (
            <View style={ui.gapSmall}>
              <SectionLabel>Waiting</SectionLabel>
              <List>
                {later.slice(0, 5).map((e, i, list) => {
                  const day = dateFromKey(e.data.lookBack);
                  return (
                    <Row
                      key={e.id}
                      icon="calendar"
                      title={e.data.question || 'A reading'}
                      detail={`${methodLabel(e.data.method)} · look back ${day ? relativeDay(now, day) : e.data.lookBack}`}
                      last={i === list.length - 1}
                      onPress={() => open(e.id)}
                    />
                  );
                })}
              </List>
            </View>
          )}

          {repeats.length > 0 && (
            <View style={ui.gapSmall}>
              <SectionLabel>Turning up again</SectionLabel>
              <Chips>
                {repeats.map((r) => (
                  <Chip key={r.name} label={`${r.name} · ${r.count}`} a11yLabel={`${r.name}, in ${r.count} readings. Search for it`} onPress={() => setQuery(r.name)} />
                ))}
              </Chips>
            </View>
          )}

          <View style={ui.gapSmall}>
            <SectionLabel>All readings</SectionLabel>
            <Field label="Search readings" value={query} onChange={setQuery} placeholder="A question, a card, a word" />
            {used.length > 1 && (
              <Chips>
                <Chip label="All" selected={method === null} onPress={() => setMethod(null)} />
                {used.map((m) => (
                  <Chip key={m.id} label={m.label} selected={method === m.id} onPress={() => setMethod(method === m.id ? null : m.id)} />
                ))}
              </Chips>
            )}
            {found.length === 0 ? (
              <Body muted>No readings match that.</Body>
            ) : (
              <List>
                {found.map((e, i) => (
                  <Row key={e.id} icon="grimoire" title={e.data.question || 'A reading'} detail={detail(e)} last={i === found.length - 1} onPress={() => open(e.id)} />
                ))}
              </List>
            )}
          </View>
        </>
      )}
    </RitualScreen>
  );
}
