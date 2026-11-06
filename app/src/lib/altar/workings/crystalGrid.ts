// A crystal grid set on the altar: its centre stone and each point as a
// crystal object, in the grid's shape round the middle of the view, drawn
// with the cabinet's own crystal pictures (by the stone's care key or name,
// clear quartz otherwise). Each object carries livingState.app.grid (the
// grid's id in `crystal.grids`, its role and place), and one of your own
// stones also carries app.stone, so its cleansing log follows it. Pure.

import { builtInCabinet, objectFromForm } from '../cabinet.ts';
import { NEW_OBJECT_SIZE, STAGE_ASPECT, withSize } from '../geometry.ts';
import { appStateOf, setAppState } from '../livingState.ts';
import type { SavedObject } from '../types.ts';
import { cabinetCrystalFor } from '../connect/practice.ts';
import { normaliseStone } from '../../craft/crystal/stones.ts';
import { pointStones, shapePoints, type Grid, type GridStone } from '../../craft/crystal/grids.ts';

export type GridLink = { id: string; role: 'centre' | 'point'; place: number; name: string };

export function gridLinkOf(object: SavedObject | null | undefined): GridLink | null {
  if (!object) return null;
  const g = appStateOf(object).grid as Partial<GridLink> | undefined;
  return g && typeof g.id === 'string' && g.id ? { id: g.id, role: g.role === 'centre' ? 'centre' : 'point', place: Number(g.place) || 0, name: String(g.name ?? '') } : null;
}

/** How far the points sit from the centre, as a share of the altar's width. */
export const GRID_RADIUS = 0.15;

function crystalObject(stone: GridStone, existing: SavedObject[], now: string, center: { cx: number; cy: number }): SavedObject {
  const item = cabinetCrystalFor(normaliseStone({ name: stone.name, key: stone.key ?? null })) ?? builtInCabinet.find((i) => i.category === 'crystals') ?? null;
  const form = item?.forms.find((f) => f.form === 'tumbled' && !!f.image) ?? item?.forms.find((f) => !!f.image);
  if (!item || !form) throw new Error('No crystal artwork to place.');
  return { ...objectFromForm(item, form, existing, now, {}, center), label: stone.name };
}

/** The grid's stones as altar objects, ready to add (centre first, then the points in the order they're laid). */
export function gridObjects(
  gridId: string,
  grid: Pick<Grid, 'shape' | 'centre' | 'points'>,
  existing: SavedObject[],
  now: string,
  center: { cx: number; cy: number } = { cx: 0.5, cy: 0.55 },
): SavedObject[] {
  const out: SavedObject[] = [];
  const place = (stone: GridStone, role: GridLink['role'], index: number, at: { cx: number; cy: number }) => {
    let object = withSize(crystalObject(stone, [...existing, ...out], now, at), role === 'centre' ? NEW_OBJECT_SIZE * 0.9 : NEW_OBJECT_SIZE * 0.7);
    const link: GridLink = { id: gridId, role, place: index, name: stone.name };
    object = setAppState(object, stone.stoneId ? { grid: link, stone: { id: stone.stoneId, name: stone.name } } : { grid: link }, now, false);
    out.push(object);
  };
  if (grid.centre) place(grid.centre, 'centre', 0, center);
  const spots = shapePoints(grid.shape);
  pointStones(grid).forEach((stone, i) => {
    const p = spots[i];
    if (!p) return;
    const cx = Math.max(0.04, Math.min(0.96, center.cx + p.x * GRID_RADIUS));
    const cy = Math.max(0.06, Math.min(0.94, center.cy + p.y * GRID_RADIUS * STAGE_ASPECT));
    place(stone, 'point', i + 1, { cx, cy });
  });
  return out;
}

/** The indices of a grid's stones on this altar. */
export const gridIndices = (objects: SavedObject[], gridId: string) => objects.map((o, i) => (gridLinkOf(o)?.id === gridId ? i : -1)).filter((i) => i >= 0);
