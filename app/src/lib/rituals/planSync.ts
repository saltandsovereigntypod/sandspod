// Planned workings sync to the `ritual_plans` table for signed-in people, so a
// plan made on the phone shows on the web app and every other device.
//
// A plan's calendar event belongs to the phone that wrote it, so those fields
// never leave the device. `syncedTo` records the account a plan was saved to:
// a plan without it hasn't reached the server yet (made offline, or as a guest
// before signing in) and is sent on the next sync.

import type { RitualPlan } from './types';

export type PlanRow = {
  id: string;
  user_id: string;
  planned_date: string;
  planned_time: string;
  title: string;
  intention: string | null;
  intention_key: string | null;
  template_id: string | null;
  draft: RitualPlan['draft'];
  ingredients: RitualPlan['ingredients'];
  done_at: string | null;
  created_at: string;
  updated_at: string;
};

const TIME = /^\d{1,2}:\d{2}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Whether a plan can be stored; the table requires a real date and HH:MM time. */
export function isSyncable(plan: Pick<RitualPlan, 'date' | 'title'>): boolean {
  return DATE.test(plan.date ?? '') && !!plan.title?.trim();
}

export function planRow(plan: RitualPlan, userId: string, now: Date = new Date()): PlanRow {
  return {
    id: plan.id,
    user_id: userId,
    planned_date: plan.date,
    planned_time: TIME.test(plan.time ?? '') ? plan.time : '21:00',
    title: plan.title.trim(),
    intention: plan.intention ?? null,
    intention_key: plan.intentionKey ?? null,
    template_id: plan.templateId ?? null,
    draft: plan.draft ?? null,
    ingredients: Array.isArray(plan.ingredients) ? plan.ingredients : [],
    done_at: plan.doneAt ?? null,
    created_at: plan.createdAt || now.toISOString(),
    updated_at: now.toISOString(),
  };
}

/** A stored plan, keeping this phone's calendar details when it already knows the plan. */
export function planFromRow(row: PlanRow, local?: RitualPlan | null): RitualPlan {
  return {
    id: row.id,
    date: row.planned_date,
    time: row.planned_time,
    title: row.title,
    intention: row.intention,
    intentionKey: row.intention_key,
    templateId: row.template_id,
    draft: row.draft ?? null,
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
    createdAt: row.created_at,
    doneAt: row.done_at,
    addToCalendar: local?.addToCalendar,
    calendarEventId: local?.calendarEventId ?? null,
    calendarId: local?.calendarId ?? null,
    syncedTo: row.user_id,
  };
}

/** Plans on this phone that still need sending to this account. */
export function unsyncedPlans(local: RitualPlan[]): RitualPlan[] {
  return local.filter((plan) => !plan.syncedTo && isSyncable(plan));
}

/**
 * What the phone should show for this account: everything stored, plus plans not
 * sent yet. A plan that was synced but is no longer stored was removed on another
 * device (or belongs to someone else who signed in here), so it is dropped.
 */
export function mergePlans(local: RitualPlan[], remote: PlanRow[], userId: string): RitualPlan[] {
  const localById = new Map(local.map((plan) => [plan.id, plan]));
  const stored = remote.filter((row) => row.user_id === userId).map((row) => planFromRow(row, localById.get(row.id)));
  const storedIds = new Set(stored.map((plan) => plan.id));
  const pending = unsyncedPlans(local).filter((plan) => !storedIds.has(plan.id));
  return [...stored, ...pending];
}
