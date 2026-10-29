// Other ways of counting days: the moon's own months, and the traditional
// calendars of the paths (Roman, Attic, Old Icelandic, Egyptian, Hindu
// lunar days, Slavic month names, the Coligny calendar). They are a way of
// seeing time, shown beside the ordinary date; every date the app stores is
// still an ordinary date, so syncing and the website are unaffected. Pure.

export type CalendarId = 'moon' | 'roman' | 'attic' | 'icelandic' | 'kemetic' | 'hindu' | 'slavic' | 'coligny';

/** How solid the calendar is, shown on every date it gives. */
export type Confidence =
  /** Used historically and known from good sources (or still kept). */
  | 'historical'
  /** Rebuilt by scholars from partial evidence. */
  | 'reconstructed'
  /** A modern creation. */
  | 'modern';

export type Place = { latitude: number; longitude: number };

export type CalendarContext = {
  /** Where the person is, if known (sunrise, hemisphere, Sirius rising…). */
  place: Place | null;
  /** Hemisphere from the place, or the person's choice; 'north' when unknown. */
  hemisphere: 'north' | 'south';
  /** Per-calendar choices, e.g. { kemeticNewYear: 'sirius' | 'aug-1' }. */
  options: Record<string, string>;
  /**
   * The contexts of the other calendars this one follows (the moon's months
   * named or begun as the Attic calendar, say), by id, so a followed
   * calendar is worked out with the person's own choices for it.
   */
  related?: Partial<Record<CalendarId, CalendarContext>>;
};

/** One choice a calendar offers, with its options. */
export type CalendarChoice = {
  key: string;
  label: string;
  options: CalendarOption[];
  default: string;
  /** What to say when none of the options follows a calendar the person shows. */
  followHint?: string;
};

export type CalendarOption = {
  value: string;
  label: string;
  note?: string;
  /**
   * The calendar this option follows: offered only while that calendar is
   * shown beside the date (Also show), and read as the default otherwise.
   */
  follows?: CalendarId;
};

/** A day worth noticing in that calendar: the Kalends, the Noumenia, the first day of Þorri. */
export type CalendarMark = { name: string; meaning: string };

export type CalendarDate = {
  calendar: CalendarId;
  /** A short line for Today and widgets: "Moon 9 · day 12", "Nones of October". */
  short: string;
  /** A full sentence: "The 12th day of the Worm Moon, the moon waxing gibbous". */
  long: string;
  month?: { name: string; index: number; days?: number; meaning?: string };
  day?: number;
  year?: { label: string };
  /** Notable days falling on this date. */
  marks: CalendarMark[];
};

/** A yearly or monthly observance the calendar defines, on an ordinary date. */
export type CalendarEvent = {
  calendar: CalendarId;
  /** Stable id, e.g. 'roman-cerialia', 'kemetic-wep-ronpet'. */
  id: string;
  name: string;
  meaning: string;
  /** Local start day (midnight). */
  date: Date;
  /** How many days it runs. */
  days: number;
  /** How often it comes round, when not yearly (the Attic monthly holy days). */
  recurs?: 'monthly';
};

export type CalendarDef = {
  id: CalendarId;
  name: string;
  /** The path it belongs to (lib/library/traditions ids), if any. */
  path?: string;
  confidence: Confidence;
  /** A few sentences shown in Settings: what it is, where it comes from, what's uncertain. */
  about: string;
  /** Choices the person can make, e.g. where the Egyptian year starts. */
  choices?: CalendarChoice[];
  sources: string[];
  /** The date in this calendar for a given ordinary day (local midday of `day`). */
  dateOf(day: Date, ctx: CalendarContext): CalendarDate;
  /** Observances between two ordinary days, inclusive. */
  eventsBetween(from: Date, to: Date, ctx: CalendarContext): CalendarEvent[];
};
