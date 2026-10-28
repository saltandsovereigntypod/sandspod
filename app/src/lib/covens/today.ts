// What the Today page shows from your covens, most pressing first: your turn
// in a ritual under way, a ritual happening now, the coven's holidays, rites
// coming up and whether you're going, your next initiation or training task,
// and work waiting for you to sign off. Shared by the app's Today screen and
// the website's (as SaltCore.covens.today). Each client loads the rows.

import { assigneesOf, includesMember } from './picker.ts';
import { covenHolidaysBetween, enrollmentSummary, menteesOf, programOutline, waitingForMe, type CovenCalendar, type Enrollment, type Mentorship, type Program, type ProgramStage, type ProgramTask, type TaskProgress } from './programs.ts';

type Coven = CovenCalendar & { id: string; slug: string; name: string; founder_id?: string | null };
type Ritual = { id: string; coven_id: string; title: string; status: string; scheduled_for: string | null; current_step_id: string | null; occasion?: string | null; occasion_name?: string | null; kind?: string | null };
type Step = { id: string; ritual_id: string; assigned_user_id: string | null; assigned_rank_id: string | null; assignees?: unknown; title: string };
type Rsvp = { ritual_id: string; user_id: string; response: 'going' | 'maybe' | 'not_going' };
type Membership = { coven_id: string; user_id: string; rank_id: string | null; status: string };

export type CovenTodayInput = {
  userId: string;
  covens: Coven[];
  memberships: Membership[];
  /** Coven ids where this person manages programs (or is the founder). */
  programCovens: string[];
  rituals: Ritual[];
  steps: Step[];
  rsvps: Rsvp[];
  programs: Program[];
  stages: ProgramStage[];
  tasks: ProgramTask[];
  enrollments: Enrollment[];
  progress: TaskProgress[];
  mentors: Mentorship[];
  /** The coven's positions, for naming yours on the Coven tab's cards (optional: older loaders leave it out). */
  ranks?: { id: string; coven_id: string; name?: string | null }[];
};

export type CovenTodayItem = {
  kind: 'turn' | 'live' | 'holiday' | 'rite' | 'task' | 'review';
  covenSlug: string;
  covenName: string;
  title: string;
  detail: string;
  /** What to open: a ritual, a program, or the coven's Initiation & training for sign-offs. */
  target: { ritual?: string; program?: string; programs?: boolean };
};

const DAY = 86400000;

const when = (iso: string, now: Date) => {
  const d = new Date(iso);
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = d.toDateString() === new Date(now.getTime() + DAY).toDateString();
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `today at ${time}`;
  if (tomorrow) return `tomorrow at ${time}`;
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) + ` at ${time}`;
};

// Its people (picker.ts), or for older steps its one person or position.
const stepIsMine = (step: Step, membership: Membership | undefined, userId: string) => includesMember(assigneesOf(step), membership ?? null, userId);

export function covenTodayItems(input: CovenTodayInput, now = new Date()): CovenTodayItem[] {
  const { userId } = input;
  const out: CovenTodayItem[] = [];
  const covenOf = (id: string) => input.covens.find((c) => c.id === id);
  const base = (covenId: string) => {
    const c = covenOf(covenId);
    return { covenSlug: c?.slug ?? '', covenName: c?.name ?? 'Your coven' };
  };

  // Rituals under way: your turn first.
  for (const r of input.rituals.filter((x) => x.status === 'live')) {
    const step = input.steps.find((s) => s.id === r.current_step_id);
    const membership = input.memberships.find((m) => m.coven_id === r.coven_id && m.user_id === userId);
    if (step && stepIsMine(step, membership, userId)) out.push({ kind: 'turn', ...base(r.coven_id), title: `It’s your turn: ${step.title}`, detail: r.title, target: { ritual: r.id } });
    else out.push({ kind: 'live', ...base(r.coven_id), title: `${r.title} is under way`, detail: step ? `Now: ${step.title}` : 'Join the circle', target: { ritual: r.id } });
  }

  // The coven's holidays today.
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (const c of input.covens) {
    for (const h of covenHolidaysBetween(c, startOfDay, new Date(startOfDay.getTime() + DAY - 1))) {
      out.push({ kind: 'holiday', covenSlug: c.slug, covenName: c.name, title: `${c.name} keeps ${h.name} today`, detail: h.meaning ? h.meaning.split('. ')[0].replace(/\.$/, '') + '.' : '', target: {} });
    }
  }

  // Rites in the next week.
  const soon = input.rituals
    .filter((r) => r.status === 'scheduled' && r.scheduled_for && new Date(r.scheduled_for).getTime() > now.getTime() - 3600000 && new Date(r.scheduled_for).getTime() < now.getTime() + 7 * DAY)
    .sort((a, b) => (a.scheduled_for ?? '').localeCompare(b.scheduled_for ?? ''));
  for (const r of soon.slice(0, 3)) {
    const answer = input.rsvps.find((x) => x.ritual_id === r.id && x.user_id === userId)?.response;
    const yours = answer === 'going' ? 'You’re going.' : answer === 'maybe' ? 'You might come.' : answer === 'not_going' ? 'You can’t make it.' : 'Will you come?';
    out.push({ kind: 'rite', ...base(r.coven_id), title: r.title, detail: `${when(r.scheduled_for!, now)} · ${yours}`, target: { ritual: r.id } });
  }

  // Your programs: the next thing to do, or what you're waiting on.
  for (const e of input.enrollments.filter((x) => x.user_id === userId && x.status === 'active')) {
    const program = input.programs.find((p) => p.id === e.program_id);
    if (!program) continue;
    const s = enrollmentSummary(e, programOutline(program.id, input.stages, input.tasks), input.progress, now.getTime());
    const detail = s.ready
      ? 'Every task in this stage is done. Your mentor or the coven’s leaders confirm it next.'
      : s.returned
        ? `${s.returned} sent back with a note`
        : s.next
          ? `Next: ${s.next.title}`
          : s.waiting
            ? `${s.waiting} waiting for sign-off`
            : s.daysLeft
              ? `${s.daysLeft} more day${s.daysLeft === 1 ? '' : 's'} in this stage`
              : '';
    out.push({ kind: 'task', ...base(e.coven_id), title: program.title, detail: `${s.stage ? `${s.stage.title} · ` : ''}${detail}`.replace(/ · $/, ''), target: { program: program.id } });
  }

  // Work waiting for you to sign off, per coven.
  for (const c of input.covens) {
    const mentees = menteesOf(input.mentors.filter((m) => m.coven_id === c.id), userId);
    const waiting = waitingForMe(input.progress.filter((p) => p.coven_id === c.id), input.tasks, { userId, mentees, programs: input.programCovens.includes(c.id) });
    if (waiting.length) out.push({ kind: 'review', covenSlug: c.slug, covenName: c.name, title: `${waiting.length} ${waiting.length === 1 ? 'piece' : 'pieces'} of work to sign off`, detail: c.name, target: { programs: true } });
  }

  return out.slice(0, 8);
}

/** The coven's holidays coming up soon (not today), for when Today has room. */
export function covenHolidaysSoon(covens: Coven[], now = new Date(), days = 14) {
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return covens
    .flatMap((c) => covenHolidaysBetween(c, from, new Date(from.getTime() + days * DAY)).map((h) => ({ coven: c, holiday: h })))
    .sort((a, b) => a.holiday.date.getTime() - b.holiday.date.getTime())
    .slice(0, 3);
}

export type NextCovenRite = { ritualId: string; covenSlug: string; covenName: string; title: string; meeting: boolean; at: Date; detail: string };

/**
 * The soonest rite or meeting on your covens' calendars, for "Your next
 * working" beside your own plans: from the start of today on (as plans are),
 * leaving out any you've said you can't make.
 */
export function nextCovenRite(input: CovenTodayInput | null | undefined, now = new Date()): NextCovenRite | null {
  if (!input) return null;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const answer = (id: string) => input.rsvps.find((x) => x.ritual_id === id && x.user_id === input.userId)?.response;
  const next = input.rituals
    .filter((r) => r.status === 'scheduled' && r.scheduled_for && new Date(r.scheduled_for).getTime() >= todayStart && answer(r.id) !== 'not_going')
    .sort((a, b) => new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime())[0];
  if (!next) return null;
  const coven = input.covens.find((c) => c.id === next.coven_id);
  const a = answer(next.id);
  const yours = a === 'going' ? 'You’re going' : a === 'maybe' ? 'You might come' : 'Will you come?';
  const covenName = coven?.name ?? 'Your coven';
  return {
    ritualId: next.id,
    covenSlug: coven?.slug ?? '',
    covenName,
    title: next.title,
    meeting: next.kind === 'meeting',
    at: new Date(next.scheduled_for!),
    detail: `${when(next.scheduled_for!, now).replace(/^./, (c) => c.toUpperCase())} · ${covenName} · ${yours}`,
  };
}

export type CovenGlance = {
  /** Your position in the coven ("Initiate", "Founder"), or null when it has no name. */
  position: string | null;
  /** The next gathering: a rite under way, or the soonest one scheduled from the start of today. */
  next: { ritualId: string; title: string; line: string; meeting: boolean; live: boolean } | null;
};

/**
 * One coven at a glance, for its card under My covens: your position there
 * and its next gathering (a rite or meeting). Shared with the website.
 */
export function covenGlance(input: CovenTodayInput | null | undefined, covenId: string, now = new Date()): CovenGlance {
  if (!input) return { position: null, next: null };
  const membership = input.memberships.find((m) => m.coven_id === covenId && m.user_id === input.userId);
  const rank = membership?.rank_id ? input.ranks?.find((r) => r.id === membership.rank_id) : undefined;
  const coven = input.covens.find((c) => c.id === covenId);
  const position = rank?.name?.trim() || (coven?.founder_id && coven.founder_id === input.userId ? 'Founder' : null);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const ours = input.rituals.filter((r) => r.coven_id === covenId);
  const live = ours.find((r) => r.status === 'live');
  const soonest = ours
    .filter((r) => r.status === 'scheduled' && r.scheduled_for && new Date(r.scheduled_for).getTime() >= todayStart)
    .sort((a, b) => new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime())[0];
  const ritual = live ?? soonest;
  if (!ritual) return { position, next: null };
  const meeting = ritual.kind === 'meeting';
  const line = live ? `${ritual.title} is under way` : `${ritual.title}, ${when(ritual.scheduled_for!, now)}`;
  return { position, next: { ritualId: ritual.id, title: ritual.title, line, meeting, live: !!live } };
}

/** Which comes first for "Your next working": your own plan or a coven's rite (a tie goes to the coven). */
export function nextWorkingFirst(planAt: Date | null, rite: NextCovenRite | null): 'plan' | 'rite' | null {
  if (!rite) return planAt ? 'plan' : null;
  if (!planAt) return 'rite';
  return planAt.getTime() < rite.at.getTime() ? 'plan' : 'rite';
}
