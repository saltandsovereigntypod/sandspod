// What the Living Library suggests for a spell: herbs, stones and candle
// colours that suit its purpose (with their substitutes and warnings), the
// deities tied to it (and whether that tie is ancient or modern), the planet's
// day and the moon. Plus the safety notes for the whole spell, and which of
// the suggestions you already own. Pure: the Library comes in as data.

import { PLANET_GUIDES, type DeityLink } from '../../astro/planetGuides.ts';
import type { Classical } from '../../astro/signs.ts';
import { anyIntent, TIMING_INTENTS, type TimingIntent } from '../../craft/cosmic/timing.ts';
import { sourcingFor } from '../../library/closed/index.ts';
import { TRADITIONAL_LIBRARY } from '../../library/traditionalData.ts';
import type { TraditionalLibraryData, TraditionalRecord } from '../../library/types.ts';
import { DEITY_DEVOTIONS } from '../../patron/devotions.ts';
import { findNeed, type Pantry } from '../../altar/connect/ingredients.ts';
import { intentionByKey, type MoonTide } from '../planner.ts';
import type { Ingredient } from '../types.ts';
import { methodOf, type Hazard } from './methods.ts';
import type { SpellSpec } from './spec.ts';

// ── What it's for ─────────────────────────────────────────────────────────

/** The same intents as the spell timing advisor. */
export const SPELL_INTENTS: TimingIntent[] = TIMING_INTENTS;

/** Either kind of key: the advisor's ("money") or the planner's ("prosperity"). */
export const spellIntent = (key: string | null | undefined): TimingIntent | null => anyIntent(key);

/** Words looked for in the Library's uses and tags, beyond the advisor's festival words. */
const EXTRA_WORDS: Record<string, string[]> = {
  love: ['self-love', 'romance', 'attraction', 'heart'],
  money: ['money', 'success', 'opportunity'],
  protection: ['protection', 'warding', 'shielding', 'boundaries', 'defence'],
  banishing: ['banishing', 'uncrossing', 'breaking', 'release'],
  healing: ['healing', 'vitality', 'health', 'comfort', 'recovery'],
  cleansing: ['cleansing', 'purification', 'clearing'],
  divination: ['divination', 'psychic', 'intuition', 'dreams', 'dream work', 'visions'],
  communication: ['communication', 'clarity', 'study', 'learning', 'eloquence', 'focus', 'memory'],
  courage: ['courage', 'strength', 'confidence', 'determination', 'victory'],
  ancestors: ['ancestors', 'ancestor', 'the dead', 'remembrance', 'spirit', 'underworld', 'mourning', 'grief'],
  endings: ['release', 'endings', 'letting go', 'banishing', 'transformation'],
  beginnings: ['new beginnings', 'beginnings', 'growth', 'opportunity', 'creativity', 'renewal'],
  peace: ['peace', 'calm', 'sleep', 'rest', 'stress relief', 'balance', 'harmony'],
};

export function intentWords(intent: TimingIntent): string[] {
  const planner = intentionByKey(intent.plannerKey);
  return [...new Set([...(EXTRA_WORDS[intent.key] ?? []), ...(planner?.keywords ?? []), ...intent.words].map((w) => w.toLowerCase()))];
}

// ── Correspondences ───────────────────────────────────────────────────────

export type SuggestType = 'herb' | 'crystal' | 'candle';

export type Suggestion = Ingredient & {
  type: SuggestType;
  /** The Library entry's key, "basil". */
  key: string;
  uses: string;
  planet: string | null;
  element: string | null;
  /** Names to use instead, as the Library gives them. */
  substitutes: string[];
  /** The Library's own words of caution. */
  caution: string;
  /** Poisonous or not to be handled: never suggested, flagged if chosen. */
  danger: boolean;
  /** Its sourcing raises real concerns (Sourcing with care). */
  sourcing: string | null;
  /** Why it was suggested: "Uses: protection · Mars". */
  why: string;
};

const text = (r: TraditionalRecord, k: string): string => (typeof r[k] === 'string' ? (r[k] as string) : '');
const tagsOf = (r: TraditionalRecord): string[] => (Array.isArray(r.tags) ? (r.tags as string[]).map((t) => String(t).toLowerCase()) : []);
const splitNames = (s: string): string[] =>
  s
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean);

/** Warnings written in capitals ("DEADLY POISONOUS", "TOXIC", "DO NOT TAKE INTERNALLY") mark a dangerous plant. */
export const isDanger = (caution: string): boolean => /^(DEADLY POISONOUS|POISONOUS|TOXIC|DO NOT)/.test(caution.trim());

function records(library: TraditionalLibraryData, type: SuggestType): [string, TraditionalRecord][] {
  const group = (library[type] ?? {}) as Record<string, TraditionalRecord>;
  return Object.entries(group).filter(([key, r]) => !key.startsWith('_') && r && typeof r === 'object' && typeof r.DisplayName === 'string' && typeof r.Uses === 'string');
}

/** One Library entry as a suggestion. */
export function suggestionOf(type: SuggestType, key: string, r: TraditionalRecord): Suggestion {
  const caution = text(r, 'TraditionalWarnings');
  const ref = `traditional/${type}/${key}`;
  const substitutes = type === 'herb' ? splitNames(text(r, 'Substitutions')) : [];
  const note = sourcingFor(ref) ?? sourcingFor(text(r, 'DisplayName'));
  return {
    ref,
    name: text(r, 'DisplayName'),
    type,
    key,
    uses: text(r, 'Uses'),
    planet: text(r, 'Planet') || null,
    element: text(r, 'Element') || null,
    substitutes,
    caution,
    danger: isDanger(caution),
    sourcing: note ? `${note.concern} ${note.instead}`.trim() : null,
    why: '',
  };
}

/** A Library entry by ref ("traditional/herb/basil"), or null. */
export function libraryEntryOf(ref: string, library: TraditionalLibraryData = TRADITIONAL_LIBRARY): Suggestion | null {
  const [, type, key] = /^traditional\/(herb|crystal|candle)\/([\w.-]+)$/.exec(ref) ?? [];
  if (!type || !key) return null;
  const r = (library[type] as Record<string, TraditionalRecord> | undefined)?.[key.split('.')[0]];
  return r && typeof r === 'object' ? suggestionOf(type as SuggestType, key.split('.')[0], r) : null;
}

/** The Library entry with this name (any case), for substitutes named in words. */
export function libraryEntryByName(name: string, library: TraditionalLibraryData = TRADITIONAL_LIBRARY): Suggestion | null {
  const want = name.trim().toLowerCase().replace(/\s+candles?$/, '');
  for (const type of ['herb', 'crystal', 'candle'] as SuggestType[]) {
    for (const [key, r] of records(library, type)) {
      const n = text(r, 'DisplayName').toLowerCase();
      if (n === want || n.replace(/ candle$/, '') === want) return suggestionOf(type, key, r);
    }
  }
  return null;
}

const LIMITS: Record<SuggestType, number> = { herb: 6, crystal: 4, candle: 3 };

/** Herbs, stones and candle colours that suit the intent, best first. Dangerous plants are never suggested. */
export function suggestMaterials(
  intent: TimingIntent,
  options: { library?: TraditionalLibraryData; planet?: string | null; limits?: Partial<Record<SuggestType, number>> } = {},
): Record<SuggestType, Suggestion[]> {
  const library = options.library ?? TRADITIONAL_LIBRARY;
  const words = intentWords(intent);
  const planets = [options.planet, ...intent.planets].filter(Boolean) as string[];
  const out = { herb: [], crystal: [], candle: [] } as Record<SuggestType, Suggestion[]>;
  for (const type of Object.keys(out) as SuggestType[]) {
    out[type] = records(library, type)
      .map(([key, r]) => {
        const uses = text(r, 'Uses').toLowerCase();
        const tags = tagsOf(r);
        let score = 0;
        const hits: string[] = [];
        for (const w of words) {
          if (tags.includes(w)) score += 3;
          else if (uses.includes(w)) score += 2;
          else continue;
          hits.push(w);
        }
        if (score === 0) return null;
        const planet = text(r, 'Planet');
        const rank = planets.indexOf(planet);
        if (rank >= 0) score += rank === 0 ? 2 : 1;
        const s = suggestionOf(type, key, r);
        if (s.danger) return null;
        return { s: { ...s, why: [`For ${hits.slice(0, 2).join(', ')}`, rank >= 0 ? planet : ''].filter(Boolean).join(' · ') }, score };
      })
      .filter((x): x is { s: Suggestion; score: number } => !!x)
      .sort((a, b) => b.score - a.score || a.s.name.localeCompare(b.s.name))
      .slice(0, options.limits?.[type] ?? LIMITS[type])
      .map((x) => x.s);
  }
  return out;
}

/** Everything of one kind in the Library, A to Z, for choosing by hand. */
export function allMaterials(type: SuggestType, library: TraditionalLibraryData = TRADITIONAL_LIBRARY): Suggestion[] {
  return records(library, type)
    .map(([key, r]) => suggestionOf(type, key, r))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Common stand-ins, said as the modern customs they are. */
export const GENERAL_SUBSTITUTES: Record<SuggestType, string> = {
  herb: 'The Library names substitutes for most herbs; tap a chosen herb to see them.',
  crystal: 'Clear quartz is widely used in place of any stone, a modern custom.',
  candle: 'A white candle is widely used in place of any colour, a modern custom.',
};

/** The substitutes for one chosen thing, as Library entries where the Library has them. */
export function substitutesFor(ref: string, library: TraditionalLibraryData = TRADITIONAL_LIBRARY): { name: string; ref: string | null }[] {
  const entry = libraryEntryOf(ref, library);
  if (!entry) return [];
  let names = entry.substitutes;
  if (entry.type === 'candle') {
    const alt = text(((library.candle ?? {}) as Record<string, TraditionalRecord>)[entry.key] ?? {}, 'AlternativeColors');
    names = [...alt.matchAll(/\b([A-Z][a-z]+) can substitute/g)].map((m) => `${m[1]} Candle`);
    if (!names.includes('White Candle') && entry.key !== 'white') names.push('White Candle');
  }
  if (entry.type === 'crystal' && entry.key !== 'clear_quartz') names = ['Clear Quartz'];
  return names.map((name) => {
    const found = libraryEntryByName(name, library);
    return { name: found?.name ?? name, ref: found && !found.danger ? found.ref : null };
  });
}

// ── Deities ───────────────────────────────────────────────────────────────

export type DeitySuggestion = {
  /** Living Library deity key, when the Library has them. */
  key: string | null;
  name: string;
  tradition: string;
  /** Why they're suggested, in a line. */
  note: string;
  /** How the tie to this work's planet came about, if it comes through a planet. */
  link: DeityLink | null;
  planet: string | null;
  /** Their sacred days that suit timing, each marked ancient, later or modern. */
  days: { name: string; basis: 'ancient' | 'later' | 'modern' }[];
  /** How the Library says to approach them with respect. */
  respect: string;
};

function deityKeyByName(library: TraditionalLibraryData, name: string): string | null {
  const want = name.trim().toLowerCase();
  for (const [key, r] of Object.entries((library.deity ?? {}) as Record<string, TraditionalRecord>)) {
    if (key === want || text(r, 'DisplayName').toLowerCase() === want) return key;
  }
  return null;
}

/** A Library deity as a suggestion. */
export function deityOf(key: string, library: TraditionalLibraryData = TRADITIONAL_LIBRARY, extra: Partial<DeitySuggestion> = {}): DeitySuggestion | null {
  const r = ((library.deity ?? {}) as Record<string, TraditionalRecord>)[key];
  if (!r) return null;
  const devotion = DEITY_DEVOTIONS.find((d) => d.key === key);
  return {
    key,
    name: text(r, 'DisplayName') || key,
    tradition: text(r, 'Pantheon'),
    note: text(r, 'Domains'),
    link: null,
    planet: null,
    days: (devotion?.sacred ?? []).slice(0, 3).map((d) => ({ name: d.name, basis: d.basis })),
    respect: text(r, 'CulturalContext') || text(r, 'TraditionalWarnings'),
    ...extra,
  };
}

/**
 * Deities who suit the work: first those the planet guides tie to the intent's
 * planets (ancient ties first), then Library deities whose domains match.
 */
export function suggestDeities(intent: TimingIntent, options: { library?: TraditionalLibraryData; planet?: string | null; limit?: number } = {}): DeitySuggestion[] {
  const library = options.library ?? TRADITIONAL_LIBRARY;
  const limit = options.limit ?? 6;
  const out: DeitySuggestion[] = [];
  const seen = new Set<string>();
  const push = (d: DeitySuggestion | null) => {
    if (!d || seen.has(d.name.toLowerCase())) return;
    seen.add(d.name.toLowerCase());
    out.push(d);
  };
  const planets = [...new Set([options.planet, ...intent.planets.slice(0, 2)].filter(Boolean) as string[])];
  const tied = planets.flatMap((planet) =>
    (PLANET_GUIDES[planet as Classical]?.deities ?? []).map((d) => ({ d, planet })),
  );
  // Ancient ties first, then modern; within each, the order the guide gives.
  for (const { d, planet } of [...tied.filter((t) => t.d.link === 'ancient'), ...tied.filter((t) => t.d.link === 'modern')]) {
    const key = deityKeyByName(library, d.name);
    if (!key) continue;
    // Leave room for deities whose own domains match the work.
    if (out.length >= Math.max(1, limit - 2)) break;
    push(deityOf(key, library, { note: d.note, link: d.link, planet, tradition: d.tradition }));
  }
  const words = intentWords(intent);
  const byDomain = Object.entries((library.deity ?? {}) as Record<string, TraditionalRecord>)
    .map(([key, r]) => {
      const domains = `${text(r, 'Domains')} ${tagsOf(r).join(' ')}`.toLowerCase();
      return { key, score: words.filter((w) => domains.includes(w)).length };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
  for (const { key } of byDomain) push(deityOf(key, library));
  return out.slice(0, limit);
}

/** Every Library deity, A to Z, for choosing by hand. */
export function allDeities(library: TraditionalLibraryData = TRADITIONAL_LIBRARY): { key: string; name: string; tradition: string }[] {
  return Object.entries((library.deity ?? {}) as Record<string, TraditionalRecord>)
    .map(([key, r]) => ({ key, name: text(r, 'DisplayName') || key, tradition: text(r, 'Pantheon') }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** A simple offering the Library gives for a deity, for the greeting step. */
export function offeringFor(key: string, library: TraditionalLibraryData = TRADITIONAL_LIBRARY): string {
  const r = ((library.deity ?? {}) as Record<string, TraditionalRecord>)[key];
  return r ? splitNames(text(r, 'Offerings')).slice(0, 3).join(', ').toLowerCase() : '';
}

// ── When ─────────────────────────────────────────────────────────────────

export const WEEKDAY_OF: Record<string, string> = {
  Sun: 'Sunday',
  Moon: 'Monday',
  Mars: 'Tuesday',
  Mercury: 'Wednesday',
  Jupiter: 'Thursday',
  Venus: 'Friday',
  Saturn: 'Saturday',
};

export type DaySuggestion = { planet: string; day: string; colours: string[]; herbs: string[]; stones: string[]; incense: string[] };

/** The planets of the days that suit the work, best first, with what the planet guides give them. */
export function suggestDays(intent: TimingIntent): DaySuggestion[] {
  return intent.planets.map((planet) => {
    const g = PLANET_GUIDES[planet as Classical];
    return { planet, day: WEEKDAY_OF[planet], colours: g?.colours ?? [], herbs: g?.herbs ?? [], stones: g?.stones ?? [], incense: g?.incense ?? [] };
  });
}

export const TIDE_LABELS: Record<MoonTide, string> = { new: 'New or dark moon', waxing: 'Waxing moon', full: 'Full moon', waning: 'Waning moon' };

export function suggestMoons(intent: TimingIntent): { tide: MoonTide; label: string; best: boolean }[] {
  return intent.tides.map((tide, i) => ({ tide, label: TIDE_LABELS[tide], best: i === 0 }));
}

// ── Starting points ───────────────────────────────────────────────────────

/** A candle, two herbs and a stone to start with, as the first builder did. */
export function starterIngredients(intent: TimingIntent | null, library: TraditionalLibraryData = TRADITIONAL_LIBRARY): Ingredient[] {
  if (!intent) return [];
  const s = suggestMaterials(intent, { library });
  return [...s.candle.slice(0, 1), ...s.herb.slice(0, 2), ...s.crystal.slice(0, 1)].map((x) => ({ ref: x.ref, name: x.name, type: x.type }));
}

/** A line to begin the words from, written for the app; change it freely. */
export const WORDS_STARTERS: Record<string, string> = {
  love: 'Let love come to me freely, kindly and truly, and let me be ready to meet it.',
  money: 'Let work and plenty find their way to me, and let me use them well.',
  protection: 'Guard this place and all within it; let nothing pass that means us harm.',
  banishing: 'What does not serve me, go now, and do not return.',
  healing: 'Let strength return and the body mend, gently and in its own time.',
  cleansing: 'Wash this clean: what was heavy, lift; what was stale, clear.',
  divination: 'Open my eyes to what is true, and let me see it plainly.',
  communication: 'Let my words be clear and my mind be quick, and let me be heard.',
  courage: 'Let my heart be steady and my step be sure.',
  ancestors: 'You who came before me, I remember you. Be welcome here.',
  endings: 'I thank what was, and I let it go.',
  beginnings: 'A seed is set; let it root, and let it grow.',
  peace: 'Let this place be quiet and this heart be still.',
};

// ── Safety ───────────────────────────────────────────────────────────────

const HAZARD_NOTES: Record<Hazard, string> = {
  fire: 'Never leave a flame alone. Use a stable holder on a heatproof surface, away from curtains, paper, pets and children, and keep water nearby.',
  heat: 'Stay with the pan or kettle while it is on the heat, and let everything cool before you handle it.',
  skin: 'Anything that touches skin: dilute oils well, patch test on the inside of your arm a day before, and leave out anything the Library says irritates.',
  water: 'Keep stones out of the water unless the Library says they are water-safe, take care on slippery surfaces, and keep candles where they can’t fall in.',
  dust: 'Grind gently and don’t breathe the dust in. Keep a mortar used for craft work away from food.',
  consent: 'Work on yourself freely; work on anyone else only with their consent.',
};

export type SafetyNote = { level: 'danger' | 'care'; text: string; ref?: string };

/** Everything to take care over in this spell: its form, its ingredients and their sourcing. */
export function spellSafety(spec: SpellSpec, library: TraditionalLibraryData = TRADITIONAL_LIBRARY): SafetyNote[] {
  const method = methodOf(spec.method);
  const hazards = new Set<Hazard>(method.hazards);
  if (spec.ingredients.some((i) => i.type === 'candle')) hazards.add('fire');
  const notes: SafetyNote[] = [];
  const skin = hazards.has('skin');
  for (const item of spec.ingredients) {
    const entry = libraryEntryOf(item.ref, library);
    if (!entry) continue;
    const r = ((library[entry.type] ?? {}) as Record<string, TraditionalRecord>)[entry.key];
    if (entry.danger) {
      notes.push({ level: 'danger', ref: entry.ref, text: `${entry.name}: ${entry.caution} Leave it out or use a substitute.` });
      continue;
    }
    const safety = text(r, 'SafetyAndRespect');
    if (skin && entry.type === 'herb' && /skin|irritat|photosens|dilute/i.test(`${entry.caution} ${safety}`)) {
      notes.push({ level: 'care', ref: entry.ref, text: `${entry.name}: ${/skin|irritat|photosens|dilute/i.test(entry.caution) ? entry.caution : safety}` });
    } else if (/pet|cat|dog|pregnan|child/i.test(entry.caution)) {
      notes.push({ level: 'care', ref: entry.ref, text: `${entry.name}: ${entry.caution}` });
    } else if (hazards.has('water') && entry.type === 'crystal' && /water/i.test(`${entry.caution} ${safety}`)) {
      notes.push({ level: 'care', ref: entry.ref, text: `${entry.name} should be kept out of water.` });
    }
    if (entry.sourcing) notes.push({ level: 'care', ref: entry.ref, text: `${entry.name}: ${entry.sourcing}` });
  }
  for (const h of hazards) notes.push({ level: 'care', text: HAZARD_NOTES[h] });
  return notes;
}

// ── What you own ─────────────────────────────────────────────────────────

/** Whether you already have it: on an altar, in My Apothecary, your cabinet, your stones or your garden. */
export function ownedRefs(items: Pick<Ingredient, 'ref' | 'name'>[], pantry: Pantry | null | undefined): Set<string> {
  const owned = new Set<string>();
  if (!pantry) return owned;
  for (const item of items) if (findNeed({ name: item.name, ref: item.ref }, pantry).length) owned.add(item.ref);
  return owned;
}

/** Suggestions with the ones you own first, keeping the order otherwise. */
export function ownedFirst<T extends Pick<Ingredient, 'ref'>>(items: T[], owned: Set<string>): T[] {
  return [...items.filter((i) => owned.has(i.ref)), ...items.filter((i) => !owned.has(i.ref))];
}
