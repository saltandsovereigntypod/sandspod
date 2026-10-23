// The Grimoire's page on each rune and ogham stave: three quick words, then
// the stave in depth (its shape and name, its traditional meaning, how it's
// read reversed where that's done, its correspondences and its use in
// practice, with a question to sit with). The words are in deep/runes.ts and
// deep/ogham.ts. Shared with the website through
// scripts/core/divination-library.ts. Pure.

import { OGHAM_DEEP } from './deep/ogham.ts';
import { BLANK_RUNE_DEEP, RUNES_DEEP } from './deep/runes.ts';
import type { StaveDeep } from './deep/types.ts';

export type { StaveDeep } from './deep/types.ts';
export { OGHAM_DEEP, RUNES_DEEP, BLANK_RUNE_DEEP };

/** The sections of a stave's page, in order. Reversed shows only where it's written. */
export const STAVE_SECTIONS: { key: Exclude<keyof StaveDeep, 'words'>; label: string }[] = [
  { key: 'stave', label: 'The stave' },
  { key: 'meaning', label: 'Its meaning' },
  { key: 'reversed', label: 'Reversed or merkstave' },
  { key: 'correspondences', label: 'Correspondences' },
  { key: 'practice', label: 'In practice' },
  { key: 'question', label: 'A question to sit with' },
];

/** A rune's or a stave's page, by its name as in staves.ts ("Fehu", "Blank rune", "Beith"). */
export const staveDeep = (name: string): StaveDeep | null => RUNES_DEEP[name] ?? OGHAM_DEEP[name] ?? (name === 'Blank rune' ? BLANK_RUNE_DEEP : null);
