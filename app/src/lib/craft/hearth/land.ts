// The land journal: the places you know (home, a garden, a wood, a shore)
// and what you notice there over the years: weather, the first and last
// frosts, birdsong, blooms, fruit, animals, water, offerings to the spirits
// of the place. Each note is read against its day: the moon that evening,
// where the day sits on the Wheel of the Year (turned for the southern
// hemisphere when you keep that wheel or live there), and the holy days of
// the calendars you keep. "This time last year" gathers the notes from the
// same weeks of earlier years.
//
// Places and notes are craft entries (collections land.places and
// land.notes), so they follow the account like the garden does. A place's
// rough location is never in them: it stays on the device (landWhere.ts on
// the app, localStorage on the website). Pure, so it can be tested and
// shared with the website (js/core/hearth.js).

import { holidaysBetween, type Holiday, type HolidayChoice } from '../../holidays.ts';
import { moonState, type PhaseName } from '../../moon.ts';
import { dateFromKey, localDateKey } from '../../rituals/lifecycle.ts';
import { herbName } from '../green/garden.ts';

export const LAND_PLACES = 'land.places';
export const LAND_NOTES = 'land.notes';

const DAY = 86_400_000;
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()) : []);

// ── Places ──────────────────────────────────────────────────────────────────

export type PlaceKind = 'home' | 'garden' | 'wood' | 'shore' | 'field' | 'water' | 'hill' | 'park' | 'other';

export const PLACE_KINDS: { id: PlaceKind; label: string; hint: string }[] = [
  { id: 'home', label: 'Home', hint: 'The house itself, its hearth and threshold' },
  { id: 'garden', label: 'Garden', hint: 'A garden, yard, balcony or allotment' },
  { id: 'wood', label: 'Wood', hint: 'A wood, copse, old tree or hedgerow' },
  { id: 'shore', label: 'Shore', hint: 'A beach, cliff, estuary or lake edge' },
  { id: 'field', label: 'Field or meadow', hint: 'Open ground, a common or moor' },
  { id: 'water', label: 'River, spring or well', hint: 'Running water, a pond, a holy well' },
  { id: 'hill', label: 'Hill or stone', hint: 'A hill, crossroads, standing stone or cairn' },
  { id: 'park', label: 'Park or street', hint: 'A park, churchyard or the street you walk' },
  { id: 'other', label: 'Somewhere else', hint: '' },
];
export const placeKindLabel = (id: string) => PLACE_KINDS.find((k) => k.id === id)?.label ?? 'A place';

export type LandPlace = {
  name: string;
  kind: PlaceKind;
  /** What it's like, how you come to it. */
  about: string;
  /** The spirit of the place as you know it: what you sense there, how you greet it. */
  spirit: string;
  /** What you give there, and what you've learned is welcome. */
  offerings: string;
  /** Access and care: whose land, permission, what's fragile. */
  access: string;
  /** When you first came to know it, YYYY-MM-DD, or blank. */
  since: string;
  archived: boolean;
};

export const blankPlace = (kind: PlaceKind = 'garden'): LandPlace => ({ name: '', kind, about: '', spirit: '', offerings: '', access: '', since: '', archived: false });

export function normalizePlace(raw: unknown): LandPlace {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<LandPlace>;
  return {
    name: str(r.name).trim() || 'A place',
    kind: PLACE_KINDS.some((k) => k.id === r.kind) ? (r.kind as PlaceKind) : 'other',
    about: str(r.about),
    spirit: str(r.spirit),
    offerings: str(r.offerings),
    access: str(r.access),
    since: dateFromKey(str(r.since)) ? str(r.since) : '',
    archived: r.archived === true,
  };
}

/** A place's rough location, kept only on this device: a few words or a rounded latitude and longitude. */
export function cleanWhere(text: string): string {
  return String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

// ── Notes ───────────────────────────────────────────────────────────────────

export type NoteKind = 'weather' | 'frost' | 'birdsong' | 'bloom' | 'fruit' | 'leaf' | 'animal' | 'water' | 'offering' | 'other';

export const NOTE_KINDS: { id: NoteKind; label: string; hint: string }[] = [
  { id: 'weather', label: 'Weather', hint: 'Rain, wind, heat, the light, the first snow' },
  { id: 'frost', label: 'Frost', hint: 'Mark the first frost of autumn or the last of spring' },
  { id: 'birdsong', label: 'Birdsong & birds', hint: 'The first blackbird at dawn, swifts arriving, geese leaving' },
  { id: 'bloom', label: 'In bloom', hint: 'Snowdrops, blackthorn, may blossom, heather' },
  { id: 'fruit', label: 'Fruit & seed', hint: 'Blackberries, haws, hips, nuts, seed heads' },
  { id: 'leaf', label: 'Leaf & bud', hint: 'First leaves, buds breaking, leaves turning and falling' },
  { id: 'animal', label: 'Animals', hint: 'Hares, deer, frogspawn, the first bee or butterfly' },
  { id: 'water', label: 'Water', hint: 'The level of a river, spring, pond or tide' },
  { id: 'offering', label: 'Offering', hint: 'What you gave the place, and to whom' },
  { id: 'other', label: 'Something else', hint: '' },
];
export const noteKindLabel = (id: string) => NOTE_KINDS.find((k) => k.id === id)?.label ?? 'A note';

export type FrostMark = 'first' | 'last';
export const FROST_MARKS: { id: FrostMark; label: string }[] = [
  { id: 'first', label: 'First frost of the autumn' },
  { id: 'last', label: 'Last frost of the spring' },
];

export type WaterLevel = 'dry' | 'low' | 'usual' | 'high' | 'flood';
export const WATER_LEVELS: { id: WaterLevel; label: string }[] = [
  { id: 'dry', label: 'Dry' },
  { id: 'low', label: 'Low' },
  { id: 'usual', label: 'As usual' },
  { id: 'high', label: 'High' },
  { id: 'flood', label: 'In flood' },
];

/** A potted plant from your altar, kept by id and name so the note reads even when the altar isn't open. */
export type PottedRef = { id: string; name: string };

export type LandNote = {
  /** Local date, YYYY-MM-DD. */
  on: string;
  /** The land.places entry it belongs to, or null for "out and about". */
  placeId: string | null;
  kinds: NoteKind[];
  text: string;
  /** A few words on the weather that day. */
  weather: string;
  frost: FrostMark | null;
  water: WaterLevel | null;
  /** Living Library herbs and trees seen (herb keys). */
  herbs: string[];
  /** Plants from My garden (green.plants entry ids). */
  plants: string[];
  /** Potted plants from your altars. */
  potted: PottedRef[];
  /** What was offered, and to whom. */
  offering: string;
};

export const blankNote = (now: Date, placeId: string | null = null): LandNote => ({
  on: localDateKey(now),
  placeId,
  kinds: [],
  text: '',
  weather: '',
  frost: null,
  water: null,
  herbs: [],
  plants: [],
  potted: [],
  offering: '',
});

export function normalizeNote(raw: unknown): LandNote {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<LandNote> & Record<string, unknown>;
  const potted = Array.isArray(r.potted)
    ? (r.potted as unknown[])
        .filter((p): p is PottedRef => !!p && typeof (p as PottedRef).id === 'string' && typeof (p as PottedRef).name === 'string')
        .map((p) => ({ id: p.id, name: p.name }))
    : [];
  return {
    on: dateFromKey(str(r.on)) ? str(r.on) : localDateKey(new Date()),
    placeId: typeof r.placeId === 'string' && r.placeId ? r.placeId : null,
    kinds: strs(r.kinds).filter((k): k is NoteKind => NOTE_KINDS.some((n) => n.id === k)),
    text: str(r.text),
    weather: str(r.weather),
    frost: r.frost === 'first' || r.frost === 'last' ? r.frost : null,
    water: WATER_LEVELS.some((w) => w.id === r.water) ? (r.water as WaterLevel) : null,
    herbs: [...new Set(strs(r.herbs))],
    plants: [...new Set(strs(r.plants))],
    potted,
    offering: str(r.offering),
  };
}

/** Whether a note has anything in it worth keeping. */
export const noteHasContent = (n: LandNote) =>
  !!(n.text.trim() || n.weather.trim() || n.offering.trim() || n.frost || n.water || n.herbs.length || n.plants.length || n.potted.length || n.kinds.length);

/** A note's kinds, adding the ones its fields imply (a frost mark is a frost note, an offering an offering). */
export function kindsOf(n: LandNote): NoteKind[] {
  const out = new Set(n.kinds);
  if (n.frost) out.add('frost');
  if (n.water) out.add('water');
  if (n.offering.trim()) out.add('offering');
  if (n.weather.trim()) out.add('weather');
  return NOTE_KINDS.map((k) => k.id).filter((k) => out.has(k));
}

/** A one-line heading for a note: its first words, or what kinds it is. */
export function noteTitle(n: LandNote): string {
  const first = n.text.trim().split(/\n/)[0];
  if (first) return first.length > 70 ? `${first.slice(0, 67).trimEnd()}…` : first;
  if (n.frost) return FROST_MARKS.find((f) => f.id === n.frost)!.label;
  if (n.offering.trim()) return `Offering: ${n.offering.trim()}`;
  if (n.weather.trim()) return n.weather.trim();
  const herbs = n.herbs.map((h) => herbName(h) ?? h);
  if (herbs.length) return `Seen: ${herbs.join(', ')}`;
  return kindsOf(n).map(noteKindLabel).join(', ') || 'A note';
}

// ── The day a note was made ─────────────────────────────────────────────────

/** The moon on a note's day: that evening, when most lore reads it. */
export function moonOnDay(dateKey: string): PhaseName {
  const day = dateFromKey(dateKey) ?? new Date();
  return moonState(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 21)).name;
}

/** Whether to read the Wheel of the Year as it turns south of the equator. */
export function keepsSouthWheel(choice: HolidayChoice | null | undefined, latitude?: number | null): boolean {
  if (choice && (choice.traditions.includes('wheel_south') || (choice.picked ?? []).some((id) => id.startsWith('wheel_south/')))) return true;
  if (choice && (choice.traditions.includes('wheel') || (choice.picked ?? []).some((id) => id.startsWith('wheel/')))) return false;
  return typeof latitude === 'number' && latitude < 0;
}

export type WheelPlace = { on: Holiday | null; last: Holiday | null; next: Holiday | null };

/** Where a day sits on the Wheel of the Year: the sabbat that day, or the one before and the one after. */
export function wheelOn(dateKey: string, south = false): WheelPlace {
  const day = dateFromKey(dateKey) ?? new Date();
  const wheel: HolidayChoice = { traditions: [south ? 'wheel_south' : 'wheel'], custom: [], picked: [] };
  const list = holidaysBetween(new Date(day.getTime() - 120 * DAY), new Date(day.getTime() + 120 * DAY), wheel);
  const t = day.getTime();
  const on = list.find((h) => h.date.getTime() === t) ?? null;
  const last = [...list].reverse().find((h) => h.date.getTime() < t) ?? null;
  const next = list.find((h) => h.date.getTime() > t) ?? null;
  return { on, last, next };
}

/** "Samhain", or "Between Samhain and Yule". */
export function wheelWords(w: WheelPlace): string {
  if (w.on) return w.on.name;
  if (w.last && w.next) return `Between ${w.last.name} and ${w.next.name}`;
  return w.next ? `Before ${w.next.name}` : w.last ? `After ${w.last.name}` : '';
}

/** The holy days of the calendars you keep that fall on (or run across) a day. */
export function holyDaysOn(dateKey: string, choice: HolidayChoice): Holiday[] {
  const day = dateFromKey(dateKey);
  if (!day) return [];
  return holidaysBetween(day, day, choice).filter((h) => h.date.getTime() <= day.getTime());
}

export type DayReading = { moon: PhaseName; wheel: string; holy: Holiday[] };

/** Everything a note's day says: its moon, its place on the Wheel and its holy days. */
export function readDay(dateKey: string, choice: HolidayChoice, south: boolean): DayReading {
  return { moon: moonOnDay(dateKey), wheel: wheelWords(wheelOn(dateKey, south)), holy: holyDaysOn(dateKey, choice) };
}

// ── Looking back ────────────────────────────────────────────────────────────

type Dated = { id: string; createdAt: string; data: LandNote };

/** Notes newest first (same day: newest written first). */
export function sortNotes<T extends Dated>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.data.on === b.data.on ? (a.createdAt < b.createdAt ? 1 : -1) : a.data.on < b.data.on ? 1 : -1));
}

export type NoteFilter = { placeId?: string | null; kind?: NoteKind | null; herb?: string | null; query?: string };

/** Notes matching a place, a kind, a herb and every word typed, newest first. */
export function filterNotes<T extends Dated>(list: T[], filter: NoteFilter, places: Record<string, string> = {}): T[] {
  const words = (filter.query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  return sortNotes(
    list.filter(({ data: n }) => {
      if (filter.placeId && n.placeId !== filter.placeId) return false;
      if (filter.kind && !kindsOf(n).includes(filter.kind)) return false;
      if (filter.herb && !n.herbs.includes(filter.herb)) return false;
      if (!words.length) return true;
      const hay = [n.on, n.text, n.weather, n.offering, places[n.placeId ?? ''] ?? '', ...n.herbs.map((h) => herbName(h) ?? h), ...n.potted.map((p) => p.name), ...kindsOf(n).map(noteKindLabel)]
        .join(' ')
        .toLowerCase();
      return words.every((w) => hay.includes(w));
    }),
  );
}

export type YearAgo<T> = { yearsAgo: number; year: number; notes: T[] };

/**
 * "This time last year": notes from earlier years made within `window` days
 * of today's date in their year, grouped by year (most recent year first),
 * each group in date order.
 */
export function thisTimeLastYear<T extends Dated>(list: T[], now: Date, window = 14): YearAgo<T>[] {
  const groups = new Map<number, T[]>();
  for (const entry of list) {
    const day = dateFromKey(entry.data.on);
    if (!day) continue;
    for (const year of [day.getFullYear() - 1, day.getFullYear(), day.getFullYear() + 1]) {
      if (year >= now.getFullYear()) continue;
      const anchor = new Date(year, now.getMonth(), now.getDate());
      if (Math.abs(Math.round((day.getTime() - anchor.getTime()) / DAY)) <= window) {
        groups.set(year, [...(groups.get(year) ?? []), entry]);
        break;
      }
    }
  }
  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, notes]) => ({ year, yearsAgo: now.getFullYear() - year, notes: [...notes].sort((a, b) => (a.data.on < b.data.on ? -1 : a.data.on > b.data.on ? 1 : 0)) }));
}

export type YearMarks = { year: number; lastFrost: string | null; firstFrost: string | null; firsts: Partial<Record<NoteKind, string>> };

/**
 * Each year's markers, newest year first: the last spring frost and first
 * autumn frost you marked (the latest "last" and the earliest "first" in
 * that year), and the first note of birdsong, bloom, fruit, leaf and animals.
 */
export function yearMarkers<T extends Dated>(list: T[], placeId?: string | null): YearMarks[] {
  const years = new Map<number, YearMarks>();
  const kinds: NoteKind[] = ['birdsong', 'bloom', 'leaf', 'animal', 'fruit'];
  for (const { data: n } of list) {
    if (placeId && n.placeId !== placeId) continue;
    const day = dateFromKey(n.on);
    if (!day) continue;
    const y = day.getFullYear();
    const m = years.get(y) ?? { year: y, lastFrost: null, firstFrost: null, firsts: {} };
    if (n.frost === 'last' && (!m.lastFrost || n.on > m.lastFrost)) m.lastFrost = n.on;
    if (n.frost === 'first' && (!m.firstFrost || n.on < m.firstFrost)) m.firstFrost = n.on;
    for (const k of kindsOf(n)) if (kinds.includes(k) && (!m.firsts[k] || n.on < m.firsts[k]!)) m.firsts[k] = n.on;
    years.set(y, m);
  }
  return [...years.values()].filter((m) => m.lastFrost || m.firstFrost || Object.keys(m.firsts).length).sort((a, b) => b.year - a.year);
}

/** The Library herbs and trees you've noted, most often first, with the last day seen. */
export function herbsSeen<T extends Dated>(list: T[]): { key: string; name: string; count: number; last: string }[] {
  const seen = new Map<string, { key: string; name: string; count: number; last: string }>();
  for (const { data: n } of list) {
    for (const key of n.herbs) {
      const had = seen.get(key);
      seen.set(key, { key, name: herbName(key) ?? key, count: (had?.count ?? 0) + 1, last: had && had.last > n.on ? had.last : n.on });
    }
  }
  return [...seen.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** How many notes each place has, and its latest. */
export function placeCounts<T extends Dated>(list: T[]): Record<string, { count: number; last: string }> {
  const out: Record<string, { count: number; last: string }> = {};
  for (const { data: n } of list) {
    if (!n.placeId) continue;
    const had = out[n.placeId];
    out[n.placeId] = { count: (had?.count ?? 0) + 1, last: had && had.last > n.on ? had.last : n.on };
  }
  return out;
}

/** Places, those you still visit first, then by name. */
export function sortPlaces<T extends { data: LandPlace }>(list: T[]): T[] {
  return [...list].sort((a, b) => Number(a.data.archived) - Number(b.data.archived) || a.data.name.localeCompare(b.data.name));
}
