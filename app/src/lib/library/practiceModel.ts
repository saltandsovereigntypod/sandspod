// My Practice entries, written exactly as the website's Book of Shadows writes
// them (grimoire/js/app.js "New Practice Entry" and "Edit Entry", saved by
// js/living-library-sync.js into living_library_entries).

import { PRACTICE_TYPES, typeSingular } from './model.ts';

/** The fields the website's New and Edit Entry forms ask for, in its order. */
export const PRACTICE_FIELDS = [
  { key: 'Meaning', label: 'Meaning', lines: 3 },
  { key: 'Uses', label: 'Uses', lines: 3 },
  { key: 'PairsWith', label: 'Pairs With', lines: 2 },
  { key: 'Substitutions', label: 'Substitutions', lines: 2 },
  { key: 'Notes', label: 'Notes', lines: 5 },
] as const;

export type PracticeFieldKey = (typeof PRACTICE_FIELDS)[number]['key'];
export type PracticeInput = Record<PracticeFieldKey, string>;

export const PRACTICE_TYPE_OPTIONS = PRACTICE_TYPES.map((value) => ({ value, label: typeSingular(value) }));

export function emptyPracticeInput(existing?: Record<string, unknown> | null): PracticeInput {
  return Object.fromEntries(
    PRACTICE_FIELDS.map(({ key }) => [key, typeof existing?.[key] === 'string' ? (existing[key] as string) : '']),
  ) as PracticeInput;
}

/**
 * Like the website: keep any other My Practice keys the entry already has,
 * overwrite the five form fields, and drop whatever is left empty.
 */
export function mergePractice(existing: Record<string, unknown> | null | undefined, input: PracticeInput) {
  const merged: Record<string, unknown> = { ...(existing ?? {}) };
  for (const { key } of PRACTICE_FIELDS) merged[key] = input[key].trim();
  for (const key of Object.keys(merged)) {
    const value = merged[key];
    if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) delete merged[key];
  }
  return merged;
}

export function hasPracticeText(input: PracticeInput): boolean {
  return PRACTICE_FIELDS.some(({ key }) => input[key].trim().length > 0);
}

/** A brand-new living_library_entries row, as js/living-library-sync.js upserts it. */
export function newPracticeRow(args: {
  userId: string;
  entityId: string;
  name: string;
  type: string;
  myPractice: Record<string, unknown>;
  now?: Date;
}) {
  return {
    user_id: args.userId,
    entity_id: args.entityId,
    name: args.name.trim() || 'Untitled',
    type: args.type || 'note',
    image: null,
    my_practice: args.myPractice,
    community: {},
    layout: {},
    updated_at: (args.now ?? new Date()).toISOString(),
  };
}
