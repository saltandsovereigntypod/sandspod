import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { longDate, relativeDay } from '../../../../../../lib/calendar';
import { ANCESTORS, ancestorDays, anniversaryWords, lifespan, normalizeAncestor, upcomingAnniversaries } from '../../../../../../lib/craft/hedge/ancestors';
import { useCraft } from '../../../../../../lib/craft/store';
import { holidayChoice } from '../../../../../../lib/holidays';
import { useMySettings } from '../../../../../../lib/settings/store';
import { type } from '../../../../../../theme';

export default function Ancestors() {
  const { entries, ready } = useCraft<unknown>(ANCESTORS);
  const { settings } = useMySettings();
  const now = useMemo(() => new Date(), []);
  const people = useMemo(
    () => entries.map((e) => ({ ...e, data: normalizeAncestor(e.data) })).sort((a, b) => a.data.name.localeCompare(b.data.name)),
    [entries],
  );
  const anniversaries = useMemo(() => upcomingAnniversaries(people, now, 30), [people, now]);
  const days = useMemo(() => ancestorDays(holidayChoice(settings), now, 30), [settings, now]);

  return (
    <RitualScreen back="Hedge">
      <Title eyebrow="The beloved dead">Ancestors</Title>
      <Body muted>Your blood family, the family you chose, teachers, friends, and those whose names are lost. Anyone you carry.</Body>

      {(anniversaries.length > 0 || days.length > 0) && (
        <View style={ui.gapSmall}>
          <SectionLabel>In the next 30 days</SectionLabel>
          {anniversaries.length > 0 && (
            <List>
              {anniversaries.map((a, i) => (
                <Row
                  key={`${a.id}-${a.kind}`}
                  icon="samhain"
                  title={a.name}
                  detail={`${anniversaryWords(a)} · ${relativeDay(now, a.date)}`}
                  last={i === anniversaries.length - 1}
                  onPress={() => router.push(`/rituals/craft/hedge/ancestors/${a.id}` as Href)}
                />
              ))}
            </List>
          )}
          {days.map((d) => (
            <Card key={d.name}>
              <Text style={type.cardTitle}>{d.name}</Text>
              <Body muted>{`${longDate(d.date)}${d.days > 1 ? ` · ${d.days} days` : ''} · ${relativeDay(now, d.date)}`}</Body>
              <Body>{d.meaning}</Body>
            </Card>
          ))}
        </View>
      )}

      <Button label="Add someone" onPress={() => router.push('/rituals/craft/hedge/ancestors/edit' as Href)} />

      {!ready ? (
        <Body muted>Opening…</Body>
      ) : people.length === 0 ? (
        <Card>
          <Body>Add the people you remember. Dates can be as much as you know, even a year alone. Their birth and death days will be here when they come round, with a candle to light for them.</Body>
        </Card>
      ) : (
        <View style={ui.gapSmall}>
          <SectionLabel>Remembered</SectionLabel>
          <List>
            {people.map((p, i) => (
              <Row
                key={p.id}
                icon="samhain"
                title={p.data.name || 'Unnamed'}
                detail={[p.data.relation, lifespan(p.data)].filter(Boolean).join(' · ') || null}
                last={i === people.length - 1}
                onPress={() => router.push(`/rituals/craft/hedge/ancestors/${p.id}` as Href)}
              />
            ))}
          </List>
        </View>
      )}

      <List>
        <Row
          icon="rituals"
          title="Ancestor Altar & Candle Evening"
          detail="A longer evening with all your dead"
          last
          onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: 'hedge-ancestor-candle-evening' } })}
        />
      </List>
      <List>
        <Row
          icon="calendar"
          title="Ancestor days"
          detail="Samhain, Dziady, All Souls, Parentalia and Winter Nights come from the calendars you keep: Settings → Calendar"
          last
          onPress={() => router.push('/more/settings/calendar' as Href)}
        />
      </List>
    </RitualScreen>
  );
}
