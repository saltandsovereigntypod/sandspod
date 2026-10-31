// The coven's tradition (covens.course_tradition, 20261119000000_coven_tradition.sql):
// one of the course sets (COURSE_TRADITIONS), chosen by those who manage the
// coven on its Practice calendar page. It puts the matching course set first
// in the ready-made programs, the matching holiday calendars first on the
// Practice calendar page, and, for its members, the matching premade rituals
// and spells (Workings library, "For you tonight") and the matching calendars
// (Settings → Calendars, "Also show") before the rest. It only orders what is
// suggested: nothing is hidden or chosen for anyone. Pure; shared by the app
// and the website (SaltCore.covens.covenTradition).

// Free of the courses themselves (which the app fetches only when designing
// programs): the ids are COURSE_TRADITIONS' (courses/index.ts), and a test
// keeps the two lists the same.

/** The choices, in the course sets' order, with the eclectic Wheel said plainly. */
export const COVEN_TRADITIONS: { id: string; name: string }[] = [
  { id: 'hellenic', name: 'Hellenic' },
  { id: 'wheel', name: 'Eclectic (Wheel of the Year)' },
  { id: 'wheel_south', name: 'Eclectic (Wheel of the Year, Southern Hemisphere)' },
  { id: 'wicca', name: 'Wiccan' },
  { id: 'wicca_south', name: 'Wiccan (Southern Hemisphere)' },
  { id: 'celtic', name: 'Celtic' },
  { id: 'norse', name: 'Norse & Heathen' },
];

/** A saved value read safely: a known tradition's id, or null. */
export function covenTraditionOf(value: unknown): string | null {
  return typeof value === 'string' && COVEN_TRADITIONS.some((t) => t.id === value) ? value : null;
}

export const covenTraditionName = (id: string | null | undefined): string => COVEN_TRADITIONS.find((t) => t.id === id)?.name ?? '';

/** The holiday calendars (holidays.ts TRADITIONS ids) that suit a tradition. Wicca keeps the Wheel's festivals. */
export function calendarsForTradition(id: string | null | undefined): string[] {
  switch (id) {
    case 'wheel':
    case 'wicca':
      return ['wheel'];
    case 'wheel_south':
    case 'wicca_south':
      return ['wheel_south'];
    case 'hellenic':
      return ['hellenic', 'hellenic_monthly'];
    case 'celtic':
      return ['celtic'];
    case 'norse':
      return ['norse'];
    default:
      return [];
  }
}

/** The paths (library/traditions.ts PATH_TRADITIONS ids) a tradition's members are pointed to: premade workings and calendars carry these. */
export function pathsForTradition(id: string | null | undefined): string[] {
  switch (id) {
    case 'wicca':
    case 'wicca_south':
      return ['wicca', 'wheel'];
    case 'wheel':
    case 'wheel_south':
      return ['wheel'];
    case 'hellenic':
    case 'celtic':
    case 'norse':
      return [id];
    default:
      return [];
  }
}

/** The paths of every coven someone belongs to, in order, once each. */
export const pathsForCovens = (traditions: (string | null | undefined)[]): string[] => [...new Set(traditions.flatMap((t) => pathsForTradition(covenTraditionOf(t))))];

/** Those matching first, the rest after, each group keeping its order. */
export function matchingFirst<T>(items: T[], matches: (item: T) => boolean): T[] {
  return [...items.filter(matches), ...items.filter((i) => !matches(i))];
}
