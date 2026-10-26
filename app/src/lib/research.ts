// "A note on our research": the owner's word on how everything in the app
// was researched, and how to send a note, correction or addition. Pure data
// and helpers, shared with the website (scripts/core/research.ts →
// js/core/research.js, read by js/research-note.js).
//
// The contact address is the app's own (More → Contact us), never a new one.

import { SUPPORT_EMAIL } from './community/model.ts';

export { SUPPORT_EMAIL };

export const RESEARCH_NOTE_TITLE = 'A note on our research';

/** The full note, a paragraph each, first person from the owner. */
export const RESEARCH_NOTE: string[] = [
  'Everything here, the Living Library, the deities, festivals, calendars and traditions, the cards, runes and staves, was researched with care and to the best of my ability.',
  'Traditions are living things and scholars disagree. If you have notes, corrections, additions or a tradition you’d like to see, please write to me at ' + SUPPORT_EMAIL + '. I read everything.',
];

/** The compact one-line version at the foot of a page. */
export const RESEARCH_LINE = 'Researched with care and to the best of my ability. Notes, corrections and additions are always welcome.';

/** The first-visit card on the Living Library. */
export const RESEARCH_CARD =
  'Everything in the Living Library was researched with care and to the best of my ability. If something here looks wrong or missing, I’d love to hear from you.';

/** Where the full note lives: the app's route, and the website's page. */
export const RESEARCH_NOTE_HREF = '/more/research';
export const RESEARCH_NOTE_SITE_HREF = '/more/research/';

/** Remembers, on this device, that the Living Library card was put away. */
export const RESEARCH_CARD_SEEN_KEY = 'research.libraryCardSeen';

/** What a "Send a note" email is about: "Note on: Hekate", or the note as a whole. */
export function researchSubject(page?: string | null): string {
  const name = String(page ?? '').replace(/\s+/g, ' ').trim();
  return `Note on: ${name || 'our research'}`;
}

/**
 * A mailto for sending a note about one page (its name in the subject), or
 * about the research as a whole. `kind` says what sort of page it is
 * ("Living Library", "Holiday"…), so the note can be found again.
 */
export function researchNoteUrl(page?: string | null, kind?: string | null): string {
  const name = String(page ?? '').replace(/\s+/g, ' ').trim();
  const body = [
    name ? `I have a note, correction or addition about ${name}${kind ? ` (${kind})` : ''}.` : 'I have a note, correction or addition about the research.',
    '',
    '',
  ].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(researchSubject(name))}&body=${encodeURIComponent(body)}`;
}
