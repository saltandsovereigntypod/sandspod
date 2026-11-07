import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Card, Chip, Chips, Field, RitualScreen, SectionLabel, Title, Toggle, confirmAction, ui } from '../../../../../../components/rituals/ui';
import {
  emptySpot,
  newWard,
  normaliseSpot,
  renewWard,
  SPOT_KINDS,
  spotKind,
  spotName,
  wardDue,
  wardFromRecord,
  WARD_KINDS,
  wardKind,
  wardLabel,
  WARDS,
  WARDS_PER_SPOT,
  wardTendKey,
  wardTendRecord,
  type PlacedWard,
  type WardKind,
  type WardSpot,
} from '../../../../../../lib/craft/hearth/wards';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../../lib/craft/store';
import { saveRecord, useTendRecords } from '../../../../../../lib/tend/store';
import { type } from '../../../../../../theme';

const EVERY = [7, 30, 90, 180, 365];

// One place in the house: a door, a window, a threshold or a room, the wards
// set there, when each was last renewed, and a reminder through To tend.
export default function WardSpotScreen() {
  const { id: openId } = useLocalSearchParams<{ id?: string }>();
  const { entries, ready } = useCraft<WardSpot>(WARDS);
  const tend = useTendRecords();
  const [id, setId] = useState<string | null>(openId ?? null);
  const kept = useMemo(() => (id ? entries.find((e) => e.id === id) : null), [id, entries]);
  const [spot, setSpot] = useState<WardSpot>(() => (kept ? normaliseSpot(kept.data) : emptySpot()));
  const [loaded, setLoaded] = useState(!!kept);
  const [notice, setNotice] = useState<string | null>(null);
  const today = useMemo(() => new Date(), []);

  // Once it's loaded: a renewal marked in To tend counts here too.
  if (!loaded && kept && tend.ready) {
    setLoaded(true);
    const s = normaliseSpot(kept.data);
    setSpot({ ...s, wards: s.wards.map((w) => wardFromRecord(w, tend.records.find((r) => r.key === wardTendKey(w.id)))) });
  }

  /** Save the place, and bring each ward's To tend record into line (made, changed or let go). */
  const save = async (next: WardSpot, removed: PlacedWard[] = []) => {
    setSpot(next);
    let entryId = id;
    if (entryId) await updateEntry<WardSpot>(WARDS, entryId, next);
    else {
      entryId = (await addEntry<WardSpot>(WARDS, next)).id;
      setId(entryId);
    }
    for (const w of next.wards) {
      const existing = tend.records.find((r) => r.key === wardTendKey(w.id)) ?? null;
      const record = wardTendRecord(entryId, next, w, existing);
      if (record) await saveRecord(tend.entries, record);
      else if (existing && !existing.ended) await saveRecord(tend.entries, { ...existing, remind: false, ended: { how: 'let-go', at: new Date().toISOString(), note: '' } });
    }
    for (const w of removed) {
      const existing = tend.records.find((r) => r.key === wardTendKey(w.id));
      if (existing && !existing.ended) await saveRecord(tend.entries, { ...existing, remind: false, ended: { how: 'let-go', at: new Date().toISOString(), note: '' } });
    }
    setNotice('Saved.');
  };

  const change = (i: number, w: Partial<PlacedWard>) => setSpot((s) => ({ ...s, wards: s.wards.map((x, j) => (j === i ? { ...x, ...w } : x)) }));
  const addWard = (kind: WardKind) => setSpot((s) => (s.wards.length >= WARDS_PER_SPOT ? s : { ...s, wards: [...s.wards, newWard(kind, new Date())] }));

  if (openId && !ready) {
    return (
      <RitualScreen back="Wards">
        <Title>A place</Title>
        <Body>Opening…</Body>
      </RitualScreen>
    );
  }

  return (
    <RitualScreen back="Wards">
      <Title eyebrow={spotKind(spot.kind).label}>{spotName(spot)}</Title>

      <View style={ui.gapSmall}>
        <SectionLabel>What it is</SectionLabel>
        <Chips label="What it is">
          {SPOT_KINDS.map((k) => (
            <Chip key={k.key} label={k.label} selected={spot.kind === k.key} onPress={() => setSpot((s) => ({ ...s, kind: k.key }))} />
          ))}
        </Chips>
        <Body muted>{spotKind(spot.kind).line}</Body>
        <Field label="Its name" value={spot.name} onChange={(name) => setSpot((s) => ({ ...s, name }))} placeholder={spotKind(spot.kind).label} />
        <Field label="Where in the house" value={spot.area} onChange={(area) => setSpot((s) => ({ ...s, area }))} placeholder="Downstairs, upstairs, the garden" />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Wards set here</SectionLabel>
        {spot.wards.map((w, i) => {
          const due = wardDue(w, today);
          const kind = wardKind(w.kind);
          return (
            <Card key={w.id} accent={due.due}>
              <Text style={type.cardTitle}>{wardLabel(w)}</Text>
              <Body muted>{kind.line}</Body>
              <Field label="A few words (optional)" value={w.detail} onChange={(detail) => change(i, { detail: detail.slice(0, 80) })} placeholder={w.kind === 'iron' ? 'Horseshoe, points up' : w.kind === 'herbs' ? 'Rosemary and bay' : ''} />
              <Body>{w.renewed ? `Last renewed ${new Date(`${w.renewed}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}. ${due.line}` : due.line}</Body>
              <Chips>
                {EVERY.map((d) => (
                  <Chip key={d} label={d === 7 ? 'Weekly' : d === 30 ? 'Monthly' : d === 90 ? 'Each season' : d === 180 ? 'Twice a year' : 'Yearly'} selected={w.every === d} onPress={() => change(i, { every: d })} />
                ))}
              </Chips>
              <Toggle label="Remind me to renew it" detail="It rings from your To tend list" value={w.remind} onChange={(remind) => change(i, { remind })} />
              <Button label="Renewed today" variant="outline" onPress={() => void save({ ...spot, wards: spot.wards.map((x, j) => (j === i ? renewWard(x, new Date()) : x)) })} />
              {!!kind.source && <Body muted>{kind.source}</Body>}
              <Button
                label="Take this ward away"
                variant="text"
                onPress={async () => {
                  if (!(await confirmAction('Take this ward away?', 'Its reminder stops too.', 'Take away'))) return;
                  void save({ ...spot, wards: spot.wards.filter((_, j) => j !== i) }, [w]);
                }}
              />
            </Card>
          );
        })}
        {spot.wards.length < WARDS_PER_SPOT && (
          <>
            <Body muted>Add a ward</Body>
            <Chips>
              {WARD_KINDS.map((k) => (
                <Chip key={k.key} label={`+ ${k.label}`} a11yLabel={`Add a ${k.label.toLowerCase()}`} onPress={() => addWard(k.key)} />
              ))}
            </Chips>
          </>
        )}
      </View>

      <Field label="Notes" value={spot.notes} onChange={(notes) => setSpot((s) => ({ ...s, notes }))} multiline placeholder="What the place feels like, what happened there, what you said" />
      {notice && <Body muted>{notice}</Body>}
      <Button label={id ? 'Save' : 'Add this place'} onPress={() => void save(spot)} />
      {id && (
        <Button
          label="Remove this place"
          variant="text"
          onPress={async () => {
            if (!(await confirmAction(`Remove ${spotName(spot)}?`, 'Its wards and their reminders go with it.', 'Remove'))) return;
            await save({ ...spot, wards: [] }, spot.wards);
            await removeEntry(WARDS, id);
            router.back();
          }}
        />
      )}
      <Body muted>Salt kills grass and rusts iron: lay outdoor lines on stone, not soil, and keep them where pets won’t lick them.</Body>
    </RitualScreen>
  );
}
