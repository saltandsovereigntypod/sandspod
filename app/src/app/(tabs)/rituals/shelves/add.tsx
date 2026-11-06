import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Card, Chip, Chips, Field, List, Notice, RitualScreen, Row, SectionLabel, Title, Toggle, ui } from '../../../../components/rituals/ui';
import { ShelfThingPicture } from '../../../../components/shelves/ShelfCabinet';
import { LABEL_FONTS, LABEL_MAX, LABEL_STYLES, VESSELS, vesselForShelf } from '../../../../lib/altar/vesselLabel';
import { builtInCabinet } from '../../../../lib/altar/cabinet';
import { cabinetEntry } from '../../../../lib/altar/companion';
import { keepImageOnDevice, pickImage, uploadImage } from '../../../../lib/altar/images';
import { cabinetFormOf, itemIndex, searchItems } from '../../../../lib/altar/itemIndex';
import { useWorkshop } from '../../../../lib/altar/workshop';
import { useLibrary } from '../../../../lib/library';
import { useSession } from '../../../../lib/session';
import { LEVELS, newItem, sameRhythm, SHELF_RHYTHMS, SHELVES, shelfFor, SOURCES, tendPlanFor, whereSuggestions, type ShelfItem } from '../../../../lib/shelves/model';
import { useShelfActions, useShelves } from '../../../../lib/shelves/store';
import { dayKey } from '../../../../lib/tend/model';
import { type } from '../../../../theme';

type Params = { id?: string; key?: string; ref?: string; name?: string; image?: string; shelf?: string; notes?: string };

// Add something to My Shelves (from the cabinet, the Living Library, or your
// own with a photo), or change something already there (?id=).
export default function AddToShelves() {
  const params = useLocalSearchParams<Params>();
  const { entries, ready } = useShelves();
  const editing = params.id ? entries.find((e) => e.id === params.id) : null;
  if (params.id && !ready) {
    return (
      <RitualScreen back="Back">
        <Body muted>Opening…</Body>
      </RitualScreen>
    );
  }
  return <ShelfForm key={editing?.id ?? 'new'} params={params} editing={editing ?? null} all={entries.map((e) => e.item)} />;
}

function ShelfForm({ params, editing, all }: { params: Params; editing: { id: string; item: ShelfItem } | null; all: ShelfItem[] }) {
  const { session } = useSession();
  const workshop = useWorkshop();
  const { entries: library } = useLibrary();
  const actions = useShelfActions();
  const cabinet = useMemo(() => [...workshop.customItems, ...builtInCabinet], [workshop.customItems]);

  // What it starts from: the thing being changed, or what "I own this" sent.
  const start = useMemo((): ShelfItem | null => {
    if (editing) return editing.item;
    const found = params.key ? cabinetFormOf(params.key, cabinet) : null;
    const name = params.name || found?.item.name || '';
    if (!name) return null;
    const ref = params.ref || (found ? (cabinetEntry(library, found.item, found.form)?.traditionalRef ?? '') : '');
    const image = params.image || found?.form.image || '';
    const shelf = (SHELVES.some((s) => s.key === params.shelf) ? params.shelf : shelfFor(String(found?.item.category ?? ''), name, found?.form.type ?? ref.split('/')[1] ?? '')) as ShelfItem['shelf'];
    return newItem({ name, shelf, image, cabinetKey: params.key ?? '', ref, acquired: dayKey(new Date()), notes: params.notes ?? '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chosen once, when the form opens
  }, []);

  const [item, setItem] = useState<ShelfItem | null>(start);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const index = useMemo(() => itemIndex({ own: workshop.customItems, cabinet: builtInCabinet }), [workshop.customItems]);
  const found = useMemo(() => (search.trim() ? searchItems(index, search, { limit: 20 }) : []), [index, search]);
  const places = useMemo(() => whereSuggestions(all), [all]);
  const set = (change: Partial<ShelfItem>) => setItem((prev) => (prev ? { ...prev, ...change } : prev));

  if (!item) {
    return (
      <RitualScreen back="Back">
        <Title eyebrow="My Shelves">Add something</Title>
        <Body muted>Find it in the altar cabinet, so it keeps the cabinet’s picture and can be placed on your altar, or add your own with a photo.</Body>
        <Field label="Find it in the cabinet" value={search} onChange={setSearch} placeholder="Rose quartz, bay, white candle…" />
        {found.length > 0 && (
          <List>
            {found.map((entry, i) => (
              <Row
                key={entry.key}
                icon="altar"
                title={entry.label}
                detail={entry.detail}
                last={i === found.length - 1}
                onPress={() => {
                  const placed = cabinetFormOf(entry.key, [...workshop.customItems, ...builtInCabinet]);
                  const ref = placed ? (cabinetEntry(library, placed.item, placed.form)?.traditionalRef ?? '') : '';
                  setItem(newItem({ name: placed?.item.name ?? entry.label, shelf: shelfFor(entry.category, entry.label, placed?.form.type ?? ''), image: placed?.form.image ?? entry.image ?? '', cabinetKey: entry.key, ref, acquired: dayKey(new Date()) }));
                }}
              />
            ))}
          </List>
        )}
        <Button label="Add my own" variant="outline" onPress={() => setItem(newItem({ name: '', shelf: 'other', acquired: dayKey(new Date()) }))} />
      </RitualScreen>
    );
  }

  const plan = tendPlanFor(item.shelf, item.name);
  const photo = async () => {
    setProblem(null);
    try {
      const picked = await pickImage();
      if (!picked) return;
      setBusy(true);
      const userId = session?.user.id ?? null;
      const image = userId ? (await uploadImage(userId, picked, 'shelves')).url : await keepImageOnDevice(picked, 'shelves');
      set({ image });
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'The photo couldn’t be kept. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!item.name.trim()) return setProblem('Give it a name first.');
    setBusy(true);
    try {
      if (editing) {
        await actions.save(editing.id, item);
        router.back();
      } else {
        const id = await actions.add(item);
        router.replace({ pathname: '/rituals/shelves/[id]', params: { id } });
      }
    } finally {
      setBusy(false);
    }
  };

  const vessel = vesselForShelf(item.shelf, item.name);

  return (
    <RitualScreen back="Back">
      <Title eyebrow="My Shelves">{editing ? `Change ${editing.item.name}` : 'I own this'}</Title>
      <View style={styles.head}>
        <ShelfThingPicture item={{ ...item, name: item.name || '?' }} width={84} height={84} />
        <View style={{ flex: 1, gap: 8 }}>
          <Button label={item.image ? 'Use my own photo instead' : 'Add a photo'} variant="outline" disabled={busy} onPress={() => void photo()} />
        </View>
      </View>
      {!!problem && <Notice>{problem}</Notice>}

      <Field label="Name" value={item.name} onChange={(name) => set({ name })} placeholder="What it is" />

      {!!vessel && (
        <Card>
          <Text style={type.cardTitle}>{`Its label (${VESSELS[vessel].name.toLowerCase()})`}</Text>
          <Field label="What the label says" value={item.label} onChange={(label) => set({ label: label.slice(0, LABEL_MAX) })} placeholder={item.name || 'Its name'} />
          <SectionLabel>Label</SectionLabel>
          <Chips>
            {LABEL_STYLES.map((s) => (
              <Chip key={s.value} label={s.label} selected={item.labelStyle === s.value} onPress={() => set({ labelStyle: s.value })} />
            ))}
          </Chips>
          <SectionLabel>Writing</SectionLabel>
          <Chips>
            {LABEL_FONTS.map((f) => (
              <Chip key={f.value} label={f.label} selected={item.labelFont === f.value} onPress={() => set({ labelFont: f.value })} />
            ))}
          </Chips>
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Shelf</SectionLabel>
        <Chips>
          {SHELVES.map((s) => (
            <Chip key={s.key} label={s.label} selected={item.shelf === s.key} onPress={() => set({ shelf: s.key, tend: { ...item.tend, on: item.tend.rhythm ? item.tend.on : !!tendPlanFor(s.key, item.name) } })} />
          ))}
        </Chips>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>How much</SectionLabel>
        <Chips>
          <Chip label="A count" selected={item.qty.kind === 'count'} onPress={() => set({ qty: { kind: 'count', n: item.qty.kind === 'count' ? item.qty.n : 1 } })} />
          <Chip label="Full, half or low" selected={item.qty.kind === 'level'} onPress={() => set({ qty: { kind: 'level', level: item.qty.kind === 'level' ? item.qty.level : 'full' } })} />
        </Chips>
        {item.qty.kind === 'count' ? (
          <Field label="How many" value={String(item.qty.n)} keyboardType="numeric" onChange={(t) => set({ qty: { kind: 'count', n: Math.max(0, Math.round(Number(t.replace(/\D/g, '')) || 0)) } })} />
        ) : (
          <Chips>
            {LEVELS.map((l) => (
              <Chip key={l.value} label={l.label} selected={item.qty.kind === 'level' && item.qty.level === l.value} onPress={() => set({ qty: { kind: 'level', level: l.value } })} />
            ))}
          </Chips>
        )}
      </View>

      <View style={ui.gapSmall}>
        <Field label="Where it’s kept" value={item.where} onChange={(where) => set({ where })} placeholder="Kitchen shelf, altar drawer…" />
        {places.length > 0 && (
          <Chips>
            {places.map((p) => (
              <Chip key={p} label={p} selected={item.where === p} onPress={() => set({ where: p })} />
            ))}
          </Chips>
        )}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Where it came from</SectionLabel>
        <Chips>
          {SOURCES.map((s) => (
            <Chip key={s.value} label={s.label} selected={item.source === s.value} onPress={() => set({ source: s.value })} />
          ))}
        </Chips>
        <Field label="More about where it came from" value={item.sourceText} onChange={(sourceText) => set({ sourceText })} placeholder="The shop, who gave it, where you found it" />
      </View>

      <Field label="When you got it (year-month-day)" value={item.acquired} onChange={(acquired) => set({ acquired: acquired.trim() })} placeholder="2026-11-04" />
      <Field label="Intention" value={item.intention} onChange={(intention) => set({ intention })} placeholder="What it’s for, if anything" />
      <Field label="Notes" value={item.notes} onChange={(notes) => set({ notes })} multiline />

      <Card>
        <Text style={type.cardTitle}>Tending</Text>
        <Toggle
          label="Tend it in To tend"
          detail={plan ? plan.line : 'This shelf asks nothing by itself; choose a rhythm if you’d like one.'}
          value={item.tend.on}
          onChange={(on) => set({ tend: { on, rhythm: on && !plan && !item.tend.rhythm ? { kind: 'every', every: 30 } : item.tend.rhythm } })}
        />
        {item.tend.on && (
          <Chips>
            {SHELF_RHYTHMS.filter((r) => r.rhythm || plan).map((r) => (
              <Chip key={r.label} label={r.label} selected={sameRhythm(item.tend.rhythm, r.rhythm)} onPress={() => set({ tend: { on: true, rhythm: r.rhythm } })} />
            ))}
          </Chips>
        )}
        {item.qty.kind === 'count' && (
          <Toggle label="Count down when used in a spell" detail="One fewer each time you mark it used in a working" value={item.countDown} onChange={(countDown) => set({ countDown })} />
        )}
      </Card>

      <Button label={busy ? 'Keeping it…' : editing ? 'Save changes' : 'Put it on my shelves'} disabled={busy} onPress={() => void save()} />
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
});
