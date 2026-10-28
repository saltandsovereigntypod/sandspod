// "Share…" on a page of your own Grimoire: suggest it to a coven's book, or
// make an offering of it to the Sanctuary (More → Community). An offering is
// plain words, so the page's elements are turned into text here, for the
// offering form to start from. Pure, so it can be tested.

import { plainText } from './richText.ts';
import type { BlockRow, PageRow } from './types.ts';

export type ShareChoice = { id: 'coven' | 'offering'; label: string; detail: string };

export const SHARE_CHOICES: ShareChoice[] = [
  { id: 'coven', label: 'Suggest to a coven', detail: 'A copy for a coven’s book, for those who approve its pages' },
  { id: 'offering', label: 'Make an offering', detail: 'Offer it to the Sanctuary’s Community Grimoire, to be reviewed' },
];

const LISTS = new Set(['bulleted_list', 'numbered_list', 'ingredient_list', 'checklist']);

/** One element as plain text, or '' for those with nothing to read (pictures, links, dividers). */
function blockText(block: BlockRow): string {
  const raw = block.rich_content?.html ?? block.content ?? '';
  if (!raw || raw.startsWith('data:')) return '';
  if (block.block_type === 'image' || block.block_type === 'page_link' || block.block_type === 'divider') return '';
  const text = plainText(raw).trim();
  if (!LISTS.has(block.block_type)) return text;
  const items = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return items.map((item, i) => (block.block_type === 'numbered_list' ? `${i + 1}. ${item}` : `• ${item}`)).join('\n');
}

/** The page as an offering's title and words: its elements in order, a blank line between. */
export function pageAsOffering(page: Pick<PageRow, 'id' | 'title'>, blocks: BlockRow[]): { title: string; body: string } {
  const body = blocks
    .filter((b) => b.page_id === page.id)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(blockText)
    .filter(Boolean)
    .join('\n\n');
  return { title: (page.title ?? '').trim(), body };
}
