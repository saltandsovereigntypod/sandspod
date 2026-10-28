import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { alreadyCopied, awardLine, chooser, contentsLine, copyPlan, matchAwardRank } from '../src/lib/covens/courseCopy.ts';
import { composeProgram, coursePrograms, isWritten, MODULES, PATH, traditionPath } from '../src/lib/covens/courses/index.ts';
import type { CourseModule } from '../src/lib/covens/courses/types.ts';
import { lessonHtml, parseInline, parseLesson, readingTime, unsupported } from '../src/lib/covens/lesson.ts';
import { draftFromOutline, stagesPayload, type ProgramStage, type ProgramTask } from '../src/lib/covens/programs.ts';
import {
  attemptLines,
  attemptsToScore,
  autoScore,
  choose,
  emptyQuestion,
  isRight,
  passes,
  readDraft,
  retype,
  scoreLine,
  scoresPayload,
  standingLine,
  unanswered,
  validateQuiz,
  type Attempt,
  type Question,
} from '../src/lib/covens/quiz.ts';
import {
  authorRole,
  cleanDay,
  clock,
  docsForTask,
  filePath,
  fileTypeOf,
  lessonsLine,
  logsSessions,
  sessionsLine,
  sessionsOf,
  timerElapsed,
  timerMinutes,
  timerPause,
  timerStart,
  unreadIn,
  unreadTotal,
  validateDoc,
} from '../src/lib/covens/training.ts';
import { normalizePrefs } from '../src/lib/reminders/prefs.ts';
import { trainingNote, wantsTraining } from '../../supabase/functions/coven-notify/training.ts';

// ─── Lessons ───────────────────────────────────────────────────────────

test('lessons read the small Markdown the courses are written in', () => {
  const blocks = parseLesson(`## Grounding

Grounding is **settling** your attention in your *body*.
It takes a minute.

1. Sit down.
2. Breathe in for a count of four,
   and out for six.

- Feet on the floor
- Shoulders soft

> **Safety:** Stop if you feel distressed.
>
> Talk to your mentor.

> **Your coven:** Ask how your coven grounds.

---

### After`);
  assert.deepEqual(blocks.map((b) => b.type), ['heading', 'paragraph', 'list', 'list', 'callout', 'callout', 'divider', 'heading']);
  const para = blocks[1];
  assert.equal(para.type, 'paragraph');
  if (para.type === 'paragraph') assert.deepEqual(para.spans, [{ text: 'Grounding is ' }, { text: 'settling', bold: true }, { text: ' your attention in your ' }, { text: 'body', italic: true }, { text: '. It takes a minute.' }]);
  const steps = blocks[2];
  if (steps.type === 'list') {
    assert.equal(steps.ordered, true);
    assert.equal(steps.items.length, 2);
    assert.equal(steps.items[1][0].text, 'Breathe in for a count of four, and out for six.');
  }
  const safety = blocks[4];
  if (safety.type === 'callout') {
    assert.equal(safety.kind, 'safety');
    assert.equal(safety.label, 'Safety');
    assert.equal(safety.blocks.length, 2);
  }
  const coven = blocks[5];
  if (coven.type === 'callout') assert.equal(coven.kind, 'coven');
});

test('the website gets the same lesson as HTML, escaped', () => {
  const html = lessonHtml('## A <b>title</b>\n\n> **Try this:** breathe\n\n1. one\n2. two');
  assert.match(html, /<h4 class="ls-h ls-h2">A &lt;b&gt;title&lt;\/b&gt;<\/h4>/);
  assert.match(html, /<aside class="ls-callout ls-callout--try"><p class="ls-callout__label">Try this<\/p><p>breathe<\/p><\/aside>/);
  assert.match(html, /<ol class="ls-list"><li>one<\/li><li>two<\/li><\/ol>/);
  assert.deepEqual(parseInline('a **b *c* d** e'), [{ text: 'a ' }, { text: 'b ', bold: true }, { text: 'c', bold: true, italic: true }, { text: ' d', bold: true }, { text: ' e' }]);
  assert.deepEqual(parseInline('2 * 3 * 4'), [{ text: '2 * 3 * 4' }], 'loose stars stay');
});

test('reading time, and what lessons may not use', () => {
  assert.equal(readingTime({ minutes: 12, body: '' }), 'About 12 minutes');
  assert.equal(readingTime({ minutes: null, body: Array(410).fill('word').join(' ') }), 'About 2 minutes');
  assert.equal(readingTime({ minutes: null, body: 'hi' }), 'About 1 minute');
  assert.deepEqual(unsupported('| a | b |\n![x](y)\n[link](z)\n<b>x</b>'), ['a table', 'an image', 'a link', 'HTML']);
  assert.deepEqual(unsupported('## Fine\n\n- a\n- b'), []);
});

test('a step’s lessons in order, and what has been read', () => {
  const docs = [
    { id: 'd1', coven_id: 'c', title: 'One', summary: null, minutes: 5, body: 'x', file_path: null, file_name: null, file_type: null, source_id: null },
    { id: 'd2', coven_id: 'c', title: 'Two', summary: null, minutes: 5, body: 'x', file_path: null, file_name: null, file_type: null, source_id: null },
  ];
  const links = [
    { task_id: 't', document_id: 'd2', coven_id: 'c', position: 2 },
    { task_id: 't', document_id: 'd1', coven_id: 'c', position: 1 },
    { task_id: 'other', document_id: 'd2', coven_id: 'c', position: 1 },
  ];
  assert.deepEqual(docsForTask('t', links, docs).map((d) => d.id), ['d1', 'd2']);
  const reads = [{ user_id: 'u', document_id: 'd1', coven_id: 'c', read_at: '' }];
  assert.equal(lessonsLine(docsForTask('t', links, docs), reads, 'u'), '1 of 2 lessons read');
  assert.equal(lessonsLine(docsForTask('t', links, docs), [...reads, { user_id: 'u', document_id: 'd2', coven_id: 'c', read_at: '' }], 'u'), 'All 2 lessons read');
  assert.equal(lessonsLine([docs[0]], [], 'u'), '1 lesson to read');
  assert.deepEqual(validateDoc({ title: '', summary: '', minutes: null, body: '', file_path: null, file_name: null, file_type: null }), ['Give the lesson a title.', 'Write the lesson, or add a file.']);
  assert.deepEqual(validateDoc({ title: 'A file', summary: '', minutes: null, body: '', file_path: 'c/x.pdf', file_name: 'x.pdf', file_type: 'application/pdf' }), []);
});

test('lesson files: PDFs and pictures, always in the coven’s own folder', () => {
  assert.equal(fileTypeOf('Notes.PDF'), 'application/pdf');
  assert.equal(fileTypeOf('a.jpeg'), 'image/jpeg');
  assert.equal(fileTypeOf('a.doc'), null);
  assert.equal(fileTypeOf('blob', 'image/webp'), 'image/webp');
  assert.equal(filePath('coven-1', 'abc', 'application/pdf'), 'coven-1/abc.pdf');
});

// ─── Tests ─────────────────────────────────────────────────────────────

const Q: Question[] = [
  { id: 'q1', type: 'single', prompt: 'One?', options: ['a', 'b'], correct: [1], points: 1, explanation: 'b.' },
  { id: 'q2', type: 'multi', prompt: 'Some?', options: ['a', 'b', 'c'], correct: [0, 2], points: 2, explanation: 'a and c.' },
  { id: 'q3', type: 'truefalse', prompt: 'True?', options: ['True', 'False'], correct: [0], points: 1, explanation: 'Yes.' },
  { id: 'q4', type: 'short', prompt: 'Say.', points: 2, explanation: 'So.', rubric: 'Breath and earth.' },
];

test('choice questions score as the database scores them: all the right answers, none of the wrong', () => {
  assert.equal(isRight(Q[1], [2, 0]), true);
  assert.equal(isRight(Q[1], [0]), false);
  assert.equal(isRight(Q[1], [0, 1, 2]), false);
  assert.equal(isRight(Q[0], [0, 1]), false);
  assert.equal(isRight(Q[3], 'words'), null);
  assert.equal(autoScore(Q, { q1: [1], q2: [0, 2], q3: [1], q4: 'x' }), 3);
  assert.equal(passes(4, 5, 80), true);
  assert.equal(passes(3, 5, 80), false);
  assert.equal(passes(0, 0, 80), true);
});

test('answering, and what is left before handing it in', () => {
  assert.deepEqual(choose(Q[0], [0], 1), [1]);
  assert.deepEqual(choose(Q[1], [0], 2), [0, 2]);
  assert.deepEqual(choose(Q[1], [0, 2], 0), [2]);
  assert.deepEqual(unanswered(Q, { q1: [1], q2: [], q4: '  ' }), [2, 3, 4]);
});

test('a draft of answers kept on the device is read back safely', () => {
  assert.deepEqual(readDraft(JSON.stringify({ answers: { q1: [1, 'x'], q4: 'hi' }, at: 5, index: 2 })), { answers: { q1: [1], q4: 'hi' }, at: 5, index: 2 });
  assert.equal(readDraft('nonsense'), null);
  assert.equal(readDraft(null), null);
});

test('what a trainee may do next with a test', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  assert.deepEqual(standingLine({ quiz_id: 'x', used: 0, allowed: 3, next_at: null, waiting: false, passed: false }, now), { canTake: true, line: '3 attempts allowed.' });
  assert.equal(standingLine({ quiz_id: 'x', used: 1, allowed: 3, next_at: '2026-10-28T15:00:00Z', waiting: false, passed: false }, now).line, 'You can take it again in 3 hours.');
  assert.equal(standingLine({ quiz_id: 'x', used: 3, allowed: 3, next_at: null, waiting: false, passed: false }, now).canTake, false);
  assert.match(standingLine({ quiz_id: 'x', used: 1, allowed: 3, next_at: null, waiting: true, passed: false }, now).line, /with your mentor/);
  assert.equal(standingLine({ quiz_id: 'x', used: 1, allowed: 3, next_at: null, waiting: false, passed: true }, now).line, 'Passed.');
});

const attempt = (over: Partial<Attempt> = {}): Attempt => ({
  id: 'a1',
  enrollment_id: 'e1',
  task_id: 't1',
  quiz_id: 'qz',
  coven_id: 'c',
  user_id: 'rowan',
  number: 1,
  title: 'Energy test',
  questions: Q,
  pass_percent: 80,
  answers: { q1: [1], q2: [0], q3: [0], q4: 'Breath.' },
  auto_score: 2,
  manual_scores: {},
  total: null,
  max: 6,
  status: 'submitted',
  scored_by: null,
  feedback: null,
  submitted_at: '2026-10-28T10:00:00Z',
  scored_at: null,
  ...over,
});

test('results line by line, with written scores once final', () => {
  const lines = attemptLines(attempt());
  assert.deepEqual(lines.map((l) => l.right), [true, false, true, null]);
  assert.equal(lines[3].points, null, 'written answer not shown before final');
  const final = attemptLines(attempt({ status: 'failed', total: 3, manual_scores: { q4: { points: 1, comment: 'More.' } } }));
  assert.equal(final[3].points, 1);
  assert.equal(final[3].comment, 'More.');
  assert.equal(scoreLine(attempt()), '2 of 6 so far, written answers to be scored');
  assert.equal(scoreLine(attempt({ status: 'failed', total: 3 })), '3 of 6 (50%)');
});

test('scoring: points within each answer’s worth, every written answer before the result', () => {
  assert.deepEqual(scoresPayload(Q, { q4: { points: '2', comment: ' Good ' } }, true), { scores: { q4: { points: 2, comment: 'Good' } }, errors: [] });
  assert.deepEqual(scoresPayload(Q, {}, true).errors, ['Question 4 needs its points.']);
  assert.deepEqual(scoresPayload(Q, {}, false).errors, []);
  assert.deepEqual(scoresPayload(Q, { q4: { points: '3', comment: '' } }, true).errors, ['Question 4: from 0 to 2 points.']);
  const list = [attempt(), attempt({ id: 'a2', user_id: 'other' }), attempt({ id: 'a3', status: 'passed' }), attempt({ id: 'a4', user_id: 'me' })];
  assert.deepEqual(attemptsToScore(list, { userId: 'me', mentees: ['rowan'], programs: false }).map((a) => a.id), ['a1']);
  assert.deepEqual(attemptsToScore(list, { userId: 'me', mentees: [], programs: true }).map((a) => a.id), ['a1', 'a2']);
});

test('writing tests: the editor’s checks mirror the database’s', () => {
  const ok = { title: 'T', pass_percent: 80, retakes: 2, wait_hours: 24, questions: Q };
  assert.deepEqual(validateQuiz(ok), []);
  assert.deepEqual(validateQuiz({ ...ok, questions: [{ ...Q[0], correct: [0, 1] }] }), ['Question 1: mark exactly one right answer.']);
  assert.deepEqual(validateQuiz({ ...ok, questions: [{ ...Q[0], correct: [5] }] }), ['Question 1: a right answer isn’t one of its answers.']);
  assert.deepEqual(validateQuiz({ ...ok, questions: [{ ...Q[0], options: ['a', ''] }] }), ['Question 1: fill in every answer, or remove the empty ones.']);
  assert.ok(validateQuiz({ ...ok, title: ' ', pass_percent: 0 }).length === 2);
  const tf = retype(emptyQuestion(1), 'truefalse');
  assert.deepEqual(tf.options, ['True', 'False']);
  const written = retype(Q[1], 'long');
  assert.equal(written.options, undefined);
  assert.equal(written.rubric, '');
});

// ─── Practice ──────────────────────────────────────────────────────────

test('practice is logged a session at a time: "4 of 10 sessions"', () => {
  const task: Pick<ProgramTask, 'kind' | 'times' | 'minutes'> & { quiz_id?: string | null } = { kind: 'practice', times: 10, minutes: 10 };
  assert.equal(logsSessions(task), true);
  assert.equal(logsSessions({ ...task, kind: 'study' }), false);
  assert.equal(logsSessions({ ...task, quiz_id: 'q' }), false);
  assert.equal(sessionsLine(task, { times_done: 4 }), '4 of 10 sessions');
  assert.equal(sessionsLine({ times: 1, minutes: null }, undefined), '0 of 1 session');
  assert.deepEqual(sessionsOf({ sessions: [{ on: '2026-10-27', minutes: '12', note: '' }, 'junk'] }), [{ on: '2026-10-27', minutes: 12, note: null, at: undefined }]);
  const now = new Date('2026-10-28T09:00:00');
  assert.equal(cleanDay('2026-10-27', now), '2026-10-27');
  assert.equal(cleanDay('2026-02-30', now), null);
  assert.equal(cleanDay('2026-11-05', now), null);
});

test('the practice timer keeps time across pauses', () => {
  let t = timerStart({ startedAt: null, banked: 0 }, 1000);
  assert.equal(timerElapsed(t, 61000), 60);
  t = timerPause(t, 61000);
  assert.equal(timerElapsed(t, 99999), 60);
  t = timerStart(t, 100000);
  assert.equal(Math.round(timerElapsed(t, 130000)), 90);
  assert.equal(clock(65), '1:05');
  assert.equal(clock(3725), '1:02:05');
  assert.equal(timerMinutes(20), 0);
  assert.equal(timerMinutes(40), 1);
  assert.equal(timerMinutes(600), 10);
});

// ─── Conversations ─────────────────────────────────────────────────────

test('unread counts and who is speaking', () => {
  const rows = [
    { enrollment_id: 'e1', task_id: 't1', trainee_id: 'r', unread: 2, last_at: '' },
    { enrollment_id: 'e1', task_id: 't2', trainee_id: 'r', unread: 1, last_at: '' },
    { enrollment_id: 'e2', task_id: 't1', trainee_id: 's', unread: 4, last_at: '' },
  ];
  assert.equal(unreadTotal(rows), 7);
  assert.equal(unreadIn(rows, 'e1'), 3);
  assert.equal(authorRole('m', { traineeId: 'r', mentorId: 'm', headId: 'h' }), 'Mentor');
  assert.equal(authorRole('h', { traineeId: 'r', mentorId: 'm', headId: 'h' }), 'Head of the coven');
  assert.equal(authorRole('r', { traineeId: 'r', mentorId: 'm', headId: 'h' }), '');
});

test('training messages ring phones unless turned off or paused', () => {
  assert.equal(wantsTraining(null), true);
  assert.equal(wantsTraining(JSON.stringify({ training: { on: false } })), false);
  assert.equal(wantsTraining({ paused: true }), false);
  assert.equal(wantsTraining({ paused: true, pausedUntil: '2026-10-01' }, new Date('2026-10-28')), true);
  assert.deepEqual(normalizePrefs({}).training, { on: true });
  assert.deepEqual(normalizePrefs({ training: { on: false } }).training, { on: false });
  const toMentor = trainingNote({ covenSlug: 'olive', who: 'Clover', taskTitle: 'Breathe', body: 'I  found\nit hard', programId: 'p', taskId: 't', traineeId: 'c', toTrainee: false });
  assert.deepEqual(toMentor, { title: 'Clover · Breathe', body: 'I found it hard', url: '/coven/c/olive/programs/p?person=c&task=t' });
  assert.equal(trainingNote({ covenSlug: 'olive', who: 'Bramble', taskTitle: 'Breathe', body: 'Well done', programId: 'p', taskId: 't', traineeId: 'c', toTrainee: true }).url, '/coven/c/olive/programs/p?task=t');
});

// ─── Ready-made programs from the courses ──────────────────────────────

const doc = (id: string) => ({ id, title: id, summary: 's', minutes: 10, body: `## ${id}\n\nText.` });
const mod = (id: string, docs: string[], quiz: string | null, stages = 1, own = docs): CourseModule => ({
  id,
  title: id,
  docs: own.map(doc),
  quizzes: quiz ? [{ id: quiz, title: quiz, intro: 'i', passPercent: 80, questions: Q }] : [],
  stages: Array.from({ length: stages }, (_, i) => ({
    title: `${id} ${i + 1}`,
    intro: 'intro',
    passed_by: 'mentor' as const,
    tasks: [
      { title: 'Read', kind: 'study' as const, instructions: '1. Read.', times: 1, response: 'none' as const, checked_by: 'self' as const, docs },
      ...(quiz ? [{ title: 'Take the test', kind: 'study' as const, instructions: 'Take it.', times: 1, response: 'none' as const, checked_by: 'mentor' as const, quiz }] : []),
    ],
  })),
});

test('programs are composed from the written modules only, in the path’s order', () => {
  const modules = [
    mod('core-seeker', ['core-seeker-a'], 'quiz-core-seeker'),
    mod('hellenic-seeker', ['hellenic-seeker-a', 'core-seeker-a', 'missing-doc'], null, 1, ['hellenic-seeker-a']),
    mod('core-welcome', ['core-welcome-a'], 'quiz-core-welcome'),
    { id: 'core-energy', title: 'x', docs: [], quizzes: [], stages: [] },
  ];
  const seeker = composeProgram('hellenic', PATH[0], modules, 'Hellenic')!;
  assert.equal(seeker.id, 'hellenic-seeker');
  assert.equal(seeker.title, 'Hellenic: Your first thirty days');
  assert.deepEqual(seeker.stages.map((s) => s.title), ['core-seeker 1', 'hellenic-seeker 1']);
  assert.deepEqual(seeker.docs.map((d) => d.id).sort(), ['core-seeker-a', 'hellenic-seeker-a']);
  assert.deepEqual(seeker.stages[1].tasks[0].docs, ['hellenic-seeker-a', 'core-seeker-a'], 'unknown lessons dropped');
  assert.equal(seeker.stages[1].min_days, 30, 'the thirty days, on the last stage');
  assert.deepEqual(seeker.missing, []);
  const devotee = composeProgram('hellenic', PATH[1], modules, 'Hellenic')!;
  assert.deepEqual(devotee.stages.map((s) => s.title), ['core-welcome 1']);
  assert.ok(devotee.missing.includes('core-energy') && devotee.missing.includes('hellenic-dedication'));
  assert.equal(composeProgram('hellenic', PATH[3], modules), null, 'nothing written: no elder program yet');
  assert.deepEqual(traditionPath('hellenic', modules).map((p) => p.path), ['seeker', 'devotee']);
  assert.equal(PATH.length, 5);
  assert.deepEqual(PATH.map((p) => p.key), ['seeker', 'devotee', 'initiate', 'elder', 'high-priestess']);
});

test('the bundled modules are sound: placeholders are empty, written ones are well formed', () => {
  const ids = new Set<string>();
  for (const m of MODULES) {
    assert.ok(!ids.has(m.id), `duplicate module ${m.id}`);
    ids.add(m.id);
    if (!isWritten(m)) {
      assert.equal(m.docs.length + m.quizzes.length, 0, `${m.id}: a placeholder has nothing`);
      continue;
    }
    for (const d of m.docs) assert.deepEqual(unsupported(d.body), [], `${d.id} uses only the lessons' Markdown`);
    for (const q of m.quizzes) assert.deepEqual(validateQuiz({ title: q.title, pass_percent: q.passPercent, retakes: 2, wait_hours: 24, questions: q.questions }), [], q.id);
  }
  for (const p of coursePrograms()) {
    assert.ok(p.stages.length <= 30, `${p.id}: up to 30 stages`);
    assert.ok(p.stages.every((s) => s.tasks.length <= 60), `${p.id}: up to 60 tasks a stage`);
  }
});

test('copying a course program: lessons and tests first in small batches, then the program pointing at them', () => {
  const modules = [mod('core-seeker', ['a', 'b', 'c', 'd', 'e', 'f', 'g'], 'quiz-core-seeker')];
  const program = composeProgram('hellenic', PATH[0], modules, 'Hellenic')!;
  const plan = copyPlan(program, 'rank-1');
  assert.deepEqual(plan.batches.map((b) => [b.docs.length, b.quizzes.length]), [[6, 0], [1, 0], [0, 1]]);
  assert.equal(plan.head.award_rank_id, 'rank-1');
  assert.equal(plan.head.status, 'draft');
  assert.equal(plan.head.template_id, 'hellenic-seeker');
  assert.deepEqual(plan.stages[0].tasks[0].docs.slice(0, 2), [{ source_id: 'a' }, { source_id: 'b' }]);
  assert.deepEqual(plan.stages[0].tasks[1].quiz, { source_id: 'quiz-core-seeker' });
  assert.equal(copyPlan(program, null).head.award_rank_id, undefined, 'no position unless chosen');
  assert.equal(contentsLine(program), '1 stage · 2 steps · 7 lessons · 1 test');
});

test('the position each program raises people to: the coven’s own name or level, or its leading position', () => {
  const ranks = [
    { id: 's', name: 'Seeker', level: 1 },
    { id: 'd', name: 'Devotee', level: 2 },
    { id: 'i', name: 'Mystes', level: 3 },
    { id: 'e', name: 'Elder', level: 4 },
    { id: 'h', name: 'High Priestess', level: 5, can_manage: true },
  ];
  assert.equal(matchAwardRank({ level: 2, names: ['dedicant', 'devotee'] }, ranks), 'd', 'by name');
  assert.equal(matchAwardRank({ level: 3, names: ['initiate'] }, ranks), 'i', 'by level');
  assert.equal(matchAwardRank({ leads: true }, ranks), 'h');
  assert.equal(matchAwardRank(null, ranks), null);
  assert.equal(matchAwardRank({ level: 9, names: ['x'] }, ranks), null);
  assert.equal(awardLine({ level: 3, names: ['initiate'] }, ranks, 'Initiate'), 'Raises those who finish it to Mystes.');
  assert.equal(awardLine(null, ranks, null), 'Doesn’t change anyone’s position.');
});

test('the chooser: course paths first (the coven’s own calendars on top), older templates for the rest', () => {
  const modules = [mod('core-seeker', ['a'], null)];
  const courses = traditionPath('hellenic', modules);
  const templates = [
    { id: 'hellenic-training', kind: 'training' as const, tradition: 'hellenic', title: 'H', summary: null, description: null, stages: [], position: 1 },
    { id: 'norse-training', kind: 'training' as const, tradition: 'norse', title: 'N', summary: null, description: null, stages: [], position: 2 },
    { id: 'wheel-training', kind: 'training' as const, tradition: 'wheel', title: 'W', summary: null, description: null, stages: [], position: 3 },
  ];
  const c = chooser(courses, templates, { practice_traditions: ['hellenic', 'norse'] }, { hellenic: 'Hellenic' });
  assert.deepEqual(c.paths.map((p) => [p.tradition, p.suggested, p.programs.length]), [['hellenic', true, 1]]);
  assert.deepEqual(c.suggestedTemplates.map((t) => t.id), ['norse-training'], 'hellenic’s older template is replaced by its course');
  assert.deepEqual(c.otherTemplates.map((t) => t.id), ['wheel-training']);
  assert.equal(alreadyCopied([{ template_id: 'hellenic-seeker', status: 'draft' }], 'hellenic-seeker'), true);
  assert.equal(alreadyCopied([{ template_id: 'hellenic-seeker', status: 'archived' }], 'hellenic-seeker'), false);
});

test('the editor keeps each task’s lessons and test, and older saves leave them alone', () => {
  const stage: ProgramStage = { id: 's1', program_id: 'p', coven_id: 'c', position: 1, title: 'S', intro: null, min_days: null, passed_by: 'mentor' };
  const task: ProgramTask = { id: 't1', stage_id: 's1', program_id: 'p', coven_id: 'c', position: 1, title: 'T', kind: 'study', instructions: null, resources: null, times: 1, response: 'none', checked_by: 'self', holiday: null, minutes: null, optional: false, quiz_id: 'qz' };
  const outline = [{ ...stage, tasks: [task] }];
  const plain = draftFromOutline(outline);
  assert.equal(plain[0].tasks[0].docs, undefined);
  assert.equal('docs' in stagesPayload(plain)[0].tasks[0], false, 'no docs key: links kept as they are');
  const full = draftFromOutline(outline, { links: [{ task_id: 't1', document_id: 'd2', position: 2 }, { task_id: 't1', document_id: 'd1', position: 1 }], docs: [{ id: 'd1', title: 'One' }, { id: 'd2', title: 'Two' }], quizzes: [{ id: 'qz', title: 'Quiz' }] });
  assert.deepEqual(full[0].tasks[0].docs, [{ id: 'd1', title: 'One' }, { id: 'd2', title: 'Two' }]);
  assert.deepEqual(full[0].tasks[0].quiz, { id: 'qz', title: 'Quiz' });
  const payload = stagesPayload(full)[0].tasks[0] as Record<string, unknown>;
  assert.deepEqual(payload.docs, [{ id: 'd1' }, { id: 'd2' }]);
  assert.deepEqual(payload.quiz, { id: 'qz' });
  full[0].tasks[0].quiz = null;
  assert.equal((stagesPayload(full)[0].tasks[0] as Record<string, unknown>).quiz, null);
});

test('the website’s copy of the ready-made programs is up to date (node scripts/build-core.mjs courses)', () => {
  const built = JSON.parse(readFileSync(new URL('../../js/core/course-programs.json', import.meta.url), 'utf8')) as { programs: unknown[] };
  assert.deepEqual(built.programs, JSON.parse(JSON.stringify(coursePrograms())), 'rebuild js/core/course-programs.json after changing a course');
});
