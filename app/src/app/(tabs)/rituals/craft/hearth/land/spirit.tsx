import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { go, HEARTH, q, useLand } from '../../../../../../components/craft/hearth';
import { Body, Card, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, confirmAction, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import {
  blankEncounter,
  LAND_SPIRITS,
  normalizeSpirit,
  RECEPTIONS,
  receptionCounts,
  SENSES,
  spiritKindLabel,
  spiritTimeline,
  welcomeOfferings,
  withEncounter,
  withoutEncounter,
  type Encounter,
} from '../../../../../../lib/craft/hearth/spirits';
import { updateEntry, useCraft } from '../../../../../../lib/craft/store';
import { dateFromKey, localDateKey } from '../../../../../../lib/rituals/lifecycle';

export default function SpiritPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const raw = useCraft<unknown>(LAND_SPIRITS);
  const { notes, names } = useLand();
  const entry = raw.entries.find((e) => e.id === id) ?? null;
  const s = useMemo(() => (entry ? normalizeSpirit(entry.data) : null), [entry]);
  const [visit, setVisit] = useState<{ index: number | null; e: Encounter } | null>(null);
  if (!entry || !s) {
    return (
      <RitualScreen back="Spirits of place">
        <Title>A spirit of place</Title>
        <Body>{raw.ready ? 'This page couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const timeline = spiritTimeline(s, notes);
  const counts = receptionCounts(s);
  const welcome = welcomeOfferings(s);
  const setE = (patch: Partial<Encounter>) => setVisit((v) => (v ? { ...v, e: { ...v.e, ...patch } } : v));
  const saveVisit = async () => {
    if (!visit || !dateFromKey(visit.e.on)) return;
    await updateEntry(LAND_SPIRITS, entry.id, withEncounter(s, visit.e, visit.index));
    setVisit(null);
  };
  const deleteVisit = async () => {
    if (visit?.index == null || !(await confirmAction('Delete this visit?', 'It will be deleted on every device.', 'Delete'))) return;
    await updateEntry(LAND_SPIRITS, entry.id, withoutEncounter(s, visit.index));
    setVisit(null);
  };
  const received = RECEPTIONS.filter((r) => counts[r.id]).map((r) => `${r.label.toLowerCase()} ${counts[r.id]}`);

  return (
    <RitualScreen back="Spirits of place">
      <Title eyebrow={[spiritKindLabel(s.kind), s.placeId ? names[s.placeId] : null].filter(Boolean).join(' · ')}>{s.name}</Title>
      {!!s.spot && <Body muted>{s.spot}</Body>}
      {!!s.sensed && <Body>{s.sensed}</Body>}
      {!!(s.greeting || s.likes || s.avoid) && (
        <Card>
          {!!s.greeting && <SectionLabel>How you greet it</SectionLabel>}
          {!!s.greeting && <Body>{s.greeting}</Body>}
          {!!s.likes && <SectionLabel>What seems welcome</SectionLabel>}
          {!!s.likes && <Body>{s.likes}</Body>}
          {!!s.avoid && <SectionLabel>What to avoid</SectionLabel>}
          {!!s.avoid && <Body>{s.avoid}</Body>}
        </Card>
      )}
      {received.length > 0 && <Body muted>{`How offerings were received: ${received.join(', ')}.${welcome.length ? ` Welcomed most: ${welcome.slice(0, 3).join(', ')}.` : ''}`}</Body>}

      {visit ? (
        <Card accent>
          <SectionLabel>{visit.index === null ? 'A visit' : 'Edit this visit'}</SectionLabel>
          <Field label="Day (YYYY-MM-DD)" value={visit.e.on} onChange={(on) => setE({ on })} />
          <Body muted>How you sensed it</Body>
          <Chips>
            {SENSES.map((x) => (
              <Chip
                key={x.id}
                label={x.label}
                selected={visit.e.senses.includes(x.id)}
                onPress={() => setE({ senses: visit.e.senses.includes(x.id) ? visit.e.senses.filter((y) => y !== x.id) : [...visit.e.senses, x.id] })}
              />
            ))}
          </Chips>
          <Field label="What you sensed" value={visit.e.sensed} onChange={(sensed) => setE({ sensed })} multiline placeholder="Stillness, a wren that stayed, a feeling of being watched kindly" />
          <Field label="What you gave" value={visit.e.offering} onChange={(offering) => setE({ offering })} placeholder="Water, a song, an hour’s litter-picking" />
          <Body muted>How it was received</Body>
          <Chips>
            {RECEPTIONS.map((r) => (
              <Chip key={r.id} label={r.label} hint={r.hint} selected={visit.e.received === r.id} onPress={() => setE({ received: visit.e.received === r.id ? null : r.id })} />
            ))}
          </Chips>
          <Field label="Notes" value={visit.e.notes} onChange={(notes) => setE({ notes })} multiline />
          <View style={ui.actions}>
            <Button label="Keep this visit" onPress={() => void saveVisit()} disabled={!dateFromKey(visit.e.on)} />
            <Button label="Cancel" variant="text" onPress={() => setVisit(null)} />
            {visit.index !== null && <Button label="Delete" variant="text" onPress={() => void deleteVisit()} />}
          </View>
        </Card>
      ) : (
        <View style={ui.actions}>
          <Button label="Note a visit" onPress={() => setVisit({ index: null, e: blankEncounter(localDateKey(new Date())) })} />
          <Button label="Edit" variant="outline" onPress={go(`${HEARTH}/land/spirit-edit${q({ id: entry.id })}`)} />
        </View>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>{timeline.length ? 'Visits and offerings' : 'No visits yet'}</SectionLabel>
        {timeline.length > 0 && (
          <List>
            {timeline.map((t, i) => (
              <Row
                key={`${t.kind}-${t.index ?? t.noteId}`}
                icon={t.kind === 'note' ? 'grimoire' : 'samhain'}
                title={t.title}
                detail={[fullDate(t.on), t.kind === 'note' ? 'From the land journal' : '', t.detail].filter(Boolean).join(' · ')}
                last={i === timeline.length - 1}
                onPress={() => (t.kind === 'note' ? router.push(`${HEARTH}/land/note${q({ id: t.noteId })}` as Href) : setVisit({ index: t.index!, e: s.encounters[t.index!] }))}
              />
            ))}
          </List>
        )}
      </View>
      <List>
        {!!s.placeId && <Row icon="wheel" title={names[s.placeId] ?? 'Its place'} detail="The place in your land journal" onPress={go(`${HEARTH}/land/place${q({ id: s.placeId })}`)} />}
        <Row icon="grimoire" title="Note an offering in the land journal" detail="With the weather, the moon and the day" onPress={go(`${HEARTH}/land/note-edit${q({ place: s.placeId })}`)} />
        <Row icon="wheel" title="Sit with it in a spirit session" detail="Pendulum, scrying, trance: with protections and a closing" last onPress={go(`/rituals/divination/sessions/edit${q({ link: 'place-spirit', ref: entry.id, title: s.name })}`)} />
      </List>
    </RitualScreen>
  );
}
