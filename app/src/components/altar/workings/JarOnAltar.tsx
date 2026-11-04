// A spell jar's layers and wax seal over its glass on the altar
// (lib/altar/workings/spellJar.ts jarArt): the painted jar or bottle, the
// layers seen through it, and the seal dripped over the cork.

import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { JarArt } from '../../../lib/altar/workings/spellJar';

export function JarOnAltar({ art, width, height, uid }: { art: JarArt; width: number; height: number; uid: string }) {
  const id = `jar-${uid.replace(/[^a-z0-9-]/gi, '')}`;
  const { inside, cork } = art;
  const round = Math.min(inside.w, inside.h) * 0.22;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        <Defs>
          <ClipPath id={id}>
            <Rect x={inside.x} y={inside.y} width={inside.w} height={inside.h} rx={round} ry={round} />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#${id})`}>
          {art.bands.map((b, i) => (
            <Rect key={`${b.label}-${i}`} x={b.x} y={b.y} width={b.w} height={b.h + 0.4} fill={b.color} opacity={0.72} />
          ))}
        </G>
        {art.seal && (
          <G>
            <Ellipse cx={cork.x + cork.w / 2} cy={cork.y + cork.h * 0.55} rx={cork.w * 0.56} ry={cork.h * 0.62} fill={art.seal} />
            <Path
              d={`M${cork.x + cork.w * 0.02} ${cork.y + cork.h * 0.8} q${-cork.w * 0.04} ${cork.h * 0.7} ${cork.w * 0.04} ${cork.h * 0.9} q${cork.w * 0.06} ${-cork.h * 0.3} ${cork.w * 0.05} ${-cork.h * 0.9} z M${cork.x + cork.w * 0.7} ${cork.y + cork.h * 0.9} q0 ${cork.h * 0.8} ${cork.w * 0.07} ${cork.h * 0.8} q${cork.w * 0.04} ${-cork.h * 0.3} 0 ${-cork.h * 0.8} z`}
              fill={art.seal}
            />
            <Ellipse cx={cork.x + cork.w * 0.38} cy={cork.y + cork.h * 0.35} rx={cork.w * 0.14} ry={cork.h * 0.14} fill="#ffffff" opacity={0.2} />
          </G>
        )}
      </Svg>
    </View>
  );
}
