// Payloads for the Supabase ritual tables. Only real columns go in, with the
// same values the website writes, so a ritual saved here opens on the website.

import { minutesToSeconds } from './lifecycle.ts';
import { isCustom } from './ingredients.ts';
import type {
  Ingredient,
  JournalRow,
  RitualLinkRow,
  RitualSession,
  SessionRow,
  SessionStepRow,
  TemplateDraft,
  TemplateRow,
  TemplateStepRow,
} from './types.ts';

export function sessionRow(session: RitualSession, userId: string): SessionRow {
  const { session_steps: _steps, ...row } = session;
  return {
    id: row.id,
    user_id: userId,
    template_id: row.template_id,
    linked_altar_id: row.linked_altar_id,
    title: row.title,
    intention: row.intention,
    source: row.source,
    status: row.status,
    current_step_order: row.current_step_order,
    started_at: row.started_at,
    ended_at: row.ended_at,
    paused_at: row.paused_at,
    paused_seconds: row.paused_seconds,
    altar_snapshot: row.altar_snapshot ?? {},
    context_snapshot: row.context_snapshot ?? {},
    event_log: row.event_log ?? [],
    metadata: row.metadata ?? {},
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function sessionStepRows(session: RitualSession, userId: string): SessionStepRow[] {
  return session.session_steps.map((step) => ({
    id: step.id,
    user_id: userId,
    session_id: session.id,
    template_step_id: step.template_step_id,
    sort_order: step.sort_order,
    title: step.title,
    instructions: step.instructions,
    spoken_text: step.spoken_text,
    duration_seconds: step.duration_seconds,
    completion_mode: step.completion_mode,
    actions: step.actions ?? [],
    linked_entities: step.linked_entities ?? [],
    status: step.status,
    started_at: step.started_at,
    completed_at: step.completed_at,
    elapsed_seconds: Math.max(0, Math.floor(step.elapsed_seconds || 0)),
    metadata: step.metadata ?? {},
  }));
}

/** Put a session back together from its table rows. */
export function sessionFromRows(row: SessionRow, steps: SessionStepRow[]): RitualSession {
  return {
    ...row,
    altar_snapshot: row.altar_snapshot ?? {},
    context_snapshot: row.context_snapshot ?? {},
    event_log: Array.isArray(row.event_log) ? row.event_log : [],
    metadata: row.metadata ?? {},
    session_steps: steps.filter((s) => s.session_id === row.id).sort((a, b) => a.sort_order - b.sort_order),
  };
}

export function journalRow(journal: JournalRow, userId: string): JournalRow {
  const { created_at: _created, updated_at: _updated, ...rest } = journal;
  return { ...rest, user_id: userId };
}

/**
 * ritual_templates + ritual_template_steps payloads, matching the website's
 * template editor (steps are replaced as a whole on every save).
 */
export function templatePayload(
  draft: TemplateDraft,
  options: { userId: string; id: string; stepIds: string[] },
): { template: Omit<TemplateRow, 'ritual_template_steps' | 'created_at' | 'updated_at' | 'description'>; steps: TemplateStepRow[] } {
  const steps: TemplateStepRow[] = draft.steps.map((step, index) => ({
    id: options.stepIds[index],
    user_id: options.userId,
    template_id: options.id,
    sort_order: index,
    title: step.title.trim(),
    instructions: step.instructions.trim() || null,
    spoken_text: step.spoken_text.trim() || null,
    duration_seconds: minutesToSeconds(step.minutes),
    completion_mode: step.completion_mode === 'timed' && minutesToSeconds(step.minutes) ? 'timed' : 'manual',
    actions: step.actions ?? [],
    linked_entities: [],
    metadata: {},
  }));
  const metadata: Record<string, unknown> = { editorVersion: 1, app: 'mobile' };
  if (draft.kind === 'spell') metadata.kind = 'spell';
  if (draft.ingredients.length) metadata.ingredients = draft.ingredients;

  return {
    template: {
      id: options.id,
      user_id: options.userId,
      title: draft.title.trim(),
      intention: draft.intention.trim() || null,
      preparation: draft.preparation.trim() || null,
      closing: draft.closing.trim() || null,
      linked_altar_id: draft.linked_altar_id,
      grimoire_page_id: draft.grimoire_page_id,
      estimated_duration_seconds: steps.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0),
      status: 'active',
      settings: {},
      metadata,
    },
    steps,
  };
}

/** The Book of Shadows page metadata the website keeps for each template. */
export function templatePageMetadata(template: Pick<TemplateRow, 'id' | 'intention' | 'preparation' | 'closing'>) {
  return {
    ritualTemplateId: template.id,
    intention: template.intention || '',
    preparation: template.preparation || '',
    closing: template.closing || '',
  };
}

/** Same identity the website uses to avoid duplicate ritual_links. */
export function linkIdentity(link: Partial<RitualLinkRow>): string {
  return [
    link.link_type,
    link.entity_id ?? '',
    link.object_instance_id ?? '',
    link.apothecary_item_id ?? '',
    link.grimoire_page_id ?? '',
    link.saved_altar_id ?? '',
  ].join(':');
}

export function uniqueLinks(links: RitualLinkRow[], existing: Partial<RitualLinkRow>[] = []): RitualLinkRow[] {
  const seen = new Set(existing.map(linkIdentity));
  return links.filter((link) => {
    const id = linkIdentity(link);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/** Links for a journal entry: its altar and the Library ingredients used. */
export function journalLinks(journal: JournalRow, userId: string, ingredients: Ingredient[]): RitualLinkRow[] {
  const links: RitualLinkRow[] = ingredients.filter((item) => !isCustom(item)).map((item) => ({
    user_id: userId,
    ritual_id: journal.id,
    link_type: 'used_entity',
    entity_id: item.ref,
    label: item.name,
    metadata: { type: item.type, source: 'app' },
  }));
  if (journal.linked_altar_id) {
    links.push({
      user_id: userId,
      ritual_id: journal.id,
      link_type: 'altar',
      saved_altar_id: journal.linked_altar_id,
      label: 'Linked altar',
      metadata: {},
    });
  }
  return uniqueLinks(links);
}

/** Links for a template: the Library ingredients the spell calls for. */
export function templateLinks(templateId: string, userId: string, ingredients: Ingredient[]): RitualLinkRow[] {
  return uniqueLinks(
    ingredients.filter((item) => !isCustom(item)).map((item) => ({
      user_id: userId,
      template_id: templateId,
      link_type: 'suggested_entity',
      entity_id: item.ref,
      label: item.name,
      metadata: { type: item.type, source: 'app' },
    })),
  );
}

/**
 * The Living Library "My Practice" entry the website keeps for each journal
 * entry (entity "ritual:<id>"), so rituals recorded here show up there too.
 * Image, layout and community notes are left alone: the website owns those.
 */
export function journalLibraryEntry(journal: JournalRow, userId: string, now: Date) {
  const items = (journal.altar_snapshot as { objects?: { label?: string }[] })?.objects ?? [];
  return {
    user_id: userId,
    entity_id: `ritual:${journal.id}`,
    name: journal.title || 'Untitled Ritual',
    type: 'ritual',
    my_practice: {
      EntryType: 'Completed Ritual',
      Date: journal.ritual_date || '',
      DayOfWeek: journal.day_of_week || '',
      TimeOfDay: journal.time_of_day || '',
      MoonPhase: journal.moon_phase || '',
      DurationSeconds: Number(journal.duration_seconds || 0),
      Intention: journal.intention || '',
      FeelingsBefore: journal.feelings_before || '',
      WhatHappenedDuring: journal.what_happened_during || '',
      FeelingsDuring: journal.feelings_during || '',
      SignsAndSymbols: journal.signs_and_symbols || '',
      WhatHappenedAfter: journal.what_happened_after || '',
      FeelingsAfter: journal.feelings_after || '',
      DreamsAndFollowUp: journal.dreams_and_follow_up || '',
      Results: journal.results || '',
      ChangesForNextTime: journal.changes_for_next_time || '',
      Notes: journal.notes || '',
      AltarItems: items.map((i) => i.label).filter(Boolean),
      RitualId: journal.id,
      SessionId: journal.session_id || '',
      RitualTemplateId: journal.template_id || '',
      LinkedAltarId: journal.linked_altar_id || '',
    },
    updated_at: now.toISOString(),
  };
}

export function templateLibraryEntry(template: Pick<TemplateRow, 'id' | 'title' | 'intention' | 'preparation' | 'closing' | 'estimated_duration_seconds' | 'linked_altar_id' | 'status'>, userId: string, now: Date) {
  return {
    user_id: userId,
    entity_id: `ritual-template:${template.id}`,
    name: template.title || 'Untitled Ritual Template',
    type: 'ritual_template',
    my_practice: {
      EntryType: 'Ritual Template',
      Purpose: template.intention || '',
      Preparation: template.preparation || '',
      Closing: template.closing || '',
      EstimatedDurationSeconds: Number(template.estimated_duration_seconds || 0),
      LinkedAltarId: template.linked_altar_id || '',
      RitualTemplateId: template.id,
      Status: template.status || 'active',
    },
    updated_at: now.toISOString(),
  };
}
