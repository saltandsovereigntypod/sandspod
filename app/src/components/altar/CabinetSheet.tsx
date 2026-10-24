import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { altarPicture, useImageRatio, useImageRatioVersion } from '../../lib/altar/assets';
import { AltarImage } from './AltarImage';
import { imageRatio } from '../../lib/altar/geometry';
import { cabinetEntry, topUses } from '../../lib/altar/companion';
import { cabinetCategoriesFor, cabinetItemsFor, deityPantheon, formImage, formObjectLabel, overrideKey, PANTHEON_GROUPS, placeableForms, shortLabel } from '../../lib/altar/cabinet';
import { pickImage, type PickedImage } from '../../lib/altar/images';
import { festivalWhen, nearWithThings, seasonalSections, type FestivalNear } from '../../lib/altar/seasonal';
import type { CabinetForm, CabinetItem } from '../../lib/altar/types';
import type { LibraryEntry } from '../../lib/library';
import { colors, fonts, radius, space, touch, type } from '../../theme';
import { Button } from '../Button';
import { Icon } from '../Icon';
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
  /** Signed in: your own picture for a built-in form, or back to the original (custom-images.js). */
  signedIn?: boolean;
  onSetImage?: (item: CabinetItem, form: CabinetForm, picked: PickedImage) => Promise<void>;
  onRemoveImage?: (item: CabinetItem, form: CabinetForm) => Promise<void>;
  /** The festivals that are near (a week before through their last day): their seasonal things come first. */
  near?: FestivalNear[] | null;
};

export function CabinetSheet({
  visible,
  items,
  overrides,
  library,
  onClose,
  onPlace,
  onMakeOwn,
  onEditOwn,
  signedIn,
  onSetImage,
  onRemoveImage,
  near = null,
}: Props) {
  // Near a festival with something in the drawer for it, the cabinet opens on its seasonal things.
  const nearShown = nearWithThings(near, items).length > 0;
  const [category, setCategory] = useState<string>(() => (nearShown ? 'seasonal' : 'candles'));
  // Seasonal, Natural, Plants and Offerings show once they hold something with a picture.
  const categories = cabinetCategoriesFor(nearShown).filter(
    (c) => (c.id !== 'seasonal' && c.id !== 'natural' && c.id !== 'plants' && c.id !== 'offerings') || items.some((item) => item.category === c.id),
  );
  const [search, setSearch] = useState('');
  // The form whose picture is being changed (press and hold a built-in tile).
  const [picture, setPicture] = useState<{ item: CabinetItem; form: CabinetForm } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Deity pantheons folded away (the drawer remembers them while the altar is open).
  const [closedPantheons, setClosedPantheons] = useState<Set<string>>(() => new Set());

  const changesPictures = !!onSetImage && !!onRemoveImage;
  const placeIt = (item: CabinetItem, form: CabinetForm) => {
    setPicture(null);
    setMessage(null);
    onPlace(item, form);
  };
  const choosePicture = (item: CabinetItem, form: CabinetForm) => {
    if (item.customCabinetItemId || !changesPictures) return undefined;
    return () => {
      setMessage(signedIn ? null : 'Please sign in to use your own pictures.');
      setPicture(signedIn ? { item, form } : null);
    };
  };
  const pictureLabel = picture ? shortLabel(formObjectLabel(picture.item, picture.form)) : '';
  const hasOwn = !!picture && !!overrides[overrideKey(picture.item, picture.form)];

  const replace = async () => {
    if (!picture || !onSetImage) return;
    setMessage(null);
    try {
      const picked = await pickImage();
      if (!picked) return;
      setBusy(true);
      await onSetImage(picture.item, picture.form, picked);
      setPicture(null);
      setMessage(`Your picture for ${pictureLabel} is saved.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Image upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    if (!picture || !onRemoveImage) return;
    setBusy(true);
    setMessage(null);
    try {
      await onRemoveImage(picture.item, picture.form);
      setPicture(null);
      setMessage('Default image restored.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Custom image could not be removed.');
    } finally {
      setBusy(false);
    }
  };

  const shown = useMemo(
    () =>
      cabinetItemsFor(items, category, search)
        .map((item) => ({ item, forms: placeableForms(item, overrides) }))
        .filter((entry) => entry.forms.length > 0)
        // Things the Living Library has no page for say a few words of their own (shelf.ts);
        // an offering always says what it is, not what its vessel is for, and a seasonal thing names its festivals.
        .map((entry) => ({ ...entry, uses: ((entry.item.category === 'offerings' || entry.item.category === 'seasonal') && entry.item.description) || topUses(cabinetEntry(library, entry.item, entry.forms[0])) || entry.item.description || '' })),
    [items, category, search, overrides, library],
  );

  // Items with just one form share a grid of tiles (deities are grouped by pantheon).
  const singles = shown.filter(({ item, forms }) => forms.length === 1 && !item.customCabinetItemId);
  const singleTile = ({ item, forms, uses }: (typeof shown)[number]) => (
    <Tile
      key={item.id}
      label={item.name}
      uses={uses}
      spoken={`Place ${shortLabel(formObjectLabel(item, forms[0]))}${uses ? `. For ${uses.replace(' · ', ' and ')}` : ''}`}
      image={formImage(item, forms[0], overrides)}
      onPress={() => placeIt(item, forms[0])}
      onLongPress={choosePicture(item, forms[0])}
    />
  );

  return (
    <Sheet
      visible={visible}
      onClose={() => {
        setPicture(null);
        setMessage(null);
        onClose();
      }}
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
            {categories.map((c) => (
              <Chip key={c.id} label={c.label} active={c.id === category} onPress={() => setCategory(c.id)} />
            ))}
          </ChipRow>
          {!!picture && (
            <View style={styles.picture}>
              <Text style={styles.makeOwnTitle}>Your picture for {pictureLabel}</Text>
              <Text style={type.caption}>It replaces the painted one wherever you place this, here and on the website.</Text>
              {busy ? (
                <ActivityIndicator color={colors.gold} accessibilityLabel="Saving your picture" />
              ) : (
                <View style={styles.pictureButtons}>
                  <Button label={hasOwn ? 'Replace picture' : 'Choose a picture'} onPress={replace} />
                  {hasOwn && <Button label="Use the original" variant="outline" onPress={restore} />}
                  <Button label="Cancel" variant="text" onPress={() => setPicture(null)} />
                </View>
              )}
            </View>
          )}
          {!!message && (
            <Text style={type.caption} accessibilityLiveRegion="polite">
              {message}
            </Text>
          )}
        </View>
      }
    >
      {shown.length === 0 && <Text style={type.body}>Nothing in this drawer{search ? ' matches that search' : ''}.</Text>}
      {!!onMakeOwn && category !== 'seasonal' && category !== 'natural' && category !== 'plants' && category !== 'offerings' && (
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
                  onPress={() => placeIt(item, form)}
                  onLongPress={choosePicture(item, form)}
                />
              ))}
            </View>
          </View>
        ),
      )}
      {category === 'offerings' && (
        <Text style={type.caption}>
          Each is set out fresh as you place it and goes over in real time, as the real thing would; tend it from its panel. The filled vessels come already poured or heaped. Any bowl, dish or chalice can still hold something else through Set out an offering.
        </Text>
      )}
      {category === 'plants' && (
        <Text style={type.caption}>Each pot stands for one of your own plants: set down as many as you keep, then name it, choose the picture that matches it and mark it watered from its panel.</Text>
      )}
      {category === 'deities'
        ? [...PANTHEON_GROUPS, 'Your own']
            .map((pantheon) => ({ pantheon, list: singles.filter(({ item }) => deityPantheon(item) === pantheon) }))
            .filter(({ list }) => list.length > 0)
            .map(({ pantheon, list }) => {
              // A search shows every match, so no pantheon stays folded while searching.
              const open = !!search.trim() || !closedPantheons.has(pantheon);
              return (
                <View key={pantheon} style={styles.pantheon}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    accessibilityLabel={`${pantheon}, ${list.length} ${list.length === 1 ? 'statue' : 'statues'}`}
                    onPress={() =>
                      setClosedPantheons((current) => {
                        const next = new Set(current);
                        if (next.has(pantheon)) next.delete(pantheon);
                        else next.add(pantheon);
                        return next;
                      })
                    }
                    style={({ pressed }) => [styles.pantheonHead, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={[styles.groupTitle, { flex: 1 }]}>{pantheon}</Text>
                    <Text style={type.caption}>{list.length}</Text>
                    <View style={open ? styles.chevronOpen : undefined}>
                      <Icon name="chevron" size={14} color={colors.tabInactive} />
                    </View>
                  </Pressable>
                  {open && <View style={styles.grid}>{list.map(singleTile)}</View>}
                </View>
              );
            })
        : category === 'seasonal'
          ? // "For Samhain" first for each festival that's near, then each calendar's things through its year.
            seasonalSections(
              singles.map(({ item }) => item),
              near,
            ).map((section) => (
              <View key={section.title} style={styles.pantheon}>
                <Text style={styles.groupTitle} accessibilityRole="header">
                  {section.title}
                </Text>
                {!!section.near && <Text style={type.caption}>{festivalWhen(section.near)}</Text>}
                <View style={styles.grid}>
                  {section.items.map((item) => singles.find((entry) => entry.item === item)).filter((entry) => !!entry).map(singleTile)}
                </View>
              </View>
            ))
          : singles.length > 0 && <View style={styles.grid}>{singles.map(singleTile)}</View>}
      <Text style={type.caption}>
        Tap to place it in the middle of the altar. Items you make here or on the website are kept in your cabinet in both places.
        {changesPictures ? ' Press and hold a picture to use a photo of your own for it.' : ''}
      </Text>
    </Sheet>
  );
}

function Tile({
  label,
  uses,
  spoken,
  image,
  onPress,
  onLongPress,
}: {
  label: string;
  uses?: string;
  spoken: string;
  image: string;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const picture = altarPicture(image);
  // Heaps of chips and loose herbs are wide and flat: give them a wide frame
  // so they fill the tile instead of sitting small in a square of empty space.
  useImageRatio(image);
  useImageRatioVersion();
  const ratio = image ? imageRatio(image) : null;
  const wide = ratio != null && ratio < 0.75;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityActions={onLongPress ? [{ name: 'longpress', label: 'Use your own picture' }] : undefined}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'longpress') onLongPress?.();
      }}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.thumb, wide && styles.thumbWide]}>
        {picture && <AltarImage picture={picture} style={wide ? styles.thumbImageWide : styles.thumbImage} resizeMode="contain" />}
      </View>
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
  pantheon: { gap: 8 },
  pantheonHead: { minHeight: touch, flexDirection: 'row', alignItems: 'center', gap: 8 },
  chevronOpen: { transform: [{ rotate: '90deg' }] },
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
  picture: { gap: 8, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.goldLine, padding: 12 },
  pictureButtons: { gap: 8 },
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
  thumbWide: { aspectRatio: 1.5, flexGrow: 1 },
  thumbImage: { width: '90%', height: '90%' },
  thumbImageWide: { width: '100%', height: '100%' },
  tileLabel: { color: colors.parchment, fontFamily: fonts.body, fontSize: 13, textAlign: 'center' },
  usesLeft: { textAlign: 'left' },
  uses: { color: colors.gold, opacity: 0.8, fontFamily: fonts.body, fontSize: 11, lineHeight: 14, textAlign: 'center' },
});
