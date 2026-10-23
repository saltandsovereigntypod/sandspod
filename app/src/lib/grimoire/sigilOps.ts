// A sigil kept as its own Grimoire page: the intent, the sigil as an image
// element (its picture as the url, the sigil itself in metadata so the app and
// the website can redraw it), how it was made, and room for notes on charging
// it. Shared by the app's store and the website's sigil maker, so both write
// the same rows. Pure.

import { sigilDataUrl, sigilDetails, sigilName, type Sigil } from '../sigil/sigil.ts';
import { applyOps, ensureBook, nextOrder, type Op } from './edits.ts';
import type { GrimoireSnapshot } from './types.ts';

export const SIGIL_PAGE_TYPE = 'sigil';

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

export type SigilPageInput = {
  sigil: Sigil;
  /** The page's name; the intent, shortened, when blank. */
  title?: string;
  sectionId: string | null;
  /** The date as people read it, e.g. "23 October 2026". */
  dateText: string;
};

/** The blocks of a sigil page, in order: type, content, metadata. */
export function sigilPageBlocks(sigil: Sigil, dateText: string): { type: string; content: string; metadata: Record<string, unknown> }[] {
  const url = sigilDataUrl(sigil);
  const name = sigilName(sigil);
  return [
    { type: 'heading', content: 'Statement of intent', metadata: {} },
    { type: 'quote', content: escapeHtml(sigil.intent.trim()), metadata: {} },
    { type: 'image', content: url, metadata: { url, caption: name, alt: `Sigil for ${name}`, sigil } },
    { type: 'heading', content: 'How it was made', metadata: {} },
    { type: 'correspondence', content: sigilDetails(sigil, dateText), metadata: {} },
    { type: 'heading', content: 'Charging and letting go', metadata: {} },
    { type: 'text', content: '', metadata: {} },
  ];
}

/** The operations that save a sigil page (and the book, if there's none yet), and the new page's id. */
export function sigilPageOps(
  snapshot: GrimoireSnapshot,
  ctx: { userId: string; now: string },
  { sigil, title, sectionId, dateText }: SigilPageInput,
  makeId: () => string,
): { id: string; ops: Op[] } {
  const { bookId, ops } = ensureBook(snapshot, ctx, makeId);
  const next = applyOps(snapshot, ops);
  // Only a section in this book; otherwise the page goes in loose.
  const section = sectionId ? next.sections.find((s) => s.id === sectionId && s.book_id === bookId) ?? null : null;
  const id = makeId();
  const siblings = next.pages.filter((p) => p.book_id === bookId && (p.section_id ?? null) === (section?.id ?? null));
  const all: Op[] = [
    ...ops,
    {
      kind: 'insert',
      table: 'grimoire_pages',
      id,
      row: {
        id,
        user_id: ctx.userId,
        book_id: bookId,
        section_id: section?.id ?? null,
        title: (title ?? '').trim() || `Sigil: ${sigilName(sigil)}`,
        icon: '',
        page_type: SIGIL_PAGE_TYPE,
        sort_order: nextOrder(siblings),
      },
    },
  ];
  sigilPageBlocks(sigil, dateText).forEach((block, index) => {
    const blockId = makeId();
    all.push({
      kind: 'insert',
      table: 'grimoire_blocks',
      id: blockId,
      row: {
        id: blockId,
        user_id: ctx.userId,
        book_id: bookId,
        page_id: id,
        block_type: block.type,
        content: block.content,
        metadata: block.metadata,
        rich_content: null,
        sort_order: index,
      },
    });
  });
  return { id, ops: all };
}
