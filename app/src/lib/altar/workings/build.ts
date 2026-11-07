// One home for a spell jar, sachet or poppet: the My Apothecary item. The
// builder's design (the jar's layers and seal, the sachet's fillings and
// knots, the poppet's body, look and pins) is copied onto the item, in its
// metadata (metadata.build, no new column), so placing it again from My
// Apothecary sets out the same jar, bag or poppet. What happens to each copy
// once placed (renewals, feedings, holds) stays on that altar object.

import type { ApothecaryItem, ApothecaryTypeId } from '../apothecary.ts';
import type { SavedObject } from '../types.ts';
import { jarObject, jarStateOf, type JarLayer, type JarSeal, type JarVessel } from './spellJar.ts';
import { sachetObject, sachetStateOf, type Filling } from './sachet.ts';
import { poppetObject, poppetStateOf, type PoppetBody, type PoppetFocus, type PoppetLook, type PoppetPin } from './poppet.ts';
import type { Planet } from '../reading/correspondence.ts';

export type ItemBuild =
  | { kind: 'jar'; layers: JarLayer[]; seal: JarSeal | null; vessel?: JarVessel }
  | { kind: 'sachet'; fillings: Filling[]; knots: number; carried: boolean; planet: Planet | null }
  | { kind: 'poppet'; focus: PoppetFocus; who: string; body: PoppetBody; fillings: Filling[]; made: string[]; consent: boolean; look: PoppetLook; pins: PoppetPin[] };

/** The My Apothecary types that have their own builder on the altar. */
export const BUILT_TYPES: Partial<Record<ApothecaryTypeId, 'jar' | 'sachet' | 'poppet'>> = { 'spell-jar': 'jar', sachet: 'sachet', poppet: 'poppet' };
export const builderFor = (type: string) => BUILT_TYPES[type as ApothecaryTypeId] ?? null;

/** The design kept on an item, or null. */
export function buildOf(item: Pick<ApothecaryItem, 'metadata'>): ItemBuild | null {
  const b = item.metadata?.build as ItemBuild | undefined;
  if (!b || typeof b !== 'object') return null;
  if (b.kind === 'jar' && Array.isArray(b.layers)) return b;
  if (b.kind === 'sachet' && Array.isArray(b.fillings)) return b;
  if (b.kind === 'poppet' && Array.isArray(b.fillings)) return b;
  return null;
}

export function withBuild<T extends Pick<ApothecaryItem, 'metadata'>>(item: T, build: ItemBuild): T {
  return { ...item, metadata: { ...(item.metadata ?? {}), build } };
}

/** The design read back off a placed jar, sachet or poppet. */
export function buildFromObject(object: SavedObject): ItemBuild | null {
  const jar = jarStateOf(object);
  if (jar) return { kind: 'jar', layers: jar.layers, seal: jar.seal, ...(jar.vessel ? { vessel: jar.vessel } : {}) };
  const sachet = sachetStateOf(object);
  if (sachet) return { kind: 'sachet', fillings: sachet.fillings, knots: sachet.knots, carried: sachet.carried, planet: sachet.planet };
  const p = poppetStateOf(object);
  if (p) return { kind: 'poppet', focus: p.focus, who: p.who, body: p.body, fillings: p.fillings, made: p.made, consent: p.consent, look: p.look ?? { body: p.body }, pins: p.pins };
  return null;
}

/** Placed from My Apothecary: a fresh copy of the jar, bag or poppet it was built as, or null for anything else. */
export function builtObject(item: ApothecaryItem, existing: SavedObject[], now: string, center?: { cx: number; cy: number }): SavedObject | null {
  const b = buildOf(item);
  if (!b) return null;
  if (b.kind === 'jar') return jarObject({ name: item.name, intention: item.intention, layers: b.layers, seal: b.seal, ...(b.vessel ? { vessel: b.vessel } : {}) }, existing, now, center, item).object;
  if (b.kind === 'sachet')
    return sachetObject({ name: item.name, purpose: item.intention, fillings: b.fillings, knots: b.knots, carried: b.carried, planet: b.planet }, existing, now, center, item).object;
  return poppetObject(
    { name: item.name, focus: b.focus, who: b.who, purpose: item.intention, body: b.body, fillings: b.fillings, made: b.made, consent: b.consent, look: b.look, pins: b.pins },
    existing,
    now,
    center,
    item,
  ).object;
}

/**
 * Migration on read: jars, sachets and poppets built before the design was kept
 * on the item. Each one still on an altar gives its item the design. Returns
 * only the items that change; an item that already has one is left alone.
 */
export function backfillBuilds(items: ApothecaryItem[], objects: SavedObject[]): ApothecaryItem[] {
  const out: ApothecaryItem[] = [];
  for (const item of items) {
    if (!builderFor(item.type) || buildOf(item)) continue;
    for (const o of objects) {
      if (o.apothecaryItemId !== item.id) continue;
      const b = buildFromObject(o);
      if (b && b.kind === builderFor(item.type)) {
        out.push(withBuild(item, b));
        break;
      }
    }
  }
  return out;
}
