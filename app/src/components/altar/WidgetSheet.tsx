import { StyleSheet, Text, View } from 'react-native';

import type { SavedAltar } from '../../lib/altar/types';
import { ALTAR_WIDGET_SLOTS, slotAltars } from '../../lib/altarWidget';
import { setAltarWidgetSlot, useAltarWidgetSlots } from '../../lib/altarWidgetSlots';
import { colors, fonts, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

type Props = {
  visible: boolean;
  altarId: string;
  altarName: string;
  altars: SavedAltar[];
  onClose: () => void;
};

/** Which place this altar takes in the home screen's Altar widget. */
export function WidgetSheet({ visible, altarId, altarName, altars, onClose }: Props) {
  const chosen = useAltarWidgetSlots();
  const placed = slotAltars(altars, chosen);
  const mine = chosen.indexOf(altarId);
  return (
    <Sheet visible={visible} size="half" eyebrow="Home screen widget" title={altarName} onClose={onClose}>
      <Text style={type.body}>
        Put this altar on your home or lock screen, with buttons to light its candles, tend offerings and cleanse its crystals.
        Whatever you do there is carried onto this altar the next time the app opens.
      </Text>
      <Text style={[type.eyebrow, styles.heading]}>Choose its place</Text>
      <ChipRow>
        {Array.from({ length: ALTAR_WIDGET_SLOTS }, (_, i) => (
          <Chip
            key={i}
            label={`Altar ${i + 1}`}
            active={placed[i]?.id === altarId}
            accessibilityLabel={`Altar ${i + 1}${placed[i] ? `, now ${placed[i].name}` : ''}`}
            onPress={() => setAltarWidgetSlot(altarId, i + 1)}
          />
        ))}
        {mine >= 0 && <Chip label="Let the app choose" onPress={() => setAltarWidgetSlot(altarId, 0)} />}
      </ChipRow>
      <View style={styles.places}>
        {Array.from({ length: ALTAR_WIDGET_SLOTS }, (_, i) => (
          <Text key={i} style={[type.caption, styles.place, placed[i]?.id === altarId && styles.here]}>
            {`Altar ${i + 1}: ${placed[i]?.name ?? 'empty'}${placed[i] && chosen[i] !== placed[i].id ? ' (most recent)' : ''}`}
          </Text>
        ))}
      </View>
      <Text style={[type.eyebrow, styles.heading]}>Adding it</Text>
      <Text style={type.caption}>
        Press and hold an empty spot on your home screen, tap Edit, then Add Widget, and find Salt & Sovereignty. Choose
        Altar in the size you like. Then press and hold the widget, tap Edit Widget and pick {`“Altar ${placed.findIndex((a) => a.id === altarId) + 1 || 1}”`}.
        Add as many as you like, one for each altar.
      </Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: 18 },
  places: { gap: 2, marginTop: 10 },
  place: { color: colors.muted },
  here: { color: colors.cream, fontFamily: fonts.bodySemi },
});
