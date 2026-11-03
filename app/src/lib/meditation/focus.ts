// Something to rest your eyes on while you sit, full screen: a candle flame
// for candle gazing (trataka), the moon as it is tonight, a mandala, or one
// of your own saved sigils turning slowly; and, for breath pacing, a wave
// and a square path (for box breathing) beside the circle. Each is an SVG
// picture worked out from the time, so the app (react-native-svg's SvgXml)
// and the website (innerHTML) draw the same thing. Pure.

import { moonState } from '../moon.ts';
import { cleanPath } from '../sigil/sigil.ts';
import { breathAt, type BreathPattern } from './timer.ts';

export type FocusId = 'none' | 'candle' | 'moon' | 'mandala' | 'sigil';
export const FOCUSES: { value: FocusId; label: string; line: string }[] = [
  { value: 'none', label: 'Nothing', line: 'Eyes closed, or resting where they like.' },
  { value: 'candle', label: 'Candle flame', line: 'Candle gazing (trataka): rest your eyes on the flame, then close them and watch its afterimage.' },
  { value: 'moon', label: 'The moon', line: 'The moon as she is tonight.' },
  { value: 'mandala', label: 'Mandala', line: 'A still, layered pattern to draw the eye to its centre.' },
  { value: 'sigil', label: 'One of your sigils', line: 'A sigil you’ve made, turning slowly.' },
];
export const cleanFocus = (v: unknown): FocusId => (FOCUSES.some((f) => f.value === v) ? (v as FocusId) : 'none');

const GOLD = '#e2c36d';
const CREAM = '#f3ead2';
const r1 = (n: number) => Math.round(n * 10) / 10;

/** A candle flame at `ms`: its height and lean drift a little, as a real one does. */
export function candleSvg(ms: number): string {
  const t = ms / 1000;
  const sway = Math.sin(t * 1.7) * 1.4 + Math.sin(t * 4.3) * 0.6;
  const tall = 34 + Math.sin(t * 2.3) * 2 + Math.sin(t * 6.1) * 0.8;
  const top = 46 - tall;
  const tipX = 50 + sway;
  const flame = `M 50 48 C 41 44 43 ${r1(top + tall * 0.45)} ${r1(tipX)} ${r1(top)} C 57 ${r1(top + tall * 0.45)} 59 44 50 48 Z`;
  const core = `M 50 47 C 46 45 47 ${r1(top + tall * 0.6)} ${r1(50 + sway * 0.6)} ${r1(top + tall * 0.35)} C 53 ${r1(top + tall * 0.6)} 54 45 50 47 Z`;
  const glow = r1(0.32 + Math.sin(t * 2.3) * 0.04);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="g" cx="50%" cy="38%" r="50%"><stop offset="0" stop-color="#ffcf6b" stop-opacity="${glow}"/><stop offset="1" stop-color="#ffcf6b" stop-opacity="0"/></radialGradient><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff9a2e"/><stop offset="0.6" stop-color="#ffd36b"/><stop offset="1" stop-color="#fff3c4"/></linearGradient></defs><circle cx="50" cy="36" r="44" fill="url(#g)"/><path d="${flame}" fill="url(#f)" opacity="0.95"/><path d="${core}" fill="#fffbe8" opacity="0.85"/><path d="M 50 48 L 50 52" stroke="#2b2118" stroke-width="0.9"/><rect x="42" y="52" width="16" height="44" rx="1.5" fill="${CREAM}"/><ellipse cx="50" cy="52" rx="8" ry="1.6" fill="#fffaf0"/></svg>`;
}

/** The lit part of the moon: the bright limb a half circle, the terminator an ellipse. */
function litPath(cx: number, cy: number, r: number, illumination: number, waxing: boolean): string {
  const k = Math.max(0, Math.min(1, illumination));
  if (k <= 0.005) return '';
  const rx = r1(Math.abs(1 - 2 * k) * r);
  const limb = waxing ? 1 : 0;
  const term = k > 0.5 ? limb : 1 - limb;
  return `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${limb} ${cx} ${cy + r} A ${rx} ${r} 0 0 ${term} ${cx} ${cy - r} Z`;
}

/** The moon on `at`, as she is (in the northern sky's orientation). */
export function moonSvg(at: Date): string {
  const m = moonState(at);
  const lit = litPath(50, 50, 30, m.illumination, m.waxing);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="h" cx="50%" cy="50%" r="50%"><stop offset="0.55" stop-color="${CREAM}" stop-opacity="0.16"/><stop offset="1" stop-color="${CREAM}" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="url(#h)"/><circle cx="50" cy="50" r="30" fill="#2a2a33"/>${lit ? `<path d="${lit}" fill="${CREAM}"/>` : ''}</svg>`;
}

/** A mandala: a square with four gates, rings of petals, and triangles about a still centre; it glows gently with `ms`. */
export function mandalaSvg(ms: number): string {
  const glow = r1(0.55 + 0.25 * Math.sin(ms / 4000));
  const stroke = `fill="none" stroke="${GOLD}" stroke-width="0.6"`;
  const petals = (n: number, r: number, len: number, w: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i * 360) / n;
      return `<path transform="rotate(${r1(a)} 50 50)" d="M 50 ${50 - r} Q ${50 + w} ${50 - r - len / 2} 50 ${50 - r - len} Q ${50 - w} ${50 - r - len / 2} 50 ${50 - r} Z" ${stroke}/>`;
    }).join('');
  const tri = (r: number, up: boolean) => {
    const pts = [0, 120, 240].map((a) => {
      const rad = ((a + (up ? -90 : 90)) * Math.PI) / 180;
      return `${r1(50 + r * Math.cos(rad))},${r1(50 + r * Math.sin(rad))}`;
    });
    return `<polygon points="${pts.join(' ')}" ${stroke}/>`;
  };
  const gates = `<path d="M 6 6 H 42 V 2 H 58 V 6 H 94 V 42 H 98 V 58 H 94 V 94 H 58 V 98 H 42 V 94 H 6 V 58 H 2 V 42 H 6 Z" ${stroke}/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g opacity="${glow}">${gates}<circle cx="50" cy="50" r="40" ${stroke}/>${petals(16, 30, 9, 3)}<circle cx="50" cy="50" r="30" ${stroke}/>${petals(8, 20, 9, 4)}<circle cx="50" cy="50" r="20" ${stroke}/>${tri(18, true)}${tri(18, false)}${tri(10, true)}</g><circle cx="50" cy="50" r="1.6" fill="${GOLD}"/></svg>`;
}

/** One of your sigils, turning once every two minutes, in gold. */
export function sigilFocusSvg(sigil: { d: string; ring?: boolean; weight?: number }, ms: number): string {
  const d = cleanPath(sigil.d) ?? '';
  const angle = r1(((ms / 120_000) * 360) % 360);
  const w = Math.max(0.8, Math.min(6, Number(sigil.weight) || 2.6));
  const stroke = `fill="none" stroke="${GOLD}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 120 120"><g transform="rotate(${angle} 50 50)">${sigil.ring ? `<circle cx="50" cy="50" r="46" ${stroke} stroke-width="${r1(w * 0.8)}"/>` : ''}${d ? `<path d="${d}" ${stroke} stroke-width="${r1(w)}"/>` : ''}</g></svg>`;
}

export type BreathShape = 'circle' | 'wave' | 'square';
export const BREATH_SHAPES: { value: BreathShape; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'wave', label: 'Wave' },
  { value: 'square', label: 'Square path' },
];

/** Where on the square the breath is: up the left side breathing in, across the top holding, down the right breathing out, back along the bottom resting. */
export function squarePoint(p: BreathPattern, ms: number): { x: number; y: number } {
  const parts: ['in' | 'hold' | 'out' | 'rest', number][] = [
    ['in', p.inhale],
    ['hold', p.hold],
    ['out', p.exhale],
    ['rest', p.rest],
  ];
  const cycle = (p.inhale + p.hold + p.exhale + p.rest) * 1000;
  let t = Math.max(0, ms) % cycle;
  let stage: 'in' | 'hold' | 'out' | 'rest' = 'in';
  let f = 0;
  for (const [s, sec] of parts) {
    const len = sec * 1000;
    if (!len) continue;
    if (t < len) {
      stage = s;
      f = t / len;
      break;
    }
    t -= len;
  }
  const [lo, hi] = [15, 85];
  const span = hi - lo;
  const b = { stage };
  if (b.stage === 'in') return { x: lo, y: r1(hi - span * f) };
  if (b.stage === 'hold') return { x: r1(lo + span * f), y: lo };
  if (b.stage === 'out') return { x: hi, y: r1(lo + span * f) };
  return { x: r1(hi - span * f), y: hi };
}

/** The square path with the breath's dot on it. */
export function breathSquareSvg(p: BreathPattern, ms: number): string {
  const pt = squarePoint(p, ms);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" fill="none" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="1.2"/><circle cx="${pt.x}" cy="${pt.y}" r="4" fill="${GOLD}"/></svg>`;
}

/** A wave drawn by the breath: its height follows the in and out, scrolling past as you breathe. */
export function breathWaveSvg(p: BreathPattern, ms: number): string {
  const pts: string[] = [];
  const window = 12_000;
  for (let i = 0; i <= 60; i++) {
    const at = ms - window + (i / 60) * window;
    const s = at < 0 ? 0 : breathAt(p, at).scale;
    pts.push(`${r1((i / 60) * 100)},${r1(80 - s * 60)}`);
  }
  const now = breathAt(p, ms).scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polyline points="${pts.join(' ')}" fill="none" stroke="${GOLD}" stroke-width="1.4" stroke-linejoin="round"/><circle cx="100" cy="${r1(80 - now * 60)}" r="3.5" fill="${GOLD}"/></svg>`;
}
