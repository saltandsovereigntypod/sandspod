// The family tree drawn from your ancestors' own pages: each person may name
// their parents and partners among the others, and whether they were one of
// your parents. From those links alone the tree finds each person's
// generation (parents, grandparents and on up; your own generation, and
// children's), keeps partners side by side, and leaves everyone not linked
// (chosen family, teachers, friends, the beloved dead without a bloodline)
// in their own group rather than forcing them into a line. Pure.

import { kinLabel, lifespan, type Ancestor, type AncestorEntry } from './ancestors.ts';

export type Generation = { level: number; label: string; ids: string[] };

export type FamilyTree = {
  /** Oldest generation first. */
  generations: Generation[];
  /** Not linked to anyone, or linked only among themselves with no way to place them. */
  unplaced: string[];
  levelOf: Record<string, number>;
};

/** "Parents", "Grandparents", "Great-grandparents", "3× great-grandparents"; "Your generation", "Children", "Grandchildren". */
export function generationLabel(level: number): string {
  if (level === 1) return 'Parents';
  if (level === 2) return 'Grandparents';
  if (level === 3) return 'Great-grandparents';
  if (level > 3) return `${level - 2}× great-grandparents`;
  if (level === 0) return 'Your generation';
  if (level === -1) return 'Children';
  if (level === -2) return 'Grandchildren';
  return `${-level - 2}× great-grandchildren`;
}

type Links = { parents: string[]; partners: string[]; myParent: boolean };

function linksOf(people: AncestorEntry[]): Map<string, Links> {
  const ids = new Set(people.map((p) => p.id));
  const map = new Map<string, Links>();
  for (const p of people) {
    map.set(p.id, {
      parents: (p.data.parents ?? []).filter((x) => x !== p.id && ids.has(x)),
      partners: (p.data.partners ?? []).filter((x) => x !== p.id && ids.has(x)),
      myParent: !!p.data.myParent,
    });
  }
  // Partnership is mutual even when only one side says so.
  for (const [id, l] of map) for (const other of l.partners) {
    const o = map.get(other)!;
    if (!o.partners.includes(id)) o.partners.push(id);
  }
  return map;
}

/** Each person's parents, children, partners and siblings among your ancestors. */
export function relativesOf(people: AncestorEntry[], id: string): { parents: string[]; children: string[]; partners: string[]; siblings: string[] } {
  const links = linksOf(people);
  const me = links.get(id);
  if (!me) return { parents: [], children: [], partners: [], siblings: [] };
  const children: string[] = [];
  const siblings: string[] = [];
  for (const [other, l] of links) {
    if (other === id) continue;
    if (l.parents.includes(id)) children.push(other);
    if (me.parents.length && l.parents.some((p) => me.parents.includes(p))) siblings.push(other);
  }
  return { parents: me.parents, children, partners: me.partners, siblings };
}

/**
 * Place everyone it can. Your parents are generation 1; a placed person's
 * parents are one higher, their children one lower, their partners and
 * siblings level with them. Anyone reached two ways keeps the first.
 */
export function buildTree(people: AncestorEntry[]): FamilyTree {
  const links = linksOf(people);
  const levelOf: Record<string, number> = {};
  const queue: string[] = [];
  const place = (id: string, level: number) => {
    if (id in levelOf || Math.abs(level) > 40) return;
    levelOf[id] = level;
    queue.push(id);
  };
  for (const p of people) if (links.get(p.id)!.myParent) place(p.id, 1);
  // Anyone whose parent is one of yours is of your generation (a brother, a sister, a cousin's line comes later).
  const walk = () => {
    while (queue.length) {
      const id = queue.shift()!;
      const level = levelOf[id];
      const l = links.get(id)!;
      for (const parent of l.parents) place(parent, level + 1);
      for (const partner of l.partners) place(partner, level);
      for (const [other, ol] of links) {
        if (ol.parents.includes(id)) place(other, level - 1);
        else if (l.parents.length && ol.parents.some((x) => l.parents.includes(x))) place(other, level);
      }
    }
  };
  walk();
  // Families not joined to you (a partner's line, or a tree without your parents marked) are placed from their own youngest.
  for (const p of people) {
    if (p.id in levelOf) continue;
    const l = links.get(p.id)!;
    const hasKin = l.parents.length || l.partners.length || [...links.values()].some((o) => o.parents.includes(p.id));
    if (!hasKin) continue;
    const hasChildren = [...links.values()].some((o) => o.parents.includes(p.id));
    if (hasChildren) continue;
    place(p.id, 0);
    walk();
  }
  for (const p of people) {
    if (p.id in levelOf) continue;
    const l = links.get(p.id)!;
    if (l.parents.length || l.partners.length || [...links.values()].some((o) => o.parents.includes(p.id))) {
      place(p.id, 1);
      walk();
    }
  }

  const name = (id: string) => people.find((p) => p.id === id)?.data.name ?? '';
  const levels = [...new Set(Object.values(levelOf))].sort((a, b) => a - b);
  const generations: Generation[] = [];
  const ordered: Record<number, string[]> = {};
  for (const level of levels) {
    const here = Object.keys(levelOf).filter((id) => levelOf[id] === level);
    const out: string[] = [];
    const add = (id: string) => {
      if (out.includes(id) || !here.includes(id)) return;
      out.push(id);
      for (const partner of links.get(id)!.partners) if (here.includes(partner) && !out.includes(partner)) out.push(partner);
    };
    // Parents sit above their children, in the children's order.
    for (const child of ordered[level - 1] ?? []) for (const parent of links.get(child)!.parents) add(parent);
    for (const id of here.sort((a, b) => name(a).localeCompare(name(b)))) add(id);
    ordered[level] = out;
  }
  for (const level of [...levels].reverse()) generations.push({ level, label: generationLabel(level), ids: ordered[level] });
  const unplaced = people
    .filter((p) => !(p.id in levelOf))
    .sort((a, b) => a.data.name.localeCompare(b.data.name))
    .map((p) => p.id);
  return { generations, unplaced, levelOf };
}

/** Partners in a generation, grouped: [[a, b], [c]] so a couple can be drawn together. */
export function couplesIn(people: AncestorEntry[], ids: string[]): string[][] {
  const links = linksOf(people);
  const groups: string[][] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    const group = [id, ...links.get(id)!.partners.filter((p) => ids.includes(p) && !seen.has(p))];
    group.forEach((g) => seen.add(g));
    groups.push(group);
  }
  return groups;
}

/** A person's line in the tree: "Grandmother · 1901–1988 · Blood kin". */
export function treeDetail(a: Ancestor): string {
  return [a.relation, lifespan(a), kinLabel(a.kin ?? '')].filter(Boolean).join(' · ');
}

/** The people someone may choose as parents or partners: everyone but themselves, by name. */
export function linkChoices(people: AncestorEntry[], selfId: string | null): { id: string; name: string }[] {
  return people
    .filter((p) => p.id !== selfId)
    .map((p) => ({ id: p.id, name: p.data.name || 'Unnamed' }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Choosing someone as a parent can't make a loop (your own child, or their child, as your parent). */
export function wouldLoop(people: AncestorEntry[], selfId: string | null, parentId: string): boolean {
  if (!selfId) return false;
  if (parentId === selfId) return true;
  const links = linksOf(people);
  const stack = [parentId];
  const seen = new Set<string>();
  while (stack.length) {
    const id = stack.pop()!;
    if (id === selfId) return true;
    if (seen.has(id)) continue;
    seen.add(id);
    stack.push(...(links.get(id)?.parents ?? []));
  }
  return false;
}
