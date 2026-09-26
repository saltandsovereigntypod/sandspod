// Row shapes for the website's ritual tables (Supabase, public schema), plus the
// guest-on-device shapes from js/ritual-lifecycle.js. Every table is protected
// by row-level security: people only see their own rows.

export type CompletionMode = 'manual' | 'timed' | 'automatic';
export type StepStatus = 'pending' | 'active' | 'completed' | 'skipped';
export type SessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';
export type RitualSource = 'digital_altar' | 'manual' | 'template';

export type StepAction = { type: string; when: 'start' | 'end' | (string & {}) };

export type TemplateStepRow = {
  id: string;
  user_id?: string;
  template_id: string;
  sort_order: number;
  title: string;
  instructions: string | null;
  spoken_text: string | null;
  duration_seconds: number | null;
  completion_mode: CompletionMode;
  actions: StepAction[];
  linked_entities: unknown[];
  metadata: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type TemplateRow = {
  id: string;
  user_id?: string;
  title: string;
  intention: string | null;
  description: string | null;
  preparation: string | null;
  closing: string | null;
  linked_altar_id: string | null;
  grimoire_page_id: string | null;
  estimated_duration_seconds: number | null;
  status: 'draft' | 'active' | 'archived';
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  ritual_template_steps?: TemplateStepRow[];
};

export type SessionStepRow = {
  id: string;
  user_id?: string;
  session_id: string;
  template_step_id: string | null;
  sort_order: number;
  title: string;
  instructions: string | null;
  spoken_text: string | null;
  duration_seconds: number | null;
  completion_mode: CompletionMode;
  actions: StepAction[];
  linked_entities: unknown[];
  status: StepStatus;
  started_at: string | null;
  completed_at: string | null;
  elapsed_seconds: number;
  notes?: string | null;
  metadata: Record<string, unknown>;
};

export type SessionRow = {
  id: string;
  user_id: string | null;
  template_id: string | null;
  linked_altar_id: string | null;
  title: string | null;
  intention: string | null;
  source: RitualSource;
  status: SessionStatus;
  current_step_order: number;
  started_at: string;
  ended_at: string | null;
  paused_at: string | null;
  paused_seconds: number;
  altar_snapshot: Record<string, unknown>;
  context_snapshot: Record<string, unknown>;
  event_log: RitualEvent[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

/** A session together with its steps, as the app runs and stores it. */
export type RitualSession = SessionRow & { session_steps: SessionStepRow[] };

export type RitualEvent = {
  type: string;
  occurredAt: string;
  idempotencyKey?: string;
  [key: string]: unknown;
};

/** A journal entry: a row of user_rituals (the website's "Completed Rituals"). */
export type JournalRow = {
  id: string;
  user_id: string | null;
  title: string;
  intention: string | null;
  notes: string | null;
  moon_phase: string | null;
  linked_altar: string | null;
  tags: string[];
  ritual_date: string | null;
  source: RitualSource;
  template_id: string | null;
  session_id: string | null;
  linked_altar_id: string | null;
  grimoire_page_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  time_of_day: string | null;
  day_of_week: string | null;
  location?: string | null;
  preparation: string | null;
  what_happened_during: string | null;
  what_happened_after: string | null;
  feelings_before: string | null;
  feelings_during: string | null;
  feelings_after: string | null;
  signs_and_symbols: string | null;
  dreams_and_follow_up: string | null;
  results: string | null;
  changes_for_next_time: string | null;
  altar_snapshot: Record<string, unknown>;
  context_snapshot: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at?: string | null;
  updated_at?: string | null;
};

export type RitualLinkRow = {
  id?: string;
  user_id: string;
  template_id?: string | null;
  session_id?: string | null;
  ritual_id?: string | null;
  link_type: string;
  entity_id?: string | null;
  object_instance_id?: string | null;
  apothecary_item_id?: string | null;
  grimoire_page_id?: string | null;
  saved_altar_id?: string | null;
  label?: string | null;
  metadata: Record<string, unknown>;
  created_at?: string;
};

/** An ingredient chosen in the spell builder, by Library reference. */
export type Ingredient = { ref: string; name: string; type: string };

/**
 * A planned working. The ritual tables have no "planned" record, so plans
 * stay on the device (like reminders); they point at synced templates by id.
 */
export type RitualPlan = {
  id: string;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  /** Local time, HH:MM. */
  time: string;
  title: string;
  intention: string | null;
  intentionKey: string | null;
  templateId: string | null;
  /** A spell built on this device that isn't saved as a template yet. */
  draft: TemplateDraft | null;
  ingredients: Ingredient[];
  createdAt: string;
  /** Chose "Add to calendar" for this plan (off unless picked). */
  addToCalendar?: boolean;
  /** The phone calendar event written for it, so edits update it and it's never added twice. */
  calendarEventId?: string | null;
  calendarId?: string | null;
  /** Set once the ritual has begun; the plan then leaves "upcoming" and reminders. */
  doneAt?: string | null;
};

/** What the template editor and spell builder produce before saving. */
export type TemplateDraft = {
  id: string | null;
  title: string;
  intention: string;
  preparation: string;
  closing: string;
  linked_altar_id: string | null;
  grimoire_page_id: string | null;
  steps: StepDraft[];
  ingredients: Ingredient[];
  kind: 'template' | 'spell';
};

export type StepDraft = {
  id: string | null;
  title: string;
  instructions: string;
  spoken_text: string;
  /** Minutes as typed; blank for no timer. */
  minutes: string;
  completion_mode: CompletionMode;
  actions: StepAction[];
};

/** The questions the website's journal form asks after a ritual. */
export type JournalAnswers = {
  title: string;
  intention: string;
  moon_phase: string;
  feelings_before: string;
  what_happened_during: string;
  feelings_during: string;
  signs_and_symbols: string;
  what_happened_after: string;
  feelings_after: string;
  dreams_and_follow_up: string;
  results: string;
  changes_for_next_time: string;
  notes: string;
  manual_minutes: string;
  ritual_date: string;
};
