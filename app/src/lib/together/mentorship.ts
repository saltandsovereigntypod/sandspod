// Mentorship: an adult who offers to mentor, and an adult who asks for a
// mentor, paired within a coven (by asking, or by the coven's leaders) or
// from the open directory. Adults only, on both sides, always: the coven
// profile's 18+ confirmation (coven_profiles.age_confirmed_at) and a
// mentorship profile that confirms it again with the boundaries
// (mentor_listings.adult_confirmed_at, boundaries_agreed_at). Without both,
// the directory isn't shown and no pairing can be made (the database's
// mentorship_eligible decides; these rules say the same for the screens).
//
// A pairing has its own private conversation, shared goals and a reading
// list linked into the Sanctuary (journeys, Initiation & training's courses,
// the Library, the Grimoire), and check-ins. Either side can end it at any
// time. A coven's leaders can see that a pairing exists in their coven, never
// what is said in it.
//
// Pure: shared with the website as SaltCore.together.mentorship.

import { COURSE_PAGES, COVEN_PAGES, courseLinkAppHref, courseLinkLabel, courseLinkSiteHref, type CourseLink } from '../covens/courseLinks.ts';
import { PATH_TRADITIONS } from '../library/traditions.ts';

export type MentorRole = 'mentor' | 'mentee';
export type MentorshipStatus = 'proposed' | 'active' | 'declined' | 'ended';

export type MentorListing = {
  user_id: string;
  offers: boolean;
  seeks: boolean;
  traditions: string[];
  topics: string[];
  about: string | null;
  in_directory: boolean;
  in_covens: boolean;
  adult_confirmed_at: string;
  boundaries_agreed_at: string;
  updated_at?: string;
};

export type Mentorship = {
  id: string;
  coven_id: string | null;
  mentor_id: string;
  mentee_id: string;
  status: MentorshipStatus;
  proposed_by: string | null;
  paired_by: string | null;
  note: string | null;
  mentor_ok_at: string | null;
  mentee_ok_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  ended_by: string | null;
  created_at: string;
};

export type MentorshipItem = {
  id: string;
  mentorship_id: string;
  kind: 'goal' | 'reading';
  title: string;
  detail: string | null;
  link: CourseLink | null;
  done_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type MentorshipCheckin = { id: string; mentorship_id: string; user_id: string; body: string; created_at: string };
export type MentorshipMessage = { id: string; mentorship_id: string; user_id: string; body: string; created_at: string };
/** What a coven's leaders see: that a pairing exists, never its words. */
export type CovenPair = { id: string; mentor_id: string; mentee_id: string; status: MentorshipStatus; started_at: string | null; created_at: string; paired_by: string | null };

export const ABOUT_MAX = 600;
export const NOTE_MAX = 600;
export const MESSAGE_MAX = 2000;
export const CHECKIN_MAX = 1000;
export const MAX_TRADITIONS = 12;
export const MAX_TOPICS = 16;
/** A gentle nudge to check in when the last was this long ago. */
export const CHECKIN_DAYS = 14;

/** What people can mentor in, or ask about. */
export const MENTOR_TOPICS = [
  { id: 'beginning', label: 'Beginning a practice' },
  { id: 'ritual', label: 'Ritual craft' },
  { id: 'spellcraft', label: 'Spellcraft' },
  { id: 'divination', label: 'Divination' },
  { id: 'astrology', label: 'Astrology' },
  { id: 'moon', label: 'Moon work' },
  { id: 'wheel', label: 'The Wheel of the Year' },
  { id: 'herbs', label: 'Herbs and green craft' },
  { id: 'deity', label: 'Deity work and devotion' },
  { id: 'ancestors', label: 'Ancestor work' },
  { id: 'grimoire', label: 'Keeping a Grimoire' },
  { id: 'history', label: 'History and sources' },
  { id: 'traditions', label: 'Respecting closed and living traditions' },
  { id: 'coven', label: 'Coven life and leading' },
] as const;

/** Traditions to filter by: the Sanctuary's paths, and eclectic practice. */
export const MENTOR_TRADITIONS: { id: string; label: string }[] = [...PATH_TRADITIONS.map((t) => ({ id: t.id, label: t.name })), { id: 'eclectic', label: 'Eclectic' }];

export const topicLabel = (id: string) => MENTOR_TOPICS.find((t) => t.id === id)?.label ?? id;
export const traditionLabel = (id: string) => MENTOR_TRADITIONS.find((t) => t.id === id)?.label ?? id;

/** The boundaries everyone agrees to before mentoring or being mentored. */
export const BOUNDARIES = [
  'Mentorship here is for adults only (18+), on both sides. If you think someone is under 18, please report them.',
  'A mentor shares experience; they are not a guru, a therapist or a spiritual authority over you. No one may ask you for money, secrets, photos, obedience or anything sexual.',
  'Talk stays in the pairing’s own conversation. A coven’s leaders can see that a pairing exists, never what is said in it.',
  'Respect closed and living traditions: some practices are only taught within their communities, and a good mentor says so.',
  'Either of you can end the pairing at any time, without giving a reason. You can block or report anyone, and blocking ends the pairing.',
] as const;

// ─── Who may take part ───────────────────────────────────────────────────

export type MyStanding = 'sign-in' | 'profile' | 'banned' | 'setup' | 'ok';

/**
 * Where you stand: signed in, with a coven profile (whose 18+ confirmation is
 * required to make one), not banned from the community, and with a
 * mentorship profile that confirms 18+ and the boundaries. Only 'ok' sees the
 * directory or can be paired.
 */
export function myStanding(me: {
  signedIn: boolean;
  profile: { age_confirmed_at?: string | null } | null | undefined;
  banned: boolean;
  listing: Pick<MentorListing, 'adult_confirmed_at' | 'boundaries_agreed_at'> | null | undefined;
}): MyStanding {
  if (!me.signedIn) return 'sign-in';
  if (!me.profile || !me.profile.age_confirmed_at) return 'profile';
  if (me.banned) return 'banned';
  if (!me.listing?.adult_confirmed_at || !me.listing.boundaries_agreed_at) return 'setup';
  return 'ok';
}

export const STANDING_WORDS: Record<Exclude<MyStanding, 'ok'>, string> = {
  'sign-in': 'Sign in to look for a mentor or offer to mentor.',
  profile: 'Mentorship is for adults. Make your community profile first (it asks you to confirm you are 18 or older).',
  banned: 'Your community access is paused, so mentorship isn’t open to you.',
  setup: 'Set up your mentorship profile: confirm you are 18 or older and agree to the boundaries.',
};

export type PairCheck = { ok: true } | { ok: false; reason: string };

/**
 * Whether two people may be paired (asked, or paired by a coven's leaders):
 * both in good standing ('ok'), not the same person, no block either way,
 * no pairing already open between them, and within a coven both its members.
 */
export function canPair(args: {
  a: { id: string; standing: MyStanding };
  b: { id: string; standing: MyStanding };
  blocked: boolean;
  open: Pick<Mentorship, 'mentor_id' | 'mentee_id' | 'status'>[];
  coven?: { aMember: boolean; bMember: boolean } | null;
}): PairCheck {
  const { a, b } = args;
  if (a.id === b.id) return { ok: false, reason: 'Choose someone else.' };
  if (a.standing !== 'ok' || b.standing !== 'ok') return { ok: false, reason: 'Both people need a mentorship profile (adults only) first.' };
  if (args.blocked) return { ok: false, reason: 'That pairing isn’t possible.' };
  if (args.open.some((m) => (m.status === 'proposed' || m.status === 'active') && ((m.mentor_id === a.id && m.mentee_id === b.id) || (m.mentor_id === b.id && m.mentee_id === a.id))))
    return { ok: false, reason: 'They already have a pairing open with each other.' };
  if (args.coven && (!args.coven.aMember || !args.coven.bMember)) return { ok: false, reason: 'Both need to be members of the coven.' };
  return { ok: true };
}

/** Whether you can ask this person: to mentor you if they offer, to be mentored by you if they're looking. */
export function canAsk(listing: Pick<MentorListing, 'offers' | 'seeks'>, as: MentorRole): boolean {
  return as === 'mentee' ? listing.offers : listing.seeks;
}

// ─── The directory ───────────────────────────────────────────────────────

export type DirectoryFilter = { want: 'mentor' | 'mentee'; tradition: string | null; topics: string[]; query?: string };

/**
 * The listings that match: offering to mentor (want 'mentor') or looking for
 * one (want 'mentee'), of the tradition chosen (eclectic listings and those
 * naming none suit any), sharing at least one topic when topics are chosen,
 * never yourself nor anyone blocked either way. Most topics in common first.
 */
export function filterDirectory<T extends MentorListing>(listings: T[], filter: DirectoryFilter, me: string | null, blocked: Iterable<string>, nameOf: (id: string) => string = () => ''): T[] {
  const hidden = new Set(blocked);
  const q = (filter.query ?? '').trim().toLowerCase();
  const scored = listings
    .filter((l) => l.user_id !== me && !hidden.has(l.user_id))
    .filter((l) => (filter.want === 'mentor' ? l.offers : l.seeks))
    .filter((l) => !filter.tradition || !l.traditions.length || l.traditions.includes(filter.tradition) || l.traditions.includes('eclectic'))
    .map((l) => ({ l, shared: filter.topics.filter((t) => l.topics.includes(t)).length }))
    .filter(({ shared }) => !filter.topics.length || shared > 0)
    .filter(({ l }) => !q || `${nameOf(l.user_id)} ${l.about ?? ''} ${l.topics.map(topicLabel).join(' ')}`.toLowerCase().includes(q));
  return scored.sort((x, y) => y.shared - x.shared || nameOf(x.l.user_id).localeCompare(nameOf(y.l.user_id))).map(({ l }) => l);
}

/** A listing cleaned to what the database keeps. */
export function cleanListing(input: Partial<MentorListing>): Omit<MentorListing, 'user_id' | 'adult_confirmed_at' | 'boundaries_agreed_at' | 'updated_at'> {
  const known = (list: unknown, ids: Set<string>, max: number) => [...new Set((Array.isArray(list) ? list : []).map(String).filter((x) => ids.has(x)))].slice(0, max);
  return {
    offers: !!input.offers,
    seeks: !!input.seeks,
    traditions: known(input.traditions, new Set(MENTOR_TRADITIONS.map((t) => t.id)), MAX_TRADITIONS),
    topics: known(input.topics, new Set(MENTOR_TOPICS.map((t) => t.id)), MAX_TOPICS),
    about: String(input.about ?? '').trim().slice(0, ABOUT_MAX) || null,
    in_directory: !!input.in_directory,
    in_covens: input.in_covens !== false,
  };
}

/** The one line under a listing: what they offer or look for. */
export function listingLine(l: Pick<MentorListing, 'offers' | 'seeks' | 'traditions' | 'topics'>): string {
  const role = l.offers && l.seeks ? 'Mentors, and looking for a mentor' : l.offers ? 'Offers to mentor' : l.seeks ? 'Looking for a mentor' : 'Not looking just now';
  const trad = l.traditions.length ? ` · ${l.traditions.map(traditionLabel).join(', ')}` : '';
  return `${role}${trad}`;
}

// ─── A pairing ───────────────────────────────────────────────────────────

export const roleOf = (m: Pick<Mentorship, 'mentor_id' | 'mentee_id'>, me: string | null): MentorRole | null => (m.mentor_id === me ? 'mentor' : m.mentee_id === me ? 'mentee' : null);
export const otherOf = (m: Pick<Mentorship, 'mentor_id' | 'mentee_id'>, me: string | null): string => (m.mentor_id === me ? m.mentee_id : m.mentor_id);

export type Stage = 'waiting-me' | 'waiting-them' | 'active' | 'declined' | 'ended';

/** Where a pairing stands for you: waiting for your yes, for theirs, under way, or over. */
export function stageOf(m: Pick<Mentorship, 'status' | 'mentor_id' | 'mentee_id' | 'mentor_ok_at' | 'mentee_ok_at'>, me: string | null): Stage {
  if (m.status === 'active') return 'active';
  if (m.status === 'declined') return 'declined';
  if (m.status === 'ended') return 'ended';
  const mine = roleOf(m, me) === 'mentor' ? m.mentor_ok_at : m.mentee_ok_at;
  return mine ? 'waiting-them' : 'waiting-me';
}

/** The pairing's line: "Mentoring Rowan", "Mentored by Hazel", "Waiting for Rowan to say yes". */
export function pairingLine(m: Pick<Mentorship, 'status' | 'mentor_id' | 'mentee_id' | 'mentor_ok_at' | 'mentee_ok_at' | 'paired_by'>, me: string | null, nameOf: (id: string) => string): string {
  const other = nameOf(otherOf(m, me));
  const stage = stageOf(m, me);
  const role = roleOf(m, me);
  if (stage === 'waiting-me') return m.paired_by && m.paired_by !== me ? `Your coven suggests ${role === 'mentor' ? 'mentoring' : 'being mentored by'} ${other}` : `${other} asks ${role === 'mentor' ? 'you to mentor them' : 'to mentor you'}`;
  if (stage === 'waiting-them') return `Waiting for ${other} to say yes`;
  if (stage === 'declined') return `Not taken up: ${other}`;
  if (stage === 'ended') return `Ended: ${role === 'mentor' ? 'mentoring' : 'mentored by'} ${other}`;
  return role === 'mentor' ? `Mentoring ${other}` : `Mentored by ${other}`;
}

/** Open pairings first (waiting for you, then under way, then waiting for them), then those that are over, newest first. */
export function sortPairings<T extends Mentorship>(list: T[], me: string | null): T[] {
  const rank: Record<Stage, number> = { 'waiting-me': 0, active: 1, 'waiting-them': 2, declined: 3, ended: 3 };
  return [...list].sort((a, b) => rank[stageOf(a, me)] - rank[stageOf(b, me)] || b.created_at.localeCompare(a.created_at));
}

/** Whether a check-in is due: under way, and none for a fortnight (or none yet, a week after it began). */
export function checkinDue(m: Pick<Mentorship, 'status' | 'started_at'>, checkins: Pick<MentorshipCheckin, 'created_at'>[], now: Date = new Date()): boolean {
  if (m.status !== 'active') return false;
  const last = checkins.reduce<string | null>((acc, c) => (!acc || c.created_at > acc ? c.created_at : acc), null);
  const since = last ?? m.started_at;
  if (!since) return false;
  const days = (now.getTime() - new Date(since).getTime()) / 86_400_000;
  return last ? days >= CHECKIN_DAYS : days >= 7;
}

/** Goals and reading, each list open first then done, in the order added. */
export function itemsOf<T extends MentorshipItem>(items: T[], kind: MentorshipItem['kind']): T[] {
  return items.filter((i) => i.kind === kind).sort((a, b) => Number(!!a.done_at) - Number(!!b.done_at) || a.created_at.localeCompare(b.created_at));
}

// ─── Links from goals and the reading list ───────────────────────────────

export type JourneyLike = { id: string; title: string };

/**
 * What a goal or reading can link to, matching what's typed: dedication
 * journeys, the Sanctuary's pages (the Library, the Grimoire, ready-made
 * rituals, the closed & living traditions guide and the rest), and, for a
 * coven's pairing, the coven's Initiation & training (its courses and
 * lessons) and Book. At most `limit`.
 */
export function linkChoices(query: string, journeys: JourneyLike[], inCoven: boolean, limit = 8): CourseLink[] {
  const q = query.trim().toLowerCase();
  const pages: CourseLink[] = Object.entries(COURSE_PAGES).map(([id, p]) => ({ kind: 'page', id, label: p.label }));
  const coven: CourseLink[] = inCoven ? ['programs', 'book', 'rituals'].map((id) => ({ kind: 'coven' as const, id, label: COVEN_PAGES[id].label })) : [];
  const trips: CourseLink[] = journeys.map((j) => ({ kind: 'journey', id: j.id, label: j.title }));
  const all = [...coven, ...pages, ...trips];
  return (q ? all.filter((l) => courseLinkLabel(l).toLowerCase().includes(q)) : [...coven, ...pages]).slice(0, limit);
}

/** Where an item's link opens: the app's path, or the website's (with the coven's tab link for a coven's page). */
export function itemHref(link: CourseLink | null | undefined, app: boolean, coven?: { slug: string; siteHref: (tab: string) => string } | null): string | null {
  if (!link) return null;
  return app ? courseLinkAppHref(link, coven?.slug ?? null) : courseLinkSiteHref(link, coven?.siteHref ?? null);
}

/** A link as stored with an item, checked (kind and id only, with its label). */
export function cleanLink(link: Partial<CourseLink> | null | undefined): CourseLink | null {
  if (!link || typeof link.id !== 'string' || !['page', 'coven', 'journey', 'premade', 'library', 'holy', 'closed', 'spread'].includes(String(link.kind))) return null;
  return { kind: link.kind as CourseLink['kind'], id: link.id.slice(0, 120), label: String(link.label ?? courseLinkLabel(link as CourseLink)).slice(0, 160) };
}
