// The page elements and page templates the website offers
// (grimoire/js/config.js: ELEMENT_TYPES and PAGE_TEMPLATES). Keep these in
// step with the website so a page started in either place looks the same.

import type { BlockType } from './types.ts';

export type ElementType = {
  type: BlockType;
  label: string;
  group: 'Writing' | 'Structure' | 'Magical' | 'Media & Links';
};

export const ELEMENT_TYPES: ElementType[] = [
  { type: 'text', label: 'Paragraph', group: 'Writing' },
  { type: 'heading', label: 'Heading', group: 'Writing' },
  { type: 'callout', label: 'Note / Quote', group: 'Writing' },
  { type: 'divider', label: 'Divider', group: 'Structure' },
  { type: 'checklist', label: 'Checklist', group: 'Structure' },
  { type: 'bulleted_list', label: 'Bulleted List', group: 'Structure' },
  { type: 'numbered_list', label: 'Numbered List', group: 'Structure' },
  { type: 'ingredient_list', label: 'Ingredient List', group: 'Magical' },
  { type: 'correspondence', label: 'Correspondence', group: 'Magical' },
  { type: 'image', label: 'Image', group: 'Media & Links' },
  { type: 'page_link', label: 'Page Link', group: 'Media & Links' },
];

export const ELEMENT_GROUPS = [...new Set(ELEMENT_TYPES.map((e) => e.group))];

export function elementLabel(type: BlockType): string {
  if (type === 'quote') return 'Note / Quote';
  return ELEMENT_TYPES.find((e) => e.type === type)?.label ?? 'Element';
}

/** How the website edits each block type (grimoire/js/ui/editor.js). */
export type EditorKind = 'rich' | 'plain' | 'divider' | 'image' | 'page_link' | 'unknown';

export function editorKind(type: BlockType): EditorKind {
  switch (type) {
    case 'text':
    case 'heading':
    case 'quote':
    case 'callout':
      return 'rich'; // contenteditable on the website: saved as HTML
    case 'checklist':
    case 'bulleted_list':
    case 'numbered_list':
    case 'ingredient_list':
    case 'correspondence':
      return 'plain'; // textarea on the website: saved as plain text
    case 'divider':
      return 'divider';
    case 'image':
      return 'image';
    case 'page_link':
      return 'page_link';
    default:
      return 'unknown';
  }
}

export type TemplateBlock = { type: BlockType; content: string };
export type PageTemplate = { key: string; label: string; blocks: TemplateBlock[] };

export const PAGE_TEMPLATES: PageTemplate[] = [
  { key: 'blank', label: 'Blank Page', blocks: [{ type: 'text', content: '' }] },
  {
    key: 'herb',
    label: 'Herb Entry',
    blocks: [
      { type: 'heading', content: 'Correspondences' },
      { type: 'correspondence', content: 'Planet:\nElement:\nDeities:\nMagical uses:' },
      { type: 'heading', content: 'Traditional Uses' },
      { type: 'text', content: '' },
      { type: 'heading', content: 'Warnings' },
      { type: 'callout', content: 'Add any safety notes, contraindications, or personal cautions here.' },
      { type: 'heading', content: 'Personal Notes' },
      { type: 'text', content: '' },
    ],
  },
  {
    key: 'crystal',
    label: 'Crystal Entry',
    blocks: [
      { type: 'heading', content: 'Correspondences' },
      { type: 'correspondence', content: 'Element:\nChakra:\nPlanet:\nMagical uses:' },
      { type: 'heading', content: 'How I Work With It' },
      { type: 'text', content: '' },
      { type: 'heading', content: 'Personal Notes' },
      { type: 'text', content: '' },
    ],
  },
  {
    key: 'deity',
    label: 'Deity Entry',
    blocks: [
      { type: 'heading', content: 'Titles and Epithets' },
      { type: 'text', content: '' },
      { type: 'heading', content: 'Offerings' },
      { type: 'ingredient_list', content: '' },
      { type: 'heading', content: 'Signs and Symbols' },
      { type: 'bulleted_list', content: '' },
      { type: 'heading', content: 'Personal Relationship' },
      { type: 'text', content: '' },
    ],
  },
  {
    key: 'dream',
    label: 'Dream Journal',
    blocks: [
      { type: 'heading', content: 'Dream Notes' },
      { type: 'text', content: '' },
      { type: 'heading', content: 'Symbols' },
      { type: 'bulleted_list', content: '' },
      { type: 'heading', content: 'Interpretation' },
      { type: 'text', content: '' },
    ],
  },
  {
    key: 'ritual',
    label: 'Ritual',
    blocks: [
      { type: 'heading', content: 'Purpose' },
      { type: 'text', content: '' },
      { type: 'heading', content: 'Materials' },
      { type: 'ingredient_list', content: '' },
      { type: 'heading', content: 'Ritual Steps' },
      { type: 'numbered_list', content: '' },
      { type: 'heading', content: 'Reflections' },
      { type: 'text', content: '' },
    ],
  },
  {
    key: 'tarot',
    label: 'Tarot Reading',
    blocks: [
      { type: 'heading', content: 'Question' },
      { type: 'text', content: '' },
      { type: 'heading', content: 'Cards Pulled' },
      { type: 'bulleted_list', content: '' },
      { type: 'heading', content: 'Interpretation' },
      { type: 'text', content: '' },
    ],
  },
  {
    key: 'moon',
    label: 'Moon Journal',
    blocks: [
      { type: 'heading', content: 'Moon Phase' },
      { type: 'text', content: '' },
      { type: 'heading', content: 'Energy' },
      { type: 'text', content: '' },
      { type: 'heading', content: 'Intentions or Release' },
      { type: 'text', content: '' },
    ],
  },
];

export function findTemplate(key: string): PageTemplate {
  return PAGE_TEMPLATES.find((t) => t.key === key) ?? PAGE_TEMPLATES[0];
}
