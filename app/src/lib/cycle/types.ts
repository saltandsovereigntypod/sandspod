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

/** A day's notes, all optional. Energy and intuition are 1 (low) to 5 (high). */
export type DayNote = {
  date: string;
  energy: number | null;
  intuition: number | null;
  mood: string;
  body: string;
  dreams: string;
  text: string;
  updatedAt: string;
};

/**
 * What the person tells us about their body, so the wording and the
 * estimates fit: estimates are softened or left out for most of these.
 */
export type Situation = 'irregular' | 'hormonal' | 'pregnant' | 'postpartum' | 'perimenopause';

/** 'cycle' follows their bleeds; 'moon' follows the moon alone (for people who don't bleed). */
export type CycleMode = 'cycle' | 'moon';

export type CycleSettings = {
  mode: CycleMode;
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

export type CycleData = {
  version: 1;
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
