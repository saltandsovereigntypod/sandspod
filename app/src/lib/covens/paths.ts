// Paths in the coven: what share of a coven practises each way, keeps each
// tradition, and honours each deity, never who
// (supabase/migrations/20261105000000_coven_paths_overview.sql). Each member's
// own settings say it: How you practise (`my_practice`), My path (`library_path*`
// and the calendars, as lib/library/traditions.ts reads them) and My deities
// (`my_deities`, lib/patron/mine.ts). The database sums them up
// (coven_paths_overview) and hands over only the counts; this reads that
// answer the same way in the app and on the website (through js/core/covens.js).
//
// The rules, here and in the database alike, so nobody can be singled out:
// * Only active members who haven't turned off "Count me in my covens’ paths
//   overview" (`coven_paths_count_me`, on unless set to false) are counted.
// * Until MIN_SHARED members have shared anything, nothing is shown.
// * A section fewer than MIN_COUNT have shared shows nothing.
// * Anything fewer than MIN_COUNT share goes under "Other (fewer than 3)",
//   counted as the members with at least one such answer.
// * Percentages are of the members who shared that section, rounded half up.
//
// aggregatePaths does the whole sum from members' settings exactly as the
// database does, so the tests hold the two to the same rules.
//
// Pure: no React, no Supabase.

import { myDeities } from '../patron/mine.ts';
import { myPractices, practiceName } from '../rituals/premade/practices.ts';
import { myPath, pathName } from '../library/traditions.ts';
import { seesRecord, type RecordSettings } from './record.ts';

/** Fewer members than this sharing anything, and the overview waits. */
export const MIN_SHARED = 5;
/** Fewer members than this sharing something, and it goes under Other. */
export const MIN_COUNT = 3;
/** The setting that leaves someone out of every coven's overview when false. */
export const COUNT_ME_KEY = 'coven_paths_count_me';
export const OTHER_LABEL = `Other (fewer than ${MIN_COUNT})`;

type SettingsLike = Record<string, unknown> | null | undefined;

export type OverviewItem = { key: string; name: string; count: number; pct: number };
export type OverviewSection = { shared: number; items: OverviewItem[]; other: { count: number; pct: number } };
export const SECTION_KEYS = ['practices', 'paths', 'patrons', 'dedicated', 'deities'] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];
export type PathsOverview = {
  /** Whether enough members have shared for anything to show. */
  enough: boolean;
  /** Active members of the coven. */
  members: number;
  /** Members counted who shared anything at all. */
  shared: number;
} & Partial<Record<SectionKey, OverviewSection>>;

export const SECTIONS: { key: SectionKey; label: string; of: string; empty: string }[] = [
  { key: 'practices', label: 'How they practise', of: 'who’ve said how they practise', empty: 'Fewer than three have said how they practise yet.' },
  { key: 'paths', label: 'Paths', of: 'who’ve chosen their path', empty: 'Fewer than three have chosen their path yet.' },
  { key: 'patrons', label: 'Patrons', of: 'who keep deities', empty: 'Fewer than three keep deities in the app yet.' },
  { key: 'dedicated', label: 'Dedicated to', of: 'who keep deities', empty: 'Fewer than three keep deities in the app yet.' },
  { key: 'deities', label: 'Deities honoured', of: 'who keep deities', empty: 'Fewer than three keep deities in the app yet.' },
];

/** Whether someone is counted in their covens' overviews (on unless turned off). */
export function countsMe(settings: SettingsLike): boolean {
  const value = settings?.[COUNT_ME_KEY];
  return value !== false && value !== 'false';
}

/** A share of the members who shared a section, as a whole percentage (half up, as Postgres rounds). */
export const percent = (count: number, shared: number) => (shared > 0 ? Math.round((count * 100) / shared) : 0);

/** Most first, then by name. */
export const sortItems = (items: OverviewItem[]) =>
  [...items].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

export type ShareRow = { user: string; key: string; name: string };

/** One section from who shared what: kept answers, Other, percentages (the database's coven_paths_section). */
export function section(rows: ShareRow[], shared: number): OverviewSection {
  if (shared < MIN_COUNT) return { shared, items: [], other: { count: 0, pct: 0 } };
  const byKey = new Map<string, { users: Set<string>; names: Map<string, number> }>();
  for (const row of rows) {
    const entry = byKey.get(row.key) ?? { users: new Set<string>(), names: new Map<string, number>() };
    if (!entry.users.has(row.user)) entry.names.set(row.name, (entry.names.get(row.name) ?? 0) + 1);
    entry.users.add(row.user);
    byKey.set(row.key, entry);
  }
  const items: OverviewItem[] = [];
  const rare = new Set<string>();
  for (const [key, { users, names }] of byKey) {
    if (users.size < MIN_COUNT) {
      users.forEach((u) => rare.add(u));
      continue;
    }
    // The name most of them gave it (for a deity named in their own words).
    const name = [...names].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))[0][0];
    items.push({ key, name, count: users.size, pct: percent(users.size, shared) });
  }
  return { shared, items: sortItems(items), other: { count: rare.size, pct: percent(rare.size, shared) } };
}

/** The deity's key for counting: the Living Library's, else its own name, lower-cased. */
export const deityKey = (d: { key: string | null; name: string }) => d.key ?? `own:${d.name.trim().toLowerCase()}`;

/**
 * The whole overview from each active member's settings, as coven_paths_overview
 * works it out. `members` are the active members (null settings: none saved).
 */
export function aggregatePaths(members: { user: string; settings: SettingsLike }[]): PathsOverview {
  const counted = members.filter((m) => countsMe(m.settings));
  const practices: ShareRow[] = [];
  const paths: ShareRow[] = [];
  const patrons: ShareRow[] = [];
  const dedicated: ShareRow[] = [];
  const deities: ShareRow[] = [];
  for (const { user, settings } of counted) {
    for (const id of myPractices(settings)) practices.push({ user, key: id, name: practiceName(id) });
    for (const id of myPath(settings).traditions) paths.push({ user, key: id, name: pathName(id) });
    // Each deity once per member, at the closest level they gave it.
    const best = new Map<string, { name: string; level: string }>();
    for (const d of myDeities(settings)) {
      const key = deityKey(d);
      const seen = best.get(key);
      if (!seen) {
        best.set(key, { name: d.name, level: d.level });
        continue;
      }
      const level = d.level === 'patron' || seen.level === 'patron' ? 'patron' : d.level === 'dedicated' || seen.level === 'dedicated' ? 'dedicated' : 'exploring';
      best.set(key, { name: d.name < seen.name ? d.name : seen.name, level });
    }
    for (const [key, { name, level }] of best) {
      deities.push({ user, key, name });
      if (level === 'patron') patrons.push({ user, key, name });
      if (level === 'dedicated') dedicated.push({ user, key, name });
    }
  }
  const people = (rows: ShareRow[]) => new Set(rows.map((r) => r.user));
  const shared = new Set([...people(practices), ...people(paths), ...people(deities)]).size;
  if (shared < MIN_SHARED) return { enough: false, members: members.length, shared };
  const keepers = people(deities).size;
  return {
    enough: true,
    members: members.length,
    shared,
    practices: section(practices, people(practices).size),
    paths: section(paths, people(paths).size),
    patrons: section(patrons, keepers),
    dedicated: section(dedicated, keepers),
    deities: section(deities, keepers),
  };
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);

function readSection(raw: unknown, key: SectionKey): OverviewSection | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const s = raw as Record<string, unknown>;
  const shared = num(s.shared);
  const names = key === 'practices' ? practiceName : key === 'paths' ? pathName : null;
  let otherCount = num((s.other as Record<string, unknown> | null)?.count);
  const items: OverviewItem[] = [];
  for (const item of Array.isArray(s.items) ? s.items : []) {
    if (!item || typeof item !== 'object') continue;
    const i = item as Record<string, unknown>;
    const k = typeof i.key === 'string' ? i.key : '';
    const count = num(i.count);
    if (!k || !count) continue;
    // Never show a small count, even if one slipped through.
    if (count < MIN_COUNT) {
      otherCount += count;
      continue;
    }
    const name = names ? names(k) : typeof i.name === 'string' && i.name.trim() ? i.name.trim() : k;
    items.push({ key: k, name, count, pct: percent(count, shared) });
  }
  if (shared < MIN_COUNT) return { shared, items: [], other: { count: 0, pct: 0 } };
  otherCount = Math.min(otherCount, shared);
  return { shared, items: sortItems(items), other: { count: otherCount, pct: percent(otherCount, shared) } };
}

/** The database's answer, made safe to show: names filled in, sorted, rounded. Null when it isn't one. */
export function readOverview(raw: unknown): PathsOverview | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const shared = num(r.shared);
  const out: PathsOverview = { enough: r.enough === true && shared >= MIN_SHARED, members: num(r.members), shared };
  if (!out.enough) return out;
  for (const key of SECTION_KEYS) out[key] = readSection(r[key], key);
  return out;
}

/** "8 of the 12 members have shared something", for the top of the overview. */
export function sharedLine(o: PathsOverview): string {
  const members = `${o.members} ${o.members === 1 ? 'member' : 'members'}`;
  if (!o.enough) {
    return `Not enough yet: the overview opens once at least ${MIN_SHARED} members have shared how they practise, their path or their deities.`;
  }
  return `${o.shared} of the coven’s ${members} have shared their practice, path or deities.`;
}

/** "of the 8 who keep deities" under a section's heading. */
export function sectionLine(s: OverviewSection, key: SectionKey): string {
  const info = SECTIONS.find((x) => x.key === key)!;
  return s.shared < MIN_COUNT ? info.empty : `Of the ${s.shared} ${info.of}.`;
}

/** A section's bars, Other last (when anyone is in it). */
export function sectionBars(s: OverviewSection): OverviewItem[] {
  return s.other.count > 0 ? [...s.items, { key: 'other', name: OTHER_LABEL, count: s.other.count, pct: s.other.pct }] : s.items;
}

export type PathsSettings = { coven_id: string; paths_visible_to_all: boolean };

/**
 * Whether someone sees the overview: the coven's head (and site moderators),
 * those who see the members' record, and every member when the head shows it
 * to the whole coven. The database checks again (coven_sees_paths).
 */
export function seesPaths(args: {
  founder: boolean;
  site: boolean;
  member: boolean;
  record: Pick<RecordSettings, 'record_viewers'> | null | undefined;
  paths: Pick<PathsSettings, 'paths_visible_to_all'> | null | undefined;
  membership: { status: string; rank_id: string | null } | null | undefined;
  userId: string | null | undefined;
}): boolean {
  if (seesRecord({ founder: args.founder, site: args.site, settings: args.record, membership: args.membership, userId: args.userId })) return true;
  return args.member && args.paths?.paths_visible_to_all === true;
}

/** What every overview says about itself. */
export const ANONYMOUS_NOTE =
  'This never shows who keeps what, only how many. Anything fewer than three share is gathered under Other, and nothing shows until five have shared. Anyone can leave themselves out in Settings → My practice → “Count me in my covens’ paths overview”.';
