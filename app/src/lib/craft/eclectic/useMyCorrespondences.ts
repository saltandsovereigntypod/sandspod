// My correspondences in the app: the free-form ones (eclectic.correspondences)
// and your My practice in the Living Library, read together; a correspondence
// written about a Library entry is folded into its My practice once, on read
// (lib/craft/eclectic/practiceFold.ts).

import { useEffect, useMemo } from 'react';

import { savePractice, useLibrary } from '../../library';
import { useSession } from '../../session';
import { updateEntry, useCraft } from '../store';
import { CORRESPONDENCES, type MyCorrespondence } from './correspondences';
import { freeForm, practiceAsCorrespondence, practiceInput, practiceWith, toFold } from './practiceFold';

let folding = false;

export function useMyCorrespondences() {
  const { entries, ready } = useCraft<MyCorrespondence>(CORRESPONDENCES);
  const { entries: library, getEntry } = useLibrary();
  const { session } = useSession();
  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!ready || !userId || !library.length || folding) return;
    const pending = toFold(entries, (id) => getEntry(id));
    if (!pending.length) return;
    folding = true;
    void (async () => {
      try {
        // Every correspondence for one entry goes in together, so none is lost.
        const byEntry = new Map<string, typeof pending>();
        for (const p of pending) byEntry.set(p.entry.id, [...(byEntry.get(p.entry.id) ?? []), p]);
        for (const group of byEntry.values()) {
          const entry = group[0].entry;
          const merged = group.reduce((acc, p) => practiceWith(acc, p.item.data), (entry.myPractice ?? {}) as Record<string, unknown>);
          await savePractice({ userId, entry, type: entry.type, name: entry.name, input: practiceInput(merged) });
          for (const p of group) await updateEntry(CORRESPONDENCES, p.item.id, { ...p.item.data, movedTo: entry.id, movedAt: new Date().toISOString() });
        }
      } catch {
        // Tried again next time; nothing is removed.
      } finally {
        folding = false;
      }
    })();
  }, [ready, userId, library.length, entries, getEntry]);

  const practice = useMemo(
    () =>
      library
        .map((e) => ({ id: `practice:${e.id}`, entryId: e.id, data: practiceAsCorrespondence(e) }))
        .filter((x): x is { id: string; entryId: string; data: MyCorrespondence } => !!x.data),
    [library],
  );
  const free = useMemo(() => freeForm(entries), [entries]);
  return { free, practice, all: useMemo(() => [...free, ...practice], [free, practice]), ready };
}
