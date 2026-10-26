// Readings drawn for something: a dream (the Dream reading), a planned ritual
// or spell (Before a working) or one of your deities (Patron deity). The link
// rides inside the reading itself (`linkedTo` in `hedge.readings`), so the
// app and the website read and write the same thing with no new table; a
// working's journal entry knows its plan by `metadata.planId`. Pure.

import { frequentDraws, readLink, type ReadingEntry, type ReadingLink, type ReadingLinkKind, type ReadingMatch } from '../craft/hedge/readings.ts';

/** The spread each kind of link is drawn with. */
export const LINK_SPREAD: Record<ReadingLinkKind, string> = { dream: 'dream', plan: 'before-working', deity: 'patron-deity' };

/** The kind of link a spread is made for, if any. */
export const linkKindOfSpread = (spreadId: string): ReadingLinkKind | null =>
  (Object.keys(LINK_SPREAD) as ReadingLinkKind[]).find((k) => LINK_SPREAD[k] === spreadId) ?? null;

type Params = { dream?: string | string[]; plan?: string | string[]; deity?: string | string[]; title?: string | string[] };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

/** The link the draw screen was opened for (`?dream=…`, `?plan=…` or `?deity=…`, with `title`). */
export function linkFromParams(params: Params): ReadingLink | null {
  const title = one(params.title).slice(0, 200);
  for (const kind of ['dream', 'plan', 'deity'] as const) {
    const id = one(params[kind]).trim();
    if (id) return { kind, id: id.slice(0, 200), title };
  }
  return null;
}

/** The draw screen's params for drawing for something, its own spread chosen. */
export function drawParams(link: ReadingLink): Record<string, string> {
  return { spread: LINK_SPREAD[link.kind], [link.kind]: link.id, title: link.title };
}

/** The same as a query string, for the website's draw page. */
export const drawQuery = (link: ReadingLink) =>
  `?${Object.entries(drawParams(link))
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')}`;

/** Under a reading: what it was drawn for. */
export function linkLine(link: ReadingLink): string {
  const title = link.title.trim();
  if (link.kind === 'dream') return title ? `Drawn for the dream “${title}”` : 'Drawn for a dream';
  if (link.kind === 'plan') return title ? `Drawn before “${title}”` : 'Drawn before a working';
  return title ? `Drawn for ${title}` : 'Drawn for one of your deities';
}

/** The question a draw for something starts with (you can change it). */
export function linkQuestion(link: ReadingLink): string {
  const title = link.title.trim();
  if (link.kind === 'dream') return title ? `What is the dream “${title}” telling me?` : 'What is this dream telling me?';
  if (link.kind === 'plan') return title ? `How will “${title}” go?` : 'How will this working go?';
  return title ? `What would ${title} have me know?` : 'What would this god have me know?';
}

/** The readings drawn for one dream, plan or deity, newest first. */
export function linkedReadings<T extends ReadingEntry>(list: T[], kind: ReadingLinkKind, id: string | null | undefined): T[] {
  if (!id) return [];
  return list
    .filter((e) => {
      const link = readLink(e.data.linkedTo);
      return !!link && link.kind === kind && link.id === id;
    })
    .sort((a, b) => (a.data.date === b.data.date ? (a.createdAt < b.createdAt ? 1 : -1) : a.data.date < b.data.date ? 1 : -1));
}

/** Cards that keep coming up across the readings of your dreams, most first (for the dream journal's patterns). */
export function dreamReadingDraws(list: ReadingEntry[], limit = 8): { name: string; count: number }[] {
  return frequentDraws(
    list.filter((e) => readLink(e.data.linkedTo)?.kind === 'dream'),
    limit,
  );
}

/** How many of your dreams have a reading. */
export const dreamsRead = (list: ReadingEntry[]) => new Set(list.map((e) => readLink(e.data.linkedTo)).filter((l) => l?.kind === 'dream').map((l) => l!.id)).size;

// ─── Before a working ────────────────────────────────────────────────────

/** The plan a journal entry was begun from, if it says. */
export function planIdOf(entry: { metadata?: unknown } | null | undefined): string | null {
  const meta = entry?.metadata && typeof entry.metadata === 'object' ? (entry.metadata as Record<string, unknown>) : null;
  return typeof meta?.planId === 'string' && meta.planId ? meta.planId : null;
}

/** The reading drawn before a working (the newest, if more than one), for its "Did it work?". */
export function preReadingOf<T extends ReadingEntry>(list: T[], entry: { metadata?: unknown } | null | undefined): T | null {
  return linkedReadings(list, 'plan', planIdOf(entry))[0] ?? null;
}

/** The entry's metadata with the plan it was begun from. */
export function withPlanId<T extends Record<string, unknown>>(metadata: T | null | undefined, planId: string | null | undefined): T {
  const out = { ...((metadata ?? {}) as T) };
  if (planId) (out as Record<string, unknown>).planId = planId;
  return out;
}

export type PreReadingTally = { total: number; yes: number; partly: number; no: number };

/** Readings drawn before a working that you've said bore out, or didn't. */
export function preReadingTally(list: ReadingEntry[]): PreReadingTally {
  const said = list.filter((e) => readLink(e.data.linkedTo)?.kind === 'plan' && e.data.matched).map((e) => e.data.matched as ReadingMatch);
  return { total: said.length, yes: said.filter((m) => m === 'yes').length, partly: said.filter((m) => m === 'partly').length, no: said.filter((m) => m === 'no').length };
}

/** One plain line for What works for you, or null until a pre-reading has been weighed. */
export function preReadingLine(list: ReadingEntry[]): string | null {
  const t = preReadingTally(list);
  if (!t.total) return null;
  const parts = [`${t.yes} bore out`, ...(t.partly ? [`${t.partly} partly`] : []), ...(t.no ? [`${t.no} didn’t`] : [])];
  const few = t.total < 3 ? ' Only a few so far, so it’s early to say.' : '';
  return `Of the ${t.total === 1 ? 'one reading' : `${t.total} readings`} you drew before a working and looked back on, ${parts.join(', ')}.${few}`;
}

/** Where a link opens in the app: the dream, the plan, or the deity in the Living Library. */
export function linkRoute(link: ReadingLink): string {
  if (link.kind === 'dream') return `/grimoire/dreams/${encodeURIComponent(link.id)}`;
  if (link.kind === 'plan') return `/rituals/plan/${encodeURIComponent(link.id)}`;
  return /^[a-z0-9_-]+$/.test(link.id) ? `/rituals/library/traditional:deity:${link.id}` : '/more/settings/deities';
}

/** The same on the website. */
export function linkUrl(link: ReadingLink): string {
  if (link.kind === 'dream') return `/grimoire/dreams/dream/?id=${encodeURIComponent(link.id)}`;
  if (link.kind === 'plan') return `/rituals/plan/?id=${encodeURIComponent(link.id)}`;
  return /^[a-z0-9_-]+$/.test(link.id) ? `/library/entry/?entity=${encodeURIComponent(`traditional/deity/${link.id}`)}` : '/more/';
}

/** A kept reading in a line: its cards in their places, without the spread's name. */
export function cardsLine(reading: { cameUp: string; drawn: string[] }): string {
  const lines = reading.cameUp.split('\n').slice(1).filter(Boolean);
  return lines.length ? lines.join('\n') : reading.drawn.join(', ');
}

// ─── Deities ─────────────────────────────────────────────────────────────

/** A deity to draw for: its Living Library key (from "traditional/deity/hekate" or "hekate") or its name. */
export function deityLink(keyOrRef: string | null | undefined, name: string): ReadingLink {
  const key = (keyOrRef ?? '').split('/').pop() ?? '';
  return { kind: 'deity', id: key || name.trim().toLowerCase(), title: name.trim() };
}
