// Choosing a hidden target fairly. Uses crypto.getRandomValues where the
// device has it, else Math.random. The target is chosen before any guess is
// made. Pure apart from the source of randomness, which tests pass in.

export type Rng = () => number;

/** A uniform number in [0, 1) from crypto when available. */
export const secureRandom: Rng = () => {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } }).crypto;
  if (c?.getRandomValues) {
    const a = new Uint32Array(2);
    c.getRandomValues(a);
    // 53 bits of randomness.
    return ((a[0] >>> 5) * 67108864 + (a[1] >>> 6)) / 9007199254740992;
  }
  return Math.random();
};

/** A whole number 0 to n-1. */
export const randomInt = (n: number, rng: Rng = secureRandom): number => Math.min(n - 1, Math.floor(rng() * n));

/** One item, never one in `exclude` (unless there is nothing else to pick). */
export function pickExcluding<T>(items: readonly T[], exclude: readonly T[] = [], rng: Rng = secureRandom): T {
  const pool = items.filter((x) => !exclude.includes(x));
  const from = pool.length ? pool : items;
  return from[randomInt(from.length, rng)];
}

/** A shuffled copy (Fisher-Yates). */
export function shuffle<T>(items: readonly T[], rng: Rng = secureRandom): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** `count` different items, none in `exclude`. */
export const pickMany = <T>(items: readonly T[], count: number, exclude: readonly T[] = [], rng: Rng = secureRandom): T[] =>
  shuffle(items.filter((x) => !exclude.includes(x)), rng).slice(0, count);
