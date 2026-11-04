import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Body, Card, Chip, Chips, Field, List, Row, SectionLabel, ui } from '../../components/rituals/ui';
import { ShelfCabinet } from '../../components/shelves/ShelfCabinet';
import { byShelf, isLow, SHELVES, qtyLabel, restock, shelfLabel, shoppingList, sortShelf, SORTS, tendKeyOf, type ShelfSort } from '../../lib/shelves/model';
import { useShelfActions, useShelves } from '../../lib/shelves/store';
import { dueOf, ownTendables } from '../../lib/tend/model';
import { colors, type } from '../../theme';

const open = (id: string) => router.push({ pathname: '/rituals/shelves/[id]', params: { id } });

const SHELF_KEY = 'salt.shelves.shelf';
const PAGE = 24;

// My Shelves (the Shelves tab on the Altar page): the real things you keep, one shelf at a time on
// painted planks or as a list. Everything you press sits above the shelving; what's running low
// is its own view.
export function ShelvesView() {
  const { entries, ready } = useShelves();
  const actions = useShelfActions();
  const [view, setView] = useState<'shelves' | 'list' | 'shopping'>('shelves');
  const [sort, setSort] = useState<ShelfSort>('shelf');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    AsyncStorage.getItem(SHELF_KEY)
      .then((v) => v && setSaved(v))
      .catch(() => {});
  }, []);

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

  const shopping = useMemo(() => shoppingList(entries), [entries]);
  const lowCount = shopping.reduce((n, g) => n + g.items.length, 0);

  // The chosen shelf: the one kept on this device, else the first with something on it.
  const shelf: string = useMemo(() => {
    if (saved === 'all' || SHELVES.some((s) => s.key === saved)) return saved as string;
    return (SHELVES.find((s) => entries.some((e) => e.item.shelf === s.key)) ?? SHELVES[0]).key;
  }, [saved, entries]);
  const pick = (key: string) => {
    setSaved(key);
    setLimit(PAGE);
    AsyncStorage.setItem(SHELF_KEY, key).catch(() => {});
  };

  const listed = useMemo(
    () => sortShelf(entries, view === 'list' ? sort : 'shelf', query, (id) => due.get(id) ?? null).filter((e) => shelf === 'all' || e.item.shelf === shelf),
    [entries, view, sort, query, due, shelf],
  );
  const groups = useMemo(() => {
    const ids = new Set(listed.map((e) => e.id));
    return byShelf(entries)
      .filter((g) => shelf === 'all' || g.key === shelf)
      .map((g) => ({ ...g, entries: g.entries.filter((e) => ids.has(e.id)) }))
      .filter((g) => g.entries.length > 0);
  }, [entries, listed, shelf]);

  const add = () => router.push({ pathname: '/rituals/shelves/add', params: shelf === 'all' ? {} : { shelf } });
  const links = (
    <List>
      <Row icon="today" title="To tend" detail="Your shelves’ cleansing, best-by days and check-ins, with everything else you tend" onPress={() => router.push('/today/tend')} />
      <Row icon="altar" title="Apothecary" detail="Jars and sachets you’ve made, and whether they worked" onPress={() => router.push('/rituals/apothecary')} />
      <Row icon="grimoire" title="Your harvests and store cupboard" detail="What you’ve gathered and dried" last onPress={() => router.push('/rituals/craft/hearth/forage/harvests')} />
    </List>
  );

  if (!ready) return <Body muted>Opening…</Body>;

  if (view === 'shopping') {
    return (
      <View style={ui.gap}>
        <Chips>
          <Chip label="‹ My Shelves" selected={false} onPress={() => setView('shelves')} />
        </Chips>
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
    );
  }

  if (entries.length === 0) {
    return (
      <View style={ui.gap}>
        <Body muted>Your crystals, herbs, oils, candles, tools, decks, books and statues: what you have, where it’s kept, how it’s tended and what’s running low.</Body>
        <Card>
          <Body>Nothing on your shelves yet. Add what you own from the altar cabinet or the Living Library with “I own this”, or add your own with a photo.</Body>
        </Card>
        <View style={ui.actions}>
          <Button label="Add something" onPress={add} />
        </View>
        {links}
      </View>
    );
  }

  return (
    <View style={ui.gap}>
      <View style={ui.actions}>
        <Button label="Add something" onPress={add} />
        <Button label={`Running low (${lowCount})`} variant="outline" onPress={() => setView('shopping')} />
      </View>
      <Field label="Search" value={query} onChange={setQuery} placeholder="Name, shelf, where it’s kept…" />
      <Chips>
        <Chip label="Shelves" selected={view === 'shelves'} onPress={() => setView('shelves')} />
        <Chip label="List" selected={view === 'list'} onPress={() => setView('list')} />
      </Chips>
      {view === 'list' && (
        <Chips>
          {SORTS.map((s) => (
            <Chip key={s.value} label={s.label} selected={sort === s.value} onPress={() => setSort(s.value)} />
          ))}
        </Chips>
      )}
      <Text style={[type.body, styles.tendLink]} accessibilityRole="link" onPress={() => router.push('/today/tend')}>
        To tend
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs} accessibilityRole="tablist">
        {SHELVES.map((s) => (
          <Chip key={s.key} label={`${s.label} · ${entries.filter((e) => e.item.shelf === s.key).length}`} selected={shelf === s.key} onPress={() => pick(s.key)} />
        ))}
        <Chip label={`All · ${entries.length}`} selected={shelf === 'all'} onPress={() => pick('all')} />
      </ScrollView>

      {listed.length === 0 ? (
        query ? (
          <Body muted>Nothing matches that.</Body>
        ) : (
          <Card>
            <Body muted>Nothing here yet</Body>
            <View style={ui.actions}>
              <Button label="Add to this shelf" onPress={add} />
            </View>
          </Card>
        )
      ) : view === 'shelves' ? (
        <ShelfCabinet groups={groups} limit={limit} showPlaques={shelf === 'all'} onOpen={open} onMore={() => setLimit((n) => n + PAGE)} />
      ) : (
        <List>
          {listed.slice(0, limit).map(({ id, item }, i, arr) => (
            <Row
              key={id}
              icon="altar"
              title={item.name}
              detail={[shelf === 'all' ? shelfLabel(item.shelf) : '', qtyLabel(item.qty), isLow(item) ? 'running low' : '', item.where].filter(Boolean).join(' · ')}
              last={i === arr.length - 1}
              onPress={() => open(id)}
            />
          ))}
        </List>
      )}
      {view === 'list' && listed.length > limit && <Button label={`Show more (${listed.length - limit})`} variant="outline" onPress={() => setLimit((n) => n + PAGE)} />}

      {links}
    </View>
  );
}

const styles = StyleSheet.create({
  shopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline, paddingTop: 8 },
  shopName: { flex: 1 },
  tabs: { gap: 8, paddingVertical: 2 },
  tendLink: { color: colors.gold, textDecorationLine: 'underline' },
});
