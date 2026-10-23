import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../Button';
import { SigilPicture } from '../sigil/SigilPicture';
import { CARVING_MAX, carvingMark, type Carving } from '../../lib/altar/livingState';
import { useCraft } from '../../lib/craft/store';
import { markOf, readSigil, SIGILS, type KeptSigil, type SigilMark } from '../../lib/sigil/sigil';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

type Props = {
  visible: boolean;
  candle: string;
  carvings: Carving[];
  onClose: () => void;
  onCarve: (text: string, sigil?: SigilMark) => void;
  onSmooth: (index: number) => void;
  /** Off to the sigil maker. */
  onMakeSigil?: () => void;
};

/** Carve a word, name or sigil into the candle; it's kept with the candle like its dressings. */
export function CarveSheet({ visible, candle, carvings, onClose, onCarve, onSmooth, onMakeSigil }: Props) {
  const [text, setText] = useState('');
  const { entries } = useCraft<KeptSigil>(SIGILS);
  const sigils = entries
    .map((e) => ({ id: e.id, name: e.data?.name || 'My sigil', sigil: readSigil(e.data?.sigil) }))
    .filter((k): k is { id: string; name: string; sigil: NonNullable<ReturnType<typeof readSigil>> } => !!k.sigil);
  const carved = new Set(carvings.map((c) => carvingMark(c)?.d).filter(Boolean));
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
      <View style={styles.list}>
        <Text style={type.eyebrow}>Or carve a sigil</Text>
        {sigils.length > 0 ? (
          <View style={styles.sigils}>
            {sigils.map((k) => {
              const mark = markOf(k.sigil);
              const done = !!mark && carved.has(mark.d);
              return (
                <Pressable
                  key={k.id}
                  accessibilityRole="button"
                  accessibilityLabel={done ? `${k.name}, already carved` : `Carve the sigil for ${k.name}`}
                  disabled={done || !mark}
                  onPress={() => mark && onCarve(k.name, mark)}
                  style={({ pressed }) => [styles.sigil, (pressed || done) && styles.dim]}
                >
                  <SigilPicture sigil={k.sigil} size={64} />
                  <Text style={styles.sigilName} numberOfLines={2}>
                    {done ? 'Carved' : k.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text style={type.caption}>Sigils you keep from the sigil maker wait here, ready to carve.</Text>
        )}
        {onMakeSigil && (
          <ChipRow>
            <Chip label="Make a sigil" symbol="✧" onPress={onMakeSigil} />
          </ChipRow>
        )}
      </View>
      {carvings.length > 0 && (
        <View style={styles.list}>
          <Text style={type.eyebrow}>Carved into it</Text>
          <ChipRow>
            {carvings.map((carving, index) => (
              <Chip
                key={`${carving.text}-${index}`}
                label={carvingMark(carving) ? `Sigil: ${carving.text}  ×` : `“${carving.text}”  ×`}
                accessibilityLabel={`Smooth away ${carvingMark(carving) ? `the sigil for ${carving.text}` : carving.text}`}
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
  sigils: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sigil: { width: 84, minHeight: touch, alignItems: 'center', gap: 4 },
  sigilName: { fontFamily: fonts.body, fontSize: 12, lineHeight: 15, color: colors.parchment, textAlign: 'center' },
  dim: { opacity: 0.55 },
});
