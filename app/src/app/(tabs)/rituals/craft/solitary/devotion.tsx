import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, confirmAction, Expander, Field, RitualScreen, SectionLabel, Title, tell, ui } from '../../../../../components/rituals/ui';
import {
  dateKey,
  daysByDate,
  devotionFor,
  eveningFirst,
  KIND_LABELS,
  NOTE_MAX,
  weekDots,
  weekWords,
  type DevotionDay,
  type DevotionPrompt,
} from '../../../../../lib/craft/solitary/devotion';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';
import { colors, fonts, type } from '../../../../../theme';

const COLLECTION = 'solitary.devotions';

const longDate = (key: string) =>
  new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

export default function DailyDevotion() {
  const now = useMemo(() => new Date(), []);
  const key = dateKey(now);
  const today = useMemo(() => devotionFor(key), [key]);
  const { entries, ready } = useCraft<DevotionDay>(COLLECTION);
  const days = useMemo(() => daysByDate(entries), [entries]);
  const record = days.get(key);
  const dots = useMemo(() => weekDots(days, now), [days, now]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current) setNote(record?.note ?? '');
  }, [record?.note]);

  const save = async (patch: Partial<DevotionDay>) => {
    setBusy(true);
    try {
      const base: DevotionDay = { date: key, morning: !!record?.morning, evening: !!record?.evening, note: record?.note ?? '' };
      const next = { ...base, ...patch };
      if (record) {
        const [first, ...extra] = record.ids;
        await updateEntry<DevotionDay>(COLLECTION, first, next);
        // Fold any second copy made on another phone into this one.
        for (const id of extra) await removeEntry(COLLECTION, id);
      } else {
        await addEntry<DevotionDay>(COLLECTION, next);
      }
    } catch {
      tell("Couldn't save", 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveNote = async () => {
    touched.current = false;
    await save({ note: note.trim().slice(0, NOTE_MAX) });
  };

  const clearNote = async () => {
    if (!(await confirmAction('Clear today’s note?', 'The note for today will be removed from every device.', 'Clear'))) return;
    touched.current = false;
    setNote('');
    await save({ note: '' });
  };

  const earlier = useMemo(
    () =>
      [...days.values()]
        .filter((d) => d.date !== key && d.note?.trim())
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 14),
    [days, key],
  );

  const part = (when: 'morning' | 'evening', prompt: DevotionPrompt) => {
    const done = !!record?.[when];
    const word = when === 'morning' ? 'Morning' : 'Evening';
    return (
      <Card key={when} accent={!done}>
        <SectionLabel>{`${word} · ${KIND_LABELS[prompt.kind]}`}</SectionLabel>
        <Text style={type.cardTitle} accessibilityRole="header">
          {prompt.title}
        </Text>
        {!!prompt.reading && <Text style={styles.reading}>{prompt.reading}</Text>}
        <Body>{prompt.text}</Body>
        {done ? (
          <View style={ui.gapSmall}>
            <Body muted>{`${word} kept. Thank you for coming.`}</Body>
            <Button label={`Not yet: unmark ${when}`} variant="text" disabled={busy || !ready} onPress={() => save({ [when]: false })} />
          </View>
        ) : (
          <Button label={`I kept my ${when} practice`} disabled={busy || !ready} onPress={() => save({ [when]: true })} />
        )}
      </Card>
    );
  };

  const order = eveningFirst(now) ? (['evening', 'morning'] as const) : (['morning', 'evening'] as const);

  return (
    <RitualScreen back="Solitary">
      <Title eyebrow={longDate(key)}>Daily devotion</Title>
      <Body muted>A few minutes in the morning and a few at night. There’s no wrong way to do it, and no day you can fall behind on.</Body>

      {order.map((when) => part(when, today[when]))}

      <Card>
        <SectionLabel>Kept this week</SectionLabel>
        <View style={styles.week}>
          {dots.map((d) => (
            <View
              key={d.date}
              style={styles.day}
              accessible
              accessibilityLabel={`${longDate(d.date)}${d.today ? ', today' : ''}: morning ${d.morning ? 'kept' : 'not kept'}, evening ${d.evening ? 'kept' : 'not kept'}`}
            >
              <Text style={[styles.weekday, d.today && styles.today]}>{d.weekday}</Text>
              <View style={[styles.dot, d.morning && styles.dotOn]} />
              <View style={[styles.dot, styles.dotEvening, d.evening && styles.dotOn]} />
            </View>
          ))}
        </View>
        <Body>{weekWords(dots)}</Body>
        <Body muted>Top dot for morning, lower for evening.</Body>
      </Card>

      <Card>
        <Field
          label="A note for today (optional)"
          value={note}
          onChange={(text) => {
            touched.current = true;
            setNote(text);
          }}
          placeholder="What came up, what you noticed, a line to remember…"
          multiline
        />
        <View style={ui.actions}>
          <Button label={busy ? 'Saving…' : 'Save note'} disabled={busy || !ready || note.trim() === (record?.note ?? '').trim()} onPress={saveNote} />
          {!!record?.note && <Button label="Clear note" variant="outline" disabled={busy} onPress={clearNote} />}
        </View>
      </Card>

      {earlier.length > 0 && (
        <Expander title="Earlier notes">
          {earlier.map((d) => (
            <View key={d.date} style={ui.gapSmall}>
              <Text style={type.eyebrow}>{longDate(d.date)}</Text>
              <Body>{d.note}</Body>
            </View>
          ))}
        </Expander>
      )}
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  reading: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 26, color: colors.parchment },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 6, minWidth: 36 },
  weekday: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  today: { color: colors.gold, fontFamily: fonts.bodySemi },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: colors.goldDeep },
  dotEvening: { borderColor: colors.fern },
  dotOn: { backgroundColor: colors.gold, borderColor: colors.gold },
});
