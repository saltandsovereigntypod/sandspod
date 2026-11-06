// The shared engine behind every symbol reading: the Dream reader, the tea
// and coffee-cup reading, smoke and poured wax. It finds symbols in words
// (stemmed, longest phrase first), and composes a reading that never says
// the same sentence twice and never opens two paragraphs alike. Deterministic
// (no AI): the same input always reads the same. Pure, so it can be tested.

/** A lower-case word with plurals, -ing, -ed and a silent -e folded together. */
export function stem(word: string): string {
  let w = word.toLowerCase();
  if (w.length <= 3) return w;
  if (w.endsWith('ies') && w.length > 4) w = `${w.slice(0, -3)}y`;
  else if (w.endsWith('ing') && w.length > 5) {
    w = w.slice(0, -3);
    if (/([^aeiou])\1$/.test(w) && !/(ll|ss|zz)$/.test(w)) w = w.slice(0, -1);
  } else if (w.endsWith('ed') && w.length > 4) {
    w = w.slice(0, -2);
    if (/([^aeiou])\1$/.test(w) && !/(ll|ss|zz)$/.test(w)) w = w.slice(0, -1);
  } else if (/(ss|x|ch|sh|z)es$/.test(w)) w = w.slice(0, -2);
  else if (w.endsWith('s') && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
  if (w.length > 3 && w.endsWith('e')) w = w.slice(0, -1);
  return w;
}

/** Lower-case words of a text, apostrophes tidied, "'s" dropped. */
export function tokens(text: string): string[] {
  return (text.toLowerCase().replace(/[‘’`]/g, "'").match(/[a-z0-9']+/g) ?? [])
    .map((t) => t.replace(/^'+|'+$/g, '').replace(/'s$/, ''))
    .filter(Boolean);
}

export const stems = (text: string) => tokens(text).map(stem);

/** A small stable hash, to seed a reading from what it reads. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A sentence reduced to its words, to tell whether a reading has said it already. */
export const sentenceKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** "a, b and c". */
export const joinNames = (names: string[]) => (names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);

/** Pick from a list by number, wrapping round. */
export const rotate = <T>(list: readonly T[], n: number): T => list[((n % list.length) + list.length) % list.length];

/** Capitalise the first letter. */
export const sentenceCase = (s: string) => s.replace(/^./, (c) => c.toUpperCase());

/**
 * Keeps a reading from repeating itself: `fresh` accepts a sentence once,
 * `para` joins only the sentences not yet said.
 */
export function composer() {
  const used = new Set<string>();
  const fresh = (s: string | undefined) => {
    const k = s ? sentenceKey(s) : '';
    if (!k || used.has(k)) return false;
    used.add(k);
    return true;
  };
  const para = (...parts: (string | undefined)[]) => parts.filter((p): p is string => !!p && fresh(p)).join(' ');
  return { fresh, para };
}

/**
 * Up to `max` questions taken round-robin across the symbols' pools, so each
 * symbol gets a turn, rotated by the seed and never repeating one.
 */
export function roundRobin(pools: string[][], seed: number, max: number, fresh: (s: string) => boolean): string[] {
  const out: string[] = [];
  const live = pools.filter((p) => p.length);
  const start = live.length ? seed % 3 : 0;
  for (let round = 0; round < 3 && out.length < max; round++) {
    for (const pool of live) {
      const q = pool[(round + start) % pool.length];
      if (q && out.length < max && fresh(q)) out.push(q);
    }
  }
  for (const pool of live) for (const q of pool) if (out.length < max && fresh(q)) out.push(q);
  return out;
}

/** A symbol that can be found by name or by other words for it. */
export type Findable = { id: string; name: string; words: string[] };

/**
 * Symbols whose name or words match what was typed: every typed word has to
 * match or begin a word of the symbol (so "sna" finds the snake). Best match first.
 */
export function findSymbols<T extends Findable>(symbols: readonly T[], query: string): T[] {
  const q = tokens(query);
  if (!q.length) return [...symbols];
  const score = (s: T) => {
    const hay = [s.name, ...s.words].flatMap(tokens);
    const hayStems = hay.map(stem);
    let total = 0;
    for (const t of q) {
      if (hay.includes(t) || hayStems.includes(stem(t))) total += 3;
      else if (hay.some((h) => h.startsWith(t))) total += 1;
      else return 0;
    }
    return total + (tokens(s.name)[0] === q[0] ? 2 : 0);
  };
  return symbols
    .map((s) => ({ s, n: score(s) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .map((x) => x.s);
}
