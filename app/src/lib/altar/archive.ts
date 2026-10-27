// Archived altars: kept whole (everything on them, their petitions, their
// history) but set aside. An archived altar moves to the bottom of the list,
// under "Archived altars", and rests: no reminders, no tending nudges, nothing
// on the To tend list and no place on the widget until it's restored. The
// flag lives in the altar's own saved data (altar_data.archived and
// archivedAt), so it needs no new table and reads the same on the website
// (js/core/altar.js and js/core/tend.js, archive). Pure, so it can be tested.

import { documentFromAltar, type AltarDocument } from './snapshot.ts';
import type { AltarData, SavedAltar } from './types.ts';

export const isArchived = (altar: AltarData | null | undefined) => !!altar && altar.archived === true;

/** The altars still in use, in their order. */
export function activeAltars<T extends AltarData>(altars: T[]): T[] {
  return altars.filter((a) => !isArchived(a));
}

/** The list as it shows: altars in use first, then the archived ones (most recently archived first). */
export function splitArchived<T extends AltarData>(altars: T[]): { active: T[]; archived: T[] } {
  const archived = altars.filter(isArchived).sort((a, b) => String(b.archivedAt || '').localeCompare(String(a.archivedAt || '')));
  return { active: activeAltars(altars), archived };
}

/** The ids of archived altars, to leave out what belongs to them (petitions, tendables). */
export const archivedIds = (altars: (AltarData & { id: string })[]) => new Set(altars.filter(isArchived).map((a) => a.id));

/**
 * The extra fields an archived (or restored) altar keeps. A restored one says
 * archived: false outright, so a save merged over the old copy (a guest's
 * altar on the device) can't carry the old flag back.
 */
export function withArchived(extra: Record<string, unknown>, archived: boolean, now: string): Record<string, unknown> {
  return { ...extra, archived, archivedAt: archived ? now : '' };
}

/** The save that archives (or restores) a saved altar: the same altar, everything kept, with the flag changed. */
export function archiveSave(altar: SavedAltar, archived: boolean, now: string): { id: string; name: string; doc: AltarDocument } {
  const doc = documentFromAltar(altar);
  return { id: altar.id, name: altar.name, doc: { ...doc, extra: withArchived(doc.extra, archived, now) } };
}

/**
 * What a ritual's or page's link to an altar can say: its name, or that it
 * was deleted (once your altars are known and it isn't among them; a deleted
 * altar's pages and rituals are kept). Unknown altars read "Your altar".
 */
export function linkedAltar(altarId: string | null | undefined, altars: { id: string; name?: string | null }[], known: boolean): { name: string; deleted: boolean } | null {
  if (!altarId) return null;
  const found = altars.find((a) => a.id === altarId);
  if (found) return { name: String(found.name || '').trim() || 'Your altar', deleted: false };
  return known ? { name: ARCHIVE_WORDS.deletedLink, deleted: true } : { name: 'Your altar', deleted: false };
}

/** The words for archiving and for deleting, so both screens say the same. */
export const ARCHIVE_WORDS = {
  archive: 'Archive',
  restore: 'Restore',
  section: (n: number) => `Archived altars (${n})`,
  archived: (name: string) => `${name || 'The altar'} is archived. Everything on it is kept; it rests from reminders and the To tend list until you restore it.`,
  restored: (name: string) => `${name || 'The altar'} is restored.`,
  deleteTitle: 'Delete this altar for good?',
  deleteBody:
    'Everything on it goes. Your Grimoire pages made from this altar stay in your Grimoire. If you only want it out of the way, archive it instead: it keeps everything and rests until you restore it.',
  deletedLink: 'This altar was deleted',
};
