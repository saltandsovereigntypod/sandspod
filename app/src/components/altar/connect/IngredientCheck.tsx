// "You have 6 of the 8": what a working calls for against what you already
// have, on the altar, in your apothecary and cabinet, among your stones and in
// your garden. For the premade detail screen and the altar.

import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { checkIngredients, foundWords, type Need, type NeedResult } from '../../../lib/altar/connect/ingredients';
import type { SavedObject } from '../../../lib/altar/types';
import { useWorkshop } from '../../../lib/altar/workshop';
import { STONES } from '../../../lib/craft/crystal/collections';
import type { Stone } from '../../../lib/craft/crystal/stones';
import { PLANTS, type Plant } from '../../../lib/craft/green/garden';
import { useCraft } from '../../../lib/craft/store';
import { useAccessibleText } from '../../../lib/accessibility/store';
import { colors, fonts, radius, touch, type } from '../../../theme';

type Props = {
  /** premadeNeeds(p) or templateNeeds(template) from lib/altar/connect/ingredients. */
  needs: Need[];
  /** The altar's objects, when shown on (or for) an altar. */
  objects?: SavedObject[];
  /** "on Hearth" in the summary when given. */
  altarName?: string;
  /** Start with the lists open. */
  open?: boolean;
};

export function IngredientCheck({ needs, objects = [], altarName, open = false }: Props) {
  const workshop = useWorkshop();
  const { entries: stones } = useCraft<Stone>(STONES);
  const { entries: plants } = useCraft<Plant>(PLANTS);
  const [expanded, setExpanded] = useState(open);
  const t = useAccessibleText();
  const check = useMemo(
    () =>
      checkIngredients(needs, {
        objects,
        apothecary: workshop.apothecary,
        customItems: workshop.customItems,
        stones: stones.map((s) => s.data),
        plants: plants.map((p) => p.data),
      }),
    [needs, objects, workshop.apothecary, workshop.customItems, stones, plants],
  );
  if (!needs.length) return null;
  const ratio = check.total ? check.haveCount / check.total : 1;

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${check.line}${altarName ? ` Checked against ${altarName} and your things.` : ''} ${expanded ? 'Hide' : 'Show'} the list`}
        style={styles.head}
      >
        <View style={styles.meter} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={[styles.meterFill, { width: `${Math.round(ratio * 100)}%` }]} />
        </View>
        <View style={styles.headText}>
          <Text style={t(styles.line)}>{check.line}</Text>
          <Text style={type.caption}>{altarName ? `On ${altarName}, and among your things` : 'Among your things'}</Text>
        </View>
        <Text style={styles.toggle}>{expanded ? '▴' : '▾'}</Text>
      </Pressable>
      {expanded && (
        <View style={styles.lists}>
          {check.have.length > 0 && <List title="You have" items={check.have} />}
          {check.missing.length > 0 && <List title="To gather" items={check.missing} />}
          {check.optionalHave.length + check.optionalMissing.length > 0 && <List title="If you like" items={[...check.optionalHave, ...check.optionalMissing]} />}
        </View>
      )}
    </View>
  );
}

function List({ title, items }: { title: string; items: NeedResult[] }) {
  return (
    <View style={styles.list}>
      <Text style={type.eyebrow}>{title}</Text>
      {items.map((item, i) => (
        <View key={`${item.name}-${i}`} style={styles.item} accessible accessibilityLabel={`${item.name}${item.have ? `, ${foundWords(item)}` : ', not found'}`}>
          <Text style={[styles.mark, item.have && styles.markHave]}>{item.have ? '✓' : '○'}</Text>
          <View style={styles.itemText}>
            <Text style={styles.name}>{item.name}</Text>
            {item.have && <Text style={type.caption}>{foundWords(item)}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surfaceRaised, padding: 12, gap: 10 },
  head: { minHeight: touch, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headText: { flex: 1, gap: 2 },
  line: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
  toggle: { color: colors.gold, fontSize: 18, minWidth: 24, textAlign: 'center' },
  meter: { width: 44, height: 6, borderRadius: 3, backgroundColor: colors.hairline, overflow: 'hidden' },
  meterFill: { height: 6, backgroundColor: colors.gold },
  lists: { gap: 12 },
  list: { gap: 6 },
  item: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  itemText: { flex: 1, gap: 1 },
  mark: { color: colors.muted, fontSize: 15, width: 18, textAlign: 'center', marginTop: 2 },
  markHave: { color: colors.fern },
  name: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.parchment },
});
