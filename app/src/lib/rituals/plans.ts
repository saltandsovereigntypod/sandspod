// Planned workings and the journal: ordering and what each one links to.

import { dateFromKey } from './lifecycle.ts';
import type { JournalRow, RitualLinkRow, RitualPlan, TemplateRow } from './types.ts';

/** When a plan happens, in local time. */
export function planStart(plan: Pick<RitualPlan, 'date' | 'time'>): Date | null {
  const day = dateFromKey(plan.date);
  if (!day) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(plan.time ?? '');
  const hours = match ? Math.min(23, +match[1]) : 21;
  const minutes = match ? Math.min(59, +match[2]) : 0;
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
}

/**
 * Plans still ahead, soonest first. A plan stays "ahead" for the rest of its
 * day, so tonight's working is still shown after its start time has passed.
 */
export function upcomingPlans(plans: RitualPlan[], now: Date): RitualPlan[] {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return plans
    .filter((plan) => !plan.doneAt)
    .map((plan) => ({ plan, start: planStart(plan) }))
    .filter((entry): entry is { plan: RitualPlan; start: Date } => !!entry.start && entry.start.getTime() >= todayStart)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((entry) => entry.plan);
}

export function nextPlan(plans: RitualPlan[], now: Date): RitualPlan | null {
  return upcomingPlans(plans, now)[0] ?? null;
}

/** Newest first: by ritual date, then by when it was recorded. */
export function sortJournal(entries: JournalRow[]): JournalRow[] {
  const key = (e: JournalRow) => e.ended_at || e.started_at || e.ritual_date || e.created_at || '';
  return [...entries].sort((a, b) => {
    const byDay = (b.ritual_date ?? '').localeCompare(a.ritual_date ?? '');
    return byDay !== 0 ? byDay : key(b).localeCompare(key(a));
  });
}

export type RitualConnections = {
  grimoirePageId: string | null;
  altarId: string | null;
  templateId: string | null;
  date: string | null;
  ingredients: { ref: string; name: string }[];
};

/** Everything a journal entry is one tap from, where that data exists. */
export function journalConnections(entry: JournalRow, links: RitualLinkRow[], templates: TemplateRow[]): RitualConnections {
  const own = links.filter((l) => l.ritual_id === entry.id);
  const template = entry.template_id ? templates.find((t) => t.id === entry.template_id) ?? null : null;
  const fromMeta = Array.isArray(entry.metadata?.ingredients) ? (entry.metadata.ingredients as { ref: string; name: string }[]) : [];
  const fromLinks = own
    .filter((l) => l.link_type === 'used_entity' && l.entity_id?.startsWith('traditional/'))
    .map((l) => ({ ref: l.entity_id as string, name: l.label ?? l.entity_id ?? '' }));
  const seen = new Set<string>();
  const ingredients = [...fromMeta, ...fromLinks].filter((i) => i?.ref && !seen.has(i.ref) && !!seen.add(i.ref));

  return {
    grimoirePageId: entry.grimoire_page_id ?? own.find((l) => l.grimoire_page_id)?.grimoire_page_id ?? null,
    altarId: entry.linked_altar_id ?? own.find((l) => l.saved_altar_id)?.saved_altar_id ?? template?.linked_altar_id ?? null,
    templateId: template ? template.id : null,
    date: entry.ritual_date,
    ingredients,
  };
}

/** The plan's ritual, if it points at a template that still exists. */
export function planTemplate(plan: RitualPlan, templates: TemplateRow[]): TemplateRow | null {
  return plan.templateId ? templates.find((t) => t.id === plan.templateId) ?? null : null;
}
