import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CourseModule, Question } from '../src/lib/covens/courses/types.ts';
import seeker from '../src/lib/covens/courses/core/seeker.ts';
import elderLeading from '../src/lib/covens/courses/core/elder-leading.ts';
import elderTeaching from '../src/lib/covens/courses/core/elder-teaching.ts';
import elderCare from '../src/lib/covens/courses/core/elder-care.ts';
import elderGovernance from '../src/lib/covens/courses/core/elder-governance.ts';

// Writer G's core modules: the seeker's first thirty days and the four elder modules.
const MODULES: [string, CourseModule][] = [
  ['core-seeker', seeker],
  ['core-elder-leading', elderLeading],
  ['core-elder-teaching', elderTeaching],
  ['core-elder-care', elderCare],
  ['core-elder-governance', elderGovernance],
];

const KINDS = new Set(['study', 'practice', 'reflection', 'ritual', 'attend', 'book', 'oath', 'meeting', 'service', 'other']);
const CHECKERS = new Set(['self', 'mentor', 'manager']);

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

test('module ids are the fixed ones', () => {
  for (const [id, mod] of MODULES) assert.equal(mod.id, id);
});

test('lesson and test ids are unique across the modules and follow the naming', () => {
  const docIds = new Set<string>();
  const quizIds = new Set<string>();
  for (const [id, mod] of MODULES) {
    for (const doc of mod.docs) {
      assert.ok(doc.id.startsWith(`${id}-`), `${doc.id} should start with ${id}-`);
      assert.ok(!docIds.has(doc.id), `duplicate lesson id ${doc.id}`);
      docIds.add(doc.id);
    }
    assert.equal(mod.quizzes.length, 1, `${id} has one test`);
    for (const quiz of mod.quizzes) {
      assert.equal(quiz.id, `quiz-${id}`);
      assert.ok(!quizIds.has(quiz.id));
      quizIds.add(quiz.id);
    }
  }
});

test('lessons have content of a teaching length', () => {
  for (const [, mod] of MODULES) {
    for (const doc of mod.docs) {
      assert.ok(doc.title.trim() && doc.summary.trim(), `${doc.id} has a title and summary`);
      assert.ok(doc.minutes > 0, `${doc.id} minutes`);
      const n = words(doc.body);
      assert.ok(n >= 900 && n <= 2000, `${doc.id} is ${n} words (want 900–2000)`);
    }
  }
});

test('lesson bodies use only the allowed Markdown', () => {
  for (const [, mod] of MODULES) {
    for (const doc of mod.docs) {
      const lines = doc.body.split('\n');
      let titles = 0;
      for (const line of lines) {
        if (/^# /.test(line)) titles++;
        assert.ok(!/^\s*\|/.test(line), `${doc.id}: no tables (${line})`);
        assert.ok(!/^#{4,}/.test(line), `${doc.id}: headings # to ### only (${line})`);
        assert.ok(!/^\s{2,}[-*\d]/.test(line), `${doc.id}: lists are one level (${line})`);
        assert.ok(!/^\s*\* /.test(line), `${doc.id}: bullets use "- " (${line})`);
        const callout = /^> (.*)$/.exec(line);
        if (callout && callout[1].startsWith('**')) {
          assert.ok(/^\*\*(Safety|Try this|Note|Your coven):\*\*/.test(callout[1]), `${doc.id}: callout label (${line})`);
        }
      }
      assert.ok(titles <= 1, `${doc.id}: # at most once`);
      assert.ok(!/\[[^\]]*\]\([^)]*\)/.test(doc.body), `${doc.id}: no links`);
      assert.ok(!/!\[/.test(doc.body), `${doc.id}: no images`);
      assert.ok(!/<\/?[a-zA-Z][^>]*>/.test(doc.body), `${doc.id}: no HTML`);
      assert.ok(!/https?:\/\//.test(doc.body), `${doc.id}: no URLs`);
      assert.ok(!doc.body.includes('`'), `${doc.id}: no code`);
    }
  }
});

test('core modules carry "Your coven" callouts', () => {
  for (const [id, mod] of MODULES) {
    const count = mod.docs.filter((d) => d.body.includes('> **Your coven:**')).length;
    assert.ok(count >= Math.ceil(mod.docs.length / 2), `${id}: ${count} lessons have a Your coven callout`);
  }
});

function checkQuestion(quizId: string, q: Question) {
  const where = `${quizId} ${q.id}`;
  assert.ok(q.prompt.trim(), `${where} prompt`);
  assert.ok(q.explanation.trim(), `${where} explanation`);
  assert.ok(q.points > 0, `${where} points`);
  if (q.type === 'short' || q.type === 'long') {
    assert.ok(q.rubric && q.rubric.trim().length > 40, `${where} rubric`);
    assert.ok(!q.options && !q.correct, `${where}: written questions have no options`);
    return;
  }
  assert.ok(q.options && q.options.length >= 2, `${where} options`);
  assert.ok(q.correct && q.correct.length >= 1, `${where} correct`);
  assert.equal(new Set(q.options).size, q.options.length, `${where}: options differ`);
  for (const i of q.correct) assert.ok(Number.isInteger(i) && i >= 0 && i < q.options.length, `${where}: correct ${i} in range`);
  assert.equal(new Set(q.correct).size, q.correct.length, `${where}: no repeated correct index`);
  if (q.type === 'single') assert.equal(q.correct.length, 1, `${where}: single has one answer`);
  if (q.type === 'truefalse') {
    assert.deepEqual(q.options, ['True', 'False'], `${where}: true/false options`);
    assert.equal(q.correct.length, 1, `${where}: true/false has one answer`);
  }
  if (q.type === 'multi') assert.ok(q.correct.length < q.options.length, `${where}: multi has a wrong option`);
}

test('tests are well formed and scored as the spec asks', () => {
  for (const [, mod] of MODULES) {
    for (const quiz of mod.quizzes) {
      assert.ok(quiz.passPercent >= 1 && quiz.passPercent <= 100);
      assert.equal(quiz.passPercent, 80);
      assert.ok(quiz.questions.length >= 10 && quiz.questions.length <= 15, `${quiz.id}: ${quiz.questions.length} questions`);
      const ids = quiz.questions.map((q) => q.id);
      assert.deepEqual(ids, ids.map((_, i) => `q${i + 1}`), `${quiz.id}: ids q1, q2, …`);
      const written = quiz.questions.filter((q) => q.type === 'short' || q.type === 'long').length;
      assert.ok(written >= 2 && written <= 3, `${quiz.id}: ${written} written questions`);
      for (const q of quiz.questions) checkQuestion(quiz.id, q);
    }
  }
});

test('tasks link lessons and tests that exist, and every test has its own task', () => {
  for (const [id, mod] of MODULES) {
    const docIds = new Set(mod.docs.map((d) => d.id));
    const quizIds = new Set(mod.quizzes.map((q) => q.id));
    const usedDocs = new Set<string>();
    const usedQuizzes = new Set<string>();
    assert.ok(mod.stages.length >= 1, `${id} has stages`);
    for (const stage of mod.stages) {
      assert.ok(stage.title.trim() && stage.intro.trim(), `${id}: stage title and intro`);
      assert.ok(CHECKERS.has(stage.passed_by));
      assert.ok(stage.tasks.length >= 1);
      for (const task of stage.tasks) {
        const where = `${id} / ${task.title}`;
        assert.ok(KINDS.has(task.kind), `${where} kind`);
        assert.ok(CHECKERS.has(task.checked_by), `${where} checked_by`);
        assert.ok(task.times >= 1 && Number.isInteger(task.times), `${where} times`);
        assert.ok(task.instructions.includes('1. '), `${where}: numbered steps`);
        assert.ok(task.holiday == null, `${where}: core tasks have no holiday`);
        for (const d of task.docs ?? []) {
          assert.ok(docIds.has(d), `${where}: lesson ${d} exists`);
          usedDocs.add(d);
        }
        if (task.quiz) {
          assert.ok(quizIds.has(task.quiz), `${where}: test ${task.quiz} exists`);
          usedQuizzes.add(task.quiz);
          assert.equal(task.kind, 'study', `${where}: the test is a study task`);
          assert.equal(task.checked_by, 'mentor', `${where}: written answers get scored`);
          assert.equal(task.response, 'none', `${where}: the test has no answer box`);
        }
      }
    }
    for (const d of docIds) assert.ok(usedDocs.has(d), `${id}: lesson ${d} is used by a task`);
    for (const q of quizIds) assert.ok(usedQuizzes.has(q), `${id}: test ${q} has a task`);
  }
});

test('the seeker module ends in a decision with the High Priestess', () => {
  const stages = seeker.stages;
  assert.equal(stages.length, 3);
  const last = stages[stages.length - 1];
  assert.ok(last.tasks.some((t) => t.kind === 'reflection'));
  assert.ok(last.tasks.some((t) => t.kind === 'meeting' && t.checked_by === 'manager'));
  assert.ok(stages[1].tasks.some((t) => t.kind === 'attend'));
});

test('word counts (for the report)', () => {
  for (const [id, mod] of MODULES) {
    const total = mod.docs.reduce((n, d) => n + words(d.body), 0);
    console.log(`${id}: ${mod.docs.length} lessons, ${total} words; ${mod.docs.map((d) => `${d.id.slice(id.length + 1)} ${words(d.body)}`).join(', ')}`);
  }
});
