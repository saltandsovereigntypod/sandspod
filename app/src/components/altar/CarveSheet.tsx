import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../Button';
import { CARVING_MAX, type Carving } from '../../lib/altar/livingState';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

type Props = {
  visible: boolean;
  candle: string;
  carvings: Carving[];
  onClose: () => void;
  onCarve: (text: string) => void;
  onSmooth: (index: number) => void;
};

/** Carve a word, name or sigil into the candle; it's kept with the candle like its dressings. */
export function CarveSheet({ visible, candle, carvings, onClose, onCarve, onSmooth }: Props) {
  const [text, setText] = useState('');
  const carve = () => {
    if (!text.trim()) return;
    onCarve(text);
    setText('');
  };

  return (
    <Sheet visible={visible} size="half" eyebrow="Carve the candle" title={candle} onClose={onClose}>
      <Text style={type.caption}>A name, a word, a date or a sigil’s name. Keep it short enough to hold in mind.</Text>
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={carve}
          placeholder="Abundance"
          placeholderTextColor={colors.tabInactive}
          accessibilityLabel="Word to carve"
          maxLength={CARVING_MAX}
          returnKeyType="done"
          autoCapitalize="words"
          style={styles.input}
        />
        <Button label="Carve" onPress={carve} disabled={!text.trim()} />
      </View>
      {carvings.length > 0 && (
        <View style={styles.list}>
          <Text style={type.eyebrow}>Carved into it</Text>
          <ChipRow>
            {carvings.map((carving, index) => (
              <Chip
                key={`${carving.text}-${index}`}
                label={`“${carving.text}”  ×`}
                accessibilityLabel={`Smooth away ${carving.text}`}
                onPress={() => onSmooth(index)}
              />
            ))}
          </ChipRow>
          <Text style={type.caption}>Tap a carving to smooth it away.</Text>
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ground,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  list: { gap: 8 },
});
