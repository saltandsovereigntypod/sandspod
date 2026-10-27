import { Pressable, StyleSheet, Text, View } from 'react-native';

import { searchItems, type ItemEntry } from '../../../lib/altar/itemIndex';
import { cleanValues, COLOUR_OPTIONS, defaultPartWords, optionLabel, partsOf, type FieldItem, type FieldSpec, type FieldValue, type FieldValues, type PartValue } from '../../../lib/covens/fields';
import { SWATCH } from '../../../lib/covens/model';
import { searchEntries, type PickEntry } from '../../../lib/covens/picker';
import type { NamedThing } from '../../../lib/covens/builder';
import { colors, fonts, radius, touch, type } from '../../../theme';
import { Chips, Field } from '../../more/ui';
import { SearchPicker } from '../SearchPicker';

export type FieldContext = {
  /** WHO picker entries: the gathering's roles, the whole coven, positions and people. */
  who: PickEntry[];
  whoSuggest: string[];
  whoLabel: (key: string) => string;
  items: ItemEntry[];
  /** Things named by earlier steps, for "which candle". */
  named: NamedThing[];
  actionId: string;
};

/** Toggle chips for "any of" choices. */
export function MultiChips({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <View accessibilityLabel={label} style={styles.wrap}>
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <Pressable
            key={o.value}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            accessibilityLabel={o.label}
            onPress={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            style={({ pressed }) => [styles.chip, on && styles.chipOn, pressed && styles.pressed]}
          >
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ColourPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.wrap}>
      {COLOUR_OPTIONS.map((o) => (
        <Pressable
          key={o.value}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === o.value }}
          accessibilityLabel={o.label}
          onPress={() => onChange(value === o.value ? '' : o.value)}
          style={({ pressed }) => [styles.swatchWrap, value === o.value && styles.swatchOn, pressed && styles.pressed]}
        >
          <View style={[styles.swatch, { backgroundColor: SWATCH[o.value] ?? '#888' }]} />
        </Pressable>
      ))}
    </View>
  );
}

// The one renderer for a step's fields (lib/covens/fields.ts), for the
// actions' own fields and the coven's own actions alike: text, longer text,
// numbers, choices, colours, a deity, altar things, people and roles, short
// lists, parts (a direction, who calls it, the words) and a thing named in an
// earlier step. The website draws the same (covens/coven/builder.js).
export function FieldRenderer({ specs, values, onChange, ctx, only }: { specs: FieldSpec[]; values: FieldValues; onChange: (next: FieldValues) => void; ctx: FieldContext; only?: 'essential' | 'more' }) {
  const shown = specs.filter((s) => (only === 'essential' ? s.essential : only === 'more' ? !s.essential : true));
  const set = (key: string, value: FieldValue) => onChange(cleanValues(specs, { ...values, [key]: value }));
  return (
    <View style={styles.block}>
      {shown.map((spec) => {
        const v = values[spec.key];
        switch (spec.type) {
          case 'text':
            return <Field key={spec.key} label={spec.label} hint={spec.hint} value={typeof v === 'string' ? v : ''} onChangeText={(t) => set(spec.key, t)} placeholder={spec.placeholder} maxLength={200} />;
          case 'long':
            return <Field key={spec.key} label={spec.label} hint={spec.hint} value={typeof v === 'string' ? v : ''} onChangeText={(t) => set(spec.key, t)} placeholder={spec.placeholder} multiline maxLength={4000} />;
          case 'number':
            return (
              <Field key={spec.key} label={spec.label} hint={spec.hint} value={typeof v === 'number' ? String(v) : ''} onChangeText={(t) => set(spec.key, t.trim() === '' ? null : Number(t))} keyboardType="number-pad" />
            );
          case 'list':
            return (
              <Field
                key={spec.key}
                label={spec.label}
                hint={spec.hint}
                value={Array.isArray(v) ? (v as string[]).join('\n') : ''}
                onChangeText={(t) => onChange({ ...values, [spec.key]: t.split('\n') })}
                onBlur={() => set(spec.key, Array.isArray(v) ? (v as string[]) : null)}
                multiline
                maxLength={2000}
              />
            );
          case 'choice':
            return (
              <View key={spec.key} style={styles.block}>
                <Text style={type.eyebrow}>{spec.label}</Text>
                <Chips label={spec.label} options={spec.options ?? []} value={typeof v === 'string' ? v : ''} onChange={(next) => set(spec.key, next === v ? null : next)} />
              </View>
            );
          case 'multi':
            return (
              <View key={spec.key} style={styles.block}>
                <Text style={type.eyebrow}>{spec.label}</Text>
                <MultiChips label={spec.label} options={spec.options ?? []} value={Array.isArray(v) ? (v as string[]) : []} onChange={(next) => set(spec.key, next)} />
              </View>
            );
          case 'colour':
            return (
              <View key={spec.key} style={styles.block}>
                <Text style={type.eyebrow}>
                  {spec.label}
                  {typeof v === 'string' && v ? `: ${v}` : ''}
                </Text>
                <ColourPicker label={spec.label} value={typeof v === 'string' ? v : ''} onChange={(next) => set(spec.key, next || null)} />
              </View>
            );
          case 'deity':
            return (
              <SearchPicker
                key={spec.key}
                label={spec.label}
                chips={typeof v === 'string' && v ? [{ key: v, label: v }] : []}
                entries={ctx.items}
                search={(q, picked) => searchItems(ctx.items, q, { limit: 6, picked, categories: ['deities'] })}
                onAdd={(entry) => set(spec.key, entry.label.replace(/\s+(statue|figure|idol|icon)\b.*$/i, '').trim())}
                onRemove={() => set(spec.key, null)}
                max={1}
                placeholder="Hekate, Brigid, Freyja…"
                empty="None chosen yet. Type to find one, or write the name in the step’s words."
              />
            );
          case 'items': {
            const list = (Array.isArray(v) ? v : []) as FieldItem[];
            return (
              <SearchPicker
                key={spec.key}
                label={spec.label}
                hint={spec.hint}
                chips={list.map((i) => ({ key: i.key, label: i.name, image: i.image }))}
                entries={ctx.items}
                search={(q, picked) => searchItems(ctx.items, q, { limit: 8, picked })}
                onAdd={(entry) => set(spec.key, [...list, { key: entry.key, name: entry.label, image: entry.image ?? '', category: (entry as ItemEntry).category }])}
                onRemove={(key) => set(spec.key, list.filter((i) => i.key !== key))}
                placeholder="Type to find it"
              />
            );
          }
          case 'who': {
            const list = (Array.isArray(v) ? v : []) as string[];
            return (
              <SearchPicker
                key={spec.key}
                label={spec.label}
                hint={spec.hint}
                chips={list.map((k) => ({ key: k, label: ctx.whoLabel(k) }))}
                entries={ctx.who}
                suggestions={ctx.whoSuggest}
                onAdd={(entry) => set(spec.key, spec.single ? [entry.key] : [...list, entry.key])}
                onRemove={(key) => set(spec.key, list.filter((k) => k !== key))}
                max={spec.single ? 1 : undefined}
                placeholder="A role, position or person"
              />
            );
          }
          case 'parts': {
            const parts = partsOf(spec, values, specs);
            const source = specs.find((s) => s.key === spec.partsFrom);
            if (!parts.length) return <Text key={spec.key} style={type.caption}>Choose {source?.label.toLowerCase() ?? 'the parts'} first.</Text>;
            const setPart = (part: string, patch: Partial<PartValue>) => set(spec.key, parts.map((p) => (p.part === part ? { ...p, ...patch } : p)));
            return (
              <View key={spec.key} style={styles.block}>
                <Text style={type.eyebrow}>{spec.label}</Text>
                {parts.map((p) => (
                  <View key={p.part} style={styles.part}>
                    <Text style={type.cardTitle}>{optionLabel(source, p.part)}</Text>
                    <SearchPicker
                      label="Who"
                      chips={p.who ? [{ key: p.who, label: ctx.whoLabel(p.who) }] : []}
                      entries={ctx.who}
                      search={(q, picked) => searchEntries(ctx.who, q, { limit: 6, picked, suggestions: ctx.whoSuggest })}
                      onAdd={(entry) => setPart(p.part, { who: entry.key })}
                      onRemove={() => setPart(p.part, { who: undefined })}
                      max={1}
                      empty="Whoever the step is for"
                      placeholder="A role or person"
                    />
                    <Field
                      label="Words"
                      value={p.words ?? ''}
                      onChangeText={(t) => setPart(p.part, { words: t })}
                      placeholder={defaultPartWords(ctx.actionId, p.part) || 'What they say'}
                      multiline
                      maxLength={2000}
                    />
                  </View>
                ))}
              </View>
            );
          }
          case 'ref': {
            const things = ctx.named.filter((t) => !spec.refKind || spec.refKind === 'thing' || t.kind === spec.refKind);
            const options = [...things.map((t) => ({ value: t.name, label: `${t.name} (step ${t.index + 1})` })), ...(spec.refKind === 'candle' ? [{ value: '*', label: 'Every candle' }] : [])];
            return (
              <View key={spec.key} style={styles.block}>
                <Text style={type.eyebrow}>{spec.label}</Text>
                {options.length ? (
                  <Chips label={spec.label} options={options} value={typeof v === 'string' ? v : ''} onChange={(next) => set(spec.key, next)} />
                ) : (
                  <Text style={type.caption}>No earlier step names one yet. Give a name to the {spec.refKind === 'candle' ? 'candle where it is lit' : 'thing where it is set down'}, and it will show here.</Text>
                )}
              </View>
            );
          }
        }
        return null;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: touch, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.chip, borderWidth: 1, borderColor: 'rgba(244,236,216,0.22)', alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontFamily: fonts.body, fontSize: 14, color: colors.parchment },
  chipTextOn: { color: colors.forestInk, fontFamily: fonts.bodySemi },
  swatchWrap: { width: touch, height: touch, borderRadius: touch / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: colors.gold },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.hairline },
  part: { gap: 8, padding: 12, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  pressed: { opacity: 0.7 },
});
