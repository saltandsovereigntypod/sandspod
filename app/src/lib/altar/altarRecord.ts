// Everything on an altar, written down for the Grimoire. When an altar (or a
// group on it) is recorded as a page, each thing on it is listed under its
// kind (Deities and Statues, Candles, Offerings, Petitions, Crystals and
// Herbs, Other Items) with its colour and form, how it is now (lit, burned
// down, offered to whom, wilting, a plant's stage), when it came to the altar,
// and every word written about it: labels, intentions, notes, dedications,
// carvings and dressings, offering prayers and responses, readings, plant
// journals. Then the petitions: those still open and those finished since the
// altar was last recorded, with their words, candle, dates, how often they
// were tended and how they ended. Shared with the website (js/core/altar.js,
// altarRecord), which hands the blocks to its Grimoire. Pure, so it can be tested.

import { readingsOf } from './ceromancy.ts';
import { humanize, offeringsOf } from './devotion.ts';
import { frameOf, isFrame } from './frame.ts';
import { incenseLife, isIncense } from './incense.ts';
import { appHistoryOf, appStateOf, candleLife, carvingsOf, dressingsOf, isCandle, isLit, parseLivingState, placedAtOf } from './livingState.ts';
import { offeredToOf } from './offerFromAltar.ts';
import { freshness, isOfferingItself, offeringFoodOf, offeringKind, offeringOf } from './offerings.ts';
import { isPetitionPaper, isOpen, petitionEntryOf, PETITION_TIMINGS, type Petition } from './petitions.ts';
import { isPottedPlant, PLANT_STAGES, plantTitle, pottedOf } from './pottedPlants.ts';
import type { SavedObject } from './types.ts';

type Rec = Record<string, unknown>;
const list = (value: unknown): Rec[] => (Array.isArray(value) ? (value as Rec[]).filter((v) => v && typeof v === 'object') : []);
const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export type RecordBlock = { type: string; content: string };

export type RecordGroupId = 'presences' | 'candles' | 'offerings' | 'petitions' | 'natural' | 'other';

export const RECORD_GROUPS: { id: RecordGroupId; label: string }[] = [
  { id: 'presences', label: 'Deities and Statues' },
  { id: 'candles', label: 'Candles' },
  { id: 'offerings', label: 'Offerings' },
  { id: 'petitions', label: 'Petitions' },
  { id: 'natural', label: 'Crystals and Herbs' },
  { id: 'other', label: 'Other Items' },
];

/** What `tend.rhythms` keeps for a petition (lib/tend/model.ts TendRecord), as far as the record reads it. */
export type PetitionTending = {
  key: string;
  tendedAt?: string;
  times?: number;
  words?: { at: string; text: string }[];
  ended?: { how: string; at: string; note: string } | null;
};

export type RecordContext = {
  now: Date;
  /** The altar's id, to find its petitions; null for an altar not yet saved. */
  altarId: string | null;
  /** The petition box (craft collection `altar.petitions`), all of it. */
  petitions?: { id: string; data: Petition }[];
  /** Records from the To tend list (`tend.rhythms`), all of them. */
  tendings?: PetitionTending[];
  /** When this altar was last recorded in the Grimoire (ISO), or ''. Finished petitions since then are included. */
  since?: string;
  /** Every object on the altar (to name a petition's candle when only a group is recorded). */
  allObjects?: SavedObject[];
  /** Only the petitions that sit on these objects (a group); otherwise every petition of the altar. */
  groupOnly?: boolean;
  /** How a date reads ("Oct 3, 2026"). */
  formatDate?: (iso: string) => string;
};

/** Without a previous record, finished petitions from this far back are included. */
export const RECORD_LOOKBACK_DAYS = 30;

const defaultDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
};

export function recordGroupOf(object: SavedObject): RecordGroupId {
  if (isPetitionPaper(object)) return 'petitions';
  if (object.type === 'deity') return 'presences';
  if (isCandle(object)) return 'candles';
  if (offeringFoodOf(object) || isOfferingItself(object) || offeringOf(object) || object.type === 'offering') return 'offerings';
  if (['crystal', 'herb', 'oil', 'plant'].includes(String(object.type)) || isIncense(object)) return 'natural';
  return 'other';
}

/** One thing on the altar, written down: its line, and what was written about it. */
export type RecordItem = { group: RecordGroupId; line: string; writing: string[] };

export function describeObject(object: SavedObject, now: Date, date: (iso: string) => string = defaultDate): RecordItem {
  const label = str(object.label) || 'Altar Item';
  const parts: string[] = [];
  const writing: string[] = [];
  const write = (heading: string, text: unknown) => {
    const t = str(text);
    if (t) writing.push(heading ? `${heading}: ${t}` : t);
  };
  const state = parseLivingState(object) ?? {};
  const color = str(object.color);
  const form = str(object.form);
  if (color) parts.push(`Color: ${color}`);
  if (form && !offeringFoodOf(object) && !isPottedPlant(object)) parts.push(`Form: ${form}`);

  // How it is now.
  if (isCandle(object)) {
    const life = candleLife(object, now);
    parts.push(life.spent ? 'Burned down' : isLit(object) ? 'Lit' : 'Unlit');
    const dressings = dressingsOf(object).map((d) => str(d.label) || str(d.herb) || humanize(d.form)).filter(Boolean);
    if (dressings.length) parts.push(`Dressed with ${dressings.join(', ')}`);
    for (const carving of carvingsOf(object)) write(`Carved${carving.carvedAt ? ` ${date(carving.carvedAt)}` : ''}`, `“${carving.text}”`);
    for (const reading of readingsOf(object)) write(`Flame read${reading.at ? ` ${date(reading.at)}` : ''}`, reading.text || reading.notes);
  }
  if (isIncense(object)) {
    const life = incenseLife(object, now.getTime());
    parts.push(life.lit ? 'Burning' : life.ash ? 'Burned to ash' : 'Unlit');
  }
  const held = offeringOf(object);
  if (held) {
    const fresh = freshness(held.kind, Date.parse(held.since), now.getTime());
    if (!isOfferingItself(object)) parts.push(`Holds ${held.label || offeringKind(held.kind)?.label.toLowerCase() || 'an offering'}`);
    parts.push(fresh.level === 'lasting' ? 'Keeps' : fresh.stage.name);
    if (held.since) parts.push(`Set out ${date(held.since)}`);
  }
  const given = offeredToOf(object);
  if (given) parts.push(`Offered to ${given.name}${given.at ? ` ${date(given.at)}` : ''}`);
  if (isPottedPlant(object)) {
    const plant = pottedOf(object);
    const title = plantTitle(object);
    if (title !== label) parts.push(title);
    parts.push(PLANT_STAGES.find((s) => s.id === plant.stage)?.label ?? humanize(plant.stage));
    if (plant.place) parts.push(`Lives on ${plant.place}`);
    if (plant.lastWatered) parts.push(`Last watered ${date(`${plant.lastWatered}T12:00:00`)}`);
    for (const entry of plant.journal) {
      const words = [str(entry.amount), str(entry.note)].filter(Boolean).join(', ');
      if (words) write(`${humanize(entry.kind)} ${date(`${entry.on}T12:00:00`)}`, words);
    }
  }
  if (isFrame(object)) {
    const frame = frameOf(object);
    if (frame.name && !label.includes(frame.name)) parts.push(`In memory of ${frame.name}`);
    if (frame.dates) parts.push(frame.dates);
  }

  // A presence: why it's here, and the offerings made to it.
  if (object.type === 'deity') {
    const deity = (state.deity ?? {}) as Rec;
    const reason = (deity.reasonDetails ?? null) as Rec | null;
    if (reason && (str(reason.reason) || str(reason.notes))) write('Here for', [humanize(reason.reason), str(reason.notes)].filter(Boolean).join('. '));
    else write('Here for', deity.reasonForPresence);
    const offerings = offeringsOf(object, now.toISOString()).slice().reverse();
    if (offerings.length) parts.push(`${offerings.length} ${offerings.length === 1 ? 'offering' : 'offerings'}`);
    for (const o of offerings) {
      const items = (o.items ?? []).map((i) => (typeof i === 'string' ? i : str(i?.label))).filter(Boolean);
      const what = items.length ? items.join(', ') : (o.types ?? []).map(humanize).join(', ') || 'An offering';
      const line = [
        what,
        str(o.intention) && `for ${str(o.intention)}`,
        str(o.status) && humanize(o.status),
        str(o.message) && `“${str(o.message)}”`,
        str(o.perceivedResponse) && `Response: ${humanize(o.perceivedResponse)}`,
        str(o.responseNotes),
        str(o.followUpNotes) && `Afterwards: ${str(o.followUpNotes)}`,
      ].filter(Boolean);
      write(`Offered ${date(o.occurredAt)}`.trim(), line.join(' · '));
    }
  }

  // Crystals (and anything cared for the same way).
  const crystal = (state.crystal ?? {}) as Rec;
  const dedication = (crystal.dedicationDetails ?? null) as Rec | null;
  if (dedication && (str(dedication.dedicatedTo) || str(dedication.intention) || str(dedication.notes))) {
    write('Dedicated', [str(dedication.dedicatedTo) && `to ${str(dedication.dedicatedTo)}`, str(dedication.intention) && `for “${str(dedication.intention)}”`, str(dedication.notes)].filter(Boolean).join(', '));
  } else write('Dedicated to', crystal.dedication);
  for (const r of [...list(crystal.cleansingHistory).map((r) => ['Cleansed', r] as const), ...list(crystal.chargingHistory).map((r) => ['Charged', r] as const)]) {
    const [what, rec] = r;
    const words = [str(rec.intention) && `“${str(rec.intention)}”`, str(rec.notes)].filter(Boolean).join(' · ');
    if (words) write(`${what} ${date(str(rec.occurredAt))}`.trim(), words);
  }

  // Workings and apothecary things.
  write('Intention', object.apothecaryIntention);
  write('Notes', object.apothecaryNotes);
  const app = appStateOf(object);
  const jar = (app.jar ?? null) as Rec | null;
  if (jar) write('Jar for', jar.intention);
  const sachet = (app.sachet ?? null) as Rec | null;
  if (sachet) write('Sachet for', sachet.purpose);

  // A name of its own, and notes.
  const plaque = str(object.plaqueText);
  if (plaque && plaque !== label && !isPetitionPaper(object)) write('Plaque', plaque);
  write('Notes', (state as Rec).notes);

  // Words added while tending it ("a word"), kept in its own log.
  for (const event of appHistoryOf(object)) if (event.kind === 'note') write(`Note ${date(event.at)}`.trim(), event.text);

  const placed = placedAtOf(object);
  if (Number.isFinite(placed)) parts.push(`Placed ${date(new Date(placed).toISOString())}`);
  return { group: recordGroupOf(object), line: [label, ...parts].join(' · '), writing };
}

const timingLabel = (p: Petition) => PETITION_TIMINGS.find((t) => t.id === p.timing)?.label ?? '';

/** The petitions to record: this altar's open ones, and those finished since `since` (or the last month). */
export function petitionsToRecord<T extends { id: string; data: Petition }>(entries: T[], altarId: string, now: Date, since = ''): T[] {
  const from = Date.parse(since) || now.getTime() - RECORD_LOOKBACK_DAYS * 86_400_000;
  return entries
    .filter((e) => e?.data && e.data.altarId === altarId)
    .filter((e) => isOpen(e.data) || (Date.parse(e.data.doneAt) || 0) >= from)
    .sort((a, b) => String(a.data.writtenAt).localeCompare(String(b.data.writtenAt)));
}

/** One petition, written down: what it is and how it went, then its words. */
export function petitionBlocks(entry: { id: string; data: Petition }, ctx: { objects: SavedObject[]; tending?: PetitionTending | null; date?: (iso: string) => string }): RecordBlock[] {
  const p = entry.data;
  const date = ctx.date ?? defaultDate;
  const candle = p.candleId ? ctx.objects.find((o) => o.altarObjectId === p.candleId) ?? null : null;
  const lines: string[] = [p.title || 'My petition'];
  const where =
    p.status === 'burned' || p.status === 'buried' || p.status === 'released'
      ? `${humanize(p.status)}${p.doneAt ? ` ${date(p.doneAt)}` : ''}`
      : p.status === 'scheduled'
        ? `To be released ${date(p.releaseOn)}${p.releaseWhy ? ` (${p.releaseWhy})` : ''}`
        : p.place === 'candle' && candle
          ? `Folded under ${str(candle.label) || 'a candle'}`
          : 'Waiting in the petition box';
  lines.push(where);
  const when = [p.writtenAt && `Written ${date(p.writtenAt)}`, p.timing !== 'now' && timingLabel(p) && `Timed for the ${timingLabel(p)}${p.timingAt ? ` (${date(p.timingAt)})` : ''}`].filter(Boolean);
  if (when.length) lines.push(when.join(' · '));
  if (str(p.intention)) lines.push(`For: ${str(p.intention)}`);
  if (candle) lines.push(`Candle: ${[str(candle.label) || 'Candle', str(candle.color) && `Color: ${str(candle.color)}`, isLit(candle) ? 'lit' : ''].filter(Boolean).join(' · ')}`);
  const t = ctx.tending;
  if (t) {
    const times = Number(t.times) || 0;
    const tended = times ? `Tended ${times} ${times === 1 ? 'time' : 'times'}` : t.tendedAt ? 'Tended' : '';
    if (tended) lines.push(`${tended}${t.tendedAt ? `, last ${date(t.tendedAt)}` : ''}`);
    for (const w of t.words ?? []) if (str(w.text)) lines.push(`${date(w.at)}: ${str(w.text)}`);
    if (t.ended) lines.push(`Outcome: ${humanize(t.ended.how)}${t.ended.at ? ` ${date(t.ended.at)}` : ''}${str(t.ended.note) ? `. ${str(t.ended.note)}` : ''}`);
  }
  const blocks: RecordBlock[] = [{ type: 'text', content: lines.join('\n') }];
  if (str(p.words)) blocks.push({ type: 'quote', content: str(p.words) });
  return blocks;
}

/**
 * The record's blocks, for under "Items from the Altar": each group's
 * heading, its things one to a line (as the page always listed them), what
 * was written about them, then the petitions.
 */
export function altarRecordBlocks(objects: SavedObject[], ctx: RecordContext): RecordBlock[] {
  const date = ctx.formatDate ?? defaultDate;
  const all = ctx.allObjects ?? objects;
  const items = new Map<RecordGroupId, { line: string; label: string; writing: string[] }[]>();
  const paperEntries = new Set<string>();
  for (const object of objects) {
    if (!object || typeof object !== 'object') continue;
    // A petition paper is written down with its petition, below.
    const entryId = isPetitionPaper(object) ? petitionEntryOf(object) : '';
    if (entryId && ctx.petitions?.some((e) => e.id === entryId)) {
      paperEntries.add(entryId);
      continue;
    }
    const item = describeObject(object, ctx.now, date);
    items.set(item.group, [...(items.get(item.group) ?? []), { line: item.line, label: str(object.label) || 'Altar Item', writing: item.writing }]);
  }
  const blocks: RecordBlock[] = [];
  const petitions = (() => {
    if (!ctx.altarId || !ctx.petitions?.length) return [];
    const chosen = petitionsToRecord(ctx.petitions, ctx.altarId, ctx.now, ctx.since);
    if (!ctx.groupOnly) return chosen;
    const ids = new Set(objects.map((o) => String(o.altarObjectId || '')).filter(Boolean));
    return chosen.filter((e) => paperEntries.has(e.id) || ids.has(e.data.objectId) || ids.has(e.data.candleId));
  })();
  for (const group of RECORD_GROUPS) {
    const list = items.get(group.id) ?? [];
    const petitionHere = group.id === 'petitions' ? petitions : [];
    if (!list.length && !petitionHere.length) continue;
    blocks.push({ type: 'heading', content: group.label });
    if (list.length) {
      blocks.push({ type: 'ingredient_list', content: list.map((i) => i.line).join('\n') });
      const written = list.filter((i) => i.writing.length).map((i) => `${i.label}\n${i.writing.join('\n')}`);
      if (written.length) blocks.push({ type: 'text', content: written.join('\n\n') });
    }
    for (const entry of petitionHere) {
      const tending = ctx.tendings?.find((t) => t && t.key === `petition:${entry.id}`) ?? null;
      blocks.push(...petitionBlocks(entry, { objects: all, tending, date }));
    }
  }
  return blocks;
}

/** The altar's log line when it is recorded; the next record starts from it. */
export const RECORDED_LINE = 'Recorded in your Grimoire.';

/** When this altar was last recorded, from its log (`altar.history`), or ''. */
export function lastRecordedAt(history: { data: unknown }[], altarId: string): string {
  let latest = '';
  for (const entry of history) {
    const d = entry?.data as { altarId?: string; recorded?: boolean; at?: string } | null;
    if (d && d.altarId === altarId && d.recorded === true && typeof d.at === 'string' && d.at > latest) latest = d.at;
  }
  return latest;
}
