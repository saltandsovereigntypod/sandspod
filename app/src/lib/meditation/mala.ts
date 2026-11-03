// The mala counter: one tap anywhere for each bead, a stronger buzz at the
// end of a round, and a long press for the guru bead, which closes the round
// where you are (by custom it isn't counted, and you turn back at it rather
// than crossing). 27, 54 or 108 beads. What you counted, and the mantra or
// chant, are kept in the log. Pure.

export const MALA_SIZES = [27, 54, 108] as const;

export type Mala = {
  /** Beads in a round. */
  size: number;
  /** Beads counted in this round so far. */
  bead: number;
  /** Rounds finished. */
  rounds: number;
  /** Every bead counted, all rounds together. */
  total: number;
  /** When the first bead was counted (ms), or null before. */
  startedAt: number | null;
};

export type MalaEvent = 'bead' | 'round' | 'guru' | 'none';

export function startMala(size: number): Mala {
  return { size: (MALA_SIZES as readonly number[]).includes(size) ? size : 108, bead: 0, rounds: 0, total: 0, startedAt: null };
}

/** A bead counted: the round closes when it's full. */
export function tapBead(m: Mala, now: number): { mala: Mala; event: MalaEvent } {
  const bead = m.bead + 1;
  const base = { ...m, total: m.total + 1, startedAt: m.startedAt ?? now };
  if (bead >= m.size) return { mala: { ...base, bead: 0, rounds: m.rounds + 1 }, event: 'round' };
  return { mala: { ...base, bead }, event: 'bead' };
}

/** The guru bead: the round is closed where it stands (if any were counted in it), and the next begins. */
export function guruBead(m: Mala): { mala: Mala; event: MalaEvent } {
  if (!m.bead) return { mala: m, event: 'none' };
  return { mala: { ...m, bead: 0, rounds: m.rounds + 1 }, event: 'guru' };
}

/** One back, for a tap made by mistake. */
export function undoBead(m: Mala): Mala {
  if (!m.total) return m;
  if (m.bead > 0) return { ...m, bead: m.bead - 1, total: m.total - 1 };
  return m.rounds ? { ...m, bead: m.size - 1, rounds: m.rounds - 1, total: m.total - 1 } : m;
}

/** "41 of 108 · 2 rounds · 257 in all". */
export function malaLine(m: Mala): string {
  const parts = [`${m.bead} of ${m.size}`];
  if (m.rounds) parts.push(`${m.rounds} ${m.rounds === 1 ? 'round' : 'rounds'}`);
  if (m.total && m.rounds) parts.push(`${m.total} in all`);
  return parts.join(' · ');
}

/** Minutes spent counting, at least 1 once begun. */
export const malaMinutes = (m: Mala, now: number) => (m.startedAt === null ? 0 : Math.max(1, Math.round((now - m.startedAt) / 60_000)));
