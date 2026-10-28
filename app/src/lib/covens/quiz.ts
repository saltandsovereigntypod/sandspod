// Tests on a coven program's steps: the coven's copies of them, attempts and
// their scores, what a trainee may do next, and the words for each. The
// database scores and decides (supabase/migrations/20261110000100_coven_courses.sql:
// submit_coven_quiz, score_coven_quiz); these say what the screens show.
// Shared with the website as SaltCore.covens.quiz. Pure.

import type { Question, QuestionType, Quiz } from './courses/types.ts';

export type { Question, QuestionType };

/** A coven's test, as coven_quiz_view gives it (questions without the key unless with_key). */
export type CovenQuiz = {
  id: string;
  coven_id: string;
  title: string;
  intro: string | null;
  pass_percent: number;
  retakes: number;
  wait_hours: number;
  source_id: string | null;
  with_key?: boolean;
  questions: Question[];
};

/** An answer: the chosen options' indices, or the words written. */
export type Answer = number[] | string;
export type Answers = Record<string, Answer>;
export type ManualScore = { points: number; comment: string | null };

export type Attempt = {
  id: string;
  enrollment_id: string;
  task_id: string;
  quiz_id: string | null;
  coven_id: string;
  user_id: string;
  number: number;
  title: string;
  questions: Question[];
  pass_percent: number;
  answers: Answers;
  auto_score: number;
  manual_scores: Record<string, ManualScore>;
  total: number | null;
  max: number;
  status: 'submitted' | 'scored' | 'passed' | 'failed';
  scored_by: string | null;
  feedback: string | null;
  submitted_at: string;
  scored_at: string | null;
};

/** coven_quiz_standing: attempts used and allowed, and when the next may be taken. */
export type QuizStanding = { quiz_id: string; used: number; allowed: number; next_at: string | null; waiting: boolean; passed: boolean };

export const QUESTION_TYPES: { value: QuestionType; label: string; detail: string }[] = [
  { value: 'single', label: 'One answer', detail: 'Choose the one right answer. Scored at once.' },
  { value: 'multi', label: 'Several answers', detail: 'Choose every right answer and no wrong ones. Scored at once.' },
  { value: 'truefalse', label: 'True or false', detail: 'Scored at once.' },
  { value: 'short', label: 'A short answer', detail: 'A few sentences, scored by a person against the guide.' },
  { value: 'long', label: 'A longer answer', detail: 'Scored by a person against the guide.' },
];

export const isWritten = (q: Pick<Question, 'type'>) => q.type === 'short' || q.type === 'long';
export const isChoice = (q: Pick<Question, 'type'>) => !isWritten(q);

export const ATTEMPT_STATUS: Record<Attempt['status'], string> = { submitted: 'Waiting to be scored', scored: 'Being scored', passed: 'Passed', failed: 'Not passed yet' };

/** All the points a test is worth. */
export const maxPoints = (questions: Pick<Question, 'points'>[]) => questions.reduce((n, q) => n + (Number(q.points) || 0), 0);

const sameSet = (a: number[], b: number[]) => {
  const x = [...new Set(a)].sort((m, n) => m - n);
  const y = [...new Set(b)].sort((m, n) => m - n);
  return x.length === y.length && x.every((v, i) => v === y[i]);
};

/** Whether a choice answer is right (all the right options, none of the wrong). Null for written answers or without the key. */
export function isRight(q: Question, answer: Answer | undefined): boolean | null {
  if (isWritten(q) || !q.correct) return null;
  return Array.isArray(answer) && sameSet(answer.filter((n) => typeof n === 'number'), q.correct);
}

/** The choice questions' points, as submit_coven_quiz works them out. */
export function autoScore(questions: Question[], answers: Answers): number {
  return questions.reduce((n, q) => n + (isRight(q, answers[q.id]) ? Number(q.points) || 0 : 0), 0);
}

export const passes = (total: number, max: number, passPercent: number) => max === 0 || total * 100 >= passPercent * max;

export const percentOf = (total: number | null, max: number) => (total === null ? null : max ? Math.round((total / max) * 100) : 100);

/** "18 of 20 (90%)". */
export function scoreLine(a: Pick<Attempt, 'total' | 'max' | 'auto_score' | 'status'>): string {
  if (a.total === null || a.status === 'submitted' || a.status === 'scored') return `${fmt(a.auto_score)} of ${fmt(a.max)} so far, written answers to be scored`;
  return `${fmt(a.total)} of ${fmt(a.max)} (${percentOf(a.total, a.max)}%)`;
}
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** Questions left unanswered (their numbers), before handing it in. */
export function unanswered(questions: Pick<Question, 'id' | 'type'>[], answers: Answers): number[] {
  return questions
    .map((q, i) => {
      const a = answers[q.id];
      const answered = isWritten(q) ? typeof a === 'string' && !!a.trim() : Array.isArray(a) && a.length > 0;
      return answered ? 0 : i + 1;
    })
    .filter(Boolean);
}

/** Pick or unpick an option. */
export function choose(q: Pick<Question, 'type'>, current: Answer | undefined, index: number): number[] {
  const list = Array.isArray(current) ? current : [];
  if (q.type !== 'multi') return [index];
  return list.includes(index) ? list.filter((i) => i !== index) : [...list, index].sort((a, b) => a - b);
}

/** What a trainee may do with a step's test now, in words. */
export function standingLine(s: QuizStanding | null, now = Date.now()): { canTake: boolean; line: string } {
  if (!s) return { canTake: false, line: '' };
  if (s.passed) return { canTake: false, line: 'Passed.' };
  if (s.waiting) return { canTake: false, line: 'Your answers are with your mentor to be scored.' };
  const left = s.allowed - s.used;
  if (left <= 0) return { canTake: false, line: 'Every attempt is used. Ask your mentor or the coven’s head about another.' };
  if (s.next_at && new Date(s.next_at).getTime() > now) {
    return { canTake: false, line: `You can take it again ${whenLine(new Date(s.next_at), now)}.` };
  }
  const tries = s.used === 0 ? `${left} attempt${left === 1 ? '' : 's'}` : `${left} more attempt${left === 1 ? '' : 's'}`;
  return { canTake: true, line: `${tries} allowed.` };
}

/** "in 5 hours", "tomorrow at 9:00", "on Friday 6 November". */
export function whenLine(at: Date, now = Date.now()): string {
  const hours = (at.getTime() - now) / 3600000;
  if (hours <= 1) return 'within the hour';
  if (hours < 12) return `in ${Math.ceil(hours)} hours`;
  return `after ${at.toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })}`;
}

/** Each question of an attempt with its answer and how it went, for the result and the scoring screen. */
export type AttemptLine = {
  question: Question;
  number: number;
  answer: Answer | undefined;
  right: boolean | null;
  points: number | null;
  comment: string | null;
};

export function attemptLines(a: Pick<Attempt, 'questions' | 'answers' | 'manual_scores' | 'status'>): AttemptLine[] {
  const final = a.status === 'passed' || a.status === 'failed';
  return a.questions.map((q, i) => {
    const answer = a.answers[q.id];
    if (isWritten(q)) {
      const m = a.manual_scores[q.id];
      return { question: q, number: i + 1, answer, right: null, points: final && m ? m.points : null, comment: final && m ? m.comment : null };
    }
    const right = isRight(q, answer);
    return { question: q, number: i + 1, answer, right, points: right ? q.points : 0, comment: null };
  });
}

/** The words of the chosen options. */
export const answerWords = (q: Question, answer: Answer | undefined) =>
  Array.isArray(answer) ? answer.map((i) => q.options?.[i] ?? '').filter(Boolean).join('; ') || 'No answer' : (answer ?? '').trim() || 'No answer';

/** The right options' words. */
export const rightWords = (q: Question) => (q.correct ?? []).map((i) => q.options?.[i] ?? '').filter(Boolean).join('; ');

/** Attempts waiting for this person to score: their mentees', or everyone's for program managers. */
export function attemptsToScore(attempts: Attempt[], who: { userId: string | null; mentees: string[]; programs: boolean }): Attempt[] {
  return attempts
    .filter((a) => (a.status === 'submitted' || a.status === 'scored') && a.user_id !== who.userId && (who.programs || who.mentees.includes(a.user_id)))
    .sort((a, b) => a.submitted_at.localeCompare(b.submitted_at));
}

/** Scores for score_coven_quiz from what the scorer typed. Problems in words, if any. */
export function scoresPayload(questions: Question[], typed: Record<string, { points: string; comment: string }>, final: boolean): { scores: Record<string, { points: number; comment: string }>; errors: string[] } {
  const scores: Record<string, { points: number; comment: string }> = {};
  const errors: string[] = [];
  questions.forEach((q, i) => {
    if (!isWritten(q)) return;
    const t = typed[q.id];
    const raw = (t?.points ?? '').trim();
    if (!raw) {
      if (final) errors.push(`Question ${i + 1} needs its points.`);
      return;
    }
    const points = Number(raw);
    if (!Number.isFinite(points) || points < 0 || points > q.points) {
      errors.push(`Question ${i + 1}: from 0 to ${q.points} points.`);
      return;
    }
    scores[q.id] = { points, comment: (t?.comment ?? '').trim() };
  });
  return { scores, errors };
}

// ─── Writing tests ───────────────────────────────────────────────────────

export type DraftQuiz = { title: string; intro: string; pass_percent: number; retakes: number; wait_hours: number; questions: Question[] };

export const emptyQuestion = (n: number, type: QuestionType = 'single'): Question => ({
  id: `q${n}`,
  type,
  prompt: '',
  options: type === 'truefalse' ? ['True', 'False'] : type === 'short' || type === 'long' ? undefined : ['', ''],
  correct: type === 'short' || type === 'long' ? undefined : [0],
  points: type === 'short' ? 2 : type === 'long' ? 4 : 1,
  explanation: '',
  rubric: type === 'short' || type === 'long' ? '' : undefined,
});

/** A fresh id for a new question in a test ('q7'). */
export function nextQuestionId(questions: Pick<Question, 'id'>[]): string {
  const used = new Set(questions.map((q) => q.id));
  let n = questions.length + 1;
  while (used.has(`q${n}`)) n += 1;
  return `q${n}`;
}

/** Change a question's kind, keeping what still fits. */
export function retype(q: Question, type: QuestionType): Question {
  const fresh = emptyQuestion(1, type);
  const choice = type !== 'short' && type !== 'long';
  return {
    ...q,
    type,
    options: type === 'truefalse' ? ['True', 'False'] : choice ? (q.options && q.options.length >= 2 && q.type !== 'truefalse' ? q.options : fresh.options) : undefined,
    correct: choice ? (type === 'multi' ? q.correct ?? [0] : [q.correct?.[0] ?? 0]) : undefined,
    rubric: choice ? undefined : q.rubric ?? '',
  };
}

/** Problems with a test before it's saved (mirrors coven_quiz_problem), in the editor's words. */
export function validateQuiz(q: Pick<DraftQuiz, 'title' | 'pass_percent' | 'retakes' | 'wait_hours' | 'questions'>): string[] {
  const errors: string[] = [];
  if (!q.title.trim()) errors.push('Give the test a title.');
  if (!(q.pass_percent >= 1 && q.pass_percent <= 100)) errors.push('The pass mark is from 1 to 100 percent.');
  if (!(q.retakes >= 0 && q.retakes <= 20)) errors.push('Retakes from 0 to 20.');
  if (!(q.wait_hours >= 0 && q.wait_hours <= 720)) errors.push('The wait between attempts is 0 to 720 hours.');
  if (q.questions.length > 60) errors.push('A test can have up to 60 questions.');
  const ids = new Set<string>();
  q.questions.forEach((x, i) => {
    const n = i + 1;
    if (!x.id || ids.has(x.id)) errors.push(`Question ${n} needs its own id.`);
    ids.add(x.id);
    if (!x.prompt.trim()) errors.push(`Question ${n} needs its question.`);
    if (!(x.points >= 0 && x.points <= 100)) errors.push(`Question ${n}: points from 0 to 100.`);
    if (isChoice(x)) {
      const options = x.options ?? [];
      if (options.length < 2 || options.length > 12) errors.push(`Question ${n}: two to twelve answers to choose from.`);
      if (options.some((o) => !o.trim())) errors.push(`Question ${n}: fill in every answer, or remove the empty ones.`);
      const correct = x.correct ?? [];
      if (!correct.length) errors.push(`Question ${n}: mark the right answer.`);
      else if (x.type !== 'multi' && correct.length !== 1) errors.push(`Question ${n}: mark exactly one right answer.`);
      if (correct.some((c) => c < 0 || c >= options.length)) errors.push(`Question ${n}: a right answer isn’t one of its answers.`);
    }
  });
  return errors;
}

/** A ready-made Quiz as import_coven_course takes it. */
export const quizImport = (quiz: Quiz) => ({ source_id: quiz.id, title: quiz.title, intro: quiz.intro, pass_percent: quiz.passPercent, questions: quiz.questions });

/** The key for a draft of answers kept on this device while a test is under way (app and website alike). */
export const draftKey = (enrollmentId: string, taskId: string) => `coven.quizDraft.${enrollmentId}.${taskId}`;

/** A saved draft, if it's sound. */
export function readDraft(raw: string | null | undefined): { answers: Answers; at: number; index: number } | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { answers?: unknown; at?: unknown; index?: unknown };
    if (!v || typeof v !== 'object' || !v.answers || typeof v.answers !== 'object') return null;
    const answers: Answers = {};
    for (const [k, a] of Object.entries(v.answers as Record<string, unknown>)) {
      if (typeof a === 'string') answers[k] = a.slice(0, 8000);
      else if (Array.isArray(a)) answers[k] = a.filter((n): n is number => Number.isInteger(n)).slice(0, 12);
    }
    return { answers, at: Number(v.at) || 0, index: Number.isInteger(v.index) ? Number(v.index) : 0 };
  } catch {
    return null;
  }
}
