import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pageAsOffering, SHARE_CHOICES } from '../src/lib/grimoire/share.ts';
import type { BlockRow } from '../src/lib/grimoire/types.ts';

const block = (sort_order: number, block_type: string, html: string, page_id = 'p1'): BlockRow => ({
  id: `b${sort_order}`,
  page_id,
  block_type,
  content: null,
  rich_content: { html },
  metadata: null,
  sort_order,
  created_at: null,
});

test('Share… offers a coven and an offering, in that order', () => {
  assert.deepEqual(SHARE_CHOICES.map((c) => c.label), ['Suggest to a coven', 'Make an offering']);
  for (const c of SHARE_CHOICES) assert.doesNotMatch(c.label + c.detail, /!/);
});

test('a page becomes an offering: its title, and its words in order', () => {
  const blocks = [
    block(2, 'bulleted_list', 'Rosemary<br>Salt'),
    block(1, 'text', '<p>Steep <b>rosemary</b> &amp; salt.</p>'),
    block(3, 'divider', '<hr>'),
    block(4, 'image', 'data:image/png;base64,AAAA'),
    block(5, 'numbered_list', 'Sweep<br>Wash the step'),
    block(6, 'text', '<p>Not this page</p>', 'p2'),
  ];
  const offering = pageAsOffering({ id: 'p1', title: '  Door wash ' }, blocks);
  assert.equal(offering.title, 'Door wash');
  assert.equal(offering.body, 'Steep rosemary & salt.\n\n• Rosemary\n• Salt\n\n1. Sweep\n2. Wash the step');
});

test('an empty page offers just its title', () => {
  assert.deepEqual(pageAsOffering({ id: 'p1', title: null as unknown as string }, []), { title: '', body: '' });
});
