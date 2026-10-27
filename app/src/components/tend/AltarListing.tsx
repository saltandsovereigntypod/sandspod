// "Find mine" and "What's here" under an altar: on a coven altar with twenty
// people's candles and papers, light up your own, or see everything on it as
// a list with whose it is, as far as you may know (lib/tend/altar.ts). A
// private or unnamed paper never shows a name. Tapping a row picks it on the
// altar to tend. On your own altar it's simply the list.

import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip, Chips } from '../rituals/ui';
import type { AltarDocument } from '../../lib/altar/snapshot';
import { altarListing, mineKeys, mineLine, type WhoseContext } from '../../lib/tend/altar';
import { colors, fonts, type } from '../../theme';

const KIND: Record<string, string> = { candle: 'Candle', paper: 'Paper', offering: 'Offering', plant: 'Plant', other: '' };

export function AltarListing({
  doc,
  personal,
  whose,
  highlighting,
  onHighlight,
  onSelect,
}: {
  doc: AltarDocument;
  /** Your own altar: everything on it is yours. */
  personal: boolean;
  /** On a coven altar, what tells yours from others' (null while it loads: nothing is called yours yet). */
  whose: WhoseContext | null;
  highlighting: boolean;
  onHighlight: (keys: string[] | null) => void;
  onSelect: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const rows = useMemo(
    () => altarListing(doc, personal ? { userId: null, myName: '', myContributions: [], petitions: {}, nameOf: () => '', personal: true } : whose ?? { userId: null, myName: '', myContributions: [], petitions: {}, nameOf: () => '' }),
    [doc, whose, personal],
  );
  if (!rows.length) return null;
  return (
    <View style={styles.wrap}>
      <Chips>
        {!personal && !!whose && <Chip label={highlighting ? 'Stop finding mine' : 'Find mine'} selected={highlighting} onPress={() => onHighlight(highlighting ? null : mineKeys(rows))} hint="Lights up your own candles, papers and offerings on the altar" />}
        <Chip label={open ? 'Hide the list' : `What’s here (${rows.length})`} selected={open} onPress={() => setOpen(!open)} />
      </Chips>
      {highlighting && !personal && <Text style={type.caption}>{mineLine(rows)}</Text>}
      {open &&
        rows.map((row) => (
          <Pressable
            key={`${row.key}-${row.index}`}
            onPress={() => onSelect(row.index)}
            accessibilityRole="button"
            accessibilityLabel={`${row.label}${row.whose && !personal ? `, ${row.whose}` : ''}${row.lit ? ', burning' : ''}. Pick it on the altar`}
            style={({ pressed }) => [styles.row, row.mine && !personal && styles.mine, pressed && styles.pressed]}
          >
            <Text style={styles.label} numberOfLines={2}>
              {row.label}
            </Text>
            <Text style={type.caption}>{[KIND[row.kind], row.lit ? 'burning' : '', personal ? '' : row.whose].filter(Boolean).join(' · ')}</Text>
          </Pressable>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.hairline, gap: 2, minHeight: 44 },
  mine: { borderColor: colors.gold },
  pressed: { opacity: 0.7 },
  label: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
});
