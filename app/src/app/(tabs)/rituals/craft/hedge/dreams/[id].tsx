import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, Chip, Chips, RitualScreen, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { MOON_IN_SIGN } from '../../../../../../lib/astro/meanings';
import { fullDate } from '../../../../../../lib/calendar';
import { symbolReference } from '../../../../../../lib/craft/hedge/dreamSymbols';
import { DREAMS, normalizeDream, returningSymbols, VIVIDNESS } from '../../../../../../lib/craft/hedge/dreams';
import { useCraft } from '../../../../../../lib/craft/store';
import { type } from '../../../../../../theme';

export default function DreamPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, ready } = useCraft<unknown>(DREAMS);
  const all = useMemo(() => entries.map((e) => ({ ...e, data: normalizeDream(e.data) })), [entries]);
  const entry = all.find((e) => e.id === id) ?? null;

  if (!entry) {
    return (
      <RitualScreen back="Dream journal">
        <Title>Dream</Title>
        <Body>{ready ? 'This dream couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }

  const d = entry.data;
  const back = returningSymbols(all, entry);
  const refs = d.symbols.map((s) => ({ s, ref: symbolReference(s) })).filter((x) => x.ref);
  const marks = [d.lucid ? 'Lucid' : null, d.recurring ? 'Recurring' : null, `Vividness ${d.vividness} · ${VIVIDNESS[d.vividness - 1]?.label ?? ''}`].filter(Boolean);

  return (
    <RitualScreen back="Dream journal">
      <Title eyebrow={fullDate(d.date) ?? d.date}>{d.title || 'Untitled dream'}</Title>

      <Card accent>
        <SectionLabel>The moon that night</SectionLabel>
        <Text style={type.cardTitle}>{`${d.moonPhase} in ${d.moonSign}`}</Text>
        {!!MOON_IN_SIGN[d.moonSign] && <Body muted>{MOON_IN_SIGN[d.moonSign].mood}</Body>}
      </Card>

      {!!d.dream && (
        <View style={ui.gapSmall}>
          <SectionLabel>The dream</SectionLabel>
          <Body>{d.dream}</Body>
        </View>
      )}
      {!!d.feelings && (
        <View style={ui.gapSmall}>
          <SectionLabel>Feelings</SectionLabel>
          <Body>{d.feelings}</Body>
        </View>
      )}
      <Chips>
        {marks.map((m) => (
          <Chip key={m as string} label={m as string} />
        ))}
      </Chips>

      {d.symbols.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Symbols</SectionLabel>
          <Chips>
            {d.symbols.map((s) => (
              <Chip key={s} label={s} />
            ))}
          </Chips>
          {back.length > 0 && <Body muted>{`Returning from other dreams: ${back.join(', ')}.`}</Body>}
        </View>
      )}

      {refs.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Places to start</SectionLabel>
          {refs.map(({ s, ref }) => (
            <Card key={s}>
              <Text style={type.cardTitle}>{s}</Text>
              <Body>{ref!.notes}</Body>
              <Body muted>{ref!.ask}</Body>
            </Card>
          ))}
          <Body muted>Your own associations matter most: what does this mean to you?</Body>
        </View>
      )}

      <View style={ui.actions}>
        <Button label="Edit" variant="outline" onPress={() => router.push(`/rituals/craft/hedge/dreams/edit?id=${entry.id}` as Href)} />
      </View>
    </RitualScreen>
  );
}
