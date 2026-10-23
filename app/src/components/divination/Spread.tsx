// A draw laid out on the table: one card, three in a row, the Celtic Cross
// (the cross with the crossing card laid sideways over the heart of it, and
// the staff of four beside it), or runes and staves in a row.

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { meaningOf, type Draw, type Spread } from '../../lib/divination/draw';
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
  const place = spread.positions.length > 1 ? `${index + 1}, ${spread.positions[index]?.name}: ` : '';
  const item = draw.items[index];
  if (!revealed) return `${place}face down`;
  return `${place}${item.name}${item.reversed ? ', reversed' : ''}`;
}

export function SpreadTable({ spread, draw, revealed, selected, onPress, still, width }: Props) {
  const one = (index: number, w: number, h: number, turned = false) => {
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
        turned={turned}
        radius={spread.kind === 'runes' ? w * 0.42 : spread.kind === 'ogham' ? w * 0.3 : 8}
      />
    );
  };

  const caption = (index: number) =>
    spread.positions.length > 1 ? (
      <Text style={[type.caption, styles.caption]} numberOfLines={2}>
        {spread.positions[index]?.name}
      </Text>
    ) : null;

  if (spread.id === 'celtic-cross') return <CelticCross width={width} one={one} />;

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
          {caption(i)}
        </View>
      ))}
    </View>
  );
}

/** Waite's layout: 3 above, 5 behind, 1 with 2 across it, 6 before, 4 beneath; the staff 7 to 10 from the bottom up. */
function CelticCross({ width, one }: { width: number; one: (index: number, w: number, h: number, turned?: boolean) => ReactNode }) {
  const w = Math.floor(Math.min(width / 5.6, 110));
  const h = Math.round(w / CARD_RATIO);
  const g = Math.round(w * 0.42); // room for the crossing card's ends
  const gv = Math.round(w * 0.14);
  const staffGap = Math.round(w * 0.1);
  const crossH = h * 3 + gv * 2;
  const staffH = h * 4 + staffGap * 3;
  const height = Math.max(crossH, staffH);
  const top = (height - crossH) / 2;
  const col = (c: number) => c * (w + g);
  const staffX = col(3) + Math.round(w * 0.25);
  const total = staffX + w;
  const at = (x: number, y: number) => ({ position: 'absolute' as const, left: x, top: y });
  const staffY = (k: number) => height - h - k * (h + staffGap); // k = 0 for 7, at the bottom
  return (
    <View style={{ width: total, height, alignSelf: 'center' }}>
      <View style={at(col(1), top)}>{one(2, w, h)}</View>
      <View style={at(col(0), top + h + gv)}>{one(4, w, h)}</View>
      <View style={at(col(1), top + h + gv)}>{one(0, w, h)}</View>
      <View style={at(col(2), top + h + gv)}>{one(5, w, h)}</View>
      <View style={at(col(1), top + (h + gv) * 2)}>{one(3, w, h)}</View>
      <View style={at(col(1), top + h + gv)}>{one(1, w, h, true)}</View>
      {[6, 7, 8, 9].map((index, k) => (
        <View key={index} style={at(staffX, staffY(k))}>
          {one(index, w, h)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },
  place: { alignItems: 'center', gap: 6 },
  caption: { textAlign: 'center', color: colors.muted },
});
