import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Card } from '../../../../../../components/more/ui';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { eventLine, type LineageEvent } from '../../../../../../lib/covens/lineage';
import { fetchLineageLog } from '../../../../../../lib/covens/lineageApi';
import { relativeTime } from '../../../../../../lib/covens/model';
import { colors, type } from '../../../../../../theme';

// The lineage log: founding, requests, copies, pushes, releases, and every
// change the head of a mother coven made here. For the coven's leaders.
export default function LineageLog() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const loadNames = coven.loadNames;
  const [events, setEvents] = useState<LineageEvent[] | null>(null);

  const [version, setVersion] = useState(0);
  const load = useCallback(async () => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!covenId) return;
    let live = true;
    void fetchLineageLog(covenId).then(async (list) => {
      await loadNames(list.flatMap((e) => [e.actor, typeof e.detail?.head === 'string' ? e.detail.head : null, typeof e.detail?.to === 'string' ? e.detail.to : null]));
      if (live) setEvents(list);
    });
    return () => {
      live = false;
    };
  }, [covenId, loadNames, version]);

  return (
    <CovenScreen title="Lineage log" need="manage" onRefresh={load}>
      <Text style={type.caption}>Everything about this coven’s mother and daughters, newest first. When the head of a mother coven changes something here, it shows here, and the coven’s head is told.</Text>
      {!events && <ActivityIndicator color={colors.gold} />}
      {events && !events.length && <Text style={type.caption}>Nothing yet.</Text>}
      {(events ?? []).map((e) => (
        <Card key={e.id} tone={e.event === 'override' || e.event === 'pushed' || e.event === 'head_appointed' ? 'gold' : undefined}>
          <Text style={type.body}>{eventLine(e, coven.nameOf)}</Text>
          {!!e.note && <Text style={type.caption}>“{e.note}”</Text>}
          <Text style={type.caption}>{relativeTime(e.created_at)}</Text>
        </Card>
      ))}
    </CovenScreen>
  );
}
