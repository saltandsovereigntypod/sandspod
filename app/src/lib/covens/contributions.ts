// What a ritual step can ask of people: something written (a gratitude note,
// a petition, an intention, a vow, an ancestor's name, a question), something
// placed (an offering, a candle in their colour), or something done (their
// own candle lit, their own libation poured, their own card pulled). Asked of
// one person for the coven, or of each person the step is for; written ahead
// of the ritual or during the step.
//
// Who may read each one is set per step (only the writer, the writer and
// those who lead the coven's rituals, the whole coven, or the whole coven
// without the writer's name), and anyone may also seal their own as private:
// it still takes part, and shows on the altar sealed. The database enforces
// all of this (supabase/migrations/…_coven_ritual_contributions.sql,
// coven_ritual_contributions_for); these rules mirror it so the pages show
// the right things. Pure, so it can be tested; the website uses the same
// module (js/core/covens.js).

import { andList, includesMember, membersAmong, type Assignee } from './picker.ts';
import type { Member } from './model.ts';

export type ContributionMode = 'one' | 'each';
export type ContributionVerb = 'write' | 'place' | 'do';
export type ContributionKind = 'petition' | 'intention' | 'gratitude' | 'vow' | 'ancestor' | 'question' | 'reflection' | 'offering' | 'candle' | 'light_candle' | 'libation' | 'card';
export type ContributionTiming = 'ahead' | 'live';
export type ContributionVisibility = 'me' | 'leader' | 'coven' | 'coven_unnamed';
export type ContributionFate = 'keep' | 'burn' | 'bury' | 'release' | 'petition';
export type ContributionStatus = 'written' | 'offered' | 'burned' | 'buried' | 'released' | 'held' | 'answered' | 'closed';

/** What a step asks (coven_ritual_steps.contribution). */
export type StepContribution = {
  mode: ContributionMode;
  kind: ContributionKind;
  timing: ContributionTiming;
  visibility: ContributionVisibility;
  fate: ContributionFate;
  /** A line for the people asked: "What are you grateful to Hekate for?" */
  prompt?: string;
};

/** One person's contribution, as coven_ritual_contributions_for returns it to the reader. */
export type Contribution = {
  id: string;
  ritual_id: string;
  step_id: string;
  coven_id: string;
  /** Null when the reader may not know whose it is. */
  user_id: string | null;
  mine: boolean;
  kind: ContributionKind;
  /** Null when the reader may not read it (sealed). */
  body: string | null;
  items: unknown[];
  private: boolean;
  anonymous: boolean;
  visibility: ContributionVisibility;
  fate: ContributionFate;
  status: ContributionStatus;
  petition_id: string | null;
  outcome_note: string | null;
  support_count: number;
  supported_by_me: boolean;
  /** Who is holding it: only ever given to its writer. */
  supporters: string[] | null;
  created_at: string;
  updated_at: string;
};

export const CONTRIBUTION_KINDS: { id: ContributionKind; verb: ContributionVerb; label: string; noun: string; visibility: ContributionVisibility; fate: ContributionFate }[] = [
  { id: 'petition', verb: 'write', label: 'A petition', noun: 'petition', visibility: 'coven', fate: 'petition' },
  { id: 'intention', verb: 'write', label: 'An intention', noun: 'intention', visibility: 'coven', fate: 'keep' },
  { id: 'gratitude', verb: 'write', label: 'A gratitude note', noun: 'gratitude note', visibility: 'me', fate: 'burn' },
  { id: 'vow', verb: 'write', label: 'A vow', noun: 'vow', visibility: 'leader', fate: 'keep' },
  { id: 'ancestor', verb: 'write', label: 'An ancestor’s name', noun: 'ancestor’s name', visibility: 'coven', fate: 'keep' },
  { id: 'question', verb: 'write', label: 'A question', noun: 'question', visibility: 'coven', fate: 'keep' },
  { id: 'reflection', verb: 'write', label: 'A reflection', noun: 'reflection', visibility: 'me', fate: 'keep' },
  { id: 'offering', verb: 'place', label: 'An offering', noun: 'offering', visibility: 'coven', fate: 'keep' },
  { id: 'candle', verb: 'place', label: 'A candle of their own', noun: 'candle', visibility: 'coven', fate: 'keep' },
  { id: 'light_candle', verb: 'do', label: 'Light their own candle', noun: 'candle', visibility: 'coven', fate: 'keep' },
  { id: 'libation', verb: 'do', label: 'Pour their own libation', noun: 'libation', visibility: 'coven', fate: 'keep' },
  { id: 'card', verb: 'do', label: 'Pull their own card', noun: 'card', visibility: 'coven', fate: 'keep' },
];

export const kindOf = (kind: ContributionKind | string | null | undefined) => CONTRIBUTION_KINDS.find((k) => k.id === kind) ?? CONTRIBUTION_KINDS[0];

export const CONTRIBUTION_MODES: { value: ContributionMode; label: string; detail: string }[] = [
  { value: 'each', label: 'Each person their own', detail: 'Everyone this step is for brings their own.' },
  { value: 'one', label: 'One person for the coven', detail: 'One of them brings it on the coven’s behalf. If no one has by the time the step comes, the leader can.' },
];

export const CONTRIBUTION_TIMINGS: { value: ContributionTiming; label: string; detail: string }[] = [
  { value: 'ahead', label: 'Ahead of time', detail: 'They see it on the ritual and the coven page as something to do, and are reminded before the rite.' },
  { value: 'live', label: 'During the step', detail: 'They do it when the step comes.' },
];

export const CONTRIBUTION_VISIBILITY: { value: ContributionVisibility; label: string; detail: string }[] = [
  { value: 'me', label: 'Only the writer', detail: 'Personal, between them and the gods. No one else reads it.' },
  { value: 'leader', label: 'The writer and the ritual leaders', detail: 'Those who lead the coven’s rituals can read it. No one else can.' },
  { value: 'coven', label: 'The whole coven', detail: 'Everyone in the coven can read it, with the writer’s name.' },
  { value: 'coven_unnamed', label: 'The whole coven, without names', detail: 'Everyone can read it, but no one sees who wrote it.' },
];

export const CONTRIBUTION_FATES: { value: ContributionFate; label: string; detail: string }[] = [
  { value: 'keep', label: 'Kept in the ritual’s record', detail: 'It stays with the ritual, for those who may read it.' },
  { value: 'burn', label: 'Burned on the altar', detail: 'Set on the altar folded, and burned when the papers are released (or when the ritual ends).' },
  { value: 'bury', label: 'Buried', detail: 'Set on the altar folded, and buried when the papers are released (or when the ritual ends).' },
  { value: 'release', label: 'Released', detail: 'Set on the altar folded, and released to the wind when the papers are released (or when the ritual ends).' },
  { value: 'petition', label: 'Becomes a coven petition', detail: 'After it is offered, the coven holds it as a petition and can tend it after the ritual.' },
];

/** What a step asks, for the kind chosen: its usual reader and fate, written ahead for written things, each person their own. */
export function defaultContribution(kind: ContributionKind, overrides: Partial<StepContribution> = {}): StepContribution {
  const k = kindOf(kind);
  return { mode: 'each', kind: k.id, timing: k.verb === 'write' ? 'ahead' : 'live', visibility: k.visibility, fate: k.fate, ...overrides };
}

const pick = <T extends string>(value: unknown, allowed: readonly { value: T }[] | readonly T[], fallback: T): T => {
  const values = (allowed as readonly (T | { value: T })[]).map((a) => (typeof a === 'string' ? a : a.value));
  return values.includes(value as T) ? (value as T) : fallback;
};

/** A step's saved contribution, cleaned (null when it asks nothing). Only written petitions can become coven petitions. */
export function cleanContribution(raw: unknown): StepContribution | null {
  if (!raw || typeof raw !== 'object') return null;
  const c = raw as Partial<StepContribution>;
  if (!CONTRIBUTION_KINDS.some((k) => k.id === c.kind)) return null;
  const kind = kindOf(c.kind);
  const fate = pick(c.fate, CONTRIBUTION_FATES, kind.fate);
  const out: StepContribution = {
    mode: pick(c.mode, CONTRIBUTION_MODES, 'each'),
    kind: kind.id,
    timing: pick(c.timing, CONTRIBUTION_TIMINGS, 'live'),
    visibility: pick(c.visibility, CONTRIBUTION_VISIBILITY, kind.visibility),
    fate: fate === 'petition' && kind.id !== 'petition' ? 'keep' : kind.verb !== 'write' && fate !== 'keep' ? 'keep' : fate,
  };
  const prompt = typeof c.prompt === 'string' ? c.prompt.trim().slice(0, 280) : '';
  if (prompt) out.prompt = prompt;
  return out;
}

/** "Write your petition", "Place your offering", "Light your own candle". */
export function contributionTask(c: Pick<StepContribution, 'kind' | 'mode'>): string {
  const k = kindOf(c.kind);
  const whose = c.mode === 'one' ? 'the coven’s' : 'your';
  if (k.verb === 'write') return `Write ${whose} ${k.noun}`;
  if (k.verb === 'place') return `Place ${whose} ${k.noun}`;
  if (k.id === 'light_candle') return c.mode === 'one' ? 'Light the coven’s candle' : 'Light your own candle';
  if (k.id === 'libation') return c.mode === 'one' ? 'Pour the coven’s libation' : 'Pour your own libation';
  return c.mode === 'one' ? 'Pull a card for the coven' : 'Pull your own card';
}

/** The line under the step for the people asked: who reads it, and what happens to it. */
export function contributionNote(c: StepContribution): string {
  const k = kindOf(c.kind);
  const who = c.mode === 'one' ? 'One person writes it for the coven.' : '';
  const read = k.verb !== 'write'
    ? ''
    : { me: 'Only you will read it.', leader: 'Only you and those who lead the coven’s rituals will read it.', coven: 'The whole coven can read it, with your name.', coven_unnamed: 'The whole coven can read it, without your name.' }[c.visibility];
  const fate = k.verb !== 'write' ? '' : { keep: 'It is kept with the ritual.', burn: 'It will be burned on the altar.', bury: 'It will be buried.', release: 'It will be released.', petition: 'Afterwards the coven holds it as a petition.' }[c.fate];
  return [c.mode === 'one' && k.verb !== 'write' ? '' : who, read, fate, k.verb === 'write' ? 'You can also mark yours private: it still takes part, sealed.' : ''].filter(Boolean).join(' ');
}

// ─── Who may see what (mirrors coven_ritual_contributions_for) ────────────

export type Reader = { userId: string | null; member: boolean; leads: boolean };

type Row = Pick<Contribution, 'user_id' | 'private' | 'anonymous' | 'visibility'> & { owner?: string | null };

const ownerOf = (c: Row) => c.owner ?? c.user_id;

/** Whether the reader knows it exists at all (it shows in their list and on the altar). */
export function isListed(c: Row, reader: Reader): boolean {
  if (reader.userId && ownerOf(c) === reader.userId) return true;
  if (c.visibility === 'me') return false;
  if (c.visibility === 'leader') return reader.leads;
  return reader.member;
}

/** Whether the reader may read its words. Private ones are sealed to everyone but the writer, the leaders too. */
export function canRead(c: Row, reader: Reader): boolean {
  if (reader.userId && ownerOf(c) === reader.userId) return true;
  return !c.private && isListed(c, reader);
}

/** Whether the reader may know who wrote it. */
export function canName(c: Row, reader: Reader): boolean {
  if (reader.userId && ownerOf(c) === reader.userId) return true;
  return !c.anonymous && c.visibility !== 'coven_unnamed' && isListed(c, reader);
}

/**
 * How it's called on the altar and in the list: "Rowan’s petition",
 * "Rowan’s petition (private)", "a private petition", "a petition", "Your petition".
 */
export function contributionLabel(c: Pick<Contribution, 'kind' | 'private' | 'mine'> & { user_id: string | null } & Partial<Pick<Contribution, 'anonymous' | 'visibility'>>, nameOf: (id: string) => string): string {
  const noun = kindOf(c.kind).noun;
  if (c.mine) return `Your ${noun}${c.private ? ' (private)' : ''}`;
  // Never a name it shouldn't carry: anonymous, or written for the coven without names.
  if (c.user_id && !c.anonymous && c.visibility !== 'coven_unnamed') return `${nameOf(c.user_id)}’s ${noun}${c.private ? ' (private)' : ''}`;
  return c.private ? `A private ${noun}` : `A ${noun}`.replace(/^A ([aeiou])/i, 'An $1');
}

/** What the writer can do with their own after the ritual. Only the writer tends, answers or closes it. */
export function ownerActions(c: Pick<Contribution, 'mine' | 'status' | 'petition_id'>): ('answered' | 'closed' | 'held')[] {
  if (!c.mine) return [];
  if (c.status === 'held') return ['answered', 'closed'];
  if (c.status === 'offered' || c.status === 'written') return c.petition_id ? [] : ['held'];
  return [];
}

/** Whether the reader can hold someone else's for them ("light a candle for it"): listed, not theirs, still open. */
export function canSupport(c: Pick<Contribution, 'mine' | 'status'> & Row, reader: Reader): boolean {
  return !c.mine && isListed(c, reader) && ['written', 'offered', 'held'].includes(c.status);
}

// ─── Participation ───────────────────────────────────────────────────────

/** One step's participation, as coven_ritual_participation returns it. */
export type ParticipationRow = { step_id: string; expected: number; done: number; done_users: string[] | null; waiting_users: string[] | null };

/** "14 of 20 have written", "No one has yet", "Done". */
export function participationLine(row: Pick<ParticipationRow, 'expected' | 'done'>, c: Pick<StepContribution, 'kind' | 'mode'>): string {
  const k = kindOf(c.kind);
  const verb = k.verb === 'write' ? 'written' : k.verb === 'place' ? 'placed theirs' : 'done theirs';
  if (c.mode === 'one') return row.done > 0 ? `It has been ${k.verb === 'write' ? 'written' : 'done'}.` : `No one has ${k.verb === 'write' ? 'written it' : 'done it'} yet.`;
  if (!row.expected) return 'No one is asked yet.';
  if (row.done >= row.expected) return `All ${row.expected} have ${verb}.`;
  if (!row.done) return `No one has ${verb} yet (${row.expected} asked).`;
  return `${row.done} of ${row.expected} have ${verb}.`;
}

/** Who has and hasn't, by name, for those allowed to see it (never what they wrote). */
export function participationNames(row: ParticipationRow, nameOf: (id: string) => string): { done: string; waiting: string } {
  const names = (ids: string[] | null) => andList((ids ?? []).map(nameOf).sort((a, b) => a.localeCompare(b)));
  return { done: names(row.done_users), waiting: names(row.waiting_users) };
}

/**
 * Whether this person sees participation: the coven's head always; and the
 * positions and people the head has chosen (coven_ritual_settings.participation_viewers).
 */
export function seesParticipation(viewers: Assignee[], membership: Pick<Member, 'status' | 'rank_id'> | null, userId: string | null, founder: boolean): boolean {
  if (founder) return true;
  if (!viewers.length) return false;
  return includesMember(viewers, membership, userId);
}

/** Expected and done for a step from the rows the reader can count (a planner's preview; the database's count is the real one). */
export function summarise(step: { id: string; assignees: Assignee[] }, members: { user_id: string; rank_id: string | null; status: string }[], written: { step_id: string; user_id: string | null }[]): ParticipationRow {
  const expected = membersAmong(step.assignees, members.filter((m) => m.status === 'active'));
  const done = [...new Set(written.filter((w) => w.step_id === step.id && w.user_id && expected.includes(w.user_id)).map((w) => w.user_id as string))];
  return { step_id: step.id, expected: expected.length, done: done.length, done_users: done, waiting_users: expected.filter((id) => !done.includes(id)) };
}

// ─── Tasks ahead of time ─────────────────────────────────────────────────

export type RitualTask = { ritualId: string; stepId: string; title: string; ritualTitle: string; stepTitle: string; scheduledFor: string | null; mine: boolean };

/**
 * What a person has to do before a rite: each step asking something ahead of
 * time that is theirs (or the coven's one, when no one has written it yet),
 * which they haven't done.
 */
export function ritualTasks(
  rituals: { id: string; title: string; status: string; scheduled_for: string | null }[],
  steps: { id: string; ritual_id: string; title: string; contribution?: unknown; assignees?: unknown; assigned_user_id?: string | null; assigned_rank_id?: string | null }[],
  done: { step_id: string; mine: boolean }[],
  membership: Pick<Member, 'status' | 'rank_id'> | null,
  userId: string | null,
  assigneesOf: (s: (typeof steps)[number]) => Assignee[],
): RitualTask[] {
  const out: RitualTask[] = [];
  for (const ritual of rituals) {
    if (ritual.status !== 'scheduled' && ritual.status !== 'live') continue;
    for (const step of steps.filter((s) => s.ritual_id === ritual.id)) {
      const c = cleanContribution(step.contribution);
      if (!c || c.timing !== 'ahead') continue;
      if (!includesMember(assigneesOf(step), membership, userId)) continue;
      const already = c.mode === 'one' ? done.some((d) => d.step_id === step.id) : done.some((d) => d.step_id === step.id && d.mine);
      if (already) continue;
      out.push({ ritualId: ritual.id, stepId: step.id, title: `${contributionTask(c)} for ${ritual.title}`, ritualTitle: ritual.title, stepTitle: step.title, scheduledFor: ritual.scheduled_for, mine: c.mode === 'each' });
    }
  }
  return out.sort((a, b) => (a.scheduledFor ?? '9').localeCompare(b.scheduledFor ?? '9'));
}

/** A reminder for each task, two days before the rite at its own hour (or now-ish if that's past but the rite isn't). */
export function taskReminders(tasks: RitualTask[], covens: Record<string, { name: string; slug: string }>, ritualCoven: Record<string, string>, now: number = Date.now()) {
  const out: { key: string; at: Date; title: string; body: string; url: string }[] = [];
  for (const task of tasks) {
    if (!task.scheduledFor) continue;
    const start = new Date(task.scheduledFor).getTime();
    const at = start - 2 * 86400000;
    if (at <= now) continue;
    const coven = covens[ritualCoven[task.ritualId]];
    if (!coven) continue;
    out.push({ key: `coven-task-${task.stepId}`, at: new Date(at), title: task.title, body: `${coven.name}’s rite is in two days. ${task.stepTitle}.`, url: `/coven/c/${coven.slug}/ritual/${task.ritualId}` });
  }
  return out;
}

/** What the writer may put in: within length, and items for things placed. */
export function contributionProblem(c: StepContribution, body: string, items: unknown[]): string {
  const k = kindOf(c.kind);
  if (k.verb === 'write' && !body.trim()) return `Write your ${k.noun} first.`;
  if (body.length > 2000) return 'Keep it under 2,000 characters.';
  if (k.verb === 'place' && !items.length && !body.trim()) return `Choose your ${k.noun}, or say what it is.`;
  return '';
}
