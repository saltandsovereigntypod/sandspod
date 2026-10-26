import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { drawFor } from '../../../../components/divination/Linked';
import { Body, Card, Expander, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { deityLink } from '../../../../lib/divination/linked';
import { PATRON_GUIDE, myDeities, levelLabel } from '../../../../lib/patron';
import { useMySettings } from '../../../../lib/settings/store';

// The patron deities guide: what a patron is (and isn't), how to know, how to
// accept or decline, and what it changes; then your own deities.
export default function PatronGuide() {
  const { settings } = useMySettings();
  const mine = myDeities(settings);
  const guide = PATRON_GUIDE;

  return (
    <RitualScreen back="Journeys">
      <Title eyebrow="A guide">{guide.title}</Title>
      <Body>{guide.intro}</Body>

      <Card>
        <SectionLabel>Your deities</SectionLabel>
        {mine.length ? (
          <List>
            {mine.map((d, i) => (
              <Row
                key={`${d.key ?? 'own'}-${d.name}`}
                title={d.name}
                detail={`${levelLabel(d.level)}${d.since ? ` · since ${d.since}` : ''}`}
                icon="grimoire"
                last={i === mine.length - 1}
                onPress={() => router.push(d.key ? `/rituals/library/traditional:deity:${d.key}` as never : '/more/settings/deities')}
              />
            ))}
          </List>
        ) : (
          <Body muted>None yet, and none is needed. When you’re ready, keep the gods you’re getting to know in My deities.</Body>
        )}
        <View style={ui.actions}>
          <Button label="My deities" variant="outline" onPress={() => router.push('/more/settings/deities')} />
          <Button
            label="Draw the Patron deity spread"
            variant="text"
            onPress={() =>
              mine.length
                ? drawFor(deityLink(mine[0].key, mine[0].name))
                : router.push({ pathname: '/rituals/divination/draw', params: { spread: 'patron-deity' } })
            }
          />
        </View>
      </Card>

      {guide.sections.map((section, i) => (
        <Expander key={section.id} title={section.heading} initiallyOpen={i === 0}>
          {section.body.split(/\n\s*\n/).map((p, j) => (
            <Body key={j}>{p}</Body>
          ))}
          {section.points?.map((point, j) => (
            <Body key={`p${j}`}>{`•  ${point}`}</Body>
          ))}
        </Expander>
      ))}

      <Expander title="What we know, and what we don’t">
        <SectionLabel>Known</SectionLabel>
        <Body>{guide.knowAndDont.known}</Body>
        <SectionLabel>Not known</SectionLabel>
        <Body>{guide.knowAndDont.unknown}</Body>
      </Expander>

      {guide.further.length > 0 && (
        <Expander title="Reading further">
          {guide.further.map((f, i) => (
            <Body key={i} muted>
              {f}
            </Body>
          ))}
        </Expander>
      )}

      <View style={ui.actions}>
        <Button label="Dedication journeys" variant="outline" onPress={() => router.push('/rituals/journeys')} />
      </View>
    </RitualScreen>
  );
}
