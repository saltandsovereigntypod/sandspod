import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { altarImageSource } from '../../lib/altar/assets';
import { cabinetEntry, topUses } from '../../lib/altar/companion';
import { cabinetCategories, cabinetItemsFor, formImage, formObjectLabel, placeableForms, shortLabel } from '../../lib/altar/cabinet';
import type { CabinetForm, CabinetItem } from '../../lib/altar/types';
import type { LibraryEntry } from '../../lib/library';
import { colors, fonts, radius, space, touch, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

type Props = {
  visible: boolean;
  items: CabinetItem[];
  overrides: Record<string, string>;
  /** The Living Library, for each item's two best-known uses. */
  library: LibraryEntry[];
  onClose: () => void;
  onPlace: (item: CabinetItem, form: CabinetForm) => void;
  /** Make your own item for a drawer, or change one you made. */
  onMakeOwn?: (category: string) => void;
  onEditOwn?: (item: CabinetItem) => void;
};

export function CabinetSheet({ visible, items, overrides, library, onClose, onPlace, onMakeOwn, onEditOwn }: Props) {
  const [category, setCategory] = useState<string>('candles');
  const [search, setSearch] = useState('');

  const shown = useMemo(
    () =>
      cabinetItemsFor(items, category, search)
        .map((item) => ({ item, forms: placeableForms(item, overrides) }))
        .filter((entry) => entry.forms.length > 0)
        .map((entry) => ({ ...entry, uses: topUses(cabinetEntry(library, entry.item, entry.forms[0])) })),
    [items, category, search, overrides, library],
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
      {!!onMakeOwn && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Make your own item for this drawer"
          onPress={() => onMakeOwn(category)}
          style={({ pressed }) => [styles.makeOwn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.makeOwnPlus}>＋</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.makeOwnTitle}>Make your own</Text>
            <Text style={type.caption}>Add something from your own shelf with a photo of it.</Text>
          </View>
        </Pressable>
      )}
      {shown.map(({ item, forms, uses }) =>
        forms.length === 1 && !item.customCabinetItemId ? null : (
          <View key={item.id} style={styles.group}>
            <View style={styles.groupHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.groupTitle}>
                  {item.name}
                  {item.customCabinetItemId ? '  ·  yours' : ''}
                </Text>
                {!!uses && <Text style={[styles.uses, styles.usesLeft]}>{uses}</Text>}
              </View>
              {!!item.customCabinetItemId && !!onEditOwn && (
                <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${item.name}`} onPress={() => onEditOwn(item)} hitSlop={8} style={styles.edit}>
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.grid}>
              {forms.map((form) => (
                <Tile
                  key={`${form.form}-${form.label}`}
                  label={form.label}
                  spoken={`Place ${shortLabel(formObjectLabel(item, form))}${uses ? `. For ${uses.replace(' · ', ' and ')}` : ''}`}
                  image={formImage(item, form, overrides)}
                  onPress={() => onPlace(item, form)}
                />
              ))}
            </View>
          </View>
        ),
      )}
      {shown.some(({ item, forms }) => forms.length === 1 && !item.customCabinetItemId) && (
        <View style={styles.grid}>
          {shown
            .filter(({ item, forms }) => forms.length === 1 && !item.customCabinetItemId)
            .map(({ item, forms, uses }) => (
              <Tile
                key={item.id}
                label={item.name}
                uses={uses}
                spoken={`Place ${shortLabel(formObjectLabel(item, forms[0]))}${uses ? `. For ${uses.replace(' · ', ' and ')}` : ''}`}
                image={formImage(item, forms[0], overrides)}
                onPress={() => onPlace(item, forms[0])}
              />
            ))}
        </View>
      )}
      <Text style={type.caption}>
        Tap to place it in the middle of the altar. Items you make here or on the website are kept in your cabinet in both places.
      </Text>
    </Sheet>
  );
}

function Tile({ label, uses, spoken, image, onPress }: { label: string; uses?: string; spoken: string; image: string; onPress: () => void }) {
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
      {!!uses && (
        <Text style={styles.uses} numberOfLines={2}>
          {uses}
        </Text>
      )}
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
  groupHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  edit: { minHeight: touch, justifyContent: 'center', paddingHorizontal: 6 },
  editText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold },
  makeOwn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: touch + 12,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.goldLine,
    padding: 12,
  },
  makeOwnPlus: { fontSize: 26, color: colors.gold },
  makeOwnTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
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
  usesLeft: { textAlign: 'left' },
  uses: { color: colors.gold, opacity: 0.8, fontFamily: fonts.body, fontSize: 11, lineHeight: 14, textAlign: 'center' },
});
