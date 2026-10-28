// Mundane mode is one choice, kept with your settings (`default_mundane_mode`,
// synced like the rest) and changed by the switch in the Grimoire's header.
// Older versions kept the header switch's choice on the phone alone
// (`saltAndSovereigntyMundaneMode`), where it overrode the setting. That
// choice is carried into the setting once, then the phone's copy is
// cleared: read the old, write the new. Pure.

export type MundaneMigration = {
  /** What mundane mode is now. */
  value: boolean;
  /** Save `value` as the setting (it differs from what is saved). */
  save: boolean;
  /** Clear the phone's old copy. */
  clear: boolean;
};

/**
 * `stored` is the phone's old value ('true', 'false', or null when there is
 * none); `setting` the saved `default_mundane_mode`.
 */
export function migrateMundane(stored: string | null | undefined, setting: boolean): MundaneMigration {
  if (stored === 'true' || stored === 'false') {
    const value = stored === 'true';
    return { value, save: value !== setting, clear: true };
  }
  // Anything else on the phone (unreadable) is cleared and the setting stands.
  return { value: setting, save: false, clear: stored != null };
}
