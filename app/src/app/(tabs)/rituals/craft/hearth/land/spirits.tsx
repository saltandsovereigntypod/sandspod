import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { go, HEARTH, q, useLand } from '../../../../../../components/craft/hearth';
import { Body, Card, Expander, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { LAND_RESPECT, LAND_SPIRITS, normalizeSpirit, spiritLine, spiritsAt } from '../../../../../../lib/craft/hearth/spirits';
import { useCraft } from '../../../../../../lib/craft/store';

// Spirits of place: the presences of your land journal's places.
export default function Spirits() {
  const { place } = useLocalSearchParams<{ place?: string }>();
  const { places, names, ready } = useLand();
  const raw = useCraft<unknown>(LAND_SPIRITS);
  const spirits = useMemo(() => raw.entries.map((e) => ({ ...e, data: normalizeSpirit(e.data) })), [raw.entries]);
  const here = place ? places.find((p) => p.id === place) : null;
  const shown = spiritsAt(spirits, here ? here.id : null);

  return (
    <RitualScreen back={here ? here.data.name : 'Land journal'}>
      <Title eyebrow={here ? here.data.name : 'Land journal'}>Spirits of place</Title>
      <Body muted>
        The presences you come to know on your land: an old tree, a spring, the house itself, the dead of a hill. What you’ve sensed of them, where, what you gave and how it seemed to be received. Offerings you note in the land journal at the same place appear with them.
      </Body>
      <View style={ui.actions}>
        <Button label="Add a spirit of place" onPress={go(`${HEARTH}/land/spirit-edit${q({ place: here?.id })}`)} />
      </View>

      {!ready || !raw.ready ? (
        <Body muted>Opening…</Body>
      ) : shown.length === 0 ? (
        <Card>
          <Body>{`${here ? 'No spirits noted here yet.' : 'No spirits noted yet.'} Most begin as “not yet known”: a feeling at a gate, a tree you always greet. Note it, and visit again.`}</Body>
        </Card>
      ) : (
        <View style={ui.gapSmall}>
          <SectionLabel>{here ? 'Here' : 'Known to you'}</SectionLabel>
          <List>
            {shown.map((s, i) => (
              <Row
                key={s.id}
                icon="samhain"
                title={s.data.resting ? `${s.data.name} (resting)` : s.data.name}
                detail={spiritLine(s.data, s.data.placeId ? (names[s.data.placeId] ?? null) : null)}
                last={i === shown.length - 1}
                onPress={go(`${HEARTH}/land/spirit${q({ id: s.id })}`)}
              />
            ))}
          </List>
        </View>
      )}

      <Card>
        <SectionLabel>Whose land, and with what care</SectionLabel>
        {LAND_RESPECT.map((t) => (
          <Body key={t.slice(0, 24)}>{t}</Body>
        ))}
        <Expander title="Finding out whose land you’re on">
          <Body>
            Native Land Digital (native-land.ca) maps the territories, treaties and languages of Indigenous peoples across much of the world. It is a place to start and says itself that it isn’t authoritative; local histories, place-name records and the people of the land are better still.
          </Body>
        </Expander>
      </Card>

      <List>
        <Row icon="wheel" title="Local lore" detail="On Traditional & folk · the stories, spirits and sayings of your places" onPress={go('/rituals/craft/folk/lore')} />
        <Row icon="altar" title="Offerings on the altar" detail="The cabinet’s Offerings drawer" onPress={go('/altar')} />
        <Row icon="wheel" title="Spirit sessions" detail="When you sit to listen, by pendulum, scrying or trance" last onPress={go('/rituals/divination/sessions')} />
      </List>
    </RitualScreen>
  );
}
