import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { GridBuilder, GridMap } from '../../../../../components/craft/GridBuilder';
import { Body, Card, Field, List, RitualScreen, Row, SectionLabel, Title, confirmAction, ui } from '../../../../../components/rituals/ui';
import { useAltars } from '../../../../../lib/altar/store';
import { activationSteps, emptyGrid, gridName, gridProblem, gridProgress, GRIDS, logGrid, normaliseGrid, shapeOf, tendedToday, type Grid } from '../../../../../lib/craft/crystal/grids';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';
import { type } from '../../../../../theme';

// Crystal grids: plan one (shape, centre and points, intent, how long),
// activate it, tend it day by day, set it on an altar, and take it down,
// with a log of each.
export default function CrystalGrids() {
  const { id: openId } = useLocalSearchParams<{ id?: string }>();
  const { entries } = useCraft<Grid>(GRIDS);
  const altars = useAltars();
  const now = useMemo(() => new Date(), []);
  const id = openId ?? null;
  const [draft, setDraft] = useState<Grid>(() => emptyGrid());
  const [note, setNote] = useState('');
  const open = id ? entries.find((e) => e.id === id) : null;
  const grid = open ? normaliseGrid(open.data) : null;
  const list = useMemo(() => entries.map((e) => ({ id: e.id, g: normaliseGrid(e.data) })).sort((a, b) => (a.g.status === 'closed' ? 1 : 0) - (b.g.status === 'closed' ? 1 : 0)), [entries]);
  const latest = [...altars.altars].sort((a, b) => String(b.updatedAt ?? b.savedAt ?? '').localeCompare(String(a.updatedAt ?? a.savedAt ?? '')))[0];

  const record = async (kind: Parameters<typeof logGrid>[1], text: string) => {
    if (!id || !grid) return;
    await updateEntry<Grid>(GRIDS, id, logGrid(grid, kind, text, new Date().toISOString()));
  };

  if (grid && id) {
    const progress = gridProgress(grid, now);
    return (
      <RitualScreen back="Grids">
        <Title eyebrow={`${shapeOf(grid.shape).label} grid`}>{gridName(grid)}</Title>
        <Body muted>{`${progress.line}${grid.intent ? ` · for ${grid.intent.toLowerCase()}` : ''}`}</Body>
        <GridMap grid={grid} size={200} />
        <Body>{`${grid.centre?.name ?? 'No centre stone'} in the middle; ${[...new Set(grid.points.map((p) => p.name))].join(', ')} round it.`}</Body>

        {grid.status !== 'closed' && (
          <View style={ui.gapSmall}>
            <SectionLabel>{grid.status === 'active' ? 'Keeping it' : 'Setting it'}</SectionLabel>
            {activationSteps(grid).map((s, i) => (
              <Body key={i}>{`${i + 1}. ${s}`}</Body>
            ))}
            {grid.status === 'planned' && <Button label="I’ve set and activated it" onPress={() => void record('activated', 'Set out and activated')} />}
            {grid.status === 'active' && <Button label={tendedToday(grid, now) ? 'Tended today' : 'Sat with it today'} variant={tendedToday(grid, now) ? 'outline' : 'primary'} disabled={tendedToday(grid, now)} onPress={() => void record('tended', 'Sat with it and restated the intent')} />}
            <Button label="Set it on my altar" variant="outline" onPress={() => router.push({ pathname: '/altar/[altarId]', params: { altarId: latest?.id ?? 'new', grid: id } })} />
            {grid.status === 'active' && <Button label="Take it down" variant="text" onPress={() => void record('closed', 'Thanked, taken down and cleansed')} />}
          </View>
        )}

        <View style={ui.gapSmall}>
          <SectionLabel>Log</SectionLabel>
          <Field label="A note" value={note} onChange={setNote} multiline placeholder="What you noticed, dreamed or felt" />
          <Button
            label="Add the note"
            variant="outline"
            disabled={!note.trim()}
            onPress={async () => {
              await record('note', note);
              setNote('');
            }}
          />
          {[...grid.log].reverse().map((l, i) => (
            <Card key={`${l.at}-${i}`}>
              <Text style={type.eyebrow}>{new Date(l.at).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
              <Body>{l.text}</Body>
            </Card>
          ))}
          {!grid.log.length && <Body muted>Nothing logged yet.</Body>}
        </View>

        <List>
          <Row icon="grimoire" title="My stones" detail="Cleanse them before and after" onPress={() => router.push('/rituals/craft/crystal/stones')} />
          <Row icon="today" title="The moon for your stones" detail="Charge at the full, cleanse in the waning" last onPress={() => router.push('/rituals/craft/crystal')} />
        </List>
        <Button
          label="Delete this grid"
          variant="text"
          onPress={async () => {
            if (!(await confirmAction('Delete this grid?', 'Its log goes with it. Stones set on an altar stay there.', 'Delete'))) return;
            await removeEntry(GRIDS, id);
            router.back();
          }}
        />
      </RitualScreen>
    );
  }

  const problem = gridProblem(draft);
  return (
    <RitualScreen back="Crystal">
      <Title eyebrow="Crystal">Grids</Title>
      <Body muted>Stones set out in a shape round a centre stone, held to one intent for a while. Grids are a modern practice, from the crystal books of the 1980s on; the shapes borrow older sacred geometry.</Body>

      {list.length > 0 && (
        <List>
          {list.map(({ id: gid, g }, i) => (
            <Row key={gid} icon="altar" title={gridName(g)} detail={gridProgress(g, now).line} last={i === list.length - 1} onPress={() => router.push({ pathname: '/rituals/craft/crystal/grids', params: { id: gid } })} />
          ))}
        </List>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Plan a grid</SectionLabel>
        <GridBuilder grid={draft} onChange={setDraft} />
        <Field label="Name it (optional)" value={draft.name} onChange={(name) => setDraft((d) => ({ ...d, name }))} placeholder={gridName({ ...draft, name: '' })} />
        {problem && <Body muted>{problem}</Body>}
        <Button
          label="Keep this grid"
          disabled={!!problem}
          onPress={async () => {
            const saved = await addEntry<Grid>(GRIDS, logGrid(draft, 'set', 'Planned', new Date().toISOString()));
            setDraft(emptyGrid());
            router.push({ pathname: '/rituals/craft/crystal/grids', params: { id: saved.id } });
          }}
        />
      </View>
    </RitualScreen>
  );
}
