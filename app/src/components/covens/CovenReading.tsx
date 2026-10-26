// A coven reading in the chat (lib/covens/reading.ts): the spread laid out,
// a card for the coven in the middle and each member's round it, and a
// button to draw your own. Beginning one: a question, then the coven's card.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { SpreadTable } from '../divination/Spread';
import { Field } from '../rituals/ui';
import { useReducedMotion } from '../../lib/accessibility/store';
import { canDraw, covenSpread, drawnSoFar, type CovenReading } from '../../lib/covens/reading';
import { meaningOf } from '../../lib/divination/draw';
import { colors, radius, type } from '../../theme';

export function CovenReadingCard({
  reading,
  me,
  nameOf,
  onDraw,
  canTalk,
}: {
  reading: CovenReading;
  me: string | null;
  nameOf: (id: string | null) => string;
  onDraw: (reading: CovenReading) => Promise<void>;
  canTalk: boolean;
}) {
  const [width, setWidth] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const still = useReducedMotion();
  const { spread, draw } = covenSpread(reading, (id) => (id === me ? 'You' : nameOf(id)));
  const shown = picked !== null ? draw.items[picked] : null;
  const meaning = shown ? meaningOf(shown) : null;
  const mayDraw = canTalk && canDraw(reading, me);

  const drawMine = async () => {
    setBusy(true);
    try {
      await onDraw(reading);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.card} onLayout={(e) => setWidth(e.nativeEvent.layout.width - 28)}>
      <Text style={[type.eyebrow, styles.gold]}>A coven reading</Text>
      {!!reading.question && <Text style={type.cardTitle}>{reading.question}</Text>}
      {width > 0 && (
        <SpreadTable
          spread={spread}
          draw={draw}
          revealed={draw.items.map(() => true)}
          selected={picked}
          onPress={(i) => setPicked(picked === i ? null : i)}
          still={still}
          width={width}
        />
      )}
      {shown && meaning ? (
        <View style={styles.meaning}>
          <Text style={type.caption}>{spread.positions[picked!]?.name}</Text>
          <Text style={type.body}>{`${shown.name}${shown.reversed ? ', reversed' : ''}`}</Text>
          <Text style={[type.caption, styles.gold]}>{meaning.meaning.keywords}</Text>
          <Text style={type.caption}>{meaning.meaning.text}</Text>
        </View>
      ) : (
        <Text style={type.caption}>Tap a card for its meaning.</Text>
      )}
      <Text style={type.caption}>{drawnSoFar(reading)}</Text>
      {mayDraw && <Button label={busy ? 'Drawing…' : 'Draw my card'} disabled={busy} onPress={() => void drawMine()} />}
    </View>
  );
}

/** Beginning a coven reading: what it's about, then the coven's card is drawn and shared. */
export function BeginCovenReading({ onBegin }: { onBegin: (question: string) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  if (!open) return <Button label="Begin a coven reading" variant="text" onPress={() => setOpen(true)} />;
  const begin = async () => {
    setBusy(true);
    const ok = await onBegin(question);
    setBusy(false);
    if (ok) {
      setQuestion('');
      setOpen(false);
    }
  };
  return (
    <View style={styles.begin}>
      <Text style={type.caption}>A card is drawn for the coven as a whole and shared here. Each member who joins draws their own, up to nine.</Text>
      <Field label="What it’s about (if you like)" value={question} onChange={setQuestion} placeholder="The coming season, a working, the coven itself" />
      <Button label={busy ? 'Drawing…' : 'Draw the coven’s card and share it'} disabled={busy} onPress={() => void begin()} />
      <Button label="Not now" variant="text" onPress={() => setOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 14, gap: 10, marginVertical: 6 },
  gold: { color: colors.gold },
  meaning: { gap: 4 },
  begin: { gap: 8, paddingHorizontal: 12, paddingBottom: 8 },
});
