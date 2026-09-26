import { router } from 'expo-router';
import { useMemo } from 'react';

import { Button } from '../../../../components/Button';
import { Body, Card, List, Notice, RitualScreen, Row, Title } from '../../../../components/rituals/ui';
import { journalDetail } from '../../../../lib/rituals/format';
import { sortJournal } from '../../../../lib/rituals/plans';
import { refresh, useRituals } from '../../../../lib/rituals/store';

export default function Journal() {
  const rituals = useRituals();
  const entries = useMemo(() => sortJournal(rituals.journal), [rituals.journal]);

  return (
    <RitualScreen back="Rituals" onRefresh={refresh}>
      <Title eyebrow={`${entries.length} ${entries.length === 1 ? 'ritual' : 'rituals'}`}>Journal</Title>
      {rituals.status === 'offline' && <Notice>Offline · showing the copy saved on this phone</Notice>}
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
      <Button label="Record a ritual" variant="outline" onPress={() => router.push('/rituals/journal/new')} />
    </RitualScreen>
  );
}
