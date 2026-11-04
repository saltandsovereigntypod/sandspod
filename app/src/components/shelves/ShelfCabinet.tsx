import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Line, Rect, Stop } from 'react-native-svg';

import { altarPicture } from '../../lib/altar/assets';
import { isLow, type ShelfEntry, type ShelfKind } from '../../lib/shelves/model';
import { colors, fonts, type } from '../../theme';
import { AltarImage } from '../altar/AltarImage';

/** A thing's picture: the cabinet's art or your own photo, or its first letter. */
export function ShelfPicture({ image, name, size }: { image: string; name: string; size: number }) {
  const picture = altarPicture(image);
  if (picture) return <AltarImage picture={picture} style={{ width: size, height: size }} resizeMode="contain" />;
  return (
    <View style={[styles.letter, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.letterText}>{name.trim().charAt(0).toUpperCase() || '·'}</Text>
    </View>
  );
}

// A painted plank: warm wood with a lit front edge and a few grain lines.
function Plank() {
  return (
    <Svg width="100%" height={18} preserveAspectRatio="none" viewBox="0 0 100 18" aria-hidden>
      <Defs>
        <LinearGradient id="plank" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#a5743f" />
          <Stop offset="0.35" stopColor="#7a512a" />
          <Stop offset="1" stopColor="#3f2913" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="18" fill="url(#plank)" />
      <Rect x="0" y="0" width="100" height="2" fill="#c89a5c" opacity={0.7} />
      <Line x1="4" y1="7" x2="38" y2="8" stroke="#5a3a1c" strokeWidth={0.4} opacity={0.6} />
      <Line x1="52" y1="10" x2="96" y2="9" stroke="#5a3a1c" strokeWidth={0.4} opacity={0.6} />
      <Line x1="20" y1="13" x2="70" y2="14" stroke="#5a3a1c" strokeWidth={0.3} opacity={0.5} />
    </Svg>
  );
}

/**
 * The curio cabinet: one painted shelf per kind, each thing on it with its
 * picture and name, low ones marked. Tapping one opens it.
 */
export function ShelfCabinet({ shelves, onOpen }: { shelves: { key: ShelfKind; label: string; entries: ShelfEntry[] }[]; onOpen: (id: string) => void }) {
  return (
    <View style={styles.cabinet}>
      {shelves.map((shelf) => (
        <View key={shelf.key} style={styles.shelf}>
          <View style={styles.plaque}>
            <Text style={styles.plaqueText}>{shelf.label}</Text>
          </View>
          <View style={styles.back}>
            {shelf.entries.length === 0 ? (
              <Text style={styles.empty}>Nothing here yet</Text>
            ) : (
              shelf.entries.map(({ id, item }) => (
                <Pressable
                  key={id}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}${isLow(item) ? ', running low' : ''}`}
                  onPress={() => onOpen(id)}
                  style={({ pressed }) => [styles.thing, pressed && { opacity: 0.7 }]}
                >
                  <ShelfPicture image={item.image} name={item.name} size={56} />
                  <Text style={styles.thingName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {isLow(item) && <Text style={styles.low}>Low</Text>}
                </Pressable>
              ))
            )}
          </View>
          <Plank />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cabinet: {
    backgroundColor: '#2a1a0d',
    borderRadius: 14,
    borderWidth: 6,
    borderColor: '#5b3b1d',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 10,
  },
  shelf: { gap: 0 },
  plaque: {
    alignSelf: 'center',
    backgroundColor: '#3a2611',
    borderColor: colors.goldDeep,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 4,
  },
  plaqueText: { fontFamily: fonts.display, fontSize: 15, color: colors.gold },
  back: {
    minHeight: 84,
    backgroundColor: '#1d120a',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    paddingTop: 8,
    gap: 4,
  },
  empty: { ...type.caption, color: 'rgba(202,191,157,0.55)', fontStyle: 'italic', alignSelf: 'center', margin: 12 },
  thing: { width: 72, alignItems: 'center', gap: 2, paddingBottom: 2, minHeight: 44 },
  thingName: { fontFamily: fonts.body, fontSize: 11, lineHeight: 13, color: colors.parchment, textAlign: 'center' },
  low: { position: 'absolute', top: 0, right: 2, fontFamily: fonts.bodySemi, fontSize: 10, color: colors.forestInk, backgroundColor: colors.gold, borderRadius: 6, paddingHorizontal: 4, overflow: 'hidden' },
  letter: { backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  letterText: { fontFamily: fonts.display, fontSize: 24, color: colors.gold },
});
