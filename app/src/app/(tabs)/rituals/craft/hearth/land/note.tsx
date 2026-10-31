import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { DayLine, go, HEARTH, q, useDayContext, useLand } from '../../../../../../components/craft/hearth';
import { Body, Card, Chip, Chips, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import { asPlant, herbName, PLANTS } from '../../../../../../lib/craft/green/garden';
import { FROST_MARKS, kindsOf, noteKindLabel, noteTitle, readDay, WATER_LEVELS } from '../../../../../../lib/craft/hearth/land';
import { useCraft } from '../../../../../../lib/craft/store';
import { holyRef, hasHolyPage, moonRef } from '../../../../../../lib/holy';
import { ritualsLibraryHref } from '../../../../../../lib/library';
import { dateFromKey } from '../../../../../../lib/rituals/lifecycle';
import { moonState } from '../../../../../../lib/moon';

// One note on the land: what was seen, where, and the day it was: its moon
// (opening the moon's page), its place on the Wheel and its holy days.
export default function LandNoteScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { notes, names, ready } = useLand();
  const { choice, south } = useDayContext();
  const garden = useCraft<unknown>(PLANTS).entries;
  const entry = notes.find((n) => n.id === id) ?? null;
  const day = useMemo(() => (entry ? readDay(entry.data.on, choice, south) : null), [entry, choice, south]);

  if (!entry || !day) {
    return (
      <RitualScreen back="Land journal">
        <Title>A note</Title>
        <Body>{ready ? 'This note couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const n = entry.data;
  const evening = dateFromKey(n.on)!;
  const moon = moonState(new Date(evening.getFullYear(), evening.getMonth(), evening.getDate(), 21));

  return (
    <RitualScreen back="Land journal">
      <Title eyebrow={kindsOf(n).map(noteKindLabel).join(' · ') || 'Land journal'}>{noteTitle(n)}</Title>
      <DayLine on={n.on} />
      {!!n.placeId && names[n.placeId] && <Chip label={names[n.placeId]} onPress={go(`${HEARTH}/land/place${q({ id: n.placeId })}`)} />}

      <Card>
        {!!n.text && <Body>{n.text}</Body>}
        {!!n.weather && <Body muted>{`Weather: ${n.weather}`}</Body>}
        {!!n.frost && <Body>{FROST_MARKS.find((f) => f.id === n.frost)!.label}</Body>}
        {!!n.water && <Body muted>{`Water: ${WATER_LEVELS.find((w) => w.id === n.water)!.label}`}</Body>}
        {!!n.offering && <Body>{`Offered: ${n.offering}`}</Body>}
      </Card>

      {n.herbs.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Herbs and trees seen</SectionLabel>
          <Chips>
            {n.herbs.map((h) => (
              <Chip key={h} label={herbName(h) ?? h} onPress={() => router.push(ritualsLibraryHref({ id: `traditional:herb:${h}` }) as Href)} />
            ))}
          </Chips>
        </View>
      )}

      {(n.plants.length > 0 || n.potted.length > 0) && (
        <View style={ui.gapSmall}>
          <SectionLabel>Your plants</SectionLabel>
          <Chips>
            {n.plants.map((pid) => {
              const g = garden.find((e) => e.id === pid);
              return <Chip key={pid} label={g ? asPlant(g.data).name : 'A garden plant'} onPress={g ? go(`/rituals/craft/green/plant/${pid}`) : undefined} />;
            })}
            {n.potted.map((p) => (
              <Chip key={p.id} label={p.name} onPress={go('/altar')} />
            ))}
          </Chips>
        </View>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>The day</SectionLabel>
        <List>
          <Row icon="today" title={`${day.moon} that evening`} detail="What this phase of the moon means" onPress={() => router.push({ pathname: '/today/holy/[ref]', params: { ref: moonRef(moon) } })} />
          {day.holy.map((h) => (
            <Row
              key={h.id}
              icon="samhain"
              title={h.name}
              detail={h.traditions.join(', ')}
              onPress={() => (hasHolyPage(h.id) ? router.push({ pathname: '/today/holy/[ref]', params: { ref: holyRef(h.id) } }) : router.push('/today/calendar'))}
            />
          ))}
          <Row icon="wheel" title={day.wheel || 'The Wheel of the Year'} detail={`Your calendars · ${fullDate(n.on)}`} last onPress={() => router.push('/today/calendar')} />
        </List>
      </View>

      <View style={ui.actions}>
        <Button label="Edit this note" variant="outline" onPress={go(`${HEARTH}/land/note-edit${q({ id: entry.id })}`)} />
        <Button label="Make a note today" variant="text" onPress={go(`${HEARTH}/land/note-edit${q({ place: n.placeId })}`)} />
      </View>
    </RitualScreen>
  );
}
