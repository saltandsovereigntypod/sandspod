// "How your charts meet": inter-chart aspects grouped for a kind of bond,
// house overlays (only when both birth times are known), the composite
// (midpoint) chart, and element balance. Pure; no scores or percentages.

import { aspectsAcross, aspectsAmong, DEFAULT_ORBS, type AspectHit, type AspectPoint } from './aspects.ts';
import { norm } from './ephemeris.ts';
import { houseOf } from './houses.ts';
import { makePosition, type Chart, type Position } from './natal.ts';
import { ELEMENTS, elementOf, MODALITIES, modalityOf, type ChartPointName, type Element, type Modality } from './signs.ts';
import { ELEMENT_ROLE, GROUP_ORDER, pairLine, TYPE_FOCUS, TYPE_LINES, type Family, type GroupKey, type Planet8, type RelType } from './relationshipText.ts';

export const SYN8: Planet8[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Ascendant'];
const ORBS = { orbs: { conjunction: 6, opposition: 6, trine: 5, square: 5, sextile: 4 }, luminaryBonus: 1, minors: false };

export const familyOf = (h: Pick<AspectHit, 'aspect'>): Family => (h.aspect === 'trine' || h.aspect === 'sextile' ? 'harm' : h.aspect === 'conjunction' ? 'conj' : 'hard');

export type Contact = { hit: AspectHit; family: Family; text: string; typeLine: string | null };
export type Group = { key: GroupKey; contacts: Contact[] };

/** Which group a contact belongs to. Mercury talks; Mars/Saturn friction is a watch-point; other friction grows; Jupiter and conjunctions are gifts; the rest flows. */
export function groupOf(a: ChartPointName, b: ChartPointName, family: Family): GroupKey {
  const has = (p: string) => a === p || b === p;
  if (has('Mercury')) return 'talk';
  if (family === 'hard' && (has('Mars') || has('Saturn'))) return 'watch';
  if (family === 'hard' || has('Saturn')) return 'grow';
  if (family === 'conj' || has('Jupiter')) return 'bring';
  return 'flows';
}

const pts = (c: Chart): AspectPoint[] =>
  c.positions.filter((p) => (SYN8 as string[]).includes(p.point) && (p.point !== 'Ascendant' || c.timeKnown)).map((p) => ({ point: p.point, longitude: p.longitude }));

/** Inter-chart contacts grouped and ordered for the kind of bond (its own planets first, then tightest). */
export function meet(a: Chart, b: Chart, type: RelType): Group[] {
  const focus: string[] = TYPE_FOCUS[type];
  const hits = aspectsAcross(pts(a), pts(b), ORBS);
  const by = new Map<GroupKey, Contact[]>();
  for (const hit of hits) {
    const family = familyOf(hit);
    const key = groupOf(hit.a, hit.b, family);
    const lead = [hit.a, hit.b].find((p) => focus.includes(p)) as Planet8 | undefined;
    const contact: Contact = { hit, family, text: pairLine(hit.a as Planet8, hit.b as Planet8, family), typeLine: lead ? (TYPE_LINES[type][lead] ?? null) : null };
    by.set(key, [...(by.get(key) ?? []), contact]);
  }
  const rank = (c: Contact) => ([c.hit.a, c.hit.b].some((p) => focus.includes(p)) ? 0 : 1);
  return GROUP_ORDER[type].map((key) => ({ key, contacts: (by.get(key) ?? []).sort((x, y) => rank(x) - rank(y) || x.hit.orb - y.hit.orb) }));
}

export type Overlay = { whose: 'a' | 'b'; point: ChartPointName; house: number };
const OVERLAY_POINTS: ChartPointName[] = ['Sun', 'Moon', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

/** Where one chart's planets fall in the other's houses; null unless both birth times and places are known. */
export function overlays(a: Chart, b: Chart): Overlay[] | null {
  if (!a.houses || !b.houses) return null;
  const into = (from: Chart, to: Chart, whose: 'a' | 'b'): Overlay[] =>
    from.positions.filter((p) => OVERLAY_POINTS.includes(p.point)).map((p) => ({ whose, point: p.point, house: houseOf(p.longitude, to.houses!.cusps) }));
  return [...into(a, b, 'a'), ...into(b, a, 'b')];
}

// ── Composite ────────────────────────────────────────────────────────────

/** The midpoint on the shorter arc (so 350° and 10° meet at 0°, not 180°). */
export function midpoint(x: number, y: number): number {
  const d = ((((y - x) % 360) + 540) % 360) - 180;
  return norm(x + d / 2);
}

const COMPOSITE_POINTS: ChartPointName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

export type Composite = { positions: Position[]; aspects: AspectHit[] };

export function composite(a: Chart, b: Chart): Composite {
  const positions: Position[] = [];
  for (const point of COMPOSITE_POINTS) {
    const pa = a.positions.find((p) => p.point === point);
    const pb = b.positions.find((p) => p.point === point);
    if (pa && pb) positions.push(makePosition(point, midpoint(pa.longitude, pb.longitude), null, null));
  }
  const aspects = aspectsAmong(positions.map((p) => ({ point: p.point, longitude: p.longitude })), { ...DEFAULT_ORBS, minors: false });
  return { positions, aspects };
}

// ── Balance ──────────────────────────────────────────────────────────────

const BALANCE_POINTS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
export type Tally = { elements: Record<Element, number>; modalities: Record<Modality, number> };

/** Element and modality counts over the seven classical planets of any number of people. */
export function balance(people: { point: string; sign: Position['sign'] }[][]): Tally {
  const elements = Object.fromEntries(ELEMENTS.map((e) => [e, 0])) as Record<Element, number>;
  const modalities = Object.fromEntries(MODALITIES.map((m) => [m, 0])) as Record<Modality, number>;
  for (const person of people)
    for (const p of person)
      if (BALANCE_POINTS.includes(p.point)) {
        elements[elementOf(p.sign)] += 1;
        modalities[modalityOf(p.sign)] += 1;
      }
  return { elements, modalities };
}

/** The element with the most (ties: first) and the one with the least. */
export function extremes(t: Tally): { most: Element; least: Element } {
  const sorted = [...ELEMENTS].sort((x, y) => t.elements[y] - t.elements[x]);
  return { most: sorted[0], least: sorted[sorted.length - 1] };
}

const COMPLEMENT: Record<Element, Element> = { fire: 'air', air: 'fire', earth: 'water', water: 'earth' };

/** Suggested ritual-role pairings: each member by their Sun's element, paired with a complementary one. */
export function pairings(members: { name: string; sunSign: Position['sign'] }[]): string[] {
  const pool = members.map((m) => ({ ...m, el: elementOf(m.sunSign) }));
  const used = new Set<number>();
  const out: string[] = [];
  pool.forEach((m, i) => {
    if (used.has(i)) return;
    const j = pool.findIndex((o, k) => k !== i && !used.has(k) && o.el === COMPLEMENT[m.el]);
    if (j < 0) return;
    used.add(i);
    used.add(j);
    out.push(`${m.name} (${ELEMENT_ROLE[m.el]}) with ${pool[j].name} (${ELEMENT_ROLE[pool[j].el]})`);
  });
  return out;
}
