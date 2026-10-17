// Home by the moon: the old housekeeping rhythm of drawing in while the moon
// grows and clearing out while it shrinks, with a small checklist for each
// part of the month. Ticks are kept per lunation (the month from one new
// moon to the next), so each tide starts fresh. Pure, so it can be tested.

import { moonState, upcomingPhases, type PhaseName } from '../../moon.ts';

export type HomeTide = 'waxing' | 'full' | 'waning' | 'dark';

export type HomeTask = { id: string; title: string; detail: string };

export type TideGuide = {
  tide: HomeTide;
  label: string;
  /** One line on the mood of this part of the month. */
  summary: string;
  suits: string[];
  tasks: HomeTask[];
};

export const TIDE_GUIDES: Record<HomeTide, TideGuide> = {
  waxing: {
    tide: 'waxing',
    label: 'Waxing moon',
    summary: 'The moon is growing, so the house draws in: bring new things home, start what you want to grow, cook for plenty.',
    suits: ['Bringing in new things', 'Cooking to grow', 'Planting herbs on the sill', 'Stocking the cupboard', 'Starting a ferment or a sourdough'],
    tasks: [
      { id: 'new-thing', title: 'Bring one new thing home', detail: 'A plant, a candle, a jar: welcome it at the door and give it a place.' },
      { id: 'sill-herb', title: 'Sow or pot a herb for the sill', detail: 'Basil, parsley or chives; turn the pot towards the light as the moon grows.' },
      { id: 'grow-meal', title: 'Cook a meal for plenty', detail: 'Bread, grains or eggs, stirred clockwise with what you’d like more of.' },
      { id: 'restock', title: 'Restock the pantry', detail: 'Top up the salt, the rice jar and the honey so nothing runs empty.' },
      { id: 'starter', title: 'Feed a starter or begin a ferment', detail: 'Something that grows as the moon does: sourdough, kombucha or a jar of pickles.' },
      { id: 'money-jar', title: 'Drop a coin in the house jar', detail: 'Keep a jar by the door or stove and add to it on every waxing week.' },
      { id: 'invite', title: 'Invite someone round', detail: 'A waxing house is a welcoming one; set an extra cup.' },
      { id: 'fresh-flowers', title: 'Put fresh flowers on the table', detail: 'Or a sprig from the garden: something living and opening.' },
    ],
  },
  full: {
    tide: 'full',
    label: 'Full moon',
    summary: 'The house is at its fullest. Bless it, bake, charge water and give thanks for what the month has brought.',
    suits: ['Blessing the home', 'Baking', 'Charging water', 'A shared meal', 'Gratitude'],
    tasks: [
      { id: 'moon-water', title: 'Set out moon water', detail: 'A clean, covered jar of water on the sill or doorstep overnight.' },
      { id: 'bake', title: 'Bake something round', detail: 'A loaf, a cake or a batch of biscuits, and share the first piece.' },
      { id: 'bless-rooms', title: 'Bless each room', detail: 'Walk the house with a candle or a sprinkle of water and say a word in each doorway.' },
      { id: 'bless-hearth', title: 'Bless the stove or hearth', detail: 'Wipe it clean and thank it for the meals it has cooked.' },
      { id: 'thanks-table', title: 'Say thanks at the table', detail: 'Before eating, each person names one good thing from this month.' },
      { id: 'charge-salt', title: 'Charge the salt and sugar jars', detail: 'Set them on the windowsill in the moonlight for the night.' },
      { id: 'polish', title: 'Polish something that shines', detail: 'A mirror, a window, the kettle: let it catch the moon.' },
      { id: 'offering', title: 'Leave a small offering', detail: 'A little bread, honey or milk for the house spirit; bring it in by morning.' },
    ],
  },
  waning: {
    tide: 'waning',
    label: 'Waning moon',
    summary: 'The moon is shrinking, so the house lets go: deep clean, declutter, sweep out and wash away what lingers.',
    suits: ['Deep cleaning', 'Decluttering', 'Sweeping out', 'A banishing floor wash', 'Mending and finishing'],
    tasks: [
      { id: 'sweep-out', title: 'Sweep out the front door', detail: 'Sweep from the back of the house towards the door, and out over the threshold.' },
      { id: 'floor-wash', title: 'Wash the floors', detail: 'Warm water with lemon, a little vinegar and a sprig of rosemary, worked towards the door.' },
      { id: 'declutter', title: 'Clear one drawer or shelf', detail: 'Give away, recycle or bin what you no longer use, and thank it as it goes.' },
      { id: 'fridge', title: 'Clear the fridge and cupboards', detail: 'Use up or compost what’s past its best; wipe the shelves.' },
      { id: 'cobwebs', title: 'Take down the cobwebs', detail: 'Corners, ceilings, behind the door: stale air and old dust out.' },
      { id: 'mend', title: 'Mend or finish something', detail: 'Sew the button, fix the hinge, finish the half-read book.' },
      { id: 'bins', title: 'Empty every bin', detail: 'And take the recycling out. Nothing stale stays over the dark moon.' },
      { id: 'air', title: 'Air the house', detail: 'Open the windows wide for ten minutes and let the old air go.' },
    ],
  },
  dark: {
    tide: 'dark',
    label: 'Dark & new moon',
    summary: 'The quiet before the moon returns. Rest, keep meals simple and let the house be still.',
    suits: ['Rest', 'Simple meals', 'Quiet', 'Planning for the month ahead'],
    tasks: [
      { id: 'simple-meal', title: 'Cook one simple meal', detail: 'Soup, eggs, toast: plain food, eaten slowly.' },
      { id: 'early-night', title: 'Have an early night', detail: 'Low lights after dark and no chores after supper.' },
      { id: 'candle', title: 'Light one candle and sit', detail: 'Ten minutes in the quiet house with nothing to do.' },
      { id: 'plan-month', title: 'Plan the month’s meals', detail: 'A short list of what to cook as the moon grows again.' },
      { id: 'tidy-altar', title: 'Tidy the kitchen altar or shelf', detail: 'Clear what’s finished; leave space for what’s coming.' },
      { id: 'tea', title: 'Make a pot of tea for yourself', detail: 'Chamomile or something warm, drunk sitting down.' },
      { id: 'rest-day', title: 'Leave one chore undone', detail: 'On purpose. The house can wait a day.' },
    ],
  },
};

export const TIDE_ORDER: HomeTide[] = ['waxing', 'full', 'waning', 'dark'];

/** Which part of the month it is for housework. The last sliver before new counts as dark. */
export function homeTideOf(name: PhaseName, fraction: number): HomeTide {
  if (name === 'Full Moon') return 'full';
  if (name === 'New Moon' || fraction > 0.93) return 'dark';
  return fraction < 0.5 ? 'waxing' : 'waning';
}

export const homeTide = (now: Date): HomeTide => {
  const moon = moonState(now);
  return homeTideOf(moon.name, moon.fraction);
};

const pad = (n: number) => String(n).padStart(2, '0');
export const localDateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The new moon that began this lunation, at or before `now`. */
export function lunationStart(now: Date): Date {
  const from = new Date(now.getTime() - 32 * 86_400_000);
  const news = upcomingPhases(from, 12).filter((e) => e.phase === 'new' && e.date.getTime() <= now.getTime());
  return news[news.length - 1].date;
}

/**
 * The lunation key ticks are stored under: the local date of the new moon that
 * began it. During the dark-moon nights just before the next new moon the
 * checklist still belongs to the month that's ending.
 */
export const lunationKey = (now: Date) => localDateKey(lunationStart(now));

const dayNumber = (key: string) => Math.floor(Date.parse(`${key}T00:00:00Z`) / 86_400_000);

/** Five tasks for this tide, rotated each lunation so the list doesn't go stale. */
export function tasksFor(tide: HomeTide, lunation: string, count = 5): HomeTask[] {
  const all = TIDE_GUIDES[tide].tasks;
  const start = Math.abs(dayNumber(lunation)) % all.length;
  return Array.from({ length: Math.min(count, all.length) }, (_, i) => all[(start + i) % all.length]);
}

export type TaskTicks = { lunation: string; tide: HomeTide; done: string[] };

/** Add or take away one tick. */
export function toggleTick(done: string[], id: string): string[] {
  return done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
}

/** The next new or full moon, for "next turn" on the screen. */
export function nextTurn(now: Date): { phase: 'new' | 'full'; date: Date } {
  const next = upcomingPhases(now, 4).find((e) => e.phase === 'new' || e.phase === 'full')!;
  return { phase: next.phase as 'new' | 'full', date: next.date };
}
