// Progress through the Learn Astrology course: which lessons are read and how
// each chapter's quiz went. Kept with the practice tools' synced store, like
// journey progress: one craft entry in the collection 'astro.course' (on the
// phone or in the browser at once, and in the account's craft_entries when
// signed in), the same shape in the app and on the website. Pure.

import { autoScore, isRight, maxPoints, passes, percentOf, type Answers } from '../../covens/quiz.ts';
import { ALL_LESSONS, CHAPTERS, COURSE_ID } from './index.ts';
import type { AstroChapter, AstroLesson } from './types.ts';
import type { Quiz } from '../../covens/courses/types.ts';

export const COURSE_COLLECTION = 'astro.course';

export type QuizRecord = { best: number; passed: boolean; attempts: number; lastAt: string; last: number };

export type CourseProgress = {
  course: typeof COURSE_ID;
  /** Lesson id → when it was marked read (ISO). */
  read: Record<string, string>;
  /** Quiz id → how it has gone. */
  quizzes: Record<string, QuizRecord>;
  startedAt: string;
};

export const newCourseProgress = (now: Date): CourseProgress => ({ course: COURSE_ID, read: {}, quizzes: {}, startedAt: now.toISOString() });

/** A stored copy made safe to read, whatever shape it arrived in. */
export function normalizeCourseProgress(raw: unknown): CourseProgress {
  const v = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const read: Record<string, string> = {};
  if (v.read && typeof v.read === 'object') for (const [k, at] of Object.entries(v.read as Record<string, unknown>)) if (typeof at === 'string') read[k] = at;
  const quizzes: Record<string, QuizRecord> = {};
  if (v.quizzes && typeof v.quizzes === 'object')
    for (const [k, q] of Object.entries(v.quizzes as Record<string, unknown>)) {
      const r = (q && typeof q === 'object' ? q : {}) as Record<string, unknown>;
      const best = Number(r.best);
      if (!Number.isFinite(best)) continue;
      quizzes[k] = {
        best: Math.max(0, Math.min(100, best)),
        passed: r.passed === true,
        attempts: Math.max(1, Number(r.attempts) || 1),
        lastAt: typeof r.lastAt === 'string' ? r.lastAt : '',
        last: Number.isFinite(Number(r.last)) ? Number(r.last) : best,
      };
    }
  return { course: COURSE_ID, read, quizzes, startedAt: typeof v.startedAt === 'string' ? v.startedAt : new Date(0).toISOString() };
}

/** Mark a lesson read (or not). */
export function markLesson(p: CourseProgress, lessonId: string, on: boolean, now: Date): CourseProgress {
  const read = { ...p.read };
  if (on) read[lessonId] = read[lessonId] ?? now.toISOString();
  else delete read[lessonId];
  return { ...p, read };
}

export type QuizResult = { total: number; max: number; percent: number; passed: boolean; right: Record<string, boolean> };

/** Score a course quiz (choice questions only). */
export function scoreQuiz(quiz: Quiz, answers: Answers): QuizResult {
  const total = autoScore(quiz.questions, answers);
  const max = maxPoints(quiz.questions);
  const right = Object.fromEntries(quiz.questions.map((q) => [q.id, isRight(q, answers[q.id]) === true]));
  return { total, max, percent: percentOf(total, max) ?? 0, passed: passes(total, max, quiz.passPercent), right };
}

/** Keep a quiz's result: the best score stays, a pass is kept. */
export function recordQuiz(p: CourseProgress, quizId: string, result: Pick<QuizResult, 'percent' | 'passed'>, now: Date): CourseProgress {
  const before = p.quizzes[quizId];
  return {
    ...p,
    quizzes: {
      ...p.quizzes,
      [quizId]: {
        best: Math.max(before?.best ?? 0, result.percent),
        passed: !!before?.passed || result.passed,
        attempts: (before?.attempts ?? 0) + 1,
        lastAt: now.toISOString(),
        last: result.percent,
      },
    },
  };
}

export type ChapterState = { read: number; lessons: number; quiz: QuizRecord | null; done: boolean };

export function chapterState(p: CourseProgress | null, c: AstroChapter): ChapterState {
  const read = c.lessons.filter((l) => !!p?.read[l.id]).length;
  const quiz = p?.quizzes[c.quiz.id] ?? null;
  return { read, lessons: c.lessons.length, quiz, done: read === c.lessons.length && !!quiz?.passed };
}

export type CourseSummary = { lessonsRead: number; lessons: number; quizzesPassed: number; quizzes: number; chaptersDone: number; percent: number };

export function courseSummary(p: CourseProgress | null): CourseSummary {
  const lessonsRead = ALL_LESSONS.filter((l) => !!p?.read[l.id]).length;
  const quizzesPassed = CHAPTERS.filter((c) => p?.quizzes[c.quiz.id]?.passed).length;
  const steps = ALL_LESSONS.length + CHAPTERS.length;
  return {
    lessonsRead,
    lessons: ALL_LESSONS.length,
    quizzesPassed,
    quizzes: CHAPTERS.length,
    chaptersDone: CHAPTERS.filter((c) => chapterState(p, c).done).length,
    percent: Math.round(((lessonsRead + quizzesPassed) / steps) * 100),
  };
}

export type NextStep = { kind: 'lesson'; lesson: AstroLesson; chapter: AstroChapter } | { kind: 'quiz'; chapter: AstroChapter } | null;

/** The first lesson not read, or the first quiz not passed once its lessons are read; null when the course is done. */
export function nextStep(p: CourseProgress | null): NextStep {
  for (const chapter of CHAPTERS) {
    const lesson = chapter.lessons.find((l) => !p?.read[l.id]);
    if (lesson) return { kind: 'lesson', lesson, chapter };
    if (!p?.quizzes[chapter.quiz.id]?.passed) return { kind: 'quiz', chapter };
  }
  return null;
}

/** The newest progress entry wins when there is more than one (two devices that started apart). */
export function pickProgress<T extends { data: unknown; updatedAt: string }>(entries: T[]): T | null {
  const own = entries.filter((e) => e.data && typeof e.data === 'object' && (e.data as { course?: unknown }).course === COURSE_ID);
  return own.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
}
