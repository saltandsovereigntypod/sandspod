import { useMemo } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { go, HEARTH, q } from '../../../../../../components/craft/hearth';
import { Body, Card, Expander, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { careDue, FAMILIAR_HISTORY, FAMILIARS, familiarLine, normalizeFamiliar } from '../../../../../../lib/craft/hearth/familiars';
import { useCraft } from '../../../../../../lib/craft/store';

// Familiars: living animals, spirit companions and the remembered.
export default function Familiars() {
  const raw = useCraft<unknown>(FAMILIARS);
  const now = useMemo(() => new Date(), []);
  const all = useMemo(() => raw.entries.map((e) => ({ ...e, data: normalizeFamiliar(e.data) })).sort((a, b) => a.data.name.localeCompare(b.data.name)), [raw.entries]);
  const due = all.flatMap((f) => careDue(f.data, now).filter((d) => d.inDays <= 2).map((d) => ({ ...d, id: f.id, name: f.data.name })));
  const groups = [
    { title: 'Living with you', list: all.filter((f) => f.data.kind === 'living') },
    { title: 'Spirit familiars', list: all.filter((f) => f.data.kind === 'spirit') },
    { title: 'Remembered', list: all.filter((f) => f.data.kind === 'remembered') },
  ];

  return (
    <RitualScreen back="Hearth & land">
      <Title eyebrow="Hearth & land">Familiars</Title>
      <Body muted>The animals you share your home with, the spirit companions you work beside, and the ones who have gone before. Their care days, the work they join, the signs you notice, and a place to remember them.</Body>
      <View style={ui.actions}>
        <Button label="Add a familiar" onPress={go(`${HEARTH}/familiars/edit`)} />
      </View>

      {due.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Care coming due</SectionLabel>
          <List>
            {due.map((d, i) => (
              <Row
                key={`${d.id}-${d.index}`}
                icon="bell"
                title={`${d.name}: ${d.what}`}
                detail={d.inDays < 0 ? `${-d.inDays} ${d.inDays === -1 ? 'day' : 'days'} overdue` : d.inDays === 0 ? 'Due today' : `Due in ${d.inDays} ${d.inDays === 1 ? 'day' : 'days'}`}
                last={i === due.length - 1}
                onPress={go(`${HEARTH}/familiars/familiar${q({ id: d.id })}`)}
              />
            ))}
          </List>
        </View>
      )}

      {!raw.ready ? (
        <Body muted>Opening…</Body>
      ) : all.length === 0 ? (
        <Card>
          <Body>No one here yet. Add the cat on the altar cloth, the dog who walks the bounds with you, the hare you meet in trance, or the old friend you still miss.</Body>
        </Card>
      ) : (
        groups
          .filter((g) => g.list.length)
          .map((g) => (
            <View key={g.title} style={ui.gapSmall}>
              <SectionLabel>{g.title}</SectionLabel>
              <List>
                {g.list.map((f, i) => (
                  <Row key={f.id} icon={f.data.kind === 'remembered' ? 'samhain' : 'altar'} title={f.data.name} detail={familiarLine(f.data, now)} last={i === g.list.length - 1} onPress={go(`${HEARTH}/familiars/familiar${q({ id: f.id })}`)} />
                ))}
              </List>
            </View>
          ))
      )}

      <Expander title="Where the familiar comes from">
        <Body>{FAMILIAR_HISTORY}</Body>
      </Expander>
      <List>
        <Row icon="altar" title="Blending lab" detail="Incense, oils and teas, with pet-safety notes for cats and dogs" onPress={go('/rituals/craft/kitchen/blend')} />
        <Row icon="samhain" title="Ancestors" detail="Your beloved dead, people and their days" last onPress={go('/rituals/craft/hedge/ancestors')} />
      </List>
    </RitualScreen>
  );
}
