import { useMemo } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { go, HEARTH, q, useLand } from '../../../../../../components/craft/hearth';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import { harvestLine, LAND_HARVESTS, monthsKept, normalizeHarvest, sortHarvests, storeCupboard } from '../../../../../../lib/craft/hearth/forage';
import { useCraft } from '../../../../../../lib/craft/store';

// The harvest log and the store cupboard: everything gathered, newest first,
// and what's still kept, oldest first so it's used in time. The Apothecary
// has no stock list of its own, so what you make from the cupboard is made
// there, at the altar.
export default function Harvests() {
  const now = useMemo(() => new Date(), []);
  const { names } = useLand();
  const { entries, ready } = useCraft<unknown>(LAND_HARVESTS);
  const list = useMemo(() => entries.map((e) => ({ ...e, data: normalizeHarvest(e.data) })), [entries]);
  const cupboard = storeCupboard(list);
  const all = sortHarvests(list);

  return (
    <RitualScreen back="Foraging & garden">
      <Title eyebrow="Foraging & garden">Harvests</Title>
      <Body muted>What you’ve gathered, from the hedgerow, the garden or a pot, with the moon it came in under.</Body>
      <Button label="Log a harvest" onPress={go(`${HEARTH}/forage/harvest-edit`)} />

      <View style={ui.gapSmall}>
        <SectionLabel>The store cupboard</SectionLabel>
        {cupboard.length ? (
          <List>
            {cupboard.map((h, i) => {
              const months = monthsKept(h.data, now) ?? 0;
              return (
                <Row
                  key={h.id}
                  icon="altar"
                  title={h.data.name}
                  detail={[h.data.amount, `kept since ${fullDate(h.data.storedOn || h.data.on)}`, months >= 12 ? 'past its best year: use or return to the earth' : months >= 9 ? 'use it soon' : ''].filter(Boolean).join(' · ')}
                  last={i === cupboard.length - 1}
                  onPress={go(`${HEARTH}/forage/harvest-edit${q({ id: h.id })}`)}
                />
              );
            })}
          </List>
        ) : (
          <Card>
            <Body>Nothing kept yet. Mark a harvest “still in the cupboard” when you dry or jar it.</Body>
          </Card>
        )}
        <List>
          <Row icon="altar" title="Make something in the Apothecary" detail="At the altar: a spell jar, sachet, oil or blend from what you’ve kept" onPress={go('/altar')} />
          <Row icon="rituals" title="Your Apothecary workings" detail="Jars and sachets you’ve made, and whether they worked" last onPress={go('/rituals/apothecary')} />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>{`${all.length} ${all.length === 1 ? 'harvest' : 'harvests'}`}</SectionLabel>
        {all.length ? (
          <List>
            {all.map((h, i) => (
              <Row
                key={h.id}
                icon="grimoire"
                title={h.data.name}
                detail={[fullDate(h.data.on), names[h.data.placeId ?? ''], harvestLine(h.data)].filter(Boolean).join(' · ')}
                last={i === all.length - 1}
                onPress={go(`${HEARTH}/forage/harvest-edit${q({ id: h.id })}`)}
              />
            ))}
          </List>
        ) : (
          <Card>
            <Body>{ready ? 'Nothing logged yet.' : 'Opening…'}</Body>
          </Card>
        )}
      </View>
    </RitualScreen>
  );
}
