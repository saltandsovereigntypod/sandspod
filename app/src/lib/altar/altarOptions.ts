// An altar's own options, kept per altar in the synced craft collection
// `altar.options` (one entry per altar, carrying its altarId), so the altar's
// saved data itself stays exactly as the website writes it. Pure.

export const ALTAR_OPTIONS = 'altar.options';

export type AltarOptions = {
  altarId: string;
  /** The stage's light follows the real sunrise, sunset and season. */
  sky: boolean;
  /** A small window shows tonight's real moon. */
  moonWindow: boolean;
  /** Crystals and moon water are charged under New Moons too, not only Full Moons. */
  newMoonCharging: boolean;
};

export const defaultAltarOptions = (altarId: string): AltarOptions => ({ altarId, sky: true, moonWindow: true, newMoonCharging: false });

/** This altar's options (the defaults when none are saved), and the entry they're saved in. */
export function altarOptionsFor<T extends { id: string; data: Partial<AltarOptions> }>(entries: T[], altarId: string): { options: AltarOptions; entryId: string | null } {
  const hit = entries.find((e) => e.data && e.data.altarId === altarId);
  const base = defaultAltarOptions(altarId);
  if (!hit) return { options: base, entryId: null };
  const d = hit.data;
  return {
    options: {
      altarId,
      sky: typeof d.sky === 'boolean' ? d.sky : base.sky,
      moonWindow: typeof d.moonWindow === 'boolean' ? d.moonWindow : base.moonWindow,
      newMoonCharging: typeof d.newMoonCharging === 'boolean' ? d.newMoonCharging : base.newMoonCharging,
    },
    entryId: hit.id,
  };
}
