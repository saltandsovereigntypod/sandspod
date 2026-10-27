// Offering what's already on the altar. When an offering is made to a
// presence (a statue, an icon), everything else on that altar can be chosen
// as the offering itself: the honeycomb set out for Apollo, the bread, the
// wine in its chalice, a crystal, a candle. The offering record then keeps
// the real things (their names, pictures, forms and a link back to each
// object), the kind of offering is worked out from what they are, and each
// thing given carries a line in its own story ("Offered to Apollo"). It may
// also be set down at the presence's feet. Shared with the website's altar
// (js/core/altar.js, offerFromAltar). Pure, so it can be tested.

import { shortLabel } from './cabinet.ts';
import { recordOffering, type Offering, type OfferingInput } from './devotion.ts';
import { deityName } from './relationship.ts';
import { newId } from './uid.ts';
import { displayBox, objectSize, objectAspect, clampBox, savedFromBox, boxHeightFraction } from './geometry.ts';
import { appStateOf, isCandle, logAppEvent } from './livingState.ts';
import { holdsOfferings, isFreshSprig, kindFromWords, offeringFoodOf, offeringOf, perishableItself, type OfferingKindId } from './offerings.ts';
import { isPetitionPaper } from './petitions.ts';
import { seasonalFood, seasonalIdOf } from './seasonal.ts';
import type { SavedObject } from './types.ts';

/** One thing on the altar that can be given. */
export type AltarGift = {
  /** The object's altarObjectId (or, for old saves, its entity id or label). */
  id: string;
  /** What it's called ("Honeycomb", "Offering Bowl of wine"). */
  label: string;
  imagePath: string;
  fallbackSymbol: string;
  /** The object's type and form, as saved ("offering", "honeycomb"). */
  objectType: string;
  form: string;
  /** The kind of offering it is (honey, bread, flowers…), or null for things that aren't food or drink. */
  kind: OfferingKindId | null;
  /** The offering type it counts as, as the form's options name them ("Food", "Crystals"). */
  offeringType: string;
};

/** One item of an offering record, from the altar (the record's `items`; older readers use only `label`). */
export type GiftItem = {
  id: string;
  label: string;
  fromAltar: true;
  imagePath?: string;
  form?: string;
  objectType?: string;
  kind?: OfferingKindId;
};

const FOOD_KINDS = new Set<OfferingKindId>(['honey', 'bread', 'fruit', 'harvest', 'sweets', 'cooked']);
const DRINK_KINDS = new Set<OfferingKindId>(['water', 'drink', 'milk']);

/** The offering type ("Food", "Drink", "Flowers"…) a kind of offering counts as. */
export function typeOfKind(kind: OfferingKindId | null): string {
  if (!kind) return '';
  if (FOOD_KINDS.has(kind)) return 'Food';
  if (DRINK_KINDS.has(kind)) return 'Drink';
  if (kind === 'flowers') return 'Flowers';
  if (kind === 'dried') return 'Herbs';
  if (kind === 'stones') return 'Crystals';
  if (kind === 'coins') return 'Coins';
  return '';
}

const TYPE_OF_OBJECT: Record<string, string> = {
  candle: 'Candles',
  herb: 'Herbs',
  oil: 'Oils',
  crystal: 'Crystals',
  apothecary: 'Apothecary items',
  incense: 'Incense',
};

/** What kind of offering an object is: what a vessel holds, what food is, or what its name says. */
export function giftKind(object: SavedObject): OfferingKindId | null {
  if (isCandle(object)) return null;
  const held = offeringOf(object);
  if (held) return held.kind;
  const food = offeringFoodOf(object);
  if (food) return food.kind;
  if (isFreshSprig(object)) return 'flowers';
  const seasonal = seasonalIdOf(object);
  if (seasonal) return (seasonalFood(seasonal) as OfferingKindId | null) ?? null;
  const itself = perishableItself(object);
  if (itself) return itself;
  if (object.type === 'crystal') return 'stones';
  if (object.type === 'herb') return 'dried';
  if (['candle', 'deity', 'oil', 'incense', 'apothecary', 'cloth', 'plant'].includes(String(object.type))) return null;
  return kindFromWords(String(object.label || ''));
}

/** "Offering Bowl of wine": a vessel is named with what it holds. */
function giftLabel(object: SavedObject): string {
  const name = shortLabel(object.label, 'Something on the altar');
  const held = holdsOfferings(object) ? offeringOf(object) : null;
  const what = held?.label.trim();
  return what && !name.toLowerCase().includes(what.toLowerCase()) ? `${name} of ${what}` : name;
}

export const giftIdOf = (object: SavedObject) => String(object.altarObjectId || object.entityId || object.label || '');

/**
 * Everything on the altar that can be given to `subject`: every object but
 * the presence itself, its cloths and petition papers (a petition is read
 * from the petition box, not given away). In the altar's order.
 */
export function altarGifts(objects: SavedObject[], subject: SavedObject | null): AltarGift[] {
  const subjectId = subject ? giftIdOf(subject) : '';
  const seen = new Set<string>();
  const out: AltarGift[] = [];
  for (const object of objects) {
    if (!object || object === subject || object.type === 'cloth' || isPetitionPaper(object)) continue;
    const id = giftIdOf(object);
    if (!id || id === subjectId || seen.has(id)) continue;
    seen.add(id);
    const kind = giftKind(object);
    out.push({
      id,
      label: giftLabel(object),
      imagePath: String(object.imagePath || ''),
      fallbackSymbol: String(object.fallbackSymbol || ''),
      objectType: String(object.type || ''),
      form: String(object.form || ''),
      kind,
      offeringType: typeOfKind(kind) || TYPE_OF_OBJECT[String(object.type)] || 'Other',
    });
  }
  return out;
}

/** The offering types the chosen things count as, to fill in the form ("Food", "Drink"), each once, in the form's own order. */
export function giftTypes(gifts: AltarGift[], order: string[]): string[] {
  const wanted = new Set(gifts.map((g) => g.offeringType).filter(Boolean));
  return order.filter((t) => wanted.has(t));
}

/** What the offering record keeps of each thing given. */
export function giftItem(gift: AltarGift): GiftItem {
  return {
    id: gift.id,
    label: gift.label,
    fromAltar: true,
    ...(gift.imagePath ? { imagePath: gift.imagePath } : {}),
    ...(gift.form ? { form: gift.form } : {}),
    ...(gift.objectType ? { objectType: gift.objectType } : {}),
    ...(gift.kind ? { kind: gift.kind } : {}),
  };
}

/** Add the chosen types to those already picked, keeping any the person chose themselves. */
export function withGiftTypes(picked: string[], gifts: AltarGift[], order: string[]): string[] {
  const add = giftTypes(gifts, order);
  return order.filter((t) => picked.includes(t) || add.includes(t));
}

const join = (words: string[]) => (words.length <= 1 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`);

/** "Honeycomb and wine, offered to Apollo", for the altar's log and notices. */
export function offeringLine(labels: string[], to: string): string {
  const names = labels.map((l) => l.trim()).filter(Boolean);
  const what = names.length ? join(names) : 'An offering';
  return `${what.charAt(0).toUpperCase()}${what.slice(1)}, offered to ${to.trim() || 'this presence'}`;
}

/** The names of what an offering record gave: its items, or else its types ("Food"). */
export function offeringItemNames(offering: Pick<Offering, 'items' | 'types'>): string[] {
  const items = (offering.items ?? []).map((i) => (typeof i === 'string' ? i : String(i?.label || ''))).filter(Boolean);
  if (items.length) return items;
  return (offering.types ?? []).map((t) => String(t).replaceAll('-', ' ')).map((t) => t.charAt(0).toUpperCase() + t.slice(1));
}

/** Who a thing on the altar was last offered to, and when, or null. */
export type OfferedTo = { name: string; at: string; presenceId: string; offeringId: string };

export function offeredToOf(object: SavedObject): OfferedTo | null {
  const raw = appStateOf(object).offeredTo as Partial<OfferedTo> | undefined;
  if (!raw || typeof raw !== 'object' || typeof raw.name !== 'string' || !raw.name) return null;
  return { name: raw.name, at: String(raw.at || ''), presenceId: String(raw.presenceId || ''), offeringId: String(raw.offeringId || '') };
}

/**
 * Mark a thing as given: its story says "Offered to Apollo." and it remembers
 * whom it was offered to (livingState.app.offeredTo).
 */
export function markGiven(object: SavedObject, to: { name: string; presenceId: string; offeringId: string }, now: string): SavedObject {
  const offeredTo: OfferedTo = { name: to.name, at: now, presenceId: to.presenceId, offeringId: to.offeringId };
  return logAppEvent(object, { kind: 'offering', action: 'given', to: to.name, text: `Offered to ${to.name}.` }, now, { offeredTo });
}

/**
 * Set the things given at the presence's feet: in a row along the foot of its
 * picture, a layer in front of it, each keeping its own size. Returns the
 * objects' new positions (and layers) by their index in `objects`.
 */
export function atTheFeet(objects: SavedObject[], presence: SavedObject, indices: number[]): Map<number, SavedObject> {
  const out = new Map<number, SavedObject>();
  if (!indices.length) return out;
  const box = displayBox(presence);
  const foot = box.cy + boxHeightFraction(box) / 2;
  const sizes = indices.map((i) => objectSize(objects[i]));
  const total = sizes.reduce((a, b) => a + b * 0.85, 0);
  let x = box.cx - total / 2;
  const layer = Number(presence.zIndex) || 1;
  indices.forEach((i, n) => {
    const object = objects[i];
    const size = sizes[n];
    const aspect = objectAspect(object);
    const h = boxHeightFraction({ size, aspect });
    const cx = x + (size * 0.85) / 2;
    x += size * 0.85;
    // Sitting on the same ground as the presence, overlapping its base a little.
    const placed = clampBox({ cx, cy: foot - h / 2 + h * 0.08, size, aspect }, object.type, 'drag');
    out.set(i, { ...object, ...savedFromBox(placed), zIndex: String(layer + 1 + n) });
  });
  return out;
}

/**
 * Make an offering to the presence at `presenceIndex`, with these things from
 * the altar given as (part of) it: the record keeps them, each one is marked
 * as offered, and with `atFeet` they're set down at the presence's feet.
 * Returns the altar's objects, changed, and the line for its log.
 */
export function giveFromAltar(
  objects: SavedObject[],
  presenceIndex: number,
  input: OfferingInput,
  gifts: AltarGift[],
  options: { atFeet?: boolean },
  now: string,
): { objects: SavedObject[]; line: string } {
  const presence = objects[presenceIndex];
  if (!presence) return { objects, line: '' };
  const id = input.id || newId();
  const name = deityName(presence);
  const next = objects.slice();
  next[presenceIndex] = recordOffering(presence, { ...input, id, gifts: [...gifts.map(giftItem), ...(input.gifts ?? [])] }, now);
  const chosen = new Set(gifts.map((g) => g.id));
  const indices = next.map((o, i) => (i !== presenceIndex && chosen.has(giftIdOf(o)) ? i : -1)).filter((i) => i >= 0);
  for (const i of indices) next[i] = markGiven(next[i], { name, presenceId: giftIdOf(presence), offeringId: id }, now);
  if (options.atFeet) for (const [i, moved] of atTheFeet(next, next[presenceIndex], indices)) next[i] = moved;
  const custom = input.customItems.split(',').map((v) => v.trim()).filter(Boolean);
  const labels = [...gifts.map((g) => g.label), ...input.supports.map((s) => s.label), ...custom];
  return { objects: next, line: `${offeringLine(labels.length ? labels : input.types, name)}.` };
}
