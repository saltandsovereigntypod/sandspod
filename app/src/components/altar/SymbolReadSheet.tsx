import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../Button';
import { readSigns, SMOKE_FORMS, WAX_FORMS, type SignKind, type SignReading } from '../../lib/divination/smokeWax';
import { TEA_SYMBOLS } from '../../lib/divination/teaSymbols';
import { localDateKey } from '../../lib/rituals/lifecycle';
import { findSymbols } from '../../lib/symbolReading';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

export type SignPick = { forms: string[]; shapes: string[]; question: string };

const COPY = {
  smoke: {
    title: 'Read the smoke',
    help: 'Watch the smoke for a minute while the room is still: how it rises, where it leans, and any shape you see in it. Smoke-reading is old but thinly recorded; the meanings here are modern folk usage.',
    forms: 'How did it move?',
    keep: 'Keep the smoke reading',
  },
  wax: {
    title: 'Pour and read wax',
    help: 'Let a little wax drip from the lit candle into a bowl of cold water, wait for it to set, lift it out and turn it in the light. Read how it came out and any shape it brings to mind. Never leave the flame unattended, and use a heatproof bowl.',
    forms: 'What did the wax do?',
    keep: 'Keep the wax reading',
  },
} as const;

/**
 * Smoke from incense, or wax poured into water: pick how it moved or set and
 * the shapes you see (the same shapes as tea leaves), and read it. The reading
 * is kept in the reading log and shown on the stage like any other.
 */
export function SymbolReadSheet({
  visible,
  kind,
  object,
  onClose,
  onKeep,
}: {
  visible: boolean;
  kind: SignKind;
  object: string;
  onClose: () => void;
  onKeep: (pick: SignPick, reading: SignReading) => void;
}) {
  const [forms, setForms] = useState<string[]>([]);
  const [shapes, setShapes] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [question, setQuestion] = useState('');
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!visible) return;
    /* eslint-disable react-hooks/set-state-in-effect -- a fresh reading each time it opens */
    setForms([]);
    setShapes([]);
    setQuery('');
    setQuestion('');
    setShown(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [visible]);

  const copy = COPY[kind];
  const list = kind === 'smoke' ? SMOKE_FORMS : WAX_FORMS;
  const found = useMemo(() => findSymbols(TEA_SYMBOLS, query).slice(0, 18), [query]);
  const reading = useMemo(
    () => (shown ? readSigns({ kind, forms, shapes, question, date: localDateKey(new Date()), label: object }) : null),
    [shown, kind, forms, shapes, question, object],
  );
  const flip = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  return (
    <Sheet visible={visible} eyebrow={object} title={copy.title} onClose={onClose} size="full">
      <Text style={type.caption}>{copy.help}</Text>
      <TextInput
        accessibilityLabel="What you asked"
        value={question}
        onChangeText={(t) => {
          setQuestion(t);
          setShown(false);
        }}
        placeholder="What you asked (if anything)"
        placeholderTextColor="rgba(202,191,157,0.6)"
        style={styles.input}
      />
      <Text style={type.eyebrow}>{copy.forms}</Text>
      <ChipRow>
        {list.map((f) => (
          <Chip
            key={f.id}
            label={f.name}
            active={forms.includes(f.id)}
            onPress={() => {
              setForms((x) => flip(x, f.id));
              setShown(false);
            }}
          />
        ))}
      </ChipRow>
      <Text style={type.eyebrow}>Any shape you see</Text>
      <TextInput
        accessibilityLabel="Search shapes"
        value={query}
        onChangeText={setQuery}
        placeholder="anchor, bird, heart, a letter…"
        placeholderTextColor="rgba(202,191,157,0.6)"
        style={styles.input}
      />
      <ChipRow>
        {found.map((s) => (
          <Chip
            key={s.id}
            label={s.name}
            active={shapes.includes(s.id)}
            onPress={() => {
              setShapes((x) => flip(x, s.id));
              setShown(false);
            }}
          />
        ))}
      </ChipRow>
      <Button label={forms.length || shapes.length ? 'Read it' : 'Read it (nothing picked)'} onPress={() => setShown(true)} />
      {reading && (
        <View style={styles.reading}>
          <Text style={styles.summary}>{reading.summary}</Text>
          {reading.sections.map((s) => (
            <View key={s.id} style={styles.group}>
              <Text style={type.eyebrow}>{s.title}</Text>
              {s.id === 'symbols'
                ? reading.blocks.map((b, i) => (
                    <View key={i} style={styles.group}>
                      <Text style={styles.name}>{b.title}</Text>
                      {b.paragraphs.map((p, j) => (
                        <Text key={j} style={type.body}>{p}</Text>
                      ))}
                    </View>
                  ))
                : s.paragraphs.map((p, i) => (
                    <Text key={i} style={type.body}>{s.id === 'questions' ? `• ${p}` : p}</Text>
                  ))}
            </View>
          ))}
          <Button label={copy.keep} onPress={() => onKeep({ forms, shapes, question }, reading)} />
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  name: { fontFamily: fonts.display, fontSize: 15, color: colors.parchment },
  reading: { gap: 10, padding: 14, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.goldLine, backgroundColor: colors.ground },
  summary: { fontFamily: fonts.displayItalic, fontSize: 18, lineHeight: 24, color: colors.parchment },
  input: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ground,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
