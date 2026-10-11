// "My Apothecary": the workings you've made (spell jars, oils, herb mixes,
// incense, sachets, poppets, sprays), and the editor for making or changing
// one. Ingredients come from the altar, the cabinet, your own items, the
// Living Library and your other workings, or are simply typed in.

import { useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../Button';
import {
  APOTHECARY_TYPES,
  DEFAULT_LIVING,
  DETAIL_FIELDS,
  apothecaryProblem,
  apothecaryType,
  ingredientFromObject,
  ingredientKey,
  type ApothecaryItem,
  type ApothecaryTypeId,
  type Ingredient,
} from '../../lib/altar/apothecary';
import { altarImageSource } from '../../lib/altar/assets';
import { builtInCabinet, shortLabel } from '../../lib/altar/cabinet';
import { ITEM_TYPE, isCustomCategory } from '../../lib/altar/custom';
import { pickImage, type PickedImage } from '../../lib/altar/images';
import type { SavedObject } from '../../lib/altar/types';
import { deleteApothecary, saveApothecary, useWorkshop } from '../../lib/altar/workshop';
import { useLibrary } from '../../lib/library';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

// ---------------------------------------------------------------- the list

type ListProps = {
  visible: boolean;
  onClose: () => void;
  onMake: () => void;
  onEdit: (item: ApothecaryItem) => void;
  onPlace: (item: ApothecaryItem) => void;
};

export function ApothecarySheet({ visible, onClose, onMake, onEdit, onPlace }: ListProps) {
  const { apothecary } = useWorkshop();
  return (
    <Sheet visible={visible} eyebrow="My Apothecary" title="Your workings" onClose={onClose}>
      <Button label="Make something new" onPress={onMake} />
      {apothecary.length === 0 ? (
        <Text style={type.body}>
          Spell jars, oils, herb mixes, incense, sachets, poppets and sprays you make are kept here, ready to place on any altar. Start from what’s on your altar, or from anything in the cabinet or Library.
        </Text>
      ) : (
        apothecary.map((item) => {
          const source = altarImageSource(item.imagePath);
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardThumb}>{source && <Image source={source} style={styles.cardImage} resizeMode="contain" />}</View>
              <View style={styles.cardText}>
                <Text style={type.cardTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={type.caption} numberOfLines={2}>
                  {[item.typeLabel, item.intention].filter(Boolean).join(' · ')}
                </Text>
                <Text style={type.caption} numberOfLines={1}>
                  {item.ingredients.map((i) => i.label).join(', ')}
                </Text>
                <ChipRow>
                  <Chip label="Place" symbol="✦" accessibilityLabel={`Place ${item.name} on the altar`} onPress={() => onPlace(item)} />
                  <Chip label="Recipe" symbol="✎" accessibilityLabel={`Open the recipe for ${item.name}`} onPress={() => onEdit(item)} />
                </ChipRow>
              </View>
            </View>
          );
        })
      )}
    </Sheet>
  );
}

// ---------------------------------------------------------------- the editor

export type ApothecaryTarget = { item: ApothecaryItem | null; type?: ApothecaryTypeId };
export type SavedWorking = { item: ApothecaryItem; isNew: boolean; fromAltar: number[]; replace: boolean };

type EditorProps = {
  target: ApothecaryTarget | null;
  altarObjects: SavedObject[];
  onClose: () => void;
  onSaved: (saved: SavedWorking) => void;
  onDeleted: (item: ApothecaryItem) => void;
};

export function ApothecaryEditor(props: EditorProps) {
  const { target, onClose } = props;
  return (
    <Sheet visible={!!target} eyebrow="My Apothecary" title={target?.item ? target.item.name : 'Make something new'} onClose={onClose}>
      {target && <Editor key={target.item?.id ?? 'new'} {...props} target={target} />}
    </Sheet>
  );
}

type Choice = Ingredient & { group: string };

function blank(type: ApothecaryTypeId): ApothecaryItem {
  const t = apothecaryType(type);
  return {
    id: '',
    name: '',
    type: t.id,
    typeLabel: t.label,
    imagePath: t.image,
    intention: '',
    notes: '',
    details: {},
    ingredients: [],
    livingState: DEFAULT_LIVING,
    logToGrimoire: false,
    grimoireStatus: '',
    grimoireEntryId: '',
    entityId: '',
    instanceId: '',
    createdAt: '',
    updatedAt: '',
  };
}

function Editor({ target, altarObjects, onClose, onSaved, onDeleted }: EditorProps & { target: ApothecaryTarget }) {
  const workshop = useWorkshop();
  const { entries } = useLibrary();
  const isNew = !target.item;
  const [item, setItem] = useState<ApothecaryItem>(() => target.item ?? blank(target.type ?? 'spell-jar'));
  const [fromAltar, setFromAltar] = useState<number[]>([]);
  const [replace, setReplace] = useState(true);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const change = (patch: Partial<ApothecaryItem>) => setItem((current) => ({ ...current, ...patch }));
  const presetImage = APOTHECARY_TYPES.some((t) => t.image === item.imagePath);
  const setType = (id: ApothecaryTypeId) => {
    const t = apothecaryType(id);
    change({ type: t.id, typeLabel: t.label, ...(presetImage && !picked ? { imagePath: t.image } : {}) });
  };

  // Everything an ingredient can be, without repeats (getApothecaryIngredientChoices).
  const choices = useMemo<Choice[]>(() => {
    const list: Choice[] = [];
    const seen = new Set<string>();
    const add = (choice: Choice) => {
      const key = ingredientKey(choice);
      if (seen.has(key)) return;
      seen.add(key);
      list.push(choice);
    };
    for (const own of workshop.customItems) {
      add({ group: 'Your cabinet', label: own.name, type: isCustomCategory(own.category) ? ITEM_TYPE[own.category] : own.category, entityId: own.entityId ?? '' });
    }
    for (const made of workshop.apothecary) {
      if (made.id !== item.id) add({ group: 'Your apothecary', label: made.name, type: 'apothecary', apothecaryItemId: made.id, entityId: made.entityId });
    }
    for (const entry of entries) {
      if (!['herb', 'crystal', 'oil', 'incense', 'candle'].includes(entry.type)) continue;
      add({ group: 'Living Library', label: entry.name, libraryName: entry.name, type: entry.type, entityId: entry.practiceEntityIds[0] ?? entry.traditionalRef ?? '' });
    }
    for (const cabinet of builtInCabinet) {
      if (isCustomCategory(cabinet.category)) add({ group: 'Cabinet', label: cabinet.name, type: ITEM_TYPE[cabinet.category], entityId: cabinet.entityId ?? '' });
    }
    return list;
  }, [workshop.customItems, workshop.apothecary, entries, item.id]);

  const needle = query.trim().toLowerCase();
  const matches = needle.length >= 2 ? choices.filter((c) => c.label.toLowerCase().includes(needle)).slice(0, 8) : [];
  const has = (ingredient: Ingredient) => item.ingredients.some((i) => ingredientKey(i) === ingredientKey(ingredient));
  const addIngredient = (ingredient: Ingredient) => {
    if (!has(ingredient)) change({ ingredients: [...item.ingredients, { ...ingredient, amount: ingredient.amount ?? '' }] });
    setQuery('');
  };
  const removeIngredient = (index: number) => change({ ingredients: item.ingredients.filter((_, i) => i !== index) });
  const setAmount = (index: number, amount: string) => change({ ingredients: item.ingredients.map((i, n) => (n === index ? { ...i, amount } : i)) });

  const altarChoices = altarObjects
    .map((object, index) => ({ object, index }))
    .filter(({ object }) => object.type !== 'cloth' && object.type !== 'apothecary');
  const toggleAltar = (index: number, object: SavedObject) => {
    const ingredient = ingredientFromObject(object);
    ingredient.label = shortLabel(ingredient.label, 'Ingredient');
    if (fromAltar.includes(index)) {
      setFromAltar(fromAltar.filter((i) => i !== index));
      change({ ingredients: item.ingredients.filter((i) => ingredientKey(i) !== ingredientKey(ingredient)) });
    } else {
      setFromAltar([...fromAltar, index]);
      addIngredient(ingredient);
    }
  };

  const choosePicture = async () => {
    setProblem(null);
    try {
      const image = await pickImage();
      if (image) setPicked(image);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Couldn’t open that picture.');
    }
  };

  const save = async () => {
    const issue = apothecaryProblem(item);
    if (issue) return setProblem(issue);
    setProblem(null);
    setBusy('Saving to your apothecary…');
    try {
      const saved = await saveApothecary(workshop.userId, item, picked);
      onSaved({ item: saved, isNew, fromAltar, replace: isNew && replace && fromAltar.length > 0 });
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Couldn’t save. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!target.item) return;
    setBusy('Removing…');
    try {
      await deleteApothecary(workshop.userId, target.item);
      onDeleted(target.item);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Couldn’t delete. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const imageSource = picked ? altarImageSource(picked.uri) : altarImageSource(item.imagePath);
  const details = DETAIL_FIELDS[item.type] ?? [];

  return (
    <View style={styles.form}>
      <Group label="What are you making?">
        <ChipRow>
          {APOTHECARY_TYPES.map((t) => (
            <Chip key={t.id} label={t.label} active={item.type === t.id} onPress={() => setType(t.id)} />
          ))}
        </ChipRow>
      </Group>

      <Group label="Name">
        <Input value={item.name} onChangeText={(name) => change({ name })} placeholder="Protection Jar, Dream Oil…" label="Name" />
      </Group>

      <Group label="Ingredients">
        {altarChoices.length > 0 && (
          <>
            <Text style={type.caption}>From your altar</Text>
            <ChipRow>
              {altarChoices.map(({ object, index }) => (
                <Chip key={index} label={shortLabel(object.label)} active={fromAltar.includes(index)} onPress={() => toggleAltar(index, object)} />
              ))}
            </ChipRow>
          </>
        )}
        <Input value={query} onChangeText={setQuery} placeholder="Search the cabinet, Library and your apothecary" label="Search for an ingredient" />
        {matches.map((choice) => (
          <Pressable
            key={`${choice.group}-${ingredientKey(choice)}`}
            accessibilityRole="button"
            accessibilityLabel={`Add ${choice.label}`}
            onPress={() => addIngredient(choice)}
            style={({ pressed }) => [styles.match, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.matchName}>{choice.label}</Text>
            <Text style={type.caption}>{choice.group}</Text>
          </Pressable>
        ))}
        {needle.length >= 2 && !choices.some((c) => c.label.toLowerCase() === needle) && (
          <Pressable
            accessibilityRole="button"
            onPress={() => addIngredient({ label: query.trim(), type: 'custom' })}
            style={({ pressed }) => [styles.match, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.matchName}>{`Add “${query.trim()}” as written`}</Text>
          </Pressable>
        )}
        {item.ingredients.map((ingredient, index) => (
          <View key={`${ingredientKey(ingredient)}-${index}`} style={styles.ingredient}>
            <Text style={styles.ingredientName} numberOfLines={2}>
              {ingredient.label}
            </Text>
            <TextInput
              value={ingredient.amount ?? ''}
              onChangeText={(amount) => setAmount(index, amount)}
              placeholder="Amount"
              placeholderTextColor={colors.tabInactive}
              accessibilityLabel={`Amount of ${ingredient.label}`}
              style={styles.amount}
            />
            <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${ingredient.label}`} onPress={() => removeIngredient(index)} hitSlop={8} style={styles.x}>
              <Text style={styles.xText}>×</Text>
            </Pressable>
          </View>
        ))}
        {isNew && fromAltar.length > 0 && (
          <Pressable accessibilityRole="switch" aria-checked={replace} onPress={() => setReplace(!replace)} style={styles.toggle}>
            <Text style={[styles.check, replace && styles.checkOn]}>{replace ? '✓' : ''}</Text>
            <Text style={[type.caption, { flex: 1 }]}>
              {fromAltar.length === 1
                ? `Take ${shortLabel(altarObjects[fromAltar[0]]?.label, 'it')} off the altar and set the finished ${item.typeLabel.toLowerCase()} in its place`
                : `Take those ${fromAltar.length} things off the altar and set the finished ${item.typeLabel.toLowerCase()} in their place`}
            </Text>
          </Pressable>
        )}
      </Group>

      <Group label="Intention">
        <Input value={item.intention} onChangeText={(intention) => change({ intention })} placeholder="What it’s for" label="Intention" />
      </Group>

      {details.map((field) => (
        <Group key={field.key} label={field.label}>
          {field.choices ? (
            <ChipRow>
              {field.choices.map((choice) => (
                <Chip
                  key={choice}
                  label={choice}
                  active={item.details[field.key] === choice}
                  onPress={() => change({ details: { ...item.details, [field.key]: item.details[field.key] === choice ? '' : choice } })}
                />
              ))}
            </ChipRow>
          ) : (
            <Input
              value={item.details[field.key] ?? ''}
              onChangeText={(value) => change({ details: { ...item.details, [field.key]: value } })}
              label={field.label}
              multiline={field.multiline}
            />
          )}
        </Group>
      ))}

      <Group label="Notes">
        <Input value={item.notes} onChangeText={(notes) => change({ notes })} placeholder="How you made it, words spoken, where it lives…" label="Notes" multiline />
      </Group>

      <Group label="Tending">
        <Toggle
          on={item.livingState.tending_enabled}
          label={`Remind me to tend or feed it every ${item.livingState.tending_interval_days} days`}
          onPress={() => change({ livingState: { ...item.livingState, tending_enabled: !item.livingState.tending_enabled } })}
        />
        {item.livingState.tending_enabled && (
          <DaysStepper value={item.livingState.tending_interval_days} onChange={(n) => change({ livingState: { ...item.livingState, tending_interval_days: n } })} />
        )}
        <Toggle
          on={item.livingState.expiration_enabled}
          label={`Remind me to review or replace it after ${item.livingState.expiration_days} days`}
          onPress={() => change({ livingState: { ...item.livingState, expiration_enabled: !item.livingState.expiration_enabled } })}
        />
        {item.livingState.expiration_enabled && (
          <DaysStepper value={item.livingState.expiration_days} onChange={(n) => change({ livingState: { ...item.livingState, expiration_days: n } })} />
        )}
      </Group>

      <Group label="Picture">
        <View style={styles.pictureRow}>
          <View style={styles.cardThumb}>{imageSource && <Image source={imageSource} style={styles.cardImage} resizeMode="contain" />}</View>
          <View style={{ flex: 1, gap: 6 }}>
            <Button label={picked || !presetImage ? 'Choose another picture' : 'Use your own picture'} variant="outline" onPress={() => void choosePicture()} />
            {(picked || !presetImage) && (
              <Button
                label={`Use the ${item.typeLabel.toLowerCase()} picture`}
                variant="text"
                onPress={() => {
                  setPicked(null);
                  change({ imagePath: apothecaryType(item.type).image });
                }}
              />
            )}
          </View>
        </View>
      </Group>

      {!!problem && <Text style={styles.problem}>{problem}</Text>}
      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.gold} />
          <Text style={type.caption}>{busy}</Text>
        </View>
      ) : (
        <>
          <Button label={isNew ? 'Save to My Apothecary and place it' : 'Save changes'} onPress={() => void save()} />
          {!isNew &&
            (confirmDelete ? (
              <>
                <ChipRow>
                  <Chip label="Delete this working" tone="danger" onPress={() => void remove()} />
                  <Chip label="Keep it" onPress={() => setConfirmDelete(false)} />
                </ChipRow>
                <Text style={type.caption}>It leaves your apothecary and Living Library. Copies on your altars are taken off too.</Text>
              </>
            ) : (
              <Button label="Delete from My Apothecary" variant="text" onPress={() => setConfirmDelete(true)} />
            ))}
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

function Input({ label, multiline, ...rest }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  return (
    <TextInput
      {...rest}
      accessibilityLabel={label}
      placeholderTextColor={colors.tabInactive}
      multiline={multiline}
      style={[styles.input, multiline && styles.multiline]}
    />
  );
}

function Toggle({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="switch" aria-checked={on} onPress={onPress} style={styles.toggle}>
      <Text style={[styles.check, on && styles.checkOn]}>{on ? '✓' : ''}</Text>
      <Text style={[type.body, { flex: 1 }]}>{label}</Text>
    </Pressable>
  );
}

function DaysStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const steps = [1, 7, 14, 30, 60, 90, 180, 365];
  return (
    <ChipRow>
      {steps.map((n) => (
        <Chip key={n} label={n === 1 ? 'Daily' : n === 7 ? 'Weekly' : n === 365 ? 'Yearly' : `${n} days`} active={value === n} onPress={() => onChange(n)} />
      ))}
    </ChipRow>
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
  card: { flexDirection: 'row', gap: 12, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline, padding: 10 },
  cardThumb: { width: 72, height: 72, borderRadius: radius.tile, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  cardImage: { width: '88%', height: '88%' },
  cardText: { flex: 1, gap: 4 },
  match: { minHeight: touch, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline, padding: 10, gap: 2 },
  matchName: { fontFamily: fonts.body, fontSize: 15, color: colors.cream },
  ingredient: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ingredientName: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.cream },
  amount: {
    width: 110,
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ground,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 14,
    paddingHorizontal: 10,
  },
  x: { minWidth: touch, minHeight: touch, alignItems: 'center', justifyContent: 'center' },
  xText: { fontSize: 22, color: colors.gold },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: touch },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.goldLine,
    textAlign: 'center',
    lineHeight: 22,
    color: colors.forestInk,
    overflow: 'hidden',
  },
  checkOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  pictureRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  problem: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
  busy: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', minHeight: touch },
});
