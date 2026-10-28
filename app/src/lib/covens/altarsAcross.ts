// The Altar tab's Coven half: every coven altar you can see, across all the
// covens you belong to, grouped under each coven's name. Pure, and shared with
// the website's My Altars (as SaltCore.altar.altarsAcross), so both list them
// in the same order and offer the same things.
//
// Within a coven it follows the coven's own Altars page (coven/c/[slug]/altar.tsx):
// the ritual altar first, then the altars members have started (newest first),
// then the petition altars. Archived altars are kept apart, and listed only for
// those who may restore them (the altar's keepers, as the database decides).

import { petitionOf, sortAltars, type CovenAltar } from './altarDoc.ts';

/** One coven as the Coven tab needs it: its altars, how many things are on each, and what you may do there. */
export type CovenAltarsInput = {
  coven: { id: string; slug: string; name: string };
  altars: CovenAltar[];
  /** Things on each altar, by its id. */
  counts: Record<string, number>;
  /** You may start altars here: your position starts them and you are in good standing. */
  canStart: boolean;
  /** You keep every altar here (the coven's head, a position that keeps altars, a site moderator). */
  keeps: boolean;
};

export type CovenAltarGroup = {
  coven: CovenAltarsInput['coven'];
  /** The ritual altar, then the others, then petition altars. */
  altars: CovenAltar[];
  /** Archived altars you may restore, most recently started first. */
  archived: CovenAltar[];
  counts: Record<string, number>;
  canStart: boolean;
};

/** Whether you may restore (or archive) this altar: its keepers, as on the coven's Altars page. */
export function keepsAltar(altar: Pick<CovenAltar, 'is_main' | 'extra' | 'created_by'>, keeps: boolean, userId: string | null): boolean {
  return !altar.is_main && !petitionOf(altar) && (keeps || (!!userId && altar.created_by === userId));
}

/** One coven's altars in the order its Altars page shows them. */
export function orderCovenAltars(altars: CovenAltar[]): CovenAltar[] {
  const sorted = sortAltars(altars.filter((a) => !a.archived_at));
  return [...sorted.filter((a) => !petitionOf(a)), ...sorted.filter((a) => petitionOf(a))];
}

/**
 * The covens' altars, a group per coven, the covens in order of their names.
 * A coven with no altars you can see still has a group, so you can start one
 * there.
 */
export function groupCovenAltars(covens: CovenAltarsInput[], userId: string | null): CovenAltarGroup[] {
  return [...covens]
    .sort((a, b) => a.coven.name.localeCompare(b.coven.name, undefined, { sensitivity: 'base' }) || a.coven.id.localeCompare(b.coven.id))
    .map((c) => ({
      coven: c.coven,
      altars: orderCovenAltars(c.altars),
      archived: sortAltars(c.altars.filter((a) => a.archived_at && keepsAltar(a, c.keeps, userId))),
      counts: c.counts,
      canStart: c.canStart,
    }));
}

/** The covens where you may start an altar (the start form asks which when there's more than one). */
export const covensToStartIn = (groups: CovenAltarGroup[]) => groups.filter((g) => g.canStart).map((g) => g.coven);

/** "3 things", for an altar's card. */
export function thingsLabel(count: number | undefined): string {
  const n = count ?? 0;
  return `${n} ${n === 1 ? 'thing' : 'things'}`;
}

/** What an altar is, above its name on the card. */
export function altarKind(altar: Pick<CovenAltar, 'is_main' | 'extra'>): string {
  if (altar.is_main) return 'The ritual altar';
  if (petitionOf(altar)) return 'A petition’s altar';
  return 'A coven altar';
}
