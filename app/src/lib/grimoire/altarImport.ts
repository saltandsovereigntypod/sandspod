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

/** The page's blocks in order, as { type, content }. */
export function altarRitualBlocks(items: AltarRitualItem[], purpose: string, dateText: string): { type: string; content: string }[] {
  const blocks = [
    { type: 'heading', content: 'Date' },
    { type: 'text', content: dateText },
    { type: 'heading', content: 'Purpose' },
    { type: 'text', content: purpose || '' },
    { type: 'heading', content: 'Items from the Altar' },
  ];
  for (const group of groupAltarItems(items)) {
    blocks.push({ type: 'heading', content: group.groupLabel }, { type: 'ingredient_list', content: group.content });
  }
  blocks.push(
    { type: 'heading', content: 'Ritual Steps' },
    { type: 'numbered_list', content: '' },
    { type: 'heading', content: 'Results' },
    { type: 'text', content: '' },
    { type: 'heading', content: 'Reflection' },
    { type: 'text', content: '' },
  );
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
    purpose: string;
    items: AltarRitualItem[];
    dateText: string;
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
  const blocks = altarRitualBlocks(input.items, input.purpose, input.dateText).map((block, index): InsertOp => {
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
