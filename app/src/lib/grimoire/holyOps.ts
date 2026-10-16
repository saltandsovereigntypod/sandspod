// Keeping a holy-day or moon page in the Grimoire: the rows it takes (the book
// if there's none yet, its section, the page tagged with its ref, and one block
// per part). Shared by the app's store and the website's Today pages, so both
// write the same rows. Pure.

import { applyOps, ensureBook, nextOrder, sectionInsert, type Op } from './edits.ts';
import type { GrimoireSnapshot } from './types.ts';

export type HolyPageInput = { ref: string; title: string; sectionTitle: string; blocks: { type: string; content: string }[] };

/** The operations that save a holy page under its section (made if missing), and the new page's id. */
export function holyPageOps(
  snapshot: GrimoireSnapshot,
  ctx: { userId: string; now: string },
  { ref, title, sectionTitle, blocks }: HolyPageInput,
  makeId: () => string,
): { id: string; ops: Op[] } {
  const { bookId, ops } = ensureBook(snapshot, ctx, makeId);
  let next = applyOps(snapshot, ops);
  const all: Op[] = [...ops];
  let section = next.sections.find((x) => x.book_id === bookId && x.title.trim().toLowerCase() === sectionTitle.toLowerCase());
  if (!section) {
    const sectionId = makeId();
    const op = sectionInsert(next, ctx, { id: sectionId, bookId, title: sectionTitle });
    all.push(op);
    next = applyOps(next, [op]);
    section = next.sections.find((x) => x.id === sectionId);
  }
  const sectionId = section?.id ?? null;
  const id = makeId();
  const siblings = next.pages.filter((p) => p.book_id === bookId && (p.section_id ?? null) === sectionId);
  all.push({
    kind: 'insert',
    table: 'grimoire_pages',
    id,
    row: { id, user_id: ctx.userId, book_id: bookId, section_id: sectionId, title, icon: '', page_type: 'blank', sort_order: nextOrder(siblings), metadata: { holyRef: ref } },
  });
  blocks.forEach((block, index) => {
    const blockId = makeId();
    all.push({
      kind: 'insert',
      table: 'grimoire_blocks',
      id: blockId,
      row: { id: blockId, user_id: ctx.userId, book_id: bookId, page_id: id, block_type: block.type, content: block.content, metadata: {}, rich_content: null, sort_order: index },
    });
  });
  return { id, ops: all };
}
