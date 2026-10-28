// The coven training courses: the lessons that teach, the tests that check
// understanding, and how the ready-made programs use them. Pure data, shared
// by the app and the website (built into js/core/covens.js).
//
// A course is written for someone who knows nothing yet. Lessons are
// documents a trainee reads in the app; tests are taken in the app and
// scored there (choice questions at once, written answers by the mentor or
// the coven's head, against a rubric). Every step of a program can carry
// lessons and a test, and has its own conversation with the trainee.

/**
 * A lesson: a document the trainee reads.
 *
 * `body` is a small Markdown subset, rendered the same in the app and on the
 * website:
 *   # / ## / ###        headings (# only once, for the lesson's own title, so
 *                       usually start at ##)
 *   blank-line paragraphs
 *   - item              bulleted lists (one level)
 *   1. item             numbered lists (one level; steps to follow)
 *   **bold**  *italic*
 *   > text              a callout; begin with **Safety:**, **Try this:**,
 *                       **Note:** or **Your coven:** to label it
 *   ---                 a divider
 * No tables, images, links or HTML.
 */
export type CourseDoc = {
  /** Unique across every course: '<scope>-<module>-<slug>', e.g. 'core-energy-what-is-energy'. */
  id: string;
  title: string;
  /** One or two sentences: what the lesson teaches. */
  summary: string;
  /** About how long it takes to read and try, in minutes. */
  minutes: number;
  body: string;
};

export type QuestionType =
  /** One right answer from `options` (`correct` holds its index). */
  | 'single'
  /** Every right answer from `options` (`correct` holds their indices; all must be chosen, no wrong ones). */
  | 'multi'
  /** `options` is ['True', 'False']; `correct` is [0] or [1]. */
  | 'truefalse'
  /** A few sentences, scored by a person against `rubric`. */
  | 'short'
  /** A longer written answer, scored by a person against `rubric`. */
  | 'long';

export type Question = {
  /** Unique within its test: 'q1', 'q2', … */
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correct?: number[];
  /** Points it's worth (choice questions usually 1; written answers 2–5). */
  points: number;
  /** Shown after answering: why the answer is right, teaching the point again. */
  explanation: string;
  /** For short and long answers: what a full-marks answer includes, for whoever scores it. */
  rubric?: string;
};

export type Quiz = {
  /** Unique across every course: 'quiz-<scope>-<module>'. */
  id: string;
  title: string;
  /** Shown before starting. */
  intro: string;
  /** The share of points needed to pass, 0–100 (usually 80). */
  passPercent: number;
  questions: Question[];
};

export type CourseTaskKind = 'study' | 'practice' | 'reflection' | 'ritual' | 'attend' | 'book' | 'oath' | 'meeting' | 'service' | 'other';

/** A task in a ready-made program (the shape of coven_program_tasks), with its lessons and test. */
export type CourseTask = {
  title: string;
  kind: CourseTaskKind;
  /**
   * What to do, step by step, as it is done in the app: what to read, what to
   * practise and for how long, what to write in the answer box, what to bring
   * to the mentor. Plain text; numbered steps on their own lines ("1. …").
   */
  instructions: string;
  /** How many times it's done (each logged). */
  times: number;
  /** Whether the trainee writes something for it. */
  response: 'none' | 'text';
  checked_by: 'self' | 'mentor' | 'manager';
  /** About how long each time takes, in minutes. */
  minutes?: number | null;
  /** A holiday key ('wheel/imbolc') when the task belongs to that day. */
  holiday?: string | null;
  optional?: boolean;
  /** Lessons to read for this task (CourseDoc ids), in order. */
  docs?: string[];
  /** The test for this task (a Quiz id). */
  quiz?: string | null;
};

export type CourseStage = {
  title: string;
  /** What this stage is for, two or three sentences, addressed to the trainee. */
  intro: string;
  /** A least time in the stage (366 for a year and a day). */
  min_days?: number | null;
  passed_by: 'self' | 'mentor' | 'manager';
  tasks: CourseTask[];
};

/** A body of teaching: shared ('core') or one tradition's ('wheel', 'celtic', …). */
export type CourseModule = {
  /** 'core-energy', 'wheel-lore', … */
  id: string;
  title: string;
  docs: CourseDoc[];
  quizzes: Quiz[];
  /** The stage(s) this module contributes to a program, ready to use. */
  stages: CourseStage[];
};
