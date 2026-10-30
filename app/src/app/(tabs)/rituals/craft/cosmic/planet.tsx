import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { DeityLinkTag } from '../../../../../components/astro/DeityLinkTag';
import { ExplainCard, TermChips, TermText } from '../../../../../components/astro/Explain';
import { Body, Card, Chip, Chips, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { term, termIdFor } from '../../../../../lib/astro/glossary';
import { GUIDE_ORDER, PLANET_GUIDES } from '../../../../../lib/astro/planetGuides';
import { domiciles, EXALTATION, POINT_GLYPH, type Classical } from '../../../../../lib/astro/signs';
import { shortDate, timeOfDay } from '../../../../../lib/calendar';
import { nextHourOnItsDay } from '../../../../../lib/craft/cosmic/hours';
import { JOURNEY_CATALOG } from '../../../../../lib/journeys/catalog';
import { findByName } from '../../../../../lib/library/model';
import { libraryHref } from '../../../../../lib/library';
import { useLibrary } from '../../../../../lib/library/store';
import { usePlace } from '../../../../../lib/location';
import { type } from '../../../../../theme';

// One of the seven planets in depth: nature, rulerships, body, metal,
// colours, herbs, stones, incense, angel, gods across traditions (linked to
// the Living Library and dedication journeys), what magic it suits, its day
// and its next hour.
export default function PlanetGuideScreen() {
  const params = useLocalSearchParams<{ planet?: string }>();
  const planet: Classical = GUIDE_ORDER.includes(params.planet as Classical) ? (params.planet as Classical) : 'Sun';
  const g = PLANET_GUIDES[planet];
  const { entries } = useLibrary();
  const place = usePlace();
  const next = useMemo(() => (place ? nextHourOnItsDay(planet, new Date(), place) : null), [place, planet]);
  const fromLibrary = useMemo(
    () =>
      entries
        .filter((e) => String(e.traditional?.Planet ?? '').includes(planet))
        .map((e) => e.name)
        .slice(0, 24),
    [entries, planet],
  );
  const chip = (name: string) => {
    const e = findByName(entries, name);
    return <Chip key={name} label={name} onPress={e ? () => router.push(libraryHref(e)) : undefined} a11yLabel={e ? `${name} in the Living Library` : name} />;
  };
  const exalt = EXALTATION[planet];

  return (
    <RitualScreen back="Planetary hours">
      <Title eyebrow="The seven planets">{`${POINT_GLYPH[planet]} ${planet}`}</Title>
      <Chips>
        {GUIDE_ORDER.map((p) => (
          <Chip key={p} label={p} selected={p === planet} onPress={() => router.setParams({ planet: p })} />
        ))}
      </Chips>

      <ExplainCard title={`${planet} in astrology`} entry={term(termIdFor(planet))} terms={[termIdFor(planet), 'planetary-days', 'planetary-hours']} />

      <Card accent>
        <SectionLabel>Its nature</SectionLabel>
        <TermText style={type.body} text={g.nature} />
        <TermText style={type.body} text={`Rules ${domiciles(planet).join(' and ')}${exalt ? `; exalted in ${exalt}` : ''}. ${g.rules}`} />
        <Body muted>{`The body: ${g.body}`}</Body>
      </Card>

      <Card>
        <SectionLabel>{`Its day: ${g.day}`}</SectionLabel>
        <Body>{g.dayNames}</Body>
        {next ? (
          <TermText style={type.body} text={`Next hour of ${planet} on ${g.day}: ${shortDate(next.start)}, ${timeOfDay(next.start)} – ${timeOfDay(next.end)}.`} />
        ) : (
          <Body muted>Add your location (The sky today) to see its hours where you are.</Body>
        )}
        <Button label={`Find and plan a ${planet} hour`} variant="outline" onPress={() => router.push({ pathname: '/rituals/craft/cosmic/hours', params: { planet } } as unknown as Href)} />
      </Card>

      <Card>
        <SectionLabel>What it suits</SectionLabel>
        <Body>{g.suits}</Body>
        <Body muted>{`Less suited to: ${g.avoid}`}</Body>
      </Card>

      <Card>
        <SectionLabel>Correspondences</SectionLabel>
        <Body>{`Metal: ${g.metal}`}</Body>
        <Body>{`Colours: ${g.colours.join(', ')}`}</Body>
        <Body>{`Incense: ${g.incense.join(', ')}`}</Body>
        <Body>{`Number and square: ${g.square}`}</Body>
        <Body>{`Angel: ${g.angel.name} (${g.angel.source}). Intelligence: ${g.intelligence} (Agrippa).`}</Body>
        <SectionLabel>Herbs</SectionLabel>
        <Chips>{g.herbs.map(chip)}</Chips>
        <SectionLabel>Stones</SectionLabel>
        <Chips>{g.stones.map(chip)}</Chips>
        {fromLibrary.length > 0 && (
          <>
            <SectionLabel>{`Everything in your Living Library under ${planet}`}</SectionLabel>
            <Chips>{fromLibrary.map(chip)}</Chips>
          </>
        )}
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Gods tied to it</SectionLabel>
        {g.deities.map((d) => {
          const lib = findByName(entries, d.name);
          const journey = JOURNEY_CATALOG.find((j) => j.kind === 'deity' && j.id === `deity-${d.name.toLowerCase().replace(/[^a-z]/g, '')}`);
          return (
            <Card key={d.name}>
              <TermText style={type.cardTitle} text={d.name} />
              <Body muted>{d.tradition}</Body>
              <DeityLinkTag link={d.link} />
              <Body>{d.note}</Body>
              {(lib || journey) && (
                <View style={ui.actions}>
                  {lib && <Button label="In the Living Library" variant="outline" onPress={() => router.push(libraryHref(lib))} />}
                  {journey && <Button label="Dedication journey" variant="text" onPress={() => router.push({ pathname: '/rituals/journeys/[id]', params: { id: journey.id } })} />}
                </View>
              )}
            </Card>
          );
        })}
      </View>

      <Body muted>{`Sources: ${g.sourcing} The gods are not interchangeable: each has their own tradition and is approached through it. An ancient link is attested in antiquity or the tradition’s own sources; a modern link was made in modern practice.`}</Body>
      <TermChips ids={['planetary-days', 'planetary-hours', 'chaldean-order', 'rulership', 'dignity']} />
      <List>
        <Row icon="altar" title={`Set a ${planet} altar`} detail="Its colours, stones and herbs, ready to change" onPress={() => router.push({ pathname: '/altar/[altarId]', params: { altarId: 'natal', planet, from: 'chart' } } as unknown as Href)} />
        <Row icon="rituals" title="Cosmic workings" detail="Premade rituals and spells for the planets" last onPress={() => router.push({ pathname: '/rituals/premade', params: { practice: 'cosmic' } })} />
      </List>
    </RitualScreen>
  );
}
