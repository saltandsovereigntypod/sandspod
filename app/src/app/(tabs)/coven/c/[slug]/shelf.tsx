import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { Card, Chips, Field, MenuList, MenuRow, Notice, Section, SwitchRow } from '../../../../../components/more/ui';
import { ShelfCabinet } from '../../../../../components/shelves/ShelfCabinet';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { errorMessage } from '../../../../../lib/covens/model';
import { addShelfThing, removeShelfThing, saveShelfThing, useCovenShelf } from '../../../../../lib/covens/sharedApi';
import { asEntries, canEditThing, canRemoveThing, filterThings, heldLine, newCovenItem, SHELF_FILTERS, shelfCounts, toRow, type CovenShelfThing, type ShelfFilter } from '../../../../../lib/covens/shelf';
import { byShelf, cleanItem, isLow, LEVELS, qtyLabel, SHELVES, type Level, type ShelfItem, type ShelfKind } from '../../../../../lib/shelves/model';
import { type } from '../../../../../theme';

// The coven's shared shelf: the coven's own things, kept like My Shelves
// (lib/covens/shelf.ts), with who holds each between gatherings, where it's
// kept, what's running low and what needs cleansing. Members add; whoever
// added or holds a thing changes it; those who lead the coven's rites change
// anything. Beside the coven's altars and Book on the coven's home.

type Draft = { id: string | null; item: ShelfItem; holderId: string | null; needsCleansing: boolean; cleansedOn: string | null; count: string };

const draftOf = (thing: CovenShelfThing | null, holder: string | null): Draft => {
  const item = thing?.item ?? newCovenItem('', { shelf: 'candles' });
  return { id: thing?.id ?? null, item, holderId: thing ? thing.holderId : holder, needsCleansing: thing?.needsCleansing ?? false, cleansedOn: thing?.cleansedOn ?? null, count: item.qty.kind === 'count' ? String(item.qty.n) : '1' };
};

const today = () => new Date().toISOString().slice(0, 10);

export default function CovenShelf() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const { userId, nameOf, loadNames } = coven;
  const leads = coven.perms.lead || coven.perms.manage || coven.perms.founder;
  const shelf = useCovenShelf(covenId);
  const [members, setMembers] = useState<string[]>([]);
  const [filter, setFilter] = useState<ShelfFilter>('all');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [limit, setLimit] = useState(24);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!covenId) return;
    api
      .fetchMembers(covenId)
      .then((m) => {
        setMembers(m.map((x) => x.user_id));
        void loadNames(m.map((x) => x.user_id));
      })
      .catch(() => setMembers([]));
  }, [covenId, loadNames]);

  const shown = useMemo(() => filterThings(shelf.things, filter, userId, query), [shelf.things, filter, userId, query]);
  const counts = shelfCounts(shelf.things);
  const groups = useMemo(() => byShelf(asEntries(shown)).filter((g) => g.entries.length), [shown]);
  const may = coven.perms.member && coven.standing.ok;

  const open = (id: string) => {
    const thing = shelf.things.find((t) => t.id === id);
    if (!thing) return;
    setMessage(null);
    setDraft(draftOf(thing, null));
  };
  const editing = draft?.id ? shelf.things.find((t) => t.id === draft.id) ?? null : null;
  const canEdit = !draft?.id || (!!editing && canEditThing(editing, userId, leads));

  const save = async () => {
    if (!draft || !covenId) return;
    const name = draft.item.name.trim();
    if (!name) return setMessage('Give it a name.');
    const n = Math.max(0, Math.round(Number(draft.count) || 0));
    const item = cleanItem({ ...draft.item, name, qty: draft.item.qty.kind === 'count' ? { kind: 'count', n } : draft.item.qty });
    const row = toRow(item, { holderId: draft.holderId, needsCleansing: draft.needsCleansing, cleansedOn: draft.cleansedOn });
    setBusy(true);
    try {
      if (draft.id) await saveShelfThing(draft.id, row);
      else await addShelfThing(covenId, row);
      setDraft(null);
      await shelf.reload();
    } catch (e) {
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!draft?.id) return;
    setBusy(true);
    try {
      await removeShelfThing(draft.id);
      setDraft(null);
      await shelf.reload();
    } catch (e) {
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const setItem = (patch: Partial<ShelfItem>) => setDraft((d) => (d ? { ...d, item: { ...d.item, ...patch } } : d));
  const holders = [{ value: '', label: 'The coven’s store' }, ...members.map((u) => ({ value: u, label: u === userId ? 'Me' : nameOf(u) }))];

  return (
    <CovenScreen title="Shared shelf" eyebrow="The coven’s things" onRefresh={shelf.reload}>
      {!shelf.loaded ? (
        <Text style={type.caption}>Loading…</Text>
      ) : !shelf.ready ? (
        <Notice tone="muted">The shared shelf isn’t open yet. It will appear here soon.</Notice>
      ) : draft ? (
        <Section label={draft.id ? (canEdit ? 'Change it' : 'On the shelf') : 'Add to the shelf'}>
          {canEdit ? (
            <>
              <Field label="What it is" value={draft.item.name} onChangeText={(v) => setItem({ name: v })} maxLength={120} placeholder="White pillar candles" />
              <Chips label="Shelf" options={SHELVES.map((s) => ({ value: s.key, label: s.label }))} value={draft.item.shelf} onChange={(v: ShelfKind) => setItem({ shelf: v })} />
              <Chips
                label="How much"
                options={[{ value: 'count', label: 'A number' }, ...LEVELS.map((l) => ({ value: l.value, label: l.label }))]}
                value={draft.item.qty.kind === 'count' ? 'count' : draft.item.qty.level}
                onChange={(v: string) => setItem({ qty: v === 'count' ? { kind: 'count', n: Number(draft.count) || 1 } : { kind: 'level', level: v as Level } })}
              />
              {draft.item.qty.kind === 'count' && <Field label="How many" value={draft.count} onChangeText={(v) => set({ count: v.replace(/[^0-9]/g, '') })} keyboardType="number-pad" maxLength={4} />}
              <Chips label="Who holds it" options={holders} value={draft.holderId ?? ''} onChange={(v) => set({ holderId: v || null })} />
              <Field label="Where it’s kept" value={draft.item.where} onChangeText={(v) => setItem({ where: v })} maxLength={120} placeholder="The blue box, the hall cupboard" />
              <MenuList>
                <SwitchRow label="Running low" detail="On the coven’s list to restock" value={draft.item.low} onChange={(v) => setItem({ low: v })} />
                <SwitchRow label="Needs cleansing" detail={draft.cleansedOn ? `Last cleansed ${draft.cleansedOn}` : 'Before it’s used again'} value={draft.needsCleansing} onChange={(v) => set({ needsCleansing: v })} last />
              </MenuList>
              {draft.needsCleansing && <Button label="Cleansed today" variant="outline" onPress={() => set({ needsCleansing: false, cleansedOn: today() })} />}
              <Field label="Notes" value={draft.item.notes} onChangeText={(v) => setItem({ notes: v })} multiline maxLength={2000} />
              <View style={styles.row}>
                <Button label={busy ? 'Saving…' : draft.id ? 'Save' : 'Add to the shelf'} disabled={busy} onPress={() => void save()} />
                <Button label="Cancel" variant="text" onPress={() => setDraft(null)} />
              </View>
              {!!editing && canRemoveThing(editing, userId, leads) && <Button label="Take it off the shelf" variant="text" disabled={busy} onPress={() => void remove()} />}
            </>
          ) : (
            editing && (
              <Card>
                <Text style={type.cardTitle}>{editing.item.name}</Text>
                <Text style={type.body}>{heldLine(editing, nameOf)}</Text>
                <Text style={type.caption}>{[qtyLabel(editing.item.qty), isLow(editing.item) ? 'running low' : '', editing.needsCleansing ? 'needs cleansing' : ''].filter(Boolean).join(' · ')}</Text>
                {!!editing.item.notes && <Text style={type.body}>{editing.item.notes}</Text>}
                {!!editing.addedBy && <Text style={type.caption}>Added by {nameOf(editing.addedBy)}. Who added it, who holds it and those who lead the coven’s rites can change it.</Text>}
                <Button label="Back to the shelf" variant="outline" onPress={() => setDraft(null)} />
              </Card>
            )
          )}
          {message && <Notice>{message}</Notice>}
        </Section>
      ) : (
        <>
          <Text style={type.body}>
            {counts.total
              ? [`${counts.total} ${counts.total === 1 ? 'thing' : 'things'}`, counts.low ? `${counts.low} running low` : '', counts.cleansing ? `${counts.cleansing} to cleanse` : ''].filter(Boolean).join(' · ')
              : 'Nothing on the coven’s shelf yet. Add the things the coven keeps together: candles, the chalice, oils, decks, books.'}
          </Text>
          {may && <Button label="Add something" onPress={() => setDraft(draftOf(null, userId))} />}
          {counts.total > 0 && (
            <>
              <Chips label="Show" options={SHELF_FILTERS} value={filter} onChange={setFilter} />
              <Field label="Search" value={query} onChangeText={setQuery} placeholder="Name, place or note" />
              {groups.length > 0 && <ShelfCabinet groups={groups} limit={limit} showPlaques onOpen={open} onMore={() => setLimit((l) => l + 24)} />}
              <MenuList>
                {shown.map((t, i) => (
                  <MenuRow
                    key={t.id}
                    label={t.item.name}
                    detail={[heldLine(t, nameOf), qtyLabel(t.item.qty), isLow(t.item) ? 'running low' : '', t.needsCleansing ? 'needs cleansing' : ''].filter(Boolean).join(' · ')}
                    icon="altar"
                    last={i === shown.length - 1}
                    onPress={() => open(t.id)}
                  />
                ))}
              </MenuList>
              {!shown.length && <Text style={type.caption}>Nothing here matches.</Text>}
            </>
          )}
          {message && <Notice>{message}</Notice>}
        </>
      )}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
});
