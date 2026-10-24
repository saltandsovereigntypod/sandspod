import { router } from 'expo-router';
import { useMemo } from 'react';

import { Button } from '../../../../components/Button';
import { Body, Card, List, Notice, RitualScreen, Row, SectionLabel, Title } from '../../../../components/rituals/ui';
import { dueItems, itemLookBack } from '../../../../lib/altar/apothecaryLookBack';
import { useWorkshop } from '../../../../lib/altar/workshop';
import { fullDate } from '../../../../lib/calendar';
import { journalDetail } from '../../../../lib/rituals/format';
import { dueLookBacks, readLookBack } from '../../../../lib/rituals/lookBack';
import { sortJournal } from '../../../../lib/rituals/plans';
import { refresh, useRituals } from '../../../../lib/rituals/store';

export default function Journal() {
  const rituals = useRituals();
  const entries = useMemo(() => sortJournal(rituals.journal), [rituals.journal]);
  const due = useMemo(() => dueLookBacks(rituals.journal, new Date()), [rituals.journal]);
  const { apothecary } = useWorkshop();
  const dueMade = useMemo(() => dueItems(apothecary, new Date()), [apothecary]);
  const withLookBack = apothecary.filter((i) => !!itemLookBack(i)).length;

  return (
    <RitualScreen back="Rituals" onRefresh={refresh}>
      <Title eyebrow={`${entries.length} ${entries.length === 1 ? 'ritual' : 'rituals'}`}>Journal</Title>
      {rituals.status === 'offline' && <Notice>Offline · showing the copy saved on this phone</Notice>}
      {due.length + dueMade.length > 0 && (
        <>
          <SectionLabel>Did it work?</SectionLabel>
          <List>
            {due.map((entry, i) => (
              <Row
                key={entry.id}
                icon="grimoire"
                title={entry.title || 'Untitled Ritual'}
                detail={`Look back since ${fullDate(readLookBack(entry)?.date) ?? ''}`}
                last={i === due.length - 1 && !dueMade.length}
                onPress={() => router.push({ pathname: '/rituals/journal/[id]', params: { id: entry.id } })}
              />
            ))}
            {dueMade.map((item, i) => (
              <Row
                key={item.id}
                icon="altar"
                title={item.name}
                detail={`${item.typeLabel} · look back since ${fullDate(itemLookBack(item)?.date) ?? ''}`}
                last={i === dueMade.length - 1}
                onPress={() => router.push({ pathname: '/rituals/apothecary/[id]', params: { id: item.id } })}
              />
            ))}
          </List>
        </>
      )}
      {entries.length === 0 ? (
        <Card>
          <Body>No rituals recorded yet. Finish one here, or at the website's altar, and it will be kept here.</Body>
        </Card>
      ) : (
        <List>
          {entries.map((entry, i) => (
            <Row
              key={entry.id}
              icon="grimoire"
              title={entry.title || 'Untitled Ritual'}
              detail={journalDetail(entry)}
              last={i === entries.length - 1}
              onPress={() => router.push({ pathname: '/rituals/journal/[id]', params: { id: entry.id } })}
            />
          ))}
        </List>
      )}
      {apothecary.length > 0 && (
        <List>
          <Row
            icon="altar"
            title="Spell jars & sachets"
            detail={withLookBack ? `Did they work? ${withLookBack} with a look-back day` : 'Did they work? Choose a day to look back'}
            last
            onPress={() => router.push('/rituals/apothecary')}
          />
        </List>
      )}
      {entries.length > 0 && <Button label="Your moon: patterns in your practice" onPress={() => router.push('/rituals/journal/insights')} />}
      <Button label="Record a ritual" variant="outline" onPress={() => router.push('/rituals/journal/new')} />
    </RitualScreen>
  );
}
