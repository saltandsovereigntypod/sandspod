// A coven page's history: the database keeps a version each time someone
// saves the page (a sitting of edits by one person counts as one save), with
// who and when, and those who can write in the page can look back at any
// version and restore it (coven_grimoire_versions,
// restore_coven_grimoire_version). This says what changed between versions
// and turns a version back into blocks to show. Pure, shared with the website.

import type { SubmissionBlock } from './submissions.ts';
import { plainText } from './richText.ts';
import type { BlockRow } from './types.ts';

export type PageVersion = {
  id: string;
  page_id: string;
  title: string;
  page_type: string | null;
  blocks: SubmissionBlock[];
  saved_by: string | null;
  saved_at: string;
  restored_from: string | null;
};

const blockText = (b: SubmissionBlock) => `${b.block_type}|${plainText(b.rich_content?.html || b.content)}|${JSON.stringify(b.metadata ?? {})}`;

/** What changed from one version to the next: blocks added, removed and changed, and whether the title did. */
export function versionChanges(before: PageVersion | null, after: PageVersion): { added: number; removed: number; changed: number; retitled: boolean } {
  if (!before) return { added: after.blocks.length, removed: 0, changed: 0, retitled: false };
  const a = before.blocks.map(blockText);
  const b = after.blocks.map(blockText);
  // Line up what stayed the same (longest common run), then count the rest.
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const same = dp[0][0];
  const gone = a.length - same;
  const fresh = b.length - same;
  const changed = Math.min(gone, fresh);
  return { added: fresh - changed, removed: gone - changed, changed, retitled: before.title !== after.title };
}

/** "3 changes", "Title changed and 1 added", "Restored an earlier version", "First version". */
export function changesLine(before: PageVersion | null, after: PageVersion): string {
  if (after.restored_from) return 'Restored an earlier version';
  if (!before) return 'First version';
  const c = versionChanges(before, after);
  const parts: string[] = [];
  if (c.retitled) parts.push('title changed');
  if (c.changed) parts.push(`${c.changed} changed`);
  if (c.added) parts.push(`${c.added} added`);
  if (c.removed) parts.push(`${c.removed} removed`);
  if (!parts.length) return 'Moved or tidied';
  const line = parts.join(', ');
  return line.charAt(0).toUpperCase() + line.slice(1);
}

/** Newest first, each with the line saying what it changed from the one before. */
export function historyRows(versions: PageVersion[]): { version: PageVersion; line: string }[] {
  const oldest = [...versions].sort((a, b) => a.saved_at.localeCompare(b.saved_at));
  return oldest.map((v, i) => ({ version: v, line: changesLine(i ? oldest[i - 1] : null, v) })).reverse();
}

/** A version's blocks as rows the page view can show. */
export function versionBlockRows(version: Pick<PageVersion, 'page_id' | 'blocks'>): BlockRow[] {
  return version.blocks.map((b, i) => ({
    id: `${version.page_id}:v${i}`,
    page_id: version.page_id,
    block_type: b.block_type,
    content: b.content,
    rich_content: b.rich_content,
    metadata: b.metadata,
    sort_order: i,
    created_at: null,
  }));
}
