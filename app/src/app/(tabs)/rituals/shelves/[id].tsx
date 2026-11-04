import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Card, Chip, Chips, confirmAction, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { ShelfThingPicture } from '../../../../components/shelves/ShelfCabinet';
import { useAltars } from '../../../../lib/altar/store';
import { storyLines } from '../../../../lib/altar/story';
import type { SavedObject } from '../../../../lib/altar/types';
import { fullDate } from '../../../../lib/calendar';
import { bestBy, isLow, LEVELS, markLow, pastBest, placedObjects, qtyLabel, restock, shelfLabel, shelfStory, SOURCES, tendPlanFor } from '../../../../lib/shelves/model';
import { useShelfActions, useShelves } from '../../../../lib/shelves/store';
import { dueOf, ownTendables, rhythmLabel } from '../../../../lib/tend/model';
import { type } from '../../../../theme';

// One thing on My Shelves: how much is left, where it's kept, its tending,
// placing it on the altar, and its whole story.
export default function ShelfThing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, ready } = useShelves();
  const actions = useShelfActions();
  const altars = useAltars();
  const [notice, setNotice] = useState<string | null>(null);
  const entry = entries.find((e) => e.id === id);
  const now = useMemo(() => new Date(), []);
  const record = actions.recordOf(String(id));
  const placed = useMemo(() => placedObjects(altars.altars as { id: string; name?: string; objects?: SavedObject[] }[], String(id)), [altars.altars, id]);

  if (!entry) {
    return (
      <RitualScreen back="Back">
        <Body muted>{ready ? 'This isn’t on your shelves any more.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const { item } = entry;
  const save = (next: typeof item) => void actions.save(entry.id, next);
  const tendable = record ? ownTendables([record])[0] : null;
  const due = tendable && record ? dueOf(tendable, record, now) : null;
  const best = bestBy(item);
  const story = shelfStory(
    item,
    record,
    placed.flatMap((p) => storyLines(p.object).map((l) => ({ at: l.at, text: `On ${p.altarName}: ${l.text}` }))),
  );
  const latest = [...altars.altars].sort((a, b) => String(b.updatedAt ?? b.savedAt ?? '').localeCompare(String(a.updatedAt ?? a.savedAt ?? '')))[0];
  const libraryId = item.ref.startsWith('traditional/') ? `traditional:${item.ref.split('/')[1]}:${item.ref.split('/').slice(2).join('/')}` : '';
  const source = SOURCES.find((s) => s.value === item.source)?.label ?? '';

  return (
    <RitualScreen back="My Shelves">
      <Title eyebrow={shelfLabel(item.shelf)}>{item.name}</Title>
      <View style={styles.head}>
        <ShelfThingPicture item={item} width={96} height={96} />
        <View style={{ flex: 1, gap: 4 }}>
          <Body>{`How much: ${qtyLabel(item.qty)}${isLow(item) ? ' · running low' : ''}`}</Body>
          {!!item.where && <Body muted>{`Kept: ${item.where}`}</Body>}
          <Body muted>{[source, item.sourceText].filter(Boolean).join(': ')}</Body>
          {!!item.acquired && <Body muted>{`Got it ${fullDate(item.acquired) ?? item.acquired}`}</Body>}
        </View>
      </View>
      {!!notice && <Notice>{notice}</Notice>}
      {!!item.intention && <Body>{`Intention: ${item.intention}`}</Body>}
      {!!item.notes && <Body>{item.notes}</Body>}

      <Card>
        <Text style={type.cardTitle}>How much is left</Text>
        {item.qty.kind === 'count' ? (
          <Chips>
            <Chip label="One fewer" onPress={() => item.qty.kind === 'count' && save({ ...item, qty: { kind: 'count', n: Math.max(0, item.qty.n - 1) } })} />
            <Chip label="One more" onPress={() => item.qty.kind === 'count' && save({ ...item, qty: { kind: 'count', n: item.qty.n + 1 } })} />
          </Chips>
        ) : (
          <Chips>
            {LEVELS.map((l) => (
              <Chip key={l.value} label={l.label} selected={item.qty.kind === 'level' && item.qty.level === l.value} onPress={() => save({ ...item, qty: { kind: 'level', level: l.value }, low: l.value === 'low' ? true : item.low })} />
            ))}
          </Chips>
        )}
        {isLow(item) ? (
          <Button label="Restocked" variant="outline" onPress={() => save(restock(item, new Date()))} accessibilityHint="Takes it off the shopping list and brings the quantity back up" />
        ) : (
          <Button label="Running low: add to my shopping list" variant="outline" onPress={() => save(markLow(item))} />
        )}
      </Card>

      <Card>
        <Text style={type.cardTitle}>Tending</Text>
        {record && due ? (
          <>
            <Body>{`${rhythmLabel(record.rhythm ?? { kind: 'weekly' })}. ${due.line}`}</Body>
            {!!tendPlanFor(item.shelf, item.name) && <Body muted>{tendPlanFor(item.shelf, item.name)!.line}.</Body>}
            <Button
              label={item.shelf === 'herbs' || (item.shelf === 'oils' && !!best) ? 'Checked or replaced today' : 'Tended today'}
              variant="outline"
              onPress={() => {
                void actions.tended(entry.id);
                setNotice('Kept in its story and in To tend.');
              }}
            />
          </>
        ) : (
          <Body muted>{item.shelf === 'decks' ? 'Decks are cleansed when they need it, after heavy use. Turn tending on from Change if you’d like a rhythm.' : 'Not tended in To tend. Turn it on from Change.'}</Body>
        )}
        {!!best && <Body muted>{pastBest(item, now) ? `Past its best-by day (${fullDate(best) ?? best}). Many keep it longer if it still smells and looks right.` : `Best by about ${fullDate(best) ?? best}.`}</Body>}
      </Card>

      <View style={ui.actions}>
        <Button
          label="Place on my altar"
          onPress={() => router.push({ pathname: '/altar/[altarId]', params: { altarId: latest?.id ?? 'new', shelf: entry.id } })}
          accessibilityHint={latest ? `Opens ${latest.name || 'your altar'} with it set down` : 'Opens a new altar with it set down'}
        />
        <Button label="Change" variant="outline" onPress={() => router.push({ pathname: '/rituals/shelves/add', params: { id: entry.id } })} />
      </View>

      <List>
        {!!libraryId && <Row icon="grimoire" title="In the Living Library" detail="What it’s known for" onPress={() => router.push({ pathname: '/grimoire/library/[entryId]', params: { entryId: libraryId } })} />}
        <Row icon="rituals" title="Spell builder" detail="Build a working; what you have is shown as you go" onPress={() => router.push('/rituals/spell')} />
        <Row icon="today" title="To tend" detail="Everything you tend, this among it" last onPress={() => router.push('/today/tend')} />
      </List>

      <View style={ui.gapSmall}>
        <SectionLabel>Its story</SectionLabel>
        {story.length === 0 ? (
          <Body muted>Its story begins here: tending, restocking, placing it on your altar and using it in a working are all kept.</Body>
        ) : (
          <Card>
            {story.slice(0, 40).map((line, i) => (
              <Body key={`${line.at}-${i}`}>{`${fullDate(line.at.slice(0, 10)) ?? ''} · ${line.text}`}</Body>
            ))}
          </Card>
        )}
      </View>

      <Button
        label="Take it off my shelves"
        variant="outline"
        onPress={async () => {
          if (!(await confirmAction('Take it off your shelves?', `${item.name} and its tending in To tend will be removed. Anything on your altar stays.`, 'Remove'))) return;
          await actions.remove(entry.id);
          router.back();
        }}
      />
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
});
