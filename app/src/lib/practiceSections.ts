// The Practice tab's three sections: Grimoire (your book and the Living
// Library), Rituals (ritual work: doing it, learning it and recording it) and
// Craft (the tools that aren't rituals: Cycle & Moon, astrology, divination,
// the sigil maker and the tools for each path). Pure, so it can be tested.
//
// Grimoire is its own tab route. Rituals and Craft share the Rituals route and
// its stack, so every old address (/rituals/cycle, /rituals/divination,
// /rituals/craft/cosmic …) keeps working and Back keeps its history; which
// section a Rituals-stack screen belongs to is read from its route. The
// website's js/site-nav.js practiceSection() sorts its pages the same way.

export type PracticeSection = 'grimoire' | 'rituals' | 'craft';

export const PRACTICE_SECTIONS: readonly { key: PracticeSection; label: string; href: string }[] = [
  { key: 'grimoire', label: 'Grimoire', href: '/grimoire' },
  { key: 'rituals', label: 'Rituals', href: '/rituals' },
  { key: 'craft', label: 'Craft', href: '/rituals/craft' },
];

/** The Rituals-stack screens (by their first path segment) that belong to Craft. */
export const CRAFT_ROUTES: readonly string[] = ['craft', 'cycle', 'divination', 'sigil'];

/** The Craft home's route name in the Rituals stack, for opening it directly. */
export const CRAFT_HOME_ROUTE = 'craft/index';

/** A stored section name, if it is one. */
export function asPracticeSection(value: unknown): PracticeSection | null {
  return value === 'grimoire' || value === 'rituals' || value === 'craft' ? value : null;
}

/**
 * Which section a screen is in, from the tab route ('grimoire', 'rituals' …)
 * and, for Rituals, the screen open in its stack ('craft/cosmic/index',
 * 'cycle/index', 'sigil', or a path such as '/rituals/cycle/log'). Null when
 * the tab isn't Practice.
 */
export function practiceSectionOf(tabRoute: string | undefined, screen?: string | null): PracticeSection | null {
  if (tabRoute === 'grimoire') return 'grimoire';
  if (tabRoute !== 'rituals') return null;
  const first = String(screen ?? '')
    .replace(/^\/?(rituals\/)?/, '')
    .split(/[/?#]/)[0];
  return CRAFT_ROUTES.includes(first) ? 'craft' : 'rituals';
}

/** The tab route that holds a section. */
export const practiceTabRoute = (section: PracticeSection): 'grimoire' | 'rituals' => (section === 'grimoire' ? 'grimoire' : 'rituals');
