// The Altar widget: one of your saved altars on the home screen, with its
// candles, the presences on it, its crystals and workings, and buttons to
// light the candles, tend offerings and cleanse crystals without opening the
// app. A tap changes the widget at once and leaves a note of what was done
// (an action); the next time the app opens it carries each action out on the
// real altar, which then saves and syncs as usual. Pure, so it can be tested.

import { careForCrystal, crystalDecisions, crystalIntention, crystalState, deityState, recordOffering } from './altar/devotion.ts';
import { lightAll, snuffAll } from './altar/editor.ts';
import { apothecaryStateOf, isCandle, isLit, lightCandle, readLivingState, snuffCandle } from './altar/livingState.ts';
import { documentFromAltar, type AltarDocument } from './altar/snapshot.ts';
import type { SavedAltar, SavedObject } from './altar/types.ts';

/** How many altars can be on the home screen at once (the widget's "Which altar" choices). */
export const ALTAR_WIDGET_SLOTS = 6;
const MAX_CANDLES = 8;
const MAX_PRESENCES = 4;
const MAX_CRYSTALS = 6;

export type WidgetCandle = {
  key: string;
  label: string;
  /** The candle's colour, for its flame and swatch. */
  color: string;
  /** file:// picture of the candle, or "". */
  image: string;
  lit: boolean;
  /** When it was lit (ISO), or "". */
  since: string;
};

export type WidgetPresence = {
  key: string;
  label: string;
  image: string;
  /** Last offering (ISO), or "". */
  lastOffering: string;
};

export type WidgetCrystal = {
  key: string;
  label: string;
  image: string;
  lastCleansed: string;
  lastCharged: string;
  intention: string;
};

export type WidgetAltar = {
  id: string;
  name: string;
  /** file:// picture of the altar's background, or "". */
  background: string;
  candles: WidgetCandle[];
  /** Candles on the altar beyond those listed. */
  moreCandles: number;
  presences: WidgetPresence[];
  crystals: WidgetCrystal[];
  /** Apothecary workings whose tending date has come. */
  workingsDue: number;
  workings: number;
  items: number;
};

export type WidgetActionKind = 'light' | 'snuff' | 'offer' | 'cleanse';

export type WidgetAction = {
  id: string;
  altarId: string;
  kind: WidgetActionKind;
  /** One object's altarObjectId, or "" for every candle / presence / crystal. */
  key: string;
  at: string;
};

export type AltarWidgetProps = {
  /** In slot order: the first is "Altar 1" in the widget's settings. */
  altars: WidgetAltar[];
  actions: WidgetAction[];
};

const CANDLE_COLORS: Record<string, string> = {
  white: '#f4ecd8',
  black: '#3a3a3a',
  green: '#4f9a5b',
  purple: '#8a5cc2',
  red: '#c8433a',
  orange: '#e0843a',
  yellow: '#e8c547',
  blue: '#4a7bd0',
  brown: '#8a5a3a',
  pink: '#e48ab0',
  gold: '#e2c36d',
  silver: '#c9ccd1',
  grey: '#9a9a9a',
  gray: '#9a9a9a',
  indigo: '#5a52b5',
  rainbow: '#e2c36d',
  magenta: '#c93a9a',
};

export function candleColor(object: SavedObject): string {
  const named = String(object.color || '').toLowerCase();
  if (CANDLE_COLORS[named]) return CANDLE_COLORS[named];
  const fromLabel = Object.keys(CANDLE_COLORS).find((c) => String(object.label || '').toLowerCase().includes(c));
  return fromLabel ? CANDLE_COLORS[fromLabel] : '#e2c36d';
}

const objectKey = (object: SavedObject, index: number) => String(object.altarObjectId || object.instanceId || `i${index}`);
const label = (object: SavedObject, fallback: string) => String(object.label || '').trim() || fallback;
const isPresence = (object: SavedObject) => object.type === 'deity';
const isCrystal = (object: SavedObject) => object.type === 'crystal';
const isWorking = (object: SavedObject) => object.type === 'apothecary' || !!object.apothecaryItemId;

/** The pictures the widget will want for an altar: its background and each listed object. */
export function altarImagePaths(altar: SavedAltar): string[] {
  const doc = documentFromAltar(altar);
  const listed = [
    ...doc.objects.filter(isCandle).slice(0, MAX_CANDLES),
    ...doc.objects.filter(isPresence).slice(0, MAX_PRESENCES),
    ...doc.objects.filter(isCrystal).slice(0, MAX_CRYSTALS),
  ];
  return [doc.background, ...listed.map((o) => String(o.imagePath || ''))].filter(Boolean);
}

/** What the widget shows for one altar. `image` turns a saved picture path into a file the widget can read. */
export function widgetAltar(altar: SavedAltar, image: (path: string) => string, now: Date): WidgetAltar {
  const doc = documentFromAltar(altar);
  const iso = now.toISOString();
  const keyed = doc.objects.map((object, index) => ({ object, key: objectKey(object, index) }));
  const candles = keyed.filter(({ object }) => isCandle(object));
  const picture = (object: SavedObject) => (object.imagePath ? image(String(object.imagePath)) : '');
  const workings = doc.objects.filter(isWorking);
  return {
    id: altar.id,
    name: altar.name || 'My altar',
    background: doc.background ? image(doc.background) : '',
    candles: candles.slice(0, MAX_CANDLES).map(({ object, key }) => ({
      key,
      label: label(object, 'Candle'),
      color: candleColor(object),
      image: picture(object),
      lit: isLit(object),
      since: isLit(object) ? String(readLivingState(object, iso).candle?.currentBurnStartedAt || '') : '',
    })),
    moreCandles: Math.max(0, candles.length - MAX_CANDLES),
    presences: keyed
      .filter(({ object }) => isPresence(object))
      .slice(0, MAX_PRESENCES)
      .map(({ object, key }) => ({ key, label: label(object, 'Presence'), image: picture(object), lastOffering: String(deityState(object, iso).lastOfferingAt || '') })),
    crystals: keyed
      .filter(({ object }) => isCrystal(object))
      .slice(0, MAX_CRYSTALS)
      .map(({ object, key }) => {
        const state = crystalState(object, iso);
        return {
          key,
          label: label(object, 'Crystal'),
          image: picture(object),
          lastCleansed: String(state.lastCleansedAt || ''),
          lastCharged: String(state.lastChargedAt || ''),
          intention: crystalIntention(object, iso),
        };
      }),
    workingsDue: workings.filter((o) => {
      const next = Date.parse(apothecaryStateOf(o).nextTendingAt);
      return Number.isFinite(next) && next <= now.getTime();
    }).length,
    workings: workings.length,
    items: doc.objects.length,
  };
}

/**
 * Which altars fill the widget's places: the ones you put there, in order,
 * then the rest by most recently saved, so a new widget always shows something.
 */
export function slotAltars(altars: SavedAltar[], chosen: (string | null)[]): SavedAltar[] {
  const byId = new Map(altars.map((a) => [a.id, a]));
  const slots: (SavedAltar | null)[] = Array.from({ length: ALTAR_WIDGET_SLOTS }, (_, i) => byId.get(chosen[i] ?? '') ?? null);
  const used = new Set(slots.filter(Boolean).map((a) => a!.id));
  const rest = [...altars]
    .filter((a) => !used.has(a.id))
    .sort((a, b) => String(b.updatedAt || b.savedAt || '').localeCompare(String(a.updatedAt || a.savedAt || '')));
  return slots.map((a) => a ?? rest.shift() ?? null).filter((a): a is SavedAltar => !!a);
}

/** Move an altar into a place (1-based), or take it off the home screen with 0. */
export function chooseSlot(chosen: (string | null)[], altarId: string, slot: number): (string | null)[] {
  const next = Array.from({ length: ALTAR_WIDGET_SLOTS }, (_, i) => (chosen[i] === altarId ? null : chosen[i] ?? null));
  if (slot >= 1 && slot <= ALTAR_WIDGET_SLOTS) next[slot - 1] = altarId;
  return next;
}

function changeObjects(doc: AltarDocument, key: string, pick: (o: SavedObject) => boolean, change: (o: SavedObject) => SavedObject): AltarDocument {
  let changed = false;
  const objects = doc.objects.map((object, index) => {
    if (!pick(object) || (key && objectKey(object, index) !== key)) return object;
    const next = change(object);
    if (next !== object) changed = true;
    return next;
  });
  return changed ? { ...doc, objects } : doc;
}

/** Carry out one widget action on an altar's document. */
export function applyWidgetAction(doc: AltarDocument, action: WidgetAction, now: string): AltarDocument {
  const at = action.at || now;
  switch (action.kind) {
    case 'light':
      return action.key ? changeObjects(doc, action.key, isCandle, (o) => lightCandle(o, at)) : lightAll(doc, at);
    case 'snuff':
      return action.key ? changeObjects(doc, action.key, isCandle, (o) => snuffCandle(o, at)) : snuffAll(doc, at);
    case 'offer':
      return changeObjects(doc, action.key, isPresence, (o) =>
        recordOffering(
          o,
          {
            types: ['Devotional act'],
            supports: [],
            customItems: '',
            intention: '',
            message: 'Offerings tended from the home screen.',
            status: 'Offered',
            customStatus: '',
            response: '',
            responseNotes: '',
            occurredAt: at,
          },
          now,
        ),
      );
    case 'cleanse':
      return changeObjects(doc, action.key, isCrystal, (o) =>
        careForCrystal(
          o,
          'cleanse',
          {
            decision: crystalDecisions('cleanse', !!crystalIntention(o, now))[0],
            purpose: 'Routine care',
            methods: ['Intention'],
            supports: [],
            notes: 'Cleansed from the home screen.',
            occurredAt: at,
          },
          now,
        ),
      );
    default:
      return doc;
  }
}

/** The altars the actions change, each with its new document, in the order the actions were taken. */
export function applyWidgetActions(altars: SavedAltar[], actions: WidgetAction[], now: string): { altar: SavedAltar; doc: AltarDocument }[] {
  const docs = new Map<string, { altar: SavedAltar; doc: AltarDocument }>();
  for (const action of [...actions].sort((a, b) => a.at.localeCompare(b.at))) {
    const altar = altars.find((a) => a.id === action.altarId);
    if (!altar) continue;
    const current = docs.get(altar.id) ?? { altar, doc: documentFromAltar(altar) };
    docs.set(altar.id, { altar, doc: applyWidgetAction(current.doc, action, now) });
  }
  return [...docs.values()].filter(({ altar, doc }) => doc !== documentFromAltar(altar) && JSON.stringify(doc.objects) !== JSON.stringify(documentFromAltar(altar).objects));
}
