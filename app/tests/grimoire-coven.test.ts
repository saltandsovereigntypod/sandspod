import assert from 'node:assert/strict';
import { test } from 'node:test';

import { accessSummary, allows, cleanAccess, ruleFor, ruleLabel, setRule, type GrimoireViewer } from '../src/lib/grimoire/access.ts';
import { covenOpPayload, covenParts, gatheringPage, pageChain, recordPageBlocks, studyLink, studyLinks, textBlocks, unsavedRecords, withoutStudyLinks } from '../src/lib/grimoire/coven.ts';
import { pageInsert } from '../src/lib/grimoire/edits.ts';
import { changesLine, historyRows, versionBlockRows, versionChanges, type PageVersion } from '../src/lib/grimoire/history.ts';
import { arrangeHome, emptyLayout } from '../src/lib/grimoire/layout.ts';
import { blockMarkup, canEditSubmission, decide, editedBlocks, shareCredit, submissionBlocks, submissionLine, submissionText, type SubmissionBlock } from '../src/lib/grimoire/submissions.ts';
import type { BlockRow, GrimoireSnapshot } from '../src/lib/grimoire/types.ts';
import { stepWords } from '../src/lib/covens/script.ts';
import { bookAnswerNote, bookNote } from '../../supabase/functions/coven-notify/requests.ts';

const viewer = (extra: Partial<GrimoireViewer> = {}): GrimoireViewer => ({ userId: 'u', member: true, rankId: 'initiate', head: false, site: false, writeBook: false, approveBook: false, goodStanding: true, ...extra });
const elders = [{ kind: 'rank' as const, id: 'elder' }];

test('with no rules the coven’s own powers decide: everyone opens, writers write, approvers approve', () => {
  assert.equal(allows(viewer(), [{}, {}, {}], 'view'), true);
  assert.equal(allows(viewer(), [], 'write'), false);
  assert.equal(allows(viewer({ writeBook: true }), [], 'write'), true);
  assert.equal(allows(viewer({ writeBook: true }), [], 'approve'), false);
  assert.equal(allows(viewer({ approveBook: true }), [], 'write'), true, 'approvers may edit too');
  assert.equal(allows(viewer({ member: false }), [], 'view'), false);
  assert.equal(allows(null, [], 'view'), false);
  assert.equal(allows(viewer({ writeBook: true, goodStanding: false }), [], 'write'), false, 'writing needs good standing');
});

test('a page follows its section and book, and may narrow or widen them', () => {
  const book = { view: [{ kind: 'coven', id: 'coven' }] };
  const section = { view: elders };
  assert.equal(allows(viewer(), [{}, section, book], 'view'), false, 'the section narrows the book');
  assert.equal(allows(viewer({ rankId: 'elder' }), [{}, section, book], 'view'), true);
  assert.equal(allows(viewer(), [{ view: [{ kind: 'user', id: 'u' }] }, section, book], 'view'), true, 'a page may name someone');
  assert.deepEqual(ruleFor([{}, section, book], 'view').from, 'section');
  assert.deepEqual(ruleFor([{}, {}, book], 'view').from, 'book');
  assert.deepEqual(ruleFor([{}, {}, {}], 'view').from, 'coven');
  // No one writes or approves what they can't open.
  const hidden = { view: elders, write: [{ kind: 'user', id: 'u' }], approve: [{ kind: 'user', id: 'u' }] };
  assert.equal(allows(viewer(), [hidden], 'write'), false);
  assert.equal(allows(viewer(), [hidden], 'approve'), false);
  assert.equal(allows(viewer(), [{ write: [{ kind: 'user', id: 'u' }] }], 'write'), true);
  // An empty list is the coven's head only; the head and moderators always can.
  assert.equal(allows(viewer({ rankId: 'elder' }), [{ view: [] }], 'view'), false);
  assert.equal(allows(viewer({ head: true }), [{ view: [] }], 'approve'), true);
  assert.equal(allows(viewer({ site: true, member: false }), [{ view: [] }], 'approve'), true);
});

test('access values are cleaned and described', () => {
  assert.deepEqual(cleanAccess({ view: [{ kind: 'rank', id: 'r' }, { kind: 'rank', id: 'r' }, { kind: 'bogus' }], write: 'no', extra: [] }), { view: [{ kind: 'rank', id: 'r' }] });
  assert.deepEqual(cleanAccess(null), {});
  assert.deepEqual(setRule({ view: elders }, 'view', null), {});
  assert.deepEqual(setRule({}, 'approve', []), { approve: [] });
  const ranks = [{ id: 'elder', name: 'Elder' }];
  const nameOf = (id: string) => (id === 'u' ? 'Rowan' : 'Someone');
  assert.equal(ruleLabel(null, 'view', ranks, nameOf), 'The whole coven');
  assert.equal(ruleLabel([], 'write', ranks, nameOf), 'Only the coven’s head');
  assert.equal(ruleLabel([...elders, { kind: 'user', id: 'u' }], 'view', ranks, nameOf), 'Every Elder and Rowan');
  assert.equal(accessSummary([{}, { view: elders }], ranks, nameOf), 'Open to every Elder');
});

test('coven operations travel by their personal table names, and the home puts the coven’s shelves first', () => {
  const snap: GrimoireSnapshot = { fetchedAt: '', books: [{ id: 'bk', title: 'Book', created_at: null, updated_at: null }], sections: [], pages: [], blocks: [], links: [] };
  const [op] = pageInsert(snap, { userId: 'u', now: 'n' }, { id: 'p', bookId: 'bk', sectionId: null, title: 'Our prayer', templateKey: 'blank' }, () => 'b1');
  assert.deepEqual(covenOpPayload(op), { kind: 'insert', table: 'grimoire_pages', id: 'p', row: op.kind === 'insert' ? op.row : {} });
  assert.deepEqual(covenOpPayload({ kind: 'delete', table: 'grimoire_blocks', id: 'x' }), { kind: 'delete', table: 'grimoire_blocks', id: 'x' });
  const sec = (id: string, shelf: string | null, sort_order: number) => ({ id, book_id: 'bk', title: id, sort_order, created_at: null, shelf: shelf as never });
  const parts = covenParts({ sections: [sec('lore', null, 0), sec('study', 'study', 3), sec('rites', 'rites', 0), sec('minutes', 'minutes', 2), sec('records', 'records', 1)], loose: true });
  assert.deepEqual(arrangeHome(emptyLayout(), parts).map((p) => p.key), ['section:rites', 'section:records', 'section:minutes', 'section:study', 'section:lore', 'pages']);
  const page = { id: 'p', book_id: 'bk', section_id: 'rites', title: 'x', page_type: null, sort_order: 0, metadata: {}, created_at: null, updated_at: null, access: { view: elders } };
  const withAccess = { ...snap, sections: [{ ...sec('rites', 'rites', 0), access: { write: [] } }], books: [{ ...snap.books[0], access: { approve: [] } }] } as unknown as GrimoireSnapshot;
  assert.deepEqual(pageChain(withAccess, page), [{ view: elders }, { write: [] }, { approve: [] }]);
});

const block = (id: string, block_type: string, content: string, extra: Partial<BlockRow> = {}): BlockRow => ({ id, page_id: 'p', block_type, content, rich_content: null, metadata: {}, sort_order: 0, created_at: null, ...extra });

test('a personal page is suggested as a copy of its blocks; its own page links become words', () => {
  const blocks = [
    block('3', 'page_link', '', { sort_order: 3, metadata: { target_page_id: 'mine', label: 'Moon water' } }),
    block('1', 'heading', 'Ingredients', { sort_order: 1 }),
    block('2', 'text', '', { sort_order: 2 }),
    block('0', 'text', '<b>Rosemary</b>', { sort_order: 0, rich_content: { html: '<b>Rosemary</b>' } }),
    block('4', 'divider', '', { sort_order: 4 }),
  ];
  const out = submissionBlocks(blocks);
  assert.deepEqual(out.map((b) => b.block_type), ['text', 'heading', 'text', 'divider']);
  assert.equal(out[2].content, 'See also: Moon water');
  assert.equal(submissionText(out), 'Rosemary\n\nIngredients\n\nSee also: Moon water\n\n✦');
  // The approver may edit words first; an emptied block is dropped.
  assert.equal(blockMarkup(out[0]), '**Rosemary**');
  const edited = editedBlocks(out, { 0: '*Rue*', 1: '' });
  assert.deepEqual(edited.map((b) => b.content), ['<i>Rue</i>', 'See also: Moon water', '']);
});

test('a suggestion is approved, sent back or declined only while waiting, and credits whoever shared it', () => {
  assert.equal(decide('pending', 'approve'), 'approved');
  assert.equal(decide('pending', 'return'), 'returned');
  assert.equal(decide('pending', 'decline'), 'declined');
  assert.equal(decide('approved', 'decline'), null);
  assert.equal(canEditSubmission({ status: 'returned', submitted_by: 'u' }, 'u'), true);
  assert.equal(canEditSubmission({ status: 'pending', submitted_by: 'u' }, 'u'), false);
  assert.equal(canEditSubmission({ status: 'draft', submitted_by: 'u' }, 'v'), false);
  const nameOf = (id: string) => ({ u: 'Rowan' })[id as 'u'] ?? 'Someone';
  assert.equal(shareCredit({ shared_by: 'u' }, nameOf), 'Shared by Rowan');
  assert.equal(shareCredit({ metadata: { sharedBy: 'u' } }, nameOf), 'Shared by Rowan');
  assert.equal(shareCredit({ metadata: {} }, nameOf), null);
  assert.equal(submissionLine({ page_id: null, source_page_id: 'x', status: 'pending', submitted_by: 'u' }, nameOf, 'Rites'), 'From their own grimoire · by Rowan · for Rites · Waiting for approval');
});

const version = (id: string, saved_at: string, blocks: SubmissionBlock[], extra: Partial<PageVersion> = {}): PageVersion => ({ id, page_id: 'p', title: 'Prayer', page_type: null, blocks, saved_by: 'u', saved_at, restored_from: null, ...extra });
const sb = (content: string, block_type = 'text'): SubmissionBlock => ({ block_type, content, rich_content: null, metadata: {} });

test('page history says what each save changed and can show any version', () => {
  const v1 = version('1', '2026-10-01', [sb('Hail'), sb('Moon')]);
  const v2 = version('2', '2026-10-02', [sb('Hail'), sb('Full moon'), sb('So be it')], { title: 'Our prayer' });
  const v3 = version('3', '2026-10-03', [sb('Hail')], { restored_from: '1' });
  assert.deepEqual(versionChanges(v1, v2), { added: 1, removed: 0, changed: 1, retitled: true });
  assert.equal(changesLine(v1, v2), 'Title changed, 1 changed, 1 added');
  assert.equal(changesLine(null, v1), 'First version');
  assert.equal(changesLine(v2, v3), 'Restored an earlier version');
  assert.equal(changesLine(v1, version('4', '2026-10-04', [sb('Hail'), sb('Moon')])), 'Moved or tidied');
  assert.deepEqual(historyRows([v2, v3, v1]).map((r) => r.version.id), ['3', '2', '1']);
  const rows = versionBlockRows(v2);
  assert.deepEqual(rows.map((r) => [r.id, r.sort_order, r.content]), [['p:v0', 0, 'Hail'], ['p:v1', 1, 'Full moon'], ['p:v2', 2, 'So be it']]);
});

test('what the builder saves becomes page blocks on the right shelf, once per gathering', () => {
  const blocks = textBlocks('Full moon\n\nOPENING\n1. Cast the circle  (Everyone)\n   High Priestess:\n      Hail <moon>\n\nAFTERWARDS\n  Ground');
  assert.deepEqual(blocks.map((b) => b.block_type), ['text', 'heading', 'text', 'heading', 'text']);
  assert.equal(blocks[1].content, 'Opening');
  assert.match(blocks[2].content, /Hail &lt;moon&gt;/);
  assert.match(blocks[2].content, /<br>/);
  const rec = recordPageBlocks([{ type: 'heading', content: 'When' }, { type: 'text', content: 'Monday' }, { type: 'numbered_list', content: 'a\nb' }, { type: 'text', content: '' }]);
  assert.deepEqual(rec.map((b) => [b.block_type, b.content]), [['heading', 'When'], ['text', 'Monday'], ['numbered_list', 'a\nb']]);
  const pages = [{ metadata: { covenRitual: 'r1', gathering: 'record' } }, { metadata: { covenRitual: 'r2', gathering: 'minutes' } }];
  assert.equal(gatheringPage(pages, 'r1', 'record'), pages[0]);
  assert.equal(gatheringPage(pages, 'r1', 'rite'), null);
  const records = [{ ritual_id: 'r1', kind: 'rite' }, { ritual_id: 'r3', kind: 'rite' }, { ritual_id: 'r2', kind: 'meeting' }, { ritual_id: 'r4', kind: 'meeting' }];
  assert.deepEqual(unsavedRecords(records, pages, 'rite').map((r) => r.ritual_id), ['r3']);
  assert.deepEqual(unsavedRecords(records, pages, 'meeting').map((r) => r.ritual_id), ['r4']);
});

test('programs link to Study material in a task’s resources', () => {
  const id = '0f8fad5b-d9cb-469f-a165-70867728950e';
  const link = studyLink({ id, title: 'The [tools] | of the craft' });
  assert.equal(link, `[[book:${id}|The tools of the craft]]`);
  const text = `Read this first.\n${link}\n${link}`;
  assert.deepEqual(studyLinks(text), [{ id, title: 'The tools of the craft' }]);
  assert.equal(withoutStudyLinks(text), 'Read this first.');
  assert.deepEqual(studyLinks(null), []);
});

test('words linked from a page someone can’t open never show', () => {
  const step = { spoken_text: 'own words', details: { book_page_id: 'p1' } };
  assert.deepEqual(stepWords(step, [{ id: 'p1', title: '', body: '', hidden: true }]), { words: '', fromBook: 'A page you can’t open' });
  assert.deepEqual(stepWords(step, []), { words: 'own words' });
});

test('a suggestion rings those who approve it, and its answer the sharer', () => {
  assert.deepEqual(bookNote({ covenName: 'Moon Circle', covenSlug: 'moon', who: 'Rowan', title: 'Moon water', changes: false, shared: true }), {
    title: 'The Book · Moon Circle',
    body: 'Rowan suggested “Moon water” from their own grimoire',
    url: '/coven/c/moon/book/review',
  });
  assert.match(bookNote({ covenName: 'M', covenSlug: 'm', who: 'R', title: 'Prayer', changes: true, shared: false }).body, /changes to “Prayer”/);
  assert.equal(bookAnswerNote({ covenName: 'M', covenSlug: 'm', title: 'Prayer', status: 'approved', pageId: 'p1' }).url, '/coven/c/m/book/p1');
  assert.equal(bookAnswerNote({ covenName: 'M', covenSlug: 'm', title: 'Prayer', status: 'returned', note: 'Shorter, please' }).body, '“Prayer” was sent back to you to change. “Shorter, please”');
});
