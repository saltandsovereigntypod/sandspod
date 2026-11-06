import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { go, HEARTH, q } from '../../../../../../components/craft/hearth';
import { Body, Card, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { fullDate, longDate, relativeDay } from '../../../../../../lib/calendar';
import {
  animalLabel,
  careDue,
  FAMILIARS,
  familiarLine,
  markCareDone,
  memorialDay,
  normalizeFamiliar,
  NOTE_KINDS,
  petCautions,
  spanWords,
  WORK_KINDS,
  type FamiliarNoteKind,
} from '../../../../../../lib/craft/hearth/familiars';
import { updateEntry, useCraft } from '../../../../../../lib/craft/store';
import { localDateKey } from '../../../../../../lib/rituals/lifecycle';
import { type } from '../../../../../../theme';

export default function FamiliarPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const raw = useCraft<unknown>(FAMILIARS);
  const entry = raw.entries.find((e) => e.id === id) ?? null;
  const f = useMemo(() => (entry ? normalizeFamiliar(entry.data) : null), [entry]);
  const now = useMemo(() => new Date(), []);
  const [note, setNote] = useState<{ kind: FamiliarNoteKind; text: string } | null>(null);
  if (!entry || !f) {
    return (
      <RitualScreen back="Familiars">
        <Title>A familiar</Title>
        <Body>{raw.ready ? 'This page couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const today = localDateKey(now);
  const due = careDue(f, now);
  const cautions = petCautions(f);
  const memorial = memorialDay(f, now);
  const save = (next: typeof f) => void updateEntry(FAMILIARS, entry.id, next);
  const keepNote = () => {
    if (!note?.text.trim()) return;
    save({ ...f, notes: [{ on: today, kind: note.kind, text: note.text.trim() }, ...f.notes] });
    setNote(null);
  };

  return (
    <RitualScreen back="Familiars">
      <Title eyebrow={f.kind === 'remembered' ? 'Remembered' : f.kind === 'spirit' ? 'Spirit familiar' : animalLabel(f.animal)}>{f.name}</Title>
      <Body muted>{familiarLine(f, now)}</Body>
      {!!f.about && <Body>{f.about}</Body>}

      {f.kind === 'remembered' && (
        <Card accent>
          <SectionLabel>In memory</SectionLabel>
          {!!f.died && <Text style={type.cardTitle}>{`${f.born ? `${fullDate(f.born)} – ` : ''}${fullDate(f.died)}`}</Text>}
          {!!f.came && !!f.died && <Body muted>{`With you for ${spanWords(f.came, f.died) || 'a little while'}.`}</Body>}
          {!!f.memorial.words && <Body>{f.memorial.words}</Body>}
          {!!f.memorial.resting && <Body muted>{`Resting: ${f.memorial.resting}`}</Body>}
          {!!f.memorial.keepsake && <Body muted>{`Kept: ${f.memorial.keepsake}`}</Body>}
          {memorial && <Body muted>{`Their day comes round ${relativeDay(now, memorial.date)}, ${longDate(memorial.date)}: ${memorial.years === 1 ? 'one year' : `${memorial.years} years`}. Light a candle, or tell a story about them.`}</Body>}
        </Card>
      )}

      {due.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Care days</SectionLabel>
          {due.map((d) => (
            <Card key={d.index}>
              <Text style={type.cardTitle}>{d.what}</Text>
              <Body muted>{d.inDays < 0 ? `${-d.inDays} ${d.inDays === -1 ? 'day' : 'days'} overdue` : d.inDays === 0 ? 'Due today' : `Next ${relativeDay(now, new Date(now.getFullYear(), now.getMonth(), now.getDate() + d.inDays))}`}</Body>
              <Button label="Done today" variant="outline" onPress={() => save(markCareDone(f, d.index, today))} />
            </Card>
          ))}
          <Body muted>Rhythms are reminders, not veterinary advice. Your vet’s word comes first.</Body>
        </View>
      )}

      {f.work.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>The work they join</SectionLabel>
          <Chips>
            {f.work.map((w) => (
              <Chip key={w} label={WORK_KINDS.find((k) => k.id === w)?.label ?? w} />
            ))}
          </Chips>
          <Body muted>An animal joins the work on their own terms. If they leave the room, let them; never confine an animal to a ritual, and keep them clear of smoke and flame.</Body>
        </View>
      )}

      {cautions.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Keeping them safe around the craft</SectionLabel>
          {cautions.map((c) => (
            <Card key={c.title}>
              <Text style={type.cardTitle}>{c.title}</Text>
              <Body>{c.text}</Body>
            </Card>
          ))}
        </View>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Signs and notes</SectionLabel>
        {note ? (
          <Card>
            <Chips>
              {NOTE_KINDS.map((k) => (
                <Chip key={k.id} label={k.label} selected={note.kind === k.id} onPress={() => setNote({ ...note, kind: k.id })} />
              ))}
            </Chips>
            <Field label="What happened" value={note.text} onChange={(text) => setNote({ ...note, text })} multiline placeholder="Sat on the cards and wouldn’t move; watched the corner all evening" />
            <View style={ui.actions}>
              <Button label="Keep it" onPress={keepNote} disabled={!note.text.trim()} />
              <Button label="Cancel" variant="text" onPress={() => setNote(null)} />
            </View>
          </Card>
        ) : (
          <Button label="Note a sign or a moment" variant="outline" onPress={() => setNote({ kind: 'sign', text: '' })} />
        )}
        {f.notes.slice(0, 30).map((n, i) => (
          <Body key={`${n.on}-${i}`}>{`${fullDate(n.on)} · ${NOTE_KINDS.find((k) => k.id === n.kind)?.label}: ${n.text}`}</Body>
        ))}
      </View>

      <Button label="Edit" variant="outline" onPress={go(`${HEARTH}/familiars/edit${q({ id: entry.id })}`)} />
      <List>
        <Row icon="altar" title="Blending lab" detail="Check a blend before you burn it near them" onPress={go('/rituals/craft/kitchen/blend')} />
        <Row icon="wheel" title="Sit with them in a spirit session" detail="For a spirit familiar, or one remembered" last onPress={go(`/rituals/divination/sessions/edit${q({ link: 'familiar', ref: entry.id, title: f.name })}`)} />
      </List>
    </RitualScreen>
  );
}
