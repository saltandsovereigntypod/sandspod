// Hearth & land on Today: one seasonal nudge for anyone who keeps the green,
// kitchen or folk practices. A festival of your calendars that's near and has
// a recipe comes first ("Samhain tomorrow: soul cakes"); otherwise what's in
// season to gather where you are, with the first rule of foraging beside it.
// Pure: the place and calendar choice come in.

import type { Place } from '../../astro/rise.ts';
import type { HolidayChoice } from '../../holidays.ts';
import type { PracticeId } from '../../rituals/premade/types.ts';
import { hemisphereOf } from '../green/season.ts';
import { forageInMonth } from './forage.ts';
import { festivalFoodsAhead } from './recipes.ts';

export const HEARTH_HOME = '/rituals/craft/hearth';
export const HEARTH_PRACTICES: PracticeId[] = ['green', 'kitchen', 'folk'];

export type HearthLine = { label: string; line: string; detail?: string; href: string };

const when = (inDays: number) => (inDays <= 0 ? 'today' : inDays === 1 ? 'tomorrow' : `in ${inDays} days`);

/** Today's Hearth & land line, or null when none of its practices are kept. */
export function hearthToday(practices: PracticeId[], now: Date, ctx: { place: Place | null; choice: HolidayChoice }): HearthLine | null {
  if (!practices.some((p) => HEARTH_PRACTICES.includes(p))) return null;
  const feast = festivalFoodsAhead(now, ctx.choice, 7)[0];
  if (feast) {
    const recipe = feast.recipes[0];
    return {
      label: 'Hearth & land',
      line: `${feast.name} ${when(feast.inDays)}: ${recipe.recipe.title.toLowerCase()}`,
      detail: 'A recipe for the festival, to cook with intent and share.',
      href: `${HEARTH_HOME}/recipes/recipe?id=${encodeURIComponent(recipe.id)}`,
    };
  }
  const gather = forageInMonth(now.getMonth() + 1, hemisphereOf(ctx.place?.latitude)).map((p) => p.name.replace(/ \(.*\)$/, '').toLowerCase());
  if (gather.length) {
    return {
      label: 'Hearth & land',
      line: `In the hedgerow now: ${gather.slice(0, 3).join(', ')}`,
      detail: 'Gather only what you know for certain, and take a little.',
      href: `${HEARTH_HOME}/forage`,
    };
  }
  return { label: 'Hearth & land', line: 'Note what the land is doing today', detail: 'Your land journal keeps the weather, the frosts and the first birdsong.', href: `${HEARTH_HOME}/land` };
}
