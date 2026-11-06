import { Text, View } from 'react-native';

import type { Figure } from '../../lib/divination/geomancy';
import { colors, fonts } from '../../theme';

/** A geomantic figure: four lines of one dot or two, Fire at the top. */
export function FigureGlyph({ figure, size = 10, label, caption }: { figure: Figure; size?: number; label?: string; caption?: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }} accessible accessibilityLabel={`${label ? `${label}: ` : ''}${figure.name}`}>
      {!!label && <Text style={{ fontFamily: fonts.body, fontSize: 10, color: colors.cream, opacity: 0.8 }}>{label}</Text>}
      <View style={{ gap: size * 0.45, paddingVertical: 2 }}>
        {figure.lines.map((n, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'center', gap: size * 0.9 }}>
            {Array.from({ length: n }).map((_, k) => (
              <View key={k} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.gold }} />
            ))}
          </View>
        ))}
      </View>
      <Text style={{ fontFamily: fonts.display, fontSize: 11, color: colors.cream }}>{caption ?? figure.name}</Text>
    </View>
  );
}
