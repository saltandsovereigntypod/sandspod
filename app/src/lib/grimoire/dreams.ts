// Dreams as a section of the Grimoire. The dream journal itself is the Hedge
// practice's (craft_entries, collection `hedge.dreams`, logic in
// craft/hedge/dreams.ts); here is where it sits among the Grimoire's built-in
// shelves, its routes, and how it shows in the Grimoire's search. The
// website's Book of Shadows follows the same order (grimoire/js/ui/dreams.js).
// Pure, so it can be tested.

import { searchDreams, sortDreams, type DreamEntry } from '../craft/hedge/dreams.ts';

/** The Dreams section is built in, like My Practice: never a row in grimoire_sections. */
export const DREAMS_SHELF = { key: 'dreams', title: 'Dreams' } as const;

/** The Grimoire's Dreams screens. */
export const DREAM_ROUTES = {
  journal: '/grimoire/dreams',
  write: '/grimoire/dreams/edit',
  patterns: '/grimoire/dreams/symbols',
  dream: (id: string) => `/grimoire/dreams/${encodeURIComponent(id)}`,
  edit: (id: string) => `/grimoire/dreams/edit?id=${encodeURIComponent(id)}`,
} as const;

/**
 * Where Dreams goes among the built-in shelves: straight after My Practice
 * (your own writing together), or first when My Practice is turned off.
 * Your own sections and pages keep their saved order after all of these.
 */
export function withDreamsShelf<T extends { key: string }>(shelves: T[], dreams: T): T[] {
  const rest = shelves.filter((s) => s.key !== dreams.key);
  const at = rest.findIndex((s) => s.key === 'myPractice');
  return [...rest.slice(0, at + 1), dreams, ...rest.slice(at + 1)];
}

/** Dreams matching a Grimoire search, newest first; nothing for an empty search. */
export function dreamSearchResults<T extends DreamEntry>(list: T[], query: string, limit = 8): T[] {
  if (!query.trim()) return [];
  return sortDreams(searchDreams(list, query)).slice(0, limit);
}

/** The line under Dreams on the Grimoire's contents: how many, and the last one. */
export function dreamShelfLine(list: DreamEntry[]): string {
  if (!list.length) return 'Write down a dream; the moon it came under is noted for you.';
  const last = sortDreams(list)[0].data;
  return `${list.length} ${list.length === 1 ? 'dream' : 'dreams'} · last: ${last.title || 'Untitled dream'}, under a ${last.moonPhase}`;
}
