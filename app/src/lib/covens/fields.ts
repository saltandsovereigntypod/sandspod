// What a step knows about itself: each action in stepActions.ts can carry a
// small set of fields (which directions a quarter call faces and who calls
// each one, which candle is lit and what it's called, what is poured and to
// whom, how a space is cleansed, what a vote is on). The ritual builder draws
// them all with one renderer (app: components/covens/FieldRenderer.tsx;
// website: covens/coven/builder.js), so a coven's own actions use the same
// field types. Values are saved with the step (coven_ritual_steps.details,
// supabase/migrations/20261103000000_coven_ritual_builder.sql) in the same
// shapes on both. Pure, so it can be tested; the website reads it through
// js/core/covens.js.

export type FieldType =
  | 'text'
  | 'long'
  | 'number'
  | 'choice'
  | 'multi'
  | 'colour'
  | 'deity'
  | 'items'
  | 'who'
  | 'parts'
  | 'list'
  | 'ref';

/** The kinds of named thing a step can make, for later steps to refer to. */
export type ThingKind = 'candle' | 'offering' | 'thing';

export type FieldOption = { value: string; label: string };

export type FieldSpec = {
  key: string;
  type: FieldType;
  label: string;
  hint?: string;
  options?: FieldOption[];
  placeholder?: string;
  /** Shown straight away; the rest wait under "More options". */
  essential?: boolean;
  /** A text field whose value names a thing later steps can refer to ("Hekate’s candle"). */
  names?: ThingKind;
  /** A ref field: the kind of earlier named thing it points to. */
  refKind?: ThingKind;
  /** A parts field: the multi field whose choices are its parts (directions), or fixed parts. */
  partsFrom?: string;
  /** A who field that names one person or role (not several). */
  single?: boolean;
  /** For numbers. */
  min?: number;
  max?: number;
};

/** One part of a step done in parts: a direction and who calls it, and the words. */
export type PartValue = { part: string; who?: string; words?: string };

/** An item picked for a field, as the step's items are kept (itemIndex.ts StepItem). */
export type FieldItem = { key: string; name: string; image: string; category?: string };

export type FieldValue = string | number | string[] | PartValue[] | FieldItem[] | null;

export type FieldValues = Record<string, FieldValue>;

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'A line of text' },
  { value: 'long', label: 'Longer text' },
  { value: 'number', label: 'A number' },
  { value: 'choice', label: 'One of a few choices' },
  { value: 'multi', label: 'Any of a few choices' },
  { value: 'colour', label: 'A colour' },
  { value: 'deity', label: 'A deity' },
  { value: 'items', label: 'Things from the altar' },
  { value: 'who', label: 'A person or role' },
  { value: 'list', label: 'A short list' },
];

const opts = (...labels: string[]): FieldOption[] => labels.map((l) => ({ value: l.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''), label: l }));

export const DIRECTIONS = opts('East', 'South', 'West', 'North', 'Above', 'Below', 'Centre');
export const CLEANSE_METHODS = opts('Khernips', 'Smoke', 'Salt water', 'Sound', 'Visualisation', 'Washing hands', 'Other');
export const LIQUIDS = opts('Wine', 'Mead', 'Milk', 'Water', 'Honey', 'Oil', 'Beer', 'Other');
export const POUR_INTO = opts('The libation bowl', 'The earth', 'The fire', 'Running water', 'Other');
export const DIVINATION_SYSTEMS = opts('Tarot', 'Oracle cards', 'Runes', 'Ogham', 'Pendulum', 'Bibliomancy', 'Other');
export const QUARTER_ORDER = [
  { value: 'sunwise', label: 'Sunwise (clockwise)' },
  { value: 'widdershins', label: 'Widdershins (anticlockwise)' },
  { value: 'listed', label: 'As listed' },
];
export const BALLOTS = [
  { value: 'open', label: 'Open (everyone sees who voted how)' },
  { value: 'secret', label: 'Secret (only the totals are shown)' },
];

const COLOURS = ['white', 'black', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink', 'magenta', 'brown', 'grey', 'silver', 'gold'];
export const COLOUR_OPTIONS: FieldOption[] = COLOURS.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }));

const QUARTER_FIELDS: FieldSpec[] = [
  { key: 'directions', type: 'multi', label: 'Which directions', options: DIRECTIONS, essential: true },
  { key: 'order', type: 'choice', label: 'In what order', options: QUARTER_ORDER, essential: true },
  { key: 'parts', type: 'parts', label: 'Who calls each, and the words', partsFrom: 'directions', essential: true },
];

/** The fields each action carries. Actions not listed have none of their own. */
export const ACTION_FIELDS: Record<string, FieldSpec[]> = {
  call_quarters: QUARTER_FIELDS,
  release_quarters: QUARTER_FIELDS,
  cleanse: [
    { key: 'method', type: 'choice', label: 'How', options: CLEANSE_METHODS, essential: true },
    { key: 'how', type: 'long', label: 'Anything more about how', placeholder: 'Bay leaf lit and quenched in the water, then sprinkled over each person.' },
  ],
  light_candle: [
    { key: 'candle', type: 'text', label: 'The candle’s name', hint: 'Later steps can refer to it by this name.', placeholder: 'Hekate’s candle', names: 'candle', essential: true },
    { key: 'colour', type: 'colour', label: 'Colour', essential: true },
    { key: 'count', type: 'number', label: 'How many', min: 1, max: 13 },
  ],
  snuff_candle: [{ key: 'candle', type: 'ref', label: 'Which candle', refKind: 'candle', essential: true }],
  welcome_deity: [{ key: 'deity', type: 'deity', label: 'Which deity', essential: true }],
  farewell_deity: [{ key: 'deity', type: 'deity', label: 'Which deity', essential: true }],
  place_offering: [
    { key: 'offering', type: 'items', label: 'The offering', essential: true },
    { key: 'name', type: 'text', label: 'Call it', hint: 'Later steps can refer to it by this name.', placeholder: 'The crossroads offerings', names: 'offering' },
    { key: 'to', type: 'text', label: 'To whom', placeholder: 'Hekate, the ancestors, the land…', essential: true },
    { key: 'where', type: 'text', label: 'Where it is set', placeholder: 'At the crossroads' },
  ],
  pour_libation: [
    { key: 'liquid', type: 'choice', label: 'What is poured', options: LIQUIDS, essential: true },
    { key: 'to', type: 'text', label: 'To whom', placeholder: 'The gods, the ancestors, the land…', essential: true },
    { key: 'where', type: 'choice', label: 'Where', options: POUR_INTO },
  ],
  divination_draw: [
    { key: 'system', type: 'choice', label: 'Deck or system', options: DIVINATION_SYSTEMS, essential: true },
    { key: 'spread', type: 'text', label: 'Spread or method', placeholder: 'Three cards: past, present, future', essential: true },
    { key: 'drawer', type: 'who', label: 'Who draws', single: true },
  ],
  lay_crossroads: [
    { key: 'marker', type: 'items', label: 'What stands for the crossroads', hint: 'A key, a path, a picture, or anything your coven uses.', essential: true },
    { key: 'name', type: 'text', label: 'Call it', placeholder: 'The crossroads', names: 'thing' },
  ],
  clear_offerings: [{ key: 'what', type: 'ref', label: 'What is cleared', refKind: 'offering', essential: true }],
  prayer: [{ key: 'prayer', type: 'text', label: 'Which prayer', placeholder: 'Our opening prayer', essential: true }],
  read_aloud: [{ key: 'source', type: 'text', label: 'What is read', placeholder: 'The Charge of the Goddess', essential: true }],
  vote: [
    { key: 'motion', type: 'long', label: 'The motion', placeholder: 'That the coven meets on the first Saturday of each month.', essential: true },
    { key: 'options', type: 'list', label: 'The answers', hint: 'One per line. For, Against and Abstain if you leave it empty.', essential: true },
    { key: 'voters', type: 'who', label: 'Who may vote', hint: 'Roles, positions or people. Everyone in the coven if you leave it empty.', essential: true },
    { key: 'ballot', type: 'choice', label: 'Open or secret', options: BALLOTS, essential: true },
  ],
  agenda_item: [
    { key: 'item', type: 'text', label: 'The item', placeholder: 'Plans for Samhain', essential: true },
    { key: 'presenter', type: 'who', label: 'Who brings it', single: true, essential: true },
    { key: 'notes', type: 'long', label: 'Notes for the agenda' },
  ],
  discussion: [{ key: 'question', type: 'long', label: 'The question', placeholder: 'How do we welcome new members?', essential: true }],
  officer_report: [
    { key: 'from', type: 'who', label: 'Who reports', single: true, essential: true },
    { key: 'topic', type: 'text', label: 'On what', placeholder: 'The coven’s funds', essential: true },
  ],
  read_minutes: [{ key: 'taker', type: 'who', label: 'Who reads them', single: true }],
  study: [{ key: 'source', type: 'text', label: 'What is studied', placeholder: 'A chapter, a text, a practice', essential: true }],
};

/** The fields for a step: its action's, or a coven action's own. */
export function fieldsFor(actionId: string | null | undefined, custom?: { fields?: FieldSpec[] } | null): FieldSpec[] {
  if (custom?.fields?.length) return cleanFieldSpecs(custom.fields);
  return ACTION_FIELDS[actionId ?? ''] ?? [];
}

/** Field specs a coven wrote for its own action, cleaned (known types, unique keys, at most 12). */
export function cleanFieldSpecs(raw: unknown): FieldSpec[] {
  if (!Array.isArray(raw)) return [];
  const out: FieldSpec[] = [];
  for (const r of raw) {
    const f = r as Partial<FieldSpec> | null;
    if (!f || (!FIELD_TYPES.some((t) => t.value === f.type) && f.type !== 'parts' && f.type !== 'ref')) continue;
    const label = String(f.label ?? '').trim().slice(0, 80);
    if (!label) continue;
    let key = String(f.key ?? '').trim().replace(/[^a-z0-9_]/gi, '_').toLowerCase().slice(0, 30) || label.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
    while (out.some((o) => o.key === key)) key = `${key}_`;
    const spec: FieldSpec = { key, type: f.type as FieldType, label, essential: f.essential !== false };
    if (f.hint) spec.hint = String(f.hint).slice(0, 200);
    if (f.placeholder) spec.placeholder = String(f.placeholder).slice(0, 120);
    if (Array.isArray(f.options)) spec.options = f.options.map((o) => ({ value: String(o?.value ?? o?.label ?? '').slice(0, 60), label: String(o?.label ?? o?.value ?? '').slice(0, 80) })).filter((o) => o.value && o.label).slice(0, 20);
    if (f.names) spec.names = f.names;
    if (f.refKind) spec.refKind = f.refKind;
    if (f.partsFrom) spec.partsFrom = String(f.partsFrom);
    if (f.single) spec.single = true;
    out.push(spec);
    if (out.length === 12) break;
  }
  return out;
}

/** Choices for a coven's own field typed one per line: "Wine\nMead" → options. */
export const optionsFromLines = (text: string): FieldOption[] => opts(...String(text ?? '').split(/\n/).map((l) => l.trim()).filter(Boolean).slice(0, 20));

/** A value as saved, cleaned for its field (wrong shapes become null). */
export function cleanValue(spec: FieldSpec, raw: unknown): FieldValue {
  if (raw == null || raw === '') return null;
  switch (spec.type) {
    case 'text':
    case 'long':
    case 'colour':
    case 'deity':
    case 'ref':
      return typeof raw === 'string' ? raw.slice(0, spec.type === 'long' ? 4000 : 200) : null;
    case 'choice':
      return typeof raw === 'string' && (!spec.options?.length || spec.options.some((o) => o.value === raw)) ? raw : null;
    case 'number': {
      const n = Math.round(Number(raw));
      if (!Number.isFinite(n)) return null;
      return Math.max(spec.min ?? 0, Math.min(spec.max ?? 9999, n));
    }
    case 'multi':
    case 'list':
    case 'who': {
      if (!Array.isArray(raw)) return typeof raw === 'string' && raw ? [raw.slice(0, 200)] : null;
      const list = [...new Set(raw.filter((x): x is string => typeof x === 'string' && !!x.trim()).map((x) => x.trim().slice(0, 200)))];
      const kept = spec.type === 'multi' && spec.options?.length ? list.filter((x) => spec.options!.some((o) => o.value === x)) : list;
      return kept.length ? kept.slice(0, spec.single ? 1 : 20) : null;
    }
    case 'parts': {
      if (!Array.isArray(raw)) return null;
      const parts = raw
        .map((p) => p as Partial<PartValue>)
        .filter((p) => p && typeof p.part === 'string' && p.part)
        .map((p) => {
          const out: PartValue = { part: String(p.part).slice(0, 60) };
          if (typeof p.who === 'string' && p.who) out.who = p.who.slice(0, 200);
          if (typeof p.words === 'string' && p.words.trim()) out.words = p.words.slice(0, 2000);
          return out;
        });
      return parts.length ? parts.slice(0, 12) : null;
    }
    case 'items': {
      if (!Array.isArray(raw)) return null;
      const items = raw
        .map((i) => i as Partial<FieldItem>)
        .filter((i) => i && typeof i.key === 'string' && typeof i.name === 'string' && i.name.trim())
        .map((i) => ({ key: String(i.key).slice(0, 200), name: String(i.name).slice(0, 120), image: typeof i.image === 'string' ? i.image : '', ...(i.category ? { category: String(i.category).slice(0, 40) } : {}) }));
      return items.length ? items.slice(0, 12) : null;
    }
  }
  return null;
}

/** All of a step's values, cleaned against its fields (values for fields it no longer has are dropped). */
export function cleanValues(specs: FieldSpec[], raw: unknown): FieldValues {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const out: FieldValues = {};
  for (const spec of specs) {
    const v = cleanValue(spec, source[spec.key]);
    if (v != null) out[spec.key] = v;
  }
  return out;
}

/** The parts a parts field has now: its source field's choices in order, keeping what was written for each. */
export function partsOf(spec: FieldSpec, values: FieldValues, specs: FieldSpec[]): PartValue[] {
  const saved = (Array.isArray(values[spec.key]) ? values[spec.key] : []) as PartValue[];
  const source = specs.find((s) => s.key === spec.partsFrom);
  const chosen = source ? ((values[source.key] as string[] | null) ?? []) : saved.map((p) => p.part);
  const ordered = source?.options ? source.options.map((o) => o.value).filter((v) => chosen.includes(v)) : chosen;
  const order = values.order === 'widdershins' ? [...ordered].reverse() : ordered;
  return order.map((part) => saved.find((p) => p.part === part) ?? { part });
}

/** A choice's label ("salt_water" → "Salt water"). */
export function optionLabel(spec: FieldSpec | undefined, value: string): string {
  return spec?.options?.find((o) => o.value === value)?.label ?? value;
}

/** Default words for a quarter, by direction (the action's own, made specific). */
const QUARTER_WORDS: Record<string, string> = {
  east: 'Guardians of the East, powers of Air, of breath and new beginnings: we call you to this circle. Hail and welcome.',
  south: 'Guardians of the South, powers of Fire, of will and change: we call you to this circle. Hail and welcome.',
  west: 'Guardians of the West, powers of Water, of feeling and dreams: we call you to this circle. Hail and welcome.',
  north: 'Guardians of the North, powers of Earth, of body and home: we call you to this circle. Hail and welcome.',
  above: 'Powers of the sky above, we call you to this circle. Hail and welcome.',
  below: 'Powers of the deep earth below, we call you to this circle. Hail and welcome.',
  centre: 'Spirit at the centre, in all things and between them, be with us. Hail and welcome.',
};
const RELEASE_WORDS: Record<string, string> = Object.fromEntries(Object.entries(QUARTER_WORDS).map(([k, v]) => [k, v.replace('we call you to this circle', 'thank you for your presence').replace('Hail and welcome', 'Go if you must, stay if you will. Hail and farewell')]));

/** Words for a part when none are written yet (quarter calls have their own). */
export function defaultPartWords(actionId: string, part: string): string {
  if (actionId === 'call_quarters') return QUARTER_WORDS[part] ?? '';
  if (actionId === 'release_quarters') return RELEASE_WORDS[part] ?? '';
  return '';
}

/** The answers on a vote: its own list, or For, Against and Abstain. */
export function voteOptions(values: FieldValues): string[] {
  const list = (Array.isArray(values.options) ? values.options : []) as string[];
  return list.length >= 2 ? list.slice(0, 12) : ['For', 'Against', 'Abstain'];
}

/** Names a step's fields give to things (a candle, an offering), for later steps. */
export function namesIn(specs: FieldSpec[], values: FieldValues): { kind: ThingKind; name: string }[] {
  return specs
    .filter((s) => s.names && typeof values[s.key] === 'string' && String(values[s.key]).trim())
    .map((s) => ({ kind: s.names!, name: String(values[s.key]).trim() }));
}

/** Every person or role a step's fields name (callers, presenters, voters): keys like "role:hps", "user:…", "rank:…", "coven". */
export function whoIn(specs: FieldSpec[], values: FieldValues): string[] {
  const out: string[] = [];
  for (const s of specs) {
    const v = values[s.key];
    if (s.type === 'who' && Array.isArray(v)) out.push(...(v as string[]));
    if (s.type === 'parts' && Array.isArray(v)) for (const p of v as PartValue[]) if (p.who) out.push(p.who);
  }
  return [...new Set(out)];
}

/**
 * The step's one-line summary for the outline: its name, then what its
 * fields say ("Call the quarters · East: Rowan, South: Ash").
 */
export function fieldSummary(specs: FieldSpec[], values: FieldValues, whoLabel: (key: string) => string): string {
  const bits: string[] = [];
  for (const s of specs) {
    const v = values[s.key];
    if (v == null || (Array.isArray(v) && !v.length)) continue;
    if (s.type === 'parts') {
      const parts = v as PartValue[];
      const spec = specs.find((x) => x.key === s.partsFrom);
      bits.push(parts.map((p) => `${optionLabel(spec, p.part)}${p.who ? `: ${whoLabel(p.who)}` : ''}`).join(', '));
    } else if (s.type === 'multi') {
      if (specs.some((x) => x.type === 'parts' && x.partsFrom === s.key)) continue;
      bits.push((v as string[]).map((x) => optionLabel(s, x)).join(', '));
    } else if (s.type === 'choice') bits.push(optionLabel(s, String(v)));
    else if (s.type === 'who') bits.push((v as string[]).map(whoLabel).join(', '));
    else if (s.type === 'items') bits.push((v as FieldItem[]).map((i) => i.name).join(', '));
    else if (s.type === 'list') bits.push((v as string[]).join(' / '));
    else if (s.type === 'number') bits.push(`${s.label.toLowerCase()} ${v}`);
    else if (s.type === 'long') bits.push(String(v).split(/\n/)[0].slice(0, 60));
    else if (s.type === 'colour') bits.push(String(v));
    else bits.push(String(v));
  }
  return bits.filter(Boolean).join(' · ');
}
