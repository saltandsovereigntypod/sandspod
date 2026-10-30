// The checks every tradition's course set must pass (the Hellenic set set the
// standard): the nine modules with their fixed ids, unique ids, every task's
// lessons and test present, every question valid and scorable, full lessons in
// the small Markdown, and the lore module keeping every holy day of the
// tradition's calendar. Used by courses-<tradition>.test.ts.

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';

import type { CourseModule } from '../src/lib/covens/courses/types.ts';
import { TRADITIONS } from '../src/lib/holidays.ts';

export const SET_NAMES = ['seeker', 'tradition', 'ritual', 'devotion', 'dedication', 'lore', 'initiation', 'elder', 'high-priestess'];

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const holidayKeys = new Set(TRADITIONS.flatMap((t) => t.holidays.map((h) => `${t.id}/${h.id}`)));

export async function loadSet(folder: string): Promise<CourseModule[]> {
  const modules: CourseModule[] = [];
  for (const name of SET_NAMES) {
    const path = new URL(`../src/lib/covens/courses/${folder}/${name}.ts`, import.meta.url);
    if (existsSync(path)) modules.push((await import(path.href)).default as CourseModule);
  }
  return modules;
}

/**
 * The standard checks for one tradition's set; `calendar` is the holidays.ts
 * tradition its lore keeps. `borrowed` are other sets whose lessons its steps
 * may also give to read (Wicca's sabbats send people to the Wheel's lessons for
 * a festival's history rather than repeat them).
 */
export function checkSet(prefix: string, modules: CourseModule[], calendar: string, borrowed: CourseModule[] = []) {
  test(`${prefix}: all nine modules are present with the fixed ids`, () => {
    assert.deepEqual(
      modules.map((m) => m.id),
      SET_NAMES.map((n) => `${prefix}-${n}`),
    );
  });

  test(`${prefix}: ids are unique and well formed`, () => {
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
        assert.deepEqual(qids, qids.map((_, i) => `q${i + 1}`), `${q.id} questions numbered in order`);
      }
    }
  });

  test(`${prefix}: every task links lessons and a test that exist`, () => {
    const docIds = new Set([...modules, ...borrowed].flatMap((m) => m.docs.map((d) => d.id)));
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
          assert.ok(t.times >= 1 && Number.isInteger(t.times), t.title);
          if (t.minutes != null) assert.ok(t.minutes > 0 && t.minutes <= 600, `${t.title}: minutes`);
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
          if (t.solitary != null) assert.ok(t.solitary.length > 30, `${t.title}: a real solitary alternative`);
        }
      }
      assert.equal(quizTask, 1, `${m.id} has one test task`);
      for (const d of m.docs) assert.ok(used.has(d.id), `${d.id} is not linked from any task`);
    }
  });

  test(`${prefix}: every question is valid`, () => {
    for (const m of modules) {
      for (const quiz of m.quizzes) {
        assert.equal(quiz.passPercent, 80, quiz.id);
        assert.ok(quiz.questions.length >= 10 && quiz.questions.length <= 15, `${quiz.id}: ${quiz.questions.length} questions`);
        const written = quiz.questions.filter((q) => q.type === 'short' || q.type === 'long').length;
        assert.ok(written >= 2 && written <= 3, `${quiz.id}: ${written} written`);
        const total = quiz.questions.reduce((n, q) => n + q.points, 0);
        const auto = quiz.questions.filter((q) => q.type !== 'short' && q.type !== 'long').reduce((n, q) => n + q.points, 0);
        assert.ok(auto / total >= 0.5, `${quiz.id}: most points are scored at once`);
        for (const q of quiz.questions) {
          const where = `${quiz.id} ${q.id}`;
          assert.ok(q.prompt && q.explanation.length > 20 && q.points > 0 && Number.isInteger(q.points), where);
          if (q.type === 'short' || q.type === 'long') {
            assert.ok(q.rubric && q.rubric.length > 40, `${where} rubric`);
            assert.ok(q.points >= 2 && q.points <= 5, `${where} written points`);
            continue;
          }
          assert.equal(q.points, 1, `${where} choice points`);
          assert.ok(q.options && q.options.length >= 2, `${where} options`);
          assert.equal(new Set(q.options).size, q.options.length, `${where} options distinct`);
          assert.ok(q.correct && q.correct.length >= 1, `${where} correct`);
          assert.equal(new Set(q.correct).size, q.correct.length, where);
          for (const i of q.correct) assert.ok(Number.isInteger(i) && i >= 0 && i < q.options.length, `${where} index ${i}`);
          if (q.type === 'single' || q.type === 'truefalse') assert.equal(q.correct.length, 1, where);
          if (q.type === 'truefalse') assert.deepEqual(q.options, ['True', 'False'], where);
        }
      }
    }
  });

  test(`${prefix}: lesson bodies use only the allowed Markdown and are full lessons`, () => {
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
        assert.doesNotMatch(d.body, /!/, `${where}: no exclamation marks in the house voice`);
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

  test(`${prefix}: the lore module keeps every holy day of the calendar, one lesson and task each`, () => {
    const lore = modules.find((m) => m.id === `${prefix}-lore`);
    assert.ok(lore);
    const days = TRADITIONS.find((t) => t.id === calendar)!.holidays.map((h) => `${calendar}/${h.id}`);
    const tasks = lore.stages.flatMap((s) => s.tasks).filter((t) => t.holiday);
    assert.deepEqual(tasks.map((t) => t.holiday).sort(), [...days].sort());
    for (const key of days) {
      const slug = key.split('/')[1];
      assert.ok(lore.docs.some((d) => d.id === `${prefix}-lore-${slug}`), `lesson for ${key}`);
    }
  });

  test(`${prefix}: every lesson links into the Sanctuary`, () => {
    for (const m of modules) for (const d of m.docs) assert.ok((d.links ?? []).length >= 1, `${d.id} has links`);
  });
}
