// A potted plant on the altar (lib/altar/pottedPlants): the panel section for
// it (water, its picture, its details and photo, notes, the moon, its care
// journal), and the sheets for its details, a harvest and a journal entry.

import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../Button';
import {
  canHarvest,
  JOURNAL_KINDS,
  journalLine,
  journalOf,
  kindOf,
  LIGHT_CHOICES,
  moonGardenHint,
  PLANT_STAGES,
  plantNotes,
  plantTitle,
  pottedOf,
  stagesOf,
  thirstLine,
  thirstOf,
  WATER_EVERY_MAX,
  WATER_EVERY_MIN,
  isPottedPlant,
  type HarvestTo,
  type JournalKind,
  type PlantDetails,
  type PlantStage,
} from '../../../lib/altar/pottedPlants';
import type { SavedObject } from '../../../lib/altar/types';
import { shortDate } from '../../../lib/calendar';
import { dateFromKey, localDateKey } from '../../../lib/rituals/lifecycle';
import { colors, radius, type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { connectStyles, Eyebrow, Field, PanelSection } from './common';

const dayLabel = (on: string) => {
  const d = dateFromKey(on);
  return d ? shortDate(d) : on;
};

const daysAgo = (n: number) => {
  const d = new Date();
  return localDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - n));
};

type PanelProps = {
  object: SavedObject;
  now: number;
  /** A photo is being chosen and saved. */
  busy?: boolean;
  onWater: () => void;
  onStage: (stage: PlantStage) => void;
  onDetails: () => void;
  onPhoto: () => void;
  onRemovePhoto: () => void;
  onHarvest: () => void;
  onJournal: () => void;
  onRemoveEntry: (id: string) => void;
};

/** The object panel section for a potted plant. */
export function PottedPanelSection({ object, now, busy, onWater, onStage, onDetails, onPhoto, onRemovePhoto, onHarvest, onJournal, onRemoveEntry }: PanelProps) {
  const [all, setAll] = useState(false);
  if (!isPottedPlant(object)) return null;
  const kind = kindOf(object)!;
  const potted = pottedOf(object);
  const thirst = thirstOf(object, now);
  const stages = stagesOf(kind.id);
  const notes = plantNotes(object);
  const hint = moonGardenHint(object, new Date(now));
  const journal = journalOf(object);
  const shown = all ? journal : journal.slice(0, 5);
  const title = plantTitle(object);
  const wants = thirst.level !== 'unknown' && thirst.level !== 'fine';

  return (
    <>
      <PanelSection title={potted.name ? title : `Your ${kind.name.toLowerCase()}`}>
        {(!!potted.place || !!potted.light) && <Text style={type.caption}>{[potted.place, potted.light].filter(Boolean).join(' · ')}</Text>}
        {!!potted.photo && <Image source={{ uri: potted.photo }} style={styles.photo} accessibilityLabel={`A photo of ${title}`} resizeMode="cover" />}
        <Text style={[type.caption, wants && styles.wants]}>{thirstLine(object, now)}</Text>
        {busy ? (
          <Text style={type.caption}>Saving the photo…</Text>
        ) : (
          <ChipRow>
            <Chip label="Watered" symbol="☂" accessibilityLabel={`Mark ${title} watered today`} onPress={onWater} />
            {canHarvest(kind) && <Chip label="Harvest" symbol="✂" accessibilityLabel={`Harvest from ${title}`} onPress={onHarvest} />}
            <Chip label="Add to its journal" symbol="✎" onPress={onJournal} />
            <Chip label={potted.name ? 'Its details' : 'Name it'} symbol="❦" accessibilityLabel={`Name, place, light and watering for ${title}`} onPress={onDetails} />
            <Chip label={potted.photo ? 'Change the photo' : 'Add a photo'} symbol="▣" accessibilityLabel={`${potted.photo ? 'Change the' : 'Add a'} photo of the real ${kind.name.toLowerCase()}`} onPress={onPhoto} />
            {!!potted.photo && <Chip label="Take the photo away" symbol="⌫" onPress={onRemovePhoto} />}
          </ChipRow>
        )}
        {stages.length > 1 && (
          <>
            <Text style={type.caption}>Which picture matches it now?</Text>
            <ChipRow>
              {PLANT_STAGES.filter((s) => stages.includes(s.id)).map((s) => (
                <Chip key={s.id} label={s.label} active={potted.stage === s.id} accessibilityLabel={`Show it ${s.label.toLowerCase()}`} onPress={() => onStage(s.id)} />
              ))}
            </ChipRow>
          </>
        )}
      </PanelSection>

      {notes && (
        <PanelSection title="Notes">
          {!!notes.folk && <Text style={type.caption}>{notes.folk}</Text>}
          {!!notes.herb && <Text style={type.caption}>Its page in the Living Library is under About.</Text>}
          <Text style={[type.caption, notes.toxic && styles.wants]} accessibilityLabel={`Pets: ${notes.pets}`}>{`Pets: ${notes.pets}`}</Text>
          {!!hint && <Text style={type.caption}>{hint}</Text>}
        </PanelSection>
      )}

      <PanelSection title="Its journal">
        {journal.length === 0 ? (
          <Text style={type.caption}>Waterings, feeds, repotting, new leaves, cuttings and harvests go here, each with that day’s moon.</Text>
        ) : (
          shown.map((e) => (
            <View key={e.id} style={styles.entry}>
              <Text style={[type.caption, styles.entryText]}>
                {`${dayLabel(e.on)} · ${e.moon} · ${journalLine(e)}${e.note ? `. ${e.note}` : ''}`}
              </Text>
              <Chip label="Remove" symbol="⌫" accessibilityLabel={`Remove the entry for ${dayLabel(e.on)}: ${journalLine(e)}`} onPress={() => onRemoveEntry(e.id)} />
            </View>
          ))
        )}
        {journal.length > 5 && <Chip label={all ? 'Show fewer' : `Show all ${journal.length}`} onPress={() => setAll((a) => !a)} />}
      </PanelSection>
    </>
  );
}

/** A day: today, yesterday, or one typed (YYYY-MM-DD). */
function DayChoice({ value, onChange, label }: { value: string; onChange: (on: string) => void; label: string }) {
  const today = daysAgo(0);
  const yesterday = daysAgo(1);
  return (
    <View style={connectStyles.gap}>
      <Eyebrow>{label}</Eyebrow>
      <ChipRow>
        <Chip label="Today" active={value === today} onPress={() => onChange(today)} />
        <Chip label="Yesterday" active={value === yesterday} onPress={() => onChange(yesterday)} />
      </ChipRow>
      <Field label={`${label}, as year-month-day`} value={value} onChangeText={onChange} placeholder="Or a date: 2026-10-20" maxLength={10} autoCapitalize="none" />
    </View>
  );
}

const validDay = (on: string) => !!dateFromKey(on) && on <= daysAgo(0);

type DetailsProps = { visible: boolean; object: SavedObject | null; onClose: () => void; onSave: (details: PlantDetails) => void };

/** Her name for it, where it lives, its light, and how often it's watered. */
export function PlantDetailsSheet({ visible, object, onClose, onSave }: DetailsProps) {
  const kind = object ? kindOf(object) : null;
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [light, setLight] = useState('');
  const [every, setEvery] = useState(7);
  const [last, setLast] = useState('');
  useEffect(() => {
    if (!visible || !object) return;
    const p = pottedOf(object);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start from what the plant says each time it opens
    setName(p.name);
    setPlace(p.place);
    setLight(p.light);
    setEvery(p.waterEvery);
    setLast(p.lastWatered);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when it opens
  }, [visible]);
  const lastOk = !last || validDay(last);
  return (
    <Sheet visible={visible} eyebrow={kind?.name ?? 'Plant'} title="Its details" onClose={onClose}>
      <View style={connectStyles.gap}>
        <Field label="Its name" value={name} onChangeText={setName} placeholder="Its name (optional): Margaret" maxLength={60} />
        <Field label="Where it lives" value={place} onChangeText={setPlace} placeholder="Where it lives: the kitchen windowsill" maxLength={80} />
        <Eyebrow>Its light</Eyebrow>
        <ChipRow>
          {LIGHT_CHOICES.map((l) => (
            <Chip key={l} label={l} active={light === l} onPress={() => setLight(light === l ? '' : l)} />
          ))}
        </ChipRow>
        <Field label="Its light, in your words" value={light} onChangeText={setLight} placeholder="Or in your words" maxLength={60} />
      </View>
      <View style={connectStyles.gap}>
        <Eyebrow>How often you water it</Eyebrow>
        <ChipRow>
          <Chip label="−" accessibilityLabel="Water it a day more often" disabled={every <= WATER_EVERY_MIN} onPress={() => setEvery((n) => Math.max(WATER_EVERY_MIN, n - 1))} />
          <Text style={[connectStyles.value, styles.every]}>{every === 1 ? 'Every day' : `Every ${every} days`}</Text>
          <Chip label="+" accessibilityLabel="Water it a day less often" disabled={every >= WATER_EVERY_MAX} onPress={() => setEvery((n) => Math.min(WATER_EVERY_MAX, n + 1))} />
          {kind && every !== kind.waterEvery && <Chip label={`Back to ${kind.waterEvery}`} onPress={() => setEvery(kind.waterEvery)} />}
        </ChipRow>
        {!!kind && <Text style={type.caption}>{kind.waterNote}</Text>}
      </View>
      <DayChoice label="Last watered" value={last} onChange={setLast} />
      {!lastOk && <Text style={connectStyles.problem}>That date isn’t one I can read. Write it as 2026-10-20, and not in the future.</Text>}
      <Button label="Save" disabled={!lastOk} onPress={() => onSave({ name, place, light, waterEvery: every, lastWatered: last })} />
    </Sheet>
  );
}

const AMOUNTS = ['A sprig', 'A few sprigs', 'A handful', 'A bundle'];

type HarvestProps = { visible: boolean; object: SavedObject | null; onClose: () => void; onSave: (harvest: { amount: string; to: HarvestTo; note: string }) => void };

/** How much, and where it goes: on the altar as a fresh sprig, or into a working. */
export function HarvestSheet({ visible, object, onClose, onSave }: HarvestProps) {
  const kind = object ? kindOf(object) : null;
  const [amount, setAmount] = useState('');
  const [to, setTo] = useState<HarvestTo>('altar');
  const [note, setNote] = useState('');
  useEffect(() => {
    if (!visible) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a fresh harvest each time it opens
    setAmount('');
    setTo('altar');
    setNote('');
  }, [visible]);
  const herb = kind?.name.toLowerCase() ?? 'herb';
  return (
    <Sheet visible={visible} eyebrow={object ? plantTitle(object) : 'Harvest'} title={`Harvest the ${herb}`} onClose={onClose} size="half">
      <View style={connectStyles.gap}>
        <Eyebrow>How much</Eyebrow>
        <ChipRow>
          {AMOUNTS.map((a) => (
            <Chip key={a} label={a} active={amount === a.toLowerCase()} onPress={() => setAmount(a.toLowerCase())} />
          ))}
        </ChipRow>
        <Field label="How much, in your words" value={amount} onChangeText={setAmount} placeholder="Or in your words: 20 g" maxLength={60} />
      </View>
      <View style={connectStyles.gap}>
        <Eyebrow>Where it goes</Eyebrow>
        <ChipRow>
          <Chip label="Set it on the altar" active={to === 'altar'} onPress={() => setTo('altar')} />
          <Chip label="Into a working" active={to === 'working'} onPress={() => setTo('working')} />
        </ChipRow>
        <Text style={type.caption}>
          {to === 'altar'
            ? `A fresh sprig of ${herb} is set beside the pot. It goes over as any cut sprig does.`
            : `Kept in its journal, for the spell jar or sachet you’re making. Add the ${herb} when you fill it.`}
        </Text>
        <Field label="A note" value={note} onChangeText={setNote} placeholder="A note (optional)" maxLength={400} />
      </View>
      <Button label="Harvest" onPress={() => onSave({ amount, to, note })} />
    </Sheet>
  );
}

type JournalProps = { visible: boolean; object: SavedObject | null; onClose: () => void; onSave: (entry: { kind: JournalKind; on: string; note: string }) => void };

/** A dated entry in its care journal. */
export function PlantJournalSheet({ visible, object, onClose, onSave }: JournalProps) {
  const [kind, setKind] = useState<JournalKind>('watered');
  const [on, setOn] = useState(daysAgo(0));
  const [note, setNote] = useState('');
  useEffect(() => {
    if (!visible) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a fresh entry each time it opens
    setKind('watered');
    setOn(daysAgo(0));
    setNote('');
  }, [visible]);
  const ok = validDay(on) && (kind !== 'note' || !!note.trim());
  return (
    <Sheet visible={visible} eyebrow={object ? plantTitle(object) : 'Plant'} title="Add to its journal" onClose={onClose}>
      <View style={connectStyles.gap}>
        <ChipRow>
          {JOURNAL_KINDS.filter((k) => k.kind !== 'harvested').map((k) => (
            <Chip key={k.kind} label={k.label} active={kind === k.kind} onPress={() => setKind(k.kind)} />
          ))}
        </ChipRow>
        <Text style={type.caption}>A harvest is added with Harvest, so it can go on the altar or into a working.</Text>
      </View>
      <DayChoice label="When" value={on} onChange={setOn} />
      <Field label="A note" value={note} onChangeText={setNote} placeholder={kind === 'note' ? 'Your note' : 'A note (optional)'} maxLength={400} multiline />
      <Text style={type.caption}>The moon that day is kept with it.</Text>
      <Button label="Add to the journal" disabled={!ok} onPress={() => onSave({ kind, on, note })} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  photo: { width: 120, height: 120, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  wants: { color: colors.gold },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryText: { flex: 1 },
  every: { alignSelf: 'center', paddingHorizontal: 6 },
});
