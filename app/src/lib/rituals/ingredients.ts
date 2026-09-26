// What a ritual or spell gathers. Anything in the Living Library can be added,
// not only what an intention suggests, and so can things typed in by hand:
// those are kept with the ritual as "custom" ingredients, as the website's
// apothecary does, and are never linked to a Library entry.

import { normalizeName, searchLibrary } from '../library/model.ts';
import type { LibraryEntry } from '../library/types.ts';
import type { Ingredient } from './types.ts';

const CUSTOM = 'custom:';

export const isCustom = (item: Pick<Ingredient, 'ref'>) => item.ref.startsWith(CUSTOM);

/** Something of your own, typed in. Blank names give null. */
export function customIngredient(name: string): Ingredient | null {
  const clean = name.trim().replace(/\s+/g, ' ');
  if (!clean) return null;
  return { ref: `${CUSTOM}${normalizeName(clean) || clean.toLowerCase()}`, name: clean, type: 'custom' };
}

/** A Living Library entry as an ingredient, referenced the way the website does. */
export function ingredientFromEntry(entry: LibraryEntry): Ingredient {
  return { ref: entry.traditionalRef ?? entry.practiceEntityIds[0] ?? entry.id, name: entry.name, type: entry.type };
}

/** The Library entry an ingredient points at, if it's in the Library. */
export function entryForIngredient(entries: LibraryEntry[], ref: string): LibraryEntry | null {
  if (ref.startsWith(CUSTOM)) return null;
  return entries.find((entry) => entry.traditionalRef === ref || entry.practiceEntityIds.includes(ref) || entry.id === ref) ?? null;
}

export const samePick = (a: Ingredient, b: Ingredient) =>
  a.ref === b.ref || (isCustom(a) && isCustom(b) && normalizeName(a.name) === normalizeName(b.name));

/** Add the item, or take it away if it's already there. */
export function togglePick(list: Ingredient[], item: Ingredient): Ingredient[] {
  return list.some((p) => samePick(p, item)) ? list.filter((p) => !samePick(p, item)) : [...list, item];
}

export type PickerMatches = {
  entries: LibraryEntry[];
  /** Offered when nothing in the Library has exactly this name. */
  custom: Ingredient | null;
};

/** Library entries of every type for a search, plus "add it as your own". */
export function pickerMatches(entries: LibraryEntry[], query: string, limit = 12): PickerMatches {
  const wanted = normalizeName(query);
  if (!wanted) return { entries: [], custom: null };
  const found = searchLibrary(entries, query, { limit });
  const exact = found.some((entry) => normalizeName(entry.name) === wanted);
  return { entries: found, custom: exact ? null : customIngredient(query) };
}
