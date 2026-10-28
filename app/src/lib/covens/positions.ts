// Open positions in a coven: how many may hold a position and how many
// places are left, whether it is taking applications, what it asks of
// someone (its requirements, checked against the members' record where they
// can be) and the words the screens show. Pure, so the website reads it the
// same way (js/core/covens.js, SaltCore.covens.positions). The database
// decides everything here again (supabase/migrations/20261110000000_coven_open_positions.sql);
// these mirror it so the screens can say so before anyone is refused.

import { normalizeQuestions, type Question } from './model.ts';

export type RequirementKind =
  | 'min_days_in_coven'
  | 'min_days_in_position'
  | 'holds_position'
  | 'min_rites_attended'
  | 'program_completed'
  | 'document_signed'
  | 'mentor_approval'
  | 'custom';

/** One thing a position asks, as coven_ranks.requirement_items keeps it. */
export type RequirementItem = {
  id: string;
  kind: RequirementKind;
  days?: number;
  count?: number;
  rank_id?: string;
  program_id?: string;
  document_id?: string;
  text?: string;
};

export type RequirementStatus = 'met' | 'unmet' | 'needs_review';

/** One requirement for one person, as coven_rank_eligibility (and a request's checklist) says it. */
export type RequirementCheck = { id: string; kind: RequirementKind; status: RequirementStatus; auto: boolean; label: string; line: string };

/** The position fields this needs (model.ts Rank has them all). */
export type PositionRank = {
  id: string;
  name: string;
  level: number;
  is_default?: boolean;
  open_to_applications?: boolean;
  applications_open?: boolean;
  seat_limit?: number | null;
  opening_note?: string | null;
  applications_close_at?: string | null;
  opened_at?: string | null;
  requirements?: string | null;
  requirement_items?: unknown;
  application_questions?: unknown;
};

/** Who hears when a position opens: open_coven_position's p_notify. */
export type Audience = 'everyone' | 'eligible' | 'none';

export const AUDIENCES: { value: Audience; label: string; detail: string }[] = [
  { value: 'everyone', label: 'Everyone who could apply', detail: 'Members below this position, in good standing' },
  { value: 'eligible', label: 'Only those who meet what it asks', detail: 'Everything it checks by itself already met' },
  { value: 'none', label: 'No one', detail: 'It shows in the coven, with no notification' },
];

export const REQUIREMENT_KINDS: { kind: RequirementKind; label: string; detail: string; auto: boolean }[] = [
  { kind: 'min_days_in_coven', label: 'Time in the coven', detail: 'At least so many days since they joined', auto: true },
  { kind: 'min_days_in_position', label: 'Time in a position', detail: 'So long in a position below this one, such as Dedicant for a year and a day', auto: true },
  { kind: 'holds_position', label: 'Holds a position', detail: 'Holds a position below this one, or higher', auto: true },
  { kind: 'min_rites_attended', label: 'Rites attended', detail: 'Came to at least so many of the coven’s rites', auto: true },
  { kind: 'program_completed', label: 'A program completed', detail: 'Finished one of the coven’s initiation or training programs', auto: true },
  { kind: 'document_signed', label: 'A page signed', detail: 'Signed the current version of one of the coven’s pages', auto: true },
  { kind: 'mentor_approval', label: 'Their mentor’s approval', detail: 'Their mentor, or the coven’s leaders, give it when deciding', auto: false },
  { kind: 'custom', label: 'Something else', detail: 'In your words; the reviewer ticks it when deciding', auto: false },
];

/** Quick choices for days. */
export const DAY_CHOICES = [30, 90, 180, 365, 366] as const;

export const MAX_REQUIREMENTS = 20;
export const MAX_NOTE = 500;

/** "a year and a day", "a year", "1 day", "30 days". Mirrors public.coven_days_words. */
export function daysWords(n: number): string {
  if (n === 366) return 'a year and a day';
  if (n === 365) return 'a year';
  if (n === 1) return '1 day';
  return `${n} days`;
}

const KINDS = new Set(REQUIREMENT_KINDS.map((k) => k.kind));
const ID = /^[A-Za-z0-9_-]{1,40}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const wholeIn = (v: unknown, lo: number, hi: number) => {
  const n = typeof v === 'string' && /^\d{1,6}$/.test(v) ? Number(v) : v;
  return typeof n === 'number' && Number.isInteger(n) && n >= lo && n <= hi ? n : null;
};
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** What a position asks, as saved (anything unreadable left out). */
export function requirementItems(rank: Pick<PositionRank, 'requirement_items'> | null | undefined): RequirementItem[] {
  const list = Array.isArray(rank?.requirement_items) ? rank!.requirement_items : [];
  return (list as unknown[]).map(obj).filter((i) => KINDS.has(i.kind as RequirementKind) && typeof i.id === 'string') as RequirementItem[];
}

/** The questions a position asks people who apply. */
export function rankQuestions(rank: Pick<PositionRank, 'application_questions'> | null | undefined): Question[] {
  return normalizeQuestions(Array.isArray(rank?.application_questions) ? (rank!.application_questions as Question[]) : []);
}

export type RequirementContext = {
  /** The position being edited. */
  rank: Pick<PositionRank, 'id' | 'name' | 'level'>;
  ranks: Pick<PositionRank, 'id' | 'name' | 'level'>[];
  programs: { id: string; title: string }[];
  documents: { id: string; title: string }[];
};

/** Positions a requirement may name: below this one. */
export const lowerRanks = (ctx: Pick<RequirementContext, 'rank' | 'ranks'>) => ctx.ranks.filter((r) => r.id !== ctx.rank.id && r.level < ctx.rank.level).sort((a, b) => a.level - b.level);

/**
 * What a position asks, cleaned as save_coven_rank_requirements cleans it,
 * with the first problem in the words the editor shows (null when there is none).
 */
export function cleanRequirements(items: Partial<RequirementItem>[], ctx: RequirementContext): { items: RequirementItem[]; error: string | null } {
  const out: RequirementItem[] = [];
  const used = new Set<string>();
  if (items.length > MAX_REQUIREMENTS) return { items: [], error: `A position can ask up to ${MAX_REQUIREMENTS} things.` };
  const lower = new Set(lowerRanks(ctx).map((r) => r.id));
  let index = 0;
  for (const raw of items) {
    index += 1;
    const item = obj(raw);
    const kind = item.kind as RequirementKind;
    let id = typeof item.id === 'string' && ID.test(item.id) ? item.id : `req-${index}`;
    if (used.has(id)) id = `${id.slice(0, 34)}-${index}`;
    if (kind === 'min_days_in_coven') {
      const days = wholeIn(item.days, 1, 3650);
      if (days == null) return { items: out, error: 'Choose how many days in the coven: 1 to 3,650.' };
      out.push({ id, kind, days });
    } else if (kind === 'min_days_in_position' || kind === 'holds_position') {
      const rankId = String(item.rank_id ?? '');
      if (!UUID.test(rankId) || !lower.has(rankId)) return { items: out, error: `Choose a position below ${ctx.rank.name} for that requirement.` };
      if (kind === 'min_days_in_position') {
        const days = wholeIn(item.days, 1, 3650);
        if (days == null) return { items: out, error: 'Choose how many days in that position: 1 to 3,650.' };
        out.push({ id, kind, rank_id: rankId, days });
      } else out.push({ id, kind, rank_id: rankId });
    } else if (kind === 'min_rites_attended') {
      const count = wholeIn(item.count, 1, 1000);
      if (count == null) return { items: out, error: 'Choose how many rites: 1 to 1,000.' };
      out.push({ id, kind, count });
    } else if (kind === 'program_completed') {
      const programId = String(item.program_id ?? '');
      if (!ctx.programs.some((p) => p.id === programId)) return { items: out, error: 'Choose one of the coven’s programs for that requirement.' };
      out.push({ id, kind, program_id: programId });
    } else if (kind === 'document_signed') {
      const documentId = String(item.document_id ?? '');
      if (!ctx.documents.some((d) => d.id === documentId)) return { items: out, error: 'Choose one of the coven’s pages for that requirement.' };
      out.push({ id, kind, document_id: documentId });
    } else if (kind === 'mentor_approval') {
      if (out.some((o) => o.kind === 'mentor_approval')) continue;
      out.push({ id, kind });
    } else if (kind === 'custom') {
      const text = String(item.text ?? '').replace(/\s+/g, ' ').trim();
      if (!text) continue;
      if (text.length > 300) return { items: out, error: 'Keep each requirement to 300 characters.' };
      out.push({ id, kind, text });
    } else return { items: out, error: 'That kind of requirement isn’t known.' };
    used.add(id);
  }
  return { items: out, error: null };
}

/** A new requirement of a kind, with sensible first values. */
export function newRequirement(kind: RequirementKind, ctx: Pick<RequirementContext, 'rank' | 'ranks' | 'programs' | 'documents'>, taken: string[] = []): Partial<RequirementItem> {
  let n = taken.length + 1;
  while (taken.includes(`req-${n}`)) n += 1;
  const id = `req-${n}`;
  const below = lowerRanks(ctx);
  switch (kind) {
    case 'min_days_in_coven':
      return { id, kind, days: 366 };
    case 'min_days_in_position':
      return { id, kind, rank_id: below[below.length - 1]?.id, days: 366 };
    case 'holds_position':
      return { id, kind, rank_id: below[below.length - 1]?.id };
    case 'min_rites_attended':
      return { id, kind, count: 8 };
    case 'program_completed':
      return { id, kind, program_id: ctx.programs[0]?.id };
    case 'document_signed':
      return { id, kind, document_id: ctx.documents[0]?.id };
    case 'custom':
      return { id, kind, text: '' };
    default:
      return { id, kind };
  }
}

/** How a requirement reads in the editor and to someone thinking of applying. */
export function requirementLabel(item: Partial<RequirementItem>, ctx: Pick<RequirementContext, 'ranks' | 'programs' | 'documents'>): string {
  const rank = ctx.ranks.find((r) => r.id === item.rank_id)?.name ?? 'a position';
  switch (item.kind) {
    case 'min_days_in_coven':
      return `In the coven for ${daysWords(Number(item.days) || 0)}`;
    case 'min_days_in_position':
      return `${rank} for ${daysWords(Number(item.days) || 0)}`;
    case 'holds_position':
      return `Holds ${rank}`;
    case 'min_rites_attended':
      return `Has come to ${item.count} ${item.count === 1 ? 'rite' : 'rites'}`;
    case 'program_completed':
      return `Completed ${ctx.programs.find((p) => p.id === item.program_id)?.title ?? 'a program'}`;
    case 'document_signed':
      return `Signed ${ctx.documents.find((d) => d.id === item.document_id)?.title ?? 'a page'}`;
    case 'mentor_approval':
      return 'Their mentor’s approval';
    case 'custom':
      return String(item.text ?? '').trim() || 'Something the reviewer confirms';
    default:
      return 'Something it asks';
  }
}

/** Whoever decides ticks these: custom items and the mentor's approval. */
export const tickable = (item: Pick<RequirementItem, 'kind'>) => item.kind === 'custom' || item.kind === 'mentor_approval';

/** ✓ met, ✗ not yet, ○ for the reviewer. */
export const statusMark = (status: RequirementStatus) => (status === 'met' ? '✓' : status === 'unmet' ? '✗' : '○');

/** Checks as the database sends them (anything unreadable left out). */
export function readChecks(raw: unknown): RequirementCheck[] {
  return (Array.isArray(raw) ? raw : [])
    .map(obj)
    .filter((c) => typeof c.label === 'string' && ['met', 'unmet', 'needs_review'].includes(String(c.status)))
    .map((c) => ({ id: String(c.id ?? ''), kind: c.kind as RequirementKind, status: c.status as RequirementStatus, auto: c.auto !== false, label: String(c.label), line: String(c.line ?? '') }));
}

/** Whether every requirement it checks by itself is met (what applying needs). */
export const readyToApply = (checks: RequirementCheck[]) => !checks.some((c) => c.status === 'unmet');

/** The checks with ticks given in review added (a ticked custom or mentor item reads as met). */
export function withTicks(checks: RequirementCheck[], ticked: string[]): RequirementCheck[] {
  return checks.map((c) => (!c.auto && c.status === 'needs_review' && ticked.includes(c.id) ? { ...c, status: 'met', line: c.kind === 'mentor_approval' ? 'Given' : 'Confirmed' } : c));
}

/** What still needs ticking before approving. */
export const untickedLabels = (checks: RequirementCheck[], ticked: string[]) => checks.filter((c) => !c.auto && c.status !== 'met' && !ticked.includes(c.id)).map((c) => c.label);

// ─── Places and opening ─────────────────────────────────────────────────

/** Whether the position is flagged open (the old checkbox counts, before the migration). */
export const flaggedOpen = (rank: Pick<PositionRank, 'applications_open' | 'open_to_applications'>) => !!(rank.applications_open ?? rank.open_to_applications);

/** Places left: the limit less those holding it (never below 0); null when there's no limit. */
export function placesLeft(rank: Pick<PositionRank, 'seat_limit'>, holders: number): number | null {
  return rank.seat_limit == null ? null : Math.max(0, rank.seat_limit - holders);
}

/** More hold it than its places (after the limit was lowered). */
export const overLimit = (rank: Pick<PositionRank, 'seat_limit'>, holders: number) => rank.seat_limit != null && holders > rank.seat_limit;

/** Whether its closing date has passed. */
export const pastDeadline = (rank: Pick<PositionRank, 'applications_close_at'>, now: number = Date.now()) => !!rank.applications_close_at && Date.parse(rank.applications_close_at) <= now;

/** Whether it takes applications now: open, its date still to come, a place left. Mirrors request_coven_advancement. */
export function takingApplications(rank: PositionRank, holders: number, now: number = Date.now()): boolean {
  if (rank.is_default || !flaggedOpen(rank) || pastDeadline(rank, now)) return false;
  const left = placesLeft(rank, holders);
  return left == null || left > 0;
}

export type PositionStatus = { key: 'open' | 'full' | 'closed' | 'start'; label: string };

/** The chip on the positions list: "Open · 2 of 3 places", "Open", "Full", "Closed". */
export function positionStatus(rank: PositionRank, holders: number, now: number = Date.now()): PositionStatus {
  if (rank.is_default) return { key: 'start', label: 'Where new members begin' };
  const left = placesLeft(rank, holders);
  if (left === 0) return { key: 'full', label: overLimit(rank, holders) ? 'Full · over the limit' : 'Full' };
  if (takingApplications(rank, holders, now)) return { key: 'open', label: left == null ? 'Open' : `Open · ${left} of ${rank.seat_limit} ${rank.seat_limit === 1 ? 'place' : 'places'}` };
  return { key: 'closed', label: 'Closed' };
}

/** "3 hold it · 1 place left of 4", "2 hold it · no limit", "4 hold it · over the limit of 3". */
export function placesLine(rank: Pick<PositionRank, 'seat_limit'>, holders: number): string {
  const held = holders === 0 ? 'No one holds it' : `${holders} ${holders === 1 ? 'holds' : 'hold'} it`;
  if (rank.seat_limit == null) return `${held} · no limit`;
  if (overLimit(rank, holders)) return `${held} · over the limit of ${rank.seat_limit}`;
  const left = placesLeft(rank, holders)!;
  return `${held} · ${left === 0 ? 'no places' : `${left} ${left === 1 ? 'place' : 'places'}`} left of ${rank.seat_limit}`;
}

/** "Applications close Thursday 30 October" (with the year when it isn't this one); "" with no date. */
export function deadlineWords(closeAt: string | null | undefined, now: number = Date.now()): string {
  if (!closeAt) return '';
  const at = new Date(closeAt);
  if (Number.isNaN(at.getTime())) return '';
  const sameYear = at.getFullYear() === new Date(now).getFullYear();
  const words = at.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', ...(sameYear ? {} : { year: 'numeric' }) });
  return `${at.getTime() <= now ? 'Applications closed' : 'Applications close'} ${words}`;
}

/** A closing date from a date picked (YYYY-MM-DD): the end of that day where you are; null when empty or not a date. */
export function closeAtFromDate(day: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day ?? '').trim());
  if (!m) return null;
  const at = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 0);
  return Number.isNaN(at.getTime()) ? null : at.toISOString();
}

/** The date a closing time falls on where you are (YYYY-MM-DD), for the date field. */
export function dateOfCloseAt(closeAt: string | null | undefined): string {
  if (!closeAt) return '';
  const at = new Date(closeAt);
  if (Number.isNaN(at.getTime())) return '';
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`;
}

/** A places limit typed in: null for none, a whole number 1 to 1,000, or an error. */
export function readPlaces(text: string): { value: number | null; error: string | null } {
  const t = String(text ?? '').trim();
  if (!t) return { value: null, error: null };
  const n = Number(t);
  if (!Number.isInteger(n) || n < 1 || n > 1000) return { value: null, error: 'Places are a whole number from 1 to 1,000, or empty for no limit.' };
  return { value: n, error: null };
}

/** What members read (coven_positions_overview): how many hold each position, and each one open to them with their checklist. */
export type PositionsOverview = { now: string; holders: Record<string, number>; open: { rank_id: string; requirements: RequirementCheck[] }[] };

export function readOverview(raw: unknown): PositionsOverview {
  const v = obj(raw);
  const holders: Record<string, number> = {};
  for (const [id, n] of Object.entries(obj(v.holders))) if (Number.isFinite(Number(n))) holders[id] = Number(n);
  const open = (Array.isArray(v.open) ? v.open : []).map(obj).filter((o) => typeof o.rank_id === 'string').map((o) => ({ rank_id: String(o.rank_id), requirements: readChecks(o.requirements) }));
  return { now: typeof v.now === 'string' ? v.now : new Date().toISOString(), holders, open };
}

/** An open position as a member sees it on the Open positions card. */
export type OpenPosition = { rank: PositionRank; left: number | null; deadline: string; checks: RequirementCheck[]; ready: boolean };

/** The open positions above this member that still take applications, lowest first. */
export function openPositions(ranks: PositionRank[], overview: PositionsOverview | null, now: number = Date.now()): OpenPosition[] {
  if (!overview) return [];
  return overview.open
    .map((o) => {
      const rank = ranks.find((r) => r.id === o.rank_id);
      if (!rank) return null;
      const held = overview.holders[rank.id] ?? 0;
      if (!takingApplications(rank, held, now)) return null;
      return { rank, left: placesLeft(rank, held), deadline: deadlineWords(rank.applications_close_at, now), checks: o.requirements, ready: readyToApply(o.requirements) };
    })
    .filter((x): x is OpenPosition => !!x)
    .sort((a, b) => a.rank.level - b.rank.level);
}

/** "2 places left · Applications close Thursday 30 October", for the card. */
export const openLine = (p: Pick<OpenPosition, 'left' | 'deadline'>) => [p.left == null ? '' : `${p.left} ${p.left === 1 ? 'place' : 'places'} left`, p.deadline].filter(Boolean).join(' · ');

/** Answers to a position's questions, trimmed; the first required one missing (null when none). */
export function readAnswers(questions: Question[], answers: Record<string, string>): { answers: Record<string, string>; missing: Question | null } {
  const out: Record<string, string> = {};
  for (const q of questions) {
    const a = String(answers[q.id] ?? '').trim();
    if (a) out[q.id] = a.slice(0, 4000);
  }
  return { answers: out, missing: questions.find((q) => q.required && !out[q.id]) ?? null };
}
