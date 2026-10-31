// The ready-made coven programs, composed from the course modules (the
// "four/five programs per tradition" in docs/coven-courses-spec.md): for each
// tradition, a path of five programs, Seeker → Devotee → Initiate → Elder →
// High Priestess, each made of modules' stages with their lessons and tests.
//
// Only modules that are written take part: a module still empty (a
// placeholder until its file lands) is left out, and a tradition with no
// written module offers none, so the database's older templates
// (coven_program_templates) stand in for it. Written out as data for the app
// and the website (js/core/course-programs.json, scripts/build-course-programs.mjs),
// fetched only where the ready-made programs are chosen. Pure data.
//
// Adding a tradition: import its nine modules below, list them in MODULES and
// add its id to COURSE_TRADITIONS.

import type { CourseDoc, CourseModule, CourseStage, CourseTask, Quiz } from './types.ts';
import { mergeCourseLinks, type CourseLink } from '../courseLinks.ts';
import { LESSON_LINKS } from './links.ts';
import { namedLink } from './linkTargets.ts';

import coreWelcome from './core/welcome.ts';
import coreEnergy from './core/energy.ts';
import coreGrounding from './core/grounding.ts';
import coreRaising from './core/raising.ts';
import coreSacredSpace from './core/sacred-space.ts';
import coreAltarTools from './core/altar-tools.ts';
import coreCorrespondences from './core/correspondences.ts';
import coreMoonTiming from './core/moon-timing.ts';
import coreDivination from './core/divination.ts';
import coreSpellcraft from './core/spellcraft.ts';
import coreRitualCoven from './core/ritual-coven.ts';
import coreSeeker from './core/seeker.ts';
import coreElderLeading from './core/elder-leading.ts';
import coreElderTeaching from './core/elder-teaching.ts';
import coreElderCare from './core/elder-care.ts';
import coreElderGovernance from './core/elder-governance.ts';
import coreHpLeadingCoven from './core/hp-leading-coven.ts';
import coreHpStewardship from './core/hp-stewardship.ts';

import hellenicTradition from './hellenic/tradition.ts';
import hellenicRitual from './hellenic/ritual.ts';
import hellenicDevotion from './hellenic/devotion.ts';
import hellenicLore from './hellenic/lore.ts';
import hellenicInitiation from './hellenic/initiation.ts';
import hellenicSeeker from './hellenic/seeker.ts';
import hellenicDedication from './hellenic/dedication.ts';
import hellenicElder from './hellenic/elder.ts';
import hellenicHighPriestess from './hellenic/high-priestess.ts';

import wheelTradition from './wheel/tradition.ts';
import wheelRitual from './wheel/ritual.ts';
import wheelDevotion from './wheel/devotion.ts';
import wheelLore from './wheel/lore.ts';
import wheelInitiation from './wheel/initiation.ts';
import wheelSeeker from './wheel/seeker.ts';
import wheelDedication from './wheel/dedication.ts';
import wheelElder from './wheel/elder.ts';
import wheelHighPriestess from './wheel/high-priestess.ts';

import wiccaTradition from './wicca/tradition.ts';
import wiccaRitual from './wicca/ritual.ts';
import wiccaDevotion from './wicca/devotion.ts';
import wiccaLore from './wicca/lore.ts';
import wiccaInitiation from './wicca/initiation.ts';
import wiccaSeeker from './wicca/seeker.ts';
import wiccaDedication from './wicca/dedication.ts';
import wiccaElder from './wicca/elder.ts';
import wiccaHighPriestess from './wicca/high-priestess.ts';

import celticTradition from './celtic/tradition.ts';
import celticRitual from './celtic/ritual.ts';
import celticDevotion from './celtic/devotion.ts';
import celticLore from './celtic/lore.ts';
import celticInitiation from './celtic/initiation.ts';
import celticSeeker from './celtic/seeker.ts';
import celticDedication from './celtic/dedication.ts';
import celticElder from './celtic/elder.ts';
import celticHighPriestess from './celtic/high-priestess.ts';

import norseTradition from './norse/tradition.ts';
import norseRitual from './norse/ritual.ts';
import norseDevotion from './norse/devotion.ts';
import norseLore from './norse/lore.ts';
import norseInitiation from './norse/initiation.ts';
import norseSeeker from './norse/seeker.ts';
import norseDedication from './norse/dedication.ts';
import norseElder from './norse/elder.ts';
import norseHighPriestess from './norse/high-priestess.ts';

import { southernModule, southernRenames } from './southern.ts';

export type { CourseDoc, CourseLink, CourseModule, CourseStage, CourseTask, Quiz } from './types.ts';

/** The eclectic Wheel's modules. */
const WHEEL: CourseModule[] = [wheelTradition, wheelRitual, wheelDevotion, wheelLore, wheelInitiation, wheelSeeker, wheelDedication, wheelElder, wheelHighPriestess];

/** Wicca's modules. */
const WICCA: CourseModule[] = [wiccaTradition, wiccaRitual, wiccaDevotion, wiccaLore, wiccaInitiation, wiccaSeeker, wiccaDedication, wiccaElder, wiccaHighPriestess];

// The southern sets (southern.ts): the lessons and tests whose dates read
// differently in the south, with their southern ids.
const SOUTH_RENAMES = new Map([...southernRenames(WHEEL, 'wheel', 'wheel_south'), ...southernRenames(WICCA, 'wicca', 'wicca_south')]);

/**
 * The southern Wheel (holidays.ts 'wheel_south'): the same lessons and tests,
 * with each festival step keeping the southern calendar's day ('wheel/imbolc'
 * → 'wheel_south/imbolc', which falls in August) and the southern dates first.
 */
export const southernWheel = (m: CourseModule): CourseModule => southernModule(m, 'wheel', 'wheel_south', SOUTH_RENAMES);

/** Southern-hemisphere Wicca: Wicca's lessons on the southern Wheel's days, the same way. */
export const southernWicca = (m: CourseModule): CourseModule => southernModule(m, 'wicca', 'wicca_south', SOUTH_RENAMES);

export const MODULES: CourseModule[] = [
  coreWelcome,
  coreEnergy,
  coreGrounding,
  coreRaising,
  coreSacredSpace,
  coreAltarTools,
  coreCorrespondences,
  coreMoonTiming,
  coreDivination,
  coreSpellcraft,
  coreRitualCoven,
  coreSeeker,
  coreElderLeading,
  coreElderTeaching,
  coreElderCare,
  coreElderGovernance,
  coreHpLeadingCoven,
  coreHpStewardship,
  hellenicTradition,
  hellenicRitual,
  hellenicDevotion,
  hellenicLore,
  hellenicInitiation,
  hellenicSeeker,
  hellenicDedication,
  hellenicElder,
  hellenicHighPriestess,
  ...WHEEL,
  ...WHEEL.map(southernWheel),
  // Wicca keeps the Wheel's festivals (holidays.ts 'wheel'); its sabbat steps
  // also give the Wheel's lesson on each festival for its history.
  ...WICCA,
  // Southern-hemisphere Wicca keeps the southern Wheel's days ('wheel_south').
  ...WICCA.map(southernWicca),
  // The Celtic set keeps the Gaelic fire festivals (holidays.ts 'celtic'); its
  // festival steps also give the Wheel's lesson on the same festival for its
  // wider history.
  celticTradition,
  celticRitual,
  celticDevotion,
  celticLore,
  celticInitiation,
  celticSeeker,
  celticDedication,
  celticElder,
  celticHighPriestess,
  // The Norse & Heathen set keeps the Norse year (holidays.ts 'norse'); its
  // Midsummer, autumn and Yule steps also give the Wheel's lesson on the same
  // season for its wider history.
  norseTradition,
  norseRitual,
  norseDevotion,
  norseLore,
  norseInitiation,
  norseSeeker,
  norseDedication,
  norseElder,
  norseHighPriestess,
];

/** Traditions with modules of their own (Hellenic first, then the eclectic Wheel, north and south, then Wicca, the Celtic tradition and the Norse & Heathen; the rest as they're written). */
export const COURSE_TRADITIONS: { id: string; name: string }[] = [
  { id: 'hellenic', name: 'Hellenic' },
  { id: 'wheel', name: 'Wheel of the Year' },
  { id: 'wheel_south', name: 'Wheel of the Year (Southern Hemisphere)' },
  { id: 'wicca', name: 'Wicca' },
  { id: 'wicca_south', name: 'Wicca (Southern Hemisphere)' },
  { id: 'celtic', name: 'Celtic' },
  { id: 'norse', name: 'Norse & Heathen' },
];

/** Written: it has something to teach (placeholders have no stages). */
export const isWritten = (m: CourseModule | undefined): boolean => !!m && m.stages.length > 0;

// ─── The path ────────────────────────────────────────────────────────────

export type PathKey = 'seeker' | 'devotee' | 'initiate' | 'elder' | 'high-priestess';

/** The position a program raises its graduates to: matched by name, else by level; or the coven's leading position. */
export type Award = { level: number; names: string[] } | { leads: true } | null;

export type PathStep = {
  key: PathKey;
  title: string;
  kind: 'initiation' | 'training';
  /** The least time over the whole program, in days. */
  minDays: number;
  award: Award;
  /** The default position's name, for the chooser ("raises to Dedicant"). */
  awardLabel: string | null;
  /** One line for the chooser. */
  summary: string;
  /** About the program, for the program itself. */
  description: string;
  modules: (t: string) => string[];
};

export const PATH: PathStep[] = [
  {
    key: 'seeker',
    title: 'Your first thirty days',
    kind: 'training',
    minDays: 30,
    award: null,
    awardLabel: null,
    summary: 'For someone new, in their first month, deciding whether this coven is right for them.',
    description:
      'A gentle first month: what the coven is and does, its tradition in brief, what membership asks and what your rights are, a first taste of practice, and a rite to attend. It ends with a decision, made openly with the coven’s head or your mentor: to carry on as a devotee, to take longer, or to part well.',
    modules: (t) => ['core-seeker', `${t}-seeker`],
  },
  {
    key: 'devotee',
    title: 'Becoming a devotee',
    kind: 'initiation',
    minDays: 0,
    award: { level: 2, names: ['dedicant', 'devotee'] },
    awardLabel: 'Dedicant',
    summary: 'For those who have chosen the coven: the foundations, its ritual and devotion, ending in dedication.',
    description:
      'Several months of foundations: energy, grounding, raising and directing power, sacred space, the altar and its tools, and the tradition’s own ritual and devotion. Every step has lessons to read, practice to log, and a short test. It ends in a dedication.',
    modules: (t) => ['core-welcome', 'core-energy', 'core-grounding', 'core-raising', 'core-sacred-space', `${t}-ritual`, 'core-altar-tools', `${t}-tradition`, `${t}-devotion`, `${t}-dedication`],
  },
  {
    key: 'initiate',
    title: 'A year and a day to initiation',
    kind: 'initiation',
    minDays: 366,
    award: { level: 3, names: ['initiate'] },
    awardLabel: 'Initiate',
    summary: 'For devotees seeking initiation: deeper craft, the full year of holy days, service, oath and preparation.',
    description:
      'A year and a day of deeper study: correspondences, the moon and timing, divination, spellcraft, every holy day of the year, ritual craft and coven life, and the path to initiation itself: study, service, the oath and preparing for the rite your coven keeps.',
    modules: (t) => ['core-correspondences', 'core-moon-timing', 'core-divination', 'core-spellcraft', `${t}-lore`, 'core-ritual-coven', `${t}-initiation`],
  },
  {
    key: 'elder',
    title: 'Becoming an elder',
    kind: 'initiation',
    minDays: 0,
    award: { level: 4, names: ['elder'] },
    awardLabel: 'Elder',
    summary: 'For initiates called to lead, teach and care for others.',
    description:
      'Leading ritual and gatherings, teaching and mentoring (and scoring tests fairly), pastoral care with its boundaries and limits, the coven’s governance, and the tradition’s own leadership.',
    modules: (t) => ['core-elder-leading', 'core-elder-teaching', 'core-elder-care', 'core-elder-governance', `${t}-elder`],
  },
  {
    key: 'high-priestess',
    title: 'Becoming a High Priestess or High Priest',
    kind: 'initiation',
    minDays: 0,
    award: { leads: true },
    awardLabel: 'the coven’s leading position',
    summary: 'For elders preparing to lead a coven: to succeed its head, share leadership, or found a daughter coven.',
    description:
      'Leading a whole coven: spiritual authority and accountability, its vision and documents, running every part of it in the app, delegating, crisis and burnout; then stewardship: succession, hiving off, training trainers, the coven’s long-term health, and the tradition’s own high priesthood.',
    modules: (t) => ['core-hp-leading-coven', 'core-hp-stewardship', `${t}-high-priestess`],
  },
];

export const PATH_LABEL = 'Seeker → Devotee → Initiate → Elder → High Priestess';

// ─── Composing ───────────────────────────────────────────────────────────

/** A ready-made program from the courses, ready to copy into a coven. */
export type CourseProgram = {
  id: string;
  tradition: string;
  path: PathKey;
  position: number;
  kind: 'initiation' | 'training';
  title: string;
  summary: string;
  description: string;
  award: Award;
  awardLabel: string | null;
  stages: CourseStage[];
  /** Every lesson and test the stages use. */
  docs: CourseDoc[];
  quizzes: Quiz[];
  /** Its modules not yet written (left out for now). */
  missing: string[];
};

export function moduleIndex(modules: CourseModule[] = MODULES) {
  const byId = new Map<string, CourseModule>();
  const docs = new Map<string, CourseDoc>();
  const quizzes = new Map<string, Quiz>();
  for (const m of modules) {
    byId.set(m.id, m);
    if (!isWritten(m)) continue;
    m.docs.forEach((d) => docs.set(d.id, d));
    m.quizzes.forEach((q) => quizzes.set(q.id, q));
  }
  return { byId, docs, quizzes };
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/**
 * Everything a step links to: its own links, its holy day's page, and its
 * lessons' links (written on the lesson, or kept for the older lessons in
 * links.ts), once each.
 */
export function taskLinks(t: CourseTask, docs: CourseDoc[]): CourseLink[] {
  const holiday: CourseLink[] = t.holiday ? [{ kind: 'holy', id: t.holiday }] : [];
  return mergeCourseLinks(
    t.links,
    holiday,
    ...docs.map((d) => mergeCourseLinks(d.links, LESSON_LINKS[d.id])),
  ).map(namedLink);
}

/** One program of a tradition's path, or null when none of its modules is written yet. */
export function composeProgram(tradition: string, step: PathStep, modules: CourseModule[] = MODULES, traditionName = tradition): CourseProgram | null {
  const index = moduleIndex(modules);
  const ids = step.modules(tradition);
  const written = ids.map((id) => index.byId.get(id)).filter((m): m is CourseModule => isWritten(m));
  if (!written.length) return null;
  const docs = new Map<string, CourseDoc>();
  const quizzes = new Map<string, Quiz>();
  const stages: CourseStage[] = written.flatMap((m) =>
    m.stages.map((s) => ({
      ...clone(s),
      tasks: s.tasks.map((t): CourseTask => {
        const own = (t.docs ?? []).filter((id) => index.docs.has(id));
        own.forEach((id) => docs.set(id, index.docs.get(id)!));
        const quiz = t.quiz && index.quizzes.has(t.quiz) ? t.quiz : null;
        if (quiz) quizzes.set(quiz, index.quizzes.get(quiz)!);
        return { ...clone(t), docs: own, quiz, links: taskLinks(t, own.map((id) => index.docs.get(id)!)) };
      }),
    })),
  );
  // The least time over the program: what its stages ask, with the rest on the last stage.
  const asked = stages.reduce((n, s) => n + (s.min_days ?? 0), 0);
  if (step.minDays > asked && stages.length) {
    const last = stages[stages.length - 1];
    last.min_days = (last.min_days ?? 0) + (step.minDays - asked);
  }
  return {
    id: `${tradition}-${step.key}`,
    tradition,
    path: step.key,
    position: PATH.indexOf(step),
    kind: step.kind,
    title: `${traditionName}: ${step.title}`,
    summary: step.summary,
    description: step.description,
    award: step.award,
    awardLabel: step.awardLabel,
    stages,
    docs: [...docs.values()],
    quizzes: [...quizzes.values()],
    missing: ids.filter((id) => !isWritten(index.byId.get(id))),
  };
}

/** A tradition's path: its programs that have anything written, in order. */
export function traditionPath(tradition: string, modules: CourseModule[] = MODULES): CourseProgram[] {
  const name = COURSE_TRADITIONS.find((t) => t.id === tradition)?.name ?? tradition;
  return PATH.map((step) => composeProgram(tradition, step, modules, name)).filter((p): p is CourseProgram => !!p);
}

/** Every ready-made program from the courses. */
export function coursePrograms(modules: CourseModule[] = MODULES): CourseProgram[] {
  return COURSE_TRADITIONS.flatMap((t) => traditionPath(t.id, modules));
}

/** Traditions the courses cover now (the database's templates cover the rest). */
export const courseTraditions = (modules: CourseModule[] = MODULES) => [...new Set(coursePrograms(modules).map((p) => p.tradition))];
