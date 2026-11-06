import { useMemo } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { go, HEARTH } from '../../../../../../components/craft/hearth';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { groupSpots, normaliseSpot, spotKind, spotName, wardLabel, WARDS, wardsByDue, type WardSpot } from '../../../../../../lib/craft/hearth/wards';
import { useCraft } from '../../../../../../lib/craft/store';

// Home wards: the house as a list of places (doors, windows, thresholds,
// rooms), what guards each, and when each ward wants renewing. Reminders ring
// through To tend.
export default function Wards() {
  const now = useMemo(() => new Date(), []);
  const { entries, ready } = useCraft<WardSpot>(WARDS);
  const spots = useMemo(() => entries.map((e) => ({ id: e.id, data: normaliseSpot(e.data) })), [entries]);
  const due = useMemo(() => wardsByDue(spots, now).filter((w) => w.due.due), [spots, now]);
  const groups = useMemo(() => groupSpots(spots), [spots]);
  const count = spots.reduce((n, s) => n + s.data.wards.length, 0);

  return (
    <RitualScreen back="Hearth & land">
      <Title eyebrow="Hearth & land">Wards</Title>
      <Body muted>Your home as a list of its ways in: each door, window, threshold and room, what guards it, and when it was last renewed. Ask for a reminder and it rings from your To tend list.</Body>

      {due.length > 0 && (
        <Card accent>
          <SectionLabel>Due for renewing</SectionLabel>
          {due.slice(0, 6).map((d) => (
            <Body key={d.ward.id}>{`${wardLabel(d.ward)} · ${spotName(d.spot)}: ${d.due.line}`}</Body>
          ))}
        </Card>
      )}

      {ready && !spots.length && (
        <Card>
          <Body>Start with the front door: it is where most house charms in the record were set, over the lintel, under the step or in the frame. Then the back door, the windows, and the hearth if you have one.</Body>
        </Card>
      )}

      {groups.map((g) => (
        <View key={g.area} style={ui.gapSmall}>
          <SectionLabel>{g.area}</SectionLabel>
          <List>
            {g.spots.map((s, i) => (
              <Row
                key={s.id}
                icon="altar"
                title={spotName(s.data)}
                detail={s.data.wards.length ? s.data.wards.map(wardLabel).join(', ') : `${spotKind(s.data.kind).label} · nothing set yet`}
                last={i === g.spots.length - 1}
                onPress={go(`${HEARTH}/wards/spot?id=${encodeURIComponent(s.id)}`)}
              />
            ))}
          </List>
        </View>
      ))}

      <Button label="Add a door, window or room" onPress={go(`${HEARTH}/wards/spot`)} />
      {count > 0 && <Body muted>{`${count} ward${count === 1 ? '' : 's'} across ${spots.length} place${spots.length === 1 ? '' : 's'}.`}</Body>}

      <View style={ui.gapSmall}>
        <SectionLabel>Alongside</SectionLabel>
        <List>
          <Row icon="today" title="To tend" detail="Renew wards from your list, with cleansing and salt lines" onPress={go('/today/tend')} />
          <Row icon="grimoire" title="Make a sigil for a door" detail="The sigil maker, then carve or draw it" onPress={go('/rituals/sigil')} />
          <Row icon="altar" title="Blending lab" detail="A protection powder for the threshold" onPress={go('/rituals/craft/kitchen/blend')} />
          <Row icon="wheel" title="Local lore" detail="The spirits and stories of your places" last onPress={go('/rituals/craft/folk/lore')} />
        </List>
      </View>
    </RitualScreen>
  );
}
