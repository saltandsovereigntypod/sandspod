// My Shelves in the app: the craft collection `shelves.items` (on the phone
// at once and, signed in, synced to craft_entries like the practice tools;
// the website's rituals/shelves/ reads and writes the same), and each
// thing's own record in To tend, kept in step with it.

import { useMemo } from 'react';

import { addEntry, removeEntry, updateEntry, useCraft } from '../craft/store';
import { recordDone, TEND_COLLECTION } from '../tend/model';
import { saveRecord, useTendRecords, type RecordEntry } from '../tend/store';
import { cleanItem, SHELVES_COLLECTION, shelfTendRecord, tendKeyOf, type ShelfEntry, type ShelfItem } from './model';

export function useShelves(): { entries: ShelfEntry[]; ready: boolean } {
  const { entries, ready } = useCraft<unknown>(SHELVES_COLLECTION);
  return useMemo(() => ({ entries: entries.map((e) => ({ id: e.id, createdAt: e.createdAt, item: cleanItem(e.data) })), ready }), [entries, ready]);
}

/** Its To tend record brought in step: made, changed, or taken off the list when tending is off. */
async function syncTend(tend: RecordEntry[], id: string, item: ShelfItem | null) {
  const existing = tend.find((e) => e.record.key === tendKeyOf(id));
  const next = item ? shelfTendRecord(id, item, existing?.record) : null;
  if (next) await saveRecord(tend, next);
  else if (existing) await removeEntry(TEND_COLLECTION, existing.id);
}

/** Add, change and remove things, keeping To tend in step. */
export function useShelfActions() {
  const { entries: tend, records } = useTendRecords();
  return useMemo(
    () => ({
      records,
      recordOf: (id: string) => records.find((r) => r.key === tendKeyOf(id)) ?? null,
      async add(item: ShelfItem): Promise<string> {
        const entry = await addEntry<ShelfItem>(SHELVES_COLLECTION, item);
        await syncTend(tend, entry.id, item);
        return entry.id;
      },
      async save(id: string, item: ShelfItem) {
        await updateEntry<ShelfItem>(SHELVES_COLLECTION, id, item);
        await syncTend(tend, id, item);
      },
      /** Tended just now (cleansed, dusted, checked), in its To tend history. */
      async tended(id: string, how: string[] = []) {
        const existing = tend.find((e) => e.record.key === tendKeyOf(id));
        if (existing) await saveRecord(tend, recordDone(existing.record, new Date(), how));
      },
      async remove(id: string) {
        await removeEntry(SHELVES_COLLECTION, id);
        await syncTend(tend, id, null);
      },
    }),
    [tend, records],
  );
}
