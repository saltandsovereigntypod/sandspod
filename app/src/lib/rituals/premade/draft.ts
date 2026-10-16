// A premade working (or any rite in the same shape) as a template draft: to
// begin as a guided ritual, plan, or save as your own. Kept apart from the
// premade book so a rite can be drafted without loading every working. Pure.

import { libraryItem } from '../planner.ts';
import type { Ingredient, StepDraft, TemplateDraft } from '../types.ts';
import type { Premade } from './types.ts';

function list(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Library entries it uses, as ritual ingredients (linked from the ritual screens). */
export function premadeIngredients(p: Premade): Ingredient[] {
  const out: Ingredient[] = [];
  for (const item of p.ingredients) {
    if (!item.ref || out.some((i) => i.ref === item.ref)) continue;
    const known = libraryItem(item.ref);
    out.push({ ref: item.ref, name: known?.name ?? item.name, type: known?.type ?? item.ref.split('/')[1] ?? 'item' });
  }
  return out;
}

/** A premade working as a template draft: to begin, plan or save as your own. */
export function premadeDraft(p: Premade): TemplateDraft {
  const steps: StepDraft[] = p.steps.map((s) => ({
    id: null,
    title: s.title,
    instructions: s.instructions,
    spoken_text: s.spoken ?? '',
    minutes: s.minutes ? String(s.minutes) : '',
    completion_mode: s.timed && s.minutes ? 'timed' : 'manual',
    actions: [...(s.light ? [{ type: 'light_all', when: 'start' as const }] : []), ...(s.snuff ? [{ type: 'extinguish_all', when: 'end' as const }] : [])],
  }));
  const gather = p.ingredients.map((i) => (i.optional ? `${i.name} (optional)` : i.name));
  const preparation = [gather.length ? `Gather ${list(gather)}.` : '', p.preparation, p.safety ? `Take care: ${p.safety}` : '']
    .filter(Boolean)
    .join('\n\n');
  return {
    id: null,
    title: p.title,
    intention: p.summary,
    preparation,
    closing: p.closing,
    linked_altar_id: null,
    grimoire_page_id: null,
    steps,
    ingredients: premadeIngredients(p),
    kind: p.kind === 'spell' ? 'spell' : 'template',
  };
}
