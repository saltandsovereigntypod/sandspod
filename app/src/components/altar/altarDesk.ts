// What the altar lends to the panel over it (a coven altar's Ritual tab,
// components/covens/AltarRitual.tsx), so a live ritual's step is done here
// without leaving: place a step's item as the cabinet does, begin a deed with
// the altar's own handlers ("Cast it for me"), make a deed count as your Done
// whenever you do it on the altar, light up what to tap, write a petition
// onto the altar, and the altar's latest word (a card drawn, the pendulum's
// answer). Given by AltarEditor around its `overlay`.

import { createContext, useContext } from 'react';

import type { PetitionInput } from '../../lib/altar/petitions';
import type { CabinetForm, CabinetItem } from '../../lib/altar/types';
import type { AltarDeed } from '../../lib/covens/altarActions';

/** A deed waiting to count: `key` is the step (and turn) it is for, so it counts once. */
export type ArmedDeed = { kind: AltarDeed; key: string; onDone: () => void };

export type AltarDesk = {
  cabinet: CabinetItem[];
  overrides: Record<string, string>;
  place: (item: CabinetItem, form: CabinetForm) => boolean;
  /** Begin the deed with the altar's own handler (opens its sheet, finds its tool, or does it for you). */
  start: (kind: AltarDeed) => void;
  /** Doing this deed on the altar, any way, counts (null: nothing waits). */
  arm: (deed: ArmedDeed | null) => void;
  /** What glows: a deed's target, a candle-gazing sit's lit candle, or nothing. */
  glow: (kind: AltarDeed | 'gaze' | null) => void;
  writePetition: (input: PetitionInput) => Promise<void>;
  /** Whether a petition can be written here (the altar is saved). */
  canWrite: boolean;
  notice: string | null;
  canEdit: boolean;
};

export const AltarDeskContext = createContext<AltarDesk | null>(null);

export const useAltarDesk = () => useContext(AltarDeskContext);
