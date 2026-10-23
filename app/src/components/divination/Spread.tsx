// A draw laid out on the table, in its spread's shape (lib/divination/layout,
// shared with the website): a short row with each place's name beneath, or
// the whole spread placed as the layout says, the Celtic Cross's crossing
// card laid sideways, the horseshoe's arc, the wheel's twelve houses, a cast
// of runes on its cloth. Too wide for the screen, it scrolls sideways, and
// there's a closer look for the big ones.

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect, Text as SvgText } from 'react-native-svg';

import { layoutOfDraw, meaningOf, placeOf, type Draw, type Spread } from '../../lib/divination/draw';
import { diagramOf, isSimpleRow, layoutOf, type Diagram } from '../../lib/divination/layout';
import { colors, type } from '../../theme';
import { CARD_RATIO, CardBack, Flip, OghamStave, RuneStone, TarotFace } from './Faces';

type Props = {
  spread: Spread;
  draw: Draw;
  revealed: boolean[];
  selected: number | null;
  onPress: (index: number) => void;
  still: boolean;
  /** The width there is to lay it out in. */
  width: number;
};

/** What a screen reader hears for one place in the spread. */
export function placeLabel(spread: Spread, draw: Draw, index: number, revealed: boolean): string {
  const place = spread.positions.length > 1 ? `${index + 1}, ${placeOf(spread, draw, index)?.name}: ` : '';
  const item = draw.items[index];
  if (!revealed) return `${place}face down`;
  return `${place}${item.name}${item.reversed ? ', reversed' : ''}`;
}

/** An item's width in points: the most it grows to, and the least before the table scrolls. */
const SIZE = { tarot: { max: 110, min: 44 }, runes: { max: 96, min: 36 }, ogham: { max: 52, min: 18 } };

export function SpreadTable({ spread, draw, revealed, selected, onPress, still, width }: Props) {
  const [close, setClose] = useState(false);

  const one = (index: number, w: number, h: number) => {
    const item = draw.items[index];
    const shown = revealed[index];
    const label = placeLabel(spread, draw, index, shown);
    const hint = shown ? 'Shows its meaning' : 'Turns it over';
    let back;
    let front;
    if (spread.kind === 'tarot') {
      back = <CardBack />;
      front = <TarotFace name={item.name} reversed={item.reversed} />;
    } else if (spread.kind === 'runes') {
      back = <RuneStone glyph="" size={w} />;
      front = <RuneStone glyph={meaningOf(item)?.glyph ?? ''} size={w} />;
    } else {
      back = <OghamStave glyph="" width={w} height={h} />;
      front = <OghamStave glyph={meaningOf(item)?.glyph ?? ''} width={w} height={h} />;
    }
    return (
      <Flip
        key={index}
        revealed={shown}
        still={still}
        width={w}
        height={h}
        back={back}
        front={front}
        onPress={() => onPress(index)}
        label={label}
        hint={hint}
        selected={selected === index}
        radius={spread.kind === 'runes' ? w * 0.42 : spread.kind === 'ogham' ? w * 0.3 : 8}
      />
    );
  };

  const l = layoutOfDraw(spread, draw);

  if (isSimpleRow(l)) {
    const n = draw.items.length;
    const gap = 12;
    let w: number;
    let h: number;
    if (spread.kind === 'tarot') {
      w = n === 1 ? Math.min(width * 0.56, 220) : Math.min((width - gap * (n - 1)) / n, 150);
      h = w / CARD_RATIO;
    } else if (spread.kind === 'runes') {
      w = n === 1 ? Math.min(width * 0.34, 120) : Math.min((width - gap * (n - 1)) / n, 96);
      h = w * 1.18;
    } else {
      w = n === 1 ? 64 : 52;
      h = n === 1 ? 220 : 190;
    }
    return (
      <View style={[styles.row, { gap }]}>
        {draw.items.map((_, i) => (
          <View key={i} style={[styles.place, { width: Math.max(w, spread.kind === 'ogham' ? 96 : w) }]}>
            {one(i, w, h)}
            {n > 1 && (
              <Text style={[type.caption, styles.caption]} numberOfLines={2}>
                {spread.positions[i]?.name}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  }

  // Placed as the layout says, in points.
  const size = SIZE[spread.kind];
  const fit = width / l.width;
  const scale = close ? size.max : Math.max(size.min, Math.min(size.max, fit));
  const w = scale * l.item.w;
  const h = scale * l.item.h;
  const total = { width: l.width * scale, height: l.height * scale };
  const canCloser = fit < size.max * 0.8;

  const table = (
    <View style={[total, styles.table]}>
      {l.cloth &&
        [...l.cloth.rings].reverse().map((r, k) => (
          <View
            key={`ring-${k}`}
            style={[
              styles.ring,
              { left: (l.cloth!.cx - r) * scale, top: (l.cloth!.cy - r) * scale, width: r * 2 * scale, height: r * 2 * scale, borderRadius: r * scale },
              k === 0 && styles.cloth,
            ]}
          />
        ))}
      {l.slots.map((s, i) => {
        const faceDown = !!spread.cast && draw.items[i]?.fall?.up === false;
        return (
          <View
            key={i}
            style={[styles.at, { left: s.left * scale, top: s.top * scale, width: w, height: h, zIndex: l.crossings.some(([, b]) => b === i) ? 2 : 1 }, !!s.rot && { transform: [{ rotate: `${s.rot}deg` }] }, faceDown && revealed[i] && styles.faceDown]}
          >
            {one(i, w, h)}
            <View style={[styles.badge, styles.noTouch]}>
              <Text style={styles.badgeText}>{i + 1}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.gap}>
      {total.width > width + 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.scroll}>
          {table}
        </ScrollView>
      ) : (
        <View style={styles.center}>{table}</View>
      )}
      <Text style={[type.caption, styles.legend]}>{draw.items.map((_, i) => `${i + 1} ${placeOf(spread, draw, i)?.name ?? ''}`).join('  ·  ')}</Text>
      {canCloser && (
        <Pressable accessibilityRole="button" onPress={() => setClose((c) => !c)} style={({ pressed }) => [styles.zoom, pressed && { opacity: 0.7 }]}>
          <Text style={[type.caption, styles.gold]}>{close ? 'See it all at once' : 'Look closer (scrolls sideways)'}</Text>
        </Pressable>
      )}
    </View>
  );
}

/** A little picture of a spread's shape, its places numbered when there's room. */
export function SpreadDiagram({ spread, size = 56, numbers = false, color = colors.gold }: { spread: Spread; size?: number; numbers?: boolean; color?: string }) {
  return <DiagramPicture dg={diagramOf(layoutOf(spread))} size={size} numbers={numbers} color={color} />;
}

export function DiagramPicture({ dg, size, numbers, color }: { dg: Diagram; size: number; numbers: boolean; color: string }) {
  const w = dg.aspect >= 1 ? size : Math.round(size * dg.aspect);
  const h = dg.aspect >= 1 ? Math.round(size / dg.aspect) : size;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {dg.rings?.r.map((r, k) => <Circle key={`r${k}`} cx={dg.rings!.cx * w} cy={dg.rings!.cy * h} r={r * w} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={0.8} />)}
      {dg.rects.map((r, i) => {
        const cx = r.cx * w;
        const cy = r.cy * h;
        const rw = r.w * w;
        const rh = r.h * h;
        return (
          <Rect
            key={i}
            x={cx - rw / 2}
            y={cy - rh / 2}
            width={rw}
            height={rh}
            rx={Math.min(rw, rh) * 0.2}
            fill={color}
            fillOpacity={0.22}
            stroke={color}
            strokeWidth={0.8}
            transform={r.rot ? `rotate(${r.rot} ${cx} ${cy})` : undefined}
          />
        );
      })}
      {numbers &&
        dg.rects.map((r, i) => (
          <SvgText key={`n${i}`} x={r.cx * w} y={r.cy * h + 3.5} fontSize={Math.max(8, Math.min(11, r.w * w * 0.6))} textAnchor="middle" fill={colors.parchment}>
            {String(i + 1)}
          </SvgText>
        ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },
  place: { alignItems: 'center', gap: 6 },
  caption: { textAlign: 'center', color: colors.muted },
  gap: { gap: 10 },
  center: { alignItems: 'center' },
  scroll: { paddingHorizontal: 4 },
  table: { position: 'relative' },
  at: { position: 'absolute' },
  faceDown: { opacity: 0.55 },
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(226,195,109,0.28)' },
  cloth: { backgroundColor: 'rgba(18,48,32,0.55)' },
  badge: {
    position: 'absolute',
    top: -6,
    left: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 3,
    backgroundColor: '#123020',
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.gold, fontSize: 10, fontWeight: '700' },
  noTouch: { pointerEvents: 'none' },
  legend: { color: colors.muted, textAlign: 'center' },
  zoom: { alignSelf: 'center', paddingVertical: 6 },
  gold: { color: colors.gold },
});
