import assert from 'node:assert/strict';
import { test } from 'node:test';

import correspondences from '../src/lib/covens/courses/core/correspondences.ts';
import divination from '../src/lib/covens/courses/core/divination.ts';
import moonTiming from '../src/lib/covens/courses/core/moon-timing.ts';
import ritualCoven from '../src/lib/covens/courses/core/ritual-coven.ts';
import spellcraft from '../src/lib/covens/courses/core/spellcraft.ts';
import type { CourseModule } from '../src/lib/covens/courses/types.ts';

const MODULES: [string, CourseModule][] = [
  ['core-correspondences', correspondences],
  ['core-moon-timing', moonTiming],
  ['core-divination', divination],
  ['core-spellcraft', spellcraft],
  ['core-ritual-coven', ritualCoven],
];

const KINDS = new Set(['study', 'practice', 'reflection', 'ritual', 'attend', 'book', 'oath', 'meeting', 'service', 'other']);
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

test('each module has its fixed id, lessons, one test and one or two stages', () => {
  for (const [id, m] of MODULES) {
    assert.equal(m.id, id);
    assert.ok(m.title.trim());
    assert.ok(m.docs.length >= 4, `${id} has at least four lessons`);
    assert.equal(m.quizzes.length, 1, `${id} has one test`);
    assert.ok(m.stages.length >= 1 && m.stages.length <= 2, `${id} has one or two stages`);
  }
});

test('lesson and test ids are unique across the modules and carry their module prefix', () => {
  const docIds = new Set<string>();
  const quizIds = new Set<string>();
  for (const [id, m] of MODULES) {
    for (const d of m.docs) {
      assert.ok(d.id.startsWith(`${id}-`), d.id);
      assert.ok(!docIds.has(d.id), `duplicate lesson ${d.id}`);
      docIds.add(d.id);
    }
    for (const q of m.quizzes) {
      assert.equal(q.id, `quiz-${id}`);
      assert.ok(!quizIds.has(q.id), `duplicate test ${q.id}`);
      quizIds.add(q.id);
    }
  }
});

test('lessons are full length and well formed', () => {
  for (const [, m] of MODULES) {
    for (const d of m.docs) {
      assert.ok(d.title.trim() && d.summary.trim(), d.id);
      assert.ok(d.minutes > 0, d.id);
      const n = words(d.body);
      assert.ok(n >= 900 && n <= 2000, `${d.id} is ${n} words`);
    }
  }
});

test('lesson bodies use only the allowed Markdown', () => {
  for (const [, m] of MODULES) {
    for (const d of m.docs) {
      const lines = d.body.split('\n');
      for (const line of lines) {
        const where = `${d.id}: ${line.slice(0, 60)}`;
        assert.ok(!/^\s*\|/.test(line), `table in ${where}`);
        assert.ok(!/\[[^\]]*\]\([^)]*\)/.test(line), `link in ${where}`);
        assert.ok(!/!\[/.test(line), `image in ${where}`);
        assert.ok(!/<\/?[a-z][^>]*>/i.test(line), `HTML in ${where}`);
        assert.ok(!/https?:\/\//.test(line), `URL in ${where}`);
        assert.ok(!/^\s+(?:[-*]|\d+\.)\s/.test(line), `nested list in ${where}`);
        assert.ok(!/^#{4,}\s/.test(line), `heading too deep in ${where}`);
        assert.ok(!line.includes('`'), `backtick in ${where}`);
        assert.ok(!line.includes('${'), `template placeholder in ${where}`);
        const callout = /^>\s?(.*)$/.exec(line);
        if (callout) assert.match(callout[1], /^\*\*(Safety|Try this|Note|Your coven):\*\* \S/, `callout label in ${where}`);
      }
      assert.ok(lines.filter((l) => /^# /.test(l)).length <= 1, `${d.id} has more than one # heading`);
      // Blocks are separated by blank lines; only list items sit on consecutive lines.
      const isItem = (l: string) => /^(- |\d+\. )/.test(l);
      for (let i = 1; i < lines.length; i++) {
        const [a, b] = [lines[i - 1], lines[i]];
        if (a.trim() && b.trim()) assert.ok(isItem(a) && isItem(b), `${d.id}: missing blank line before “${b.slice(0, 40)}”`);
      }
      // Bold and italic markers are balanced on every line.
      for (const line of lines) {
        const bold = (line.match(/\*\*/g) ?? []).length;
        assert.equal(bold % 2, 0, `unbalanced bold in ${d.id}: ${line.slice(0, 60)}`);
      }
    }
  }
});

test('every lesson set has at least one safety callout or a Your coven callout', () => {
  for (const [id, m] of MODULES) {
    const all = m.docs.map((d) => d.body).join('\n');
    assert.ok(all.includes('> **Safety:**'), `${id} has a safety callout`);
    assert.ok(all.includes('> **Your coven:**'), `${id} has a Your coven callout`);
  }
});

test('every question is valid and the test passes at 80 per cent', () => {
  for (const [, m] of MODULES) {
    for (const quiz of m.quizzes) {
      assert.ok(quiz.passPercent >= 1 && quiz.passPercent <= 100, quiz.id);
      assert.equal(quiz.passPercent, 80, quiz.id);
      assert.ok(quiz.questions.length >= 10 && quiz.questions.length <= 15, `${quiz.id} has ${quiz.questions.length} questions`);
      const ids = new Set<string>();
      let written = 0;
      for (const q of quiz.questions) {
        const where = `${quiz.id}/${q.id}`;
        assert.match(q.id, /^q\d+$/, where);
        assert.ok(!ids.has(q.id), `duplicate ${where}`);
        ids.add(q.id);
        assert.ok(q.prompt.trim() && q.explanation.trim(), where);
        assert.ok(q.points > 0, where);
        if (q.type === 'short' || q.type === 'long') {
          written++;
          assert.ok(q.rubric && q.rubric.trim(), `${where} needs a rubric`);
          assert.ok(!q.options && !q.correct, `${where} written answers have no options`);
          continue;
        }
        assert.ok(q.options && q.options.length >= 2, `${where} needs options`);
        assert.ok(q.correct && q.correct.length >= 1, `${where} needs a correct answer`);
        const options = q.options!;
        const correct = q.correct!;
        assert.equal(new Set(options).size, options.length, `${where} repeats an option`);
        assert.equal(new Set(correct).size, correct.length, `${where} repeats a correct index`);
        for (const i of correct) assert.ok(Number.isInteger(i) && i >= 0 && i < options.length, `${where} index ${i} out of range`);
        if (q.type === 'truefalse') assert.deepEqual(options, ['True', 'False'], where);
        if (q.type === 'single' || q.type === 'truefalse') assert.equal(correct.length, 1, `${where} has exactly one answer`);
        if (q.type === 'multi') assert.ok(correct.length < options.length, `${where} isn't every option`);
      }
      assert.ok(written >= 2 && written <= 3, `${quiz.id} has ${written} written questions`);
    }
  }
});

test('tasks link lessons and tests that exist in their module, and the test is its own task', () => {
  for (const [id, m] of MODULES) {
    const docIds = new Set(m.docs.map((d) => d.id));
    const quizIds = new Set(m.quizzes.map((q) => q.id));
    const linked = new Set<string>();
    let quizTasks = 0;
    for (const stage of m.stages) {
      assert.ok(stage.title.trim() && stage.intro.trim(), id);
      assert.ok(['self', 'mentor', 'manager'].includes(stage.passed_by), id);
      assert.ok(stage.tasks.length > 0, id);
      for (const task of stage.tasks) {
        const where = `${id}: ${task.title}`;
        assert.ok(KINDS.has(task.kind), where);
        assert.ok(task.instructions.trim(), where);
        assert.ok(Number.isInteger(task.times) && task.times >= 1, where);
        assert.ok(task.minutes == null || task.minutes > 0, where);
        assert.equal(task.holiday ?? null, null, `${where}: core tasks keep no holiday`);
        for (const doc of task.docs ?? []) {
          assert.ok(docIds.has(doc), `${where} links unknown lesson ${doc}`);
          linked.add(doc);
        }
        if (task.quiz) {
          quizTasks++;
          assert.ok(quizIds.has(task.quiz), `${where} links unknown test ${task.quiz}`);
          assert.equal(task.kind, 'study', where);
          assert.equal(task.checked_by, 'mentor', where);
          assert.equal(task.response, 'none', where);
        } else {
          assert.ok((task.docs ?? []).length > 0, `${where} links its lessons`);
        }
      }
    }
    assert.equal(quizTasks, 1, `${id} has one test task`);
    for (const d of m.docs) assert.ok(linked.has(d.id), `${id}: lesson ${d.id} is used by a task`);
  }
});
