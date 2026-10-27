// Who may open, write in and approve each part of a coven's Book of Shadows.
// The book, each section and each page can say who may VIEW it, who may
// WRITE (edit it directly) and who APPROVES what members suggest for it, as
// a list of {kind: 'coven' | 'rank' | 'user', id} (the WHO picker's). A page
// with no rule of its own follows its section, a section its book, and a book
// with none follows the coven's own powers: everyone views, those the head
// lets write in the book write, those the head lets approve pages approve.
// An empty list means only the coven's head. The coven's head and the site's
// moderators can always do everything, and no one writes or approves what
// they can't open.
//
// The database decides (supabase/migrations/20261106000000_coven_grimoire.sql:
// coven_grimoire_allows / coven_grimoire_chain_can mirror this exactly); the
// app and the website use this to show the right buttons. Pure.

import { cleanAssignees, includesMember, type Assignee } from '../covens/picker.ts';

export type AccessWhat = 'view' | 'write' | 'approve';
export const ACCESS_WHATS: AccessWhat[] = ['view', 'write', 'approve'];

/** A rule per power; one left out follows the level above. */
export type Access = Partial<Record<AccessWhat, Assignee[]>>;

/** Someone looking at the book, as the coven sees them. */
export type GrimoireViewer = {
  userId: string | null;
  /** An active member of an active coven. */
  member: boolean;
  rankId: string | null;
  /** The coven's head (its founder). */
  head: boolean;
  /** A site moderator. */
  site: boolean;
  /** The coven's own powers (Permissions.writeBook / approveBook). */
  writeBook: boolean;
  approveBook: boolean;
  /** Signed up to the coven's current agreements, not muted or banned (writing needs it). */
  goodStanding: boolean;
};

/** A saved access value read safely: known powers only, each a clean WHO list. */
export function cleanAccess(raw: unknown): Access {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out: Access = {};
  for (const what of ACCESS_WHATS) {
    if (Array.isArray(source[what])) out[what] = cleanAssignees(source[what]);
  }
  return out;
}

/** Sets (or, with null, clears back to "as above") one power's rule. */
export function setRule(access: Access | null | undefined, what: AccessWhat, list: Assignee[] | null): Access {
  const next = { ...cleanAccess(access) };
  if (list === null) delete next[what];
  else next[what] = cleanAssignees(list);
  return next;
}

export type Level = 'page' | 'section' | 'book';
const LEVELS: Level[] = ['page', 'section', 'book'];

/** The rule that applies: the nearest level's own, from the page up (chain is nearest first), or null for the coven's default. */
export function ruleFor(chain: (Access | null | undefined | unknown)[], what: AccessWhat): { list: Assignee[] | null; from: Level | 'coven' } {
  for (let i = 0; i < chain.length; i++) {
    const access = cleanAccess(chain[i]);
    if (access[what]) return { list: access[what]!, from: LEVELS[LEVELS.length - chain.length + i] ?? 'book' };
  }
  return { list: null, from: 'coven' };
}

function listAllows(viewer: GrimoireViewer, list: Assignee[] | null, what: AccessWhat): boolean {
  if (viewer.head) return true;
  if (list === null) return what === 'view' ? true : what === 'write' ? viewer.writeBook : viewer.approveBook;
  if (!list.length) return false;
  return includesMember(list, { status: 'active', rank_id: viewer.rankId }, viewer.userId);
}

/**
 * Whether the viewer may do this, given the rules from the page up (nearest
 * first: [page, section, book], or [section, book], or [book]). Writing needs
 * good standing and being able to open it; approving does too, and those who
 * approve may also edit.
 */
export function allows(viewer: GrimoireViewer | null, chain: (Access | null | undefined | unknown)[], what: AccessWhat): boolean {
  if (!viewer) return false;
  if (viewer.site) return true;
  if (!viewer.member || !viewer.userId) return false;
  const can = (w: AccessWhat) => listAllows(viewer, ruleFor(chain, w).list, w);
  if (!can('view')) return false;
  if (what === 'view') return true;
  if (!viewer.goodStanding) return false;
  if (what === 'approve') return can('approve');
  return can('approve') || can('write');
}

type Ranked = { id: string; name: string };

/** How a rule reads: "The whole coven", "Every Elder and Rowan", "Only the coven’s head". */
export function ruleLabel(list: Assignee[] | null, what: AccessWhat, ranks: Ranked[], nameOf: (id: string) => string): string {
  if (list === null) {
    return what === 'view' ? 'The whole coven' : what === 'write' ? 'Those the coven’s head lets write in the Book' : 'Those the coven’s head lets approve pages';
  }
  if (!list.length) return 'Only the coven’s head';
  const names = list.map((a) => (a.kind === 'coven' ? 'the whole coven' : a.kind === 'rank' ? `every ${ranks.find((r) => r.id === a.id)?.name ?? 'position'}` : nameOf(a.id)));
  const text = names.length <= 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const WHAT_LABEL: Record<AccessWhat, string> = { view: 'Who can open it', write: 'Who can write in it', approve: 'Who approves suggestions' };

/** Where a rule comes from, in words: "Set here", "As its section", "As the book", "The coven’s default". */
export function ruleSource(from: Level | 'coven', here: Level): string {
  if (from === here) return 'Set here';
  if (from === 'section') return 'As its section';
  if (from === 'book') return 'As the whole book';
  return 'The coven’s own powers';
}

/** What shows for a page someone can't open, wherever it's linked. */
export const HIDDEN_PAGE = 'A page you can’t open';

/** A short line for a page's access, shown under its title for those who may change it. */
export function accessSummary(chain: (Access | null | undefined | unknown)[], ranks: Ranked[], nameOf: (id: string) => string): string {
  const view = ruleFor(chain, 'view');
  return view.list === null ? 'Open to the whole coven' : `Open to ${ruleLabel(view.list, 'view', ranks, nameOf).replace(/^\w/, (c) => c.toLowerCase())}`;
}
