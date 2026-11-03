// What glows on a coven altar for the person whose part a ritual step is
// (ritualPanel.ts glowsForMe says whom): the thing to tap for the step's deed
// (an unlit candle, the chalice, the bell, the athame…), or the lit candle a
// candle-gazing sit looks at. Found with the altar's own tests for each
// thing, the same the altar uses when the deed is begun for you
// (AltarEditor startDeed, useToolRites, useCraftTools; the website's
// coven-altar.js reads this from SaltCore.altar.deedTargets). Also the step's
// items as the cabinet's own things, for the panel's tiles. Pure.

import type { AltarDeed } from './altarActions.ts';
import { isBell } from '../altar/bell.ts';
import { isCircleTool } from '../altar/circle.ts';
import { deckKindOf, isBolline, isCauldron, isMortar, isPendulum, isScryingGlass } from '../altar/craftTools.ts';
import { incenseLife, isIncense } from '../altar/incense.ts';
import { cabinetFormOf } from '../altar/itemIndex.ts';
import { candleLife, isCandle, isLit } from '../altar/livingState.ts';
import { canHoldOffering } from '../altar/offerings.ts';
import { isPetitionPaper } from '../altar/petitions.ts';
import { isChalice, isFireTool, isLighter } from '../altar/toolRites.ts';
import type { CabinetForm, CabinetItem, SavedObject } from '../altar/types.ts';

const usable = (o: SavedObject) => isCandle(o) && !candleLife(o).spent;
const tool = (o: SavedObject, re: RegExp) => o.type === 'tool' && re.test(String(o.tool || ''));

const TESTS: Partial<Record<AltarDeed, (o: SavedObject) => boolean>> = {
  light: (o) => usable(o) && !isLit(o),
  match: (o) => isFireTool(o) && !isLighter(o),
  incense: (o) => isIncense(o) && !incenseLife(o).lit,
  anoint: usable,
  carve: usable,
  cord: usable,
  offering: canHoldOffering,
  charge_crystal: (o) => o.type === 'crystal',
  grid: (o) => o.type === 'crystal',
  bell: isBell,
  bowl: (o) => tool(o, /singing-bowl/),
  toast: isChalice,
  libation: isChalice,
  sweep: (o) => tool(o, /besom|broom/),
  circle: isCircleTool,
  release_circle: isCircleTool,
  quarters: isCircleTool,
  release_quarters: isCircleTool,
  release: isPetitionPaper,
  pendulum: isPendulum,
  scry_mirror: isScryingGlass,
  grind: isMortar,
  cut_cord: isBolline,
  simmer: isCauldron,
  draw_deck: (o) => !!deckKindOf(o),
};

/** The keys (altarObjectId) of what glows for a deed; a candle-gazing sit's lit candles with `gaze`. */
export function deedTargetKeys(kind: AltarDeed | 'gaze' | null, objects: SavedObject[] | null | undefined): string[] {
  if (!kind) return [];
  const test = kind === 'gaze' ? (o: SavedObject) => isCandle(o) && isLit(o) : TESTS[kind];
  if (!test) return [];
  return (objects ?? []).filter((o) => o.altarObjectId != null && test(o)).map((o) => String(o.altarObjectId));
}

/** A step's item as the cabinet's thing to place: by its key, then by its picture, then by its name. */
export function stepItemForm(item: { key?: string; name: string; image?: string }, cabinet: CabinetItem[]): { item: CabinetItem; form: CabinetForm } | null {
  if (item.key && item.key.includes('|')) {
    const byKey = cabinetFormOf(item.key, cabinet);
    if (byKey) return byKey;
  }
  if (item.image) {
    for (const c of cabinet) {
      const form = c.forms.find((f) => f.image === item.image);
      if (form) return { item: c, form };
    }
  }
  const name = item.name.trim().toLowerCase();
  if (!name) return null;
  const found = cabinet.find((c) => c.name.toLowerCase() === name) ?? cabinet.find((c) => c.forms.some((f) => f.label.toLowerCase() === name));
  if (!found) return null;
  return {
    item: found,
    form: found.forms.find((f) => f.label.toLowerCase() === name) ?? found.forms[0],
  };
}
