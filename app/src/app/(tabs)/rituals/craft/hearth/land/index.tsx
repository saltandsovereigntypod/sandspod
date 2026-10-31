import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { go, HEARTH, q, useLand } from '../../../../../../components/craft/hearth';
import { Body, Card, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import { herbName } from '../../../../../../lib/craft/green/garden';
import { filterNotes, herbsSeen, kindsOf, moonOnDay, NOTE_KINDS, noteKindLabel, noteTitle, placeCounts, placeKindLabel, sortPlaces, yearMarkers, type NoteKind } from '../../../../../../lib/craft/hearth/land';
import { useSession } from '../../../../../../lib/session';

const short = (key: string) => fullDate(key)?.replace(/, \d{4}$/, '') ?? key;

// The land journal: your places, and every note made on the land, newest
// first, by place, kind, herb or word; the frosts and firsts of each year;
// and the Library herbs and trees you've seen.
export default function LandJournal() {
  const params = useLocalSearchParams<{ herb?: string; place?: string }>();
  const { session } = useSession();
  const { places, notes, names, ready } = useLand();
  const [kind, setKind] = useState<NoteKind | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(params.place ?? null);
  const [herb, setHerb] = useState<string | null>(params.herb ?? null);
  const [query, setQuery] = useState('');
  const shown = useMemo(() => filterNotes(notes, { kind, placeId, herb, query }, names), [notes, kind, placeId, herb, query, names]);
  const counts = useMemo(() => placeCounts(notes), [notes]);
  const markers = useMemo(() => yearMarkers(notes), [notes]);
  const seen = useMemo(() => herbsSeen(notes).slice(0, 12), [notes]);

  return (
    <RitualScreen back="Hearth & land">
      <Title eyebrow="Hearth & land">Land journal</Title>
      <Body muted>The places you know, and what they do through the year. Each note is read against its day: the moon that evening, the Wheel of the Year and the holy days of the calendars you keep.</Body>

      <View style={ui.actions}>
        <Button label="Note what you see" onPress={go(`${HEARTH}/land/note-edit${q({ place: placeId, herb })}`)} />
        <Button label="This time last year" variant="outline" onPress={go(`${HEARTH}/land/last-year`)} />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Your places</SectionLabel>
        {places.length ? (
          <List>
            {sortPlaces(places).map((p, i, all) => (
              <Row
                key={p.id}
                icon={p.data.kind === 'home' ? 'altar' : 'wheel'}
                title={p.data.archived ? `${p.data.name} (resting)` : p.data.name}
                detail={[placeKindLabel(p.data.kind), counts[p.id] ? `${counts[p.id].count} notes, last ${short(counts[p.id].last)}` : 'No notes yet'].join(' · ')}
                last={i === all.length - 1}
                onPress={go(`${HEARTH}/land/place${q({ id: p.id })}`)}
              />
            ))}
          </List>
        ) : (
          <Card>
            <Body>{ready ? 'Add the places you know: your home, a garden, a wood you walk, a shore. Notes can be made without one too.' : 'Opening…'}</Body>
          </Card>
        )}
        <Button label="Add a place" variant="outline" onPress={go(`${HEARTH}/land/place-edit`)} />
      </View>

      {notes.length > 0 && (
        <Card>
          <Field label="Search your notes" value={query} onChange={setQuery} placeholder="Frost, swifts, blackthorn…" />
          <Chips>
            <Chip label="Any kind" selected={!kind} onPress={() => setKind(null)} />
            {NOTE_KINDS.filter((k) => notes.some((n) => kindsOf(n.data).includes(k.id))).map((k) => (
              <Chip key={k.id} label={k.label} selected={kind === k.id} onPress={() => setKind(kind === k.id ? null : k.id)} />
            ))}
          </Chips>
          {places.length > 1 && (
            <Chips>
              <Chip label="Every place" selected={!placeId} onPress={() => setPlaceId(null)} />
              {places.map((p) => (
                <Chip key={p.id} label={p.data.name} selected={placeId === p.id} onPress={() => setPlaceId(placeId === p.id ? null : p.id)} />
              ))}
            </Chips>
          )}
          {!!herb && <Chip label={`Seen: ${herbName(herb) ?? herb} ✕`} selected onPress={() => setHerb(null)} />}
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>{notes.length ? `${shown.length} ${shown.length === 1 ? 'note' : 'notes'}` : 'Notes'}</SectionLabel>
        {shown.length ? (
          <List>
            {shown.slice(0, 60).map((n, i, all) => (
              <Row
                key={n.id}
                icon="grimoire"
                title={noteTitle(n.data)}
                detail={[short(n.data.on), names[n.data.placeId ?? ''], moonOnDay(n.data.on), kindsOf(n.data).map(noteKindLabel).join(', ')].filter(Boolean).join(' · ')}
                last={i === all.length - 1}
                onPress={go(`${HEARTH}/land/note${q({ id: n.id })}`)}
              />
            ))}
          </List>
        ) : (
          <Card>
            <Body>{notes.length ? 'No note matches all of that.' : 'Nothing noted yet. The first frost, the first swallow, the day the river came up: small things, kept year on year, become a calendar of your own place.'}</Body>
          </Card>
        )}
      </View>

      {markers.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Frosts and firsts, year by year</SectionLabel>
          <List>
            {markers.map((m, i) => (
              <Row
                key={m.year}
                icon="calendar"
                title={String(m.year)}
                detail={[
                  m.lastFrost ? `Last frost ${short(m.lastFrost)}` : '',
                  m.firstFrost ? `First frost ${short(m.firstFrost)}` : '',
                  ...Object.entries(m.firsts).map(([k, d]) => `First ${noteKindLabel(k).toLowerCase()} ${short(d!)}`),
                ]
                  .filter(Boolean)
                  .join(' · ')}
                last={i === markers.length - 1}
                onPress={() => setQuery(String(m.year))}
              />
            ))}
          </List>
        </View>
      )}

      {seen.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Herbs and trees you’ve seen</SectionLabel>
          <Chips>
            {seen.map((h) => (
              <Chip key={h.key} label={`${h.name} · ${h.count}`} selected={herb === h.key} onPress={() => setHerb(herb === h.key ? null : h.key)} />
            ))}
          </Chips>
          <Body muted>Tap one to see your notes of it. Each opens in the Living Library from its note.</Body>
        </View>
      )}

      {!session && <Body muted>Kept on this phone. Sign in to keep your land journal with your account.</Body>}
    </RitualScreen>
  );
}
