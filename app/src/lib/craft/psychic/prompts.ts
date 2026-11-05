// Psychometry and intuition: guided exercises with an object of your own, and a
// rotating set of intuition prompts. These are not scored; they are practice in
// noticing, and a way to compare an impression with what you know afterwards.
// Our own words. Pure.

import { ALTAR_ARTWORK } from '../../altar/artworkData.ts';

export const INTUITION_PROMPTS: string[] = [
  'Before you check your phone, say who or what will be the first thing to need your attention. Write it down, then notice.',
  'Think of a friend you have not heard from lately. What is their mood today, in one word? Ask them later if it is easy to.',
  'Sit for a minute with your eyes closed. What colour is the day, as a whole? Write it, then see how the day goes.',
  'Before you open a door, a message or a parcel, pause and say what you expect behind it.',
  'Notice a hunch about the next person to walk in or ring. Write it as plainly as you can before they do.',
  'Hold a question you do not know the answer to. Which of the first three thoughts that arrive feels quietest and clearest?',
  'Walk somewhere familiar. Before you turn a corner, say what you expect to see round it.',
  'Choose between two small things (two routes, two teas) by feel alone, then notice how each choice turned out.',
  'Pick a number from one to ten and write it down. Check it against something that happens later in the day.',
  'Tune in to your body for a minute. Where is there tension, and what is it about? Do not explain it; just record it.',
  'Look at a photo of a place you have never been. Write how it feels there before you read anything about it.',
  'Before you sleep, ask for a sign you will notice tomorrow. In the morning, write what you notice, without forcing a match.',
];

/** The prompt for a day. They turn over once a day in order, so a streak sees them all. */
export function promptFor(date: string): { index: number; text: string } {
  const [y, m, d] = date.split('-').map(Number);
  const day = Math.floor(Date.UTC(y || 1970, (m || 1) - 1, d || 1) / 86_400_000);
  const index = ((day % INTUITION_PROMPTS.length) + INTUITION_PROMPTS.length) % INTUITION_PROMPTS.length;
  return { index, text: INTUITION_PROMPTS[index] };
}

/** The steps of a psychometry session with an object. */
export const PSYCHOMETRY_STEPS: { id: string; title: string; text: string }[] = [
  { id: 'hold', title: 'Hold it', text: 'Hold the object in both hands with your eyes closed. Breathe slowly for a minute and let your attention rest in your palms. Notice weight, temperature and texture first, as plainly as a stranger would.' },
  { id: 'notice', title: 'Write what comes', text: 'Without looking it up, write what you notice: images, feelings, places, people, colours, sounds, the first words that come. Do not judge them; this is the record of what came.' },
  { id: 'compare', title: 'Then compare', text: 'Now read what is known about it. Mark what lined up with your impressions, and what did not. Remember how easy it is to find matches afterwards; the honest test is whether you wrote it first.' },
];

/** What the app knows about an object by name: its Library page id (from a shelf item's ref) and a few keywords from the altar art. */
export function knownAbout(name: string, ref = ''): { libraryId: string | null; keywords: string[] } {
  const libraryId = /^traditional\/[^/]+\/[^/]+$/.test(ref) ? ref.replace('traditional/', 'traditional:').replace('/', ':') : null;
  const lower = name.trim().toLowerCase();
  for (const items of Object.values(ALTAR_ARTWORK.items)) {
    const hit = items.find((i) => i.name.toLowerCase() === lower);
    if (hit) return { libraryId, keywords: hit.keywords.slice(0, 8) };
  }
  return { libraryId, keywords: [] };
}
