// Object instances: a made or placed thing tracked once it physically exists
// (a spell jar, an oil, a tending blend), with its lifecycle (tending and
// review dates, what's left) and a timeline of events. Rows live in the
// website's `object_instances` and `object_instance_events` tables
// (js/object-instances.js); the Today's Practice flows that add to them are
// altar/js/features/living-state-actions.js. Pure, so it can be tested; the
// Supabase calls are in instanceStore.ts.

import { TENDING_BLEND, type ApothecaryItem } from './apothecary.ts';
import type { ApothecaryState } from './livingState.ts';
import type { CabinetItem, SavedObject } from './types.ts';

export type ObjectInstance = {
  id: string;
  user_id?: string;
  entity_id?: string | null;
  source?: string;
  instance_type?: string;
  name?: string;
  object_type?: string;
  subtype?: string;
  status?: string | null;
  started_at?: string | null;
  expiration_enabled?: boolean | null;
  expires_at?: string | null;
  tending_enabled?: boolean | null;
  tending_interval_days?: number | null;
  tending_due_at?: string | null;
  remaining_amount?: string | number | null;
  amount_unit?: string | null;
  remaining_burn_seconds?: number | null;
  total_burn_seconds?: number | null;
  apothecary_item_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type InstanceEvent = {
  id?: string;
  instance_id: string;
  entity_id?: string | null;
  event_type: string;
  event_label?: string | null;
  event_notes?: string | null;
  occurred_at?: string | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
};

/** What the website's object actions treat as crafted (object-actions.js CRAFTED_TYPES). */
const CRAFTED_TYPES = new Set(['apothecary', 'spell-jar', 'oil', 'incense', 'sachet', 'spray', 'poppet', 'powder', 'tea', 'herb-blend']);

/** objectType(): the apothecary kind, else the object's type, as a slug. */
function objectKind(object: SavedObject): string {
  if (object.type === 'apothecary') return 'apothecary';
  const raw = String(object.apothecaryType || object.type || 'object').trim().toLowerCase().replaceAll(' ', '-');
  return raw || 'object';
}

/** Crafted objects get Activation, Remaining, Review and Tend (an oil from the cabinet too). */
export function isCrafted(object: SavedObject | null | undefined): boolean {
  if (!object) return false;
  return CRAFTED_TYPES.has(objectKind(object)) || object.type === 'apothecary';
}

/** date.setDate(date.getDate() + days), as the website adds days. */
export function addCalendarDays(now: Date, days: number): string {
  const date = new Date(now.getTime());
  date.setDate(date.getDate() + Number(days));
  return date.toISOString();
}

type Lifecycle = {
  expiration_enabled: boolean;
  tending_enabled: boolean;
  tending_interval_days: number | null;
  expires_at: string | null;
  tending_due_at: string | null;
};

/** getDefaultLifecycleForObject: tending and review defaults by kind. */
export function defaultLifecycle(type: string, subtype: string, now: Date): Lifecycle {
  const t = String(type || '').toLowerCase();
  const s = String(subtype || '').toLowerCase();
  const none: Lifecycle = { expiration_enabled: false, tending_enabled: false, tending_interval_days: null, expires_at: null, tending_due_at: null };
  if (t === 'candle') return none;
  if (s.includes('oil') || s.includes('tincture') || s.includes('spray')) {
    return { ...none, expiration_enabled: true, expires_at: addCalendarDays(now, 180) };
  }
  if (s.includes('spell jar') || s.includes('sachet') || s.includes('poppet') || s.includes('charm')) {
    return { ...none, tending_enabled: true, tending_interval_days: 30, tending_due_at: addCalendarDays(now, 30) };
  }
  if (t === 'herb' || s.includes('herb') || s.includes('powder') || s.includes('incense')) {
    return { ...none, expiration_enabled: true, expires_at: addCalendarDays(now, 90) };
  }
  return none;
}

export type InstanceInput = {
  entity_id?: string;
  source?: string;
  instance_type?: string;
  name?: string;
  object_type?: string;
  subtype?: string;
  status?: string;
  started_at?: string;
  expiration_enabled?: boolean;
  expires_at?: string | null;
  tending_enabled?: boolean;
  tending_interval_days?: number | null;
  tending_due_at?: string | null;
  apothecary_item_id?: string;
  metadata?: Record<string, unknown>;
};

/** The `object_instances` row createObjectInstance() inserts. */
export function instanceRow(userId: string, input: InstanceInput, now: Date) {
  const lifecycle = defaultLifecycle(input.object_type ?? '', input.subtype ?? '', now);
  const iso = now.toISOString();
  return {
    user_id: userId,
    entity_id: input.entity_id || null,
    source: input.source || 'altar',
    instance_type: input.instance_type || 'placed_object',
    name: input.name || 'Untitled Object',
    object_type: input.object_type || '',
    subtype: input.subtype || '',
    status: input.status || 'active',
    started_at: input.started_at || iso,
    expiration_enabled: input.expiration_enabled ?? lifecycle.expiration_enabled,
    expires_at: input.expiration_enabled === false ? null : (input.expires_at ?? lifecycle.expires_at),
    tending_enabled: input.tending_enabled ?? lifecycle.tending_enabled,
    tending_interval_days: input.tending_enabled === false ? null : (input.tending_interval_days ?? lifecycle.tending_interval_days),
    tending_due_at: input.tending_enabled === false ? null : (input.tending_due_at ?? lifecycle.tending_due_at),
    remaining_amount: null,
    amount_unit: '',
    remaining_burn_seconds: null,
    total_burn_seconds: null,
    altar_object_key: '',
    altar_save_id: null,
    apothecary_item_id: input.apothecary_item_id || '',
    metadata: input.metadata || {},
    updated_at: iso,
  };
}

/** What a new apothecary item's instance is made from (apothecary.js, on first save). */
export function apothecaryInstanceInput(item: ApothecaryItem): InstanceInput {
  return {
    entity_id: item.entityId || '',
    source: 'apothecary',
    instance_type: 'apothecary_item',
    name: item.name,
    object_type: 'apothecary',
    subtype: item.typeLabel || item.type || '',
    apothecary_item_id: item.id,
    metadata: { intention: item.intention || '', notes: item.notes || '', details: item.details || {}, ingredients: item.ingredients || [] },
    tending_enabled: item.livingState.tending_enabled,
    tending_interval_days: item.livingState.tending_enabled ? item.livingState.tending_interval_days : null,
    expiration_enabled: item.livingState.expiration_enabled,
  };
}

export type EventInput = { type: string; label?: string; notes?: string; occurredAt?: string; metadata?: Record<string, unknown> };

/** The `object_instance_events` row addObjectInstanceEvent() inserts. */
export function eventRow(userId: string, instance: Pick<ObjectInstance, 'id' | 'entity_id'>, event: EventInput, now: Date) {
  return {
    user_id: userId,
    instance_id: instance.id,
    entity_id: instance.entity_id || null,
    event_type: event.type,
    event_label: event.label || event.type,
    event_notes: event.notes || '',
    occurred_at: event.occurredAt || now.toISOString(),
    metadata: event.metadata || {},
  };
}

export const createdEvent = (item: Pick<ApothecaryItem, 'type' | 'typeLabel'>): EventInput => ({
  type: 'created',
  label: 'Manifestation Created',
  notes: `Created as a ${item.typeLabel || item.type}.`,
  metadata: { source: 'apothecary' },
});

export const recipeUpdatedEvent = (item: Pick<ApothecaryItem, 'id' | 'name' | 'ingredients'>): EventInput => ({
  type: 'recipe_updated',
  label: 'Apothecary Recipe Updated',
  notes: `${item.name} · ${item.ingredients.length} ingredient${item.ingredients.length === 1 ? '' : 's'}`,
  metadata: { apothecaryItemId: item.id },
});

// ---------------------------------------------------------------- showing it

/** formatCompanionDate(value, true): "Oct 12, 2026". */
function shortDate(value: unknown): string {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** formatRelativeDate: "in 3 days", "due today", "2 days overdue". */
export function relativeDue(value: unknown, now: Date): string {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date(now.getTime());
  today.setHours(0, 0, 0, 0);
  const target = new Date(date.getTime());
  target.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) {
    const overdue = Math.abs(days);
    return `${overdue} day${overdue === 1 ? '' : 's'} overdue`;
  }
  if (days === 0) return 'due today';
  if (days === 1) return 'due tomorrow';
  return `in ${days} days`;
}

const present = (value: unknown) => value !== null && value !== undefined;

/** The Companion's lifecycle block (renderLifecycleMarkup) as label/value rows. */
export function lifecycleRows(instance: ObjectInstance | null | undefined, now: Date): { label: string; value: string }[] {
  if (!instance) return [];
  const rows: { label: string; value: string }[] = [];
  const status = String(instance.status || 'active').toLowerCase();
  rows.push({ label: 'Status', value: status.charAt(0).toUpperCase() + status.slice(1) });
  const created = shortDate(instance.started_at);
  if (created) rows.push({ label: 'Created', value: created });
  const tending = instance.tending_enabled && instance.tending_due_at ? shortDate(instance.tending_due_at) : '';
  if (tending) rows.push({ label: 'Next tending', value: [tending, relativeDue(instance.tending_due_at, now)].filter(Boolean).join(' · ') });
  const expires = instance.expiration_enabled && instance.expires_at ? shortDate(instance.expires_at) : '';
  if (expires) rows.push({ label: 'Review or replace', value: [expires, relativeDue(instance.expires_at, now)].filter(Boolean).join(' · ') });
  if (present(instance.remaining_amount)) {
    rows.push({ label: 'Current state', value: `${instance.remaining_amount}${instance.amount_unit ? ` ${instance.amount_unit}` : ''} remaining` });
  }
  if (present(instance.remaining_burn_seconds)) {
    const totalMinutes = Math.max(0, Math.round(Number(instance.remaining_burn_seconds) / 60));
    const hours = Math.floor(totalMinutes / 60);
    rows.push({ label: 'Current state', value: `${hours ? `${hours}h ` : ''}${totalMinutes % 60}m burn remaining` });
  }
  return rows;
}

/** An instance's events for the About sheet's history, newest first. */
export function eventHistory(events: InstanceEvent[], now: Date): { label: string; detail: string; at: string }[] {
  return [...events]
    .sort((a, b) => String(b.occurred_at || '').localeCompare(String(a.occurred_at || '')))
    .map((event) => {
      const at = String(event.occurred_at || '');
      const date = at ? new Date(at) : null;
      const when =
        date && !Number.isNaN(date.getTime())
          ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }) })
          : '';
      const note = String(event.event_notes || '').split('\n').find((line) => line.trim()) ?? '';
      const short = note.length > 60 ? `${note.slice(0, 59).trimEnd()}…` : note;
      const label = String(event.event_label || '') || humanizeKey(event.event_type || 'Activity');
      return { label, detail: [short, when].filter(Boolean).join(' · '), at };
    });
}

const humanizeKey = (value: string) => value.replace(/[_-]+/g, ' ').replace(/\b[a-z]/g, (c) => c.toUpperCase());

// ---------------------------------------------------------------- crafted actions

/**
 * The Tend sheet's values for an object with an instance: activation from
 * the object's own state (the website keeps it there), what's left and the
 * dates from the instance.
 */
export function instanceTendState(own: ApothecaryState, instance: ObjectInstance): ApothecaryState {
  return {
    ...own,
    remainingAmount: present(instance.remaining_amount) ? String(instance.remaining_amount) : '',
    nextTendingAt: instance.tending_enabled && instance.tending_due_at ? String(instance.tending_due_at) : '',
    reviewAt: instance.expiration_enabled && instance.expires_at ? String(instance.expires_at) : '',
    status: String(instance.status || own.status || 'active'),
  };
}

/**
 * What openCraftedAction writes to the instance for a change: Remaining sets
 * remaining_amount, Review sets the tending and expiry dates and switches
 * them on or off. Activation has no column and stays on the object (null).
 */
export function instanceTendUpdates(change: Partial<ApothecaryState>): Record<string, unknown> | null {
  const updates: Record<string, unknown> = {};
  if ('remainingAmount' in change) updates.remaining_amount = change.remainingAmount || null;
  if ('nextTendingAt' in change) {
    updates.tending_due_at = change.nextTendingAt || null;
    updates.tending_enabled = Boolean(change.nextTendingAt);
  }
  if ('reviewAt' in change) {
    updates.expires_at = change.reviewAt || null;
    updates.expiration_enabled = Boolean(change.reviewAt);
  }
  return Object.keys(updates).length ? updates : null;
}

/** A typed date ("2026-11-03") as the start of that day here, or null if it isn't one. */
export function dateFromInput(value: string): string | null {
  const match = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s*$/.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date.toISOString();
}

/** A stored date for the date field: "2026-11-03" in local time. */
export function dateToInput(iso: string): string {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ---------------------------------------------------------------- Today's Practice

export type PracticeActivity = 'tend' | 'charge' | 'ritual' | 'journal';

/** livingStatePracticeActivities. */
export const PRACTICE_ACTIVITIES: { id: PracticeActivity; label: string; symbol: string; description: string }[] = [
  { id: 'tend', label: 'Tend', symbol: '❦', description: 'Care for this manifestation with herbs, oils, offerings, prayer, or other supports.' },
  { id: 'charge', label: 'Charge', symbol: '☾', description: 'Record moon, sun, storm, smoke, crystal, deity, or custom charging.' },
  { id: 'ritual', label: 'Perform Ritual', symbol: '✺', description: 'Record a ritual connected to this manifestation.' },
  { id: 'journal', label: 'Journal', symbol: '✎', description: 'Record an observation, dream, sign, feeling, result, or message.' },
];

/** livingStateTendMethods. */
export const TEND_METHODS: { id: string; label: string; hint: string; types: string[] }[] = [
  { id: 'oil', label: 'Oil', hint: 'Anointing, dressing, sealing', types: ['oil'] },
  { id: 'herbs', label: 'Herbs', hint: 'Loose herbs, sprigs, powders', types: ['herb'] },
  { id: 'crystals', label: 'Crystals', hint: 'Stones, chips, clusters', types: ['crystal'] },
  { id: 'smoke', label: 'Smoke', hint: 'Incense, smoke, scent', types: ['incense', 'herb'] },
  { id: 'offering', label: 'Offering', hint: 'Food, drink, flowers, devotional gifts', types: ['offering'] },
  { id: 'moon-charge', label: 'Moon Charge', hint: 'Lunar exposure or ritual', types: [] },
  { id: 'sun-charge', label: 'Sun Charge', hint: 'Solar exposure or ritual', types: [] },
  { id: 'spoken-petition', label: 'Prayer / Breath', hint: 'Words, petition, song, breath', types: [] },
  { id: 'repeat-ritual', label: 'Repeat Ritual', hint: 'Rework or repeat the original rite', types: [] },
  { id: 'custom', label: 'Custom', hint: 'Anything else you want to record', types: [] },
];

/** livingStateActivityTypes: Charge, Ritual and Journal. */
export const ACTIVITY_TYPES: Record<Exclude<PracticeActivity, 'tend'>, { title: string; label: string; eventType: string; intro: string; optionsLabel: string; options: string[]; placeholder: string }> = {
  charge: {
    title: "Today's Charge",
    label: 'Manifestation Charged',
    eventType: 'charged',
    intro: 'Record how you would like to charge this manifestation today.',
    optionsLabel: 'How would you like to charge it?',
    options: ['Moon charge', 'Sun charge', 'Storm charge', 'Smoke charge', 'Crystal charge', 'Deity altar', 'Crossroads', 'Seasonal energy', 'Custom'],
    placeholder: 'Record anything you want to remember about this charge.',
  },
  ritual: {
    title: "Today's Ritual",
    label: 'Ritual Recorded',
    eventType: 'ritual',
    intro: 'Record a ritual connected to this manifestation.',
    optionsLabel: 'What kind of ritual is this?',
    options: ['Repeat original ritual', 'Protection', 'Cleansing', 'Devotional', 'Dreamwork', 'Moon ritual', 'Offering ritual', 'Custom'],
    placeholder: 'Record what happened, what you used, or what you want to remember.',
  },
  journal: {
    title: "Today's Journal",
    label: 'Journal Entry',
    eventType: 'journal',
    intro: 'Record an observation, reflection, dream, sign, or experience connected to this manifestation.',
    optionsLabel: 'What kind of entry is this?',
    options: ['Observation', 'Dream', 'Sign', 'Feeling', 'Result', 'Question', 'Message', 'Custom'],
    placeholder: 'Write your reflection here.',
  },
};

/** One support that could be used in a tending, as the website records it. */
export type TendChoice = { source: string; label: string; type: string; form: string; entityId: string; instanceId: string; itemId: string };

/** Every cabinet form and apothecary item (getAllLivingStateTendChoices). */
export function tendChoices(cabinet: CabinetItem[], apothecary: ApothecaryItem[]): TendChoice[] {
  return [
    ...cabinet
      .filter((item) => item.category !== 'backgrounds')
      .flatMap((item) =>
        item.forms.map((form) => ({
          source: 'cabinet',
          label: `${item.name} ${form.label || ''}`.trim(),
          type: form.type || item.category || '',
          form: form.form || '',
          entityId: '',
          instanceId: '',
          itemId: '',
        })),
      ),
    ...apothecary.map((item) => ({
      source: 'apothecary',
      label: item.name,
      type: item.typeLabel || item.type || 'Apothecary Item',
      form: item.type || '',
      entityId: item.entityId || '',
      instanceId: item.instanceId || '',
      itemId: item.id,
    })),
  ];
}

export const sameChoice = (a: TendChoice, b: TendChoice) => a.source === b.source && a.label === b.label && a.type === b.type;

/** Choices that fit the chosen methods and the search (updateLivingStateTendModal). */
export function filterTendChoices(choices: TendChoice[], methods: string[], search: string): TendChoice[] {
  const needle = search.toLowerCase().trim();
  return choices.filter((choice) => {
    if (methods.length) {
      const fits = methods.some((id) => {
        const method = TEND_METHODS.find((m) => m.id === id);
        return !!method && method.types.length > 0 && (method.types.includes(choice.type) || method.types.includes(choice.form));
      });
      if (!fits) return false;
    }
    return !needle || [choice.label, choice.source, choice.type, choice.form].join(' ').toLowerCase().includes(needle);
  });
}

/** formatLivingStateTendSummary: "Methods: Oil, Smoke. Supports: Basil Loose". */
export function tendSummary(choices: TendChoice[], methods: string[]): string {
  const methodLabels = methods.map((id) => TEND_METHODS.find((m) => m.id === id)?.label || id.replaceAll('-', ' ')).filter(Boolean);
  const choiceLabels = choices.map((c) => c.label).filter(Boolean);
  const parts: string[] = [];
  if (methodLabels.length) parts.push(`Methods: ${methodLabels.join(', ')}`);
  if (choiceLabels.length) parts.push(`Supports: ${choiceLabels.join(', ')}`);
  return parts.join('. ');
}

export type TendInput = {
  choices: TendChoice[];
  methods: string[];
  notes: string;
  resetReminder: boolean;
  nextDays: number;
  /** "Create this combination as a reusable Apothecary item", and its name (blank: "<name> Tending Blend"). */
  saveAsBlend?: boolean;
  blendName?: string;
};

/** How a tending blend's living_state is stored: it is never tended or reviewed itself. */
export const TENDING_BLEND_LIVING = { tending_enabled: false, tending_interval_days: null, expiration_enabled: false, expiration_days: null };

/**
 * The reusable Apothecary item a tending can be saved as
 * (createApothecaryItemFromTending), before it is tied to the Living Library.
 * Null when it wasn't asked for or nothing was used.
 */
export function tendingBlendItem(
  instance: Pick<ObjectInstance, 'name'> | null,
  input: TendInput,
  id: string,
  now: Date,
): ApothecaryItem | null {
  if (!input.saveAsBlend || !input.choices.length) return null;
  const nowIso = now.toISOString();
  const methodLabels = input.methods.map((m) => TEND_METHODS.find((method) => method.id === m)?.label || m).filter(Boolean);
  return {
    id,
    name: (input.blendName ?? '').trim() || `${instance?.name || 'Manifestation'} Tending Blend`,
    type: TENDING_BLEND.id,
    typeLabel: TENDING_BLEND.label,
    imagePath: TENDING_BLEND.image,
    intention: `Tending for ${instance?.name || 'manifestation'}`,
    notes: methodLabels.length ? `Methods: ${methodLabels.join(', ')}` : '',
    details: {},
    logToGrimoire: true,
    grimoireStatus: 'linked to Living Library',
    grimoireEntryId: '',
    entityId: '',
    instanceId: '',
    // In memory as normalizeApothecary reads TENDING_BLEND_LIVING back; stored as that.
    livingState: { tending_enabled: false, tending_interval_days: 30, expiration_enabled: false, expiration_days: 180 },
    ingredients: input.choices.map((choice) => ({
      label: choice.label,
      type: choice.type,
      form: choice.form,
      entityId: choice.entityId || '',
      libraryName: choice.label,
      libraryType: choice.type,
      amount: '',
    })),
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

/** The "tended" event and the instance changes submitLivingStateTendForm writes. */
export function tendRecord(
  instance: ObjectInstance,
  input: TendInput,
  now: Date,
  savedBlend: Pick<ApothecaryItem, 'id' | 'name'> | null = null,
): { event: EventInput; updates: Record<string, unknown> } {
  const notes = input.notes.trim();
  const savedNote = savedBlend ? `Saved for future tending as ${savedBlend.name}.` : '';
  const eventNotes = [tendSummary(input.choices, input.methods), notes, savedNote].filter(Boolean).join('\n\n') || 'Manifestation tended.';
  const nowIso = now.toISOString();
  const existing = (instance.metadata && typeof instance.metadata === 'object' ? instance.metadata : {}) as Record<string, unknown>;
  const nextInterval = input.nextDays || Number(instance.tending_interval_days) || Number(existing.tending_interval_days) || 30;
  const updates: Record<string, unknown> = {
    metadata: {
      ...existing,
      last_tended_at: nowIso,
      last_tending_summary: eventNotes,
      last_tending_choices: input.choices,
      last_tending_methods: input.methods,
      saved_tending_apothecary_item_id: savedBlend?.id || existing.saved_tending_apothecary_item_id || '',
    },
  };
  if (input.resetReminder && instance.tending_enabled !== false) {
    updates.tending_interval_days = nextInterval;
    updates.tending_due_at = addCalendarDays(now, nextInterval);
  }
  return {
    event: {
      type: 'tended',
      label: 'Manifestation Tended',
      notes: eventNotes,
      metadata: { choices: input.choices, methods: input.methods, notes, savedApothecaryItemId: savedBlend?.id || '' },
    },
    updates,
  };
}

/** The event a Charge, Ritual or Journal entry writes (submitLivingStateActivityForm). */
export function activityRecord(kind: Exclude<PracticeActivity, 'tend'>, options: string[], notes: string): EventInput {
  const config = ACTIVITY_TYPES[kind];
  const text = notes.trim();
  return {
    type: config.eventType,
    label: config.label,
    notes: [options.length ? `Type: ${options.join(', ')}` : '', text].filter(Boolean).join('\n\n') || config.title,
    metadata: { activityType: kind, options, notes: text },
  };
}
