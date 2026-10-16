// Shared parts for the altar's working sheets: the altar they open on, a text
// field in the altar sheets' style, and a picker for ingredients from the
// Living Library, your own cabinet and apothecary, salts, or typed in.

import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { builtInCabinet, placeableForms } from '../../../lib/altar/cabinet';
import { handleSafe } from '../../../lib/altar/reading/correspondence';
import type { SavedObject } from '../../../lib/altar/types';
import { useWorkshop } from '../../../lib/altar/workshop';
import { JAR_SALTS, type LayerSource } from '../../../lib/altar/workings/spellJar';
import { searchLibrary } from '../../../lib/library/model';
import { useLibrary } from '../../../lib/library';
import { colors, fonts, radius, touch, type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';

/** The altar a sheet opens on. */
export type AltarContext = {
  /** The saved altar's id (the craft store's altarId). */
  id: string;
  name?: string;
  objects: SavedObject[];
  /** altar_data.background, for layouts. */
  background?: string;
};

export const nowIso = () => new Date().toISOString();

export function Field({ label, style, ...rest }: TextInputProps & { label: string }) {
  return (
    <TextInput
      placeholderTextColor={colors.tabInactive}
      accessibilityLabel={label}
      {...rest}
      style={[styles.input, rest.multiline && styles.multiline, style]}
    />
  );
}

export function Label({ children }: { children: string }) {
  return <Text style={type.eyebrow}>{children}</Text>;
}

export type Picked = {
  label: string;
  source: LayerSource;
  /** Library type: herb, crystal, or '' for other things. */
  type?: string;
  herb?: string;
  crystal?: string;
  apothecaryItemId?: string;
  note?: string;
};

type PickerProps = {
  onPick: (picked: Picked) => void;
  /** Which kinds to offer. */
  kinds?: ('herb' | 'crystal' | 'salt' | 'apothecary' | 'cabinet')[];
  /** Shown before anything is typed: things that suit this ("love"). */
  suggestFor?: string;
  placeholder?: string;
  /** Already chosen (by label), so they're marked. */
  chosen?: string[];
};

const keyOf = (id: string) => id.split(':')[2] ?? '';

/** Search the Library, your cabinet, your apothecary and salts; or add what you typed. */
export function IngredientPicker({ onPick, kinds = ['herb', 'crystal', 'salt', 'apothecary', 'cabinet'], suggestFor = '', placeholder = 'Search herbs, stones, salts…', chosen = [] }: PickerProps) {
  const [query, setQuery] = useState('');
  const { entries } = useLibrary();
  const workshop = useWorkshop();
  const chosenSet = new Set(chosen.map((c) => c.toLowerCase()));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out: Picked[] = [];
    const libraryTypes = (['herb', 'crystal'] as const).filter((k) => kinds.includes(k));
    for (const t of libraryTypes) {
      const found = q ? searchLibrary(entries, q, { type: t, limit: 6 }) : suggestFor ? searchLibrary(entries, suggestFor, { type: t, limit: 4 }) : [];
      for (const e of found) {
        if (!handleSafe(e)) continue;
        const key = keyOf(e.id);
        out.push({ label: e.name, source: 'library', type: t, ...(t === 'herb' ? { herb: key || undefined } : { crystal: key || undefined }) });
      }
    }
    if (kinds.includes('cabinet')) {
      for (const item of workshop.customItems) {
        if (!['herbs', 'crystals'].includes(String(item.category))) continue;
        if (q && !item.name.toLowerCase().includes(q)) continue;
        if (!q) continue;
        const form = placeableForms(item)[0];
        out.push({ label: item.name, source: 'cabinet', type: item.category === 'herbs' ? 'herb' : 'crystal', herb: form?.herb, crystal: form?.crystal, note: 'yours' });
      }
    }
    if (kinds.includes('apothecary')) {
      for (const item of workshop.apothecary) {
        if (!q || !item.name.toLowerCase().includes(q)) continue;
        out.push({ label: item.name, source: 'apothecary', apothecaryItemId: item.id, note: item.typeLabel });
      }
    }
    if (kinds.includes('salt')) {
      for (const salt of JAR_SALTS) if (!q ? !suggestFor : salt.label.toLowerCase().includes(q)) out.push({ label: salt.label, source: 'salt', note: salt.note });
      if (!q && suggestFor) for (const salt of JAR_SALTS.slice(0, 3)) out.push({ label: salt.label, source: 'salt', note: salt.note });
    }
    if (!q && !suggestFor && out.length < 6) {
      for (const id of ['herbs:rosemary', 'herbs:lavender', 'herbs:bay', 'crystals:clear-quartz']) {
        const item = builtInCabinet.find((i) => i.id === id);
        const form = item ? placeableForms(item)[0] : null;
        if (item && form && kinds.includes(form.crystal ? 'crystal' : 'herb')) {
          out.push({ label: item.name, source: 'library', type: form.crystal ? 'crystal' : 'herb', herb: form.herb, crystal: form.crystal });
        }
      }
    }
    const seen = new Set<string>();
    return out.filter((p) => (seen.has(p.label.toLowerCase()) ? false : (seen.add(p.label.toLowerCase()), true))).slice(0, 14);
  }, [query, entries, workshop.customItems, workshop.apothecary, kinds, suggestFor]);

  const typed = query.replace(/\s+/g, ' ').trim();
  const pick = (p: Picked) => {
    onPick(p);
    setQuery('');
  };

  return (
    <View style={styles.picker}>
      <Field label="Search ingredients" value={query} onChangeText={setQuery} placeholder={placeholder} autoCorrect={false} returnKeyType="done" onSubmitEditing={() => typed && pick({ label: typed, source: 'typed' })} />
      <ChipRow>
        {results.map((p) => (
          <Chip
            key={`${p.source}:${p.label}`}
            label={p.label}
            symbol={chosenSet.has(p.label.toLowerCase()) ? '✓' : p.source === 'salt' ? '◇' : p.source === 'apothecary' ? '⚗' : p.type === 'crystal' ? '◆' : '❦'}
            accessibilityLabel={`Add ${p.label}${p.note ? `, ${p.note}` : ''}`}
            onPress={() => pick(p)}
          />
        ))}
        {typed && !results.some((p) => p.label.toLowerCase() === typed.toLowerCase()) ? (
          <Chip label={`Add “${typed}”`} symbol="+" accessibilityLabel={`Add ${typed} as typed`} onPress={() => pick({ label: typed, source: 'typed' })} />
        ) : null}
      </ChipRow>
    </View>
  );
}

export const sheetStyles = StyleSheet.create({
  section: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  card: { borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surfaceRaised, padding: 14, gap: 8 },
  value: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchment },
  problem: { fontFamily: fonts.body, fontSize: 14, color: '#e8a58f' },
  center: { alignItems: 'center' },
});

const styles = StyleSheet.create({
  picker: { gap: 10 },
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
  multiline: { minHeight: 88, paddingTop: 12, textAlignVertical: 'top' },
});
