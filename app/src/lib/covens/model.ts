// Covens in the app: the rules the screens share, free of React and Supabase
// so they can be tested on their own (tests/covens.test.ts). They mirror the
// website's covens/coven-logic.js; the database decides who may do what
// (supabase/migrations/…_covens.sql and the migrations after it).

export type Joining = 'open' | 'application' | 'closed';

export type Coven = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  tradition: string | null;
  tags: string[];
  meeting_rhythm: string | null;
  joining: Joining;
  visibility: 'listed' | 'unlisted';
  status: 'active' | 'suspended' | 'archived';
  moderation_note: string | null;
  application_questions: Question[];
  altar_background: string | null;
  member_limit?: number | null;
  practice_traditions?: string[];
  practice_holidays?: string[];
  practice_custom?: unknown;
  practice_calendars?: string[];
  founder_id: string | null;
  created_at: string;
  member_count?: number;
};

export type Rank = {
  id: string;
  coven_id: string;
  name: string;
  description: string | null;
  requirements: string | null;
  level: number;
  can_manage?: boolean;
  can_review?: boolean;
  can_moderate?: boolean;
  can_lead_rituals?: boolean;
  can_schedule_rites?: boolean;
  can_write_book?: boolean;
  can_approve_book?: boolean;
  can_manage_programs?: boolean;
  can_view_progress?: boolean;
  /** Altars and chat (each on unless the head turns it off, for starting altars and chat). */
  can_start_altars?: boolean;
  can_tend_altars?: boolean;
  can_keep_altars?: boolean;
  can_chat?: boolean;
  is_default?: boolean;
  open_to_applications?: boolean;
};

export type Member = { coven_id: string; user_id: string; rank_id: string | null; status: 'active' | 'left' | 'removed' | 'banned'; muted_until: string | null; joined_at: string };
export type Profile = { user_id: string; display_name: string; pronouns?: string | null; bio?: string | null };
export type Question = { id: string; prompt: string; required: boolean };
export type CovenDocument = { id: string; coven_id: string; kind: string; title: string; body: string; visibility: 'public' | 'members'; requires_signature: boolean; published: boolean; position: number; version: number };
export type Signature = { document_id: string; version: number; user_id: string };
export type Application = { id: string; coven_id: string; user_id: string; status: 'pending' | 'approved' | 'declined' | 'withdrawn'; answers: Record<string, string>; message: string | null; reviewer_note: string | null; created_at: string; decided_at: string | null };
export type Advancement = { id: string; coven_id: string; user_id: string; rank_id: string; statement: string | null; status: 'pending' | 'approved' | 'declined' | 'withdrawn'; reviewer_id?: string | null; reviewer_note: string | null; created_at: string; decided_at: string | null };
export type Message = { id: string; coven_id: string; conversation_id?: string | null; user_id: string | null; body: string; created_at: string; edited_at: string | null; deleted_at: string | null; deleted_by: string | null };
export type AltarItem = {
  id: string;
  coven_id: string;
  kind: 'candle' | 'object';
  image: string;
  label: string | null;
  intention: string | null;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  z: number;
  lit: boolean;
  lit_at: string | null;
  lit_by: string | null;
  burn_minutes: number;
  placed_by: string | null;
};
export type Ritual = {
  id: string;
  coven_id: string;
  title: string;
  intention: string | null;
  description: string | null;
  scheduled_for: string | null;
  status: 'draft' | 'scheduled' | 'live' | 'done' | 'cancelled';
  occasion: string | null;
  occasion_name: string | null;
  current_step_id: string | null;
  led_by: string | null;
  ended_at: string | null;
  updated_at?: string;
  /** The altar it's held at; none means the coven's main ritual altar. */
  altar_id?: string | null;
};
export type AltarAction = 'light_candle' | 'place_item' | 'light_all' | 'snuff_all';
export type RitualStep = {
  id: string;
  ritual_id: string;
  coven_id: string;
  position: number;
  title: string;
  instructions: string | null;
  spoken_text: string | null;
  duration_minutes: number | null;
  assigned_user_id: string | null;
  assigned_rank_id: string | null;
  completed_at: string | null;
  completed_by: string | null;
  altar_action: AltarAction | null;
  altar_color: string | null;
  altar_form: string | null;
  altar_label: string | null;
  altar_image?: string | null;
  /** Who tends the altar during this step: its person ('assigned'), 'everyone', or only the ritual's 'leader'. */
  altar_access?: 'assigned' | 'everyone' | 'leader';
};
export type Rsvp = { ritual_id: string; coven_id: string; user_id: string; response: 'going' | 'maybe' | 'not_going' };
export type StepMark = { step_id: string; ritual_id: string; user_id: string };
export type BookPage = { id: string; coven_id: string; title: string; section: string | null; body: string; version: number; author_id: string | null; published_by: string | null; published_at: string };
export type BookDraft = { id: string; coven_id: string; page_id: string | null; title: string; section: string | null; body: string; author_id: string; status: 'draft' | 'pending' | 'declined' | 'published'; reviewer_id: string | null; reviewer_note: string | null; submitted_at: string | null; updated_at: string };
export type Petition = { id: string; coven_id: string; user_id: string; title: string; body: string | null; color: string; status: 'open' | 'answered' | 'closed'; outcome_note: string | null; last_tended_at: string | null; altar_id?: string | null; created_at: string };
export type Tending = { id: string; petition_id: string; user_id: string; note: string | null; created_at: string };

export const JOINING: Record<Joining, { label: string; detail: string }> = {
  open: { label: 'Open to join', detail: 'Sign the agreements and you’re in.' },
  application: { label: 'By application', detail: 'Apply, and the coven’s elders review it.' },
  closed: { label: 'Not taking members', detail: 'This coven isn’t welcoming new members right now.' },
};

export const REPORT_REASONS = [
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'coercion', label: 'Pressure for money, secrets, photos or obedience' },
  { value: 'hate', label: 'Hate or discrimination' },
  { value: 'sexual', label: 'Sexual content or advances' },
  { value: 'minor', label: 'Someone may be under 18' },
  { value: 'self_harm', label: 'Someone may be at risk of harm' },
  { value: 'scam', label: 'Scam or fraud' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Something else' },
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number]['value'];

export const CANDLE_COLORS = ['white', 'black', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink', 'magenta', 'brown', 'grey', 'silver', 'gold', 'rainbow'] as const;
export const CANDLE_FORMS = [
  { id: 'vigil', label: 'Vigil' },
  { id: 'taper', label: 'Taper' },
  { id: 'pillar', label: 'Pillar' },
  { id: 'votive', label: 'Votive' },
  { id: 'chime', label: 'Chime' },
  { id: 'tea-light', label: 'Tea light' },
] as const;
export const SWATCH: Record<string, string> = {
  white: '#f4efe2', black: '#1b1b1b', red: '#b3261e', orange: '#e07b24', yellow: '#e8c547', green: '#2f7d44', blue: '#2f5fa8', indigo: '#3b2f7a',
  purple: '#6b3fa0', pink: '#e58fb4', magenta: '#b0277a', brown: '#6b4426', grey: '#8a8a8a', silver: '#c9ccd1', gold: '#c9a64a', rainbow: '#c06bd0',
};

export const OCCASIONS = [
  { value: 'full_moon', label: 'Full moon' },
  { value: 'new_moon', label: 'New moon' },
  { value: 'esbat', label: 'Esbat' },
  { value: 'sabbat', label: 'Sabbat' },
  { value: 'other', label: 'Other gathering' },
] as const;

// ─── People and permissions ──────────────────────────────────────────────

export type Permissions = {
  member: boolean;
  founder: boolean;
  rank: Rank | null;
  level: number;
  manage: boolean;
  review: boolean;
  moderate: boolean;
  lead: boolean;
  schedule: boolean;
  writeBook: boolean;
  approveBook: boolean;
  /** Designs programs, assigns them and mentors, signs off work (initiation and training). */
  programs: boolean;
  /** Sees everyone's progress in the coven's programs. */
  progress: boolean;
  /** Starts new altars for the coven. */
  startAltars: boolean;
  /** Tends the altars kept for chosen people, the main ritual altar among them. */
  tendAltars: boolean;
  /** Keeps every altar: chooses who tends each one, locks it. */
  keepAltars: boolean;
  /** Talks in the coven's chat. */
  chat: boolean;
  muted: boolean;
  site: boolean;
};

/** What this person can do in this coven, as the database decides it. */
export function permissions(args: {
  coven: Coven | null;
  membership: Member | null;
  ranks: Rank[];
  userId: string | null;
  siteModerator?: boolean;
  grants?: { user_id: string; power: string }[];
  now?: number;
}): Permissions {
  const { coven, membership, ranks, userId } = args;
  const active = membership?.status === 'active';
  const rank = active ? ranks.find((r) => r.id === membership!.rank_id) ?? null : null;
  const founder = !!(userId && coven && coven.founder_id === userId && active);
  const open = coven?.status === 'active';
  const has = (...flags: (keyof Rank)[]) => open && active && (founder || !!(rank && flags.some((f) => rank[f])));
  return {
    member: active,
    founder,
    rank,
    level: founder ? 1000 : rank ? rank.level : 0,
    manage: has('can_manage'),
    review: has('can_review', 'can_manage'),
    moderate: has('can_moderate', 'can_manage'),
    lead: has('can_lead_rituals', 'can_moderate', 'can_manage'),
    schedule: has('can_schedule_rites', 'can_manage'),
    writeBook: has('can_write_book', 'can_approve_book', 'can_manage'),
    approveBook: has('can_approve_book', 'can_manage'),
    ...programPowers(open && active, founder, rank, args.grants ?? [], userId, !!args.siteModerator),
    // Starting altars and chat are on for a position unless the head turns them off.
    startAltars: open && active && (founder || !rank || rank.can_start_altars !== false || !!rank.can_keep_altars || !!rank.can_manage),
    tendAltars: has('can_tend_altars', 'can_keep_altars', 'can_manage'),
    keepAltars: has('can_keep_altars', 'can_manage'),
    chat: open && active && (founder || !rank || rank.can_chat !== false || !!rank.can_moderate || !!rank.can_manage),
    muted: !!(active && membership!.muted_until && new Date(membership!.muted_until).getTime() > (args.now ?? Date.now())),
    site: !!args.siteModerator,
  };
}

// Program powers come from the position, from powers given by name (coven_grants), or the founder.
function programPowers(live: boolean, founder: boolean, rank: Rank | null, grants: { user_id: string; power: string }[], userId: string | null, site: boolean) {
  const granted = (power: string) => grants.some((g) => g.user_id === userId && g.power === power);
  const programs = live && (founder || !!(rank?.can_manage || rank?.can_manage_programs) || granted('manage_programs'));
  const progress = live && (programs || !!rank?.can_view_progress || granted('view_progress'));
  return { programs: programs || site, progress: progress || site };
}

/** Agreements that still need this person's signature (current versions only). */
export function unsignedAgreements(documents: CovenDocument[], signatures: Signature[], userId: string | null): CovenDocument[] {
  const signed = new Set(signatures.filter((s) => !userId || s.user_id === userId).map((s) => `${s.document_id}@${s.version}`));
  return orderDocuments(documents).filter((d) => d.requires_signature && d.published !== false && !signed.has(`${d.id}@${d.version}`));
}

const KIND_ORDER = ['creed', 'rules', 'requirements', 'agreement', 'other'];
export function orderDocuments(documents: CovenDocument[]): CovenDocument[] {
  const rank = (k: string) => (KIND_ORDER.includes(k) ? KIND_ORDER.indexOf(k) : 9);
  return [...documents].sort((a, b) => rank(a.kind) - rank(b.kind) || a.position - b.position || a.title.localeCompare(b.title));
}

export const KIND_LABELS: Record<string, string> = { creed: 'Creed', rules: 'Rules', requirements: 'Requirements', agreement: 'Agreement', other: 'Page' };
export const DOCUMENT_KINDS = [
  { value: 'creed', label: 'Creed' },
  { value: 'rules', label: 'Rules' },
  { value: 'requirements', label: 'Requirements' },
  { value: 'agreement', label: 'Agreement' },
  { value: 'other', label: 'Other' },
] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number]['value'];

/** Whether chat, the altar and ritual parts are open to this person, and if not, why. */
export function standing(perms: Permissions, unsigned: CovenDocument[], banned: boolean): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!perms.member) reasons.push('Only members can take part here.');
  if (perms.member && unsigned.length) reasons.push('Sign the coven’s updated agreements to take part.');
  if (perms.muted) reasons.push('A coven moderator has paused your messages for a while.');
  if (banned) reasons.push('Your account can’t take part in covens.');
  return { ok: perms.member && !reasons.length, reasons };
}

export function rankPowers(rank: Rank | null): string[] {
  if (!rank) return [];
  const powers: string[] = [];
  if (rank.can_manage) powers.push('leads the coven');
  if (rank.can_review) powers.push('reviews applications');
  if (rank.can_moderate) powers.push('keeps the gathering safe');
  if (rank.can_lead_rituals || rank.can_moderate || rank.can_manage) powers.push('leads rituals');
  if (rank.can_schedule_rites || rank.can_manage) powers.push('puts rites on the calendar');
  if (rank.can_approve_book || rank.can_manage) powers.push('approves pages in the coven’s book');
  else if (rank.can_write_book) powers.push('writes in the coven’s book');
  if (rank.can_manage_programs || rank.can_manage) powers.push('manages initiation and training');
  if (rank.can_keep_altars || rank.can_manage) powers.push('keeps the coven’s altars');
  else if (rank.can_tend_altars) powers.push('tends the coven’s altars');
  else if (rank.can_view_progress) powers.push('sees everyone’s progress');
  return powers;
}

/** Positions this person may give others (the database checks the same). */
export function grantableRanks(ranks: Rank[], perms: Permissions): Rank[] {
  return ranks.filter((r) => {
    if (perms.site || perms.founder) return true;
    if (perms.manage) return r.level <= perms.level;
    if (perms.review) return r.level < perms.level && !(r.can_manage || r.can_review || r.can_moderate);
    return false;
  });
}

/** Positions this member could apply to rise to. */
export function advancementOptions(ranks: Rank[], perms: Permissions): Rank[] {
  return ranks.filter((r) => r.open_to_applications && r.level > perms.level).sort((a, b) => a.level - b.level);
}

/** Whether this person can act on that member (raise, pause, remove): never yourself, the founder, or anyone at or above you. */
export function actsOn(target: Member, perms: Permissions, coven: Pick<Coven, 'founder_id'>, ranks: Rank[], userId: string | null): boolean {
  if (target.user_id === userId) return false;
  if (perms.site) return true;
  const level = target.user_id === coven.founder_id ? 1000 : ranks.find((r) => r.id === target.rank_id)?.level ?? 0;
  return target.user_id !== coven.founder_id && level < perms.level;
}

// ─── Founding and managing ───────────────────────────────────────────────

/** A coven's web address from its name, as the website makes it. */
export function slugify(name: string): string {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Tags typed with commas: trimmed, at most 30 characters, no repeats, at most 12. */
export function parseTags(value: string | string[]): string[] {
  const list = Array.isArray(value) ? value : String(value ?? '').split(',');
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of list) {
    const tag = String(raw ?? '').trim().replace(/\s+/g, ' ').slice(0, 30);
    if (!tag || seen.has(tag.toLowerCase())) continue;
    seen.add(tag.toLowerCase());
    tags.push(tag);
    if (tags.length === 12) break;
  }
  return tags;
}

export type CovenDraft = { name: string; slug: string; tagline?: string; description?: string; tradition?: string; meeting_rhythm?: string; tags?: string[]; joining?: Joining; visibility?: 'listed' | 'unlisted'; founder_rank?: string };

/** Problems with a coven's details, in the words the form shows. */
export function validateCoven(draft: Pick<CovenDraft, 'name' | 'slug' | 'tagline' | 'description' | 'joining' | 'visibility'>): string[] {
  const errors: string[] = [];
  const name = String(draft.name ?? '').trim();
  const slug = String(draft.slug ?? '');
  if (name.length < 3 || name.length > 80) errors.push('Give the coven a name of 3 to 80 characters.');
  if (slug.length < 3 || slug.length > 60 || !SLUG_PATTERN.test(slug)) errors.push('The coven’s address needs 3 to 60 lower-case letters, numbers and dashes.');
  if (String(draft.tagline ?? '').length > 160) errors.push('Keep the tagline to 160 characters.');
  if (String(draft.description ?? '').length > 5000) errors.push('Keep the description to 5,000 characters.');
  if (draft.joining && !JOINING[draft.joining]) errors.push('Choose how people join.');
  if (draft.visibility && !['listed', 'unlisted'].includes(draft.visibility)) errors.push('Choose whether the coven is listed.');
  return errors;
}

/** Application questions as the database keeps them: [{ id, prompt, required }], at most 20. */
export function normalizeQuestions(list: Partial<Question>[]): Question[] {
  const used = new Set<string>();
  const out: Question[] = [];
  for (const raw of Array.isArray(list) ? list : []) {
    const prompt = String(raw?.prompt ?? '').trim().slice(0, 300);
    if (!prompt) continue;
    const base = String(raw?.id ?? '').trim() || `q-${slugify(prompt).slice(0, 24) || 'question'}`;
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    out.push({ id, prompt, required: !!raw?.required });
    if (out.length === 20) break;
  }
  return out;
}

export const RANK_POWERS = [
  { key: 'can_review', label: 'Reviews applications and requests to advance' },
  { key: 'can_moderate', label: 'Moderates the gathering (removes messages, pauses or removes members)' },
  { key: 'can_lead_rituals', label: 'Leads the coven’s rituals (plans them, gives out their steps, begins them)' },
  { key: 'can_schedule_rites', label: 'Puts rites on the coven’s calendar' },
  { key: 'can_write_book', label: 'Writes in the coven’s Book of Shadows (drafts go for approval)' },
  { key: 'can_approve_book', label: 'Approves pages for the coven’s Book of Shadows' },
  { key: 'can_manage_programs', label: 'Manages initiation and training (designs programs, chooses who takes them, assigns mentors, signs off work)' },
  { key: 'can_view_progress', label: 'Sees everyone’s initiation and training progress' },
  { key: 'can_start_altars', label: 'Starts new altars for the coven' },
  { key: 'can_tend_altars', label: 'Tends the coven’s altars (the ritual altar, and any kept for chosen people), outside rituals' },
  { key: 'can_keep_altars', label: 'Keeps the coven’s altars (chooses who tends each one, locks them, clears them away)' },
  { key: 'can_chat', label: 'Talks in the coven’s chat' },
  { key: 'can_manage', label: 'Leads the coven (edits its pages, positions and details)' },
] as const;

export function missingAnswers(questions: Question[], answers: Record<string, string>): Question[] {
  return (questions ?? []).filter((q) => q.required && !String(answers[q.id] ?? '').trim());
}

export function filterDirectory(covens: Coven[], query: string, joining: 'all' | Joining = 'all'): Coven[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return covens.filter((c) => {
    if (joining !== 'all' && c.joining !== joining) return false;
    const text = [c.name, c.tagline, c.description, c.tradition, c.meeting_rhythm, ...(c.tags ?? [])].join(' ').toLowerCase();
    return words.every((w) => text.includes(w));
  });
}

// ─── Live lists ──────────────────────────────────────────────────────────

export type Change<T> = { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: Partial<T> & { id?: string }; old?: { id?: string } };

/** Put a live change into a list kept by id: insert, update or delete. */
export function applyChange<T extends { id: string }>(list: T[], change: Change<T>): T[] {
  const items = [...list];
  const record = change.new && Object.keys(change.new).length ? change.new : null;
  const id = record?.id ?? change.old?.id;
  if (!id) return items;
  const at = items.findIndex((item) => item.id === id);
  if (change.eventType === 'DELETE') {
    if (at >= 0) items.splice(at, 1);
    return items;
  }
  if (at >= 0) items[at] = { ...items[at], ...record } as T;
  else items.push(record as T);
  return items;
}

/** Chat messages oldest first, without blocked people's words. */
export function chatMessages(messages: Message[], blocked: string[]): (Message & { hidden: boolean })[] {
  const set = new Set(blocked);
  return [...messages].sort((a, b) => a.created_at.localeCompare(b.created_at)).map((m) => ({ ...m, hidden: !!m.user_id && set.has(m.user_id) }));
}

// ─── Rituals ─────────────────────────────────────────────────────────────

export const orderSteps = (steps: RitualStep[], ritualId?: string) => steps.filter((s) => !ritualId || s.ritual_id === ritualId).sort((a, b) => a.position - b.position);

export function stepIsMine(step: RitualStep | undefined, membership: Member | null, userId: string | null): boolean {
  if (!step || !userId || membership?.status !== 'active') return false;
  if (step.assigned_user_id) return step.assigned_user_id === userId;
  if (step.assigned_rank_id) return step.assigned_rank_id === membership.rank_id;
  return true;
}

export function stepAssignee(step: RitualStep, ranks: Rank[], nameOf: (id: string) => string): { kind: 'person' | 'rank' | 'everyone'; label: string } {
  if (step.assigned_user_id) return { kind: 'person', label: nameOf(step.assigned_user_id) };
  if (step.assigned_rank_id) {
    const rank = ranks.find((r) => r.id === step.assigned_rank_id);
    return { kind: 'rank', label: rank ? `Every ${rank.name}` : 'A position' };
  }
  return { kind: 'everyone', label: 'The whole coven' };
}

export function ritualGroups(rituals: Ritual[]) {
  const time = (r: Ritual) => (r.scheduled_for ? new Date(r.scheduled_for).getTime() : Infinity);
  return {
    live: rituals.filter((r) => r.status === 'live'),
    upcoming: rituals.filter((r) => r.status === 'scheduled').sort((a, b) => time(a) - time(b)),
    past: rituals.filter((r) => r.status === 'done' || r.status === 'cancelled').slice(0, 20),
  };
}

export function occasionLabel(ritual: Pick<Ritual, 'occasion' | 'occasion_name'>): string {
  if (!ritual.occasion) return '';
  const base = OCCASIONS.find((o) => o.value === ritual.occasion)?.label ?? '';
  if (!ritual.occasion_name) return base;
  return ritual.occasion === 'sabbat' ? ritual.occasion_name : `${base} · ${ritual.occasion_name}`;
}

/** The current step of a live ritual that belongs to this person, if any. */
export function myTurn(rituals: Ritual[], steps: RitualStep[], membership: Member | null, userId: string | null): { ritual: Ritual; step: RitualStep } | null {
  for (const ritual of rituals.filter((r) => r.status === 'live')) {
    const step = steps.find((s) => s.id === ritual.current_step_id);
    if (step && stepIsMine(step, membership, userId)) return { ritual, step };
  }
  return null;
}

export function rsvpSummary(rsvps: Rsvp[], ritualId: string, userId: string | null) {
  const list = rsvps.filter((r) => r.ritual_id === ritualId);
  return {
    going: list.filter((r) => r.response === 'going'),
    maybe: list.filter((r) => r.response === 'maybe'),
    notGoing: list.filter((r) => r.response === 'not_going'),
    mine: list.find((r) => r.user_id === userId)?.response ?? null,
  };
}

export function altarActionButton(step: Pick<RitualStep, 'altar_action' | 'altar_label'>): string {
  switch (step.altar_action) {
    case 'light_candle':
      return 'Light your candle';
    case 'place_item':
      return `Place ${step.altar_label || 'your offering'} on the altar`;
    case 'light_all':
      return 'Light the altar’s candles';
    case 'snuff_all':
      return 'Put out the candles';
    default:
      return '';
  }
}

export function altarActionNote(step: Pick<RitualStep, 'altar_action' | 'altar_color' | 'altar_label' | 'assigned_user_id' | 'assigned_rank_id'>): string {
  switch (step.altar_action) {
    case 'light_candle':
      return `Lights a ${step.altar_color || 'white'} candle on the shared altar.${step.assigned_user_id || step.assigned_rank_id ? '' : ' Each member lights their own, and the candles gather in a circle.'}`;
    case 'place_item':
      return `Places ${step.altar_label || 'an offering'} on the shared altar.`;
    case 'light_all':
      return 'Lights every candle on the shared altar.';
    case 'snuff_all':
      return 'Puts out the candles on the shared altar.';
    default:
      return '';
  }
}

export type CovenReminder = { key: string; at: Date; title: string; body: string; url: string };

/**
 * Phone reminders for rites you're going to (or might go to): the day before
 * at the same time and an hour before, skipping times already past.
 */
export function riteReminders(
  entries: { coven: Pick<Coven, 'name' | 'slug'>; ritual: Ritual; response: Rsvp['response'] | null }[],
  now: number = Date.now(),
): CovenReminder[] {
  const out: CovenReminder[] = [];
  for (const { coven, ritual, response } of entries) {
    if (ritual.status !== 'scheduled' || !ritual.scheduled_for || (response !== 'going' && response !== 'maybe')) continue;
    const start = new Date(ritual.scheduled_for).getTime();
    const label = occasionLabel(ritual);
    const when = new Date(start).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    const url = `/coven/c/${coven.slug}/ritual/${ritual.id}`;
    const items: [string, number, string][] = [
      ['day', start - 86400000, `Tomorrow at ${when}`],
      ['hour', start - 3600000, `In an hour, at ${when}`],
    ];
    for (const [kind, at, lead] of items) {
      if (at <= now) continue;
      out.push({ key: `coven-rite-${ritual.id}-${kind}`, at: new Date(at), title: `${ritual.title} · ${coven.name}`, body: `${lead}${label ? ` · ${label}` : ''}`, url });
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, 40);
}

// ─── The altar ───────────────────────────────────────────────────────────

/** A candle's flame, from when it was lit and how long it burns. */
export function candleState(item: Pick<AltarItem, 'kind' | 'lit' | 'lit_at' | 'burn_minutes'>, now: number = Date.now()) {
  if (item.kind !== 'candle' || !item.lit || !item.lit_at) return { lit: false, burntOut: false, remaining: 1, minutesLeft: 0 };
  const total = Math.max(1, item.burn_minutes || 60) * 60000;
  const remaining = Math.max(0, 1 - Math.max(0, now - new Date(item.lit_at).getTime()) / total);
  return { lit: remaining > 0, burntOut: remaining === 0, remaining, minutesLeft: Math.ceil((remaining * total) / 60000) };
}

/** A candle picture, as the website and the database build it. */
export function candleImage(color: string, form: string): string {
  const c = (CANDLE_COLORS as readonly string[]).includes(color) ? color : 'white';
  const f = CANDLE_FORMS.some((x) => x.id === form) ? form : 'vigil';
  if (f === 'vigil') return `/assets/altar/objects/candles/${c}-candle.${c === 'black' || c === 'white' ? 'PNG' : 'png'}`;
  return `/assets/altar/objects/candles/${f}/${c}-${f}.png`;
}

// ─── The coven's book and petitions ──────────────────────────────────────

export function bookSections(pages: BookPage[]): { section: string; pages: BookPage[] }[] {
  const map = new Map<string, BookPage[]>();
  for (const page of pages) {
    const key = (page.section ?? '').trim() || 'Pages';
    map.set(key, [...(map.get(key) ?? []), page]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a === 'Pages' ? 1 : b === 'Pages' ? -1 : a.localeCompare(b)))
    .map(([section, list]) => ({ section, pages: list.sort((a, b) => a.title.localeCompare(b.title)) }));
}

/** Whether this person can tend a petition now (once every twelve hours). */
export function canTend(petition: Petition, tendings: Tending[], userId: string | null, now: number = Date.now()): boolean {
  if (petition.status !== 'open' || !userId) return false;
  return !tendings.some((t) => t.petition_id === petition.id && t.user_id === userId && now - new Date(t.created_at).getTime() < 12 * 3600000);
}

// ─── Words ───────────────────────────────────────────────────────────────

/** The words people see when the database refuses something. */
export function errorMessage(error: unknown): string {
  const text = String((error as { message?: string })?.message ?? error ?? '');
  if (/row-level security|permission denied/i.test(text)) return 'You don’t have permission to do that here.';
  if (/duplicate key|already exists/i.test(text)) return 'That already exists.';
  if (/violates check constraint/i.test(text)) return 'Something there is too long or not allowed.';
  if (/Failed to fetch|Network request failed|NetworkError/i.test(text)) return 'You seem to be offline. Please try again.';
  return text || 'That didn’t work. Please try again.';
}

export function relativeTime(value: string | null | undefined, now: number = Date.now()): string {
  if (!value) return '';
  const minutes = Math.round((now - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(value).toLocaleDateString();
}

export function riteTime(value: string | null): string {
  if (!value) return 'No time set';
  return new Date(value).toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
