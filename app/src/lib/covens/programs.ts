// Coven initiation and training programs, mentors and the coven's practice
// calendar: the rules the app and the website share (the website loads them
// as SaltCore.covens, built by scripts/build-core.mjs from scripts/core/covens.ts).
// The database decides who may do what
// (supabase/migrations/20261027000000_coven_programs.sql); these say what the
// screens should show and offer.

import { holidaysBetween, nextHoliday, parseCustomHolidays, TRADITIONS, type Holiday, type HolidayChoice } from '../holidays.ts';

export type ProgramKind = 'initiation' | 'training';
export type ProgramStatus = 'draft' | 'open' | 'archived';
export type TaskKind = 'study' | 'practice' | 'reflection' | 'ritual' | 'attend' | 'book' | 'oath' | 'meeting' | 'service' | 'other';
export type CheckedBy = 'self' | 'mentor' | 'manager';
export type PassedBy = 'mentor' | 'manager' | 'self';

export type Program = {
  id: string;
  coven_id: string;
  kind: ProgramKind;
  title: string;
  summary: string | null;
  description: string | null;
  template_id: string | null;
  award_rank_id: string | null;
  self_enroll: boolean;
  status: ProgramStatus;
  position: number;
  created_at?: string;
  updated_at?: string;
};
export type ProgramStage = {
  id: string;
  program_id: string;
  coven_id: string;
  position: number;
  title: string;
  intro: string | null;
  min_days: number | null;
  passed_by: PassedBy;
};
export type ProgramTask = {
  id: string;
  stage_id: string;
  program_id: string;
  coven_id: string;
  position: number;
  title: string;
  kind: TaskKind;
  instructions: string | null;
  resources: string | null;
  times: number;
  response: 'none' | 'text';
  checked_by: CheckedBy;
  holiday: string | null;
  minutes: number | null;
  optional: boolean;
};
export type Assignment = { id: string; program_id: string; coven_id: string; user_id: string | null; rank_id: string | null; assigned_by: string | null; created_at: string };
export type Enrollment = {
  id: string;
  program_id: string;
  coven_id: string;
  user_id: string;
  status: 'active' | 'paused' | 'completed' | 'withdrawn';
  stage_id: string | null;
  stage_started_at: string | null;
  started_at: string;
  completed_at: string | null;
};
export type TaskProgress = {
  id: string;
  enrollment_id: string;
  task_id: string;
  program_id: string;
  coven_id: string;
  user_id: string;
  times_done: number;
  status: 'in_progress' | 'submitted' | 'approved' | 'returned';
  response: string | null;
  submitted_at: string | null;
  checked_by: string | null;
  checked_at: string | null;
  feedback: string | null;
  updated_at?: string;
};
export type StagePass = { enrollment_id: string; stage_id: string; coven_id: string; user_id: string; passed_at: string; passed_by: string | null; note: string | null };
export type Mentorship = { coven_id: string; user_id: string; mentor_id: string; assigned_at: string };
export type Grant = { coven_id: string; user_id: string; power: 'manage_programs' | 'view_progress' };
export type ProgramTemplate = { id: string; kind: ProgramKind; tradition: string | null; title: string; summary: string | null; description: string | null; stages: DraftStage[]; position: number };

export const PROGRAM_KINDS: { value: ProgramKind; label: string; detail: string }[] = [
  { value: 'initiation', label: 'Initiation', detail: 'The path into the coven, or to a higher degree.' },
  { value: 'training', label: 'Training', detail: 'Skills and lore, taken alongside or on their own.' },
];

export const TASK_KINDS: { value: TaskKind; label: string }[] = [
  { value: 'study', label: 'Study' },
  { value: 'practice', label: 'Practice' },
  { value: 'reflection', label: 'Reflection' },
  { value: 'ritual', label: 'Ritual' },
  { value: 'attend', label: 'Attend a rite' },
  { value: 'book', label: 'Book of Shadows' },
  { value: 'oath', label: 'Oath' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'service', label: 'Service' },
  { value: 'other', label: 'Other' },
];

export const CHECKED_BY: { value: CheckedBy; label: string; detail: string }[] = [
  { value: 'self', label: 'Themselves', detail: 'Counted done when they log it.' },
  { value: 'mentor', label: 'Their mentor', detail: 'Their mentor (or a program manager) signs it off.' },
  { value: 'manager', label: 'A program manager', detail: 'Only those who manage programs sign it off.' },
];

export const PASSED_BY: { value: PassedBy; label: string; detail: string }[] = [
  { value: 'mentor', label: 'Their mentor', detail: 'Their mentor (or a program manager) confirms the stage.' },
  { value: 'manager', label: 'A program manager', detail: 'Only those who manage programs confirm it.' },
  { value: 'self', label: 'Themselves', detail: 'They move on once every task is signed off.' },
];

export const ENROLLMENT_STATUS: Record<Enrollment['status'], string> = { active: 'Under way', paused: 'Paused', completed: 'Finished', withdrawn: 'Withdrawn' };

export const kindLabel = (kind: TaskKind) => TASK_KINDS.find((k) => k.value === kind)?.label ?? 'Task';
export const checkedByLabel = (value: CheckedBy) => CHECKED_BY.find((c) => c.value === value)?.label ?? '';

// ─── Who may ─────────────────────────────────────────────────────────────

type RankPowers = { can_manage?: boolean; can_manage_programs?: boolean; can_view_progress?: boolean } | null;

/**
 * Program powers for this person, as the database works them out: from their
 * position, from powers given them by name, or as the founder.
 */
export function programPermissions(args: { member: boolean; founder: boolean; open: boolean; rank: RankPowers; grants: Grant[]; userId: string | null; site?: boolean }) {
  const { member, founder, open, rank, grants, userId } = args;
  const mine = (power: Grant['power']) => grants.some((g) => g.user_id === userId && g.power === power);
  const live = open && member;
  const programs = live && (founder || !!(rank?.can_manage || rank?.can_manage_programs) || mine('manage_programs'));
  const progress = live && (programs || !!rank?.can_view_progress || mine('view_progress'));
  return { programs: programs || !!args.site, progress: progress || !!args.site };
}

export function mentorOf(mentors: Mentorship[], userId: string | null): string | null {
  return mentors.find((m) => m.user_id === userId)?.mentor_id ?? null;
}

export function menteesOf(mentors: Mentorship[], userId: string | null): string[] {
  return mentors.filter((m) => m.mentor_id === userId).map((m) => m.user_id);
}

/** Whether this person may sign off that task for that member (mirrors coven_can_check). */
export function canCheck(task: Pick<ProgramTask, 'checked_by'>, who: { self: boolean; mentor: boolean; programs: boolean }): boolean {
  if (who.self) return false;
  if (who.programs) return true;
  return who.mentor && task.checked_by !== 'manager';
}

/** Whether this person may confirm that stage (mirrors pass_coven_stage). */
export function canPass(stage: Pick<ProgramStage, 'passed_by'>, who: { self: boolean; mentor: boolean; programs: boolean }): boolean {
  if (who.programs && !who.self) return true;
  if (stage.passed_by === 'mentor') return who.mentor && !who.self;
  if (stage.passed_by === 'self') return who.self;
  return false;
}

// ─── Shape and progress ──────────────────────────────────────────────────

export type StageWithTasks = ProgramStage & { tasks: ProgramTask[] };

export function programOutline(programId: string, stages: ProgramStage[], tasks: ProgramTask[]): StageWithTasks[] {
  return stages
    .filter((s) => s.program_id === programId)
    .sort((a, b) => a.position - b.position)
    .map((s) => ({ ...s, tasks: tasks.filter((t) => t.stage_id === s.id).sort((a, b) => a.position - b.position) }));
}

export type TaskState = 'todo' | 'in_progress' | 'submitted' | 'approved' | 'returned';

export function taskState(task: ProgramTask, row: TaskProgress | undefined): { state: TaskState; done: number; label: string } {
  const done = row?.times_done ?? 0;
  const state: TaskState = row ? row.status : 'todo';
  const counted = task.times > 1 ? ` · ${done} of ${task.times}` : '';
  const label = {
    todo: task.times > 1 ? `0 of ${task.times}` : 'To do',
    in_progress: `Begun${counted}`,
    submitted: 'Waiting for sign-off',
    approved: 'Done',
    returned: 'Sent back',
  }[state];
  return { state, done, label };
}

const DAY = 86400000;

/** Days still to spend in the current stage (0 when its time is up). */
export function daysLeft(stage: Pick<ProgramStage, 'min_days'> | undefined, enrollment: Pick<Enrollment, 'stage_started_at' | 'started_at'>, now = Date.now()): number {
  if (!stage?.min_days) return 0;
  const since = new Date(enrollment.stage_started_at ?? enrollment.started_at).getTime();
  return Math.max(0, stage.min_days - Math.floor((now - since) / DAY));
}

export type EnrollmentSummary = {
  stageIndex: number;
  stage: StageWithTasks | undefined;
  stageCount: number;
  required: number;
  approved: number;
  percent: number;
  tasksLeft: number;
  waiting: number;
  returned: number;
  daysLeft: number;
  ready: boolean;
  next: ProgramTask | undefined;
};

/** Where someone is in a program, and what stands between them and the next stage. */
export function enrollmentSummary(enrollment: Enrollment, outline: StageWithTasks[], progress: TaskProgress[], now = Date.now()): EnrollmentSummary {
  const rows = new Map(progress.filter((p) => p.enrollment_id === enrollment.id).map((p) => [p.task_id, p]));
  const all = outline.flatMap((s) => s.tasks.filter((t) => !t.optional));
  const approved = all.filter((t) => rows.get(t.id)?.status === 'approved').length;
  const stageIndex = enrollment.status === 'completed' ? outline.length : Math.max(0, outline.findIndex((s) => s.id === enrollment.stage_id));
  const stage = outline[stageIndex];
  const stageTasks = stage?.tasks ?? [];
  const tasksLeft = stageTasks.filter((t) => !t.optional && rows.get(t.id)?.status !== 'approved').length;
  const waiting = stageTasks.filter((t) => rows.get(t.id)?.status === 'submitted').length;
  const returned = stageTasks.filter((t) => rows.get(t.id)?.status === 'returned').length;
  const left = stage ? daysLeft(stage, enrollment, now) : 0;
  const next = stageTasks.find((t) => !['approved', 'submitted'].includes(rows.get(t.id)?.status ?? '') && !t.optional) ?? stageTasks.find((t) => rows.get(t.id)?.status !== 'approved');
  return {
    stageIndex,
    stage,
    stageCount: outline.length,
    required: all.length,
    approved,
    percent: enrollment.status === 'completed' ? 100 : all.length ? Math.round((approved / all.length) * 100) : 0,
    tasksLeft,
    waiting,
    returned,
    daysLeft: left,
    ready: enrollment.status === 'active' && !!stage && tasksLeft === 0 && left === 0,
    next,
  };
}

/** Work waiting for this person to sign off: their mentees', or everyone's for program managers. */
export function waitingForMe(progress: TaskProgress[], tasks: ProgramTask[], who: { userId: string | null; mentees: string[]; programs: boolean }): TaskProgress[] {
  return progress.filter((p) => {
    if (p.status !== 'submitted' || p.user_id === who.userId) return false;
    const task = tasks.find((t) => t.id === p.task_id);
    if (!task) return false;
    return canCheck(task, { self: false, mentor: who.mentees.includes(p.user_id), programs: who.programs });
  });
}

/** Who a program is assigned to, in words. */
export function assignmentLabel(a: Assignment, rankName: (id: string) => string, nameOf: (id: string) => string): string {
  return a.rank_id ? `Everyone who is ${rankName(a.rank_id)}` : nameOf(a.user_id ?? '');
}

// ─── Designing ───────────────────────────────────────────────────────────

export type DraftTask = Partial<Pick<ProgramTask, 'id'>> & Omit<ProgramTask, 'id' | 'stage_id' | 'program_id' | 'coven_id' | 'position'>;
export type DraftStage = Partial<Pick<ProgramStage, 'id'>> & Omit<ProgramStage, 'id' | 'program_id' | 'coven_id' | 'position'> & { tasks: DraftTask[] };

export const emptyTask = (): DraftTask => ({ title: '', kind: 'practice', instructions: '', resources: '', times: 1, response: 'none', checked_by: 'mentor', holiday: null, minutes: null, optional: false });
export const emptyStage = (): DraftStage => ({ title: '', intro: '', min_days: null, passed_by: 'mentor', tasks: [emptyTask()] });

export function draftFromOutline(outline: StageWithTasks[]): DraftStage[] {
  return outline.map(({ id, title, intro, min_days, passed_by, tasks }) => ({
    id,
    title,
    intro,
    min_days,
    passed_by,
    tasks: tasks.map(({ id: taskId, title: t, kind, instructions, resources, times, response, checked_by, holiday, minutes, optional }) => ({
      id: taskId,
      title: t,
      kind,
      instructions,
      resources,
      times,
      response,
      checked_by,
      holiday,
      minutes,
      optional,
    })),
  }));
}

/** Problems with a program before it's saved, in the words the editor shows. */
export function validateProgram(program: { title: string; status?: string }, stages: DraftStage[]): string[] {
  const errors: string[] = [];
  if (!program.title.trim()) errors.push('Give the program a title.');
  if (program.status === 'open' && !stages.length) errors.push('Add a stage before opening the program.');
  if (stages.length > 30) errors.push('A program can have up to 30 stages.');
  let total = 0;
  stages.forEach((s, i) => {
    if (!s.title.trim()) errors.push(`Stage ${i + 1} needs a title.`);
    if (s.tasks.length > 60) errors.push(`Stage ${i + 1} can have up to 60 tasks.`);
    if (s.min_days !== null && s.min_days !== undefined && (s.min_days < 0 || s.min_days > 1500)) errors.push(`Stage ${i + 1}: the least time is 0 to 1,500 days.`);
    s.tasks.forEach((t, j) => {
      total += 1;
      if (!t.title.trim()) errors.push(`Stage ${i + 1}, task ${j + 1} needs a title.`);
      if (!(t.times >= 1 && t.times <= 400)) errors.push(`Stage ${i + 1}, task ${j + 1}: done 1 to 400 times.`);
    });
  });
  if (total > 400) errors.push('A program can have up to 400 tasks.');
  return errors;
}

/** Stages as save_coven_program takes them. */
export function stagesPayload(stages: DraftStage[]) {
  return stages.map((s) => ({
    id: s.id ?? null,
    title: s.title.trim(),
    intro: s.intro?.trim() || null,
    min_days: s.min_days ?? null,
    passed_by: s.passed_by,
    tasks: s.tasks.map((t) => ({
      id: t.id ?? null,
      title: t.title.trim(),
      kind: t.kind,
      instructions: t.instructions?.trim() || null,
      resources: t.resources?.trim() || null,
      times: t.times || 1,
      response: t.response,
      checked_by: t.checked_by,
      holiday: t.holiday || null,
      minutes: t.minutes ?? null,
      optional: !!t.optional,
    })),
  }));
}

// ─── The coven's practice calendar ───────────────────────────────────────

export type CovenCalendar = { practice_traditions?: string[] | null; practice_holidays?: string[] | null; practice_custom?: unknown; practice_calendars?: string[] | null };

export const CALENDAR_TRADITIONS = TRADITIONS.filter((t) => t.id !== 'custom' && t.holidays.length).map((t) => ({ id: t.id, name: t.name, description: t.description, holidays: t.holidays.map((h) => ({ id: h.id, name: h.name })) }));

/** The coven's holidays as a HolidayChoice, the same shape as a person's Settings. */
export function covenHolidayChoice(coven: CovenCalendar | null | undefined): HolidayChoice {
  return {
    traditions: (coven?.practice_traditions ?? []).filter(Boolean),
    custom: parseCustomHolidays(coven?.practice_custom ?? []),
    picked: coven?.practice_holidays?.length ? coven.practice_holidays : undefined,
  };
}

export const hasCovenCalendar = (coven: CovenCalendar | null | undefined) => !!(coven?.practice_traditions?.length || parseCustomHolidays(coven?.practice_custom ?? []).length);

export function covenHolidaysBetween(coven: CovenCalendar | null | undefined, from: Date, to: Date): Holiday[] {
  if (!hasCovenCalendar(coven)) return [];
  return holidaysBetween(from, to, covenHolidayChoice(coven));
}

export function covenNextHoliday(coven: CovenCalendar | null | undefined, from: Date): Holiday | null {
  if (!hasCovenCalendar(coven)) return null;
  return nextHoliday(from, covenHolidayChoice(coven));
}

/** The names of the coven's calendars, for its About page. */
export function covenCalendarNames(coven: CovenCalendar | null | undefined): string[] {
  const names = (coven?.practice_traditions ?? []).map((id) => TRADITIONS.find((t) => t.id === id)?.name).filter((n): n is string => !!n);
  if (parseCustomHolidays(coven?.practice_custom ?? []).length) names.push('the coven’s own days');
  return names;
}

/** A holiday reference ("wheel/samhain") in words. */
export function holidayName(ref: string | null | undefined): string {
  if (!ref) return '';
  const [tradition, id] = ref.split('/');
  return TRADITIONS.find((t) => t.id === tradition)?.holidays.find((h) => h.id === id)?.name ?? '';
}

/** Ready-made programs with the coven's own calendars first. */
export function templatesFor(templates: ProgramTemplate[], coven: CovenCalendar | null | undefined): { suggested: ProgramTemplate[]; others: ProgramTemplate[] } {
  const traditions = new Set(coven?.practice_traditions ?? []);
  const sorted = [...templates].sort((a, b) => a.position - b.position);
  return { suggested: sorted.filter((t) => t.tradition && traditions.has(t.tradition)), others: sorted.filter((t) => !t.tradition || !traditions.has(t.tradition)) };
}
