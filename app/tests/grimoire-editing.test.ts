import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  applyOps,
  blockInsert,
  blockMetadataPatch,
  blockTextPatch,
  deleteOp,
  enqueue,
  ensureBook,
  isTransient,
  alreadyApplied,
  nextOrder,
  pageInsert,
  pageLinkInsert,
  pageTitlePatch,
  reorder,
  sectionInsert,
  sectionRename,
  sortOrderOps,
  type Op,
} from '../src/lib/grimoire/edits.ts';
import { newId } from '../src/lib/grimoire/ids.ts';
import { htmlToMarkup, insertLink, markupToHtml, normalizeUrl, parseMarkup, wrapSelection } from '../src/lib/grimoire/markup.ts';
import { parseRichText } from '../src/lib/grimoire/richText.ts';
import { pageBlocks, tableOfContents } from '../src/lib/grimoire/structure.ts';
import type { BlockRow, GrimoireSnapshot, PageRow } from '../src/lib/grimoire/types.ts';

const ctx = { userId: 'u1', now: '2026-09-25T12:00:00.000Z' };
let counter = 0;
const makeId = () => `id${++counter}`;

const empty = (): GrimoireSnapshot => ({ fetchedAt: '', books: [], sections: [], pages: [], blocks: [], links: [] });

const page = (id: string, extra: Partial<PageRow> = {}): PageRow => ({
  id,
  book_id: 'b',
  section_id: null,
  title: id,
  page_type: 'blank',
  sort_order: 0,
  metadata: {},
  created_at: '2026-01-01T00:00:00Z',
  updated_at: null,
  ...extra,
});

const block = (id: string, extra: Partial<BlockRow> = {}): BlockRow => ({
  id,
  page_id: 'p',
  block_type: 'text',
  content: '',
  rich_content: null,
  metadata: {},
  sort_order: 0,
  created_at: '2026-01-01T00:00:00Z',
  ...extra,
});

const withBook = (): GrimoireSnapshot => ({
  ...empty(),
  books: [{ id: 'b', title: 'Book of Shadows', created_at: null, updated_at: null }],
});

// --- markup ---------------------------------------------------------------

test('stored HTML becomes editable markup and back', () => {
  const html = 'Speak <b>clearly</b> and <i>slowly</i><br>then <u>rest</u>';
  const markup = htmlToMarkup(html);
  assert.equal(markup, 'Speak **clearly** and *slowly*\nthen __rest__');
  assert.equal(markupToHtml(markup), 'Speak <b>clearly</b> and <i>slowly</i><br>then <u>rest</u>');
});

test('nested styles and links round-trip', () => {
  const samples = [
    '<b>bold <i>both</i></b><i> italic</i>',
    '<a href="https://saltandsovereignty.com">the <b>site</b></a> today',
    'Salt &amp; sovereignty 5 * 3 [not a link] snake_case __init__ a_',
    '<u><b>all</b></u><b>bold</b>',
    'back\\slash',
  ];
  for (const html of samples) {
    const markup = htmlToMarkup(html);
    assert.deepEqual(parseMarkup(markup), parseRichText(html), `${html} → ${markup}`);
  }
});

test('stray markers stay as text', () => {
  assert.deepEqual(parseMarkup('2 * 3 = 6'), [{ text: '2 * 3 = 6' }]);
  assert.deepEqual(parseMarkup('**open and *closed*'), [{ text: '**open and ' }, { text: 'closed', italic: true }]);
});

test('only http links become links', () => {
  assert.equal(markupToHtml('[x](javascript:alert(1))'), '[x](javascript:alert(1))');
  assert.equal(markupToHtml('[site](https://a.com)'), '<a href="https://a.com" rel="noopener">site</a>');
});

test('HTML special characters are escaped on save', () => {
  assert.equal(markupToHtml('<script> & "q"'), '&lt;script&gt; &amp; &quot;q&quot;');
});

test('toolbar wraps the selection', () => {
  assert.deepEqual(wrapSelection('light the candle', { start: 10, end: 16 }, 'bold'), {
    text: 'light the **candle**',
    selection: { start: 12, end: 18 },
  });
  assert.equal(wrapSelection('', { start: 0, end: 0 }, 'italic').text, '*italic*');
  assert.equal(insertLink('see the site', { start: 8, end: 12 }, 'https://a.com'), 'see the [site](https://a.com)');
  assert.equal(normalizeUrl('saltandsovereignty.com'), 'https://saltandsovereignty.com');
  assert.equal(normalizeUrl('not a url'), null);
});

// --- ordering -------------------------------------------------------------

test('reorder moves one item and renumbers only what changed', () => {
  const blocks = [block('a', { sort_order: 0 }), block('b', { sort_order: 1 }), block('c', { sort_order: 2 })];
  assert.deepEqual(reorder(blocks, 'c', 'up'), [
    { id: 'c', sort_order: 1 },
    { id: 'b', sort_order: 2 },
  ]);
  assert.deepEqual(reorder(blocks, 'a', 'up'), []);
  assert.deepEqual(reorder(blocks, 'c', 'down'), []);
  // Gaps and ties (from deletes or the website) are normalized.
  const messy = [block('a', { sort_order: 0 }), block('b', { sort_order: 0 }), block('c', { sort_order: 5 })];
  assert.deepEqual(reorder(messy, 'a', 'down'), [
    { id: 'a', sort_order: 1 },
    { id: 'c', sort_order: 2 },
  ]);
});

test('new items go after the highest sort order', () => {
  assert.equal(nextOrder([]), 0);
  assert.equal(nextOrder([{ sort_order: 0 }, { sort_order: 4 }, { sort_order: null }]), 5);
});

// --- payloads -------------------------------------------------------------

test('a first section also creates the book, like the website', () => {
  const { bookId, ops } = ensureBook(empty(), ctx, () => 'book1');
  assert.equal(bookId, 'book1');
  assert.deepEqual(ops, [
    { kind: 'insert', table: 'grimoire_books', id: 'book1', row: { id: 'book1', user_id: 'u1', title: 'Book of Shadows' } },
  ]);
  assert.deepEqual(ensureBook(withBook(), ctx, makeId).ops, []);
});

test('section rows match the website', () => {
  const snap = { ...withBook(), sections: [{ id: 's0', book_id: 'b', title: 'Herbs', sort_order: 0, created_at: null }] };
  const op = sectionInsert(snap, ctx, { id: 's1', bookId: 'b', title: '  Crystals ' });
  assert.deepEqual(op, {
    kind: 'insert',
    table: 'grimoire_sections',
    id: 's1',
    row: { id: 's1', user_id: 'u1', book_id: 'b', title: 'Crystals', sort_order: 1, is_collapsed: false },
  });
  assert.equal(sectionRename(ctx, snap.sections[0], ' Herbs '), null);
  assert.deepEqual(sectionRename(ctx, snap.sections[0], 'Plants'), {
    kind: 'update',
    table: 'grimoire_sections',
    id: 's0',
    patch: { title: 'Plants', updated_at: ctx.now },
  });
});

test('a new page from a template writes the page and its blocks', () => {
  counter = 0;
  const snap = { ...withBook(), pages: [page('old', { section_id: 's1', sort_order: 3 })] };
  const ops = pageInsert(snap, ctx, { id: 'p1', bookId: 'b', sectionId: 's1', title: 'Rosemary', templateKey: 'herb' }, makeId);
  const [pageOp, ...blockOps] = ops;
  assert.deepEqual(pageOp, {
    kind: 'insert',
    table: 'grimoire_pages',
    id: 'p1',
    row: { id: 'p1', user_id: 'u1', book_id: 'b', section_id: 's1', title: 'Rosemary', icon: '', page_type: 'herb', sort_order: 4 },
  });
  assert.equal(blockOps.length, 8);
  assert.deepEqual(blockOps[1], {
    kind: 'insert',
    table: 'grimoire_blocks',
    id: 'id2',
    row: {
      id: 'id2',
      user_id: 'u1',
      book_id: 'b',
      page_id: 'p1',
      block_type: 'correspondence',
      content: 'Planet:\nElement:\nDeities:\nMagical uses:',
      metadata: {},
      rich_content: null,
      sort_order: 1,
    },
  });
  // Unknown templates fall back to a blank page with one paragraph.
  const blank = pageInsert(snap, ctx, { id: 'p2', bookId: 'b', sectionId: null, title: ' ', templateKey: 'nope' }, makeId);
  assert.equal((blank[0] as Extract<Op, { kind: 'insert' }>).row.title, 'Untitled Page');
  assert.equal((blank[0] as Extract<Op, { kind: 'insert' }>).row.sort_order, 0);
  assert.equal(blank.length, 2);
});

test('rich blocks save HTML in content and rich_content; lists save plain text', () => {
  const para = block('x');
  assert.deepEqual(blockTextPatch(ctx, para, 'Light **three** candles').patch, {
    content: 'Light <b>three</b> candles',
    rich_content: { html: 'Light <b>three</b> candles' },
    updated_at: ctx.now,
  });
  const list = block('y', { block_type: 'ingredient_list' });
  assert.deepEqual(blockTextPatch(ctx, list, 'bay leaf\n**salt**').patch, { content: 'bay leaf\n**salt**', updated_at: ctx.now });
});

test('new heading blocks start with the website’s placeholder', () => {
  const snap = { ...withBook(), pages: [page('p')], blocks: [block('a', { sort_order: 2 })] };
  const op = blockInsert(snap, ctx, { id: 'n', page: snap.pages[0], type: 'heading' });
  assert.equal(op.row.content, 'New Heading');
  assert.equal(op.row.sort_order, 3);
  assert.equal(op.row.rich_content, null);
});

test('metadata patches merge and images copy the url into content', () => {
  const img = block('i', { block_type: 'image', metadata: '{"caption":"Altar"}' });
  assert.deepEqual(blockMetadataPatch(ctx, img, { url: 'https://x.com/a.jpg' }).patch, {
    metadata: { caption: 'Altar', url: 'https://x.com/a.jpg' },
    content: 'https://x.com/a.jpg',
    updated_at: ctx.now,
  });
  const link = block('l', { block_type: 'page_link' });
  assert.deepEqual(blockMetadataPatch(ctx, link, { target_page_id: 'p2', label: 'Moon' }).patch, {
    metadata: { target_page_id: 'p2', label: 'Moon' },
    updated_at: ctx.now,
  });
});

test('page titles are trimmed and never empty', () => {
  const p = page('p', { title: 'Old' });
  assert.equal(pageTitlePatch(ctx, p, 'Old '), null);
  assert.deepEqual(pageTitlePatch(ctx, p, '  '), {
    kind: 'update',
    table: 'grimoire_pages',
    id: 'p',
    patch: { title: 'Untitled Page', updated_at: ctx.now },
  });
});

test('page links carry the target title as their label', () => {
  const op = pageLinkInsert(ctx, { id: 'k', source: page('a'), target: page('b', { title: 'Full Moon' }) });
  assert.deepEqual(op, {
    kind: 'insert',
    table: 'grimoire_page_links',
    id: 'k',
    row: { id: 'k', user_id: 'u1', book_id: 'b', source_page_id: 'a', target_page_id: 'b', link_label: 'Full Moon' },
  });
});

// --- applying to the phone's copy ----------------------------------------

test('edits show up in the phone copy immediately', () => {
  counter = 0;
  let snap = withBook();
  const section = sectionInsert(snap, ctx, { id: 's', bookId: 'b', title: 'Spells' });
  snap = applyOps(snap, [section], ctx.now);
  snap = applyOps(snap, pageInsert(snap, ctx, { id: 'p', bookId: 'b', sectionId: 's', title: 'Moon', templateKey: 'moon' }, makeId), ctx.now);
  assert.deepEqual(
    tableOfContents(snap, 'b').map((g) => [g.section?.title, g.pages.map((p) => p.title)]),
    [['Spells', ['Moon']]],
  );
  const blocks = pageBlocks(snap, 'p');
  assert.equal(blocks.length, 6);
  snap = applyOps(snap, sortOrderOps('grimoire_blocks', reorder(blocks, blocks[1].id, 'up')));
  assert.equal(pageBlocks(snap, 'p')[0].id, blocks[1].id);

  // Deleting a section keeps its pages, loose.
  snap = applyOps(snap, [deleteOp('grimoire_sections', 's')]);
  assert.equal(snap.pages[0].section_id, null);
  // Deleting a page takes its blocks and links.
  snap = { ...snap, links: [{ id: 'l', source_page_id: 'x', target_page_id: 'p', link_label: null }] };
  snap = applyOps(snap, [deleteOp('grimoire_pages', 'p')]);
  assert.deepEqual([snap.pages.length, snap.blocks.length, snap.links.length], [0, 0, 0]);
});

// --- the queue ------------------------------------------------------------

const upd = (id: string, patch: Record<string, unknown>): Op => ({ kind: 'update', table: 'grimoire_blocks', id, patch });
const ins = (table: Op['table'], id: string, row: Record<string, unknown> = {}): Op => ({ kind: 'insert', table, id, row: { id, ...row } });

test('typing folds into one update per row', () => {
  let q: Op[] = [];
  q = enqueue(q, upd('a', { content: 'L' }));
  q = enqueue(q, upd('b', { sort_order: 1 }));
  q = enqueue(q, upd('a', { content: 'Light' }));
  assert.deepEqual(q, [upd('a', { content: 'Light' }), upd('b', { sort_order: 1 })]);
});

test('edits to an unsent row fold into its insert', () => {
  const q = enqueue([ins('grimoire_blocks', 'a', { content: '' })], upd('a', { content: 'hi' }));
  assert.deepEqual(q, [ins('grimoire_blocks', 'a', { content: 'hi' })]);
});

test('the operation being sent is never changed', () => {
  const q = enqueue([upd('a', { content: 'x' })], upd('a', { content: 'xy' }), 1);
  assert.deepEqual(q, [upd('a', { content: 'x' }), upd('a', { content: 'xy' })]);
});

test('deleting something never sent drops it and what hangs off it', () => {
  let q: Op[] = [
    ins('grimoire_sections', 's'),
    ins('grimoire_pages', 'p', { section_id: 's', book_id: 'b' }),
    ins('grimoire_blocks', 'k', { page_id: 'p' }),
    upd('k', { content: 'hello' }),
    ins('grimoire_page_links', 'l', { source_page_id: 'x', target_page_id: 'p' }),
    ins('grimoire_pages', 'other', { section_id: 's' }),
  ];
  q = enqueue(q, deleteOp('grimoire_pages', 'p'));
  assert.deepEqual(
    q.map((o) => o.id),
    ['s', 'other'],
  );
  q = enqueue(q, deleteOp('grimoire_sections', 's'));
  assert.deepEqual(q, [ins('grimoire_pages', 'other', { section_id: null })]);
});

test('deleting a saved row drops its pending updates and queues the delete', () => {
  let q: Op[] = [upd('a', { content: 'x' }), upd('b', { content: 'y' })];
  q = enqueue(q, deleteOp('grimoire_blocks', 'a'));
  assert.deepEqual(q, [upd('b', { content: 'y' }), deleteOp('grimoire_blocks', 'a')]);
  // Later updates to a deleted row are ignored.
  assert.deepEqual(enqueue(q, upd('a', { content: 'z' })), q);
});

test('network trouble is retried; refusals are not', () => {
  assert.equal(isTransient({ status: 0, message: 'TypeError: Failed to fetch' }), true);
  assert.equal(isTransient({ status: 503 }), true);
  assert.equal(isTransient({ status: 401, code: 'PGRST301' }), true);
  assert.equal(isTransient({ status: 403, code: '42501', message: 'row-level security' }), false);
  assert.equal(isTransient({ status: 400, code: '22P02', message: 'invalid input' }), false);
  assert.equal(alreadyApplied(ins('grimoire_pages', 'p'), { status: 409, code: '23505' }), true);
  assert.equal(alreadyApplied(upd('p', {}), { status: 409, code: '23505' }), false);
});

test('ids are version 4 uuids', () => {
  const id = newId();
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(id, newId());
});
