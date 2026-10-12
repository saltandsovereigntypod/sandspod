// Candle actions on ritual steps, as the website's template editor and ritual
// automation have them (altar/js/features/ritual-template-editor.js
// buildRitualStepActions, altar/js/features/ritual-automation.js). A step keeps
// them in `actions` as [{ type, when }], with at most one per moment.

import { appendEvent } from './lifecycle.ts';
import type { RitualSession, SessionStepRow, StepAction } from './types.ts';

export type CandleAction = 'none' | 'light_all' | 'extinguish_all';
export type ActionMoment = 'start' | 'end';

export const CANDLE_ACTIONS: { value: CandleAction; label: string }[] = [
  { value: 'none', label: 'No candle action' },
  { value: 'light_all', label: 'Light all candles' },
  { value: 'extinguish_all', label: 'Extinguish all candles' },
];

export function candleActionLabel(type: string): string {
  return CANDLE_ACTIONS.find((a) => a.value === type)?.label ?? type;
}

/** The action for one moment, as the editor reads it ("none" when there is none). */
export function candleAction(actions: StepAction[] | null | undefined, when: ActionMoment): CandleAction {
  const type = (Array.isArray(actions) ? actions : []).find((a) => a.when === when)?.type;
  return type === 'light_all' || type === 'extinguish_all' ? type : 'none';
}

/** Change one moment's action. The result is built like the website's: start first, then end. */
export function withCandleAction(actions: StepAction[] | null | undefined, when: ActionMoment, type: CandleAction): StepAction[] {
  const start = when === 'start' ? type : candleAction(actions, 'start');
  const end = when === 'end' ? type : candleAction(actions, 'end');
  const next: StepAction[] = [];
  if (start !== 'none') next.push({ type: start, when: 'start' });
  if (end !== 'none') next.push({ type: end, when: 'end' });
  return next;
}

/** Action types to carry out for a step at one moment, in order. */
export function stepActions(step: Pick<SessionStepRow, 'actions'> | null | undefined, when: ActionMoment): string[] {
  if (!step || !Array.isArray(step.actions)) return [];
  return step.actions.filter((a) => a.when === when).map((a) => a.type);
}

/**
 * What completing a step sets off (completeCurrentRitualStepWithAutomation):
 * the finished step's end actions, then the next step's start actions.
 * Skipping a step runs nothing, as on the website.
 */
export function completionActions(before: RitualSession, after: RitualSession): string[] {
  const finished = before.session_steps.find((s) => s.status === 'active');
  if (!finished) return [];
  const now = after.session_steps.find((s) => s.id === finished.id);
  if (now?.status !== 'completed') return [];
  const next = after.session_steps.find((s) => s.status === 'active' && s.id !== finished.id);
  return [...stepActions(finished, 'end'), ...stepActions(next, 'start')];
}

/**
 * The first step's start actions, when the session was begun in the app and
 * they haven't run yet (the website logs "step_actions_started" once they have).
 */
export function firstStepActionsDue(session: RitualSession): SessionStepRow | null {
  if (session.metadata?.app !== 'mobile' || session.status !== 'active') return null;
  const first = [...session.session_steps].sort((a, b) => a.sort_order - b.sort_order)[0];
  if (!first || first.status !== 'active' || !stepActions(first, 'start').length) return null;
  const logged = (session.event_log ?? []).some((e) => e.type === 'step_actions_started' && e.stepId === first.id);
  return logged ? null : first;
}

/** Record that a step's start actions ran, so they never run twice. */
export function markStepActionsStarted(session: RitualSession, step: SessionStepRow, now: Date): RitualSession {
  return appendEvent(
    session,
    {
      type: 'step_actions_started',
      stepId: step.id,
      sortOrder: step.sort_order,
      idempotencyKey: `step_actions_started:${session.id}:${step.id}`,
    },
    now,
  );
}
