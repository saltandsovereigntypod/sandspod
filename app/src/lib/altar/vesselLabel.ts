// Labelled containers: herbs and resins kept in a glass jar, oils in a
// dropper bottle, waters in a corked bottle, decks in their box and books by
// their spine, each with a label you write yourself. The pictures are plain
// (no lettering painted in); the app and the website draw the label on top,
// in the rect given here, so the words stay sharp and can be changed. Used by
// My Shelves and by the Apothecary (its blends, oils and waters, on the altar
// too: the placed object carries `vesselLabel`). Pure, so it can be tested;
// the website reaches it through js/core/shelves.js and js/core/altar.js.

/** The container pictures, cropped to their edges (assets/altar/shelves/containers/). */
export type VesselKind = 'jar' | 'dropper' | 'bottle' | 'deck' | 'book';

export type Rect = { x: number; y: number; w: number; h: number };

export type Vessel = {
  kind: VesselKind;
  name: string;
  /** The picture, as the website writes art paths. */
  image: string;
  /** Height / width of the picture. */
  ratio: number;
  /** Where the label sits, as fractions of the picture. */
  label: Rect;
  /** The label reads up the spine (books). */
  vertical?: boolean;
  /** The glass a herb's own picture shows through (jars), as fractions of the picture. */
  fill?: Rect;
};

const DIR = '../assets/altar/shelves/containers/';

export const VESSELS: Record<VesselKind, Vessel> = {
  // The cabinet's clear spell jar, corked and tied with twine.
  jar: { kind: 'jar', name: 'Glass jar', image: `${DIR}jar.png`, ratio: 2, label: { x: 0.16, y: 0.5, w: 0.68, h: 0.24 }, fill: { x: 0.1, y: 0.42, w: 0.8, h: 0.5 } },
  // The cabinet's amber dropper bottle; the label covers its blank painted one.
  dropper: { kind: 'dropper', name: 'Dropper bottle', image: `${DIR}dropper.png`, ratio: 2.9425, label: { x: 0.06, y: 0.535, w: 0.88, h: 0.3 } },
  // The cabinet's green-glass corked bottle.
  bottle: { kind: 'bottle', name: 'Bottle', image: `${DIR}bottle.png`, ratio: 2.0317, label: { x: 0.15, y: 0.5, w: 0.7, h: 0.24 } },
  // A plum deck box with a blank paper panel.
  deck: { kind: 'deck', name: 'Deck box', image: `${DIR}deck.png`, ratio: 1.845, label: { x: 0.2, y: 0.36, w: 0.6, h: 0.28 } },
  // An oxblood leather spine with gilt bands.
  book: { kind: 'book', name: 'Book', image: `${DIR}book.png`, ratio: 5.0945, label: { x: 0.14, y: 0.31, w: 0.72, h: 0.43 }, vertical: true },
};

export type LabelStyle = 'paper' | 'kraft' | 'gold';
export type LabelFont = 'ink' | 'script' | 'hand';

export const LABEL_STYLES: { value: LabelStyle; label: string }[] = [
  { value: 'paper', label: 'Aged paper' },
  { value: 'kraft', label: 'Kraft' },
  { value: 'gold', label: 'Black with gold' },
];

export const LABEL_FONTS: { value: LabelFont; label: string }[] = [
  { value: 'ink', label: 'Ink serif' },
  { value: 'script', label: 'Script' },
  { value: 'hand', label: 'Handwritten' },
];

/** Each label's paper, ink and edge colours (the website's .vl--* classes match). */
export const LABEL_COLOURS: Record<LabelStyle, { paper: string; ink: string; edge: string }> = {
  paper: { paper: '#e9dcb9', ink: '#3a2a16', edge: '#a88b5a' },
  kraft: { paper: '#b48d5e', ink: '#2b1b0c', edge: '#7d5a33' },
  gold: { paper: '#17120d', ink: '#d9b866', edge: '#b08f45' },
};

export const LABEL_MAX = 60;

export type VesselLabel = { text: string; style: LabelStyle; font: LabelFont };

const isStyle = (v: unknown): v is LabelStyle => LABEL_STYLES.some((s) => s.value === v);
const isFont = (v: unknown): v is LabelFont => LABEL_FONTS.some((f) => f.value === v);

/** What the label says: your own words, else the thing's name. */
export const labelText = (label: string | null | undefined, name: string) => (String(label ?? '').trim() || String(name ?? '').trim()).slice(0, LABEL_MAX);

/** A label from any saved shape (an object, or the JSON string an altar object carries); null if there is none. */
export function cleanVesselLabel(raw: unknown): (VesselLabel & { vessel?: VesselKind }) | null {
  let value = raw;
  if (typeof value === 'string') {
    if (!value.trim()) return null;
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object') return null;
  const r = value as Record<string, unknown>;
  const vessel = typeof r.vessel === 'string' && r.vessel in VESSELS ? (r.vessel as VesselKind) : undefined;
  return {
    text: typeof r.text === 'string' ? r.text.trim().slice(0, LABEL_MAX) : '',
    style: isStyle(r.style) ? r.style : 'paper',
    font: isFont(r.font) ? r.font : 'ink',
    ...(vessel ? { vessel } : {}),
  };
}

/** Which container a thing on My Shelves is shown in, or null for its own picture (crystals, candles, statues, tools…). */
export function vesselForShelf(shelf: string, name = ''): VesselKind | null {
  if (shelf === 'herbs') return 'jar';
  if (shelf === 'oils') return /\b(waters?|spray|mist|florida|hydrosol|rose ?water)\b/i.test(name) ? 'bottle' : 'dropper';
  if (shelf === 'decks') return 'deck';
  if (shelf === 'books') return 'book';
  return null;
}

/** Which container an Apothecary making is shown in: blends in a jar, oils in a dropper, waters in a bottle; null keeps its own picture. */
export function vesselForApothecary(type: string, name = ''): VesselKind | null {
  if (/\b(waters?|hydrosol|florida)\b/i.test(name) && type !== 'spray') return 'bottle';
  if (type === 'herb-mix' || type === 'tending-blend') return 'jar';
  if (type === 'oil-tincture') return 'dropper';
  return null;
}

/**
 * Where a picture of height/width `ratio` is drawn in a box when it is
 * contained (letterboxed) and, with `bottom`, set down on the box's floor;
 * then `rect` (fractions of the picture) within it. In the box's own units.
 */
export function containedRect(boxW: number, boxH: number, ratio: number, rect: Rect, bottom = false): Rect {
  const r = ratio > 0 ? ratio : 1;
  const w = Math.min(boxW, boxH / r);
  const h = w * r;
  const left = (boxW - w) / 2;
  const top = bottom ? boxH - h : (boxH - h) / 2;
  return { x: left + rect.x * w, y: top + rect.y * h, w: rect.w * w, h: rect.h * h };
}

/**
 * The label's font size for a label box `w` × `h` (any unit): as large as
 * fits, on up to two lines (one line up a spine), never more than a third of
 * the box's height so a short word doesn't shout.
 */
export function labelFontSize(text: string, w: number, h: number, vertical = false): number {
  const across = vertical ? h : w;
  const deep = vertical ? w : h;
  const n = Math.max(String(text || '').trim().length, 3);
  const lines = vertical || n <= 10 ? 1 : 2;
  const perLine = Math.ceil(n / lines);
  const byWidth = (across * 0.92) / (perLine * 0.52);
  const byHeight = (deep * (lines === 1 ? 0.62 : 0.4));
  return Math.max(1, Math.min(byWidth, byHeight, deep * 0.62));
}

/** The label an altar object carries for a container and its words (stored as a string, as the website keeps object fields). */
export const vesselLabelField = (vessel: VesselKind, label: VesselLabel) => JSON.stringify({ vessel, text: label.text, style: label.style, font: label.font });
