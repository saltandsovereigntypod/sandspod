// The two tabs at the top of Today (Today | Sky & Lore) and of Coven (My
// covens | Find a coven): their names, which tab a link to a section lands
// on, and which opens first. Pure, and shared with the website (as
// SaltCore.today.screenTabs and SaltCore.covens.screenTabs), which keeps
// the same tabs under the same storage keys.

export type TodayTab = 'today' | 'sky';
export type CovenTab = 'mine' | 'find';

export const TODAY_TABS: readonly { key: TodayTab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'sky', label: 'Sky & Lore' },
];

export const COVEN_TABS: readonly { key: CovenTab; label: string }[] = [
  { key: 'mine', label: 'My covens' },
  { key: 'find', label: 'Find a coven' },
];

/** Where the last tab used is kept on the device (AsyncStorage in the app, localStorage on the website). */
export const TODAY_TAB_KEY = 'saltTodayTab';
export const COVEN_TAB_KEY = 'saltCovenTab';

/**
 * Today's sections, by the names links use for them (`/today?section=moon`,
 * or `#moon` on the website), and the tab that holds each.
 */
export const TODAY_SECTIONS: Readonly<Record<string, TodayTab>> = {
  moon: 'today',
  holiday: 'today',
  reminders: 'today',
  working: 'today',
  covens: 'today',
  tend: 'today',
  'look-back': 'today',
  'did-it-work': 'today',
  dream: 'today',
  deipnon: 'today',
  card: 'today',
  altar: 'today',
  reflect: 'today',
  sky: 'sky',
  hours: 'sky',
  correspondences: 'sky',
  horizon: 'sky',
  practice: 'sky',
};

const first = (value: unknown): string => (Array.isArray(value) ? String(value[0] ?? '') : typeof value === 'string' ? value : '');

/** A stored or linked tab name, if it is one of these tabs. */
export function asTodayTab(value: unknown): TodayTab | null {
  const v = first(value);
  return v === 'today' || v === 'sky' ? v : null;
}

export function asCovenTab(value: unknown): CovenTab | null {
  const v = first(value);
  return v === 'mine' || v === 'find' ? v : null;
}

/**
 * The Today tab a link asks for: `tab` by name, or the tab holding `section`
 * (a section name, with or without a leading "#"). Null when it names neither.
 */
export function todayTabFor(link: { tab?: unknown; section?: unknown }): TodayTab | null {
  const tab = asTodayTab(link.tab);
  if (tab) return tab;
  const section = first(link.section).replace(/^#/, '').toLowerCase();
  return (section && Object.prototype.hasOwnProperty.call(TODAY_SECTIONS, section) && TODAY_SECTIONS[section]) || null;
}

/**
 * Which Coven tab opens: the one asked for by a link, else the one used last
 * on this device, else My covens when you belong to at least one coven and
 * Find a coven when you belong to none (or aren't signed in). While your
 * covens are still loading (`covenCount` null) it opens My covens for someone
 * signed in, so the list doesn't jump.
 */
export function covenTabFor({ linked, remembered, signedIn, covenCount }: { linked?: unknown; remembered?: unknown; signedIn: boolean; covenCount: number | null }): CovenTab {
  const asked = asCovenTab(linked) ?? asCovenTab(remembered);
  if (asked) return asked;
  if (!signedIn) return 'find';
  if (covenCount === null) return 'mine';
  return covenCount > 0 ? 'mine' : 'find';
}
