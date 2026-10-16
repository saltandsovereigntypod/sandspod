// The premade rituals and spells, the practices they belong to, and how to
// begin one: as a guided ritual, a plan, or a copy in your own templates.
// "For you" weighs your practice and path, tonight's moon, the weekday and
// the holidays coming up. Pure, so it can be tested.

import { holidayChoice, holidaysBetween } from '../../holidays.ts';
import { TRADITIONAL_LIBRARY } from '../../library/traditionalData.ts';
import { myPath } from '../../library/traditions.ts';
import { myDeities } from '../../patron/mine.ts';
import { moonState } from '../../moon.ts';
import { tideOf } from '../planner.ts';
import { COSMIC } from './data/cosmic.ts';
import { FOLK } from './data/folk.ts';
import { GREEN } from './data/green.ts';
import { HEDGE } from './data/hedge.ts';
import { KITCHEN } from './data/kitchen.ts';
import { WICCA } from './data/wicca.ts';
import type { PracticeId, Premade, PremadeMoon } from './types.ts';

export type { PracticeId, Premade, PremadeIngredient, PremadeMoon, PremadeStep } from './types.ts';

export type Practice = { id: PracticeId; name: string; about: string };

export const PRACTICES: Practice[] = [
  { id: 'eclectic', name: 'Eclectic', about: 'Blends practices, folklore and beliefs from many cultures, paths and traditions rather than one set system.' },
  { id: 'green', name: 'Green', about: 'Nature, botanical work and gardening: herbs, plants and flowers in spellwork.' },
  { id: 'kitchen', name: 'Kitchen & hearth', about: 'Magic in the home: cooking, baking, cleaning and family care as intentional ritual.' },
  { id: 'hedge', name: 'Hedge', about: 'Liminal spaces, intuition, spirit work and journeying between this world and the veil.' },
  { id: 'solitary', name: 'Solitary', about: 'Rituals, spells and practice done alone rather than in a group or coven.' },
  { id: 'cosmic', name: 'Cosmic & celestial', about: 'Astrology, astronomy, star charts and planetary timing to time and power the work.' },
  { id: 'crystal', name: 'Crystal', about: 'Minerals, crystals and stones for energy work, healing and amplification.' },
  { id: 'elemental', name: 'Elemental', about: 'Earth, air, fire and water: all four in balance, or one element alone.' },
  { id: 'sea', name: 'Sea', about: 'Oceans, rivers and tides, sea weather, shells and salt water, and the moon’s pull on water.' },
  { id: 'folk', name: 'Traditional & folk', about: 'Historical lore, regional folklore, local spirits and old-ways customs rather than modern frameworks.' },
];

export const practiceName = (id: string) => PRACTICES.find((p) => p.id === id)?.name ?? id;

/** Every premade working, in a stable order. */
export const PREMADE: Premade[] = [...WICCA, ...GREEN, ...KITCHEN, ...HEDGE, ...COSMIC, ...FOLK];

const byId = new Map(PREMADE.map((p) => [p.id, p]));
export const premadeById = (id: string | null | undefined): Premade | null => (id ? byId.get(id) ?? null : null);

type SettingsLike = Record<string, unknown> | null | undefined;

/** Settings → My practice, saved as a comma list of practice ids. */
export function myPractices(settings: SettingsLike): PracticeId[] {
  const raw = typeof settings?.my_practice === 'string' ? settings.my_practice : '';
  const chosen = raw.split(',').map((id) => id.trim());
  return PRACTICES.map((p) => p.id).filter((id) => chosen.includes(id));
}

export const practicesValue = (ids: string[]) => PRACTICES.map((p) => p.id).filter((id) => ids.includes(id)).join(',');

/** The moon tonight in the words premade workings use. Dark is the last sliver before new. */
export function moonTonight(now: Date): PremadeMoon[] {
  const moon = moonState(now);
  const tide = tideOf(moon.name, moon.fraction);
  return moon.fraction > 0.93 && tide !== 'new' ? [tide, 'dark'] : [tide];
}

export type ForYouContext = {
  practices: string[];
  paths: string[];
  moon: PremadeMoon[];
  weekday: number;
  /** Holiday ids within the next fortnight, nearest first. */
  holidays: string[];
  /** The deities kept as patron or dedicated (names), and the words of their domains. */
  deities?: string[];
  domains?: string;
};

export function forYouContext(settings: SettingsLike, now: Date): ForYouContext {
  const soon = new Date(now.getTime() + 14 * 86_400_000);
  const holidays = holidaysBetween(now, soon, holidayChoice(settings)).map((h) => h.id);
  return {
    practices: myPractices(settings),
    paths: myPath(settings).traditions,
    moon: moonTonight(now),
    weekday: now.getDay(),
    holidays: [...new Set(holidays)],
    ...deityContext(settings),
  };
}

/** Patron and dedicated deities, and their Library domains, for weighting workings toward them. */
function deityContext(settings: SettingsLike): Pick<ForYouContext, 'deities' | 'domains'> {
  const close = myDeities(settings).filter((d) => d.level !== 'exploring');
  if (!close.length) return {};
  const deities = TRADITIONAL_LIBRARY as unknown as Record<string, Record<string, Record<string, unknown>>>;
  const domains = close.map((d) => (d.key ? String(deities.deity?.[d.key]?.Domains ?? '') : '')).join(' ').toLowerCase();
  return { deities: close.map((d) => d.name), domains };
}

/** Domain words that answer each intention. */
const INTENTION_WORDS: Record<string, string[]> = {
  protection: ['protect', 'guard', 'ward'],
  prosperity: ['prosper', 'abundan', 'wealth', 'harvest', 'fortune', 'luck'],
  love: ['love', 'beauty', 'desire', 'marriage'],
  healing: ['heal', 'health', 'medicine'],
  banishing: ['banish', 'death', 'ending', 'war'],
  intuition: ['magic', 'prophe', 'divination', 'dream', 'moon', 'mystery', 'wisdom'],
  courage: ['courage', 'strength', 'war', 'battle', 'thunder'],
  cleansing: ['purif', 'cleans', 'water'],
  beginnings: ['beginning', 'door', 'birth', 'dawn', 'spring'],
  study: ['wisdom', 'knowledge', 'writing', 'learning', 'craft'],
  peace: ['peace', 'hearth', 'home', 'family'],
};

/** How well a working suits someone tonight; 0 or less means not especially. */
export function fitScore(p: Premade, ctx: ForYouContext): number {
  let score = 0;
  const practiceHits = p.practices.filter((id) => ctx.practices.includes(id)).length;
  score += practiceHits ? 3 + practiceHits : 0;
  if (p.paths.length) score += p.paths.some((id) => ctx.paths.includes(id)) ? 4 : ctx.paths.length ? -2 : -1;
  if (p.moon?.some((m) => ctx.moon.includes(m))) score += 3;
  else if (p.moon?.length && !p.moon.includes('blue') && !p.moon.includes('eclipse')) score -= 1;
  if (p.weekday === ctx.weekday) score += 2;
  if (p.holidays?.length) {
    const at = p.holidays.map((h) => ctx.holidays.indexOf(h)).filter((i) => i >= 0);
    score += at.length ? 6 - Math.min(...at) : -4;
  }
  // Your patron's own workings, and workings in their domains.
  if (ctx.deities?.length) {
    const text = `${p.title} ${p.summary}`.toLowerCase();
    if (ctx.deities.some((name) => text.includes(name.toLowerCase()))) score += 5;
    const intents = [p.intention, ...(p.alsoFor ?? [])].filter(Boolean) as string[];
    if (ctx.domains && intents.some((i) => INTENTION_WORDS[i]?.some((w) => ctx.domains!.includes(w)))) score += 2;
  }
  // Blue moons and eclipses only when one is close; the app doesn't predict them.
  if (p.moon?.length && p.moon.every((m) => m === 'blue' || m === 'eclipse')) score -= 4;
  return score;
}

/** The best few for tonight. */
export function forYou(ctx: ForYouContext, list: Premade[] = PREMADE, count = 6): Premade[] {
  return list
    .map((p, index) => ({ p, index, score: fitScore(p, ctx) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, count)
    .map((x) => x.p);
}

export type PremadeFilter = {
  query?: string;
  practice?: string | null;
  intention?: string | null;
  kind?: 'ritual' | 'spell' | null;
  path?: string | null;
};

const fold = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function filterPremade(list: Premade[], filter: PremadeFilter): Premade[] {
  const words = fold(filter.query ?? '').split(/\s+/).filter(Boolean);
  return list.filter((p) => {
    if (filter.practice && !p.practices.includes(filter.practice as PracticeId)) return false;
    if (filter.intention && p.intention !== filter.intention && !p.alsoFor?.includes(filter.intention as never)) return false;
    if (filter.kind && p.kind !== filter.kind) return false;
    if (filter.path && !p.paths.includes(filter.path as never)) return false;
    if (!words.length) return true;
    const text = fold([p.title, p.summary, p.lore, ...p.ingredients.map((i) => i.name)].join(' '));
    return words.every((w) => text.includes(w));
  });
}

export { premadeDraft, premadeIngredients } from './draft.ts';
