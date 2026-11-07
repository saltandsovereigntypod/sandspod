// One row in place of a long run of chips: it shows the current choice and
// opens a sheet listing every option, ticked where chosen, with a search
// field when the list is long. Single choice closes on tap; several stay
// open until Done. Used by Chips (rituals/ui and more/ui) when a group has
// more than eight options, the same on phones and on the web app.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAccessibleText } from '../../lib/accessibility/store';
import { filterOptions, shouldSearch, summaryLabel } from '../../lib/optionPicker';
import { colors, fonts, radius, space, touch } from '../../theme';
import { Sheet } from '../altar/Sheet';
import { Icon } from '../Icon';

export type PickerItem = { key: string; label: string; selected: boolean; onPress: () => void; a11yLabel?: string };

type Props = {
  items: PickerItem[];
  /** Several may be chosen: the sheet stays open and has checkboxes. */
  multiple?: boolean;
  /** What is being chosen, for the sheet's title and screen readers. */
  label?: string;
  /** Shown on the row when nothing is chosen. */
  placeholder?: string;
};

export function OptionPicker({ items, multiple = false, label, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const t = useAccessibleText();
  const title = label ?? (multiple ? 'Choose any' : 'Choose one');
  const summary = summaryLabel(items, placeholder ?? (multiple ? 'None chosen' : 'Choose'));
  const shown = filterOptions(items, query);
  const close = () => {
    setOpen(false);
    setQuery('');
  };
  const search = shouldSearch(items.length) ? (
    <View style={styles.header}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search"
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel={`Search ${title}`}
        autoCorrect={false}
        style={t(styles.search)}
      />
    </View>
  ) : undefined;
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${summary}`}
        accessibilityHint={`Opens a list of ${items.length} options`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Text style={t(styles.rowText)} numberOfLines={2}>
          {summary}
        </Text>
        <Icon name="chevron" size={16} color={colors.tabInactive} />
      </Pressable>
      <Sheet visible={open} title={title} onClose={close} header={search} size="half">
        <View accessibilityRole={multiple ? undefined : 'radiogroup'} accessibilityLabel={title}>
          {shown.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole={multiple ? 'checkbox' : 'radio'}
              accessibilityState={{ checked: item.selected }}
              accessibilityLabel={item.a11yLabel ?? item.label}
              onPress={() => {
                item.onPress();
                if (!multiple) close();
              }}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}
            >
              <Text style={[t(styles.optionText), item.selected && styles.optionOn]}>{item.label}</Text>
              <Text style={styles.tick} importantForAccessibility="no" accessibilityElementsHidden>
                {item.selected ? '✓' : ''}
              </Text>
            </Pressable>
          ))}
          {!shown.length && <Text style={t(styles.empty)}>Nothing matches that.</Text>}
        </View>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: touch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.surfaceRaised,
  },
  rowText: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
  pressed: { opacity: 0.7 },
  header: { paddingHorizontal: space.gutter, paddingBottom: 12 },
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
  option: {
    minHeight: touch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  optionText: { flex: 1, fontFamily: fonts.body, fontSize: 16, color: colors.parchment },
  optionOn: { color: colors.gold, fontFamily: fonts.bodySemi },
  tick: { width: 20, fontSize: 18, color: colors.gold, textAlign: 'center' },
  empty: { fontFamily: fonts.body, fontSize: 15, color: colors.muted, paddingVertical: 12 },
});
