// Begin a sit: the plan and its extras (guidance, focus, sound, intention,
// programme) as the sit screen's route params, and any more (a recorded
// voice: `voice`, `captions`).

import { router } from 'expo-router';

import { extrasParams, type SitExtras } from '../../lib/meditation/extras';
import { planParams, type SitPlan } from '../../lib/meditation/timer';

export function beginSit(plan: SitPlan, extras: SitExtras, more: Record<string, string> = {}) {
  router.push({ pathname: '/rituals/craft/meditation/sit', params: { ...planParams(plan), ...extrasParams(extras), ...more } });
}
