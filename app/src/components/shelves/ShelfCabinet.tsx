import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Line, Rect, Stop } from 'react-native-svg';

import { Button } from '../Button';
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

const PER_PLANK = 4;

/**
 * The curio cabinet: the chosen shelf's things on planks of a few at a time, each with its
 * picture and name, low ones marked. Tapping one opens it. `groups` is one shelf, or every
 * shelf (with plaques) for "All"; only `limit` things are drawn, the rest come with "Show more".
 */
export function ShelfCabinet({
  groups,
  limit,
  showPlaques,
  onOpen,
  onMore,
}: {
  groups: { key: ShelfKind; label: string; entries: ShelfEntry[] }[];
  limit: number;
  showPlaques: boolean;
  onOpen: (id: string) => void;
  onMore: () => void;
}) {
  const total = groups.reduce((n, g) => n + g.entries.length, 0);
  const more = Math.max(total - limit, 0);
  const blocks = groups.map((g, i) => {
    const before = groups.slice(0, i).reduce((n, x) => n + x.entries.length, 0);
    return { ...g, shown: g.entries.slice(0, Math.max(limit - before, 0)) };
  });
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.cabinet}>
        {blocks.map((g) => {
          if (g.shown.length === 0) return null;
          const rows: ShelfEntry[][] = [];
          for (let i = 0; i < g.shown.length; i += PER_PLANK) rows.push(g.shown.slice(i, i + PER_PLANK));
          return (
            <View key={g.key} style={styles.shelf}>
              {showPlaques && (
                <View style={styles.plaque}>
                  <Text style={styles.plaqueText}>{g.label}</Text>
                </View>
              )}
              {rows.map((row, r) => (
                <View key={r}>
                  <View style={styles.back}>
                    {row.map(({ id, item }) => (
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
                    ))}
                  </View>
                  <Plank />
                </View>
              ))}
            </View>
          );
        })}
      </View>
      {more > 0 && <Button label={`Show more (${more})`} variant="outline" onPress={onMore} />}
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
