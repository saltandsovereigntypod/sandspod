// "Your Journey with …" on a Library page, as the website works it out
// (js/living-connections.js and js/living-connections-view.js): when an entry
// was first and last used, how often, which kind of ritual it's used in most,
// what it's used alongside, and where it appears. Everything is computed from
// what the app already has; nothing is stored.

import { ingredientLibraryRef, type ApothecaryItem } from '../altar/apothecary.ts';
import type { PageRow } from '../grimoire/types.ts';
import type { JournalRow, RitualLinkRow, TemplateRow } from '../rituals/types.ts';
import { derivedLinks, entryResolver, nameMatcher, relationLabel, storedLinks, type EntryResolver, type RelationRow } from './connections.ts';
import { typeSingular } from './model.ts';
import type { LibraryEntry } from './types.ts';

export type JourneySources = {
  /** Journal entries: user_rituals rows, or a guest's on this device. */
  journal: JournalRow[];
  ritualLinks: RitualLinkRow[];
  templates: TemplateRow[];
  pages: PageRow[];
  apothecary: ApothecaryItem[];
  relations: RelationRow[];
};

/** Where an item opens in the app. */
export type JourneyTarget = { kind: 'journal' | 'template' | 'page' | 'entry'; id: string };

export type JourneyEvent = {
  id: string;
  timestamp: string | null;
  type: 'ritual_use' | 'template_inclusion' | 'recipe_ingredient' | 'journal_mention';
  label: string;
  /** Other Library entries (app ids) in the same working. */
  related: string[];
  ritualType: string | null;
  /** The Book of Shadows page a ritual was written up on. */
  pageId: string | null;
  target: JourneyTarget | null;
};

export type JourneyItem = { key: string; label: string; detail: string; date: string | null; target: JourneyTarget | null };
export type JourneyGroup = { key: string; label: string; items: JourneyItem[] };
export type JourneyPairing = { entry: LibraryEntry; frequency: number; description: string };

export type Journey = {
  hasHistory: boolean;
  emptyMessage: string;
  summary: { label: string; value: string }[];
  timesUsed: number;
  pairings: JourneyPairing[];
  groups: JourneyGroup[];
  recent: JourneyItem[];
};

export const EMPTY_JOURNEY_MESSAGE =
  'Your history with this entry will begin to gather here as you use it in rituals, recipes, altar work, and journal records.';

const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export const humanize = (value: string) =>
  value.replaceAll('_', ' ').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

/** "March 4, 2026" (or "Mar 4, 2026" short), as the website formats journey dates. */
export function formatJourneyDate(value: string | null | undefined, short = false): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, { month: short ? 'short' : 'long', day: 'numeric', year: 'numeric' }).format(date);
}

function timestampOf(...values: unknown[]): string | null {
  for (const value of values) {
    const text = str(value);
    if (!text) continue;
    const date = new Date(text);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return null;
}

/** The entry a stored value names: an id, or a record with entityId / a Traditional reference (resolveEntityId). */
function resolveValue(value: unknown, resolve: EntryResolver): LibraryEntry | null {
  if (typeof value === 'string') return resolve(value);
  if (!isObject(value)) return null;
  const direct = value.entityId ?? value.entity_id ?? value.libraryEntityId ?? value.library_entity_id ?? value.ref;
  if (str(direct)) return resolve(str(direct));
  const reference = value.traditionalReference ?? (isObject(value.metadata) ? value.metadata.traditionalReference : null);
  return str(reference) ? resolve(str(reference)) : null;
}

const unique = (ids: (string | null | undefined)[]) => [...new Set(ids.filter((id): id is string => !!id))];

/** Every working an entry appears in, oldest first (undated ones last), as getTimeline orders them. */
export function journeyEvents(entry: LibraryEntry, entries: LibraryEntry[], sources: JourneySources): JourneyEvent[] {
  const resolve = entryResolver(entries);
  const idOf = (value: unknown) => resolveValue(value, resolve)?.id ?? null;
  const events: JourneyEvent[] = [];
  const add = (event: Omit<JourneyEvent, 'related'> & { related: (string | null)[] }) => {
    const related = unique(event.related);
    if (!related.includes(entry.id)) return;
    events.push({ ...event, related: related.filter((id) => id !== entry.id) });
  };

  // Rituals: what was on the altar, and what the journal entry's links name.
  const linksByRitual = new Map<string, RitualLinkRow[]>();
  for (const link of sources.ritualLinks) {
    const ritualId = str(link.ritual_id);
    if (!ritualId) continue;
    linksByRitual.set(ritualId, [...(linksByRitual.get(ritualId) ?? []), link]);
  }
  const journalById = new Map(sources.journal.map((ritual) => [String(ritual.id), ritual]));
  for (const ritualId of new Set([...journalById.keys(), ...linksByRitual.keys()])) {
    const ritual = journalById.get(ritualId);
    const links = linksByRitual.get(ritualId) ?? [];
    const objects = (ritual?.altar_snapshot as { objects?: unknown } | undefined)?.objects;
    add({
      id: `ritual:${ritualId}`,
      timestamp: timestampOf(ritual?.ended_at, ritual?.ritual_date, ritual?.created_at),
      type: 'ritual_use',
      label: str(ritual?.title) || links.map((link) => str(link.label)).find(Boolean) || 'Ritual',
      related: [...(Array.isArray(objects) ? objects.map(idOf) : []), ...links.map((link) => idOf(link.entity_id))],
      ritualType: str(ritual?.source) || (ritual?.template_id ? 'template' : 'free'),
      pageId: str(ritual?.grimoire_page_id) || links.map((link) => str(link.grimoire_page_id)).find(Boolean) || null,
      target: ritual ? { kind: 'journal', id: ritualId } : null,
    });
  }

  // Ritual templates: their steps' linked entries, and the ingredients the app links to them.
  for (const template of sources.templates) {
    const fromSteps = (template.ritual_template_steps ?? []).flatMap((step) => (Array.isArray(step.linked_entities) ? step.linked_entities : []));
    const fromLinks = sources.ritualLinks.filter((link) => link.template_id === template.id).map((link) => link.entity_id);
    const fromMetadata = Array.isArray(template.metadata?.ingredients) ? (template.metadata.ingredients as unknown[]) : [];
    add({
      id: `template:${template.id}`,
      timestamp: timestampOf(template.updated_at, template.created_at),
      type: 'template_inclusion',
      label: str(template.title) || 'Ritual template',
      related: [...fromSteps, ...fromLinks, ...fromMetadata].map(idOf),
      ritualType: null,
      pageId: null,
      target: { kind: 'template', id: template.id },
    });
  }

  // Apothecary recipes it went into.
  const matchers = new Map<string, (name: string) => LibraryEntry | null>();
  const matcherFor = (libraryType: string) => {
    if (!matchers.has(libraryType)) matchers.set(libraryType, nameMatcher(entries.filter((candidate) => candidate.type === libraryType)));
    return matchers.get(libraryType)!;
  };
  for (const recipe of sources.apothecary) {
    const ingredients = recipe.ingredients.map((ingredient) => {
      const known = idOf(ingredient);
      if (known) return known;
      const { libraryType, libraryName } = ingredientLibraryRef(ingredient);
      return matcherFor(libraryType)(libraryName)?.id ?? null;
    });
    const own = recipe.entityId ? resolve(recipe.entityId) : null;
    if (!ingredients.includes(entry.id)) continue;
    add({
      id: `recipe:${recipe.id || recipe.entityId}`,
      timestamp: timestampOf(recipe.createdAt, recipe.updatedAt),
      type: 'recipe_ingredient',
      label: recipe.name || 'Apothecary recipe',
      related: [...ingredients, own?.id ?? null],
      ritualType: null,
      pageId: null,
      target: own ? { kind: 'entry', id: own.id } : null,
    });
  }

  // Book of Shadows pages written about it.
  for (const page of sources.pages) {
    const metadata = isObject(page.metadata) ? page.metadata : {};
    const named = [...(Array.isArray(metadata.entityIds) ? metadata.entityIds : []), metadata.entityId];
    add({
      id: `page:${page.id}`,
      timestamp: timestampOf(page.updated_at, page.created_at),
      type: 'journal_mention',
      label: str(page.title) || 'Book of Shadows page',
      related: named.map(idOf),
      ritualType: null,
      pageId: page.id,
      target: { kind: 'page', id: page.id },
    });
  }

  return events.sort((a, b) => {
    const aTime = a.timestamp ? Date.parse(a.timestamp) : Number.POSITIVE_INFINITY;
    const bTime = b.timestamp ? Date.parse(b.timestamp) : Number.POSITIVE_INFINITY;
    return aTime !== bTime ? aTime - bTime : a.id.localeCompare(b.id);
  });
}

const SOURCE_LABELS: Record<JourneyEvent['type'], string> = {
  ritual_use: 'Ritual',
  template_inclusion: 'Ritual template',
  recipe_ingredient: 'Apothecary recipe',
  journal_mention: 'Book of Shadows page',
};

function eventItem(event: JourneyEvent): JourneyItem {
  return { key: event.id, label: event.label, detail: SOURCE_LABELS[event.type], date: event.timestamp, target: event.target };
}

function uniqueItems(items: JourneyItem[]): JourneyItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.target ? `${item.target.kind}:${item.target.id}` : `${item.label}|${item.date ?? ''}`;
    if (!item.label || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** The whole "Your Journey with …" section for one entry (createJourneyModel). */
export function buildJourney(
  entry: LibraryEntry,
  entries: LibraryEntry[],
  sources: JourneySources,
  options: { pairingLimit?: number; recentLimit?: number } = {},
): Journey {
  const events = journeyEvents(entry, entries, sources);
  // Every kind of appearance here counts as a use (getUsage's USAGE_EVENT_TYPES).
  const uses = events;
  const dated = uses.filter((event) => event.timestamp);
  const first = dated[0] ?? null;
  const last = dated[dated.length - 1] ?? null;

  const ritualTypes = new Map<string, number>();
  for (const event of uses) {
    if (event.type === 'ritual_use') ritualTypes.set(event.ritualType || 'ritual', (ritualTypes.get(event.ritualType || 'ritual') ?? 0) + 1);
  }
  const topRitualType = [...ritualTypes.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null;

  const summary: Journey['summary'] = [];
  if (first) summary.push({ label: 'First Worked With', value: formatJourneyDate(first.timestamp) });
  if (last) summary.push({ label: 'Most Recently Used', value: [last.label, formatJourneyDate(last.timestamp)].filter(Boolean).join(' · ') });
  if (uses.length) summary.push({ label: 'Times Used', value: `${uses.length} recorded appearance${uses.length === 1 ? '' : 's'}` });
  if (topRitualType) summary.push({ label: 'Most Common Ritual Type', value: humanize(topRitualType) });

  const resolve = entryResolver(entries);
  const counts = new Map<string, number>();
  for (const event of uses) for (const id of event.related) counts.set(id, (counts.get(id) ?? 0) + 1);
  const pairings = [...counts.entries()]
    .map(([id, frequency]) => ({ entry: resolve(id), frequency }))
    .filter((pairing): pairing is { entry: LibraryEntry; frequency: number } => !!pairing.entry)
    .sort((a, b) => b.frequency - a.frequency || a.entry.name.localeCompare(b.entry.name))
    .slice(0, options.pairingLimit ?? 6)
    .map((pairing) => ({
      ...pairing,
      description: `Appeared together in ${pairing.frequency} recorded working${pairing.frequency === 1 ? '' : 's'}`,
    }));

  // Library relationships: everything "Connected To" shows, one item per entry.
  const related: JourneyItem[] = [];
  for (const link of [...storedLinks(sources.relations, resolve), ...derivedLinks(entries)]) {
    if (link.from !== entry.id && link.to !== entry.id) continue;
    const other = resolve(link.from === entry.id ? link.to : link.from);
    if (!other || other.id === entry.id) continue;
    related.push({
      key: `relation:${link.relation}:${other.id}`,
      label: other.name,
      detail: `${typeSingular(other.type)} · ${relationLabel(link.relation)}`,
      date: null,
      target: { kind: 'entry', id: other.id },
    });
  }
  const relatedOfType = (type: string) => related.filter((item) => resolve(item.target?.id)?.type === type);

  const ritualPages = events
    .filter((event) => event.type === 'ritual_use' && event.pageId)
    .map((event) => ({ ...eventItem(event), key: `${event.id}:page`, target: { kind: 'page' as const, id: event.pageId! } }));
  const groups: JourneyGroup[] = [
    { key: 'rituals', label: 'Rituals', items: uniqueItems(events.filter((e) => e.type === 'ritual_use').map(eventItem)) },
    {
      key: 'journals',
      label: 'Journal Entries',
      items: uniqueItems(events.filter((e) => e.type === 'journal_mention' || (e.type === 'ritual_use' && e.pageId)).map(eventItem)),
    },
    {
      key: 'pages',
      label: 'Book of Shadows Pages',
      items: uniqueItems([...events.filter((e) => e.type === 'journal_mention').map(eventItem), ...ritualPages]),
    },
    {
      key: 'templates',
      label: 'Ritual Templates',
      items: uniqueItems([...events.filter((e) => e.type === 'template_inclusion').map(eventItem), ...relatedOfType('ritual_template')]),
    },
    {
      key: 'recipes',
      label: 'Apothecary Recipes',
      items: uniqueItems([...events.filter((e) => e.type === 'recipe_ingredient').map(eventItem), ...relatedOfType('apothecary')]),
    },
    { key: 'relationships', label: 'Library Relationships', items: uniqueItems(related) },
  ].filter((group) => group.items.length > 0);

  const recent = dated
    .slice()
    .reverse()
    .slice(0, options.recentLimit ?? 5)
    .map(eventItem);
  const hasHistory = uses.length > 0;
  return { hasHistory, emptyMessage: hasHistory ? '' : EMPTY_JOURNEY_MESSAGE, summary, timesUsed: uses.length, pairings, groups, recent };
}
