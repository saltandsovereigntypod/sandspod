import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, Expander, Field, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import {
  careBadges,
  careByKey,
  CLEANSE_METHODS,
  ELIXIR_NOTE,
  HANDLING_LABEL,
  LEVEL_LABEL,
  STONE_CARE,
  SUN_LABEL,
  type StoneCare,
} from '../../../../../lib/craft/crystal/care';
import { ritualsLibraryHref } from '../../../../../lib/library';

type Filter = 'all' | 'water' | 'sun' | 'salt' | 'handling';

const FILTERS: { key: Filter; label: string; test: (c: StoneCare) => boolean }[] = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'water', label: 'Not for water', test: (c) => c.water !== 'yes' },
  { key: 'sun', label: 'Keep from sun', test: (c) => c.sun !== 'ok' },
  { key: 'salt', label: 'Not for salt', test: (c) => c.salt !== 'yes' },
  { key: 'handling', label: 'Handle with care', test: (c) => c.handling !== 'none' },
];

const tidy = (s: string) => s.toLowerCase().replace(/[’'`]/g, '').trim();

// Stone care: hardness and what each stone can take, for the Library's crystals and other common stones.
export default function StoneCareScreen() {
  const { key } = useLocalSearchParams<{ key?: string }>();
  const opened = careByKey(key);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const list = useMemo(() => {
    const q = tidy(query);
    const test = FILTERS.find((f) => f.key === filter)!.test;
    return STONE_CARE.filter((c) => test(c) && (!q || [c.name, c.mineral, ...(c.aliases ?? [])].some((n) => tidy(n).includes(q))));
  }, [query, filter]);

  return (
    <RitualScreen back={opened ? 'Stone' : 'Crystal'}>
      <Title eyebrow="Crystal">Stone care</Title>
      <Body muted>
        What each stone can take. When in doubt, choose the gentle ways: smoke, sound, moonlight and your own breath are safe for every stone.
      </Body>

      {opened && <StoneCard care={opened} initiallyOpen />}

      <Card>
        <SectionLabel>Reading the badges</SectionLabel>
        <Body muted>
          {`Mohs is hardness, from talc (1) to diamond (10); anything under about 5 scratches easily, and a fingernail (about 2.5) marks the softest. Water: “${LEVEL_LABEL.brief.toLowerCase()}” means a quick rinse and a thorough dry, never a soak. Salt means a bowl of dry salt or salt water; it’s abrasive and draws moisture. “${HANDLING_LABEL.toxic}” stones contain lead, mercury, arsenic, copper or similar: polished pieces are fine to look at and hold briefly, but wash your hands, never cut or sand them, and keep them from children and pets.`}
        </Body>
        <Notice>{ELIXIR_NOTE}</Notice>
      </Card>

      <View style={ui.gap}>
        <Field label="Find a stone" value={query} onChange={setQuery} placeholder="e.g. selenite, quartz, copper" />
        <Chips>
          {FILTERS.map((f) => (
            <Chip key={f.key} label={f.label} selected={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </Chips>
        <SectionLabel>{`${list.length} ${list.length === 1 ? 'stone' : 'stones'}`}</SectionLabel>
        {list.length === 0 && <Body muted>No stones match. Try another name, or the gentle methods above.</Body>}
        {list.map((c) => (
          <StoneCard key={c.key} care={c} />
        ))}
      </View>

      <Body muted>
        Gathered from mineral references and gem care guidance, taking the cautious side where sources differ. Dyed, stabilised and treated stones can
        be more delicate than the natural mineral.
      </Body>
    </RitualScreen>
  );
}

function StoneCard({ care, initiallyOpen }: { care: StoneCare; initiallyOpen?: boolean }) {
  return (
    <Expander title={`${care.name}${care.handling === 'toxic' ? ' · toxic' : ''}`} initiallyOpen={initiallyOpen}>
      <Body muted>{`${care.mineral} · Mohs ${care.mohs}`}</Body>
      <Chips>
        {careBadges(care)
          .slice(1)
          .map((b) => (
            <Chip key={b} label={b} />
          ))}
      </Chips>
      <Body>{care.note}</Body>
      <Body muted>
        {[
          `Water: ${LEVEL_LABEL[care.water].toLowerCase()}`,
          `salt: ${LEVEL_LABEL[care.salt].toLowerCase()}`,
          SUN_LABEL[care.sun].toLowerCase(),
        ].join(' · ')}
      </Body>
      <View style={ui.gapSmall}>
        <SectionLabel>Cleanse with</SectionLabel>
        {care.cleanse.map((m) => {
          const method = CLEANSE_METHODS.find((x) => x.key === m)!;
          return <Body key={m} muted>{`${method.label}: ${method.detail}`}</Body>;
        })}
      </View>
      {care.library && (
        <Button
          label={`${care.name} in the Library`}
          variant="outline"
          onPress={() => router.push(ritualsLibraryHref({ id: `traditional:crystal:${care.key}` }))}
        />
      )}
    </Expander>
  );
}
