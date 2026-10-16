import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, RitualScreen, SectionLabel, Title, tell, ui } from '../../../../../../components/rituals/ui';
import { relativeDay } from '../../../../../../lib/calendar';
import { ANCESTORS, anniversaryWords, candleDraft, formatPartial, normalizeAncestor, upcomingAnniversaries } from '../../../../../../lib/craft/hedge/ancestors';
import { useCraft } from '../../../../../../lib/craft/store';
import { startRitual } from '../../../../../../lib/rituals/store';
import { type } from '../../../../../../theme';

export default function AncestorPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, ready } = useCraft<unknown>(ANCESTORS);
  const raw = entries.find((e) => e.id === id) ?? null;
  const person = useMemo(() => (raw ? normalizeAncestor(raw.data) : null), [raw]);
  const [busy, setBusy] = useState(false);

  if (!raw || !person) {
    return (
      <RitualScreen back="Ancestors">
        <Title>Ancestor</Title>
        <Body>{ready ? 'This page couldn’t be found. It may have been removed on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }

  const now = new Date();
  // The next of each of their days within the year, soonest first.
  const days = upcomingAnniversaries([{ ...raw, data: person }], now, 366);
  const born = formatPartial(person.born);
  const died = formatPartial(person.died);

  const light = async () => {
    setBusy(true);
    try {
      await startRitual({ kind: 'draft', draft: candleDraft(person) });
      router.replace('/rituals/run');
    } catch (e) {
      tell('Couldn’t begin', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <RitualScreen back="Ancestors">
      <Title eyebrow={person.relation || 'Remembered'}>{person.name || 'Unnamed'}</Title>
      {(!!born || !!died) && <Body muted>{[born ? `Born ${born}` : null, died ? `Died ${died}` : null].filter(Boolean).join(' · ')}</Body>}

      <Card accent>
        <Text style={type.cardTitle}>Light a candle for them</Text>
        <Body>A short guided rite of about ten minutes: light a candle, say their name, remember, and tell them what you need to.</Body>
        <Button label={busy ? 'Beginning…' : 'Light a candle'} onPress={light} disabled={busy} />
        <Body muted>Never leave a flame unattended.</Body>
      </Card>

      {days.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Their days</SectionLabel>
          {days.map((a) => (
            <Body key={a.kind}>{`${anniversaryWords(a)}: ${relativeDay(now, a.date)}`}</Body>
          ))}
        </View>
      )}

      {!!person.loved && (
        <View style={ui.gapSmall}>
          <SectionLabel>What they loved</SectionLabel>
          <Body>{person.loved}</Body>
        </View>
      )}
      {!!person.memory && (
        <View style={ui.gapSmall}>
          <SectionLabel>A memory</SectionLabel>
          <Body>{person.memory}</Body>
        </View>
      )}

      <Button label="Edit" variant="outline" onPress={() => router.push(`/rituals/craft/hedge/ancestors/edit?id=${raw.id}` as Href)} />
    </RitualScreen>
  );
}
