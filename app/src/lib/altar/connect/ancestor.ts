// The ancestor shrine: one of your dead from Hedge → Ancestors set on the
// altar as a memorial candle with their name. The website has no picture
// frame, so a candle (which it already draws, lights and burns) stands for
// them; which person it is lives in `livingState.app.ancestor`. Pure, so it
// can be tested.

import { builtInCabinet, objectFromForm } from '../cabinet.ts';
import { appStateOf, setAppState } from '../livingState.ts';
import type { SavedObject } from '../types.ts';
import {
  anniversaryWords,
  candleDraft,
  formatPartial,
  lifespan,
  nextOccurrence,
  normalizeAncestor,
  type Ancestor,
  type AncestorEntry,
} from '../../craft/hedge/ancestors.ts';
import { startOfDay } from '../../calendar.ts';
import type { TemplateDraft } from '../../rituals/types.ts';

export type AncestorLink = { id: string; name: string };

/** The kinds of memorial candle offered, by cabinet form id. */
export const MEMORIAL_FORMS: { form: string; label: string; hint: string }[] = [
  { form: 'tea-light', label: 'Tea light', hint: 'A short evening flame, about four hours.' },
  { form: 'vigil', label: 'Vigil candle', hint: 'A glass candle that keeps watch for days.' },
  { form: 'taper', label: 'Taper', hint: 'A tall, plain candle, about eight hours.' },
  { form: 'pillar', label: 'Pillar', hint: 'A steady candle to light again and again.' },
];

/** Colours offered for a memorial candle; white first. */
export const MEMORIAL_COLORS = ['white', 'black', 'purple', 'blue', 'silver', 'gold', 'pink', 'green', 'red'];

export const ancestorOf = (object: SavedObject | null | undefined): AncestorLink | null => {
  if (!object) return null;
  const raw = appStateOf(object).ancestor as Partial<AncestorLink> | undefined;
  return raw && typeof raw.id === 'string' && raw.id ? { id: raw.id, name: String(raw.name || '') } : null;
};

export const isMemorial = (object: SavedObject | null | undefined) => !!ancestorOf(object);

/** The label the candle carries on both app and website. */
export function memorialLabel(name: string): string {
  const who = name.trim() || 'one I remember';
  return `Candle for ${who}`;
}

/**
 * A memorial candle for one ancestor, placed in the middle of the altar's
 * surface. Falls back to a white tea light when the chosen colour or form has
 * no picture.
 */
export function memorialObject(
  entry: AncestorEntry,
  existing: SavedObject[],
  now: string,
  choice: { color?: string; form?: string } = {},
  center: { cx: number; cy: number } = { cx: 0.5, cy: 0.62 },
): SavedObject {
  const person = normalizeAncestor(entry.data);
  const color = choice.color && MEMORIAL_COLORS.includes(choice.color) ? choice.color : 'white';
  const formId = choice.form && MEMORIAL_FORMS.some((f) => f.form === choice.form) ? choice.form : 'tea-light';
  const pick = (c: string, f: string) => {
    const item = builtInCabinet.find((i) => i.id === `candles:${c}-candle`);
    const form = item?.forms.find((x) => x.form === f && !!x.image);
    return item && form ? { item, form } : null;
  };
  const found = pick(color, formId) ?? pick('white', formId) ?? pick('white', 'tea-light') ?? pick('white', 'vigil');
  if (!found) throw new Error('No candle artwork to place.');
  const name = person.name.trim();
  const base = objectFromForm(found.item, found.form, existing, now, {}, center);
  const labelled: SavedObject = { ...base, label: memorialLabel(name), plaqueText: name };
  return setAppState(labelled, { ancestor: { id: entry.id, name } }, now, false);
}

/** Keep the candle's name in step with the person's (after it's changed in Hedge). */
export function refreshMemorial(object: SavedObject, entry: AncestorEntry, now: string): SavedObject {
  const link = ancestorOf(object);
  if (!link || link.id !== entry.id) return object;
  const name = normalizeAncestor(entry.data).name.trim();
  if (link.name === name && object.label === memorialLabel(name)) return object;
  return setAppState({ ...object, label: memorialLabel(name), plaqueText: name }, { ancestor: { id: entry.id, name } }, now, false);
}

export type AncestorDayLine = { kind: 'birth' | 'death'; date: Date; inDays: number; words: string; when: string };

export type AncestorPanel = {
  name: string;
  relation: string;
  lifespan: string;
  born: string;
  died: string;
  loved: string;
  memory: string;
  /** Their two days, the nearer first, whenever they next come. */
  days: AncestorDayLine[];
  /** Today is one of their days. */
  today: AncestorDayLine | null;
};

function whenWords(inDays: number): string {
  if (inDays === 0) return 'Today';
  if (inDays === 1) return 'Tomorrow';
  if (inDays < 14) return `In ${inDays} days`;
  const weeks = Math.round(inDays / 7);
  if (inDays < 60) return `In ${weeks} weeks`;
  const months = Math.round(inDays / 30.4);
  return `In ${months} month${months === 1 ? '' : 's'}`;
}

/** What the object panel shows for a memorial candle. */
export function ancestorPanel(entry: AncestorEntry, now: Date): AncestorPanel {
  const a: Ancestor = normalizeAncestor(entry.data);
  const today = startOfDay(now);
  const days: AncestorDayLine[] = [];
  for (const kind of ['birth', 'death'] as const) {
    const d = kind === 'birth' ? a.born : a.died;
    if (!d.month || !d.day) continue;
    const date = nextOccurrence(d.month, d.day, today);
    const inDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);
    const years = d.year ? date.getFullYear() - d.year : null;
    const words = anniversaryWords({ id: entry.id, name: a.name, kind, date, inDays, years });
    days.push({ kind, date, inDays, words: kind === 'birth' && !years ? 'Their birthday' : words, when: whenWords(inDays) });
  }
  days.sort((x, y) => x.inDays - y.inDays);
  return {
    name: a.name.trim() || 'Unnamed',
    relation: a.relation.trim(),
    lifespan: lifespan(a),
    born: formatPartial(a.born),
    died: formatPartial(a.died),
    loved: a.loved.trim(),
    memory: a.memory.trim(),
    days,
    today: days.find((d) => d.inDays === 0) ?? null,
  };
}

/** The Hedge candle rite for them, begun on this altar. */
export function ancestorRite(entry: AncestorEntry, altarId: string | null): TemplateDraft {
  const draft = candleDraft(normalizeAncestor(entry.data));
  return { ...draft, linked_altar_id: altarId };
}

/** Ancestors not yet on this altar first, then the rest, each by name. */
export function shrineChoices(entries: AncestorEntry[], objects: SavedObject[]): { entry: AncestorEntry; placed: boolean }[] {
  const placed = new Set(objects.map((o) => ancestorOf(o)?.id).filter(Boolean));
  return entries
    .map((entry) => ({ entry, placed: placed.has(entry.id) }))
    .sort((a, b) => Number(a.placed) - Number(b.placed) || normalizeAncestor(a.entry.data).name.localeCompare(normalizeAncestor(b.entry.data).name));
}
