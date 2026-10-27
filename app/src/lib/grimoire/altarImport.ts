// A ritual group sent from the altar becomes a ritual page in the Book of
// Shadows, built exactly as the website builds it (altar/js/features/groups.js
// sendCurrentGroupToGrimoire, then grimoire/js/app.js
// createRitualPageFromAltarImport): Date, Purpose, the altar's items grouped
// by kind as ingredient lists, then Ritual Steps, Results and Reflection.

import { nextOrder, type InsertOp } from './edits.ts';
import type { GrimoireSnapshot } from './types.ts';

/** One altar object as the handoff carries it (altarObjectToRitualItem). */
export type AltarRitualItem = { id: string; label: string; type: string; herb: string; form: string; color: string; dressings: string };

/** ALTAR_IMPORT_TYPE_LABELS. */
const TYPE_LABELS: Record<string, string> = {
  candle: 'Candles',
  herb: 'Herbs',
  oil: 'Oils',
  crystal: 'Crystals',
  deity: 'Deities',
  vessel: 'Vessels',
  tool: 'Tools',
  item: 'Other Items',
};

export function altarRitualItem(object: Record<string, unknown>, dressings: unknown[] = []): AltarRitualItem {
  const text = (value: unknown, fallback = '') => (typeof value === 'string' && value ? value : fallback);
  return {
    id: text(object.altarObjectId),
    label: text(object.label, 'Altar Item'),
    type: text(object.type, 'item'),
    herb: text(object.herb),
    form: text(object.form),
    color: text(object.color),
    dressings: JSON.stringify(dressings),
  };
}

/** formatAltarImportItems: one line per item ("Red Candle · Color: red · Form: vigil") under its kind. */
export function groupAltarItems(items: AltarRitualItem[]): { groupLabel: string; content: string }[] {
  const grouped = new Map<string, AltarRitualItem[]>();
  for (const item of items) {
    const label = TYPE_LABELS[item.type || 'item'] || 'Other Items';
    grouped.set(label, [...(grouped.get(label) ?? []), item]);
  }
  return [...grouped.entries()]
    .map(([groupLabel, list]) => ({
      groupLabel,
      content: list
        .map((item) => [item.label, item.color ? `Color: ${item.color}` : '', item.form ? `Form: ${item.form}` : ''].filter(Boolean).join(' · '))
        .join('\n'),
    }))
    .filter((group) => group.content.trim());
}

/** Kinds of working offered when recording one (any of them, or none). */
export const WORKING_KINDS = [
  'Spell',
  'Ritual',
  'Devotion',
  'Offering',
  'Divination',
  'Cleansing',
  'Protection',
  'Manifestation',
  'Banishing',
  'Healing',
  'Shadow Work',
  'Other',
] as const;

/** Everything a recorded working can hold; every field is optional. */
export type WorkingDetails = {
  intention?: string;
  kind?: string;
  time?: string;
  moonPhase?: string;
  day?: string;
  weather?: string;
  deities?: string;
  extraItems?: string;
  preparation?: string;
  steps?: string;
  words?: string;
  feelings?: string;
  signs?: string;
  results?: string;
  reflection?: string;
  followUp?: string;
};

/**
 * The page's blocks in order, as { type, content }. Only the parts that were
 * filled in appear, except What I Did, Results and Reflection, which are kept
 * so they can be written later. (grimoire/js/app.js buildWorkingBlocks)
 */
export function altarRitualBlocks(
  items: AltarRitualItem[],
  details: WorkingDetails | string,
  dateText: string,
  /** Everything on the altar written down (altar/altarRecord.ts), in place of the plain list of items. */
  record: { type: string; content: string }[] = [],
): { type: string; content: string }[] {
  const d: WorkingDetails = typeof details === 'string' ? { intention: details } : details;
  const v = (value: string | undefined) => (value ?? '').trim();
  const blocks: { type: string; content: string }[] = [
    { type: 'heading', content: 'Date' },
    { type: 'text', content: [dateText, v(d.time)].filter(Boolean).join(' · ') },
  ];
  const section = (heading: string, type: string, value: string | undefined) => {
    if (v(value)) blocks.push({ type: 'heading', content: heading }, { type, content: v(value) });
  };
  section('Type of Working', 'text', d.kind);
  blocks.push({ type: 'heading', content: 'Intention' }, { type: 'text', content: v(d.intention) });
  const timing = [
    v(d.moonPhase) && `Moon phase: ${v(d.moonPhase)}`,
    v(d.day) && `Day: ${v(d.day)}`,
    v(d.weather) && `Weather: ${v(d.weather)}`,
  ].filter(Boolean);
  if (timing.length) blocks.push({ type: 'heading', content: 'Timing' }, { type: 'correspondence', content: timing.join('\n') });
  section('Deities and Spirits', 'text', d.deities);
  const groups = groupAltarItems(items);
  if (record.length) {
    blocks.push({ type: 'heading', content: 'Items from the Altar' }, ...record.map((b) => ({ type: String(b.type), content: String(b.content ?? '') })));
  } else if (groups.length) {
    blocks.push({ type: 'heading', content: 'Items from the Altar' });
    for (const group of groups) {
      blocks.push({ type: 'heading', content: group.groupLabel }, { type: 'ingredient_list', content: group.content });
    }
  }
  section('Also Used', 'ingredient_list', d.extraItems);
  section('Preparation', 'text', d.preparation);
  blocks.push({ type: 'heading', content: 'What I Did' }, { type: 'numbered_list', content: v(d.steps) });
  section('Words Spoken', 'quote', d.words);
  section('What I Felt', 'text', d.feelings);
  section('Signs and Omens', 'text', d.signs);
  blocks.push(
    { type: 'heading', content: 'Results' },
    { type: 'text', content: v(d.results) },
    { type: 'heading', content: 'Reflection' },
    { type: 'text', content: v(d.reflection) },
  );
  section('Follow-up', 'text', d.followUp);
  return blocks;
}

/** The grimoire's formatDate: "October 12, 2026". */
export const ritualDateText = (now: Date) => now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

/** The page and block inserts for a ritual page made from an altar group. */
export function altarRitualOps(
  snapshot: GrimoireSnapshot,
  ctx: { userId: string; now: string },
  input: {
    id: string;
    bookId: string;
    /** The section open in the Grimoire (activeSectionId); top level when null. */
    sectionId?: string | null;
    title: string;
    /** The intention alone, or the whole working. */
    purpose: string | WorkingDetails;
    items: AltarRitualItem[];
    dateText: string;
    /** Everything on the altar written down (altar/altarRecord.ts). */
    record?: { type: string; content: string }[];
  },
  makeId: () => string,
): InsertOp[] {
  const sectionId = input.sectionId ?? null;
  const siblings = snapshot.pages.filter((p) => p.book_id === input.bookId && (p.section_id ?? null) === sectionId);
  const page: InsertOp = {
    kind: 'insert',
    table: 'grimoire_pages',
    id: input.id,
    row: {
      id: input.id,
      user_id: ctx.userId,
      book_id: input.bookId,
      section_id: sectionId,
      title: input.title || 'Ritual Working',
      icon: '',
      page_type: 'ritual',
      sort_order: nextOrder(siblings),
    },
  };
  const blocks = altarRitualBlocks(input.items, input.purpose, input.dateText, input.record).map((block, index): InsertOp => {
    const id = makeId();
    return {
      kind: 'insert',
      table: 'grimoire_blocks',
      id,
      row: {
        id,
        user_id: ctx.userId,
        book_id: input.bookId,
        page_id: input.id,
        block_type: block.type,
        content: block.content || '',
        metadata: {},
        rich_content: null,
        sort_order: index,
      },
    };
  });
  return [page, ...blocks];
}
