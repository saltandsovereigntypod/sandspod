// Layouts with meaning: where things traditionally go on an altar. Each
// layout returns target positions in the stage's own coordinates (the saved
// leftPercent / topPercent / sizePercent, via geometry.ts), standing objects
// on the background's tabletop the way "Set tonight's altar" does. The screen
// applies them (applyMoves). Also: a line of placement wisdom per object.

import type { LibraryEntry } from '../../library/types.ts';
import { builtInBackgrounds } from '../cabinet.ts';
import { SURFACES } from '../tonight.ts';
import { boxHeightFraction, displayBox, withCenter } from '../geometry.ts';
import type { SavedObject } from '../types.ts';
import { objectCorrespondence, objectUid, type ElementOrSpirit } from './correspondence.ts';

// Where each background's tabletop starts and ends: the same table tonight.ts stands things on.
export { SURFACES };

/** The tabletop for a saved background path (the forest altar's when unknown or custom). */
export function surfaceFor(background: string | null | undefined): [number, number] {
  const id = builtInBackgrounds.find((b) => b.background === background)?.id ?? 'forest-altar';
  return SURFACES[id] ?? SURFACES['forest-altar'];
}

export type LayoutKind = 'directions' | 'triangle' | 'pentacle' | 'grid' | 'mirror';

export const LAYOUTS: { id: LayoutKind; title: string; blurb: string }[] = [
  { id: 'directions', title: 'The four directions', blurb: 'Earth at the north (the back), Air east, Fire south (the front), Water west. Spirit in the centre.' },
  { id: 'triangle', title: 'Triangle', blurb: 'Three pieces in a triangle pointing away from you, to raise and send. Something to focus on in the middle.' },
  { id: 'pentacle', title: 'Pentacle', blurb: 'Five points: Spirit at the top, then Water, Fire, Earth and Air around, as the pentagram is traditionally read.' },
  { id: 'grid', title: 'Crystal grid', blurb: 'A centre stone with the others in a ring around it, all feeding the middle.' },
  { id: 'mirror', title: 'God & Goddess', blurb: 'The Goddess on the left, the God on the right, and everything else mirrored between them.' },
];

export type Move = {
  index: number;
  uid: string;
  label: string;
  /** Visual centre, as fractions of stage width / height (editor.moveObject takes these). */
  cx: number;
  cy: number;
  /** The saved fields for that centre (geometry.withCenter). */
  leftPercent: number;
  topPercent: number;
  /** What it stands for in the layout: "North · Earth", "Centre". */
  role: string;
};

export type LayoutPlan = { kind: LayoutKind; title: string; note: string; moves: Move[] };

/** A spot on the tabletop: x across the stage, depth from the back edge (0) to the front (1). */
type Spot = { x: number; depth: number; role: string };

const movable = (o: SavedObject) => o && o.type !== 'cloth' && o.locked !== 'true';

/** Stand an object on a spot: its feet on the line, as tonight.ts places things. */
function moveTo(object: SavedObject, index: number, spot: Spot, surface: [number, number]): Move {
  const footY = surface[0] + 0.05 + spot.depth * (surface[1] - surface[0]);
  const height = boxHeightFraction(displayBox(object));
  const moved = withCenter(object, spot.x, footY - height / 2 + height * 0.04);
  const box = displayBox(moved);
  return {
    index,
    uid: objectUid(object),
    label: String(object.label || 'Object'),
    cx: box.cx,
    cy: box.cy,
    leftPercent: Number(moved.leftPercent),
    topPercent: Number(moved.topPercent),
    role: spot.role,
  };
}

type Item = { object: SavedObject; index: number; element: ElementOrSpirit | null };

const DIRECTIONS: Record<'Earth' | 'Air' | 'Fire' | 'Water', Spot> = {
  Earth: { x: 0.5, depth: 0.08, role: 'North · Earth' },
  Air: { x: 0.78, depth: 0.5, role: 'East · Air' },
  Fire: { x: 0.5, depth: 0.95, role: 'South · Fire' },
  Water: { x: 0.22, depth: 0.5, role: 'West · Water' },
};
const CENTRE: Spot = { x: 0.5, depth: 0.5, role: 'Centre' };

/** The spots that mean something on any altar: the four directions and the centre (arrange.ts snaps to them). */
export const MEANING_SPOTS: readonly Spot[] = [DIRECTIONS.Earth, DIRECTIONS.Air, DIRECTIONS.Fire, DIRECTIONS.Water, CENTRE];

/** Where an object would stand on a spot of this background's tabletop (its visual centre, and the spot's role). */
export function standOn(object: SavedObject, spot: Spot, background?: string | null): { cx: number; cy: number; footX: number; footY: number; role: string } {
  const surface = surfaceFor(background);
  const move = moveTo(object, -1, spot, surface);
  return { cx: move.cx, cy: move.cy, footX: spot.x, footY: surface[0] + 0.05 + spot.depth * (surface[1] - surface[0]), role: spot.role };
}

/** Pentagram points, top first and clockwise, with the element each traditionally holds. */
function pentaclePoints(): (Spot & { element: ElementOrSpirit })[] {
  const order: ElementOrSpirit[] = ['Spirit', 'Water', 'Fire', 'Earth', 'Air'];
  return order.map((element, k) => {
    const a = ((-90 + k * 72) * Math.PI) / 180;
    return { x: 0.5 + 0.2 * Math.cos(a), depth: 0.5 + 0.45 * Math.sin(a), role: `${['Top', 'Upper right', 'Lower right', 'Lower left', 'Upper left'][k]} · ${element}`, element };
  });
}

function ring(n: number, rx = 0.18, rDepth = 0.42): Spot[] {
  return Array.from({ length: n }, (_, k) => {
    const a = ((-90 + (k * 360) / n) * Math.PI) / 180;
    return { x: 0.5 + rx * Math.cos(a), depth: 0.5 + rDepth * Math.sin(a), role: 'Ring' };
  });
}

const sizeOf = (o: SavedObject) => Number(o.sizePercent) || 0;

/** Deities the Library pictures, by who they are: goddesses and gods. */
const GODDESSES = new Set(
  'aphrodite artemis bastet brigid cerridwen durga freyja hekate isis lilith morrigan the-morrigan persephone juno minerva vesta diana venus ceres mokosh lada morana epona arianrhod rhiannon frigg hel skadi idunn demeter hestia athena selene nyx hathor sekhmet'.split(' '),
);
const GODS = new Set(
  'apollo cernunnos ganesha hermes loki odin thor anubis jupiter janus mars mercury perun veles dazhbog lugh dagda the-dagda manannan freyr tyr baldur dionysus hades thoth ra osiris'.split(' '),
);

const deityKey = (o: SavedObject) => String(o.deity || '').toLowerCase().replace(/_/g, '-');
export const isGoddess = (o: SavedObject) => o.type === 'deity' && GODDESSES.has(deityKey(o));
export const isGod = (o: SavedObject) => o.type === 'deity' && GODS.has(deityKey(o));

/** The moves for a layout. Objects the layout has no place for stay where they are. */
export function layoutPlan(kind: LayoutKind, objects: SavedObject[], background?: string | null, entries?: LibraryEntry[] | null): LayoutPlan {
  const surface = surfaceFor(background);
  const meta = LAYOUTS.find((l) => l.id === kind) ?? LAYOUTS[0];
  const items: Item[] = objects
    .map((object, index) => ({ object, index, element: movable(object) ? objectCorrespondence(object, entries).element : null }))
    .filter((it) => movable(it.object));
  const moves: Move[] = [];
  const place = (it: Item, spot: Spot) => moves.push(moveTo(it.object, it.index, spot, surface));
  const used = new Set<number>();
  const take = (pred: (it: Item) => boolean, sort?: (a: Item, b: Item) => number) => {
    const pool = items.filter((it) => !used.has(it.index) && pred(it));
    if (sort) pool.sort(sort);
    const hit = pool[0];
    if (hit) used.add(hit.index);
    return hit ?? null;
  };
  const bigFirst = (a: Item, b: Item) => sizeOf(b.object) - sizeOf(a.object);
  let note = meta.blurb;

  if (kind === 'directions') {
    for (const element of ['Earth', 'Air', 'Fire', 'Water'] as const) {
      // Up to three of each element gather at their quarter.
      const group = items.filter((it) => !used.has(it.index) && it.element === element).slice(0, 3);
      group.forEach((it, k) => {
        used.add(it.index);
        const spot = DIRECTIONS[element];
        const offset = (k - (group.length - 1) / 2) * 0.07;
        const horizontal = element === 'Earth' || element === 'Fire';
        place(it, { ...spot, x: spot.x + (horizontal ? offset : 0), depth: Math.max(0, Math.min(1, spot.depth + (horizontal ? 0 : offset * 2.2))) });
      });
    }
    const centre = take((it) => it.element === 'Spirit' || it.object.type === 'deity', bigFirst);
    if (centre) place(centre, CENTRE);
    const missing = (['Earth', 'Air', 'Fire', 'Water'] as const).filter((e) => !moves.some((m) => m.role.endsWith(e)));
    if (missing.length) note += ` Nothing here stands for ${missing.join(' or ')} yet; that quarter waits empty.`;
  } else if (kind === 'triangle') {
    const corners: Spot[] = [
      { x: 0.5, depth: 0.06, role: 'Apex' },
      { x: 0.32, depth: 0.92, role: 'Left corner' },
      { x: 0.68, depth: 0.92, role: 'Right corner' },
    ];
    for (const spot of corners) {
      const it = take((x) => x.object.type === 'candle', bigFirst) ?? take(() => true, bigFirst);
      if (it) place(it, spot);
    }
    const focus = take((it) => it.object.type === 'apothecary' || it.object.type === 'crystal' || it.object.type === 'vessel', bigFirst);
    if (focus) place(focus, { x: 0.5, depth: 0.62, role: 'Focus' });
  } else if (kind === 'pentacle') {
    const points = pentaclePoints();
    const assigned = new Map<number, Item>();
    points.forEach((p, k) => {
      const it = take((x) => x.element === p.element || (p.element === 'Spirit' && x.object.type === 'deity'), bigFirst);
      if (it) assigned.set(k, it);
    });
    points.forEach((p, k) => {
      const it = assigned.get(k) ?? take(() => true, bigFirst);
      if (it) place(it, p);
    });
    const centre = take(() => true, bigFirst);
    if (centre) place(centre, CENTRE);
  } else if (kind === 'grid') {
    const crystals = items.filter((it) => it.object.type === 'crystal');
    const pool = crystals.length >= 3 ? crystals : items;
    const centrePick = [...pool].sort((a, b) => {
      const rank = (o: SavedObject) => (o.form === 'point' ? 0 : o.form === 'cluster' ? 1 : 2);
      return rank(a.object) - rank(b.object) || sizeOf(b.object) - sizeOf(a.object);
    })[0];
    if (centrePick) {
      used.add(centrePick.index);
      place(centrePick, CENTRE);
      const others = pool.filter((it) => !used.has(it.index)).slice(0, 12);
      ring(others.length).forEach((spot, k) => {
        used.add(others[k].index);
        place(others[k], spot);
      });
    }
    if (crystals.length < 3) note += ' With fewer than three crystals, everything joins the ring.';
  } else if (kind === 'mirror') {
    const goddess = take((it) => isGoddess(it.object), bigFirst);
    const god = take((it) => isGod(it.object), bigFirst);
    if (goddess) place(goddess, { x: 0.36, depth: 0.08, role: 'Goddess · left' });
    if (god) place(god, { x: 0.64, depth: 0.08, role: 'God · right' });
    if (!goddess && !god) note += ' There’s no god or goddess image here yet, so the rest is simply mirrored.';
    // Pairs of the same kind mirror each other, row by row toward the front; singles stand on the centre line.
    const rest = items.filter((it) => !used.has(it.index));
    const byKind = new Map<string, Item[]>();
    for (const it of rest) {
      const key = `${it.object.type}|${it.object.form}`;
      byKind.set(key, [...(byKind.get(key) ?? []), it]);
    }
    let row = 0;
    const singles: Item[] = [];
    for (const group of byKind.values()) {
      while (group.length >= 2 && row < 6) {
        const [l, r] = [group.shift()!, group.shift()!];
        const depth = 0.3 + row * 0.13;
        const dx = 0.12 + (row % 3) * 0.05;
        place(l, { x: 0.5 - dx, depth, role: 'Mirrored pair · left' });
        place(r, { x: 0.5 + dx, depth, role: 'Mirrored pair · right' });
        row += 1;
      }
      singles.push(...group);
    }
    singles.slice(0, 3).forEach((it, k) => place(it, { x: 0.5, depth: 0.24 + k * 0.33, role: 'Centre line' }));
  }
  return { kind, title: meta.title, note, moves };
}

/** Apply a plan's moves to the objects (only their saved position changes). */
export function applyMoves(objects: SavedObject[], moves: Move[]): SavedObject[] {
  const byIndex = new Map(moves.map((m) => [m.index, m]));
  return objects.map((o, i) => {
    const m = byIndex.get(i);
    return m ? { ...o, leftPercent: m.leftPercent, topPercent: m.topPercent } : o;
  });
}

const ELEMENT_PLACE: Record<ElementOrSpirit, string> = {
  Earth: 'Earth things traditionally sit in the north, at the back of the altar.',
  Air: 'Air things traditionally sit in the east, to the right as you face the altar.',
  Fire: 'Fire things traditionally sit in the south, toward the front.',
  Water: 'Water things traditionally sit in the west, to the left.',
  Spirit: 'Spirit traditionally holds the centre.',
};

/** Tools with a long-held place of their own. */
const TOOL_PLACE: Record<string, string> = {
  pentacle: 'The pentacle traditionally lies at the centre or in the north, as the altar’s heart of Earth.',
  chalice: 'The chalice traditionally stands in the west, with Water, often on the Goddess’s side.',
  athame: 'The athame traditionally lies in the south or east, depending on your tradition; many keep it at the front within easy reach.',
  wand: 'The wand traditionally lies in the east or south, depending on your tradition.',
  bell: 'The bell is often kept at the front, to open and close the work.',
  besom: 'The besom traditionally leans by the altar rather than on it, bristles up.',
  'book-of-shadows': 'The book is often kept at the front or to one side, open to the working.',
  cauldron: 'The cauldron traditionally sits at the centre or on the Goddess’s side, in the west.',
};

/** A line of placement wisdom for one object, or '' when tradition is quiet. */
export function placementWisdom(object: SavedObject, entries?: LibraryEntry[] | null): string {
  const key = String(object.tool || object.vessel || '').toLowerCase().replace(/_/g, '-');
  if (TOOL_PLACE[key]) return TOOL_PLACE[key];
  if (isGoddess(object)) return 'Goddess images traditionally stand on the left of the altar, often at the back.';
  if (isGod(object)) return 'God images traditionally stand on the right of the altar, often at the back.';
  if (object.type === 'deity') return 'Deity images traditionally stand at the back, raised, looking over the rest.';
  const { element } = objectCorrespondence(object, entries);
  return element ? ELEMENT_PLACE[element] : '';
}
