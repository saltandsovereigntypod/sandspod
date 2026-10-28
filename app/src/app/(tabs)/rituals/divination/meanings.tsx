import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { Button } from '../../../../components/Button';
import { DivinationMeanings } from '../../../../components/divination/Meanings';
import { Body, Field, RitualScreen, Title } from '../../../../components/rituals/ui';
import { chosenDeck } from '../../../../lib/divination/decks';
import { divinationGroups } from '../../../../lib/divination/library';
import { useMySettings } from '../../../../lib/settings/store';

// Card meanings, from Rituals → Divination: the same tarot, rune, ogham and
// oracle pages your Grimoire keeps under Traditional Information, opened here
// so Back comes back to Divination.
export default function CardMeanings() {
  const { settings } = useMySettings();
  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const groups = useMemo(() => divinationGroups(query), [query]);
  const searching = query.trim().length > 0;
  const toggle = (key: string) =>
    setOpened((set) => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <RitualScreen back="Divination">
      <Title eyebrow="Divination">Card meanings</Title>
      <Body muted>Every card, rune and stave, with its three words and its page. Your Grimoire keeps them too, under Traditional Information.</Body>
      <Field label="Search card meanings" value={query} onChange={setQuery} placeholder="The Star, Fehu, a word like change" />
      {searching && !groups.length ? (
        <Body muted>No card, rune or stave matches that.</Body>
      ) : (
        <DivinationMeanings groups={groups} searching={searching} opened={opened} onToggle={toggle} deck={chosenDeck(settings)} inRituals titled={false} />
      )}
      <Button label="Open your Grimoire" variant="text" onPress={() => router.navigate('/grimoire')} />
    </RitualScreen>
  );
}
