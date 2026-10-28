// Coven altars on the Altar widget. A place on the widget holds either one of
// your own altars (its id, as it always has) or one of a coven's altars, kept
// as "coven:<altarId>" so the two can never be mistaken for each other. The
// coven altar is fetched as the coven keeps it (lib/covens/altarSync.ts) and
// shown with its coven's name; what's tapped on the widget goes back to it
// through the coven's own save, but only while you may tend it and no ritual
// is holding it. Otherwise the widget shows it without buttons. Pure, so it
// can be tested (covenAltarWidgetData.ts does the fetching and keeping).

import { altarDataFromDocument, type AltarDocument } from './altar/snapshot.ts';
import type { SavedAltar } from './altar/types.ts';
import type { AltarAccess } from './covens/altarDoc.ts';

export const COVEN_PREFIX = 'coven:';

/** The value a widget place keeps for a coven altar. */
export const covenSlotId = (altarId: string) => `${COVEN_PREFIX}${altarId}`;

/** The coven altar a place (or a widget altar's id) names, or null for one of your own. */
export function covenAltarIdOf(slotId: string | null | undefined): string | null {
  if (typeof slotId !== 'string' || !slotId.startsWith(COVEN_PREFIX)) return null;
  return slotId.slice(COVEN_PREFIX.length) || null;
}

export const isCovenSlot = (slotId: string | null | undefined) => covenAltarIdOf(slotId) != null;

/** The coven altars put in the widget's places, each once, in place order. */
export function covenSlotIds(chosen: (string | null)[]): string[] {
  return [...new Set(chosen.map(covenAltarIdOf).filter((id): id is string => !!id))];
}

/** "Test Altar · Salt & Sovereignty Coven". */
export function covenWidgetName(altarName: string, covenName: string): string {
  const altar = String(altarName || '').trim() || 'Coven altar';
  const coven = String(covenName || '').trim();
  return coven ? `${altar} · ${coven}` : altar;
}

/**
 * Whether taps on the widget may change this altar: you may tend it, no ritual
 * is under way there, and it isn't resting after a rite.
 */
export function canTendFromWidget(access: (AltarAccess & { held_until?: string | null }) | null | undefined, now: number = Date.now()): boolean {
  if (!access?.can_edit) return false;
  if (access.ritual_id) return false;
  const held = access.held_until ? Date.parse(access.held_until) : NaN;
  return !(Number.isFinite(held) && held > now);
}

/** One coven altar as the widget keeps it on the phone. */
export type CovenWidgetEntry = {
  altarId: string;
  covenId: string;
  covenName: string;
  covenSlug: string;
  altarName: string;
  archived: boolean;
  doc: AltarDocument;
  /** Taps on the widget may change it (canTendFromWidget). */
  tendable: boolean;
  updatedAt: string;
  fetchedAt: string;
};

/** A coven altar shaped like one of your own, so the widget draws it the same way. */
export function covenSavedAltar(entry: CovenWidgetEntry): SavedAltar {
  const name = covenWidgetName(entry.altarName, entry.covenName);
  return {
    ...altarDataFromDocument(entry.doc, name, entry.updatedAt),
    ...(entry.archived ? { archived: true } : {}),
    id: covenSlotId(entry.altarId),
    name,
    updatedAt: entry.updatedAt,
  };
}

/** Where a tap on the widget opens the altar. */
export function covenAltarLink(entry: Pick<CovenWidgetEntry, 'covenSlug' | 'altarId'>): string {
  return `saltandsovereignty://coven/c/${encodeURIComponent(entry.covenSlug)}/altars/${encodeURIComponent(entry.altarId)}`;
}

/** What the widget needs beyond the altar itself: where it opens, and whether its buttons show. */
export function covenWidgetExtras(entry: CovenWidgetEntry | undefined): { link?: string; readOnly?: boolean } {
  if (!entry) return {};
  return { link: covenAltarLink(entry), ...(entry.tendable ? {} : { readOnly: true }) };
}

/** Taps on the widget, sorted by where they go: your own altars, or each coven altar. */
export function routeWidgetActions<T extends { altarId: string }>(actions: T[]): { personal: T[]; coven: Map<string, T[]> } {
  const personal: T[] = [];
  const coven = new Map<string, T[]>();
  for (const action of actions) {
    const id = covenAltarIdOf(action.altarId);
    if (!id) personal.push(action);
    else coven.set(id, [...(coven.get(id) ?? []), action]);
  }
  return { personal, coven };
}

/**
 * The coven altars to show after a fetch: what came back, then what was kept
 * for any that couldn't be reached (offline). Those the database no longer
 * shows you (deleted, or you've left the coven) are dropped, and named in
 * `gone` so their places can be emptied.
 */
export function mergeCovenFetch(
  wanted: string[],
  kept: Record<string, CovenWidgetEntry>,
  fetched: { ok: true; entries: CovenWidgetEntry[] } | { ok: false },
): { entries: Record<string, CovenWidgetEntry>; gone: string[] } {
  const entries: Record<string, CovenWidgetEntry> = {};
  const gone: string[] = [];
  const got = fetched.ok ? new Map(fetched.entries.map((e) => [e.altarId, e])) : null;
  for (const id of wanted) {
    if (!got) {
      if (kept[id]) entries[id] = kept[id];
    } else if (got.has(id)) entries[id] = got.get(id)!;
    else gone.push(id);
  }
  return { entries, gone };
}
