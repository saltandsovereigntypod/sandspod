// Links from a course's lessons and steps to the rest of the Sanctuary: a holy
// day's page, a Living Library entry, a ready-made ritual, a dedication
// journey, a divination spread, an object for the altar's Seasonal drawer, the
// closed & living traditions guide, the calendars, the Grimoire, the ritual
// builder and the rest. A course names them as typed targets (CourseLink); when
// a program is copied into a coven they are kept in each step's resources as
// [[go:<kind>:<id>|Label]] (beside the Book's own [[book:<id>|Title]] links), so
// no new column is needed, and the app and the website show them as buttons
// that open the same thing. Pure and small: shared with the website as
// SaltCore.covens.courseLinks. Whether each target exists is checked by the
// tests (app/tests/course-links.test.ts, against the registries themselves).

export type CourseLinkKind =
  /** A holy day or moon page: a holy ref ('wheel-samhain', 'moon-full') or a holiday key ('wheel/samhain'). */
  | 'holy'
  /** A Living Library entry: 'traditional:herb:rosemary'. */
  | 'library'
  /** One entry of the closed & living traditions guide ('initiatory-wicca'); '' for the guide itself. */
  | 'closed'
  /** A ready-made ritual or spell ('folk-simple-blot'). */
  | 'premade'
  /** A dedication journey ('deity-brigid', 'path-wheel'). */
  | 'journey'
  /** A divination spread to draw ('samhain'). */
  | 'spread'
  /** An object in the altar's Seasonal drawer ('brigids-cross'). */
  | 'seasonal'
  /** One of the Sanctuary's own pages (COURSE_PAGES). */
  | 'page'
  /** A part of the coven itself (COVEN_PAGES): its rituals and ritual builder, Book, altars. */
  | 'coven';

export type CourseLink = { kind: CourseLinkKind; id: string; label?: string };

type Place = { label: string; app: string; site: string };

/** The Sanctuary's own pages a lesson may send someone to. */
export const COURSE_PAGES: Record<string, Place> = {
  calendar: { label: 'Calendars and holy days', app: '/today/calendar', site: '/today/calendar/' },
  moon: { label: 'The moon tonight', app: '/today/sky', site: '/today/sky/' },
  grimoire: { label: 'Your Grimoire', app: '/grimoire', site: '/grimoire/' },
  library: { label: 'The Living Library', app: '/more/library', site: '/library/' },
  'closed-guide': { label: 'Closed & living traditions', app: '/more/library/closed', site: '/library/closed/' },
  premade: { label: 'Ready-made rituals and spells', app: '/rituals/premade', site: '/rituals/premade/' },
  planner: { label: 'The ritual planner', app: '/rituals/planner', site: '/rituals/planner/' },
  spell: { label: 'Write a spell', app: '/rituals/spell', site: '/rituals/spell/' },
  journal: { label: 'Your ritual journal', app: '/rituals/journal', site: '/rituals/journal/' },
  journeys: { label: 'Dedication journeys', app: '/rituals/journeys', site: '/rituals/journeys/' },
  divination: { label: 'Divination', app: '/rituals/divination', site: '/divination/' },
  runes: { label: 'Rune meanings', app: '/rituals/divination/meanings?kind=runes', site: '/divination/runes/' },
  'community-rituals': { label: 'Community Rituals', app: '/rituals/community', site: '/rituals/community/' },
  cycle: { label: 'Cycle & Moon', app: '/rituals/cycle', site: '/rituals/cycle/' },
  patron: { label: 'Your deities (patron settings)', app: '/more/settings/deities', site: '/more/settings/deities/' },
  altar: { label: 'Your altar', app: '/altar', site: '/altar/' },
  practice: { label: 'Craft: cycle, astrology, divination and tools for every path', app: '/rituals/craft', site: '/practice/' },
  'green-season': { label: 'The green witch’s season', app: '/rituals/craft/green/season', site: '/practice/green/season/' },
  'folk-calendar': { label: 'The folk calendar', app: '/rituals/craft/folk/calendar', site: '/practice/folk/calendar/' },
  ancestors: { label: 'Your ancestors', app: '/rituals/craft/hedge/ancestors', site: '/practice/hedge/ancestors/' },
};

/** The parts of the coven a step may open (the app's /coven/c/<slug>/<page>, the website's &tab=<tab>). */
export const COVEN_PAGES: Record<string, { label: string; app: string; tab: string }> = {
  rituals: { label: 'The coven’s rituals and ritual builder', app: 'rituals', tab: 'rituals' },
  'ritual-builder': { label: 'Plan a coven ritual (the ritual builder)', app: 'ritual/plan', tab: 'rituals' },
  book: { label: 'The coven’s Book of Shadows', app: 'book', tab: 'book' },
  altar: { label: 'The coven’s altars', app: 'altar', tab: 'altar' },
  gathering: { label: 'The coven’s messages', app: 'gathering', tab: 'gathering' },
  petitions: { label: 'The coven’s petitions', app: 'petitions', tab: 'petitions' },
  standing: { label: 'Your standing and the coven’s agreements', app: 'standing', tab: 'path' },
  members: { label: 'The coven’s members', app: 'members', tab: 'members' },
  programs: { label: 'Initiation & training', app: 'programs', tab: 'programs' },
  record: { label: 'The members’ record', app: 'record', tab: 'record' },
  manage: { label: 'Manage the coven', app: 'manage', tab: 'manage' },
  lineage: { label: 'Daughter covens', app: 'lineage', tab: 'lineage' },
};

const KIND_WORD: Record<CourseLinkKind, string> = {
  holy: 'Holy day',
  library: 'Library',
  closed: 'Closed & living traditions',
  premade: 'Ritual',
  journey: 'Journey',
  spread: 'Spread',
  seasonal: 'Seasonal drawer',
  page: '',
  coven: '',
};

const words = (s: string) => s.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
const capital = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** A holiday key ('wheel_south/imbolc') or holy ref as the page's ref ('wheel-imbolc'; the southern Wheel shares the northern pages). */
export function holyLinkRef(id: string): string {
  const ref = id.includes('/') ? id.replace('/', '-') : id;
  return ref.startsWith('wheel_south-') ? `wheel-${ref.slice('wheel_south-'.length)}` : ref;
}

/** What a link's button says, when the course gave it no words of its own. */
export function courseLinkLabel(link: CourseLink): string {
  if (link.label?.trim()) return link.label.trim();
  if (link.kind === 'page') return COURSE_PAGES[link.id]?.label ?? capital(words(link.id));
  if (link.kind === 'coven') return COVEN_PAGES[link.id]?.label ?? capital(words(link.id));
  if (link.kind === 'closed' && !link.id) return COURSE_PAGES['closed-guide'].label;
  const tail = link.kind === 'library' ? link.id.split(':').pop() ?? link.id : link.kind === 'holy' ? holyLinkRef(link.id).replace(/^[a-z_]+-/, '') : link.id;
  return `${KIND_WORD[link.kind]}: ${capital(words(tail))}`;
}

const clean = (s: string) => s.replace(/[[\]|]/g, ' ').replace(/\s+/g, ' ').trim();

/** The marker a step's resources keep for a link: [[go:library:traditional:herb:rosemary|Rosemary]]. */
export function courseLinkMarker(link: CourseLink): string {
  return `[[go:${link.kind}:${clean(link.id)}|${clean(courseLinkLabel(link)) || 'Open'}]]`;
}

const MARKER = /\[\[go:([a-z]+):([^|\]]*)\|([^\]|]*)\]\]/g;
const KINDS = new Set<string>(['holy', 'library', 'closed', 'premade', 'journey', 'spread', 'seasonal', 'page', 'coven']);

/** The links a step's resources hold, in order, once each. */
export function courseLinks(text: string | null | undefined): CourseLink[] {
  const out: CourseLink[] = [];
  for (const m of String(text ?? '').matchAll(MARKER)) {
    if (!KINDS.has(m[1])) continue;
    const link: CourseLink = { kind: m[1] as CourseLinkKind, id: m[2].trim(), label: m[3].trim() || undefined };
    if (!out.some((x) => x.kind === link.kind && x.id === link.id)) out.push(link);
  }
  return out;
}

/** The resources text without the course link markers (the links show as buttons). */
export function withoutCourseLinks(text: string | null | undefined): string {
  return String(text ?? '').replace(MARKER, '').replace(/\n{3,}/g, '\n\n').trim();
}

/** The same links once each, in order (a step's own, then its lessons'). */
export function mergeCourseLinks(...lists: (CourseLink[] | null | undefined)[]): CourseLink[] {
  const out: CourseLink[] = [];
  for (const list of lists) for (const l of list ?? []) if (!out.some((x) => x.kind === l.kind && x.id === l.id)) out.push(l);
  return out;
}

const enc = encodeURIComponent;

/** Where a link opens in the app (an Expo Router path); the coven's slug for its own pages. */
export function courseLinkAppHref(link: CourseLink, covenSlug?: string | null): string | null {
  const id = link.id;
  switch (link.kind) {
    case 'holy':
      return `/today/holy/${enc(holyLinkRef(id))}`;
    case 'library':
      return `/more/library/${enc(id)}`;
    case 'closed':
      return id ? `/more/library/closed/${enc(id)}` : '/more/library/closed';
    case 'premade':
      return `/rituals/premade/${enc(id)}`;
    case 'journey':
      return `/rituals/journeys/${enc(id)}`;
    case 'spread':
      return `/rituals/divination/draw?spread=${enc(id)}`;
    case 'seasonal':
      return '/altar';
    case 'page':
      return COURSE_PAGES[id]?.app ?? null;
    case 'coven': {
      const page = COVEN_PAGES[id];
      return page && covenSlug ? `/coven/c/${enc(covenSlug)}/${page.app}` : null;
    }
  }
  return null;
}

/** Where a link opens on the website; a coven's own pages through its tab link (covenHref). */
export function courseLinkSiteHref(link: CourseLink, covenHref?: ((tab: string) => string) | null): string | null {
  const id = link.id;
  switch (link.kind) {
    case 'holy':
      return `/today/holy/?ref=${enc(holyLinkRef(id))}`;
    case 'library': {
      const [layer, type, key] = id.split(':');
      return layer === 'traditional' && type && key ? `/library/entry/?entity=${enc(`traditional/${type}/${key.split('.')[0]}`)}` : '/library/';
    }
    case 'closed':
      return id ? `/library/closed/?id=${enc(id)}` : '/library/closed/';
    case 'premade':
      return `/rituals/premade/?id=${enc(id)}`;
    case 'journey':
      return `/rituals/journeys/?id=${enc(id)}`;
    case 'spread':
      return `/divination/draw/?spread=${enc(id)}`;
    case 'seasonal':
      return '/altar/';
    case 'page':
      return COURSE_PAGES[id]?.site ?? null;
    case 'coven': {
      const page = COVEN_PAGES[id];
      return page && covenHref ? covenHref(page.tab) : null;
    }
  }
  return null;
}
