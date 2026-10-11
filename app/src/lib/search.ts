// One search across someone's whole practice: the Living Library, their
// grimoire pages, their ritual journal and their ritual templates. Pure, so
// what it finds can be tested.

import type { BlockRow, PageRow } from './grimoire/types.ts';
import { searchLibrary } from './library/model.ts';
import type { LibraryEntry } from './library/types.ts';
import type { JournalRow, TemplateRow } from './rituals/types.ts';

export type SearchKind = 'library' | 'page' | 'journal' | 'template';

export type SearchHit = { kind: SearchKind; id: string; title: string; detail: string };

export type SearchSources = {
  library: LibraryEntry[];
  pages: PageRow[];
  blocks: BlockRow[];
  journal: JournalRow[];
  templates: TemplateRow[];
};

/** Rich text as plain words (the grimoire stores some blocks as HTML). */
function plain(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A few words either side of the first match: "…burned rosemary for the door…". */
export function snippet(text: string, needle: string, radius = 48): string {
  const at = text.toLowerCase().indexOf(needle);
  if (at < 0) return '';
  const start = Math.max(0, at - radius);
  const end = Math.min(text.length, at + needle.length + radius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}

function firstMatch(fields: unknown[], needle: string): string | null {
  for (const field of fields) {
    const text = plain(field);
    if (text.toLowerCase().includes(needle)) return snippet(text, needle);
  }
  return null;
}

const JOURNAL_FIELDS: (keyof JournalRow)[] = [
  'intention',
  'what_happened_during',
  'feelings_before',
  'feelings_during',
  'signs_and_symbols',
  'what_happened_after',
  'feelings_after',
  'dreams_and_follow_up',
  'results',
  'changes_for_next_time',
  'notes',
];

/** Everything matching `query`, grouped by where it lives; titles that match come first. */
export function searchEverything(sources: SearchSources, query: string, perKind = 8): Record<SearchKind, SearchHit[]> {
  const needle = query.trim().toLowerCase();
  const empty = { library: [], page: [], journal: [], template: [] };
  if (needle.length < 2) return empty;
  const byTitle = (a: SearchHit & { titled: boolean }, b: SearchHit & { titled: boolean }) => Number(b.titled) - Number(a.titled);
  const finish = (hits: (SearchHit & { titled: boolean })[]) =>
    hits
      .sort(byTitle)
      .slice(0, perKind)
      .map(({ titled: _titled, ...hit }) => hit);

  const library = searchLibrary(sources.library, query, { limit: Math.min(perKind, 6) }).map((entry) => {
    // Say why something matched when it isn't the name: "Deity · …pairs with rosemary and myrrh…".
    const named = entry.name.toLowerCase().includes(needle);
    const why = named ? null : firstMatch([...Object.values(entry.myPractice ?? {}), ...Object.values(entry.traditional ?? {})].flat(), needle);
    return { kind: 'library' as const, id: entry.id, title: entry.name, detail: why ? `${entry.category} · ${why}` : entry.category };
  });

  const blocksByPage = new Map<string, BlockRow[]>();
  for (const block of sources.blocks) blocksByPage.set(block.page_id, [...(blocksByPage.get(block.page_id) ?? []), block]);
  const pages = finish(
    sources.pages.flatMap((page) => {
      const titled = (page.title ?? '').toLowerCase().includes(needle);
      const blocks = (blocksByPage.get(page.id) ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      const body = firstMatch(blocks.flatMap((b) => [b.content, b.rich_content?.html]), needle);
      if (!titled && !body) return [];
      return [{ kind: 'page' as const, id: page.id, title: page.title || 'Untitled page', detail: body ?? 'Grimoire page', titled }];
    }),
  );

  const journal = finish(
    sources.journal.flatMap((entry) => {
      const titled = (entry.title ?? '').toLowerCase().includes(needle);
      const body = firstMatch(JOURNAL_FIELDS.map((key) => entry[key]), needle);
      if (!titled && !body) return [];
      return [{ kind: 'journal' as const, id: entry.id, title: entry.title || 'Untitled Ritual', detail: body ?? entry.ritual_date ?? 'Journal', titled }];
    }),
  );

  const templates = finish(
    sources.templates.flatMap((template) => {
      const titled = (template.title ?? '').toLowerCase().includes(needle);
      const steps = template.ritual_template_steps ?? [];
      const body = firstMatch(
        [template.intention, template.preparation, template.closing, ...steps.flatMap((s) => [s.title, s.instructions, s.spoken_text])],
        needle,
      );
      if (!titled && !body) return [];
      return [{ kind: 'template' as const, id: template.id, title: template.title, detail: body ?? 'Ritual template', titled }];
    }),
  );

  return { library, page: pages, journal, template: templates };
}
