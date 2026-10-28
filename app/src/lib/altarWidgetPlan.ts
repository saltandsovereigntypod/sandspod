// What goes on the Altar widget, shared by the iPhone and Android syncs: first
// what was tapped on the widget is carried out (on your own altars, which then
// save and sync as usual, and on coven altars through the coven's own save),
// then the altars for each place are gathered, your own and the coven's.

import { altarDataFromDocument, type AltarDocument } from './altar/snapshot';
import type { SavedAltar } from './altar/types';
import { applyWidgetActions, slotAltars, slotNumbers, type WidgetAction, type WidgetAltar } from './altarWidget';
import { setAltarWidgetSlot } from './altarWidgetSlots';
import { covenSavedAltar, covenSlotId, covenSlotIds, covenWidgetExtras, routeWidgetActions } from './covenAltarWidget';
import { applyCovenWidgetActions, loadCovenWidgetAltars } from './covenAltarWidgetData';

type Plan = {
  /** The altars on the widget, in place order. */
  placed: SavedAltar[];
  /** The taps that are done with; any others stay for next time. */
  done: Set<string>;
  /** Adds what the widget needs beyond the altar: its place, where it opens, and whether its buttons show. */
  dress: (altar: WidgetAltar) => WidgetAltar;
};

export async function planAltarWidget({
  altars,
  chosen,
  actions,
  save,
  fresh,
}: {
  altars: SavedAltar[];
  chosen: (string | null)[];
  actions: WidgetAction[];
  save: (altar: { id: string; name: string; doc: AltarDocument }) => Promise<unknown>;
  /** Fetch the coven altars again even if they were fetched moments ago (the app opened, or the widget was tapped). */
  fresh: boolean;
}): Promise<Plan> {
  const now = new Date().toISOString();
  const { personal, coven } = routeWidgetActions(actions);
  const done = new Set<string>();

  let shown = altars;
  if (personal.length) {
    const changed = applyWidgetActions(altars, personal, now);
    for (const { altar, doc } of changed) await save({ id: altar.id, name: altar.name, doc });
    // Until the store catches up, show the altars as they now are.
    const updated = new Map(changed.map(({ altar, doc }) => [altar.id, { ...altar, ...altarDataFromDocument(doc, altar.name, now) }]));
    shown = altars.map((a) => updated.get(a.id) ?? a);
    personal.forEach((a) => done.add(a.id));
  }

  const ids = covenSlotIds(chosen);
  let tended = false;
  for (const [altarId, list] of coven) {
    // Taps for an altar no longer on the widget are let go.
    const finished = ids.includes(altarId) ? await applyCovenWidgetActions(altarId, list) : true;
    if (!finished) continue;
    list.forEach((a) => done.add(a.id));
    tended = true;
  }

  const gone = new Set<string>();
  const entries = await loadCovenWidgetAltars(ids, fresh || tended, (altarId) => {
    gone.add(altarId);
    setAltarWidgetSlot(covenSlotId(altarId), 0);
  });
  // Taps waiting for an altar that's gone have nowhere to go.
  for (const id of gone) for (const a of coven.get(id) ?? []) done.add(a.id);

  const byId = new Map(entries.map((e) => [covenSlotId(e.altarId), e]));
  const all = [...shown, ...entries.map(covenSavedAltar)];
  const numbers = slotNumbers(all, chosen);
  return {
    placed: slotAltars(all, chosen),
    done,
    dress: (altar) => ({ ...altar, slot: numbers.get(altar.id), ...covenWidgetExtras(byId.get(altar.id)) }),
  };
}
