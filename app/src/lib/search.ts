// One search across someone's whole practice: the Living Library, their
// grimoire pages, their ritual journal and templates, their divination
// readings and their dreams. Pure, so what it finds can be tested.

import type { BlockRow, PageRow } from './grimoire/types.ts';
import { searchLibrary } from './library/model.ts';
import type { LibraryEntry } from './library/types.ts';
import { methodLabel, sortReadings, type ReadingEntry } from './craft/hedge/readings.ts';
import { searchDreams, sortDreams, type DreamEntry } from './craft/hedge/dreams.ts';
import type { JournalRow, TemplateRow } from './rituals/types.ts';
import { dayLabel, entryTitle, journalDef, searchEntries, sortEntries, type JournalEntry, type JournalKind } from './journals/journals.ts';

export type SearchKind = 'library' | 'page' | 'journal' | 'template' | 'reading' | 'dream' | 'practiceJournal';

export type SearchHit = { kind: SearchKind; id: string; title: string; detail: string };

export type SearchSources = {
  library: LibraryEntry[];
  pages: PageRow[];
  blocks: BlockRow[];
  journal: JournalRow[];
  templates: TemplateRow[];
  /** Divination readings (craft collection `hedge.readings`), normalised. */
  readings?: ReadingEntry[];
  /** Dreams (craft collection `hedge.dreams`), normalised. */
  dreams?: DreamEntry[];
  /** The practice journals (lib/journals), normalised; a hit's id is "<kind>/<entry id>". */
  journals?: { kind: JournalKind; entries: JournalEntry[] }[];
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
  const empty = { library: [], page: [], journal: [], template: [], reading: [], dream: [], practiceJournal: [] };
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
      // A picture kept as a data: url (a sigil) has nothing to read.
      const body = firstMatch(blocks.flatMap((b) => (b.content?.startsWith('data:') ? [] : [b.content, b.rich_content?.html])), needle);
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

  const readings = finish(
    sortReadings(sources.readings ?? []).flatMap((entry) => {
      const d = entry.data;
      const titled = (d.question ?? '').toLowerCase().includes(needle) || d.drawn.some((name) => name.toLowerCase().includes(needle));
      const body = titled ? null : firstMatch([d.cameUp, d.interpretation, d.outcome], needle);
      if (!titled && !body) return [];
      const drawn = d.drawn.slice(0, 3).join(', ');
      return [{ kind: 'reading' as const, id: entry.id, title: d.question || 'A reading', detail: body ?? [methodLabel(d.method), d.date, drawn].filter(Boolean).join(' · '), titled }];
    }),
  );

  // Dreams match as the Grimoire's own search does (title, the dream, feelings and symbols), newest first.
  const dreams = finish(
    sortDreams(searchDreams(sources.dreams ?? [], query)).map((entry) => {
      const d = entry.data;
      const titled = (d.title ?? '').toLowerCase().includes(needle);
      const body = titled ? null : firstMatch([d.dream, d.feelings, d.symbols.join(', ')], needle);
      return { kind: 'dream' as const, id: entry.id, title: d.title || 'Untitled dream', detail: body ?? [d.date, d.moonPhase].filter(Boolean).join(' · '), titled };
    }),
  );

  // The practice journals: shadow work, deity & spirit, ancestors, omens & signs.
  const practiceJournal = finish(
    (sources.journals ?? []).flatMap(({ kind, entries }) =>
      sortEntries(searchEntries(kind, entries, query)).map((entry) => {
        const title = entryTitle(kind, entry.data);
        const titled = title.toLowerCase().includes(needle);
        const body = titled ? null : firstMatch([entry.data.text, entry.data.what, entry.data.meaning, entry.data.trigger, entry.data.pattern, entry.data.integration, entry.data.prayer, entry.data.recipe, entry.data.tags.join(', ')], needle);
        return { kind: 'practiceJournal' as const, id: `${kind}/${entry.id}`, title, detail: body ?? `${journalDef(kind).title} · ${dayLabel(entry.data.date)}`, titled };
      }),
    ),
  );

  return { library, page: pages, journal, template: templates, reading: readings, dream: dreams, practiceJournal };
}
