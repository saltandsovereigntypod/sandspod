// Bath mixes: what to do with the water afterwards, what you already have on
// My Shelves, which mixes use a Library herb or stone, a mix of your own built
// from the Library's correspondences, the log kept in the one Journal, the
// rhythms in To tend, and the bath that goes with a moon or sabbat kit. Pure.

import { anyIntent, type TimingIntent } from '../cosmic/timing.ts';
import { suggestDays, suggestMaterials, suggestMoons } from '../../rituals/spellcraft/suggest.ts';
import { dayOf, type TimelineItem } from '../../journal/timeline.ts';
import { isLow, markLow, matchIngredients, matchesNeed, newItem, shelfFor, type ShelfEntry, type ShelfItem } from '../../shelves/model.ts';
import { newOwnRecord, type Rhythm, type TendRecord } from '../../tend/model.ts';
import { BATH_MIXES, type BathMethod, type BathMix } from './mixes.ts';
import { bathSafety, isEssentialOil, type BathIngredient, type BathKind } from './safety.ts';

export const BATH_LOG = 'bath.log';
export const BATH_OWN = 'bath.mixes';
export const BATH_HOME = '/rituals/craft/bath';

export const mixHref = (id: string) => `${BATH_HOME}/mix?id=${encodeURIComponent(id)}`;

export const METHODS: { value: BathMethod; label: string; line: string; steps: string[] }[] = [
  { value: 'sachet', label: 'Sachet', line: 'Herbs in a muslin bag or tied cloth, hung in the water: the tidiest.', steps: ['Put the dry herbs and flowers in a muslin bag, a clean sock or a square of cotton tied with string.', 'Hang it from the tap so the warm water runs through it, then let it float.', 'Squeeze it now and then to release the scent.'] },
  { value: 'infusion', label: 'Tea or infusion', line: 'Herbs steeped like a big pot of tea, then strained into the bath: the strongest, and the cleanest.', steps: ['Put the herbs in a heatproof pot or jug and pour over about a litre of just-boiled water. Cover it.', 'Steep for 15 to 20 minutes, then strain through a fine sieve or cloth into the bath.', 'Run the bath around it and stir.'] },
  { value: 'loose', label: 'Loose in the water', line: 'Petals and herbs scattered in: beautiful, but they need clearing from the drain.', steps: ['Scatter petals and herbs onto the water once it is run.', 'Lay a strainer over the plug-hole.', 'Lift the herbs out with a sieve before you let the water go.'] },
  { value: 'salts', label: 'Bath salts', line: 'Salts blended with the herbs and oils beforehand, kept in a jar.', steps: ['Mix the salts with any dried herbs in a bowl. Stir any essential oil into a spoonful of carrier oil first, then through the salts.', 'Keep in a dry jar, and use a few spoonfuls to a bath.', 'Run the bath and stir the salts in.'] },
];

export const methodOf = (m: string) => METHODS.find((x) => x.value === m) ?? METHODS[0];

export const GROUPS: { value: BathMix['group'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'everyday', label: 'Everyday' },
  { value: 'moon', label: 'Moon' },
  { value: 'season', label: 'Seasons' },
  { value: 'gentle', label: 'Gentle' },
];

// ── The water and the herbs afterwards ───────────────────────────────────

const has = (m: Pick<BathMix, 'ingredients'>, kind: BathKind) => m.ingredients.some((i) => i.kind === kind);

/** Only plants and honey: nothing in it that would harm soil or a stream. */
export const earthSafe = (m: Pick<BathMix, 'ingredients'>): boolean =>
  m.ingredients.every((i) => ['herb', 'flower', 'other', 'crystal', 'carrier'].includes(i.kind) && !/\b(milk|cream|oil|salt|vinegar)\b/i.test(i.name) && !(i.kind === 'carrier' && !/honey/i.test(i.name)));

/** What to do with the water, the herbs and the stones, from what is in it, then anything particular to the mix. */
export function afterwards(m: Pick<BathMix, 'ingredients' | 'method' | 'after'>): string[] {
  const out: string[] = [];
  if (has(m, 'salt')) out.push('The water holds salt: let it go down the drain. Never pour it on soil, lawn or plants, which salt harms.');
  else if (earthSafe(m)) out.push('This is plain plant water, so if you have a garden you can pour it at the roots of a hedge, a tree or a shrub of your own, or at a crossroads of your own paths. Leave a public verge or someone else’s land alone.');
  else out.push('Let the water go down the drain, and rinse the tub.');
  if (has(m, 'herb') || has(m, 'flower')) {
    out.push(m.method === 'sachet' ? 'Empty the sachet onto the compost heap or into the garden bin, and wash the cloth.' : m.method === 'loose' ? 'Sieve the herbs and petals out before the water goes, and compost them. Loose herbs must never go down the drain: they clog it.' : 'Compost the strained herbs, or return them to the earth if the mix is natural. Keep them out of the drain.');
  }
  if (has(m, 'crystal')) out.push('Dry any stone you used, and cleanse it your usual way. Check Stone care first: some stones cannot take salt or water.');
  if (m.ingredients.some((i) => isEssentialOil(i) || /\b(oil|milk)\b/i.test(i.name))) out.push('Oil and milk make the tub slippery: rinse it with warm water before you step back in.');
  if (m.after.trim()) out.push(m.after.trim());
  return out;
}

// ── My Shelves ───────────────────────────────────────────────────────────

const shelfKindOf = (i: BathIngredient) => (i.kind === 'crystal' ? 'crystals' : i.kind === 'oil' ? 'oils' : i.kind === 'herb' || i.kind === 'flower' ? 'herbs' : shelfFor('', i.name));

/** The ingredients a mix needs from the shelves: everything not marked optional. */
export const requiredOf = (m: Pick<BathMix, 'ingredients'>): BathIngredient[] => m.ingredients.filter((i) => !i.optional);

export type ShelfMatch = { have: BathIngredient[]; need: BathIngredient[]; total: number; optionalHave: BathIngredient[] };

/** "You have X of Y": which required ingredients are on your shelves (something marked low counts as needed). */
export function shelfMatch(m: Pick<BathMix, 'ingredients'>, entries: ShelfEntry[]): ShelfMatch {
  const stocked = entries.filter((e) => !isLow(e.item));
  const needs = requiredOf(m);
  const r = matchIngredients(needs.map((n) => ({ name: n.name.replace(/\s*\(.*\)$/, ''), ref: n.ref ?? null })), stocked);
  const haveNames = new Set(r.have.map((h) => h.need.name));
  const split = needs.filter((n) => haveNames.has(n.name.replace(/\s*\(.*\)$/, '')));
  const optionalHave = m.ingredients.filter((i) => i.optional && stocked.some((e) => matchesNeed(e.item, { name: i.name, ref: i.ref ?? null })));
  return { have: split, need: needs.filter((n) => !split.includes(n)), total: needs.length, optionalHave };
}

/** What "Add what's missing" puts on the running-low list: new things marked low, skipping any already on it. */
export function missingToAdd(m: Pick<BathMix, 'ingredients'>, entries: ShelfEntry[]): ShelfItem[] {
  const { need } = shelfMatch(m, entries);
  const onList = entries.filter((e) => isLow(e.item));
  return need
    .filter((n) => !onList.some((e) => matchesNeed(e.item, { name: n.name, ref: n.ref ?? null })))
    .map((n) => markLow(newItem({ name: n.name.replace(/\s*\(.*\)$/, ''), shelf: shelfKindOf(n), ref: n.ref ?? '', notes: `For a bath mix: ${n.amount}.` })));
}

// ── The Library ──────────────────────────────────────────────────────────

/** The mixes that use a Library herb, stone or oil, by its page or its name. */
export function mixesUsing(entry: { name: string; ref?: string | null }, mixes: readonly BathMix[] = BATH_MIXES): BathMix[] {
  return mixes.filter((m) => m.ingredients.some((i) => matchesNeed({ name: entry.name, ref: entry.ref ?? '' }, { name: i.name.replace(/\s*\(.*\)$/, ''), ref: i.ref ?? null })));
}

// ── Moon and sabbat kits ─────────────────────────────────────────────────

/** The bath that goes with a kit's holy page ("moon-full", "wheel-samhain"). */
export function bathForKit(ref: string | null | undefined, mixes: readonly BathMix[] = BATH_MIXES): BathMix | null {
  const key = String(ref ?? '').replace(/^wheel_south-/, 'wheel-');
  return mixes.find((m) => m.kits?.includes(key)) ?? null;
}

/** The bath for an intention (the timing advisor's key), the first that matches. */
export const mixesForIntent = (key: string | null | undefined, mixes: readonly BathMix[] = BATH_MIXES): BathMix[] => {
  const k = anyIntent(key)?.key ?? key;
  return mixes.filter((m) => m.intent === k);
};

// ── Build your own ───────────────────────────────────────────────────────

/** Library herbs that make poor bath plants: resins and gums that will not dissolve, and the unpleasant or unsafe. */
const NOT_FOR_BATHS = new Set(['frankincense', 'myrrh', 'copal', 'dragons_blood', 'garlic', 'holly', 'mistletoe', 'wormwood', 'mandrake', 'belladonna', 'foxglove', 'yew', 'galangal', 'orris_root', 'saffron', 'oak', 'birch', 'willow', 'elder', 'rowan', 'cedar']);

export type BuildOptions = { child?: boolean; pregnant?: boolean; oilFree?: boolean };

const HERB_AMOUNT = '1 tbsp dried, or a small handful fresh';

export type Suggested = {
  intent: TimingIntent;
  salt: BathIngredient[];
  herbs: BathIngredient[];
  stones: BathIngredient[];
  candle: string | null;
  method: BathMethod;
};

/** Suggested ingredients for an intention, from the Library's correspondences, with amounts, and nothing the safety table would turn away. */
export function suggestBath(intentKey: string, opts: BuildOptions = {}): Suggested | null {
  const intent = anyIntent(intentKey);
  if (!intent) return null;
  const found = suggestMaterials(intent, { limits: { herb: 14, crystal: 6, candle: 2 } });
  const calm = ['peace', 'healing', 'endings'].includes(intent.key);
  const salt: BathIngredient[] = opts.child ? [] : [calm ? { name: 'Epsom salts', amount: '1 cup (about 250 g)', kind: 'salt' } : { name: 'Sea salt', amount: '1/2 cup (about 120 g)', kind: 'salt' }];
  const gentle = (i: BathIngredient) => {
    const notes = bathSafety([i]);
    if (notes.some((n) => n.level === 'avoid')) return false;
    if (opts.child && notes.length) return false;
    if (opts.pregnant && notes.some((n) => n.group === 'pregnancy' || n.group === 'oil')) return false;
    return true;
  };
  const herbs = found.herb
    .filter((h) => !NOT_FOR_BATHS.has(h.key) && !h.danger)
    .map<BathIngredient>((h) => ({ name: h.name, amount: HERB_AMOUNT, kind: 'herb', ref: h.ref }))
    .filter(gentle)
    .slice(0, 6);
  const stones = opts.child ? [] : found.crystal.slice(0, 4).map<BathIngredient>((s) => ({ name: s.name, amount: 'one small stone', kind: 'crystal', ref: s.ref, optional: true }));
  return { intent, salt, herbs, stones, candle: found.candle[0] ? found.candle[0].name.replace(/\s*candles?$/i, '') : null, method: 'sachet' };
}

export type OwnInput = { id: string; title: string; intent: string; ingredients: BathIngredient[]; method: BathMethod; words: string; minutes: number; candle?: string; notes?: string };

/** A mix of your own, with timing from the intention's own advice. */
export function ownMix(input: OwnInput): BathMix {
  const intent = anyIntent(input.intent);
  const days = intent ? suggestDays(intent).map((d) => d.day) : [];
  const moons = intent ? suggestMoons(intent).map((m) => m.label) : [];
  return {
    id: input.id,
    title: input.title.trim() || `${intent?.label ?? 'My'} bath`,
    intent: intent?.key ?? input.intent,
    intention: intent?.label ? `A bath for ${intent.label.toLowerCase()}, in your own mix.` : 'A bath in your own mix.',
    group: 'everyday',
    ingredients: input.ingredients,
    method: input.method,
    prep: input.notes?.trim() || methodOf(input.method).line,
    when: { moon: moons.length ? moons.join(' or ') : 'Any', day: days.length ? days.slice(0, 2).join(' or ') : 'Any', hour: 'Use Find a good time for the hours' },
    words: input.words.trim() || 'I bathe to be clear and to be kind to myself.',
    after: '',
    minutes: Math.min(120, Math.max(5, Math.round(input.minutes) || 20)),
    ...(input.candle ? { candle: input.candle } : {}),
    own: true,
  };
}

const METHOD_VALUES = METHODS.map((m) => m.value);
const str = (v: unknown, max = 600) => (typeof v === 'string' ? v.slice(0, max) : '');
const KINDS: BathKind[] = ['salt', 'herb', 'flower', 'oil', 'carrier', 'crystal', 'other'];

/** A saved mix of your own from any shape, or null if it holds nothing usable. */
export function normalizeMix(raw: unknown, id: string): BathMix | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<BathMix>;
  const ingredients = (Array.isArray(r.ingredients) ? r.ingredients : [])
    .filter((i): i is BathIngredient => !!i && typeof i.name === 'string' && !!i.name.trim())
    .map((i) => ({ name: i.name.slice(0, 80), amount: str(i.amount, 80), kind: KINDS.includes(i.kind) ? i.kind : ('other' as BathKind), ...(i.ref ? { ref: str(i.ref, 120) } : {}), ...(i.optional ? { optional: true } : {}) }))
    .slice(0, 30);
  if (!ingredients.length) return null;
  return {
    id,
    title: str(r.title, 80) || 'My bath mix',
    intent: str(r.intent, 30),
    intention: str(r.intention, 300),
    group: 'everyday',
    ingredients,
    method: METHOD_VALUES.includes(r.method as BathMethod) ? (r.method as BathMethod) : 'sachet',
    prep: str(r.prep, 800),
    when: { moon: str(r.when?.moon, 200), day: str(r.when?.day, 200), hour: str(r.when?.hour, 200) },
    words: str(r.words, 600),
    after: str(r.after, 600),
    minutes: Math.min(120, Math.max(5, Math.round(Number(r.minutes)) || 20)),
    ...(r.candle ? { candle: str(r.candle, 40) } : {}),
    own: true,
  };
}

// ── The log and the Journal ──────────────────────────────────────────────

export const FEELINGS = ['Calmer', 'Lighter', 'Clearer', 'Warmer', 'Sleepy', 'Tearful', 'Restless', 'Hopeful', 'Much the same'];

export type BathLog = { mixId: string; title: string; at: string; date: string; felt: string[]; noticed: string; minutes?: number };

export function normalizeLog(raw: unknown): BathLog {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<BathLog>;
  const at = typeof r.at === 'string' && !Number.isNaN(Date.parse(r.at)) ? r.at : '';
  return {
    mixId: str(r.mixId, 80),
    title: str(r.title, 100) || 'A bath',
    at,
    date: dayOf(r.date) || dayOf(at),
    felt: (Array.isArray(r.felt) ? r.felt : []).filter((f): f is string => typeof f === 'string').map((f) => f.slice(0, 40)).slice(0, 10),
    noticed: str(r.noticed, 2000),
    ...(Number(r.minutes) > 0 ? { minutes: Math.round(Number(r.minutes)) } : {}),
  };
}

/** A logged bath as a row in the one Journal. */
export function logTimelineItem(entry: { id: string; data: unknown }): TimelineItem {
  const l = normalizeLog(entry.data);
  const first = l.noticed.trim().split(/\n/)[0].slice(0, 70);
  return {
    kind: 'bath',
    id: entry.id,
    date: l.date,
    at: l.at,
    title: l.title,
    detail: [l.felt.length ? l.felt.join(', ').toLowerCase() : null, first || null].filter(Boolean).join(' · '),
    href: `${BATH_HOME}/log?id=${encodeURIComponent(entry.id)}`,
  };
}

// ── To tend ──────────────────────────────────────────────────────────────

export const TEND_CHOICES: { label: string; rhythm: Rhythm }[] = [
  { label: 'Each new moon', rhythm: { kind: 'moon', moon: 'new' } },
  { label: 'Each full moon', rhythm: { kind: 'moon', moon: 'full' } },
  { label: 'Each dark moon', rhythm: { kind: 'moon', moon: 'dark' } },
  { label: 'Every week', rhythm: { kind: 'weekly' } },
  { label: 'Every two weeks', rhythm: { kind: 'every', every: 14 } },
];

export const tendKeyForMix = (id: string) => `own:bath-${id}`;

/** A bath rhythm in To tend: one per mix, as a "Spiritual bath" of your own that opens the mix. */
export function bathTendRecord(mix: Pick<BathMix, 'id' | 'title'>, rhythm: Rhythm, existing?: TendRecord | null): TendRecord {
  if (existing) return { ...existing, rhythm };
  const rec = newOwnRecord({ name: mix.title, type: 'bath', rhythm, notes: 'A rhythm for this bath mix.' }, `bath-${mix.id}`);
  return { ...rec, href: mixHref(mix.id) };
}
