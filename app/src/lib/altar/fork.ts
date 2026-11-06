// The tuning fork on the altar (a cabinet Tool): tap it to strike a fork,
// choosing which (lib/meditation/forks.ts: Solfeggio, Cosmic Octave, chakra,
// weighted 128 Hz, pairs). Striking is something you do on purpose, under
// Candle sounds in Accessibility, as the bell is. A crystal can also be
// cleared with the 4096 Hz fork, kept in the stone's cleansing history
// beside smoke, sound and moonlight. The 4096 Hz crystal fork is a modern
// practice. The cabinet's picture is borrowed from the wand until one is
// painted. Pure.

import type { CareInput } from './devotion.ts';
import type { SavedObject } from './types.ts';

export const isTuningFork = (o: Pick<SavedObject, 'type' | 'tool'> | null | undefined) => !!o && o.type === 'tool' && o.tool === 'tuning-fork';

export const STRIKE_FORK_LABEL = 'Strike the fork';
export const CLEAR_FORK_LABEL = 'Clear with a tuning fork (4096 Hz)';
export const FORK_SOUND_OFF = 'Candle sounds are off in Accessibility, so the fork rings silently here.';
export const CLEAR_FORK_NOTE = 'Hold the high fork near the stone and let it ring out. Clearing stones with a 4096 Hz fork is modern crystal practice, and sound is safe for every stone.';
export const clearedLine = (name: string) => `${name} was cleared with a tuning fork (4096 Hz).`;

/** The cleansing kept on a stone cleared with the fork. */
export function forkClearCare(hasIntention: boolean, now: string): CareInput {
  return {
    decision: hasIntention ? 'Keep all current intentions' : 'General energetic cleansing',
    purpose: 'General cleansing',
    methods: ['Sound', 'Tuning fork (4096 Hz)'],
    supports: [],
    notes: 'Cleared on the altar with a 4096 Hz tuning fork.',
    occurredAt: now,
  };
}
