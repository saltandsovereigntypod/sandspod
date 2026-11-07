import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { afterwards, mixesUsing, mixHref, missingToAdd, shelfMatch, TEND_CHOICES, tendKeyForMix, bathTendRecord } from '../../lib/craft/bath/bath';
import { alwaysNotes, bathSafety, stoneWater, type BathIngredient } from '../../lib/craft/bath/safety';
import type { BathMix } from '../../lib/craft/bath/mixes';
import { ritualsLibraryHref } from '../../lib/library';
import { useShelfActions, useShelves } from '../../lib/shelves/store';
import { recordDone, rhythmLabel } from '../../lib/tend/model';
import { saveRecord, useTendRecords } from '../../lib/tend/store';
import { type } from '../../theme';
import { Body, Card, Chip, Chips, List, Row, SectionLabel, ui } from '../rituals/ui';
import { Button } from '../Button';

export const go = (href: string) => () => router.push(href as Href);

/** Where a Library page opens: the id the Library uses for a herb or stone ("traditional:herb:rose"). */
export const libraryHref = (ref: string) => {
  const [, type, key] = ref.split('/');
  return ritualsLibraryHref({ id: `traditional:${type}:${key}` }) as Href;
};

/** The ingredients with their amounts, and for stones whether they can go in the water. */
export function IngredientList({ ingredients }: { ingredients: BathIngredient[] }) {
  return (
    <List>
      {ingredients.map((i, n) => {
        const stoneNote = i.kind === 'crystal' ? stoneWater(i.name, i.ref?.split('/').pop()) : null;
        const detail = [i.amount, stoneNote ? stoneNote.label : null, i.optional ? 'optional' : null].filter(Boolean).join(' · ');
        return <Row key={`${i.name}${n}`} icon={i.kind === 'crystal' ? 'altar' : 'grimoire'} title={i.name} detail={detail} last={n === ingredients.length - 1} onPress={i.ref ? () => router.push(libraryHref(i.ref!)) : () => undefined} label={`${i.name}. ${detail}${i.ref ? '. Opens its Library page' : ''}`} />;
      })}
    </List>
  );
}

/** Every caution that applies, worked out from the ingredients, then the ones every bath carries. */
export function SafetyCard({ ingredients, method }: { ingredients: BathIngredient[]; method: string }) {
  const notes = bathSafety(ingredients);
  const always = alwaysNotes(ingredients, method);
  return (
    <Card accent={notes.some((n) => n.level === 'avoid')}>
      <SectionLabel>Before you bathe</SectionLabel>
      {notes.map((n) => (
        <View key={`${n.title}${n.ingredient}`} style={ui.gapSmall}>
          <Text style={type.cardTitle}>{`${n.level === 'avoid' ? 'Do not use: ' : ''}${n.title}${n.ingredient ? ` (${n.ingredient})` : ''}`}</Text>
          <Body muted>{n.text}</Body>
        </View>
      ))}
      {always.map((a) => (
        <Body key={a.id}>{a.text}</Body>
      ))}
    </Card>
  );
}

export function AfterwardsCard({ mix }: { mix: BathMix }) {
  return (
    <Card>
      <SectionLabel>Afterwards</SectionLabel>
      {afterwards(mix).map((line) => (
        <Body key={line}>{line}</Body>
      ))}
    </Card>
  );
}

/** "You have X of Y ingredients", from My Shelves, and "Add what's missing" onto the running-low list. */
export function ShelfCard({ mix }: { mix: BathMix }) {
  const { entries, ready } = useShelves();
  const actions = useShelfActions();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  if (!ready) return null;
  const m = shelfMatch(mix, entries);
  const add = missingToAdd(mix, entries);
  const onList = m.need.length - add.length;
  const run = async () => {
    setBusy(true);
    try {
      for (const item of add) await actions.add(item);
      setMessage(`${add.length} added to your running-low list on My Shelves.`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <SectionLabel>On your shelves</SectionLabel>
      <Text style={type.cardTitle}>{`You have ${m.have.length} of ${m.total} ingredients`}</Text>
      {m.have.length > 0 && <Body muted>{`Have: ${m.have.map((i) => i.name).join(', ')}.`}</Body>}
      {m.need.length > 0 && <Body>{`Missing: ${m.need.map((i) => i.name).join(', ')}.`}</Body>}
      {onList > 0 && <Body muted>{`${onList} already on your running-low list.`}</Body>}
      {m.optionalHave.length > 0 && <Body muted>{`Optional, and you have: ${m.optionalHave.map((i) => i.name).join(', ')}.`}</Body>}
      {add.length > 0 && <Button label="Add what’s missing" variant="outline" disabled={busy} accessibilityHint="Puts them on My Shelves marked as running low, so they are on your shopping list" onPress={() => void run()} />}
      {!!message && <Body muted>{message}</Body>}
      <Button label="Open My Shelves" variant="text" onPress={() => router.push({ pathname: '/altar', params: { tab: 'shelves' } } as Href)} />
    </Card>
  );
}

/** A rhythm for this bath in To tend: each new moon, weekly, and so on. */
export function TendCard({ mix }: { mix: BathMix }) {
  const { entries } = useTendRecords();
  const existing = entries.find((e) => e.record.key === tendKeyForMix(mix.id))?.record ?? null;
  const [message, setMessage] = useState('');
  const choose = async (rhythm: (typeof TEND_CHOICES)[number]['rhythm'], label: string) => {
    await saveRecord(entries, bathTendRecord(mix, rhythm, existing));
    setMessage(`${label}: it is in To tend now.`);
  };
  return (
    <Card>
      <SectionLabel>Make it a rhythm</SectionLabel>
      <Body muted>{existing?.rhythm ? `In To tend: ${rhythmLabel(existing.rhythm).toLowerCase()}.` : 'A reminder in To tend for when this bath is due, so it becomes part of your month.'}</Body>
      <Chips label="Make it a rhythm">
        {TEND_CHOICES.map((c) => (
          <Chip key={c.label} label={c.label} selected={!!existing?.rhythm && JSON.stringify(existing.rhythm) === JSON.stringify(c.rhythm)} onPress={() => void choose(c.rhythm, c.label)} />
        ))}
      </Chips>
      {!!message && <Body muted>{message}</Body>}
      <Button label="Open To tend" variant="text" onPress={go('/today/tend')} />
    </Card>
  );
}

/** Mark a bath done in To tend if the mix has a rhythm there. */
export function useMarkBathTended() {
  const { entries } = useTendRecords();
  return async (mixId: string, how: string[], note: string) => {
    const e = entries.find((x) => x.record.key === tendKeyForMix(mixId));
    if (e) await saveRecord(entries, recordDone(e.record, new Date(), how, note));
  };
}

export const timingHref = (mix: Pick<BathMix, 'intent' | 'title'>) => `/rituals/craft/cosmic/timing?intent=${encodeURIComponent(mix.intent)}&title=${encodeURIComponent(mix.title)}`;


/** On a Library herb, stone or oil page: the bath mixes that use it. */
export function BathMixesFor({ entry }: { entry: { name: string; type?: string; traditionalRef?: string | null } }) {
  const mixes = mixesUsing({ name: entry.name, ref: entry.traditionalRef ?? null });
  if (!mixes.length || !/herb|crystal|stone|oil|flower/i.test(entry.type ?? 'herb')) return null;
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>Used in these bath mixes</SectionLabel>
      <List>
        {mixes.map((m, i) => (
          <Row key={m.id} icon="altar" title={m.title} detail={m.intention} last={i === mixes.length - 1} onPress={go(mixHref(m.id))} />
        ))}
      </List>
    </View>
  );
}
