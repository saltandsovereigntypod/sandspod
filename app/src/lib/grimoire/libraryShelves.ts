// The Living Library shelves at the end of the Book of Shadows contents, as on
// the website (grimoire/js/app.js renderMyPracticeShelf/renderTraditionalLibraryShelf):
// "My Practice" holds the person's own Library entries, "Traditional Information"
// the built-in Library. Each follows its Living Library setting.

import { hasMyPractice, LIBRARY_TYPES, PRACTICE_TYPES, typeLabel } from '../library/model.ts';
import type { LibraryEntry } from '../library/types.ts';

export type ShelfGroup = { type: string; label: string; entries: LibraryEntry[] };
export type LibraryShelf = { key: 'myPractice' | 'traditional'; title: string; count: number; groups: ShelfGroup[] };

type ShelfSettings = Record<string, unknown> | null | undefined;

const hasTraditional = (entry: LibraryEntry) => !!entry.traditional && Object.keys(entry.traditional).length > 0;

function grouped(entries: LibraryEntry[], types: readonly string[]): ShelfGroup[] {
  return types
    .map((type) => ({
      type,
      label: typeLabel(type),
      entries: entries.filter((entry) => entry.type === type).sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.entries.length > 0);
}

function shelf(key: LibraryShelf['key'], title: string, groups: ShelfGroup[]): LibraryShelf {
  return { key, title, groups, count: groups.reduce((sum, group) => sum + group.entries.length, 0) };
}

/** Shelves to show, in the website's order; a shelf switched off in settings, or empty, is left out. */
export function libraryShelves(entries: LibraryEntry[], settings: ShelfSettings): LibraryShelf[] {
  const shelves: LibraryShelf[] = [];
  if (settings?.library_myPractice_enabled !== false) {
    shelves.push(shelf('myPractice', 'My Practice', grouped(entries.filter(hasMyPractice), PRACTICE_TYPES)));
  }
  if (settings?.library_traditional_enabled !== false) {
    shelves.push(shelf('traditional', 'Traditional Information', grouped(entries.filter(hasTraditional), LIBRARY_TYPES)));
  }
  return shelves.filter((s) => s.count > 0);
}

/** An entry's page inside the Grimoire tab. */
export function grimoireLibraryHref(entry: Pick<LibraryEntry, 'id'>) {
  return { pathname: '/grimoire/library/[entryId]' as const, params: { entryId: entry.id } };
}
