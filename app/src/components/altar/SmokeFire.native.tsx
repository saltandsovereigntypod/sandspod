// The smoke off a candle just put out, on the phone: the smoke shader
// (lib/altar/smokeShader) rising from the wick, on its own clock from the
// moment the flame went out.

import { Canvas, Fill, Shader, Skia, useClock } from '@shopify/react-native-skia';
import { useState } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import type { FlameLayout } from '../../lib/altar/flame';
import { flameFrame } from '../../lib/altar/flameShader';
import { SMOKE_SKSL } from '../../lib/altar/smokeShader';

const effect = Skia.RuntimeEffect.Make(SMOKE_SKSL);

export const HAS_SMOKE = !!effect;

export function SmokeFire({ layout, width, height }: { layout: FlameLayout; width: number; height: number }) {
  const clock = useClock();
  const [seed] = useState(() => Math.random() * 10);
  // The wick, where the flame's drawing has its foot, in the object's box.
  const fw = width * 0.1;
  const fh = (layout.flameHeight / 100) * height;
  const { origin, scale } = flameFrame(fw, fh);
  const wickX = ((layout.centerX - 5) / 100) * width + origin[0] + 5 * scale;
  const wickY = (layout.flameTop / 100) * height + origin[1] + 17.4 * scale;
  // Room for it to rise and drift: a tall column over the wick.
  const w = scale * 40;
  const h = scale * 72;
  const left = wickX - w / 2;
  const top = wickY - h + scale * 2;
  const uniforms = useDerivedValue(() => ({ time: clock.value / 1000, seed, wick: [wickX - left, wickY - top], scale }));
  if (!effect || !(scale > 0)) return null;
  return (
    <Canvas style={{ position: 'absolute', left, top, width: w, height: h }} pointerEvents="none">
      <Fill>
        <Shader source={effect} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}
