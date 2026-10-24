// Offerings that age. Water evaporates in a day or two, bread goes stale,
// fruit softens and cut flowers wilt; stones, coins and dried herbs keep.
// What a bowl, dish or chalice holds is kept in `livingState.app.offering`;
// a fresh sprig on the altar is a cut offering of its own (and so is a
// picture of your own named for something that perishes: "Apples", "Bread"),
// and a deity's latest food, drink or flower offering ages the same way.
// Each kind goes through four stages in real time (fresh, then two of its own,
// then gone over), drawn on the altar by offeringArt.ts. Every refresh,
// return, removal and choice to leave it be goes in the object's log. Pure,
// so it can be tested.

import { isCandle, logAppEvent, appStateOf, placedAtOf } from './livingState.ts';
import { isFrame } from './frame.ts';
import { seasonalFood, seasonalIdOf } from './seasonal.ts';
import { shelfObjectOf } from './shelf.ts';
import type { SavedObject } from './types.ts';
import type { Offering } from './devotion.ts';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export type OfferingKindId =
  | 'water'
  | 'drink'
  | 'milk'
  | 'honey'
  | 'bread'
  | 'fruit'
  | 'harvest'
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
  /** How the change shows: evaporating, going stale, softening, spoiling, thickening or wilting. */
  ages: 'evaporates' | 'stale' | 'softens' | 'spoils' | 'thickens' | 'wilts' | null;
  words: string[];
  /**
   * Its four stages: fresh, a first change, the change that asks for it to be
   * refreshed (from `lifeMs`), and gone over (from `overMs`). Each is the word
   * shown and how a sentence says it ("is wilting", "has dried up").
   */
  stages?: [OfferingStageWords, OfferingStageWords, OfferingStageWords, OfferingStageWords];
  /** When it has gone right over (the last stage). */
  overMs?: number;
};

export type OfferingStageWords = { name: string; says: string };

const st = (name: string, says: string): OfferingStageWords => ({ name, says });
const FRESH = st('Fresh', 'is fresh');

export const OFFERING_KINDS: OfferingKind[] = [
  // A bowl of water drops a little each day and dries to a pale ring in three or four.
  { id: 'water', label: 'Water', lifeMs: 36 * HOUR, ages: 'evaporates', words: ['water', 'moon water', 'rain', 'spring water'],
    stages: [FRESH, st('A little lower', 'is a little lower'), st('Low', 'is low'), st('Dried up', 'has dried up')], overMs: 4 * DAY },
  // Wine and spirits go flat, turn and evaporate, leaving a stain.
  { id: 'drink', label: 'Wine, spirits or juice', lifeMs: 36 * HOUR, ages: 'evaporates', words: ['wine', 'mead', 'beer', 'ale', 'whiskey', 'whisky', 'rum', 'juice', 'coffee', 'tea', 'cider', 'drink'],
    stages: [FRESH, st('Going flat', 'is going flat'), st('Turning', 'is turning'), st('Dried to a stain', 'has dried to a stain')], overMs: 5 * DAY },
  { id: 'milk', label: 'Milk or cream', lifeMs: DAY, ages: 'spoils', words: ['milk', 'cream'],
    stages: [FRESH, st('Turning', 'is turning'), st('Sour', 'has soured'), st('Curdled', 'has curdled')], overMs: 3 * DAY },
  // Honey keeps, but left open it thickens, gathers dust and crusts over.
  { id: 'honey', label: 'Honey or syrup', lifeMs: 2 * DAY, ages: 'thickens', words: ['honey', 'syrup', 'molasses', 'treacle'],
    stages: [FRESH, st('Thickening', 'is thickening'), st('Gathering dust', 'is gathering dust'), st('Crusted over', 'has crusted over')], overMs: 5 * DAY },
  { id: 'bread', label: 'Bread or grain cake', lifeMs: 60 * HOUR, ages: 'stale', words: ['bread', 'loaf', 'cake', 'biscuit', 'oatcake', 'bannock'],
    stages: [FRESH, st('Drying at the edges', 'is drying at the edges'), st('Stale', 'has gone stale'), st('Hard and dry', 'has gone hard')], overMs: 5 * DAY },
  { id: 'fruit', label: 'Fruit', lifeMs: 4 * DAY, ages: 'softens', words: ['fruit', 'apple', 'apples', 'pomegranate', 'orange', 'oranges', 'grape', 'grapes', 'berries', 'berry', 'fig', 'figs', 'pear', 'pears', 'plum', 'plums', 'peach', 'lemon'],
    stages: [FRESH, st('Softening', 'is softening'), st('Browning', 'is browning'), st('Going over', 'is going over')], overMs: 7 * DAY },
  // Whole apples, pomegranates, gourds and squash from the harvest keep far
  // longer than cut or soft fruit: they soften over a couple of weeks.
  { id: 'harvest', label: 'Whole apples, gourds or squash', lifeMs: 14 * DAY, ages: 'softens', words: ['gourd', 'gourds', 'squash', 'squashes', 'pumpkin', 'pumpkins', 'marrow'],
    stages: [FRESH, st('Softening', 'is softening'), st('Browning', 'is browning'), st('Going over', 'is going over')], overMs: 30 * DAY },
  { id: 'sweets', label: 'Sweets or honey cakes', lifeMs: 3 * DAY, ages: 'stale', words: ['sweet', 'sweets', 'chocolate', 'candy', 'honey cake', 'honey cakes', 'cookie', 'cookies'],
    stages: [FRESH, st('Drying', 'is drying out'), st('Stale', 'has gone stale'), st('Hard and dry', 'has gone hard')], overMs: 7 * DAY },
  { id: 'cooked', label: 'A cooked meal', lifeMs: DAY, ages: 'spoils', words: ['meal', 'food', 'soup', 'stew', 'rice', 'egg', 'eggs', 'meat'],
    stages: [FRESH, st('Gone cold', 'has gone cold'), st('Turning', 'is turning'), st('Spoiled', 'has spoiled')], overMs: 2 * DAY },
  // Cut flowers droop after a few days, wilt in a week and drop their petals after.
  { id: 'flowers', label: 'Cut flowers or fresh greenery', lifeMs: 6 * DAY, ages: 'wilts', words: ['flower', 'flowers', 'rose', 'roses', 'bouquet', 'posy', 'sprig', 'lily', 'lilies', 'marigold', 'marigolds', 'daisies', 'tulips', 'carnations'],
    stages: [FRESH, st('Drooping', 'is drooping'), st('Wilting', 'is wilting'), st('Faded', 'has faded')], overMs: 9 * DAY },
  { id: 'dried', label: 'Dried herbs, grain or salt', lifeMs: null, ages: null, words: ['dried', 'salt', 'grain', 'seeds', 'incense', 'resin'] },
  { id: 'stones', label: 'Stones or shells', lifeMs: null, ages: null, words: ['stone', 'stones', 'crystal', 'shell', 'shells', 'pebble'] },
  { id: 'coins', label: 'Coins or keepsakes', lifeMs: null, ages: null, words: ['coin', 'coins', 'keepsake', 'jewellery', 'jewelry', 'ring'] },
];

export const offeringKind = (id: string) => OFFERING_KINDS.find((k) => k.id === id) ?? null;

/** The kind some free words name ("a glass of red wine" → drink), or null. */
export function kindFromWords(text: string): OfferingKindId | null {
  const words = ` ${text.toLowerCase().replace(/[^a-z ]+/g, ' ')} `;
  // Dried flowers, dried fruit: kept, not wilting.
  if (/ (dried|dry) /.test(words)) return 'dried';
  // Longer phrases first, so "honey cake" is sweets rather than honey.
  const pairs = OFFERING_KINDS.flatMap((k) => k.words.map((w) => ({ id: k.id, w }))).sort((a, b) => b.w.length - a.w.length);
  return pairs.find(({ w }) => words.includes(` ${w} `))?.id ?? null;
}

// ── Freshness ─────────────────────────────────────────────────────────────

export type FreshnessLevel = 'fresh' | 'fading' | 'refresh' | 'lasting';

/** Where it is in its life: 0 fresh, 1 its first change, 2 time to refresh, 3 gone right over. */
export type OfferingStage = OfferingStageWords & {
  index: 0 | 1 | 2 | 3;
  /** 0 when set out, 1 when it has gone right over (0 for things that keep). */
  progress: number;
};

export type Freshness = {
  level: FreshnessLevel;
  /** 0 when just set out, 1 when it's time to refresh it (may go past 1). */
  age: number;
  sinceMs: number;
  lifeMs: number | null;
  /** When it'll want refreshing, or null for things that keep. */
  dueAt: number | null;
  stage: OfferingStage;
};

const KEEPS: OfferingStage = { index: 0, name: 'Keeps', says: 'keeps', progress: 0 };

/** The stage something of this kind is at, `sinceMs` after it was set out (or last refreshed). */
export function offeringStage(kind: OfferingKindId, sinceMs: number): OfferingStage {
  const k = offeringKind(kind);
  if (!k?.lifeMs || !k.stages) return KEEPS;
  const over = k.overMs ?? 2 * k.lifeMs;
  const ms = Math.max(0, sinceMs);
  // The first change shows a little before it's time to refresh, as the levels do.
  const index = ms >= over ? 3 : ms >= k.lifeMs ? 2 : ms >= 0.6 * k.lifeMs ? 1 : 0;
  return { ...k.stages[index], index, progress: Math.round(Math.min(1, ms / over) * 1000) / 1000 };
}

/** How fresh something of this kind is, set out (or last refreshed) at `since`. */
export function freshness(kind: OfferingKindId, since: number, now: number): Freshness {
  const lifeMs = offeringKind(kind)?.lifeMs ?? null;
  const sinceMs = Number.isFinite(since) ? Math.max(0, now - since) : 0;
  const stage = offeringStage(kind, sinceMs);
  if (!lifeMs) return { level: 'lasting', age: 0, sinceMs, lifeMs: null, dueAt: null, stage };
  const age = sinceMs / lifeMs;
  return { level: age < 0.6 ? 'fresh' : age < 1 ? 'fading' : 'refresh', age, sinceMs, lifeMs, dueAt: since + lifeMs, stage };
}

export const FRESHNESS_WORDS: Record<FreshnessLevel, string> = {
  fresh: 'Fresh',
  fading: 'Fading',
  refresh: 'Time to refresh',
  lasting: 'Keeps',
};

/** The word for where it is now ("Wilting", "Dried up"), for the panel's heading. */
export const freshnessWord = (fresh: Freshness) => (fresh.level === 'lasting' ? FRESHNESS_WORDS.lasting : fresh.stage.name);

/** "Wilting: it has been out 7 days. Return it to the earth…" — the panel's line. */
export function freshnessLine(kind: OfferingKindId, fresh: Freshness): string {
  const k = offeringKind(kind);
  if (!k || fresh.level === 'lasting') return 'This keeps; it doesn’t need refreshing.';
  const set = `Set out ${ago(fresh.sinceMs)}.`;
  if (fresh.stage.index === 0) return `Fresh. ${set}`;
  if (fresh.level !== 'refresh') return `${fresh.stage.name}. ${set}`;
  const after =
    k.ages === 'evaporates'
      ? fresh.stage.index === 3
        ? 'Wipe the vessel and pour fresh'
        : 'Pour it out and pour fresh'
      : 'Return it to the earth and set out fresh';
  return `${fresh.stage.name}: it has been out ${ago(fresh.sinceMs).replace(' ago', '')}. ${after}, or leave it as it is.`;
}

function ago(ms: number): string {
  const hours = Math.floor(ms / HOUR);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

export type OfferingLook = {
  stage: OfferingStage['index'];
  /** The picture's colour as it goes over, as CSS filters take it: sepia (browning), saturation and brightness (1 = unchanged). */
  tint: { sepia: number; saturate: number; brightness: number };
  /** A flower bowing its head, in degrees. */
  droop: number;
  /** How much it sags or shrinks (1 = as set out). */
  sag: number;
  /** How full a vessel of liquid still is (1 full → 0 dry). */
  level: number;
  /** Petals fallen at its foot (0–2). */
  petals: number;
  /** A tide line, ring or stain left in the vessel. */
  ring: boolean;
};

const UNCHANGED: OfferingLook = { stage: 0, tint: { sepia: 0, saturate: 1, brightness: 1 }, droop: 0, sag: 1, level: 1, petals: 0, ring: false };

const ease = (t: number) => t * t * (3 - 2 * t);
const r2 = (n: number) => Math.round(n * 100) / 100;
/** How far progress `p` is between `from` and `to`, eased, 0–1. */
const between = (p: number, from: number, to: number) => ease(Math.max(0, Math.min(1, (p - from) / (to - from))));

/** Browning, dulling and darkening, at most this much once it has gone over. */
const MOST_TINT = {
  wilts: { sepia: 0.4, saturate: 0.5, brightness: 0.86 },
  softens: { sepia: 0.55, saturate: 0.7, brightness: 0.7 },
  stale: { sepia: 0.3, saturate: 0.75, brightness: 0.94 },
  spoils: { sepia: 0.45, saturate: 0.7, brightness: 0.8 },
  thickens: { sepia: 0.25, saturate: 0.85, brightness: 0.85 },
  evaporates: { sepia: 0, saturate: 1, brightness: 1 },
} as const;

/**
 * How it looks now: browning and duller, a flower bowing and dropping a petal
 * or two, liquid sinking in its vessel until only a ring is left. Gentle at
 * first, with most of the change near the end, as real things go.
 */
export function agingLook(kind: OfferingKindId, fresh: Freshness): OfferingLook {
  const ages = offeringKind(kind)?.ages;
  if (fresh.level === 'lasting' || !ages) return UNCHANGED;
  const p = fresh.stage.progress;
  const most = MOST_TINT[ages];
  const t = between(p, 0.15, 1);
  const look: OfferingLook = {
    ...UNCHANGED,
    stage: fresh.stage.index,
    tint: { sepia: r2(most.sepia * t), saturate: r2(1 - (1 - most.saturate) * t), brightness: r2(1 - (1 - most.brightness) * t) },
  };
  if (ages === 'wilts') {
    look.droop = Math.round(between(p, 0.3, 1) * 140) / 10;
    look.sag = r2(1 - 0.08 * between(p, 0.4, 1));
    look.petals = fresh.stage.index === 3 ? 2 : p >= 0.75 ? 1 : 0;
  }
  // Fruit slumps a little as it softens; bread and cakes shrink as they dry.
  if (ages === 'softens') look.sag = r2(1 - 0.06 * between(p, 0.3, 1));
  if (ages === 'stale') look.sag = r2(1 - 0.03 * between(p, 0.3, 1));
  if (ages === 'evaporates') {
    // Evaporation is steady: the level falls evenly to dry, leaving a tide line.
    look.level = r2(Math.max(0, 1 - p));
    look.ring = look.level < 0.85;
  }
  if (ages === 'spoils') {
    // Milk and a meal sink only a little as they turn.
    look.level = r2(1 - 0.35 * p);
    look.ring = fresh.stage.index === 3;
  }
  if (ages === 'thickens') {
    look.level = r2(1 - 0.12 * p);
    look.ring = fresh.stage.index >= 2;
  }
  return look;
}

// ── What's on the altar ──────────────────────────────────────────────────

/** Vessels that hold an offering. */
const HOLDERS = new Set(['offering-bowl', 'dish', 'bowl', 'chalice', 'cauldron']);

export function holdsOfferings(object: SavedObject): boolean {
  return (object.type === 'vessel' && HOLDERS.has(String(object.vessel))) || (object.type === 'tool' && object.tool === 'chalice');
}

/** A fresh-cut sprig set on the altar ages like cut flowers. */
export const isFreshSprig = (object: SavedObject) => object.type === 'herb' && object.form === 'sprig';

/** Kinds of thing that are never a perishable offering in themselves, whatever they're called. */
// A potted plant (pottedPlants.ts) is a living thing that wants water, never an offering, whatever it's named.
const NEVER_ITSELF = new Set(['candle', 'herb', 'oil', 'crystal', 'deity', 'apothecary', 'incense', 'cloth', 'plant']);
/** Words that mean it's a likeness, not the real thing ("silk roses", "a wooden apple"). */
const LIKENESS = / (silk|artificial|fake|paper|plastic|wax|wooden|ceramic|carved|brass|statue|figurine|painting|print|picture) /;

/**
 * A picture of your own named for something that perishes ("Apples",
 * "Bread", "Roses"): the object is the offering itself and ages as one.
 * Returns its kind, or null.
 */
export function perishableItself(object: SavedObject): OfferingKindId | null {
  // A seasonal thing is food or it keeps, whatever it's called (seasonal.ts).
  const seasonal = seasonalIdOf(object);
  if (seasonal) {
    const food = seasonalFood(seasonal);
    return food && offeringKind(food)?.lifeMs ? (food as OfferingKindId) : null;
  }
  // A frame named for someone ("In memory of Rose") is never a flower.
  // Nor are the cabinet's other tools and natural finds ("Tea Leaf Cup", "Pressed Flowers"): they keep.
  if (NEVER_ITSELF.has(String(object.type || '')) || holdsOfferings(object) || isFrame(object) || shelfObjectOf(object)) return null;
  const name = ` ${String(object.label || '').toLowerCase().replace(/[^a-z ]+/g, ' ')} `;
  if (!name.trim() || LIKENESS.test(name)) return null;
  const kind = kindFromWords(name);
  return kind && offeringKind(kind)?.lifeMs ? kind : null;
}

/** The object is the offering itself (a sprig, or something that perishes), not a vessel holding one. */
export const isOfferingItself = (object: SavedObject) => isFreshSprig(object) || !!perishableItself(object);

export type OfferingContents = {
  kind: OfferingKindId;
  label: string;
  /** When it was set out or last refreshed. */
  since: string;
  /** When you chose to leave it as it is (it still ages, but stops asking to be tended), or absent. */
  leftAt?: string;
};

/** What the object holds or is, as an offering, or null (an empty bowl, or not an offering at all). */
export function offeringOf(object: SavedObject): OfferingContents | null {
  if (isCandle(object)) return null;
  const raw = appStateOf(object).offering as Partial<OfferingContents> | null | undefined;
  if (raw && typeof raw === 'object') {
    const kind = offeringKind(String(raw.kind || ''));
    if (!kind) return null;
    return { kind: kind.id, label: String(raw.label || ''), since: String(raw.since || ''), ...(raw.leftAt ? { leftAt: String(raw.leftAt) } : {}) };
  }
  if (raw === null) return null;
  const itself = isFreshSprig(object) ? 'flowers' : perishableItself(object);
  if (itself) {
    const placed = placedAtOf(object);
    return Number.isFinite(placed) ? { kind: itself, label: '', since: new Date(placed).toISOString() } : null;
  }
  return null;
}

export const canHoldOffering = (object: SavedObject) => holdsOfferings(object) || isOfferingItself(object);

export function offeringFreshness(object: SavedObject, now: number): (Freshness & { kind: OfferingKindId }) | null {
  const contents = offeringOf(object);
  if (!contents) return null;
  return { ...freshness(contents.kind, Date.parse(contents.since), now), kind: contents.kind };
}

const what = (contents: { kind: OfferingKindId; label: string }) => contents.label.trim() || offeringKind(contents.kind)?.label.toLowerCase() || 'offering';

/** Where it was in its life when it was tended, kept with the log line ("wilting"). */
const stageAt = (contents: OfferingContents, now: string) => freshness(contents.kind, Date.parse(contents.since), Date.parse(now)).stage.name.toLowerCase();

/** Set something out in a bowl or dish (or say what a sprig is). */
export function setOffering(object: SavedObject, kind: OfferingKindId, label: string, now: string): SavedObject {
  if (!canHoldOffering(object) || !offeringKind(kind)) return object;
  const offering: OfferingContents = { kind, label: label.trim(), since: now };
  return logAppEvent(object, { kind: 'offering', action: 'set', text: `Set out ${what(offering)}.` }, now, { offering });
}

/** Fresh water, bread or flowers in place of the old. */
export function refreshOffering(object: SavedObject, now: string): SavedObject {
  const contents = offeringOf(object);
  if (!contents) return object;
  const { leftAt: _left, ...rest } = contents;
  void _left;
  return logAppEvent(
    object,
    { kind: 'offering', action: 'refreshed', stage: stageAt(contents, now), text: `Refreshed the ${what(contents)}.` },
    now,
    { offering: { ...rest, since: now } },
  );
}

/**
 * Leave it as it is: some let flowers dry on the altar, or let water go back
 * to the air. It goes on ageing, but stops asking to be tended until it's
 * refreshed or set out anew.
 */
export function leaveOffering(object: SavedObject, now: string): SavedObject {
  const contents = offeringOf(object);
  if (!contents || contents.leftAt) return object;
  return logAppEvent(
    object,
    { kind: 'offering', action: 'left', stage: stageAt(contents, now), text: `Left the ${what(contents)} as it is.` },
    now,
    { offering: { ...contents, leftAt: now } },
  );
}

export type OfferingEnd = 'returned' | 'removed';

/**
 * The offering is done: given back (poured on the earth, left under a tree)
 * or taken away. A bowl stays on the altar, empty; a sprig is the offering
 * itself, so the caller takes it off the altar.
 */
export function endOffering(object: SavedObject, how: OfferingEnd, now: string): SavedObject {
  const contents = offeringOf(object);
  if (!contents) return object;
  const text = how === 'returned' ? `Returned the ${what(contents)} to nature.` : `Cleared away the ${what(contents)}.`;
  return logAppEvent(object, { kind: 'offering', action: how, stage: stageAt(contents, now), text }, now, { offering: null });
}

// ── Offerings that want tending ──────────────────────────────────────────

export type OfferingDue = {
  altarId: string;
  altarName: string;
  objectId: string;
  /** What it is, in a sentence ("rose sprig", "water"). */
  what: string;
  kind: OfferingKindId;
  stage: OfferingStage;
  /** When it asked (or will ask) to be refreshed. */
  dueAt: number;
};

type AltarLike = { id: string; name?: string | null; objects: SavedObject[] };

const objectWhat = (object: SavedObject, contents: OfferingContents) =>
  contents.label.trim() ||
  (isOfferingItself(object) ? String(object.label || '').trim() : '') ||
  offeringKind(contents.kind)?.label.toLowerCase() ||
  'offering';

/**
 * Every offering on these altars that is (or, with `until`, will be by then)
 * past its time, and that you haven't chosen to leave as it is. Soonest due first.
 */
export function offeringsDue(altars: AltarLike[], now: number, until = now): OfferingDue[] {
  const out: OfferingDue[] = [];
  for (const altar of altars) {
    for (const object of altar.objects ?? []) {
      const contents = offeringOf(object);
      if (!contents || contents.leftAt) continue;
      const fresh = freshness(contents.kind, Date.parse(contents.since), now);
      if (fresh.dueAt == null || fresh.dueAt > until) continue;
      out.push({
        altarId: altar.id,
        altarName: String(altar.name || '').trim(),
        objectId: String(object.altarObjectId || ''),
        what: objectWhat(object, contents).toLowerCase(),
        kind: contents.kind,
        stage: freshness(contents.kind, Date.parse(contents.since), Math.max(now, fresh.dueAt)).stage,
        dueAt: fresh.dueAt,
      });
    }
  }
  return out.sort((a, b) => a.dueAt - b.dueAt);
}

/** "your Brigid altar", or "Brigid's Altar" when its name says altar already. */
export function altarPhrase(name: string): string {
  const n = name.trim();
  if (!n) return 'your altar';
  return /\baltar\b/i.test(n) ? n : `your ${n} altar`;
}

/** Plural-looking words ("roses", "apples") take "are"; "water" and "rose sprig" take "is". */
const plural = (what: string) => /[^s]s$/.test(what) && !/(ss|us|is)$/.test(what);

/** The verb a stage says, matched to what it is ("are wilting", "have dried up"). */
function says(stage: OfferingStage, many: boolean): string {
  if (!many) return stage.says;
  return stage.says.replace(/^is /, 'are ').replace(/^has /, 'have ');
}

/**
 * A gentle line about the offerings that want tending: "The roses on your
 * Brigid altar are wilting." Null when none do.
 */
export function tendingNote(due: OfferingDue[], options: { oneAltar?: boolean } = {}): string | null {
  if (!due.length) return null;
  const first = due[0];
  const where = options.oneAltar ? '' : ` on ${altarPhrase(first.altarName)}`;
  const head = `The ${first.what}${where} ${says(first.stage, plural(first.what))}.`;
  const rest = due.length - 1;
  if (!rest) return head;
  return `${head} ${rest === 1 ? 'One more offering wants' : `${rest} more offerings want`} tending too.`;
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
