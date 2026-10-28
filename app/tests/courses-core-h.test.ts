// Checks Writer H's core course modules for the High Priestess / High Priest
// program: leading a coven, and stewardship of the coven over time.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CourseModule } from '../src/lib/covens/courses/types.ts';
import leading from '../src/lib/covens/courses/core/hp-leading-coven.ts';
import stewardship from '../src/lib/covens/courses/core/hp-stewardship.ts';
import { TRADITIONS } from '../src/lib/holidays.ts';
import { RANK_POWERS } from '../src/lib/covens/model.ts';

const modules: CourseModule[] = [leading, stewardship];
const expectedIds = ['core-hp-leading-coven', 'core-hp-stewardship'];

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
const allText = (m: CourseModule) => m.docs.map((d) => d.body).join('\n');

test('the modules have their fixed ids', () => {
  assert.deepEqual(
    modules.map((m) => m.id),
    expectedIds,
  );
});

test('doc and quiz ids are unique and well formed', () => {
  const docIds = new Set<string>();
  const quizIds = new Set<string>();
  for (const m of modules) {
    for (const d of m.docs) {
      assert.ok(!docIds.has(d.id), `duplicate doc id ${d.id}`);
      docIds.add(d.id);
      assert.ok(d.id.startsWith(`${m.id}-`), `${d.id} should start with ${m.id}-`);
      assert.ok(d.title.trim() && d.summary.trim(), `${d.id} needs a title and summary`);
      assert.ok(d.minutes > 0, `${d.id} needs minutes`);
    }
    assert.equal(m.quizzes.length, 1, `${m.id} has one test`);
    for (const q of m.quizzes) {
      assert.ok(!quizIds.has(q.id), `duplicate quiz id ${q.id}`);
      quizIds.add(q.id);
      assert.equal(q.id, `quiz-${m.id}`);
    }
  }
});

test('every task links lessons and tests that exist', () => {
  const docIds = new Set(modules.flatMap((m) => m.docs.map((d) => d.id)));
  const quizIds = new Set(modules.flatMap((m) => m.quizzes.map((q) => q.id)));
  for (const m of modules) {
    assert.ok(m.stages.length >= 1, `${m.id} has a stage`);
    let hasTest = false;
    for (const stage of m.stages) {
      assert.ok(stage.title.trim() && stage.intro.trim());
      assert.ok(['self', 'mentor', 'manager'].includes(stage.passed_by));
      assert.ok(stage.tasks.length > 0);
      for (const task of stage.tasks) {
        assert.ok(task.title.trim() && task.instructions.trim(), `${m.id}: task needs title and instructions`);
        assert.ok(Number.isInteger(task.times) && task.times >= 1, `${task.title}: times`);
        assert.ok(task.minutes == null || task.minutes > 0, `${task.title}: minutes`);
        for (const id of task.docs ?? []) assert.ok(docIds.has(id), `${task.title}: unknown doc ${id}`);
        if (task.quiz) {
          assert.ok(quizIds.has(task.quiz), `${task.title}: unknown quiz ${task.quiz}`);
          if (task.quiz === `quiz-${m.id}`) {
            hasTest = true;
            assert.equal(task.kind, 'study');
            assert.equal(task.checked_by, 'mentor');
            assert.equal(task.response, 'none');
          }
        } else {
          assert.ok((task.docs ?? []).length > 0, `${task.title}: links its lessons`);
        }
      }
    }
    assert.ok(hasTest, `${m.id} has a "Take the test" task`);
    const used = new Set(m.stages.flatMap((s) => s.tasks.flatMap((t) => t.docs ?? [])));
    for (const d of m.docs) assert.ok(used.has(d.id), `${d.id} isn't linked from any task`);
  }
});

test('every question is valid', () => {
  for (const m of modules) {
    for (const quiz of m.quizzes) {
      assert.ok(quiz.passPercent >= 1 && quiz.passPercent <= 100, `${quiz.id} passPercent`);
      assert.equal(quiz.passPercent, 80);
      assert.ok(quiz.questions.length >= 10 && quiz.questions.length <= 15, `${quiz.id} has 10 to 15 questions`);
      const ids = new Set<string>();
      let written = 0;
      for (const q of quiz.questions) {
        const where = `${quiz.id} ${q.id}`;
        assert.ok(!ids.has(q.id), `${where} duplicate`);
        ids.add(q.id);
        assert.ok(q.prompt.trim(), `${where} prompt`);
        assert.ok(q.explanation.trim(), `${where} explanation`);
        assert.ok(q.points > 0, `${where} points`);
        if (q.type === 'short' || q.type === 'long') {
          written += 1;
          assert.ok(q.rubric && q.rubric.trim(), `${where} needs a rubric`);
          assert.equal(q.options, undefined, `${where} written answers have no options`);
          continue;
        }
        assert.ok(q.options && q.options.length >= 2, `${where} needs options`);
        assert.ok(q.correct && q.correct.length >= 1, `${where} needs correct`);
        assert.equal(new Set(q.correct).size, q.correct.length, `${where} repeated correct index`);
        for (const i of q.correct) assert.ok(Number.isInteger(i) && i >= 0 && i < q.options.length, `${where} correct index ${i} out of range`);
        if (q.type === 'single' || q.type === 'truefalse') assert.equal(q.correct.length, 1, `${where} has exactly one answer`);
        if (q.type === 'truefalse') assert.deepEqual(q.options, ['True', 'False'], `${where} true/false options`);
        assert.equal(new Set(q.options).size, q.options.length, `${where} repeated option`);
      }
      assert.ok(written >= 2 && written <= 3, `${quiz.id} has 2 or 3 written questions`);
    }
  }
});

test('lessons use only the allowed Markdown', () => {
  for (const m of modules) {
    for (const d of m.docs) {
      const body = d.body;
      assert.ok(!/^\s*\|/m.test(body), `${d.id}: no tables`);
      assert.ok(!/!\[/.test(body), `${d.id}: no images`);
      assert.ok(!/\]\(/.test(body), `${d.id}: no links`);
      assert.ok(!/https?:\/\//.test(body), `${d.id}: no URLs`);
      assert.ok(!/<\/?[a-zA-Z][^>]*>/.test(body), `${d.id}: no HTML`);
      assert.ok(!/`/.test(body), `${d.id}: no code`);
      assert.ok(!/^#{4,}/m.test(body), `${d.id}: headings go to ### at most`);
      assert.ok(!/^# /m.test(body), `${d.id}: start headings at ##`);
      assert.ok(!/^[ \t]+(?:[-*]|\d+\.)\s/m.test(body), `${d.id}: lists are one level`);
      assert.ok(!/^\* /m.test(body), `${d.id}: bullets use "-"`);
      for (const line of body.split('\n')) {
        assert.equal((line.match(/\*\*/g) ?? []).length % 2, 0, `${d.id}: unpaired ** in "${line.slice(0, 60)}"`);
      }
      for (const line of body.split('\n').filter((l) => l.startsWith('>'))) {
        assert.match(line, /^> \*\*(Safety|Try this|Note|Your coven):\*\* /, `${d.id}: callout label in "${line.slice(0, 60)}"`);
      }
    }
  }
});

test('lessons are full length', () => {
  for (const m of modules) {
    for (const d of m.docs) {
      const n = words(d.body);
      assert.ok(n >= 850 && n <= 2300, `${d.id} is ${n} words`);
    }
  }
});

test('holiday keys, if any, exist', () => {
  const keys = new Set(TRADITIONS.flatMap((t) => t.holidays.map((h) => `${t.id}/${h.id}`)));
  for (const m of modules) {
    for (const s of m.stages) for (const t of s.tasks) if (t.holiday) assert.ok(keys.has(t.holiday), `${t.title}: unknown holiday ${t.holiday}`);
  }
});

test('leading a coven covers every part named in the brief', () => {
  const text = allText(leading).toLowerCase();
  for (const phrase of ['guru', 'accountab', 'creed', 'rules', 'agreement', 'positions', 'open position', 'programs', 'mentor', 'rite', 'meeting', 'notification', 'invit', 'book of shadows', 'altar', 'record', 'standing', 'moderat', 'report', 'delegat', 'crisis', 'safeguarding', 'public incident', 'burnout']) {
    assert.ok(text.includes(phrase), phrase);
  }
});

test('the app powers taught match the app', () => {
  const plain = (t: string) => t.replace(/’/g, "'");
  const text = plain(allText(leading));
  for (const p of RANK_POWERS) {
    // The lesson lists each power by the start of its label in the app.
    const start = plain(p.label.split(' (')[0]);
    assert.ok(text.includes(start), `the lesson names the power "${start}"`);
  }
});

test('stewardship covers succession, hiving, trainers, lineage, closing and community', () => {
  const text = allText(stewardship);
  for (const phrase of ['Hand on leadership', 'Found a coven', 'hiv', 'mentor', 'lineage', 'Archive the coven', 'community guidelines', 'Salt & Sovereignty']) {
    assert.ok(text.includes(phrase), phrase);
  }
});
