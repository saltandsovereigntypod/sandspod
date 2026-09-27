// Every change to the Book of Shadows is an operation on one row. Operations
// are applied to the copy on the phone straight away, queued, and sent to
// Supabase in order, so nothing typed is lost when the connection drops.
//
// Row payloads mirror what the website writes (grimoire/js/core/database.js,
// grimoire/js/ui/editor.js, grimoire/js/app.js): same columns, same block_type
// values, rich blocks as { content: html, rich_content: { html } }, list
// blocks as plain text in content, image and page-link details in metadata.

import { editorKind, findTemplate } from './elements.ts';
import { markupToHtml } from './markup.ts';
import { blockMetadata, pageBlocks } from './structure.ts';
import type { BlockRow, BlockType, GrimoireSnapshot, PageRow, SectionRow } from './types.ts';

export type Table = 'grimoire_books' | 'grimoire_sections' | 'grimoire_pages' | 'grimoire_blocks' | 'grimoire_page_links';

export type Row = { id: string } & Record<string, unknown>;
export type Patch = Record<string, unknown>;

export type Op =
  | { kind: 'insert'; table: Table; id: string; row: Row }
  | { kind: 'update'; table: Table; id: string; patch: Patch }
  | { kind: 'delete'; table: Table; id: string };

export type InsertOp = Extract<Op, { kind: 'insert' }>;
export type UpdateOp = Extract<Op, { kind: 'update' }>;

export type FailedOp = { op: Op; message: string };

type Ctx = { userId: string; now: string };

// ---------------------------------------------------------------------------
// Ordering

type Ordered = { sort_order: number | null };

/** Next sort_order at the end of a list. The website uses the list length;
 *  one past the highest value gives the same answer without ever tying after
 *  something in the middle was removed. */
export function nextOrder(items: Ordered[]): number {
  if (!items.length) return 0;
  return Math.max(...items.map((i) => i.sort_order ?? 0)) + 1;
}

/** Moves one item and renumbers the list 0..n-1, as the website does.
 *  Returns only the sort_order changes that actually need saving. */
export function reorder<T extends { id: string } & Ordered>(
  sorted: T[],
  id: string,
  direction: 'up' | 'down',
): { id: string; sort_order: number }[] {
  const from = sorted.findIndex((item) => item.id === id);
  const to = direction === 'up' ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= sorted.length) return [];
  const next = [...sorted];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next
    .map((item, index) => ({ id: item.id, sort_order: index, before: item.sort_order }))
    .filter((item) => item.before !== item.sort_order)
    .map(({ id: itemId, sort_order }) => ({ id: itemId, sort_order }));
}

// ---------------------------------------------------------------------------
// Payload builders

export function bookInsert(ctx: Ctx, id: string): Op {
  return { kind: 'insert', table: 'grimoire_books', id, row: { id, user_id: ctx.userId, title: 'Book of Shadows' } };
}

/** The website creates the book the first time someone opens their grimoire. */
export function ensureBook(snapshot: GrimoireSnapshot, ctx: Ctx, makeId: () => string): { bookId: string; ops: Op[] } {
  const book = snapshot.books[0];
  if (book) return { bookId: book.id, ops: [] };
  const id = makeId();
  return { bookId: id, ops: [bookInsert(ctx, id)] };
}

export function sectionInsert(snapshot: GrimoireSnapshot, ctx: Ctx, input: { id: string; bookId: string; title: string }): Op {
  const siblings = snapshot.sections.filter((s) => s.book_id === input.bookId);
  return {
    kind: 'insert',
    table: 'grimoire_sections',
    id: input.id,
    row: {
      id: input.id,
      user_id: ctx.userId,
      book_id: input.bookId,
      title: input.title.trim(),
      sort_order: nextOrder(siblings),
      is_collapsed: false,
    },
  };
}

export function sectionRename(ctx: Ctx, section: SectionRow, title: string): UpdateOp | null {
  const clean = title.trim();
  if (!clean || clean === section.title) return null;
  return { kind: 'update', table: 'grimoire_sections', id: section.id, patch: { title: clean, updated_at: ctx.now } };
}

export function pageInsert(
  snapshot: GrimoireSnapshot,
  ctx: Ctx,
  input: { id: string; bookId: string; sectionId: string | null; title: string; templateKey: string },
  makeId: () => string,
): Op[] {
  const template = findTemplate(input.templateKey);
  const siblings = snapshot.pages.filter((p) => p.book_id === input.bookId && (p.section_id ?? null) === input.sectionId);
  const page: Op = {
    kind: 'insert',
    table: 'grimoire_pages',
    id: input.id,
    row: {
      id: input.id,
      user_id: ctx.userId,
      book_id: input.bookId,
      section_id: input.sectionId,
      title: input.title.trim() || 'Untitled Page',
      icon: '',
      page_type: template.key,
      sort_order: nextOrder(siblings),
    },
  };
  const blocks: Op[] = template.blocks.map((block, index) => {
    const id = makeId();
    return {
      kind: 'insert',
      table: 'grimoire_blocks',
      id,
      row: {
        id,
        user_id: ctx.userId,
        book_id: input.bookId,
        page_id: input.id,
        block_type: block.type,
        content: block.content || '',
        metadata: {},
        rich_content: null,
        sort_order: index,
      },
    };
  });
  return [page, ...blocks];
}

export function pageTitlePatch(ctx: Ctx, page: PageRow, title: string): UpdateOp | null {
  const clean = title.trim() || 'Untitled Page';
  if (clean === page.title) return null;
  return { kind: 'update', table: 'grimoire_pages', id: page.id, patch: { title: clean, updated_at: ctx.now } };
}

export function blockInsert(
  snapshot: GrimoireSnapshot,
  ctx: Ctx,
  input: { id: string; page: PageRow; type: BlockType },
): InsertOp {
  return {
    kind: 'insert',
    table: 'grimoire_blocks',
    id: input.id,
    row: {
      id: input.id,
      user_id: ctx.userId,
      book_id: input.page.book_id,
      page_id: input.page.id,
      block_type: input.type,
      content: input.type === 'heading' ? 'New Heading' : '',
      metadata: {},
      rich_content: null,
      sort_order: nextOrder(pageBlocks(snapshot, input.page.id)),
    },
  };
}

/**
 * Saving what someone typed into a block. Rich blocks (paragraph, heading,
 * note) are saved like the website's contenteditable: HTML in both content
 * and rich_content.html. List and correspondence blocks are plain text.
 */
export function blockTextPatch(ctx: Ctx, block: BlockRow, value: string): UpdateOp {
  if (editorKind(block.block_type) === 'rich') {
    const html = markupToHtml(value);
    return {
      kind: 'update',
      table: 'grimoire_blocks',
      id: block.id,
      patch: { content: html, rich_content: { html }, updated_at: ctx.now },
    };
  }
  const patch: Patch = { content: value, updated_at: ctx.now };
  // A plain block never has rich HTML on the website; clear any stale copy
  // so the new text is what both readers show.
  if (block.rich_content?.html) patch.rich_content = null;
  return { kind: 'update', table: 'grimoire_blocks', id: block.id, patch };
}

/** Image url/caption and page-link target/label live in metadata. Like the
 *  website, an image's url is also copied into content. */
export function blockMetadataPatch(ctx: Ctx, block: BlockRow, fields: Record<string, unknown>): UpdateOp {
  const metadata = { ...blockMetadata(block), ...fields };
  const patch: Patch = { metadata, updated_at: ctx.now };
  if ('url' in fields) patch.content = fields.url;
  return { kind: 'update', table: 'grimoire_blocks', id: block.id, patch };
}

export function sortOrderOps(table: Table, changes: { id: string; sort_order: number }[]): Op[] {
  return changes.map((c) => ({ kind: 'update', table, id: c.id, patch: { sort_order: c.sort_order } }));
}

export function pageLinkInsert(ctx: Ctx, input: { id: string; source: PageRow; target: PageRow }): Op {
  return {
    kind: 'insert',
    table: 'grimoire_page_links',
    id: input.id,
    row: {
      id: input.id,
      user_id: ctx.userId,
      book_id: input.source.book_id,
      source_page_id: input.source.id,
      target_page_id: input.target.id,
      link_label: input.target.title,
    },
  };
}

export function deleteOp(table: Table, id: string): Op {
  return { kind: 'delete', table, id };
}

// ---------------------------------------------------------------------------
// Applying operations to the phone's copy

const KEYS: Record<Table, keyof Omit<GrimoireSnapshot, 'fetchedAt'>> = {
  grimoire_books: 'books',
  grimoire_sections: 'sections',
  grimoire_pages: 'pages',
  grimoire_blocks: 'blocks',
  grimoire_page_links: 'links',
};

type AnyRow = { id: string } & Record<string, unknown>;

export function applyOp(snapshot: GrimoireSnapshot, op: Op, now = new Date().toISOString()): GrimoireSnapshot {
  const key = KEYS[op.table];
  const rows = snapshot[key] as unknown as AnyRow[];
  const next: GrimoireSnapshot = { ...snapshot };
  const set = (value: AnyRow[]) => {
    (next as unknown as Record<string, AnyRow[]>)[key] = value;
  };

  if (op.kind === 'insert') {
    const existing = rows.find((r) => r.id === op.id);
    const row: AnyRow = { created_at: now, updated_at: now, ...existing, ...op.row };
    set(existing ? rows.map((r) => (r.id === op.id ? row : r)) : [...rows, row]);
    return next;
  }

  if (op.kind === 'update') {
    set(rows.map((r) => (r.id === op.id ? { ...r, ...op.patch } : r)));
    return next;
  }

  // Deletes follow the database's foreign keys: a page takes its blocks and
  // links with it; a section's pages stay in the book, loose.
  set(rows.filter((r) => r.id !== op.id));
  if (op.table === 'grimoire_pages') {
    next.blocks = next.blocks.filter((b) => b.page_id !== op.id);
    next.links = next.links.filter((l) => l.source_page_id !== op.id && l.target_page_id !== op.id);
  } else if (op.table === 'grimoire_sections') {
    next.pages = next.pages.map((p) => (p.section_id === op.id ? { ...p, section_id: null } : p));
  } else if (op.table === 'grimoire_books') {
    next.sections = next.sections.filter((s) => s.book_id !== op.id);
    next.pages = next.pages.filter((p) => p.book_id !== op.id);
    const pageIds = new Set(next.pages.map((p) => p.id));
    next.blocks = next.blocks.filter((b) => pageIds.has(b.page_id));
    next.links = next.links.filter((l) => pageIds.has(l.source_page_id));
  }
  return next;
}

export function applyOps(snapshot: GrimoireSnapshot, ops: Op[], now?: string): GrimoireSnapshot {
  return ops.reduce((acc, op) => applyOp(acc, op, now), snapshot);
}

// ---------------------------------------------------------------------------
// The send queue

const PARENT_FIELDS = ['page_id', 'source_page_id', 'target_page_id', 'section_id', 'book_id'];

function refersTo(op: Op, ids: Set<string>): boolean {
  if (op.kind !== 'insert') return false;
  return PARENT_FIELDS.some((field) => field !== 'section_id' && ids.has(op.row[field] as string));
}

/**
 * Adds an operation to the queue, folding it into earlier unsent operations on
 * the same row where it can. The first `locked` operations are being sent
 * right now and are left alone.
 */
export function enqueue(queue: Op[], op: Op, locked = 0): Op[] {
  const head = queue.slice(0, locked);
  let tail = queue.slice(locked);
  const same = (o: Op) => o.table === op.table && o.id === op.id;

  if (op.kind === 'insert') return [...queue, op];

  if (op.kind === 'update') {
    const at = tail.map(same).lastIndexOf(true);
    const headAt = head.map(same).lastIndexOf(true);
    const previous = at >= 0 ? tail[at] : headAt >= 0 ? head[headAt] : undefined;
    if (previous?.kind === 'delete') return queue; // the row is already gone
    if (at >= 0) {
      const earlier = tail[at];
      tail = [...tail];
      if (earlier.kind === 'insert') tail[at] = { ...earlier, row: { ...earlier.row, ...op.patch } };
      else if (earlier.kind === 'update') tail[at] = { ...earlier, patch: { ...earlier.patch, ...op.patch } };
      return [...head, ...tail];
    }
    return [...queue, op];
  }

  // Delete.
  const unsentInsert = tail.some((o) => same(o) && o.kind === 'insert');
  if (unsentInsert) {
    // Never reached the server: forget it and everything that hangs off it.
    const gone = new Set([op.id]);
    for (const o of tail) if (refersTo(o, gone)) gone.add(o.id);
    tail = tail.filter((o) => !gone.has(o.id));
    if (op.table === 'grimoire_sections') tail = tail.map((o) => detachSection(o, op.id));
    return [...head, ...tail];
  }
  tail = tail.filter((o) => !(same(o) && o.kind === 'update'));
  return [...head, ...tail, op];
}

function detachSection(op: Op, sectionId: string): Op {
  if (op.table !== 'grimoire_pages') return op;
  if (op.kind === 'insert' && op.row.section_id === sectionId) return { ...op, row: { ...op.row, section_id: null } };
  if (op.kind === 'update' && op.patch.section_id === sectionId) return { ...op, patch: { ...op.patch, section_id: null } };
  return op;
}

// ---------------------------------------------------------------------------
// Errors

export type SendError = { status?: number; code?: string; message?: string };

/** True when trying again later might work: no connection, server trouble,
 *  or an expired sign-in that will refresh itself. */
export function isTransient(error: SendError): boolean {
  const status = error.status ?? 0;
  if (!status) return true;
  if (status >= 500 || status === 401 || status === 408 || status === 429) return true;
  if (error.code === 'PGRST301' || error.code === 'PGRST303') return true;
  return /network|fetch|timeout|offline/i.test(error.message ?? '');
}

/** Inserting a row that already exists means an earlier try got through. */
export function alreadyApplied(op: Op, error: SendError): boolean {
  return op.kind === 'insert' && error.code === '23505';
}

export function retryDelay(attempt: number): number {
  return Math.min(60_000, 3_000 * 2 ** Math.max(0, attempt - 1));
}

export function describeOp(op: Op): string {
  const what: Record<Table, string> = {
    grimoire_books: 'your book',
    grimoire_sections: 'a section',
    grimoire_pages: 'a page',
    grimoire_blocks: 'a page element',
    grimoire_page_links: 'a page link',
  };
  const verb = op.kind === 'insert' ? 'Adding' : op.kind === 'update' ? 'Changes to' : 'Removing';
  return `${verb} ${what[op.table]}`;
}
