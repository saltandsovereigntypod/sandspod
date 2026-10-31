// Today's gentle journal prompt (lib/journals/journals.ts todayJournalPrompt):
// a sign to look back on, a day for the dead, a kept deity's holy day, or the
// waning and dark moon for shadow work. Nothing on other days.

import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text } from 'react-native';

import { ancestorDays, upcomingAnniversaries } from '../../lib/craft/hedge/ancestors';
import { deipnonToday } from '../../lib/deipnon';
import { holidayChoice } from '../../lib/holidays';
import { entryTitle, journalPlace, journalRoutes, omensToCheck, todayJournalPrompt } from '../../lib/journals/journals';
import { deityLines } from '../../lib/patron';
import { type } from '../../theme';
import { Button } from '../Button';
import { Body, Card, SectionLabel } from '../rituals/ui';
import { useJournal, usePeople } from './shared';

export function JournalToday({ settings, now }: { settings: Record<string, unknown> | null; now: Date }) {
  const { list: omens } = useJournal('omens');
  const { people } = usePeople();
  const prompt = useMemo(() => {
    const due = omensToCheck(omens, now).map((e) => ({ id: e.id, title: entryTitle('omens', e.data) }));
    const festival = ancestorDays(holidayChoice(settings as never), now, 0).find((d) => d.inDays === 0)?.name ?? null;
    const anniversary = upcomingAnniversaries(people, now, 0)[0];
    const deipnon = deipnonToday(now, settings) ? 'Hekate’s Deipnon' : null;
    const holy = deityLines(settings, now).find((l) => l.holyToday);
    return todayJournalPrompt(now, {
      omensDue: due,
      ancestorDay: festival ?? (anniversary ? `${anniversary.name}’s day` : deipnon),
      deityDay: holy ? { name: holy.line, key: holy.deity.key ?? '' } : null,
    });
  }, [omens, people, settings, now]);
  if (!prompt) return null;
  const routes = journalRoutes(prompt.kind, journalPlace(settings, prompt.kind));
  const href = prompt.kind === 'omens' ? routes.list : routes.write(prompt.params ?? {});
  return (
    <Card>
      <SectionLabel>A journal prompt</SectionLabel>
      <Text style={type.cardTitle}>{prompt.title}</Text>
      <Body>{prompt.line}</Body>
      <Button label={prompt.action} variant="outline" onPress={() => router.push(href as Href)} />
    </Card>
  );
}
