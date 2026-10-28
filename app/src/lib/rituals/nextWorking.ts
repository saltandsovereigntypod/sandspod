// "Your next working": what Today and the Rituals home show first, from a
// ritual under way, your own next plan and your covens' next rite or meeting.
// Pure, so both screens (components/rituals/NextWorking) say the same thing.

import type { NextCovenRite } from '../covens/today.ts';

/** Your next plan, with its day and sky already put into words (lib/rituals/format). */
export type NextPlanLine = { id: string; title: string; when: string; sky: string };

export type NextWorkingTarget =
  | { kind: 'run' }
  | { kind: 'rite'; covenSlug: string; ritualId: string }
  | { kind: 'plan'; id: string }
  | { kind: 'planner' };

export type NextWorkingCard = {
  kind: 'active' | 'rite' | 'plan' | 'none';
  eyebrow: string;
  title: string;
  lines: string[];
  action: { label: string; target: NextWorkingTarget };
};

export type NextWorkingInput = {
  /** A ritual under way, and the step it's on. Leave out where it has a card of its own. */
  active?: { status?: string | null; title?: string | null; step?: string | null } | null;
  plan: NextPlanLine | null;
  rite: NextCovenRite | null;
  /** nextWorkingFirst(): which of the two comes first. */
  first: 'plan' | 'rite' | null;
};

export function nextWorkingCard({ active, plan, rite, first }: NextWorkingInput): NextWorkingCard {
  if (active) {
    return {
      kind: 'active',
      eyebrow: active.status === 'paused' ? 'Paused' : 'Under way',
      title: active.title || 'Your ritual',
      lines: [active.step || 'Finish and journal it when you are ready.'],
      action: { label: 'Continue the ritual', target: { kind: 'run' } },
    };
  }
  if (first === 'rite' && rite) {
    return {
      kind: 'rite',
      eyebrow: 'Your next working',
      title: rite.title,
      lines: [rite.detail, ...(plan ? [`Then your own: ${plan.title}, ${plan.when}`] : [])],
      action: { label: rite.meeting ? 'See the meeting' : 'See the rite', target: { kind: 'rite', covenSlug: rite.covenSlug, ritualId: rite.ritualId } },
    };
  }
  if (plan) {
    return {
      kind: 'plan',
      eyebrow: 'Your next working',
      title: plan.title,
      lines: [`${plan.when} · ${plan.sky}`, ...(rite ? [`Then with ${rite.covenName}: ${rite.title}`] : [])],
      action: { label: 'Open the plan', target: { kind: 'plan', id: plan.id } },
    };
  }
  return {
    kind: 'none',
    eyebrow: 'Your next working',
    title: 'Nothing planned yet',
    lines: ["Choose an intention and we'll find the right night."],
    action: { label: 'Plan a ritual', target: { kind: 'planner' } },
  };
}
