// The teaching side of a coven's programs: the lessons on each step and who
// has read them, practice logged session by session (with a timer), and the
// conversation on each step between a trainee and those who oversee them.
// The database decides who may do and see what
// (supabase/migrations/20261110000100_coven_courses.sql); these say what the
// screens show. Shared with the website as SaltCore.covens.training. Pure.

import type { ProgramTask, TaskProgress } from './programs.ts';

export type ProgramDoc = {
  id: string;
  coven_id: string;
  title: string;
  summary: string | null;
  minutes: number | null;
  body: string;
  file_path: string | null;
  file_name: string | null;
  file_type: FileType | null;
  source_id: string | null;
  created_by?: string | null;
  updated_at?: string;
};
export type TaskDocLink = { task_id: string; document_id: string; coven_id: string; position: number };
export type DocRead = { user_id: string; document_id: string; coven_id: string; read_at: string };
export type PracticeSession = { on: string; minutes: number; note: string | null; at?: string };
export type ProgramMessage = {
  id: string;
  enrollment_id: string;
  task_id: string;
  coven_id: string;
  trainee_id: string;
  author_id: string | null;
  body: string | null;
  attempt_id: string | null;
  created_at: string;
  deleted_at: string | null;
};
export type ThreadUnread = { enrollment_id: string; task_id: string; trainee_id: string; unread: number; last_at: string };

// ─── Lessons ─────────────────────────────────────────────────────────────

export type FileType = 'application/pdf' | 'image/png' | 'image/jpeg' | 'image/webp';
export const FILE_TYPES: FileType[] = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
/** The bucket's own limit (15 MB). */
export const MAX_FILE_BYTES = 15 * 1024 * 1024;
export const FILE_BUCKET = 'coven-program-files';

export const isImage = (type: string | null | undefined) => !!type && type.startsWith('image/');
export const fileLabel = (doc: Pick<ProgramDoc, 'file_type' | 'file_name'>) => (doc.file_type === 'application/pdf' ? 'PDF' : isImage(doc.file_type) ? 'Picture' : 'File') + (doc.file_name ? `: ${doc.file_name}` : '');

/** A file's type from what the picker says, or its name. Null when it isn't one lessons take. */
export function fileTypeOf(name: string, given?: string | null): FileType | null {
  if (given && (FILE_TYPES as string[]).includes(given)) return given as FileType;
  const ext = /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase();
  return ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : null;
}

/** Where a lesson's file goes in the bucket: always under the coven's own folder. */
export function filePath(covenId: string, id: string, type: FileType): string {
  const ext = type === 'application/pdf' ? 'pdf' : type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
  return `${covenId}/${id}.${ext}`;
}

/** The step's lessons, in order. */
export function docsForTask(taskId: string, links: TaskDocLink[], docs: ProgramDoc[]): ProgramDoc[] {
  return links
    .filter((l) => l.task_id === taskId)
    .sort((a, b) => a.position - b.position)
    .map((l) => docs.find((d) => d.id === l.document_id))
    .filter((d): d is ProgramDoc => !!d);
}

export const isRead = (reads: DocRead[], userId: string | null, docId: string) => reads.some((r) => r.user_id === userId && r.document_id === docId);

/** "2 of 3 lessons read". */
export function lessonsLine(docs: Pick<ProgramDoc, 'id'>[], reads: DocRead[], userId: string | null): string {
  if (!docs.length) return '';
  const read = docs.filter((d) => isRead(reads, userId, d.id)).length;
  if (docs.length === 1) return read ? 'Lesson read' : '1 lesson to read';
  return read === docs.length ? `All ${docs.length} lessons read` : `${read} of ${docs.length} lessons read`;
}

/** The steps (tasks) a lesson is on, for "Used on" in the lessons list. */
export const tasksUsing = (docId: string, links: TaskDocLink[]) => links.filter((l) => l.document_id === docId).map((l) => l.task_id);

/** A new lesson's fields, and problems with one before it's saved. */
export type DraftDoc = { title: string; summary: string; minutes: number | null; body: string; file_path: string | null; file_name: string | null; file_type: FileType | null };
export const emptyDoc = (): DraftDoc => ({ title: '', summary: '', minutes: null, body: '', file_path: null, file_name: null, file_type: null });
export function validateDoc(d: DraftDoc): string[] {
  const errors: string[] = [];
  if (!d.title.trim()) errors.push('Give the lesson a title.');
  if (d.title.length > 160) errors.push('Keep the title under 160 characters.');
  if (d.summary.length > 600) errors.push('Keep the summary under 600 characters.');
  if (d.body.length > 60000) errors.push('The lesson is too long; split it in two.');
  if (d.minutes !== null && !(d.minutes >= 0 && d.minutes <= 600)) errors.push('Reading time from 0 to 600 minutes.');
  if (!d.body.trim() && !d.file_path) errors.push('Write the lesson, or add a file.');
  return errors;
}

// ─── Practice, session by session ────────────────────────────────────────

/** Steps that are practised and logged a session at a time (the others are logged once or by their test). */
export const logsSessions = (task: Pick<ProgramTask, 'kind'> & { quiz_id?: string | null }) => !task.quiz_id && ['practice', 'ritual', 'service', 'attend'].includes(task.kind);

export function sessionsOf(row: { sessions?: unknown } | null | undefined): PracticeSession[] {
  const list = Array.isArray(row?.sessions) ? (row!.sessions as unknown[]) : [];
  return list
    .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
    .map((s) => ({ on: String(s.on ?? '').slice(0, 10), minutes: Number(s.minutes) || 0, note: typeof s.note === 'string' && s.note ? s.note : null, at: typeof s.at === 'string' ? s.at : undefined }));
}

/** "4 of 10 sessions" (or "4 of 10 times" for steps that aren't timed). */
export function sessionsLine(task: Pick<ProgramTask, 'times' | 'minutes'>, row: Pick<TaskProgress, 'times_done'> | undefined): string {
  const done = row?.times_done ?? 0;
  return `${done} of ${task.times} session${task.times === 1 ? '' : 's'}`;
}

/** Minutes practised in all. */
export const minutesPractised = (sessions: PracticeSession[]) => sessions.reduce((n, s) => n + s.minutes, 0);

/** Today as YYYY-MM-DD, in the person's own time. */
export function todayKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** A day typed or chosen, if it's a real day no later than tomorrow. */
export function cleanDay(value: string, now = new Date()): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime()) || todayKey(d) !== value) return null;
  return d.getTime() - now.getTime() > 36 * 3600000 ? null : value;
}

/** A timer's reading: "12:05", or "1:02:05" past the hour. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`;
}

/** Minutes to log from a timer: rounded, at least one once it's run a little. */
export const timerMinutes = (seconds: number) => (seconds < 30 ? 0 : Math.max(1, Math.round(seconds / 60)));

/** A timer that survives the screen going away: started at, and time already banked before a pause. */
export type TimerState = { startedAt: number | null; banked: number };
export const timerElapsed = (t: TimerState, now = Date.now()) => t.banked + (t.startedAt ? (now - t.startedAt) / 1000 : 0);
export const timerStart = (t: TimerState, now = Date.now()): TimerState => (t.startedAt ? t : { ...t, startedAt: now });
export const timerPause = (t: TimerState, now = Date.now()): TimerState => ({ startedAt: null, banked: timerElapsed(t, now) });

// ─── A conversation on each step ─────────────────────────────────────────

export const threadKey = (enrollmentId: string, taskId: string) => `${enrollmentId}:${taskId}`;

export function unreadMap(rows: ThreadUnread[]): Map<string, number> {
  return new Map(rows.map((r) => [threadKey(r.enrollment_id, r.task_id), r.unread]));
}

export const unreadTotal = (rows: ThreadUnread[]) => rows.reduce((n, r) => n + (r.unread || 0), 0);

/** Unread in one program for one person (their own path, or a mentee's). */
export const unreadIn = (rows: ThreadUnread[], enrollmentId: string) => rows.filter((r) => r.enrollment_id === enrollmentId).reduce((n, r) => n + r.unread, 0);

/** A step's messages, oldest first, without those removed. */
export function threadMessages(messages: ProgramMessage[], enrollmentId: string, taskId: string): ProgramMessage[] {
  return messages.filter((m) => m.enrollment_id === enrollmentId && m.task_id === taskId).sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/** Who a trainee is talking with on a step, in words: "your mentor, Hazel", "the coven's leaders". */
export function threadWith(args: { self: boolean; mentorName: string | null; traineeName: string }): string {
  if (!args.self) return `${args.traineeName}, and those who oversee their training`;
  return args.mentorName ? `your mentor, ${args.mentorName}, and the coven’s leaders` : 'the coven’s leaders';
}

/** The role shown beside a message's author. */
export function authorRole(authorId: string | null, args: { traineeId: string; mentorId: string | null; headId: string | null }): string {
  if (!authorId) return '';
  if (authorId === args.traineeId) return '';
  if (authorId === args.mentorId) return 'Mentor';
  if (authorId === args.headId) return 'Head of the coven';
  return 'Program leader';
}
