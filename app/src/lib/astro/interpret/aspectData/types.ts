// The seed each pair of bodies is written from (see ../aspects.ts): what the
// two do together, how to work with them, and, for each major aspect that
// can happen between them, a simple line and a detailed paragraph of its own.

export type MajorAspect = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export const MAJOR_ASPECTS: MajorAspect[] = ['conjunction', 'sextile', 'square', 'trine', 'opposition'];

export type PairSeed = {
  /** What the two bodies are about together, whatever the aspect: a sentence or two. */
  core: string;
  /** Their shared magic: correspondences, timing, workings. */
  magic: string;
} & Partial<Record<MajorAspect, [simple: string, detailed: string]>>;
