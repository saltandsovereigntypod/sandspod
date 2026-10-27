// Pages suggested for a coven's Book: a copy of a page from someone's own
// grimoire ("Suggest to a coven"), a new page, or changes to a page of the
// book, sent to those who approve that part of the book. They approve it
// (editing it first if they like), send it back with a note, or decline it.
// An approved page credits whoever shared it; their own page is never
// touched. The database keeps the rules (submit_coven_grimoire_page,
// review_coven_grimoire_submission); this is what the screens show and send.
// Pure, shared with the website (js/core/grimoire.js).

import { editorKind } from './elements.ts';
import { htmlToMarkup, markupToHtml } from './markup.ts';
import { plainText } from './richText.ts';
import { blockMetadata, blockSource } from './structure.ts';
import type { BlockRow } from './types.ts';

export type SubmissionStatus = 'draft' | 'pending' | 'returned' | 'declined' | 'approved';
export type ReviewDecision = 'approve' | 'return' | 'decline';

/** One element of a page as it travels: the block without its ids. */
export type SubmissionBlock = {
  block_type: string;
  content: string;
  rich_content: { html?: string } | null;
  metadata: Record<string, unknown>;
};

export type Submission = {
  id: string;
  coven_id: string;
  book_id: string;
  section_id: string | null;
  page_id: string | null;
  source_page_id: string | null;
  title: string;
  page_type: string | null;
  blocks: SubmissionBlock[];
  note: string | null;
  status: SubmissionStatus;
  submitted_by: string;
  reviewer_id: string | null;
  reviewer_note: string | null;
  published_page_id: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  draft: 'Not sent yet',
  pending: 'Waiting for approval',
  returned: 'Sent back to you',
  declined: 'Not taken into the Book',
  approved: 'In the Book',
};

export const MAX_BLOCKS = 200;

/**
 * A page's blocks as a suggestion carries them, in order. Links to pages of
 * your own grimoire can't travel, so a page link becomes a line naming the
 * page; empty paragraphs are left behind.
 */
export function submissionBlocks(blocks: BlockRow[]): SubmissionBlock[] {
  const out: SubmissionBlock[] = [];
  const sorted = [...blocks].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.created_at ?? '').localeCompare(b.created_at ?? ''));
  for (const block of sorted) {
    const meta = blockMetadata(block);
    if (block.block_type === 'page_link') {
      const label = typeof meta.label === 'string' && meta.label.trim() ? meta.label.trim() : '';
      if (label) out.push({ block_type: 'text', content: `See also: ${escapeHtml(label)}`, rich_content: { html: `See also: ${escapeHtml(label)}` }, metadata: {} });
      continue;
    }
    const source = blockSource(block);
    if (block.block_type !== 'divider' && block.block_type !== 'image' && !plainText(source).trim()) continue;
    out.push({
      block_type: String(block.block_type),
      content: block.content ?? '',
      rich_content: block.rich_content?.html ? { html: block.rich_content.html } : null,
      metadata: meta,
    });
  }
  return out.slice(0, MAX_BLOCKS);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Whether this person may change and send their suggestion again. */
export function canEditSubmission(s: Pick<Submission, 'status' | 'submitted_by'>, userId: string | null): boolean {
  return !!userId && s.submitted_by === userId && (s.status === 'draft' || s.status === 'returned');
}

/** Whether it's waiting for someone who approves. */
export const isWaiting = (s: Pick<Submission, 'status'>) => s.status === 'pending';

/** What a decision makes of a suggestion, or null when it can't be decided (it isn't waiting). */
export function decide(status: SubmissionStatus, decision: ReviewDecision): SubmissionStatus | null {
  if (status !== 'pending') return null;
  return decision === 'approve' ? 'approved' : decision === 'return' ? 'returned' : 'declined';
}

/** A reviewer's words for each decision, for buttons. */
export const DECISION_LABEL: Record<ReviewDecision, string> = { approve: 'Approve', return: 'Send back with a note', decline: 'Decline' };

/** Whether a block's words can be edited by the approver as text (paragraphs, headings, lists). */
export function editableBlock(block: Pick<SubmissionBlock, 'block_type'>): boolean {
  const kind = editorKind(block.block_type);
  return kind === 'rich' || kind === 'plain';
}

/** A block's words as the editor shows them (light markup for rich blocks). */
export function blockMarkup(block: SubmissionBlock): string {
  return editorKind(block.block_type) === 'rich' ? htmlToMarkup(block.rich_content?.html || block.content) : block.content;
}

/** Applies an approver's edits (by block index, as markup) before approving; empty edits remove the block. */
export function editedBlocks(blocks: SubmissionBlock[], edits: Record<number, string>): SubmissionBlock[] {
  const out: SubmissionBlock[] = [];
  blocks.forEach((block, index) => {
    if (!(index in edits) || !editableBlock(block)) return void out.push(block);
    const text = edits[index];
    if (!text.trim()) return;
    if (editorKind(block.block_type) === 'rich') {
      const html = markupToHtml(text);
      out.push({ ...block, content: html, rich_content: { html } });
    } else out.push({ ...block, content: text, rich_content: null });
  });
  return out;
}

/** "Shared by Rowan": the credit an approved page carries. */
export function shareCredit(page: { shared_by?: string | null; metadata?: Record<string, unknown> | null } | null, nameOf: (id: string) => string): string | null {
  const id = page?.shared_by || (typeof page?.metadata?.sharedBy === 'string' ? (page.metadata.sharedBy as string) : null);
  return id ? `Shared by ${nameOf(id)}` : null;
}

/** A line for a suggestion in a list: what it is, from whom, and where it stands. */
export function submissionLine(s: Pick<Submission, 'page_id' | 'source_page_id' | 'status' | 'submitted_by'>, nameOf: (id: string) => string, sectionTitle?: string | null): string {
  const what = s.page_id ? 'Changes to a page' : s.source_page_id ? 'From their own grimoire' : 'A new page';
  return [what, `by ${nameOf(s.submitted_by)}`, sectionTitle ? `for ${sectionTitle}` : null, STATUS_LABEL[s.status]].filter(Boolean).join(' · ');
}

/** Plain text of a suggestion's blocks, for a quick look. */
export function submissionText(blocks: SubmissionBlock[]): string {
  return blocks
    .map((b) => (b.block_type === 'divider' ? '✦' : plainText(b.rich_content?.html || b.content)))
    .filter((t) => t.trim())
    .join('\n\n');
}
