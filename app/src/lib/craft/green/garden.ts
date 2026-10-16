// My garden: your plants and what happened to each, with the moon it
// happened under. Stored in the craft collection `green.plants` as plain
// JSON, one entry per plant with its history inside. Pure, so it can be tested.

import { moonState, type PhaseName } from '../../moon.ts';
import { dateFromKey, localDateKey } from '../../rituals/lifecycle.ts';

export const PLANTS = 'green.plants';

export type PlantEventKind = 'sowed' | 'planted' | 'tended' | 'harvested' | 'blessing' | 'note';

export const EVENT_KINDS: { kind: PlantEventKind; label: string; verb: string }[] = [
  { kind: 'sowed', label: 'Sowed', verb: 'Sowed' },
  { kind: 'planted', label: 'Planted out', verb: 'Planted out' },
  { kind: 'tended', label: 'Watered or fed', verb: 'Watered or fed' },
  { kind: 'harvested', label: 'Harvested', verb: 'Harvested' },
  { kind: 'blessing', label: 'Blessing or offering', verb: 'Blessed' },
  { kind: 'note', label: 'Note', verb: 'Noted' },
];

export const eventLabel = (kind: PlantEventKind) => EVENT_KINDS.find((k) => k.kind === kind)?.label ?? 'Note';

export type PlantEvent = {
  id: string;
  kind: PlantEventKind;
  /** Local date, YYYY-MM-DD. */
  on: string;
  /** The moon that day, worked out when it was logged. */
  moon: PhaseName;
  /** For a harvest: "a handful", "40 g", "3 bundles". */
  amount?: string;
  note?: string;
};

export type Plant = {
  name: string;
  /** Living Library herb key ("rosemary"), if it has a page. */
  herb?: string | null;
  /** Where it grows: "south bed", "kitchen windowsill pot". */
  place: string;
  /** Local date it was sown or planted, YYYY-MM-DD. */
  started?: string | null;
  startedBy?: 'sowed' | 'planted' | null;
  notes: string;
  events: PlantEvent[];
  /** Local date it was marked gone, if it has. */
  goneOn?: string | null;
  goneNote?: string | null;
};

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * The moon on a local date: the moment itself when it's today (logged now),
 * otherwise that evening, which is when most garden lore reads the moon.
 */
export function moonOn(dateKey: string, now: Date): PhaseName {
  if (dateKey === localDateKey(now)) return moonState(now).name;
  const day = dateFromKey(dateKey) ?? now;
  return moonState(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 21)).name;
}

export function newEvent(input: { kind: PlantEventKind; on: string; amount?: string; note?: string }, now: Date, id: string = makeId()): PlantEvent {
  const event: PlantEvent = { id, kind: input.kind, on: input.on, moon: moonOn(input.on, now) };
  const amount = input.amount?.trim();
  const note = input.note?.trim();
  if (amount && input.kind === 'harvested') event.amount = amount;
  if (note) event.note = note;
  return event;
}

/** A new plant; its first sowing or planting goes into its history too. */
export function newPlant(
  input: { name: string; herb?: string | null; place?: string; started?: string | null; startedBy?: 'sowed' | 'planted' | null; notes?: string },
  now: Date,
): Plant {
  const started = input.started && dateFromKey(input.started) ? input.started : null;
  const startedBy = started ? (input.startedBy ?? 'planted') : null;
  return {
    name: input.name.trim(),
    herb: input.herb || null,
    place: (input.place ?? '').trim(),
    started,
    startedBy,
    notes: (input.notes ?? '').trim(),
    events: started && startedBy ? [newEvent({ kind: startedBy, on: started }, now)] : [],
    goneOn: null,
    goneNote: null,
  };
}

/** History newest first; same day keeps the order it was logged. */
export function history(plant: Plant): PlantEvent[] {
  return plant.events
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.on === b.e.on ? b.i - a.i : a.e.on < b.e.on ? 1 : -1))
    .map((x) => x.e);
}

export function addEvent(plant: Plant, event: PlantEvent): Plant {
  return { ...plant, events: [...(plant.events ?? []), event] };
}

export function removeEvent(plant: Plant, id: string): Plant {
  return { ...plant, events: (plant.events ?? []).filter((e) => e.id !== id) };
}

export function markGone(plant: Plant, on: string, note?: string): Plant {
  return { ...plant, goneOn: on, goneNote: note?.trim() || null };
}

export function bringBack(plant: Plant): Plant {
  return { ...plant, goneOn: null, goneNote: null };
}

export function isGrowing(plant: Plant): boolean {
  return !plant.goneOn;
}

/** "Last harvested 12 Oct · 5 harvests" style summary pieces. */
export function plantSummary(plant: Plant): { last: PlantEvent | null; harvests: number; lastHarvest: PlantEvent | null } {
  const list = history(plant);
  const harvests = list.filter((e) => e.kind === 'harvested');
  return { last: list[0] ?? null, harvests: harvests.length, lastHarvest: harvests[0] ?? null };
}

/** Whole days between two local dates (b − a). */
export function daysBetween(a: string, b: string): number | null {
  const da = dateFromKey(a);
  const db = dateFromKey(b);
  if (!da || !db) return null;
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

/** Growing first (most recently touched first), then gone. */
export function sortPlants<T extends { data: Plant; createdAt: string }>(list: T[]): T[] {
  const touched = (p: T) => history(p.data)[0]?.on ?? p.data.started ?? p.createdAt.slice(0, 10);
  return [...list].sort((a, b) => {
    const ga = isGrowing(a.data) ? 0 : 1;
    const gb = isGrowing(b.data) ? 0 : 1;
    if (ga !== gb) return ga - gb;
    const ta = touched(a);
    const tb = touched(b);
    return ta === tb ? 0 : ta < tb ? 1 : -1;
  });
}

/** Read a stored plant defensively: older or partial entries still show. */
export function asPlant(data: unknown): Plant {
  const d = (data && typeof data === 'object' ? data : {}) as Partial<Plant>;
  return {
    name: typeof d.name === 'string' && d.name.trim() ? d.name : 'A plant',
    herb: typeof d.herb === 'string' ? d.herb : null,
    place: typeof d.place === 'string' ? d.place : '',
    started: typeof d.started === 'string' ? d.started : null,
    startedBy: d.startedBy === 'sowed' || d.startedBy === 'planted' ? d.startedBy : null,
    notes: typeof d.notes === 'string' ? d.notes : '',
    events: Array.isArray(d.events) ? d.events.filter((e) => e && typeof e.id === 'string' && typeof e.on === 'string') : [],
    goneOn: typeof d.goneOn === 'string' ? d.goneOn : null,
    goneNote: typeof d.goneNote === 'string' ? d.goneNote : null,
  };
}
