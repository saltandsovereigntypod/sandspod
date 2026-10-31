// A further paragraph for a house reading's Detailed text and a further
// line for its craft text, one pair per house, first house first.

import type { Interpretation } from '../types.ts';

export type HouseDeeper = [detailed: string, magic: string][];

/** Join a further paragraph and craft line onto a written reading. */
export const deepen = (r: Interpretation, extra?: [string, string]): Interpretation =>
  extra ? { ...r, detailed: `${r.detailed}\n\n${extra[0]}`, magic: `${r.magic} ${extra[1]}` } : r;
