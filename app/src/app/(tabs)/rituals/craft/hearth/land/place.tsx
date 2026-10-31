import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { LandCard } from '../../../../../../components/craft/LandCard';
import { go, HEARTH, q, useLand } from '../../../../../../components/craft/hearth';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import { asPlant, isGrowing, PLANTS } from '../../../../../../lib/craft/green/garden';
import { forageByKey, LAND_GROWING, normalizePatch, PATCH_KINDS } from '../../../../../../lib/craft/hearth/forage';
import { filterNotes, kindsOf, moonOnDay, noteKindLabel, noteTitle, placeKindLabel, yearMarkers } from '../../../../../../lib/craft/hearth/land';
import { usePlaceWhere } from '../../../../../../lib/craft/hearth/landWhere';
import { useCraft } from '../../../../../../lib/craft/store';
import { type } from '../../../../../../theme';

const short = (key: string) => fullDate(key)?.replace(/, \d{4}$/, '') ?? key;

// One place in the land journal: what it is, its spirit and what you give
// it, what grows there, and every note made there.
export default function LandPlaceScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { places, notes, ready } = useLand();
  const place = places.find((p) => p.id === id) ?? null;
  const where = usePlaceWhere(place?.id);
  const patches = useCraft<unknown>(LAND_GROWING).entries.map((e) => ({ ...e, data: normalizePatch(e.data) })).filter((p) => p.data.placeId === id);
  const garden = useCraft<unknown>(PLANTS).entries.map((e) => ({ id: e.id, plant: asPlant(e.data) })).filter((p) => isGrowing(p.plant));
  const here = useMemo(() => filterNotes(notes, { placeId: id ?? null }), [notes, id]);
  const marks = useMemo(() => yearMarkers(notes, id)[0], [notes, id]);

  if (!place) {
    return (
      <RitualScreen back="Land journal">
        <Title>A place</Title>
        <Body>{ready ? 'This place couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const p = place.data;
  const offerings = here.filter((n) => n.data.offering.trim());

  return (
    <RitualScreen back="Land journal">
      <Title eyebrow={placeKindLabel(p.kind)}>{p.name}</Title>
      {!!p.about && <Body>{p.about}</Body>}
      {!!where && <Body muted>{`Roughly: ${where} (kept only on this phone)`}</Body>}
      {!!p.since && <Body muted>{`Known since ${fullDate(p.since)}`}</Body>}

      <View style={ui.actions}>
        <Button label="Note something here" onPress={go(`${HEARTH}/land/note-edit${q({ place: place.id })}`)} />
        <Button label="Edit this place" variant="outline" onPress={go(`${HEARTH}/land/place-edit${q({ id: place.id })}`)} />
      </View>

      <Card>
        <SectionLabel>The spirit of the place</SectionLabel>
        <Body>{p.spirit || 'Nothing written yet. What do you sense here? Is there a name, a feeling, a way you greet it?'}</Body>
        <SectionLabel>What you give here</SectionLabel>
        <Body>{p.offerings || 'Nothing written yet. Water, bread, song, a little tidying, or simply attention.'}</Body>
        {offerings.length > 0 && <Body muted>{`Last offering ${short(offerings[0].data.on)}: ${offerings[0].data.offering}`}</Body>}
        <Body muted>Leave offerings that won’t harm the place or the creatures who live there: no plastic, nothing that won’t rot, no bread for the ducks.</Body>
        <List>
          <Row icon="altar" title="Set out an offering on your altar" detail="The cabinet’s Offerings drawer, for the spirit of this place" onPress={go('/altar')} />
          <Row icon="wheel" title="Its lore" detail="Local lore: the stories, spirits and sayings of your places" last onPress={go('/rituals/craft/folk/lore')} />
        </List>
      </Card>

      {!!p.access && (
        <Card>
          <SectionLabel>Access and care</SectionLabel>
          <Body>{p.access}</Body>
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>What grows here</SectionLabel>
        {patches.length > 0 && (
          <List>
            {patches.map((x, i) => (
              <Row
                key={x.id}
                icon="wheel"
                title={x.data.name}
                detail={[PATCH_KINDS.find((k) => k.id === x.data.kind)?.label, x.data.spot, forageByKey(x.data.forage) ? 'Foraging notes' : ''].filter(Boolean).join(' · ')}
                last={i === patches.length - 1}
                onPress={go(`${HEARTH}/forage/patch-edit${q({ id: x.id })}`)}
              />
            ))}
          </List>
        )}
        {(p.kind === 'garden' || p.kind === 'home') && garden.length > 0 && (
          <List>
            {garden.slice(0, 8).map((g, i, all) => (
              <Row key={g.id} icon="grimoire" title={g.plant.name} detail={`My garden${g.plant.place ? ` · ${g.plant.place}` : ''}`} last={i === all.length - 1} onPress={go(`/rituals/craft/green/plant/${g.id}`)} />
            ))}
          </List>
        )}
        <Button label="Add something that grows here" variant="outline" onPress={go(`${HEARTH}/forage/patch-edit${q({ place: place.id })}`)} />
      </View>

      {marks && (
        <Card>
          <SectionLabel>{`Here in ${marks.year}`}</SectionLabel>
          <Text style={type.body}>
            {[marks.lastFrost ? `Last frost ${short(marks.lastFrost)}` : '', marks.firstFrost ? `First frost ${short(marks.firstFrost)}` : '', ...Object.entries(marks.firsts).map(([k, d]) => `First ${noteKindLabel(k).toLowerCase()} ${short(d!)}`)]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>{`${here.length} ${here.length === 1 ? 'note' : 'notes'} here`}</SectionLabel>
        {here.length > 0 && (
          <List>
            {here.slice(0, 40).map((n, i, all) => (
              <Row key={n.id} icon="grimoire" title={noteTitle(n.data)} detail={[fullDate(n.data.on), moonOnDay(n.data.on), kindsOf(n.data).map(noteKindLabel).join(', ')].filter(Boolean).join(' · ')} last={i === all.length - 1} onPress={go(`${HEARTH}/land/note${q({ id: n.id })}`)} />
            ))}
          </List>
        )}
      </View>

      <LandCard />
    </RitualScreen>
  );
}
