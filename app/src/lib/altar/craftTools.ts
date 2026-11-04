// The altar's other working tools, round two: the pendulum (asked yes or no,
// its swings calibrated once and kept in your settings, each answer kept as a
// reading), the mortar and pestle (herbs and resins added, ground into a loose
// blend you can set on the altar, burn or bag, and keep as an Apothecary
// recipe), the bolline (a cord cut by hand; a sprig harvested and a candle
// carved go to the altar's own sheets), the cauldron (a simmer pot steaming
// for a few hours, or filled with water to scry in; a petition burned in it
// goes through the petition box), crystals charging under the moon, in the
// sun or on selenite (a glow that builds, then kept as a charge in the
// stone's own history, devotion.ts careForCrystal), the crystal grid
// (stones chosen and lit with the wand, kept with the altar beside the
// circle), and a tarot deck, rune bag or ogham staves drawn from where they
// sit. Everything done is kept in the altar's History by the editor. Pure,
// so it can be tested; shared with the website (js/core/altar.js craftTools).

import { chargeCare } from './crystalCare.ts';
import { careForCrystal } from './devotion.ts';
import { displayBox, STAGE_ASPECT } from './geometry.ts';
import { appStateOf, isCandle, logAppEvent, setAppState } from './livingState.ts';
import { normalizeApothecary, type ApothecaryItem, type Ingredient } from './apothecary.ts';
import { cordsOf, cordState, updateCord, type Cord } from './cord.ts';
import { setOffering } from './offerings.ts';
import type { AltarDocument } from './snapshot.ts';
import type { SavedObject } from './types.ts';
import { lookBackFrom, moonForReading, type Reading } from '../craft/hedge/readings.ts';
import { localDateKey } from '../rituals/lifecycle.ts';

type Extra = Record<string, unknown>;
type Pick2 = Pick<SavedObject, 'type' | 'tool' | 'vessel' | 'imagePath'> | null | undefined;
const where = (o: NonNullable<Pick2>) => `${o.tool ?? ''} ${o.vessel ?? ''} ${o.imagePath ?? ''}`;
const listOf = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0] ?? '');
const lower = (s: string) => s.trim().toLowerCase();

// ── The pendulum ────────────────────────────────────────────────────────

export const isPendulum = (o: Pick2) => !!o && o.type === 'tool' && /pendulum/.test(where(o));

export type Swing = 'to-and-fro' | 'side-to-side' | 'clockwise' | 'anticlockwise';
export const SWINGS: { id: Swing; label: string }[] = [
  { id: 'to-and-fro', label: 'Towards and away from you' },
  { id: 'side-to-side', label: 'Side to side' },
  { id: 'clockwise', label: 'In a circle, clockwise' },
  { id: 'anticlockwise', label: 'In a circle, anticlockwise' },
];
export const swingLabel = (id: Swing) => SWINGS.find((s) => s.id === id)?.label.toLowerCase() ?? id;

export type PendulumAnswer = 'yes' | 'no' | 'maybe';
export const ANSWERS: { id: PendulumAnswer; label: string }[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'maybe', label: 'Maybe, or not now' },
];
export type Calibration = Record<PendulumAnswer, Swing>;

/** Where the calibration is kept: your settings, so the app and the website share it. */
export const PENDULUM_SETTING = 'pendulum_calibration';

/** A common way to begin: yes to and fro, no side to side, maybe in a circle. */
export const USUAL_CALIBRATION: Calibration = { yes: 'to-and-fro', no: 'side-to-side', maybe: 'clockwise' };

export const PENDULUM_NOTE =
  'Here on the screen the swing is chosen at random. A real pendulum moves with tiny movements of your own hand that you don’t notice making (the ideomotor effect), which is why many people use it to hear what they already sense. Take its answers as something to reflect on, not as a verdict.';

const isSwing = (v: unknown): v is Swing => SWINGS.some((s) => s.id === v);

/** A kept calibration, or null when there is none or it is out of shape (each answer its own swing). */
export function readCalibration(raw: unknown): Calibration | null {
  let value = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  const r = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  if (!r || !isSwing(r.yes) || !isSwing(r.no) || !isSwing(r.maybe)) return null;
  if (new Set([r.yes, r.no, r.maybe]).size < 3) return null;
  return { yes: r.yes, no: r.no, maybe: r.maybe };
}

/** As kept in settings (a string, as every setting is). */
export const encodeCalibration = (c: Calibration) => JSON.stringify({ yes: c.yes, no: c.no, maybe: c.maybe });

/** Why a calibration can't be kept yet, or null. */
export function calibrationProblem(c: Partial<Calibration>): string | null {
  if (!c.yes || !c.no || !c.maybe) return 'Choose a swing for yes, no and maybe.';
  if (new Set([c.yes, c.no, c.maybe]).size < 3) return 'Give each answer a swing of its own.';
  return null;
}

/** The pendulum's answer: one of the three, and the swing it is shown by. */
export function askPendulum(cal: Calibration, random: () => number = Math.random): { answer: PendulumAnswer; swing: Swing } {
  const r = random();
  // Yes and no alike, maybe a little less often.
  const answer: PendulumAnswer = r < 0.4 ? 'yes' : r < 0.8 ? 'no' : 'maybe';
  return { answer, swing: cal[answer] };
}

export const answerLabel = (a: PendulumAnswer) => ANSWERS.find((x) => x.id === a)?.label ?? a;

/** The History line: `Asked the pendulum “Should I go?”: it swung side to side, no.` */
export function pendulumLine(question: string, answer: PendulumAnswer, swing: Swing): string {
  const q = question.trim();
  return `Asked the pendulum${q ? ` “${q}”` : ''}: it swung ${swingLabel(swing)}, ${answer === 'maybe' ? 'maybe' : answer}.`;
}

/** The answer as a reading in the reading log (hedge.readings), like any other draw. */
export function pendulumReading(question: string, answer: PendulumAnswer, swing: Swing, now: Date): Reading {
  const date = localDateKey(now);
  return {
    date,
    method: 'pendulum',
    question: question.trim(),
    drawn: [answerLabel(answer)],
    cameUp: `Pendulum · at the altar\nIt swung ${swingLabel(swing)}: ${answerLabel(answer)}`,
    interpretation: '',
    lookBack: lookBackFrom(date, 7),
    outcome: '',
    outcomeDate: '',
    moonPhase: moonForReading(date),
  };
}

/**
 * Where the bob is through one swing, `t` from 0 to 1, as offsets from rest
 * in the bob's own reach (-1 to 1). To and fro is seen end on, so it moves
 * a little up and down as it comes towards you and goes away.
 */
export function swingAt(swing: Swing, t: number): { x: number; y: number } {
  const a = t * Math.PI * 2;
  if (swing === 'side-to-side') return { x: Math.sin(a), y: 0.12 * (1 - Math.cos(2 * a)) / 2 };
  if (swing === 'to-and-fro') return { x: 0, y: 0.45 * Math.sin(a) };
  const dir = swing === 'clockwise' ? 1 : -1;
  return { x: Math.sin(dir * a), y: 0.4 * Math.cos(a) };
}

// ── The mortar and pestle ───────────────────────────────────────────────

export const isMortar = (o: Pick2) => !!o && o.type === 'tool' && /mortar/.test(where(o));

export type MortarItem = { label: string; herb?: string; type?: string; entityId?: string };
export type MortarState = { items: MortarItem[]; ground: boolean; groundAt?: string };
/** How long the grinding plays. */
export const GRIND_MS = 2400;
export const MORTAR_MAX = 12;

export function mortarOf(o: SavedObject): MortarState {
  const raw = appStateOf(o).mortar as Partial<MortarState> | undefined;
  const items = Array.isArray(raw?.items) ? raw!.items.filter((i): i is MortarItem => !!i && typeof i.label === 'string' && !!i.label.trim()) : [];
  return { items, ground: raw?.ground === true && items.length > 0, ...(typeof raw?.groundAt === 'string' ? { groundAt: raw.groundAt } : {}) };
}

/** Add something to the mortar (not twice); it isn't ground any more. */
export function addToMortar(o: SavedObject, item: MortarItem, now: string): SavedObject {
  const m = mortarOf(o);
  const label = item.label.trim();
  if (!label || m.items.length >= MORTAR_MAX || m.items.some((i) => lower(i.label) === lower(label))) return o;
  const clean: MortarItem = { label, ...(item.herb ? { herb: item.herb } : {}), ...(item.type ? { type: item.type } : {}), ...(item.entityId ? { entityId: item.entityId } : {}) };
  return logAppEvent(o, { kind: 'mortar', text: `Added ${lower(label)} to the mortar.` }, now, { mortar: { items: [...m.items, clean], ground: false } });
}

export function takeFromMortar(o: SavedObject, label: string, now: string): SavedObject {
  const m = mortarOf(o);
  const items = m.items.filter((i) => lower(i.label) !== lower(label));
  return items.length === m.items.length ? o : setAppState(o, { mortar: { items, ground: false } }, now);
}

/** The History line for a grinding. */
export const grindLine = (items: MortarItem[]) => (items.length ? `Ground ${listOf(items.map((i) => lower(i.label)))} in the mortar.` : '');

export function grindMortar(o: SavedObject, now: string): SavedObject {
  const m = mortarOf(o);
  if (!m.items.length) return o;
  return logAppEvent(o, { kind: 'mortar', text: grindLine(m.items) }, now, { mortar: { items: m.items, ground: true, groundAt: now } });
}

export const emptyMortar = (o: SavedObject, now: string) => setAppState(o, { mortar: { items: [], ground: false } }, now);

/** A name for the blend: "Rosemary and bay blend". */
export function blendName(items: MortarItem[]): string {
  const names = items.map((i) => i.label.trim()).filter(Boolean);
  if (!names.length) return 'Loose blend';
  const first = names.slice(0, 3).map((n, i) => (i ? lower(n) : n));
  return `${listOf(first)}${names.length > 3 ? ' and more' : ''} blend`;
}

export type BlendAs = 'loose' | 'sachet';

/** The blend as an apothecary item: a loose herb mix, or bagged as a sachet (apothecary.ts). */
export function blendItem(items: MortarItem[], as: BlendAs, name = '', intention = ''): ApothecaryItem {
  const ingredients: Ingredient[] = items.map((i) => ({ label: i.label, libraryName: i.label, type: i.type || 'herb', entityId: i.entityId || '', herb: i.herb || '', amount: '' }));
  return normalizeApothecary({
    name: name.trim() || blendName(items),
    type: as === 'sachet' ? 'sachet' : 'herb-mix',
    intention,
    notes: 'Ground in the mortar on the altar.',
    ingredients,
    details: as === 'sachet' ? { sachet_purpose: intention } : {},
  });
}

/** Herbs, resins and incense on the altar first, then the cabinet's herbs, without repeats. */
export function mortarChoices(objects: SavedObject[], cabinetHerbs: { name: string; id?: string }[]): MortarItem[] {
  const out: MortarItem[] = [];
  const seen = new Set<string>();
  const add = (i: MortarItem) => {
    const k = lower(i.label);
    if (!k || seen.has(k)) return;
    seen.add(k);
    out.push(i);
  };
  for (const o of objects) {
    if (o.type === 'herb' || o.type === 'incense') add({ label: String(o.label || o.herb || ''), herb: String(o.herb || ''), type: String(o.type), entityId: String(o.entityId || '') });
  }
  for (const h of cabinetHerbs) add({ label: h.name, type: 'herb', herb: lower(h.name).replace(/\s+/g, '-') });
  return out;
}

export const burnBlendLine = (items: MortarItem[]) => `Burned the ground ${listOf(items.map((i) => lower(i.label)))} as a loose incense.`;

// ── The bolline ─────────────────────────────────────────────────────────

export const isBolline = (o: Pick2) => !!o && o.type === 'tool' && /bolin|bollin|sickle/.test(where(o));

/** Cords still tied (or burning) that the bolline could cut. */
export function cuttableCords(doc: AltarDocument, now = Date.now()): Cord[] {
  return cordsOf(doc).filter((c) => cordState(doc, c, now).status !== 'cut');
}

/** Cut a cord by hand: kept as cut now, as if it had burned through, for the besom later. */
export function cutCord(doc: AltarDocument, id: string, now: string): AltarDocument {
  const cord = cordsOf(doc).find((c) => c.id === id);
  if (!cord || cordState(doc, cord, Date.parse(now)).status === 'cut') return doc;
  return updateCord(doc, id, { status: 'cut', cutAt: now, cutBy: 'bolline' });
}

export const cutLine = (a: string, b: string) => `Cut the cord between ${a} and ${b} with the bolline.`;

// ── The cauldron ────────────────────────────────────────────────────────

export const isCauldron = (o: Pick2) => !!o && /cauldron/.test(where(o));

export type Simmer = { since: string; items: string[] };
/** A simmer pot steams for about three hours before it wants topping up. */
export const SIMMER_MS = 3 * 3_600_000;

export function simmerOf(o: SavedObject): Simmer | null {
  const s = appStateOf(o).simmer as Partial<Simmer> | null | undefined;
  if (!s || typeof s.since !== 'string' || !Number.isFinite(Date.parse(s.since))) return null;
  return { since: s.since, items: Array.isArray(s.items) ? s.items.filter((i): i is string => typeof i === 'string') : [] };
}

/** How strongly it steams now, 0 to 1: rising for a minute, then steady, then gone dry. */
export function simmerSteam(o: SavedObject, now = Date.now()): number {
  const s = simmerOf(o);
  if (!s) return 0;
  const t = now - Date.parse(s.since);
  if (t < 0 || t >= SIMMER_MS) return 0;
  return Math.min(1, 0.25 + t / 60_000);
}
export const simmeredDry = (o: SavedObject, now = Date.now()) => {
  const s = simmerOf(o);
  return !!s && now - Date.parse(s.since) >= SIMMER_MS;
};

export function simmerLine(items: string[]): string {
  return items.length ? `Set a simmer pot going in the cauldron with ${listOf(items.map(lower))}.` : 'Set a simmer pot of water going in the cauldron.';
}

export function startSimmer(o: SavedObject, items: string[], now: string): SavedObject {
  const clean = [...new Set(items.map((i) => i.trim()).filter(Boolean))].slice(0, 8);
  return logAppEvent(o, { kind: 'cauldron', text: simmerLine(clean) }, now, { simmer: { since: now, items: clean } });
}

export function stopSimmer(o: SavedObject, now: string): SavedObject {
  if (!simmerOf(o)) return o;
  return logAppEvent(o, { kind: 'cauldron', text: 'Took the simmer pot off.' }, now, { simmer: null });
}

/** Fill it with water to scry in (kept as water, which ages like any offering). */
export function fillForScrying(o: SavedObject, now: string): SavedObject {
  const filled = setOffering(o, 'water', 'water', now);
  return filled === o ? o : logAppEvent(filled, { kind: 'cauldron', text: 'Filled the cauldron with water to scry in.' }, now);
}

/** Simmer pot ingredients people often reach for (a modern kitchen-witch habit). */
export const SIMMER_SUGGESTIONS = ['Orange peel', 'Cinnamon', 'Cloves', 'Rosemary', 'Bay', 'Apple', 'Star anise', 'Lavender', 'Lemon', 'Ginger'];

// ── Charging crystals by light ──────────────────────────────────────────

export type ChargePlace = 'moon' | 'sun' | 'selenite';
export const CHARGE_PLACES: { id: ChargePlace; label: string; method: string; hours: number; line: string }[] = [
  { id: 'moon', label: 'Under the moon', method: 'Moonlight', hours: 3, line: 'set under the moon' },
  { id: 'sun', label: 'In the sun', method: 'Sunlight', hours: 1, line: 'set in the sun' },
  { id: 'selenite', label: 'On selenite', method: 'Selenite', hours: 2, line: 'set on selenite' },
];
export const chargePlace = (id: unknown) => CHARGE_PLACES.find((p) => p.id === id) ?? null;

export const CHARGE_NOTE =
  'Charging by moonlight, sunlight or selenite is modern crystal practice; the times here are only a gentle guide. The moon charges between your sunset and sunrise, more strongly near the full moon; the sun in daylight; selenite when the stone rests on a piece of it. Some stones fade in strong sun (amethyst, rose quartz, fluorite and citrine among them), so the moon or selenite suits those better.';

export type Charging = { how: ChargePlace; since: string; /** Moonlight's strength when it was set out (crystalCare.ts moonChargeStrength). */ strength?: number };

export function chargingOf(o: SavedObject): Charging | null {
  const c = appStateOf(o).charging as Partial<Charging> | null | undefined;
  if (!c || !chargePlace(c.how) || typeof c.since !== 'string' || !Number.isFinite(Date.parse(c.since))) return null;
  return { how: c.how as ChargePlace, since: c.since, ...(typeof c.strength === 'number' ? { strength: c.strength } : {}) };
}

/** How far a charge has built, 0 to 1. */
export function chargingGlow(o: SavedObject, now = Date.now()): number {
  const c = chargingOf(o);
  if (!c) return 0;
  const ms = chargePlace(c.how)!.hours * 3_600_000;
  return Math.max(0, Math.min(1, (now - Date.parse(c.since)) / ms));
}

/** Set it to charge (check crystalCare.ts chargeGate first: the moon by night, the sun by day, selenite touching). */
export function startCharging(o: SavedObject, how: ChargePlace, now: string, strength?: number): SavedObject {
  const place = chargePlace(how);
  if (!place || o.type !== 'crystal') return o;
  return logAppEvent(o, { kind: 'charge', text: `${String(o.label || 'The crystal')} was ${place.line} to charge.` }, now, { charging: { how, since: now, ...(strength != null ? { strength } : {}) } });
}

/** Take it up: kept as a charge in the stone's own history (renewing its intention, or a general charge), the building glow cleared. */
export function finishCharging(o: SavedObject, now: string): SavedObject {
  const c = chargingOf(o);
  if (!c) return o;
  const place = chargePlace(c.how)!;
  const charged = careForCrystal(o, 'charge', chargeCare(o, place.method, place.label.toLowerCase(), now, c.how === 'moon' ? c.strength : undefined), now);
  return setAppState(charged, { charging: null }, now);
}

export const chargeLineFor = (name: string, how: ChargePlace) => `${name} was ${chargePlace(how)!.line} to charge.`;

// ── The crystal grid ────────────────────────────────────────────────────

/** A grid of stones lit with the wand, kept with the altar (`grid`), by the stones' ids. */
export type Grid = { ids: string[]; at: string; by?: string };
export const GRID_MIN = 3;

export function gridOf(extra: Extra | null | undefined): Grid | null {
  const g = extra?.grid as Partial<Grid> | null | undefined;
  if (!g || !Array.isArray(g.ids)) return null;
  const ids = g.ids.filter((i): i is string => typeof i === 'string' && !!i);
  return ids.length >= GRID_MIN ? { ids, at: String(g.at || ''), ...(g.by ? { by: String(g.by) } : {}) } : null;
}

/** Why these can't make a grid, or null. */
export function gridProblem(objects: SavedObject[]): string | null {
  const stones = objects.filter((o) => o.type === 'crystal');
  if (stones.length < GRID_MIN) return `Choose at least ${GRID_MIN} crystals for a grid.`;
  return null;
}

export function activateGrid(extra: Extra, objects: SavedObject[], now: string, by?: string): Extra {
  const ids = objects.filter((o) => o.type === 'crystal' && o.altarObjectId).map((o) => String(o.altarObjectId));
  if (ids.length < GRID_MIN) return extra;
  return { ...extra, grid: { ids, at: now, ...(by ? { by } : {}) } };
}

export function releaseGrid(extra: Extra): Extra {
  if (!('grid' in extra)) return extra;
  const { grid: _gone, ...rest } = extra;
  void _gone;
  return rest;
}

const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
export const gridLine = (n: number, wand: boolean) => `Activated a crystal grid of ${words[n] ?? n} stones${wand ? ' with the wand' : ''}.`;
export const GRID_RELEASED = 'Let the crystal grid rest.';

/**
 * The lines of light between the grid's stones, as stage fractions: round
 * the outside in order, and from the middle stone (the one nearest the
 * centre, with five or more) out to each of the others.
 */
export function gridLines(doc: Pick<AltarDocument, 'objects' | 'extra'>): { x1: number; y1: number; x2: number; y2: number }[] {
  const grid = gridOf(doc.extra);
  if (!grid) return [];
  const pts = grid.ids
    .map((id) => doc.objects.find((o) => o.altarObjectId === id))
    .filter((o): o is SavedObject => !!o)
    .map((o) => {
      const b = displayBox(o);
      return { x: b.cx, y: b.cy };
    });
  if (pts.length < 2) return [];
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  let ring = pts;
  let hub: { x: number; y: number } | null = null;
  if (pts.length >= 5) {
    const d = (p: { x: number; y: number }) => Math.hypot(p.x - cx, (p.y - cy) / STAGE_ASPECT);
    hub = pts.reduce((a, b) => (d(b) < d(a) ? b : a));
    ring = pts.filter((p) => p !== hub);
  }
  ring = [...ring].sort((a, b) => Math.atan2((a.y - cy) / STAGE_ASPECT, a.x - cx) - Math.atan2((b.y - cy) / STAGE_ASPECT, b.x - cx));
  const out = ring.map((p, i) => {
    const q = ring[(i + 1) % ring.length];
    return { x1: p.x, y1: p.y, x2: q.x, y2: q.y };
  });
  if (ring.length === 2) out.pop();
  if (hub) for (const p of ring) out.push({ x1: hub.x, y1: hub.y, x2: p.x, y2: p.y });
  return out.map((l) => ({ x1: r3(l.x1), y1: r3(l.y1), x2: r3(l.x2), y2: r3(l.y2) }));
}
const r3 = (n: number) => Math.round(n * 1000) / 1000;

export const isWand = (o: Pick2) => !!o && o.type === 'tool' && /wand/.test(where(o));

// ── Drawing from the deck where it sits ─────────────────────────────────

export type DeckKind = 'tarot' | 'runes' | 'ogham';
export function deckKindOf(o: Pick2): DeckKind | null {
  if (!o || o.type !== 'tool') return null;
  const w = where(o);
  if (/tarot-deck/.test(w)) return 'tarot';
  if (/rune-bag/.test(w)) return 'runes';
  if (/ogham/.test(w)) return 'ogham';
  return null;
}
/** The one-card spread each draws (divination/draw.ts SPREADS). */
export const DECK_SPREAD: Record<DeckKind, string> = { tarot: 'daily', runes: 'one-rune', ogham: 'one-stave' };
export const DRAW_LABEL: Record<DeckKind, string> = { tarot: 'Draw a card', runes: 'Draw a rune', ogham: 'Draw a stave' };
export const drawLine = (kind: DeckKind, name: string) => `Drew ${name} from the ${kind === 'tarot' ? 'tarot deck' : kind === 'runes' ? 'rune bag' : 'ogham staves'}.`;

/** Where a drawn card is laid: beside the deck, a little lower, moving along for each already laid there. */
export function drawSpot(deck: SavedObject, laid = 0): { cx: number; cy: number } {
  const b = displayBox(deck);
  const step = Math.max(0.06, b.size * 0.7);
  const cx = b.cx + (b.cx > 0.6 ? -1 : 1) * step * (1 + laid);
  return { cx: Math.min(0.95, Math.max(0.05, r3(cx))), cy: Math.min(0.92, r3(b.cy + 0.04)) };
}

// ── Ritual mode ─────────────────────────────────────────────────────────

/** How loud the altar's sounds are in ritual mode. */
export const RITUAL_SOFT = 0.45;
export const RITUAL_ON = 'Ritual mode: the room dims, the tools step back, and the sounds soften. Tap “Leave ritual mode” when you’re done.';

// ── Heard on a coven altar ──────────────────────────────────────────────

/** What another person's moment looks like here (toolRites.ts RiteWire kinds this file adds). */
export const CRAFT_HEARD: Record<'swing' | 'grind' | 'cauldron' | 'grid' | 'cut' | 'draw' | 'charge', { methods: string[]; line: string }> = {
  swing: { methods: ['Moon'], line: 'The pendulum swings.' },
  grind: { methods: ['Herbs'], line: 'Herbs are ground in the mortar.' },
  cauldron: { methods: ['Smoke'], line: 'The cauldron steams.' },
  grid: { methods: ['Moon'], line: 'The crystal grid is lit.' },
  cut: { methods: ['Salt'], line: 'A cord is cut.' },
  draw: { methods: ['Moon'], line: 'A card is drawn.' },
  charge: { methods: ['Moon'], line: 'A crystal is set to charge.' },
};

/** Whether the panel has anything for this object. */
export const hasCraftTools = (o: SavedObject | null | undefined) =>
  !!o && (isPendulum(o) || isMortar(o) || isBolline(o) || isCauldron(o) || o.type === 'crystal' || isWand(o) || !!deckKindOf(o) || /scrying-mirror|crystal-ball/.test(where(o))) && !isCandle(o);

/** A scrying mirror or crystal ball. */
export const isScryingGlass = (o: Pick2) => !!o && o.type === 'tool' && /scrying-mirror|crystal-ball/.test(where(o));
