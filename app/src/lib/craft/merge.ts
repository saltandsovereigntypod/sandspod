// Merging two copies of a practice tool's entries. Pure, so it can be tested.

export type CraftEntry<T> = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  /** The account this copy was last saved to; unset until it reaches the server. */
  syncedTo?: string | null;
  data: T;
};

/** Newest copy of each entry, from two lists. */
export function mergeEntries<T>(local: CraftEntry<T>[], remote: CraftEntry<T>[]): CraftEntry<T>[] {
  const out = new Map<string, CraftEntry<T>>();
  for (const e of [...local, ...remote]) {
    const have = out.get(e.id);
    if (!have || e.updatedAt > have.updatedAt || (e.updatedAt === have.updatedAt && e.syncedTo && !have.syncedTo)) out.set(e.id, e);
  }
  return [...out.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

