// Self-dedication journeys: a guided path of study, practice, discernment and
// a dedication rite, for each path (Wicca, Norse, Hellenic…) and each deity in
// the Living Library. These are dedications, not initiations: initiation in
// most traditions is given by a group, lineage or teacher, and the content
// says so. Pure data; the screens live in src/app/(tabs)/rituals/journeys.

import type { PremadeIngredient, PremadeStep } from '../rituals/premade/types';

/** A passage of a lesson. Kept short: a few paragraphs, plain and warm. */
export type LessonSection = {
  heading: string;
  /** Paragraphs separated by a blank line. */
  body: string;
};

export type Lesson = {
  id: string;
  title: string;
  /** One line: what you'll come away with. */
  summary: string;
  /** About how long it takes to read, in minutes. */
  minutes: number;
  sections: LessonSection[];
  /** What the evidence actually shows, and where it runs out. Always present. */
  knowAndDont: { known: string; unknown: string };
  /** How people practise this today: concrete, doable. */
  inPractice: string;
  /** Questions to sit with or journal on. */
  reflect: string[];
  /** Short readings to go further: public-domain texts and reputable modern works. */
  further?: string[];
  /** Living Library entries this lesson touches ("traditional/<type>/<key>"). */
  library?: string[];
  /** Premade workings that put the lesson into practice (premade ids). */
  premade?: string[];
};

/** Something to do during a stage, possibly over several days. */
export type Practice = {
  id: string;
  title: string;
  instructions: string;
  /** Repeat this many times (nights, weeks…); 1 for once. */
  times: number;
  /** How often, when it repeats. */
  every?: 'day' | 'week' | 'esbat' | 'sabbat' | 'holy-day' | 'month';
  /** A prompt for the journal after each time. */
  prompt?: string;
  premade?: string;
};

/** A guided rite in the same shape as a premade working's steps. */
export type Rite = {
  title: string;
  summary: string;
  minutes: number;
  ingredients: PremadeIngredient[];
  preparation: string;
  steps: PremadeStep[];
  closing: string;
  safety?: string;
};

export type StageKind = 'threshold' | 'study' | 'practice' | 'discernment' | 'dedication' | 'ongoing';

export type Stage = {
  kind: StageKind;
  title: string;
  /** What this stage is for, in a few sentences. */
  intro: string;
  /** Suggested length, in days. Journeys wait when paused; nothing is ever failed. */
  days: number;
  lessons: Lesson[];
  practices: Practice[];
  /** A rite for this stage (the threshold opening, the dedication itself). */
  rite?: Rite;
  /** For discernment: honest questions, and what it's fine to decide. */
  questions?: string[];
};

export type JourneyKind = 'path' | 'deity';

export type Journey = {
  /** 'path-wicca', 'deity-hekate'… stable forever (progress points at it). */
  id: string;
  kind: JourneyKind;
  /** PATH_TRADITIONS id for a path; for a deity, the paths it belongs to. */
  paths: string[];
  /** For a deity journey: its Living Library key, e.g. "traditional/deity/hekate". */
  deityRef?: string;
  title: string;
  /** One or two sentences for the list. */
  summary: string;
  /** Shown before starting: what this is and isn't, who it's for. */
  welcome: string;
  /** About this being or path in a paragraph: honest, traditional and modern. */
  about: string;
  /** Things to know first: cautions, community views, closed or contested areas. */
  notes: string[];
  /** Holiday ids (lib/holidays.ts) that belong to this path or deity. */
  holyDays: string[];
  stages: Stage[];
  /** Credits for quotations and key claims: public domain and scholarship. */
  sources: string[];
};
