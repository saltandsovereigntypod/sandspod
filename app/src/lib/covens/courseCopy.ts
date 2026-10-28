// Copying a ready-made course program into a coven: its lessons and tests
// first (import_coven_course, a few at a time), then the program with each
// task pointing at them (save_coven_program), as a draft for the coven's head
// to make its own. Also the template chooser: each tradition's path of
// programs, and the position each raises people to in this coven. Shared
// with the website as SaltCore.covens.courseCopy. Pure (the course data
// itself is passed in, so it can load on its own).

import type { Award, CourseProgram, PathKey } from './courses/index.ts';
import type { ProgramTemplate } from './programs.ts';

type RankLike = { id: string; name: string; level: number; can_manage?: boolean | null };

/** The coven's own position a program raises people to: by name first, then by level; the leading position for the High Priestess path. */
export function matchAwardRank(award: Award, ranks: RankLike[]): string | null {
  if (!award || !ranks.length) return null;
  if ('leads' in award) {
    const leading = ranks.filter((r) => r.can_manage).sort((a, b) => b.level - a.level)[0];
    return leading?.id ?? null;
  }
  const byName = ranks.find((r) => award.names.includes(r.name.trim().toLowerCase()));
  if (byName) return byName.id;
  return ranks.find((r) => r.level === award.level && !r.can_manage)?.id ?? null;
}

/** "Raises people to Dedicant" (or what the coven calls it). */
export function awardLine(award: Award, ranks: RankLike[], fallback: string | null): string {
  if (!award) return 'Doesn’t change anyone’s position.';
  const id = matchAwardRank(award, ranks);
  const name = ranks.find((r) => r.id === id)?.name;
  if (name) return `Raises those who finish it to ${name}.`;
  return fallback ? `Meant to raise people to ${fallback}; choose which of your positions that is.` : 'Choose the position it raises people to.';
}

export type DocImport = { source_id: string; title: string; summary: string; minutes: number; body: string };
export type QuizImport = { source_id: string; title: string; intro: string; pass_percent: number; questions: unknown[] };

const chunk = <T>(list: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};

/**
 * What to send, in order: lessons and tests in small batches (lessons are
 * long), then the program (a draft; its position only when the caller may
 * choose one, i.e. the coven's head).
 */
export function copyPlan(program: CourseProgram, awardRankId: string | null) {
  const docs: DocImport[] = program.docs.map((d) => ({ source_id: d.id, title: d.title, summary: d.summary, minutes: d.minutes, body: d.body }));
  const quizzes: QuizImport[] = program.quizzes.map((q) => ({ source_id: q.id, title: q.title, intro: q.intro, pass_percent: q.passPercent, questions: q.questions }));
  const batches: { docs: DocImport[]; quizzes: QuizImport[] }[] = [
    ...chunk(docs, 6).map((d) => ({ docs: d, quizzes: [] as QuizImport[] })),
    ...chunk(quizzes, 10).map((q) => ({ docs: [] as DocImport[], quizzes: q })),
  ];
  const head: Record<string, unknown> = {
    kind: program.kind,
    title: program.title,
    summary: program.summary,
    description: program.description,
    template_id: program.id,
    self_enroll: false,
    status: 'draft',
  };
  if (awardRankId) head.award_rank_id = awardRankId;
  const stages = program.stages.map((s) => ({
    id: null,
    title: s.title.trim().slice(0, 120),
    intro: s.intro?.trim() || null,
    min_days: s.min_days ?? null,
    passed_by: s.passed_by,
    tasks: s.tasks.map((t) => ({
      id: null,
      title: t.title.trim().slice(0, 160),
      kind: t.kind,
      instructions: t.instructions?.trim() || null,
      resources: null,
      times: t.times || 1,
      response: t.response,
      checked_by: t.checked_by,
      holiday: t.holiday || null,
      minutes: t.minutes ?? null,
      optional: !!t.optional,
      docs: (t.docs ?? []).map((id) => ({ source_id: id })),
      quiz: t.quiz ? { source_id: t.quiz } : null,
    })),
  }));
  return { batches, head, stages };
}

// ─── The chooser ─────────────────────────────────────────────────────────

export type PathGroup = { tradition: string; name: string; programs: CourseProgram[]; suggested: boolean };

/**
 * Ready-made programs for the chooser: each tradition the courses cover as
 * one path (the coven's own calendars first), and the database's older
 * templates for the traditions not yet written.
 */
export function chooser(courses: CourseProgram[], templates: ProgramTemplate[], coven: { practice_traditions?: string[] | null } | null | undefined, names: Record<string, string> = {}) {
  const mine = new Set(coven?.practice_traditions ?? []);
  const covered = new Set(courses.map((p) => p.tradition));
  const paths: PathGroup[] = [...covered]
    .map((t) => ({
      tradition: t,
      name: names[t] ?? courses.find((p) => p.tradition === t)?.title.split(':')[0] ?? t,
      programs: courses.filter((p) => p.tradition === t).sort((a, b) => a.position - b.position),
      suggested: mine.has(t),
    }))
    .sort((a, b) => Number(b.suggested) - Number(a.suggested) || a.name.localeCompare(b.name));
  const older = [...templates].filter((t) => !t.tradition || !covered.has(t.tradition)).sort((a, b) => a.position - b.position);
  return {
    paths,
    suggestedTemplates: older.filter((t) => t.tradition && mine.has(t.tradition)),
    otherTemplates: older.filter((t) => !t.tradition || !mine.has(t.tradition)),
  };
}

/** The short label of a path step for the chooser ("Seeker", "Devotee" …). */
export const STEP_LABEL: Record<PathKey, string> = { seeker: 'Seeker', devotee: 'Devotee', initiate: 'Initiate', elder: 'Elder', 'high-priestess': 'High Priestess' };

/** The coven already has a program copied from this one. */
export const alreadyCopied = (programs: { template_id: string | null; status: string }[], id: string) => programs.some((p) => p.template_id === id && p.status !== 'archived');

/** A line on how much a program teaches: "6 stages · 24 steps · 18 lessons · 6 tests". */
export function contentsLine(p: Pick<CourseProgram, 'stages' | 'docs' | 'quizzes'>): string {
  const steps = p.stages.reduce((n, s) => n + s.tasks.length, 0);
  const parts = [`${p.stages.length} stage${p.stages.length === 1 ? '' : 's'}`, `${steps} step${steps === 1 ? '' : 's'}`];
  if (p.docs.length) parts.push(`${p.docs.length} lesson${p.docs.length === 1 ? '' : 's'}`);
  if (p.quizzes.length) parts.push(`${p.quizzes.length} test${p.quizzes.length === 1 ? '' : 's'}`);
  return parts.join(' · ');
}
