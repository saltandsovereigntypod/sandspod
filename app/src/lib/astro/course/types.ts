// The Learn Astrology course: twelve chapters from "what is astrology" to
// using it in magic, each with lessons to read and a quiz to take. Lessons use
// the coven courses' lesson format (lib/covens/courses/types.ts CourseDoc: a
// small Markdown subset the app and the website draw the same way) and the
// quizzes their Quiz shape (choice questions only, so they score at once).
// A lesson also names the glossary terms it teaches, where its subject lives in
// the rest of the Sanctuary (AstroLink), and, where it helps, what to look at
// in the learner's own chart (YourChartKind, ./yourChart.ts). Pure data.

import type { CourseDoc, CourseLink, Quiz } from '../../covens/courses/types.ts';

export type { CourseLink, Quiz };

/** The astrology pages a lesson can open. */
export type AstroPage =
  | 'chart'
  | 'chart:placements'
  | 'chart:aspects'
  | 'chart:balance'
  | 'chart:reading'
  | 'chart:transits'
  | 'chart:returns'
  | 'chart:progressions'
  | 'chart:craft'
  | 'charts'
  | 'hours'
  | 'timing'
  | 'learn'
  | 'sky'
  | `planet:${string}`;

/** A link from a lesson: a glossary term, an astrology page, or anywhere a coven course can link. */
export type AstroLink = CourseLink | { kind: 'term'; id: string; label?: string } | { kind: 'astro'; id: AstroPage; label?: string };

/** What a lesson shows from the learner's own chart. */
export type YourChartKind = 'big-three' | 'planets' | 'elements' | 'houses' | 'aspects' | 'ruler' | 'dignities' | 'patterns' | 'transits' | 'progressions' | 'moon' | 'magic';

export type AstroLesson = Omit<CourseDoc, 'links'> & {
  /** Glossary ids the lesson teaches, shown as tappable chips. */
  terms: string[];
  links: AstroLink[];
  yourChart?: YourChartKind;
};

export type AstroChapter = {
  /** 'basics', 'sky', … */
  id: string;
  title: string;
  /** One or two sentences: what the chapter covers. */
  summary: string;
  lessons: AstroLesson[];
  quiz: Quiz;
};

// Short ways to write links.
export const termLink = (id: string): AstroLink => ({ kind: 'term', id });
export const astro = (id: AstroPage, label?: string): AstroLink => ({ kind: 'astro', id, ...(label ? { label } : {}) });
export const libLink = (type: string, key: string): AstroLink => ({ kind: 'library', id: `traditional:${type}:${key}` });
export const ritualLink = (id: string): AstroLink => ({ kind: 'premade', id });
export const holyLink = (id: string): AstroLink => ({ kind: 'holy', id });
export const pageLink = (id: string): AstroLink => ({ kind: 'page', id });
