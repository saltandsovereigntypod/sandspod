// Poppets: a small figure of cloth, wax, clay, corn or root that stands for
// someone (yourself, or someone who has asked you and agreed) or for a
// situation, made, named, tended and in the end unmade. The poppet is an
// apothecary working of type "poppet" (the cabinet's own poppet picture, the
// website's "who or what it represents" details); its making, tending and
// ending live in livingState.app.poppet.
//
// History, honestly: figures standing for a person are among the oldest
// recorded magic (Greek and Roman binding figures, wax images in English
// witch trials). Cloth and herb poppets for healing and protection are a
// modern folk and Pagan form. Pure.

import type { LibraryEntry } from '../../library/types.ts';
import { apothecaryObject, apothecaryType, DEFAULT_LIVING, type ApothecaryItem, type Ingredient } from '../apothecary.ts';
import { readLivingState } from '../livingState.ts';
import type { SavedObject } from '../types.ts';
import { newId } from '../uid.ts';
import { appPart, withAppPart } from './appState.ts';
import { lookWords, MAX_PINS, pinColour, ZONES } from './poppetLook.ts';
import { filling, type Filling, type FillingKind } from './sachet.ts';

export type PoppetFocus = 'self' | 'other' | 'situation' | 'symbolic';

export const FOCUS: { key: PoppetFocus; label: string; detail: string; website: string }[] = [
  { key: 'self', label: 'Myself', detail: 'For your own healing, protection or growth.', website: 'Self' },
  { key: 'other', label: 'Someone who asked', detail: 'Only for someone who has asked for it and agreed, and who knows what you’ll do.', website: 'Someone else' },
  { key: 'situation', label: 'A situation', detail: 'A home, a job, a hard time: not a person.', website: 'Situation' },
  { key: 'symbolic', label: 'Something symbolic', detail: 'A hope, a habit, a part of yourself.', website: 'Symbolic' },
];

export const POPPET_ETHICS =
  'A poppet stands in for a real person, so it is made for yourself, or for someone else only when they have asked and agreed. Working on someone without their consent, even to help, takes away their choice. If what you want is to stop someone harming you, a protection poppet of yourself, or a ward on your home, keeps the work on your side.';

export type PoppetBody = 'cloth' | 'wax' | 'clay' | 'corn' | 'root' | 'paper';

export const BODIES: { key: PoppetBody; label: string; line: string }[] = [
  { key: 'cloth', label: 'Cloth', line: 'Two shapes cut from a simple outline, sewn round with a gap to fill. Natural cloth if it will be buried.' },
  { key: 'wax', label: 'Wax', line: 'Warm beeswax shaped in the hands. Wax figures are the oldest recorded kind.' },
  { key: 'clay', label: 'Clay', line: 'Air-drying clay, or earth from a place that matters. Returns to the ground easily.' },
  { key: 'corn', label: 'Corn or straw', line: 'Wheat straw or corn husk folded and tied, as harvest figures are.' },
  { key: 'root', label: 'A root', line: 'A root with a body’s shape (angelica, ginger, a potato), as folk practice does.' },
  { key: 'paper', label: 'Paper', line: 'Cut from paper or card and filled with nothing but words.' },
];

/** Making it, in order: the sheet shows these as a guided list. */
export const MAKING_STEPS: { id: string; title: string; text: string }[] = [
  { id: 'prepare', title: 'Prepare', text: 'Cleanse the space and your hands. Have the body, the fillings and a needle and thread (or wax, clay, straw) ready.' },
  { id: 'shape', title: 'Shape the body', text: 'Cut, mould or fold a simple figure: a head, two arms, two legs. It needn’t be skilled; it needs to be made by you.' },
  { id: 'fill', title: 'Fill it', text: 'Add the herbs and small things one at a time, saying what each is for. A cloth poppet is filled through the gap at the head.' },
  { id: 'link', title: 'Link it', text: 'Add what ties it to whoever it stands for: a strand of your own hair, a scrap of their clothing given freely, a name on paper.' },
  { id: 'close', title: 'Close it', text: 'Sew, seal or tie it shut. As the last stitch goes in, it stops being a doll.' },
  { id: 'name', title: 'Name it', text: 'Hold it and say who or what it stands for and what it’s for. Breathe on it to wake it.' },
];

export type PoppetEnd = 'unpick' | 'bury' | 'water' | 'burn' | 'keep';

export const ENDINGS: { key: PoppetEnd; label: string; text: string }[] = [
  { key: 'unpick', label: 'Unpick it', text: 'Thank it and say the work is done. Unpick the stitches, return the herbs to the earth, wash the cloth or keep it for something new.' },
  { key: 'bury', label: 'Bury it', text: 'For a natural poppet (cotton, wool, clay, straw, herbs): bury it somewhere it can rot down, with thanks. Take out pins, wire and plastic first.' },
  { key: 'water', label: 'Running water', text: 'For a poppet of clay, paper or plain herbs only. Release what washes away; never put cloth, wax or anything synthetic in a river.' },
  { key: 'burn', label: 'Burn it', text: 'In a fire safe outdoors, natural materials only, with the pins and wire taken out first. Scatter the cooled ash.' },
  { key: 'keep', label: 'Keep it', text: 'A protection poppet of yourself can stay, tended. Wrap it in clean cloth and keep it somewhere safe.' },
];

/**
 * How it looks (lib/altar/workings/poppetLook): the body, its dye (a candle
 * colour's key, or '' for undyed), the eyes, what it's stuffed with, the kind
 * of taglock (a label only: no picture, hair or name is ever stored) and how
 * it was sealed.
 */
export type PoppetLook = { body?: PoppetBody; colour?: string; eyes?: string; stuffing?: string; taglock?: string; seal?: string; [key: string]: unknown };
/** A pin set into the body: where (0–1 across and down the body's picture), its colour and what it means, and the place and a note. */
export type PoppetPin = { x: number; y: number; colour: string; meaning: string; at: string; zone?: string; note?: string };
/** A moment in its keeping: held and spoken to, or a pin set in or taken out. */
export type Tending = { at: string; text: string; kind?: 'hold' | 'pin' | 'unpin' };

/** What livingState.app.poppet holds. */
export type PoppetState = {
  kind: 'poppet';
  focus: PoppetFocus;
  /** Who or what it stands for, in your words. */
  who: string;
  purpose: string;
  body: PoppetBody;
  fillings: Filling[];
  /** The making steps done, by id. */
  made: string[];
  consent: boolean;
  look?: PoppetLook;
  pins: PoppetPin[];
  tendings: Tending[];
  madeAt: string;
  ended?: { how: PoppetEnd; at: string; note: string };
};

export type PoppetDraft = { name: string; focus: PoppetFocus; who: string; purpose: string; body: PoppetBody; fillings: Filling[]; made: string[]; consent: boolean; look: PoppetLook; pins: PoppetPin[] };

export const emptyPoppet = (): PoppetDraft => ({ name: '', focus: 'self', who: '', purpose: '', body: 'cloth', fillings: [], made: [], consent: false, look: { body: 'cloth', colour: '', eyes: 'button', stuffing: '', taglock: '', seal: '' }, pins: [] });

/** Change the look (the body is kept in both places, as it always was). */
export const setLook = (draft: PoppetDraft, change: Partial<PoppetLook>): PoppetDraft => {
  const look = { ...draft.look, ...change };
  return { ...draft, look, body: (look.body as PoppetBody) ?? draft.body };
};

const cleanText = (s: unknown, max: number) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/** A pin as it is set in: its place, colour, what the colour means and your note. */
export function makePin(at: { x: number; y: number; zone: string }, colour: string, note: string, now: string): PoppetPin {
  const c = pinColour(colour);
  const pin: PoppetPin = { x: Math.round(at.x * 1000) / 1000, y: Math.round(at.y * 1000) / 1000, colour: c.key, meaning: c.meaning, at: now, zone: ZONES.some((z) => z.key === at.zone) ? at.zone : 'free' };
  const n = cleanText(note, 120);
  if (n) pin.note = n;
  return pin;
}

export const pinWords = (pin: PoppetPin) => {
  const zone = ZONES.find((z) => z.key === pin.zone && z.key !== 'free');
  return `${pinColour(pin.colour).label} pin${zone ? ` in the ${zone.label.toLowerCase()}` : ''}${pin.note ? `: ${pin.note}` : ''}`;
};

export const addDraftPin = (draft: PoppetDraft, pin: PoppetPin): PoppetDraft => (draft.pins.length >= MAX_PINS ? draft : { ...draft, pins: [...draft.pins, pin] });
export const removeDraftPin = (draft: PoppetDraft, index: number): PoppetDraft => ({ ...draft, pins: draft.pins.filter((_, i) => i !== index) });

/** Only the look's known keys, as short labels. */
export function cleanLook(raw: unknown, body: PoppetBody): PoppetLook {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return { ...r, body, colour: cleanText(r.colour, 20), eyes: cleanText(r.eyes, 20) || 'button', stuffing: cleanText(r.stuffing, 40), taglock: cleanText(r.taglock, 20), seal: cleanText(r.seal, 20) };
}

function cleanPins(raw: unknown): PoppetPin[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object' && Number.isFinite(Number((p as PoppetPin).x)) && Number.isFinite(Number((p as PoppetPin).y)))
    .map((p) => ({ ...p, x: Number(p.x), y: Number(p.y), colour: cleanText(p.colour, 20) || 'white', meaning: cleanText(p.meaning, 120), at: cleanText(p.at, 40) }) as PoppetPin)
    .slice(0, MAX_PINS);
}

export function addPoppetFilling(draft: PoppetDraft, label: string, kind: FillingKind, extra: { herb?: string; crystal?: string } = {}, entries?: LibraryEntry[] | null): PoppetDraft {
  const f = filling(label, kind, extra, entries);
  if (!f.label || draft.fillings.length >= 13 || draft.fillings.some((x) => x.label.toLowerCase() === f.label.toLowerCase())) return draft;
  return { ...draft, fillings: [...draft.fillings, f] };
}

export const toggleStep = (draft: PoppetDraft, id: string): PoppetDraft => ({ ...draft, made: draft.made.includes(id) ? draft.made.filter((m) => m !== id) : [...draft.made, id] });

/** Why it can't be placed yet, or null. */
export function poppetProblem(draft: PoppetDraft): string | null {
  if (draft.focus === 'other' && !draft.consent) return 'A poppet for someone else needs their asking and their yes. Tick that they have, or make it for yourself.';
  if (!draft.purpose.trim()) return 'Say what it’s for first.';
  if (draft.focus !== 'self' && !draft.who.trim()) return 'Say who or what it stands for.';
  // The making steps are a guide; ticking them is optional, so finishing the choices is enough.
  return null;
}

const fillingIngredient = (f: Filling): Ingredient => {
  const i: Ingredient = { label: f.label, libraryName: f.label, type: f.kind === 'stone' ? 'crystal' : f.kind === 'herb' ? 'herb' : 'item', amount: '' };
  if (f.herb) i.herb = f.herb;
  if (f.crystal) i.crystal = f.crystal;
  return i;
};

export const poppetLabel = (draft: Pick<PoppetDraft, 'name' | 'focus' | 'who' | 'purpose'>) =>
  draft.name.trim() || (draft.focus === 'self' ? `My ${draft.purpose.trim().toLowerCase() || 'own'} poppet` : `Poppet for ${draft.who.trim() || draft.purpose.trim() || 'a working'}`).slice(0, 60);

/** The poppet as a My Apothecary item (type "poppet", with the website's representation details). */
export function poppetItem(draft: PoppetDraft, now: string, id: string = newId()): ApothecaryItem {
  const type = apothecaryType('poppet');
  const focus = FOCUS.find((f) => f.key === draft.focus) ?? FOCUS[0];
  const body = BODIES.find((b) => b.key === draft.body) ?? BODIES[0];
  return {
    id,
    name: poppetLabel(draft),
    type: 'poppet',
    typeLabel: type.label,
    imagePath: type.image,
    intention: draft.purpose.trim(),
    notes: `${draft.look ? lookWords({ ...draft.look, body: draft.body }) : `${body.label} poppet`}${draft.focus === 'other' ? ', made with their consent' : ''}.`,
    details: { poppet_focus: focus.website, representation_notes: draft.who.trim() || (draft.focus === 'self' ? 'Myself' : '') },
    ingredients: draft.fillings.map(fillingIngredient),
    // Held each week while it works.
    livingState: { ...DEFAULT_LIVING, tending_interval_days: 7 },
    logToGrimoire: false,
    grimoireStatus: '',
    grimoireEntryId: '',
    entityId: '',
    instanceId: '',
    createdAt: now,
    updatedAt: now,
  };
}

const WEEK = 7 * 86_400_000;

export function poppetObject(
  draft: PoppetDraft,
  existing: SavedObject[],
  now: string,
  center?: { cx: number; cy: number },
  idOrItem?: string | ApothecaryItem,
): { item: ApothecaryItem; object: SavedObject } {
  const item = typeof idOrItem === 'object' ? idOrItem : poppetItem(draft, now, idOrItem);
  const base = apothecaryObject(item, existing, now, center);
  const state = readLivingState(base, now);
  const poppet: PoppetState = {
    kind: 'poppet',
    focus: draft.focus,
    who: draft.who.trim(),
    purpose: item.intention,
    body: draft.body,
    fillings: draft.fillings,
    made: draft.made,
    consent: draft.focus === 'other' ? draft.consent : false,
    look: cleanLook(draft.look, draft.body),
    pins: cleanPins(draft.pins),
    tendings: [],
    madeAt: now,
  };
  const object = withAppPart(base, 'poppet', poppet, now, {
    apothecary: { ...(state.apothecary as object), activationState: 'Named and awake', nextTendingAt: new Date(Date.parse(now) + WEEK).toISOString() },
  });
  return { item, object };
}

export function poppetStateOf(object: SavedObject): PoppetState | null {
  const s = appPart<PoppetState>(object, 'poppet');
  if (!s || s.kind !== 'poppet') return null;
  return {
    ...s,
    fillings: Array.isArray(s.fillings) ? s.fillings : [],
    made: Array.isArray(s.made) ? s.made : [],
    pins: cleanPins(s.pins),
    ...(s.look ? { look: cleanLook(s.look, BODIES.some((b) => b.key === s.body) ? s.body : 'cloth') } : {}),
    tendings: Array.isArray(s.tendings) ? s.tendings : [],
    focus: FOCUS.some((f) => f.key === s.focus) ? s.focus : 'self',
    body: BODIES.some((b) => b.key === s.body) ? s.body : 'cloth',
  };
}

/** Held and spoken to: logged, and its next tending a week on. */
export function tendPoppet(object: SavedObject, now: string, text = 'Held and spoken to'): SavedObject {
  const s = poppetStateOf(object);
  if (!s || s.ended) return object;
  const state = readLivingState(object, now);
  return withAppPart(object, 'poppet', { ...s, tendings: [...s.tendings, { at: now, text: text.trim().slice(0, 300) || 'Held and spoken to' }].slice(-60) }, now, {
    apothecary: { ...(state.apothecary as object), lastTendedAt: now, nextTendingAt: new Date(Date.parse(now) + WEEK).toISOString() },
  });
}

/** A pin set into it on the altar, logged as a moment of its own. */
export function pinPoppet(object: SavedObject, pin: PoppetPin, now: string): SavedObject {
  const s = poppetStateOf(object);
  if (!s || s.ended || s.pins.length >= MAX_PINS) return object;
  return withAppPart(object, 'poppet', { ...s, pins: [...s.pins, pin], tendings: [...s.tendings, { at: now, text: `Set in a ${pinWords(pin)}`.slice(0, 300), kind: 'pin' as const }].slice(-60) }, now);
}

/** A pin taken out, logged as a moment of its own, with what was said. */
export function unpinPoppet(object: SavedObject, index: number, now: string, note = ''): SavedObject {
  const s = poppetStateOf(object);
  const pin = s?.pins[index];
  if (!s || !pin) return object;
  const said = cleanText(note, 200);
  return withAppPart(object, 'poppet', { ...s, pins: s.pins.filter((_, i) => i !== index), tendings: [...s.tendings, { at: now, text: `Took out the ${pinWords(pin)}${said ? ` (${said})` : ''}`.slice(0, 300), kind: 'unpin' as const }].slice(-60) }, now);
}

export const holdCount = (s: PoppetState) => s.tendings.filter((t) => !t.kind || t.kind === 'hold').length;

/** The work is done: how it was ended, kept on the object. */
export function endPoppet(object: SavedObject, how: PoppetEnd, now: string, note = ''): SavedObject {
  const s = poppetStateOf(object);
  if (!s) return object;
  const state = readLivingState(object, now);
  const label = ENDINGS.find((e) => e.key === how)?.label ?? 'Ended';
  return withAppPart(object, 'poppet', { ...s, ended: { how, at: now, note: note.trim().slice(0, 500) } }, now, {
    apothecary: { ...(state.apothecary as object), activationState: `${label}: the work is done`, nextTendingAt: '' },
  });
}

export function poppetLine(s: PoppetState, now: Date): string {
  if (s.ended) return `${ENDINGS.find((e) => e.key === s.ended!.how)?.label ?? 'Ended'} on ${new Date(s.ended.at).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}.`;
  const last = s.tendings[s.tendings.length - 1]?.at ?? s.madeAt;
  const days = Math.floor((now.getTime() - Date.parse(last)) / 86_400_000);
  return days >= 7 ? `Last held ${days} days ago: hold it again this week.` : days <= 0 ? 'Held today.' : `Last held ${days} day${days === 1 ? '' : 's'} ago.`;
}
