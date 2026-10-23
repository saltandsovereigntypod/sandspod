// An object's painted picture lit by the candles near it (lib/altar/litShader),
// drawn over the plain picture once it has loaded, flickering on its own clock.

import { Canvas, Fill, ImageShader, Shader, Skia, useClock, useImage, type DataSourceParam } from '@shopify/react-native-skia';
import type { ImageSourcePropType } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { LIT_SKSL, lightUniforms, type ObjectLight } from '../../lib/altar/litShader';

const effect = Skia.RuntimeEffect.Make(LIT_SKSL);

export const HAS_LIT = !!effect;

export function LitPicture({
  source,
  width,
  height,
  lights,
  gloss,
  reach,
  still,
}: {
  source: ImageSourcePropType;
  width: number;
  height: number;
  lights: ObjectLight[];
  gloss: number;
  reach: number;
  still: boolean;
}) {
  const image = useImage((typeof source === 'number' ? source : !Array.isArray(source) && source && typeof source === 'object' ? source.uri ?? null : null) as DataSourceParam);
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
