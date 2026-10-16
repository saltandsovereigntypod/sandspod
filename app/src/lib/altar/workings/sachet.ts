// Sachets and charm bags: filled with herbs, stones and small things, tied
// with a number of knots, carried, and fed on their planet's day. The bag is
// an apothecary working of type "sachet" (the website draws a sachet and shows
// its purpose and where it's kept); fillings, knots and feedings live in
// livingState.app.sachet.

import type { LibraryEntry } from '../../library/types.ts';
import { apothecaryObject, apothecaryType, DEFAULT_LIVING, type ApothecaryItem, type Ingredient } from '../apothecary.ts';
import { readLivingState } from '../livingState.ts';
import {
  correspondenceOf,
  dayKey,
  entryByName,
  PLANET_DAY,
  PLANETS,
  planetPossessive,
  tally,
  WEEKDAY_NAMES,
  type ElementOrSpirit,
  type Planet,
} from '../reading/correspondence.ts';
import type { SavedObject } from '../types.ts';
import { newId } from '../uid.ts';
import { appPart, withAppPart } from './appState.ts';
import { ingredientColor } from './colors.ts';

export type FillingKind = 'herb' | 'stone' | 'item';

export type Filling = {
  label: string;
  kind: FillingKind;
  entryId?: string;
  herb?: string;
  crystal?: string;
  element?: ElementOrSpirit | null;
  planet?: Planet | null;
  color: string;
};

export type Feeding = { at: string; with: string };

/** What livingState.app.sachet holds. */
export type SachetState = {
  kind: 'sachet';
  purpose: string;
  fillings: Filling[];
  knots: number;
  carried: boolean;
  /** Whose day it's fed on. */
  planet: Planet;
  feedings: Feeding[];
  madeAt: string;
};

export type SachetDraft = { name: string; purpose: string; fillings: Filling[]; knots: number; carried: boolean; planet: Planet | null };

export const KNOT_CHOICES = [1, 3, 5, 7, 9] as const;
/** What each traditional knot count is said to hold. */
export const KNOT_MEANING: Record<number, string> = {
  1: 'one knot: the spell begins',
  3: 'three knots: body, mind and spirit',
  5: 'five knots: the elements and spirit',
  7: 'seven knots: the seven planets',
  9: 'nine knots: three times three, the old binding number',
};

/** What a sachet is fed with, traditionally: a drop of oil, a breath, a pinch of the same herb. */
export const FEEDING_CHOICES = ['A drop of oil', 'A breath and a word', 'A pinch of the same herb', 'A little whiskey or rum', 'Moonlight'];

export const emptySachet = (purpose = ''): SachetDraft => ({ name: '', purpose, fillings: [], knots: 3, carried: true, planet: null });

export function filling(label: string, kind: FillingKind, extra: { herb?: string; crystal?: string } = {}, entries?: LibraryEntry[] | null): Filling {
  const clean = label.replace(/\s+/g, ' ').trim();
  const entry = kind === 'item' && !extra.herb && !extra.crystal ? entryByName(clean, entries) : entryByName(extra.herb || extra.crystal || clean, entries, kind === 'stone' ? 'crystal' : kind === 'herb' ? 'herb' : undefined);
  const c = correspondenceOf(entry);
  const result: Filling = { label: clean, kind, color: ingredientColor(extra.crystal || extra.herb || clean, c.element) };
  if (entry) result.entryId = entry.id;
  if (c.element) result.element = c.element;
  if (c.planet) result.planet = c.planet;
  if (extra.herb) result.herb = extra.herb;
  if (extra.crystal) result.crystal = extra.crystal;
  return result;
}

export function addFilling(draft: SachetDraft, item: Filling): SachetDraft {
  if (!item.label || draft.fillings.length >= 13) return draft;
  if (draft.fillings.some((f) => f.label.toLowerCase() === item.label.toLowerCase())) return draft;
  return { ...draft, fillings: [...draft.fillings, item] };
}

export const removeFilling = (draft: SachetDraft, index: number): SachetDraft => ({ ...draft, fillings: draft.fillings.filter((_, i) => i !== index) });

/** The planet whose day suits the bag: the one its fillings share most, else the Moon. */
export function sachetPlanet(fillings: Pick<Filling, 'planet'>[]): Planet {
  return tally(fillings.map((f) => f.planet ?? null))[0]?.key ?? 'Moon';
}

/** Why it can't be tied yet, or null. */
export function sachetProblem(draft: SachetDraft): string | null {
  if (!draft.purpose.trim()) return 'Say what the bag is for first.';
  if (!draft.fillings.length) return 'Put at least one thing in it.';
  return null;
}

/**
 * The next day to feed it: its planet's weekday, today if that's today and it
 * hasn't been fed yet today, otherwise the next one. A local date at noon.
 */
export function nextFeeding(planet: Planet, from: Date, feedings: Feeding[] = []): Date {
  const want = PLANET_DAY[planet];
  const fedToday = feedings.some((f) => dayKey(f.at) === dayKey(from));
  for (let add = fedToday ? 1 : 0; add < 8; add += 1) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + add, 12);
    if (d.getDay() === want) return d;
  }
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + 7, 12);
}

/** Whether today is its feeding day and it hasn't been fed. */
export function feedingDue(state: Pick<SachetState, 'planet' | 'feedings'>, now: Date): boolean {
  return dayKey(nextFeeding(state.planet, now, state.feedings)) === dayKey(now);
}

/** "Fed on Mondays, the Moon’s day. Next: today." */
export function feedingLine(state: Pick<SachetState, 'planet' | 'feedings'>, now: Date): string {
  const next = nextFeeding(state.planet, now, state.feedings);
  const day = WEEKDAY_NAMES[PLANET_DAY[state.planet]];
  const when = dayKey(next) === dayKey(now) ? 'today' : next.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  return `Fed on ${day}s, ${planetPossessive(state.planet)} day. Next: ${when}.`;
}

const fillingIngredient = (f: Filling): Ingredient => {
  const i: Ingredient = { label: f.label, libraryName: f.label, type: f.kind === 'stone' ? 'crystal' : f.kind === 'herb' ? 'herb' : 'item', amount: '' };
  if (f.herb) i.herb = f.herb;
  if (f.crystal) i.crystal = f.crystal;
  return i;
};

/** The bag as a My Apothecary item (type "sachet", with the website's purpose and kept-location details). */
export function sachetItem(draft: SachetDraft, now: string, id: string = newId()): ApothecaryItem {
  const type = apothecaryType('sachet');
  const planet = draft.planet ?? sachetPlanet(draft.fillings);
  return {
    id,
    name: draft.name.trim() || `${draft.purpose.trim() || 'Charm'} bag`,
    type: 'sachet',
    typeLabel: type.label,
    imagePath: type.image,
    intention: draft.purpose.trim(),
    notes: `Tied with ${draft.knots} knot${draft.knots === 1 ? '' : 's'}. Fed on ${WEEKDAY_NAMES[PLANET_DAY[planet]]}s.`,
    details: { sachet_purpose: draft.purpose.trim(), kept_location: draft.carried ? 'Carried with me' : 'On the altar' },
    ingredients: draft.fillings.map(fillingIngredient),
    // Tended weekly, on its day.
    livingState: { ...DEFAULT_LIVING, tending_interval_days: 7 },
    logToGrimoire: false,
    grimoireStatus: '',
    grimoireEntryId: '',
    entityId: '',
    instanceId: '',
    createdAt: now,
    updatedAt: now,
  };
}

/** The tied bag ready to place, with its next feeding as the website's next tending. */
export function sachetObject(
  draft: SachetDraft,
  existing: SavedObject[],
  now: string,
  center?: { cx: number; cy: number },
  /** An id for the new item, or the item as My Apothecary saved it (its id, instance and Library entry are kept). */
  idOrItem?: string | ApothecaryItem,
): { item: ApothecaryItem; object: SavedObject } {
  const item = typeof idOrItem === 'object' ? idOrItem : sachetItem(draft, now, idOrItem);
  const base = apothecaryObject(item, existing, now, center);
  const planet = draft.planet ?? sachetPlanet(draft.fillings);
  const state = readLivingState(base, now);
  const sachet: SachetState = {
    kind: 'sachet',
    purpose: item.intention,
    fillings: draft.fillings,
    knots: draft.knots,
    carried: draft.carried,
    planet,
    feedings: [],
    madeAt: now,
  };
  const object = withAppPart(base, 'sachet', sachet, now, {
    apothecary: {
      ...(state.apothecary as object),
      activationState: `Tied with ${draft.knots} knot${draft.knots === 1 ? '' : 's'}`,
      nextTendingAt: nextFeeding(planet, new Date(now)).toISOString(),
    },
  });
  return { item, object };
}

export function sachetStateOf(object: SavedObject): SachetState | null {
  const s = appPart<SachetState>(object, 'sachet');
  if (!s || !Array.isArray(s.fillings)) return null;
  const planet = (PLANETS as readonly string[]).includes(s.planet) ? s.planet : 'Moon';
  return { ...s, planet, feedings: Array.isArray(s.feedings) ? s.feedings : [], knots: Number(s.knots) || 0 };
}

/** Feed it: the feeding logged and its next feeding day set as the website's next tending. */
export function feedSachet(object: SavedObject, now: string, withWhat = 'A drop of oil'): SavedObject {
  const s = sachetStateOf(object);
  if (!s) return object;
  const feedings = [...s.feedings, { at: now, with: withWhat.trim() || 'A breath and a word' }];
  const state = readLivingState(object, now);
  return withAppPart(object, 'sachet', { ...s, feedings }, now, {
    apothecary: { ...(state.apothecary as object), nextTendingAt: nextFeeding(s.planet, new Date(now), feedings).toISOString() },
  });
}

/** Carry it with you, or set it down on the altar. */
export function setCarried(object: SavedObject, carried: boolean, now: string): SavedObject {
  const s = sachetStateOf(object);
  if (!s) return object;
  return withAppPart(object, 'sachet', { ...s, carried }, now);
}
