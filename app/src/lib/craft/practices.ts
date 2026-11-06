// The tools each practice gets, for the My practice screen (the Craft home). Every practice has a
// page at /rituals/craft/<practice>; its tools live under that folder.

import type { PracticeId } from '../rituals/premade/types';

/** A tool: its name, a line on it, and the app route that opens it. */
export type CraftTool = { title: string; detail: string; href: string };

/** Psychic development: its own section on My practice, with its hub at /rituals/craft/psychic. */
export const PSYCHIC_TOOLS: CraftTool[] = [
  { title: 'Warm-ups', detail: 'Grounding, opening, third-eye and aura tune-ins, before an exercise', href: '/rituals/craft/psychic/warmup' },
  { title: 'Card & colour guessing', detail: 'Symbols, suits, colours or yes and no, against a hidden target', href: '/rituals/craft/psychic/esp' },
  { title: 'Remote viewing', detail: 'Impressions of a hidden picture, then blind judging', href: '/rituals/craft/psychic/remote' },
  { title: 'Tomorrow’s card', detail: 'Guess the card of the day before it is drawn', href: '/rituals/craft/psychic/precog' },
  { title: 'Psychometry & intuition', detail: 'Impressions from your own objects, and a prompt a day', href: '/rituals/craft/psychic/psychometry' },
  { title: 'Your results', detail: 'Hit rate against chance, streaks, time of day and the moon', href: '/rituals/craft/psychic/progress' },
];

export const CRAFT_TOOLS: Record<PracticeId, CraftTool[]> = {
  green: [
    { title: 'Planting by the moon', detail: 'What to sow, tend and harvest tonight', href: '/rituals/craft/green/moon' },
    { title: 'Garden & foraging calendar', detail: 'Month by month: what to sow, gather and forage where you are, and what of yours is ready', href: '/rituals/craft/green/season' },
    { title: 'My garden', detail: 'Your plants, sowings and harvests', href: '/rituals/craft/green/garden' },
  ],
  kitchen: [
    { title: 'Pantry correspondences', detail: 'Salt, honey, cinnamon and the rest of the cupboard', href: '/rituals/craft/kitchen/pantry' },
    { title: 'Simmer pot', detail: 'A pot for your home from what you have', href: '/rituals/craft/kitchen/simmer' },
    { title: 'Home by the moon', detail: 'Which housework suits tonight', href: '/rituals/craft/kitchen/moon' },
    { title: 'Kitchen spell book', detail: 'Recipes as workings', href: '/rituals/craft/kitchen/spells' },
    { title: 'Bath & body', detail: 'Thirty bath mixes for every intention, with their safety notes, your shelves and a log', href: '/rituals/craft/bath' },
  ],
  hedge: [
    { title: 'Dream journal', detail: 'Dreams, symbols and the moon they came under', href: '/grimoire/dreams' },
    { title: 'Readings', detail: 'Cards, runes, tea leaves, scrying and pendulum', href: '/rituals/divination' },
    { title: 'Ancestors', detail: 'Your beloved dead and their days', href: '/rituals/craft/hedge/ancestors' },
  ],
  cosmic: [
    { title: 'My chart', detail: 'Your birth chart drawn and explained, and what touches it today', href: '/rituals/craft/cosmic/chart' },
    { title: 'Planetary hours', detail: 'The days and hours of the seven planets where you are', href: '/rituals/craft/cosmic/hours' },
    { title: 'Learn astrology', detail: 'A course from the very beginning, with lessons and quizzes', href: '/rituals/craft/cosmic/course' },
  ],
  crystal: [
    { title: 'My stones', detail: 'Your collection, and when each was last cleansed', href: '/rituals/craft/crystal/stones' },
    { title: 'Stone care', detail: 'Which stones are safe in water, sun and salt', href: '/rituals/craft/crystal/care' },
  ],
  elemental: [
    { title: 'Elements in your work', detail: 'The balance of earth, air, fire and water you use', href: '/rituals/craft/elemental/balance' },
    { title: 'Weather for working', detail: 'Rain, wind, storm and clear skies ahead', href: '/rituals/craft/elemental/weather' },
  ],
  sea: [
    { title: 'Tides', detail: 'High and low water, springs and neaps', href: '/rituals/craft/sea/tides' },
    { title: 'Shore finds', detail: 'Shells, sea glass, stones and driftwood', href: '/rituals/craft/sea/finds' },
  ],
  folk: [
    { title: 'Folk calendar', detail: 'Old customs through the year', href: '/rituals/craft/folk/calendar' },
    { title: 'Local lore', detail: 'Your places, spirits, stories and sayings', href: '/rituals/craft/folk/lore' },
    { title: 'Weather lore', detail: 'Old sayings for the month', href: '/rituals/craft/folk/weather' },
  ],
  solitary: [{ title: 'Daily devotion', detail: 'A morning and evening practice, gently kept', href: '/rituals/craft/solitary/devotion' }],
  eclectic: [
    { title: 'My correspondences', detail: 'Your own meanings for things, in one place', href: '/rituals/craft/eclectic/correspondences' },
    { title: 'Sigil maker', detail: 'An intent made into one mark, from its letters or a planetary square', href: '/rituals/sigil' },
  ],
};
