// Card and colour guessing: a hidden target is chosen first, then you guess,
// then it's revealed. Four modes, each with its own chance of a hit by luck.
// Pure, so it can be tested.

import { pickExcluding, type Rng } from './random.ts';

export type EspMode = 'symbols' | 'suits' | 'colours' | 'yesno';

export type EspOption = { id: string; label: string; colour?: string };

export const ESP_MODES: { id: EspMode; label: string; detail: string; options: EspOption[] }[] = [
  {
    id: 'symbols',
    label: 'Five symbols',
    detail: 'The classic five: circle, cross, waves, square, star. One in five by chance.',
    options: [
      { id: 'circle', label: 'Circle' },
      { id: 'cross', label: 'Cross' },
      { id: 'waves', label: 'Waves' },
      { id: 'square', label: 'Square' },
      { id: 'star', label: 'Star' },
    ],
  },
  {
    id: 'suits',
    label: 'Tarot suits',
    detail: 'Wands, cups, swords or pentacles. One in four by chance.',
    options: [
      { id: 'wands', label: 'Wands' },
      { id: 'cups', label: 'Cups' },
      { id: 'swords', label: 'Swords' },
      { id: 'pentacles', label: 'Pentacles' },
    ],
  },
  {
    id: 'colours',
    label: 'Six colours',
    detail: 'Red, orange, yellow, green, blue or violet. One in six by chance.',
    options: [
      { id: 'red', label: 'Red', colour: '#b8433a' },
      { id: 'orange', label: 'Orange', colour: '#d9822b' },
      { id: 'yellow', label: 'Yellow', colour: '#d8b93a' },
      { id: 'green', label: 'Green', colour: '#4f8a55' },
      { id: 'blue', label: 'Blue', colour: '#3f6fa8' },
      { id: 'violet', label: 'Violet', colour: '#7a55a3' },
    ],
  },
  {
    id: 'yesno',
    label: 'Yes or no',
    detail: 'Half the time it is yes. One in two by chance.',
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
  },
];

export const RUN_LENGTHS = [10, 25] as const;

export const espMode = (id: unknown) => ESP_MODES.find((m) => m.id === id) ?? ESP_MODES[0];

/** The chance of a hit on one trial by luck alone. */
export const espChance = (mode: EspMode) => 1 / espMode(mode).options.length;

/** Choose the hidden target for the next trial. Repeats are part of a fair draw, so they are allowed, but never a third in a row. */
export function nextTarget(mode: EspMode, history: readonly string[], rng?: Rng): string {
  const ids = espMode(mode).options.map((o) => o.id);
  const n = history.length;
  const last = history[n - 1];
  const third = n >= 2 && history[n - 2] === last;
  return pickExcluding(ids, third && last ? [last] : [], rng);
}

export type Trial = { target: string; guess: string };

export const isHit = (t: Trial) => t.target === t.guess;

export const scoreRun = (trials: readonly Trial[]) => ({ trials: trials.length, hits: trials.filter(isHit).length });
