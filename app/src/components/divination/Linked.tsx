// Readings drawn for something (lib/divination/linked.ts): the readings of a
// dream on its page, a reading drawn before a working on its plan and beside
// its "Did it work?", and a deity's on its journey. Each offers to draw one.

import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../Button';
import { Body, Card, Chip, Chips, List, Row, SectionLabel, tell, ui } from '../rituals/ui';
import { shortDate } from '../../lib/calendar';
import { MATCHES, normalizeReading, READINGS, type Reading, type ReadingLink, type ReadingMatch } from '../../lib/craft/hedge/readings';
import { updateEntry, useCraft } from '../../lib/craft/store';
import { cardsLine, drawParams, linkedReadings, preReadingOf } from '../../lib/divination/linked';
import { dateFromKey } from '../../lib/rituals/lifecycle';
import type { JournalRow } from '../../lib/rituals/types';

const dayOf = (key: string) => {
  const d = dateFromKey(key);
  return d ? shortDate(d) : key;
};

function useReadings() {
  const { entries } = useCraft<unknown>(READINGS);
  return useMemo(() => entries.map((e) => ({ ...e, data: normalizeReading(e.data) })), [entries]);
}

/** Open the draw screen to draw for this. */
export const drawFor = (link: ReadingLink) => router.push({ pathname: '/rituals/divination/draw', params: drawParams(link) });

/** The readings drawn for one dream, plan or deity, and a button to draw another. */
export function LinkedReadings({ link, label, drawLabel, empty }: { link: ReadingLink; label: string; drawLabel: string; empty?: string }) {
  const readings = useReadings();
  const mine = linkedReadings(readings, link.kind, link.id);
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>{label}</SectionLabel>
      {mine.length ? (
        <List>
          {mine.map((e, i) => (
            <Row
              key={e.id}
              icon="wheel"
              title={e.data.question || cardsLine(e.data).split('\n')[0] || 'A reading'}
              detail={`${dayOf(e.data.date)} · ${e.data.drawn.join(', ')}`}
              last={i === mine.length - 1}
              onPress={() => router.push(`/rituals/divination/${e.id}` as Href)}
            />
          ))}
        </List>
      ) : empty ? (
        <Body muted>{empty}</Body>
      ) : null}
      <Button label={drawLabel} variant="outline" onPress={() => drawFor(link)} />
    </View>
  );
}

/** Whether the reading bore out, kept on the reading itself. */
function MatchChips({ id, reading }: { id: string; reading: Reading }) {
  const [saving, setSaving] = useState(false);
  const choose = async (matched: ReadingMatch) => {
    if (saving) return;
    setSaving(true);
    try {
      const next: Reading = { ...reading };
      if (reading.matched === matched) delete next.matched;
      else next.matched = matched;
      await updateEntry(READINGS, id, next);
    } catch (e) {
      tell('Couldn’t save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <Chips>
      {MATCHES.map((m) => (
        <Chip key={m.id} label={m.label} selected={reading.matched === m.id} onPress={() => void choose(m.id)} />
      ))}
    </Chips>
  );
}

/**
 * The reading drawn before a working, beside its "Did it work?": the cards
 * that came up, and whether the reading bore out.
 */
export function PreReading({ entry, answered }: { entry: Pick<JournalRow, 'metadata'>; answered: boolean }) {
  const readings = useReadings();
  const pre = preReadingOf(readings, entry);
  if (!pre) return null;
  return (
    <Card>
      <SectionLabel>Drawn before you began</SectionLabel>
      <Body muted>{`Before a working · ${dayOf(pre.data.date)}`}</Body>
      <Body>{cardsLine(pre.data)}</Body>
      {!!pre.data.interpretation && <Body muted>{pre.data.interpretation}</Body>}
      {answered ? (
        <>
          <Body>Now that you know how it went, did the reading bear out?</Body>
          <MatchChips id={pre.id} reading={pre.data} />
        </>
      ) : (
        <Body muted>When you say whether it worked, you can say whether the reading bore out too.</Body>
      )}
      <Button label="Open the reading" variant="text" onPress={() => router.push(`/rituals/divination/${pre.id}` as Href)} />
    </Card>
  );
}
