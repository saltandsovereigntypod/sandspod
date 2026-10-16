// Pages for holy days and moon phases, opened by tapping them on Today and
// kept in the Grimoire: what the day is, who is honoured and why, what we do
// and don't know, how to keep it now, a suggested working, and its
// correspondences in the Living Library. Pure data.

export type HolyPage = {
  /**
   * Which day this is:
   * - a holiday in lib/holidays.ts: "<traditionId>-<holidayId>", e.g. "hellenic-thargelia", "wheel-samhain"
   *   (wheel_south shares the wheel pages; hellenic_monthly uses "hellenic_monthly-<id>")
   * - an event of a calendar in lib/calendars: its event id, e.g. "roman-cerialia", "attic-artemis", "hindu-diwali"
   * - a moon phase: "moon-<phase>", phase one of new, waxing-crescent, first-quarter, waxing-gibbous, full, waning-gibbous, last-quarter, waning-crescent, dark
   */
  ref: string;
  title: string;
  /** Other names people search for. */
  aka?: string[];
  /** The tradition, in words: "Hellenic", "Roman", "Hindu", "Wheel of the Year", "The moon". */
  tradition: string;
  /** One or two sentences: what it is. */
  summary: string;
  /** Who is honoured and why (gods, ancestors, the land, the season), in a short paragraph. */
  honours: string;
  /** Its history and how it was kept, a few short paragraphs separated by blank lines. */
  history: string;
  /** What the evidence shows, and where it runs out. Always honest. */
  knowAndDont: { known: string; unknown: string };
  /** How people keep it today, as doable suggestions (3–6 lines). */
  celebrate: string[];
  /** A suggested working: a premade id (lib/rituals/premade) when one fits, and/or a short outline of steps. */
  ritual: { premade?: string; title?: string; outline?: string[] };
  /** Correspondences by name, matching Living Library entries where possible. */
  correspondences: { deities?: string[]; herbs?: string[]; crystals?: string[]; colors?: string[]; foods?: string[]; symbols?: string[] };
  /** For a living religion's festival: a respectful note on whose festival it is and how outsiders can approach it. */
  respect?: string;
  /** Sources: URLs or full citations. */
  sources: string[];
};
