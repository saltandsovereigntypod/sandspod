import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { relativeDay } from '../../../../../lib/calendar';
import { ANCESTORS, ancestorDays, anniversaryWords, normalizeAncestor, upcomingAnniversaries } from '../../../../../lib/craft/hedge/ancestors';
import { DREAMS, dreamMoon, normalizeDream } from '../../../../../lib/craft/hedge/dreams';
import { comeBackTo, normalizeReading, READINGS } from '../../../../../lib/craft/hedge/readings';
import { CRAFT_TOOLS } from '../../../../../lib/craft/practices';
import { useCraft } from '../../../../../lib/craft/store';
import { holidayChoice } from '../../../../../lib/holidays';
import { PRACTICES } from '../../../../../lib/rituals/premade';
import { localDateKey } from '../../../../../lib/rituals/lifecycle';
import { useMySettings } from '../../../../../lib/settings/store';
import { type } from '../../../../../theme';

const ROUTES = ['/rituals/craft/hedge/dreams', '/rituals/craft/hedge/readings', '/rituals/craft/hedge/ancestors'];

// Hedge practice: the dream journal, a log of readings, and the beloved dead.
export default function HedgePractice() {
  const about = PRACTICES.find((p) => p.id === 'hedge')?.about;
  const tools = CRAFT_TOOLS.hedge;
  const { settings } = useMySettings();
  const now = useMemo(() => new Date(), []);
  const tonight = useMemo(() => dreamMoon(localDateKey(new Date(now.getTime() + 86_400_000))), [now]);

  const dreams = useCraft<unknown>(DREAMS).entries;
  const readings = useCraft<unknown>(READINGS).entries;
  const people = useCraft<unknown>(ANCESTORS).entries;

  const due = useMemo(() => comeBackTo(readings.map((e) => ({ ...e, data: normalizeReading(e.data) })), now), [readings, now]);
  const anniversaries = useMemo(
    () => upcomingAnniversaries(people.map((e) => ({ ...e, data: normalizeAncestor(e.data) })), now, 30),
    [people, now],
  );
  const days = useMemo(() => ancestorDays(holidayChoice(settings), now, 30), [settings, now]);
  const lastDream = dreams.length ? normalizeDream(dreams[0].data) : null;

  const details = [
    dreams.length ? `${dreams.length} ${dreams.length === 1 ? 'dream' : 'dreams'}${lastDream?.title ? ` · last: ${lastDream.title}` : ''}` : null,
    due.length ? `${due.length} to come back to` : readings.length ? `${readings.length} ${readings.length === 1 ? 'reading' : 'readings'}` : null,
    people.length ? `${people.length} remembered` : null,
  ];

  const coming = [
    ...anniversaries.map((a) => ({ key: `${a.id}-${a.kind}`, title: a.name, detail: `${anniversaryWords(a)} · ${relativeDay(now, a.date)}`, id: a.id, inDays: a.inDays })),
    ...days.map((d) => ({ key: `day-${d.name}`, title: d.name, detail: `An ancestor day · ${relativeDay(now, d.date)}`, id: null, inDays: d.inDays })),
  ].sort((a, b) => a.inDays - b.inDays);

  return (
    <RitualScreen back="My practice">
      <Title eyebrow="My practice">Hedge</Title>
      {!!about && <Body muted>{about}</Body>}

      <Card accent>
        <SectionLabel>Tonight’s dreaming moon</SectionLabel>
        <Text style={type.cardTitle}>{`${tonight.moonPhase} in ${tonight.moonSign}`}</Text>
        <Body muted>Keep a notebook by the bed. Write as soon as you wake, before you move or check your phone; dreams fade within minutes.</Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Tools</SectionLabel>
        <List>
          {tools.map((tool, i) => (
            <Row
              key={tool.title}
              icon={i === 0 ? 'grimoire' : i === 1 ? 'wheel' : 'samhain'}
              title={tool.title}
              detail={details[i] ?? tool.detail}
              last={i === tools.length - 1}
              onPress={() => router.push(ROUTES[i] as Href)}
            />
          ))}
        </List>
      </View>

      {due.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Come back to</SectionLabel>
          <List>
            {due.slice(0, 3).map((e, i, all) => (
              <Row
                key={e.id}
                icon="wheel"
                title={e.data.question || 'A reading'}
                detail="Its look-back day has come: what happened?"
                last={i === all.length - 1}
                onPress={() => router.push(`/rituals/craft/hedge/readings/${e.id}` as Href)}
              />
            ))}
          </List>
        </View>
      )}

      {coming.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Coming up for the dead</SectionLabel>
          <List>
            {coming.slice(0, 5).map((c, i, all) => (
              <Row
                key={c.key}
                icon="samhain"
                title={c.title}
                detail={c.detail}
                last={i === all.length - 1}
                onPress={() => router.push((c.id ? `/rituals/craft/hedge/ancestors/${c.id}` : '/rituals/craft/hedge/ancestors') as Href)}
              />
            ))}
          </List>
        </View>
      )}

      <List>
        <Row icon="rituals" title="Hedge workings" detail="Premade rituals and spells; filter by Hedge" last onPress={() => router.push('/rituals/premade' as Href)} />
      </List>
    </RitualScreen>
  );
}
