// Premade rituals and spells: original workings written for the app, drawn
// from open practices and public-domain sources, that anyone can begin as a
// guided ritual, plan for a night, or copy into their own templates.
// Closed and initiatory traditions are described in the Library instead of
// being turned into templates, and baneful work stays defensive only.

/** The kinds of practice someone can follow (Settings → My practice). */
export type PracticeId =
  | 'eclectic'
  | 'green'
  | 'kitchen'
  | 'hedge'
  | 'solitary'
  | 'cosmic'
  | 'crystal'
  | 'elemental'
  | 'sea'
  | 'folk';

/** Paths from lib/library/traditions.ts (PATH_TRADITIONS ids). */
export type PremadePath = 'wicca' | 'wheel' | 'celtic' | 'norse' | 'hellenic' | 'roman' | 'slavic' | 'christian' | 'egyptian' | 'hindu';

/** Intention keys from lib/rituals/planner.ts (INTENTIONS). */
export type PremadeIntention =
  | 'protection'
  | 'prosperity'
  | 'love'
  | 'healing'
  | 'banishing'
  | 'intuition'
  | 'courage'
  | 'cleansing'
  | 'beginnings'
  | 'study'
  | 'peace';

export type PremadeMoon = 'new' | 'waxing' | 'full' | 'waning' | 'dark' | 'blue' | 'eclipse';

export type PremadeIngredient = {
  /** As the person would buy or find it: "A white candle", "A pinch of salt". */
  name: string;
  /** A Living Library entry, "traditional/<type>/<key>", when there is one. */
  ref?: string;
  optional?: boolean;
};

export type PremadeStep = {
  title: string;
  instructions: string;
  /** Words to say aloud, if any. Original wording or public domain only. */
  spoken?: string;
  /** A timer for the step, in minutes. */
  minutes?: number;
  /** Move on by itself when the timer ends (needs minutes). */
  timed?: boolean;
  /** Light the altar's candles as the step begins. */
  light?: boolean;
  /** Snuff the altar's candles as the step ends. */
  snuff?: boolean;
};

export type Premade = {
  /** Unique, kebab-case, stable forever (saved plans point at it). */
  id: string;
  title: string;
  kind: 'ritual' | 'spell';
  /** One or two sentences: what it is and what it's for. */
  summary: string;
  /** The main intention, or null for a seasonal or devotional rite. */
  intention: PremadeIntention | null;
  /** Further intentions it serves. */
  alsoFor?: PremadeIntention[];
  /** Practices it belongs to; at least one. */
  practices: PracticeId[];
  /** Paths it belongs to; empty means it suits anyone. */
  paths: PremadePath[];
  /** When it's meant for. */
  moon?: PremadeMoon[];
  /** Holiday ids from lib/holidays.ts (TRADITIONS[].holidays[].id). */
  holidays?: string[];
  /** 0 = Sunday … 6 = Saturday, for planetary-day work. */
  weekday?: number;
  /** About how long it takes, in minutes. */
  minutes: number;
  level: 'beginner' | 'intermediate';
  /** Works for one person (nearly everything here). */
  solo: boolean;
  ingredients: PremadeIngredient[];
  preparation: string;
  steps: PremadeStep[];
  closing: string;
  /** Fire, ingestion, skin, pets, pregnancy: anything to take care with. */
  safety?: string;
  /** Where it comes from, honestly: old custom, modern practice, or both. */
  lore: string;
  /** Credits: public-domain works, folklore collections, scholarship. */
  sources?: string[];
};
