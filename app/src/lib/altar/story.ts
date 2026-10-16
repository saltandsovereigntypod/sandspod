// An object's story: what its living state remembers (burns and readings,
// charges and cleansings, offerings, dedications, rituals, incense, the
// moons it has sat through and how long it has been on the altar) told as
// plain sentences, newest first. Pure, so it can be tested.

import { readingsOf } from './ceromancy.ts';
import { humanize } from './devotion.ts';
import { incenseBurns } from './incense.ts';
import { appHistoryOf, carvingsOf, isCandle, parseLivingState, placedAtOf, readLivingState } from './livingState.ts';
import { moonsBetween } from './moonCharge.ts';
import type { SavedObject } from './types.ts';

type Rec = Record<string, unknown>;
const list = (value: unknown): Rec[] => (Array.isArray(value) ? (value as Rec[]) : []);
const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const DAY = 86_400_000;

export type StoryLine = { at: string; text: string };

/** "2 hours", "40 minutes", "3 days". */
export function spanWords(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 1) return 'a moment';
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  const days = Math.round(hours / 24);
  return `${days} days`;
}

const join = (words: string[]) => (words.length <= 1 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`);
const lower = (values: unknown) => (Array.isArray(values) ? (values as unknown[]).map((v) => humanize(v).toLowerCase()).filter(Boolean) : []);

/** The lines of the story, newest first. */
export function storyLines(object: SavedObject): StoryLine[] {
  const parsed = parseLivingState(object);
  if (!parsed) return [];
  const state = readLivingState(object, '');
  const lines: StoryLine[] = [];
  const add = (at: unknown, text: string) => {
    const when = str(at);
    if (when && Number.isFinite(Date.parse(when)) && text) lines.push({ at: when, text });
  };

  // Candles: each burn, how it ended, and what was read in it.
  if (isCandle(object)) {
    for (const burn of state.candle?.burnHistory ?? []) {
      const ended = burn.extinguishedAt || burn.endedAt;
      const how = burn.endReason === 'candle_life_reached' ? ', and burned all the way down' : '';
      add(ended || burn.litAt || burn.startedAt, `Burned for ${spanWords(Number(burn.durationMs) || 0)}${how}.`);
    }
    const readings = readingsOf(object);
    for (const reading of readings) add(reading.at, `You read the flame: ${reading.text.split('\n\n')[0] || 'a reading was kept'}`);
    for (const carving of carvingsOf(object)) add(carving.carvedAt, `Carved with “${carving.text}”.`);
    if (state.candle?.spentAt) add(state.candle.spentAt, 'It was spent.');
  }

  // Crystals (and anything else cared for the same way).
  const crystal = (state.crystal ?? {}) as Rec;
  for (const r of list(crystal.cleansingHistory)) {
    const methods = lower(r.methods);
    add(r.occurredAt, `Cleansed${methods.length ? ` with ${join(methods)}` : ''}${r.purpose ? ` (${humanize(r.purpose).toLowerCase()})` : ''}.`);
  }
  for (const r of list(crystal.chargingHistory)) {
    if (r.source === 'moon') {
      add(r.occurredAt, `${str(r.notes) || `Charged under the ${str(r.moon) || 'moon'}.`}`);
      continue;
    }
    const methods = lower(r.methods);
    add(r.occurredAt, `Charged${methods.length ? ` with ${join(methods)}` : ''}${str(r.intention) ? `, holding “${str(r.intention)}”` : ''}.`);
  }
  const dedication = (crystal.dedicationDetails ?? null) as Rec | null;
  if (dedication && (str(dedication.dedicatedTo) || str(dedication.intention))) {
    add(dedication.recordedAt || dedication.updatedAt, `Dedicated${str(dedication.dedicatedTo) ? ` to ${str(dedication.dedicatedTo)}` : ''}${str(dedication.intention) ? `, for “${str(dedication.intention)}”` : ''}.`);
  }

  // Presences: offerings made, what became of them, why they're here.
  const deity = (state.deity ?? {}) as Rec;
  const offerings = list(deity.offerings);
  for (const r of offerings) {
    const items = list(r.items).map((i) => str(i.label)).filter(Boolean);
    const what = items.length ? join(items) : join(lower(r.types)) || 'an offering';
    add(r.occurredAt, `Offered ${what}${str(r.intention) ? `, for ${str(r.intention)}` : ''}.`);
  }
  for (const r of list(deity.offeringStatusHistory)) {
    const status = str(r.status);
    if (status) add(r.occurredAt, `An offering was marked ${humanize(status).toLowerCase()}.`);
  }
  const reason = (deity.reasonDetails ?? null) as Rec | null;
  if (reason && str(reason.reason)) add(reason.updatedAt, `Here for ${humanize(reason.reason).toLowerCase()}.`);

  // Rituals it was part of.
  const ritual = str(parsed.currentRitualName);
  if (ritual) add(parsed.lastUsedAt || parsed.updatedAt, `Part of the ritual “${ritual}”.`);
  const rituals = list((parsed as Rec).ritualHistory);
  for (const r of rituals) add(r.occurredAt || r.at, `Part of the ritual “${str(r.name) || str(r.title) || 'a ritual'}”.`);

  // Incense.
  for (const burn of incenseBurns(object)) {
    add(burn.endedAt, burn.endReason === 'burned_down' ? `Burned for ${spanWords(burn.durationMs)}, down to ash.` : `Burned for ${spanWords(burn.durationMs)}, then was put out.`);
  }

  // The app's own log: offerings set out and refreshed, remnants, petitions.
  for (const event of appHistoryOf(object)) add(event.at, event.text);

  add(parsed.createdAt, 'Came to this altar.');
  return lines.sort((a, b) => b.at.localeCompare(a.at));
}

/** A line about time on the altar: "On this altar 12 days, through 1 Full Moon." */
export function storySummary(object: SavedObject, now: Date): string {
  const placed = placedAtOf(object);
  if (!Number.isFinite(placed) || placed > now.getTime()) return '';
  const days = Math.floor((now.getTime() - placed) / DAY);
  const moons = moonsBetween(new Date(placed), now, 'full').length;
  const time = days < 1 ? 'On this altar since today' : `On this altar ${days} ${days === 1 ? 'day' : 'days'}`;
  return moons ? `${time}, through ${moons} Full ${moons === 1 ? 'Moon' : 'Moons'}.` : `${time}.`;
}
