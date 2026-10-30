// Cords tied between candles (cord cutting), drawn over the altar: wrapped
// round both candles at their height, then, once a candle has burned down to
// it, an ember travelling along it with a thread of smoke, and at last the two
// ends falling apart. The drawing is lib/altar/cord.ts cordArt, shared with
// the website. While a cord burns or has just parted, it's drawn again a few
// times a second; otherwise it only follows the altar.

import { memo, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

import { useReducedMotion } from '../../lib/accessibility/store';
import { cordArt, cordColor, cordEnds, cordMoving, cordsOf, cordState } from '../../lib/altar/cord';
import type { AltarDocument } from '../../lib/altar/snapshot';

const CHAR = 'rgb(38,30,26)';

export const CordLayer = memo(function CordLayer({ doc, stageWidth, stageHeight }: { doc: AltarDocument; stageWidth: number; stageHeight: number }) {
  const still = useReducedMotion();
  const [now, setNow] = useState(() => Date.now());
  const cords = cordsOf(doc);
  const moving = cords.some((c) => cordMoving(cordState(doc, c, now), now));
  useEffect(() => {
    // Look again when the altar changes (a cord tied, caught or cut), and often while one is burning.
    const soon = setTimeout(() => setNow(Date.now()), 0);
    const timer = moving ? setInterval(() => setNow(Date.now()), still ? 1000 : 80) : null;
    return () => {
      clearTimeout(soon);
      if (timer) clearInterval(timer);
    };
  }, [doc, moving, still]);
  if (!cords.length) return null;
  return (
    <Svg pointerEvents="none" width={stageWidth} height={stageHeight} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="cord-ember" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="rgb(255,244,200)" stopOpacity={1} />
          <Stop offset="0.35" stopColor="rgb(255,170,60)" stopOpacity={0.95} />
          <Stop offset="1" stopColor="rgb(255,110,30)" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {cords.map((cord) => {
        const ends = cordEnds(doc, cord, stageWidth);
        if (!ends) return null;
        const state = cordState(doc, cord, now);
        const art = cordArt(ends, state, now, stageWidth, still);
        const color = cordColor(cord.color);
        const line = (d: string, stroke: string, width: number, key: string) => (d ? <Path key={key} d={d} stroke={stroke} strokeWidth={width} strokeLinecap="round" fill="none" /> : null);
        return (
          <G key={cord.id}>
            {art.wraps.map((w, i) => line(w.d, color.shade, art.width + 1.2, `ws${i}`))}
            {art.wraps.map((w, i) => line(w.d, w.charred ? CHAR : color.stroke, art.width, `w${i}`))}
            {line(art.span, color.shade, art.width + 1.2, 'ss')}
            {line(art.span, color.stroke, art.width, 's')}
            {line(art.charred, CHAR, art.width * 0.8, 'c')}
            {art.pieces.map((d, i) => line(d, color.shade, art.width + 1.2, `ps${i}`))}
            {art.pieces.map((d, i) => line(d, color.stroke, art.width, `p${i}`))}
            {art.tips.map((t, i) => (
              <Circle key={`t${i}`} cx={t.x} cy={t.y} r={art.width * 0.75} fill={CHAR} />
            ))}
            {art.ember && (
              <>
                <Circle cx={art.ember.x} cy={art.ember.y} r={art.ember.r * 3.2} fill="url(#cord-ember)" opacity={0.75} />
                <Circle cx={art.ember.x} cy={art.ember.y} r={art.ember.r * 0.7} fill="rgb(255,236,170)" />
              </>
            )}
            {art.smoke.map((s, i) => (
              <Circle key={`m${i}`} cx={s.x} cy={s.y} r={s.r} fill="rgb(206,206,200)" opacity={s.opacity} />
            ))}
          </G>
        );
      })}
    </Svg>
  );
});
