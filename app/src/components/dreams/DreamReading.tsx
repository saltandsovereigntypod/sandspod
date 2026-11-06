// "Read this dream": the reading of a dream entry, in collapsible sections,
// with tappable symbols, Library links, Keep, and "came true".

import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Body, Card, Chip, Chips, Expander, Field, SectionLabel } from '../rituals/ui';
import { DREAMS, dreamMoon, type DreamEntry } from '../../lib/craft/hedge/dreams';
import { updateEntry } from '../../lib/craft/store';
import { FEELINGS, matchSymbols, readDream, type DreamSymbol, type Reading } from '../../lib/dreams/reader';
import { saveMeaning, useDictionary } from '../../lib/dreams/store';
import { grimoireLibraryHref, useLibrary } from '../../lib/library';
import { localDateKey } from '../../lib/rituals/lifecycle';
import { colors, fonts, space, type } from '../../theme';

const feelingLabel = (f: string) => f[0].toUpperCase() + f.slice(1);

export function DreamReading({ entry, all }: { entry: DreamEntry; all: DreamEntry[] }) {
  const d = entry.data;
  const { entries: dictionary } = useDictionary();
  const { entries: library } = useLibrary();
  const [reading, setReading] = useState<Reading | null>(null);
  const [sheet, setSheet] = useState<{ symbol: DreamSymbol; said: string } | null>(null);
  const [note, setNote] = useState('');

  const refs = useMemo(() => library.map((l) => ({ id: l.id, name: l.name, type: l.type })), [library]);
  const read = () => {
    const moon = dreamMoon(d.date);
    const past = all
      .filter((e) => e.id !== entry.id)
      .map((e) => ({ id: e.id, date: e.data.date, symbolKeys: matchSymbols(`${e.data.title} ${e.data.dream}`, dictionary).map((m) => m.subject.key) }));
    setReading(
      readDream({
        text: `${d.title}. ${d.dream}`,
        date: d.date,
        id: entry.id,
        mood: d.mood,
        feelingsNote: d.feelings,
        flags: { lucid: d.lucid, recurring: d.recurring, prophetic: d.prophetic },
        moon: { phase: moon.moonPhase, sign: moon.moonSign },
        dictionary,
        past,
        library: refs,
      }),
    );
  };

  const keep = async () => {
    if (!reading) return;
    await updateEntry(DREAMS, entry.id, { ...d, reading: reading.text, checkBack: reading.checkBack ?? d.checkBack ?? '' });
  };
  const markTrue = async () => {
    await updateEntry(DREAMS, entry.id, { ...d, cameTrue: { date: localDateKey(new Date()), note: note.trim() } });
    setNote('');
  };

  if (!d.dream.trim()) return null;
  return (
    <View style={styles.wrap}>
      {!reading && (
        <>
          <Button label={d.reading ? 'Read this dream again' : 'Read this dream'} onPress={read} accessibilityHint="Reads the symbols, the feeling and the moon of this dream" />
          {!!d.reading && (
            <Expander title="Your kept reading">
              <Body>{d.reading}</Body>
            </Expander>
          )}
        </>
      )}

      {reading && (
        <View style={styles.wrap}>
          <SectionLabel>{`The reading · ${feelingLabel(reading.feeling)}${reading.types.length ? ` · ${reading.types.join(', ')}` : ''}`}</SectionLabel>
          {reading.sections.map((s, i) => (
            <Expander key={s.id} title={s.title} initiallyOpen={i === 0}>
              {s.id === 'symbols' ? (
                <View style={styles.wrap}>
                  {reading.symbols.map((sym) => (
                    <View key={sym.key} style={styles.wrap}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${sym.name}, open the full entry`}
                        disabled={!sym.symbol}
                        onPress={() => sym.symbol && setSheet({ symbol: sym.symbol, said: sym.said })}
                      >
                        <Text style={styles.symbolName}>{sym.symbol ? `${sym.name}  ›` : sym.name}</Text>
                      </Pressable>
                      {sym.paragraphs.map((p) => (
                        <Body key={p}>{p}</Body>
                      ))}
                    </View>
                  ))}
                  {reading.also.length > 0 && <Body muted>{`Also present: ${reading.also.join(', ')}.`}</Body>}
                </View>
              ) : (
                <View style={styles.wrap}>
                  {s.paragraphs.map((p) => (
                    <Body key={p}>{p}</Body>
                  ))}
                  {s.id === 'do' && reading.action.href && <Button label={reading.action.label ?? 'Open'} variant="text" onPress={() => router.push(reading.action.href as Href)} />}
                </View>
              )}
            </Expander>
          ))}

          {reading.library.length > 0 && (
            <View style={styles.wrap}>
              <SectionLabel>From the Library</SectionLabel>
              <Chips>
                {reading.library.map((l) => (
                  <Chip key={l.id} label={l.name} a11yLabel={`Open ${l.name} in the Library`} onPress={() => router.push(grimoireLibraryHref(l) as Href)} />
                ))}
              </Chips>
            </View>
          )}

          <Button label="Keep this reading" onPress={keep} accessibilityHint="Saves the reading with this dream" />
          <Button label="Close the reading" variant="text" onPress={() => setReading(null)} />
        </View>
      )}

      <Card>
        <SectionLabel>Came true?</SectionLabel>
        {d.cameTrue ? (
          <Body>{`Marked as having come true on ${d.cameTrue.date}.${d.cameTrue.note ? ` ${d.cameTrue.note}` : ''}`}</Body>
        ) : (
          <>
            {!!d.checkBack && <Body muted>{`You meant to look back at this one on ${d.checkBack}.`}</Body>}
            <Field label="What happened (optional)" value={note} onChange={setNote} placeholder="A line about how it came about" />
            <Button label="Mark as came true" variant="text" onPress={markTrue} />
          </>
        )}
      </Card>

      <SymbolSheet sheet={sheet} onClose={() => setSheet(null)} />
    </View>
  );
}

function SymbolSheet({ sheet, onClose }: { sheet: { symbol: DreamSymbol; said: string } | null; onClose: () => void }) {
  const [meaning, setMeaning] = useState('');
  const [saved, setSaved] = useState(false);
  if (!sheet) return null;
  const s = sheet.symbol;
  const close = () => {
    setMeaning('');
    setSaved(false);
    onClose();
  };
  return (
    <Modal visible animationType="slide" transparent onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.sheetBody}>
            <Text accessibilityRole="header" style={styles.sheetTitle}>
              {s.name}
            </Text>
            <Body>{s.folk}</Body>
            <Body>{s.psyche}</Body>
            {!!s.craft && <Body>{s.craft}</Body>}
            <SectionLabel>By feeling</SectionLabel>
            {FEELINGS.map((f) => (
              <Body key={f} muted>{`${feelingLabel(f)}: ${s.byFeeling[f]}`}</Body>
            ))}
            <SectionLabel>Questions</SectionLabel>
            {s.questions.map((q) => (
              <Body key={q}>{q}</Body>
            ))}
            {!!s.action && <Body muted>{`To do: ${s.action}`}</Body>}
            <SectionLabel>Make this my meaning</SectionLabel>
            <Field label={`What ${sheet.said} means to you`} value={meaning} onChange={setMeaning} placeholder="Your own meaning is shown first from now on" multiline />
            <Button
              label={saved ? 'Saved to your dictionary' : 'Save to my dictionary'}
              disabled={!meaning.trim() || saved}
              onPress={async () => {
                await saveMeaning({ word: sheet.said, also: [], meaning: meaning.trim(), symbolId: s.id });
                setSaved(true);
              }}
            />
            <Button label="Close" variant="text" onPress={close} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  symbolName: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.gold },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { maxHeight: '88%', backgroundColor: colors.ground, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  sheetBody: { padding: space.gutter, gap: 12, paddingBottom: 40 },
  sheetTitle: { ...type.title, color: colors.cream },
});
