// "Did it work?" for the things you make in My Apothecary: spell jars,
// sachets, poppets, oils, herb mixes, incense and sprays. The look-back rides
// on the item's own row, in apothecary_items.metadata.lookBack, in exactly the
// shape a journal entry keeps in user_rituals.metadata.lookBack (lookBack.ts),
// so the website and the app read and write the same thing with no new table.
// Every other part of the metadata is kept.
//
// An item is looked at as if it were a journal entry (its name, intention,
// the day it was made, and its herbs, stones and candles), so the same
// defaults by intention, the same questions and What works for you all apply.
// Pure, so it can be tested; the website has it in js/core/lookback.js,
// rituals.js and today.js.

import {
  answerLookBack,
  chooseLookBack,
  lookBackChoices,
  newLookBack,
  readLookBack,
  reopenLookBack,
  suggestedWhen,
  type CheckIn,
  type LookBack,
  type LookBackChoice,
  type LookBackWhen,
} from '../rituals/lookBack.ts';
import { localDateKey } from '../rituals/lifecycle.ts';
import type { JournalRow } from '../rituals/types.ts';

/** What an item needs to be looked back on: the app's ApothecaryItem and the website's normalized item both fit. */
export type ApothecaryLike = {
  id: string;
  name: string;
  type?: string;
  typeLabel?: string;
  intention?: string | null;
  notes?: string | null;
  ingredients?: unknown[] | null;
  createdAt?: string | null;
  metadata?: Record<string, unknown> | null;
};

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const unslug = (v: unknown) => str(v).replaceAll('-', ' ').trim();

/** The item's metadata as a fresh object (never null). */
export function itemMetadata(item: Pick<ApothecaryLike, 'metadata'>): Record<string, unknown> {
  const m = item.metadata;
  return m && typeof m === 'object' && !Array.isArray(m) ? { ...m } : {};
}

/** The day it was made, "YYYY-MM-DD", or null while it's still being made. */
function madeOn(item: ApothecaryLike): string | null {
  const stamp = str(item.createdAt);
  const date = stamp ? new Date(stamp) : null;
  return date && !Number.isNaN(date.getTime()) ? localDateKey(date) : null;
}

/**
 * Its herbs, stones, oils and candles as the spell builder records
 * ingredients ({ name, type }), for What works for you (entryMaterials).
 */
export function itemMaterials(item: Pick<ApothecaryLike, 'ingredients'>): { name: string; type: string }[] {
  const out: { name: string; type: string }[] = [];
  for (const raw of Array.isArray(item.ingredients) ? item.ingredients : []) {
    if (typeof raw === 'string') continue;
    if (!raw || typeof raw !== 'object') continue;
    const i = raw as Record<string, unknown>;
    const label = str(i.label || i.name || i.libraryName).trim();
    const type = str(i.type).toLowerCase();
    if (str(i.herb) || type === 'herb') out.push({ name: unslug(i.herb) || label, type: 'herb' });
    else if (str(i.crystal) || type === 'crystal') out.push({ name: unslug(i.crystal) || label, type: 'crystal' });
    else if (str(i.color) || type === 'candle') out.push({ name: str(i.color) ? `${str(i.color)} candle` : label, type: 'candle' });
    else if (type === 'oil') out.push({ name: label, type: 'oil' });
  }
  return out.filter((m) => m.name);
}

/** The item looked at as a journal entry, so lookBack.ts and whatWorks.ts read it as they read the journal. */
export function apothecaryWorking(item: ApothecaryLike): JournalRow {
  const day = madeOn(item);
  return {
    id: item.id,
    user_id: null,
    title: item.name || item.typeLabel || 'Your working',
    intention: item.intention || null,
    notes: item.notes || null,
    moon_phase: null,
    linked_altar: null,
    tags: [],
    ritual_date: day,
    source: 'manual',
    template_id: null,
    session_id: null,
    linked_altar_id: null,
    grimoire_page_id: null,
    started_at: null,
    ended_at: null,
    duration_seconds: null,
    time_of_day: null,
    day_of_week: null,
    preparation: null,
    what_happened_during: null,
    what_happened_after: null,
    feelings_before: null,
    feelings_during: null,
    feelings_after: null,
    signs_and_symbols: null,
    dreams_and_follow_up: null,
    results: null,
    changes_for_next_time: null,
    altar_snapshot: {},
    context_snapshot: {},
    metadata: { ...itemMetadata(item), ingredients: itemMaterials(item) },
    created_at: str(item.createdAt) || null,
  };
}

/** The item's look-back, or null when it has none. */
export const itemLookBack = (item: ApothecaryLike): LookBack | null => readLookBack({ metadata: itemMetadata(item) });

/** The item with this look-back (or none); every other part of its metadata kept. */
export function withItemLookBack<T extends ApothecaryLike>(item: T, lookBack: LookBack | null): T {
  const metadata = itemMetadata(item);
  if (lookBack) metadata.lookBack = lookBack;
  else delete metadata.lookBack;
  return { ...item, metadata };
}

/** Carry a look-back worked out on apothecaryWorking(item) back onto the item. */
export function itemFromWorking<T extends ApothecaryLike>(item: T, working: JournalRow): T {
  const raw = working.metadata?.lookBack;
  const metadata = itemMetadata(item);
  if (raw && typeof raw === 'object') metadata.lookBack = raw;
  else delete metadata.lookBack;
  return { ...item, metadata };
}

/** The look-back that suits it by its intention (or the moon it was made under). */
export const itemSuggestedWhen = (item: ApothecaryLike) => suggestedWhen(apothecaryWorking(item));

/** The choices for when to look back, the one that suits it first. */
export const itemLookBackChoices = (item: ApothecaryLike, now: Date, from?: Date): LookBackChoice[] =>
  from ? lookBackChoices(apothecaryWorking(item), now, from) : lookBackChoices(apothecaryWorking(item), now);

/** A look-back set as it's made: 'suggested' follows its intention, null sets none. */
export function startItemLookBack<T extends ApothecaryLike>(item: T, pick: LookBackWhen | 'suggested' | null, now: Date, custom = ''): T {
  // An answer is never thrown away.
  if (!pick) return itemLookBack(item)?.answer ? item : withItemLookBack(item, null);
  const working = apothecaryWorking(item);
  const when = pick === 'suggested' ? suggestedWhen(working) : pick;
  const current = itemLookBack(item);
  return withItemLookBack(item, { ...(current ?? {}), ...newLookBack(working, now, when, custom) });
}

/** Change when to look back, keeping any answer (chooseLookBack). */
export const chooseItemLookBack = <T extends ApothecaryLike>(item: T, when: LookBackWhen | null, now: Date, custom = ''): T =>
  itemFromWorking(item, chooseLookBack(apothecaryWorking(item), when, now, custom));

/** Answer "Did it work?", or keep waiting (answerLookBack). */
export const answerItemLookBack = <T extends ApothecaryLike>(item: T, checkIn: CheckIn, now: Date): T =>
  itemFromWorking(item, answerLookBack(apothecaryWorking(item), checkIn, now));

/** Take back an answer, so it can be given again. */
export const reopenItemLookBack = <T extends ApothecaryLike>(item: T, now: Date): T => itemFromWorking(item, reopenLookBack(apothecaryWorking(item), now));

/** Its look-back day has come and it isn't answered yet. */
export function isItemDue(item: ApothecaryLike, now: Date): boolean {
  const lookBack = itemLookBack(item);
  return !!lookBack && !lookBack.answer && !!lookBack.date && lookBack.date <= localDateKey(now);
}

/** Items whose look-back day has come, oldest due first. */
export function dueItems<T extends ApothecaryLike>(items: T[], now: Date): T[] {
  return items.filter((i) => isItemDue(i, now)).sort((a, b) => (itemLookBack(a)!.date < itemLookBack(b)!.date ? -1 : 1));
}

/** Items still waiting for their look-back day, soonest first. */
export function waitingItems<T extends ApothecaryLike>(items: T[], now: Date): T[] {
  const today = localDateKey(now);
  return items
    .filter((i) => {
      const lookBack = itemLookBack(i);
      return !!lookBack && !lookBack.answer && !!lookBack.date && lookBack.date > today;
    })
    .sort((a, b) => (itemLookBack(a)!.date < itemLookBack(b)!.date ? -1 : 1));
}

/** Items already looked back on, latest answer first. */
export function answeredItems<T extends ApothecaryLike>(items: T[]): T[] {
  return items
    .filter((i) => !!itemLookBack(i)?.answer)
    .sort((a, b) => ((itemLookBack(a)!.outcomeDate ?? '') < (itemLookBack(b)!.outcomeDate ?? '') ? 1 : -1));
}

/** Where an item's look-back opens in the app. */
export const apothecaryRoute = (id: string) => `/rituals/apothecary/${id}`;

/** The notification for an item's look-back day, or null when there's nothing to ask. */
export function itemLookBackReminder(item: ApothecaryLike): { key: string; id: string; date: string; title: string; body: string; url: string } | null {
  const lookBack = itemLookBack(item);
  if (!lookBack || lookBack.answer || !lookBack.date) return null;
  const kind = (item.typeLabel || 'working').toLowerCase();
  return {
    key: `lookback:apothecary:${item.id}:${lookBack.date}`,
    id: item.id,
    date: lookBack.date,
    title: 'Did it work?',
    body: `Time to look back on your ${kind}, “${item.name || 'your working'}”. Did it work, partly, or not yet?`,
    url: apothecaryRoute(item.id),
  };
}

/** Items with a look-back, as journal entries, to count in What works for you beside the journal. */
export const lookBackWorkings = (items: ApothecaryLike[]): JournalRow[] => items.filter((i) => !!itemLookBack(i)).map(apothecaryWorking);
