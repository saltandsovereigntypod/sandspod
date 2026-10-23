// The flame's fire, as a Skia shader: drawn in the flame's 10 × 18 box (wick
// at the foot, 17.4 down), a round blue-rooted foot narrowing to a tip, its
// edges rippling and its body swaying with rising turbulence, streaks of
// brightness flowing up through it, a white-gold core, orange edges going
// deep red and thin toward the tip, and a darker hollow round the wick.
// `part` draws the lower body (0) or the upper tip (1), which fade into each
// other, so the tip can bend on its own as the SVG flame's does. Pure.

export const FLAME_SKSL = `
uniform float time;
uniform float seed;
uniform float part;
uniform float2 origin;
uniform float scale;

float hash(float2 p) {
  p = fract(p * float2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float a = hash(i);
  float b = hash(i + float2(1.0, 0.0));
  float c = hash(i + float2(0.0, 1.0));
  float d = hash(i + float2(1.0, 1.0));
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(float2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int k = 0; k < 4; k++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

half4 main(float2 xy) {
  float2 q = (xy - origin) / scale;
  float t = time + seed * 17.0;
  // Height up the flame: 0 at its foot, 1 at its tip.
  float h = (17.4 - q.y) / 16.0;
  float x = q.x - 5.0;
  // It sways, more toward the tip, and its edges ripple as the air rises through it.
  float sway = (fbm(float2(h * 1.4 - t * 1.1, seed * 3.0)) - 0.5) * 2.2 * h * h;
  x -= sway;
  float rip = fbm(float2(x * 0.7 + seed, h * 3.6 - t * 3.4)) - 0.5;
  // A round foot, widest a third of the way up, narrowing to a point.
  float w;
  if (h < 0.24) {
    float r = (0.24 - h) / 0.26;
    w = 2.9 * sqrt(max(0.0, 1.0 - r * r));
  } else {
    w = 2.9 * pow(max(0.0, 1.0 - (h - 0.24) / 0.78), 1.35);
  }
  w *= 1.0 + rip * (0.2 + 0.5 * h);
  float edge = abs(x) / max(w, 0.0001);
  float a = 1.0 - smoothstep(0.5, 1.0, edge);
  a *= 1.0 - smoothstep(-0.02, 0.0, -h - 0.02);
  // The tip thins and comes apart into wisps.
  float tip = 1.0 - smoothstep(0.78 + rip * 0.3, 1.02, h);
  a *= tip;
  // Streaks of brightness flowing up through it.
  float flow = fbm(float2(x * 0.6 + seed, h * 3.2 - t * 3.6));
  a *= 0.86 + 0.26 * flow;
  // Colour: white-gold at the core, gold, orange at the edges, deep red toward the tip, blue at the root.
  float core = (1.0 - smoothstep(0.0, 0.7, edge)) * (1.0 - smoothstep(0.18, 0.8, h));
  half3 col = mix(half3(1.0, 0.5, 0.12), half3(1.0, 0.84, 0.42), half(smoothstep(1.0, 0.45, edge)));
  col = mix(col, half3(1.0, 0.98, 0.9), half(core));
  col = mix(col, half3(1.0, 0.42, 0.1), half(smoothstep(0.55, 0.95, h) * 0.8));
  float blue = (1.0 - smoothstep(0.0, 0.13, h)) * smoothstep(0.35, 0.9, edge);
  col = mix(col, half3(0.38, 0.55, 1.0), half(blue * 0.9));
  // The darker, browner hollow just above the wick.
  float wick = 1.0 - smoothstep(0.0, 1.0, length(float2(x * 2.4, (h - 0.1) * 11.0)));
  col = mix(col, half3(0.62, 0.3, 0.12), half(wick * 0.25));
  // The core burns solid.
  a = mix(a, 1.0, core * 0.65 * tip);
  // The body or the tip, fading into each other.
  // (The body stays whole until the tip has fully come in over it, so the two never thin where they meet.)
  float share = part < 0.5 ? 1.0 - smoothstep(0.6, 0.74, h) : smoothstep(0.36, 0.6, h);
  a = clamp(a * share, 0.0, 1.0);
  return half4(col * half(a), half(a));
}
`;

/** Where the 10 × 18 flame box sits in a w × h area (fitted and centred, as an SVG viewBox is). */
export function flameFrame(width: number, height: number): { origin: [number, number]; scale: number } {
  const scale = Math.min(width / 10, height / 18);
  return { origin: [(width - 10 * scale) / 2, (height - 18 * scale) / 2], scale };
}
