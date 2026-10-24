// An object's painted picture lit by the candles near it (lib/altar/litShader),
// drawn over the plain picture once it has loaded, flickering on its own clock.

import { Canvas, Fill, ImageShader, Shader, Skia, useClock } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import type { AltarPicture } from '../../lib/altar/assets';
import { LIT_SKSL, lightUniforms, type ObjectLight } from '../../lib/altar/litShader';
import { useAltarSkiaImage } from './altarSkiaImage';

const effect = Skia.RuntimeEffect.Make(LIT_SKSL);

export const HAS_LIT = !!effect;

export function LitPicture({
  picture,
  width,
  height,
  lights,
  gloss,
  reach,
  still,
}: {
  picture: AltarPicture;
  width: number;
  height: number;
  lights: ObjectLight[];
  gloss: number;
  reach: number;
  still: boolean;
}) {
  const image = useAltarSkiaImage(picture);
  const clock = useClock();
  const flat = lightUniforms(lights);
  const count = Math.min(4, lights.length);
  const uniforms = useDerivedValue(() => ({
    size: [width, height],
    lights: flat,
    count,
    time: still ? 0 : clock.value / 1000,
    gloss,
    reach,
  }));
  if (!effect || !image || !(width > 0) || !(height > 0)) return null;
  return (
    <Canvas style={{ position: 'absolute', left: 0, top: 0, width, height }} pointerEvents="none">
      <Fill>
        <Shader source={effect} uniforms={uniforms}>
          <ImageShader image={image} fit="contain" rect={{ x: 0, y: 0, width, height }} tx="decal" ty="decal" />
        </Shader>
      </Fill>
    </Canvas>
  );
}
