// The Learn Astrology course: twelve chapters of lessons and quizzes, every
// lesson in the lesson format, every term and link pointing at something that
// exists, every quiz scorable, progress kept the same way everywhere, and "In
// your chart" lines for every kind, with or without a birth time.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ALL_LESSONS, astroLinkAppHref, astroLinkLabel, astroLinkSiteHref, astroPage, CHAPTERS, chapterOfLesson, lessonPlace, nextLesson } from '../src/lib/astro/course/index.ts';
import {
  chapterState,
  courseSummary,
  markLesson,
  newCourseProgress,
  nextStep,
  normalizeCourseProgress,
  pickProgress,
  recordQuiz,
  scoreQuiz,
} from '../src/lib/astro/course/progress.ts';
import type { YourChartKind } from '../src/lib/astro/course/types.ts';
import { yourChartLines } from '../src/lib/astro/course/yourChart.ts';
import { term } from '../src/lib/astro/glossary.ts';
import { castChart } from '../src/lib/astro/natal.ts';
import { linkTargetLabel } from '../src/lib/covens/courses/linkTargets.ts';
import { parseLesson, unsupported } from '../src/lib/covens/lesson.ts';

test('twelve chapters, each with lessons and a quiz, every id unique', () => {
  assert.equal(CHAPTERS.length, 12);
  const ids = new Set<string>();
  for (const c of CHAPTERS) {
    assert.ok(c.lessons.length >= 3, `${c.id} has too few lessons`);
    assert.ok(c.title && c.summary, c.id);
    for (const id of [c.id, c.quiz.id, ...c.lessons.map((l) => l.id)]) {
      assert.ok(!ids.has(id), `${id} is used twice`);
      ids.add(id);
    }
    assert.equal(c.quiz.id, `quiz-astro-${c.id}`);
  }
  assert.ok(ALL_LESSONS.length >= 36);
});

test('every lesson is written in the lesson format, in the house voice, and differs from every other', () => {
  const bodies = new Set<string>();
  for (const l of ALL_LESSONS) {
    assert.match(l.id, /^astro-[a-z]+-[a-z0-9-]+$/, l.id);
    assert.deepEqual(unsupported(l.body), [], `${l.id} uses Markdown lessons don't have`);
    const blocks = parseLesson(l.body);
    assert.ok(blocks.filter((b) => b.type === 'heading').length >= 2, `${l.id} needs headings`);
    assert.ok(l.body.split(/\s+/).length >= 180, `${l.id} is too short`);
    assert.ok(!/!/.test(l.body.replace(/!\[/g, '')), `${l.id} has an exclamation mark`);
    assert.ok(l.minutes > 0 && l.summary.length > 20, l.id);
    assert.ok(!bodies.has(l.body), `${l.id} repeats another lesson`);
    bodies.add(l.body);
  }
});

test('every term and link in a lesson points at something that exists', () => {
  for (const l of ALL_LESSONS) {
    assert.ok(l.terms.length > 0, `${l.id} teaches no terms`);
    for (const id of l.terms) assert.ok(term(id), `${l.id}: no glossary term "${id}"`);
    assert.ok(l.links.length > 0, `${l.id} links nowhere`);
    for (const link of l.links) {
      const where = `${l.id}: ${link.kind}:${link.id}`;
      if (link.kind === 'term') assert.ok(term(link.id), where);
      else if (link.kind === 'astro') {
        assert.ok(astroPage(link.id), where);
        assert.ok(astroLinkAppHref(link)?.startsWith('/'), where);
        assert.ok(astroLinkSiteHref(link)?.startsWith('/'), where);
      } else {
        assert.ok(linkTargetLabel(link), `${where} doesn't exist`);
        assert.ok(astroLinkAppHref(link), where);
        assert.ok(astroLinkSiteHref(link), where);
      }
      assert.ok(astroLinkLabel(link, (id) => term(id)?.term).length > 2, where);
    }
  }
});

test('every quiz is valid: choice questions with a right answer and an explanation', () => {
  for (const c of CHAPTERS) {
    const q = c.quiz;
    assert.ok(q.questions.length >= 6, `${q.id} has too few questions`);
    assert.ok(q.passPercent > 0 && q.passPercent <= 100);
    assert.ok(q.intro && q.title);
    const ids = new Set<string>();
    for (const x of q.questions) {
      const where = `${q.id} ${x.id}`;
      assert.ok(!ids.has(x.id), `${where} twice`);
      ids.add(x.id);
      assert.ok(['single', 'multi', 'truefalse'].includes(x.type), `${where}: only choice questions score at once`);
      assert.ok(x.options && x.options.length >= 2, where);
      assert.ok(x.correct && x.correct.length >= 1, where);
      for (const i of x.correct!) assert.ok(i >= 0 && i < x.options!.length, `${where}: answer out of range`);
      if (x.type !== 'multi') assert.equal(x.correct!.length, 1, where);
      if (x.type === 'truefalse') assert.deepEqual(x.options, ['True', 'False'], where);
      assert.equal(new Set(x.options).size, x.options!.length, `${where}: options repeat`);
      assert.ok(x.points > 0 && x.explanation.length > 10, where);
    }
    // Full marks pass; nothing answered fails.
    const right = Object.fromEntries(q.questions.map((x) => [x.id, x.correct!]));
    const full = scoreQuiz(q, right);
    assert.equal(full.percent, 100);
    assert.ok(full.passed);
    assert.ok(!scoreQuiz(q, {}).passed);
  }
});

test('progress: reading, quizzes, the next step and the summary', () => {
  const now = new Date('2026-10-30T12:00:00Z');
  let p = newCourseProgress(now);
  assert.equal(nextStep(p)!.kind, 'lesson');
  const first = CHAPTERS[0];
  for (const l of first.lessons) p = markLesson(p, l.id, true, now);
  assert.deepEqual(nextStep(p), { kind: 'quiz', chapter: first });
  p = recordQuiz(p, first.quiz.id, { percent: 50, passed: false }, now);
  p = recordQuiz(p, first.quiz.id, { percent: 100, passed: true }, now);
  p = recordQuiz(p, first.quiz.id, { percent: 60, passed: false }, now);
  assert.deepEqual({ best: p.quizzes[first.quiz.id].best, passed: p.quizzes[first.quiz.id].passed, attempts: p.quizzes[first.quiz.id].attempts, last: p.quizzes[first.quiz.id].last }, { best: 100, passed: true, attempts: 3, last: 60 });
  assert.ok(chapterState(p, first).done);
  const next = nextStep(p);
  assert.ok(next && next.kind === 'lesson' && next.chapter.id === CHAPTERS[1].id);
  const sum = courseSummary(p);
  assert.equal(sum.lessonsRead, first.lessons.length);
  assert.equal(sum.chaptersDone, 1);
  assert.ok(sum.percent > 0 && sum.percent < 100);
  p = markLesson(p, first.lessons[0].id, false, now);
  assert.ok(!chapterState(p, first).done);
  // A stored copy round-trips, and junk is made safe.
  assert.deepEqual(normalizeCourseProgress(JSON.parse(JSON.stringify(p))), p);
  const junk = normalizeCourseProgress({ read: { a: 3, b: 'x' }, quizzes: { q: { best: 'no' }, r: { best: 140, passed: true } } });
  assert.deepEqual(junk.read, { b: 'x' });
  assert.deepEqual(Object.keys(junk.quizzes), ['r']);
  assert.equal(junk.quizzes.r.best, 100);
  // The newest of two devices' entries wins.
  const older = { id: '1', updatedAt: '2026-01-01T00:00:00Z', data: p };
  const newer = { id: '2', updatedAt: '2026-02-01T00:00:00Z', data: p };
  assert.equal(pickProgress([older, newer, { id: '3', updatedAt: '2027-01-01T00:00:00Z', data: { other: true } }])!.id, '2');
  // The whole course done.
  let all = newCourseProgress(now);
  for (const c of CHAPTERS) {
    for (const l of c.lessons) all = markLesson(all, l.id, true, now);
    all = recordQuiz(all, c.quiz.id, { percent: 100, passed: true }, now);
  }
  assert.equal(nextStep(all), null);
  assert.equal(courseSummary(all).percent, 100);
});

test('lessons know their place and the next one', () => {
  const second = CHAPTERS[1].lessons[0];
  assert.equal(chapterOfLesson(second.id), CHAPTERS[1]);
  assert.equal(nextLesson(CHAPTERS[0].lessons.at(-1)!.id), second);
  assert.equal(nextLesson(ALL_LESSONS.at(-1)!.id), null);
  assert.match(lessonPlace(second.id), /^Chapter 2 · Lesson 1 of \d$/);
});

test('"In your chart" has lines for every kind a lesson uses, with and without a birth time', () => {
  const kinds = [...new Set(ALL_LESSONS.map((l) => l.yourChart).filter(Boolean))] as YourChartKind[];
  assert.ok(kinds.length >= 10);
  const full = castChart({ date: '1990-06-15', time: '14:30', utcOffsetMinutes: 60, latitude: 51.5, longitude: -0.13 })!;
  const noTime = castChart({ date: '1990-06-15', time: '', utcOffsetMinutes: 60 })!;
  const now = new Date('2026-10-30T12:00:00Z');
  for (const kind of kinds) {
    const lines = yourChartLines(kind, full, now);
    assert.ok(lines && lines.length > 0, kind);
    for (const line of lines!) assert.ok(line.length > 10 && !/undefined|null|NaN/.test(line), `${kind}: ${line}`);
    const bare = yourChartLines(kind, noTime, now);
    if (bare) for (const line of bare) assert.ok(!/undefined|null|NaN/.test(line), `${kind} without a time: ${line}`);
  }
  assert.equal(yourChartLines('houses', noTime, now), null);
});
