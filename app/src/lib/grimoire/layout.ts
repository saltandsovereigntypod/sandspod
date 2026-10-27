// The Grimoire's home as each person arranges it: which parts show, in what
// order, under what names, which are open, and how pages are sorted and
// filtered. A personal grimoire keeps it in your synced settings
// (user_settings, key `grimoire_layout`, as JSON) so the app and the website
// open on the same home; a coven's book keeps it on the book itself
// (coven_grimoire_books.layout), arranged by those allowed to.
//
// Every part of the home has a key: the built-in shelves ('myPractice',
// 'dreams', 'myPath', 'traditional'), loose pages ('pages'), and each of the
// book's sections ('section:<id>'), which are the folders people make for
// their own pages ("Hekate", "Spells I use"). A coven's book adds 'records'
// (its gatherings, kept by the database). Pure, so it can be tested, and the
// website loads it too (js/core/grimoire.js).

export type PageSort = 'custom' | 'newest' | 'oldest' | 'az';

export const PAGE_SORTS: { value: PageSort; label: string }[] = [
  { value: 'custom', label: 'Your order' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A to Z' },
];

export type GrimoireLayout = {
  /** Keys in the order chosen. Parts not named here fall in where they'd be by default. */
  order: string[];
  hidden: string[];
  /** Your own names for parts ("Herbs and stones" for My Practice). */
  titles: Record<string, string>;
  /** Parts opened or closed by hand; the rest follow their default. */
  open: Record<string, boolean>;
  sort: PageSort;
  /** Show only pages of this kind (a page_type), or every page when null. */
  kind: string | null;
};

/** The settings key a personal grimoire's layout is saved under. */
export const LAYOUT_SETTING = 'grimoire_layout';

export const emptyLayout = (): GrimoireLayout => ({ order: [], hidden: [], titles: {}, open: {}, sort: 'custom', kind: null });

const KEY = /^[A-Za-z0-9:_-]{1,80}$/;
const MAX_KEYS = 300;

/** A saved layout (JSON text or an object) read safely; anything odd is left out. */
export function parseLayout(raw: unknown): GrimoireLayout {
  let value: unknown = raw;
  if (typeof raw === 'string') {
    if (!raw.trim()) return emptyLayout();
    try {
      value = JSON.parse(raw);
    } catch {
      return emptyLayout();
    }
  }
  const source = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const keys = (list: unknown) => [...new Set((Array.isArray(list) ? list : []).filter((k): k is string => typeof k === 'string' && KEY.test(k)))].slice(0, MAX_KEYS);
  const titles: Record<string, string> = {};
  if (source.titles && typeof source.titles === 'object') {
    for (const [k, v] of Object.entries(source.titles as Record<string, unknown>)) {
      if (KEY.test(k) && typeof v === 'string' && v.trim()) titles[k] = v.trim().slice(0, 60);
    }
  }
  const open: Record<string, boolean> = {};
  if (source.open && typeof source.open === 'object') {
    for (const [k, v] of Object.entries(source.open as Record<string, unknown>)) if (KEY.test(k) && typeof v === 'boolean') open[k] = v;
  }
  const sort = PAGE_SORTS.some((s) => s.value === source.sort) ? (source.sort as PageSort) : 'custom';
  const kind = typeof source.kind === 'string' && source.kind.trim() ? source.kind.trim().slice(0, 40) : null;
  return { order: keys(source.order), hidden: keys(source.hidden), titles, open, sort, kind };
}

/** The layout as saved: JSON, with nothing empty kept. */
export function serializeLayout(layout: GrimoireLayout): string {
  const out: Record<string, unknown> = {};
  if (layout.order.length) out.order = layout.order;
  if (layout.hidden.length) out.hidden = layout.hidden;
  if (Object.keys(layout.titles).length) out.titles = layout.titles;
  if (Object.keys(layout.open).length) out.open = layout.open;
  if (layout.sort !== 'custom') out.sort = layout.sort;
  if (layout.kind) out.kind = layout.kind;
  return Object.keys(out).length ? JSON.stringify(out) : '';
}

/** One part the home could show, in its default place. */
export type HomePart = { key: string; title: string; closedByDefault?: boolean };

/** One part as the home shows it. */
export type HomeItem = { key: string; title: string; defaultTitle: string; hidden: boolean; open: boolean };

/**
 * The parts in the order they show: the layout's order first, and any part it
 * doesn't name (a new section, a shelf switched on) placed after the part
 * that comes before it by default. Hidden parts are left out unless
 * `withHidden` (the Customise view shows them, dimmed).
 */
export function arrangeHome(layout: GrimoireLayout, parts: HomePart[], options: { withHidden?: boolean } = {}): HomeItem[] {
  const known = new Map(parts.map((p) => [p.key, p]));
  const placed = layout.order.filter((k) => known.has(k));
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i].key;
    if (placed.includes(key)) continue;
    // After the nearest earlier default part already placed, or first.
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const before = placed.indexOf(parts[j].key);
      if (before >= 0) {
        at = before + 1;
        break;
      }
    }
    placed.splice(at, 0, key);
  }
  const hidden = new Set(layout.hidden);
  return placed
    .map((key) => {
      const part = known.get(key)!;
      return {
        key,
        title: layout.titles[key] || part.title,
        defaultTitle: part.title,
        hidden: hidden.has(key),
        open: key in layout.open ? layout.open[key] : !part.closedByDefault,
      };
    })
    .filter((item) => options.withHidden || !item.hidden);
}

/** Moves a part one place up or down among every part (hidden ones too), saving the whole order. */
export function moveHomePart(layout: GrimoireLayout, parts: HomePart[], key: string, direction: 'up' | 'down'): GrimoireLayout {
  const order = arrangeHome(layout, parts, { withHidden: true }).map((item) => item.key);
  const from = order.indexOf(key);
  const to = direction === 'up' ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= order.length) return layout;
  [order[from], order[to]] = [order[to], order[from]];
  return { ...layout, order };
}

/** Puts a part at a given place (for dragging on the website). */
export function placeHomePart(layout: GrimoireLayout, parts: HomePart[], key: string, index: number): GrimoireLayout {
  const all = arrangeHome(layout, parts, { withHidden: true }).map((item) => item.key);
  if (!all.includes(key)) return layout;
  const order = all.filter((k) => k !== key);
  order.splice(Math.max(0, Math.min(order.length, index)), 0, key);
  return { ...layout, order };
}

export function setPartOpen(layout: GrimoireLayout, key: string, open: boolean): GrimoireLayout {
  return { ...layout, open: { ...layout.open, [key]: open } };
}

export function setPartHidden(layout: GrimoireLayout, key: string, hidden: boolean): GrimoireLayout {
  const rest = layout.hidden.filter((k) => k !== key);
  return { ...layout, hidden: hidden ? [...rest, key] : rest };
}

/** Renames a part; an empty name (or its own name) goes back to the default. */
export function renamePart(layout: GrimoireLayout, key: string, title: string, defaultTitle?: string): GrimoireLayout {
  const titles = { ...layout.titles };
  const clean = title.trim().slice(0, 60);
  if (!clean || clean === defaultTitle) delete titles[key];
  else titles[key] = clean;
  return { ...layout, titles };
}

export function setPageSort(layout: GrimoireLayout, sort: PageSort): GrimoireLayout {
  return { ...layout, sort };
}

export function setPageKind(layout: GrimoireLayout, kind: string | null): GrimoireLayout {
  return { ...layout, kind: kind || null };
}

/** Forgets sections that no longer exist, so the saved layout stays small. */
export function forgetMissing(layout: GrimoireLayout, parts: HomePart[]): GrimoireLayout {
  const known = new Set(parts.map((p) => p.key));
  const keep = (k: string) => !k.startsWith('section:') || known.has(k);
  const pick = <T>(record: Record<string, T>) => Object.fromEntries(Object.entries(record).filter(([k]) => keep(k)));
  return { ...layout, order: layout.order.filter(keep), hidden: layout.hidden.filter(keep), titles: pick(layout.titles), open: pick(layout.open) };
}

/** Back to the default home (sorting and filtering stay as they are). */
export function resetHome(layout: GrimoireLayout): GrimoireLayout {
  return { ...emptyLayout(), sort: layout.sort, kind: layout.kind };
}

// ---------------------------------------------------------------------------
// The parts of a personal grimoire

export const sectionKey = (id: string) => `section:${id}`;
export const sectionIdOf = (key: string) => (key.startsWith('section:') ? key.slice(8) : null);

type SectionLike = { id: string; title: string; sort_order: number | null; created_at: string | null; is_collapsed?: boolean | null };

const byOrder = (a: SectionLike, b: SectionLike) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.created_at ?? '').localeCompare(b.created_at ?? '');

/**
 * A personal grimoire's home, in its default order: your own pages first
 * (loose pages, then each of your sections), then My Practice, Dreams, My
 * Path, and the reference shelf (Everything Else), which starts closed.
 * `shelves` are the built-in shelves showing right now ({ key, title }).
 */
export function personalParts(input: { sections: SectionLike[]; loose: boolean; shelves: { key: string; title: string }[] }): HomePart[] {
  const parts: HomePart[] = [];
  if (input.loose) parts.push({ key: 'pages', title: 'Pages' });
  for (const s of [...input.sections].sort(byOrder)) parts.push({ key: sectionKey(s.id), title: s.title, closedByDefault: s.is_collapsed === true });
  const order = ['myPractice', 'dreams', 'myPath', 'traditional'];
  const shelves = [...input.shelves].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  for (const shelf of shelves) parts.push({ key: shelf.key, title: shelf.title, closedByDefault: shelf.key === 'traditional' });
  return parts;
}

// ---------------------------------------------------------------------------
// Pages: sorted and filtered

type PageLike = { id: string; title: string; page_type?: string | null; sort_order: number | null; created_at: string | null; updated_at?: string | null };

const KIND_LABELS: Record<string, string> = {
  blank: 'Pages',
  ritual: 'Rituals',
  ritual_journal: 'Ritual journals',
  spell: 'Spells',
  apothecary: 'Apothecary',
  sigil: 'Sigils',
  holy: 'Holy days',
};

/** A page's kind for filtering: its type, with plain pages as 'blank'. */
export const pageKind = (page: Pick<PageLike, 'page_type'>) => page.page_type || 'blank';

export function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? kind.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

/** The kinds of page in a list, with how many of each, most first. */
export function pageKinds(pages: Pick<PageLike, 'page_type'>[]): { kind: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of pages) counts.set(pageKind(p), (counts.get(pageKind(p)) ?? 0) + 1);
  return [...counts.entries()].map(([kind, count]) => ({ kind, label: kindLabel(kind), count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function filterPages<T extends Pick<PageLike, 'page_type'>>(pages: T[], kind: string | null): T[] {
  return kind ? pages.filter((p) => pageKind(p) === kind) : pages;
}

export function sortPages<T extends PageLike>(pages: T[], sort: PageSort): T[] {
  const list = [...pages];
  const created = (p: T) => p.created_at ?? '';
  if (sort === 'newest') return list.sort((a, b) => created(b).localeCompare(created(a)));
  if (sort === 'oldest') return list.sort((a, b) => created(a).localeCompare(created(b)));
  if (sort === 'az') return list.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
  return list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || created(a).localeCompare(created(b)));
}

/** Pages as the home lists them: filtered by kind, then sorted. */
export function shownPages<T extends PageLike>(pages: T[], layout: Pick<GrimoireLayout, 'sort' | 'kind'>): T[] {
  return sortPages(filterPages(pages, layout.kind), layout.sort);
}
