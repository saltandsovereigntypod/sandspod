// Where a settings page opens from elsewhere in the app. A settings page
// opened from Today, the Altar, the Grimoire, Rituals or Coven opens inside that
// tab (its `settings/[page]` copy), so Back returns where you were; from
// anywhere else it opens under More → Settings. Pure.

/** The settings pages that have a copy inside the other tabs. */
export const TAB_SETTINGS_PAGES = ['practice', 'deities', 'calendar', 'today', 'location', 'divination', 'notifications'] as const;
export type TabSettingsPage = (typeof TAB_SETTINGS_PAGES)[number];

const TABS = ['today', 'altar', 'grimoire', 'rituals', 'coven'] as const;

/** The tab a path is in, when it is one with settings copies. */
export function tabOf(pathname: string | null | undefined): (typeof TABS)[number] | null {
  const first = String(pathname ?? '').split('/').filter(Boolean)[0] ?? '';
  return (TABS as readonly string[]).includes(first) ? (first as (typeof TABS)[number]) : null;
}

/** The route to open a settings page from where you are now (a `usePathname()` value). */
export function settingsHref(page: TabSettingsPage, pathname?: string | null): string {
  const tab = tabOf(pathname);
  return tab ? `/${tab}/settings/${page}` : `/more/settings/${page}`;
}

export const isTabSettingsPage = (value: unknown): value is TabSettingsPage =>
  typeof value === 'string' && (TAB_SETTINGS_PAGES as readonly string[]).includes(value);

// ── What Today shows (Settings → Today) ─────────────────────────────────────

/** Today's morning prompt to write down last night's dream: on unless turned off. App and website alike. */
export const DREAM_PROMPT_KEY = 'today_dream_prompt';
export const dreamPromptOnToday = (settings: Record<string, unknown> | null | undefined) =>
  settings?.[DREAM_PROMPT_KEY] !== false && settings?.[DREAM_PROMPT_KEY] !== 'false';
