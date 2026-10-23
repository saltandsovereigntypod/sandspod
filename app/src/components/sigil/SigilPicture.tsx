// A sigil drawn from its saved shape: ink on aged paper by default, the same
// picture the Grimoire keeps (lib/sigil/sigil.ts sigilSvg), or the ink alone.

import { memo, useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { G, Line, Text as SvgText, SvgXml } from 'react-native-svg';

import { KAMEAS, SQUARE_BOX, type PlanetId } from '../../lib/sigil/kamea';
import { sigilSvg, type Sigil } from '../../lib/sigil/sigil';
import { fonts } from '../../theme';

type Props = {
  sigil: Pick<Sigil, 'd' | 'weight' | 'ring'>;
  size: number;
  paper?: boolean;
  ink?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export const SigilPicture = memo(function SigilPicture({ sigil, size, paper = true, ink, label, style }: Props) {
  const xml = useMemo(() => sigilSvg(sigil, { paper, ink, size }), [sigil, paper, ink, size]);
  return (
    <View
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      style={[{ width: size, height: size, borderRadius: paper ? 6 : 0, overflow: 'hidden' }, style]}
    >
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
});

/** A planet's square, faint, drawn under a kamea sigil while it's being made. */
export const KameaUnderlay = memo(function KameaUnderlay({ planet, size }: { planet: PlanetId; size: number }) {
  const square = KAMEAS[planet];
  const n = square.length;
  const cell = (SQUARE_BOX.max - SQUARE_BOX.min) / n;
  const lines = Array.from({ length: n + 1 }, (_, i) => SQUARE_BOX.min + i * cell);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
      <G opacity={0.4}>
        {lines.map((v) => (
          <G key={v}>
            <Line x1={SQUARE_BOX.min} y1={v} x2={SQUARE_BOX.max} y2={v} stroke="#6b4a2b" strokeWidth={0.3} />
            <Line x1={v} y1={SQUARE_BOX.min} x2={v} y2={SQUARE_BOX.max} stroke="#6b4a2b" strokeWidth={0.3} />
          </G>
        ))}
        {square.map((row, r) =>
          row.map((value, c) => (
            <SvgText
              key={`${r}-${c}`}
              x={SQUARE_BOX.min + (c + 0.5) * cell}
              y={SQUARE_BOX.min + (r + 0.5) * cell + cell * 0.14}
              fontSize={cell * 0.38}
              fontFamily={fonts.body}
              textAnchor="middle"
              fill="#6b4a2b"
            >
              {String(value)}
            </SvgText>
          )),
        )}
      </G>
    </Svg>
  );
});
