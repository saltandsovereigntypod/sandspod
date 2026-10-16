// Ingredient checks: what a premade working or your own template calls for,
// and which of those you already have: on this altar, in My Apothecary, in
// your own cabinet items, among your stones or growing in your garden.
// "You have 6 of the 8." Pure, so it can be tested.

import type { ApothecaryItem } from '../apothecary.ts';
import type { CabinetItem, SavedObject } from '../types.ts';
import type { Premade } from '../../rituals/premade/types.ts';
import type { Ingredient, TemplateDraft, TemplateRow } from '../../rituals/types.ts';
import type { Stone } from '../../craft/crystal/stones.ts';
import type { Plant } from '../../craft/green/garden.ts';

/** One thing a working needs. */
export type Need = { name: string; ref?: string; optional?: boolean };

export type Source = 'altar' | 'apothecary' | 'cabinet' | 'stones' | 'garden';

export type Pantry = {
  objects: SavedObject[];
  apothecary?: ApothecaryItem[];
  customItems?: CabinetItem[];
  stones?: Stone[];
  plants?: Plant[];
};

export type NeedResult = Need & {
  have: boolean;
  /** Where it was found, first match first. */
  found: { source: Source; label: string }[];
};

export type IngredientCheck = {
  have: NeedResult[];
  missing: NeedResult[];
  optionalHave: NeedResult[];
  optionalMissing: NeedResult[];
  /** Required items held / required items in all. */
  haveCount: number;
  total: number;
  /** "You have 6 of the 8." */
  line: string;
};

export const premadeNeeds = (p: Pick<Premade, 'ingredients'>): Need[] => p.ingredients.map((i) => ({ name: i.name, ...(i.ref ? { ref: i.ref } : {}), ...(i.optional ? { optional: true } : {}) }));

/** A template's (or draft's) ingredients, as the spell builder saved them. */
export function templateNeeds(t: Pick<TemplateRow, 'metadata'> | Pick<TemplateDraft, 'ingredients'>): Need[] {
  const list: Ingredient[] =
    'ingredients' in t && Array.isArray(t.ingredients)
      ? t.ingredients
      : Array.isArray((t as TemplateRow).metadata?.ingredients)
        ? ((t as TemplateRow).metadata.ingredients as Ingredient[])
        : [];
  return list.filter((i) => i && (i.name || i.ref)).map((i) => ({ name: i.name || i.ref, ...(i.ref ? { ref: i.ref } : {}) }));
}

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** "traditional/candle/white" → { type: 'candle', key: 'white' }. */
export function parseRef(ref: string | undefined): { type: string; key: string } | null {
  const m = ref ? /^traditional\/([a-z]+)\/(.+)$/i.exec(ref) : null;
  return m ? { type: m[1].toLowerCase(), key: fold(m[2]) } : null;
}

const words = (s: string) => ` ${fold(s)} `;
const mentions = (text: string, key: string) => !!key && words(text).includes(` ${key} `);

/** Words too plain to match a thing by ("a", "candle", "small"…). */
const PLAIN = new Set(['a', 'an', 'the', 'of', 'or', 'and', 'to', 'for', 'some', 'small', 'little', 'pinch', 'handful', 'sprig', 'piece', 'bowl', 'dish', 'glass', 'cup', 'your', 'with', 'in', 'on', 'any', 'one', 'two', 'three', 'fresh', 'dried', 'optional', 'candle', 'candles', 'it', 'that', 'not', 'eat', 'keep', 'hold', 'nearby']);

function keyWords(name: string): string[] {
  return fold(name.replace(/\(.*?\)/g, ''))
    .split(' ')
    .filter((w) => w.length > 2 && !PLAIN.has(w));
}

function objectField(o: SavedObject, type: string): string {
  if (type === 'candle') return String(o.color || '');
  if (type === 'herb') return String(o.herb || '');
  if (type === 'crystal') return String(o.crystal || '');
  if (type === 'tool') return String(o.tool || '');
  if (type === 'vessel') return String(o.vessel || '');
  if (type === 'deity') return String(o.deity || '');
  return '';
}

function matchesObject(need: Need, o: SavedObject): boolean {
  const ref = parseRef(need.ref);
  const label = String(o.label || '');
  if (ref) {
    const type = String(o.type || '');
    const sameType = type === ref.type || (ref.type === 'herb' && type === 'oil');
    if (sameType && fold(objectField(o, ref.type)) === ref.key) return true;
    // A custom or renamed thing: "White Candle Taper Candle", "My rosemary".
    if (sameType && mentions(label, ref.key)) return true;
    return false;
  }
  const keys = keyWords(need.name);
  return keys.length > 0 && keys.every((k) => mentions(label, k));
}

function matchesText(need: Need, text: string): boolean {
  const ref = parseRef(need.ref);
  if (ref) return mentions(text, ref.key) && (ref.type !== 'candle' || /\bcandle/.test(fold(text)));
  const keys = keyWords(need.name);
  return keys.length > 0 && keys.every((k) => mentions(text, k));
}

/** Where one need is found. */
export function findNeed(need: Need, pantry: Pantry): { source: Source; label: string }[] {
  const out: { source: Source; label: string }[] = [];
  const ref = parseRef(need.ref);
  for (const o of pantry.objects) if (matchesObject(need, o)) out.push({ source: 'altar', label: String(o.label || need.name) });
  for (const item of pantry.apothecary ?? []) {
    const inside = item.ingredients.map((i) => i.label).join(' ');
    // A working counts when it is the thing ("Moon water") or, for herbs, holds it.
    if (matchesText(need, item.name) || (ref?.type === 'herb' && matchesText(need, inside))) out.push({ source: 'apothecary', label: item.name });
  }
  for (const item of pantry.customItems ?? []) {
    const fields = item.forms.map((f) => [f.herb, f.crystal, f.tool, f.vessel, f.color].filter(Boolean).join(' ')).join(' ');
    if (matchesText(need, `${item.name} ${fields}`) || (ref && item.forms.some((f) => fold(String((f as Record<string, unknown>)[ref.type === 'candle' ? 'color' : ref.type] ?? '')) === ref.key))) {
      out.push({ source: 'cabinet', label: item.name });
    }
  }
  if (!ref || ref.type === 'crystal') {
    for (const s of pantry.stones ?? []) {
      if ((ref && fold(String(s.key || '')) === ref.key) || matchesText(need, s.name)) out.push({ source: 'stones', label: s.name });
    }
  }
  if (!ref || ref.type === 'herb') {
    for (const p of pantry.plants ?? []) {
      if (p.goneOn) continue;
      if ((ref && fold(String(p.herb || '')) === ref.key) || matchesText(need, p.name)) out.push({ source: 'garden', label: p.name });
    }
  }
  const seen = new Set<string>();
  return out.filter((f) => (seen.has(`${f.source}:${f.label}`) ? false : (seen.add(`${f.source}:${f.label}`), true)));
}

export function checkIngredients(needs: Need[], pantry: Pantry): IngredientCheck {
  const results: NeedResult[] = needs.map((need) => {
    const found = findNeed(need, pantry);
    return { ...need, have: found.length > 0, found };
  });
  const required = results.filter((r) => !r.optional);
  const have = required.filter((r) => r.have);
  const missing = required.filter((r) => !r.have);
  return {
    have,
    missing,
    optionalHave: results.filter((r) => r.optional && r.have),
    optionalMissing: results.filter((r) => r.optional && !r.have),
    haveCount: have.length,
    total: required.length,
    line: haveLine(have.length, required.length),
  };
}

export function haveLine(have: number, total: number): string {
  if (!total) return 'Nothing to gather.';
  if (have === total) return total === 1 ? 'You have it.' : `You have all ${total}.`;
  if (have === 0) return total === 1 ? 'You’ll need to gather it.' : `You’ll need to gather all ${total}.`;
  return `You have ${have} of the ${total}.`;
}

export const SOURCE_WORDS: Record<Source, string> = {
  altar: 'on this altar',
  apothecary: 'in your apothecary',
  cabinet: 'in your cabinet',
  stones: 'among your stones',
  garden: 'in your garden',
};

/** "On this altar" / "In your garden: Rosemary by the door". */
export function foundWords(result: NeedResult): string {
  const first = result.found[0];
  if (!first) return '';
  const where = SOURCE_WORDS[first.source];
  return first.source === 'altar' ? where.charAt(0).toUpperCase() + where.slice(1) : `${where.charAt(0).toUpperCase() + where.slice(1)}: ${first.label}`;
}
