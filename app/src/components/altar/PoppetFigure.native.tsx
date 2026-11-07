// A poppet as it looks (lib/altar/workings/poppetLook poppetPlan), on the
// phone: its body dyed through a colour matrix, its eyes and pins with their
// shadows and puckers, put together once into a Skia image and then drawn,
// lit by the candles near it on the altar (lib/altar/litShader) as every
// other painted object is. The web's canvas copy is PoppetFigure.tsx.

import { BlendMode, BlurStyle, Canvas, Fill, Image, ImageShader, Shader, Skia, TileMode, useClock, type SkImage } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { PixelRatio } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { altarPicture } from '../../lib/altar/assets';
import { LIT_SKSL, lightUniforms, type ObjectLight } from '../../lib/altar/litShader';
import { partPath, poppetPlan, PUCKER_RGB, SHADOW_RGB, type LookInput, type PartKey, type PinInput, type PoppetPicture } from '../../lib/altar/workings/poppetLook';
import { useAltarSkiaImage } from './altarSkiaImage';

const effect = Skia.RuntimeEffect.Make(LIT_SKSL);

type Props = { look: LookInput; pins: PinInput[]; width: number; height: number; lights?: ObjectLight[]; reach?: number; still?: boolean; dim?: boolean };

function usePart(plan: PoppetPicture | null, part: PartKey) {
  const path = plan ? partPath(plan, part) : '';
  const picture = useMemo(() => (path ? altarPicture(path) : null), [path]);
  return useAltarSkiaImage(picture);
}

function compose(plan: PoppetPicture, parts: Record<PartKey, SkImage | null>, scale: number): SkImage | null {
  const surface = Skia.Surface.Make(Math.max(1, Math.round(plan.width * scale)), Math.max(1, Math.round(plan.height * scale)));
  if (!surface) return null;
  const canvas = surface.getCanvas();
  canvas.scale(scale, scale);
  for (const step of plan.steps) {
    if (step.kind === 'pucker') {
      const paint = Skia.Paint();
      paint.setColor(Skia.Color(`rgba(${PUCKER_RGB.join(',')},${step.opacity})`));
      paint.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, step.blur, true));
      canvas.drawOval(Skia.XYWHRect(step.cx - step.rx, step.cy - step.ry, step.rx * 2, step.ry * 2), paint);
      continue;
    }
    const image = parts[step.part];
    if (!image) continue;
    const paint = Skia.Paint();
    canvas.save();
    if (step.kind === 'shadow') {
      paint.setColorFilter(Skia.ColorFilter.MakeBlend(Skia.Color(`rgb(${SHADOW_RGB.join(',')})`), BlendMode.SrcIn));
      paint.setAlphaf(step.opacity);
      paint.setImageFilter(Skia.ImageFilter.MakeBlur(step.blur, step.blur, TileMode.Decal, null));
      canvas.translate(step.dx, step.dy);
    } else {
      if (step.matrix) paint.setColorFilter(Skia.ColorFilter.MakeMatrix(step.matrix));
      paint.setAlphaf(step.opacity);
    }
    if (step.rot) canvas.rotate(step.rot, step.ox, step.oy);
    canvas.drawImageRect(image, Skia.XYWHRect(0, 0, image.width(), image.height()), Skia.XYWHRect(step.x, step.y, step.w, step.h), paint);
    canvas.restore();
  }
  surface.flush();
  return surface.makeImageSnapshot();
}

export function PoppetFigure({ look, pins, width, height, lights, reach = 0, still = true, dim }: Props) {
  const plan = useMemo(() => poppetPlan(look, pins), [look, pins]);
  const body = usePart(plan, 'body');
  const eye = usePart(plan, 'eye');
  const pinHead = usePart(plan, 'pinHead');
  const pinGlint = usePart(plan, 'pinGlint');
  const pinStub = usePart(plan, 'pinStub');
  const ready = !!plan && !!body && (plan.eye === 'none' || !!eye) && (!pins.length || (!!pinHead && !!pinGlint && !!pinStub));
  // Drawn at the size it's shown (on this screen's pixels), never above the pictures' own.
  const scale = plan ? Math.min(1, Math.min(width / plan.width, height / plan.height) * PixelRatio.get()) : 1;
  const image = useMemo(
    () => (ready && plan ? compose(plan, { body, eye, pinHead, pinGlint, pinStub }, scale) : null),
    [ready, plan, body, eye, pinHead, pinGlint, pinStub, scale],
  );
  const clock = useClock();
  const flat = lightUniforms(lights ?? []);
  const count = Math.min(4, lights?.length ?? 0);
  const uniforms = useDerivedValue(() => ({ size: [width, height], lights: flat, count, time: still ? 0 : clock.value / 1000, gloss: 0.15, reach }));
  if (!image || !(width > 0) || !(height > 0)) return null;
  return (
    <Canvas style={{ width, height, opacity: dim ? 0.62 : 1 }} pointerEvents="none">
      {effect && count > 0 ? (
        <Fill>
          <Shader source={effect} uniforms={uniforms}>
            <ImageShader image={image} fit="contain" rect={{ x: 0, y: 0, width, height }} tx="decal" ty="decal" />
          </Shader>
        </Fill>
      ) : (
        <Image image={image} fit="contain" x={0} y={0} width={width} height={height} />
      )}
    </Canvas>
  );
}
