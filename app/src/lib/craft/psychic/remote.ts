// Remote viewing: the target is a random picture from the altar art already in
// the app. You tune in and write impressions before seeing anything; then the
// target is shown with three decoys, shuffled, and you first pick which one you
// think it was (blind judging), then see the answer and rate how close your
// impressions were. Pure, so it can be tested.

import { ALTAR_ARTWORK } from '../../altar/artworkData.ts';
import { pickMany, shuffle, type Rng } from './random.ts';

export type RemotePicture = { id: string; name: string; category: string; image: string; keywords: string[] };

/** Every object in the altar art with a picture. Ids are "category:name". */
export function remotePool(): RemotePicture[] {
  const out: RemotePicture[] = [];
  for (const [category, items] of Object.entries(ALTAR_ARTWORK.items)) {
    for (const item of items) {
      const image = item.forms.find((f) => f.image)?.image;
      if (image) out.push({ id: `${category}:${item.name}`, name: item.name, category, image, keywords: item.keywords });
    }
  }
  return out;
}

export const DECOYS = 3;

/** The target and its decoys, shuffled; the target is never a repeat of a recent one, and decoys never share its name. */
export function setUpRound(pool: readonly RemotePicture[], recent: readonly string[] = [], rng?: Rng): { target: RemotePicture; choices: RemotePicture[] } {
  const fresh = pool.filter((p) => !recent.includes(p.id));
  const [target] = pickMany(fresh.length ? fresh : pool, 1, [], rng);
  const decoys = pickMany(pool.filter((p) => p.id !== target.id && p.name !== target.name), DECOYS, [], rng);
  return { target, choices: shuffle([target, ...decoys], rng) };
}

/** The chance of choosing the target among four by luck. */
export const REMOTE_CHANCE = 1 / (DECOYS + 1);

/** The prompts for writing impressions, before anything is shown. */
export const IMPRESSION_PROMPTS: { id: string; label: string; hint: string }[] = [
  { id: 'shapes', label: 'Shapes', hint: 'Round, tall, spiky, a line, a cluster' },
  { id: 'colours', label: 'Colours', hint: 'Any that come, even faint ones' },
  { id: 'textures', label: 'Textures', hint: 'Rough, smooth, soft, brittle, wet' },
  { id: 'temperature', label: 'Temperature', hint: 'Warm, cool, cold, neutral' },
  { id: 'feelings', label: 'Feelings', hint: 'How it feels to be near it' },
  { id: 'sounds', label: 'Sounds', hint: 'Anything, or silence' },
  { id: 'words', label: 'Sketch-word box', hint: 'A few free words, as if sketching it in language' },
];

export const TUNE_IN_SECONDS = 60;

export const CLOSENESS = ['', 'Nothing like it', 'A faint echo', 'Partly', 'Close', 'Very close'];
