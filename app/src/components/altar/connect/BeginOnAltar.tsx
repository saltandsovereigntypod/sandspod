// Rituals on the altar, from either side: choose which altar to begin a
// premade working or one of your templates on (from the ritual's own screen),
// or, on the altar, choose the ritual to begin there, with what it calls for
// checked against what's on the altar and among your things.

import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../Button';
import { startOnAltar, withRitualOrigin, type RitualSource } from '../../../lib/altar/connect/ritualStart';
import { linkSessionToAltar } from '../../../lib/altar/connect/ritual';
import { premadeNeeds, templateNeeds } from '../../../lib/altar/connect/ingredients';
import { altarSummary } from '../../../lib/altar/snapshot';
import { useAltars } from '../../../lib/altar/store';
import { filterPremade, forYou, forYouContext, PREMADE } from '../../../lib/rituals/premade';
import { startRitual, updateActive, useRituals } from '../../../lib/rituals/store';
import { useMySettings } from '../../../lib/settings/store';
import { space, type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { connectStyles, Eyebrow, Field, Row, type AltarRef } from './common';
import { IngredientCheck } from './IngredientCheck';

/** Begin a ritual on a saved altar, then open the altar with it running. */
export function useBeginOnAltar() {
  const [busy, setBusy] = useState(false);
  const begin = useCallback(async (source: RitualSource, altarId: string, open = true) => {
    setBusy(true);
    try {
      await startRitual(startOnAltar(source, altarId));
      await updateActive((s) => withRitualOrigin(s, source));
      if (open) router.navigate({ pathname: '/altar/[altarId]', params: { altarId } });
    } finally {
      setBusy(false);
    }
  }, []);
  return { begin, busy };
}

/** Choose one of your saved altars to begin a ritual on. */
export function AltarChoiceSheet({ visible, title, onClose, onPick }: { visible: boolean; title: string; onClose: () => void; onPick: (altarId: string) => void }) {
  const { altars } = useAltars();
  return (
    <Sheet visible={visible} eyebrow="Begin on an altar" title={title} onClose={onClose}>
      {altars.length === 0 ? (
        <View style={connectStyles.gap}>
          <Text style={connectStyles.body}>Save an altar first, in the Altar tab. Then the ritual can run over it: its candles lit as the steps begin, and the altar kept with your journal entry.</Text>
          <Button
            label="Open your altars"
            variant="outline"
            onPress={() => {
              onClose();
              router.navigate('/altar');
            }}
          />
        </View>
      ) : (
        <View style={connectStyles.gap}>
          <Text style={type.caption}>The ritual opens over the altar you choose. Its steps light and snuff the candles there, and the altar is kept with your journal entry.</Text>
          {altars.map((a) => (
            <Row key={a.id} title={a.name || 'My Altar'} detail={altarSummary(a)} onPress={() => onPick(a.id)} accessibilityLabel={`Begin on ${a.name || 'My Altar'}`} />
          ))}
        </View>
      )}
    </Sheet>
  );
}

type PickerProps = {
  visible: boolean;
  altar: AltarRef;
  onClose: () => void;
  /** Begin this one here. */
  onBegin: (source: RitualSource) => void;
  busy?: boolean;
};

/** On the altar: choose a premade working or one of your templates to begin here. */
export function RitualPickerSheet({ visible, altar, onClose, onBegin, busy }: PickerProps) {
  const rituals = useRituals();
  const { settings } = useMySettings();
  const [tab, setTab] = useState<'premade' | 'templates'>('premade');
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<RitualSource | null>(null);
  const suggested = useMemo(() => forYou(forYouContext(settings as Record<string, unknown> | null, new Date()), PREMADE, 8), [settings]);
  const premades = useMemo(() => (query.trim() ? filterPremade(PREMADE, { query }).slice(0, 40) : suggested), [query, suggested]);
  const templates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rituals.templates.filter((t) => t.status !== 'archived' && (!q || `${t.title} ${t.intention ?? ''}`.toLowerCase().includes(q)));
  }, [rituals.templates, query]);
  const needs = useMemo(() => (!chosen ? [] : chosen.kind === 'premade' ? premadeNeeds(chosen.premade) : templateNeeds(chosen.template)), [chosen]);
  const active = rituals.active;
  const elsewhere = !!active && active.linked_altar_id !== altar.id && active.metadata?.ranOnAltar !== altar.id;

  const close = () => {
    setChosen(null);
    onClose();
  };

  if (chosen) {
    const title = chosen.kind === 'premade' ? chosen.premade.title : chosen.template.title;
    const summary = chosen.kind === 'premade' ? chosen.premade.summary : chosen.template.intention ?? '';
    const steps = chosen.kind === 'premade' ? chosen.premade.steps.length : (chosen.template.ritual_template_steps ?? []).length;
    return (
      <Sheet visible={visible} eyebrow="Begin a ritual here" title={title} onClose={close}>
        {!!summary && <Text style={connectStyles.body}>{summary}</Text>}
        <Text style={type.caption}>{`${steps} ${steps === 1 ? 'step' : 'steps'}${chosen.kind === 'premade' ? ` · about ${chosen.premade.minutes} min` : ''}`}</Text>
        <IngredientCheck needs={needs} objects={altar.objects} altarName={altar.name} />
        {active ? (
          <Text style={connectStyles.problem}>{`“${active.title || 'A ritual'}” is under way. Finish it before beginning another.`}</Text>
        ) : (
          <Button label={busy ? 'Beginning…' : `Begin on ${altar.name}`} disabled={busy} onPress={() => onBegin(chosen)} />
        )}
        <Button label="Choose another" variant="outline" onPress={() => setChosen(null)} />
      </Sheet>
    );
  }

  return (
    <Sheet
      visible={visible}
      eyebrow="Begin a ritual here"
      title="Which ritual?"
      onClose={close}
      header={
        <View style={{ paddingHorizontal: space.gutter, paddingBottom: 8, gap: 8 }}>
          <ChipRow>
            <Chip label="From the book" active={tab === 'premade'} onPress={() => setTab('premade')} />
            <Chip label="Your templates" active={tab === 'templates'} onPress={() => setTab('templates')} />
          </ChipRow>
          <Field label="Search rituals" placeholder={tab === 'premade' ? 'Search the book: protection, Full Moon…' : 'Search your templates'} value={query} onChangeText={setQuery} returnKeyType="search" />
        </View>
      }
    >
      {elsewhere && active && (
        <View style={connectStyles.card}>
          <Text style={connectStyles.value}>{`“${active.title || 'A ritual'}” is under way`}</Text>
          <Text style={type.caption}>Carry it on here: its candle steps follow this altar, and the altar is kept with its journal entry.</Text>
          <Button
            label="Continue it on this altar"
            variant="outline"
            disabled={!altar.id}
            onPress={() => {
              if (!altar.id) return;
              const id = altar.id;
              void updateActive((s) => linkSessionToAltar(s, id, new Date()));
              close();
            }}
          />
        </View>
      )}
      {tab === 'premade' ? (
        <View style={connectStyles.gap}>
          <Eyebrow>{query.trim() ? 'From the book' : 'Suited to tonight'}</Eyebrow>
          {premades.length === 0 && <Text style={type.caption}>Nothing in the book matches that.</Text>}
          {premades.map((p) => (
            <Row key={p.id} title={p.title} detail={`${p.kind === 'spell' ? 'Spell' : 'Ritual'} · about ${p.minutes} min`} onPress={() => setChosen({ kind: 'premade', premade: p })} />
          ))}
        </View>
      ) : (
        <View style={connectStyles.gap}>
          {templates.length === 0 ? (
            <Text style={connectStyles.body}>{rituals.templates.length ? 'None of your templates match that.' : 'Your own templates appear here once you make one in Rituals → Templates.'}</Text>
          ) : (
            templates.map((t) => {
              const n = (t.ritual_template_steps ?? []).length;
              return <Row key={t.id} title={t.title || 'Untitled'} detail={`${n} ${n === 1 ? 'step' : 'steps'}`} onPress={() => setChosen({ kind: 'template', template: t })} />;
            })
          )}
        </View>
      )}
    </Sheet>
  );
}
