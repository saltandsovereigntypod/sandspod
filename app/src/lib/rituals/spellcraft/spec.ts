// What the spell builder keeps: a spell's choices (what it's for, its form,
// what goes in, who it honours, when, the words and any steps of your own),
// saved inside the ritual template's metadata as `spell`, so the template
// still runs, plans and shares as before and the builder can open it again.
//
// Spells kept before the builder knew any of this (a template with
// metadata.kind 'spell' and nothing else) are read forward by specFromTemplate:
// their own steps are kept exactly, so nothing anyone saved is lost. Pure.

import type { MoonTide } from '../planner.ts';
import type { Ingredient, StepDraft, TemplateDraft, TemplateRow } from '../types.ts';

export const SPELL_VERSION = 2;

export type SpellMethodKey =
  | 'candle'
  | 'jar'
  | 'sachet'
  | 'charm_bag'
  | 'oil'
  | 'knot'
  | 'sigil'
  | 'petition'
  | 'poppet'
  | 'bath'
  | 'powder'
  | 'simmer'
  | 'own';

export const METHOD_KEYS: SpellMethodKey[] = ['candle', 'jar', 'sachet', 'charm_bag', 'oil', 'knot', 'sigil', 'petition', 'poppet', 'bath', 'powder', 'simmer', 'own'];

/** A Living Library deity the spell honours: its key ("hekate") and name. */
export type SpellDeity = { key: string; name: string };

export type SpellSpec = {
  version: typeof SPELL_VERSION;
  /** The timing advisor's intent key (lib/craft/cosmic/timing.ts), or null. */
  intent: string | null;
  /** The purpose in the person's own words. */
  purpose: string;
  method: SpellMethodKey;
  /** Candles, herbs, stones and things of your own, by Library ref ("custom/…" for your own). */
  ingredients: Ingredient[];
  deities: SpellDeity[];
  /** The planet whose day (and hour) it's meant for, or null. */
  planet: string | null;
  /** The moon it's meant for, or null. */
  moon: MoonTide | null;
  /** The words, chant or petition, as written. */
  words: string;
  /** Minutes to sit with the working; blank for none. */
  focusMinutes: string;
  /** The spell's name; blank for "Love spell" and so on. */
  name: string;
  /** Notes of your own, kept with the spell. */
  notes: string;
  /** Your own steps, or null to follow the form's steps as the choices change. */
  steps: StepDraft[] | null;
  /** The altar it belongs to (ritual_templates.linked_altar_id). */
  altarId: string | null;
};

export function blankSpec(intent: string | null = null, method: SpellMethodKey = 'candle'): SpellSpec {
  return {
    version: SPELL_VERSION,
    intent,
    purpose: '',
    method,
    ingredients: [],
    deities: [],
    planet: null,
    moon: null,
    words: '',
    focusMinutes: '10',
    name: '',
    notes: '',
    steps: null,
    altarId: null,
  };
}

const str = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');
const TIDES: MoonTide[] = ['new', 'waxing', 'full', 'waning'];

export const isMethod = (v: unknown): v is SpellMethodKey => typeof v === 'string' && (METHOD_KEYS as string[]).includes(v);

function cleanIngredients(v: unknown): Ingredient[] {
  if (!Array.isArray(v)) return [];
  const out: Ingredient[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const name = str(r.name).trim();
    const ref = str(r.ref).trim() || (name ? `own/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '');
    if (!name && !ref) continue;
    if (out.some((i) => i.ref === ref)) continue;
    out.push({ ref, name: name || ref, type: str(r.type) || 'item' });
  }
  return out;
}

function cleanSteps(v: unknown): StepDraft[] | null {
  if (!Array.isArray(v)) return null;
  return v
    .filter((s) => s && typeof s === 'object')
    .map((raw) => {
      const s = raw as Record<string, unknown>;
      const minutes = str(s.minutes);
      return {
        id: null,
        title: str(s.title),
        instructions: str(s.instructions),
        spoken_text: str(s.spoken_text),
        minutes,
        completion_mode: s.completion_mode === 'timed' && minutes ? 'timed' : 'manual',
        actions: Array.isArray(s.actions) ? (s.actions as StepDraft['actions']).filter((a) => a && typeof a.type === 'string') : [],
      };
    });
}

/**
 * Any stored spell (this version, an older one, or something half-written by
 * hand) as a whole SpellSpec. Unknown fields are dropped; nothing throws.
 */
export function migrateSpec(raw: unknown): SpellSpec {
  const spec = blankSpec();
  if (!raw || typeof raw !== 'object') return spec;
  const r = raw as Record<string, unknown>;
  const deities = Array.isArray(r.deities)
    ? (r.deities as unknown[])
        .filter((d): d is Record<string, unknown> => !!d && typeof d === 'object')
        .map((d) => ({ key: str(d.key), name: str(d.name) || str(d.key) }))
        .filter((d) => d.key || d.name)
    : [];
  return {
    ...spec,
    intent: str(r.intent) || null,
    purpose: str(r.purpose),
    method: isMethod(r.method) ? r.method : 'candle',
    ingredients: cleanIngredients(r.ingredients),
    deities,
    planet: str(r.planet) || null,
    moon: TIDES.includes(r.moon as MoonTide) ? (r.moon as MoonTide) : null,
    words: str(r.words ?? r.petition),
    focusMinutes: r.focusMinutes === undefined ? spec.focusMinutes : str(r.focusMinutes),
    name: str(r.name),
    notes: str(r.notes),
    steps: cleanSteps(r.steps),
    altarId: str(r.altarId) || null,
  };
}

/** Two step lists say and do the same. */
export function sameSteps(a: StepDraft[], b: StepDraft[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((s, i) => {
    const t = b[i];
    return (
      s.title.trim() === t.title.trim() &&
      s.instructions.trim() === t.instructions.trim() &&
      s.spoken_text.trim() === t.spoken_text.trim() &&
      String(s.minutes || '') === String(t.minutes || '')
    );
  });
}

/** The ritual planner's intention labels and keys, for reading an old spell's intention line back. */
export type IntentLookup = (text: string) => string | null;

/**
 * A spell saved as a draft (a plan's draft, a hand-off, or the template
 * editor's draft) read into the builder. With no `spell` inside, it's an older
 * spell: its steps are kept as your own steps, word for word.
 */
export function specFromDraft(draft: TemplateDraft, lookup: IntentLookup = () => null): SpellSpec {
  if (draft.spell) {
    const spec = migrateSpec(draft.spell);
    return {
      ...spec,
      name: draft.title || spec.name,
      ingredients: draft.ingredients.length ? cleanIngredients(draft.ingredients) : spec.ingredients,
      altarId: draft.linked_altar_id ?? spec.altarId,
    };
  }
  // An older spell: the builder always made a candle working.
  const spoken = draft.steps.find((s) => s.spoken_text.trim());
  const sit = draft.steps.find((s) => /^sit with/i.test(s.title.trim()));
  const intent = lookup(draft.intention);
  return {
    ...blankSpec(intent, 'candle'),
    purpose: intent ? '' : draft.intention,
    name: draft.title,
    ingredients: cleanIngredients(draft.ingredients),
    words: spoken?.spoken_text ?? '',
    focusMinutes: sit ? sit.minutes : '',
    steps: draft.steps.map((s) => ({ ...s, id: null })),
    altarId: draft.linked_altar_id,
  };
}

/** A saved template read into the builder (see specFromDraft). Steps changed elsewhere are kept as your own. */
export function specFromTemplate(
  template: TemplateRow,
  generated: (spec: SpellSpec) => StepDraft[],
  lookup: IntentLookup = () => null,
): SpellSpec {
  const steps: StepDraft[] = [...(template.ritual_template_steps ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => ({
      id: null,
      title: s.title ?? '',
      instructions: s.instructions ?? '',
      spoken_text: s.spoken_text ?? '',
      minutes: s.duration_seconds ? String(Math.round(s.duration_seconds / 60)) : '',
      completion_mode: s.completion_mode === 'timed' ? 'timed' : 'manual',
      actions: Array.isArray(s.actions) ? s.actions : [],
    }));
  const meta = template.metadata ?? {};
  const ingredients = Array.isArray(meta.ingredients) ? (meta.ingredients as Ingredient[]) : [];
  const draftLike: TemplateDraft = {
    id: template.id,
    title: template.title ?? '',
    intention: template.intention ?? '',
    preparation: template.preparation ?? '',
    closing: template.closing ?? '',
    linked_altar_id: template.linked_altar_id ?? null,
    grimoire_page_id: template.grimoire_page_id ?? null,
    steps,
    ingredients,
    kind: 'spell',
    spell: meta.spell && typeof meta.spell === 'object' ? (meta.spell as Record<string, unknown>) : null,
  };
  const spec = specFromDraft(draftLike, lookup);
  // Steps changed in the template editor (or on the website) win over the form's.
  if (draftLike.spell && steps.length && !sameSteps(steps, spec.steps ?? generated(spec))) return { ...spec, steps };
  return spec;
}
