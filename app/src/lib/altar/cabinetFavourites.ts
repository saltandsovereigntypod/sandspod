// Favourite cabinet items. Kept in the user's settings under `cabinet_favourites`
// as a JSON string of item ids (settings hold strings and booleans), so the app
// and the website share them through the account; guests keep them on the device.
// An item's id is the same on both: "tools:black-salt-circle", "custom:<uuid>".

export const CABINET_FAVOURITES_SETTING = 'cabinet_favourites';
export const FAVOURITES_CATEGORY = 'favourites';

/** The id a favourite is kept under: the website's cabinetItemId (category:slug of name), or a custom item's own id. */
export function favouriteKey(item: { id: string; category?: string; name?: string }): string {
  if (item.id.startsWith('custom:') || !item.category || !item.name) return item.id;
  return `${item.category}:${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

/** The saved ids, in the order they were added: a JSON string or an array; anything else is none. */
export function readFavourites(raw: unknown): string[] {
  let list: unknown = raw;
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw);
    } catch {
      list = [];
    }
  }
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  for (const id of list) if (typeof id === 'string' && id && !seen.has(id)) seen.add(id);
  return [...seen];
}

export const encodeFavourites = (ids: string[]): string => JSON.stringify(readFavourites(ids));

/** Adds the id at the end, or takes it out when it is already there. */
export function toggleFavourite(ids: string[], id: string): string[] {
  const list = readFavourites(ids);
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** The items for the saved ids in the order added; ids with no item (removed since) and backgrounds are dropped. */
export function favouriteItems<T extends { id: string; background?: unknown; category?: string; name?: string }>(items: T[], ids: string[]): T[] {
  const byId = new Map<string, T>();
  for (const item of items) if (!item.background && !byId.has(favouriteKey(item))) byId.set(favouriteKey(item), item);
  return readFavourites(ids).flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
}
