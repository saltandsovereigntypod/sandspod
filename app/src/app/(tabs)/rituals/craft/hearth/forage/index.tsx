import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { ForageFirst, go, HEARTH, q, useDayContext, useLand } from '../../../../../../components/craft/hearth';
import { Body, Card, Chip, Chips, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { eveningOf, gardenNight, QUARTERS } from '../../../../../../lib/craft/green/moonGarden';
import { isTropical, MONTH_NAMES } from '../../../../../../lib/craft/green/season';
import {
  forageByKey,
  forageInMonth,
  forageSpan,
  LAND_GROWING,
  LAND_HARVESTS,
  MOON_PLANTING_NOTE,
  normalizeHarvest,
  normalizePatch,
  patchesByPlace,
  patchesInSeason,
  PATCH_KINDS,
  storeCupboard,
  USE_LABELS,
  worstLookAlike,
  DANGER_LABELS,
} from '../../../../../../lib/craft/hearth/forage';
import { useCraft } from '../../../../../../lib/craft/store';
import { type } from '../../../../../../theme';

// Foraging & garden: what to gather this month where you are (turned for the
// southern hemisphere), what grows on your own places, the harvest log and
// store cupboard, and planting by the moon, honestly framed.
export default function ForageHome() {
  const now = useMemo(() => new Date(), []);
  const { hemisphere, place } = useDayContext();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { places, names } = useLand();
  const patches = useCraft<unknown>(LAND_GROWING).entries.map((e) => ({ ...e, data: normalizePatch(e.data) }));
  const harvests = useCraft<unknown>(LAND_HARVESTS).entries.map((e) => ({ ...e, data: normalizeHarvest(e.data) }));
  const plants = forageInMonth(month, hemisphere);
  const groups = patchesByPlace(patches, places.map((p) => p.id));
  const ready = patchesInSeason(patches, now.getMonth() + 1, hemisphere);
  const cupboard = storeCupboard(harvests);
  const night = gardenNight(eveningOf(now));

  return (
    <RitualScreen back="Hearth & land">
      <Title eyebrow="Hearth & land">Foraging & garden</Title>
      <Body muted>{`What the hedgerow and the garden give through the year, as it comes ${hemisphere === 'south' ? 'south' : 'north'} of the equator. Weather, height and the year move everything by weeks.`}</Body>
      {isTropical(place?.latitude) && <Body muted>Near the equator the year runs by wet and dry seasons rather than these; take the months loosely.</Body>}

      <ForageFirst />

      {ready.length > 0 && (
        <Card accent>
          <SectionLabel>Ready on your places now</SectionLabel>
          <Body>{ready.map((p) => `${p.data.name}${p.data.placeId && names[p.data.placeId] ? ` (${names[p.data.placeId]})` : ''}`).join(', ')}</Body>
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>{`To gather in ${MONTH_NAMES[month - 1]}`}</SectionLabel>
        <Chips>
          {MONTH_NAMES.map((m, i) => (
            <Chip key={m} label={m.slice(0, 3)} a11yLabel={m} selected={month === i + 1} onPress={() => setMonth(i + 1)} />
          ))}
        </Chips>
        {plants.length ? (
          <List>
            {plants.map((p, i) => {
              const worst = worstLookAlike(p);
              return (
                <Row
                  key={p.key}
                  icon="wheel"
                  title={p.name}
                  detail={[p.parts, forageSpan(p, hemisphere), USE_LABELS[p.use], worst && worst.danger !== 'mild' ? `${DANGER_LABELS[worst.danger]} look-alike: ${worst.name}` : ''].filter(Boolean).join(' · ')}
                  last={i === plants.length - 1}
                  onPress={go(`${HEARTH}/forage/plant${q({ key: p.key })}`)}
                />
              );
            })}
          </List>
        ) : (
          <Card>
            <Body>Little to gather this month. A good time to read about next season’s plants and their look-alikes.</Body>
          </Card>
        )}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>What grows where</SectionLabel>
        {groups.length ? (
          groups.map((g) => (
            <View key={g.placeId ?? 'none'} style={ui.gapSmall}>
              <Body muted>{g.placeId ? names[g.placeId] : 'No place given'}</Body>
              <List>
                {g.patches.map((x, i) => (
                  <Row
                    key={x.id}
                    icon="wheel"
                    title={x.data.name}
                    detail={[PATCH_KINDS.find((k) => k.id === x.data.kind)?.label, x.data.spot, forageByKey(x.data.forage) ? `Gather ${forageSpan(forageByKey(x.data.forage)!, hemisphere)}` : ''].filter(Boolean).join(' · ')}
                    last={i === g.patches.length - 1}
                    onPress={go(`${HEARTH}/forage/patch-edit${q({ id: x.id })}`)}
                  />
                ))}
              </List>
            </View>
          ))
        ) : (
          <Card>
            <Body>{places.length ? 'Note what grows on your places: the elder by the gate, the sloes along the lane, the mint by the back door.' : 'Add your places in the land journal first, then note what grows on each.'}</Body>
          </Card>
        )}
        <View style={ui.actions}>
          <Button label="Add something that grows" variant="outline" onPress={go(`${HEARTH}/forage/patch-edit`)} />
          {!places.length && <Button label="Add a place" variant="text" onPress={go(`${HEARTH}/land/place-edit`)} />}
        </View>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Harvests</SectionLabel>
        <List>
          <Row icon="grimoire" title="Harvest log" detail={harvests.length ? `${harvests.length} gathered · ${cupboard.length} in the store cupboard` : 'What you gather, with the moon it was gathered under'} onPress={go(`${HEARTH}/forage/harvests`)} />
          <Row icon="grimoire" title="Log a harvest" detail="From a hedgerow, the garden or a pot on the windowsill" last onPress={go(`${HEARTH}/forage/harvest-edit`)} />
        </List>
      </View>

      <Card>
        <SectionLabel>Planting by the moon</SectionLabel>
        <Text style={type.cardTitle}>{QUARTERS[night.quarter].headline}</Text>
        <Body muted>{MOON_PLANTING_NOTE}</Body>
        <List>
          <Row icon="calendar" title="Tonight in the garden" detail={`On Green · ${night.phase}, moon in ${night.sign}`} onPress={go('/rituals/craft/green/moon')} />
          <Row icon="wheel" title="In season to sow and gather" detail="On Green · garden herbs month by month" onPress={go('/rituals/craft/green/season')} />
          <Row icon="grimoire" title="My garden" detail="On Green · your plants and their history" last onPress={go('/rituals/craft/green/garden')} />
        </List>
      </Card>
    </RitualScreen>
  );
}
