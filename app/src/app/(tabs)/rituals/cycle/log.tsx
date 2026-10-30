import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { ChoiceChips, errorText } from '../../../../components/cycle/ui';
import { Body, Card, confirmAction, Field, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { SEASON_INFO } from '../../../../lib/cycle/content';
import {
  addDays,
  bleedOn,
  daysBetween,
  dayKey,
  emptyNote,
  endBleed,
  isDayKey,
  noteOn,
  putNote,
  QUARTER_NAMES,
  removeBleed,
  seasonOn,
  SEASON_NAMES,
  setFlow,
  startBleed,
  moonQuarterOn,
} from '../../../../lib/cycle/model';
import { cycleId, updateCycle, useCycle } from '../../../../lib/cycle/store';
import type { DayNote, Flow } from '../../../../lib/cycle/types';
import { type } from '../../../../theme';

const FLOWS: { value: Flow | 'none'; label: string }[] = [
  { value: 'none', label: 'Not noted' },
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];
const RATINGS: { value: number; label: string }[] = [
  { value: 0, label: '–' },
  { value: 1, label: '1 low' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5 high' },
];

// Log one day: a bleed beginning or ending and its flow, and the day's notes
// (energy, mood, body, dreams, intuition, anything else). All optional.
export default function CycleLog() {
  const params = useLocalSearchParams<{ date?: string }>();
  const cycle = useCycle();
  const today = dayKey(new Date());
  const [date, setDate] = useState(isDayKey(params.date) && daysBetween(params.date, today) >= 0 ? params.date : today);
  const data = cycle.data;
  const [note, setNote] = useState<DayNote>(() => (data && noteOn(data, date)) || emptyNote(date));
  const [saved, setSaved] = useState<string | null>(null);

  // Another day: its own notes (edits in progress aren't replaced by a sync).
  const go = (next: string) => {
    setDate(next);
    setNote((data && noteOn(data, next)) || emptyNote(next));
    setSaved(null);
  };

  if (cycle.phase !== 'open' || !data) {
    return (
      <RitualScreen back="Cycle & Moon">
        <Title>Log a day</Title>
        <Body>Open Cycle &amp; Moon first.</Body>
        <Button label="Open Cycle & Moon" onPress={() => router.replace('/rituals/cycle')} />
      </RitualScreen>
    );
  }

  const now = () => new Date();
  const bleed = bleedOn(data, date);
  const season = seasonOn(data, date).season;
  const quarter = moonQuarterOn(date);
  const label = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const field = (k: keyof DayNote) => (v: string) => setNote({ ...note, [k]: v });

  return (
    <RitualScreen back="Cycle & Moon">
      <Title eyebrow={`${SEASON_NAMES[season]} · ${QUARTER_NAMES[quarter]}`}>{date === today ? 'Today' : label}</Title>
      <View style={styles.days}>
        <Button label="‹ Day before" variant="text" onPress={() => go(addDays(date, -1))} />
        {date !== today && <Button label="Day after ›" variant="text" onPress={() => go(addDays(date, 1))} />}
      </View>

      {data.settings.mode === 'cycle' && (
        <Card>
          <SectionLabel>Bleeding</SectionLabel>
          {bleed ? (
            <View style={ui.gap}>
              <Body>{bleed.start === date ? 'Your bleed began this day.' : `Your bleed began ${new Date(`${bleed.start}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}.`}</Body>
              <Text style={type.caption}>Flow this day</Text>
              <ChoiceChips options={FLOWS} value={bleed.flow[date] ?? 'none'} onChange={(v) => updateCycle((d) => setFlow(d, date, v === 'none' ? null : v, now()))} />
              {bleed.end === date ? (
                <Body muted>Marked as the last day.</Body>
              ) : (
                <Button label="My bleed ended this day" variant="outline" onPress={() => updateCycle((d) => endBleed(d, date, now()))} />
              )}
              <Button
                label="Remove this bleed"
                variant="text"
                onPress={async () => {
                  if (await confirmAction('Remove this bleed?', 'Its days and flow are removed from your notes. Your day notes stay.', 'Remove')) updateCycle((d) => removeBleed(d, bleed.id, now()));
                }}
              />
            </View>
          ) : (
            <View style={ui.gap}>
              <Body muted>Not bleeding this day, by what’s logged.</Body>
              <Button label="My bleed began this day" onPress={() => updateCycle((d) => startBleed(d, date, cycleId, now()))} />
            </View>
          )}
        </Card>
      )}

      <Card>
        <SectionLabel>How the day feels</SectionLabel>
        <Text style={type.caption}>Energy</Text>
        <ChoiceChips options={RATINGS} value={note.energy ?? 0} onChange={(v) => setNote({ ...note, energy: v || null })} />
        <Text style={type.caption}>Intuition</Text>
        <ChoiceChips options={RATINGS} value={note.intuition ?? 0} onChange={(v) => setNote({ ...note, intuition: v || null })} />
        <Field label="Mood" value={note.mood} onChange={field('mood')} placeholder="A word or two" />
        <Field label="Body" value={note.body} onChange={field('body')} placeholder="Cramps, tender, rested, restless…" multiline />
        <Field label="Dreams" value={note.dreams} onChange={field('dreams')} placeholder="What you remember" multiline />
        <Field label="Anything else" value={note.text} onChange={field('text')} placeholder={SEASON_INFO[season].prompts[0]} multiline />
        {saved && <Notice>{saved}</Notice>}
        <Button
          label="Keep these notes"
          onPress={() => {
            try {
              updateCycle((d) => putNote(d, note, now()));
              setSaved('Kept, encrypted.');
            } catch (e) {
              setSaved(errorText(e));
            }
          }}
        />
      </Card>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  days: { flexDirection: 'row', justifyContent: 'space-between' },
});
