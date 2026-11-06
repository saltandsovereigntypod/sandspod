// Beside the kamea: the planet's numbers, and the sigils of its Intelligence
// and Spirit traced on its square from their Hebrew letters
// (lib/sigil/seals.ts). Ink on aged paper, as the sigil maker draws.

import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { Body, Expander } from '../rituals/ui';
import { planetById, type PlanetId } from '../../lib/sigil/kamea';
import { nameSum, SEALS_NOTE, sealOf, traceName } from '../../lib/sigil/seals';
import { colors, fonts, type } from '../../theme';
import { KameaUnderlay } from './SigilPicture';

const SIZE = 132;

export function PlanetSeal({ planet }: { planet: PlanetId }) {
  const seal = sealOf(planet);
  const p = planetById(planet);
  if (!seal || !p) return null;
  return (
    <Expander title={`${p.name}’s seal: its numbers, Intelligence and Spirit`}>
      <Body>{`Every row, column and diagonal of ${p.name}’s square adds to ${seal.line}; the whole square to ${seal.total}. Agrippa gives each planet a seal, and an Intelligence and a Spirit whose Hebrew names add up to the square’s own numbers.`}</Body>
      {!!seal.note && <Body muted>{seal.note}</Body>}
      <View style={styles.row}>
        {seal.names.map((n) => {
          const trace = traceName(planet, n);
          return (
            <View key={n.name} style={styles.item} accessible accessibilityLabel={`The ${n.role} of ${p.name}, ${n.name}, adding to ${nameSum(n)}, traced on the square`}>
              <View style={{ width: SIZE, height: SIZE }}>
                <Svg width={SIZE} height={SIZE} viewBox="0 0 100 100">
                  <Rect x={0} y={0} width={100} height={100} rx={6} fill="#efe3c4" />
                  {trace && <Path d={trace.d} stroke="#2b1d12" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
                </Svg>
                <KameaUnderlay planet={planet} size={SIZE} />
              </View>
              <Text style={styles.name}>{`${n.role}: ${n.name}`}</Text>
              <Text style={styles.hebrew}>{n.hebrew}</Text>
              <Text style={type.caption}>{`${n.letters.map((l) => `${l.name} ${l.value}`).join(' + ')} = ${nameSum(n)}`}</Text>
            </View>
          );
        })}
      </View>
      <Body muted>{SEALS_NOTE}</Body>
      <Body muted>The seal itself is a figure Agrippa prints without explaining how it was made; it isn’t redrawn here rather than guessed at.</Body>
    </Expander>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  item: { width: SIZE + 30, gap: 4 },
  name: { fontFamily: fonts.bodySemi, color: colors.cream, fontSize: 15 },
  hebrew: { fontSize: 18, color: colors.gold, writingDirection: 'rtl' },
});
