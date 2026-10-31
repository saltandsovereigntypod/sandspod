// A further paragraph for each aspect of the slower bodies, Chiron, the
// North Node and the angles (./outer.ts), and a further line of craft for
// each pair. ../aspects.ts sets the paragraph after the aspect's own and
// the craft line after the pair's magic.

import type { MajorAspect } from './types.ts';

export type PairDeeper = { magic: string } & Partial<Record<MajorAspect, string>>;
