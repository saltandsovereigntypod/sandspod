// Book of Shadows links: any object on the altar can point at a page in your
// grimoire (its recipe, its lore, the ritual it belongs to). The link lives in
// the object's `livingState.app.pageId`, with the page's title kept beside it
// so the link still reads well before the grimoire has loaded. The website's
// grimoire_page_links joins page to page only, so nothing is written there.
// Pure, so it can be tested.

import { appStateOf, logAppEvent, setAppState } from '../livingState.ts';
import type { SavedObject } from '../types.ts';
import type { GrimoireSnapshot, PageRow } from '../../grimoire/types.ts';

export type PageLink = { pageId: string; title: string };

export function pageLinkOf(object: SavedObject | null | undefined): PageLink | null {
  if (!object) return null;
  const app = appStateOf(object);
  const pageId = typeof app.pageId === 'string' ? app.pageId : '';
  if (!pageId) return null;
  return { pageId, title: typeof app.pageTitle === 'string' ? app.pageTitle : '' };
}

/** Link an object to a page (and note it in the object's story). */
export function withPageLink(object: SavedObject, page: Pick<PageRow, 'id' | 'title'>, now: string): SavedObject {
  const current = pageLinkOf(object);
  const title = page.title.trim() || 'Untitled page';
  if (current?.pageId === page.id && current.title === title) return object;
  return logAppEvent(object, { kind: 'page', text: `Linked to “${title}” in your Book of Shadows.` }, now, { pageId: page.id, pageTitle: title });
}

export function withoutPageLink(object: SavedObject, now: string): SavedObject {
  if (!pageLinkOf(object)) return object;
  return setAppState(object, { pageId: '', pageTitle: '' }, now);
}

/** The linked page's title as the grimoire now has it (renamed since, or gone). */
export function resolvePageLink(link: PageLink | null, snapshot: GrimoireSnapshot | null): { title: string; exists: boolean | null } | null {
  if (!link) return null;
  if (!snapshot) return { title: link.title || 'A page in your Book of Shadows', exists: null };
  const page = snapshot.pages.find((p) => p.id === link.pageId);
  return page ? { title: page.title || link.title || 'Untitled page', exists: true } : { title: link.title || 'A page', exists: false };
}

export type PageChoice = { id: string; title: string; section: string; type: string; suggested: boolean };

const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Pages to pick from: those whose title shares a word with the object's name
 * first (a "Rosemary" page for a rosemary sprig), then the rest by section and
 * title. A search narrows them.
 */
export function pageChoices(snapshot: GrimoireSnapshot | null, objectLabel: string, query = '', limit = 60): PageChoice[] {
  if (!snapshot) return [];
  const sections = new Map(snapshot.sections.map((s) => [s.id, s.title]));
  const label = fold(objectLabel)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !['candle', 'statue', 'point', 'sprig', 'loose'].includes(w));
  const terms = fold(query).split(/\s+/).filter(Boolean);
  return snapshot.pages
    .map((p) => {
      const title = (p.title || 'Untitled page').trim();
      const t = fold(title);
      return { id: p.id, title, section: p.section_id ? sections.get(p.section_id) ?? '' : '', type: String(p.page_type || 'blank'), suggested: label.some((w) => t.includes(w)) };
    })
    .filter((c) => terms.every((w) => fold(`${c.title} ${c.section}`).includes(w)))
    .sort((a, b) => Number(b.suggested) - Number(a.suggested) || a.section.localeCompare(b.section) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

/** Objects on the altar linked to a page, for "on your altar" lists. */
export const objectsLinkedTo = (objects: SavedObject[], pageId: string) => objects.filter((o) => pageLinkOf(o)?.pageId === pageId);
