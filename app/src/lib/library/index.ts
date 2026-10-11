// Public Library API for the rest of the app (e.g. ingredient suggestions in
// the Rituals spell builder). Everything here works offline and for guests.
//
//   const { entries } = useLibrary();                 // React, includes My Practice
//   searchLibrary(entries, 'rose', { type: 'herb', limit: 8 });
//   findByName(entries, 'Rosemary');                  // resolve a typed ingredient
//   traditionalEntries();                             // no React, no network
//   libraryHref(entry)                                // open its page in More → Library

import type { LibraryEntry } from './types';

export { clearPractice, savePractice, useLibrary } from './store';
export {
  buildLibrary,
  correspondences,
  entryIntro,
  findByName,
  grimoireShelves,
  hasMyPractice,
  LIBRARY_TYPES,
  searchLibrary,
  traditionalEntries,
  typeLabel,
  typeSingular,
} from './model';
export type { GrimoireShelf, ShelfGroup } from './model';
export type { LibraryEntry, PracticeRow } from './types';

export function libraryHref(entry: Pick<LibraryEntry, 'id'>) {
  return { pathname: '/more/library/[entryId]' as const, params: { entryId: entry.id } };
}

/** The same page, opened inside the Grimoire tab. */
export function grimoireLibraryHref(entry: Pick<LibraryEntry, 'id'>) {
  return { pathname: '/grimoire/library/[entryId]' as const, params: { entryId: entry.id } };
}

/** Add or edit My Practice for an entry, in the Grimoire or in More → Library. */
export function grimoirePracticeHref(entry: Pick<LibraryEntry, 'id'>) {
  return { pathname: '/grimoire/practice' as const, params: { entryId: entry.id } };
}
export function libraryPracticeHref(entry: Pick<LibraryEntry, 'id'>) {
  return { pathname: '/more/library/practice' as const, params: { entryId: entry.id } };
}

/** The same pages, opened inside the Today tab (from the day's correspondences). */
export function todayLibraryHref(entry: Pick<LibraryEntry, 'id'>) {
  return { pathname: '/today/library/[entryId]' as const, params: { entryId: entry.id } };
}
export function todayPracticeHref(entry: Pick<LibraryEntry, 'id'>) {
  return { pathname: '/today/practice' as const, params: { entryId: entry.id } };
}

/** The same pages, opened inside the Altar tab (from a selected object's About sheet). */
export function altarLibraryHref(entry: Pick<LibraryEntry, 'id'>) {
  return { pathname: '/altar/library/[entryId]' as const, params: { entryId: entry.id } };
}
export function altarPracticeHref(entry: Pick<LibraryEntry, 'id'>) {
  return { pathname: '/altar/practice' as const, params: { entryId: entry.id } };
}
