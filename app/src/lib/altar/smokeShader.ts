// The smoke off a candle just put out, as a Skia shader: a thin thread rising
// from the wick that wavers and curls as it climbs, widening and breaking up
// into soft turbulence before it thins into the air; thickest the moment the
// flame goes, then less and less as the wick cools. Drawn in units of the
// flame's box (wick at `wick`, `scale` px a unit), `time` seconds since the
// snuff. Pure.

export const SMOKE_SKSL = `
uniform float time;
uniform float seed;
uniform float2 wick;
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
  for (int k = 0; k < 5; k++) {
    v += a * noise(p);
    p = p * 2.02 + float2(7.1, 3.3);
    a *= 0.5;
  }
  return v;
}

half4 main(float2 xy) {
  float2 q = (xy - wick) / scale;
  float y = -q.y;            // height above the wick, in flame-box units
  if (y < -0.2) return half4(0.0);
  float t = time;
  // The smoke at this height left the wick a little while ago (rising quicker as it warms the air).
  float age = y / 13.0 + y * y / 520.0;
  float left = t - age;      // when it left the wick
  if (left < 0.0) return half4(0.0);
  // Thick as the flame goes, then less as the wick cools.
  float puff = exp(-left / 1.25);
  // Its leading edge is soft, curling ahead of the rest.
  float head = smoothstep(0.0, 0.5, left + (fbm(float2(q.x * 0.9 + seed, t)) - 0.5) * 0.3);
  // It wavers and curls, more the higher it goes.
  float s = seed * 13.0;
  float curl = (fbm(float2(y * 0.16 + s, t * 0.35)) - 0.5) * 2.0 * pow(y, 1.15) * 0.55
             + sin(y * 0.55 + t * 1.4 + s) * 0.18 * y * 0.25;
  float x = q.x - curl;
  // A thin thread at the wick, spreading as it climbs.
  float w = 0.16 + y * 0.085 + y * y * 0.0016;
  float thread = exp(-(x * x) / (w * w));
  // It breaks up into soft turbulence higher up.
  float churn = fbm(float2(x * 0.7 + s, y * 0.32 - t * 1.6));
  float broken = mix(1.0, smoothstep(0.25, 0.75, churn) * 1.6, smoothstep(4.0, 22.0, y));
  // Thinning into the air as it rises and as time passes.
  float thin = exp(-y / 48.0) * (1.0 - smoothstep(3.6, 5.0, t));
  float d = thread * broken * puff * thin * head;
  // Densest close to the wick, a wisp further up.
  float a = clamp(d * (0.6 + 0.35 * exp(-y / 5.0)), 0.0, 0.72);
  half3 col = half3(0.84, 0.84, 0.82);
  return half4(col * half(a), half(a));
}
`;
