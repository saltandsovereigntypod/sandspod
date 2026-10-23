import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { SpreadTable } from '../../../../../../components/divination/Spread';
import { Body, Card, Chip, Chips, Field, RitualScreen, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { useReducedMotion } from '../../../../../../lib/accessibility/store';
import { fullDate } from '../../../../../../lib/calendar';
import { glossOf, methodLabel, normalizeReading, READINGS } from '../../../../../../lib/craft/hedge/readings';
import { updateEntry, useCraft } from '../../../../../../lib/craft/store';
import { drawOfReading, meaningOf } from '../../../../../../lib/divination/draw';
import { localDateKey } from '../../../../../../lib/rituals/lifecycle';
import { type } from '../../../../../../theme';

export default function ReadingPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, ready } = useCraft<unknown>(READINGS);
  const raw = entries.find((e) => e.id === id) ?? null;
  const reading = useMemo(() => (raw ? normalizeReading(raw.data) : null), [raw]);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [width, setWidth] = useState(0);
  const still = useReducedMotion();
  const laid = useMemo(() => (reading ? drawOfReading(reading) : null), [reading]);

  if (!raw || !reading) {
    return (
      <RitualScreen back="Readings">
        <Title>Reading</Title>
        <Body>{ready ? 'This reading couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }

  const today = localDateKey(new Date());
  const due = !!reading.lookBack && reading.lookBack <= today && !reading.outcome.trim();
  const writing = outcome !== null || due;
  const text = outcome ?? reading.outcome;

  const saveOutcome = async () => {
    setSaving(true);
    try {
      await updateEntry(READINGS, raw.id, { ...reading, outcome: text.trim(), outcomeDate: text.trim() ? today : '' });
      setOutcome(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RitualScreen back="Readings">
      <Title eyebrow={`${methodLabel(reading.method)} · ${fullDate(reading.date) ?? reading.date}`}>{reading.question || 'A reading'}</Title>
      <Body muted>{`Under a ${reading.moonPhase}`}</Body>

      {laid && (
        <View style={ui.gap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {width > 0 && (
            <SpreadTable
              spread={laid.spread}
              draw={laid.draw}
              revealed={laid.draw.items.map(() => true)}
              selected={picked}
              onPress={(i) => setPicked(picked === i ? null : i)}
              still={still}
              width={width}
            />
          )}
          <DrawnMeaning laid={laid} picked={picked} />
        </View>
      )}

      {reading.drawn.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Drawn</SectionLabel>
          <Chips>
            {reading.drawn.map((n, i) => {
              const gloss = glossOf(n);
              return <Chip key={n} label={`${i + 1}. ${n}${gloss ? ` · ${gloss}` : ''}`} />;
            })}
          </Chips>
        </View>
      )}
      {!!reading.cameUp && (
        <View style={ui.gapSmall}>
          <SectionLabel>What came up</SectionLabel>
          <Body>{reading.cameUp}</Body>
        </View>
      )}
      {!!reading.interpretation && (
        <View style={ui.gapSmall}>
          <SectionLabel>What you made of it</SectionLabel>
          <Body>{reading.interpretation}</Body>
        </View>
      )}

      <Card accent={due}>
        <SectionLabel>Looking back</SectionLabel>
        {writing ? (
          <>
            {due && <Body>{`You said you’d come back to this on ${fullDate(reading.lookBack)}. What happened? Was the reading right, wrong, or right in a way you didn’t expect?`}</Body>}
            <Field label="What happened" value={text} onChange={setOutcome} placeholder="In your own words" multiline />
            <Button label={saving ? 'Saving…' : 'Save what happened'} onPress={saveOutcome} disabled={saving || !text.trim()} />
          </>
        ) : reading.outcome ? (
          <>
            <Body>{reading.outcome}</Body>
            {!!reading.outcomeDate && <Body muted>{`Written ${fullDate(reading.outcomeDate)}`}</Body>}
            <Button label="Add to this" variant="text" onPress={() => setOutcome(reading.outcome)} />
          </>
        ) : reading.lookBack ? (
          <>
            <Body>{`It will come back to you on ${fullDate(reading.lookBack)}.`}</Body>
            <Button label="Write what happened now" variant="text" onPress={() => setOutcome('')} />
          </>
        ) : (
          <Button label="Write what happened" variant="text" onPress={() => setOutcome('')} />
        )}
      </Card>

      <Button label="Edit" variant="outline" onPress={() => router.push(`/rituals/craft/hedge/readings/edit?id=${raw.id}` as Href)} />
    </RitualScreen>
  );
}

/** The meaning of the card, rune or stave tapped in a kept draw. */
function DrawnMeaning({ laid, picked }: { laid: NonNullable<ReturnType<typeof drawOfReading>>; picked: number | null }) {
  if (picked === null) return <Body muted>Tap one for its meaning.</Body>;
  const item = laid.draw.items[picked];
  const m = item ? meaningOf(item) : null;
  if (!m) return null;
  const place = laid.spread.positions.length > 1 ? laid.spread.positions[picked] : null;
  return (
    <Card accent>
      <SectionLabel>{place ? `${picked + 1} · ${place.name}` : laid.spread.label}</SectionLabel>
      <Text style={type.cardTitle}>{`${m.glyph ? `${m.glyph}  ` : ''}${m.name}${m.reversed ? ', reversed' : ''}`}</Text>
      <Text style={[type.body, ui.gold]}>{m.meaning.keywords}</Text>
      <Body>{m.meaning.text}</Body>
    </Card>
  );
}
