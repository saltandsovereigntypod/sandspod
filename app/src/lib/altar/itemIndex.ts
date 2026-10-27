// Everything the altar knows, as one list to search: every form of every
// thing in the cabinet (candles by colour and form, herbs, crystals,
// offerings, seasonal and festival things, deities, tools, frames), your own
// cabinet items, and the coven's petitions. The ITEMS picker (coven ritual
// steps) and the cabinet's search bar both search it, in the app and on the
// website (js/core/altar.js). Pure, so it can be tested.

import { builtInCabinet, cabinetSearchAliases, formImage, formObjectLabel, shortLabel } from './cabinet.ts';
import type { CabinetForm, CabinetItem } from './types.ts';
import { searchEntries, type PickEntry } from '../covens/picker.ts';
import type { StepItem } from './stepItems.ts';

// What a step keeps of an item lives in stepItems.ts (light, for the coven pages); kept here too.
export { cleanStepItems, stepCandle, type StepItem } from './stepItems.ts';

/** One thing found: which cabinet item and form it is, so it can be placed. */
export type ItemEntry = PickEntry & {
  category: string;
  itemId: string;
  form?: string;
  color?: string;
  /** Your own cabinet item, or a petition, rather than the cabinet's own. */
  source: 'cabinet' | 'own' | 'petition';
};


const CATEGORY_WORDS: Record<string, string> = {
  candles: 'Candle',
  herbs: 'Herb',
  crystals: 'Crystal',
  tools: 'Tool',
  deities: 'Deity',
  vessels: 'Vessel',
  natural: 'Natural find',
  seasonal: 'Seasonal',
  plants: 'Plant',
  offerings: 'Offering',
  petitions: 'Petition',
};

export const categoryWord = (category: string) => CATEGORY_WORDS[category] ?? 'Altar item';

/** A picture path as the website serves it ("../assets/…" becomes "/assets/…"). */
export const sitePicture = (image: string) => String(image || '').replace(/^(\.\.\/)+/, '/');

function formEntries(item: CabinetItem, overrides: Record<string, string>, source: ItemEntry['source']): ItemEntry[] {
  const forms = item.forms.filter((f) => f.image || source === 'own');
  const aliases = cabinetSearchAliases(item);
  return forms.map((form: CabinetForm) => ({
    key: `${item.id}|${form.form || form.label}`,
    label: forms.length > 1 ? shortLabel(formObjectLabel(item, form)) : item.name,
    detail: source === 'own' ? `${categoryWord(String(item.category))} · yours` : categoryWord(String(item.category)),
    keywords: [...aliases, String(item.category), ...(item.festivals ?? []).map((f) => f.split('/').pop() ?? ''), ...(item.sabbats ?? [])],
    image: sitePicture(formImage(item, form, overrides)),
    group: String(item.category),
    category: String(item.category),
    itemId: item.id,
    form: form.form,
    color: form.color,
    source,
  }));
}

/** The whole index: the cabinet's things, your own, and the coven's open petitions. */
export function itemIndex(options: { own?: CabinetItem[]; overrides?: Record<string, string>; petitions?: { id: string; title: string }[]; cabinet?: CabinetItem[] } = {}): ItemEntry[] {
  const overrides = options.overrides ?? {};
  const own = (options.own ?? []).flatMap((item) => formEntries(item, overrides, 'own'));
  const built = (options.cabinet ?? builtInCabinet).filter((item) => item.category !== 'backgrounds').flatMap((item) => formEntries(item, overrides, 'cabinet'));
  const petitions: ItemEntry[] = (options.petitions ?? []).map((p) => ({
    key: `petition:${p.id}`,
    label: `Petition: ${p.title}`,
    detail: 'The coven’s petition',
    keywords: ['petition', 'prayer', 'ask'],
    group: 'petitions',
    category: 'petitions',
    itemId: `petition:${p.id}`,
    source: 'petition' as const,
  }));
  return [...own, ...built, ...petitions];
}

/** Some things to suggest before anything is typed, for an action (stepActions.ts suggestItems), or a few altar staples. */
export function itemSuggestions(entries: ItemEntry[], queries: string[] = ['white candle', 'salt', 'incense', 'bread']): string[] {
  const out: string[] = [];
  for (const q of queries) {
    const found = searchEntries(entries, q, { limit: 1, picked: out })[0];
    if (found) out.push(found.key);
  }
  return out;
}

/** Search the index (the best matches first; an empty search shows the suggestions). */
export function searchItems(entries: ItemEntry[], query: string, options: { limit?: number; picked?: string[]; suggestions?: string[]; categories?: string[] } = {}): ItemEntry[] {
  const pool = options.categories?.length ? entries.filter((e) => options.categories!.includes(e.category)) : entries;
  return searchEntries(pool, query, options) as ItemEntry[];
}

/** An entry as a step keeps it. */
export function stepItemOf(entry: ItemEntry): StepItem {
  const item: StepItem = { key: entry.key, name: entry.label, image: entry.image ?? '', category: entry.category };
  if (entry.color) item.color = entry.color;
  if (entry.form) item.form = entry.form;
  return item;
}

/** The cabinet item and form an entry or a step's item stands for (for placing it). */
export function cabinetFormOf(key: string, cabinet: CabinetItem[] = builtInCabinet): { item: CabinetItem; form: CabinetForm } | null {
  const [itemId, formKey] = key.split('|');
  const item = cabinet.find((i) => i.id === itemId);
  const form = item?.forms.find((f) => (f.form || f.label) === formKey) ?? item?.forms[0];
  return item && form ? { item, form } : null;
}
