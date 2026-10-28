// Holy-day and moon-phase pages: finding the page for a holiday, a calendar
// event or tonight's moon, and the Grimoire page each becomes. Pure.

import type { MoonState } from '../moon.ts';
import { CALENDAR_EAST_PAGES } from './data/calendars-east.ts';
import { CALENDAR_WEST_PAGES } from './data/calendars-west.ts';
import { HOLIDAY_PAGES } from './data/holidays.ts';
import type { HolyPage } from './types.ts';
import { holyRef, moonRef as moonRefFor, principalRef } from './refs.ts';

export type { HolyPage } from './types.ts';
export { holyRef, principalRef };

export const HOLY_PAGES: HolyPage[] = [...HOLIDAY_PAGES, ...CALENDAR_WEST_PAGES, ...CALENDAR_EAST_PAGES];
const byRef = new Map(HOLY_PAGES.map((p) => [p.ref, p]));

/** The page for a ref, trying a multi-day festival's first day ("roman-carmentalia-2" → "roman-carmentalia"). */
export function holyPage(ref: string | null | undefined): HolyPage | null {
  if (!ref) return null;
  return byRef.get(ref) ?? byRef.get(holyRef(ref)) ?? byRef.get(ref.replace(/-\d+$/, '')) ?? null;
}

/** Whether a holiday or event id has a page. */
export const hasHolyPage = (id: string) => !!holyPage(holyRef(id));

/** The page ref for the moon as it is: the dark moon in the day or so either side of new. */
export const moonRef = (moon: Pick<MoonState, 'name' | 'illumination'>): string => moonRefFor(moon, byRef.has('moon-dark'));

// The calendars each Living Library tradition keeps (their pages' ref prefixes).
const TRADITION_REFS: Record<string, string[]> = {
  wheel: ['wheel'],
  wicca: ['wheel'],
  celtic: ['celtic', 'coligny'],
  norse: ['norse', 'icelandic'],
  hellenic: ['hellenic', 'hellenic_monthly', 'attic'],
  roman: ['roman'],
  slavic: ['slavic'],
  christian: ['christian'],
  egyptian: ['kemetic'],
  hindu: ['hindu'],
};

/** A tradition's holy-day pages (Living Library tradition ids: 'hellenic', 'norse', …), the main calendar's first, matching a search if given. */
export function holyDaysFor(tradition: string, query = ''): HolyPage[] {
  const prefixes = TRADITION_REFS[tradition] ?? [];
  const q = query.trim().toLowerCase();
  return prefixes.flatMap((prefix) =>
    HOLY_PAGES.filter((p) => p.ref.startsWith(`${prefix}-`) && (!q || [p.title, ...(p.aka ?? []), p.summary].some((t) => t.toLowerCase().includes(q)))),
  );
}

/** The Grimoire section a page is kept in. */
export const grimoireSection = (page: HolyPage) => (page.ref.startsWith('moon-') ? 'The Moon' : 'Holy Days');

const html = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ type: 'text', content: html(p) }));

/** The blocks of a holy page as a Grimoire page (the website's block shapes: text as HTML, lists one per line). */
export function holyBlocks(page: HolyPage, premadeTitle?: string | null): { type: string; content: string }[] {
  const blocks: { type: string; content: string }[] = [{ type: 'callout', content: html(page.summary) }];
  blocks.push({ type: 'heading', content: 'Who is honoured, and why' }, ...paragraphs(page.honours));
  blocks.push({ type: 'heading', content: 'History' }, ...paragraphs(page.history));
  blocks.push({ type: 'heading', content: 'What we know' }, ...paragraphs(page.knowAndDont.known));
  blocks.push({ type: 'heading', content: 'What we don’t' }, ...paragraphs(page.knowAndDont.unknown));
  if (page.respect) blocks.push({ type: 'heading', content: 'With respect' }, ...paragraphs(page.respect));
  if (page.celebrate.length) blocks.push({ type: 'heading', content: 'Keeping it today' }, { type: 'bulleted_list', content: page.celebrate.join('\n') });
  const ritualTitle = page.ritual.title ?? premadeTitle ?? null;
  if (ritualTitle || page.ritual.outline?.length) {
    blocks.push({ type: 'heading', content: ritualTitle ? `A working: ${ritualTitle}` : 'A working' });
    if (page.ritual.outline?.length) blocks.push({ type: 'numbered_list', content: page.ritual.outline.join('\n') });
  }
  const c = page.correspondences;
  const lines = [
    c.deities?.length ? `Deities: ${c.deities.join(', ')}` : '',
    c.herbs?.length ? `Herbs: ${c.herbs.join(', ')}` : '',
    c.crystals?.length ? `Crystals: ${c.crystals.join(', ')}` : '',
    c.colors?.length ? `Colours: ${c.colors.join(', ')}` : '',
    c.foods?.length ? `Foods: ${c.foods.join(', ')}` : '',
    c.symbols?.length ? `Symbols: ${c.symbols.join(', ')}` : '',
  ].filter(Boolean);
  if (lines.length) blocks.push({ type: 'heading', content: 'Correspondences' }, { type: 'correspondence', content: lines.join('\n') });
  blocks.push({ type: 'heading', content: 'My notes' }, { type: 'text', content: '' });
  if (page.sources.length) blocks.push({ type: 'heading', content: 'Sources' }, { type: 'bulleted_list', content: page.sources.join('\n') });
  return blocks;
}

/** A Grimoire page already holding this holy page: tagged with its ref, or one you made with the same title (in its section first). */
export function findHolyGrimoirePage<P extends { id: string; title: string; section_id: string | null; metadata: Record<string, unknown> | null }>(
  pages: P[],
  sections: { id: string; title: string }[],
  page: HolyPage,
): P | null {
  const tagged = pages.find((p) => p.metadata && (p.metadata as Record<string, unknown>).holyRef === page.ref);
  if (tagged) return tagged;
  const titles = new Set([page.title, ...(page.aka ?? [])].map((t) => t.trim().toLowerCase()));
  const inSection = new Set(sections.filter((s) => s.title.trim().toLowerCase() === grimoireSection(page).toLowerCase()).map((s) => s.id));
  const same = pages.filter((p) => titles.has(p.title.trim().toLowerCase()));
  return same.find((p) => p.section_id != null && inSection.has(p.section_id)) ?? same[0] ?? null;
}
