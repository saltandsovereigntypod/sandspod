// Waiting lists for full positions: who is in line, in what order, and the
// words the screens show. The database keeps the lists and decides
// (supabase/migrations/20261111000100_coven_test_keys_and_waiting_lists.sql):
// graduating into a full position puts someone on its list; a place freeing
// proposes the next in line for the coven's head to confirm (Promote, Choose
// someone else, Not now); nobody is moved without that. Shared with the
// website as SaltCore.covens.queue. Pure.

export type QueueStatus = 'waiting' | 'proposed' | 'promoted' | 'passed_over' | 'withdrawn' | 'left';
export type QueueSource = 'program' | 'application' | 'leader';

/** One person on a position's list, as coven_position_queue_list / coven_position_queues / coven_my_queue give it. */
export type QueueEntry = {
  id: string;
  coven_id: string;
  rank_id: string;
  user_id: string;
  name: string;
  source: QueueSource;
  source_id: string | null;
  qualified_at: string;
  queued_at: string;
  status: QueueStatus;
  proposed_at: string | null;
  deferred_at: string | null;
  decided_at: string | null;
  note: string | null;
  /** 1 is next (whoever is proposed, then by when they joined). */
  place: number | null;
  /** How many hold the position now (coven_position_queues only). */
  held?: number;
};

export type QueueAction = 'queued' | 'proposed' | 'promoted' | 'passed_over' | 'withdrawn' | 'left' | 'returned' | 'reordered' | 'not_now';
export type QueueEvent = { action: QueueAction; user_id: string; name: string; actor_id: string | null; actor: string | null; note: string | null; at: string };
export type QueueList = { rank_id: string; seat_limit: number | null; held: number; entries: QueueEntry[]; history: QueueEvent[] };

const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const strOrNull = (v: unknown) => (typeof v === 'string' && v ? v : null);
const STATUSES: QueueStatus[] = ['waiting', 'proposed', 'promoted', 'passed_over', 'withdrawn', 'left'];
const SOURCES: QueueSource[] = ['program', 'application', 'leader'];

/** Entries from the database, sound and in line order. */
export function readEntries(raw: unknown): QueueEntry[] {
  return arr(raw)
    .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object' && typeof (e as { id?: unknown }).id === 'string')
    .map((e) => ({
      id: str(e.id),
      coven_id: str(e.coven_id),
      rank_id: str(e.rank_id),
      user_id: str(e.user_id),
      name: str(e.name) || 'A member',
      source: SOURCES.includes(e.source as QueueSource) ? (e.source as QueueSource) : 'leader',
      source_id: strOrNull(e.source_id),
      qualified_at: str(e.qualified_at),
      queued_at: str(e.queued_at),
      status: STATUSES.includes(e.status as QueueStatus) ? (e.status as QueueStatus) : 'waiting',
      proposed_at: strOrNull(e.proposed_at),
      deferred_at: strOrNull(e.deferred_at),
      decided_at: strOrNull(e.decided_at),
      note: strOrNull(e.note),
      place: typeof e.place === 'number' ? e.place : null,
      ...(typeof e.held === 'number' ? { held: e.held } : {}),
    }))
    .sort(inLine);
}

/** Line order: whoever is proposed first, then by when they joined. */
export function inLine(a: Pick<QueueEntry, 'status' | 'queued_at' | 'id'>, b: Pick<QueueEntry, 'status' | 'queued_at' | 'id'>): number {
  const p = Number(b.status === 'proposed') - Number(a.status === 'proposed');
  if (p) return p;
  return a.queued_at.localeCompare(b.queued_at) || a.id.localeCompare(b.id);
}

export function readList(raw: unknown): QueueList | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    rank_id: str(r.rank_id),
    seat_limit: typeof r.seat_limit === 'number' ? r.seat_limit : null,
    held: typeof r.held === 'number' ? r.held : 0,
    entries: readEntries(r.entries),
    history: arr(r.history)
      .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
      .map((x) => ({ action: str(x.action) as QueueAction, user_id: str(x.user_id), name: str(x.name) || 'A member', actor_id: strOrNull(x.actor_id), actor: strOrNull(x.actor), note: strOrNull(x.note), at: str(x.at) })),
  };
}

/** "1st", "2nd", "3rd", "11th". */
export function ordinal(n: number): string {
  const v = Math.abs(Math.trunc(n));
  const teen = v % 100 >= 11 && v % 100 <= 13;
  return `${v}${teen ? 'th' : v % 10 === 1 ? 'st' : v % 10 === 2 ? 'nd' : v % 10 === 3 ? 'rd' : 'th'}`;
}

/** For the member: "You're 2nd in line for Initiate." / "A place is free in Initiate and you're next. The coven's head will confirm it." */
export function myPlaceLine(entry: Pick<QueueEntry, 'status' | 'place'>, rankName: string): string {
  if (entry.status === 'proposed') return `A place is free in ${rankName} and you’re next in line. The coven’s head will confirm it.`;
  return entry.place ? `You’re ${ordinal(entry.place)} in line for ${rankName}.` : `You’re on the waiting list for ${rankName}.`;
}

/** How they came to the list. */
export const SOURCE_WORDS: Record<QueueSource, string> = {
  program: 'Finished the program',
  application: 'Request approved',
  leader: 'Added by a leader',
};

/** "Finished the program · since 3 November". */
export function entryLine(e: Pick<QueueEntry, 'source' | 'qualified_at' | 'status' | 'deferred_at'>, locale?: string): string {
  const since = e.qualified_at ? new Date(e.qualified_at).toLocaleDateString(locale, { day: 'numeric', month: 'long' }) : '';
  const parts = [SOURCE_WORDS[e.source], since ? `since ${since}` : ''];
  if (e.status === 'proposed') parts.push(e.deferred_at ? 'proposed, kept for now' : 'proposed for the free place');
  return parts.filter(Boolean).join(' · ');
}

/** What happened, for the list's history: "Rowan proposed", "Rowan moved up · Hazel: She's ready". */
export function eventLine(ev: Pick<QueueEvent, 'action' | 'name' | 'actor' | 'note'>): string {
  const what: Record<QueueAction, string> = {
    queued: 'joined the list',
    proposed: 'proposed for a free place',
    promoted: 'moved up',
    passed_over: 'taken off the list',
    withdrawn: 'withdrew',
    left: 'left the list',
    returned: 'back to waiting',
    reordered: 'moved in the line',
    not_now: 'kept waiting for now',
  };
  const by = ev.actor && ev.action !== 'withdrawn' && ev.action !== 'left' ? ` (${ev.actor})` : '';
  return `${ev.name} ${what[ev.action] ?? ev.action}${by}${ev.note ? `: ${ev.note}` : ''}`;
}

/** The ids in a new order with one moved up (-1) or down (+1). */
export function moved(ids: string[], id: string, by: -1 | 1): string[] {
  const i = ids.indexOf(id);
  const j = i + by;
  if (i < 0 || j < 0 || j >= ids.length) return ids;
  const out = [...ids];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

/** Proposals waiting for the head (the Review cards): those not kept for now first. */
export function proposals(entries: QueueEntry[]): QueueEntry[] {
  return entries.filter((e) => e.status === 'proposed').sort((a, b) => Number(!!a.deferred_at) - Number(!!b.deferred_at) || (a.proposed_at ?? '').localeCompare(b.proposed_at ?? ''));
}

/** The others on the same list, in order (the choices under "Choose someone else"). */
export const othersInLine = (entries: QueueEntry[], proposal: Pick<QueueEntry, 'id' | 'rank_id'>) =>
  entries.filter((e) => e.rank_id === proposal.rank_id && e.id !== proposal.id && (e.status === 'waiting' || e.status === 'proposed')).sort(inLine);

/** The proposal card's heading: "A place is free in Initiate. Rowan is next in line." */
export const proposalLine = (rankName: string, who: string) => `A place is free in ${rankName}. ${who} is next in line.`;

/** Whether a position is full (graduates and approvals go on its list). */
export const isFull = (seatLimit: number | null | undefined, held: number) => seatLimit != null && held >= seatLimit;

/** How many are waiting, for the position's row in Manage: "3 waiting". */
export const waitingLine = (n: number) => (n ? `${n} waiting` : '');
