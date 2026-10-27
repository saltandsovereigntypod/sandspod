// Tending your own altars from the list, and seeing what's on an altar and
// whose it is.
//
// tendAltar: the same changes the altar editor makes when you tend something
// on it (light or snuff a candle, refresh an offering, water a plant, add a
// word, burn, bury or release a petition), as a change to the saved altar's
// document, so the altar shows it next time it opens, here or on the website.
//
// altarListing: everything on an altar as a list, with whose it is, for
// "Find mine" on a coven altar (and harmlessly on your own). What you
// can't know stays unknown: a paper from a ritual keeps the label everyone
// may read ("A private petition", "A petition"), never a name it didn't
// carry; your own are found by their ids, never by guessing. Pure.

import { toggleLight, removeObject, updateObjects } from '../altar/editor.ts';
import { appStateOf, isCandle, isLit, logAppEvent } from '../altar/livingState.ts';
import { endOffering, isOfferingItself, offeringOf, refreshOffering } from '../altar/offerings.ts';
import { isPetitionPaper, petitionEntryOf, type PetitionEnd } from '../altar/petitions.ts';
import { isPottedPlant, waterPlant } from '../altar/pottedPlants.ts';
import type { AltarDocument } from '../altar/snapshot.ts';
import type { SavedObject } from '../altar/types.ts';

export type AltarTend =
  | { kind: 'light'; objectId: string }
  | { kind: 'snuff'; objectId: string }
  | { kind: 'refresh'; objectId: string }
  | { kind: 'returned'; objectId: string }
  | { kind: 'water'; objectId: string }
  | { kind: 'word'; objectId: string; text: string }
  | { kind: 'petition'; entryId: string; title: string; candleId: string; how: PetitionEnd };

const indexOf = (doc: AltarDocument, objectId: string) => (objectId ? doc.objects.findIndex((o) => String(o.altarObjectId || '') === objectId) : -1);

/** The change to an altar's document; the same document back when there's nothing to change. */
export function tendAltar(doc: AltarDocument, change: AltarTend, now: string): AltarDocument {
  if (change.kind === 'petition') {
    // As the altar does: the paper leaves the altar, and the candle it sat under remembers it.
    const words = change.how;
    let next = doc;
    const candleAt = indexOf(doc, change.candleId);
    if (candleAt >= 0) next = updateObjects(next, [candleAt], (o) => logAppEvent(o, { kind: 'petition', text: `The petition “${change.title}” was ${words}.` }, now));
    const paperAt = next.objects.findIndex((o) => isPetitionPaper(o) && petitionEntryOf(o) === change.entryId);
    return paperAt >= 0 ? removeObject(next, paperAt) : next;
  }
  const at = indexOf(doc, change.objectId);
  if (at < 0) return doc;
  const object = doc.objects[at];
  switch (change.kind) {
    case 'light':
      return isCandle(object) && !isLit(object) ? toggleLight(doc, at, now) : doc;
    case 'snuff':
      return isCandle(object) && isLit(object) ? toggleLight(doc, at, now) : doc;
    case 'refresh':
      return offeringOf(object) ? updateObjects(doc, [at], (o) => refreshOffering(o, now)) : doc;
    case 'returned': {
      if (!offeringOf(object)) return doc;
      // A sprig or a loaf is the offering itself: it leaves the altar. A bowl stays, empty.
      return isOfferingItself(object) ? removeObject(doc, at) : updateObjects(doc, [at], (o) => endOffering(o, 'returned', now));
    }
    case 'water':
      return isPottedPlant(object) ? updateObjects(doc, [at], (o) => waterPlant(o, now)) : doc;
    case 'word': {
      const text = change.text.trim().slice(0, 500);
      return text ? updateObjects(doc, [at], (o) => logAppEvent(o, { kind: 'note', text }, now)) : doc;
    }
  }
  return doc;
}

// ─── What's on an altar, and whose ──────────────────────────────────────

export type WhoseContext = {
  userId: string | null;
  /** Your name as the coven knows it (candles tended in your name carry it). */
  myName: string;
  /** Ids of your own contributions (papers from rituals). */
  myContributions: string[];
  /** Coven petitions by id: who asked. */
  petitions: Record<string, { userId: string; title: string }>;
  nameOf: (userId: string) => string;
  /** Your own altar: everything on it is yours. */
  personal?: boolean;
};

export type ListingKind = 'candle' | 'paper' | 'offering' | 'plant' | 'other';

export type ListingRow = {
  key: string;
  index: number;
  kind: ListingKind;
  label: string;
  /** "Yours", "Rowan’s", "Someone’s, kept private", or '' when it's the coven's. */
  whose: string;
  mine: boolean;
  lit: boolean;
};

const ritualPaperOf = (o: SavedObject) => {
  const raw = appStateOf(o).ritualPaper as { contributionId?: string } | undefined;
  return raw && typeof raw.contributionId === 'string' ? raw.contributionId : '';
};

const kindOfObject = (o: SavedObject): ListingKind =>
  isCandle(o) ? 'candle' : isPetitionPaper(o) ? 'paper' : isPottedPlant(o) ? 'plant' : offeringOf(o) || isOfferingItself(o) ? 'offering' : 'other';

const short = (text: string) => (text.length > 60 ? `${text.slice(0, 59).trimEnd()}…` : text);

/** Every thing on the altar, with whose it is as far as you may know, yours first then in the altar's order. */
export function altarListing(doc: AltarDocument, ctx: WhoseContext): ListingRow[] {
  const rows = doc.objects.map((o, index): ListingRow => {
    const key = String(o.altarObjectId || `i${index}`);
    const kind = kindOfObject(o);
    const lit = isLit(o);
    const label = short(String(o.label || o.plaqueText || 'Something on the altar').replace(/^Petition: /, ''));
    if (ctx.personal) return { key, index, kind, label, whose: 'Yours', mine: true, lit };
    const state = appStateOf(o);
    // A paper from a ritual: yours by its id; anyone else's only as its label says.
    const contribution = ritualPaperOf(o);
    if (contribution) {
      const mine = ctx.myContributions.includes(contribution);
      return { key, index, kind: 'paper', label: mine ? `${label} (yours)` : label, whose: mine ? 'Yours' : '', mine, lit };
    }
    // A coven petition's candle and paper: whoever asked it (petitions are asked in the coven's name for all to see).
    const petitionId = isPetitionPaper(o) ? petitionEntryOf(o) : '';
    const petitionCandle = state.petitionCandle === true;
    const petition = petitionId ? ctx.petitions[petitionId] : null;
    if (petition) {
      const mine = petition.userId === ctx.userId;
      return { key, index, kind, label: `Petition: ${petition.title}`, whose: mine ? 'Yours' : `${ctx.nameOf(petition.userId)}’s`, mine, lit };
    }
    if (petitionCandle) return { key, index, kind, label, whose: '', mine: false, lit };
    // A candle someone tended a petition with, in their name.
    const tendedBy = typeof state.tendedBy === 'string' ? state.tendedBy : '';
    const tendedById = typeof state.tendedById === 'string' ? state.tendedById : '';
    if (tendedById || tendedBy) {
      const mine = tendedById ? tendedById === ctx.userId : !!ctx.myName && tendedBy === ctx.myName;
      return { key, index, kind, label, whose: mine ? 'Yours' : `${tendedBy || ctx.nameOf(tendedById)}’s`, mine, lit };
    }
    // Set down by someone who said so (placedBy, when whatever set it down recorded it).
    const placedBy = typeof state.placedBy === 'string' ? state.placedBy : '';
    if (placedBy) {
      const mine = placedBy === ctx.userId;
      return { key, index, kind, label, whose: mine ? 'Yours' : `${ctx.nameOf(placedBy)}’s`, mine, lit };
    }
    return { key, index, kind, label, whose: '', mine: false, lit };
  });
  return rows.sort((a, b) => Number(b.mine) - Number(a.mine) || a.index - b.index);
}

/** The keys to light up for "Find mine". */
export const mineKeys = (rows: ListingRow[]) => rows.filter((r) => r.mine).map((r) => r.key);

/** "3 things on the altar are yours: 2 candles and a paper." */
export function mineLine(rows: ListingRow[]): string {
  const mine = rows.filter((r) => r.mine);
  if (!mine.length) return 'Nothing on this altar is yours yet.';
  const words: Record<ListingKind, [string, string]> = { candle: ['a candle', 'candles'], paper: ['a paper', 'papers'], offering: ['an offering', 'offerings'], plant: ['a plant', 'plants'], other: ['something else', 'other things'] };
  const counts = (Object.keys(words) as ListingKind[]).map((k) => [k, mine.filter((r) => r.kind === k).length] as const).filter(([, n]) => n > 0);
  const parts = counts.map(([k, n]) => (n === 1 ? words[k][0] : `${n} ${words[k][1]}`));
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
  return mine.length === 1 ? `One thing on this altar is yours: ${list}.` : `${mine.length} things on this altar are yours: ${list}.`;
}
