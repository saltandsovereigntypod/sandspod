import type { BlockRow, GrimoireSnapshot, PageRow, SectionRow } from './types.ts';

// Same ordering the website uses: sort_order, then oldest first.
function byOrder<T extends { sort_order: number | null; created_at: string | null }>(a: T, b: T): number {
  const order = (a.sort_order ?? 0) - (b.sort_order ?? 0);
  if (order !== 0) return order;
  return (a.created_at ?? '').localeCompare(b.created_at ?? '');
}

export type SectionGroup = { section: SectionRow | null; pages: PageRow[] };

/** A book's pages grouped by section, in reading order. Unsectioned pages come first. */
export function tableOfContents(snapshot: GrimoireSnapshot, bookId: string): SectionGroup[] {
  const sections = snapshot.sections.filter((s) => s.book_id === bookId).sort(byOrder);
  const pages = snapshot.pages.filter((p) => p.book_id === bookId).sort(byOrder);
  const known = new Set(sections.map((s) => s.id));

  const groups: SectionGroup[] = [];
  const loose = pages.filter((p) => !p.section_id || !known.has(p.section_id));
  if (loose.length) groups.push({ section: null, pages: loose });
  for (const section of sections) {
    groups.push({ section, pages: pages.filter((p) => p.section_id === section.id) });
  }
  return groups;
}

export function pageBlocks(snapshot: GrimoireSnapshot, pageId: string): BlockRow[] {
  return snapshot.blocks.filter((b) => b.page_id === pageId).sort(byOrder);
}

export function blockMetadata(block: BlockRow): Record<string, unknown> {
  const raw = block.metadata;
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return raw;
}

/** The text a block shows: rich HTML when present, else plain content (as the website does). */
export function blockSource(block: BlockRow): string {
  return block.rich_content?.html || block.content || '';
}

const PAGE_TYPE_LABELS: Record<string, string> = {
  ritual_journal: 'Ritual journal',
  ritual: 'Ritual',
  apothecary: 'Apothecary',
};

export function pageTypeLabel(page: PageRow): string {
  return PAGE_TYPE_LABELS[page.page_type ?? ''] ?? 'Page';
}

export type PageFacts = {
  date: string | null;
  moonPhase: string | null;
  minutes: number | null;
  altarItems: string[];
};

/** Details the altar writes onto ritual journal pages. */
export function pageFacts(page: PageRow): PageFacts {
  const meta = page.metadata ?? {};
  const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);
  const seconds = typeof meta.durationSeconds === 'number' ? meta.durationSeconds : null;
  const items = Array.isArray(meta.altarItems) ? meta.altarItems : [];
  const labels = items
    .map((item) => (item && typeof item === 'object' ? text((item as { label?: unknown }).label) : null))
    .filter((label): label is string => !!label);

  return {
    date: text(meta.ritualDate) ?? page.created_at,
    moonPhase: text(meta.moonPhase),
    minutes: seconds && seconds >= 60 ? Math.round(seconds / 60) : null,
    altarItems: [...new Set(labels)],
  };
}
