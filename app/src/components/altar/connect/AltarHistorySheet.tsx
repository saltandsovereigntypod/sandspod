// The altar's history: what happened on it (the log lines the altar keeps)
// and how it looked (a snapshot a day when it changed), newest first, with
// "a month ago", "a season ago" and "a year ago" to look back at. Also the
// hook that takes the day's snapshot when the altar changes.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';

import { availableLookBacks, HISTORY, snapshotDue, snapshotObjects, snapshotsToPrune, timeline, type HistoryData, type HistoryEntry, type HistorySnapshot } from '../../../lib/altar/connect/history';
import { composeScene } from '../../../lib/altar/connect/shareCard';
import { addEntry, removeEntry, useCraft } from '../../../lib/craft/store';
import { dateFrom, timeOfDay } from '../../../lib/calendar';
import { type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { AltarCardSvg } from './AltarCard';
import { connectStyles, Eyebrow, Row, type AltarRef } from './common';

/**
 * Keep a snapshot of the altar once a day when it has changed, and let old
 * ones thin out. Call it from the altar screen with the altar as saved
 * (after a save, not on every drag): it writes at most one entry a day.
 */
export function useAltarSnapshots(altar: AltarRef | null, saved: boolean) {
  const { entries, ready } = useCraft<HistoryData>(HISTORY);
  const writing = useRef(false);
  useEffect(() => {
    if (!ready || !saved || !altar?.id || writing.current) return;
    const now = new Date();
    const due = snapshotDue(entries as HistoryEntry[], { id: altar.id, name: altar.name, background: altar.background ?? '', objects: altar.objects }, now);
    if (!due) return;
    writing.current = true;
    // Old snapshots thin out as a new one is kept.
    for (const id of snapshotsToPrune(entries as HistoryEntry[], altar.id, now)) void removeEntry(HISTORY, id);
    void addEntry(HISTORY, due).finally(() => {
      writing.current = false;
    });
  }, [ready, saved, altar, entries]);
}

function Thumb({ snapshot, width }: { snapshot: HistorySnapshot; width: number }) {
  const scene = useMemo(() => composeScene(snapshotObjects(snapshot), snapshot.background, { width: 320, height: 180, zoom: 1.2 }), [snapshot]);
  return <AltarCardSvg card={scene} width={width} label={`The altar on ${dateFrom(new Date(), new Date(snapshot.at))}: ${snapshot.summary}`} />;
}

type Props = { visible: boolean; altar: AltarRef; onClose: () => void };

export function AltarHistorySheet({ visible, altar, onClose }: Props) {
  const { entries } = useCraft<HistoryData>(HISTORY);
  const { width: screen } = useWindowDimensions();
  const [chosen, setChosen] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  // A fresh "now" each time it opens.
  const [now, setNow] = useState(() => new Date());
  const [shownFor, setShownFor] = useState(visible);
  if (shownFor !== visible) {
    setShownFor(visible);
    if (visible) setNow(new Date());
  }
  const items = useMemo(() => (altar.id ? timeline(entries as HistoryEntry[], altar.id) : []), [entries, altar.id]);
  const backs = useMemo(() => (altar.id ? availableLookBacks(entries as HistoryEntry[], altar.id, now) : []), [entries, altar.id, now]);
  const picked = items.find((i) => i.id === chosen && i.kind === 'snapshot');
  const width = Math.min(screen - 40, 480);
  const shown = all ? items : items.slice(0, 30);

  return (
    <Sheet visible={visible} eyebrow={altar.name || 'This altar'} title="Its history" onClose={onClose}>
      {!altar.id ? (
        <Text style={connectStyles.body}>Save this altar first; its history is kept with it.</Text>
      ) : items.length === 0 ? (
        <Text style={connectStyles.body}>Nothing yet. From today, a picture of the altar is kept each day it changes, with what happens on it.</Text>
      ) : (
        <>
          {backs.length > 0 && (
            <View style={connectStyles.gap}>
              <Eyebrow>Look back</Eyebrow>
              <ChipRow>
                {backs.map((b) => (
                  <Chip key={b.id} label={b.label} active={chosen === b.entry.id} onPress={() => setChosen(chosen === b.entry.id ? null : b.entry.id)} />
                ))}
              </ChipRow>
            </View>
          )}
          {picked && picked.kind === 'snapshot' && (
            <View style={[connectStyles.gap, connectStyles.center]}>
              <Thumb snapshot={picked.snapshot} width={width} />
              <Text style={type.caption}>{`${dateFrom(now, new Date(picked.at))} · ${picked.snapshot.summary}`}</Text>
            </View>
          )}
          <View style={connectStyles.gap}>
            <Eyebrow>Timeline</Eyebrow>
            {shown.map((item) =>
              item.kind === 'snapshot' ? (
                <Row
                  key={item.id}
                  title={`How it looked · ${dateFrom(now, new Date(item.at))}`}
                  detail={item.text}
                  selected={chosen === item.id}
                  accessibilityLabel={`How the altar looked on ${dateFrom(now, new Date(item.at))}, ${item.text}. Show the picture`}
                  onPress={() => setChosen(chosen === item.id ? null : item.id)}
                />
              ) : (
                <View key={item.id} style={{ gap: 2 }} accessible>
                  <Text style={connectStyles.body}>{item.text}</Text>
                  <Text style={type.caption}>{`${dateFrom(now, new Date(item.at))}, ${timeOfDay(new Date(item.at))}`}</Text>
                </View>
              ),
            )}
            {items.length > 30 && <Chip label={all ? 'Show less' : `Show all ${items.length}`} onPress={() => setAll((v) => !v)} />}
          </View>
        </>
      )}
    </Sheet>
  );
}
