// Migration on read: scrying sits kept only in `altar.scrying` (when the
// journal couldn't be reached) are copied into the divination log once. The
// old entries stay, marked with the reading's id, so nothing is lost or doubled.

import { useEffect } from 'react';

import { READINGS } from '../../craft/hedge/readings';
import { addEntry, updateEntry, useCraft } from '../../craft/store';
import { SCRYING_COLLECTION, scryingReadingsToAdd } from './scrying';

let moving = false;

export function useScryingIntoReadings() {
  const { entries, ready } = useCraft<unknown>(SCRYING_COLLECTION);
  useEffect(() => {
    if (!ready || moving) return;
    const todo = scryingReadingsToAdd(entries);
    if (!todo.length) return;
    moving = true;
    void (async () => {
      try {
        for (const t of todo) {
          const added = await addEntry(READINGS, t.reading, new Date(t.entry.at));
          await updateEntry(SCRYING_COLLECTION, t.id, { ...t.entry, readingId: added.id });
        }
      } catch {
        // Tried again next time.
      } finally {
        moving = false;
      }
    })();
  }, [entries, ready]);
}
