import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../Button';
import { shortLabel } from '../../lib/altar/cabinet';
import type { SavedObject } from '../../lib/altar/types';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Sheet } from './Sheet';

/** Rename an object on this altar (the website's Edit action). */
export function RenameSheet({ visible, label, onClose, onRename }: { visible: boolean; label: string; onClose: () => void; onRename: (label: string) => void }) {
  return (
    <Sheet visible={visible} size="half" eyebrow="Rename" title={label} onClose={onClose}>
      {visible && <RenameForm key={label} label={label} onRename={onRename} />}
    </Sheet>
  );
}

function RenameForm({ label, onRename }: { label: string; onRename: (label: string) => void }) {
  const [name, setName] = useState(label);
  const save = () => name.trim() && onRename(name);
  return (
    <View style={styles.form}>
      <Text style={type.caption}>Only this one on this altar changes. Its Living Library entry keeps its name.</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        onSubmitEditing={save}
        accessibilityLabel="Name"
        returnKeyType="done"
        autoFocus
        style={styles.input}
      />
      <Button label="Rename" onPress={save} disabled={!name.trim() || name.trim() === label} />
    </View>
  );
}

/** Choose objects to group so they move together (the website's Select → Group). */
export function GroupSheet({ visible, objects, onClose, onGroup }: { visible: boolean; objects: SavedObject[]; onClose: () => void; onGroup: (indices: number[], name: string) => void }) {
  return (
    <Sheet visible={visible} eyebrow="Group" title="Group things together" onClose={onClose}>
      {visible && <GroupForm objects={objects} onGroup={onGroup} />}
    </Sheet>
  );
}

function GroupForm({ objects, onGroup }: { objects: SavedObject[]; onGroup: (indices: number[], name: string) => void }) {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [name, setName] = useState('');
  const toggle = (index: number) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <View style={styles.form}>
      <Text style={type.caption}>Grouped things move, turn and resize together. A working, a spell or a shrine within the altar.</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Ritual Working"
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="Group name"
        style={styles.input}
      />
      <View style={styles.list}>
        {objects.map((object, index) => {
          const on = picked.has(index);
          return (
            <Pressable
              key={`${object.altarObjectId ?? index}`}
              accessibilityRole="checkbox"
              aria-checked={on}
              onPress={() => toggle(index)}
              style={({ pressed }) => [styles.item, on && styles.itemOn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.box}>{on ? '☑' : '☐'}</Text>
              <Text style={styles.itemLabel} numberOfLines={1}>
                {shortLabel(object.label)}
              </Text>
              {!!object.groupId && <Text style={type.caption}>in a group</Text>}
            </Pressable>
          );
        })}
      </View>
      <Button
        label={picked.size < 2 ? 'Choose at least two' : `Group ${picked.size} things`}
        onPress={() => onGroup([...picked], name)}
        disabled={picked.size < 2}
      />
    </View>
  );
}

/**
 * Record a group as a ritual page in the Grimoire (the website's Send to
 * Grimoire, then its Record Ritual step): the items, a purpose, and create.
 */
export function GroupGrimoireSheet({
  visible,
  name,
  items,
  sectionTitle,
  signedIn,
  onClose,
  onCreate,
}: {
  visible: boolean;
  name: string;
  items: { groupLabel: string; content: string }[];
  /** The Grimoire section the page is filed under; null for the top level. */
  sectionTitle: string | null;
  signedIn: boolean;
  onClose: () => void;
  onCreate: (purpose: string) => void;
}) {
  return (
    <Sheet visible={visible} eyebrow="Record Ritual" title={name || 'Ritual Working'} onClose={onClose}>
      {visible && <GroupGrimoireForm items={items} sectionTitle={sectionTitle} signedIn={signedIn} onCreate={onCreate} />}
    </Sheet>
  );
}

function GroupGrimoireForm({
  items,
  sectionTitle,
  signedIn,
  onCreate,
}: {
  items: { groupLabel: string; content: string }[];
  sectionTitle: string | null;
  signedIn: boolean;
  onCreate: (purpose: string) => void;
}) {
  const [purpose, setPurpose] = useState('');
  if (!signedIn) return <Text style={type.body}>Sign in to create a ritual page in your Grimoire.</Text>;
  return (
    <View style={styles.form}>
      <Text style={type.caption}>A new ritual page in your Grimoire, with these items from the altar and room for your steps, results and reflection.</Text>
      <View style={styles.summary}>
        <Text style={type.eyebrow}>Section</Text>
        <Text style={type.body}>{sectionTitle || 'Top level (no section)'}</Text>
      </View>
      <TextInput
        value={purpose}
        onChangeText={setPurpose}
        placeholder="What was this working for?"
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="Ritual purpose"
        multiline
        style={[styles.input, styles.multiline]}
      />
      {items.map((group) => (
        <View key={group.groupLabel} style={styles.summary}>
          <Text style={type.eyebrow}>{group.groupLabel}</Text>
          <Text style={type.body}>{group.content}</Text>
        </View>
      ))}
      <Button label="Create Ritual Page" onPress={() => onCreate(purpose)} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  summary: { gap: 4 },
  multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
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
  list: { gap: 6 },
  item: { minHeight: touch, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  itemOn: { borderColor: colors.gold },
  box: { fontSize: 18, color: colors.gold },
  itemLabel: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.cream },
});
