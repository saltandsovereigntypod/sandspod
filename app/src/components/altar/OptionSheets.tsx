import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../Button';
import { altarImageSource } from '../../lib/altar/assets';
import { builtInBackgrounds, DEFAULT_BACKGROUND } from '../../lib/altar/cabinet';
import { stackOrder } from '../../lib/altar/layers';
import { canDressWith, isCandle, isLit } from '../../lib/altar/livingState';
import type { AltarDocument } from '../../lib/altar/snapshot';
import type { AltarBackground } from '../../lib/altar/types';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Sheet } from './Sheet';

// ---------- Backgrounds ----------

export function BackgroundSheet({
  visible,
  current,
  custom,
  onClose,
  onChoose,
}: {
  visible: boolean;
  current: string;
  custom: AltarBackground[];
  onClose: () => void;
  onChoose: (background: AltarBackground) => void;
}) {
  const all = [...custom, ...builtInBackgrounds];
  const active = current || DEFAULT_BACKGROUND;
  return (
    <Sheet visible={visible} onClose={onClose} eyebrow="Backgrounds" title="Set the scene">
      {all.map((bg) => {
        const source = altarImageSource(bg.background);
        const selected = bg.background === active;
        return (
          <Pressable
            key={bg.id}
            onPress={() => onChoose(bg)}
            accessibilityRole="button"
            accessibilityLabel={`${bg.name}${bg.custom ? ', your upload' : ''}`}
            accessibilityState={{ selected }}
            style={({ pressed }) => [styles.bg, selected && styles.bgSelected, pressed && { opacity: 0.8 }]}
          >
            {source && <Image source={source} style={styles.bgImage} resizeMode="cover" />}
            <View style={styles.bgLabel}>
              <Text style={styles.bgName}>{bg.name}</Text>
              {selected && <Text style={styles.bgTick}>On your altar</Text>}
            </View>
          </Pressable>
        );
      })}
      <Text style={type.caption}>Backgrounds you upload on the website appear here when you're signed in.</Text>
    </Sheet>
  );
}

// ---------- Layers ----------

export function LayersSheet({
  visible,
  doc,
  selected,
  onClose,
  onSelect,
  onMove,
}: {
  visible: boolean;
  doc: AltarDocument;
  selected: number | null;
  onClose: () => void;
  onSelect: (index: number) => void;
  onMove: (index: number, move: 'forward' | 'backward') => void;
}) {
  // Top of the stack first, like a layers panel.
  const order = [...stackOrder(doc.objects)].reverse();
  return (
    <Sheet visible={visible} onClose={onClose} eyebrow="Layers" title="What sits in front">
      {order.length === 0 && <Text style={type.body}>Nothing on the altar yet.</Text>}
      <View style={styles.list}>
        {order.map((index, position) => {
          const object = doc.objects[index];
          const source = altarImageSource(object.imagePath);
          const name = object.label || 'Object';
          const state = [isCandle(object) && isLit(object) ? 'lit' : null, object.locked === 'true' ? 'locked' : null]
            .filter(Boolean)
            .join(', ');
          return (
            <View key={`${object.altarObjectId}-${index}`} style={[styles.layer, selected === index && styles.layerSelected]}>
              <Pressable
                style={styles.layerMain}
                onPress={() => onSelect(index)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${name}${state ? `, ${state}` : ''}. Layer ${position + 1} of ${order.length} from the front.`}
              >
                <View style={styles.layerThumb}>
                  {source && <Image source={source} style={styles.layerThumbImage} resizeMode="contain" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.layerName} numberOfLines={1}>
                    {name}
                  </Text>
                  {state ? <Text style={type.caption}>{state}</Text> : null}
                </View>
              </Pressable>
              <Pressable
                style={styles.layerButton}
                disabled={position === 0}
                onPress={() => onMove(index, 'forward')}
                accessibilityRole="button"
                accessibilityLabel={`Bring ${name} forward`}
              >
                <Text style={[styles.layerArrow, position === 0 && styles.disabled]}>↑</Text>
              </Pressable>
              <Pressable
                style={styles.layerButton}
                disabled={position === order.length - 1}
                onPress={() => onMove(index, 'backward')}
                accessibilityRole="button"
                accessibilityLabel={`Send ${name} backward`}
              >
                <Text style={[styles.layerArrow, position === order.length - 1 && styles.disabled]}>↓</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </Sheet>
  );
}

// ---------- Dressing a candle ----------

export function DressSheet({
  visible,
  doc,
  candle,
  onClose,
  onDress,
}: {
  visible: boolean;
  doc: AltarDocument;
  candle: number | null;
  onClose: () => void;
  onDress: (ingredient: number) => void;
}) {
  const ingredients = doc.objects.map((o, i) => ({ o, i })).filter(({ o, i }) => i !== candle && canDressWith(o));
  return (
    <Sheet visible={visible} onClose={onClose} eyebrow="Dress the candle" title="Anoint and adorn">
      {ingredients.length === 0 ? (
        <Text style={type.body}>Place a loose herb or an oil on the altar first, then dress the candle with it.</Text>
      ) : (
        <>
          <Text style={type.body}>Choose a herb or oil from your altar. Loose herbs and oils show on the candle.</Text>
          <View style={styles.list}>
            {ingredients.map(({ o, i }) => {
              const source = altarImageSource(o.imagePath);
              return (
                <Pressable
                  key={`${o.altarObjectId}-${i}`}
                  onPress={() => onDress(i)}
                  accessibilityRole="button"
                  accessibilityLabel={`Dress with ${o.label || 'ingredient'}`}
                  style={({ pressed }) => [styles.layer, pressed && { opacity: 0.7 }]}
                >
                  <View style={styles.layerMain}>
                    <View style={styles.layerThumb}>
                      {source && <Image source={source} style={styles.layerThumbImage} resizeMode="contain" />}
                    </View>
                    <Text style={styles.layerName}>{o.label || 'Ingredient'}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Sheet>
  );
}

// ---------- Saving ----------

export function SaveSheet({
  visible,
  initialName,
  hasSource,
  signedIn,
  onClose,
  onSave,
}: {
  visible: boolean;
  initialName: string;
  hasSource: boolean;
  signedIn: boolean;
  onClose: () => void;
  onSave: (name: string, asNew: boolean) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setError(null);
    }
  }, [visible, initialName]);

  const run = async (asNew: boolean) => {
    setBusy(true);
    setError(null);
    try {
      await onSave(name, asNew);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} eyebrow={signedIn ? 'Saved to your Sanctuary' : 'Saved on this device'} title="Save this altar">
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="My Altar"
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="Altar name"
        style={styles.input}
        returnKeyType="done"
      />
      {busy ? (
        <ActivityIndicator color={colors.gold} />
      ) : (
        <View style={styles.saveButtons}>
          <Button label={hasSource ? 'Save changes' : 'Save altar'} onPress={() => run(false)} />
          {hasSource && <Button label="Save as a new altar" variant="outline" onPress={() => run(true)} />}
        </View>
      )}
      {error && (
        <Text style={[type.caption, styles.error]} accessibilityLiveRegion="polite">
          Couldn't save ({error}). Your changes are kept on this phone; try again when you're online.
        </Text>
      )}
      {!signedIn && (
        <Text style={type.caption}>You're a guest, so this altar stays on this device. Sign in to keep it in your Sanctuary.</Text>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  bg: { borderRadius: radius.tile, overflow: 'hidden', borderWidth: 1, borderColor: colors.hairline, aspectRatio: 16 / 9 },
  bgSelected: { borderColor: colors.gold, borderWidth: 2 },
  bgImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  bgLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: 'rgba(7,10,8,0.7)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bgName: { fontFamily: fonts.display, fontSize: 20, color: colors.cream },
  bgTick: { fontFamily: fonts.body, fontSize: 13, color: colors.gold },
  list: { gap: 8 },
  layer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.tile,
    backgroundColor: colors.ground,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingLeft: 8,
  },
  layerSelected: { borderColor: colors.gold },
  layerMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 6 },
  layerThumb: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  layerThumbImage: { width: 40, height: 40 },
  layerName: { color: colors.cream, fontFamily: fonts.body, fontSize: 15 },
  layerButton: { width: touch, height: 56, alignItems: 'center', justifyContent: 'center' },
  layerArrow: { color: colors.gold, fontSize: 20 },
  disabled: { opacity: 0.3 },
  input: {
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
  saveButtons: { gap: 10 },
  error: { color: '#e8a58f' },
});
