// The calendar feed you can subscribe to (supabase/functions/ical-feed): its
// secret link, kept in settings as `calendar_feed_token`, which parts it
// carries (`calendar_feed_parts`), and the holidays and moon phases the app
// works out for it. Those depend on your calendars, place and choices, which
// only the app knows how to read, so it keeps the next thirteen months of
// them as one craft entry (`calendar.feed`) for the feed to read. Pure.

import { holidayEvents, moonEvents } from './calendarEvent.ts';
import type { HolidayChoice } from '../holidays.ts';
import type { PrincipalPhase } from '../moon.ts';

export const FEED_TOKEN_KEY = 'calendar_feed_token';
export const FEED_PARTS_KEY = 'calendar_feed_parts';
export const FEED_COLLECTION = 'calendar.feed';

export type FeedPart = 'rituals' | 'covens' | 'holidays' | 'moon' | 'ancestors';
export const FEED_PART_CHOICES: { id: FeedPart; label: string; detail: string }[] = [
  { id: 'rituals', label: 'Planned rituals', detail: 'At the time you planned them' },
  { id: 'covens', label: 'Coven gatherings', detail: 'Rites and meetings of the covens you belong to' },
  { id: 'holidays', label: 'Holidays', detail: 'From your calendars in Settings → Calendars & holidays' },
  { id: 'moon', label: 'Moon phases', detail: 'The phases chosen under Moon and rituals, or new and full moons' },
  { id: 'ancestors', label: 'Your ancestors’ days', detail: 'Birthdays, death days and kept days, each year' },
];

/** The parts chosen; all of them when nothing is saved. */
export function feedPartsOf(value: unknown): FeedPart[] {
  const all = FEED_PART_CHOICES.map((p) => p.id);
  if (typeof value !== 'string' || !value.trim()) return all;
  const chosen = value.split(',').map((s) => s.trim());
  return all.filter((p) => chosen.includes(p));
}

/** The settings value for a set of parts (never empty: one part at least stays on). */
export const feedPartsValue = (parts: FeedPart[]) => FEED_PART_CHOICES.map((p) => p.id).filter((p) => parts.includes(p)).join(',');

type RandomSource = { getRandomValues?: (a: Uint8Array) => Uint8Array; randomUUID?: () => string };

/** A new secret: 32 random bytes as 43 URL-safe characters. */
export function newFeedToken(random: RandomSource | undefined = (globalThis as { crypto?: RandomSource }).crypto): string {
  const bytes = new Uint8Array(32);
  if (random?.getRandomValues) random.getRandomValues(bytes);
  else if (random?.randomUUID) {
    const hex = (random.randomUUID() + random.randomUUID()).replace(/-/g, '');
    for (let i = 0; i < 32; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  } else for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let out = '';
  let bits = 0;
  let value = 0;
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 6) {
      bits -= 6;
      out += ABC[(value >> bits) & 63];
    }
  }
  if (bits) out += ABC[(value << (6 - bits)) & 63];
  return out;
}

/** The feed's address for a token, on the given Supabase project. */
export const feedUrl = (supabaseUrl: string, token: string) => `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/ical-feed?t=${encodeURIComponent(token)}`;

/** The same address for "subscribe" links: webcal:// opens Apple Calendar and most phone calendars. */
export const webcalUrl = (url: string) => url.replace(/^https?:\/\//, 'webcal://');

/** Google Calendar's "add by URL" page with the feed filled in. */
export const googleSubscribeUrl = (url: string) => `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl(url))}`;

export type SkySnapshotEvent = { key: string; title: string; date: string; days: number; notes: string; kind: 'moon' | 'holiday' };
export type SkySnapshot = { v: 1; made: string; events: SkySnapshotEvent[] };

const pad = (n: number) => String(n).padStart(2, '0');
const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The chosen phases, or new and full moons when none are chosen. */
export function feedPhases(phases: Record<PrincipalPhase, boolean>): Record<PrincipalPhase, boolean> {
  return Object.values(phases).some(Boolean) ? phases : { new: true, firstQuarter: false, full: true, lastQuarter: false };
}

/** The holidays and moon phases for the next `days` days, for the feed to read. */
export function skySnapshot(phases: Record<PrincipalPhase, boolean>, choice: HolidayChoice, now: Date, days = 400): SkySnapshot {
  const moon = moonEvents(feedPhases(phases), now, days).map((e): SkySnapshotEvent => ({ key: e.key, title: e.title, date: isoDay(e.start), days: 1, notes: e.notes, kind: 'moon' }));
  const holidays = holidayEvents(now, days, choice).map(
    (e): SkySnapshotEvent => ({ key: e.key, title: e.title, date: isoDay(e.start), days: Math.max(1, Math.round((e.end.getTime() - e.start.getTime()) / 86_400_000)), notes: e.notes, kind: 'holiday' }),
  );
  return { v: 1, made: now.toISOString(), events: [...holidays, ...moon].sort((a, b) => a.date.localeCompare(b.date)) };
}

/** What the snapshot depends on, to write it again only when that changes (or the day does). */
export const snapshotKey = (phases: Record<PrincipalPhase, boolean>, choice: HolidayChoice, now: Date) => JSON.stringify([isoDay(now), feedPhases(phases), choice]);
