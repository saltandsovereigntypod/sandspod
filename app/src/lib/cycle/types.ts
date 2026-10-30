// Cycle & Moon: what is kept, as one JSON document. The app and the website
// write exactly this shape, and it is only ever stored or sent encrypted
// (vault.ts); the server sees ciphertext. Days are local calendar days,
// "YYYY-MM-DD".

export type Flow = 'spotting' | 'light' | 'medium' | 'heavy';

/** One bleed: when it began, when it ended (null while it goes on, or if never marked), and the flow on the days logged. */
export type Bleed = {
  id: string;
  start: string;
  end: string | null;
  flow: Record<string, Flow>;
  updatedAt: string;
};

/** How strongly a symptom was felt: 1 mild, 2 moderate, 3 strong. */
export type Intensity = 1 | 2 | 3;

/**
 * A day's notes, all optional. Energy and intuition are 1 (low) to 5 (high).
 * `symptoms` holds the common ones by id (symptoms.ts) and `custom` the
 * person's own, by the name they gave; both were added in content version 2.
 */
export type DayNote = {
  date: string;
  energy: number | null;
  intuition: number | null;
  mood: string;
  body: string;
  dreams: string;
  text: string;
  symptoms: Record<string, Intensity>;
  custom: Record<string, Intensity>;
  updatedAt: string;
};

/**
 * What the person tells us about their body, so the wording and the
 * estimates fit: estimates are softened or left out for most of these.
 */
export type Situation = 'irregular' | 'hormonal' | 'pregnant' | 'postpartum' | 'perimenopause';

/** 'cycle' follows their bleeds; 'moon' follows the moon alone (for people who don't bleed). */
export type CycleMode = 'cycle' | 'moon';

/**
 * How long their cycle is taken to be: worked out from what's logged
 * ('auto', the default), exactly so many days, or a range. Added in content
 * version 2.
 */
export type CycleLength = { mode: 'auto' | 'exact' | 'range'; exact: number; min: number; max: number };

export type CycleSettings = {
  mode: CycleMode;
  length: CycleLength;
  situations: Situation[];
  /** The Maiden, Mother, Enchantress and Crone lens. Off unless chosen. */
  archetypes: boolean;
  /** The small card on Today. */
  today: boolean;
  /** Offer the moon-time altar while bleeding. */
  altar: boolean;
  /** Offer to keep a cycle's reflection in the Grimoire (only what they write there). */
  grimoire: boolean;
  /** Phone reminders. Off unless chosen; worded discreetly unless `full`. */
  reminders: { on: boolean; full: boolean; ahead: number; at: number };
  updatedAt: string;
};

/**
 * The content version: 1 was the first release; 2 added symptoms, custom
 * symptoms and the cycle length setting. A version 1 document opens as
 * version 2 with those empty (model.ts normalizeData).
 */
export type CycleData = {
  version: 2;
  bleeds: Bleed[];
  notes: DayNote[];
  settings: CycleSettings;
  /** Bleeds and notes deleted (bleed id, or "note:<date>"), with when, so a deletion carries across devices. */
  removed: Record<string, string>;
};

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

/** The four folk patterns of where in the lunar month a bleed begins. */
export type MoonPattern = 'white' | 'pink' | 'red' | 'purple';

/** The moon's quarter of its month, as the practice suggestions read it. */
export type MoonQuarter = 'dark' | 'waxing' | 'full' | 'waning';
