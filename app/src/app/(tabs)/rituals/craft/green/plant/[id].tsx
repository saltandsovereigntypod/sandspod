import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, Chip, Chips, Expander, Field, Notice, RitualScreen, SectionLabel, Title, confirmAction, tell, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import { DayPicker } from '../../../../../../lib/craft/green/DayPicker';
import {
  addEvent,
  asPlant,
  bringBack,
  daysBetween,
  EVENT_KINDS,
  eventLabel,
  herbName,
  history,
  markGone,
  moonOn,
  newEvent,
  PLANTS,
  plantSummary,
  removeEvent,
  type Plant,
  type PlantEventKind,
} from '../../../../../../lib/craft/green/garden';
import { removeEntry, updateEntry, useCraft } from '../../../../../../lib/craft/store';
import { ritualsLibraryHref } from '../../../../../../lib/library';
import { localDateKey } from '../../../../../../lib/rituals/lifecycle';
import { colors, fonts, radius, type } from '../../../../../../theme';

export default function PlantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, ready } = useCraft<unknown>(PLANTS);
  const entry = entries.find((e) => e.id === id) ?? null;

  const [kind, setKind] = useState<PlantEventKind>('tended');
  const [on, setOn] = useState<string | null>(localDateKey(new Date()));
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [goneNote, setGoneNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  if (!entry) {
    return (
      <RitualScreen back="My garden">
        <Title>My garden</Title>
        <Body>{ready ? 'This plant isn’t in your garden any more.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }

  const plant = asPlant(entry.data);
  const list = history(plant);
  const summary = plantSummary(plant);
  const today = localDateKey(new Date());
  const age = plant.started ? daysBetween(plant.started, plant.goneOn ?? today) : null;
  const herbLabel = herbName(plant.herb);

  const save = async (next: Plant) => {
    setBusy(true);
    try {
      await updateEntry(PLANTS, entry.id, next);
    } catch (e) {
      tell('Couldn’t save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const log = async () => {
    const day = on ?? today;
    const event = newEvent({ kind, on: day, amount, note }, new Date());
    await save(addEvent(plant, event));
    setAmount('');
    setNote('');
    setSaved(`${eventLabel(kind)} logged under the ${event.moon.toLowerCase()}.`);
  };

  const removeOne = async (eventId: string) => {
    const ok = await confirmAction('Remove this entry?', 'It is taken out of this plant’s history.', 'Remove');
    if (ok) await save(removeEvent(plant, eventId));
  };

  const gone = async () => {
    const ok = await confirmAction(`Mark ${plant.name} as gone?`, 'It moves to the bottom of your garden with its history kept. You can bring it back.', 'Mark as gone');
    if (ok) await save(markGone(plant, today, goneNote));
  };

  const remove = async () => {
    const ok = await confirmAction(`Delete ${plant.name}?`, 'The plant and all its history are removed from this phone and your account.', 'Delete');
    if (!ok) return;
    await removeEntry(PLANTS, entry.id);
    router.back();
  };

  return (
    <RitualScreen back="My garden">
      <Title eyebrow={plant.place || 'My garden'}>{plant.name}</Title>
      <Body muted>
        {[
          plant.started ? `${plant.startedBy === 'sowed' ? 'Sown' : 'Planted'} ${fullDate(plant.started)} under the ${moonOn(plant.started, new Date()).toLowerCase()}` : null,
          age !== null && age >= 0 ? `${age} ${age === 1 ? 'day' : 'days'}${plant.goneOn ? '' : ' in your garden'}` : null,
          summary.harvests ? `${summary.harvests} ${summary.harvests === 1 ? 'harvest' : 'harvests'}` : null,
        ]
          .filter(Boolean)
          .join(' · ') || 'No start date'}
      </Body>
      {plant.goneOn && <Notice>{`Gone from the garden ${fullDate(plant.goneOn)}${plant.goneNote ? `: ${plant.goneNote}` : ''}.`}</Notice>}
      {!!plant.notes && <Body>{plant.notes}</Body>}
      {!!herbLabel && (
        <Button
          label={`${herbLabel} in the Living Library`}
          variant="outline"
          onPress={() => router.push(ritualsLibraryHref({ id: `traditional:herb:${plant.herb}` }))}
        />
      )}

      <Card accent>
        <SectionLabel>Log something</SectionLabel>
        <Chips>
          {EVENT_KINDS.map((k) => (
            <Chip key={k.kind} label={k.label} selected={kind === k.kind} onPress={() => setKind(k.kind)} />
          ))}
        </Chips>
        <DayPicker label="When" value={on} onChange={setOn} />
        {kind === 'harvested' && <Field label="How much?" value={amount} onChange={setAmount} placeholder="A handful, 3 bundles, 40 g…" />}
        <Field
          label={kind === 'blessing' ? 'What did you offer or say?' : 'Note'}
          value={note}
          onChange={setNote}
          placeholder={kind === 'blessing' ? 'Milk and honey at the roots, a few words of thanks…' : 'Optional'}
          multiline
        />
        <Body muted>{`The moon is recorded for you: ${moonOn(on ?? today, new Date()).toLowerCase()}${on && on !== today ? ' that evening' : ' now'}.`}</Body>
        <Button label={busy ? 'Saving…' : `Log ${eventLabel(kind).toLowerCase()}`} disabled={busy} onPress={() => void log()} />
        {!!saved && <Notice>{saved}</Notice>}
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>History</SectionLabel>
        {list.length ? (
          <View style={styles.list}>
            {list.map((e, i) => (
              <View key={e.id} style={[styles.event, i < list.length - 1 && styles.rule]}>
                <View accessible style={styles.eventText}>
                  <Text style={styles.eventTitle}>{`${eventLabel(e.kind)}${e.amount ? `: ${e.amount}` : ''}`}</Text>
                  <Text style={type.caption}>{`${fullDate(e.on) ?? e.on} · ${e.moon}`}</Text>
                  {!!e.note && <Text style={type.body}>{e.note}</Text>}
                </View>
                <Button label="Remove" variant="text" accessibilityHint={`Removes ${eventLabel(e.kind).toLowerCase()} on ${fullDate(e.on) ?? e.on}`} onPress={() => void removeOne(e.id)} />
              </View>
            ))}
          </View>
        ) : (
          <Body muted>Nothing logged yet.</Body>
        )}
      </View>

      <View style={ui.actions}>
        <Button label="Edit details" variant="outline" onPress={() => router.push({ pathname: '/rituals/craft/green/plant/new', params: { id: entry.id } } as unknown as Href)} />
        {plant.goneOn ? (
          <Button label="Bring it back to the garden" variant="outline" disabled={busy} onPress={() => void save(bringBack(plant))} />
        ) : (
          <Expander title="It’s gone from the garden">
            <Body muted>For a plant that died, was given away or finished its season. Its history stays.</Body>
            <Field label="What happened? (optional)" value={goneNote} onChange={setGoneNote} placeholder="First frost, gave it to Mum, went to seed…" />
            <Button label="Mark as gone" variant="outline" disabled={busy} onPress={() => void gone()} />
          </Expander>
        )}
        <Button label="Delete plant" variant="text" onPress={() => void remove()} />
      </View>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.surface, borderRadius: radius.tile, paddingHorizontal: 14 },
  event: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  eventText: { flex: 1, gap: 2 },
  eventTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
});
