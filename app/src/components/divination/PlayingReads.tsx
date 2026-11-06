import { StyleSheet, Text, View } from 'react-native';

import { playingSuitOf, type PlayingCard } from '../../lib/divination/oracle/playing';
import { colors, fonts, type } from '../../theme';

/** A playing card's written readings for the general, love and money questions, under its meaning. */
export function PlayingReads({ card }: { card: PlayingCard }) {
  const suit = playingSuitOf(card);
  const rows: [string, string][] = [
    ['In general', card.reading.general],
    ['In love', card.reading.love],
    ['In money', card.reading.money],
  ];
  return (
    <View style={styles.box}>
      {!!suit && <Text style={type.caption}>{`${suit.name}: ${suit.about}`}</Text>}
      {rows.map(([label, text]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.text}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 10, marginTop: 8 },
  row: { gap: 2 },
  label: { fontFamily: fonts.display, fontSize: 13, color: colors.forestInk, letterSpacing: 0.4 },
  text: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.forestInk },
});
