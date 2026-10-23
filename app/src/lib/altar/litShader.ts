// Candlelight falling on an object's painted picture, as a Skia shader: the
// picture keeps every brushstroke, but its shape is read from its outline
// (the middle bulges toward you, the edges curve away, and the paint's own
// light and dark add the small bumps), and each lit candle near it lights
// that shape: the side facing the flame warms and brightens, the far side
// falls into shade, glossy things (crystals, glass) catch a glint, and the
// light flickers a little. Far from any lit candle a picture is unchanged.
// Pure: the shader text, and where its lights come from.

export const LIT_SKSL = `
uniform shader image;
uniform float2 size;
uniform float4 lights[4];
uniform float count;
uniform float time;
uniform float gloss;
uniform float reach;

float hash(float n) { return fract(sin(n) * 43758.5453); }
float flick(float t, float i) {
  float a = hash(floor(t * 9.0) + i * 7.0);
  float b = hash(floor(t * 9.0) + 1.0 + i * 7.0);
  return mix(a, b, fract(t * 9.0));
}

half4 main(float2 p) {
  half4 c = image.eval(p);
  if (c.a < 0.004) return c;
  // The shape: which way the surface faces, from how far the outline is in each direction.
  float r = min(size.x, size.y) * 0.05;
  float2 g = float2(0.0);
  for (int i = 0; i < 8; i++) {
    float ang = float(i) * 0.7853982;
    float2 d = float2(cos(ang), sin(ang));
    for (int k = 1; k <= 3; k++) {
      g += d * (1.0 - float(image.eval(p + d * r * float(k)).a)) / float(k);
    }
  }
  // The paint's own light and dark as small bumps.
  float lum = dot(float3(c.rgb), float3(0.299, 0.587, 0.114)) / max(float(c.a), 0.001);
  float lx = dot(float3(image.eval(p + float2(1.5, 0.0)).rgb), float3(0.333)) - dot(float3(image.eval(p - float2(1.5, 0.0)).rgb), float3(0.333));
  float ly = dot(float3(image.eval(p + float2(0.0, 1.5)).rgb), float3(0.333)) - dot(float3(image.eval(p - float2(0.0, 1.5)).rgb), float3(0.333));
  float3 n = normalize(float3(g * 0.9 - float2(lx, ly) * 1.6, 1.0));

  // Each light: brighter and warmer where the surface turns toward it, darker where it turns away
  // (measured against a surface facing straight out, so a flat middle keeps its own paint).
  float side = 0.0;
  float glow = 0.0;
  float glint = 0.0;
  for (int i = 0; i < 4; i++) {
    if (float(i) >= count) break;
    float4 l = lights[i];
    float3 toLight = float3(l.xy - p, l.w);
    float dist = length(toLight.xy);
    float3 L = normalize(toLight);
    float near = l.z / (1.0 + (dist * dist) / (reach * reach));
    float f = 0.82 + 0.18 * flick(time, float(i));
    side += (dot(n, L) - L.z) * near * f;
    glow += near * f;
    float3 H = normalize(L + float3(0.0, 0.0, 1.0));
    glint += pow(max(dot(n, H), 0.0), 60.0) * near * f;
  }
  float3 base = float3(c.rgb) / max(float(c.a), 0.001);
  float b = clamp(1.0 + side * 1.6, 0.45, 1.7);
  float3 tint = mix(float3(1.0), float3(1.0, 0.8, 0.58), clamp(glow * 0.45, 0.0, 0.5));
  float3 lit = base * b * tint + float3(1.0, 0.88, 0.7) * glint * gloss * smoothstep(0.25, 0.8, lum) * 0.9;
  return half4(half3(clamp(lit, 0.0, 1.0)) * c.a, c.a);
}
`;

/** A light on an object: where the flame is in the object's box (px), how strongly it reaches it (0–1), and how high above the altar it burns (px). */
export type ObjectLight = { x: number; y: number; strength: number; height: number };

/** How glossy an object's surface is: crystals and glass glint, wax a little, most things barely. */
export function glossOf(type: string | undefined, label: string | undefined): number {
  const t = String(type || '').toLowerCase();
  const name = String(label || '').toLowerCase();
  if (t === 'crystal') return 1;
  if (/glass|bottle|jar|vial|mirror|chalice|bell|key|athame|blade/.test(name)) return 0.7;
  if (t === 'candle') return 0.25;
  return 0.12;
}

/** The uniforms' lights, four at most, flattened. */
export function lightUniforms(lights: ObjectLight[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < 4; i++) {
    const l = lights[i];
    out.push(l ? l.x : 0, l ? l.y : 0, l ? l.strength : 0, l ? l.height : 1);
  }
  return out;
}
