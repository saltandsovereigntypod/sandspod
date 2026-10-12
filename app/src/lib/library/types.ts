import type { Layer } from '../settings/defaults.ts';

export type TraditionalValue = string | string[] | Record<string, unknown>;
export type TraditionalRecord = Record<string, TraditionalValue>;
/** type → key → record; a few keys (candle.styles) hold a nested collection. */
export type TraditionalLibraryData = Record<string, Record<string, TraditionalRecord | Record<string, TraditionalRecord>>>;

/** A `living_library_entries` row as the website writes it. */
export type PracticeRow = {
  entity_id: string;
  name: string;
  type: string;
  image: string | null;
  my_practice: Record<string, unknown> | null;
  community: Record<string, unknown> | null;
  /** The page layout set with the website's Edit Page; read-only here. */
  layout?: unknown;
  updated_at: string | null;
};

/** `living_library_entries.layout`: how the website lays out one entry's page. */
export type PageLayout = {
  sectionOrder: string[];
  hiddenFields: Partial<Record<Layer, string[]>>;
  fieldOrder: Partial<Record<Layer, string[]>>;
  customFields: { key: string; label: string }[];
};

export type LibraryEntry = {
  /** Stable app id: `traditional:<type>:<key>` or `practice:<entity_id>`. */
  id: string;
  name: string;
  type: string;
  /** e.g. "Herb", "Candle Style"; from the Traditional Library when known. */
  category: string;
  /** The website's reference, `traditional/<type>/<key>`, when there is one. */
  traditionalRef: string | null;
  traditional: TraditionalRecord | null;
  myPractice: Record<string, unknown> | null;
  community: Record<string, unknown> | null;
  image: string | null;
  tags: string[];
  /** living_library_entries.entity_id values folded into this entry. */
  practiceEntityIds: string[];
  /** The row whose My Practice is shown (the most recently saved one). Edits go here. */
  practiceSourceId?: string | null;
  /** The website's page layout for this entry, if one was saved. */
  layout?: PageLayout | null;
  /** When its living_library_entries rows were last saved (the latest), if it has any. */
  updatedAt?: string | null;
};

export type LibraryField = {
  key: string;
  label: string;
  text: string;
  chips: string[] | null;
  /** What each chip opens (an ingredient's name without its amount). */
  chipNames: string[] | null;
};
