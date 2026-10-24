// Potted plants: a pot on the altar for each of your real houseplants (a
// snake plant, a pothos, and basil, rosemary, mint, lavender, sage and thyme
// on the windowsill). Nothing grows on its own: you choose the picture that
// matches your plant (young, established or lush), give it a name, where it
// lives and its light, and a photo of the real thing if you like. Mark it
// watered and it stays fresh; as it runs past its day it droops and dulls,
// gently, and perks up when watered. It never dies. The herbs can be
// harvested, to the altar as a fresh sprig or into a working, and every
// watering, feed, repotting, new leaf, cutting and harvest goes in its care
// journal with that day's moon.
//
// Placed from the cabinet's Plants drawer as `type: 'plant'` with its kind as
// `form` (and, for the herbs, its Living Library herb as `herb`). Its own
// details live in `livingState.app.potted`, the same on the app and the
// website (fields this doesn't know are kept as they are). Its pictures are
// assets/altar/objects/plants/<id>/<id>-<stage>.png, listed by
// scripts/build-altar-artwork.mjs; a kind with no picture isn't offered.
// Pure, so it can be tested.

import { ALTAR_ARTWORK } from './artworkData.ts';
import { appStateOf, logAppEvent, setAppState } from './livingState.ts';
import type { CabinetItem, SavedObject } from './types.ts';
import { moonOn } from '../craft/green/garden.ts';
import { QUARTERS, quarterOf } from '../craft/green/moonGarden.ts';
import { TRADITIONAL_LIBRARY } from '../library/traditionalData.ts';
import { moonState, type PhaseName } from '../moon.ts';
import { dateFromKey, localDateKey } from '../rituals/lifecycle.ts';

const DAY = 86_400_000;

export type PlantStage = 'young' | 'established' | 'lush';

export const PLANT_STAGES: { id: PlantStage; label: string }[] = [
  { id: 'young', label: 'Young' },
  { id: 'established', label: 'Established' },
  { id: 'lush', label: 'Lush' },
];

export type PottedKind = {
  id: string;
  name: string;
  /** The Living Library herb it is, for the herbs; null for the houseplants. */
  herb: string | null;
  /** How often it's usually watered, in days. */
  waterEvery: number;
  /** A word on the usual range, when it's wide ("every 2 to 3 weeks"). */
  waterNote: string;
  keywords: string[];
  /** Its folk associations, for the houseplants (the herbs' are in the Living Library). */
  folk: string;
  /** Honest pet safety. */
  pets: string;
  /** Toxic to cats and dogs. */
  toxic: boolean;
};

export const POTTED_KINDS: PottedKind[] = [
  {
    id: 'snake-plant',
    name: 'Snake Plant',
    herb: null,
    waterEvery: 18,
    waterNote: 'Usually every two to three weeks, less in winter. It would rather be dry than wet.',
    keywords: ['protection', 'warding', 'the threshold', 'houseplant', 'sansevieria'],
    folk: 'Kept for protection in folk practice: its upright, blade-like leaves are set to keep watch, often by the door.',
    pets: 'Toxic to cats and dogs. Its saponins can cause drooling, vomiting and diarrhoea if a leaf is chewed. Keep it out of reach, and call your vet if a pet eats some.',
    toxic: true,
  },
  {
    id: 'pothos',
    name: 'Pothos',
    herb: null,
    waterEvery: 7,
    waterNote: 'Usually about once a week, when the top of the soil is dry.',
    keywords: ['prosperity', 'steady growth', 'perseverance', 'houseplant', 'devil’s ivy'],
    folk: 'Kept for prosperity and steady growth: it trails on in almost any light, a little longer each week, as patient work does.',
    pets: 'Toxic to cats and dogs. Its leaves hold calcium oxalate crystals that burn the mouth, with drooling, pawing at the face, vomiting and trouble swallowing. Keep it out of reach, and call your vet if a pet chews it.',
    toxic: true,
  },
  {
    id: 'basil',
    name: 'Basil',
    herb: 'basil',
    waterEvery: 2,
    waterNote: 'A potted basil drinks often: every day or two in warm weather.',
    keywords: ['herb', 'windowsill', 'kitchen witchcraft'],
    folk: '',
    pets: 'Listed as non-toxic to cats and dogs. As with any plant, a lot eaten can upset a stomach.',
    toxic: false,
  },
  {
    id: 'rosemary',
    name: 'Rosemary',
    herb: 'rosemary',
    waterEvery: 5,
    waterNote: 'Let it dry a little between waterings; it dislikes wet roots.',
    keywords: ['herb', 'windowsill', 'kitchen witchcraft'],
    folk: '',
    pets: 'Listed as non-toxic to cats and dogs. A lot eaten can upset a stomach, and its essential oil is not safe for pets.',
    toxic: false,
  },
  {
    id: 'mint',
    name: 'Mint',
    herb: 'mint',
    waterEvery: 2,
    waterNote: 'Mint likes its soil kept moist: every day or two in a pot.',
    keywords: ['herb', 'windowsill', 'kitchen witchcraft'],
    folk: '',
    pets: 'Garden mint is listed as toxic to cats and dogs. A nibble rarely matters, but eating much of it can cause vomiting and diarrhoea, and mint essential oil is dangerous to cats.',
    toxic: true,
  },
  {
    id: 'lavender',
    name: 'Lavender',
    herb: 'lavender',
    waterEvery: 7,
    waterNote: 'About once a week; let it dry out between waterings.',
    keywords: ['herb', 'windowsill', 'kitchen witchcraft'],
    folk: '',
    pets: 'Listed as toxic to cats and dogs, for its linalool. A little is unlikely to harm, but eating more can cause nausea and vomiting, and lavender essential oil is dangerous to cats.',
    toxic: true,
  },
  {
    id: 'sage',
    name: 'Sage',
    herb: 'sage',
    waterEvery: 5,
    waterNote: 'Let the top of the soil dry between waterings.',
    keywords: ['herb', 'windowsill', 'kitchen witchcraft'],
    folk: '',
    pets: 'Garden sage is generally considered non-toxic to cats and dogs; eaten in quantity it can upset a stomach. Its essential oil is not safe for pets.',
    toxic: false,
  },
  {
    id: 'thyme',
    name: 'Thyme',
    herb: 'thyme',
    waterEvery: 5,
    waterNote: 'Let it dry a little between waterings; it likes a lean, sunny pot.',
    keywords: ['herb', 'windowsill', 'kitchen witchcraft'],
    folk: '',
    pets: 'Garden thyme is generally considered non-toxic to cats and dogs; eaten in quantity it can upset a stomach. Thyme essential oil is not safe for cats.',
    toxic: false,
  },
];

export const pottedKind = (id: string | null | undefined) => POTTED_KINDS.find((k) => k.id === id) ?? null;

/** The herbs, which can be harvested. */
export const canHarvest = (kind: PottedKind | null | undefined) => !!kind?.herb;

/** The light a plant lives in, offered as a choice (anything may be written instead). */
export const LIGHT_CHOICES = ['Bright, direct sun', 'Bright, indirect light', 'Medium light', 'Low light'];

export const WATER_EVERY_MIN = 1;
export const WATER_EVERY_MAX = 60;

// ── The cabinet ──────────────────────────────────────────────────────────

type PlantPictures = Record<string, Partial<Record<PlantStage, string>>>;

const pictures = (): PlantPictures => (ALTAR_ARTWORK as unknown as { plants?: PlantPictures }).plants ?? {};

/** A kind's picture at a stage, or ''. */
export function stageImage(kind: string, stage: PlantStage, images: PlantPictures = pictures()): string {
  return images[kind]?.[stage] ?? '';
}

/** The stages a kind has pictures for, in order. */
export const stagesOf = (kind: string, images: PlantPictures = pictures()): PlantStage[] => PLANT_STAGES.map((s) => s.id).filter((s) => !!stageImage(kind, s, images));

/** The stage a new pot is set down at: established, or the nearest that has a picture. */
export function firstStage(kind: string, images: PlantPictures = pictures()): PlantStage | null {
  const have = stagesOf(kind, images);
  return (['established', 'lush', 'young'] as PlantStage[]).find((s) => have.includes(s)) ?? null;
}

/** What the drawer says of it: the folk line, or for a herb its uses from the Living Library. */
export function kindLine(kind: PottedKind): string {
  if (kind.folk) return kind.folk;
  const uses = herbUses(kind.herb);
  return uses ? `In the Living Library: ${uses.toLowerCase()}.` : '';
}

function herbUses(herb: string | null): string {
  if (!herb) return '';
  const record = (TRADITIONAL_LIBRARY as unknown as Record<string, Record<string, { Uses?: string }>>).herb?.[herb];
  return String(record?.Uses ?? '').trim();
}

/**
 * The cabinet's Plants drawer: each kind that has a picture, placed as
 * `type: 'plant'` with its kind as its form, at its established stage (or
 * the nearest there's a picture for). Any kind can go on any altar, as often
 * as you like.
 */
export function pottedCabinetItems(images: PlantPictures = pictures()): CabinetItem[] {
  return POTTED_KINDS.flatMap((kind) => {
    const stage = firstStage(kind.id, images);
    if (!stage) return [];
    return [
      {
        id: `plants:${kind.id}`,
        category: 'plants',
        name: kind.name,
        keywords: [...kind.keywords, 'plant', 'potted', 'houseplant'],
        description: kindLine(kind),
        forms: [{ label: 'Place', image: stageImage(kind.id, stage, images), type: 'plant', form: kind.id, ...(kind.herb ? { herb: kind.herb } : {}) }],
      },
    ];
  });
}

// ── Its own details ──────────────────────────────────────────────────────

export type JournalKind = 'watered' | 'fed' | 'repotted' | 'new-leaf' | 'cutting' | 'harvested' | 'note';

export const JOURNAL_KINDS: { kind: JournalKind; label: string; says: string }[] = [
  { kind: 'watered', label: 'Watered', says: 'Watered' },
  { kind: 'fed', label: 'Fed', says: 'Fed' },
  { kind: 'repotted', label: 'Repotted', says: 'Repotted' },
  { kind: 'new-leaf', label: 'New leaf', says: 'A new leaf' },
  { kind: 'cutting', label: 'Cutting taken', says: 'Took a cutting' },
  { kind: 'harvested', label: 'Harvested', says: 'Harvested' },
  { kind: 'note', label: 'A note', says: 'Noted' },
];

export const journalLabel = (kind: string) => JOURNAL_KINDS.find((k) => k.kind === kind)?.label ?? 'A note';

export type HarvestTo = 'altar' | 'working';

/** One dated entry in a plant's care journal, with that day's moon. */
export type JournalEntry = {
  id: string;
  kind: JournalKind;
  /** Local date, YYYY-MM-DD. */
  on: string;
  moon: PhaseName;
  note?: string;
  /** For a harvest: "a handful", "three sprigs". */
  amount?: string;
  /** For a harvest: set on the altar, or into a working. */
  to?: HarvestTo;
  [key: string]: unknown;
};

/** What's kept in `livingState.app.potted`. */
export type PottedState = {
  kind: string;
  stage: PlantStage;
  /** Her name for it ("Margaret"), or ''. */
  name: string;
  /** Where it lives ("the kitchen windowsill"). */
  place: string;
  light: string;
  /** A photo of the real plant: an uploaded picture's URL, or a guest's copy on the device. */
  photo: string;
  storagePath: string;
  /** How often it's watered, in days. */
  waterEvery: number;
  /** When it was last watered (local date), or '' before it's known. */
  lastWatered: string;
  journal: JournalEntry[];
  [key: string]: unknown;
};

/** Storage folder for plant photos under `user-assets/${userId}/` (signed in). */
export const PLANT_PHOTO_FOLDER = 'plant-photos';

/** At most this many journal entries are kept per plant. */
export const JOURNAL_MAX = 500;

export const isPottedPlant = (object: SavedObject | null | undefined) => !!object && object.type === 'plant' && !!pottedKind(String(object.form || ''));

export const kindOf = (object: SavedObject) => pottedKind(String(object.form || ''));

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const isStage = (v: unknown): v is PlantStage => v === 'young' || v === 'established' || v === 'lush';
const validDay = (v: unknown) => (typeof v === 'string' && dateFromKey(v) ? v : '');

const rawOf = (object: SavedObject): Record<string, unknown> => {
  const raw = appStateOf(object).potted;
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
};

/** The stage its picture shows, from its picture's name. */
function stageFromImage(path: string): PlantStage | null {
  const m = /-(young|established|lush)\.[a-z]+$/i.exec(path);
  return m ? (m[1].toLowerCase() as PlantStage) : null;
}

export const clampEvery = (days: number) => Math.min(WATER_EVERY_MAX, Math.max(WATER_EVERY_MIN, Math.round(days)));

/** Read its details, filling in the kind's defaults where nothing is saved yet. */
export function pottedOf(object: SavedObject): PottedState {
  const raw = rawOf(object);
  const kind = kindOf(object);
  const every = Number(raw.waterEvery);
  const journal = Array.isArray(raw.journal)
    ? (raw.journal as JournalEntry[]).filter((e) => e && typeof e === 'object' && typeof e.id === 'string' && !!dateFromKey(e.on) && typeof e.kind === 'string')
    : [];
  return {
    ...raw,
    kind: kind?.id ?? str(raw.kind),
    stage: isStage(raw.stage) ? raw.stage : (stageFromImage(String(object.imagePath || '')) ?? 'established'),
    name: str(raw.name).trim(),
    place: str(raw.place).trim(),
    light: str(raw.light).trim(),
    photo: str(raw.photo),
    storagePath: str(raw.storagePath),
    waterEvery: Number.isFinite(every) && every > 0 ? clampEvery(every) : (kind?.waterEvery ?? 7),
    lastWatered: validDay(raw.lastWatered),
    journal,
  };
}

/** "Margaret the pothos", or "Pothos" before she's named. */
export function plantTitle(object: SavedObject): string {
  const kind = kindOf(object);
  const { name } = pottedOf(object);
  const what = kind?.name ?? 'Plant';
  return name ? `${name} the ${what.toLowerCase()}` : what;
}

/** Write a change to its details: every other field (and anything newer) is kept. */
function withPotted(object: SavedObject, change: Partial<PottedState>, now: string, log?: { action: string; text: string }): SavedObject {
  const potted = { ...rawOf(object), ...change, kind: kindOf(object)?.id ?? str(rawOf(object).kind) };
  if (log) return logAppEvent(object, { kind: 'plant', action: log.action, text: log.text }, now, { potted });
  return setAppState(object, { potted }, now);
}

/** The details she gives it: its name, where it lives, its light and how often it's watered. */
export type PlantDetails = { name: string; place: string; light: string; waterEvery: number; lastWatered?: string };

export function setPlantDetails(object: SavedObject, details: PlantDetails, now: string): SavedObject {
  if (!isPottedPlant(object)) return object;
  const kind = kindOf(object)!;
  const name = details.name.trim().slice(0, 60);
  const change: Partial<PottedState> = {
    name,
    place: details.place.trim().slice(0, 80),
    light: details.light.trim().slice(0, 60),
    waterEvery: clampEvery(Number(details.waterEvery) || kind.waterEvery),
  };
  if (details.lastWatered !== undefined) change.lastWatered = validDay(details.lastWatered);
  const labelled: SavedObject = { ...object, label: name ? `${name} the ${kind.name.toLowerCase()}` : kind.name, plaqueText: name };
  return withPotted(labelled, change, now, { action: 'details', text: name ? `Named it ${name}.` : 'Noted its details.' });
}

/** Choose the picture that matches the plant now: young, established or lush. */
export function setPlantStage(object: SavedObject, stage: PlantStage, now: string, images: PlantPictures = pictures()): SavedObject {
  if (!isPottedPlant(object)) return object;
  const image = stageImage(String(object.form), stage, images);
  if (!image || (pottedOf(object).stage === stage && object.imagePath === image)) return object;
  const label = PLANT_STAGES.find((s) => s.id === stage)!.label.toLowerCase();
  return withPotted({ ...object, imagePath: image }, { stage }, now, { action: 'stage', text: `Shown ${label} now.` });
}

export function setPlantPhoto(object: SavedObject, photo: string, storagePath: string, now: string): SavedObject {
  if (!isPottedPlant(object) || !photo) return object;
  const had = !!pottedOf(object).photo;
  return withPotted(object, { photo, storagePath }, now, { action: 'photo', text: had ? 'Changed the photo of the real plant.' : 'Added a photo of the real plant.' });
}

export function removePlantPhoto(object: SavedObject, now: string): SavedObject {
  if (!isPottedPlant(object) || !pottedOf(object).photo) return object;
  return withPotted(object, { photo: '', storagePath: '' }, now, { action: 'photo-removed', text: 'Took the photo away.' });
}

// ── The care journal ─────────────────────────────────────────────────────

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** A journal entry for a day, with that day's moon. */
export function journalEntry(
  input: { kind: JournalKind; on?: string; note?: string; amount?: string; to?: HarvestTo },
  now: Date,
  id: string = makeId(),
): JournalEntry {
  const on = validDay(input.on) || localDateKey(now);
  const entry: JournalEntry = { id, kind: input.kind, on, moon: moonOn(on, now) };
  const note = input.note?.trim().slice(0, 400);
  const amount = input.amount?.trim().slice(0, 60);
  if (note) entry.note = note;
  if (input.kind === 'harvested') {
    if (amount) entry.amount = amount;
    entry.to = input.to === 'working' ? 'working' : 'altar';
  }
  return entry;
}

/** The journal newest first; the same day keeps the order it was written. */
export function journalOf(object: SavedObject): JournalEntry[] {
  return pottedOf(object)
    .journal.map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.on === b.e.on ? b.i - a.i : a.e.on < b.e.on ? 1 : -1))
    .map((x) => x.e);
}

/** A line for an entry: "Harvested a handful, into a working". */
export function journalLine(entry: JournalEntry): string {
  const says = JOURNAL_KINDS.find((k) => k.kind === entry.kind)?.says ?? 'Noted';
  const parts = [entry.kind === 'harvested' && entry.amount ? `${says} ${entry.amount}` : says];
  if (entry.kind === 'harvested') parts.push(entry.to === 'working' ? 'for a working' : 'for the altar');
  return parts.join(', ');
}

/**
 * Add an entry to its journal. A watering also moves "last watered" on, when
 * it is the latest; anything else leaves it as it was.
 */
export function addJournal(object: SavedObject, input: { kind: JournalKind; on?: string; note?: string; amount?: string; to?: HarvestTo }, nowIso: string): SavedObject {
  if (!isPottedPlant(object)) return object;
  const entry = journalEntry(input, new Date(nowIso));
  const state = pottedOf(object);
  const journal = [...(Array.isArray(rawOf(object).journal) ? (rawOf(object).journal as JournalEntry[]) : []), entry].slice(-JOURNAL_MAX);
  const change: Partial<PottedState> = { journal };
  if (entry.kind === 'watered' && (!state.lastWatered || entry.on >= state.lastWatered)) change.lastWatered = entry.on;
  const who = plantTitle(object);
  const text = `${journalLine(entry)}${entry.note ? `: ${entry.note}` : ''}.`;
  return withPotted(object, change, nowIso, { action: entry.kind, text: entry.kind === 'watered' ? `Watered ${who}.` : text });
}

export function removeJournal(object: SavedObject, id: string, now: string): SavedObject {
  const raw = rawOf(object).journal;
  if (!isPottedPlant(object) || !Array.isArray(raw) || !raw.some((e) => (e as JournalEntry)?.id === id)) return object;
  return withPotted(object, { journal: (raw as JournalEntry[]).filter((e) => e?.id !== id) }, now);
}

/** "Watered": today, in its journal, and it perks up. */
export const waterPlant = (object: SavedObject, nowIso: string) => addJournal(object, { kind: 'watered' }, nowIso);

/** A harvest from one of the herbs, logged with the moon and where it went. */
export function harvestPlant(object: SavedObject, input: { amount?: string; to: HarvestTo; note?: string }, nowIso: string): SavedObject {
  if (!canHarvest(kindOf(object))) return object;
  return addJournal(object, { kind: 'harvested', amount: input.amount, to: input.to, note: input.note }, nowIso);
}

// ── Water ────────────────────────────────────────────────────────────────

export type ThirstLevel = 'unknown' | 'fine' | 'due' | 'thirsty' | 'drooping';

export type Thirst = {
  level: ThirstLevel;
  /** When it would like water next (the start of that day), or null before a watering is known. */
  dueAt: number | null;
  /** The day it's due, YYYY-MM-DD, or ''. */
  dueOn: string;
  /** Whole days until it's due (negative once it's past). */
  inDays: number | null;
  /** How far it has drooped: 0 fresh, 1 as far as it goes. */
  droop: number;
};

/** How many days past its day it takes to droop all the way: half its interval, two to seven days. */
const droopDays = (every: number) => Math.min(7, Math.max(2, Math.round(every / 2)));

export function thirstOf(object: SavedObject, now: number): Thirst {
  const { lastWatered, waterEvery } = pottedOf(object);
  const last = dateFromKey(lastWatered);
  if (!isPottedPlant(object) || !last) return { level: 'unknown', dueAt: null, dueOn: '', inDays: null, droop: 0 };
  const due = new Date(last.getFullYear(), last.getMonth(), last.getDate() + waterEvery);
  const today = new Date(now);
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const inDays = Math.round((due.getTime() - startToday) / DAY);
  const over = now - due.getTime();
  const droop = over <= 0 ? 0 : Math.round(Math.min(1, over / (droopDays(waterEvery) * DAY)) * 1000) / 1000;
  const level: ThirstLevel = over < 0 ? 'fine' : droop >= 1 ? 'drooping' : droop >= 0.5 ? 'thirsty' : 'due';
  return { level, dueAt: due.getTime(), dueOn: localDateKey(due), inDays, droop };
}

/** The panel's line about water. */
export function thirstLine(object: SavedObject, now: number): string {
  const t = thirstOf(object, now);
  const { waterEvery } = pottedOf(object);
  const every = waterEvery === 1 ? 'every day' : `every ${waterEvery} days`;
  if (t.level === 'unknown') return `Watered ${every}. Mark it watered, or say when it last was, and it will tell you when it would like water.`;
  if (t.level === 'fine') return t.inDays === 1 ? `Would like water tomorrow (${every}).` : `Would like water in ${t.inDays} days (${every}).`;
  if (t.level === 'due') return t.inDays === 0 ? 'Would like water today.' : 'Would like water. It’s beginning to droop.';
  if (t.level === 'thirsty') return 'Thirsty and drooping. It perks up when it’s watered.';
  return 'Drooping for want of water. It won’t die; it perks up when it’s watered.';
}

/**
 * How a thirsty plant is drawn: a little duller and browner, sagging, gentler
 * than an offering going over. Null when it's fine.
 */
export function thirstLook(object: SavedObject, now: number): { tint: { sepia: number; saturate: number; brightness: number }; sag: number; widen: number } | null {
  const t = thirstOf(object, now).droop;
  if (!(t > 0)) return null;
  const e = t * t * (3 - 2 * t);
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return { tint: { sepia: r2(0.22 * e), saturate: r2(1 - 0.32 * e), brightness: r2(1 - 0.08 * e) }, sag: r2(1 - 0.07 * e), widen: r2(1 + 0.03 * e) };
}

export type WateringDue = {
  altarId: string;
  altarName: string;
  objectId: string;
  /** "Margaret the pothos", or "pothos". */
  who: string;
  named: boolean;
  dueAt: number;
};

type AltarLike = { id: string; name?: string | null; objects: SavedObject[] };

/** Every pot on these altars that would like water now (or, with `until`, by then). Soonest first. */
export function wateringDue(altars: AltarLike[], now: number, until = now): WateringDue[] {
  const out: WateringDue[] = [];
  for (const altar of altars) {
    for (const object of altar.objects ?? []) {
      if (!isPottedPlant(object)) continue;
      const t = thirstOf(object, now);
      if (t.dueAt == null || t.dueAt > until) continue;
      const { name } = pottedOf(object);
      const kind = kindOf(object)!.name.toLowerCase();
      out.push({
        altarId: altar.id,
        altarName: String(altar.name || '').trim(),
        objectId: String(object.altarObjectId || ''),
        who: name ? `${name} the ${kind}` : kind,
        named: !!name,
        dueAt: t.dueAt,
      });
    }
  }
  return out.sort((a, b) => a.dueAt - b.dueAt);
}

const phrase = (name: string) => {
  const n = name.trim();
  if (!n) return 'your altar';
  return /\baltar\b/i.test(n) ? n : `your ${n} altar`;
};

/** "Margaret the pothos would like water." Null when none would. */
export function wateringNote(due: WateringDue[], options: { oneAltar?: boolean } = {}): string | null {
  if (!due.length) return null;
  const first = due[0];
  const where = first.named || options.oneAltar ? '' : ` on ${phrase(first.altarName)}`;
  const head = first.named ? `${first.who} would like water.` : `The ${first.who}${where} would like water.`;
  const rest = due.length - 1;
  if (!rest) return head;
  return `${head} ${rest === 1 ? 'One more plant would' : `${rest} more plants would`} too.`;
}

// ── Notes, and the moon ──────────────────────────────────────────────────

/** Its folk associations and honest pet safety, for its sheet. */
export function plantNotes(object: SavedObject): { folk: string; pets: string; toxic: boolean; herb: string | null } | null {
  const kind = kindOf(object);
  if (!kind) return null;
  return { folk: kindLine(kind), pets: kind.pets, toxic: kind.toxic, herb: kind.herb };
}

/**
 * One line from the Green practice's moon gardening (the almanac's four
 * quarters), when tonight's quarter has a task for a pot: harvesting herbs
 * in the last quarter, cuttings in the first, potting on and repotting
 * through the light half and the full. Folk tradition, as Green says.
 */
export function moonGardenHint(object: SavedObject, now: Date): string | null {
  const kind = kindOf(object);
  if (!kind) return null;
  const quarter = quarterOf(moonState(now).fraction);
  const advice = QUARTERS[quarter];
  const want: Record<string, string[]> = {
    leaf: ['Take softwood cuttings'],
    fruit: ['Graft and pot on', 'Feed plants coming into flower'],
    root: ['Transplant and divide'],
    rest: kind.herb ? ['Harvest herbs and roots to dry or store', 'Prune and cut back'] : ['Prune and cut back'],
  };
  // The first that suits a pot, in the order wanted (a herb's harvest before pruning).
  const task = want[quarter].find((t) => advice.tasks.includes(t));
  if (!task) return null;
  return `Moon gardening: ${advice.span.charAt(0).toLowerCase()}${advice.span.slice(1)}, by the old rule a time to ${task.charAt(0).toLowerCase()}${task.slice(1)}.`;
}
