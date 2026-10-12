// How the Book of Shadows reads: mundane mode's everyday wording and the
// page font chosen in settings. Mirrors the website (grimoire/js/app.js
// updateMundaneModeUI, grimoire/js/ui/mundane.js, js/my-settings.js
// applyMundaneModePreference and the grimoire-font-* classes in grimoire.css).

import { fonts } from '../../theme.ts';
import { fullDate } from '../calendar.ts';
import type { PageRow } from './types.ts';

/** Same device key the website keeps in localStorage. */
export const MUNDANE_MODE_KEY = 'saltAndSovereigntyMundaneMode';

/** The device's own choice wins; with none saved yet, the settings default applies. */
export function mundaneFromStorage(stored: string | null, settingDefault: boolean): boolean {
  if (stored === 'true') return true;
  if (stored === 'false') return false;
  return settingDefault;
}

/** "Spell" reads as "Entry" and "Ritual" as "Reflection", keeping the case of the first letter. */
export function mundaneWords(text: string): string {
  const swap = (word: string, plain: string) => (word[0] === word[0].toLowerCase() ? plain.toLowerCase() : plain);
  return text
    .replace(/\bspell\b/gi, (word) => swap(word, 'Entry'))
    .replace(/\britual\b/gi, (word) => swap(word, 'Reflection'));
}

export function bookTitle(title: string | null | undefined, mundane: boolean): string {
  if (mundane) return 'Personal Journal';
  return title || 'Grimoire';
}

/** In mundane mode a page is known by the day it was written. */
export function displayPageTitle(page: Pick<PageRow, 'title' | 'created_at'>, mundane: boolean): string {
  if (mundane) return fullDate(page.created_at) || 'Journal Entry';
  return page.title || 'Untitled page';
}

export type PageFontKey = 'classic-serif' | 'dark-academia' | 'soft-journal' | 'handwritten';

export type PageFace = {
  /** Paragraphs, lists and fields. */
  body: string;
  /** Bold runs and list markers. */
  strong: string;
  /** Multiplies body sizes; Cormorant sits smaller than Source Serif at the same size. */
  scale: number;
  /** Multiplies body line height. */
  leading: number;
};

// The app only bundles Source Serif 4 and Cormorant Garamond, so each website
// font maps to the closest of those:
// classic-serif (Georgia) → Source Serif 4, as before;
// dark-academia (Garamond) → Cormorant Garamond;
// soft-journal (Palatino) → Source Serif 4 with roomier lines;
// handwritten (cursive) → Cormorant Garamond italic.
const FACES: Record<PageFontKey, PageFace> = {
  'classic-serif': { body: fonts.body, strong: fonts.bodySemi, scale: 1, leading: 1 },
  'dark-academia': { body: fonts.display, strong: fonts.displayBold, scale: 1.15, leading: 1 },
  'soft-journal': { body: fonts.body, strong: fonts.bodySemi, scale: 1.05, leading: 1.15 },
  handwritten: { body: fonts.displayItalic, strong: fonts.displayBold, scale: 1.15, leading: 1 },
};

export function pageFace(key: string | null | undefined): PageFace {
  return FACES[(key as PageFontKey) ?? 'classic-serif'] ?? FACES['classic-serif'];
}
