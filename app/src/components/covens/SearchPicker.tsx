import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { altarPicture } from '../../lib/altar/assets';
import { searchEntries, type PickEntry } from '../../lib/covens/picker';
import { colors, fonts, radius, touch, type } from '../../theme';
import { AltarImage } from '../altar/AltarImage';

export type PickerChip = { key: string; label: string; image?: string; note?: string };

// The one search picker (lib/covens/picker.ts), as the website's twin
// (covens/coven/picker.js): type to find, tap to add, and each pick shows as
// a chip with a picture (for items) that you can take away. Search only: while
// the search is in use with nothing typed it shows a few suggestions, never
// the whole list.
export function SearchPicker({
  label,
  hint,
  chips,
  entries,
  onAdd,
  onRemove,
  search,
  suggestions,
  placeholder = 'Type to search',
  limit = 8,
  max,
  empty,
}: {
  label: string;
  hint?: string;
  chips: PickerChip[];
  entries: PickEntry[];
  onAdd: (entry: PickEntry) => void;
  onRemove: (key: string) => void;
  /** A search of its own (the ITEMS flavour narrows by category); otherwise picker.ts searchEntries. */
  search?: (query: string, picked: string[]) => PickEntry[];
  suggestions?: string[];
  placeholder?: string;
  limit?: number;
  /** At most this many picks (one, for a deity). */
  max?: number;
  /** What the chips say when nothing is picked. */
  empty?: string;
}) {
  const [query, setQuery] = useState('');
  // Suggestions only while the search is in use; otherwise just the chips.
  const [focused, setFocused] = useState(false);
  // Picking one keeps the suggestions open for the next (a tap on the web blurs
  // the field first), so choosing several doesn't fold the list away under you.
  const pickedAt = useRef(0);
  const input = useRef<TextInput>(null);
  const picked = useMemo(() => chips.map((c) => c.key), [chips]);
  const found = useMemo(
    () => (!query.trim() && !focused ? [] : (search ? search(query, picked) : searchEntries(entries, query, { limit, picked, suggestions })).slice(0, limit)),
    [search, entries, query, picked, suggestions, limit, focused],
  );
  const full = max != null && chips.length >= max;

  return (
    <View style={styles.wrap}>
      <Text style={type.eyebrow}>{label}</Text>
      {!!hint && <Text style={type.caption}>{hint}</Text>}
      <View style={styles.chips} accessibilityLabel={`${label}: ${chips.length ? chips.map((c) => c.label).join(', ') : empty ?? 'none chosen'}`}>
        {chips.length === 0 && !!empty && <Text style={type.caption}>{empty}</Text>}
        {chips.map((chip) => {
          const picture = altarPicture(chip.image);
          return (
            <View key={chip.key} style={styles.chip}>
              {picture && <AltarImage picture={picture} style={styles.chipImage} resizeMode="contain" />}
              <Text style={styles.chipText} numberOfLines={2}>
                {chip.label}
                {chip.note ? <Text style={styles.chipNote}> · {chip.note}</Text> : null}
              </Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${chip.label}`} hitSlop={10} onPress={() => onRemove(chip.key)} style={styles.remove}>
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      {!full && (
        <TextInput
          ref={input}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          // Later than a tap on a suggestion, which blurs the field first.
          onBlur={() =>
            setTimeout(() => {
              if (Date.now() - pickedAt.current > 400) setFocused(false);
            }, 250)
          }
          placeholder={placeholder}
          placeholderTextColor="rgba(202,191,157,0.6)"
          accessibilityLabel={`Search for ${label.toLowerCase()}`}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          style={styles.input}
        />
      )}
      {!full && found.length > 0 && (
        <View style={styles.results}>
          {!query.trim() && <Text style={type.caption}>Suggestions</Text>}
          {found.map((entry) => {
            const picture = altarPicture(entry.image);
            return (
              <Pressable
                key={entry.key}
                accessibilityRole="button"
                accessibilityLabel={`Add ${entry.label}${entry.detail ? `, ${entry.detail}` : ''}`}
                onPress={() => {
                  pickedAt.current = Date.now();
                  onAdd(entry);
                  setQuery('');
                  // Back in the field (the web blurred it), so it folds away as usual once you're done.
                  if (!full && (max == null || chips.length + 1 < max)) input.current?.focus();
                }}
                style={({ pressed }) => [styles.result, pressed && styles.pressed]}
              >
                {picture ? <AltarImage picture={picture} style={styles.resultImage} resizeMode="contain" /> : <View style={styles.resultDot} />}
                <View style={styles.grow}>
                  <Text style={styles.resultText}>{entry.label}</Text>
                  {!!entry.detail && <Text style={type.caption}>{entry.detail}</Text>}
                </View>
                <Text style={styles.add}>Add</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {!full && !!query.trim() && found.length === 0 && <Text style={type.caption}>Nothing matches that. Try another word.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    minHeight: 36,
    paddingLeft: 10,
    paddingRight: 4,
    borderRadius: radius.chip,
    backgroundColor: colors.surfaceRaised,
  },
  chipImage: { width: 24, height: 24 },
  chipText: { fontFamily: fonts.body, fontSize: 14, color: colors.cream, flexShrink: 1 },
  chipNote: { color: colors.parchment },
  remove: { minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontSize: 18, color: colors.parchment },
  input: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(244,236,216,0.22)',
    backgroundColor: colors.night,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  results: { gap: 4 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: touch, paddingHorizontal: 8, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  resultImage: { width: 36, height: 36 },
  resultDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceRaised },
  resultText: { fontFamily: fonts.body, fontSize: 15, color: colors.cream },
  add: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
  grow: { flex: 1 },
  pressed: { opacity: 0.7 },
});
