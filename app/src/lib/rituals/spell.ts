// The spell builder: an intention, a few Library ingredients and your own
// words become a ritual template with steps, ready to begin, plan or save.

import type { LibraryItem } from './libraryData.ts';
import type { Intention } from './planner.ts';
import type { Ingredient, StepDraft, TemplateDraft } from './types.ts';

export function toIngredient(item: LibraryItem): Ingredient {
  return { ref: item.ref, name: item.name, type: item.type };
}

function list(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function step(title: string, instructions: string, extra: Partial<StepDraft> = {}): StepDraft {
  return { id: null, title, instructions, spoken_text: '', minutes: '', completion_mode: 'manual', actions: [], ...extra };
}

export type SpellInput = {
  name: string;
  intention: Intention | null;
  /** The practitioner's own purpose, in their words. */
  purpose: string;
  petition: string;
  ingredients: Ingredient[];
  /** Minutes to sit with the working; blank for none. */
  focusMinutes: string;
};

export function defaultSpellName(intention: Intention | null): string {
  return intention ? `${intention.label} spell` : 'My spell';
}

/** Steps follow the website's candle-magic guidance: cleanse, dress, speak, sit, close. */
export function buildSpell(input: SpellInput): TemplateDraft {
  const candles = input.ingredients.filter((i) => i.type === 'candle').map((i) => i.name.replace(/ Candle$/, '').toLowerCase());
  const herbs = input.ingredients.filter((i) => i.type === 'herb').map((i) => i.name.toLowerCase());
  const crystals = input.ingredients.filter((i) => i.type === 'crystal').map((i) => i.name.toLowerCase());
  const others = input.ingredients.filter((i) => !['candle', 'herb', 'crystal'].includes(i.type)).map((i) => i.name);
  const purpose = input.purpose.trim() || input.intention?.label.toLowerCase() || 'your intention';

  const candle = candles.length ? `${list(candles)} candle${candles.length > 1 ? 's' : ''}` : 'a candle';
  const steps: StepDraft[] = [
    step('Cleanse and open the space', 'Clear your altar, breathe slowly, and mark the edges of your working however you usually do.'),
  ];

  const gather = [
    herbs.length ? `Dress ${candle} with ${list(herbs)}, drawing toward you to invite or away from you to release.` : `Hold ${candle} and fill it with your purpose.`,
    crystals.length ? `Set ${list(crystals)} around it.` : '',
    others.length ? `Place ${list(others)} on the altar.` : '',
  ]
    .filter(Boolean)
    .join(' ');
  steps.push(step('Prepare the candle', gather));

  steps.push(
    step('Light the flame and speak', `Light ${candle} and say your words for ${purpose}.`, {
      spoken_text: input.petition.trim(),
      actions: [{ type: 'light_all', when: 'start' }],
    }),
  );

  const focusMinutes = input.focusMinutes.trim();
  steps.push(
    step(
      'Sit with the working',
      'Watch the flame and hold your intention. Notice what you feel and anything that stands out.',
      focusMinutes ? { minutes: focusMinutes, completion_mode: 'timed' } : {},
    ),
  );
  steps.push(
    step('Close and give thanks', 'Thank anything you called on, ground yourself, and snuff or safely tend the flame.', {
      actions: [{ type: 'extinguish_all', when: 'end' }],
    }),
  );

  const gatherList = input.ingredients.map((i) => i.name);
  return {
    id: null,
    title: input.name.trim() || defaultSpellName(input.intention),
    intention: input.purpose.trim() || input.intention?.label || '',
    preparation: gatherList.length ? `Gather ${list(gatherList)}.` : '',
    closing: 'Record what you noticed in your ritual journal.',
    linked_altar_id: null,
    grimoire_page_id: null,
    steps,
    ingredients: input.ingredients,
    kind: 'spell',
  };
}
