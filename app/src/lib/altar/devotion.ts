// Crystal care and deity devotion on the altar, as the website records them
// (altar/js/features/object-actions.js openCrystalAction / openDeityAction,
// living-object-state.js setCrystalCare / setDeityState). Choices are stored
// as the website's slugs ("routine-care") so records made in either place
// read the same. Pure, so it can be tested.

import { readLivingState, writeLivingState } from './livingState.ts';
import type { SavedObject } from './types.ts';
import { newId } from './uid.ts';

/** "Routine care" → "routine-care", as the website's option cards do. */
export const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
/** "routine-care" → "Routine care" (humanizeActionValue). */
export const humanize = (value: unknown) => {
  const text = String(value || '').replaceAll('-', ' ').replaceAll('_', ' ');
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
};

export const CLEANSE_REASONS = ['General energetic cleansing', 'Clearing a current intention', 'Preparing for a new intention', 'After ritual use', 'After emotionally intense use', 'Routine care', 'Other'];
export const CHARGE_PURPOSES = ['General recharge', 'Strengthen current intention', 'Prepare for ritual', 'Prepare for meditation', 'Protection', 'Healing', 'Divination', 'Manifestation', 'Devotional use', 'Seasonal or lunar work', 'Other'];
export const CLEANSE_METHODS = ['Moonlight', 'Sunlight', 'Water', 'Salt', 'Smoke', 'Sound', 'Selenite', 'Earth', 'Herbs', 'Breath', 'Visualization', 'Prayer', 'Intention', 'Other'];
export const CHARGE_METHODS = ['Moonlight', 'Sunlight', 'Crystal grid', 'Another crystal', 'Herbs', 'Oil', 'Candle', 'Sound', 'Breath', 'Visualization', 'Prayer', 'Intention', 'Altar placement', 'Other'];
export const DEDICATION_TYPES = ['Deity', 'Ancestor', 'Spirit', 'Purpose', 'Ritual role', 'Person', 'Self', 'Place', 'Practice', 'Other'];
export const DEDICATION_DURATIONS = ['Until manually removed', 'For one ritual', 'Until a chosen date', 'Ongoing but review later'];
export const OFFERING_TYPES = ['Herbs', 'Crystals', 'Oils', 'Apothecary items', 'Incense', 'Candles', 'Food', 'Drink', 'Flowers', 'Coins', 'Written prayer', 'Song or music', 'Devotional act', 'Other'];
export const OFFERING_STATUSES = ['Offered', 'Present on altar', 'Completed', 'Consumed or used', 'Removed', 'Returned to nature', 'Disposed of', 'Unknown', 'Custom'];
export const RESPONSES = ['Not yet known', 'Accepted', 'Neutral', 'Declined', 'Strong presence felt', 'Personal interpretation'];
export const PRESENCE_REASONS = ['Devotional focus', 'Ritual participant', 'Protection', 'Guidance', 'Honoring or remembrance', 'Seasonal observance', 'Ongoing altar presence', 'Temporary presence', 'Other'];

type Rec = Record<string, unknown>;
const list = (value: unknown): Rec[] => (Array.isArray(value) ? (value as Rec[]) : []);
const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export type Support = { id: string; label: string };

/** Things on the altar that can support a working (resourceChoices). */
export function supportsOn(objects: SavedObject[], subject: SavedObject): Support[] {
  return objects
    .filter((o) => o !== subject && ['herb', 'oil', 'incense', 'crystal', 'candle', 'apothecary'].includes(String(o.type)))
    .map((o) => ({ id: String(o.altarObjectId || o.entityId || o.label || ''), label: String(o.label || 'Altar support') }))
    .filter((s) => s.id);
}

// ─── Crystals ────────────────────────────────────────────────────────────

export const crystalState = (object: SavedObject, now: string) => (readLivingState(object, now).crystal ?? {}) as Rec;

/** What the crystal is holding now (getCrystalIntention). */
export function crystalIntention(object: SavedObject, now: string): string {
  const c = crystalState(object, now);
  const details = (c.dedicationDetails ?? {}) as Rec;
  const intention = (c.intention ?? {}) as Rec;
  return str(intention.text) || str(c.currentIntention) || str(details.intention) || str(details.purpose) || str(c.dedication);
}

/** The choice before cleansing or charging, which depends on whether there's an intention already. */
export function crystalDecisions(kind: 'cleanse' | 'charge', hasIntention: boolean): string[] {
  if (kind === 'cleanse') {
    return hasIntention ? ['Keep all current intentions', 'Cleanse and remove all current intentions', 'Cleanse and prepare all for new intentions'] : ['General energetic cleansing'];
  }
  return hasIntention ? ['Continue with existing intentions', 'Cleanse selected crystals first'] : ['General energetic charge', 'Charge with one shared new intention'];
}

export type CareInput = {
  decision: string;
  purpose: string;
  methods: string[];
  supports: Support[];
  /** A new intention, when charging with one. */
  intention?: string;
  notes?: string;
  occurredAt: string;
};

/** Record a cleansing or a charge on one crystal (setCrystalCare). */
export function careForCrystal(object: SavedObject, kind: 'cleanse' | 'charge', input: CareInput, now: string): SavedObject {
  const state = readLivingState(object, now);
  const crystal = { cleansingHistory: [], chargingHistory: [], ...(state.crystal as Rec) } as Rec;
  const decision = slug(input.decision);
  const record = {
    id: newId(),
    occurredAt: input.occurredAt,
    purpose: slug(input.purpose),
    methods: input.methods.map(slug),
    supports: input.supports,
    intentionHandling: decision,
    intention: str(input.intention) || crystalIntention(object, now),
    notes: str(input.notes),
  };
  if (kind === 'cleanse') {
    crystal.lastCleansedAt = input.occurredAt;
    crystal.cleansingHistory = [...list(crystal.cleansingHistory), record];
  } else {
    crystal.lastChargedAt = input.occurredAt;
    crystal.chargingHistory = [...list(crystal.chargingHistory), record];
  }
  if (decision === 'cleanse-and-remove-all-current-intentions' || decision === 'cleanse-and-prepare-all-for-new-intentions') {
    crystal.dedication = '';
    crystal.dedicationDetails = null;
  }
  if (kind === 'charge' && str(input.intention)) {
    crystal.dedication = str(input.intention);
    crystal.dedicationDetails = { ...((crystal.dedicationDetails as Rec) ?? {}), intention: str(input.intention), updatedAt: input.occurredAt };
  }
  return writeLivingState(object, { ...state, lastUsedAt: now, crystal }, now);
}

export type Dedication = {
  type: string;
  entityId: string;
  dedicatedTo: string;
  intention: string;
  duration: string;
  reviewAt: string;
  notes: string;
};

/** Give a crystal an ongoing role or devotional focus. */
export function dedicateCrystal(object: SavedObject, input: Dedication, now: string): SavedObject {
  const state = readLivingState(object, now);
  const details = {
    type: slug(input.type),
    entityId: input.entityId,
    dedicatedTo: str(input.dedicatedTo),
    intention: str(input.intention),
    duration: slug(input.duration),
    reviewAt: input.reviewAt,
    notes: str(input.notes),
    recordedAt: now,
  };
  const crystal = { ...(state.crystal as Rec), dedication: details.intention || details.dedicatedTo, dedicationDetails: details };
  return writeLivingState(object, { ...state, lastUsedAt: now, crystal }, now);
}

/** The crystal's own story: cleansings and charges, newest first. */
export function crystalHistory(object: SavedObject, now: string): { label: string; at: string; detail: string }[] {
  const c = crystalState(object, now);
  const rows = [
    ...list(c.cleansingHistory).map((r) => ({ label: 'Cleansed', r })),
    ...list(c.chargingHistory).map((r) => ({ label: 'Charged', r })),
  ];
  return rows
    .map(({ label, r }) => ({
      label,
      at: str(r.occurredAt),
      detail: [humanize(r.purpose), list(r.methods as never).length ? `with ${(r.methods as string[]).map(humanize).join(', ').toLowerCase()}` : ''].filter(Boolean).join(' '),
    }))
    .sort((a, b) => b.at.localeCompare(a.at));
}

// ─── Deities ─────────────────────────────────────────────────────────────

export const deityState = (object: SavedObject, now: string) => (readLivingState(object, now).deity ?? {}) as Rec;

export type Offering = {
  id: string;
  occurredAt: string;
  types: string[];
  /** What was given: things on the altar (fromAltar, with their picture, form and kind), altar supports, and things written in. */
  items: { id?: string; label: string; custom?: boolean; fromAltar?: boolean; imagePath?: string; form?: string; objectType?: string; kind?: string }[];
  intention: string;
  message: string;
  status: string;
  perceivedResponse: string;
  responseNotes: string;
  followUpNotes?: string;
  completedAt?: string;
  updatedAt?: string;
};

/** Offerings, newest first. */
export const offeringsOf = (object: SavedObject, now: string) =>
  (list(deityState(object, now).offerings) as unknown as Offering[]).slice().sort((a, b) => String(b.occurredAt || '').localeCompare(String(a.occurredAt || '')));

/** A status as stored: the slug of a listed one, or the words of a custom one. */
export const statusValue = (status: string, custom: string) => (status === 'Custom' ? custom.trim() : slug(status));

export type OfferingInput = {
  types: string[];
  /** Things on the altar given as the offering (offerFromAltar.ts giftItem), recorded first. */
  gifts?: Offering['items'];
  /** The record's id, when the caller needs to know it (to link the things given back to it). */
  id?: string;
  supports: Support[];
  customItems: string;
  intention: string;
  message: string;
  status: string;
  customStatus: string;
  response: string;
  responseNotes: string;
  occurredAt: string;
};

/** Record a new offering (openDeityAction "offering-new"). */
export function recordOffering(object: SavedObject, input: OfferingInput, now: string): SavedObject {
  const state = readLivingState(object, now);
  const status = statusValue(input.status, input.customStatus);
  const custom = input.customItems.split(',').map((v) => v.trim()).filter(Boolean).map((label) => ({ label, custom: true }));
  const record: Offering = {
    id: input.id || newId(),
    occurredAt: input.occurredAt,
    types: input.types.map(slug),
    items: [...(input.gifts ?? []), ...input.supports, ...custom],
    intention: str(input.intention),
    message: str(input.message),
    status,
    perceivedResponse: input.response ? slug(input.response) : '',
    responseNotes: str(input.responseNotes),
  };
  const deity = { offerings: [], offeringStatusHistory: [], ...(state.deity as Rec) } as Rec;
  deity.lastOfferingAt = input.occurredAt;
  deity.offeringStatus = status;
  deity.offerings = [...list(deity.offerings), record];
  return writeLivingState(object, { ...state, lastUsedAt: now, deity }, now);
}

export type OfferingUpdate = { status: string; customStatus: string; response: string; responseNotes: string; followUpNotes: string; completedAt: string };

/** Update an offering's state and log the change (openDeityAction "offering-update"). */
export function updateOffering(object: SavedObject, offeringId: string, input: OfferingUpdate, now: string): SavedObject {
  const state = readLivingState(object, now);
  const deity = { offerings: [], offeringStatusHistory: [], ...(state.deity as Rec) } as Rec;
  const status = statusValue(input.status, input.customStatus);
  const response = input.response ? slug(input.response) : '';
  const latest = offeringsOf(object, now)[0];
  deity.offerings = list(deity.offerings).map((o) =>
    o.id === offeringId
      ? { ...o, status, perceivedResponse: response, responseNotes: str(input.responseNotes), followUpNotes: str(input.followUpNotes), completedAt: input.completedAt, updatedAt: now }
      : o,
  );
  if (latest?.id === offeringId) deity.offeringStatus = status;
  deity.offeringStatusHistory = [...list(deity.offeringStatusHistory), { id: newId(), offeringId, status, perceivedResponse: response, occurredAt: now }];
  return writeLivingState(object, { ...state, lastUsedAt: now, deity }, now);
}

/** Why this presence is on the altar (openDeityAction "reason-presence"). */
export function setPresenceReason(object: SavedObject, reason: string, notes: string, now: string): SavedObject {
  const state = readLivingState(object, now);
  const details = { reason: slug(reason), notes: notes.trim(), updatedAt: now };
  const deity = {
    ...(state.deity as Rec),
    reasonForPresence: [details.reason.replaceAll('-', ' '), details.notes].filter(Boolean).join(': '),
    reasonDetails: details,
  };
  return writeLivingState(object, { ...state, lastUsedAt: now, deity }, now);
}

// ─── What the home screen widget does ────────────────────────────────────
// Each presence can keep the offering its widget button makes, and each
// crystal the cleansing; set in the app, stored with the object's state (the
// app's own addition; the website keeps it untouched).

/** The offering the widget's Offer button records for this presence. */
export type DefaultOffering = { types: string[]; supports: Support[]; customItems: string; intention: string; message: string };

/** The cleansing the widget's Cleanse button records for this crystal. */
export type DefaultCleansing = { purpose: string; methods: string[]; supports: Support[]; notes: string };

const asDefaultOffering = (raw: unknown): DefaultOffering | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Rec;
  const value: DefaultOffering = {
    types: Array.isArray(r.types) ? (r.types as unknown[]).filter((t): t is string => typeof t === 'string') : [],
    supports: list(r.supports).filter((s) => typeof s.label === 'string') as unknown as Support[],
    customItems: str(r.customItems),
    intention: str(r.intention),
    message: str(r.message),
  };
  return value.types.length || value.supports.length || value.customItems || value.intention || value.message ? value : null;
};

export const defaultOfferingOf = (object: SavedObject, now: string) => asDefaultOffering(deityState(object, now).widgetOffering);

export function setDefaultOffering(object: SavedObject, value: DefaultOffering | null, now: string): SavedObject {
  const state = readLivingState(object, now);
  const deity = { ...(state.deity as Rec), widgetOffering: value ? asDefaultOffering(value) : null };
  return writeLivingState(object, { ...state, deity }, now);
}

const asDefaultCleansing = (raw: unknown): DefaultCleansing | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Rec;
  const methods = Array.isArray(r.methods) ? (r.methods as unknown[]).filter((m): m is string => typeof m === 'string') : [];
  if (!methods.length) return null;
  return { purpose: str(r.purpose) || 'Routine care', methods, supports: list(r.supports).filter((s) => typeof s.label === 'string') as unknown as Support[], notes: str(r.notes) };
};

export const defaultCleansingOf = (object: SavedObject, now: string) => asDefaultCleansing(crystalState(object, now).widgetCleansing);

export function setDefaultCleansing(object: SavedObject, value: DefaultCleansing | null, now: string): SavedObject {
  const state = readLivingState(object, now);
  const crystal = { ...(state.crystal as Rec), widgetCleansing: value ? asDefaultCleansing(value) : null };
  return writeLivingState(object, { ...state, crystal }, now);
}

/** "Wine, rosemary" or "Incense · gratitude": a few words for what the default is. */
export function defaultOfferingSummary(value: DefaultOffering | null): string {
  if (!value) return '';
  const items = [...value.supports.map((s) => s.label), ...value.customItems.split(',').map((v) => v.trim()).filter(Boolean)];
  return (items.length ? items : value.types).join(', ') || value.intention;
}

export function defaultCleansingSummary(value: DefaultCleansing | null): string {
  return value ? value.methods.join(', ') : '';
}
