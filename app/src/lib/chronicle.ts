// "My Journey", the Sanctuary's personal chronicle, as the website builds it
// (js/my-journey.js, fed by js/living-sanctuary.js journeyRecords and the
// Sanctuary search index in js/sanctuary-search-ui.js): every dated record of
// someone's practice — Living Library entries, Book of Shadows pages,
// Apothecary recipes, journal rituals and ritual templates — on one timeline,
// searchable, filterable by kind and grouped by month or year, with a few
// gentle observations. Nothing is stored; it's all read from what the app
// already loads. Pure, so it can be tested.

import type { ApothecaryItem } from './altar/apothecary.ts';
import type { BlockRow, PageRow } from './grimoire/types.ts';
import { entryResolver, storedLinks, type RelationRow } from './library/connections.ts';
import type { LibraryEntry } from './library/types.ts';
import type { JournalRow, RitualSession, TemplateRow } from './rituals/types.ts';

/** MyJourney.CATEGORY_LABELS. */
export const CATEGORY_LABELS: Record<string, string> = {
  library: 'Living Library',
  pages: 'Journal',
  rituals: 'Rituals',
  templates: 'Templates',
  apothecary: 'Apothecary',
  objects: 'Living Objects',
  offerings: 'Offerings',
  altar: 'Altar',
};

/** Where a moment opens in the app. */
export type ChronicleTarget = { kind: 'entry' | 'page' | 'journal' | 'template' | 'run'; id: string };

/** One recorded moment (normalizeEvent). */
export type ChronicleEvent = {
  id: string;
  category: string;
  source: string;
  timestamp: string;
  title: string;
  description: string;
  entityId: string | null;
  target: ChronicleTarget | null;
  searchText: string;
};

/** A record before it's on the timeline: what the Sanctuary search index holds. */
export type ChronicleRecord = {
  id: string;
  category: string;
  source?: string;
  title: string;
  timestamp: string | null | undefined;
  description?: string;
  relationshipContext?: string;
  subtitle?: string;
  /** Searchable words. */
  fields?: string;
  entityId?: string | null;
  target?: ChronicleTarget | null;
};

export type ChronicleSources = {
  library: LibraryEntry[];
  relations: RelationRow[];
  pages: PageRow[];
  blocks: BlockRow[];
  apothecary: ApothecaryItem[];
  journal: JournalRow[];
  templates: TemplateRow[];
  active: RitualSession | null;
  /** The Library layers shown (More → Settings → Library); all on when not given. */
  layers?: { traditional?: boolean; myPractice?: boolean; community?: boolean };
};

const validTime = (value: unknown): number | null => {
  const time = typeof value === 'string' && value ? Date.parse(value) : NaN;
  return Number.isFinite(time) ? time : null;
};

/** Searchable words from stored values, leaving out ids, images and links (SanctuarySearch text). */
export function searchWords(value: unknown): string {
  if (Array.isArray(value)) return value.map(searchWords).filter(Boolean).join(' ');
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([key]) => !/(^|_)(id|ids|user|image|asset|path|url)(_|$)|^(linkedEntities|linked_entities|entityIds)$/i.test(key))
      .map(([, item]) => searchWords(item))
      .filter(Boolean)
      .join(' ');
  }
  if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value)) return '';
  if (typeof value === 'string') return value.replace(/<[^>]+>/g, ' ');
  return typeof value === 'number' ? String(value) : '';
}

const normalizeText = (value: string) => value.trim().toLocaleLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
const present = (value: Record<string, unknown> | null | undefined) => !!value && Object.keys(value).length > 0;

/** Everything the website's Sanctuary index would put on the timeline, from what the app has loaded. */
export function chronicleRecords(sources: ChronicleSources): ChronicleRecord[] {
  const layers = { traditional: true, myPractice: true, community: true, ...sources.layers };
  const resolve = entryResolver(sources.library);
  const records: ChronicleRecord[] = [];

  // Living Library: the person's own entries (living_library_entries rows), as libraryRecords.
  const links = storedLinks(sources.relations, resolve);
  for (const entry of sources.library) {
    if (!entry.practiceEntityIds.length) continue;
    const personal = (layers.myPractice && present(entry.myPractice)) || (layers.community && present(entry.community));
    if (!layers.traditional && !personal) continue;
    const related = [
      ...new Set(
        links
          .filter((link) => link.from === entry.id || link.to === entry.id)
          .map((link) => resolve(link.from === entry.id ? link.to : link.from)?.name)
          .filter((name): name is string => !!name),
      ),
    ];
    records.push({
      id: entry.id,
      category: 'library',
      source: 'living-library',
      title: entry.name,
      timestamp: entry.updatedAt,
      relationshipContext: related.length ? `Linked to ${related.slice(0, 3).join(', ')}` : '',
      subtitle: `${entry.category || 'Entry'} · Living Library`,
      fields: searchWords([
        layers.myPractice ? entry.myPractice : {},
        layers.traditional ? entry.traditional : {},
        layers.community ? entry.community : {},
        related,
      ]),
      entityId: entry.id,
      target: { kind: 'entry', id: entry.id },
    });
  }

  // Book of Shadows pages (pageRecords); the ritual journal's own pages are already rituals.
  const blocksByPage = new Map<string, BlockRow[]>();
  for (const block of sources.blocks) blocksByPage.set(block.page_id, [...(blocksByPage.get(block.page_id) ?? []), block]);
  for (const page of sources.pages) {
    if (page.page_type === 'ritual_journal') continue;
    records.push({
      id: page.id,
      category: 'pages',
      source: 'pages',
      title: page.title || 'Untitled Page',
      timestamp: page.updated_at || page.created_at,
      subtitle: 'Book of Shadows Page',
      fields: searchWords([page.metadata, (blocksByPage.get(page.id) ?? []).map((block) => [block.content, block.rich_content?.html])]),
      target: { kind: 'page', id: page.id },
    });
  }

  // Apothecary recipes (createApothecaryResult).
  for (const item of sources.apothecary) {
    if (!item.id) continue;
    const typeLabel = item.typeLabel || item.type || 'Apothecary Item';
    const ingredientNames = item.ingredients.map((i) => i.label || (i.name as string) || i.libraryName).filter((n): n is string => !!n);
    const own = item.entityId ? resolve(item.entityId) : null;
    records.push({
      id: item.id,
      category: 'apothecary',
      source: 'apothecary',
      title: item.name || 'Untitled Apothecary Item',
      timestamp: item.updatedAt || item.createdAt,
      relationshipContext: ingredientNames.length ? `Contains ${ingredientNames.slice(0, 3).join(', ')}` : '',
      subtitle: `${typeLabel} · Apothecary`,
      fields: searchWords([item.name, item.intention, item.notes, item.details, ingredientNames]),
      target: own ? { kind: 'entry', id: own.id } : null,
    });
  }

  // Rituals: the journal (user_rituals), and a ritual under way.
  for (const ritual of sources.journal) {
    const row = ritual as JournalRow & { completed_at?: string | null; name?: string | null };
    records.push({
      id: ritual.id,
      category: 'rituals',
      source: 'rituals',
      title: ritual.title || row.name || 'Untitled Ritual',
      timestamp: row.completed_at || ritual.updated_at || ritual.created_at,
      subtitle: 'Ritual',
      fields: searchWords([ritual.intention, ritual.notes, ritual.tags, ritual.altar_snapshot]),
      target: { kind: 'journal', id: ritual.id },
    });
  }
  if (sources.active?.started_at) {
    const active = sources.active;
    records.push({
      id: `active:${active.id}`,
      category: 'rituals',
      source: 'ritual-session',
      title: active.title || 'Active Ritual Session',
      timestamp: active.started_at,
      description: active.status || 'Active',
      target: { kind: 'run', id: active.id },
    });
  }

  // Ritual templates (archived ones aren't loaded on the website).
  for (const template of sources.templates) {
    if (template.status === 'archived') continue;
    const row = template as TemplateRow & { name?: string | null };
    records.push({
      id: template.id,
      category: 'templates',
      source: 'templates',
      title: row.name || template.title || 'Untitled Template',
      timestamp: template.updated_at || template.created_at,
      subtitle: 'Ritual Template',
      fields: searchWords([template.description, template.intention, template.ritual_template_steps]),
      target: { kind: 'template', id: template.id },
    });
  }
  return records;
}

/** A record as a timeline moment, or null without an id, a title or a real date (normalizeEvent). */
export function normalizeEvent(record: ChronicleRecord): ChronicleEvent | null {
  const time = validTime(record.timestamp);
  if (!record.id || !record.title || time == null) return null;
  return {
    id: String(record.id),
    category: record.category || 'library',
    source: record.source || record.category || 'library',
    timestamp: new Date(time).toISOString(),
    title: String(record.title),
    description: record.description || record.relationshipContext || record.subtitle || '',
    entityId: record.entityId || null,
    target: record.target ?? null,
    searchText: [record.title, record.description, record.relationshipContext, record.fields].filter(Boolean).join(' '),
  };
}

/** Every dated record once (buildTimeline). */
export function buildTimeline(records: ChronicleRecord[]): ChronicleEvent[] {
  const seen = new Set<string>();
  return records
    .map(normalizeEvent)
    .filter((event): event is ChronicleEvent => !!event)
    .filter((event) => {
      const key = `${event.source}:${event.id}:${event.timestamp}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export type Direction = 'newest' | 'oldest';
export type Grouping = 'month' | 'year';

export function sortEvents(events: ChronicleEvent[], direction: Direction = 'newest'): ChronicleEvent[] {
  const multiplier = direction === 'oldest' ? 1 : -1;
  return [...events].sort((a, b) => (Date.parse(a.timestamp) - Date.parse(b.timestamp)) * multiplier || a.id.localeCompare(b.id));
}

/** The kinds present, in the order they first appear (the filter chips). */
export function categoriesOf(events: ChronicleEvent[]): string[] {
  return [...new Set(events.map((event) => event.category))];
}

/** One kind (or all), matching the search, in order (filterEvents). */
export function filterEvents(events: ChronicleEvent[], options: { query?: string; category?: string; direction?: Direction } = {}): ChronicleEvent[] {
  const query = normalizeText(options.query ?? '');
  const category = options.category || 'all';
  let filtered = events.filter((event) => category === 'all' || event.category === category);
  if (query) filtered = filtered.filter((event) => normalizeText(`${event.title} ${event.searchText} ${event.description}`).includes(query));
  return sortEvents(filtered, options.direction);
}

export function groupLabel(timestamp: string, grouping: Grouping, locale?: string): string {
  const date = new Date(timestamp);
  return grouping === 'year' ? String(date.getFullYear()) : date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

/** Consecutive moments under their month ("October 2026") or year (groupEvents). */
export function groupEvents(events: ChronicleEvent[], grouping: Grouping = 'month', locale?: string): { label: string; items: ChronicleEvent[] }[] {
  const groups = new Map<string, ChronicleEvent[]>();
  for (const event of events) {
    const key = groupLabel(event.timestamp, grouping, locale);
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  return [...groups].map(([label, items]) => ({ label, items }));
}

/** "First Pages": the first of a few kinds of record (milestones). */
export function milestones(events: ChronicleEvent[]): { label: string; event: ChronicleEvent }[] {
  const oldest = sortEvents(events, 'oldest');
  const definitions: [string, string][] = [
    ['rituals', 'Your first recorded ritual'],
    ['pages', 'Your earliest journal page'],
    ['offerings', 'Your first recorded offering'],
    ['apothecary', 'Your first Apothecary recipe'],
    ['library', 'Your earliest Living Library entry'],
  ];
  return definitions
    .map(([category, label]) => {
      const event = oldest.find((item) => item.category === category);
      return event ? { label, event } : null;
    })
    .filter((item): item is { label: string; event: ChronicleEvent } => !!item)
    .slice(0, 4);
}

/** "Recorded Patterns" (reflectiveSummary). */
export function reflectiveSummary(events: ChronicleEvent[], locale?: string): string[] {
  if (!events.length) return [];
  const oldest = sortEvents(events, 'oldest')[0];
  const entities = new Set(events.map((event) => event.entityId).filter(Boolean));
  const rituals = events.filter((event) => event.category === 'rituals').length;
  const recipes = events.filter((event) => event.category === 'apothecary').length;
  return [
    `Your recorded Sanctuary begins on ${new Date(oldest.timestamp).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })}.`,
    entities.size ? `${entities.size} distinct Living Library ${entities.size === 1 ? 'entity appears' : 'entities appear'} in this recorded chapter.` : '',
    rituals ? `${rituals} ritual ${rituals === 1 ? 'record appears' : 'records appear'} in your chronicle.` : '',
    recipes ? `${recipes} Apothecary ${recipes === 1 ? 'recipe has' : 'recipes have'} been recorded.` : '',
  ].filter(Boolean);
}

/** "Recent Threads": entries that recur among the latest moments (recentThreads). */
export function recentThreads(events: ChronicleEvent[], limit = 30): { entityId: string; count: number; text: string }[] {
  const counts = new Map<string, number>();
  for (const event of sortEvents(events).slice(0, limit)) if (event.entityId) counts.set(event.entityId, (counts.get(event.entityId) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([entityId, count]) => ({ entityId, count, text: `This entry appears in ${count} recently recorded moments.` }));
}
