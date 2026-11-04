// The coven's duties rota: duties that turn among members from one gathering
// to the next (who brings the candles, who calls the quarters, who hosts, who
// clears up). The leader names each duty and the order of people; this works
// out who has it at each gathering, so the server keeps only the duties and
// any swaps (supabase/migrations/20261125000000_coven_shelf_rota_sits.sql).
// Pure.
//
// - A duty counts the coven's gatherings (rites, meetings or both) from its
//   start, in time order; the nth gathering goes to the nth person in the
//   rotation, round and round. Cancelled gatherings don't count.
// - Someone who has said they can't make that gathering, or who has left the
//   coven, is passed over for it (the next person in the order takes it,
//   preferring someone without another duty that day); the turn order itself
//   doesn't move, so they're back in their place next time.
// - Swaps: an accepted swap gives that gathering's duty to the other person;
//   a trade (exchange_duty_id) also gives the asker the duty the other person
//   had that day. A leader's reassignment is a swap made accepted at once.

export type RotaApplies = 'all' | 'rite' | 'meeting';

export type RotaDuty = {
  id: string;
  coven_id: string;
  name: string;
  detail: string | null;
  applies: RotaApplies;
  rotation: string[];
  starts_at: string;
  sort_order: number;
  active: boolean;
};

export type SwapStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export type RotaSwap = {
  id: string;
  coven_id: string;
  ritual_id: string;
  duty_id: string;
  from_user: string;
  to_user: string;
  exchange_duty_id: string | null;
  note: string | null;
  status: SwapStatus;
  requested_by: string | null;
  created_at: string;
};

/** The gathering fields the rota reads. */
export type RotaGathering = { id: string; coven_id?: string; scheduled_for: string | null; status: string; kind?: 'rite' | 'meeting' | null };

export type DutyAssignment = {
  ritualId: string;
  dutyId: string;
  /** Who has it (null: nobody could be found). */
  userId: string | null;
  /** Whose turn it was by the order, before anyone was passed over or swapped. */
  turnOf: string | null;
  /** Taken by someone else because the one whose turn it was can't come. */
  covered: boolean;
  /** Changed by an accepted swap or a leader. */
  swapped: boolean;
};

export const DUTY_NAME_MAX = 80;
export const DUTY_DETAIL_MAX = 500;

/** Duties to start from (the leader names and orders their own). */
export const DUTY_IDEAS: { name: string; detail: string }[] = [
  { name: 'Brings the candles', detail: 'Altar and quarter candles, and something to light them with.' },
  { name: 'Calls the quarters', detail: 'Calls and releases the quarters, in the coven’s order.' },
  { name: 'Hosts', detail: 'Opens their home or books the space.' },
  { name: 'Brings food and drink', detail: 'Cakes and ale, and something for afterwards.' },
  { name: 'Clears up', detail: 'Puts away the altar things and leaves the space as it was found.' },
  { name: 'Keeps the record', detail: 'Notes what was done, for the Book.' },
];

export const APPLIES: { value: RotaApplies; label: string }[] = [
  { value: 'all', label: 'Every gathering' },
  { value: 'rite', label: 'Rites only' },
  { value: 'meeting', label: 'Meetings only' },
];

const time = (iso: string | null | undefined) => {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : null;
};

/** Whether a gathering counts for a duty: on the calendar (or held), of its kind, on or after its start. */
export function countsFor(duty: Pick<RotaDuty, 'applies' | 'starts_at'>, g: RotaGathering): boolean {
  const at = time(g.scheduled_for);
  if (at === null || g.status === 'cancelled' || g.status === 'draft') return false;
  const kind = g.kind === 'meeting' ? 'meeting' : 'rite';
  if (duty.applies !== 'all' && duty.applies !== kind) return false;
  const from = time(duty.starts_at);
  return from === null || at >= from;
}

/** The gatherings a duty turns at, in time order (ties by id, so everyone counts alike). */
export function dutyGatherings(duty: Pick<RotaDuty, 'applies' | 'starts_at'>, gatherings: RotaGathering[]): RotaGathering[] {
  return gatherings.filter((g) => countsFor(duty, g)).sort((a, b) => time(a.scheduled_for)! - time(b.scheduled_for)! || a.id.localeCompare(b.id));
}

export type AssignInput = {
  duties: RotaDuty[];
  gatherings: RotaGathering[];
  /** Active members' ids (anyone else in a rotation is passed over). */
  members: string[];
  /** Who has said they can't come, by gathering id. */
  away?: Record<string, string[]>;
  swaps?: RotaSwap[];
};

/**
 * Who has each duty at each gathering. Duties in their order, so where
 * someone must be passed over the earlier duty chooses first.
 */
export function assignRota({ duties, gatherings, members, away = {}, swaps = [] }: AssignInput): DutyAssignment[] {
  const active = new Set(members);
  const ordered = [...duties].filter((d) => d.active).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  const out: DutyAssignment[] = [];
  // Who already has a duty at each gathering (to spread the work when passing over).
  const busy = new Map<string, Set<string>>();
  const busyAt = (ritualId: string) => {
    let s = busy.get(ritualId);
    if (!s) busy.set(ritualId, (s = new Set()));
    return s;
  };
  for (const duty of ordered) {
    const people = duty.rotation.filter((u, i, all) => all.indexOf(u) === i);
    if (!people.length) continue;
    dutyGatherings(duty, gatherings).forEach((g, n) => {
      const start = n % people.length;
      const turnOf = people[start];
      const gone = new Set(away[g.id] ?? []);
      const can = (u: string) => active.has(u) && !gone.has(u);
      let userId: string | null = null;
      if (can(turnOf)) userId = turnOf;
      else {
        const order = people.map((_, i) => people[(start + i) % people.length]).slice(1);
        userId = order.find((u) => can(u) && !busyAt(g.id).has(u)) ?? order.find(can) ?? null;
      }
      if (userId) busyAt(g.id).add(userId);
      out.push({ ritualId: g.id, dutyId: duty.id, userId, turnOf, covered: userId !== turnOf, swapped: false });
    });
  }
  return applySwaps(out, swaps);
}

/** Accepted swaps laid over the assignments, oldest first. A swap whose giver no longer has the duty is set aside. */
export function applySwaps(assignments: DutyAssignment[], swaps: RotaSwap[]): DutyAssignment[] {
  const out = assignments.map((a) => ({ ...a }));
  const find = (ritualId: string, dutyId: string) => out.find((a) => a.ritualId === ritualId && a.dutyId === dutyId);
  const accepted = swaps.filter((s) => s.status === 'accepted').sort((a, b) => a.created_at.localeCompare(b.created_at));
  for (const s of accepted) {
    const mine = find(s.ritual_id, s.duty_id);
    if (!mine || mine.userId !== s.from_user) continue;
    const theirs = s.exchange_duty_id ? find(s.ritual_id, s.exchange_duty_id) : undefined;
    mine.userId = s.to_user;
    mine.swapped = true;
    if (theirs && theirs.userId === s.to_user) {
      theirs.userId = s.from_user;
      theirs.swapped = true;
    }
  }
  return out;
}

/** The duties at one gathering, in the duties' order. */
export function dutiesAt(assignments: DutyAssignment[], ritualId: string): DutyAssignment[] {
  return assignments.filter((a) => a.ritualId === ritualId);
}

/** The next gathering (from now, or under way) at which this person has a duty, with what they have there. */
export function nextDutiesFor(
  assignments: DutyAssignment[],
  gatherings: RotaGathering[],
  userId: string,
  now: Date,
): { gathering: RotaGathering; dutyIds: string[] } | null {
  const soon = gatherings
    .filter((g) => g.status === 'live' || (g.status === 'scheduled' && (time(g.scheduled_for) ?? 0) > now.getTime() - 3 * 3600_000))
    .sort((a, b) => (time(a.scheduled_for) ?? 0) - (time(b.scheduled_for) ?? 0));
  for (const g of soon) {
    const ids = assignments.filter((a) => a.ritualId === g.id && a.userId === userId).map((a) => a.dutyId);
    if (ids.length) return { gathering: g, dutyIds: ids };
  }
  return null;
}

/** Swaps waiting for this person's answer. */
export const swapsAskingMe = (swaps: RotaSwap[], userId: string) => swaps.filter((s) => s.status === 'pending' && s.to_user === userId);

/** Whether a pending swap still makes sense (the asker still has the duty, the other still a member). */
export function swapStillFits(swap: RotaSwap, assignments: DutyAssignment[], members: string[]): boolean {
  const a = assignments.find((x) => x.ritualId === swap.ritual_id && x.dutyId === swap.duty_id);
  return !!a && a.userId === swap.from_user && members.includes(swap.to_user);
}

/** What the other person has at that gathering (for offering a straight trade). */
export function tradeOptions(assignments: DutyAssignment[], ritualId: string, otherUser: string): string[] {
  return assignments.filter((a) => a.ritualId === ritualId && a.userId === otherUser).map((a) => a.dutyId);
}

/** "Brings the candles and Clears up". */
export function dutyNames(dutyIds: string[], duties: Pick<RotaDuty, 'id' | 'name'>[]): string {
  const names = dutyIds.map((id) => duties.find((d) => d.id === id)?.name).filter((n): n is string => !!n);
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** A duty from the form, tidied (trimmed, capped, unique people). */
export function cleanDuty(input: { name: string; detail?: string | null; applies?: string; rotation?: string[] }): { name: string; detail: string | null; applies: RotaApplies; rotation: string[] } {
  const applies = APPLIES.some((a) => a.value === input.applies) ? (input.applies as RotaApplies) : 'all';
  return {
    name: input.name.trim().slice(0, DUTY_NAME_MAX),
    detail: (input.detail ?? '').trim().slice(0, DUTY_DETAIL_MAX) || null,
    applies,
    rotation: (input.rotation ?? []).filter((u, i, all) => !!u && all.indexOf(u) === i).slice(0, 200),
  };
}

/** Move someone up or down the order. */
export function moveInRotation(rotation: string[], userId: string, by: -1 | 1): string[] {
  const at = rotation.indexOf(userId);
  const to = at + by;
  if (at < 0 || to < 0 || to >= rotation.length) return rotation;
  const next = [...rotation];
  [next[at], next[to]] = [next[to], next[at]];
  return next;
}
