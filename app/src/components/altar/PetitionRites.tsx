// The petition's ending, played out: burned in a heatproof bowl (the fire
// catches a corner and eats across the paper, charring and glowing at its
// edge, sparks lifting and smoke rising, until only curled ash is left),
// buried (a hole opens in the earth, the folded paper goes in, the soil is
// drawn back over it and something green comes up), or released (on a
// night sky the paper lifts, glows, and comes apart into motes of light that
// drift up and away). Drawn frame by frame from one 0–1 progress; with
// Reduce Motion each shows its end at once.

import { useEffect, useRef, useState } from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Mask, Path, Polygon, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { useReducedMotion } from '../../lib/accessibility/store';
import { fonts } from '../../theme';

/** 0 → 1 over `ms` while `running`, then `onDone`; at once with Reduce Motion. */
export function useRite(running: boolean, ms: number, onDone?: () => void): number {
  const still = useReducedMotion();
  const [p, setP] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    if (!running) return;
    if (still) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nothing to animate
      setP(1);
      done.current?.();
      return;
    }
    const start = Date.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / ms);
      setP(t);
      if (t < 1) frame = requestAnimationFrame(tick);
      else done.current?.();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, ms, still]);
  return p;
}

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
/** Where `p` is between `a` and `b`, 0–1. */
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
/** A repeatable random number for `i` (so particles keep their paths frame to frame). */
const rand = (i: number, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const ease = (t: number) => t * t * (3 - 2 * t);

// ── Burning ───────────────────────────────────────────────────────────────

const PAPER: [number, number][] = [
  [58, 66],
  [160, 58],
  [166, 106],
  [62, 114],
];
const PAPER_POINTS = PAPER.map((p) => p.join(',')).join(' ');
/** The corner the fire catches. */
const CATCH: [number, number] = [164, 104];

function inPaper(x: number, y: number) {
  // The paper is near enough a convex quad: inside every edge.
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = PAPER[i];
    const [bx, by] = PAPER[(i + 1) % 4];
    if ((bx - ax) * (y - ay) - (by - ay) * (x - ax) < 0) return false;
  }
  return true;
}

/** The burned hole's edge: ragged, and its rag shifting a little as it goes. */
function burnFront(radius: number, p: number, grow = 0): string {
  const n = 120;
  const points: string[] = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    const rag = 1 + 0.12 * Math.sin(a * 5 + 1.3) + 0.07 * Math.sin(a * 11 + p * 4) + 0.035 * Math.sin(a * 23 - p * 7) + 0.02 * Math.sin(a * 41 + p * 3);
    const r = Math.max(0, radius * rag + grow);
    points.push(`${(CATCH[0] + Math.cos(a) * r).toFixed(1)},${(CATCH[1] + Math.sin(a) * r).toFixed(1)}`);
  }
  return `M${points.join(' L')} Z`;
}

/** A little flame standing on the burning edge. */
function tongue(x: number, y: number, h: number, lean: number) {
  const w = h * 0.36;
  return `M${x - w} ${y} C${x - w} ${y - h * 0.45} ${x + lean * 0.4} ${y - h * 0.7} ${x + lean} ${y - h} C${x + lean * 0.4 + w * 0.3} ${y - h * 0.6} ${x + w} ${y - h * 0.4} ${x + w} ${y} Z`;
}

/** The petition burning in a heatproof bowl, at `p` (0 laid in the bowl … 1 ash). */
export function BurningPetition({ p, title }: { p: number; title: string }) {
  const burning = span(p, 0.04, 0.86);
  const radius = ease(burning) * 140;
  const front = (k: number) => {
    const a = Math.PI + (k / 7) * Math.PI * 1.1 - 0.35;
    const rag = 1 + 0.12 * Math.sin(a * 5 + 1.3) + 0.07 * Math.sin(a * 11 + p * 4) + 0.035 * Math.sin(a * 23 - p * 7) + 0.02 * Math.sin(a * 41 + p * 3);
    return [CATCH[0] + Math.cos(a) * radius * rag, CATCH[1] + Math.sin(a) * radius * rag] as const;
  };
  const alight = p > 0.03 && p < 0.9;
  const flames = alight
    ? Array.from({ length: 11 }, (_, k) => front(k * 0.7))
        .filter(([x, y]) => inPaper(x, y + 2))
        .map(([x, y], k) => ({ x, y, h: 12 + 9 * Math.abs(Math.sin(p * 40 + k * 1.7)) + 6 * rand(k, Math.floor(p * 30)), lean: 4 * Math.sin(p * 23 + k) }))
    : [];
  const glow = alight ? 0.55 + 0.25 * Math.sin(p * 60) : 0;
  const ash = span(p, 0.55, 1);
  return (
    <Svg width="100%" height="100%" viewBox="0 0 220 160">
      <Defs>
        <RadialGradient id="bowl-in" cx="50%" cy="40%" r="60%">
          <Stop offset="0" stopColor="rgb(70,66,60)" />
          <Stop offset="1" stopColor="rgb(30,28,26)" />
        </RadialGradient>
        <RadialGradient id="fire-light" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="rgb(255,190,90)" stopOpacity={0.55} />
          <Stop offset="1" stopColor="rgb(255,150,60)" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="tongue" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="rgb(255,214,120)" stopOpacity={0.9} />
          <Stop offset="0.4" stopColor="rgb(255,150,50)" stopOpacity={0.75} />
          <Stop offset="0.85" stopColor="rgb(220,70,24)" stopOpacity={0.3} />
          <Stop offset="1" stopColor="rgb(200,60,20)" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="tongue-core" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="rgb(255,255,235)" stopOpacity={0.95} />
          <Stop offset="0.5" stopColor="rgb(255,228,150)" stopOpacity={0.6} />
          <Stop offset="1" stopColor="rgb(255,200,110)" stopOpacity={0} />
        </LinearGradient>
        <RadialGradient id="smoke-puff" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="rgb(168,168,162)" stopOpacity={0.55} />
          <Stop offset="0.6" stopColor="rgb(150,150,146)" stopOpacity={0.22} />
          <Stop offset="1" stopColor="rgb(150,150,146)" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="char" cx="50%" cy="50%" r="50%">
          <Stop offset="0.8" stopColor="rgb(30,18,10)" />
          <Stop offset="0.93" stopColor="rgb(80,46,22)" />
          <Stop offset="1" stopColor="rgb(140,96,56)" stopOpacity={0.6} />
        </RadialGradient>
        <Mask id="paper-left">
          <Rect x={0} y={0} width={220} height={160} fill="white" />
          <Path d={burnFront(radius, p)} fill="black" />
        </Mask>
        <ClipPath id="paper-shape">
          <Polygon points={PAPER_POINTS} />
        </ClipPath>
      </Defs>

      {/* The bowl. */}
      <Ellipse cx={110} cy={92} rx={92} ry={26} fill="url(#bowl-in)" />

      {/* Ash gathering where the paper was: dark curls with pale edges. */}
      {ash > 0 && (
        <G opacity={ash}>
          {Array.from({ length: 14 }, (_, i) => {
            const x = 72 + rand(i, 1) * 82;
            const y = 78 + rand(i, 2) * 26;
            const w = 6 + rand(i, 3) * 12;
            return (
              <G key={i} transform={`rotate(${rand(i, 4) * 180 - 90} ${x} ${y})`}>
                <Ellipse cx={x} cy={y} rx={w} ry={w * 0.32} fill={i % 3 ? 'rgb(52,50,48)' : 'rgb(36,34,32)'} />
                <Path d={`M${x - w} ${y} Q${x} ${y - w * 0.5} ${x + w} ${y}`} stroke="rgb(170,166,158)" strokeWidth={0.8} fill="none" opacity={0.8} />
              </G>
            );
          })}
        </G>
      )}

      {/* The paper, with what's left of it: its words, a charred band at the burning edge, and the glowing edge itself. */}
      <G mask="url(#paper-left)">
        <G clipPath="url(#paper-shape)">
          <Polygon points={PAPER_POINTS} fill="rgb(236,224,192)" />
          <SvgText x={70} y={80} fontSize={9} fontFamily={fonts.displayItalic} fill="rgb(110,60,40)" transform="rotate(-4 70 80)">
            {title.length > 22 ? `${title.slice(0, 21)}…` : title}
          </SvgText>
          <Path d="M70 90 L150 85 M70 97 L142 92 M70 104 L150 99" stroke="rgba(110,60,40,0.45)" strokeWidth={1} strokeLinecap="round" />
          {/* Scorched brown, then charred black, just ahead of the fire. */}
          {radius > 0 && <Path d={burnFront(radius, p, 16)} fill="rgb(150,100,52)" opacity={0.55} />}
          {radius > 0 && <Path d={burnFront(radius, p, 7)} fill="url(#char)" />}
        </G>
      </G>
      {radius > 0 && alight && (
        <G clipPath="url(#paper-shape)">
          <Path d={burnFront(radius, p, 1)} stroke="rgb(255,120,40)" strokeWidth={3} fill="none" opacity={glow + 0.2} />
          <Path d={burnFront(radius, p, 0.5)} stroke="rgb(255,220,140)" strokeWidth={1.2} fill="none" opacity={glow} />
        </G>
      )}

      {/* The fire's light on the bowl. */}
      {alight && <Ellipse cx={(CATCH[0] + 110) / 2} cy={88} rx={80} ry={40} fill="url(#fire-light)" opacity={0.5 + glow * 0.5} />}

      {/* Flames standing along the burning edge. */}
      {flames.map((f, i) => (
        <G key={i}>
          <Path d={tongue(f.x, f.y + 1, f.h * 1.25, f.lean * 1.3)} fill="url(#tongue)" />
          <Path d={tongue(f.x, f.y, f.h * 0.7, f.lean * 0.8)} fill="url(#tongue-core)" />
        </G>
      ))}

      {/* Sparks lifting off the edge. */}
      {Array.from({ length: 18 }, (_, i) => {
        const t0 = 0.06 + rand(i, 5) * 0.72;
        const t = span(p, t0, t0 + 0.16);
        if (t <= 0 || t >= 1) return null;
        const [sx, sy] = front(Math.floor(rand(i, 6) * 7));
        const x = sx + (rand(i, 7) - 0.5) * 30 * t;
        const y = sy - 55 * t - 10 * t * t;
        return <Circle key={i} cx={x} cy={y} r={0.8 + rand(i, 8)} fill="rgb(255,200,110)" opacity={1 - t} />;
      })}

      {/* Smoke rising and thinning. */}
      {Array.from({ length: 7 }, (_, i) => {
        const t0 = 0.15 + i * 0.1;
        const t = span(p, t0, t0 + 0.4);
        if (t <= 0 || t >= 1) return null;
        const x = 110 + (rand(i, 9) - 0.5) * 40 + Math.sin(t * 5 + i) * 10;
        return <Ellipse key={i} cx={x} cy={70 - t * 70} rx={12 + t * 26} ry={9 + t * 18} fill="url(#smoke-puff)" opacity={Math.sin(Math.PI * t) * 0.9} />;
      })}

      {/* The bowl's rim in front. */}
      <Path d="M18 92 Q24 140 110 142 Q196 140 202 92 Q196 118 110 118 Q24 118 18 92 Z" fill="rgb(54,50,46)" stroke="rgba(226,195,109,0.3)" />
    </Svg>
  );
}

// ── Burying ───────────────────────────────────────────────────────────────

/** The petition folded small and buried in the earth, at `p` (0 open ground … 1 covered, a shoot coming up). */
export function BuriedPetition({ p }: { p: number }) {
  const dig = ease(span(p, 0, 0.2));
  const fold = ease(span(p, 0.18, 0.32));
  const lower = ease(span(p, 0.3, 0.48));
  const cover = ease(span(p, 0.48, 0.86));
  const shoot = ease(span(p, 0.87, 1));
  const holeW = 30 * dig * (1 - cover * 0.95);
  const holeH = 9 * dig * (1 - cover * 0.95);
  const pile = 1 - cover;
  // The paper folds as it's held over the hole (a sheet, then a small packet), then goes down into it.
  const pw = 40 - 22 * fold;
  const ph = 28 - 14 * fold;
  const py = 74 + lower * 46;
  const ground = 'M0 96 Q60 90 110 92 Q170 94 220 90 L220 160 L0 160 Z';
  return (
    <Svg width="100%" height="100%" viewBox="0 0 220 160">
      <Defs>
        <LinearGradient id="earth" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="rgb(98,70,44)" />
          <Stop offset="1" stopColor="rgb(40,27,17)" />
        </LinearGradient>
        <RadialGradient id="hole" cx="50%" cy="40%" r="60%">
          <Stop offset="0" stopColor="rgb(16,9,5)" />
          <Stop offset="1" stopColor="rgb(56,36,22)" />
        </RadialGradient>
        <ClipPath id="above-ground">
          <Rect x={0} y={0} width={220} height={112} />
          <Ellipse cx={110} cy={112} rx={Math.max(0.1, holeW)} ry={Math.max(0.1, holeH)} />
        </ClipPath>
      </Defs>
      <Path d={ground} fill="url(#earth)" />
      {/* Crumbs and small stones through the soil. */}
      {Array.from({ length: 40 }, (_, i) => (
        <Circle key={i} cx={6 + rand(i, 4) * 208} cy={100 + rand(i, 5) * 56} r={0.7 + rand(i, 6) * 1.5} fill={i % 3 ? 'rgb(118,88,60)' : 'rgb(30,20,12)'} opacity={0.75} />
      ))}
      {/* Grass along the edge of the ground, parted where the hole is. */}
      {Array.from({ length: 30 }, (_, i) => {
        const x = 4 + i * 7.3 + rand(i, 1) * 3;
        if (x > 74 && x < 176) return null;
        const y = 93 + Math.sin(x / 40) * 2;
        return <Path key={i} d={`M${x} ${y} q${-2 + rand(i, 2) * 4} -7 ${-1 + rand(i, 3) * 4} -${9 + rand(i, 7) * 6}`} stroke={i % 2 ? 'rgb(92,132,64)' : 'rgb(70,108,50)'} strokeWidth={1.5} fill="none" strokeLinecap="round" />;
      })}
      {/* The hole, opening and then filling. */}
      {holeW > 0.5 && <Ellipse cx={110} cy={112} rx={holeW} ry={holeH} fill="url(#hole)" />}
      {/* The paper: folded, then lowered into the hole (only what's above the ground, or down in the hole, shows). */}
      {p < 0.52 && (
        <G clipPath="url(#above-ground)">
          <Rect x={110 - pw / 2} y={py - ph / 2} width={pw} height={ph} fill="rgb(236,224,192)" stroke="rgba(90,70,40,0.55)" strokeWidth={0.8} transform={`rotate(${-8 + fold * 8} 110 ${py})`} />
          {fold > 0.4 && <Path d={`M${110 - pw / 2} ${py} L${110 + pw / 2} ${py} M110 ${py - ph / 2} L110 ${py + ph / 2}`} stroke="rgba(90,70,40,0.4)" strokeWidth={0.7} />}
          {fold < 0.5 && <Path d={`M${110 - pw / 2 + 6} ${py - 4} L${110 + pw / 2 - 8} ${py - 5} M${110 - pw / 2 + 6} ${py + 2} L${110 + pw / 2 - 10} ${py + 1}`} stroke="rgba(110,60,40,0.45)" strokeWidth={0.8} opacity={1 - fold * 2} />}
        </G>
      )}
      {/* The dug earth heaped beside the hole, drawn back over it. */}
      {dig > 0 && pile > 0.02 && (
        <G>
          <Ellipse cx={150} cy={104} rx={18 * dig * pile + 2} ry={8 * dig * pile + 1} fill="rgb(86,60,38)" />
          <Ellipse cx={146} cy={101} rx={9 * dig * pile} ry={3 * dig * pile} fill="rgb(112,82,54)" opacity={0.7} />
        </G>
      )}
      {/* Soil tumbling back into the hole. */}
      {cover > 0 &&
        cover < 1 &&
        Array.from({ length: 26 }, (_, i) => {
          const t = (cover * 5 + rand(i, 7)) % 1;
          const x = 146 - t * 36 + (rand(i, 8) - 0.5) * 14;
          const y = 100 - Math.sin(t * Math.PI) * 16 + t * 12;
          return <Circle key={i} cx={x} cy={y} r={1.6 + rand(i, 9) * 1.8} fill={i % 3 ? 'rgb(92,64,40)' : 'rgb(60,40,24)'} />;
        })}
      {/* Covered: a low mound, and something green coming up. */}
      {cover > 0.55 && <Ellipse cx={110} cy={110} rx={28} ry={6 * span(cover, 0.55, 1)} fill="rgb(80,56,34)" />}
      {shoot > 0 && (
        <G>
          <Path d={`M110 108 Q109 ${108 - 8 * shoot} 110 ${108 - 18 * shoot}`} stroke="rgb(110,160,70)" strokeWidth={1.8} fill="none" />
          <Path d={`M110 ${108 - 15 * shoot} q${-9 * shoot} ${-4 * shoot} ${-12 * shoot} ${-10 * shoot} q${8 * shoot} 0 ${12 * shoot} ${10 * shoot} Z`} fill="rgb(120,176,80)" />
          <Path d={`M110 ${108 - 17 * shoot} q${8 * shoot} ${-3 * shoot} ${11 * shoot} ${-9 * shoot} q${-7 * shoot} 0 ${-11 * shoot} ${9 * shoot} Z`} fill="rgb(140,190,90)" />
        </G>
      )}
    </Svg>
  );
}

// ── Releasing ─────────────────────────────────────────────────────────────

const MOTES = 46;

/** The petition released to the night, at `p` (0 resting … 1 gone into the sky). */
export function ReleasedPetition({ p }: { p: number }) {
  const lift = ease(span(p, 0, 0.35));
  const glow = span(p, 0.1, 0.4);
  const apart = span(p, 0.32, 0.62);
  const cx = 110;
  const cy = 108 - lift * 30 + Math.sin(p * 12) * 2;
  return (
    <Svg width="100%" height="100%" viewBox="0 0 220 160">
      <Defs>
        <LinearGradient id="night" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="rgb(8,12,34)" />
          <Stop offset="1" stopColor="rgb(26,30,58)" />
        </LinearGradient>
        <RadialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="rgb(255,248,220)" stopOpacity={0.5} />
          <Stop offset="1" stopColor="rgb(255,248,220)" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="paper-glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="rgb(255,236,170)" stopOpacity={0.7} />
          <Stop offset="1" stopColor="rgb(255,220,140)" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={220} height={160} rx={14} fill="url(#night)" />
      {/* Stars, twinkling. */}
      {Array.from({ length: 26 }, (_, i) => (
        <Circle key={i} cx={8 + rand(i, 1) * 204} cy={6 + rand(i, 2) * 90} r={0.5 + rand(i, 3) * 0.9} fill="white" opacity={0.35 + 0.5 * Math.abs(Math.sin(p * 9 + i * 1.7))} />
      ))}
      <Circle cx={182} cy={30} r={22} fill="url(#moon-glow)" />
      <Circle cx={182} cy={30} r={10} fill="rgb(244,236,214)" />
      {/* The paper, lifting and glowing, then coming apart. */}
      {apart < 1 && (
        <G opacity={1 - apart}>
          <Ellipse cx={cx} cy={cy} rx={40 + glow * 10} ry={30 + glow * 8} fill="url(#paper-glow)" opacity={glow} />
          <Rect x={cx - 26} y={cy - 18} width={52} height={36} fill="rgb(240,230,200)" transform={`rotate(${-6 + Math.sin(p * 8) * 4} ${cx} ${cy})`} />
          <Path d={`M${cx - 18} ${cy - 8} L${cx + 16} ${cy - 9} M${cx - 18} ${cy} L${cx + 12} ${cy - 1} M${cx - 18} ${cy + 8} L${cx + 16} ${cy + 7}`} stroke="rgba(110,60,40,0.45)" strokeWidth={1} />
        </G>
      )}
      {/* Motes of light drifting up and away. */}
      {apart > 0 &&
        Array.from({ length: MOTES }, (_, i) => {
          const t0 = rand(i, 4) * 0.25;
          const t = span(p, 0.32 + t0, 1);
          if (t <= 0) return null;
          const sx = cx - 26 + rand(i, 5) * 52;
          const sy = cy - 18 + rand(i, 6) * 36;
          const x = sx + (rand(i, 7) - 0.5) * 120 * t + Math.sin(t * 6 + i) * 6;
          const y = sy - 95 * Math.pow(t, 1.25) * (0.6 + rand(i, 8) * 0.6);
          const r = 0.8 + rand(i, 9) * 1.6;
          const o = Math.pow(1 - t, 0.7) * (0.75 + 0.25 * Math.sin(t * 20 + i));
          return (
            <G key={i} opacity={o}>
              <Circle cx={x} cy={y} r={r * 3} fill="rgb(255,226,150)" opacity={0.18} />
              <Circle cx={x} cy={y} r={r} fill={i % 4 ? 'rgb(255,236,170)' : 'rgb(255,255,240)'} />
            </G>
          );
        })}
    </Svg>
  );
}
