// Shared pieces of the Hearth & land screens (Practice → Craft → Hearth &
// land): the entries they read, a day's moon, Wheel and holy days, a picker
// for Library herbs and trees, the first rule of foraging, and the links a
// Library herb page gets into all of it.

import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { pottedRefs } from '../../lib/craft/hearth/potted';
import { useAltars } from '../../lib/altar/store';
import { fullDate } from '../../lib/calendar';
import { herbName, matchHerbs } from '../../lib/craft/green/garden';
import { hemisphereOf, SEASON_PLANTS, localMonths, monthSpan } from '../../lib/craft/green/season';
import { FORAGE_FIRST, forageForHerb, forageSpan, LAND_GROWING, LAND_HARVESTS, normalizePatch, USE_LABELS } from '../../lib/craft/hearth/forage';
import { keepsSouthWheel, LAND_NOTES, LAND_PLACES, normalizeNote, normalizePlace, readDay, type LandNote, type LandPlace, type PottedRef } from '../../lib/craft/hearth/land';
import { allRecipes, RECIPES, recipesForHerb } from '../../lib/craft/hearth/recipes';
import { useCraft, type CraftEntry } from '../../lib/craft/store';
import { holidayChoice } from '../../lib/holidays';
import { usePlace } from '../../lib/location';
import { useMySettings } from '../../lib/settings/store';
import { type } from '../../theme';
import { Body, Card, Chip, Chips, Field, List, Row, SectionLabel, ui } from '../rituals/ui';

export const HEARTH = '/rituals/craft/hearth';
export const go = (href: string) => () => router.push(href as Href);
export const q = (params: Record<string, string | null | undefined>) => {
  const s = Object.entries(params)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&');
  return s ? `?${s}` : '';
};

/** The land journal's places and notes, read. */
export function useLand() {
  const places = useCraft<unknown>(LAND_PLACES);
  const notes = useCraft<unknown>(LAND_NOTES);
  const placeList = useMemo(() => places.entries.map((e) => ({ ...e, data: normalizePlace(e.data) })), [places.entries]);
  const noteList = useMemo(() => notes.entries.map((e) => ({ ...e, data: normalizeNote(e.data) })), [notes.entries]);
  const names = useMemo(() => Object.fromEntries(placeList.map((p) => [p.id, p.data.name])), [placeList]);
  return { places: placeList as CraftEntry<LandPlace>[], notes: noteList as CraftEntry<LandNote>[], names, ready: places.ready && notes.ready };
}

/** Your calendars, and which way the Wheel turns for you. */
export function useDayContext() {
  const { settings } = useMySettings();
  const place = usePlace();
  const choice = useMemo(() => holidayChoice(settings), [settings]);
  const south = keepsSouthWheel(choice, place?.latitude);
  return { choice, south, place, hemisphere: hemisphereOf(place?.latitude) };
}

/** A note's day: the moon that evening, its place on the Wheel and the holy days of your calendars. */
export function DayLine({ on }: { on: string }) {
  const { choice, south } = useDayContext();
  const day = useMemo(() => readDay(on, choice, south), [on, choice, south]);
  return (
    <View style={ui.gapSmall}>
      <Body muted>{[fullDate(on), day.moon, day.wheel].filter(Boolean).join(' · ')}</Body>
      {day.holy.length > 0 && <Body muted>{`In your calendars: ${day.holy.map((h) => h.name).join(', ')}`}</Body>}
    </View>
  );
}

/** Your potted plants from every altar you keep, for linking a note to them. */
export function usePotted(): PottedRef[] {
  const { altars } = useAltars();
  return useMemo(() => pottedRefs(altars), [altars]);
}

/** Choose Library herbs and trees by typing; the chosen show as chips to remove. */
export function HerbPicker({ label, value, onChange, single }: { label: string; value: string[]; onChange: (keys: string[]) => void; single?: boolean }) {
  const [typed, setTyped] = useState('');
  const found = matchHerbs(typed, 6).filter((h) => !value.includes(h.key));
  return (
    <View style={ui.gapSmall}>
      <Field label={label} value={typed} onChange={setTyped} placeholder="Elder, hawthorn, oak, nettle…" />
      {found.length > 0 && (
        <Chips>
          {found.map((h) => (
            <Chip
              key={h.key}
              label={`+ ${h.name}`}
              a11yLabel={`Add ${h.name}`}
              onPress={() => {
                onChange(single ? [h.key] : [...value, h.key]);
                setTyped('');
              }}
            />
          ))}
        </Chips>
      )}
      {value.length > 0 && (
        <Chips>
          {value.map((key) => (
            <Chip key={key} label={`${herbName(key) ?? key} ✕`} a11yLabel={`Remove ${herbName(key) ?? key}`} selected onPress={() => onChange(value.filter((k) => k !== key))} />
          ))}
        </Chips>
      )}
    </View>
  );
}

/** The first rule of foraging, on every page that offers wild plants. */
export function ForageFirst() {
  return (
    <Card accent>
      <SectionLabel>Before you gather</SectionLabel>
      <Text style={type.cardTitle}>{FORAGE_FIRST}</Text>
      <Body muted>Take a little, ask permission, and learn the deadly look-alikes first. This app is never a field guide, and it gives no help with fungi.</Body>
      <List>
        <Row icon="grimoire" title="Safety, law and taking with care" detail="Read the whole list" last onPress={go(`${HEARTH}/forage/safety`)} />
      </List>
    </Card>
  );
}


/**
 * On a Library herb or tree's page: when to sow and gather it, how to forage
 * it safely, where it grows for you, your notes of it on the land, and the
 * recipes that use it.
 */
export function HerbHearth({ herb }: { herb: string }) {
  const { hemisphere } = useDayContext();
  const { notes } = useLand();
  const patches = useCraft<unknown>(LAND_GROWING).entries.filter((e) => normalizePatch(e.data).herb === herb);
  const harvests = useCraft<unknown>(LAND_HARVESTS).entries.filter((e) => (e.data as { herb?: string })?.herb === herb);
  const mine = useCraft<unknown>(RECIPES).entries;
  const recipes = useMemo(() => recipesForHerb(herb, allRecipes(mine)), [herb, mine]);
  const forage = forageForHerb(herb);
  const season = SEASON_PLANTS.find((p) => p.key === herb && p.library);
  const seen = notes.filter((n) => n.data.herbs.includes(herb));
  const rows: { title: string; detail: string; href: string }[] = [];
  for (const f of forage) rows.push({ title: `Foraging: ${f.name}`, detail: `${forageSpan(f, hemisphere)} · ${USE_LABELS[f.use]} · look-alikes and care`, href: `${HEARTH}/forage/plant${q({ key: f.key })}` });
  if (season) rows.push({ title: 'In the garden', detail: `Sow ${monthSpan(localMonths(season.sow, hemisphere))} · gather ${monthSpan(localMonths(season.harvest, hemisphere))}`, href: '/rituals/craft/green/season' });
  if (seen.length) rows.push({ title: 'In your land journal', detail: `Noted ${seen.length} ${seen.length === 1 ? 'time' : 'times'}, last ${fullDate(seen.map((n) => n.data.on).sort().pop()!)}`, href: `${HEARTH}/land${q({ herb })}` });
  if (patches.length || harvests.length) rows.push({ title: 'Where it grows for you', detail: [patches.length ? `${patches.length} ${patches.length === 1 ? 'patch' : 'patches'}` : '', harvests.length ? `${harvests.length} ${harvests.length === 1 ? 'harvest' : 'harvests'}` : ''].filter(Boolean).join(' · '), href: `${HEARTH}/forage` });
  for (const r of recipes.slice(0, 4)) rows.push({ title: `Recipe: ${r.recipe.title}`, detail: 'Kitchen witchery', href: `${HEARTH}/recipes/recipe${q({ id: r.id })}` });
  rows.push({ title: 'Note it on the land', detail: 'Seen it in bloom, in fruit or growing somewhere?', href: `${HEARTH}/land/note-edit${q({ herb })}` });
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>Hearth & land</SectionLabel>
      <List>
        {rows.map((r, i) => (
          <Row key={r.title} icon={i === rows.length - 1 ? 'grimoire' : 'wheel'} title={r.title} detail={r.detail} last={i === rows.length - 1} onPress={go(r.href)} />
        ))}
      </List>
    </View>
  );
}
