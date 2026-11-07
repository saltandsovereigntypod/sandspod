// A poppet as it looks (lib/altar/workings/poppetLook poppetPlan), on the
// web: the same drawing steps the phone makes with Skia
// (PoppetFigure.native.tsx), on a canvas. The dye is the same colour matrix,
// worked over the body's pixels; shadows are the canvas's own blurred
// shadows, cast from a copy drawn out of sight.

import { Asset } from 'expo-asset';
import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { PixelRatio, View } from 'react-native';

import { altarPicture } from '../../lib/altar/assets';
import type { ObjectLight } from '../../lib/altar/litShader';
import { pixelRect } from '../../lib/altar/pictureCrop';
import { partPath, poppetPlan, PUCKER_RGB, SHADOW_RGB, type LookInput, type PartKey, type PinInput, type PoppetPicture } from '../../lib/altar/workings/poppetLook';

type Props = { look: LookInput; pins: PinInput[]; width: number; height: number; lights?: ObjectLight[]; reach?: number; still?: boolean; dim?: boolean };
type Part = HTMLCanvasElement | null;

const PARTS: PartKey[] = ['body', 'eye', 'pinHead', 'pinGlint', 'pinStub'];
// Each part cut from its sheet once, and each dye of it once.
const cut = new Map<string, Promise<HTMLCanvasElement | null>>();
const dyed = new WeakMap<HTMLCanvasElement, Map<string, HTMLCanvasElement>>();

function urlOf(source: unknown): string | null {
  if (typeof source === 'number') return Asset.fromModule(source).uri;
  if (typeof source === 'string') return source;
  if (source && typeof source === 'object' && 'uri' in source) return String((source as { uri: string }).uri);
  return null;
}

function loadPart(path: string): Promise<HTMLCanvasElement | null> {
  const known = cut.get(path);
  if (known) return known;
  const p = new Promise<HTMLCanvasElement | null>((resolve) => {
    const picture = altarPicture(path);
    const url = picture ? urlOf(picture.source) : null;
    if (!picture || !url) return resolve(null);
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const r = picture.crop ? pixelRect(img.naturalWidth, img.naturalHeight, picture.crop) : { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
      const c = document.createElement('canvas');
      c.width = r.w;
      c.height = r.h;
      c.getContext('2d')?.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
      resolve(c);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
  cut.set(path, p);
  return p;
}

/** The part with the colour matrix worked over its pixels (unpremultiplied, as Skia's colour filter works). */
function dye(part: HTMLCanvasElement, matrix: number[]): HTMLCanvasElement {
  const key = matrix.map((n) => n.toFixed(4)).join(',');
  const mine = dyed.get(part) ?? new Map<string, HTMLCanvasElement>();
  dyed.set(part, mine);
  const known = mine.get(key);
  if (known) return known;
  const c = document.createElement('canvas');
  c.width = part.width;
  c.height = part.height;
  const ctx = c.getContext('2d');
  if (!ctx) return part;
  ctx.drawImage(part, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const px = data.data;
  const m = matrix;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue;
    const r = px[i] / 255;
    const g = px[i + 1] / 255;
    const b = px[i + 2] / 255;
    px[i] = 255 * (m[0] * r + m[1] * g + m[2] * b);
    px[i + 1] = 255 * (m[5] * r + m[6] * g + m[7] * b);
    px[i + 2] = 255 * (m[10] * r + m[11] * g + m[12] * b);
  }
  ctx.putImageData(data, 0, 0);
  if (mine.size > 20) mine.clear();
  mine.set(key, c);
  return c;
}

function draw(canvas: HTMLCanvasElement, plan: PoppetPicture, parts: Record<PartKey, Part>, scale: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  // Shadows are cast from a copy drawn this far off to the left, so only the shadow lands.
  const away = plan.width * 3;
  for (const step of plan.steps) {
    ctx.save();
    if (step.kind === 'pucker') {
      ctx.translate(step.cx, step.cy);
      ctx.scale(1, step.ry / step.rx);
      const reach = step.rx + step.blur * 2;
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, reach);
      g.addColorStop(0, `rgba(${PUCKER_RGB.join(',')},${step.opacity})`);
      g.addColorStop(step.rx / reach, `rgba(${PUCKER_RGB.join(',')},${step.opacity * 0.5})`);
      g.addColorStop(1, `rgba(${PUCKER_RGB.join(',')},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, reach, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }
    const part = parts[step.part];
    if (!part) {
      ctx.restore();
      continue;
    }
    if (step.rot) {
      ctx.translate(step.ox, step.oy);
      ctx.rotate((step.rot * Math.PI) / 180);
      ctx.translate(-step.ox, -step.oy);
    }
    if (step.kind === 'shadow') {
      // The canvas's shadow offset is in pixels and ignores the turn; the copy goes `away` along the turned x.
      const rad = (step.rot * Math.PI) / 180;
      ctx.shadowColor = `rgba(${SHADOW_RGB.join(',')},${step.opacity})`;
      ctx.shadowBlur = step.blur * 2 * scale;
      ctx.shadowOffsetX = (away * Math.cos(rad) + step.dx) * scale;
      ctx.shadowOffsetY = (away * Math.sin(rad) + step.dy) * scale;
      ctx.drawImage(part, step.x - away, step.y, step.w, step.h);
    } else {
      ctx.globalAlpha = step.opacity;
      ctx.drawImage(step.matrix ? dye(part, step.matrix) : part, step.x, step.y, step.w, step.h);
    }
    ctx.restore();
  }
}

export function PoppetFigure({ look, pins, width, height, dim }: Props) {
  const plan = useMemo(() => poppetPlan(look, pins), [look, pins]);
  const [loaded, setLoaded] = useState<{ paths: string; parts: Record<PartKey, Part> } | null>(null);
  const ref = useRef<HTMLCanvasElement | null>(null);
  const paths = plan ? PARTS.map((p) => partPath(plan, p)).join('|') : '';
  useEffect(() => {
    let live = true;
    if (!plan) return;
    Promise.all(PARTS.map((p) => (partPath(plan, p) ? loadPart(partPath(plan, p)) : Promise.resolve(null)))).then((got) => {
      if (live) setLoaded({ paths, parts: Object.fromEntries(PARTS.map((p, i) => [p, got[i]])) as Record<PartKey, Part> });
    });
    return () => {
      live = false;
    };
    // The parts change only with the body and eyes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paths]);
  const fit = plan ? Math.min(width / plan.width, height / plan.height) : 1;
  const scale = Math.min(1, fit * PixelRatio.get());
  const w = plan ? Math.max(1, Math.round(plan.width * scale)) : 1;
  const h = plan ? Math.max(1, Math.round(plan.height * scale)) : 1;
  // Drawn only once this body's and eyes' own pictures are in (never another body's).
  const parts = loaded?.paths === paths ? loaded.parts : null;
  useEffect(() => {
    if (ref.current && plan && parts) draw(ref.current, plan, parts, scale);
  }, [plan, parts, scale]);
  if (!plan || !(width > 0) || !(height > 0)) return null;
  return (
    <View pointerEvents="none" style={{ width, height, alignItems: 'center', justifyContent: 'center', opacity: dim ? 0.62 : 1 }}>
      {createElement('canvas', { ref, width: w, height: h, style: { width: plan.width * fit, height: plan.height * fit, display: 'block' } })}
    </View>
  );
}
