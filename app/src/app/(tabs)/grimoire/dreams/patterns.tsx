import type { Href } from 'expo-router';
import { useMemo } from 'react';

import { DreamShell } from '../../../../components/grimoire/dreams';
import { Body, Card, SectionLabel, Title } from '../../../../components/rituals/ui';
import { DREAMS, normalizeDream } from '../../../../lib/craft/hedge/dreams';
import { useCraft } from '../../../../lib/craft/store';
import { cameTrueRate, dreamPatterns } from '../../../../lib/dreams/reader';
import { useDictionary } from '../../../../lib/dreams/store';
import { DREAM_ROUTES } from '../../../../lib/grimoire/dreams';

// What keeps returning, read from the words of your dreams.
export default function DreamPatterns() {
  const { entries } = useCraft<unknown>(DREAMS);
  const { entries: dictionary } = useDictionary();
  const dreams = useMemo(() => entries.map((e) => ({ id: e.id, data: normalizeDream(e.data) })), [entries]);
  const patterns = useMemo(
    () => dreamPatterns(dreams.map((d) => ({ id: d.id, date: d.data.date, text: `${d.data.title}. ${d.data.dream}`, moonPhase: d.data.moonPhase })), new Date(), dictionary),
    [dreams, dictionary],
  );
  const rate = cameTrueRate(dreams.map((d) => d.data));

  return (
    <DreamShell back={DREAM_ROUTES.journal as Href}>
      <Title eyebrow="Your dreams">Patterns</Title>
      {dreams.length < 2 ? (
        <Body muted>Patterns appear once you have written a few dreams.</Body>
      ) : (
        <>
          {patterns.lines.length > 0 ? (
            <Card>
              {patterns.lines.map((l) => (
                <Body key={l}>{l}</Body>
              ))}
            </Card>
          ) : (
            <Body muted>Nothing has come up more than once this month yet.</Body>
          )}
          {patterns.symbols.length > 0 && (
            <Card>
              <SectionLabel>This month</SectionLabel>
              {patterns.symbols.slice(0, 10).map((s) => (
                <Body key={s.key}>{`${s.name} · ${s.count}`}</Body>
              ))}
            </Card>
          )}
          {patterns.pairings.length > 0 && (
            <Card>
              <SectionLabel>Often together</SectionLabel>
              {patterns.pairings.map((p) => (
                <Body key={`${p.a}|${p.b}`}>{`${p.a} and ${p.b} · ${p.count} dreams`}</Body>
              ))}
            </Card>
          )}
          <Card>
            <SectionLabel>Came true</SectionLabel>
            <Body>{rate.line}</Body>
          </Card>
        </>
      )}
    </DreamShell>
  );
}
