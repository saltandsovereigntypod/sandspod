// Crystals on the altar, cared for by light and worn by use. Two parts:
//
// Charging rules (craftTools.ts does the charging itself): on selenite only
// when a piece of selenite is on the altar and the stone touches it; under
// the moon only between your sunset and sunrise (from your place, else 18:00
// to 06:00), stronger near the full moon; in the sun only in daylight, with
// a word for stones that fade in it. A charge renews the stone's intention
// when it holds one, or is a general charge; an intention can be added at
// any time.
//
// Crystal wear (the "Crystal wear" setting: Off, Gentle or Realistic): a
// stone takes on strain slowly with time on the altar since it was last
// cleansed, faster while it does protective work (warding, banishing,
// uncrossing) or is held in an open spell, and in a jump when something came
// at you. Cleansing clears the time's strain and most of the rest. It shows
// on the stone: a duller sheen, then clouding, then a hairline crack, then
// broken. Time alone never breaks a stone (it stops short of that); only a
// blow taken does. A broken stone stays on the altar until you choose what
// becomes of it. Everything is kept on the object (livingState.crystal.wear
// and wearHistory), so on a coven altar everyone sees it. Modern practice:
// the idea that a stone "gives all it can" and breaks is a modern crystal
// folk belief, not old tradition. Pure, shared with the website
// (js/core/altar.js crystalCare).

import { sunIsUp, type Place } from '../astro/rise.ts';
import { findCare } from '../craft/crystal/care.ts';
import { moonState } from '../moon.ts';
import { builtInCabinet, formImage, objectFromForm } from './cabinet.ts';
import { careForCrystal, crystalIntention, crystalState } from './devotion.ts';
import { displayBox, STAGE_ASPECT } from './geometry.ts';
import { layerOf } from './layers.ts';
import { appStateOf, isCandle, logAppEvent, readLivingState, writeLivingState } from './livingState.ts';
import type { SavedObject } from './types.ts';

type Rec = Record<string, unknown>;
const DAY = 86_400_000;
const HOUR = 3_600_000;
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const time = (v: unknown) => (typeof v === 'string' && v ? Date.parse(v) : NaN);
const list = (v: unknown): Rec[] => (Array.isArray(v) ? (v as Rec[]) : []);
const r3 = (n: number) => Math.round(n * 1000) / 1000;
const nameOf = (o: SavedObject, fallback = 'The stone') => str(o.label) || fallback;
const where = (o: SavedObject) => `${o.crystal ?? ''} ${o.label ?? ''} ${o.imagePath ?? ''} ${o.tool ?? ''}`.toLowerCase();

// ── Selenite, and stones touching ────────────────────────────────────────

/** A piece of selenite (a point, cluster, tower, slab or plate; a selenite wand or athame counts too). */
export const isSelenite = (o: SavedObject | null | undefined) => !!o && !isCandle(o) && /selenite|satin.?spar/.test(where(o));

/** The object's box on the stage, in fractions of the stage's width and height. */
function rectOf(o: SavedObject) {
  const b = displayBox(o);
  const w = b.size;
  const h = b.size * b.aspect * STAGE_ASPECT;
  return { left: b.cx - w / 2, right: b.cx + w / 2, top: b.cy - h / 2, bottom: b.cy + h / 2 };
}

/** Whether two things on the altar overlap or touch. */
export function touching(a: SavedObject, b: SavedObject): boolean {
  const p = rectOf(a);
  const q = rectOf(b);
  return p.left <= q.right && q.left <= p.right && p.top <= q.bottom && q.top <= p.bottom;
}

/** The selenite on the altar other than the stone itself, and which of it the stone touches. */
export function seleniteFor(stone: SavedObject, objects: SavedObject[]): { on: SavedObject[]; touching: SavedObject[] } {
  const on = objects.filter((o) => o !== stone && (!stone.altarObjectId || o.altarObjectId !== stone.altarObjectId) && isSelenite(o));
  return { on, touching: on.filter((o) => touching(stone, o)) };
}

/** A selenite cluster from the cabinet, set down under the stone so it rests on it. */
export function seleniteUnder(stone: SavedObject, objects: SavedObject[], now: string): SavedObject | null {
  const item = builtInCabinet.find((i) => i.name.toLowerCase() === 'selenite');
  const form = item?.forms.find((f) => f.form === 'cluster') ?? item?.forms[0];
  if (!item || !form) return null;
  const b = displayBox(stone);
  const center = { cx: b.cx, cy: Math.min(0.95, b.cy + b.size * b.aspect * STAGE_ASPECT * 0.25) };
  const placed = objectFromForm(item, form, objects, now, {}, center);
  return { ...placed, zIndex: String(layerOf(stone) - 1) };
}

// ── Day and night ────────────────────────────────────────────────────────

/** Night: between sunset and sunrise where you are; without a place, 18:00 to 06:00 by the clock. */
export function isNight(now: Date, place: Place | null | undefined): boolean {
  if (place) return !sunIsUp(now, place);
  const h = now.getHours();
  return h >= 18 || h < 6;
}

/** When night (or day) next begins: your sunset or sunrise, else 18:00 or 06:00. */
export function nextTurn(now: Date, place: Place | null | undefined, toNight: boolean): Date {
  if (place) {
    const step = 5 * 60_000;
    for (let t = now.getTime() + step, end = now.getTime() + 36 * HOUR; t <= end; t += step) {
      if (isNight(new Date(t), place) === toNight) return new Date(t);
    }
    // Near the poles the sun may not turn at all; fall back to the clock.
  }
  const at = new Date(now);
  at.setHours(toNight ? 18 : 6, 0, 0, 0);
  if (at.getTime() <= now.getTime()) at.setDate(at.getDate() + 1);
  return at;
}

const pad = (n: number) => String(n).padStart(2, '0');
/** "at 18:42", or "tomorrow at 06:10". */
export function whenWords(at: Date, now: Date): string {
  const clock = `${pad(at.getHours())}:${pad(at.getMinutes())}`;
  return at.toDateString() === now.toDateString() ? `at ${clock}` : `tomorrow at ${clock}`;
}

/** How lit the moon is, 0 to 1, and whether that's near full. */
export function moonlight(now: Date): { lit: number; nearFull: boolean } {
  const m = moonState(now);
  return { lit: r3(m.illumination), nearFull: m.illumination >= 0.9 };
}

/** Moonlight's charge: half strength under a dark moon, full at the full moon. */
export const moonChargeStrength = (lit: number) => r3(0.5 + 0.5 * Math.max(0, Math.min(1, lit)));

/** Whether a stone fades (or is harmed) in strong sun (craft/crystal/care.ts). */
export function fadesInSun(o: SavedObject): boolean {
  const care = findCare(str(o.crystal).replace(/-/g, '_'), str(o.label) || str(o.crystal).replace(/[-_]/g, ' '));
  return !!care && care.sun !== 'ok';
}

// ── May it charge this way now? ──────────────────────────────────────────

export type ChargeHow = 'moon' | 'sun' | 'selenite';
export type ChargeGate = {
  ok: boolean;
  /** Why not, or a word about it. */
  line: string;
  /** No selenite on the altar: offer to set a piece down from the cabinet. */
  offerSelenite?: boolean;
  /** Moonlight's strength now (0.5 to 1), for the moon. */
  strength?: number;
  /** A word of caution for a stone that fades in the sun. */
  warn?: string;
};

export function chargeGate(stone: SavedObject, how: ChargeHow, objects: SavedObject[], now: Date, place: Place | null | undefined): ChargeGate {
  const name = nameOf(stone);
  if (how === 'selenite') {
    const s = seleniteFor(stone, objects);
    if (!s.on.length) return { ok: false, offerSelenite: true, line: 'There’s no selenite on the altar. Place a piece from the cabinet and rest the stone on it.' };
    if (!s.touching.length) return { ok: false, line: `Rest ${name.toLowerCase()} on the selenite first: they need to touch.` };
    return { ok: true, line: `${name} rests on the selenite.` };
  }
  const night = isNight(now, place);
  const fallback = place ? '' : ' (no place is set, so this goes by the clock: 18:00 to 06:00)';
  if (how === 'moon') {
    if (!night) return { ok: false, line: `It’s daylight. Moonlight returns at sunset, ${whenWords(nextTurn(now, place, true), now)}${fallback}.` };
    const m = moonlight(now);
    const pct = Math.round(m.lit * 100);
    return {
      ok: true,
      strength: moonChargeStrength(m.lit),
      line: m.nearFull ? `The moon is ${pct}% lit, near full: a strong charge.` : `The moon is ${pct}% lit; the charge grows stronger toward the full moon.`,
    };
  }
  if (night) return { ok: false, line: `The sun is down. Daylight returns at sunrise, ${whenWords(nextTurn(now, place, false), now)}${fallback}.` };
  return fadesInSun(stone)
    ? { ok: true, line: 'In daylight.', warn: `${name} can fade or suffer in strong sun. Keep it brief, or charge it under the moon or on selenite instead.` }
    : { ok: true, line: 'In daylight.' };
}

// ── Intention ────────────────────────────────────────────────────────────

/** Give the stone an intention (or change it); kept in its history. */
export function setStoneIntention(o: SavedObject, text: string, now: string): SavedObject {
  const clean = text.replace(/\s+/g, ' ').trim().slice(0, 160);
  if (!clean) return o;
  const state = readLivingState(o, now);
  const crystal = { ...((state.crystal as Rec) ?? {}), intention: { text: clean, setAt: now } } as Rec;
  crystal.wearHistory = [...list(crystal.wearHistory), { at: now, kind: 'intention', text: `Given an intention: ${clean}.` }].slice(-40);
  return writeLivingState(o, { ...state, lastUsedAt: now, crystal }, now);
}

/** How a charge is kept: renewing the stone's intention, or a general charge. */
export function chargeCare(o: SavedObject, method: string, label: string, now: string, strength?: number) {
  const intention = crystalIntention(o, now);
  const moon = strength != null ? ` under a moon ${Math.round(((strength - 0.5) / 0.5) * 100)}% lit` : '';
  return intention
    ? { decision: 'Continue with existing intentions', purpose: 'Strengthen current intention', methods: [method], supports: [], notes: `Charged ${label}${moon} on the altar, renewing its intention: ${intention}.`, occurredAt: now }
    : { decision: 'General energetic charge', purpose: 'General recharge', methods: [method], supports: [], notes: `A general charge ${label}${moon} on the altar.`, occurredAt: now };
}

/** What the charge will do, for the panel. */
export function chargeIntentionLine(o: SavedObject, now: string): string {
  const intention = crystalIntention(o, now);
  return intention ? `Charging renews its intention: ${intention}.` : 'No intention yet, so this is a general charge. You can add one at any time.';
}

// ── Crystal wear ─────────────────────────────────────────────────────────

export type WearMode = 'off' | 'gentle' | 'realistic';
export const WEAR_SETTING = 'crystal_wear';
export const WEAR_MODES: { value: WearMode; label: string; detail: string }[] = [
  { value: 'off', label: 'Off', detail: 'Stones never wear.' },
  { value: 'gentle', label: 'Gentle', detail: 'Wear shows over months.' },
  { value: 'realistic', label: 'Realistic', detail: 'Wear shows over weeks.' },
];
export const wearModeOf = (raw: unknown): WearMode => (raw === 'off' || raw === 'realistic' ? raw : 'gentle');

/** Days on the altar, uncleansed and at rest, for time alone to reach the end of its strain (a crack). */
export const WEAR_DAYS: Record<Exclude<WearMode, 'off'>, number> = { gentle: 180, realistic: 42 };
/** Time alone stops here: a hairline crack, never broken. */
export const TIME_CAP = 0.9;
/** The jump when something came at you; the most worn stone takes half as much again. */
export const BLOW: Record<Exclude<WearMode, 'off'>, number> = { gentle: 0.25, realistic: 0.5 };
/** What's left of a blow's strain after each cleansing since it. */
export const AFTER_CLEANSE = 0.2;

export type WearStage = 'whole' | 'dull' | 'clouded' | 'cracked' | 'broken';
export const STAGE_AT: [WearStage, number][] = [
  ['broken', 1],
  ['cracked', 0.75],
  ['clouded', 0.5],
  ['dull', 0.25],
];
export const stageOf = (strain: number): WearStage => STAGE_AT.find(([, at]) => strain >= at)?.[0] ?? 'whole';

export const PROTECTIVE = /protect|ward|shield|banish|uncross|guard|boundar|hex|curse|defen|safety|safe\b|repel|evil eye/i;
/** Stones people commonly set to protective work, for a blow when none has been given it. */
const GUARD_STONES = /black.?tourmaline|obsidian|jet\b|onyx|smoky.?quartz|hematite|black.?kyanite|shungite|tiger.?s?.?eye/i;

/** What else on the altar puts a stone to work. */
export type WearContext = {
  /** The altar's intention. */
  altarIntention?: { text: string; setAt?: string } | null;
  /** Spells over days on this altar (altar.spells). */
  spells?: { objectUid?: string; title?: string; intention?: string; startedAt?: string; closedAt?: string }[];
};

type WearState = { blows: { at: string; amount: number }[]; brokenAt: string; kept: '' | 'pieces' | 'chips' };

function wearState(o: SavedObject): WearState {
  const raw = ((crystalState(o, '').wear ?? {}) as Rec) || {};
  return {
    blows: list(raw.blows)
      .filter((b) => typeof b.at === 'string' && Number.isFinite(Number(b.amount)))
      .map((b) => ({ at: String(b.at), amount: Number(b.amount) })),
    brokenAt: str(raw.brokenAt),
    kept: raw.kept === 'pieces' || raw.kept === 'chips' ? raw.kept : '',
  };
}

/** Every cleansing the stone has had, in ms. */
function cleansings(o: SavedObject): number[] {
  const c = crystalState(o, '');
  const app = appStateOf(o).cleanse as Rec | undefined;
  return [...new Set([time(c.lastCleansedAt), time(app?.at), ...list(c.cleansingHistory).map((r) => time(r.occurredAt))].filter(Number.isFinite))];
}

/** Whether a stone is doing protective work: its own intention, a protective spell it's held in, or the altar's intention. */
export function onGuard(o: SavedObject, ctx: WearContext = {}): boolean {
  if (PROTECTIVE.test(crystalIntention(o, ''))) return true;
  const uid = String(o.altarObjectId || '');
  if (uid && (ctx.spells ?? []).some((s) => s.objectUid === uid && !s.closedAt && PROTECTIVE.test(`${s.title ?? ''} ${s.intention ?? ''}`))) return true;
  return PROTECTIVE.test(ctx.altarIntention?.text ?? '');
}

/** How much strain the stone carries now (0 whole, 1 broken), or null when wear is off or it isn't a crystal. */
export function strainOf(o: SavedObject, mode: WearMode, now: number, ctx: WearContext = {}): number | null {
  if (mode === 'off' || o.type !== 'crystal') return null;
  const w = wearState(o);
  if (w.brokenAt && w.kept !== 'chips') return 1;
  const cleansed = cleansings(o);
  const created = time(readLivingState(o, '').createdAt);
  const base = Math.max(...[...cleansed, created, time(w.brokenAt)].filter(Number.isFinite), -Infinity);
  const rate = 1 / WEAR_DAYS[mode] / DAY;
  const since = (from: number) => (Number.isFinite(from) ? Math.max(0, now - Math.max(from, base)) : 0);
  // At rest on the altar since its last cleansing.
  let timeStrain = Number.isFinite(base) ? since(base) * rate : 0;
  // Held in an open spell: as fast again; protective work: one and a half again.
  const uid = String(o.altarObjectId || '');
  for (const s of ctx.spells ?? []) {
    if (!uid || s.objectUid !== uid || s.closedAt) continue;
    timeStrain += since(time(s.startedAt)) * rate * (PROTECTIVE.test(`${s.title ?? ''} ${s.intention ?? ''}`) ? 2 : 1);
  }
  if (PROTECTIVE.test(crystalIntention(o, ''))) timeStrain += since(base) * rate * 1.5;
  else if (PROTECTIVE.test(ctx.altarIntention?.text ?? '')) timeStrain += since(time(ctx.altarIntention?.setAt) || base) * rate * 1.5;
  // Blows: whole since the last cleansing, a fifth kept through each cleansing after them.
  const blows = w.blows.reduce((sum, b) => {
    const at = time(b.at);
    const after = cleansed.filter((c) => c > at).length;
    return sum + b.amount * AFTER_CLEANSE ** after;
  }, 0);
  return r3(Math.max(0, Math.min(TIME_CAP, timeStrain) + blows));
}

export type Wear = { strain: number; stage: WearStage; broken: boolean; kept: WearState['kept']; guard: boolean };

export function wearOf(o: SavedObject, mode: WearMode, now: number, ctx: WearContext = {}): Wear | null {
  const strain = strainOf(o, mode, now, ctx);
  if (strain == null) return null;
  const w = wearState(o);
  const broken = !!w.brokenAt && w.kept !== 'chips';
  return { strain, stage: broken ? 'broken' : stageOf(Math.min(strain, 0.999)), broken, kept: w.kept, guard: onGuard(o, ctx) };
}

/** How it looks: a duller sheen, clouding (a milky haze), a hairline crack, broken through. */
export type WearLook = { tint: { sepia: number; saturate: number; brightness: number } | null; haze: number; crack: 0 | 1 | 2 };
export function wearLook(wear: Wear | null): WearLook | null {
  if (!wear || wear.stage === 'whole') return null;
  const s = Math.min(1, wear.strain);
  const tint = { sepia: r3(0.08 * s), saturate: r3(1 - 0.45 * s), brightness: r3(1 - 0.12 * s) };
  const haze = wear.stage === 'dull' ? 0 : r3(Math.min(0.32, 0.12 + 0.25 * (s - 0.5)));
  return { tint, haze, crack: wear.stage === 'broken' ? 2 : wear.stage === 'cracked' ? 1 : 0 };
}

/** The crack's path across a box `w` × `h`: a hairline, or a break right through (two lines). */
export function crackPaths(w: number, h: number, crack: 1 | 2): string[] {
  const p = (pts: [number, number][]) => `M ${pts.map(([x, y]) => `${r3(x * w)} ${r3(y * h)}`).join(' L ')}`;
  const hair = p([[0.38, 0.22], [0.47, 0.38], [0.43, 0.5], [0.55, 0.64], [0.52, 0.74]]);
  if (crack === 1) return [hair];
  return [p([[0.34, 0.14], [0.46, 0.34], [0.41, 0.5], [0.56, 0.66], [0.5, 0.86]]), p([[0.41, 0.5], [0.3, 0.6], [0.24, 0.66]])];
}

export const STAGE_WORDS: Record<WearStage, string> = {
  whole: 'Clear and bright',
  dull: 'Its sheen has dulled',
  clouded: 'Clouding',
  cracked: 'A hairline crack',
  broken: 'Broken',
};

export const HEAVILY_USED = 'Heavily used — it could do with a cleanse.';

/** The card's line about its wear, or '' while it's whole. */
export function wearLine(wear: Wear | null): string {
  if (!wear || wear.stage === 'whole') return '';
  if (wear.broken) return wear.kept === 'pieces' ? 'Broken, and kept in its pieces.' : 'It has broken.';
  if (wear.stage === 'dull') return 'Its sheen has dulled a little with use. A cleanse would freshen it.';
  return HEAVILY_USED;
}

/** The gentle moment when it breaks. */
const FORM_WORDS = /\s+(point|cluster|tumbled|tower|slab|sphere|raw|heart|palm stone|egg|wand|chips)$/i;
export const breakLine = (name: string) => `Your ${name.replace(FORM_WORDS, '').toLowerCase()} has cracked. Many say a stone breaks when it has given all it can.`;

export type BreakChoice = 'bury' | 'earth' | 'keep' | 'chips';
export const BREAK_CHOICES: { id: BreakChoice; label: string; line: string; removes: boolean }[] = [
  { id: 'bury', label: 'Thank it and bury it', line: 'was thanked and buried', removes: true },
  { id: 'earth', label: 'Return it to the earth', line: 'was returned to the earth', removes: true },
  { id: 'keep', label: 'Keep the pieces', line: 'is kept in its pieces', removes: false },
  { id: 'chips', label: 'Cleanse it and keep it as chips', line: 'was cleansed and kept as chips', removes: false },
];
export const breakChoice = (id: unknown) => BREAK_CHOICES.find((c) => c.id === id) ?? null;

/** Whether a broken stone is still waiting for you to choose what becomes of it. */
export const awaitingChoice = (o: SavedObject) => o.type === 'crystal' && !!wearState(o).brokenAt && !wearState(o).kept;

function writeWear(o: SavedObject, change: Partial<WearState>, event: { kind: string; text: string } | null, now: string): SavedObject {
  const state = readLivingState(o, now);
  const crystal = { ...((state.crystal as Rec) ?? {}) } as Rec;
  crystal.wear = { ...wearState(o), ...change };
  if (event) crystal.wearHistory = [...list(crystal.wearHistory), { at: now, ...event }].slice(-40);
  return writeLivingState(o, { ...state, crystal }, now);
}

/** A blow taken: strain added, and broken when it goes past what it can hold. */
export function takeBlow(o: SavedObject, amount: number, mode: WearMode, now: string, ctx: WearContext = {}, text = 'Took the brunt when something came at you.'): SavedObject {
  if (mode === 'off' || o.type !== 'crystal' || !(amount > 0)) return o;
  const w = wearState(o);
  if (w.brokenAt && w.kept !== 'chips') return o;
  const before = strainOf(o, mode, Date.parse(now), ctx) ?? 0;
  const breaks = before + amount >= 1;
  const blows = [...w.blows, { at: now, amount: r3(amount) }].slice(-20);
  const next = writeWear(o, { blows, ...(breaks ? { brokenAt: now, kept: '' } : {}) }, { kind: 'blow', text }, now);
  return breaks ? writeWear(next, {}, { kind: 'broke', text: 'Cracked through.' }, now) : next;
}

export type CameAt = { objects: SavedObject[]; hit: string[]; broke: string[]; line: string };

/**
 * "Something came at me": every stone on guard takes a blow scaled by the
 * setting (the most worn half as much again, so it may crack). Logged even
 * with wear off.
 */
export function somethingCameAtMe(objects: SavedObject[], mode: WearMode, now: string, ctx: WearContext = {}): CameAt {
  const t = Date.parse(now);
  const stones = objects.filter((o) => o.type === 'crystal' && !(wearState(o).brokenAt && wearState(o).kept !== 'chips'));
  let guards = stones.filter((o) => onGuard(o, ctx));
  if (!guards.length) guards = stones.filter((o) => GUARD_STONES.test(where(o)));
  if (mode === 'off' || !guards.length) {
    return { objects, hit: [], broke: [], line: guards.length ? 'Logged: something came at you. Crystal wear is off, so the stones carry no mark of it.' : 'Logged: something came at you. No stone on the altar is doing protective work, so none took it.' };
  }
  const worn = guards.reduce((a, b) => ((strainOf(b, mode, t, ctx) ?? 0) > (strainOf(a, mode, t, ctx) ?? 0) ? b : a));
  const hit: string[] = [];
  const broke: string[] = [];
  const next = objects.map((o) => {
    if (!guards.includes(o)) return o;
    const after = takeBlow(o, BLOW[mode] * (o === worn ? 1.5 : 1), mode, now, ctx);
    hit.push(nameOf(o));
    if (wearState(after).brokenAt && !wearState(o).brokenAt) broke.push(String(o.altarObjectId || nameOf(o)));
    return after;
  });
  const names = hit.length > 1 ? `${hit.slice(0, -1).join(', ')} and ${hit[hit.length - 1]}` : hit[0];
  return { objects: next, hit, broke, line: `Something came at you. ${names} took the brunt of it.` };
}

/** What becomes of a broken stone, as you chose. For bury and earth, the caller takes it off the altar after. */
export function chooseForBroken(o: SavedObject, choice: BreakChoice, now: string): SavedObject {
  const c = breakChoice(choice);
  if (!c || !wearState(o).brokenAt) return o;
  const name = nameOf(o);
  if (choice === 'keep') return writeWear(o, { kept: 'pieces' }, { kind: 'kept', text: 'Kept in its pieces.' }, now);
  if (choice === 'chips') {
    const cleansed = careForCrystal(o, 'cleanse', { decision: 'General energetic cleansing', purpose: 'After ritual use', methods: ['Intention'], supports: [], notes: 'Cleansed after it broke, to keep as chips.', occurredAt: now }, now);
    const item = builtInCabinet.find((i) => i.forms.some((f) => f.crystal && f.crystal === o.crystal && f.form === 'chips'));
    const chips = item?.forms.find((f) => f.crystal === o.crystal && f.form === 'chips');
    const base = name.replace(FORM_WORDS, '');
    const renamed: SavedObject = { ...cleansed, label: /chips$/i.test(base) ? base : `${base} Chips`, ...(item && chips ? { imagePath: formImage(item, chips), form: 'chips' } : {}) };
    return writeWear(renamed, { blows: [], kept: 'chips' }, { kind: 'chips', text: 'Cleansed and kept as chips.' }, now);
  }
  return logAppEvent(writeWear(o, {}, { kind: choice, text: `${name} ${c.line}.` }, now), { kind: 'wear', text: `${name} ${c.line}.` }, now);
}

/** The stone's wear in its history: blows, breaking, what became of it, intentions given. */
export function wearHistory(o: SavedObject): { at: string; text: string }[] {
  return list(crystalState(o, '').wearHistory).map((r) => ({ at: str(r.at), text: str(r.text) })).filter((r) => r.at && r.text);
}
