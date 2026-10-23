// Things for the altar that aren't in the Traditional Library: more tools
// (for divination; knots, writing and wax; candle care; ritual; light; and
// figures) and the Natural drawer's finds (feathers, a hag stone, shells,
// acorns, antler). Each has a painted picture (assets/altar/objects/tools/<id>/<id>.png,
// assets/altar/objects/natural/<id>/<id>.png, listed by
// scripts/build-altar-artwork.mjs); one without a picture isn't offered.
// A tool is placed as `type: 'tool'` with its id as `tool`; a natural thing
// as `type: 'natural'` with its id as its form. Pure, so it can be tested.

import type { CabinetItem, SavedObject } from './types.ts';

export type ShelfObject = { id: string; name: string; group: string; description: string; keywords: string[]; /** Placed glowing, as a lit lamp. */ glows?: boolean };

export const SHELF_TOOLS: ShelfObject[] = [
  // Divination
  { id: 'scrying-mirror', name: 'Scrying Mirror', group: 'Divination', keywords: ['scrying', 'divination', 'black mirror', 'visions'], description: 'A dark mirror for scrying. Gaze softly into it by candlelight and let images rise.' },
  { id: 'crystal-ball', name: 'Crystal Ball', group: 'Divination', keywords: ['scrying', 'divination', 'seeing', 'clarity'], description: 'A sphere of glass or quartz for scrying, gazed into until the mind goes still.' },
  { id: 'rune-bag', name: 'Rune Bag', group: 'Divination', keywords: ['runes', 'divination', 'Norse', 'casting'], description: 'A pouch of runes, drawn one at a time or cast together for counsel.' },
  { id: 'tea-leaf-cup', name: 'Tea Leaf Cup', group: 'Divination', keywords: ['tasseography', 'tea leaves', 'divination', 'kitchen witchcraft'], description: 'A cup with leaves left in it after drinking, read for the shapes they make.' },
  { id: 'ogham-staves', name: 'Ogham Staves', group: 'Divination', keywords: ['ogham', 'divination', 'Celtic', 'trees'], description: 'Wooden staves carved with the ogham letters, each named for a tree, drawn for guidance.' },
  // Knots, writing and wax
  { id: 'red-cord', name: 'Red Cord', group: 'Knots, writing and wax', keywords: ['knot magic', 'binding', 'protection', 'cord'], description: 'A length of red cord for knot spells, tied with intention and kept, or worn for protection.' },
  { id: 'witchs-ladder', name: 'Witch’s Ladder', group: 'Knots, writing and wax', keywords: ['knot magic', 'feathers', 'charm', 'spellwork'], description: 'A cord knotted with feathers or beads, a wish or a working tied into each knot.' },
  { id: 'quill-and-ink', name: 'Quill and Ink', group: 'Knots, writing and wax', keywords: ['writing', 'petitions', 'sigils', 'Book of Shadows'], description: 'For writing petitions, sigils and the pages of your book by hand.' },
  { id: 'wax-seal', name: 'Wax Seal', group: 'Knots, writing and wax', keywords: ['sealing', 'petitions', 'binding', 'wax'], description: 'Sealing wax and a stamp, to close a petition or a letter and set the working.' },
  // Candle care
  { id: 'candle-snuffer', name: 'Candle Snuffer', group: 'Candle care', keywords: ['snuffing', 'candles', 'closing'], description: 'Many prefer to snuff a candle rather than blow it out, so the working isn’t scattered.' },
  { id: 'matches', name: 'Matches', group: 'Candle care', keywords: ['fire', 'lighting', 'candles'], description: 'Plain matches, often kept for the altar alone, to light its candles and incense.' },
  // Ritual
  { id: 'stang', name: 'Stang', group: 'Ritual', keywords: ['traditional witchcraft', 'the horned one', 'crossroads', 'staff'], description: 'A forked staff of traditional witchcraft, set up as an altar of its own at the edge of a circle.' },
  { id: 'frame-drum', name: 'Frame Drum', group: 'Ritual', keywords: ['drumming', 'trance', 'journeying', 'rhythm'], description: 'A hand drum for raising energy and for the steady beat of a journey.' },
  { id: 'rattle', name: 'Rattle', group: 'Ritual', keywords: ['clearing', 'calling', 'spirits', 'rhythm'], description: 'Shaken to clear a space, to call in spirits, or to keep the rhythm of a working.' },
  { id: 'singing-bowl', name: 'Singing Bowl', group: 'Ritual', keywords: ['sound', 'cleansing', 'meditation', 'tone'], description: 'A bowl that rings when struck or circled, its tone used to cleanse a space and settle the mind.' },
  // Light
  { id: 'oil-lamp', name: 'Oil Lamp', group: 'Light', keywords: ['flame', 'devotion', 'light', 'vigil'], description: 'An old way of keeping a light for a god or the dead, a small steady flame over oil.', glows: true },
  { id: 'lantern', name: 'Lantern', group: 'Light', keywords: ['light', 'guidance', 'the way', 'Hekate'], description: 'A light to see the way by, and to guide the spirits home.', glows: true },
  { id: 'salt-lamp', name: 'Salt Lamp', group: 'Light', keywords: ['salt', 'cleansing', 'calm', 'light'], description: 'A lamp of rock salt with a warm glow, kept for a cleansed and quiet room.', glows: true },
  // Figures
  { id: 'goddess-figure', name: 'Goddess Figure', group: 'Figures', keywords: ['the Goddess', 'Mother', 'devotion', 'fertility'], description: 'A figure of the Goddess as the great Mother, for any altar that honours her.' },
  { id: 'green-man', name: 'Green Man', group: 'Figures', keywords: ['the Green Man', 'the wild', 'growth', 'the God'], description: 'The leaf-crowned face of the wild green world and its yearly return.' },
];

export const NATURAL_OBJECTS: ShelfObject[] = [
  { id: 'feathers', name: 'Feathers', group: 'Natural', keywords: ['air', 'messages', 'birds', 'spirit'], description: 'Feathers found or gifted, for the element of air and messages carried between worlds.' },
  { id: 'hag-stone', name: 'Hag Stone', group: 'Natural', keywords: ['protection', 'seeing', 'holed stone', 'the fae'], description: 'A stone with a hole worn through by water. A protective seeing-stone: look through it, folk say, to see the hidden.' },
  { id: 'seashells', name: 'Seashells', group: 'Natural', keywords: ['water', 'the sea', 'the moon', 'love'], description: 'Shells from the shore, for water, the sea and the moon that turns its tides.' },
  { id: 'sea-glass', name: 'Sea Glass', group: 'Natural', keywords: ['water', 'transformation', 'healing', 'the sea'], description: 'Glass worn smooth by the waves, for what time and the sea can soften and heal.' },
  { id: 'driftwood', name: 'Driftwood', group: 'Natural', keywords: ['the sea', 'journeys', 'letting go', 'wood'], description: 'Wood carried in by the tide, for journeys, letting go and finding your way to shore.' },
  { id: 'river-stones', name: 'River Stones', group: 'Natural', keywords: ['earth', 'water', 'grounding', 'patience'], description: 'Smooth stones from a river, for grounding and the patience of water.' },
  { id: 'acorns', name: 'Acorns', group: 'Natural', keywords: ['the oak', 'luck', 'growth', 'potential'], description: 'The oak’s seeds, carried for luck and for great things grown from small beginnings.' },
  { id: 'pinecones', name: 'Pinecones', group: 'Natural', keywords: ['the forest', 'fertility', 'longevity', 'winter'], description: 'From the evergreen forest, for fertility, long life and the turning year.' },
  { id: 'antler', name: 'Antler', group: 'Natural', keywords: ['the Horned God', 'the wild', 'strength', 'renewal'], description: 'A shed antler, for the Horned God, the wild and what grows back each year.' },
  { id: 'snakeskin', name: 'Snakeskin', group: 'Natural', keywords: ['renewal', 'shedding', 'transformation', 'healing'], description: 'A shed skin, for renewal and leaving behind what no longer fits.' },
  { id: 'pressed-flowers', name: 'Pressed Flowers', group: 'Natural', keywords: ['memory', 'love', 'flowers', 'keepsake'], description: 'Flowers kept between pages, for memory, love and a season held on to.' },
  { id: 'autumn-leaves', name: 'Autumn Leaves', group: 'Natural', keywords: ['autumn', 'release', 'harvest', 'change'], description: 'Fallen leaves in their turning colours, for release and the beauty of letting go.' },
  { id: 'eggshells', name: 'Eggshells', group: 'Natural', keywords: ['protection', 'new life', 'fertility'], description: 'Saved eggshells, ground fine into a protective powder in some folk practice, or kept for new life.' },
];

const byId = (list: ShelfObject[], id: string) => list.find((o) => o.id === id) ?? null;

/** The cabinet's extra tools that have a picture (`images`: id → picture), placed as tools. */
export function shelfToolItems(images: Record<string, string>): CabinetItem[] {
  return SHELF_TOOLS.filter((o) => !!images[o.id]).map((o) => ({
    id: `tools:${o.id}`,
    category: 'tools',
    name: o.name,
    keywords: [...o.keywords, o.group.toLowerCase()],
    description: o.description,
    forms: [{ label: 'Place', image: images[o.id], type: 'tool', tool: o.id, form: 'standard' }],
  }));
}

/** The Natural drawer: the finds that have a picture, placed as `type: 'natural'` with their id as their form. */
export function naturalItems(images: Record<string, string>): CabinetItem[] {
  return NATURAL_OBJECTS.filter((o) => !!images[o.id]).map((o) => ({
    id: `natural:${o.id}`,
    category: 'natural',
    name: o.name,
    keywords: [...o.keywords, 'natural', 'found'],
    description: o.description,
    forms: [{ label: 'Place', image: images[o.id], type: 'natural', form: o.id }],
  }));
}

/** Which of these a saved object is, or null. */
export function shelfObjectOf(object: Pick<SavedObject, 'type' | 'tool' | 'form'>): ShelfObject | null {
  if (object.type === 'tool') return byId(SHELF_TOOLS, String(object.tool || ''));
  if (object.type === 'natural') return byId(NATURAL_OBJECTS, String(object.form || ''));
  return null;
}

/** A line about it, for its panel when the Living Library has no page for it. */
export const shelfDescription = (object: Pick<SavedObject, 'type' | 'tool' | 'form'>) => shelfObjectOf(object)?.description ?? '';

/** Lamps and lanterns are set down glowing, as if lit. */
export const glowsWhenPlaced = (object: Pick<SavedObject, 'type' | 'tool' | 'form'>) => !!shelfObjectOf(object)?.glows;
