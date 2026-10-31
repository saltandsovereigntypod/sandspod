// The southern-hemisphere copies of a course set (the Wheel of the Year and
// Wicca): the same lessons, tests and steps, with each festival step keeping
// the southern calendar's day ('wheel/imbolc' → 'wheel_south/imbolc', which
// falls in August), and the lessons' dates turned round so the southern date
// comes first ("21 June in the southern hemisphere (21 December in the
// north)"). Lessons are written for both hemispheres; only the order of the
// dates changes. A lesson or test whose words change gets its own id
// ('wicca-lore-yule' → 'wicca_south-lore-yule'); one that reads the same in
// both keeps its id, so programs copied before keep pointing at it. Pure.

import type { CourseDoc, CourseModule, CourseTask, Quiz } from './types.ts';

const MONTH = '(?:January|February|March|April|May|June|July|August|September|October|November|December)';
/** A festival's date as the lessons write it: "21 June", "1 and 2 February", "30 April and 1 May", "the turn of October into November", "late April into May". */
const DATE = `(?:the (?:start|end|turn|middle) of ${MONTH}(?: into ${MONTH})?|(?:late|early) ${MONTH}(?: into ${MONTH})?|\\d{1,2}(?: and \\d{1,2})? ${MONTH}(?: (?:into|and) \\d{1,2} ${MONTH})?)`;

const RULES: [RegExp, string][] = [
  // "31 October in the northern hemisphere (the end of April in the south)"
  [new RegExp(`(${DATE}) in the northern hemisphere \\((?:around )?(${DATE}) in the south\\)`, 'g'), '$2 in the southern hemisphere ($1 in the north)'],
  // "21 June in the northern hemisphere and 21 December in the south", "…, and from 30 April into 1 May in the south"
  [new RegExp(`(${DATE}) in the northern hemisphere(,?) and (from |around )?(${DATE}) in the south\\b`, 'g'), '$4 in the southern hemisphere$2 and $3$1 in the north'],
  // "the turn of October into November (late April into May in the south)"
  [new RegExp(`(${DATE}) \\((?:around )?(${DATE}) in the south\\)`, 'g'), '$2 ($1 in the north)'],
  // The southern date may be a stretch rather than a day: "kept on the evening of the end of April" → "kept at the end of April".
  [/\bon (?:the evening of )?the (start|end|turn|middle) of /g, 'at the $1 of '],
];

/** A lesson's or step's words with the southern dates first. */
export function southernText(text: string): string {
  return RULES.reduce((s, [re, to]) => s.replace(re, to), text);
}

const flipQuiz = (q: Quiz): Quiz => ({
  ...q,
  intro: southernText(q.intro),
  questions: q.questions.map((x) => ({
    ...x,
    prompt: southernText(x.prompt),
    options: x.options?.map(southernText),
    explanation: southernText(x.explanation),
    rubric: x.rubric === undefined ? undefined : southernText(x.rubric),
  })),
});

/**
 * The southern copy of a module, from tradition `from` ('wheel', 'wicca') to
 * `to` ('wheel_south', 'wicca_south'). `renamed` holds the ids of lessons and
 * tests (in any module) whose southern copy has its own id, so steps that
 * borrow another set's lesson (Wicca's sabbat steps give the Wheel's) point at
 * the southern one.
 */
export function southernModule(m: CourseModule, from: string, to: string, renamed: Map<string, string> = southernRenames([m], from, to)): CourseModule {
  const rename = (id: string) => renamed.get(id) ?? id;
  const docs: CourseDoc[] = m.docs.map((d) => {
    const body = southernText(d.body);
    const summary = southernText(d.summary);
    return body === d.body && summary === d.summary ? d : { ...d, id: rename(d.id), body, summary };
  });
  const quizzes: Quiz[] = m.quizzes.map((q) => {
    const flipped = flipQuiz(q);
    return JSON.stringify(flipped) === JSON.stringify(q) ? q : { ...flipped, id: rename(q.id) };
  });
  const task = (t: CourseTask): CourseTask => ({
    ...t,
    instructions: southernText(t.instructions),
    solitary: t.solitary === undefined ? undefined : southernText(t.solitary),
    holiday: t.holiday?.startsWith('wheel/') ? `wheel_south/${t.holiday.slice('wheel/'.length)}` : t.holiday,
    docs: t.docs?.map(rename),
    quiz: t.quiz ? rename(t.quiz) : t.quiz,
  });
  return {
    ...m,
    id: m.id.replace(new RegExp(`^${from}-`), `${to}-`),
    docs,
    quizzes,
    stages: m.stages.map((s) => ({ ...s, intro: southernText(s.intro), tasks: s.tasks.map(task) })),
  };
}

/** The lessons and tests of these modules whose southern copy reads differently, with their southern ids. */
export function southernRenames(modules: CourseModule[], from: string, to: string): Map<string, string> {
  const out = new Map<string, string>();
  const newId = (id: string) => (id.startsWith(`quiz-${from}-`) ? `quiz-${to}-${id.slice(`quiz-${from}-`.length)}` : id.startsWith(`${from}-`) ? `${to}-${id.slice(from.length + 1)}` : `${id}-south`);
  for (const m of modules) {
    for (const d of m.docs) if (southernText(d.body) !== d.body || southernText(d.summary) !== d.summary) out.set(d.id, newId(d.id));
    for (const q of m.quizzes) if (JSON.stringify(flipQuiz(q)) !== JSON.stringify(q)) out.set(q.id, newId(q.id));
  }
  return out;
}
