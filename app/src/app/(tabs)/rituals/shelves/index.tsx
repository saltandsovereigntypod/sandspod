import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Card, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { ShelfCabinet } from '../../../../components/shelves/ShelfCabinet';
import { byShelf, isLow, qtyLabel, restock, shelfLabel, shoppingList, sortShelf, SORTS, tendKeyOf, type ShelfSort } from '../../../../lib/shelves/model';
import { useShelfActions, useShelves } from '../../../../lib/shelves/store';
import { dueOf, ownTendables } from '../../../../lib/tend/model';
import { colors, type } from '../../../../theme';

const open = (id: string) => router.push({ pathname: '/rituals/shelves/[id]', params: { id } });

// My Shelves: the real things you keep, on painted shelves or as a list,
// with what's running low as a shopping list.
export default function MyShelves() {
  const { entries, ready } = useShelves();
  const actions = useShelfActions();
  const [view, setView] = useState<'shelves' | 'list'>('shelves');
  const [sort, setSort] = useState<ShelfSort>('shelf');
  const [query, setQuery] = useState('');
  const now = useMemo(() => new Date(), []);

  // When each is next due in To tend (its own record, linked by its id).
  const due = useMemo(() => {
    const map = new Map<string, number | null>();
    const items = ownTendables(actions.records);
    for (const e of entries) {
      const record = actions.records.find((r) => r.key === tendKeyOf(e.id));
      const item = record && items.find((i) => i.key === record.key);
      map.set(e.id, item ? dueOf(item, record, now).at : null);
    }
    return map;
  }, [entries, actions.records, now]);

  const shelves = useMemo(() => byShelf(entries), [entries]);
  const listed = useMemo(() => sortShelf(entries, sort, query, (id) => due.get(id) ?? null), [entries, sort, query, due]);
  const shopping = useMemo(() => shoppingList(entries), [entries]);

  return (
    <RitualScreen back="Back">
      <Title eyebrow="What you keep">My Shelves</Title>
      <Body muted>Your crystals, herbs, oils, candles, tools, decks, books and statues: what you have, where it’s kept, how it’s tended and what’s running low.</Body>

      <Chips>
        <Chip label="Shelves" selected={view === 'shelves'} onPress={() => setView('shelves')} />
        <Chip label="List" selected={view === 'list'} onPress={() => setView('list')} />
      </Chips>

      {!ready ? (
        <Body muted>Opening…</Body>
      ) : entries.length === 0 ? (
        <Card>
          <Body>Nothing on your shelves yet. Add what you own from the altar cabinet or the Living Library with “I own this”, or add your own with a photo.</Body>
        </Card>
      ) : view === 'shelves' ? (
        <ShelfCabinet shelves={shelves} onOpen={open} />
      ) : (
        <View style={ui.gap}>
          <Field label="Search" value={query} onChange={setQuery} placeholder="Name, shelf, where it’s kept…" />
          <Chips>
            {SORTS.map((s) => (
              <Chip key={s.value} label={s.label} selected={sort === s.value} onPress={() => setSort(s.value)} />
            ))}
          </Chips>
          {listed.length === 0 ? (
            <Body muted>Nothing matches that.</Body>
          ) : (
            <List>
              {listed.map(({ id, item }, i) => (
                <Row
                  key={id}
                  icon="altar"
                  title={item.name}
                  detail={[shelfLabel(item.shelf), qtyLabel(item.qty), isLow(item) ? 'running low' : '', item.where].filter(Boolean).join(' · ')}
                  last={i === listed.length - 1}
                  onPress={() => open(id)}
                />
              ))}
            </List>
          )}
        </View>
      )}

      <View style={ui.actions}>
        <Button label="Add something" onPress={() => router.push('/rituals/shelves/add')} />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Shopping list</SectionLabel>
        {shopping.length === 0 ? (
          <Body muted>Nothing running low. Mark something low from its page and it comes here, by shelf.</Body>
        ) : (
          shopping.map((group) => (
            <Card key={group.shelf}>
              <Text style={type.cardTitle}>{group.label}</Text>
              {group.items.map(({ id, item }) => (
                <View key={id} style={styles.shopRow}>
                  <Text style={[type.body, styles.shopName]} onPress={() => open(id)}>
                    {item.name}
                  </Text>
                  <Button label="Restocked" variant="outline" onPress={() => void actions.save(id, restock(item, new Date()))} accessibilityHint={`Takes ${item.name} off the list and brings it back up`} />
                </View>
              ))}
            </Card>
          ))
        )}
      </View>

      <List>
        <Row icon="today" title="To tend" detail="Your shelves’ cleansing, best-by days and check-ins, with everything else you tend" onPress={() => router.push('/today/tend')} />
        <Row icon="altar" title="Apothecary" detail="Jars and sachets you’ve made, and whether they worked" onPress={() => router.push('/rituals/apothecary')} />
        <Row icon="grimoire" title="Your harvests and store cupboard" detail="What you’ve gathered and dried" last onPress={() => router.push('/rituals/craft/hearth/forage/harvests')} />
      </List>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  shopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline, paddingTop: 8 },
  shopName: { flex: 1 },
});
