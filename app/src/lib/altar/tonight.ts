// "Set tonight's altar": a starter altar from the day itself, built from the
// cabinet. A holiday brings its traditional things; otherwise the weekday's
// planet chooses the candle, herb and stone, and a full or new moon adds a
// touch of its own. Everything can be moved, swapped or removed afterwards.

import { builtInBackgrounds, builtInCabinet, objectFromForm, placeableForms, shortLabel } from './cabinet.ts';
import { boxHeightFraction, displayBox, NEW_OBJECT_SIZE, withCenter, withRotation, withSize } from './geometry.ts';
import type { SavedObject } from './types.ts';
import type { AltarDocument } from './snapshot.ts';

type Pick = [itemId: string, form: string];

export type TonightAltar = {
  doc: AltarDocument;
  /** What it was set for: "Mars's day: courage and protection". */
  reason: string;
  /** What was placed, in order. */
  labels: string[];
};

/**
 * A theme: what goes where. The altar is laid out like a real one: a
 * centrepiece at the back, candles flanking it in pairs, incense and herbs
 * either side, an offering in front, crystals and a working tool at the front.
 */
type Theme = {
  reason: string;
  /** A background that suits it (by id), when it has its own. */
  background?: string;
  focal: Pick;
  /** The pair either side of the centrepiece. */
  candles: [Pick, Pick];
  /** The smaller pair further out. */
  outer: [Pick, Pick];
  incense: Pick;
  herb: Pick;
  offering: Pick;
  crystals: [Pick, Pick];
  tool: Pick;
};

const c = (color: string, form = 'vigil'): Pick => [`candles:${color}-candle`, form];
const herb = (id: string, form = 'sprig'): Pick => [`herbs:${id}`, form];
const stone = (id: string, form: string): Pick => [`crystals:${id}`, form];
const tool = (id: string, form = 'standard'): Pick => [`tools:${id}`, form];
const vessel = (id: string): Pick => [`vessels:${id}`, 'standard'];
const deity = (id: string): Pick => [`deities:${id}-statue`, 'statue'];

const WEEKDAYS: Theme[] = [
  {
    reason: 'the Sun’s day: success and vitality',
    background: 'cottagecore',
    focal: deity('apollo'),
    candles: [c('gold'), c('yellow')],
    outer: [c('orange', 'taper'), c('orange', 'taper')],
    incense: herb('frankincense', 'incense'),
    herb: herb('calendula'),
    offering: vessel('offering-bowl'),
    crystals: [stone('citrine', 'tumbled'), stone('sunstone', 'tumbled')],
    tool: tool('wand'),
  },
  {
    reason: 'the Moon’s day: intuition and dreams',
    background: 'celestial',
    focal: deity('selene'),
    candles: [c('silver'), c('white')],
    outer: [c('silver', 'taper'), c('silver', 'taper')],
    incense: herb('jasmine', 'incense'),
    herb: herb('mugwort'),
    offering: tool('chalice'),
    crystals: [stone('moonstone', 'tumbled'), stone('selenite', 'cluster')],
    tool: tool('pendulum'),
  },
  {
    reason: 'Mars’s day: courage and protection',
    focal: deity('mars'),
    candles: [c('red'), c('red')],
    outer: [c('black', 'taper'), c('black', 'taper')],
    incense: herb('dragon-s-blood', 'incense'),
    herb: herb('basil'),
    offering: vessel('offering-bowl'),
    crystals: [stone('garnet', 'tumbled'), stone('bloodstone', 'tumbled')],
    tool: tool('athame'),
  },
  {
    reason: 'Mercury’s day: words and learning',
    focal: deity('hermes'),
    candles: [c('yellow'), c('orange')],
    outer: [c('yellow', 'chime-spell'), c('yellow', 'chime-spell')],
    incense: herb('lavender', 'incense'),
    herb: herb('peppermint'),
    offering: tool('book-of-shadows'),
    crystals: [stone('fluorite', 'tumbled'), stone('clear-quartz', 'point')],
    tool: tool('tarot-deck'),
  },
  {
    reason: 'Jupiter’s day: wisdom and abundance',
    background: 'witch-cabin',
    focal: deity('jupiter'),
    candles: [c('blue'), c('purple')],
    outer: [c('green', 'taper'), c('green', 'taper')],
    incense: herb('sandalwood', 'incense'),
    herb: herb('sage'),
    offering: vessel('offering-bowl'),
    crystals: [stone('amethyst', 'cluster'), stone('lapis-lazuli', 'tumbled')],
    tool: tool('pentacle'),
  },
  {
    reason: 'Venus’s day: love and friendship',
    background: 'spring-meadow',
    focal: deity('aphrodite'),
    candles: [c('pink'), c('red')],
    outer: [c('pink', 'taper'), c('pink', 'taper')],
    incense: herb('rose', 'incense'),
    herb: herb('rose'),
    offering: tool('chalice'),
    crystals: [stone('rose-quartz', 'point'), stone('rhodochrosite', 'tumbled')],
    tool: tool('bell'),
  },
  {
    reason: 'Saturn’s day: protection and endings',
    background: 'gothic',
    focal: deity('hekate'),
    candles: [c('black'), c('indigo')],
    outer: [c('black', 'taper'), c('black', 'taper')],
    incense: herb('myrrh', 'incense'),
    herb: herb('rue'),
    offering: tool('black-salt', 'pile'),
    crystals: [stone('obsidian', 'cluster'), stone('jet', 'tumbled')],
    tool: tool('key'),
  },
];

/** Traditional altars for holidays, by holiday id (or the start of one). */
const HOLIDAYS: { ids: string[]; theme: Omit<Theme, 'reason'> }[] = [
  {
    ids: ['samhain', 'vetrnaetur', 'dziady'],
    theme: {
      background: 'gothic',
      focal: vessel('cauldron'),
      candles: [c('black'), c('orange')],
      outer: [c('black', 'taper'), c('orange', 'taper')],
      incense: herb('myrrh', 'incense'),
      herb: herb('mugwort'),
      offering: vessel('offering-bowl'),
      crystals: [stone('obsidian', 'cluster'), stone('smoky-quartz', 'point')],
      tool: tool('raven-skull'),
    },
  },
  {
    ids: ['yule', 'jol', 'sol_invictus', 'koliada', 'saturnalia'],
    theme: {
      background: 'winter-yule',
      focal: c('gold', 'pillar'),
      candles: [c('red'), c('green')],
      outer: [c('red', 'taper'), c('green', 'taper')],
      incense: herb('frankincense', 'incense'),
      herb: herb('holly'),
      offering: vessel('offering-bowl'),
      crystals: [stone('garnet', 'tumbled'), stone('clear-quartz', 'cluster')],
      tool: tool('bell'),
    },
  },
  {
    ids: ['imbolc', 'la_fheile_bride'],
    theme: {
      background: 'witch-cabin',
      focal: deity('brigid'),
      candles: [c('white'), c('white')],
      outer: [c('white', 'taper'), c('white', 'taper')],
      incense: herb('frankincense', 'incense'),
      herb: herb('bay'),
      offering: tool('chalice'),
      crystals: [stone('amethyst', 'point'), stone('clear-quartz', 'cluster')],
      tool: tool('besom'),
    },
  },
  {
    ids: ['ostara'],
    theme: {
      background: 'spring-meadow',
      focal: deity('idunn'),
      candles: [c('green'), c('yellow')],
      outer: [c('pink', 'taper'), c('pink', 'taper')],
      incense: herb('jasmine', 'incense'),
      herb: herb('lavender'),
      offering: vessel('bowl'),
      crystals: [stone('rose-quartz', 'point'), stone('moss-agate', 'tumbled')],
      tool: tool('wand'),
    },
  },
  {
    ids: ['beltane', 'bealtaine', 'floralia'],
    theme: {
      background: 'spring-meadow',
      focal: deity('freyja'),
      candles: [c('red'), c('white')],
      outer: [c('green', 'taper'), c('green', 'taper')],
      incense: herb('rose', 'incense'),
      herb: herb('rosemary'),
      offering: tool('chalice'),
      crystals: [stone('carnelian', 'tumbled'), stone('emerald', 'cluster')],
      tool: tool('besom'),
    },
  },
  {
    ids: ['litha', 'midsummer', 'kupala'],
    theme: {
      background: 'cottagecore',
      focal: deity('ra'),
      candles: [c('gold'), c('yellow')],
      outer: [c('orange', 'taper'), c('orange', 'taper')],
      incense: herb('frankincense', 'incense'),
      herb: herb('st-john-s-wort'),
      offering: vessel('offering-bowl'),
      crystals: [stone('citrine', 'tumbled'), stone('sunstone', 'tumbled')],
      tool: tool('wand'),
    },
  },
  {
    ids: ['lughnasadh', 'lammas'],
    theme: {
      background: 'autumn-harvest',
      focal: deity('lugh'),
      candles: [c('orange'), c('gold')],
      outer: [c('yellow', 'taper'), c('yellow', 'taper')],
      incense: herb('sandalwood', 'incense'),
      herb: herb('bay'),
      offering: vessel('offering-bowl'),
      crystals: [stone('citrine', 'tumbled'), stone('tiger-eye', 'tumbled')],
      tool: tool('boline'),
    },
  },
  {
    ids: ['mabon', 'haustblot'],
    theme: {
      background: 'autumn-harvest',
      focal: deity('demeter'),
      candles: [c('brown'), c('orange')],
      outer: [c('red', 'taper'), c('gold', 'taper')],
      incense: herb('cinnamon', 'incense'),
      herb: herb('sage'),
      offering: vessel('offering-bowl'),
      crystals: [stone('amber', 'tumbled'), stone('smoky-quartz', 'point')],
      tool: tool('mortar-and-pestle'),
    },
  },
  {
    ids: ['deipnon'],
    theme: {
      background: 'gothic',
      focal: deity('hekate'),
      candles: [c('black'), c('black')],
      outer: [c('purple', 'taper'), c('purple', 'taper')],
      incense: herb('myrrh', 'incense'),
      herb: herb('garlic'),
      offering: vessel('offering-bowl'),
      crystals: [stone('obsidian', 'cluster'), stone('black-tourmaline', 'tumbled')],
      tool: tool('key'),
    },
  },
  {
    ids: ['noumenia'],
    theme: {
      background: 'celestial',
      focal: deity('hestia'),
      candles: [c('white'), c('silver')],
      outer: [c('white', 'taper'), c('white', 'taper')],
      incense: herb('frankincense', 'incense'),
      herb: herb('bay'),
      offering: vessel('spell-jar'),
      crystals: [stone('moonstone', 'tumbled'), stone('selenite', 'point')],
      tool: tool('bell'),
    },
  },
];

/**
 * Where each part stands. `depth` runs from the back edge of the tabletop (0)
 * to its front edge (1), so tall and short things stand on the same line on
 * any background; `cx` is across the stage; `scale` × a new object's size;
 * and a slight turn.
 */
type Slot = { cx: number; depth: number; scale: number; rotate?: number };
const SLOTS = {
  focal: { cx: 0.5, depth: 0.04, scale: 1.9 },
  outerL: { cx: 0.29, depth: 0.12, scale: 0.75 },
  outerR: { cx: 0.71, depth: 0.12, scale: 0.75 },
  candleL: { cx: 0.38, depth: 0.32, scale: 0.8 },
  candleR: { cx: 0.62, depth: 0.32, scale: 0.8 },
  incense: { cx: 0.21, depth: 0.4, scale: 0.9 },
  herb: { cx: 0.79, depth: 0.43, scale: 0.95, rotate: 6 },
  offering: { cx: 0.5, depth: 0.58, scale: 0.95 },
  crystalL: { cx: 0.33, depth: 0.8, scale: 1.05 },
  crystalR: { cx: 0.67, depth: 0.8, scale: 1.05, rotate: -6 },
  tool: { cx: 0.5, depth: 0.97, scale: 1.25, rotate: -12 },
} satisfies Record<string, Slot>;

/** Tea lights (or chime candles) at the front corners, for the full or new moon. */
const MOON_ARC: Slot[] = [
  { cx: 0.2, depth: 0.95, scale: 0.5 },
  { cx: 0.8, depth: 0.95, scale: 0.5 },
  { cx: 0.13, depth: 0.7, scale: 0.45 },
  { cx: 0.87, depth: 0.7, scale: 0.45 },
];
/** In front of the centrepiece, for the moon's own touch. */
const MOON_CENTRE: Slot = { cx: 0.5, depth: 0.18, scale: 0.55 };

/** Where each background's tabletop starts and ends, in stage heights. */
const SURFACES: Record<string, [back: number, front: number]> = {
  'forest-altar': [0.6, 0.88],
  gothic: [0.56, 0.8],
  'winter-yule': [0.51, 0.76],
  'spring-meadow': [0.54, 0.78],
  'autumn-harvest': [0.51, 0.77],
  cottagecore: [0.55, 0.8],
  'witch-cabin': [0.55, 0.8],
  celestial: [0.55, 0.79],
};

function placed(parts: [Pick, Slot][], surface: [number, number], now: string): { objects: SavedObject[]; labels: string[] } {
  const objects: SavedObject[] = [];
  const labels: string[] = [];
  // Back to front, so nearer things are drawn over farther ones.
  const ordered = [...parts].sort((a, b) => a[1].depth - b[1].depth);
  for (const [[itemId, formId], slot] of ordered) {
    const item = builtInCabinet.find((i) => i.id === itemId);
    // Only forms that have a picture; another form of the same thing stands in otherwise.
    const forms = item ? placeableForms(item) : [];
    const form = forms.find((f) => (f.form || f.label) === formId) ?? forms[0];
    if (!item || !form) continue;
    // (The pictures' feet sit a little above their box's edge, hence the nudge forward.)
    const base = surface[0] + 0.05 + slot.depth * (surface[1] - surface[0]);
    let object = withSize(objectFromForm(item, form, objects, now, {}, { cx: slot.cx, cy: base }), NEW_OBJECT_SIZE * slot.scale);
    // Stand it on its line: its box's bottom, less the picture's own margin.
    const height = boxHeightFraction(displayBox(object));
    object = withCenter(object, slot.cx, base - height / 2 + height * 0.04);
    if (slot.rotate) object = withRotation(object, slot.rotate);
    objects.push(object);
    labels.push(shortLabel(object.label, item.name));
  }
  return { objects, labels };
}

/**
 * Tonight's altar for `date`. `holidayIds` are today's holidays (from the
 * calendars chosen in Settings); `moon` is tonight's phase name.
 */
export function tonightAltar(date: Date, holidays: { id: string; name: string }[], moon: string): TonightAltar {
  const now = date.toISOString();
  const holidaySet = holidays
    .map((holiday) => ({ holiday, set: HOLIDAYS.find((h) => h.ids.some((id) => holiday.id === id || holiday.id.startsWith(`${id}_`))) }))
    .find((h) => !!h.set);

  const theme: Theme = holidaySet?.set ? { ...holidaySet.set.theme, reason: holidaySet.holiday.name } : { ...WEEKDAYS[date.getDay()] };
  const parts: [Pick, Slot][] = [
    [theme.focal, SLOTS.focal],
    [theme.outer[0], SLOTS.outerL],
    [theme.outer[1], SLOTS.outerR],
    [theme.candles[0], SLOTS.candleL],
    [theme.candles[1], SLOTS.candleR],
    [theme.incense, SLOTS.incense],
    [theme.herb, SLOTS.herb],
    [theme.offering, SLOTS.offering],
    [theme.crystals[0], SLOTS.crystalL],
    [theme.crystals[1], SLOTS.crystalR],
    [theme.tool, SLOTS.tool],
  ];
  let reason = theme.reason;
  if (!holidaySet?.set) {
    if (moon === 'Full Moon') {
      MOON_ARC.forEach((slot) => parts.push([c('white', 'tea-light'), slot]));
      parts.push([stone('selenite', 'cluster'), MOON_CENTRE]);
      reason += ', under the full moon';
    } else if (moon === 'New Moon') {
      parts.push([c('black', 'chime-spell'), MOON_ARC[0]], [c('black', 'chime-spell'), MOON_ARC[1]]);
      parts.push([vessel('spell-jar'), MOON_CENTRE]);
      reason += ', at the new moon';
    }
  }

  const background = builtInBackgrounds.find((b) => b.id === (theme.background ?? 'forest-altar'));
  const { objects, labels } = placed(parts, SURFACES[background?.id ?? 'forest-altar'] ?? SURFACES['forest-altar'], now);
  return {
    doc: {
      background: theme.background ? (background?.background ?? '') : '',
      backgroundName: theme.background ? (background?.name ?? '') : '',
      groups: [],
      activeGroupId: null,
      objects,
      extra: {},
    },
    reason,
    labels,
  };
}
