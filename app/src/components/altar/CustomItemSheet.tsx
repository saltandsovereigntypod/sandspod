import { useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../Button';
import { altarImageSource } from '../../lib/altar/assets';
import { CUSTOM_CATEGORIES, FORM_PRESETS, ITEM_TYPE, isCustomCategory, parseKeywords, chosenFromItem, type CustomCategory } from '../../lib/altar/custom';
import { pickImage } from '../../lib/altar/images';
import type { CabinetItem } from '../../lib/altar/types';
import { deleteCustomItem, saveCustomItem, useWorkshop, type FormDraft } from '../../lib/altar/workshop';
import { searchLibrary, useLibrary } from '../../lib/library';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

type Props = {
  /** Open for a new item in this category, or to edit an item. */
  target: { category: string; item: CabinetItem | null } | null;
  onClose: () => void;
  onSaved?: (item: CabinetItem) => void;
};

/** Make (or change) your own cabinet item: the website's custom cabinet item, in a sheet. */
export function CustomItemSheet({ target, onClose, onSaved }: Props) {
  return (
    <Sheet visible={!!target} eyebrow="Your cabinet" title={target?.item ? 'Edit your item' : 'Make your own'} onClose={onClose}>
      {target && <ItemForm key={target.item?.id ?? `new-${target.category}`} target={target} onClose={onClose} onSaved={onSaved} />}
    </Sheet>
  );
}

function initialForms(category: CustomCategory, item: CabinetItem | null): FormDraft[] {
  const existing = item ? chosenFromItem(item) : [];
  return FORM_PRESETS[category].map((label) => {
    const have = existing.find((e) => e.label === label);
    return { label, enabled: !!have, image: have?.image, storagePath: have?.storagePath, picked: null };
  });
}

function ItemForm({ target, onClose, onSaved }: { target: NonNullable<Props['target']>; onClose: () => void; onSaved?: (item: CabinetItem) => void }) {
  const { userId } = useWorkshop();
  const { entries } = useLibrary();
  const editing = target.item;
  const [category, setCategory] = useState<CustomCategory>(
    isCustomCategory(editing?.category ?? target.category) ? ((editing?.category ?? target.category) as CustomCategory) : 'tools',
  );
  const [name, setName] = useState(editing?.name ?? '');
  const [keywords, setKeywords] = useState((editing?.keywords ?? []).join(', '));
  const [forms, setForms] = useState<FormDraft[]>(() => initialForms(category, editing));
  const [mode, setMode] = useState<'new' | 'existing'>(editing ? 'existing' : 'new');
  const [notes, setNotes] = useState('');
  const [linkQuery, setLinkQuery] = useState('');
  const [entityId, setEntityId] = useState(editing?.entityId ?? '');
  const [busy, setBusy] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const linked = useMemo(
    () => entries.find((e) => e.practiceEntityIds.includes(entityId) || e.traditionalRef === entityId || e.id === entityId) ?? null,
    [entries, entityId],
  );
  const matches = useMemo(
    () => (linkQuery.trim().length >= 2 ? searchLibrary(entries, linkQuery, { limit: 6 }) : []),
    [entries, linkQuery],
  );

  const changeCategory = (next: CustomCategory) => {
    setCategory(next);
    setForms(initialForms(next, editing && editing.category === next ? editing : null));
  };

  const choosePicture = async (label: string) => {
    setProblem(null);
    try {
      const picked = await pickImage();
      if (!picked) return;
      setForms((list) => list.map((f) => (f.label === label ? { ...f, enabled: true, picked } : f)));
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Couldn’t open that picture.');
    }
  };
  const removePicture = (label: string) =>
    setForms((list) => list.map((f) => (f.label === label ? { ...f, enabled: false, picked: null, image: undefined, storagePath: undefined } : f)));

  const save = async () => {
    setProblem(null);
    setBusy('Saving…');
    try {
      const saved = await saveCustomItem(userId, {
        editing,
        category,
        name,
        keywords: parseKeywords(keywords),
        link: mode === 'new' ? { mode: 'new', notes } : { mode: 'existing', entityId },
        forms,
      });
      onSaved?.(saved);
      onClose();
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Couldn’t save. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!editing) return;
    setBusy('Removing…');
    try {
      await deleteCustomItem(userId, editing);
      onClose();
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Couldn’t delete. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.form}>
      <Group label="What is it?">
        <ChipRow>
          {CUSTOM_CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.label} active={category === c.id} onPress={() => changeCategory(c.id)} />
          ))}
        </ChipRow>
        <Text style={type.caption}>{CUSTOM_CATEGORIES.find((c) => c.id === category)?.hint}</Text>
      </Group>

      <Group label="Name">
        <TextInput value={name} onChangeText={setName} placeholder="Grandmother’s brass bell" placeholderTextColor={colors.tabInactive} accessibilityLabel="Name" style={styles.input} />
      </Group>

      <Group label={FORM_PRESETS[category].length > 1 ? 'Pictures (one for each form you have)' : 'Picture'}>
        <Text style={type.caption}>A photo on a plain background works best. PNG with a see-through background looks most at home on the altar.</Text>
        <View style={styles.forms}>
          {forms.map((form) => {
            const uri = form.picked?.uri ?? (form.enabled ? form.image : undefined);
            const source = uri ? altarImageSource(uri) : null;
            return (
              <View key={form.label} style={styles.formTile}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={uri ? `Change the picture for ${form.label}` : `Add a picture for ${form.label}`}
                  onPress={() => void choosePicture(form.label)}
                  style={({ pressed }) => [styles.thumb, pressed && { opacity: 0.7 }]}
                >
                  {source ? <Image source={source} style={styles.thumbImage} resizeMode="contain" /> : <Text style={styles.plus}>＋</Text>}
                </Pressable>
                <Text style={styles.formLabel} numberOfLines={2}>
                  {form.label === 'Place' ? 'Picture' : form.label}
                </Text>
                {!!uri && (
                  <Pressable accessibilityRole="button" accessibilityLabel={`Remove the ${form.label} picture`} onPress={() => removePicture(form.label)} hitSlop={8}>
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </Group>

      <Group label="Living Library">
        <ChipRow>
          {!editing && <Chip label="A new My Practice entry" active={mode === 'new'} onPress={() => setMode('new')} />}
          <Chip label={editing ? 'Linked entry' : 'Link to one already there'} active={mode === 'existing'} onPress={() => setMode('existing')} />
        </ChipRow>
        {mode === 'new' ? (
          <>
            <Text style={type.caption}>{`It gets its own ${ITEM_TYPE[category]} page in your Living Library, so it shows up wherever ${ITEM_TYPE[category]}s do.`}</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="What you use it for, where it came from…"
              placeholderTextColor={colors.tabInactive}
              accessibilityLabel="My Practice notes"
              multiline
              style={[styles.input, styles.multiline]}
            />
          </>
        ) : (
          <>
            {linked && <Text style={styles.linked}>{`Linked to ${linked.name} (${linked.category})`}</Text>}
            <TextInput
              value={linkQuery}
              onChangeText={setLinkQuery}
              placeholder="Search the Library: rose quartz, Brigid…"
              placeholderTextColor={colors.tabInactive}
              accessibilityLabel="Search the Library to link"
              autoCorrect={false}
              style={styles.input}
            />
            {matches.map((entry) => (
              <Pressable
                key={entry.id}
                accessibilityRole="radio"
                aria-checked={linked?.id === entry.id}
                onPress={() => {
                  // Linked by the entry's own id: a My Practice row's entity id, or a Traditional reference.
                  setEntityId(entry.practiceEntityIds[0] ?? entry.traditionalRef ?? entry.id);
                  setLinkQuery('');
                }}
                style={({ pressed }) => [styles.match, linked?.id === entry.id && styles.matchOn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.matchName}>{entry.name}</Text>
                <Text style={type.caption}>{entry.category}</Text>
              </Pressable>
            ))}
          </>
        )}
      </Group>

      <Group label="Keywords (optional)">
        <TextInput
          value={keywords}
          onChangeText={setKeywords}
          placeholder="love, heirloom, protection"
          placeholderTextColor={colors.tabInactive}
          accessibilityLabel="Keywords, separated by commas"
          autoCapitalize="none"
          style={styles.input}
        />
      </Group>

      {!!problem && <Text style={styles.problem}>{problem}</Text>}
      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.gold} />
          <Text style={type.caption}>{busy}</Text>
        </View>
      ) : (
        <>
          <Button label={editing ? 'Save changes' : 'Add to my cabinet'} onPress={() => void save()} />
          {editing &&
            (confirmDelete ? (
              <ChipRow>
                <Chip label="Delete this item" tone="danger" onPress={() => void remove()} />
                <Chip label="Keep it" onPress={() => setConfirmDelete(false)} />
              </ChipRow>
            ) : (
              <Button label="Delete item" variant="text" onPress={() => setConfirmDelete(true)} />
            ))}
          {editing && confirmDelete && <Text style={type.caption}>Its Living Library entry is kept. Copies already on your altars stay where they are.</Text>}
        </>
      )}
    </View>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={type.eyebrow}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 18 },
  group: { gap: 8 },
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
    paddingVertical: 10,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  forms: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  formTile: { width: 96, alignItems: 'center', gap: 4 },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.ground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: { width: '86%', height: '86%' },
  plus: { fontSize: 28, color: colors.gold },
  formLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.parchment, textAlign: 'center' },
  remove: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.gold },
  linked: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
  match: { minHeight: touch, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline, padding: 10, gap: 2 },
  matchOn: { borderColor: colors.gold },
  matchName: { fontFamily: fonts.body, fontSize: 15, color: colors.cream },
  problem: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
  busy: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', minHeight: touch },
});
