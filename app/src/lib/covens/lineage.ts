// Daughter covens (hiving) and the leadership around them: the words the
// screens show, and the small rules they share, free of React and Supabase
// so they can be tested (tests/coven-lineage.test.ts). The website uses the
// same module (js/core/covens.js → SaltCore.covens.lineage). The database
// decides who may do what (supabase/migrations/20261110000000_coven_lineage.sql).
//
// A daughter coven hives from a mother coven. The mother coven's head (and
// the head of every coven above it) has full head powers in the daughter,
// always; the daughter's own High Priestess runs it day to day. Material
// carries across from mother to daughter, never anything personal.

import type { Permissions, Rank } from './model.ts';

// ─── Shapes (as coven_lineage and coven_disclosure return them) ──────────

export type HeadCard = { id: string | null; name: string; title: string };
export type LinkedCoven = { id: string; name: string | null; slug: string | null; visible?: boolean; status?: string; hived_at?: string | null; head?: HeadCard; depth?: number };
export type CopyKind = 'document' | 'rank' | 'program' | 'book_section' | 'book_page' | 'ritual_library' | 'calendar';
export type CopyNote = { kind: CopyKind; item_id: string; from: string; copied_at: string; pushed_at: string | null };
export type ReleaseRequest = { id: string; daughter_coven_id: string; mother_coven_id: string; requested_by: string | null; note: string | null; status: string; created_at: string; daughter_name?: string; daughter_slug?: string };

export type Lineage = {
  /** You are the head of a coven above this one: every power here, without being a member. */
  ancestor: boolean;
  member: boolean;
  hived_at: string | null;
  mother: (LinkedCoven & { head: HeadCard }) | null;
  above: LinkedCoven[];
  daughters: LinkedCoven[];
  disclosure: string | null;
  may_found: boolean;
  /** You decide requests to found daughters (the coven's head, or a head above it). */
  may_decide: boolean;
  pending_requests: number;
  release_request: ReleaseRequest | null;
  release_requests: ReleaseRequest[];
  copies: CopyNote[];
  shared: { kind: CopyKind; item_id: string }[];
};

export type Disclosure = { coven: string; mother: string; mother_slug: string | null; head: HeadCard; above: { coven: string; head: HeadCard; depth: number }[]; text: string };

export type DaughterRequest = {
  id: string;
  mother_coven_id: string;
  requested_by: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  tradition: string | null;
  joining: 'open' | 'application' | 'closed';
  visibility: 'listed' | 'unlisted';
  founder_rank: string | null;
  membership: MembershipChoice;
  copy: Partial<Record<CopyChoice, boolean>>;
  note: string | null;
  status: 'pending' | 'approved' | 'declined' | 'withdrawn';
  decided_by: string | null;
  decision_note: string | null;
  head_id: string | null;
  daughter_coven_id: string | null;
  created_at: string;
  decided_at: string | null;
};

export type LineageEvent = {
  id: string;
  coven_id: string;
  other_coven_id: string | null;
  other_coven_name: string | null;
  event: 'requested' | 'approved' | 'declined' | 'withdrawn' | 'founded' | 'released' | 'release_requested' | 'release_declined' | 'copied' | 'pushed' | 'override' | 'head_appointed';
  actor: string | null;
  detail: Record<string, unknown>;
  note: string | null;
  created_at: string;
};

export type LibraryItem = { kind: CopyKind; item_id: string; title: string; changed_at: string | null; shared_at: string; copy: { item_id: string; copied_at: string; pushed_at: string | null } | null };
export type PushPreview = { has_copy: boolean; copy_id?: string; title: string; changes: string[] };
export type Succession = { coven_id: string; successor_id: string | null; second_id: string | null; set_by: string | null; updated_at: string };

// ─── The disclosure ──────────────────────────────────────────────────────

/** "{Daughter} is a daughter coven of {Mother}. {Mother}'s High Priestess, {Name}, has final say over this coven." */
export function disclosureText(d: Pick<Disclosure, 'coven' | 'mother' | 'head'> & { above?: Disclosure['above'] }): string {
  let words = `${d.coven} is a daughter coven of ${d.mother}. ${d.mother}’s ${d.head.title || 'High Priestess'}, ${d.head.name}, has final say over this coven.`;
  for (const a of [...(d.above ?? [])].sort((x, y) => x.depth - y.depth)) {
    words += ` So does ${a.coven}’s ${a.head.title || 'High Priestess'}, ${a.head.name}, as head of the coven ${d.mother} descends from.`;
  }
  return words;
}

// ─── Permissions: a head above has every power here ─────────────────────

/** The coven's permissions for a head of a coven above it: everything its own head has (the database's coven_permission). */
export function withAncestor(perms: Permissions, ancestor: boolean): Permissions & { ancestor: boolean } {
  if (!ancestor) return { ...perms, ancestor: false };
  return {
    ...perms,
    ancestor: true,
    member: true,
    founder: true,
    level: 1001,
    manage: true,
    review: true,
    moderate: true,
    lead: true,
    schedule: true,
    notices: true,
    writeBook: true,
    approveBook: true,
    programs: true,
    progress: true,
    startAltars: true,
    tendAltars: true,
    keepAltars: true,
    chat: true,
    muted: false,
  };
}

/** The badge a person wears in a coven: Mother coven, Head, their position, or Member. */
export function roleBadge(args: { ancestor: boolean; member: boolean; founder: boolean; rankName?: string | null }): string | null {
  if (args.ancestor) return 'Mother coven';
  if (!args.member) return null;
  if (args.founder) return args.rankName ? `${args.rankName} · head` : 'Head';
  return args.rankName || 'Member';
}

// ─── The lineage lines ───────────────────────────────────────────────────

export function monthYear(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/** "Hived from Moon Circle in October 2026" (or from a coven they can't see, unnamed). */
export function hivedLine(lineage: Pick<Lineage, 'mother' | 'hived_at'>): string {
  if (!lineage.mother) return '';
  const when = monthYear(lineage.hived_at);
  return `Hived from ${lineage.mother.name ?? 'a coven that keeps itself unlisted'}${when ? ` in ${when}` : ''}`;
}

/** A daughter as listed on its mother's page: its name, or "An unlisted daughter coven". */
export function daughterLabel(d: LinkedCoven): string {
  return d.name ?? 'An unlisted daughter coven';
}

export function daughterDetail(d: LinkedCoven): string {
  const parts = [d.hived_at ? `Hived in ${monthYear(d.hived_at)}` : '', d.head?.name && d.name ? `Led by ${d.head.name}` : '', d.status && d.status !== 'active' ? (d.status === 'archived' ? 'Closed' : 'Paused') : ''];
  return parts.filter(Boolean).join(' · ');
}

// ─── Founding: the choices ───────────────────────────────────────────────

export type MembershipChoice = 'stay' | 'visiting' | 'leave';

/** What becomes of the founder's place in the mother coven, in honest words. */
export const MEMBERSHIP_CHOICES: { value: MembershipChoice; label: string; detail: (mother: string) => string }[] = [
  { value: 'stay', label: 'Stay as you are', detail: (m) => `You stay a member of ${m}, in your position, with everything it lets you do.` },
  {
    value: 'visiting',
    label: 'Become a visitor',
    detail: (m) => `You stay in ${m}: its chat, rites and Book. You give up your position there and its powers, and members see you’re visiting from your new coven.`,
  },
  { value: 'leave', label: 'Leave', detail: (m) => `You leave ${m} once the new coven is founded. You can ask to come back later, like anyone.` },
];

export type CopyChoice = 'documents' | 'positions' | 'programs' | 'book' | 'rituals' | 'calendar';

/** What can come across at founding, and what each means. */
export const COPY_CHOICES: { key: CopyChoice; label: string; detail: string }[] = [
  { key: 'documents', label: 'Creed, rules and agreements', detail: 'The creed, rules and what you ask of members. Agreements arrive as drafts, for the new coven to read and adopt.' },
  { key: 'positions', label: 'Positions and their powers', detail: 'The same positions, with what each may do. No one is in them yet but the new head.' },
  { key: 'programs', label: 'Initiation and training programs', detail: 'Each program’s stages and tasks, as drafts. No one’s progress comes with them.' },
  { key: 'book', label: 'Book of Shadows', detail: 'Only the sections and pages shared with daughter covens. Each says “From {mother}’s Book”.' },
  { key: 'rituals', label: 'Ritual templates and saved blocks', detail: 'Templates, the coven’s own actions and saved blocks of steps, with no one named in them.' },
  { key: 'calendar', label: 'Practice calendar', detail: 'The holiday traditions, chosen holidays and the coven’s own days.' },
];

/** Never carried across, whatever is chosen. */
export const NEVER_COPIED = 'Nothing personal ever comes across: no members, signatures, records, messages, attendance, progress, or altars with members’ things on them.';

/** A choice's explanation, with the mother coven's name in it. */
export function copyDetail(choice: (typeof COPY_CHOICES)[number], mother: string): string {
  return choice.detail.replace('{mother}', mother);
}

export function copySummary(copy: Partial<Record<CopyChoice, boolean>> | null | undefined): string {
  const chosen = COPY_CHOICES.filter((c) => copy?.[c.key]).map((c) => c.label.toLowerCase());
  if (!chosen.length) return 'Nothing carried across; the new coven starts fresh.';
  return `Carries across: ${listWords(chosen)}.`;
}

export function listWords(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** A coven address from a name ("Willow Hollow" → "willow-hollow"). */
export function slugFrom(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

/** What's missing from a request before it can be sent. */
export function requestProblems(draft: { name: string; slug: string }): string[] {
  const out: string[] = [];
  if (draft.name.trim().length < 3 || draft.name.trim().length > 80) out.push('Give the new coven a name of 3 to 80 letters.');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(draft.slug) || draft.slug.length < 3 || draft.slug.length > 60) out.push('The address can use lowercase letters, numbers and single dashes (3 to 60).');
  return out;
}

export function requestLine(r: Pick<DaughterRequest, 'status' | 'name' | 'decision_note'>): string {
  switch (r.status) {
    case 'pending':
      return `Your request to found ${r.name} is waiting for the head’s answer.`;
    case 'approved':
      return `${r.name} is founded.`;
    case 'declined':
      return `Your request to found ${r.name} wasn’t approved${r.decision_note ? `: “${r.decision_note}”` : '.'}`;
    default:
      return `You withdrew your request to found ${r.name}.`;
  }
}

// ─── Kinds of shared things ──────────────────────────────────────────────

export const KIND_LABELS: Record<CopyKind, string> = {
  document: 'Page',
  rank: 'Position',
  program: 'Program',
  book_section: 'Book section',
  book_page: 'Book page',
  ritual_library: 'Ritual template',
  calendar: 'Calendar',
};

/** "Copied from Moon Circle" for something of this coven's, if it was. */
export function copiedFrom(copies: CopyNote[] | null | undefined, kind: CopyKind, itemId: string): string | null {
  const note = (copies ?? []).find((c) => c.kind === kind && c.item_id === itemId);
  return note ? `Copied from ${note.from}` : null;
}

/** "From Moon Circle's Book", on a Book page copied from a mother coven (its metadata.copied_from). */
export function bookAttribution(metadata: unknown): string | null {
  const from = metadata && typeof metadata === 'object' ? (metadata as { copied_from?: { coven_name?: unknown } }).copied_from : null;
  return from && typeof from.coven_name === 'string' && from.coven_name ? `From ${from.coven_name}’s Book` : null;
}

/** A library entry's state for the daughter: never copied, up to date, or changed since. */
export function libraryState(item: LibraryItem): 'new' | 'current' | 'changed' {
  if (!item.copy) return 'new';
  const mine = Math.max(new Date(item.copy.copied_at).getTime(), item.copy.pushed_at ? new Date(item.copy.pushed_at).getTime() : 0);
  return item.changed_at && new Date(item.changed_at).getTime() > mine + 1000 ? 'changed' : 'current';
}

export function libraryLine(item: LibraryItem): string {
  const state = libraryState(item);
  if (state === 'new') return 'Not copied yet';
  if (state === 'changed') return 'Changed since your copy. Copying again adds a new copy beside yours.';
  return 'Your copy is up to date';
}

// ─── The log ─────────────────────────────────────────────────────────────

const TABLE_WORDS: Record<string, string> = {
  covens: 'the coven’s details',
  coven_ranks: 'a position',
  coven_members: 'a member’s place',
  coven_documents: 'a page',
  coven_applications: 'an application',
  coven_advancement_requests: 'a request to advance',
  coven_programs: 'a program',
  coven_rituals: 'a rite or meeting',
  coven_grimoire_pages: 'a Book page',
  coven_ritual_library: 'a ritual template',
  coven_succession: 'the succession plan',
};

const OP_WORDS: Record<string, string> = { insert: 'added', update: 'changed', delete: 'removed' };

/** What a mother coven's head did here: "changed a position, “Seeker”". */
export function overrideWords(detail: Record<string, unknown>): string {
  const table = String(detail.table ?? '');
  const op = String(detail.op ?? 'update');
  const label = typeof detail.label === 'string' && detail.label ? ` “${detail.label}”` : '';
  const status = typeof detail.status === 'string' ? detail.status : '';
  if (table === 'coven_applications' && op === 'update' && (status === 'approved' || status === 'declined')) return `${status} an application${label}`;
  if (table === 'coven_advancement_requests' && op === 'update' && (status === 'approved' || status === 'declined')) return `${status} a request to advance${label}`;
  if (table === 'coven_members' && (status === 'removed' || status === 'banned')) return `${status === 'banned' ? 'banned' : 'removed'}${label || ' a member'}`;
  return `${OP_WORDS[op] ?? 'changed'} ${TABLE_WORDS[table] ?? 'something'}${label}`;
}

/** One line of the lineage log, from this coven's side. `nameOf` gives people's names. */
export function eventLine(e: LineageEvent, nameOf: (id: string | null | undefined) => string): string {
  const who = e.actor ? nameOf(e.actor) : 'Someone';
  const other = e.other_coven_name ?? 'another coven';
  const d = e.detail ?? {};
  const title = typeof d.title === 'string' ? `“${d.title}”` : '';
  switch (e.event) {
    case 'requested':
      return `${who} asked to found a daughter coven${typeof d.name === 'string' ? `, ${d.name}` : ''}.`;
    case 'withdrawn':
      return `${who} withdrew a request to found ${typeof d.name === 'string' ? d.name : 'a daughter coven'}.`;
    case 'declined':
      return `${who} didn’t approve founding ${typeof d.name === 'string' ? d.name : 'a daughter coven'}.`;
    case 'approved':
      return `${who} approved founding ${other}, led by ${nameOf(typeof d.head === 'string' ? d.head : null)}.`;
    case 'founded':
      return `Founded as a daughter coven of ${other}, led by ${nameOf(typeof d.head === 'string' ? d.head : null)}.`;
    case 'released':
      return `${who} released ${e.other_coven_id ? `the link with ${other}` : 'the link'}. The covens are independent of each other now.`;
    case 'release_requested':
      return `${who} asked for the coven to be released from ${other}.`;
    case 'release_declined':
      return `${who} didn’t release the coven.`;
    case 'copied':
      return `${who} copied ${title || 'something'} from ${other}.`;
    case 'pushed':
      return `${who}, head of ${other}, updated ${title || 'a copy'} from ${other}.`;
    case 'head_appointed':
      return `${who}, head of ${other}, made ${nameOf(typeof d.to === 'string' ? d.to : null)} the coven’s head.`;
    case 'override':
      return `${who}, head of ${other}, ${overrideWords(d)}.`;
    default:
      return `${who}: ${e.event}`;
  }
}

// ─── Handing on ──────────────────────────────────────────────────────────

export type OldHeadChoice = 'keep' | 'step_down';

/**
 * What the head who hands on keeps, by default: Elder when the coven has it,
 * else their own position without the power to lead (or as it is, when it
 * doesn't lead). Mirrors coven_hand_on.
 */
export function handOnDefault(ranks: Rank[], oldRank: Rank | null | undefined, you = true): { rank: Rank | null; words: string } {
  const who = you ? 'You' : 'Its current head';
  const s = you ? '' : 's';
  if (!oldRank || !oldRank.can_manage) return { rank: oldRank ?? null, words: oldRank ? `${who} stay${s} ${oldRank.name}.` : `${who} stay${s} a member.` };
  const elder = ranks.find((r) => r.name.trim().toLowerCase() === 'elder' && !r.can_manage) ?? null;
  if (elder) return { rank: elder, words: `${who} become${s} ${elder.name}, without the power to lead the coven.` };
  return { rank: oldRank, words: `${who} keep${s} the title ${oldRank.name}, without the power to lead the coven.` };
}

/** Positions the old head may step down to: any that doesn't lead the coven, highest first. */
export function stepDownOptions(ranks: Rank[]): Rank[] {
  return ranks.filter((r) => !r.can_manage).sort((a, b) => b.level - a.level);
}

/** The words of the hand-on dialog. */
export function handOnSummary(args: { name: string; covenName: string; choice: OldHeadChoice; keepWords: string; stepTo?: Rank | null; you?: boolean }): string {
  const you = args.you !== false;
  const old =
    args.choice === 'keep'
      ? args.keepWords
      : args.stepTo
        ? `${you ? 'You step' : 'Its current head steps'} down to ${args.stepTo.name}.`
        : `Choose the position ${you ? 'you step' : 'its current head steps'} down to.`;
  return `${args.name} becomes the head of ${args.covenName}, with every power over it. ${old} Only one person leads the coven; the new head can give more powers later.`;
}

// ─── Succession and reports ──────────────────────────────────────────────

/** "38 days" since the head was last seen, or "not known". */
export function inactiveFor(lastActive: string | null | undefined, now: number = Date.now()): string {
  if (!lastActive) return 'not known';
  const days = Math.floor((now - new Date(lastActive).getTime()) / 86400000);
  if (days < 1) return 'less than a day';
  if (days === 1) return '1 day';
  if (days < 60) return `${days} days`;
  const months = Math.floor(days / 30);
  return `${months} months`;
}

export type HeadReport = {
  id: string;
  status: 'open' | 'transferred' | 'dismissed';
  note: string | null;
  created_at: string;
  last_active_at: string | null;
  coven: { id: string; name: string; slug: string; status: string; members: number; mother: { name: string; slug: string } | null };
  head: { id: string | null; name: string | null };
  reported_by: { id: string | null; name: string | null };
  successors: { id: string; which: 1 | 2; name: string | null; active: boolean }[];
  leaders: { id: string; name: string | null; position: string }[];
};

/** Who a moderator could hand a coven to, the named successor first. */
export function transferCandidates(report: HeadReport): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  for (const s of [...report.successors].sort((a, b) => a.which - b.which)) {
    if (s.active) out.push({ id: s.id, label: `${s.name ?? 'A witch'} (${s.which === 1 ? 'named successor' : 'named second'})` });
  }
  for (const l of report.leaders) if (!out.some((o) => o.id === l.id)) out.push({ id: l.id, label: `${l.name ?? 'A witch'} (${l.position})` });
  return out;
}

/** The leadership changes members hear about. */
export function leadershipLine(e: { event: string; from_user: string | null; to_user: string | null }, nameOf: (id: string | null | undefined) => string, covenName: string): string {
  switch (e.event) {
    case 'handed_on':
      return `${nameOf(e.from_user)} handed on leadership of ${covenName} to ${nameOf(e.to_user)}.`;
    case 'appointed_by_mother':
      return `${nameOf(e.to_user)} now leads ${covenName}, appointed by the head of its mother coven.`;
    case 'moderator_transfer':
      return `The site moderators handed ${covenName} to ${nameOf(e.to_user)}.`;
    case 'account_transfer':
      return `${nameOf(e.to_user)} now leads ${covenName}: its head closed their account.`;
    case 'archived_no_head':
      return `${covenName} was archived: its head closed their account and no one was named to lead it.`;
    case 'successor_named':
      return `${nameOf(e.to_user)} was named to lead ${covenName} next.`;
    default:
      return '';
  }
}
