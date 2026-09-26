import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { altarImageSource } from '../../lib/altar/assets';
import { cabinetCategories, cabinetItemsFor, formImage, formObjectLabel, placeableForms } from '../../lib/altar/cabinet';
import type { CabinetForm, CabinetItem } from '../../lib/altar/types';
import { colors, fonts, radius, space, touch, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

type Props = {
  visible: boolean;
  items: CabinetItem[];
  overrides: Record<string, string>;
  onClose: () => void;
  onPlace: (item: CabinetItem, form: CabinetForm) => void;
};

export function CabinetSheet({ visible, items, overrides, onClose, onPlace }: Props) {
  const [category, setCategory] = useState<string>('candles');
  const [search, setSearch] = useState('');

  const shown = useMemo(
    () =>
      cabinetItemsFor(items, category, search)
        .map((item) => ({ item, forms: placeableForms(item, overrides) }))
        .filter((entry) => entry.forms.length > 0),
    [items, category, search, overrides],
  );

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      eyebrow="The Cabinet"
      title="Choose what belongs"
      header={
        <View style={styles.header}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search the cabinet"
            placeholderTextColor={colors.tabInactive}
            accessibilityLabel="Search the cabinet"
            style={styles.search}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          <ChipRow>
            {cabinetCategories.map((c) => (
              <Chip key={c.id} label={c.label} active={c.id === category} onPress={() => setCategory(c.id)} />
            ))}
          </ChipRow>
        </View>
      }
    >
      {shown.length === 0 && <Text style={type.body}>Nothing in this drawer{search ? ' matches that search' : ''}.</Text>}
      {shown.map(({ item, forms }) =>
        forms.length === 1 ? null : (
          <View key={item.id} style={styles.group}>
            <Text style={styles.groupTitle}>
              {item.name}
              {item.customCabinetItemId ? '  ·  yours' : ''}
            </Text>
            <View style={styles.grid}>
              {forms.map((form) => (
                <Tile
                  key={`${form.form}-${form.label}`}
                  label={form.label}
                  spoken={`Place ${formObjectLabel(item, form)}`}
                  image={formImage(item, form, overrides)}
                  onPress={() => onPlace(item, form)}
                />
              ))}
            </View>
          </View>
        ),
      )}
      {shown.some(({ forms }) => forms.length === 1) && (
        <View style={styles.grid}>
          {shown
            .filter(({ forms }) => forms.length === 1)
            .map(({ item, forms }) => (
              <Tile
                key={item.id}
                label={item.name}
                spoken={`Place ${formObjectLabel(item, forms[0])}`}
                image={formImage(item, forms[0], overrides)}
                onPress={() => onPlace(item, forms[0])}
              />
            ))}
        </View>
      )}
      <Text style={type.caption}>
        Tap to place it in the middle of the altar. Custom items you make on the website appear here too.
      </Text>
    </Sheet>
  );
}

function Tile({ label, spoken, image, onPress }: { label: string; spoken: string; image: string; onPress: () => void }) {
  const source = altarImageSource(image);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={spoken}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.thumb}>{source && <Image source={source} style={styles.thumbImage} resizeMode="contain" />}</View>
      <Text style={styles.tileLabel} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.gutter, gap: 12, paddingBottom: 12 },
  search: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ground,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingHorizontal: 14,
  },
  group: { gap: 8 },
  groupTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.cream },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '30%',
    flexGrow: 1,
    maxWidth: '32%',
    minHeight: touch,
    borderRadius: radius.tile,
    backgroundColor: colors.ground,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 8,
    alignItems: 'center',
    gap: 6,
  },
  thumb: { width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  thumbImage: { width: '90%', height: '90%' },
  tileLabel: { color: colors.parchment, fontFamily: fonts.body, fontSize: 13, textAlign: 'center' },
});
