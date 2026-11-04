// The tab bar's two jobs that React Navigation's own bar does for free, kept
// right for our custom bar (components/TabBar.tsx).
//
// Pressing the tab you are on takes its stack back to the tab's main page.
// The stack does that itself when its main page is underneath (pop to top),
// but a tab first opened from another tab (Settings from the Altar's header,
// a link from Today) can hold just the page that was opened, with nothing
// underneath; then there is nothing to pop, and the main page has to be put
// back in its place.

import { CRAFT_HOME_ROUTE, practiceSectionOf } from './practiceSections.ts';

type TabRoute = {
  name: string;
  params?: object;
  state?: { routes: readonly { name: string }[] };
};

/**
 * The screen a focused tab's stack should be reset to when its tab is pressed,
 * or null when the stack already starts on its main page (it pops to it by
 * itself) or isn't open. Rituals has two main pages: its own and Craft's.
 * A stack opened by a link and not touched since has no state of its own yet:
 * it holds just the screen the link named (unless the link kept the main page
 * underneath, initial: false).
 */
export function tabHomeReset(route: TabRoute): string | null {
  const tab = route.name;
  const params = route.params as { screen?: unknown; initial?: unknown } | undefined;
  const root = route.state
    ? route.state.routes[0]?.name
    : typeof params?.screen === 'string' && params.initial !== false
      ? params.screen
      : undefined;
  if (!root) return null;
  const homes = tab === 'rituals' ? ['index', CRAFT_HOME_ROUTE] : ['index'];
  if (homes.includes(root)) return null;
  return tab === 'rituals' && practiceSectionOf(tab, root) === 'craft' ? CRAFT_HOME_ROUTE : 'index';
}

/** The path of a tab's main page, for a screen tabHomeReset named ('index' or Craft's home). */
export const tabHomeHref = (tab: string, home: string): string => `/${tab}${home === 'index' ? '' : `/${home.replace(/\/index$/, '')}`}`;
