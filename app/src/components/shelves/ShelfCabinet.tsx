import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Button } from '../Button';
import { altarImageSource, altarPicture, useImageRatio, useImageRatioVersion } from '../../lib/altar/assets';
import { imageRatio } from '../../lib/altar/geometry';
import { containedRect, labelText } from '../../lib/altar/vesselLabel';
import { layoutShelf, shelfArtFor, shelfThing, toView, viewOf } from '../../lib/shelves/art';
import { isLow, type ShelfEntry, type ShelfItem, type ShelfKind } from '../../lib/shelves/model';
import { colors, fonts } from '../../theme';
import { AltarImage } from '../altar/AltarImage';
import { VesselPicture } from './VesselLabel';

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

/**
 * A thing as it stands on its shelf, `width` × `height`: herbs in a labelled
 * jar, oils and waters in labelled bottles, decks in their box and books by
 * their spine; everything else as its own picture, set down on the floor.
 */
export function ShelfThingPicture({ item, width, height }: { item: Pick<ShelfItem, 'shelf' | 'name' | 'image' | 'label' | 'labelStyle' | 'labelFont'>; width: number; height: number }) {
  useImageRatio(item.image || undefined);
  useImageRatioVersion();
  const { vessel } = shelfThing(item);
  if (vessel) {
    return <VesselPicture vessel={vessel} text={labelText(item.label, item.name)} labelStyle={item.labelStyle} font={item.labelFont} width={width} height={height} fillImage={vessel === 'jar' ? item.image : undefined} />;
  }
  const picture = altarPicture(item.image);
  if (!picture) return <ShelfPicture image="" name={item.name} size={Math.min(width, height)} />;
  const ratio = item.image ? imageRatio(item.image) : null;
  const r = ratio ? containedRect(width, height, ratio, { x: 0, y: 0, w: 1, h: 1 }, true) : { x: 0, y: 0, w: width, h: height };
  return (
    <View style={{ width, height }}>
      <AltarImage picture={picture} resizeMode="contain" style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h }} />
    </View>
  );
}

// Warm lamplight from above and a soft dark round the edges, over the painting and what stands on it.
function WarmLight({ width, height, id }: { width: number; height: number; id: string }) {
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={width} height={height}>
      <Defs>
        <RadialGradient id={`warm-${id}`} cx="50%" cy="18%" rx="70%" ry="80%">
          <Stop offset="0" stopColor="#ffbe6e" stopOpacity={0.16} />
          <Stop offset="0.55" stopColor="#ff9a40" stopOpacity={0.05} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.32} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#warm-${id})`} />
    </Svg>
  );
}

// A soft contact shadow where a thing meets the plank.
function ContactShadow({ width, id }: { width: number; id: string }) {
  const h = Math.max(4, width * 0.16);
  return (
    <Svg pointerEvents="none" width={width * 1.1} height={h} style={{ position: 'absolute', left: -width * 0.05, bottom: -h * 0.45 }}>
      <Defs>
        <RadialGradient id={`shadow-${id}`} cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor="#000000" stopOpacity={0.6} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={width * 0.55} cy={h / 2} rx={width * 0.55} ry={h / 2} fill={`url(#shadow-${id})`} />
    </Svg>
  );
}

/** One shelf's things on its painted furniture: a cabinet of it for as many as fit, then another. */
function ShelfFurniture({ shelf, entries, width, onOpen }: { shelf: ShelfKind; entries: ShelfEntry[]; width: number; onOpen: (id: string) => void }) {
  const art = shelfArtFor(shelf);
  const cabinets = useMemo(() => layoutShelf(art, entries.map((e) => shelfThing(e.item))), [art, entries]);
  const view = viewOf(art, width);
  const source = altarImageSource(art.image);
  return (
    <View style={{ gap: 10 }}>
      {cabinets.map((placements, c) => (
        <View key={c} style={[styles.furniture, { width, height: view.height }]} accessibilityLabel={`${art.name}${cabinets.length > 1 ? `, ${c + 1} of ${cabinets.length}` : ''}`}>
          {source && <Image source={source} style={{ position: 'absolute', left: view.offset, top: 0, width: view.imageWidth, height: view.height }} resizeMode="stretch" />}
          {placements.map((p) => {
            const { id, item } = entries[p.index];
            const box = toView(art, p, width);
            const low = isLow(item);
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}${low ? ', running low' : ''}`}
                onPress={() => onOpen(id)}
                hitSlop={4}
                style={({ pressed }) => [{ position: 'absolute', left: box.left, top: box.top, width: box.width, height: box.height }, pressed && { opacity: 0.75 }]}
              >
                <ContactShadow width={box.width} id={`${shelf}-${id}`} />
                <ShelfThingPicture item={item} width={box.width} height={box.height} />
                {low && <Text style={styles.low}>Low</Text>}
              </Pressable>
            );
          })}
          <WarmLight width={width} height={view.height} id={`${shelf}-${c}`} />
        </View>
      ))}
    </View>
  );
}

/**
 * My Shelves on their painted furniture: the chosen shelf's things standing
 * on the measured planks (lib/shelves/art.ts), each container labelled.
 * Tapping one opens it. `groups` is one shelf, or every shelf (with plaques)
 * for "All"; only `limit` things are drawn, the rest come with "Show more".
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
  const [width, setWidth] = useState(0);
  const total = groups.reduce((n, g) => n + g.entries.length, 0);
  const more = Math.max(total - limit, 0);
  const blocks = groups.map((g, i) => {
    const before = groups.slice(0, i).reduce((n, x) => n + x.entries.length, 0);
    return { ...g, shown: g.entries.slice(0, Math.max(limit - before, 0)) };
  });
  return (
    <View style={{ gap: 8 }} onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}>
      {width > 0 &&
        blocks.map((g) =>
          g.shown.length === 0 ? null : (
            <View key={g.key} style={{ gap: 6 }}>
              {showPlaques && (
                <View style={styles.plaque}>
                  <Text style={styles.plaqueText}>{g.label}</Text>
                </View>
              )}
              <ShelfFurniture shelf={g.key} entries={g.shown} width={width} onOpen={onOpen} />
            </View>
          ),
        )}
      {more > 0 && <Button label={`Show more (${more})`} variant="outline" onPress={onMore} />}
    </View>
  );
}

const styles = StyleSheet.create({
  furniture: { overflow: 'hidden', borderRadius: 14, backgroundColor: '#140c06' },
  plaque: {
    alignSelf: 'center',
    backgroundColor: '#3a2611',
    borderColor: colors.goldDeep,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  plaqueText: { fontFamily: fonts.display, fontSize: 15, color: colors.gold },
  low: { position: 'absolute', top: -4, right: -6, fontFamily: fonts.bodySemi, fontSize: 10, color: colors.forestInk, backgroundColor: colors.gold, borderRadius: 6, paddingHorizontal: 4, overflow: 'hidden' },
  letter: { backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  letterText: { fontFamily: fonts.display, fontSize: 24, color: colors.gold },
});
