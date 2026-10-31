// The spell builder's logic, shared by the app (rituals/spell.tsx) and the
// website (rituals/js/spell.js, through js/core/spellcraft.js): a spell's
// choices become a ritual template with steps; saved spells and plans are
// read back; premade workings are adapted; past results are gathered. Pure.

import { lookBackDate, readLookBack, answerLabel, type Outcome } from '../lookBack.ts';
import { INTENTIONS } from '../planner.ts';
import type { Premade } from '../premade/types.ts';
import { premadeDraft } from '../premade/draft.ts';
import type { Ingredient, JournalRow, StepDraft, TemplateDraft, TemplateRow } from '../types.ts';
import { whatWorks, type Tally } from '../whatWorks.ts';
import { methodOf, methodSteps, SPELL_METHODS } from './methods.ts';
import { blankSpec, specFromDraft, specFromTemplate, SPELL_VERSION, type SpellMethodKey, type SpellSpec } from './spec.ts';
import { libraryEntryOf, spellIntent, SPELL_INTENTS, TIDE_LABELS, WEEKDAY_OF } from './suggest.ts';

export * from './methods.ts';
export * from './spec.ts';
export * from './suggest.ts';

function list(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** "Love" for the intent, or null. */
export const intentLabel = (spec: Pick<SpellSpec, 'intent'>): string | null => spellIntent(spec.intent)?.label ?? null;

/** The ritual planner's intention key for the spell ("money" → "prosperity"), or null. */
export const plannerKeyOf = (spec: Pick<SpellSpec, 'intent'>): string | null => spellIntent(spec.intent)?.plannerKey ?? null;

/** An old spell's intention line ("Prosperity", "Love") read back to an intent key, or null. */
export function intentFromText(text: string): string | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  const byLabel = SPELL_INTENTS.find((i) => i.label.toLowerCase() === t || i.key === t);
  if (byLabel) return byLabel.key;
  const planner = INTENTIONS.find((i) => i.key === t || i.label.toLowerCase() === t);
  return planner ? spellIntent(planner.key)?.key ?? null : null;
}

export function defaultName(spec: Pick<SpellSpec, 'intent' | 'method'>): string {
  const label = intentLabel(spec);
  const form = spec.method === 'candle' || spec.method === 'own' ? 'spell' : methodOf(spec.method).label.toLowerCase();
  return label ? `${label} ${form}` : spec.method === 'candle' || spec.method === 'own' ? 'My spell' : `My ${form}`;
}

/** The steps the spell will run: your own if you've changed them, otherwise the form's. */
export function specSteps(spec: SpellSpec): StepDraft[] {
  return spec.steps ?? methodSteps(spec, intentLabel(spec));
}

/** When the spell is meant for, in words: "Waxing moon · Friday (Venus)". */
export function whenLine(spec: Pick<SpellSpec, 'moon' | 'planet'>): string {
  return [spec.moon ? TIDE_LABELS[spec.moon] : '', spec.planet && WEEKDAY_OF[spec.planet] ? `${WEEKDAY_OF[spec.planet]} (${spec.planet})` : ''].filter(Boolean).join(' · ');
}

/** The spell as a ritual template draft: to begin, plan, keep, share or print. */
export function specToDraft(spec: SpellSpec, base: Partial<Pick<TemplateDraft, 'id' | 'grimoire_page_id' | 'from'>> = {}): TemplateDraft {
  const method = methodOf(spec.method);
  const gather = [...spec.ingredients.map((i) => i.name), ...method.needs.map((n) => n.charAt(0).toLowerCase() + n.slice(1))];
  const when = whenLine(spec);
  const preparation = [
    gather.length ? `Gather ${list(gather)}.` : '',
    when ? `Best worked: ${when}.` : '',
    spec.deities.length ? `Honouring ${list(spec.deities.map((d) => d.name))}.` : '',
    spec.notes.trim(),
  ]
    .filter(Boolean)
    .join('\n\n');
  const label = intentLabel(spec);
  const stored: SpellSpec = { ...spec, version: SPELL_VERSION };
  return {
    id: base.id ?? null,
    title: spec.name.trim() || defaultName(spec),
    intention: spec.purpose.trim() || label || '',
    preparation,
    closing: 'Record what you noticed in your ritual journal, and come back to say whether it worked.',
    linked_altar_id: spec.altarId,
    grimoire_page_id: base.grimoire_page_id ?? null,
    steps: specSteps(spec),
    ingredients: spec.ingredients,
    kind: 'spell',
    ...(base.from ? { from: base.from } : {}),
    spell: stored as unknown as Record<string, unknown>,
  };
}

/** A saved template opened in the builder. */
export const openTemplate = (template: TemplateRow): SpellSpec => specFromTemplate(template, (s) => methodSteps(s, intentLabel(s)), intentFromText);

/** A draft (a plan's, or one handed over) opened in the builder. */
export const openDraft = (draft: TemplateDraft): SpellSpec => specFromDraft(draft, intentFromText);

const FORM_WORDS: [RegExp, SpellMethodKey][] = [
  [/\bjar\b|bottle/i, 'jar'],
  [/sachet|pillow/i, 'sachet'],
  [/charm bag|pouch/i, 'charm_bag'],
  [/\boil\b/i, 'oil'],
  [/knot|cord|ribbon/i, 'knot'],
  [/sigil/i, 'sigil'],
  [/petition|bay leaf/i, 'petition'],
  [/poppet/i, 'poppet'],
  [/\bbath\b|shower/i, 'bath'],
  [/powder|salt line/i, 'powder'],
  [/simmer/i, 'simmer'],
  [/candle/i, 'candle'],
];

/** The form a premade working takes, guessed from its title and summary. */
export function premadeMethod(p: Pick<Premade, 'title' | 'summary'>): SpellMethodKey {
  const words = `${p.title} ${p.summary}`;
  return FORM_WORDS.find(([re]) => re.test(words))?.[1] ?? 'own';
}

const PREMADE_TIDE: Record<string, SpellSpec['moon']> = { new: 'new', dark: 'new', waxing: 'waxing', full: 'full', waning: 'waning' };
const DAY_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/**
 * "Adapt this in the builder": a premade working as a spell of your own. Its
 * steps come over word for word as your own steps; everything else is yours
 * to change.
 */
export function specFromPremade(p: Premade): SpellSpec {
  const draft = premadeDraft(p);
  const ingredients: Ingredient[] = [];
  for (const item of p.ingredients) {
    const known = item.ref ? libraryEntryOf(item.ref) : null;
    const ref = item.ref ?? `own/${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (ingredients.some((i) => i.ref === ref)) continue;
    ingredients.push({ ref, name: known?.name ?? item.name, type: known?.type ?? (item.ref?.split('/')[1] || 'item') });
  }
  const spoken = draft.steps.find((s) => s.spoken_text.trim());
  return {
    ...blankSpec(spellIntent(p.intention)?.key ?? null, premadeMethod(p)),
    name: `${p.title} (my version)`,
    purpose: p.summary,
    ingredients,
    words: spoken?.spoken_text ?? '',
    moon: (p.moon ?? []).map((m) => PREMADE_TIDE[m]).find(Boolean) ?? null,
    planet: p.weekday !== undefined && p.weekday !== null ? DAY_PLANETS[p.weekday] ?? null : null,
    notes: [p.preparation, p.safety ? `Take care: ${p.safety}` : ''].filter(Boolean).join('\n\n'),
    steps: draft.steps,
  };
}

// ── Where the builder can be opened from ──────────────────────────────────

/** What a link into the builder can carry. */
export type BuilderParams = {
  /** The advisor's or the planner's key. */
  intent?: string | null;
  intention?: string | null;
  method?: string | null;
  /** Library refs to add, comma-separated ("traditional/herb/basil,traditional/crystal/citrine"). */
  add?: string | null;
  /** A Library deity key ("hekate"). */
  deity?: string | null;
  /** A planet whose day it's for ("Venus"). */
  planet?: string | null;
};

/** A fresh spell from a link's params: the planet guide, a Library page, the timing advisor… */
export function specFromParams(params: BuilderParams, starters: (intent: string | null) => Ingredient[], deityName: (key: string) => string | null): SpellSpec {
  const intent = spellIntent(params.intent ?? params.intention)?.key ?? null;
  const method = (SPELL_METHODS.find((m) => m.key === params.method)?.key ?? 'candle') as SpellMethodKey;
  const spec = blankSpec(intent, method);
  const ingredients = [...starters(intent)];
  for (const ref of String(params.add ?? '').split(',').map((r) => r.trim()).filter(Boolean)) {
    const entry = libraryEntryOf(ref);
    if (entry && !ingredients.some((i) => i.ref === entry.ref)) ingredients.push({ ref: entry.ref, name: entry.name, type: entry.type });
  }
  const name = params.deity ? deityName(params.deity) : null;
  const planet = params.planet && WEEKDAY_OF[params.planet] ? params.planet : null;
  return { ...spec, ingredients, deities: params.deity && name ? [{ key: params.deity, name }] : [], planet };
}

// ── "Did it work?" ────────────────────────────────────────────────────────

export type PastWorking = { id: string; title: string; date: string | null; answer: Outcome | null; answerLabel: string; waitingUntil: string | null };

export type SpellHistory = {
  workings: PastWorking[];
  /** "Worked 2 of 3 times so far." or null with no answers yet. */
  line: string | null;
  /** What your own look-backs say about the things chosen: "Rose Quartz: yes 3 of 4". */
  materials: { name: string; tally: Tally }[];
};

/**
 * This spell's past workings (journal entries begun from its template, or with
 * its title) and their "Did it work?" answers, and what your look-backs say
 * about the candles, herbs and stones it uses.
 */
export function spellHistory(journal: JournalRow[], spec: Pick<SpellSpec, 'ingredients'>, match: { templateId?: string | null; title?: string | null }): SpellHistory {
  const title = match.title?.trim().toLowerCase();
  const mine = journal.filter((e) => (match.templateId && e.template_id === match.templateId) || (!!title && e.title?.trim().toLowerCase() === title));
  const workings: PastWorking[] = mine.map((e) => {
    const look = readLookBack(e);
    return {
      id: e.id,
      title: e.title,
      date: e.ritual_date,
      answer: look?.answer ?? null,
      answerLabel: look?.answer ? answerLabel(look.answer) : '',
      waitingUntil: look && !look.answer ? look.date : null,
    };
  });
  const answered = workings.filter((w) => w.answer);
  const yes = answered.filter((w) => w.answer === 'yes').length;
  const partly = answered.filter((w) => w.answer === 'partly').length;
  const line = answered.length
    ? `Worked ${yes} of ${answered.length} ${answered.length === 1 ? 'time' : 'times'}${partly ? `, and partly ${partly} more` : ''}, by your own answers.`
    : null;
  const works = whatWorks(journal);
  const fold = (s: string) => s.toLowerCase().replace(/\s+candles?$/, '').trim();
  const tallies = [...works.byCandle, ...works.byHerb, ...works.byCrystal];
  const materials = spec.ingredients
    .map((i) => ({ name: i.name, tally: tallies.find((t) => fold(t.label) === fold(i.name)) }))
    .filter((x): x is { name: string; tally: Tally } => !!x.tally);
  return { workings, line, materials };
}

/** When to ask "Did it work?" if you do it today: the moon that suits the work. */
export const suggestedLookBack = (spec: Pick<SpellSpec, 'moon' | 'intent'>, now: Date): string => {
  const tides = spellIntent(spec.intent)?.tides ?? [];
  const drawing = (spec.moon ?? tides[0]) !== 'waning';
  return lookBackDate(drawing ? 'full_moon' : 'new_moon', now);
};

// ── Print and share ───────────────────────────────────────────────────────

/** The whole spell as plain text, to print, copy or share. */
export function spellText(spec: SpellSpec): string {
  const draft = specToDraft(spec);
  const method = methodOf(spec.method);
  const lines = [draft.title, '', [method.label, intentLabel(spec), whenLine(spec)].filter(Boolean).join(' · ')];
  if (draft.intention) lines.push('', draft.intention);
  if (draft.preparation) lines.push('', 'Preparation', draft.preparation);
  if (spec.words.trim()) lines.push('', 'Words', spec.words.trim());
  lines.push('', 'Steps');
  draft.steps.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.title}${s.minutes ? ` (${s.minutes} min)` : ''}`);
    if (s.instructions) lines.push(`   ${s.instructions}`);
    if (s.spoken_text) lines.push(`   “${s.spoken_text}”`);
  });
  lines.push('', draft.closing, '', 'Made in the Salt & Sovereignty spell builder.');
  return lines.join('\n');
}
