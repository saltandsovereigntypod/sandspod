// The Learn Astrology course for the website: its chapters, lessons and
// quizzes, progress (kept in the craft store as 'astro.course', the same shape
// as the app), where lesson links open, and the lesson reader and quiz scoring
// the coven courses use. Built by scripts/build-core.mjs into
// js/core/astro-course.js (window.SaltCore["astro-course"]); the course page
// (practice/cosmic/course/) loads it beside js/core/astro.js, which has the
// chart engine and "In your chart" (SaltCore.astro.courseChart).
export * as course from '../../app/src/lib/astro/course/index.ts';
export * as progress from '../../app/src/lib/astro/course/progress.ts';
export * as lesson from '../../app/src/lib/covens/lesson.ts';
export * as quiz from '../../app/src/lib/covens/quiz.ts';
