// A coven's Book of Shadows, built on the same model as a personal grimoire:
// a book, sections, pages, blocks and page links, in coven_grimoire_* tables
// with the same columns (plus the coven and who may do what). The app's
// grimoire store and editor work on it unchanged: the same operations are
// sent through one checked function (apply_coven_grimoire_op) instead of
// straight to the tables. Here: that mapping, the coven's own shelves
// (Rites, Ritual records, Meeting minutes, Study material), the home's
// parts, what the ritual builder saves, and links to Study material from
// coven programs. Pure, shared with the website (js/core/grimoire.js).

import type { Access, GrimoireViewer } from './access.ts';
import { sectionKey, type HomePart } from './layout.ts';
import type { Op, Table } from './edits.ts';
import type { GrimoireSnapshot, PageRow, SectionRow } from './types.ts';

export const COVEN_TABLES: Record<Table, string> = {
  grimoire_books: 'coven_grimoire_books',
  grimoire_sections: 'coven_grimoire_sections',
  grimoire_pages: 'coven_grimoire_pages',
  grimoire_blocks: 'coven_grimoire_blocks',
  grimoire_page_links: 'coven_grimoire_page_links',
};

/** An operation as apply_coven_grimoire_op takes it (the table by its personal name; the database maps it). */
export function covenOpPayload(op: Op): Record<string, unknown> {
  if (op.kind === 'insert') return { kind: op.kind, table: op.table, id: op.id, row: op.row };
  if (op.kind === 'update') return { kind: op.kind, table: op.table, id: op.id, patch: op.patch };
  return { kind: op.kind, table: op.table, id: op.id };
}

// ---------------------------------------------------------------------------
// The coven's own shelves

export type CovenShelf = 'rites' | 'records' | 'minutes' | 'study';

export const COVEN_SHELVES: { shelf: CovenShelf; title: string; note: string }[] = [
  { shelf: 'rites', title: 'Rites', note: 'Rites and their words, saved from the ritual builder or written here.' },
  { shelf: 'records', title: 'Ritual records', note: 'What each rite left behind: who was there, the steps, the leader’s notes.' },
  { shelf: 'minutes', title: 'Meeting minutes', note: 'Agendas and minutes of the coven’s meetings.' },
  { shelf: 'study', title: 'Study material', note: 'Lessons and reading, which the coven’s programs can link to.' },
];

/** Coven sections carry which shelf they are, if any. */
export type CovenSectionRow = SectionRow & { shelf?: CovenShelf | null; access?: unknown };
export type CovenPageRow = PageRow & { access?: unknown; shared_by?: string | null; updated_by?: string | null; user_id?: string | null };
export type CovenBookRow = GrimoireSnapshot['books'][number] & { access?: unknown; layout?: unknown; coven_id?: string };

export const shelfOf = (section: SectionRow | null | undefined): CovenShelf | null => ((section as CovenSectionRow | null)?.shelf ?? null) || null;

/**
 * A coven book's home, in its default order: the coven's own shelves first
 * (Rites, Ritual records, Meeting minutes, Study material), then the coven's
 * other sections in their order, then pages in no section.
 */
export function covenParts(input: { sections: CovenSectionRow[]; loose: boolean }): HomePart[] {
  const order = (s: CovenSectionRow) => {
    const at = COVEN_SHELVES.findIndex((x) => x.shelf === s.shelf);
    return at >= 0 ? at : COVEN_SHELVES.length;
  };
  const sorted = [...input.sections].sort((a, b) => order(a) - order(b) || (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.created_at ?? '').localeCompare(b.created_at ?? ''));
  const parts: HomePart[] = sorted.map((s) => ({ key: sectionKey(s.id), title: s.title }));
  if (input.loose) parts.push({ key: 'pages', title: 'Other pages' });
  return parts;
}

/** The rules from a page up to its book, nearest first, for access.ts. */
export function pageChain(snapshot: GrimoireSnapshot | null, page: PageRow | null): unknown[] {
  if (!snapshot || !page) return [];
  const section = page.section_id ? (snapshot.sections.find((s) => s.id === page.section_id) as CovenSectionRow | undefined) : undefined;
  const book = snapshot.books.find((b) => b.id === page.book_id) as CovenBookRow | undefined;
  return [(page as CovenPageRow).access, section?.access, book?.access];
}

export function sectionChain(snapshot: GrimoireSnapshot | null, section: SectionRow | null): unknown[] {
  if (!snapshot || !section) return [];
  const book = snapshot.books.find((b) => b.id === section.book_id) as CovenBookRow | undefined;
  return [(section as CovenSectionRow).access, book?.access];
}

export function bookChain(snapshot: GrimoireSnapshot | null): unknown[] {
  return [(snapshot?.books[0] as CovenBookRow | undefined)?.access];
}

/** The viewer as access.ts sees them, from the coven's own permissions. */
export function covenViewer(input: {
  userId: string | null;
  perms: { member: boolean; founder: boolean; site: boolean; writeBook: boolean; approveBook: boolean; rank: { id: string } | null };
  standingOk: boolean;
}): GrimoireViewer {
  return {
    userId: input.userId,
    member: input.perms.member,
    rankId: input.perms.rank?.id ?? null,
    head: input.perms.founder,
    site: input.perms.site,
    writeBook: input.perms.writeBook,
    approveBook: input.perms.approveBook,
    goodStanding: input.standingOk,
  };
}

export type { Access };

// ---------------------------------------------------------------------------
// What the ritual builder saves into the Book

export type Gathering = 'rite' | 'agenda' | 'record' | 'minutes';

/** Which shelf each thing the builder saves goes on. */
export const GATHERING_SHELF: Record<Gathering, CovenShelf> = { rite: 'rites', agenda: 'minutes', record: 'records', minutes: 'minutes' };

/** A page the builder saved for this ritual, if there is one (so saving again updates it). */
export function gatheringPage<T extends { metadata?: Record<string, unknown> | null }>(pages: T[], ritualId: string, what: Gathering): T | null {
  return pages.find((p) => p.metadata?.covenRitual === ritualId && p.metadata?.gathering === what) ?? null;
}

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Plain text (a rite's script, written out) as page blocks: a line in
 * capitals on its own is a heading (the script's sections), the rest are
 * paragraphs, each keeping its line breaks.
 */
export function textBlocks(text: string): { block_type: string; content: string; rich_content: { html: string } | null; metadata: Record<string, unknown> }[] {
  const out: { block_type: string; content: string; rich_content: { html: string } | null; metadata: Record<string, unknown> }[] = [];
  for (const raw of String(text ?? '').replace(/\r\n/g, '\n').split(/\n[ \t]*\n/)) {
    const para = raw.replace(/^\n+|\n+$/g, '');
    if (!para.trim()) continue;
    const lines = para.split('\n');
    const first = lines[0].trim();
    if (first.length > 1 && first.length <= 80 && first === first.toUpperCase() && /[A-Z]/.test(first)) {
      const heading = first.charAt(0) + first.slice(1).toLowerCase();
      out.push({ block_type: 'heading', content: heading, rich_content: { html: escapeHtml(heading) }, metadata: {} });
      lines.shift();
      if (!lines.join('').trim()) continue;
    }
    const html = lines.map((l) => escapeHtml(l)).join('<br>');
    out.push({ block_type: 'text', content: html, rich_content: { html }, metadata: {} });
  }
  return out;
}

/** The record's own blocks (script.ts recordBlocks: { type, content }) as page blocks. */
export function recordPageBlocks(blocks: { type: string; content: string }[]) {
  return blocks
    .filter((b) => b.content.trim() || b.type === 'heading')
    .map((b) => {
      const rich = b.type === 'text' || b.type === 'heading';
      const html = escapeHtml(b.content).replace(/\n/g, '<br>');
      return { block_type: b.type, content: rich ? html : b.content, rich_content: rich ? { html } : null, metadata: {} as Record<string, unknown> };
    });
}

/** Gatherings the database recorded that have no page in the Book yet (shown on their shelf all the same). */
export function unsavedRecords<R extends { ritual_id: string; kind: string }>(records: R[], pages: { metadata?: Record<string, unknown> | null }[], kind: 'rite' | 'meeting'): R[] {
  const what: Gathering = kind === 'meeting' ? 'minutes' : 'record';
  return records.filter((r) => (r.kind === 'meeting' ? 'meeting' : 'rite') === kind && !gatheringPage(pages, r.ritual_id, what));
}

// ---------------------------------------------------------------------------
// Study material, linked from coven programs

/** A link to a page of the coven's Book, as a program task's resources keep it: [[book:<id>|Title]]. */
export function studyLink(page: { id: string; title: string }): string {
  return `[[book:${page.id}|${page.title.replace(/[[\]|]/g, ' ').replace(/\s+/g, ' ').trim() || 'A page'}]]`;
}

const LINK = /\[\[book:([0-9a-f-]{36})\|([^\]|]*)\]\]/gi;

/** The Book pages a program task's resources link to. */
export function studyLinks(text: string | null | undefined): { id: string; title: string }[] {
  const out: { id: string; title: string }[] = [];
  for (const m of String(text ?? '').matchAll(LINK)) if (!out.some((x) => x.id === m[1])) out.push({ id: m[1].toLowerCase(), title: m[2].trim() || 'A page' });
  return out;
}

/** The resources text without the link markers (the links show as buttons). */
export function withoutStudyLinks(text: string | null | undefined): string {
  return String(text ?? '').replace(LINK, '').replace(/\n{3,}/g, '\n\n').trim();
}
