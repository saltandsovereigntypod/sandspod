// The web draws a snuffed candle's smoke as soft puffs (AltarStage); the
// phone's shader-drawn smoke is in SmokeFire.native.tsx.

import type { FlameLayout } from '../../lib/altar/flame';

export const HAS_SMOKE = false;

export function SmokeFire(_props: { layout: FlameLayout; width: number; height: number }) {
  return null;
}
