// When a sit is finished in the app: the To tend things of your own you asked
// to "Count my meditations" are marked done (tend/model.ts meditationDone,
// once a day, never anything you didn't link). The website does the same in
// practice/meditation/meditation.js.

import { listEntriesOnce, updateEntry } from '../craft/store';
import { meditationDone, normalizeRecord, TEND_COLLECTION, type TendRecord } from '../tend/model';

/** Returns how many were marked. */
export async function markTendForSit(at: Date): Promise<number> {
  try {
    const entries = await listEntriesOnce<unknown>(TEND_COLLECTION);
    // The newest copy of each key, as the list reads it (tend/store.ts).
    const records: { id: string; record: TendRecord }[] = [];
    for (const e of [...entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
      const record = normalizeRecord(e.data);
      if (record && !records.some((x) => x.record.key === record.key)) records.push({ id: e.id, record });
    }
    const changed = meditationDone(
      records.map((x) => x.record),
      at,
    );
    for (const record of changed) {
      const entry = records.find((x) => x.record.key === record.key);
      if (entry) await updateEntry<TendRecord>(TEND_COLLECTION, entry.id, record);
    }
    return changed.length;
  } catch {
    return 0;
  }
}
