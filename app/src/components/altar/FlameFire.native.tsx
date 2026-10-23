// The flame's fire on the phone: the flame shader (lib/altar/flameShader)
// drawn in the flame's box on its own clock, its rising turbulence never
// repeating, inside the flame's animated shape, lean and flicker.

import { Canvas, Fill, Shader, Skia, useClock } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { FLAME_SKSL, flameFrame } from '../../lib/altar/flameShader';

const effect = Skia.RuntimeEffect.Make(FLAME_SKSL);

export const HAS_FIRE = !!effect;

export function FlameFire({ width, height, part, seed, still }: { width: number; height: number; part: 'body' | 'tip'; seed: number; still: boolean }) {
  const clock = useClock();
  const { origin, scale } = flameFrame(width, height);
  const uniforms = useDerivedValue(() => ({
    time: still ? 0 : clock.value / 1000,
    seed,
    part: part === 'tip' ? 1 : 0,
    origin,
    scale,
  }));
  if (!effect || !(width > 0) || !(height > 0)) return null;
  return (
    <Canvas style={{ position: 'absolute', left: 0, top: 0, width, height }} pointerEvents="none">
      <Fill>
        <Shader source={effect} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}
