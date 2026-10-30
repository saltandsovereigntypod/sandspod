import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../Button';
import { shortLabel } from '../../lib/altar/cabinet';
import type { SavedObject } from '../../lib/altar/types';
import { colors, fonts, radius, touch, type } from '../../theme';
import { WORKING_KINDS, type WorkingDetails } from '../../lib/grimoire/altarImport';
import { Chip } from './Chip';
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

/**
 * Choose objects to group so they move together (the website's Select → Group).
 * From Select mode, what's chosen on the altar comes ticked (`preselected`).
 */
export function GroupSheet({
  visible,
  objects,
  preselected,
  onClose,
  onGroup,
}: {
  visible: boolean;
  objects: SavedObject[];
  preselected?: number[];
  onClose: () => void;
  onGroup: (indices: number[], name: string) => void;
}) {
  return (
    <Sheet visible={visible} eyebrow="Group" title="Group things together" onClose={onClose}>
      {visible && <GroupForm objects={objects} preselected={preselected} onGroup={onGroup} />}
    </Sheet>
  );
}

function GroupForm({ objects, preselected, onGroup }: { objects: SavedObject[]; preselected?: number[]; onGroup: (indices: number[], name: string) => void }) {
  const [picked, setPicked] = useState<Set<number>>(() => new Set(preselected ?? []));
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
 * Record a group, or the whole altar, as a page in the Grimoire (the website's
 * Record in Grimoire): the items, a purpose, and create.
 */
export function GroupGrimoireSheet({
  visible,
  name,
  items,
  sectionTitle,
  signedIn,
  defaults,
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
  /** Pre-filled from tonight: the moon phase and the day. */
  defaults: WorkingDetails;
  onCreate: (details: WorkingDetails, title: string) => void;
}) {
  return (
    <Sheet visible={visible} eyebrow="Record in Grimoire" title={name || 'Ritual Working'} onClose={onClose}>
      {visible && <GroupGrimoireForm name={name} items={items} sectionTitle={sectionTitle} signedIn={signedIn} defaults={defaults} onCreate={onCreate} />}
    </Sheet>
  );
}

/** One optional field of a recorded working. */
const WORKING_FIELDS: { key: keyof WorkingDetails; label: string; placeholder: string; lines?: boolean }[] = [
  { key: 'intention', label: 'Intention', placeholder: 'What was this working for?', lines: true },
  { key: 'time', label: 'Time', placeholder: 'Dusk, 9pm, the witching hour…' },
  { key: 'moonPhase', label: 'Moon phase', placeholder: 'Waxing crescent' },
  { key: 'day', label: 'Day', placeholder: 'Friday' },
  { key: 'weather', label: 'Weather and season', placeholder: 'Rain, first frost…' },
  { key: 'deities', label: 'Deities, spirits and ancestors', placeholder: 'Who you called on or honoured', lines: true },
  { key: 'extraItems', label: 'Also used', placeholder: 'Anything not on the altar, one per line', lines: true },
  { key: 'preparation', label: 'Preparation', placeholder: 'Cleansing, grounding, casting a circle…', lines: true },
  { key: 'steps', label: 'What I did', placeholder: 'One step per line', lines: true },
  { key: 'words', label: 'Words spoken', placeholder: 'Chants, petitions, prayers', lines: true },
  { key: 'feelings', label: 'What I felt', placeholder: 'Energy, sensations, emotions', lines: true },
  { key: 'signs', label: 'Signs and omens', placeholder: 'Anything you noticed', lines: true },
  { key: 'results', label: 'Results', placeholder: 'You can add this later', lines: true },
  { key: 'reflection', label: 'Reflection', placeholder: 'What you would keep or change', lines: true },
  { key: 'followUp', label: 'Follow-up', placeholder: 'When to check back, what to do next', lines: true },
];

function GroupGrimoireForm({
  name,
  items,
  sectionTitle,
  signedIn,
  defaults,
  onCreate,
}: {
  name: string;
  items: { groupLabel: string; content: string }[];
  sectionTitle: string | null;
  signedIn: boolean;
  defaults: WorkingDetails;
  onCreate: (details: WorkingDetails, title: string) => void;
}) {
  const [title, setTitle] = useState(name);
  const [details, setDetails] = useState<WorkingDetails>(defaults);
  const set = (key: keyof WorkingDetails, value: string) => setDetails((d) => ({ ...d, [key]: value }));
  if (!signedIn) return <Text style={type.body}>Sign in to record this in your Grimoire.</Text>;
  return (
    <View style={styles.form}>
      <Text style={type.caption}>
        A page in your Grimoire for this spell or working. Fill in as much or as little as you like; you can keep adding to it in the Grimoire.
      </Text>
      <View style={styles.summary}>
        <Text style={type.eyebrow}>Section</Text>
        <Text style={type.body}>{sectionTitle || 'Top level (no section)'}</Text>
      </View>
      <View style={styles.field}>
        <Text style={type.eyebrow}>Name</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Name this spell or working"
          placeholderTextColor={colors.tabInactive}
          accessibilityLabel="Name"
          style={styles.input}
        />
      </View>
      <View style={styles.field}>
        <Text style={type.eyebrow}>Type of working</Text>
        <View style={styles.kinds}>
          {WORKING_KINDS.map((kind) => (
            <Chip key={kind} label={kind} active={details.kind === kind} onPress={() => set('kind', details.kind === kind ? '' : kind)} />
          ))}
        </View>
      </View>
      {WORKING_FIELDS.slice(0, 6).map((field) => (
        <WorkingField key={field.key} field={field} value={details[field.key] ?? ''} onChange={(value) => set(field.key, value)} />
      ))}
      {items.length > 0 && (
        <View style={styles.summary}>
          <Text style={type.eyebrow}>From the altar</Text>
          {items.map((group) => (
            <Text key={group.groupLabel} style={type.body}>
              {group.groupLabel}: {group.content.split('\n').join(', ')}
            </Text>
          ))}
        </View>
      )}
      {WORKING_FIELDS.slice(6).map((field) => (
        <WorkingField key={field.key} field={field} value={details[field.key] ?? ''} onChange={(value) => set(field.key, value)} />
      ))}
      <Button label="Create Page" onPress={() => onCreate(details, title.trim())} />
    </View>
  );
}

function WorkingField({ field, value, onChange }: { field: (typeof WORKING_FIELDS)[number]; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={type.eyebrow}>{field.label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={field.placeholder}
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel={field.label}
        multiline={field.lines}
        style={[styles.input, field.lines && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  field: { gap: 6 },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
