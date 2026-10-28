// Closed & living traditions, and the sourcing notes that go with them.
// Pure lookups, so they can be tested; the content lives in ./data.

import { SUPPORT_EMAIL } from '../../community/model.ts';
import { DIASPORA } from './data/diaspora.ts';
import { INDIGENOUS } from './data/indigenous.ts';
import { OTHER } from './data/other.ts';
import { SOURCING } from './data/sourcing.ts';
import type { ClosedGroup, ClosedTradition, Openness, SourcingNote } from './types.ts';

export type { ClosedGroup, ClosedSection, ClosedTradition, Openness, SourcingNote } from './types.ts';

export const CLOSED_TRADITIONS: ClosedTradition[] = [...INDIGENOUS, ...DIASPORA, ...OTHER];
export const SOURCING_NOTES: SourcingNote[] = SOURCING;

export const GROUP_ORDER: ClosedGroup[] = ['indigenous', 'african-diaspora', 'other'];

export const GROUP_LABELS: Record<ClosedGroup, string> = {
  indigenous: 'Indigenous',
  'african-diaspora': 'African diaspora',
  other: 'Other',
};

export const OPENNESS_LABELS: Record<Openness, string> = {
  closed: 'Closed',
  initiatory: 'Initiatory',
  debated: 'Debated',
};

export const OPENNESS_DETAIL: Record<Openness, string> = {
  closed: 'Held by a people or nation; outsiders are guests',
  initiatory: 'Entered through initiation, a house or a teacher',
  debated: 'The community itself disagrees about outsiders',
};

const byId = new Map(CLOSED_TRADITIONS.map((t) => [t.id, t]));

export function closedById(id: string | null | undefined, list: ClosedTradition[] = CLOSED_TRADITIONS): ClosedTradition | null {
  if (!id) return null;
  return list === CLOSED_TRADITIONS ? byId.get(id) ?? null : list.find((t) => t.id === id) ?? null;
}

/** The three groups in order, each sorted by name; empty groups are left out. */
export function closedGroups(list: ClosedTradition[] = CLOSED_TRADITIONS): { group: ClosedGroup; label: string; items: ClosedTradition[] }[] {
  return GROUP_ORDER.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    items: list.filter((t) => t.group === group).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length > 0);
}

/** Lower case, accents and punctuation removed, so "Vodou" finds "Vodou" and "vodou," alike. */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Matches the name and other names; an empty query returns everything. */
export function searchClosed(query: string, list: ClosedTradition[] = CLOSED_TRADITIONS): ClosedTradition[] {
  const q = fold(query);
  if (!q) return list;
  return list.filter((t) => [t.name, ...t.aka].some((name) => fold(name).includes(q)));
}

/** Related entries that exist in the guide. */
export function relatedTo(tradition: ClosedTradition, list: ClosedTradition[] = CLOSED_TRADITIONS): ClosedTradition[] {
  return (tradition.related ?? []).map((id) => closedById(id, list)).filter((t): t is ClosedTradition => !!t && t.id !== tradition.id);
}

const baseName = (name: string) => fold(name.replace(/\([^)]*\)/g, ' '));

/**
 * The sourcing note for a Living Library ref ("traditional/herb/sandalwood")
 * or a name ("White sage"). Refs match exactly; names match ignoring case,
 * accents and anything in brackets.
 */
export function sourcingFor(refOrName: string | null | undefined, notes: SourcingNote[] = SOURCING_NOTES): SourcingNote | null {
  if (!refOrName) return null;
  const value = refOrName.trim();
  if (!value) return null;
  const byRef = notes.find((n) => n.ref && n.ref === value);
  if (byRef) return byRef;
  if (value.includes('/')) {
    // A ref the notes don't list by ref: try its key as a name ("palo-santo" → "palo santo").
    const key = value.split('/').pop() ?? '';
    return key ? sourcingFor(key, notes) : null;
  }
  const folded = fold(value);
  const base = baseName(value);
  if (!folded) return null;
  return notes.find((n) => fold(n.name) === folded) ?? notes.find((n) => baseName(n.name) === base && !!base) ?? null;
}

/** A Library entry's note: by its traditional ref first, then by its name. */
export function sourcingForEntry(entry: { traditionalRef?: string | null; name: string }, notes: SourcingNote[] = SOURCING_NOTES): SourcingNote | null {
  return sourcingFor(entry.traditionalRef, notes) ?? sourcingFor(entry.name, notes);
}

/** All the notes, sorted by name. */
export function sourcingNotes(notes: SourcingNote[] = SOURCING_NOTES): SourcingNote[] {
  return [...notes].sort((a, b) => a.name.localeCompare(b.name));
}

export const CLOSED_GUIDE_TITLE = 'Closed & living traditions';

/** The owner's note shown at the top of the guide and of every entry. */
export const CLOSED_NOTICE =
  'Written with care, to the best of our knowledge. For the most accurate understanding, please learn from people who belong to this tradition. If you’re part of this faith or practice and have concerns, corrections or more to share, we’d be grateful to hear from you.';

export { SUPPORT_EMAIL };

/** A mailto for sending a correction about one tradition, or about the guide as a whole. */
export function correctionUrl(tradition?: Pick<ClosedTradition, 'id' | 'name'> | null): string {
  const subject = tradition ? `Correction: ${tradition.name}` : CLOSED_GUIDE_TITLE;
  const body = [
    tradition ? `I'd like to share a correction or more about ${tradition.name}.` : `I'd like to share a correction or more about the ${CLOSED_GUIDE_TITLE} guide.`,
    '',
    `Reference: ${tradition ? `closed/${tradition.id}` : 'closed'}`,
    '',
    '',
  ].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
