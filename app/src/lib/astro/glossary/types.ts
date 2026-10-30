// The shape of a glossary entry (see lib/astro/glossary.ts).

export type TermCategory =
  | 'basics'
  | 'planet'
  | 'point'
  | 'angle'
  | 'sign'
  | 'house'
  | 'element'
  | 'dignity'
  | 'aspect'
  | 'pattern'
  | 'motion'
  | 'moon'
  | 'eclipse'
  | 'timing'
  | 'house-system'
  | 'zodiac'
  | 'technique';

/** The parts of a detailed explanation, in the order they show. */
export type TermDetail = {
  /** The astronomy: what is actually happening in the sky. */
  sky?: string;
  /** Where the idea comes from. */
  history?: string;
  /** How Hellenistic, medieval, modern, psychological, sidereal and other traditions read it. */
  traditions?: string;
  /** Its use in witchcraft and magic. */
  craft?: string;
  /** What to take care over: misreadings, fear, overreach. */
  care?: string;
};

export const DETAIL_SECTIONS: { key: keyof TermDetail; label: string }[] = [
  { key: 'sky', label: 'In the sky' },
  { key: 'history', label: 'History' },
  { key: 'traditions', label: 'How traditions read it' },
  { key: 'craft', label: 'In the craft' },
  { key: 'care', label: 'Take care' },
];

/** Somewhere a term leads in the app. */
export type TermLink =
  | { kind: 'planet-guide'; planet: string; label?: string }
  | { kind: 'moon-phase'; phase: 'new' | 'firstQuarter' | 'full' | 'lastQuarter'; label?: string }
  | { kind: 'library'; name: string; label?: string }
  | { kind: 'tool'; tool: 'hours' | 'chart' | 'sky' | 'learn' | 'charts'; label?: string };

export type GlossaryEntry = {
  id: string;
  term: string;
  category: TermCategory;
  symbol?: string;
  /** Other names it goes by, also linked in text. */
  aliases?: string[];
  /** One or two plain sentences. */
  simple: string;
  detailed: TermDetail;
  /** Other term ids worth reading next. */
  related?: string[];
  links?: TermLink[];
};
