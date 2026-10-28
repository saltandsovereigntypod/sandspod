import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';

import type { CourseModule } from '../src/lib/covens/courses/types.ts';
import { TRADITIONS } from '../src/lib/holidays.ts';

const NAMES = ['seeker', 'tradition', 'ritual', 'devotion', 'dedication', 'lore', 'initiation', 'elder', 'high-priestess'];
const modules: CourseModule[] = [];
for (const name of NAMES) {
  const path = new URL(`../src/lib/covens/courses/hellenic/${name}.ts`, import.meta.url);
  if (existsSync(path)) modules.push((await import(path.href)).default as CourseModule);
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const holidayKeys = new Set(TRADITIONS.flatMap((t) => t.holidays.map((h) => `${t.id}/${h.id}`)));

test('all nine Hellenic modules are present with the fixed ids', () => {
  assert.deepEqual(modules.map((m) => m.id), NAMES.map((n) => `hellenic-${n}`));
});

test('ids are unique and well formed', () => {
  const docIds = new Set<string>();
  const quizIds = new Set<string>();
  for (const m of modules) {
    for (const d of m.docs) {
      assert.ok(d.id.startsWith(`${m.id}-`), d.id);
      assert.ok(!docIds.has(d.id), `duplicate doc ${d.id}`);
      docIds.add(d.id);
    }
    assert.equal(m.quizzes.length, 1, `${m.id} has one test`);
    for (const q of m.quizzes) {
      assert.equal(q.id, `quiz-${m.id}`);
      assert.ok(!quizIds.has(q.id));
      quizIds.add(q.id);
      const qids = q.questions.map((x) => x.id);
      assert.equal(new Set(qids).size, qids.length, `${q.id} question ids unique`);
    }
  }
});

test('every task links lessons and tests that exist', () => {
  const docIds = new Set(modules.flatMap((m) => m.docs.map((d) => d.id)));
  const quizIds = new Set(modules.flatMap((m) => m.quizzes.map((q) => q.id)));
  for (const m of modules) {
    assert.ok(m.stages.length >= 1, `${m.id} has a stage`);
    const used = new Set<string>();
    let quizTask = 0;
    for (const s of m.stages) {
      assert.ok(s.title && s.intro.length > 40, s.title);
      assert.ok(s.tasks.length > 0, s.title);
      for (const t of s.tasks) {
        assert.ok(t.title && t.instructions.length > 20, t.title);
        assert.ok(t.times >= 1, t.title);
        for (const d of t.docs ?? []) {
          assert.ok(docIds.has(d), `${t.title}: missing doc ${d}`);
          used.add(d);
        }
        if (t.quiz) {
          assert.ok(quizIds.has(t.quiz), `${t.title}: missing quiz ${t.quiz}`);
          assert.equal(t.kind, 'study');
          assert.equal(t.checked_by, 'mentor');
          assert.equal(t.response, 'none');
          quizTask += 1;
        }
        if (t.holiday != null) assert.ok(holidayKeys.has(t.holiday), `${t.title}: unknown holiday ${t.holiday}`);
      }
    }
    assert.equal(quizTask, 1, `${m.id} has one test task`);
    for (const d of m.docs) assert.ok(used.has(d.id), `${d.id} is not linked from any task`);
  }
});

test('every question is valid', () => {
  for (const m of modules) {
    for (const quiz of m.quizzes) {
      assert.ok(quiz.passPercent >= 1 && quiz.passPercent <= 100);
      assert.ok(quiz.questions.length >= 10 && quiz.questions.length <= 15, `${quiz.id}: ${quiz.questions.length} questions`);
      const written = quiz.questions.filter((q) => q.type === 'short' || q.type === 'long').length;
      assert.ok(written >= 2 && written <= 3, `${quiz.id}: ${written} written`);
      for (const q of quiz.questions) {
        const where = `${quiz.id} ${q.id}`;
        assert.ok(q.prompt && q.explanation.length > 20 && q.points > 0, where);
        if (q.type === 'short' || q.type === 'long') {
          assert.ok(q.rubric && q.rubric.length > 40, `${where} rubric`);
          continue;
        }
        assert.ok(q.options && q.options.length >= 2, `${where} options`);
        assert.ok(q.correct && q.correct.length >= 1, `${where} correct`);
        assert.equal(new Set(q.correct).size, q.correct.length, where);
        for (const i of q.correct) assert.ok(Number.isInteger(i) && i >= 0 && i < q.options.length, `${where} index ${i}`);
        if (q.type === 'single' || q.type === 'truefalse') assert.equal(q.correct.length, 1, where);
        if (q.type === 'truefalse') assert.deepEqual(q.options, ['True', 'False'], where);
      }
    }
  }
});

test('lesson bodies use only the allowed Markdown and are full lessons', () => {
  const counts: string[] = [];
  for (const m of modules) {
    let total = 0;
    for (const d of m.docs) {
      const where = d.id;
      assert.ok(d.title && d.summary && d.minutes > 0, where);
      assert.doesNotMatch(d.body, /<\/?[a-z!][^>]*>/i, `${where}: HTML`);
      assert.doesNotMatch(d.body, /!?\[[^\]]*\]\([^)]*\)/, `${where}: link or image`);
      assert.doesNotMatch(d.body, /https?:\/\/|www\./, `${where}: URL`);
      assert.doesNotMatch(d.body, /`/, `${where}: backtick`);
      for (const line of d.body.split('\n')) {
        assert.ok(!/^\s*\|.*\|\s*$/.test(line), `${where}: table row "${line}"`);
        assert.ok(!/^# /.test(line), `${where}: a # heading (the title is shown already)`);
        assert.ok(!/^#{4,}/.test(line), `${where}: heading too deep`);
        assert.ok(!/^\s+\S/.test(line), `${where}: indented line (nested lists and code blocks aren't allowed) "${line}"`);
        if (line.startsWith('>')) assert.match(line, /^> \*\*(Safety|Try this|Note|Your coven):\*\* /, `${where}: unlabelled callout`);
      }
      const n = words(d.body);
      total += n;
      assert.ok(n >= 900, `${where}: only ${n} words`);
      assert.ok(n <= 2300, `${where}: ${n} words`);
    }
    counts.push(`${m.id}: ${m.docs.length} lessons, ${total} words`);
  }
  console.log(counts.join('\n'));
});

test('the lore module keeps every Hellenic festival, one lesson and task each', () => {
  const lore = modules.find((m) => m.id === 'hellenic-lore');
  assert.ok(lore);
  const festivals = TRADITIONS.find((t) => t.id === 'hellenic')!.holidays.map((h) => `hellenic/${h.id}`);
  const tasks = lore.stages.flatMap((s) => s.tasks).filter((t) => t.holiday);
  assert.deepEqual(tasks.map((t) => t.holiday).sort(), [...festivals].sort());
  for (const key of festivals) {
    const slug = key.split('/')[1];
    assert.ok(lore.docs.some((d) => d.id === `hellenic-lore-${slug}`), `lesson for ${key}`);
  }
});

test('the monthly days and Hekate get their care', () => {
  const devotion = modules.find((m) => m.id === 'hellenic-devotion')!;
  const holidays = devotion.stages.flatMap((s) => s.tasks).map((t) => t.holiday);
  for (const day of ['noumenia', 'agathos_daimon', 'deipnon']) assert.ok(holidays.includes(`hellenic_monthly/${day}`), day);
  const deipnon = devotion.docs.find((d) => d.id === 'hellenic-devotion-hekates-deipnon')!;
  assert.match(deipnon.body, /toxic to dogs and cats/);
  assert.match(deipnon.body, /not eaten|never eaten|do not eat/i);
});
