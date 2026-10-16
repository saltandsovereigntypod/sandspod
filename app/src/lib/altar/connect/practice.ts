// Practice tools on the altar: one of your own stones from Crystal, a plant
// from Green, and tonight's card or rune from Hedge, each placed as an object
// the website already draws (a crystal, a herb, a tool) and linked back to its
// entry through `livingState.app.stone` / `.plant` / `.reading`. Pure, so it
// can be tested.

import { builtInCabinet, objectFromForm } from '../cabinet.ts';
import { NEW_OBJECT_SIZE, objectAspect, objectSize, savedFromBox, withSize } from '../geometry.ts';
import { nextLayer } from '../layers.ts';
import { appStateOf, ensureLivingState, setAppState } from '../livingState.ts';
import type { CabinetForm, CabinetItem, SavedObject } from '../types.ts';
import { careBadges, findCare, methodWarning, type StoneCare } from '../../craft/crystal/care.ts';
import { careHistory, careId, cleanseStatus, lastCare, normaliseStone, type CareLog, type CleanseRule, type Stone } from '../../craft/crystal/stones.ts';
import { asPlant, herbName, history, isGrowing, type Plant } from '../../craft/green/garden.ts';
import { ELDER_FUTHARK, methodLabel, normalizeReading, sortReadings, type Reading } from '../../craft/hedge/readings.ts';
import { localDateKey } from '../../rituals/lifecycle.ts';

type Entry<T> = { id: string; createdAt: string; data: T };

const linkOf = (object: SavedObject | null | undefined, key: string): string => {
  if (!object) return '';
  const raw = appStateOf(object)[key] as { id?: unknown } | undefined;
  return raw && typeof raw.id === 'string' ? raw.id : '';
};

export const stoneIdOf = (object: SavedObject | null | undefined) => linkOf(object, 'stone');
export const plantIdOf = (object: SavedObject | null | undefined) => linkOf(object, 'plant');
export const readingIdOf = (object: SavedObject | null | undefined) => linkOf(object, 'reading');

const findItem = (id: string) => builtInCabinet.find((i) => i.id === id) ?? null;
const formWith = (item: CabinetItem | null, want: string[]) => {
  if (!item) return null;
  for (const f of want) {
    const form = item.forms.find((x) => x.form === f && !!x.image);
    if (form) return form;
  }
  return item.forms.find((x) => !!x.image) ?? null;
};

function placeForm(item: CabinetItem, form: CabinetForm, existing: SavedObject[], now: string, center?: { cx: number; cy: number }) {
  return objectFromForm(item, form, existing, now, {}, center ?? { cx: 0.5, cy: 0.62 });
}

// ── Stones ────────────────────────────────────────────────────────────────

const STONE_FORM_TO_CABINET: Record<string, string[]> = {
  tumbled: ['tumbled', 'point', 'chips'],
  point: ['point', 'tumbled'],
  cluster: ['cluster', 'point'],
  raw: ['chips', 'cluster', 'point'],
  sphere: ['tumbled', 'point'],
  jewellery: ['tumbled', 'point'],
  other: ['point', 'tumbled'],
};

/** The cabinet crystal a stone looks like: by its care key, its name, or plain clear quartz. */
export function cabinetCrystalFor(stone: Stone): CabinetItem | null {
  const care = findCare(stone.key ?? null, stone.name);
  const key = care?.key ?? '';
  const byKey = key ? builtInCabinet.find((i) => i.category === 'crystals' && i.forms.some((f) => f.crystal === key)) : null;
  return byKey ?? findItem('crystals:clear-quartz');
}

/** One of your stones on the altar: a crystal object named for it, linked by stoneId. */
export function stoneObject(entry: Entry<Stone>, existing: SavedObject[], now: string, center?: { cx: number; cy: number }): SavedObject {
  const stone = normaliseStone(entry.data);
  const item = cabinetCrystalFor(stone);
  const form = formWith(item, STONE_FORM_TO_CABINET[stone.form] ?? ['point']);
  if (!item || !form) throw new Error('No crystal artwork to place.');
  const placed = { ...placeForm(item, form, existing, now, center), label: stone.name };
  return setAppState(placed, { stone: { id: entry.id, name: stone.name } }, now, false);
}

export type StoneBadges = {
  name: string;
  /** "Next due in 12 days", "Due: last cleansed over 30 days ago". */
  status: string;
  due: boolean;
  lastCleansed: string | null;
  lastCharged: string | null;
  /** Care badges: hardness, water, salt, sun, handling. */
  badges: string[];
  care: StoneCare | null;
  intentions: string[];
};

/** What the object panel shows for a stone from your collection. */
export function stonePanel(stone: Stone, rule: CleanseRule, now: Date): StoneBadges {
  const s = normaliseStone(stone);
  const care = findCare(s.key ?? null, s.name);
  const status = cleanseStatus(s, rule, now);
  return {
    name: s.name,
    status: status.label,
    due: status.due,
    lastCleansed: lastCare(s, 'cleansed')?.at ?? null,
    lastCharged: lastCare(s, 'charged')?.at ?? null,
    badges: care ? careBadges(care) : [],
    care,
    intentions: s.intentions,
  };
}

/**
 * A cleansing or charge done on the altar, added to the stone's own log in
 * Crystal. Methods come from the altar's care sheet ("Moonlight", "Sound").
 * The same moment twice is only logged once.
 */
export function stoneCareFromAltar(
  stone: Stone,
  input: { kind: 'cleansed' | 'charged'; at: string; methods: string[]; intention?: string; note?: string; altarName?: string },
  id: string = careId(),
): Stone {
  const s = normaliseStone(stone);
  if (s.care.some((c) => c.kind === input.kind && c.at === input.at)) return s;
  const method = input.methods.map((m) => m.trim()).filter(Boolean).join(', ');
  const where = input.altarName?.trim() ? `On the altar “${input.altarName.trim()}”.` : 'On the altar.';
  const log: CareLog = {
    id,
    kind: input.kind,
    at: input.at,
    ...(method ? { method } : {}),
    ...(input.intention?.trim() ? { intention: input.intention.trim() } : {}),
    note: [where, input.note?.trim() ?? ''].filter(Boolean).join(' '),
  };
  return { ...s, care: [...s.care, log] };
}

/** Warnings for the chosen methods on this stone (water on selenite…). */
export function careWarnings(stone: Stone, methods: string[]): string[] {
  const care = findCare(stone.key ?? null, stone.name);
  return methods.map((m) => methodWarning(care, m)).filter((w): w is string => !!w);
}

/** The newest care entries for the panel. */
export const recentCare = (stone: Stone, count = 3) => careHistory(normaliseStone(stone)).slice(0, count);

// ── Plants ────────────────────────────────────────────────────────────────

/** A plant from your garden on the altar: a fresh sprig of its herb, or its herb loose. */
export function plantObject(entry: Entry<Plant>, existing: SavedObject[], now: string, form: 'sprig' | 'loose' = 'sprig', center?: { cx: number; cy: number }): SavedObject {
  const plant = asPlant(entry.data);
  const item = plant.herb ? builtInCabinet.find((i) => i.category === 'herbs' && i.forms.some((f) => f.herb === plant.herb)) ?? null : null;
  const chosen = formWith(item, [form, form === 'sprig' ? 'loose' : 'sprig']);
  let object: SavedObject;
  if (item && chosen) {
    object = { ...placeForm(item, chosen, existing, now, center), label: plant.name };
  } else {
    // A plant the Library has no picture for: a herb the website shows as its symbol.
    const c = center ?? { cx: 0.5, cy: 0.62 };
    object = ensureLivingState(
      {
        imagePath: '',
        fallbackSymbol: '❦',
        label: plant.name,
        type: 'herb',
        entityId: '',
        instanceId: '',
        herb: plant.herb ?? '',
        form,
        scale: '1',
        rotation: '0',
        flipped: 'false',
        locked: 'false',
        glowing: 'false',
        lit: 'false',
        livingState: '',
        altarObjectId: '',
        groupId: '',
        ...savedFromBox({ cx: c.cx, cy: c.cy, size: NEW_OBJECT_SIZE, aspect: objectAspect({}) }),
        zIndex: String(nextLayer(existing)),
      },
      now,
    );
  }
  return setAppState(object, { plant: { id: entry.id, name: plant.name } }, now, false);
}

export function plantPanel(plant: Plant): { name: string; herb: string | null; place: string; growing: boolean; last: string | null } {
  const p = asPlant(plant);
  const last = history(p)[0];
  return { name: p.name, herb: herbName(p.herb), place: p.place, growing: isGrowing(p), last: last ? `${last.kind === 'note' ? 'Noted' : last.kind[0].toUpperCase() + last.kind.slice(1)} on ${last.on}` : null };
}

/** Growing plants first, as the garden lists them. */
export const plantChoices = <T extends Entry<Plant>>(entries: T[]): T[] => entries.filter((e) => isGrowing(asPlant(e.data))).concat(entries.filter((e) => !isGrowing(asPlant(e.data))));

// ── Readings ──────────────────────────────────────────────────────────────

/** Tonight's reading: today's if there is one, otherwise the most recent. */
export function tonightsReading<T extends Entry<Reading>>(entries: T[], now: Date): T | null {
  const list = sortReadings(entries.map((e) => ({ ...e, data: normalizeReading(e.data) })) as T[]);
  const today = localDateKey(now);
  return list.find((e) => e.data.date === today && e.data.drawn.length) ?? list.find((e) => e.data.drawn.length) ?? null;
}

/** What a drawn name is: a rune (with its glyph), a card, or something else. */
export function drawnKind(name: string, method: string): { kind: 'rune' | 'tarot' | 'oracle' | 'other'; glyph: string } {
  const rune = ELDER_FUTHARK.find((r) => r.name.toLowerCase() === name.toLowerCase());
  if (rune) return { kind: 'rune', glyph: rune.glyph };
  if (method === 'tarot') return { kind: 'tarot', glyph: '' };
  if (method === 'oracle') return { kind: 'oracle', glyph: '' };
  return { kind: method === 'runes' ? 'rune' : 'other', glyph: '' };
}

/**
 * One drawn card or rune as a small tool on the altar, named for it. Cards
 * show the tarot or oracle deck; a rune is a plain tool the website and app
 * draw as its glyph.
 */
export function readingObject(entry: Entry<Reading>, drawn: string, existing: SavedObject[], now: string, center?: { cx: number; cy: number }): SavedObject {
  const reading = normalizeReading(entry.data);
  const name = drawn.trim() || reading.drawn[0] || methodLabel(reading.method);
  const what = drawnKind(name, reading.method);
  const deck = what.kind === 'oracle' ? 'tools:oracle-deck' : reading.method === 'pendulum' ? 'tools:pendulum' : 'tools:tarot-deck';
  const item = findItem(deck);
  const form = formWith(item, ['standard']);
  let object: SavedObject;
  if (what.kind !== 'rune' && item && form) {
    object = { ...placeForm(item, form, existing, now, center), label: name };
    // A card is a little smaller than the deck it came from.
    object = withSize(object, objectSize(object) * 0.8);
  } else {
    const c = center ?? { cx: 0.5, cy: 0.62 };
    object = ensureLivingState(
      {
        imagePath: '',
        fallbackSymbol: what.glyph || '✦',
        label: name,
        type: 'tool',
        entityId: '',
        instanceId: '',
        tool: what.kind === 'rune' ? 'rune' : 'reading',
        form: 'standard',
        plaqueText: name,
        scale: '1',
        rotation: '0',
        flipped: 'false',
        locked: 'false',
        glowing: 'false',
        lit: 'false',
        livingState: '',
        altarObjectId: '',
        groupId: '',
        ...savedFromBox({ cx: c.cx, cy: c.cy, size: NEW_OBJECT_SIZE * 0.7, aspect: 1 }),
        zIndex: String(nextLayer(existing)),
      },
      now,
    );
  }
  return setAppState(object, { reading: { id: entry.id, drawn: name, date: reading.date, method: reading.method } }, now, false);
}

export function readingPanel(reading: Reading, drawn: string): { title: string; method: string; date: string; question: string; meaning: string } {
  const r = normalizeReading(reading);
  return { title: drawn || r.drawn[0] || methodLabel(r.method), method: methodLabel(r.method), date: r.date, question: r.question.trim(), meaning: r.interpretation.trim() || r.cameUp.trim() };
}

/** The card or rune name a reading object carries. */
export const drawnOf = (object: SavedObject | null | undefined): string => {
  if (!object) return '';
  const raw = appStateOf(object).reading as { drawn?: unknown } | undefined;
  return raw && typeof raw.drawn === 'string' ? raw.drawn : '';
};
