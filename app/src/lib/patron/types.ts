// Patron deities: the honest guide (what a patron is, how to know, how to
// accept or decline, how it changes a practice), and each deity's sacred
// days and simple devotions, used by Today and reminders. Pure data.

export type GuideSection = {
  id: string;
  heading: string;
  /** Paragraphs separated by a blank line. Plain and warm, not textbook. */
  body: string;
  /** Optional bullet points shown after the body. */
  points?: string[];
};

export type PatronGuide = {
  title: string;
  /** One or two sentences under the title. */
  intro: string;
  sections: GuideSection[];
  /** What the evidence shows and where it runs out, as with the journeys. */
  knowAndDont: { known: string; unknown: string };
  /** Short readings: public-domain texts and reputable modern works. */
  further: string[];
};

/** When a deity is especially honoured. Computed by lib/patron/days.ts. */
export type SacredRule =
  /** A weekday, 0 = Sunday (e.g. Thor on Thursday, by the day's name). */
  | { kind: 'weekday'; day: number }
  /** A moon phase: the new moon (first crescent), the full moon, or the dark moon. */
  | { kind: 'moon'; phase: 'new' | 'full' | 'dark' }
  /** A day of the Attic lunar month (1 = Noumenia; 'last' = the Deipnon, the last day), in every month or only in `month` ("Gamelion"). */
  | { kind: 'attic'; day: number | 'last'; month?: string }
  /** A fixed day of the year (month 1–12). */
  | { kind: 'fixed'; month: number; day: number }
  /** A day of the East Asian lunisolar calendar (month 1–12, never the leap month), worked out by lib/patron/lunisolar.ts: 8/15 is the Mid-Autumn Festival. */
  | { kind: 'lunisolar'; month: number; day: number }
  /** A festival already in lib/holidays.ts, by its tradition and id (e.g. 'hellenic', 'thesmophoria'). */
  | { kind: 'holiday'; tradition: string; id: string };

export type SacredDay = {
  rule: SacredRule;
  /** "Thursday, Thor's day", "The Deipnon at the dark moon". */
  name: string;
  /** Why this day, honestly: ancient, later, or a modern custom. */
  why: string;
  /** 'ancient' when attested in ancient sources; 'modern' for modern devotional custom. */
  basis: 'ancient' | 'later' | 'modern';
};

export type DeityDevotion = {
  /** Living Library deity key (traditionalData), e.g. "hekate". */
  key: string;
  sacred: SacredDay[];
  /** Short, simple daily devotions: one line each, doable in a few minutes, with things people have at home. */
  devotions: string[];
  /** One sentence on how this deity is usually approached (respectfully, honestly), for the patron page. */
  approach: string;
  /** Sources for the sacred days (URLs or full citations). */
  sources: string[];
};
