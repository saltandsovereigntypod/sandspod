// The one search picker the coven ritual planner (and the altar cabinet)
// shares, in the app and on the website (js/core/covens.js): type to find,
// pick as many as you like, and each pick shows as a chip you can take away.
// Two flavours: WHO (the whole coven, positions by title, people by their
// coven name) and ITEMS (anything the altar knows, lib/altar/itemIndex.ts).
// Pure, so it can be tested.

import type { Rank } from './model.ts';

/** One thing the picker can find. */
export type PickEntry = {
  key: string;
  label: string;
  /** A second line: "Position", "Member", "Herb". */
  detail?: string;
  keywords?: string[];
  /** A picture for the chip and the result (items). */
  image?: string;
  group?: string;
};

/** Lower case, accents and curly quotes straightened, so "Brigid’s" finds "brigids". */
export function normalize(text: string): string {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘`]/g, "'")
    .toLowerCase()
    .trim();
}

const wordsOf = (text: string) => normalize(text).split(/[^a-z0-9']+/).filter(Boolean);

/** How well one typed word fits an entry (0: not at all). */
function wordScore(entry: PickEntry, word: string): number {
  const label = normalize(entry.label);
  if (label === word) return 100;
  if (label.startsWith(word)) return 60;
  if (wordsOf(entry.label).some((w) => w.startsWith(word))) return 40;
  const keys = (entry.keywords ?? []).map(normalize);
  if (keys.some((k) => k === word)) return 18;
  if (keys.some((k) => k.startsWith(word) || k.split(/\s+/).some((w) => w.startsWith(word)))) return 12;
  // Letters inside a word ("love" in Clove) count least, below what a thing is for.
  if (label.includes(word)) return 5;
  if (keys.some((k) => k.includes(word))) return 3;
  if (entry.detail && normalize(entry.detail).includes(word)) return 2;
  return 0;
}

/** An entry's score for a query: every word must fit somewhere (0 when one doesn't). */
export function scoreEntry(entry: PickEntry, query: string): number {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  let total = 0;
  for (const word of words) {
    const s = wordScore(entry, word);
    if (!s) return 0;
    total += s;
  }
  // The whole query at the start of the name beats the same words scattered.
  if (normalize(entry.label).startsWith(normalize(query))) total += 25;
  return total;
}

/**
 * What a search shows: the best matches first (shorter names first among
 * equals), leaving out what's already picked. An empty search shows the
 * suggestions given (or nothing), so the picker never lists everything.
 */
export function searchEntries(entries: PickEntry[], query: string, options: { limit?: number; picked?: string[]; suggestions?: string[] } = {}): PickEntry[] {
  const limit = options.limit ?? 12;
  const picked = new Set(options.picked ?? []);
  const open = entries.filter((e) => !picked.has(e.key));
  if (!normalize(query)) {
    const wanted = options.suggestions ?? [];
    return wanted.map((key) => open.find((e) => e.key === key)).filter((e): e is PickEntry => !!e).slice(0, limit);
  }
  return open
    .map((entry, index) => ({ entry, index, score: scoreEntry(entry, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.label.length - b.entry.label.length || a.index - b.index)
    .slice(0, limit)
    .map((r) => r.entry);
}

// ─── WHO ─────────────────────────────────────────────────────────────────

/** Someone a step (or a contribution, or a setting) is for: the whole coven, everyone in a position, or one person. */
export type Assignee = { kind: 'coven' | 'rank' | 'user'; id: string };

export const WHOLE_COVEN: Assignee = { kind: 'coven', id: 'coven' };

export const assigneeKey = (a: Assignee) => (a.kind === 'coven' ? 'coven' : `${a.kind}:${a.id}`);

export function assigneeFromKey(key: string): Assignee | null {
  if (key === 'coven') return WHOLE_COVEN;
  const m = /^(rank|user):(.+)$/.exec(key);
  return m ? { kind: m[1] as 'rank' | 'user', id: m[2] } : null;
}

/** A clean list: known kinds only, no repeats, and the whole coven alone when it's there. */
export function cleanAssignees(list: unknown): Assignee[] {
  if (!Array.isArray(list)) return [];
  const out: Assignee[] = [];
  for (const raw of list) {
    const a = raw as Partial<Assignee> | null;
    if (!a || (a.kind !== 'coven' && a.kind !== 'rank' && a.kind !== 'user')) continue;
    const next: Assignee = a.kind === 'coven' ? WHOLE_COVEN : { kind: a.kind, id: String(a.id ?? '') };
    if (next.kind !== 'coven' && !next.id) continue;
    if (!out.some((o) => assigneeKey(o) === assigneeKey(next))) out.push(next);
  }
  return out.some((a) => a.kind === 'coven') ? [WHOLE_COVEN] : out.slice(0, 40);
}

type LegacyAssigned = { assignees?: unknown; assigned_user_id?: string | null; assigned_rank_id?: string | null };

/** Who a step is for: its list, or (for steps planned before there was a list) its one person or position, or the whole coven. */
export function assigneesOf(step: LegacyAssigned | null | undefined): Assignee[] {
  const list = cleanAssignees(step?.assignees);
  if (list.length) return list;
  if (step?.assigned_user_id) return [{ kind: 'user', id: step.assigned_user_id }];
  if (step?.assigned_rank_id) return [{ kind: 'rank', id: step.assigned_rank_id }];
  return [WHOLE_COVEN];
}

/** The old one-person-or-one-position columns, kept filled for anything that still reads them. */
export function legacyColumns(assignees: Assignee[]): { assigned_user_id: string | null; assigned_rank_id: string | null } {
  const list = cleanAssignees(assignees);
  if (list.length === 1 && list[0].kind === 'user') return { assigned_user_id: list[0].id, assigned_rank_id: null };
  if (list.length === 1 && list[0].kind === 'rank') return { assigned_user_id: null, assigned_rank_id: list[0].id };
  return { assigned_user_id: null, assigned_rank_id: null };
}

/** Whether a member is among them (mirrors public.coven_assignees_include). An empty list is the whole coven. */
export function includesMember(assignees: Assignee[], membership: { status: string; rank_id: string | null } | null | undefined, userId: string | null | undefined): boolean {
  if (!userId || membership?.status !== 'active') return false;
  const list = cleanAssignees(assignees);
  if (!list.length) return true;
  return list.some((a) => a.kind === 'coven' || (a.kind === 'user' && a.id === userId) || (a.kind === 'rank' && !!membership.rank_id && a.id === membership.rank_id));
}

/** The members among them, from the coven's active members. */
export function membersAmong(assignees: Assignee[], members: { user_id: string; rank_id: string | null; status: string }[]): string[] {
  return members.filter((m) => includesMember(assignees, m, m.user_id)).map((m) => m.user_id);
}

/** "A, B and C". */
export function andList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** How one reads: "The whole coven", "Every Initiate", "Rowan". */
export function assigneeLabel(a: Assignee, ranks: Pick<Rank, 'id' | 'name'>[], nameOf: (id: string) => string): string {
  if (a.kind === 'coven') return 'The whole coven';
  if (a.kind === 'rank') {
    const rank = ranks.find((r) => r.id === a.id);
    return rank ? `Every ${rank.name}` : 'A position';
  }
  return nameOf(a.id);
}

/** How a list reads: "Every Initiate, the High Priestess and Rowan". */
export function assigneesLabel(assignees: Assignee[], ranks: Pick<Rank, 'id' | 'name'>[], nameOf: (id: string) => string): string {
  const list = cleanAssignees(assignees);
  if (!list.length) return 'The whole coven';
  return andList(list.map((a, i) => {
    const label = assigneeLabel(a, ranks, nameOf);
    return i > 0 && a.kind === 'coven' ? label.toLowerCase() : label;
  }));
}

/**
 * Everything the WHO picker can find: the whole coven, each position by its
 * title, and each person by their coven name. People who can't take a part
 * (not signed up to the coven's current agreements) are left out.
 */
export function whoEntries(ranks: Pick<Rank, 'id' | 'name' | 'level'>[], people: { id: string; name: string; eligible?: boolean }[], options: { coven?: boolean } = {}): PickEntry[] {
  const out: PickEntry[] = [];
  if (options.coven !== false) out.push({ key: 'coven', label: 'Whole coven', detail: 'Everyone in the coven', keywords: ['everyone', 'all', 'whole coven', 'coven', 'circle'], group: 'coven' });
  for (const rank of [...ranks].sort((a, b) => b.level - a.level)) out.push({ key: `rank:${rank.id}`, label: rank.name, detail: 'Position · everyone who holds it', keywords: ['position', 'rank', 'role'], group: 'rank' });
  for (const person of people) {
    if (person.eligible === false) continue;
    out.push({ key: `user:${person.id}`, label: person.name, detail: 'Member', keywords: ['member', 'person'], group: 'user' });
  }
  return out;
}

/** What WHO suggests before anything is typed: the whole coven and the highest positions. */
export function whoSuggestions(entries: PickEntry[], count = 4): string[] {
  return entries.filter((e) => e.group !== 'user').slice(0, count).map((e) => e.key);
}
