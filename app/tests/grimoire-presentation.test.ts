import assert from 'node:assert/strict';
import { test } from 'node:test';

import { templateAppend } from '../src/lib/grimoire/edits.ts';
import {
  bookTitle,
  displayPageTitle,
  MUNDANE_MODE_KEY,
  mundaneFromStorage,
  mundaneWords,
  pageFace,
} from '../src/lib/grimoire/presentation.ts';
import type { BlockRow, GrimoireSnapshot, PageRow } from '../src/lib/grimoire/types.ts';
import { fonts } from '../src/theme.ts';

const ctx = { userId: 'u1', now: '2026-10-12T12:00:00.000Z' };

const page: PageRow = {
  id: 'p1',
  book_id: 'b1',
  section_id: null,
  title: 'Rosemary',
  page_type: 'blank',
  sort_order: 0,
  metadata: {},
  created_at: '2026-09-22',
  updated_at: null,
};

const block = (id: string, sort_order: number, page_id = 'p1'): BlockRow => ({
  id,
  page_id,
  block_type: 'text',
  content: 'Kept',
  rich_content: null,
  metadata: {},
  sort_order,
  created_at: null,
});

test('mundane mode: the device choice wins, else the settings default', () => {
  assert.equal(MUNDANE_MODE_KEY, 'saltAndSovereigntyMundaneMode');
  assert.equal(mundaneFromStorage(null, true), true);
  assert.equal(mundaneFromStorage(null, false), false);
  assert.equal(mundaneFromStorage('false', true), false);
  assert.equal(mundaneFromStorage('true', false), true);
  assert.equal(mundaneFromStorage('junk', true), true);
});

test('mundane mode: everyday wording, journal title and dated pages', () => {
  assert.equal(mundaneWords('Ritual journal'), 'Reflection journal');
  assert.equal(mundaneWords('Protection Spell for the ritual'), 'Protection Entry for the reflection');
  assert.equal(mundaneWords('Spellwork and rituals'), 'Spellwork and rituals', 'whole words only');
  assert.equal(bookTitle('Book of Shadows', true), 'Personal Journal');
  assert.equal(bookTitle('My Book', false), 'My Book');
  assert.equal(bookTitle(null, false), 'Grimoire');
  assert.equal(displayPageTitle(page, true), 'September 22, 2026');
  assert.equal(displayPageTitle({ ...page, created_at: null }, true), 'Journal Entry');
  assert.equal(displayPageTitle(page, false), 'Rosemary');
  assert.equal(displayPageTitle({ ...page, title: '' }, false), 'Untitled page');
});

test('page fonts map to the fonts the app loads', () => {
  assert.equal(pageFace('classic-serif').body, fonts.body);
  assert.equal(pageFace('classic-serif').scale, 1);
  assert.equal(pageFace('dark-academia').body, fonts.display);
  assert.equal(pageFace('handwritten').body, fonts.displayItalic);
  assert.equal(pageFace('soft-journal').body, fonts.body);
  assert.ok(pageFace('soft-journal').leading > 1);
  assert.deepEqual(pageFace(''), pageFace('classic-serif'));
  assert.deepEqual(pageFace(undefined), pageFace('classic-serif'));
  assert.deepEqual(pageFace('comic-sans'), pageFace('classic-serif'));
});

test('a template added to an existing page goes after what is there', () => {
  const snap: GrimoireSnapshot = {
    fetchedAt: '',
    books: [],
    sections: [],
    pages: [page],
    blocks: [block('a', 0), block('b', 4), block('other', 9, 'p2')],
    links: [],
  };
  let n = 0;
  const ops = templateAppend(snap, ctx, { page, templateKey: 'moon' }, () => `new${++n}`);
  assert.equal(ops.length, 6);
  assert.ok(ops.every((op) => op.kind === 'insert' && op.table === 'grimoire_blocks'), 'only inserts: nothing is deleted');
  assert.deepEqual(ops[0].row, {
    id: 'new1',
    user_id: 'u1',
    book_id: 'b1',
    page_id: 'p1',
    block_type: 'heading',
    content: 'Moon Phase',
    metadata: {},
    rich_content: null,
    sort_order: 5,
  });
  assert.deepEqual(
    ops.map((op) => op.row.sort_order),
    [5, 6, 7, 8, 9, 10],
  );
});

test('a Spell or Working page matches the website template, for logging a working without the ritual builder', async () => {
  const { PAGE_TEMPLATES } = await import('../src/lib/grimoire/elements.ts');
  const { readFileSync } = await import('node:fs');
  const spell = PAGE_TEMPLATES.find((template) => template.key === 'spell');
  assert.ok(spell);
  assert.equal(spell.label, 'Spell or Working');
  const headings = spell.blocks.filter((block) => block.type === 'heading').map((block) => block.content);
  assert.deepEqual(headings, ['Date', 'Intention', 'Timing', 'Ingredients and Tools', 'What I Did', 'Words Spoken', 'Results', 'Reflection']);
  const website = readFileSync(new URL('../../grimoire/js/config.js', import.meta.url), 'utf8');
  const block = website.slice(website.indexOf('  spell: {'), website.indexOf('  ritual: {'));
  for (const heading of headings) assert.ok(block.includes(`content: "${heading}"`), heading);
});
