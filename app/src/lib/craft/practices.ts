// The tools each practice gets, for the My practice hub. Every practice has a
// page at /rituals/craft/<practice>; its tools live under that folder.

import type { PracticeId } from '../rituals/premade/types';

export type CraftTool = { title: string; detail: string };

export const CRAFT_TOOLS: Record<PracticeId, CraftTool[]> = {
  green: [
    { title: 'Planting by the moon', detail: 'What to sow, tend and harvest tonight' },
    { title: 'In season now', detail: 'Herbs to sow and gather this month where you are' },
    { title: 'My garden', detail: 'Your plants, sowings and harvests' },
  ],
  kitchen: [
    { title: 'Pantry correspondences', detail: 'Salt, honey, cinnamon and the rest of the cupboard' },
    { title: 'Simmer pot', detail: 'A pot for your home from what you have' },
    { title: 'Home by the moon', detail: 'Which housework suits tonight' },
    { title: 'Kitchen spell book', detail: 'Recipes as workings' },
  ],
  hedge: [
    { title: 'Dream journal', detail: 'Dreams, symbols and the moon they came under' },
    { title: 'Readings', detail: 'Cards, runes, tea leaves, scrying and pendulum' },
    { title: 'Ancestors', detail: 'Your beloved dead and their days' },
  ],
  cosmic: [
    { title: 'My chart', detail: 'Your birth chart drawn and explained, and what touches it today' },
    { title: 'Planetary hours', detail: 'The days and hours of the seven planets where you are' },
    { title: 'Learn astrology', detail: 'A course from the very beginning, with lessons and quizzes' },
  ],
  crystal: [
    { title: 'My stones', detail: 'Your collection, and when each was last cleansed' },
    { title: 'Stone care', detail: 'Which stones are safe in water, sun and salt' },
  ],
  elemental: [
    { title: 'Elements in your work', detail: 'The balance of earth, air, fire and water you use' },
    { title: 'Weather for working', detail: 'Rain, wind, storm and clear skies ahead' },
  ],
  sea: [
    { title: 'Tides', detail: 'High and low water, springs and neaps' },
    { title: 'Shore finds', detail: 'Shells, sea glass, stones and driftwood' },
  ],
  folk: [
    { title: 'Folk calendar', detail: 'Old customs through the year' },
    { title: 'Local lore', detail: 'Your places, spirits, stories and sayings' },
    { title: 'Weather lore', detail: 'Old sayings for the month' },
  ],
  solitary: [{ title: 'Daily devotion', detail: 'A morning and evening practice, gently kept' }],
  eclectic: [
    { title: 'My correspondences', detail: 'Your own meanings for things, in one place' },
    { title: 'Sigil maker', detail: 'An intent made into one mark, from its letters or a planetary square' },
  ],
};
