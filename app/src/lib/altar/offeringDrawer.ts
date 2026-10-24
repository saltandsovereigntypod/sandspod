// The cabinet's Offerings drawer: food, flowers and keepsakes set straight on
// the altar, and vessels already filled, so water, wine, milk or honey is one
// tap. Each food is a painted picture of its own (assets/altar/objects/
// offerings/<id>/<id>.png, listed in the artwork data as offeringFoods by
// scripts/build-altar-artwork.mjs); one with no picture, or no entry in
// offerings.ts OFFERING_FOODS, isn't offered, so a new folder of pictures
// joins the drawer when the artwork is rebuilt. A food is placed as
// `type: 'offering'` with its id as its form, and ages from the moment it's
// placed. A filled vessel is the vessel's own picture with its contents set
// out as it's placed (`offering` and `offeringLabel` on the form), exactly as
// "Set out an offering" would. The same on the app and the website. Pure, so
// it can be tested.

import { ALTAR_ARTWORK } from './artworkData.ts';
import { foodHeapOf } from './offeringArt.ts';
import { OFFERING_FOODS, offeringKind, type OfferingKindId } from './offerings.ts';
import type { CabinetForm, CabinetItem } from './types.ts';

type FoodPictures = Record<string, { image: string; ratio: number | null } | undefined>;
type ArtworkItems = Partial<Record<string, { name: string; forms: CabinetForm[] }[]>>;

export type FilledVessel = {
  name: string;
  /** The vessel's own form in the cabinet: a vessel by its id, or the chalice (a tool). */
  holder: { vessel?: string; tool?: string };
  kind: OfferingKindId;
  /** What it holds, as "Set out an offering" names it. */
  label: string;
  keywords: string[];
  line: string;
};

export const FILLED_VESSELS: FilledVessel[] = [
  { name: 'Bowl of Water', holder: { vessel: 'offering-bowl' }, kind: 'water', label: 'water', keywords: ['water', 'libation', 'spirits', 'ancestors', 'cleansing'],
    line: 'An offering bowl of fresh water. It sinks a little each day and dries to a pale ring in three or four.' },
  { name: 'Chalice of Wine', holder: { tool: 'chalice' }, kind: 'drink', label: 'wine', keywords: ['wine', 'libation', 'drink', 'toast', 'blessing'],
    line: 'Wine poured for the gods or the dead. It goes flat in a day or two and dries to a stain.' },
  { name: 'Dish of Milk', holder: { vessel: 'bowl' }, kind: 'milk', label: 'milk', keywords: ['milk', 'cream', 'house spirits', 'the fair folk', 'Imbolc'],
    line: 'A bowl of milk for the house spirits. It turns within a day and curdles after.' },
  { name: 'Honey Dish', holder: { vessel: 'dish' }, kind: 'honey', label: 'honey', keywords: ['honey', 'sweetness', 'love', 'sweetening'],
    line: 'A dish of honey. It thickens, gathers dust and crusts over in a few days.' },
  { name: 'Bowl of Fruit', holder: { vessel: 'offering-bowl' }, kind: 'fruit', label: 'fruit', keywords: ['fruit', 'apples', 'harvest', 'sweetness'],
    line: 'Fruit heaped in an offering bowl, softening and browning over the best part of a week.' },
  { name: 'Dish of Bread', holder: { vessel: 'dish' }, kind: 'bread', label: 'bread', keywords: ['bread', 'loaf', 'hospitality', 'hearth'],
    line: 'Bread on a dish, drying at the edges in a day or two and stale after.' },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const words = ['offering', 'offerings', 'food', 'food offering'];

/** The food heaped in a vessel, when it has to be drawn from a picture (null for liquids). */
const heapOf = (filled: FilledVessel) => foodHeapOf(filled.kind, filled.label);

function holderForm(filled: FilledVessel, items: ArtworkItems): CabinetForm | null {
  const list = filled.holder.tool ? (items.tools ?? []) : (items.vessels ?? []);
  for (const item of list) {
    const form = item.forms.find((f) => (filled.holder.tool ? f.tool === filled.holder.tool : f.vessel === filled.holder.vessel) && !!f.image);
    if (form) return form;
  }
  return null;
}

/**
 * The drawer: each food that has a picture, then each filled vessel whose
 * vessel (and, for food, whose heap) has one. `foods` and `items` are the
 * artwork data's offeringFoods and items.
 */
export function offeringCabinetItems(foods: FoodPictures = ALTAR_ARTWORK.offeringFoods ?? {}, items: ArtworkItems = ALTAR_ARTWORK.items): CabinetItem[] {
  const out: CabinetItem[] = [];
  for (const food of OFFERING_FOODS) {
    const image = foods[food.id]?.image;
    if (!image) continue;
    out.push({
      id: `offerings:${slug(food.name)}`,
      category: 'offerings',
      name: food.name,
      keywords: [...food.keywords, ...words],
      description: food.line,
      forms: [{ label: 'Place', image, type: 'offering', form: food.id }],
    });
  }
  for (const filled of FILLED_VESSELS) {
    const form = holderForm(filled, items);
    const heap = heapOf(filled);
    if (!form || (heap && !foods[heap]?.image) || !offeringKind(filled.kind)) continue;
    out.push({
      id: `offerings:${slug(filled.name)}`,
      category: 'offerings',
      name: filled.name,
      keywords: [...filled.keywords, ...words, 'vessel', 'filled'],
      description: filled.line,
      forms: [{ ...form, label: 'Place', offering: filled.kind, offeringLabel: filled.label }],
    });
  }
  return out;
}
