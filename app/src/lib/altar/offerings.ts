// Offerings that age. Water evaporates in a day or two, bread goes stale,
// fruit softens and cut flowers wilt; stones, coins and dried herbs keep.
// What a bowl, dish or chalice holds is kept in `livingState.app.offering`;
// a fresh sprig on the altar is a cut offering of its own, and a deity's
// latest food, drink or flower offering ages the same way. Every refresh,
// return and removal goes in the object's log. Pure, so it can be tested.

import { isCandle, logAppEvent, appStateOf, placedAtOf } from './livingState.ts';
import type { SavedObject } from './types.ts';
import type { Offering } from './devotion.ts';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export type OfferingKindId =
  | 'water'
  | 'drink'
  | 'milk'
  | 'bread'
  | 'fruit'
  | 'sweets'
  | 'cooked'
  | 'flowers'
  | 'dried'
  | 'stones'
  | 'coins';

export type OfferingKind = {
  id: OfferingKindId;
  label: string;
  /** About how long it stays fresh (null: it keeps). */
  lifeMs: number | null;
  /** How the change shows: evaporating, going stale, softening or wilting. */
  ages: 'evaporates' | 'stale' | 'softens' | 'spoils' | 'wilts' | null;
  words: string[];
};

export const OFFERING_KINDS: OfferingKind[] = [
  { id: 'water', label: 'Water', lifeMs: 36 * HOUR, ages: 'evaporates', words: ['water', 'moon water', 'rain', 'spring water'] },
  { id: 'drink', label: 'Wine, spirits or juice', lifeMs: 36 * HOUR, ages: 'evaporates', words: ['wine', 'mead', 'beer', 'ale', 'whiskey', 'whisky', 'rum', 'juice', 'coffee', 'tea', 'cider', 'drink'] },
  { id: 'milk', label: 'Milk or cream', lifeMs: DAY, ages: 'spoils', words: ['milk', 'cream'] },
  { id: 'bread', label: 'Bread or grain cake', lifeMs: 60 * HOUR, ages: 'stale', words: ['bread', 'loaf', 'cake', 'biscuit', 'oatcake', 'bannock'] },
  { id: 'fruit', label: 'Fruit', lifeMs: 4 * DAY, ages: 'softens', words: ['fruit', 'apple', 'pomegranate', 'orange', 'grape', 'berries', 'berry', 'fig', 'pear', 'plum', 'peach', 'lemon'] },
  { id: 'sweets', label: 'Sweets or honey cakes', lifeMs: 3 * DAY, ages: 'stale', words: ['sweet', 'sweets', 'chocolate', 'candy', 'honey cake', 'cookie'] },
  { id: 'cooked', label: 'A cooked meal', lifeMs: DAY, ages: 'spoils', words: ['meal', 'food', 'soup', 'stew', 'rice', 'egg', 'meat'] },
  { id: 'flowers', label: 'Cut flowers or fresh greenery', lifeMs: 6 * DAY, ages: 'wilts', words: ['flower', 'flowers', 'rose', 'roses', 'bouquet', 'posy', 'sprig', 'lily', 'marigold'] },
  { id: 'dried', label: 'Dried herbs, grain or salt', lifeMs: null, ages: null, words: ['dried', 'salt', 'grain', 'seeds', 'incense', 'resin'] },
  { id: 'stones', label: 'Stones or shells', lifeMs: null, ages: null, words: ['stone', 'stones', 'crystal', 'shell', 'shells', 'pebble'] },
  { id: 'coins', label: 'Coins or keepsakes', lifeMs: null, ages: null, words: ['coin', 'coins', 'keepsake', 'jewellery', 'jewelry', 'ring'] },
];

export const offeringKind = (id: string) => OFFERING_KINDS.find((k) => k.id === id) ?? null;

/** The kind some free words name ("a glass of red wine" → drink), or null. */
export function kindFromWords(text: string): OfferingKindId | null {
  const words = ` ${text.toLowerCase().replace(/[^a-z ]+/g, ' ')} `;
  // Longer phrases first, so "honey cake" is sweets rather than bread.
  const pairs = OFFERING_KINDS.flatMap((k) => k.words.map((w) => ({ id: k.id, w }))).sort((a, b) => b.w.length - a.w.length);
  return pairs.find(({ w }) => words.includes(` ${w} `))?.id ?? null;
}

// ── Freshness ─────────────────────────────────────────────────────────────

export type FreshnessLevel = 'fresh' | 'fading' | 'refresh' | 'lasting';

export type Freshness = {
  level: FreshnessLevel;
  /** 0 when just set out, 1 when it's time to refresh it (may go past 1). */
  age: number;
  sinceMs: number;
  lifeMs: number | null;
  /** When it'll want refreshing, or null for things that keep. */
  dueAt: number | null;
};

/** How fresh something of this kind is, set out (or last refreshed) at `since`. */
export function freshness(kind: OfferingKindId, since: number, now: number): Freshness {
  const lifeMs = offeringKind(kind)?.lifeMs ?? null;
  const sinceMs = Number.isFinite(since) ? Math.max(0, now - since) : 0;
  if (!lifeMs) return { level: 'lasting', age: 0, sinceMs, lifeMs: null, dueAt: null };
  const age = sinceMs / lifeMs;
  return { level: age < 0.6 ? 'fresh' : age < 1 ? 'fading' : 'refresh', age, sinceMs, lifeMs, dueAt: since + lifeMs };
}

export const FRESHNESS_WORDS: Record<FreshnessLevel, string> = {
  fresh: 'Fresh',
  fading: 'Fading',
  refresh: 'Time to refresh',
  lasting: 'Keeps',
};

/** "Fading: the water is evaporating" — the panel's line. */
export function freshnessLine(kind: OfferingKindId, fresh: Freshness): string {
  const k = offeringKind(kind);
  if (!k || fresh.level === 'lasting') return 'This keeps; it doesn’t need refreshing.';
  const change =
    k.ages === 'evaporates'
      ? 'evaporating'
      : k.ages === 'stale'
        ? 'going stale'
        : k.ages === 'softens'
          ? 'softening'
          : k.ages === 'wilts'
            ? 'wilting'
            : 'turning';
  if (fresh.level === 'fresh') return `Fresh. Set out ${ago(fresh.sinceMs)}.`;
  if (fresh.level === 'fading') return `Fading, and ${change}. Set out ${ago(fresh.sinceMs)}.`;
  return `Time to refresh: it has been out ${ago(fresh.sinceMs).replace(' ago', '')}. ${k.ages === 'evaporates' ? 'Pour it out' : 'Return it to the earth'} and set out fresh.`;
}

function ago(ms: number): string {
  const hours = Math.floor(ms / HOUR);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

/** How the stage shows its age: a little paler, lower or drooping as it goes. */
export function agingLook(kind: OfferingKindId, fresh: Freshness): { opacity: number; droop: number; level: number } {
  if (fresh.level === 'lasting') return { opacity: 1, droop: 0, level: 1 };
  const t = Math.max(0, Math.min(1.5, fresh.age)) / 1.5;
  const ages = offeringKind(kind)?.ages;
  return {
    opacity: Math.round((1 - 0.35 * t) * 100) / 100,
    // Flowers bow their heads (degrees), others stay upright.
    droop: ages === 'wilts' ? Math.round(10 * t * 10) / 10 : 0,
    // Water and drink sink in their vessel (1 full → 0.4).
    level: ages === 'evaporates' ? Math.round((1 - 0.6 * t) * 100) / 100 : 1,
  };
}

// ── What's on the altar ──────────────────────────────────────────────────

/** Vessels that hold an offering. */
const HOLDERS = new Set(['offering-bowl', 'dish', 'bowl', 'chalice', 'cauldron']);

export function holdsOfferings(object: SavedObject): boolean {
  return (object.type === 'vessel' && HOLDERS.has(String(object.vessel))) || (object.type === 'tool' && object.tool === 'chalice');
}

/** A fresh-cut sprig set on the altar ages like cut flowers. */
export const isFreshSprig = (object: SavedObject) => object.type === 'herb' && object.form === 'sprig';

export type OfferingContents = {
  kind: OfferingKindId;
  label: string;
  /** When it was set out or last refreshed. */
  since: string;
};

/** What the object holds or is, as an offering, or null (an empty bowl, or not an offering at all). */
export function offeringOf(object: SavedObject): OfferingContents | null {
  if (isCandle(object)) return null;
  const raw = appStateOf(object).offering as Partial<OfferingContents> | null | undefined;
  if (raw && typeof raw === 'object') {
    const kind = offeringKind(String(raw.kind || ''));
    return kind ? { kind: kind.id, label: String(raw.label || ''), since: String(raw.since || '') } : null;
  }
  if (raw === null) return null;
  if (isFreshSprig(object)) {
    const placed = placedAtOf(object);
    return Number.isFinite(placed) ? { kind: 'flowers', label: '', since: new Date(placed).toISOString() } : null;
  }
  return null;
}

export const canHoldOffering = (object: SavedObject) => holdsOfferings(object) || isFreshSprig(object);

export function offeringFreshness(object: SavedObject, now: number): (Freshness & { kind: OfferingKindId }) | null {
  const contents = offeringOf(object);
  if (!contents) return null;
  return { ...freshness(contents.kind, Date.parse(contents.since), now), kind: contents.kind };
}

const what = (contents: { kind: OfferingKindId; label: string }) => contents.label.trim() || offeringKind(contents.kind)?.label.toLowerCase() || 'offering';

/** Set something out in a bowl or dish (or say what a sprig is). */
export function setOffering(object: SavedObject, kind: OfferingKindId, label: string, now: string): SavedObject {
  if (!canHoldOffering(object) || !offeringKind(kind)) return object;
  const offering: OfferingContents = { kind, label: label.trim(), since: now };
  return logAppEvent(object, { kind: 'offering', text: `Set out ${what(offering)}.` }, now, { offering });
}

/** Fresh water, bread or flowers in place of the old. */
export function refreshOffering(object: SavedObject, now: string): SavedObject {
  const contents = offeringOf(object);
  if (!contents) return object;
  return logAppEvent(object, { kind: 'offering', text: `Refreshed the ${what(contents)}.` }, now, { offering: { ...contents, since: now } });
}

export type OfferingEnd = 'returned' | 'removed';

/**
 * The offering is done: returned to nature (poured on the earth, left under a
 * tree) or taken away. A bowl stays on the altar, empty; a sprig is the
 * offering itself, so the caller takes it off the altar.
 */
export function endOffering(object: SavedObject, how: OfferingEnd, now: string): SavedObject {
  const contents = offeringOf(object);
  if (!contents) return object;
  const text = how === 'returned' ? `Returned the ${what(contents)} to nature.` : `Cleared away the ${what(contents)}.`;
  return logAppEvent(object, { kind: 'offering', text }, now, { offering: null });
}

// ── A deity's offerings ──────────────────────────────────────────────────

/** Statuses that mean the offering is still sitting out. */
const STILL_OUT = new Set(['', 'offered', 'present-on-altar']);

/** What kind of thing an offering record is, from its types and the words of its items. */
export function deityOfferingKind(offering: Pick<Offering, 'types' | 'items' | 'message'>): OfferingKindId | null {
  const words = [...(offering.items ?? []).map((i) => i.label), offering.message ?? ''].join(' ');
  const named = kindFromWords(words);
  if (named) return named;
  const types = offering.types ?? [];
  if (types.includes('drink')) return 'drink';
  if (types.includes('flowers')) return 'flowers';
  if (types.includes('food')) return 'bread';
  if (types.includes('coins')) return 'coins';
  if (types.includes('crystals')) return 'stones';
  if (types.includes('herbs')) return 'dried';
  return null;
}

/** A deity's latest offering, if it's still out and is the kind of thing that ages. */
export function agingDeityOffering(offerings: Offering[], now: number): { offering: Offering; kind: OfferingKindId; fresh: Freshness } | null {
  const latest = offerings[0];
  if (!latest || !STILL_OUT.has(String(latest.status || ''))) return null;
  const kind = deityOfferingKind(latest);
  if (!kind || !offeringKind(kind)?.lifeMs) return null;
  return { offering: latest, kind, fresh: freshness(kind, Date.parse(latest.occurredAt), now) };
}
