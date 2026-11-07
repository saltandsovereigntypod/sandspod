// My stones in the app: the crystals on My Shelves (lib/shelves/stones.ts),
// with the old crystal.stones collection folded in once, on read.

import { useEffect, useMemo } from 'react';

import { STONES } from '../craft/crystal/collections';
import type { Stone } from '../craft/crystal/stones';
import { removeEntry, useCraft } from '../craft/store';
import { cabinetCrystalFor } from '../altar/connect/practice';
import { useShelfActions, useShelves } from './store';
import { myStones, shelfIdOfStone, shelfWithStone, stonesIntoShelves, type StoneEntry } from './stones';

// One fold-in at a time across every screen that shows your stones.
let folding = false;

const pictureOf = (stone: Stone) => {
  const item = cabinetCrystalFor(stone);
  const form = item?.forms.find((f) => f.form === 'tumbled' && !!f.image) ?? item?.forms.find((f) => !!f.image);
  return item && form ? { cabinetKey: `${item.id}|${form.form}`, image: form.image ?? '' } : null;
};

export function useMyStones(): {
  entries: StoneEntry[];
  ready: boolean;
  add: (stone: Stone) => Promise<string>;
  save: (id: string, stone: Stone) => Promise<void>;
  remove: (id: string) => Promise<void>;
} {
  const shelves = useShelves();
  const old = useCraft<Stone>(STONES);
  const actions = useShelfActions();

  useEffect(() => {
    if (!shelves.ready || !old.ready || folding) return;
    const { add, update } = stonesIntoShelves(old.entries, shelves.entries, pictureOf);
    if (!add.length && !update.length) return;
    folding = true;
    void (async () => {
      try {
        for (const u of update) await actions.save(u.id, u.item);
        for (const item of add) await actions.add(item);
      } catch {
        // Tried again next time; nothing is lost, the old stones are kept.
      } finally {
        folding = false;
      }
    })();
  }, [shelves.ready, shelves.entries, old.ready, old.entries, actions]);

  const entries = useMemo(() => myStones(shelves.entries), [shelves.entries]);
  return {
    entries,
    ready: shelves.ready && old.ready,
    add: (stone) => actions.add(shelfWithStone(stone, '', null, pictureOf(stone))),
    save: async (id, stone) => {
      const shelfId = shelfIdOfStone(shelves.entries, id);
      const existing = shelves.entries.find((e) => e.id === shelfId);
      if (shelfId && existing) await actions.save(shelfId, shelfWithStone(stone, id, existing.item));
    },
    remove: async (id) => {
      const shelfId = shelfIdOfStone(shelves.entries, id);
      if (shelfId) await actions.remove(shelfId);
      // Taken away on purpose: its old copy goes too, so it isn't folded back in.
      if (old.entries.some((e) => e.id === id)) await removeEntry(STONES, id);
    },
  };
}
