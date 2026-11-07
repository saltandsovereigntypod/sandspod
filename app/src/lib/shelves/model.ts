// My Shelves: the real things you keep (crystals, herbs, oils, candles,
// tools, decks, books, statues, jars) as one collection, set out on painted
// shelves or read as a list. Each thing is a craft entry in `shelves.items`
// (synced like the practice tools, no new table; guests keep them on the
// device). From here a thing can be tended (a record of your own in To tend,
// linked by its id and nothing else), marked running low (it joins the
// shopping list), placed on the altar (the placed object carries its id, so
// its charges and cleansings follow it), and matched against what a spell
// or premade working needs. Pure, so it can be tested; the website reaches
// it through js/core/shelves.js.

import type { CabinetForm, CabinetItem } from '../altar/types.ts';
import { cleanVesselLabel, LABEL_MAX, type LabelFont, type LabelStyle } from '../altar/vesselLabel.ts';
import { normaliseStone, type CareLog, type StoneForm } from '../craft/crystal/stones.ts';
import { editOwn, newOwnRecord, type OwnType, type Rhythm, type TendRecord } from '../tend/model.ts';

export const SHELVES_COLLECTION = 'shelves.items';

// ─── The shelves ─────────────────────────────────────────────────────────

export type ShelfKind = 'crystals' | 'herbs' | 'oils' | 'candles' | 'tools' | 'decks' | 'books' | 'statues' | 'jars' | 'other';

export const SHELVES: { key: ShelfKind; label: string; one: string }[] = [
  { key: 'crystals', label: 'Crystals', one: 'crystal' },
  { key: 'herbs', label: 'Herbs & resins', one: 'herb or resin' },
  { key: 'oils', label: 'Oils & waters', one: 'oil or water' },
  { key: 'candles', label: 'Candles', one: 'candle' },
  { key: 'tools', label: 'Tools', one: 'tool' },
  { key: 'decks', label: 'Decks', one: 'deck' },
  { key: 'books', label: 'Books', one: 'book' },
  { key: 'statues', label: 'Statues & deities', one: 'statue' },
  { key: 'jars', label: 'Jars & spell bottles', one: 'jar or bottle' },
  { key: 'other', label: 'Other', one: 'thing' },
];

export const shelfLabel = (kind: string) => SHELVES.find((s) => s.key === kind)?.label ?? 'Other';
const isShelf = (v: unknown): v is ShelfKind => SHELVES.some((s) => s.key === v);

/**
 * Which shelf a thing belongs on, from its cabinet drawer or Library type
 * and its name ("Moon water" is a water, "Rider–Waite deck" a deck).
 */
export function shelfFor(category: string | null | undefined, name = '', type = ''): ShelfKind {
  const words = `${name} ${type}`.toLowerCase();
  if (/\b(tarot|oracle|lenormand|deck|cards?)\b/.test(words)) return 'decks';
  if (/\b(book|grimoire|almanac)\b/.test(words)) return 'books';
  if (/\b(jar|bottle|witch ?bottle|sachet|poppet|apothecary)\b/.test(words)) return 'jars';
  if (/\b(oils?|water|waters|florida|tincture|spray)\b/.test(words)) return 'oils';
  if (/\b(resin|incense|frankincense|myrrh|copal|dragon'?s blood|benzoin)\b/.test(words)) return 'herbs';
  const c = String(category || type || '').toLowerCase();
  if (/crystal|stone|mineral/.test(c)) return 'crystals';
  if (/herb|resin|incense|root|flower|spice/.test(c)) return 'herbs';
  if (/oil/.test(c)) return 'oils';
  if (/candle/.test(c)) return 'candles';
  if (/deit|statue|god/.test(c)) return 'statues';
  if (/tool|vessel/.test(c)) return 'tools';
  return 'other';
}

// ─── A thing on the shelves ──────────────────────────────────────────────

export type Level = 'full' | 'half' | 'low';
export const LEVELS: { value: Level; label: string }[] = [
  { value: 'full', label: 'Full' },
  { value: 'half', label: 'Half' },
  { value: 'low', label: 'Low' },
];
export type Quantity = { kind: 'count'; n: number } | { kind: 'level'; level: Level };

export type SourceKind = 'shop' | 'gift' | 'foraged' | 'homemade' | 'other';
export const SOURCES: { value: SourceKind; label: string }[] = [
  { value: 'shop', label: 'Shop' },
  { value: 'gift', label: 'Gift' },
  { value: 'foraged', label: 'Foraged' },
  { value: 'homemade', label: 'Homemade' },
  { value: 'other', label: 'Other' },
];

export type ShelfUse = { at: string; what: string; href?: string };

export type ShelfItem = {
  name: string;
  shelf: ShelfKind;
  /** The cabinet's picture (as the website writes it), or your own photo. */
  image: string;
  /** The cabinet item and form ("herbs:rosemary|loose"), for placing it on the altar. */
  cabinetKey: string;
  /** The Living Library page ("traditional/herb/rosemary"), for matching what a working needs. */
  ref: string;
  qty: Quantity;
  /** Marked running low: it's on the shopping list until it's restocked. */
  low: boolean;
  where: string;
  source: SourceKind;
  sourceText: string;
  /** YYYY-MM-DD, or ''. */
  acquired: string;
  notes: string;
  intention: string;
  /** Tending: on or off, and your own rhythm (null keeps the shelf's own). */
  tend: { on: boolean; rhythm: Rhythm | null };
  /** Count one down each time it's used in a spell (count items only). */
  countDown: boolean;
  /** Workings it went into, oldest first. */
  uses: ShelfUse[];
  /** When it was restocked, oldest first. */
  restocks: string[];
  /** The words on its jar, bottle, box or spine ('' says its name), and how the label looks (lib/altar/vesselLabel.ts). */
  label: string;
  labelStyle: LabelStyle;
  labelFont: LabelFont;
  /** On the Crystals shelf: one of My stones, with its care key, form, care log and intentions. */
  stone?: ShelfStone;
};

// ─── A crystal that is one of My stones ──────────────────────────────────

export type ShelfStone = {
  /** The id it had in crystal.stones, kept so links to it still work; '' for a stone added on the shelves. */
  stoneId: string;
  key: string | null;
  form: StoneForm;
  intentions: string[];
  care: CareLog[];
};

/** A stone's own fields on a crystal (lib/shelves/stones.ts), from any older or partial shape. */
export function cleanShelfStone(raw: unknown): ShelfStone | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Partial<ShelfStone>;
  const s = normaliseStone({ key: r.key ?? null, name: 'x', form: r.form, intentions: r.intentions, care: r.care });
  return { stoneId: typeof r.stoneId === 'string' ? r.stoneId.slice(0, 80) : '', key: s.key ?? null, form: s.form, intentions: s.intentions.slice(0, 50), care: s.care.slice(-300) };
}

export const NAME_MAX = 120;
export const TEXT_MAX = 2000;
const USES_MAX = 100;
const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isDay = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

function cleanQty(raw: unknown): Quantity {
  const q = (raw && typeof raw === 'object' ? raw : {}) as Partial<{ kind: string; n: unknown; level: unknown }>;
  if (q.kind === 'level') return { kind: 'level', level: LEVELS.some((l) => l.value === q.level) ? (q.level as Level) : 'full' };
  const n = Math.round(Number(q.n));
  return { kind: 'count', n: Number.isFinite(n) && n >= 0 ? Math.min(n, 9999) : 1 };
}

const labelLook = (style: unknown, font: unknown) => {
  const look = cleanVesselLabel({ style, font });
  return { labelStyle: look?.style ?? 'paper', labelFont: look?.font ?? 'ink' } as { labelStyle: LabelStyle; labelFont: LabelFont };
};

/** A saved thing from any older or partial shape. */
export function cleanItem(raw: unknown): ShelfItem {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof ShelfItem, unknown>>;
  const tend = (r.tend && typeof r.tend === 'object' ? r.tend : {}) as { on?: unknown; rhythm?: unknown };
  const name = str(r.name, NAME_MAX) || 'Something of mine';
  return {
    name,
    shelf: isShelf(r.shelf) ? r.shelf : shelfFor('', name),
    image: str(r.image, 2000),
    cabinetKey: str(r.cabinetKey, 200),
    ref: str(r.ref, 200),
    qty: cleanQty(r.qty),
    low: r.low === true,
    where: str(r.where, 120),
    source: SOURCES.some((s) => s.value === r.source) ? (r.source as SourceKind) : 'shop',
    sourceText: str(r.sourceText, 200),
    acquired: isDay(r.acquired) ? r.acquired : '',
    notes: str(r.notes, TEXT_MAX),
    intention: str(r.intention, 500),
    tend: { on: tend.on !== false, rhythm: tend.rhythm && typeof tend.rhythm === 'object' ? (tend.rhythm as Rhythm) : null },
    countDown: r.countDown === true,
    uses: Array.isArray(r.uses) ? (r.uses as ShelfUse[]).filter((u) => u && typeof u.at === 'string').map((u) => ({ at: u.at, what: str(u.what, 200), ...(u.href ? { href: str(u.href, 300) } : {}) })).slice(-USES_MAX) : [],
    restocks: Array.isArray(r.restocks) ? (r.restocks as unknown[]).filter((x): x is string => typeof x === 'string').slice(-USES_MAX) : [],
    label: str(r.label, LABEL_MAX),
    ...labelLook(r.labelStyle, r.labelFont),
    ...(cleanShelfStone(r.stone) ? { stone: cleanShelfStone(r.stone) } : {}),
  };
}

/** A new thing, with the shelf's own way of tending it. */
export function newItem(input: Partial<ShelfItem> & { name: string }): ShelfItem {
  const shelf = input.shelf ?? shelfFor('', input.name);
  return cleanItem({ qty: shelf === 'herbs' || shelf === 'oils' ? { kind: 'level', level: 'full' } : { kind: 'count', n: 1 }, tend: { on: !!tendPlanFor(shelf), rhythm: null }, ...input, shelf });
}

// ─── How much is left ────────────────────────────────────────────────────

/** Running low: marked so, at "Low", or none left. */
export const isLow = (item: Pick<ShelfItem, 'low' | 'qty'>) => item.low || (item.qty.kind === 'level' ? item.qty.level === 'low' : item.qty.n <= 0);

export function qtyLabel(qty: Quantity): string {
  if (qty.kind === 'level') return LEVELS.find((l) => l.value === qty.level)!.label;
  return qty.n === 0 ? 'None left' : `${qty.n}`;
}

/** Marked running low: onto the shopping list. */
export const markLow = (item: ShelfItem): ShelfItem => ({ ...item, low: true, qty: item.qty.kind === 'level' ? { kind: 'level', level: 'low' } : item.qty });

/** Restocked: off the shopping list, and the quantity back up (full, or `bought` more; one if none said). */
export function restock(item: ShelfItem, at: Date, bought = 1): ShelfItem {
  const qty: Quantity = item.qty.kind === 'level' ? { kind: 'level', level: 'full' } : { kind: 'count', n: Math.max(0, item.qty.n) + Math.max(1, Math.round(bought) || 1) };
  return { ...item, low: false, qty, restocks: [...item.restocks, at.toISOString()].slice(-USES_MAX) };
}

export type ShoppingGroup = { shelf: ShelfKind; label: string; items: { id: string; item: ShelfItem }[] };

/** The shopping list: everything running low, grouped by shelf in shelf order, by name within. */
export function shoppingList(entries: { id: string; item: ShelfItem }[]): ShoppingGroup[] {
  return SHELVES.map((s) => ({
    shelf: s.key,
    label: s.label,
    items: entries.filter((e) => e.item.shelf === s.key && isLow(e.item)).sort((a, b) => a.item.name.localeCompare(b.item.name)),
  })).filter((g) => g.items.length > 0);
}

/**
 * Used in a working: kept in its story, and with "count down" on, one fewer
 * (none left puts it on the shopping list).
 */
export function usedInWorking(item: ShelfItem, what: string, at: Date, href?: string): ShelfItem {
  const uses = [...item.uses, { at: at.toISOString(), what: what.trim().slice(0, 200) || 'A working', ...(href ? { href } : {}) }].slice(-USES_MAX);
  if (!item.countDown || item.qty.kind !== 'count') return { ...item, uses };
  const n = Math.max(0, item.qty.n - 1);
  return { ...item, uses, qty: { kind: 'count', n }, low: item.low || n === 0 };
}

// ─── Where it's kept ─────────────────────────────────────────────────────

/** Places you've kept things before, most used first, for suggestions. */
export function whereSuggestions(items: Pick<ShelfItem, 'where'>[], limit = 8): string[] {
  const counts = new Map<string, { label: string; n: number }>();
  for (const { where } of items) {
    const w = where.trim();
    if (!w) continue;
    const key = w.toLowerCase();
    const hit = counts.get(key);
    counts.set(key, { label: hit?.label ?? w, n: (hit?.n ?? 0) + 1 });
  }
  return [...counts.values()].sort((a, b) => b.n - a.n || a.label.localeCompare(b.label)).slice(0, limit).map((c) => c.label);
}

// ─── Tending ─────────────────────────────────────────────────────────────

export type TendPlan = { type: OwnType; other: string; rhythm: Rhythm; line: string };

/**
 * How each shelf is tended until you choose otherwise (common modern
 * practice, not tradition): crystals cleansed and recharged at the full
 * moon; dried herbs and resins checked about a year after you got them;
 * oils after about a year (many keep up to two); moon and other waters made
 * fresh each full moon; spell jars and bottles checked on monthly; statues
 * and tools dusted and cleansed monthly. Decks are cleansed when you feel
 * they need it (after heavy use), so nothing is set; candles and books ask
 * nothing; living plants are tended in the garden instead.
 */
export function tendPlanFor(shelf: ShelfKind, name = ''): TendPlan | null {
  if (shelf === 'crystals') return { type: 'cleansing', other: '', rhythm: { kind: 'moon', moon: 'full' }, line: 'Cleanse and recharge at each full moon' };
  if (shelf === 'herbs') return { type: 'other', other: 'Check it’s still good', rhythm: { kind: 'every', every: 365 }, line: 'Best by about 12 months after you got it' };
  if (shelf === 'oils') {
    if (/water/i.test(name)) return { type: 'water', other: '', rhythm: { kind: 'moon', moon: 'full' }, line: 'Made fresh each full moon' };
    return { type: 'other', other: 'Check it’s still good', rhythm: { kind: 'every', every: 365 }, line: 'Best by about 12 months (many oils keep up to two years)' };
  }
  if (shelf === 'jars') return { type: 'other', other: 'Check in on it', rhythm: { kind: 'every', every: 30 }, line: 'Check in on it each month' };
  if (shelf === 'statues' || shelf === 'tools') return { type: 'cleansing', other: '', rhythm: { kind: 'every', every: 30 }, line: 'Dust and cleanse each month' };
  return null;
}

/** "Best by 3 Nov 2027" for herbs, resins and oils (from when you got it), or ''. */
export function bestBy(item: Pick<ShelfItem, 'shelf' | 'acquired' | 'name'>): string {
  if (!item.acquired || !(item.shelf === 'herbs' || (item.shelf === 'oils' && !/water/i.test(item.name)))) return '';
  const [y, m, d] = item.acquired.split('-').map(Number);
  const at = new Date(y + 1, m - 1, d);
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`;
}

/** Past its best-by day. */
export const pastBest = (item: Pick<ShelfItem, 'shelf' | 'acquired' | 'name'>, now: Date) => {
  const day = bestBy(item);
  return !!day && day <= `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/** The To tend key for a thing on the shelves. */
export const tendKeyOf = (id: string) => `own:shelf-${id}`;

/**
 * Its record in To tend (a thing of your own, linked to this one by its id),
 * new or brought up to date; null when it isn't tended (turned off, or a
 * shelf that asks nothing and no rhythm of your own). A best-by counts from
 * the day you got it.
 */
export function shelfTendRecord(id: string, item: ShelfItem, existing: TendRecord | null | undefined): TendRecord | null {
  const plan = tendPlanFor(item.shelf, item.name);
  // Yours (chosen here, or changed in To tend) wins over the shelf's own.
  const rhythm = item.tend.rhythm ?? existing?.rhythm ?? plan?.rhythm ?? null;
  if (!item.tend.on || !rhythm) return null;
  const input = { name: item.name, type: plan?.type ?? ('other' as OwnType), other: plan?.other ?? 'Tend it', notes: plan?.line ?? '', rhythm };
  const fresh = newOwnRecord(input, `shelf-${id}`);
  const base = existing ?? { ...fresh, own: { ...fresh.own!, shelf: id } };
  const record = editOwn(base, input);
  const since = !existing && item.acquired && rhythm.kind === 'every' ? new Date(`${item.acquired}T12:00:00`).toISOString() : '';
  return {
    ...record,
    source: 'My Shelves',
    href: `/rituals/shelves/${id}`,
    ...(since && !record.tendedAt ? { tendedAt: since } : {}),
  };
}

// ─── Reading them ────────────────────────────────────────────────────────

export type ShelfSort = 'shelf' | 'tending' | 'low' | 'name' | 'added';
export const SORTS: { value: ShelfSort; label: string }[] = [
  { value: 'shelf', label: 'By shelf' },
  { value: 'tending', label: 'Needs tending' },
  { value: 'low', label: 'Running low' },
  { value: 'name', label: 'Name' },
  { value: 'added', label: 'Date added' },
];

export type ShelfEntry = { id: string; createdAt: string; item: ShelfItem };

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Search and sort: by words (name, shelf, where, notes, intention), then by
 * shelf, what needs tending first (`dueAt` says when each is next due), what's
 * running low first, name, or newest added.
 */
export function sortShelf(entries: ShelfEntry[], sort: ShelfSort, query = '', dueAt: (id: string) => number | null = () => null): ShelfEntry[] {
  const words = fold(query).split(' ').filter(Boolean);
  const hit = (e: ShelfEntry) => {
    const text = fold([e.item.name, shelfLabel(e.item.shelf), e.item.where, e.item.notes, e.item.intention, e.item.sourceText].join(' '));
    return words.every((w) => text.includes(w));
  };
  const order = (k: ShelfKind) => SHELVES.findIndex((s) => s.key === k);
  const byName = (a: ShelfEntry, b: ShelfEntry) => a.item.name.localeCompare(b.item.name);
  const found = entries.filter(hit);
  if (sort === 'name') return found.sort(byName);
  if (sort === 'added') return found.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (sort === 'low') return found.sort((a, b) => Number(isLow(b.item)) - Number(isLow(a.item)) || byName(a, b));
  if (sort === 'tending') {
    const at = (e: ShelfEntry) => dueAt(e.id) ?? Infinity;
    return found.sort((a, b) => at(a) - at(b) || byName(a, b));
  }
  return found.sort((a, b) => order(a.item.shelf) - order(b.item.shelf) || byName(a, b));
}

/** Each shelf with what's on it (empty shelves too, so the cabinet keeps its shape). */
export const byShelf = (entries: ShelfEntry[]) => SHELVES.map((s) => ({ ...s, entries: entries.filter((e) => e.item.shelf === s.key).sort((a, b) => a.item.name.localeCompare(b.item.name)) }));

// ─── What a working needs ────────────────────────────────────────────────

export type Needed = { name: string; ref?: string | null; optional?: boolean };
export type IngredientMatch<T extends Needed = Needed> = { have: { need: T; id: string; item: ShelfItem }[]; need: T[] };

// Words that say how much or what form, not what.
const FILLER = new Set(['a', 'an', 'the', 'of', 'and', 'or', 'some', 'few', 'small', 'large', 'fresh', 'dried', 'pinch', 'handful', 'tsp', 'tbsp', 'g', 'ml', 'piece', 'pieces', 'sprig', 'sprigs', 'your', 'any', 'one', 'two', 'three', 'for', 'to', 'with', 'loose', 'tumble', 'tumbled', 'raw', 'chips', 'point']);
const stem = (w: string) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
const keyWords = (s: string) => fold(s).split(' ').filter((w) => w && !FILLER.has(w) && !/^\d+$/.test(w)).map(stem);

/** Whether a thing on the shelves is what an ingredient asks for: the same Library page, or every word of its name in the ingredient. */
export function matchesNeed(item: Pick<ShelfItem, 'name' | 'ref'>, need: Needed): boolean {
  if (item.ref && need.ref && item.ref === need.ref) return true;
  const mine = keyWords(item.name);
  if (!mine.length) return false;
  const theirs = new Set(keyWords(need.name));
  return mine.every((w) => theirs.has(w));
}

/**
 * "You have these / you'll need these": each ingredient matched to something
 * on your shelves with some left (one thing can answer several). Something
 * with none left counts as needed.
 */
export function matchIngredients<T extends Needed>(needs: T[], entries: { id: string; item: ShelfItem }[]): IngredientMatch<T> {
  const have: IngredientMatch<T>['have'] = [];
  const need: T[] = [];
  for (const n of needs) {
    const found = entries.find((e) => matchesNeed(e.item, n) && !(e.item.qty.kind === 'count' && e.item.qty.n <= 0));
    if (found) have.push({ need: n, id: found.id, item: found.item });
    else need.push(n);
  }
  return { have, need };
}

// ─── Its story ───────────────────────────────────────────────────────────

/** Rhythms to choose from on a thing (null: the shelf's own). */
export const SHELF_RHYTHMS: { label: string; rhythm: Rhythm | null }[] = [
  { label: 'The shelf’s own', rhythm: null },
  { label: 'Every week', rhythm: { kind: 'weekly' } },
  { label: 'Every month', rhythm: { kind: 'every', every: 30 } },
  { label: 'Every full moon', rhythm: { kind: 'moon', moon: 'full' } },
  { label: 'Every new moon', rhythm: { kind: 'moon', moon: 'new' } },
  { label: 'Once a year', rhythm: { kind: 'every', every: 365 } },
];
export const sameRhythm = (a: Rhythm | null, b: Rhythm | null) => JSON.stringify(a) === JSON.stringify(b);

export type StoryLine = { at: string; text: string };

/**
 * Its whole story, newest first: when you got it, each time it was tended
 * (from To tend), restocked or used in a working, and whatever the altar
 * remembers of it (charges, cleansings: `altarLines`, from each placed
 * object carrying its id).
 */
export function shelfStory(item: ShelfItem, record: TendRecord | null | undefined, altarLines: StoryLine[] = []): StoryLine[] {
  const lines: StoryLine[] = [];
  if (item.acquired) {
    const how = item.source === 'gift' ? 'Given to you' : item.source === 'foraged' ? 'Foraged' : item.source === 'homemade' ? 'Made by you' : item.source === 'shop' ? 'Bought' : 'Came to you';
    lines.push({ at: `${item.acquired}T12:00:00`, text: `${how}${item.sourceText ? ` (${item.sourceText})` : ''}.` });
  }
  for (const c of record?.done ?? []) lines.push({ at: c.at, text: `Tended${c.how.length ? `: ${c.how.join(', ').toLowerCase()}` : ''}.${c.note ? ` ${c.note}` : ''}` });
  for (const at of item.restocks) lines.push({ at, text: 'Restocked.' });
  for (const u of item.uses) lines.push({ at: u.at, text: `Used in ${u.what}.` });
  lines.push(...altarLines);
  return lines.sort((a, b) => b.at.localeCompare(a.at));
}

// ─── On the altar ────────────────────────────────────────────────────────

/** The field a placed altar object carries: which thing on the shelves it is, so its history follows it. */
export const SHELF_FIELD = 'shelfItemId';

const SHELF_TYPE: Record<ShelfKind, string> = { crystals: 'crystal', herbs: 'herb', oils: 'oil', candles: 'candle', tools: 'tool', decks: 'tool', books: 'tool', statues: 'deity', jars: 'vessel', other: 'tool' };

/**
 * What to place for a thing on the shelves: its cabinet item and form when it
 * came from the cabinet (`fromCabinet` finds it), otherwise its own photo as
 * a one-form item.
 */
export function shelfPlacement(id: string, item: ShelfItem, fromCabinet: (key: string) => { item: CabinetItem; form: CabinetForm } | null): { item: CabinetItem; form: CabinetForm } | null {
  const found = item.cabinetKey ? fromCabinet(item.cabinetKey) : null;
  if (found) return found;
  if (!item.image) return null;
  const form: CabinetForm = { label: item.name, image: item.image, type: SHELF_TYPE[item.shelf], custom: true };
  return { item: { id: `shelf:${id}`, category: 'tools', name: item.name, keywords: [], forms: [form] }, form };
}

/** The altar objects (across your altars) that are this thing. */
export function placedObjects<O extends Record<string, unknown>>(altars: { id: string; name?: string; objects?: O[] }[], id: string): { altarId: string; altarName: string; object: O }[] {
  return altars.flatMap((a) => (a.objects ?? []).filter((o) => o[SHELF_FIELD] === id).map((object) => ({ altarId: a.id, altarName: a.name || 'My Altar', object })));
}
